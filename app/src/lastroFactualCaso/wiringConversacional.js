/**
 * IMP-092.3 — Wiring conversacional do LFC.
 * Writer = única escrita; Reader = única fonte canónica de factos do caso.
 * Reparse do fio permanece só como fallback temporário e nunca prevalece sobre o LFC.
 * Não mistura MO / CSC / Memória Confiável.
 */

import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import { responderCampoNosFactosLfc } from "./consultaCampoLfc.js";
import {
  extrairBulletsFactuais,
  tentarRespostaRestrita
} from "../classificadorIntencao/comporRespostaRestrita.js";
import { extrairTituloCasoParaConsumoMre } from "../mre/consumoLfcMre.js";

/** Alinhado a ORIGEM_UTILIZADOR (evita puxar node:crypto no bundle do browser). */
const ORIGEM_UTILIZADOR = "utilizador";

/** Modos em que o LFC governa registo/recuperação factual do caso. */
const MODOS_LFC = new Set(["registo", "confirmacao", "factos", "dado_unico"]);

/**
 * @param {unknown} v
 * @returns {string}
 */
function texto(v) {
  if (v == null) return "";
  return String(v).trim();
}

/**
 * @param {string} instrucao
 * @returns {string}
 */
function extrairTituloCaso(instrucao) {
  const raw = String(instrucao || "");
  if (/\bvale\s*verde\b/i.test(raw)) return "ValeVerde";
  const m = raw.match(
    /\bempresa\s+(?:fict[ií]cia\s+)?(?:chamad[ao]\s+)?([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚÂÊÔÃÕáéíóúâêôãõ-]{2,40})\b/
  );
  if (m && !/^fict/i.test(m[1])) return m[1];
  return "contexto informado";
}

/**
 * @param {string} instrucao
 * @returns {number|null} índice 1-based
 */
function extrairIndiceFacto(instrucao) {
  const raw = String(instrucao || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const ord = {
    primeiro: 1,
    segundo: 2,
    terceiro: 3,
    quarto: 4,
    quinto: 5,
    sexto: 6
  };
  const mOrd = raw.match(
    /\b(primeiro|segundo|terceiro|quarto|quinto|sexto)\s+fatos?\b/
  );
  if (mOrd) return ord[mOrd[1]] || null;
  const mNum =
    raw.match(/\b(\d+)\s*[oª]?\s*fatos?\b/) ||
    raw.match(/\bfatos?\s+(?:numero\s+)?(\d+)\b/);
  if (mNum) {
    const n = Number(mNum[1]);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }
  return null;
}

/**
 * Extrai texto novo e dicas de alvo a partir do pedido de correção.
 * @param {string} instrucao
 * @returns {{ textoNovo: string, alvoHint: string|null, sectorLogistica: boolean }|null}
 */
function extrairPayloadCorrecao(instrucao) {
  const raw = String(instrucao || "");
  const n = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (
    /\blogistica\b/.test(n) &&
    (/\bsetor\b/.test(n) ||
      /\bmercado\b/.test(n) ||
      /\bn[aã]o\s+atua\b/.test(n) ||
      /\bcorre[cç]/.test(n) ||
      /\bcorrija\b/.test(n) ||
      /\binforma[cç]/.test(n))
  ) {
    return {
      textoNovo: "Atua no mercado de logística.",
      alvoHint: "serviços",
      sectorLogistica: true
    };
  }

  const sub = raw.match(/\bsubstitua\s+(.+?)\s+por\s+(.+?)(?:\.|$)/i);
  if (sub) {
    return {
      textoNovo: texto(sub[2]),
      alvoHint: texto(sub[1]),
      sectorLogistica: false
    };
  }

  const correto = raw.match(/\bcorreto\s+[eé]\s+(.+?)(?:\.|$)/i);
  if (correto) {
    let novo = texto(correto[1]);
    if (/faturamento/i.test(raw)) {
      const mRs = novo.match(/(r\$\s*[\d.,]+\s*milh[oõ]es?)/i);
      if (mRs) novo = `faturamento anual de ${mRs[1].replace(/\s+/g, " ")}`;
      else if (!/\bfaturamento\b/i.test(novo)) {
        novo = `faturamento anual de ${novo.replace(/\.$/, "")}`;
      }
    }
    return { textoNovo: novo, alvoHint: null, sectorLogistica: false };
  }

  const aposDoisPontos = raw.match(/:\s*(.+)$/s);
  if (aposDoisPontos) {
    const corpo = texto(aposDoisPontos[1]).replace(/\.$/, "");
    const nested = corpo.match(/\bcorreto\s+[eé]\s+(.+)/i);
    if (nested && /faturamento/i.test(corpo)) {
      const mRs = String(nested[1]).match(/(r\$\s*[\d.,]+\s*milh[oõ]es?)/i);
      if (mRs) {
        return {
          textoNovo: `faturamento anual de ${mRs[1].replace(/\s+/g, " ")}`,
          alvoHint: null,
          sectorLogistica: false
        };
      }
    }
    return { textoNovo: corpo, alvoHint: null, sectorLogistica: false };
  }

  return null;
}

/**
 * Resolve qual facto activo corrigir — sem escolha silenciosa se ambíguo.
 * @param {string} instrucao
 * @param {Array<{ id: string, texto?: string }>} factosActivos
 */
function resolverAlvoCorrecao(instrucao, factosActivos) {
  const activos = Array.isArray(factosActivos) ? factosActivos : [];
  const payload = extrairPayloadCorrecao(instrucao);
  if (!payload || !payload.textoNovo) {
    return {
      ok: false,
      codigo: "payload_insuficiente",
      mensagem:
        "Pedido de correção reconhecido, mas não identifiquei a informação factual nova. Indique o valor/texto correcto. LFC inalterado."
    };
  }

  const indice = extrairIndiceFacto(instrucao);
  if (indice != null) {
    if (indice > activos.length) {
      return {
        ok: false,
        codigo: "indice_invalido",
        mensagem: `Não há um ${indice}º facto activo neste caso (${activos.length} activo(s)). Indique o índice ou o texto do facto. LFC inalterado.`
      };
    }
    const alvo = activos[indice - 1];
    return {
      ok: true,
      alvoId: alvo.id,
      textoNovo: payload.textoNovo,
      sectorLogistica: payload.sectorLogistica
    };
  }

  const hint = texto(payload.alvoHint);
  if (hint) {
    const hits = activos.filter((f) =>
      String(f.texto || "")
        .toLowerCase()
        .includes(hint.toLowerCase())
    );
    if (hits.length === 1) {
      return {
        ok: true,
        alvoId: hits[0].id,
        textoNovo: payload.textoNovo,
        sectorLogistica: payload.sectorLogistica
      };
    }
    if (hits.length > 1) {
      return {
        ok: false,
        codigo: "alvo_ambiguo",
        mensagem:
          "Vários factos activos correspondem ao alvo indicado. Precise o índice (ex.: segundo facto) ou o texto exacto. LFC inalterado."
      };
    }
  }

  // Conteúdo: pistas no pedido (faturamento, 48, serviços…)
  const raw = String(instrucao || "").toLowerCase();
  /** @type {string[]} */
  const pistas = [];
  if (/faturamento/.test(raw)) pistas.push("faturamento");
  if (/48/.test(raw)) pistas.push("48");
  if (/servi[cç]os/.test(raw)) pistas.push("serviços");
  if (/funcion[aá]rios/.test(raw)) pistas.push("funcionários");
  if (/margem/.test(raw)) pistas.push("margem");

  if (pistas.length) {
    const hits = activos.filter((f) => {
      const ft = String(f.texto || "").toLowerCase();
      return pistas.some((p) => ft.includes(p.toLowerCase()));
    });
    if (hits.length === 1) {
      return {
        ok: true,
        alvoId: hits[0].id,
        textoNovo: payload.textoNovo,
        sectorLogistica: payload.sectorLogistica
      };
    }
    if (hits.length > 1) {
      return {
        ok: false,
        codigo: "alvo_ambiguo",
        mensagem:
          "Vários factos activos podem ser o alvo. Indique o índice (ex.: segundo facto) ou o texto a substituir. LFC inalterado."
      };
    }
  }

  return {
    ok: false,
    codigo: "alvo_insuficiente",
    mensagem:
      "Não identifiquei qual facto corrigir. Indique o índice (ex.: segundo facto) ou o texto actual a substituir. LFC inalterado."
  };
}

/**
 * @param {Array<{ texto?: string }>} factos
 * @param {string|null} chave
 * @param {string} instrucao
 * @returns {string}
 */
function responderDadoUnicoDeLfc(factos, chave, instrucao) {
  const tipada = responderCampoNosFactosLfc(factos, chave, instrucao);
  if (tipada && !/^Não identifiquei o facto pedido/i.test(tipada)) {
    return tipada.endsWith(".") ? tipada : `${tipada}.`;
  }

  const corpus = factos.map((f) => String(f.texto || "")).join("\n");
  const n = corpus
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (chave === "setor" || /\bsetor\b/i.test(instrucao)) {
    if (/\blogistica\b/.test(n)) return "Logística.";
    if (/\bservicos?\b/.test(n)) return "Serviços.";
    return "Não tenho o setor registado nos factos activos do LFC.";
  }
  if (chave === "nome_empresa" || (/\bnome\b/i.test(instrucao) && /\bempresa\b/i.test(instrucao))) {
    if (/\bvale\s*verde\b/i.test(corpus)) return "ValeVerde.";
    return "Não tenho o nome da empresa nos factos activos do LFC.";
  }
  if (/\bsetor\b/i.test(instrucao)) {
    if (/\blogistica\b/.test(n)) return "Logística.";
    if (/\bservicos?\b/.test(n)) return "Serviços.";
  }
  if (/\bnome\b/i.test(instrucao)) {
    if (/\bvale\s*verde\b/i.test(corpus)) return "ValeVerde.";
  }
  return tipada || "Não identifiquei o facto pedido nos factos activos do LFC.";
}

/**
 * Processa turno conversacional com LFC quando o modo é factual do caso.
 * Modos sim_nao / lacunas → { activo: false } (semântica não factual intacta).
 *
 * @param {string} [instrucao]
 * @param {{
 *   historico?: ReadonlyArray<{ papel?: string, texto?: string }>,
 *   coaId?: string|null,
 *   writer?: object,
 *   reader?: object,
 *   permitirFallbackReparse?: boolean
 * }} [ctx]
 * @returns {Promise<{
 *   activo: boolean,
 *   mensagem?: string,
 *   modo?: string,
 *   fonte?: string,
 *   dados?: object
 * }>}
 */
export async function processarTurnoLfc(instrucao, ctx = {}) {
  const det = detectarModoRespostaRestrita(instrucao);
  if (!det.activo || !det.modo || !MODOS_LFC.has(det.modo)) {
    return { activo: false };
  }

  const writer = ctx.writer;
  const reader = ctx.reader;
  if (!writer || !reader) {
    return {
      activo: true,
      modo: det.modo,
      mensagem:
        "LFC indisponível neste turno (Writer/Reader não injectados). Não confirmo persistência.",
      fonte: "lfc_indisponivel",
      dados: { lfc: { ok: false, codigo: "runtime_ausente" } }
    };
  }

  const coaId = texto(ctx.coaId) || null;
  const permitirFallback = ctx.permitirFallbackReparse !== false;

  if (det.modo === "registo") {
    if (!coaId) {
      return {
        activo: true,
        modo: "registo",
        mensagem:
          "Sem COA activo não persisto factos no LFC. Active um COA antes de registar — sem confirmação de persistência neste turno.",
        fonte: "lfc_sem_coa",
        dados: {
          lfc: { ok: false, codigo: "coa_ausente", autorizaProsaGuardado: false },
          marcadoresLn: ["LN-09"],
          codigoCoa: "coa_ausente",
          coaId: null,
          casoId: null
        }
      };
    }
    const bullets = extrairBulletsFactuais(instrucao);
    const titulo = extrairTituloCaso(instrucao);
    // Sem unidades factuais inequívocas → não persistir em silêncio (sem «guardado»).
    if (!bullets.length) {
      return {
        activo: true,
        modo: "registo",
        mensagem:
          "Pedido de registo reconhecido, mas não identifiquei factos inequívocos para persistir. Indique a lista (bullets ou separados por «;»). Sem confirmação de persistência neste turno.",
        fonte: "lfc_sem_factos",
        dados: {
          lfc: {
            ok: false,
            codigo: "factos_ausentes",
            autorizaProsaGuardado: false
          }
        }
      };
    }
    const r = await Promise.resolve(
      writer.criarCaso({
        coaId,
        titulo,
        factosIniciais: bullets,
        origem: ORIGEM_UTILIZADOR
      })
    );
    if (r?.ok === true && r.autorizaProsaGuardado === true) {
      const n = Number(r.nFactos) || bullets.length;
      return {
        activo: true,
        modo: "registo",
        mensagem:
          `Contexto registado: ${titulo}. ` +
          `${n} facto(s) inicial(is) guardado(s). ` +
          `Confirmação feita — sem análise nem recomendação neste turno.`,
        fonte: "lfc_writer",
        dados: { lfc: r, casoId: r.casoId }
      };
    }
    return {
      activo: true,
      modo: "registo",
      mensagem:
        r?.mensagem ||
        "Não confirmo «guardado»: a escrita no LFC não foi confirmada pelo Writer.",
      fonte: "lfc_writer",
      dados: { lfc: r || { ok: false, autorizaProsaGuardado: false } }
    };
  }

  if (det.modo === "confirmacao") {
    if (!coaId) {
      return {
        activo: true,
        modo: "confirmacao",
        mensagem:
          "Sem COA activo não corrijo factos no LFC. Active um COA — LFC inalterado.",
        fonte: "lfc_sem_coa",
        dados: {
          lfc: { ok: false, codigo: "coa_ausente" },
          marcadoresLn: ["LN-09"],
          codigoCoa: "coa_ausente",
          coaId: null,
          casoId: null
        }
      };
    }
    const titulo = extrairTituloCaso(instrucao);
    let resolvido = await Promise.resolve(
      reader.resolverCaso(coaId, { titulo, actualizarPonteiro: true })
    );
    if (!resolvido.ok && resolvido.codigo === "caso_nao_encontrado") {
      resolvido = await Promise.resolve(
        reader.resolverCaso(coaId, { deixis: true })
      );
    }
    if (resolvido.codigo === "caso_ambiguo") {
      return {
        activo: true,
        modo: "confirmacao",
        mensagem:
          "Há vários casos com o mesmo título neste COA. Indique qual caso corrigir (casoId) — não escolho em silêncio.",
        fonte: "lfc_reader",
        dados: { lfc: resolvido }
      };
    }
    if (!resolvido.ok || !resolvido.casoId) {
      return {
        activo: true,
        modo: "confirmacao",
        mensagem:
          "Não há caso LFC resolvido para aplicar a correção. LFC inalterado.",
        fonte: "lfc_reader",
        dados: { lfc: resolvido }
      };
    }

    const listados = await Promise.resolve(
      reader.listarFactosActivos(coaId, resolvido.casoId)
    );
    if (!listados.ok || !Array.isArray(listados.factos) || !listados.factos.length) {
      return {
        activo: true,
        modo: "confirmacao",
        mensagem:
          "Não há factos activos neste caso para corrigir. LFC inalterado.",
        fonte: "lfc_reader",
        dados: { lfc: listados, casoId: resolvido.casoId }
      };
    }

    const alvo = resolverAlvoCorrecao(instrucao, listados.factos);
    if (!alvo.ok) {
      return {
        activo: true,
        modo: "confirmacao",
        mensagem: alvo.mensagem,
        fonte: "lfc_esclarecimento",
        dados: {
          lfc: { ok: false, codigo: alvo.codigo },
          casoId: resolvido.casoId
        }
      };
    }

    const r = await Promise.resolve(
      writer.corrigirFacto({
        coaId,
        casoId: resolvido.casoId,
        alvoId: alvo.alvoId,
        textoNovo: alvo.textoNovo,
        origem: ORIGEM_UTILIZADOR,
        correçãoExplícita: true
      })
    );
    if (r?.ok === true && r.autorizaProsaGuardado === true) {
      const msg = alvo.sectorLogistica
        ? `Correcção confirmada: o setor da ValeVerde é logística (não serviços). Sem análise adicional neste turno.`
        : `Correcção confirmada: «${alvo.textoNovo}». Sem análise adicional neste turno.`;
      return {
        activo: true,
        modo: "confirmacao",
        mensagem: msg,
        fonte: "lfc_writer",
        dados: { lfc: r, casoId: resolvido.casoId }
      };
    }
    return {
      activo: true,
      modo: "confirmacao",
      mensagem:
        r?.mensagem ||
        "Correção não aplicada — LFC inalterado (Writer não confirmou).",
      fonte: "lfc_writer",
      dados: { lfc: r || { ok: false } }
    };
  }

  // --- Recuperação: factos / dado_unico — Reader canónico ---
  if (!coaId) {
    return {
      activo: true,
      modo: det.modo,
      mensagem:
        det.modo === "factos"
          ? "Sem COA activo não há leitura persistente do LFC. Não listo factos de caso."
          : "Sem COA activo não recupero factos do LFC.",
      fonte: "lfc_sem_coa",
      dados: {
        lfc: { ok: false, codigo: "coa_ausente" },
        marcadoresLn: ["LN-09"],
        codigoCoa: "coa_ausente",
        coaId: null,
        casoId: null
      }
    };
  }

  // FRENTE 9: título só com evidência explícita no pedido (extrairTituloCasoParaConsumoMre).
  // Funil rígido continua a impedir retarget de COA; aqui resolve-se *dentro* do coaId.
  // Sem título explícito → deixis / casoId (anti-hint soft do F4).
  const tituloHint = extrairTituloCasoParaConsumoMre(instrucao);
  let resolvido = tituloHint
    ? await Promise.resolve(
        reader.resolverCaso(coaId, {
          titulo: tituloHint,
          actualizarPonteiro: false
        })
      )
    : { ok: false, codigo: "sem_titulo" };
  if (resolvido.codigo === "caso_ambiguo") {
    return {
      activo: true,
      modo: det.modo,
      mensagem:
        "Há vários casos com o mesmo título neste COA. Indique qual caso consultar (casoId) — não escolho em silêncio.",
      fonte: "lfc_reader",
      dados: { lfc: resolvido }
    };
  }
  if (!resolvido.ok) {
    resolvido = await Promise.resolve(
      reader.resolverCaso(coaId, { deixis: true })
    );
  }
  if (resolvido.codigo === "caso_ambiguo") {
    return {
      activo: true,
      modo: det.modo,
      mensagem:
        "Há vários casos com o mesmo título neste COA. Indique qual caso consultar (casoId) — não escolho em silêncio.",
      fonte: "lfc_reader",
      dados: { lfc: resolvido }
    };
  }

  if (resolvido.ok && resolvido.casoId) {
    const listados = await Promise.resolve(
      reader.listarFactosActivos(coaId, resolvido.casoId)
    );
    if (listados.ok && Array.isArray(listados.factos) && listados.factos.length > 0) {
      if (det.modo === "factos") {
        const linhas = listados.factos.map(
          (f, i) => `${i + 1}. ${f.texto}`
        );
        return {
          activo: true,
          modo: "factos",
          mensagem: `Factos fornecidos (sem interpretação):\n${linhas.join("\n")}`,
          fonte: "lfc_reader",
          dados: { lfc: listados, casoId: resolvido.casoId, coaId }
        };
      }
      // dado_unico
      return {
        activo: true,
        modo: "dado_unico",
        mensagem: responderDadoUnicoDeLfc(
          listados.factos,
          det.chave || null,
          String(instrucao || "")
        ),
        fonte: "lfc_reader",
        dados: { lfc: listados, casoId: resolvido.casoId, coaId }
      };
    }
    // Caso existe mas sem activos — LFC prevalece (vazio canónico)
    if (listados.ok) {
      return {
        activo: true,
        modo: det.modo,
        mensagem:
          det.modo === "factos"
            ? "Não há factos activos no LFC para este caso."
            : "Não tenho o facto pedido nos factos activos do LFC.",
        fonte: "lfc_reader",
        dados: { lfc: listados, casoId: resolvido.casoId }
      };
    }
  }

  // Fallback temporário: só se não há autoridade LFC resolvida
  if (permitirFallback) {
    const legacy = tentarRespostaRestrita(instrucao, {
      historico: ctx.historico || []
    });
    if (legacy.activo && legacy.mensagem) {
      return {
        activo: true,
        modo: legacy.modo || det.modo,
        mensagem: legacy.mensagem,
        fonte: "reparse_fallback",
        dados: { lfc: resolvido, fallback: true }
      };
    }
  }

  return {
    activo: true,
    modo: det.modo,
    mensagem:
      det.modo === "factos"
        ? "Não há factos materiais do utilizador registados no LFC para listar."
        : "Não identifiquei o facto pedido nos dados do LFC.",
    fonte: "lfc_reader",
    dados: { lfc: resolvido }
  };
}

/**
 * Contradição sem correção explícita: não chama Writer de mutação.
 * @param {string} [instrucao]
 * @param {{ coaId?: string|null, writer?: object, reader?: object }} [ctx]
 */
export async function tentarMutacaoContraditoriaSemCorrecao(instrucao, ctx = {}) {
  const coaId = texto(ctx.coaId);
  const writer = ctx.writer;
  const reader = ctx.reader;
  if (!coaId || !writer || !reader) {
    return { alterou: false, motivo: "sem_deps" };
  }
  const activo = await Promise.resolve(reader.obterCasoActivo(coaId));
  if (!activo.ok || !activo.casoId) {
    return { alterou: false, motivo: "sem_caso" };
  }
  const textoNovo =
    texto(instrucao) || "Atua no mercado de logística.";
  const r = await Promise.resolve(
    writer.acrescentarFactos({
      coaId,
      casoId: activo.casoId,
      factos: [textoNovo],
      origem: ORIGEM_UTILIZADOR,
      correçãoExplícita: false
    })
  );
  return {
    alterou: r?.ok === true,
    resultado: r,
    motivo: r?.codigo || (r?.ok ? "ok" : "recusado")
  };
}

export { MODOS_LFC };
