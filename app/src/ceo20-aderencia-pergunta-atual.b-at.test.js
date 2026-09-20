/**
 * CEO 2.0 — Baseline de aderência à pergunta actual (B-AT-01…10).
 * FRENTE 4: só testes; não altera produção.
 *
 * Capacidade: o pedido da mensagem actual manda; Job/histórico/recuperação/
 * plano/antecipação não substituem o pedido (excepto Gate documentado em B-AT-04).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, afterEach, before, beforeEach, describe, test } from "node:test";
import { executiveEngine } from "./executiveEngine/index.js";
import {
  cnPodeAlterarDestino,
  resolverPrecedenciaTurno,
  anexarPrecedenciaNaResposta
} from "./executiveEngine/resolucaoPrecedenciaTurno.js";
import { abrirCoaParaTeste } from "./executiveEngine/garantirCoaCatalogoTeste.js";
import { limparCoaAtivo } from "./executiveEngine/coaSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "./autoridadeDelegada/autoridadeDelegada.js";
import { criarPublicadorFilaMemoria } from "./motorExecucao/ponteParecerJob.js";
import { criarStoreContextoGate } from "./continuidadeGate/contexto.js";
import {
  decidirInterceptacaoContinuidade,
  resetStoreContinuidadePadrao
} from "./continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./classificadorIntencao/objectivoSessao.js";
import { historicoDeliberativoParaDestino } from "./classificadorIntencao/fioConversacional.js";
import { validarContextoAtivo } from "./classificadorIntencao/validadorContextoAtivo.js";
import { ehMudancaContextoComObjectoExplicito } from "./classificadorIntencao/preservarMissao.js";
import {
  ehAnaliseSomente,
  detectarPedidoAnaliseDeliberativa,
  montarProsaAnaliseDeliberativa
} from "./mre/politicaAnaliseDeliberativa.js";
import { naturalizarRespostaNucleo } from "./conversacaoNatural/index.js";
import {
  devePreservarRespostaNucleo,
  deveAnexarContextoExecutivo
} from "./conversacaoNatural/prioridadeIntencao.js";
import {
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader,
  processarTurnoLfc
} from "./lastroFactualCaso/index.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "./trilhaAuditavel/emissor.js";
import { appendEvento, caminhoStoreAudit } from "./trilhaAuditavel/index.js";
import { criarFilaExecucao } from "../server/executionQueue.js";

const COA_BAT = "prj-ceo20-bat-aderencia";
const NOME_BAT = "CEO2.0 B-AT Aderência";

const JOB_104 = {
  id: "JOB-000104",
  estado: "failed",
  titulo: "Execute a melhoria aprovada.",
  falha: { podeRetentar: true },
  resultado: { resumo: "falhou" },
  concluidoEm: "2026-08-11T19:09:29.265Z",
  criadoEm: "2026-08-11T19:08:18.100Z"
};

const HIST_DELIBERATIVO = [
  {
    papel: "usuario",
    texto: "Estamos a deliberar outdoor vs pagamento e o JOB-000104 falhou."
  },
  {
    papel: "ceo",
    texto:
      "Sugiro retentar o JOB-000104 e antecipo pendência aberta no outdoor. Mantemos o objectivo: fechar mídia."
  },
  {
    papel: "usuario",
    texto: "Analise as opções A B C para o outdoor."
  },
  {
    papel: "ceo",
    texto:
      "Parecer deliberativo A/B/C. Próximo passo: aprovar Outdoor Premium. Em recuperação JOB-000104."
  }
];

const RE_CONTAMINACAO =
  /JOB-000104|em recuperação|Antecipo pendência|Mantemos o (objectivo|foco)|Objectivo principal:|Sugiro retentar|Plano executivo:/i;

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

function depsJobs104(extra = {}) {
  return {
    missaoActiva: { id: COA_BAT, nome: NOME_BAT },
    listarJobsEmAcompanhamento: async () => [],
    listarJobs: async () => [JOB_104],
    listarPorEstado: async (est) => {
      if (!est || est === "failed") return [JOB_104];
      return [];
    },
    obterJob: async (id) => (String(id) === "JOB-000104" ? JOB_104 : null),
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => [],
      F3: async () => [],
      F4: async () => null,
      F5: async () => null,
      F6: async () => null,
      F7: async () => null,
      F8: async () => null
    },
    ...extra
  };
}

function assertSemContaminacaoAgendaAnterior(mensagem) {
  assert.doesNotMatch(String(mensagem || ""), RE_CONTAMINACAO);
}

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let lfcStore;
/** @type {ReturnType<typeof criarLfcWriter>} */
let lfcWriter;
/** @type {ReturnType<typeof criarLfcReader>} */
let lfcReader;
/** @type {typeof fetch | undefined} */
let fetchPrev;
let llmCalls = 0;
/** @type {string} */
let llmMockTexto = "MRE_MOCK_DELIBERATIVO";

before(() => {
  globalThis.localStorage = criarStorage();
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ceo20-bat-"));
  configurarAdaptadorTrilhaLocal((e) =>
    appendEvento(caminhoStoreAudit(tmpRoot), e)
  );
  lfcStore = criarLfcStore(path.join(tmpRoot, "executive", "lastro-factual-casos"));
  lfcWriter = criarLfcWriter(lfcStore, { superficie: "ceo20-bat" });
  lfcReader = criarLfcReader(lfcStore);
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("deliberar")) {
      llmCalls += 1;
      return new Response(
        JSON.stringify({
          ok: true,
          texto: llmMockTexto,
          mensagem: llmMockTexto,
          dados: { mreInvocado: true, veredictoCaminho: "deliberar" }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (typeof fetchPrev === "function") {
      if (u.startsWith("/")) return fetchPrev("http://127.0.0.1:5173" + u, init);
      return fetchPrev(url, init);
    }
    return new Response("{}", { status: 404 });
  };
});

after(() => {
  globalThis.fetch = fetchPrev;
  resetAdaptadorTrilhaParaTestes();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch {
    /* no-op */
  }
});

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes?.();
  limparCoaAtivo();
  abrirCoaParaTeste(COA_BAT, NOME_BAT);
  llmCalls = 0;
  llmMockTexto = "MRE_MOCK_DELIBERATIVO";
  detectarPedidoAnaliseDeliberativa("");
});

afterEach(() => {
  detectarPedidoAnaliseDeliberativa("");
});

// ─── B-AT-01 ───────────────────────────────────────────────────────────────

test("B-AT-01: pergunta factual nova com Job falhado no histórico → responde ao pedido, sem recuperação", async () => {
  const reg = await processarTurnoLfc(
    "CEO, registre estes fatos da Kappa: Kappa tem 27 funcionários.",
    { coaId: COA_BAT, writer: lfcWriter, reader: lfcReader }
  );
  assert.equal(reg.activo, true);

  const pub = criarPublicadorFilaMemoria();
  // Pedido factual actual (recuperação LFC); histórico deliberativo/Job não deve contaminar.
  const pergunta =
    "Liste os fatos registrados sobre Kappa. Responda somente com os fatos.";
  const out = await executiveEngine.executar(
    { texto: pergunta, historico: HIST_DELIBERATIVO, coaId: COA_BAT },
    {
      ...depsJobs104({
        publicarJob: pub.publicarJob.bind(pub),
        lfcWriter,
        lfcReader
      })
    }
  );

  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /27|funcion[aá]rios?/i);
  assert.match(String(out.mensagem), /Kappa/i);
  assert.doesNotMatch(String(out.mensagem), /JOB-000104|em recuperação/i);
  assert.doesNotMatch(String(out.mensagem), /outdoor|Outdoor Premium/i);
  assert.notEqual(out.modo, "continuidade_gate");
  assert.notEqual(out.dados?.encaminhamento?.destino, "continuidade_gate");
});

// ─── B-AT-02 ───────────────────────────────────────────────────────────────

test("B-AT-02: «Responda somente: 27» + histórico deliberativo → prosa literal, sem plano/antecipação", async () => {
  const instrucao = "Responda somente: 27";
  const histDelib = [
    {
      papel: "usuario",
      texto: "Deliberar outdoor vs pagamento e opções A B C."
    },
    {
      papel: "ceo",
      texto:
        "Sugiro Outdoor Premium. Mantemos o objectivo: fechar mídia. Antecipo pendência aberta no outdoor."
    }
  ];

  const nat = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: "27",
      intencao: { id: "pergunta_aberta", capacidade: "ia" },
      capacidade: "ia",
      modo: "resposta_restrita",
      dados: { rota: "resposta_restrita" }
    },
    {
      instrucao,
      historico: histDelib,
      canalSpeaker: "chat",
      lastroConsciencia: {
        temContextoRelevante: true,
        estadoOperacional: {
          operacaoAberta: true,
          recuperacao: true,
          jobs: [JOB_104]
        },
        contagens: {
          jobsPendentes: 0,
          jobsEmExecucao: 0,
          gatesPendentes: 0,
          jobsFalhado: 1
        }
      }
    }
  );

  assert.match(String(nat.mensagem).trim(), /^27\b/);
  assert.doesNotMatch(
    String(nat.mensagem),
    /Antecipo pendência|Mantemos o objectivo|Outdoor Premium|Plano executivo:|JOB-000104|em recuperação/i
  );
  assert.equal(
    devePreservarRespostaNucleo({
      instrucao,
      modo: "resposta_restrita",
      dados: { rota: "resposta_restrita" }
    }),
    true
  );

  llmMockTexto = "27";
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: instrucao, historico: histDelib, coaId: COA_BAT },
    {
      publicarJob: pub.publicarJob.bind(pub),
      listarJobs: async () => [],
      listarPorEstado: async () => [],
      obterJob: async () => null,
      listarJobsEmAcompanhamento: async () => [],
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null,
        F8: async () => null
      }
    }
  );
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /27/);
  assert.doesNotMatch(
    String(out.mensagem),
    /Antecipo pendência|Mantemos o objectivo|Plano executivo:|Outdoor Premium|opções A B C|em recuperação/i
  );
});

// ─── B-AT-03 ───────────────────────────────────────────────────────────────

test("B-AT-03: sem Gate pendente + «Aprovado.» → não entra continuidade_gate", async () => {
  const store = criarStoreContextoGate();
  assert.equal(store.temGatePendente(), false);
  assert.equal(decidirInterceptacaoContinuidade("Aprovado.", store), "classificador");

  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: "Aprovado.", historico: [], coaId: COA_BAT },
    {
      storeContinuidade: store,
      publicarJob: pub.publicarJob.bind(pub)
    }
  );

  assert.notEqual(out.modo, "continuidade_gate");
  assert.notEqual(out.dados?.encaminhamento?.destino, "continuidade_gate");
  assert.notEqual(out.dados?.continuidade, true);
  assert.notEqual(out.dados?.classificadorSaltado, true);
});

// ─── B-AT-04 (excepção Gate documentada) ───────────────────────────────────

test("B-AT-04: Gate pendente + «Aprovado.» → continuidade do Gate (excepção documentada)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();

  const r1 = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(r1.dados?.motor?.aguardandoGate, true);
  assert.equal(store.temGatePendente(), true);
  assert.equal(decidirInterceptacaoContinuidade("Aprovado.", store), "continuidade");

  const r2 = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  assert.equal(r2.dados?.continuidade, true);
  assert.equal(r2.dados?.classificadorSaltado, true);
  assert.equal(r2.dados?.decisao, "aprovado");
  assert.ok(
    r2.modo === "continuidade_gate" ||
      r2.dados?.encaminhamento?.destino === "continuidade_gate" ||
      r2.dados?.continuidade === true
  );
});

// ─── B-AT-05 ───────────────────────────────────────────────────────────────

test("B-AT-05: Gate pendente + pergunta nova clara → não consome Gate; responde ao pedido", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();

  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(store.temGatePendente(), true);

  // Pedido actual explícito de COA/sessão (DIC) — não é decisão de Gate.
  const pergunta =
    "Confirme o COA / projeto activo neste momento. Responda somente com o nome e o identificador (id).";
  assert.equal(decidirInterceptacaoContinuidade(pergunta, store), "classificador");

  const jobsAntes = fila.jobs.length;
  const out = await executiveEngine.executar(
    { texto: pergunta, historico: [], coaId: COA_BAT },
    {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro,
      lfcWriter,
      lfcReader
    }
  );

  assert.equal(store.temGatePendente(), true, "Gate permanece pendente");
  assert.notEqual(out.dados?.continuidade, true);
  assert.notEqual(out.dados?.classificadorSaltado, true);
  assert.equal(fila.jobs.length, jobsAntes, "não publica Job por aprovação implícita");
  assert.match(String(out.mensagem), new RegExp(COA_BAT));
  assert.match(
    String(out.mensagem),
    new RegExp(NOME_BAT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
  assert.doesNotMatch(String(out.mensagem), /JOB-000104|em recuperação/i);
  assert.doesNotMatch(String(out.mensagem), /Aprovado\.|bugs/i);
});

// ─── B-AT-06 ───────────────────────────────────────────────────────────────

test("B-AT-06: novo_contexto + objecto explícito → fio da missão anterior não segue", () => {
  const T2 =
    "Mude o contexto: esqueça a campanha. Agora o assunto é exclusivamente o fornecedor de logística NorteAzul e o prazo de entrega.";

  const vca = validarContextoAtivo({
    mensagem: T2,
    topicoActivo: { titulo: "campanha outdoor", ancora: "outdoor" },
    historicoRecente: HIST_DELIBERATIVO
  });
  assert.equal(vca.veredicto, "novo_contexto");
  assert.equal(vca.autorizaLastroCsc, false);
  assert.equal(
    ehMudancaContextoComObjectoExplicito(T2, { veredicto: "novo_contexto" }),
    true
  );

  const fio = historicoDeliberativoParaDestino({
    autorizaLastroCsc: false,
    historicoDeliberativo: HIST_DELIBERATIVO,
    veredictoVca: "novo_contexto"
  });
  assert.equal(fio.length, 0);
  assert.ok(!fio.some((m) => /outdoor|JOB-000104/i.test(String(m.texto || ""))));
});

// ─── B-AT-07 ───────────────────────────────────────────────────────────────

test("B-AT-07: PD explícito com Job em recuperação no lastro → deliberação do PD, sem ACK de recuperação", async () => {
  const pub = criarPublicadorFilaMemoria();
  let publicacoes = 0;
  const texto = "Decida entre A e B.";

  const nat = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: "Parecer deliberativo A/B — escolha fundamentada.",
      intencao: { id: "deliberar_objetivo" },
      capacidade: "ia",
      dados: {}
    },
    {
      instrucao: texto,
      historico: HIST_DELIBERATIVO,
      canalSpeaker: "chat",
      pedidoDecisaoExplicita: true,
      lastroConsciencia: {
        temContextoRelevante: true,
        estadoOperacional: {
          operacaoAberta: true,
          recuperacao: true,
          jobs: [JOB_104]
        },
        contagens: {
          jobsPendentes: 0,
          jobsEmExecucao: 0,
          gatesPendentes: 0,
          jobsFalhado: 1
        }
      }
    }
  );
  assert.doesNotMatch(String(nat.mensagem), /JOB-000104|em recuperação/i);

  const out = await executiveEngine.executar(
    { texto, historico: HIST_DELIBERATIVO, coaId: COA_BAT },
    {
      ...depsJobs104({
        publicarJob: async () => {
          publicacoes += 1;
          return { id: "JOB-NOVO" };
        }
      })
    }
  );

  assert.equal(publicacoes, 0);
  assert.equal(pub.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.doesNotMatch(String(out.mensagem), /JOB-000104|em recuperação/i);
  // Destino deliberativo (C2) ou equivalente — não recuperação operacional
  const dest = out.dados?.encaminhamento?.destino || out.modo;
  assert.ok(
    dest === "nucleo_mre" ||
      dest === "porta_canonica" ||
      out.capacidade === "ia" ||
      /deliber|parecer|A|B/i.test(String(out.mensagem)),
    `destino/prosa deliberativa esperada, obtido: ${dest}`
  );
});

// ─── B-AT-08 ───────────────────────────────────────────────────────────────

test("B-AT-08: análise-only com Jobs abertos → análise sem recomendação/execução automática", async () => {
  const pedido =
    "Analise só a situação do outdoor vs pagamento. Quero apenas a análise — sem recomendação e sem dizer o que aprovar.";
  assert.equal(ehAnaliseSomente(pedido), true);
  detectarPedidoAnaliseDeliberativa(pedido);
  const prosa = montarProsaAnaliseDeliberativa({
    analise: "Outdoor depende de orçamento; pagamento tem dependência de LOD.",
    principiosAplicados: [],
    decisaoExecutiva: {
      estado: "monitorar",
      recomendacao: "Aprovar Outdoor Premium agora",
      justificativa: "Urgência comercial"
    },
    lacunas: ["Orçamento Q3"]
  });
  assert.match(prosa, /Outdoor|pagamento|Lacunas/i);
  assert.doesNotMatch(prosa, /Recomendação:/i);
  assert.doesNotMatch(prosa, /Aprovar Outdoor Premium/i);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo20-bat-fila-"));
  const filaFs = criarFilaExecucao(root);
  const j = filaFs.publicar({ titulo: "Job aberto análise", descricao: "x" });
  const pub = criarPublicadorFilaMemoria();
  llmMockTexto =
    "Análise: outdoor e pagamento competem por capacidade. Lacuna: orçamento Q3.";

  try {
    const out = await executiveEngine.executar(
      { texto: pedido, historico: HIST_DELIBERATIVO, coaId: COA_BAT },
      {
        ...depsJobs104({
          publicarJob: pub.publicarJob.bind(pub),
          listarJobs: async () => [j, JOB_104],
          listarPorEstado: async (est) => {
            if (est === "pending" || est === "running") return [j];
            if (est === "failed") return [JOB_104];
            return [j, JOB_104];
          },
          obterJob: async (id) => {
            if (String(id) === j.id) return j;
            if (String(id) === "JOB-000104") return JOB_104;
            return null;
          }
        })
      }
    );

    assert.equal(pub.jobs.length, 0, "análise-only não publica Job");
    assert.notEqual(out.modo, "motor_execucao");
    assert.notEqual(out.dados?.publicarJobProibido, false);
    assert.doesNotMatch(String(out.mensagem), /JOB-000104|em recuperação/i);
    assert.doesNotMatch(
      String(out.mensagem),
      /Recomendação:|Aprovar Outdoor Premium agora|Sugiro executar/i
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── B-AT-09 ───────────────────────────────────────────────────────────────

test("B-AT-09: consulta pontual de estado → resposta directa, sem envelope genérico", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo20-bat-068-"));
  const fila = criarFilaExecucao(root);
  const j = fila.publicar({ titulo: "Homologação", descricao: "teste" });
  const alvo = path.join(fila.queueDir, "JOB-000068.json");
  fs.renameSync(path.join(fila.queueDir, `${j.id}.json`), alvo);
  const job = JSON.parse(fs.readFileSync(alvo, "utf8"));
  job.id = "JOB-000068";
  job.estado = "completed";
  job.verificacao = { ok: true, motivo: "evidencia_estruturada" };
  job.resultado = { status: "sucesso", resumo: "P0-2 HOMOLOGADO" };
  fs.writeFileSync(alvo, JSON.stringify(job, null, 2));

  const pub = criarPublicadorFilaMemoria();
  const pergunta = "Qual é o estado do JOB-000068?";
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: pergunta,
      intencaoId: "consultar_estado"
    }),
    false
  );

  try {
    const out = await executiveEngine.executar(pergunta, {
      obterJob: (id) => fila.lerJob(id),
      listarJobs: (e) => fila.listarPorEstado(e == null ? null : e),
      publicarJob: pub.publicarJob.bind(pub)
    });

    assert.equal(pub.jobs.length, 0);
    assert.match(String(out.mensagem), /JOB-000068/);
    assert.match(String(out.mensagem), /completed/i);
    assert.doesNotMatch(String(out.mensagem), /Objectivo principal:/i);
    assert.doesNotMatch(String(out.mensagem), /Mantemos o (objectivo|foco)/i);
    assert.doesNotMatch(String(out.mensagem), /Antecipo pendência aberta:/i);
    assert.ok(!String(out.mensagem).trim().startsWith("Objectivo"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── B-AT-10 ───────────────────────────────────────────────────────────────

test("B-AT-10: após destino C2, CN não altera encaminhamento", () => {
  const prec = resolverPrecedenciaTurno({
    pedidoDecisaoExplicita: true,
    fase: "pos_destino",
    destinoClassificador: "nucleo_mre"
  });
  assert.equal(prec.destinoPermitido, "nucleo_mre");
  assert.equal(cnPodeAlterarDestino(prec, "nucleo_mre", "motor_execucao"), false);
  assert.equal(cnPodeAlterarDestino(prec, "nucleo_mre", "clarificacao"), false);
  assert.equal(cnPodeAlterarDestino(prec, "nucleo_mre", "continuidade_gate"), false);

  const resposta = {
    ok: true,
    mensagem: "Parecer A/B.",
    capacidade: "ia",
    dados: {
      encaminhamento: { destino: "nucleo_mre", ok: true }
    }
  };
  const comPrec = anexarPrecedenciaNaResposta(resposta, {
    ...prec,
    destinoFixo: true,
    fase: "pos_destino"
  });
  assert.equal(comPrec.dados.encaminhamento.destino, "nucleo_mre");

  const nat = naturalizarRespostaNucleo(comPrec, {
    instrucao: "Decida entre A e B.",
    historico: HIST_DELIBERATIVO,
    canalSpeaker: "chat",
    pedidoDecisaoExplicita: true,
    tipoTurno: "decisao",
    precedenciaTurno: {
      tipoTurno: "decisao",
      autoridadeVencedora: "pedido_decisao"
    },
    lastroConsciencia: {
      temContextoRelevante: true,
      estadoOperacional: { recuperacao: true, jobs: [JOB_104] },
      contagens: { jobsFalhado: 1, jobsPendentes: 0, jobsEmExecucao: 0, gatesPendentes: 0 }
    }
  });

  const destDepois =
    nat?.dados?.encaminhamento?.destino ||
    comPrec.dados.encaminhamento.destino;
  assert.equal(destDepois, "nucleo_mre");
  assert.doesNotMatch(String(nat.mensagem), /JOB-000104|em recuperação/i);
});

describe("B-AT inventário", () => {
  test("cobre IDs B-AT-01…10 (marcador de suíte)", () => {
    const ids = [
      "B-AT-01",
      "B-AT-02",
      "B-AT-03",
      "B-AT-04",
      "B-AT-05",
      "B-AT-06",
      "B-AT-07",
      "B-AT-08",
      "B-AT-09",
      "B-AT-10"
    ];
    assert.equal(ids.length, 10);
  });
});
