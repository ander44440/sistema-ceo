/**
 * Refino interno EIC — calibração por evidências (Cursor 1).
 *
 * Eleva qualidade do raciocínio e condução da conversa sem criar
 * capacidades, sem alterar arquitectura, governança nem contratos públicos.
 *
 * Peças:
 * 1. Memória de Trabalho Executiva
 * 2. Ciclo Executivo de Raciocínio
 * 3. Hierarquia de Objectivos
 * 4. Evidência → Diagnóstico → Ajuste
 * 5. Estado Executivo da Conversa
 * 6. Consistência Terminológica
 * 7. Critério de Encerramento
 */

import { obterDiaExecutivo } from "../catalogoProjetos/index.js";
import {
  detectarPromocaoDecisaoProduto,
  lerMemoria
} from "../executiveMemory/index.js";
import { ordenarPromocoesPorRecencia } from "../motorExecucao/acompanhamentoJob.js";
import {
  REFINO_EIC_ATIVO,
  obterMemoriaTrabalhoExecutiva,
  definirMemoriaTrabalhoExecutiva,
  clonarMemoria,
  normalizarCoaIdMte
} from "./refinoEicSessao.js";

/** Máximo de itens em listas de estado actual (não histórico). */
const MAX_ITENS = 5;

/**
 * Nomenclatura vigente (EIC / ARQ-018 / CSC / Painel).
 * Chaves canónicas → termos oficiais; valores alternativos → canónico.
 */
export const TERMINOLOGIA_VIGENTE = Object.freeze({
  objectivoAtivo: "objectivo activo",
  objectivoEstrategico: "objectivo estratégico",
  objectivoAtual: "objectivo actual",
  entregaCorrente: "entrega corrente",
  restricoesAtivas: "restrições activas",
  decisoesTomadas: "decisões tomadas",
  pendencias: "pendências",
  proximaAcao: "próxima acção",
  estadoExecutivo: "estado executivo",
  cicloExecutivo: "ciclo executivo de raciocínio",
  evidencia: "evidência",
  diagnostico: "diagnóstico",
  ajuste: "ajuste",
  classificadorIntencao: "Classificador de Intenção",
  conversacaoNatural: "Conversação Natural",
  motorExecucao: "Motor de Execução",
  mre: "MRE",
  coa: "COA",
  csc: "CSC",
  vca: "VCA",
  gate: "Gate",
  eic: "EIC"
});

/** Sinónimos / formas legadas → forma canónica interna. */
const MAPA_TERMINOLOGIA = Object.freeze({
  "objetivo ativo": "objectivo activo",
  "objetivo activo": "objectivo activo",
  "objectivo ativo": "objectivo activo",
  "objetivo atual": "objectivo actual",
  "objetivo actual": "objectivo actual",
  "objectivo atual": "objectivo actual",
  "objetivo estratégico": "objectivo estratégico",
  "proxima ação": "próxima acção",
  "próxima ação": "próxima acção",
  "proxima acao": "próxima acção",
  "proxima acção": "próxima acção",
  chatbot: "CEO",
  "assistente virtual": "CEO",
  "núcleo cognitivo": "Núcleo Executivo",
  "nucleo cognitivo": "Núcleo Executivo"
});

/**
 * @typedef {object} HierarquiaObjectivos
 * @property {string|null} objectivoEstrategico
 * @property {string|null} objectivoAtual
 * @property {string|null} entregaCorrente
 */

/**
 * @typedef {object} CicloExecutivoRaciocinio
 * @property {string|null} objectivo
 * @property {string|null} contexto
 * @property {string[]} restricoes
 * @property {string[]} alternativas
 * @property {string|null} decisao
 * @property {string|null} proximaAcao
 */

/**
 * @typedef {object} CicloEvidenciaDiagnosticoAjuste
 * @property {string[]} evidencias
 * @property {string|null} diagnostico
 * @property {string|null} ajuste
 */

/**
 * @typedef {object} EstadoExecutivoConversa
 * @property {string|null} emExecucao
 * @property {string[]} concluidos
 * @property {string[]} pendentes
 * @property {string|null} bloqueio
 */

/**
 * @typedef {object} CriterioEncerramento
 * @property {string|null} conclusao
 * @property {string|null} estadoAtual
 * @property {string[]} dependencias
 * @property {boolean} necessitaNovoDespacho
 * @property {boolean} actividadeConcluida
 */

/**
 * @typedef {object} MemoriaTrabalhoExecutiva
 * @property {string|null} objectivoAtivo
 * @property {string[]} restricoesAtivas
 * @property {string[]} decisoesTomadas
 * @property {string|null} [posicaoCeoNaoVigente] — recomendação/posição do CEO (não é decisão)
 * @property {string[]} pendencias
 * @property {string|null} proximaAcao
 * @property {HierarquiaObjectivos} hierarquia
 * @property {CicloExecutivoRaciocinio} ciclo
 * @property {CicloEvidenciaDiagnosticoAjuste|null} analiseTecnica
 * @property {EstadoExecutivoConversa} estadoConversa
 * @property {CriterioEncerramento|null} encerramento
 * @property {string|null} [coaId]
 * @property {string} actualizadoEm
 */

/**
 * @typedef {object} EntradaRefinoEic
 * @property {string} [mensagem]
 * @property {string} [classe]
 * @property {string} [destino]
 * @property {object|null} [objetivoConversacional]
 * @property {object|null} [topicoActivo]
 * @property {object|null} [coa]
 * @property {object|null} [memoriaExecutiva]
 * @property {boolean} [gatePendente]
 * @property {string} [veredictoVca]
 * @property {string} [agoraIso]
 * @property {"pre"|"pos"} [fase]
 * @property {object|null} [resposta]
 */

/**
 * Normaliza texto para nomenclatura vigente (refino 6).
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTerminologia(texto) {
  let t = String(texto || "");
  if (!t) return t;
  for (const [legado, canonico] of Object.entries(MAPA_TERMINOLOGIA)) {
    const re = new RegExp(legado.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    t = t.replace(re, canonico);
  }
  return t;
}

/**
 * @returns {MemoriaTrabalhoExecutiva}
 */
export function memoriaTrabalhoVazia(agoraIso) {
  return {
    objectivoAtivo: null,
    restricoesAtivas: [],
    decisoesTomadas: [],
    posicaoCeoNaoVigente: null,
    pendencias: [],
    proximaAcao: null,
    hierarquia: {
      objectivoEstrategico: null,
      objectivoAtual: null,
      entregaCorrente: null
    },
    ciclo: {
      objectivo: null,
      contexto: null,
      restricoes: [],
      alternativas: [],
      decisao: null,
      proximaAcao: null
    },
    analiseTecnica: null,
    estadoConversa: {
      emExecucao: null,
      concluidos: [],
      pendentes: [],
      bloqueio: null
    },
    encerramento: null,
    coaId: null,
    actualizadoEm: agoraIso || new Date().toISOString()
  };
}

/**
 * Extrai restrições activas da mensagem (estado actual, não histórico).
 * @param {string} mensagem
 * @returns {string[]}
 */
export function extrairRestricoesAtivas(mensagem) {
  const m = String(mensagem || "");
  /** @type {string[]} */
  const out = [];
  const padroes = [
    /(?:n[aã]o\s+(?:pode|podemos|podes|devemos|quero)|sem\s+(?:alterar|mudar|tocar)|desde\s+que|contanto\s+que|restri[cç][aã]o[:\s]+|limite[:\s]+|proibido[:\s]+|é\s+expressamente\s+proibido[:\s]*)([^.!?\n]{4,120})/gi,
    /(?:apenas|somente|exclusivamente)\s+([^.!?\n]{4,100})/gi
  ];
  for (const re of padroes) {
    let hit;
    while ((hit = re.exec(m)) !== null) {
      const trecho = normalizarTerminologia(String(hit[0] || "").trim()).slice(
        0,
        160
      );
      if (trecho && !out.includes(trecho)) out.push(trecho);
    }
  }
  return out.slice(0, MAX_ITENS);
}

/**
 * Detecta se o turno pede análise técnica (ciclo evidência→diagnóstico→ajuste).
 * @param {string} mensagem
 * @param {string} [classe]
 * @param {string} [destino]
 */
export function mensagemPedeAnaliseTecnica(mensagem, classe = "", destino = "") {
  const t = String(mensagem || "");
  if (
    /\b(diagn[oó]stico|evid[eê]ncia|root\s*cause|causa\s+raiz|analis[ae]|investig|por\s+que\s+(falhou|quebra|n[aã]o\s+funciona)|ajustar|calibra)/i.test(
      t
    )
  ) {
    return true;
  }
  if (destino === "nucleo_mre" && /\b(falha|erro|bug|regress[aã]o|risco)\b/i.test(t)) {
    return true;
  }
  if (classe === "conversa_projeto" && /\b(por\s+que|o\s+que\s+explica|onde\s+est[aá]\s+o\s+problema)\b/i.test(t)) {
    return true;
  }
  return false;
}

/**
 * Extrai alternativas superficiais da mensagem (quando enumeradas).
 * @param {string} mensagem
 * @returns {string[]}
 */
export function extrairAlternativas(mensagem) {
  const m = String(mensagem || "");
  /** @type {string[]} */
  const out = [];
  const vs = m.match(
    /([^.!?\n]{3,80}?)\s+(?:vs\.?|versus|ou\s+ent[aã]o|em\s+vez\s+de)\s+([^.!?\n]{3,80})/i
  );
  if (vs) {
    out.push(normalizarTerminologia(vs[1].trim()));
    out.push(normalizarTerminologia(vs[2].trim()));
  }
  const enumMatch = m.match(
    /(?:alternativas?|op[cç][oõ]es?)[:\s]+([^.!?\n]+)/i
  );
  if (enumMatch) {
    for (const parte of String(enumMatch[1]).split(/[,;/]| e /i)) {
      const p = normalizarTerminologia(parte.trim());
      if (p.length >= 3 && !out.includes(p)) out.push(p);
    }
  }
  return out.slice(0, MAX_ITENS);
}

/**
 * Monta hierarquia de objectivos (refino 3).
 * Estratégico (COA/dia) ≠ actual (CSC) ≠ entrega corrente (tópico/tarefa).
 * @param {EntradaRefinoEic} entrada
 * @param {MemoriaTrabalhoExecutiva} prev
 * @returns {HierarquiaObjectivos}
 */
export function montarHierarquiaObjectivos(entrada, prev) {
  const dia = obterDiaExecutivo();
  const coa = entrada.coa || null;
  const objConv = entrada.objetivoConversacional || null;
  const topico = entrada.topicoActivo || null;
  const mem = entrada.memoriaExecutiva || lerMemoria();

  const estrategicoPrev = prev?.hierarquia?.objectivoEstrategico || null;
  const estrategicoDia =
    dia?.status === "em_curso" && dia.intencaoDoDia
      ? normalizarTerminologia(String(dia.intencaoDoDia).trim())
      : null;
  const estrategicoCoa = coa
    ? normalizarTerminologia(
        String(coa.nome || coa.titulo || coa.id || "").trim()
      )
    : null;

  // Objectivo estratégico persiste perante mudanas de assunto (tópico).
  const objectivoEstrategico =
    estrategicoDia || estrategicoPrev || estrategicoCoa || null;

  const objectivoAtual = objConv?.enunciado
    ? normalizarTerminologia(String(objConv.enunciado).trim())
    : prev?.hierarquia?.objectivoAtual ||
      (mem && Array.isArray(mem.proximasAcoes) && mem.proximasAcoes[0]?.texto
        ? null
        : prev?.objectivoAtivo) ||
      null;

  const entregaCorrente = topico?.ancora
    ? normalizarTerminologia(String(topico.ancora).trim())
    : prev?.hierarquia?.entregaCorrente || null;

  return {
    objectivoEstrategico: objectivoEstrategico || null,
    objectivoAtual: objectivoAtual || null,
    entregaCorrente: entregaCorrente || null
  };
}

/**
 * Ciclo executivo de raciocínio (refino 2) — orquestra antes da resposta.
 * @param {EntradaRefinoEic} entrada
 * @param {MemoriaTrabalhoExecutiva} base
 * @returns {CicloExecutivoRaciocinio}
 */
export function montarCicloExecutivo(entrada, base) {
  const mensagem = String(entrada.mensagem || "").trim();
  const hierarquia = base.hierarquia;
  const objectivo =
    hierarquia.objectivoAtual ||
    hierarquia.objectivoEstrategico ||
    base.objectivoAtivo ||
    (mensagem ? normalizarTerminologia(mensagem).slice(0, 160) : null);

  const partesContexto = [];
  if (entrada.coa) {
    partesContexto.push(
      `COA: ${entrada.coa.nome || entrada.coa.titulo || entrada.coa.id}`
    );
  }
  if (entrada.veredictoVca) {
    partesContexto.push(`VCA: ${entrada.veredictoVca}`);
  }
  if (entrada.classe) {
    partesContexto.push(`classe: ${entrada.classe}`);
  }
  if (entrada.destino) {
    partesContexto.push(`destino: ${entrada.destino}`);
  }
  if (hierarquia.entregaCorrente) {
    partesContexto.push(`entrega: ${hierarquia.entregaCorrente}`);
  }

  const restricoes = uniqCap(
    [...(base.restricoesAtivas || []), ...extrairRestricoesAtivas(mensagem)],
    MAX_ITENS
  );
  const alternativas = extrairAlternativas(mensagem);

  return {
    objectivo,
    contexto: partesContexto.length ? partesContexto.join(" · ") : null,
    restricoes,
    alternativas,
    decisao: base.ciclo?.decisao || null,
    proximaAcao: base.proximaAcao || null
  };
}

/**
 * Evidência → Diagnóstico → Ajuste (refino 4).
 * @param {EntradaRefinoEic} entrada
 * @param {MemoriaTrabalhoExecutiva} base
 * @returns {CicloEvidenciaDiagnosticoAjuste|null}
 */
export function montarAnaliseTecnica(entrada, base) {
  const mensagem = String(entrada.mensagem || "");
  if (
    !mensagemPedeAnaliseTecnica(mensagem, entrada.classe, entrada.destino) &&
    !base.analiseTecnica
  ) {
    return null;
  }

  /** @type {string[]} */
  const evidencias = [];
  if (entrada.veredictoVca) {
    evidencias.push(`veredicto VCA = ${entrada.veredictoVca}`);
  }
  if (entrada.classe) {
    evidencias.push(`classe = ${entrada.classe}`);
  }
  if (entrada.destino) {
    evidencias.push(`destino = ${entrada.destino}`);
  }
  if (entrada.gatePendente) {
    evidencias.push("Gate pendente");
  }
  if (base.estadoConversa?.bloqueio) {
    evidencias.push(`bloqueio: ${base.estadoConversa.bloqueio}`);
  }
  const trecho = normalizarTerminologia(mensagem).slice(0, 180);
  if (trecho) evidencias.push(`mensagem: ${trecho}`);

  const diagnostico = sintetizarDiagnostico(entrada, base, evidencias);
  const ajuste = sintetizarAjuste(diagnostico, base);

  return {
    evidencias: evidencias.slice(0, MAX_ITENS),
    diagnostico,
    ajuste
  };
}

/**
 * @param {EntradaRefinoEic} entrada
 * @param {MemoriaTrabalhoExecutiva} base
 * @param {string[]} evidencias
 */
function sintetizarDiagnostico(entrada, base, evidencias) {
  if (entrada.gatePendente) {
    return "Actividade bloqueada por Gate pendente — raciocínio deve clarificar antes de avançar.";
  }
  if (base.estadoConversa?.bloqueio) {
    return `Bloqueio activo: ${base.estadoConversa.bloqueio}.`;
  }
  if (
    base.hierarquia.objectivoEstrategico &&
    base.hierarquia.objectivoAtual &&
    base.hierarquia.objectivoEstrategico !== base.hierarquia.objectivoAtual
  ) {
    return "Assunto local diverge do objectivo estratégico — manter hierarquia; não substituir o estratégico.";
  }
  if (evidencias.length) {
    return normalizarTerminologia(
      `Diagnóstico a partir de ${evidencias.length} evidência(s): foco no objectivo actual e restrições activas.`
    );
  }
  return "Análise técnica sem evidências estruturadas suficientes.";
}

/**
 * @param {string|null} diagnostico
 * @param {MemoriaTrabalhoExecutiva} base
 */
function sintetizarAjuste(diagnostico, base) {
  if (!diagnostico) return null;
  if (/Gate pendente/i.test(diagnostico)) {
    return "Aguardar decisão de Gate; não despachar novo trabalho.";
  }
  if (/diverge do objectivo estratégico/i.test(diagnostico)) {
    return "Tratar o assunto como entrega corrente; preservar objectivo estratégico e objectivo actual.";
  }
  if (base.proximaAcao) {
    return `Avançar para a próxima acção: ${base.proximaAcao}.`;
  }
  return "Conduzir resposta pelo ciclo objectivo → contexto → restrições → decisão → próxima acção.";
}

/**
 * Estado executivo da conversa (refino 5).
 * @param {EntradaRefinoEic} entrada
 * @param {MemoriaTrabalhoExecutiva} base
 * @returns {EstadoExecutivoConversa}
 */
export function montarEstadoExecutivoConversa(entrada, base) {
  const mem = entrada.memoriaExecutiva || lerMemoria();
  const pendentesCatalogo = (mem.pendencias || [])
    .filter((p) => p.status === "aberta")
    .map((p) => normalizarTerminologia(String(p.texto || "").trim()))
    .filter(Boolean)
    .slice(0, MAX_ITENS);

  const decisoes = (mem.decisoes || [])
    .map((d) => normalizarTerminologia(String(d.texto || "").trim()))
    .filter(Boolean)
    .slice(0, MAX_ITENS);

  let bloqueio = null;
  if (entrada.gatePendente) {
    bloqueio = "Gate pendente";
  } else if (
    pendentesCatalogo.some((p) => /bloque/i.test(p))
  ) {
    const hit = pendentesCatalogo.find((p) => /bloque/i.test(p));
    bloqueio = hit || "Pendência com bloqueio";
  }

  const emExecucao =
    base.hierarquia.entregaCorrente ||
    base.hierarquia.objectivoAtual ||
    base.objectivoAtivo ||
    null;

  return {
    emExecucao,
    concluidos: uniqCap(
      [...(base.estadoConversa?.concluidos || []), ...decisoes].slice(-MAX_ITENS),
      MAX_ITENS
    ),
    pendentes: uniqCap(
      [...pendentesCatalogo, ...(base.pendencias || [])],
      MAX_ITENS
    ),
    bloqueio
  };
}

/**
 * Critério de encerramento (refino 7) — fase pós-resposta.
 * @param {EntradaRefinoEic} entrada
 * @param {MemoriaTrabalhoExecutiva} base
 * @returns {CriterioEncerramento|null}
 */
export function montarCriterioEncerramento(entrada, base) {
  if (entrada.fase !== "pos") return base.encerramento || null;

  const resposta = entrada.resposta || {};
  const dados = resposta.dados && typeof resposta.dados === "object"
    ? resposta.dados
    : {};
  const motor = dados.motor && typeof dados.motor === "object" ? dados.motor : null;
  const mensagem = String(resposta.mensagem || "");
  const ok = resposta.ok !== false;

  const concluida =
    Boolean(motor && motor.encerrado === true) ||
    Boolean(dados.jobPublicado) ||
    /\b(conclu[ií]d|encerrad|feito|resolvido|homologad)/i.test(mensagem);

  const aguardaGate = motor && motor.aguardandoGate === true;
  const necessitaNovoDespacho =
    !aguardaGate &&
    Boolean(
      base.proximaAcao ||
        (base.estadoConversa?.pendentes || []).length > 0
    ) &&
    !concluida;

  if (!concluida && !aguardaGate && entrada.destino !== "motor_execucao") {
    // Turno deliberativo/leve: regista estado sem forçar «conclusão» falsa.
    return {
      conclusao: ok
        ? "Turno processado — actividade em curso."
        : "Turno com falha — actividade não concluída.",
      estadoAtual: base.estadoConversa?.emExecucao || base.objectivoAtivo || null,
      dependencias: (base.estadoConversa?.pendentes || []).slice(0, MAX_ITENS),
      necessitaNovoDespacho: Boolean(base.proximaAcao),
      actividadeConcluida: false
    };
  }

  return {
    conclusao: aguardaGate
      ? "Aguardando decisão de Gate."
      : concluida
        ? normalizarTerminologia(
            String(
              motor?.resumoEncerramento ||
                mensagem.slice(0, 160) ||
                "Actividade concluída."
            )
          )
        : "Actividade em execução.",
    estadoAtual: base.estadoConversa?.emExecucao || base.objectivoAtivo || null,
    dependencias: (base.estadoConversa?.pendentes || []).slice(0, MAX_ITENS),
    necessitaNovoDespacho: Boolean(necessitaNovoDespacho && !aguardaGate),
    actividadeConcluida: Boolean(concluida && !aguardaGate)
  };
}

/**
 * Actualiza a Memória de Trabalho Executiva (refino 1) para o turno.
 * @param {EntradaRefinoEic} entrada
 * @returns {MemoriaTrabalhoExecutiva|null}
 */
export function actualizarMemoriaTrabalhoExecutiva(entrada = {}) {
  if (!REFINO_EIC_ATIVO) return obterMemoriaTrabalhoExecutiva();

  const agora = entrada.agoraIso || new Date().toISOString();
  const coaIdTurno = normalizarCoaIdMte(entrada.coa?.id);
  const prevBruto = obterMemoriaTrabalhoExecutiva();
  const coaIdSlot = normalizarCoaIdMte(prevBruto?.coaId);

  // VCA negou lastro / sem COA válido: não escrever sobre o slot de outro COA.
  if (!coaIdTurno && coaIdSlot) {
    return prevBruto;
  }

  const mesmoCoa = coaIdTurno === coaIdSlot;
  const prev =
    mesmoCoa && prevBruto ? prevBruto : memoriaTrabalhoVazia(agora);
  const mem = entrada.memoriaExecutiva || lerMemoria();
  const mensagem = String(entrada.mensagem || "");

  const hierarquia = montarHierarquiaObjectivos(entrada, prev);
  const objectivoAtivo =
    hierarquia.objectivoAtual ||
    hierarquia.objectivoEstrategico ||
    prev.objectivoAtivo;

  const restricoesAtivas = uniqCap(
    [
      ...prev.restricoesAtivas,
      ...extrairRestricoesAtivas(mensagem)
    ],
    MAX_ITENS
  );

  const decisoesTomadas = uniqCap(
    [
      ...(mem.decisoes || [])
        .map((d) => normalizarTerminologia(String(d.texto || "").trim()))
        .filter(Boolean),
      ...prev.decisoesTomadas
    ].slice(0, MAX_ITENS),
    MAX_ITENS
  );

  const pendencias = uniqCap(
    [
      ...(mem.pendencias || [])
        .filter((p) => p.status === "aberta")
        .map((p) => normalizarTerminologia(String(p.texto || "").trim()))
        .filter(Boolean),
      ...prev.pendencias
    ],
    MAX_ITENS
  );

  const proximaAcao =
    (mem.proximasAcoes &&
      mem.proximasAcoes[0] &&
      normalizarTerminologia(String(mem.proximasAcoes[0].texto || "").trim())) ||
    prev.proximaAcao ||
    null;

  /** @type {MemoriaTrabalhoExecutiva} */
  let base = {
    ...prev,
    objectivoAtivo,
    restricoesAtivas,
    decisoesTomadas,
    posicaoCeoNaoVigente: prev.posicaoCeoNaoVigente || null,
    pendencias,
    proximaAcao,
    hierarquia,
    coaId: coaIdTurno,
    actualizadoEm: agora
  };

  base.ciclo = montarCicloExecutivo(entrada, base);
  base.estadoConversa = montarEstadoExecutivoConversa(entrada, base);
  base.analiseTecnica = montarAnaliseTecnica(entrada, base);

  // Teste 3 — promover resultado reconciliado à memória de trabalho / missão
  const promocoes = ordenarPromocoesPorRecencia(
    Array.isArray(entrada.promocoesResultadoOperacao)
      ? entrada.promocoesResultadoOperacao
      : []
  );
  if (promocoes.length) {
    const p0 = promocoes[0];
    const linha = `${p0.jobId}: ${p0.sintese || p0.titulo || ""}`.slice(0, 160);
    base.estadoConversa = {
      ...base.estadoConversa,
      emExecucao: base.estadoConversa.emExecucao || linha
    };
    if (!base.objectivoAtivo) {
      base.objectivoAtivo = linha;
    }
    if (!base.proximaAcao) {
      base.proximaAcao =
        p0.estado === "needs_correction"
          ? `Retomar ${p0.jobId} a partir do resultado reconciliado`
          : `Usar resultado reconciliado de ${p0.jobId} na continuidade da missão`;
    }
    if (p0.estado === "needs_correction") {
      const pend =
        `Retomar/corrigir ${p0.jobId} com base no resultado reconciliado`.slice(
          0,
          160
        );
      base.pendencias = uniqCap([pend, ...base.pendencias], MAX_ITENS);
      base.estadoConversa = {
        ...base.estadoConversa,
        pendentes: uniqCap(
          [pend, ...(base.estadoConversa.pendentes || [])],
          MAX_ITENS
        )
      };
    }
  }

  if (entrada.fase === "pos") {
    // DESP-009 (emenda Frente 3): colher posição do CEO ≠ decisão vigente.
    // Só acto inequívoco do utilizador promove a decisoesTomadas.
    const parecer = entrada.resposta?.dados?.parecer || null;
    const cnCtx =
      entrada.resposta?.dados?.conversacaoNatural?.contextoImediato || null;
    const estadoDec = String(parecer?.decisaoExecutiva?.estado || "").trim();
    const rec = String(parecer?.decisaoExecutiva?.recomendacao || "").trim();
    const acaoDesc = String(parecer?.acao?.descricao || "").trim();
    const proxCn = String(cnCtx?.proximaAcao || "").trim();
    let promocao = detectarPromocaoDecisaoProduto(mensagem);

    if (rec) {
      base.posicaoCeoNaoVigente = normalizarTerminologia(rec).slice(0, 160);
    }

    if (promocao?.usarPosicaoCorrente) {
      const corrente = String(
        rec || base.posicaoCeoNaoVigente || ""
      ).trim();
      promocao = corrente
        ? { tipo: "aceite", texto: corrente.slice(0, 160) }
        : null;
    }

    if (promocao) {
      const vigente = normalizarTerminologia(promocao.texto).slice(0, 160);
      base.decisoesTomadas = uniqCap(
        [vigente, ...base.decisoesTomadas],
        MAX_ITENS
      );
      base.posicaoCeoNaoVigente = null;
    }

    if (proxCn) {
      base.proximaAcao = normalizarTerminologia(proxCn).slice(0, 160);
    } else if (
      acaoDesc &&
      (estadoDec === "aprovar" ||
        estadoDec === "delegar" ||
        estadoDec === "monitorar")
    ) {
      base.proximaAcao = normalizarTerminologia(acaoDesc).slice(0, 160);
    }

    const respMsg = String(entrada.resposta?.mensagem || "").trim();
    if (promocao) {
      base.ciclo = {
        ...base.ciclo,
        decisao: normalizarTerminologia(promocao.texto).slice(0, 160),
        proximaAcao: base.proximaAcao
      };
    } else if (respMsg) {
      base.ciclo = {
        ...base.ciclo,
        proximaAcao: base.proximaAcao
      };
    }
    base.encerramento = montarCriterioEncerramento(entrada, base);
    if (
      base.encerramento?.actividadeConcluida &&
      base.estadoConversa.emExecucao
    ) {
      base.estadoConversa = {
        ...base.estadoConversa,
        concluidos: uniqCap(
          [
            ...base.estadoConversa.concluidos,
            base.estadoConversa.emExecucao
          ],
          MAX_ITENS
        ),
        emExecucao: base.proximaAcao || null
      };
    }
  }

  definirMemoriaTrabalhoExecutiva(base);
  return clonarMemoria(base);
}

/**
 * Factos oficiais para lastro interno (C1/C2) — não altera classe/Jobs.
 * @param {MemoriaTrabalhoExecutiva|null} memoria
 * @returns {string[]}
 */
export function factosLastroRefinoEic(memoria) {
  if (!memoria || !REFINO_EIC_ATIVO) return [];
  /** @type {string[]} */
  const factos = [];
  const h = memoria.hierarquia || {};
  if (h.objectivoEstrategico) {
    factos.push(
      `Objectivo estratégico: «${h.objectivoEstrategico}»`
    );
  }
  if (h.objectivoAtual) {
    factos.push(`Objectivo actual: «${h.objectivoAtual}»`);
  }
  if (h.entregaCorrente) {
    factos.push(`Entrega corrente: «${h.entregaCorrente}»`);
  }
  if (memoria.proximaAcao) {
    factos.push(`Próxima acção: «${memoria.proximaAcao}»`);
  }
  if (memoria.decisoesTomadas?.length) {
    factos.push(
      `Decisão em vigor: «${memoria.decisoesTomadas[0]}»`
    );
  }
  const posicao = String(memoria.posicaoCeoNaoVigente || "").trim();
  if (posicao) {
    const vigente0 = String(memoria.decisoesTomadas?.[0] || "");
    if (!vigente0 || posicao !== vigente0) {
      factos.push(`Posição do CEO (não vigente): «${posicao}»`);
    }
  }
  if (memoria.pendencias?.length) {
    factos.push(
      `Pendência aberta: «${memoria.pendencias.slice(0, 2).join("; ")}»`
    );
  }
  if (memoria.restricoesAtivas?.length) {
    factos.push(
      `Restrições activas: ${memoria.restricoesAtivas.slice(0, 3).join("; ")}`
    );
  }
  if (memoria.estadoConversa?.emExecucao) {
    factos.push(
      `Em execução: «${memoria.estadoConversa.emExecucao}»`
    );
  }
  if (memoria.estadoConversa?.bloqueio) {
    factos.push(`Bloqueio: ${memoria.estadoConversa.bloqueio}`);
  }
  if (memoria.encerramento?.necessitaNovoDespacho) {
    factos.push("Critério de encerramento: necessita novo despacho");
  }
  if (memoria.analiseTecnica?.diagnostico) {
    factos.push(`Diagnóstico: ${memoria.analiseTecnica.diagnostico}`);
  }
  if (memoria.analiseTecnica?.ajuste) {
    factos.push(`Ajuste: ${memoria.analiseTecnica.ajuste}`);
  }
  if (memoria.ciclo?.objectivo) {
    factos.push(
      `Ciclo executivo: objectivo→contexto→restrições→alternativas→decisão→próxima acção (activo)`
    );
  }
  return factos;
}

/**
 * Bloco textual para o Painel / prompt (interno ao LLM; não UI).
 * @param {MemoriaTrabalhoExecutiva|null} [memoria]
 * @returns {string}
 */
export function formatarMemoriaTrabalhoParaContexto(memoria) {
  const m = memoria || obterMemoriaTrabalhoExecutiva();
  if (!m || !REFINO_EIC_ATIVO) return "";

  const h = m.hierarquia || {};
  const c = m.ciclo || {};
  const e = m.estadoConversa || {};
  const linhas = [
    "──────────────────────────────────────",
    "MEMÓRIA DE TRABALHO EXECUTIVA (estado actual — não histórico)",
    "──────────────────────────────────────",
    `Objectivo estratégico: ${h.objectivoEstrategico || "(não definido)"}`,
    `Objectivo actual: ${h.objectivoAtual || m.objectivoAtivo || "(não definido)"}`,
    `Entrega corrente: ${h.entregaCorrente || "(nenhuma)"}`,
    `Restrições activas: ${
      m.restricoesAtivas?.length
        ? m.restricoesAtivas.map((r) => `- ${r}`).join("\n")
        : "(nenhuma)"
    }`,
    `Decisões tomadas (estado actual): ${
      m.decisoesTomadas?.length
        ? m.decisoesTomadas.map((d) => `- ${d}`).join("\n")
        : "(nenhuma)"
    }`,
    `Posição do CEO (não vigente): ${
      m.posicaoCeoNaoVigente || "(nenhuma)"
    }`,
    `Pendências: ${
      m.pendencias?.length
        ? m.pendencias.map((p) => `- ${p}`).join("\n")
        : "(nenhuma)"
    }`,
    `Próxima acção: ${m.proximaAcao || "(nenhuma)"}`,
    "",
    "Ciclo executivo de raciocínio (interno):",
    `  Objectivo: ${c.objectivo || "(n/d)"}`,
    `  Contexto: ${c.contexto || "(n/d)"}`,
    `  Restrições: ${c.restricoes?.length ? c.restricoes.join("; ") : "(nenhuma)"}`,
    `  Alternativas: ${c.alternativas?.length ? c.alternativas.join("; ") : "(nenhuma)"}`,
    `  Decisão: ${c.decisao || "(pendente)"}`,
    `  Próxima acção: ${c.proximaAcao || m.proximaAcao || "(n/d)"}`,
    "",
    "Estado executivo da conversa:",
    `  Em execução: ${e.emExecucao || "(nada)"}`,
    `  Concluído: ${e.concluidos?.length ? e.concluidos.join("; ") : "(nada)"}`,
    `  Pendente: ${e.pendentes?.length ? e.pendentes.join("; ") : "(nada)"}`,
    `  Bloqueio: ${e.bloqueio || "(nenhum)"}`
  ];

  if (m.analiseTecnica) {
    linhas.push(
      "",
      "Análise técnica (evidência → diagnóstico → ajuste):",
      `  Evidências: ${m.analiseTecnica.evidencias?.join("; ") || "(nenhuma)"}`,
      `  Diagnóstico: ${m.analiseTecnica.diagnostico || "(n/d)"}`,
      `  Ajuste: ${m.analiseTecnica.ajuste || "(n/d)"}`
    );
  }

  if (m.encerramento) {
    linhas.push(
      "",
      "Critério de encerramento:",
      `  Conclusão: ${m.encerramento.conclusao || "(n/d)"}`,
      `  Estado actual: ${m.encerramento.estadoAtual || "(n/d)"}`,
      `  Dependências: ${
        m.encerramento.dependencias?.length
          ? m.encerramento.dependencias.join("; ")
          : "(nenhuma)"
      }`,
      `  Necessita novo despacho: ${
        m.encerramento.necessitaNovoDespacho ? "sim" : "não"
      }`
    );
  }

  return linhas.join("\n");
}

/**
 * Metadado compacto para `dados` (diagnóstico interno; sem alterar mensagem/UI).
 * @param {MemoriaTrabalhoExecutiva|null} memoria
 */
export function metadadoRefinoEicParaDados(memoria) {
  if (!memoria || !REFINO_EIC_ATIVO) return {};
  return {
    refinoEic: {
      objectivoAtivo: memoria.objectivoAtivo,
      hierarquia: memoria.hierarquia,
      restricoesAtivas: memoria.restricoesAtivas,
      decisoesTomadas: Array.isArray(memoria.decisoesTomadas)
        ? memoria.decisoesTomadas.slice(0, 5)
        : [],
      posicaoCeoNaoVigente: memoria.posicaoCeoNaoVigente || null,
      pendencias: memoria.pendencias,
      proximaAcao: memoria.proximaAcao,
      estadoConversa: memoria.estadoConversa,
      cicloActivo: Boolean(memoria.ciclo?.objectivo),
      analiseTecnica: memoria.analiseTecnica
        ? {
            temDiagnostico: Boolean(memoria.analiseTecnica.diagnostico),
            temAjuste: Boolean(memoria.analiseTecnica.ajuste)
          }
        : null,
      encerramento: memoria.encerramento
        ? {
            actividadeConcluida: memoria.encerramento.actividadeConcluida,
            necessitaNovoDespacho: memoria.encerramento.necessitaNovoDespacho
          }
        : null
    }
  };
}

/**
 * @template T
 * @param {T[]} arr
 * @param {number} max
 * @returns {T[]}
 */
function uniqCap(arr, max) {
  /** @type {T[]} */
  const out = [];
  for (const item of arr) {
    if (item == null || item === "") continue;
    if (!out.includes(item)) out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

export {
  REFINO_EIC_ATIVO,
  definirRefinoEicAtivo,
  obterMemoriaTrabalhoExecutiva,
  definirMemoriaTrabalhoExecutiva,
  resetMemoriaTrabalhoExecutiva,
  normalizarCoaIdMte
} from "./refinoEicSessao.js";
