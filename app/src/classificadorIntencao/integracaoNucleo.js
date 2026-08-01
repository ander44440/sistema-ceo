/**
 * Integração Classificador → Núcleo — IMP-057 E4 / REQ-057 / ARQ-018.
 * Classificar primeiro; C3 → Motor obrigatório (anti-«Sugiro»).
 */

import { classificarEEncaminhar } from "./encaminhador.js";
import { ID_POR_CLASSE } from "./dominio.js";
import { VERSAO_CONTRATO } from "../mre/parecer/enums.js";

/**
 * @typedef {object} DepsE4
 * @property {(pedido: object) => Promise<object>|object} [publicarJob]
 * @property {import("../motorExecucao/dominio.js").DecisaoAprovacao|null} [decisaoAprovacao]
 * @property {Function} [conduzirMotor] — injectável (default: executiveEngine.conduzirMotorExecucao)
 * @property {Map<string, string>} [registro]
 */

/**
 * Detecta prosa consultiva «Sugiro…» como resposta final indevida a C3.
 * @param {string} mensagem
 */
export function contemSugiroComoRespostaFinal(mensagem) {
  const t = String(mensagem || "").trim();
  if (!t) return false;
  if (/^sugiro\b/i.test(t)) return true;
  // Fecho só com recomendação consultiva, sem Job/Gate/Motor
  const temExecucao =
    /\b(job-|job\s|motor\s+de\s+execu|aguardando\s+(aprova|gate)|gate\b|dispatcher|pending|handoff|fila)\b/i.test(
      t
    );
  if (!temExecucao && /\bsugiro\b/i.test(t)) return true;
  return false;
}

/**
 * Título curto para Job a partir da instrução.
 * @param {string} texto
 */
export function tituloJobDeInstrucao(texto) {
  const t = String(texto || "").trim().replace(/\s+/g, " ");
  if (!t) return "Trabalho executivo";
  const max = 72;
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Parecer mínimo de despacho para o Motor (não é resposta ao utilizador).
 * Bugs/código → alteraCodigo (Gate G2); implementação genérica sem flags de Gate.
 * @param {string} texto
 * @param {import("./dominio.js").SaidaClassificador} classificacao
 * @param {{ alteraCodigo?: boolean }} [opts]
 */
export function montarParecerTrabalhoExecutivo(texto, classificacao, opts = {}) {
  const instrucao = String(texto || "").trim();
  const alteraCodigo =
    opts.alteraCodigo === true ||
    /\b(bugs?|erros?|c[oó]digo|implementa|corrig|fix|resolv|patch|pr)\b/i.test(
      instrucao
    );
  const id = `parecer-c3-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const titulo = tituloJobDeInstrucao(instrucao);

  return {
    id,
    criadoEm: new Date().toISOString(),
    versaoContrato: VERSAO_CONTRATO,
    coaId: null,
    confianca: classificacao?.confianca ?? 0.8,
    lacunas: [],
    diagnostico: {
      objetivoReal: instrucao.slice(0, 240) || "Trabalho executivo",
      problemaNegocio: "Intenção C3 — transferência ao Motor de Execução",
      natureza: "operacional"
    },
    enquadramento: {
      tipoPedido: "execucao",
      urgencia: "alta",
      escopo: instrucao.slice(0, 200)
    },
    dossier: {
      resumoPainel: "Classificador C3 → Motor",
      factosUsados: [
        `classe=${classificacao?.classe || "trabalho_executivo"}`,
        `razao=${String(classificacao?.razaoCurta || "").slice(0, 120)}`
      ],
      fontes: ["classificador_intencao"]
    },
    principiosAplicados: ["Transferência C3 ao Motor (IMP-057 E4)"],
    analise:
      "Classificação Trabalho Executivo: o Núcleo não fecha com parecer textual; conduz o Motor.",
    riscos: [],
    oportunidades: [],
    decisaoExecutiva: {
      estado: "delegar",
      recomendacao: "Transferir execução ao Motor",
      alternativas: [],
      justificativa:
        "C3 exige handoff ao Motor de Execução; resposta ao utilizador reflecte Job/Gate, não «Sugiro…»."
    },
    acao: {
      tipo: "despachar",
      descricao: instrucao.slice(0, 280) || "Despacho C3",
      job: {
        titulo,
        descricao: instrucao || "Trabalho executivo classificado como C3",
        prioridade: "alta",
        ...(alteraCodigo ? { alteraCodigo: true } : {})
      }
    },
    aprendizado: {
      registrarMemoria: false,
      criarPrecedente: false,
      atualizarPrincipios: false,
      notas: "parecer-ponte C3; não é resposta final"
    },
    metadados: {
      origem: "imp057_e4_c3",
      classe: classificacao?.classe || "trabalho_executivo",
      idClasse: ID_POR_CLASSE.trabalho_executivo
    }
  };
}

/**
 * Prosa operacional a partir do resultado do Motor (nunca «Sugiro…»).
 * @param {object} conducao
 * @param {string} textoInstrucao
 */
export function mensagemInicioExecucao(conducao, textoInstrucao = "") {
  const ref = tituloJobDeInstrucao(textoInstrucao);

  if (!conducao || typeof conducao !== "object") {
    return `Motor de Execução activado para «${ref}», mas sem resultado de condução.`;
  }

  if (conducao.aguardandoGate === true) {
    const gatilhos =
      (conducao.avaliacao &&
        Array.isArray(conducao.avaliacao.gatilhos) &&
        conducao.avaliacao.gatilhos.join(", ")) ||
      "política V1";
    return (
      `Iniciei o Motor de Execução para «${ref}». ` +
      `Aguardando aprovação (Gate do Motor; ${gatilhos}) antes de criar o Job na fila.`
    );
  }

  if (conducao.publicado === true && conducao.job && conducao.job.id) {
    const handoff =
      conducao.fluxoIniciado === true
        ? " Handoff ao Dispatcher iniciado."
        : "";
    return (
      `Execução iniciada. Job ${conducao.job.id} criado em pending.` +
      handoff
    );
  }

  if (conducao.motivo === "publicador_ausente") {
    return (
      `Motor de Execução activado para «${ref}»; ` +
      `ciclo em ${conducao.ciclo?.etapa || "Plano"}. ` +
      `Falta publicador da Fila para criar o Job.`
    );
  }

  if (conducao.motivo === "gate_rejeitado" || conducao.motivo === "gate_adiado") {
    return (
      `Motor de Execução: Gate ${conducao.motivo === "gate_rejeitado" ? "rejeitado" : "adiado"} ` +
      `para «${ref}». Job não criado.`
    );
  }

  if (conducao.motivo === "falha_publicacao") {
    return (
      `Motor de Execução activado, mas a publicação do Job falhou` +
      (conducao.mensagem ? `: ${conducao.mensagem}` : ".")
    );
  }

  return (
    `Motor de Execução activado para «${ref}» ` +
    `(estado: ${conducao.motivo || "em curso"}; ` +
    `etapa ${conducao.ciclo?.etapa || "—"}).`
  );
}

/**
 * Conduz C3 via Motor — proibido fechar só com Parecer textual.
 * @param {string} texto
 * @param {import("./dominio.js").SaidaClassificador} classificacao
 * @param {DepsE4} deps
 */
export async function conduzirTrabalhoExecutivoC3(texto, classificacao, deps = {}) {
  const parecer = montarParecerTrabalhoExecutivo(texto, classificacao);
  const conduzir =
    typeof deps.conduzirMotor === "function"
      ? deps.conduzirMotor
      : null;

  if (!conduzir) {
    throw new Error(
      "conduzirMotor obrigatório para C3 (injectar deps.conduzirMotor ou executiveEngine)."
    );
  }

  /** @type {Record<string, unknown>} */
  const motorDeps = {
    decisaoAprovacao:
      deps.decisaoAprovacao === undefined ? null : deps.decisaoAprovacao,
    registro: deps.registro instanceof Map ? deps.registro : new Map(),
    iniciarFluxo: deps.iniciarFluxo !== false
  };
  if (typeof deps.publicarJob === "function") {
    motorDeps.publicarJob = deps.publicarJob;
  }

  const conducao = await conduzir(parecer, motorDeps);
  let mensagem = mensagemInicioExecucao(conducao, texto);

  if (contemSugiroComoRespostaFinal(mensagem)) {
    mensagem =
      `Iniciei o Motor de Execução para «${tituloJobDeInstrucao(texto)}». ` +
      `Acompanhe Job, Gate ou handoff — não uma recomendação consultiva.`;
  }

  const falhou =
    !conducao ||
    conducao.motivo === "falha_publicacao" ||
    conducao.motivo === "falha_plano";

  return {
    ok: !falhou,
    mensagem,
    modo: falhou ? "motor_execucao_falha" : "motor_execucao",
    capacidade: "motor_execucao",
    dados: {
      classificacao,
      destino: "motor_execucao",
      motorAcionado: true,
      motorFalhou: falhou,
      mreFallback: false,
      motor: conducao,
      parecerPonte: {
        id: parecer.id,
        acaoTipo: parecer.acao?.tipo,
        /** Não é resposta final — só input do Motor */
        respostaFinal: false
      },
      antiSugiro: !contemSugiroComoRespostaFinal(mensagem)
    }
  };
}

/**
 * Classifica e encaminha (primeiro passo do Núcleo).
 * @param {string} texto
 * @param {{ frenteActiva?: boolean }} [contexto]
 */
export function primeiroPassoClassificar(texto, contexto = {}) {
  return classificarEEncaminhar(texto, contexto);
}
