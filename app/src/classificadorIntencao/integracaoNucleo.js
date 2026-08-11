/**
 * Integração Classificador → Núcleo — IMP-057 E4 / REQ-057 / ARQ-018.
 * Classificar primeiro; C3 → Motor obrigatório (anti-«Sugiro»).
 */

import { classificarEEncaminhar } from "./encaminhador.js";
import { ID_POR_CLASSE } from "./dominio.js";
import { VERSAO_CONTRATO } from "../mre/parecer/enums.js";
import { normalizarTexto } from "./lexicon.js";
import {
  ehProibicaoExecucaoExplicita,
  ehAutorizacaoExplicitaCriarJob,
  ehConsultaEstadoOperacional,
  ehPedidoContinuidadeMissao,
  ehPedidoAnaliseOuRecomendacao,
  ehComandoExecucaoExplicito,
  extrairIdsJobMencionados,
  ehReferenciaExplicitaJobId
} from "./regras.js";
import { executarConsultaEstado } from "../executiveEngine/capacidades/consultarEstado.js";

/**
 * @typedef {object} DepsE4
 * @property {(pedido: object) => Promise<object>|object} [publicarJob]
 * @property {import("../motorExecucao/dominio.js").DecisaoAprovacao|null} [decisaoAprovacao]
 * @property {Function} [conduzirMotor] — injectável (default: executiveEngine.conduzirMotorExecucao)
 * @property {(job: object, opts?: object) => unknown} [registarAcompanhamento]
 * @property {Map<string, string>} [registro]
 * @property {(id: string) => Promise<object|null>|object|null} [obterJob]
 */

/**
 * Continuidade por JOB-ID: nunca publicar Job wrapper quando o texto cita JOB-NNNNNN.
 * @param {string} texto
 * @param {import("./dominio.js").SaidaClassificador} classificacao
 * @param {DepsE4} deps
 */
async function responderContinuidadeJobIdExplicito(texto, classificacao, deps = {}) {
  if (!ehReferenciaExplicitaJobId(texto)) return null;
  const ids = extrairIdsJobMencionados(texto);

  let obter = typeof deps.obterJob === "function" ? deps.obterJob : null;
  if (!obter) {
    try {
      const { obterJobFila } = await import("../executiveEngine/filaCliente.js");
      obter = obterJobFila;
    } catch {
      obter = null;
    }
  }

  /** @type {object[]} */
  const encontrados = [];
  if (obter) {
    for (const id of ids) {
      try {
        const j = await obter(id);
        if (j && typeof j === "object" && j.id) encontrados.push(j);
      } catch {
        /* Job ausente */
      }
    }
  }

  const primario = encontrados[0] || null;
  const estado = primario
    ? String(primario.estado || primario.status || "desconhecido")
    : null;
  const idsTxt = ids.join(", ");
  const mensagem = primario
    ? `Referência a ${primario.id} (estado: ${estado}). ` +
      `Operação sobre o Job existente — não criei Job novo.`
    : `Referência a ${idsTxt} sem Job correspondente na fila. ` +
      `Não criei Job wrapper. Indique um Job existente ou peça criar um Job novo sem citar um JOB-ID.`;

  return {
    ok: true,
    mensagem,
    modo: "continuidade_job_id",
    capacidade: "motor_execucao",
    dados: {
      classificacao,
      destino: "continuidade_job_id",
      motorAcionado: false,
      motorFalhou: false,
      mreFallback: false,
      motor: {
        publicado: false,
        aguardandoGate: false,
        motivo: "continuidade_job_existente"
      },
      parecerPonte: null,
      antiSugiro: true,
      continuidadeJobId: true,
      jobReferenciado: primario
        ? {
            id: primario.id,
            estado,
            titulo: primario.titulo || null,
            projeto: primario.projeto ?? null
          }
        : null,
      idsJobMencionados: ids,
      jobsEncontrados: encontrados.map((j) => ({
        id: j.id,
        estado: j.estado || j.status || null
      }))
    }
  };
}

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
 * Remove cabeçalhos de controlo das caixas de comando (só no início do texto).
 * Não remove menções incidentais a «DESTINATÁRIO» / «TIPO DE AÇÃO» no meio da tarefa.
 * @param {string} s
 * @returns {string}
 */
function removerEnvelopeComandoCaixa(s) {
  let t = String(s || "").trim();
  if (!t) return "";
  // Linhas de cabeçalho no início (podem repetir-se / ter linhas em branco entre elas)
  for (;;) {
    const next = t
      .replace(
        /^(?:DESTINAT[AÁ]RIO|TIPO\s+DE\s+A[CÇ][AÃ]O)\s*:[^\n]*(?:\n|$)/i,
        ""
      )
      .replace(/^\s+/, "");
    if (next === t) break;
    t = next;
  }
  return t.trim();
}

/**
 * Se existir secção «Objetivo:» / «Objectivo:» em linha própria, preferir o corpo
 * dessa secção como tarefa real (após remoção do envelope de caixa).
 * @param {string} s
 * @returns {string}
 */
function preferirSecaoObjectivoOperacional(s) {
  const t = String(s || "");
  const m = t.match(/(?:^|\n)\s*Objet(?:ivo|ctivo)\s*:\s*/i);
  if (!m || m.index == null) return t.trim();
  const corpo = t.slice(m.index + m[0].length).trim();
  return corpo.length >= 8 ? corpo : t.trim();
}

/**
 * Extrai a tarefa real a gravar no Job (título/descrição/objectivo).
 * Remove envelope meta («crie o Job necessário para…»), adiamentos
 * operacionais («não execute ainda…») e cabeçalhos de caixa
 * («DESTINATÁRIO:…», «TIPO DE AÇÃO:…») — estes não são tarefa do Agent.
 * Não altera Correção 1 (continuidade por JOB-ID).
 * @param {string} texto
 * @returns {string}
 */
export function extrairObjectivoRealParaJob(texto) {
  let s = String(texto || "").trim();
  if (!s) return "";

  // Correção 6 — envelope de caixa (DESTINATÁRIO / TIPO DE AÇÃO) antes da tarefa
  s = removerEnvelopeComandoCaixa(s);
  s = preferirSecaoObjectivoOperacional(s);

  // Adiamento operacional — não faz parte da tarefa do Agent
  // (PT: «acção» / BR: «ação»; «próxima»)
  s = s.replace(
    /\bn[aã]o\s+execute\s+ainda(?:\s+a\s+pr[oó]xima\s+a(?:cç|ç|c)[aã]o)?[.!…]?\s*/gi,
    " "
  );
  s = s.replace(
    /\bsem\s+executar\s+(?:ainda\s+)?(?:a\s+)?(?:pr[oó]xima\s+)?(?:a(?:cç|ç|c)[aã]o|passo)?[.!…]?\s*/gi,
    " "
  );

  // Envelope meta: criar/publicar/despachar Job → tarefa embutida
  const envelopes = [
    /^(?:crie|cria|criar|publique|publicar|despache|despachar)\s+(?:o\s+|um\s+|novo\s+)?jobs?\s+necess[aá]rio\s+(?:para|a)\s+/i,
    /^(?:crie|cria|criar|publique|publicar|despache|despachar)\s+(?:o\s+|um\s+|novo\s+)?jobs?\s+(?:para|a)\s+/i,
    /^(?:crie|cria|criar)\s+(?:o\s+)?jobs?\s+que\s+(?:seja\s+)?necess[aá]rio\s+(?:para|a)\s+/i
  ];
  for (const re of envelopes) {
    if (re.test(s)) {
      s = s.replace(re, "");
      break;
    }
  }

  s = s.replace(/\s+/g, " ").replace(/^[,;:\-–—\s]+/, "").trim();
  // Capitalizar se ficou minúsculo após unwrap
  if (s && /^[a-zà-ú]/.test(s)) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s || String(texto || "").trim();
}

/**
 * Título curto para Job a partir da instrução (tarefa real, não envelope meta).
 * @param {string} texto
 */
export function tituloJobDeInstrucao(texto) {
  const t = extrairObjectivoRealParaJob(texto).replace(/\s+/g, " ");
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
 * @param {{ alteraCodigo?: boolean, coaId?: string|null, projeto?: string|null, projetoNome?: string|null }} [opts]
 */
export function montarParecerTrabalhoExecutivo(texto, classificacao, opts = {}) {
  const instrucaoBruta = String(texto || "").trim();
  const objectivo = extrairObjectivoRealParaJob(instrucaoBruta);
  const alteraCodigo =
    opts.alteraCodigo === true ||
    /\b(bugs?|erros?|c[oó]digo|implementa|corrig|fix|resolv|patch)\b/i.test(
      objectivo
    );
  const id = `parecer-c3-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const titulo = tituloJobDeInstrucao(objectivo || instrucaoBruta);
  const coaId =
    opts.coaId != null && String(opts.coaId).trim()
      ? String(opts.coaId).trim()
      : null;
  const projeto =
    opts.projeto != null && String(opts.projeto).trim()
      ? String(opts.projeto).trim()
      : coaId;
  const projetoNome =
    opts.projetoNome != null && String(opts.projetoNome).trim()
      ? String(opts.projetoNome).trim()
      : projeto && !/^prj-/i.test(projeto) && !/^coa-/i.test(projeto)
        ? projeto
        : null;

  return {
    id,
    criadoEm: new Date().toISOString(),
    versaoContrato: VERSAO_CONTRATO,
    coaId,
    projeto: projeto || coaId,
    ...(projetoNome ? { projetoNome } : {}),
    confianca: classificacao?.confianca ?? 0.8,
    lacunas: [],
    diagnostico: {
      objetivoReal: objectivo.slice(0, 240) || "Trabalho executivo",
      problemaNegocio: "Intenção C3 — transferência ao Motor de Execução",
      natureza: "operacional"
    },
    enquadramento: {
      tipoPedido: "execucao",
      urgencia: "alta",
      escopo: objectivo.slice(0, 200)
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
      descricao: objectivo.slice(0, 280) || "Despacho C3",
      job: {
        titulo,
        descricao: objectivo || "Trabalho executivo classificado como C3",
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
 * CTO-002: sem exposição de motivos internos (payload_proibido, etapa Plano).
 * @param {object} conducao
 * @param {string} textoInstrucao
 */
export function mensagemInicioExecucao(conducao, textoInstrucao = "") {
  const ref = tituloJobDeInstrucao(textoInstrucao);

  if (!conducao || typeof conducao !== "object") {
    return `Não consegui concluir o despacho de «${ref}». Reenvie a ordem.`;
  }

  if (conducao.aguardandoGate === true) {
    return (
      `Despacho de «${ref}» preparado. ` +
      `Aguardando aprovação antes de criar o Job na fila.`
    );
  }

  if (conducao.publicado === true && conducao.job && conducao.job.id) {
    const estadoJob = conducao.job.estado || conducao.handoff?.estadoJob || "pending";
    const handoff =
      conducao.fluxoIniciado === true
        ? " Handoff ao Dispatcher iniciado (dispatched — não concluído)."
        : "";
    return (
      `Job ${conducao.job.id} criado (${estadoJob}).` +
      handoff +
      ` Acompanhe o ciclo até verificação — handoff ≠ conclusão.`
    );
  }

  if (conducao.motivo === "publicador_ausente") {
    return (
      `Despacho de «${ref}» bloqueado: falta o publicador da fila. ` +
      `Corrigir a configuração e reenviar.`
    );
  }

  if (conducao.motivo === "gate_rejeitado" || conducao.motivo === "gate_adiado") {
    return (
      `Despacho de «${ref}» não avançou (aprovação ${
        conducao.motivo === "gate_rejeitado" ? "rejeitada" : "adiada"
      }). Job não criado.`
    );
  }

  if (conducao.motivo === "falha_publicacao") {
    return (
      `Despacho falhou ao publicar o Job` +
      (conducao.mensagem ? `: ${conducao.mensagem}` : ".")
    );
  }

  // CTO-002: payload_proibido e afins — prosa operacional, sem jargão
  if (conducao.motivo === "payload_proibido") {
    return (
      `Não despachei «${ref}»: o conteúdo não passou na validação de segurança. ` +
      `Reformule a instrução e reenvie.`
    );
  }

  return `Despacho de «${ref}» em curso.`;
}

/**
 * Conduz C3 via Motor — proibido fechar só com Parecer textual.
 * @param {string} texto
 * @param {import("./dominio.js").SaidaClassificador} classificacao
 * @param {DepsE4} deps
 */
export async function conduzirTrabalhoExecutivoC3(texto, classificacao, deps = {}) {
  // Continuidade por JOB-ID — precedência sobre criação C3 / wrapper
  const continuidadeId = await responderContinuidadeJobIdExplicito(
    texto,
    classificacao,
    deps
  );
  if (continuidadeId) return continuidadeId;

  // P0 — defesa em profundidade: nunca criar Job se a mensagem proíbe execução
  // ou é só consulta/análise (mesmo que tenha sido mal classificada como C3).
  const t = normalizarTexto(texto);
  const continuidadeMissao =
    Boolean(deps.operacaoAberta) && ehPedidoContinuidadeMissao(t);
  const autorizaCriarJob = ehAutorizacaoExplicitaCriarJob(t);
  if (
    (!autorizaCriarJob && ehProibicaoExecucaoExplicita(t)) ||
    (!autorizaCriarJob &&
      ehConsultaEstadoOperacional(t) &&
      !continuidadeMissao) ||
    (ehPedidoAnaliseOuRecomendacao(t) &&
      !ehComandoExecucaoExplicito(t) &&
      !autorizaCriarJob)
  ) {
    // P0-3: consulta de estado deve produzir resposta real (não só o bloqueio).
    if (ehConsultaEstadoOperacional(t) && !continuidadeMissao) {
      const consulta = await executarConsultaEstado(texto, {
        obterJob: deps.obterJob,
        listarJobs: deps.listarJobs || deps.listarPorEstado,
        storeContinuidade: deps.storeContinuidade
      });
      return {
        ok: true,
        mensagem: consulta.mensagem,
        modo: consulta.modo || "consulta_estado",
        capacidade: "memoria",
        dados: {
          classificacao,
          destino: "capacidade_operacional",
          motorAcionado: false,
          motorFalhou: false,
          mreFallback: false,
          motor: {
            publicado: false,
            aguardandoGate: false,
            motivo: "p0_bloqueio_nao_execucao"
          },
          parecerPonte: null,
          antiSugiro: true,
          bloqueioP0: true,
          consultaSemMutacao: true,
          ...(consulta.dados && typeof consulta.dados === "object"
            ? consulta.dados
            : {})
        }
      };
    }

    return {
      ok: true,
      mensagem:
        "Pedido interpretado como consulta/análise — sem criar Job nem iniciar execução.",
      modo: "consulta_sem_execucao",
      capacidade: "motor_execucao",
      dados: {
        classificacao,
        destino: "nucleo_mre",
        motorAcionado: false,
        motorFalhou: false,
        mreFallback: false,
        motor: { publicado: false, aguardandoGate: false, motivo: "p0_bloqueio_nao_execucao" },
        parecerPonte: null,
        antiSugiro: true,
        bloqueioP0: true
      }
    };
  }

  // Correção 4 — nova missão em projecto nomeado: criar/seleccionar ANTES do Job.
  // Sobrescreve deps.coaId/projeto stale do caller (ex.: COA anterior capturado no EE).
  // Correção 5 — falha de persistência do catálogo NÃO é engolida; C3 não cria Job.
  let garantiaMissao = {
    aplicado: false,
    criado: false,
    nome: null,
    projeto: null
  };
  try {
    const { garantirProjetoParaNovaMissao } = await import(
      "../executiveEngine/garantirProjetoNovaMissao.js"
    );
    garantiaMissao = garantirProjetoParaNovaMissao(texto, {
      criarProjeto: deps.criarProjeto,
      listarProjetos: deps.listarProjetos,
      obterProjetoAtivo: deps.obterProjetoAtivo
    });
  } catch (err) {
    const detalhe =
      err && typeof err === "object" && "message" in err
        ? String(/** @type {{ message?: string }} */ (err).message || err)
        : String(err || "erro desconhecido");
    const ehPersistencia =
      (err &&
        typeof err === "object" &&
        /** @type {{ name?: string }} */ (err).name ===
          "ErroPersistenciaCatalogo") ||
      /persist/i.test(detalhe) ||
      /storage oficial|localStorage|read-after-write/i.test(detalhe);
    return {
      ok: false,
      mensagem: ehPersistencia
        ? `Não criei o Job: falha ao persistir o projeto da nova missão no catálogo oficial. ${detalhe}`
        : `Não criei o Job: falha ao preparar o projeto da nova missão. ${detalhe}`,
      modo: "falha_persistencia_projeto",
      capacidade: "motor_execucao",
      dados: {
        classificacao,
        destino: "motor_execucao",
        motorAcionado: false,
        motorFalhou: true,
        mreFallback: false,
        motor: {
          publicado: false,
          aguardandoGate: false,
          motivo: "falha_persistencia_projeto"
        },
        parecerPonte: null,
        antiSugiro: true,
        erroPersistenciaProjeto: true,
        detalhe
      }
    };
  }

  let coaActivo = null;
  try {
    if (garantiaMissao.aplicado && garantiaMissao.projeto) {
      coaActivo = {
        id: garantiaMissao.projeto.id,
        nome: garantiaMissao.projeto.nome,
        status: garantiaMissao.projeto.estado || "ativo",
        desde:
          garantiaMissao.projeto.criadoEm ||
          garantiaMissao.projeto.ultimaAtividadeEm
      };
    } else if (typeof deps.obterCoaAtivo === "function") {
      coaActivo = deps.obterCoaAtivo();
    } else {
      const { obterCoaAtivo } = await import("../executiveEngine/coaSessao.js");
      coaActivo = obterCoaAtivo();
    }
  } catch {
    coaActivo = null;
  }
  const coaId = garantiaMissao.aplicado
    ? (coaActivo && coaActivo.id) || null
    : (deps.coaId != null && String(deps.coaId).trim()) ||
      (coaActivo && coaActivo.id) ||
      null;
  const projetoCoa = garantiaMissao.aplicado
    ? (coaActivo && coaActivo.id) || coaId || null
    : (deps.projeto != null && String(deps.projeto).trim()) ||
      (coaActivo && (coaActivo.id || coaActivo.nome)) ||
      coaId ||
      null;

  // Correção 8 — nome humano estável no parecer/Job (sobrevive a ID órfão no catálogo).
  const projetoNome =
    (garantiaMissao.aplicado &&
      garantiaMissao.projeto &&
      String(garantiaMissao.projeto.nome || "").trim()) ||
    (coaActivo && String(coaActivo.nome || "").trim()) ||
    (deps.projetoNome != null && String(deps.projetoNome).trim()) ||
    (projetoCoa &&
    !/^prj-/i.test(String(projetoCoa)) &&
    !/^coa-/i.test(String(projetoCoa))
      ? String(projetoCoa).trim()
      : null) ||
    null;

  const parecer = montarParecerTrabalhoExecutivo(texto, classificacao, {
    coaId,
    projeto: projetoCoa,
    projetoNome: projetoNome || null
  });
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
    iniciarFluxo: deps.iniciarFluxo !== false,
    projeto: projetoCoa,
    projetoNome: projetoNome || null
  };
  if (typeof deps.publicarJob === "function") {
    motorDeps.publicarJob = deps.publicarJob;
  }

  const conducao = await conduzir(parecer, motorDeps);
  let mensagem = mensagemInicioExecucao(conducao, texto);

  if (
    typeof deps.registarAcompanhamento === "function" &&
    conducao &&
    conducao.job &&
    typeof conducao.job.id === "string"
  ) {
    try {
      deps.registarAcompanhamento(conducao.job, {
        cicloId: conducao.ciclo?.id || null,
        ciclo: conducao.ciclo || null
      });
    } catch {
      /* acompanhamento não bloqueia despacho */
    }
  }

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
      antiSugiro: !contemSugiroComoRespostaFinal(mensagem),
      ...(garantiaMissao.aplicado
        ? {
            projetoNovaMissao: {
              nome: garantiaMissao.nome,
              criado: garantiaMissao.criado,
              id: garantiaMissao.projeto?.id || coaId
            }
          }
        : {})
    }
  };
}

/**
 * Classifica e encaminha (primeiro passo do Núcleo).
 * @param {string} texto
 * @param {import("./regras.js").ContextoClassificacao} [contexto]
 */
export function primeiroPassoClassificar(texto, contexto = {}) {
  return classificarEEncaminhar(texto, contexto);
}
