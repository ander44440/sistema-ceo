/**
 * Composição por camadas A–F (PX-003 E1 §3.4) — sem alterar deliberação.
 */

import { TIPO_TURNO } from "./tiposTurno.js";
import {
  filtrarPerguntasJaFeitas,
  objetivoJaNoFio
} from "./contextoImediato.js";
import {
  ancoraFio,
  proximaAberturaPergunta,
  proximoFecho
} from "./variacao.js";

const PROSA_DECISAO = Object.freeze({
  aprovar: (r) => `${r}`,
  rejeitar: (r) => `Não avanço com isso: ${r}`,
  delegar: (r) => `Delego a execução: ${r}`,
  monitorar: (r) => `Vou acompanhar: ${r}`,
  solicitar_dados: (r) => `Para decidir, preciso de mais dados. ${r}`,
  adiar: (r) => `Adio por agora: ${r}`
});

function encurtar(s, max) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * @param {object} parecer
 * @param {object} ctxImediato
 * @param {object} [opts]
 */
export function comporDeliberacao(parecer, ctxImediato, opts = {}) {
  const estado = parecer.decisaoExecutiva?.estado;
  const recomendacao = String(
    parecer.decisaoExecutiva?.recomendacao || ""
  ).trim();
  const justificativa = String(
    parecer.decisaoExecutiva?.justificativa || ""
  ).trim();
  const acaoDesc = String(parecer.acao?.descricao || "").trim();
  const lacunas = Array.isArray(parecer.lacunas) ? parecer.lacunas : [];
  const confianca = Number(parecer.confianca);
  const objetivo = String(parecer.diagnostico?.objetivoReal || "").trim();
  const canal = opts.canal || "chat";
  const pediuDetalhe = Boolean(opts.pediuDetalhe);
  const limiarPorque = opts.limiarPorque ?? 0.55;

  /** @type {Record<string, string|null>} */
  const camadas = {
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
    F: null
  };

  const prosaFn = PROSA_DECISAO[estado] || ((r) => r);
  camadas.A = prosaFn(recomendacao || "Sem recomendação clara.");

  if (confianca < 0.5 || lacunas.length > 0) {
    camadas.A = `${camadas.A} Com a informação disponível, avanço com cautela.`;
  }

  if (acaoDesc) {
    camadas.B = `Próximo gesto: ${acaoDesc}.`;
  }

  if (pediuDetalhe || confianca < limiarPorque) {
    camadas.C = `Porquê: ${encurtar(justificativa, canal === "voz" ? 140 : 220)}`;
  }

  let perguntas =
    estado === "solicitar_dados"
      ? lacunas.map((l) => (/\?$/.test(l) ? l : `${l}?`))
      : [];
  if (estado === "solicitar_dados" && perguntas.length === 0) {
    perguntas = ["Qual informação bloqueia a próxima decisão?"];
  }
  perguntas = filtrarPerguntasJaFeitas(perguntas, ctxImediato);

  if (perguntas.length) {
    camadas.D = `Para avançar: ${perguntas.slice(0, canal === "voz" ? 1 : 2).join(" ")}`;
  } else if (lacunas.length && estado !== "solicitar_dados" && pediuDetalhe) {
    camadas.D = `Atenção: ${encurtar(lacunas.join("; "), 120)}.`;
  }

  const pularEcoObjetivo = objetivoJaNoFio(objetivo, ctxImediato);
  if (
    ctxImediato?.frenteAtiva &&
    !pularEcoObjetivo &&
    canal !== "centro_situacao"
  ) {
    camadas.E = ancoraFio(ctxImediato.frenteAtiva);
  }

  // Fecho só se não há gesto claro (camada B) — evita muleta default
  if (
    !camadas.B &&
    (estado === "aprovar" || estado === "delegar" || estado === "monitorar")
  ) {
    camadas.F = proximoFecho();
  }

  const ordem =
    canal === "voz"
      ? ["E", "A", "B", "D", "C"]
      : canal === "centro_situacao"
        ? ["A", "B"]
        : ["E", "A", "B", "C", "D", "F"];

  const partes = ordem.map((k) => camadas[k]).filter(Boolean);
  const texto = partes.join(canal === "voz" ? " " : "\n\n");
  const guiãoVoz = ["A", "B", "D", "E"]
    .map((k) => camadas[k])
    .filter(Boolean)
    .join(" ");

  return {
    texto,
    guiãoVoz,
    camadasUsadas: Object.fromEntries(
      Object.entries(camadas).filter(([, v]) => Boolean(v))
    ),
    perguntas
  };
}

/**
 * @param {string} tipo
 * @param {object} args
 */
export function comporPorTipo(tipo, args = {}) {
  const {
    parecer,
    ctxImediato,
    mensagemOriginal,
    canal = "chat",
    pediuDetalhe = false
  } = args;

  if (tipo === TIPO_TURNO.SISTEMA) {
    const limpa = sanitizarMensagemSistema(mensagemOriginal);
    return {
      texto: limpa,
      guiãoVoz: limpa,
      camadasUsadas: { sistema: limpa },
      perguntas: []
    };
  }

  if (tipo === TIPO_TURNO.ABERTURA) {
    const cumprimento = cumprimentoDe(mensagemOriginal);
    const pergunta = proximaAberturaPergunta();
    const texto = cumprimento ? `${cumprimento} ${pergunta}` : pergunta;
    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas: { abertura: texto },
      perguntas: [pergunta]
    };
  }

  if (tipo === TIPO_TURNO.ESPELHO && parecer) {
    const obj =
      ctxImediato?.objetivoAtual ||
      parecer.diagnostico?.objetivoReal ||
      "o pedido";
    const texto = `Entendi: ${encurtar(obj, 120)}. É isso?`;
    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas: { espelho: texto },
      perguntas: ["É isso?"]
    };
  }

  if (parecer) {
    return comporDeliberacao(parecer, ctxImediato, { canal, pediuDetalhe });
  }

  // LLM / local sem parecer: preservar prosa, só âncora de fio se útil
  let texto = String(mensagemOriginal || "").trim();
  const camadasUsadas = { prosa: texto };
  if (
    ctxImediato?.frenteAtiva &&
    !objetivoJaNoFio(ctxImediato.frenteAtiva, ctxImediato) &&
    !/Mantemos o foco|Frente ativa|Continuidade:/i.test(texto)
  ) {
    const e = ancoraFio(ctxImediato.frenteAtiva);
    if (e) {
      texto = `${e}\n\n${texto}`;
      camadasUsadas.E = e;
    }
  }
  return {
    texto,
    guiãoVoz: texto,
    camadasUsadas,
    perguntas: []
  };
}

function cumprimentoDe(msg) {
  const t = String(msg || "");
  if (/^bom dia/i.test(t)) return "Bom dia.";
  if (/^boa tarde/i.test(t)) return "Boa tarde.";
  if (/^boa noite/i.test(t)) return "Boa noite.";
  if (/^pronto/i.test(t)) return "Pronto.";
  return "";
}

/**
 * Sistema não fala como CEO — remove vazamentos técnicos óbvios da prosa.
 * @param {string} msg
 */
export function sanitizarMensagemSistema(msg) {
  let t = String(msg || "").trim();
  if (!t) {
    return "Não foi possível concluir este passo. O texto da deliberação não está disponível.";
  }
  t = t.replace(/Configure `?CEO_LLM_API_KEY`?[^.]*\./gi, "");
  t = t.replace(/veja `?\.env\.example`?[^.]*\./gi, "");
  t = t.replace(/reinicie o servidor[^.]*\./gi, "");
  t = t.replace(/app\/\.env/gi, "configuração local");
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  if (!t) {
    return "O motor de linguagem está indisponível neste momento. Seguimos com data, hora, estado da sessão e navegação.";
  }
  return t;
}
