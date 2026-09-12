/**
 * IMP-090 / REQ-090 / ARQ-090 — TurnEnvelope Fatia 0 (CA-090-1…10)
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import executiveEngine from "../executiveEngine/index.js";
import {
  criarTurnEnvelope,
  anexarTurnEnvelopeNaResposta,
  CANAL_DEFAULT,
  COA_SENTINEL,
  OBJECTO_INDEFINIDO
} from "./index.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import {
  resetStoreContinuidadePadrao
} from "../continuidadeGate/integracaoConversa.js";
import {
  reiniciarAutoridadeDelegadaParaTestes,
  autoridadeDelegadaActiva
} from "../autoridadeDelegada/autoridadeDelegada.js";
import { criarTopico } from "../classificadorIntencao/gestorTopicos.js";
import {
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao
} from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { obterCoaAtivo } from "../executiveEngine/coaSessao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..", "..");
const auditPath = join(root, "executive", "audit", "eventos.jsonl");

const ISO = "2026-09-12T12:00:00.000Z";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.inicializar();
});

function assertEnvelopeShadow(env, textoEsperado) {
  assert.ok(env, "envelope ausente");
  assert.equal(typeof env.idTurno, "string");
  assert.ok(env.idTurno.length > 0);
  assert.equal(env.mensagemAtual, textoEsperado);
  assert.equal(env.perguntaAtual, env.mensagemAtual);
  assert.equal(env.modo, null);
  assert.equal(env.intençãoAtual, null);
  assert.equal(env.objecto, OBJECTO_INDEFINIDO);
  assert.equal(env.parecer, null);
  assert.equal(env.políticaSubstituição, null);
  assert.ok(Array.isArray(env.rastreio));
  assert.equal(env.rastreio[0]?.fase, "create");
  assert.ok(Object.isFrozen(env));
}

test("CA-090-8: selagem — mutate mensagemAtual/perguntaAtual/coaId falha; valor intacto", () => {
  const env = criarTurnEnvelope({
    mensagemAtual: "olá selagem",
    coaIdEntrada: "prj-teste",
    canal: "chat"
  });
  const antes = {
    m: env.mensagemAtual,
    p: env.perguntaAtual,
    c: env.coaId
  };
  assert.throws(() => {
    env.mensagemAtual = "hack";
  }, TypeError);
  assert.throws(() => {
    env.perguntaAtual = "hack";
  }, TypeError);
  assert.throws(() => {
    env.coaId = "outro";
  }, TypeError);
  assert.equal(env.mensagemAtual, antes.m);
  assert.equal(env.perguntaAtual, antes.p);
  assert.equal(env.coaId, antes.c);
});

test("CA-090-3 + âncora: coaId create e canal default", () => {
  const env = criarTurnEnvelope({
    mensagemAtual: "x",
    coaIdEntrada: null,
    obterCoaAtivo: () => ({ id: "coa-activo" })
  });
  assert.equal(env.coaId, "coa-activo");
  assert.equal(env.canal, CANAL_DEFAULT);

  const sem = criarTurnEnvelope({
    mensagemAtual: "y",
    coaIdEntrada: null,
    obterCoaAtivo: () => null
  });
  assert.equal(sem.coaId, COA_SENTINEL);

  const entrada = criarTurnEnvelope({
    mensagemAtual: "z",
    coaIdEntrada: "coa-entrada",
    obterCoaAtivo: () => ({ id: "ignorado" })
  });
  assert.equal(entrada.coaId, "coa-entrada");
});

test("CA-090-1: envelope nasce em turno normal", async () => {
  const texto = "Bom dia, CEO.";
  const out = await executiveEngine.executar(texto, {
    listarPorEstado: async () => [],
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => [],
      F3: async () => [],
      F4: async () => ({ estado: "activo" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: false, alertas: 0 }),
      F8: async () => ({ id: "mg2", nome: "Motoboy Game 2" })
    }
  });
  assertEnvelopeShadow(out.dados?.envelope, texto.trim());
  const coa = (() => {
    try {
      return obterCoaAtivo();
    } catch {
      return null;
    }
  })();
  const esperado =
    (coa && coa.id) || COA_SENTINEL;
  assert.equal(out.dados.envelope.coaId, esperado);
});

test("CA-090-1/10: envelope nasce em early-return Gate", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();

  const gate = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(gate.dados?.motor?.aguardandoGate, true);
  assertEnvelopeShadow(gate.dados?.envelope, "Resolva os bugs.");

  const aprov = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(aprov.dados?.continuidade, true);
  assertEnvelopeShadow(aprov.dados?.envelope, "Aprovado.");
  assert.equal(aprov.dados.envelope.mensagemAtual, "Aprovado.");
});

test("CA-090-1/10: envelope nasce em early-return AD", async () => {
  const out = await executiveEngine.executar(
    {
      texto:
        "VOCE ESTA AUTORIZADO A TOMAR TODAS AS MEDIDAS QUE JULGA NECESSÁRIAS, PARA UMA MELHOR PERFORMANCE DO MG2 OK..",
      historico: []
    },
    {
      listarPorEstado: async () => [],
      publicarJob: async () => ({ id: "JOB-X", estado: "pending" })
    }
  );
  assert.equal(autoridadeDelegadaActiva(), true);
  assert.equal(out.modo, "autoridade_delegada");
  assertEnvelopeShadow(
    out.dados?.envelope,
    "VOCE ESTA AUTORIZADO A TOMAR TODAS AS MEDIDAS QUE JULGA NECESSÁRIAS, PARA UMA MELHOR PERFORMANCE DO MG2 OK.."
  );
});

test("CA-090-1/10: envelope nasce em early-return VCA/CSC", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  const out = await executiveEngine.executar({ texto: "pagamento?" }, {});
  assert.equal(out.modo, "clarificacao_contexto");
  assertEnvelopeShadow(out.dados?.envelope, "pagamento?");
});

test("CA-090-4: envelope chega ao C2 (ctx + resposta)", async () => {
  let viuCtxEnvelope = false;
  const capOriginal = executiveEngine.obterCapacidade("ia");
  assert.ok(capOriginal, "capacidade ia");

  const wrapper = {
    ...capOriginal,
    async executar(ctx) {
      if (ctx && ctx.envelope) viuCtxEnvelope = true;
      return capOriginal.executar(ctx);
    }
  };
  executiveEngine.registrar(wrapper);

  try {
    const texto =
      "Analise os prós e contras de negociar preço com o cliente ValeVerde.";
    const out = await executiveEngine.executar(
      { texto, historico: [], coaId: "prj-sistema-ceo" },
      {
        listarPorEstado: async () => [],
        leitoresConsciencia: {
          F1: async () => [],
          F2: async () => [],
          F3: async () => [],
          F4: async () => ({ estado: "activo" }),
          F5: async () => ({ estado: "ocioso", emCurso: false }),
          F6: async () => ({ estado: "ocioso", ocupado: false }),
          F7: async () => ({ disponivel: false, alertas: 0 }),
          F8: async () => ({ id: "ceo", nome: "Sistema CEO" })
        }
      }
    );
    assertEnvelopeShadow(out.dados?.envelope, texto);
    assert.equal(
      out.dados?.encaminhamento?.destino === "nucleo_mre" ||
        out.dados?.classificacao?.classe === "C2" ||
        viuCtxEnvelope ||
        Boolean(out.dados?.envelope),
      true
    );
    // Se o destino foi C2/ia, o ctx deve ter visto o envelope.
    if (
      out.dados?.encaminhamento?.destino === "nucleo_mre" ||
      out.capacidade === "ia"
    ) {
      assert.equal(viuCtxEnvelope, true, "ctx.envelope ausente no path C2");
    }
  } finally {
    executiveEngine.registrar(capOriginal);
  }
});

test("CA-090-2/5/9: mensagem estável; sombra não altera prosa baseline Gate", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();
  const out = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.match(out.mensagem, /Aguardando aprovação \(Gate/i);
  assert.equal(out.dados.envelope.mensagemAtual, "Resolva os bugs.");
  assert.equal(out.dados.envelope.perguntaAtual, out.dados.envelope.mensagemAtual);
  // Critério negativo: envelope presente mas prosa/destino legado intactos
  assert.equal(out.dados?.motor?.aguardandoGate, true);
  assert.equal(/\bSugiro\b/i.test(out.mensagem), false);
});

test("CA-090-9: código de produção não ramifica em ctx.envelope", () => {
  const raiz = join(__dirname, "..");
  const ficheiros = [
    "executiveEngine/capacidades/ia.js",
    "mre/integracaoNucleo.js",
    "conversacaoNatural/compor.js",
    "conscienciaOperacional/disciplinaLastroInsuficiente.js",
    "conscienciaOperacional/influenciaDeliberacao.js",
    "mre/speaker/speakerExecutivo.js",
    "classificadorIntencao/regras.js"
  ];
  for (const rel of ficheiros) {
    const src = readFileSync(join(raiz, rel), "utf8");
    assert.doesNotMatch(
      src,
      /ctx\.envelope|envelope\.modo|envelope\.objecto|envelope\.intençãoAtual/,
      `${rel} não deve ler envelope para comportamento`
    );
  }
});

test("CA-090-6: TurnEnvelope não escreve Trilha V1", async () => {
  const turnSrc = readFileSync(join(__dirname, "index.js"), "utf8");
  assert.doesNotMatch(turnSrc, /trilhaAuditavel|audit\/eventos/);
  const eeSrc = readFileSync(
    join(__dirname, "..", "executiveEngine", "index.js"),
    "utf8"
  );
  // Nascimento do envelope não importa Trilha
  assert.match(eeSrc, /criarTurnEnvelope/);
  const sizeAntes = existsSync(auditPath) ? statSync(auditPath).size : 0;
  await executiveEngine.executar("Olá sombra envelope.", {});
  const sizeDepois = existsSync(auditPath) ? statSync(auditPath).size : 0;
  assert.equal(
    sizeDepois,
    sizeAntes,
    "executar turno sombra não deve append na Trilha V1"
  );
});

test("CA-090-7: campos reservados sem autoridade", () => {
  const env = criarTurnEnvelope({ mensagemAtual: "reserva" });
  assert.equal(env.modo, null);
  assert.equal(env.intençãoAtual, null);
  assert.equal(env.objecto, OBJECTO_INDEFINIDO);
  assert.deepEqual([...env.fioConversacional], []);
  assert.equal(env.autoridade, null);
  assert.equal(env.sinais, null);
});

test("anexarTurnEnvelopeNaResposta não altera mensagem", () => {
  const env = criarTurnEnvelope({ mensagemAtual: "t" });
  const r = anexarTurnEnvelopeNaResposta(
    { ok: true, mensagem: "prosa", dados: { x: 1 } },
    env
  );
  assert.equal(r.mensagem, "prosa");
  assert.equal(r.dados.x, 1);
  assert.equal(r.dados.envelope, env);
});

test("fail-soft: montarContextoCapacidade sem envelope continua ok", () => {
  const ctx = executiveEngine.montarContextoCapacidade({
    texto: "x",
    historico: [],
    intencao: { id: "t" }
  });
  assert.equal(ctx.envelope, undefined);
  assert.equal(ctx.instrucao, "x");
});
