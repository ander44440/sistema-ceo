/**
 * IMP-065 / REQ-065 / ARQ-026 — Validador de Contexto Ativo (VCA).
 * CT-V01…CT-V14.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import {
  validarContextoAtivo,
  definirVcaAtivo,
  VCA_ATIVO,
  VEREDICTOS_VCA
} from "./validadorContextoAtivo.js";
import { criarTopico } from "./gestorTopicos.js";
import {
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao,
  obterEstadoTopicosSessao
} from "./topicosSessao.js";
import { criarObjectivo } from "./gestorObjectivo.js";
import {
  definirEstadoObjectivoSessao,
  resetEstadoObjectivoSessao,
  obterEstadoObjectivoSessao
} from "./objectivoSessao.js";
import { classificar, LIMIAR_CONFIANCA } from "./regras.js";
import { executiveEngine } from "../executiveEngine/index.js";
import {
  resetStoreContinuidadePadrao,
  obterStoreContinuidadePadrao,
  registarGateAposMotor
} from "../continuidadeGate/integracaoConversa.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

const ISO = "2026-08-03T18:00:00.000Z";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  definirVcaAtivo(true);
});

test("CT-V01: baseline pertença — deixis com tópico activo → pertence + CSC", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = validarContextoAtivo({
    mensagem: "continua",
    topicoActivo: activo,
    objetivoActivo: null
  });
  assert.equal(r.veredicto, "pertence");
  assert.equal(r.autorizaLastroCsc, true);

  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  const out = await executiveEngine.executar(
    {
      texto: "continua",
      historico: [
        { papel: "usuario", texto: "Onde estamos no outdoor do MG2?" },
        { papel: "ceo", texto: "Outdoor em curso." }
      ]
    },
    {}
  );
  assert.equal(out.dados?.validacaoContexto?.veredicto, "pertence");
  assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, true);
  assert.ok(out.dados?.gestaoTopicos, "cadeia CSC (tópicos) activa");
});

test("CT-V02: independente — pergunta autónoma sem âncora do fio", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const obj = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const r = validarContextoAtivo({
    mensagem: "Quanto custa um café em Lisboa?",
    topicoActivo: activo,
    objetivoActivo: obj
  });
  assert.equal(r.veredicto, "independente");
  assert.equal(r.autorizaLastroCsc, false);

  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  definirEstadoObjectivoSessao({ objetivoActivo: obj, objetivoAnterior: null });
  const antesTop = obterEstadoTopicosSessao();
  const antesObj = obterEstadoObjectivoSessao();
  const out = await executiveEngine.executar(
    { texto: "Quanto custa um café em Lisboa?" },
    {}
  );
  assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.equal(out.dados?.gestaoTopicos, undefined);
  assert.equal(out.dados?.gestaoObjectivos, undefined);
  assert.deepEqual(obterEstadoTopicosSessao().topicoActivo, antesTop.topicoActivo);
  assert.equal(
    obterEstadoObjectivoSessao().objetivoActivo?.enunciado,
    antesObj.objetivoActivo?.enunciado
  );
});

test("CT-V03: conhecimento geral no meio do outdoor → isolamento; ≠ C2 por histórico", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = validarContextoAtivo({
    mensagem: "O que é um ADR?",
    topicoActivo: activo,
    historicoCandidato: [
      { papel: "usuario", texto: "Onde estamos no outdoor do MG2?" },
      { papel: "ceo", texto: "Outdoor em curso; priorizar lateral." }
    ]
  });
  assert.equal(r.veredicto, "conhecimento_geral");
  assert.equal(r.autorizaLastroCsc, false);

  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  const out = await executiveEngine.executar(
    {
      texto: "O que é um ADR?",
      historico: [
        { papel: "usuario", texto: "Onde estamos no outdoor do MG2?" },
        { papel: "ceo", texto: "Outdoor em curso; priorizar lateral." },
        { papel: "usuario", texto: "O que é um ADR?" }
      ]
    },
    {}
  );
  assert.equal(out.dados?.validacaoContexto?.veredicto, "conhecimento_geral");
  assert.equal(out.dados?.gestaoTopicos, undefined);
  assert.notEqual(out.dados?.classificacao?.classe, "conversa_projeto");
  assert.equal(out.dados?.classificacao?.classe, "conhecimento_geral");
});

test("CT-V04: metaconversa com objectivo MG2 → sem lastro de objectivo/tópico", async () => {
  const obj = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const r = validarContextoAtivo({
    mensagem: "Qual é o teu papel?",
    objetivoActivo: obj,
    topicoActivo: criarTopico("outdoor", "usuario", ISO)
  });
  assert.equal(r.veredicto, "metaconversa");
  assert.equal(r.autorizaLastroCsc, false);

  definirEstadoObjectivoSessao({ objetivoActivo: obj, objetivoAnterior: null });
  definirEstadoTopicosSessao({
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: []
  });
  const out = await executiveEngine.executar({ texto: "Qual é o teu papel?" }, {});
  assert.equal(out.dados?.validacaoContexto?.veredicto, "metaconversa");
  assert.equal(out.dados?.gestaoObjectivos, undefined);
  assert.equal(out.dados?.gestaoTopicos, undefined);
  assert.equal(out.dados?.classificacao?.permiteJob, false);
});

test("CT-V05: novo contexto — stores preservados; sem lastro do anterior", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = validarContextoAtivo({
    mensagem: "Mudando de assunto, quero falar de receita de bolo",
    topicoActivo: activo
  });
  assert.equal(r.veredicto, "novo_contexto");
  assert.equal(r.autorizaLastroCsc, false);

  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  const out = await executiveEngine.executar(
    { texto: "Mudando de assunto, quero falar de receita de bolo" },
    {}
  );
  assert.equal(out.dados?.validacaoContexto?.veredicto, "novo_contexto");
  assert.equal(out.dados?.gestaoTopicos, undefined);
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
});

test("CT-V06: ambiguo_contexto → pergunta curta; 0 Jobs", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = validarContextoAtivo({
    mensagem: "pagamento?",
    topicoActivo: activo
  });
  assert.equal(r.veredicto, "ambiguo_contexto");
  assert.equal(r.autorizaLastroCsc, false);
  assert.match(r.perguntaCurta || "", /\?/);

  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  const out = await executiveEngine.executar({ texto: "pagamento?" }, {});
  assert.equal(out.modo, "clarificacao_contexto");
  assert.equal(out.dados?.motorAcionado, false);
  assert.equal(out.dados?.classificacao, null);
  assert.match(out.mensagem, /\?/);
});

test("CT-V07: anti-C3 — veredictos VCA não forçam C3 / permiteJob", () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const msgs = [
    ["continua", activo],
    ["Quanto custa um café em Lisboa?", activo],
    ["O que é um ADR?", activo],
    ["Qual é o teu papel?", activo],
    ["Mudando de assunto para receita", activo],
    ["pagamento?", activo]
  ];
  for (const [m, top] of msgs) {
    const v = validarContextoAtivo({ mensagem: m, topicoActivo: top });
    assert.ok(VEREDICTOS_VCA.includes(v.veredicto), m);
    assert.equal(typeof v.classe, "undefined", m);
    assert.equal(typeof v.permiteJob, "undefined", m);
    const s = classificar(m, { frenteActiva: true });
    // VCA sozinho não escreve classe; Classificador decide
    if (s.classe === "trabalho_executivo") {
      assert.ok(false, `mensagem VCA de teste não deveria ser C3: ${m}`);
    }
    assert.equal(s.permiteJob, false, m);
  }
});

test("CT-V08: C3 actual «Implementa X» preservado pelo Classificador", async () => {
  const out = await executiveEngine.executar(
    { texto: "Implementa o outdoor lateral" },
    {}
  );
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(out.dados?.classificacao?.permiteJob, true);
  assert.equal(out.dados?.validacaoContexto?.veredicto, "pertence");
});

test("CT-V09: Gate + Aprovado → Continuidade (CA7)", async () => {
  const store = obterStoreContinuidadePadrao();
  const pub = criarPublicadorFilaMemoria();
  registarGateAposMotor(
    store,
    {
      id: "parecer-v09",
      diagnostico: { objetivoReal: "outdoor" },
      acao: { job: { titulo: "outdoor" } }
    },
    {
      aguardandoGate: true,
      ciclo: { id: "c-v09" },
      avaliacao: { gatilhos: ["G2"] }
    },
    "Despachar outdoor"
  );
  const out = await executiveEngine.executar(
    { texto: "Aprovado" },
    {
      storeContinuidade: store,
      publicarJob: pub.publicar,
      decisaoAprovacao: "aprovado"
    }
  );
  assert.ok(
    out.modo === "continuidade_gate" ||
      out.dados?.encaminhamento?.destino === "continuidade_gate" ||
      out.dados?.classificacao == null
  );
  assert.notEqual(out.modo, "clarificacao_contexto");
});

test("CT-V10: isolamento preserva stores; ausentes do lastro", async () => {
  const top = criarTopico("outdoor", "usuario", ISO);
  const obj = criarObjectivo("priorizar outdoor", "usuario", ISO);
  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  definirEstadoObjectivoSessao({ objetivoActivo: obj, objetivoAnterior: null });
  const snapTop = JSON.stringify(obterEstadoTopicosSessao());
  const snapObj = JSON.stringify(obterEstadoObjectivoSessao());
  const out = await executiveEngine.executar({ texto: "O que é um ADR?" }, {});
  assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.equal(JSON.stringify(obterEstadoTopicosSessao()), snapTop);
  assert.equal(JSON.stringify(obterEstadoObjectivoSessao()), snapObj);
  assert.equal(out.dados?.gestaoTopicos, undefined);
  assert.equal(out.dados?.gestaoObjectivos, undefined);
});

test("CT-V11: source VCA sem Motor/NCS/Fila/SDK; sem classe/permiteJob", () => {
  const src = readFileSync(join(__dirname, "validadorContextoAtivo.js"), "utf8");
  assert.doesNotMatch(src, /from\s+["'].*motorExecucao/);
  assert.doesNotMatch(src, /from\s+["'].*mre\/ncs/);
  assert.doesNotMatch(
    src,
    /publicarJob|conduzirApos|@cursor\/sdk|@anthropic|openai/i
  );
  assert.doesNotMatch(src, /permiteJob\s*[:=]\s*true/);
  assert.doesNotMatch(src, /\bclasse\s*[:=]/);
  assert.match(src, /autorizaLastroCsc|IMP-065|VCA ≠/);
});

test("CT-V12: regressão — limiar 0,55; VCA no Núcleo pós-Gate", () => {
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  assert.equal(VCA_ATIVO, true);
  const idx = readFileSync(join(rootSrc, "executiveEngine", "index.js"), "utf8");
  assert.match(idx, /validarContextoAtivo/);
  assert.match(idx, /autorizaLastroCsc/);
  assert.match(idx, /IMP-065/);
  const posGate = idx.indexOf("decidirInterceptacaoContinuidade");
  const posVca = idx.indexOf("validarContextoAtivo({");
  assert.ok(posGate >= 0 && posVca > posGate, "VCA após Gate");
  // Cadeia CSC condicionada a autorizaLastroCsc
  assert.match(idx, /if \(autorizaLastroCsc\)/);
});

test("CT-V13: ambiguo_contexto + deixis potencial → no máximo uma pergunta", async () => {
  definirEstadoTopicosSessao({
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: [criarTopico("pagamento", "usuario", ISO)]
  });
  const out = await executiveEngine.executar({ texto: "pagamento?" }, {});
  assert.equal(out.modo, "clarificacao_contexto");
  assert.equal((out.mensagem.match(/\?/g) || []).length, 1);
  assert.notEqual(out.modo, "clarificacao_topico");
  assert.notEqual(out.modo, "clarificacao_referente");
});

test("CT-V14: só pertence activa CSC — fixtures ≠ pertence sem lastro 061–064", async () => {
  const top = criarTopico("outdoor", "usuario", ISO);
  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  definirEstadoObjectivoSessao({
    objetivoActivo: criarObjectivo("priorizar outdoor", "usuario", ISO),
    objetivoAnterior: null
  });

  const casos = [
    ["independente", "Quanto custa um café em Lisboa?"],
    ["conhecimento_geral", "O que é um ADR?"],
    ["metaconversa", "Qual é o teu papel?"],
    ["novo_contexto", "Mudando de assunto para culinária"]
  ];

  for (const [esperado, texto] of casos) {
    resetEstadoTopicosSessao();
    resetEstadoObjectivoSessao();
    definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
    definirEstadoObjectivoSessao({
      objetivoActivo: criarObjectivo("priorizar outdoor", "usuario", ISO),
      objetivoAnterior: null
    });
    const v = validarContextoAtivo({
      mensagem: texto,
      topicoActivo: top,
      objetivoActivo: criarObjectivo("priorizar outdoor", "usuario", ISO)
    });
    assert.equal(v.veredicto, esperado, texto);
    assert.equal(v.autorizaLastroCsc, false, texto);
    const out = await executiveEngine.executar({ texto }, {});
    assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, false, texto);
    assert.equal(out.dados?.gestaoTopicos, undefined, texto);
    assert.equal(out.dados?.gestaoObjectivos, undefined, texto);
    assert.ok(
      !out.dados?.resolucaoReferencia ||
        out.dados.resolucaoReferencia.estado === "nenhum",
      texto
    );
  }
});

test("CT-V-real: capital / aritmética / meta / retoma — isolamento sem herdar MG2", async () => {
  const top = criarTopico("Motoboy Game 2", "coa", ISO);
  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });

  const capital = await executiveEngine.executar({
    texto: "Qual é a capital da França?"
  });
  assert.equal(capital.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.equal(capital.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(capital.dados?.encaminhamento?.destino, "resposta_leve");
  assert.doesNotMatch(
    capital.mensagem,
    /Mantemos o foco|Continuidade:|Frente ativa:/i
  );

  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const math = await executiveEngine.executar({ texto: "quanto é 125 × 48?" });
  assert.equal(math.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.equal(math.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(math.dados?.encaminhamento?.destino, "resposta_leve");
  assert.doesNotMatch(
    math.mensagem,
    /Mantemos o foco|Continuidade:|Frente ativa:|Sugiro/i
  );

  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const meta = await executiveEngine.executar({
    texto: "Você acha que está respondendo como um verdadeiro executivo?"
  });
  assert.equal(meta.dados?.validacaoContexto?.veredicto, "metaconversa");
  assert.equal(meta.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.doesNotMatch(
    meta.mensagem,
    /Mantemos o foco|Continuidade:|Frente ativa:/i
  );

  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const shift = await executiveEngine.executar({
    texto:
      "Vamos esquecer o Motoboy Game 2 por um momento. Quero falar sobre o Sistema CEO."
  });
  assert.equal(shift.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.ok(
    ["novo_contexto", "metaconversa"].includes(
      shift.dados?.validacaoContexto?.veredicto
    )
  );
  assert.doesNotMatch(
    shift.mensagem,
    /Mantemos o foco|Continuidade:|Frente ativa:|Sprint 1/i
  );

  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const retoma = await executiveEngine.executar({
    texto: "Voltando ao Motoboy Game 2, onde paramos?"
  });
  assert.equal(retoma.dados?.validacaoContexto?.veredicto, "pertence");
  assert.equal(retoma.dados?.validacaoContexto?.autorizaLastroCsc, true);
});

test("CT-V-real2: meta conversa / IA / decisão CEO — sem clarificação indevida", async () => {
  const top = criarTopico("Motoboy Game 2", "coa", ISO);
  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });

  const meta = await executiveEngine.executar({
    texto: "Você acha que esta conversa está sendo produtiva?"
  });
  assert.equal(meta.dados?.validacaoContexto?.veredicto, "metaconversa");
  assert.equal(meta.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.equal(meta.dados?.classificacao?.classe, "conversa_projeto");
  assert.notEqual(meta.dados?.encaminhamento?.destino, "clarificacao");
  assert.doesNotMatch(meta.mensagem, /Mantemos o foco|Continuidade:/i);

  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const ia = await executiveEngine.executar({
    texto:
      "Esqueça todos os projetos por um momento. Quero conversar sobre inteligência artificial."
  });
  assert.equal(ia.dados?.validacaoContexto?.veredicto, "novo_contexto");
  assert.equal(ia.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(ia.dados?.encaminhamento?.destino, "resposta_leve");
  assert.notEqual(ia.dados?.encaminhamento?.destino, "clarificacao");

  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const dec = await executiveEngine.executar({
    texto:
      "Se você fosse o CEO deste projeto, qual seria a próxima decisão mais importante e por quê?"
  });
  assert.equal(dec.dados?.validacaoContexto?.veredicto, "pertence");
  assert.equal(dec.dados?.classificacao?.classe, "conversa_projeto");
  assert.equal(dec.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.notEqual(dec.dados?.encaminhamento?.destino, "clarificacao");
});

test("CT-V-real3: meta-modo conversacional — 6 perguntas sem clarificação/MG2", async () => {
  const top = criarTopico("Motoboy Game 2", "coa", ISO);
  const msgs = [
    "Você consegue perceber quando eu estou apenas refletindo e quando realmente espero uma decisão sua?",
    "Se eu mudar completamente de assunto no meio da conversa, o que você faz?",
    "Você prefere que eu explique tudo ou consegue descobrir parte do contexto sozinho?",
    'Se eu disser apenas "vamos continuar", você sabe exatamente do que estou falando?',
    "Em que momento você decide fazer uma pergunta em vez de responder diretamente?",
    "Como você decide se uma pergunta é sobre um projeto ou apenas uma curiosidade?"
  ];
  for (const texto of msgs) {
    resetEstadoTopicosSessao();
    resetEstadoObjectivoSessao();
    definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
    const out = await executiveEngine.executar({ texto });
    assert.equal(
      out.dados?.validacaoContexto?.veredicto,
      "metaconversa",
      texto
    );
    assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, false, texto);
    assert.equal(out.dados?.classificacao?.classe, "conversa_projeto", texto);
    assert.equal(out.dados?.encaminhamento?.destino, "nucleo_mre", texto);
    assert.notEqual(out.dados?.encaminhamento?.destino, "clarificacao", texto);
    assert.doesNotMatch(
      out.mensagem,
      /Mantemos o foco|Continuidade:|Preciso de um pouco mais de clareza/i,
      texto
    );
  }
});

test("CT-V-extra: rollback VCA_ATIVO=false força pertence", () => {
  definirVcaAtivo(false);
  const r = validarContextoAtivo({
    mensagem: "O que é um ADR?",
    topicoActivo: criarTopico("outdoor", "usuario", ISO)
  });
  assert.equal(r.veredicto, "pertence");
  assert.equal(r.autorizaLastroCsc, true);
  definirVcaAtivo(true);
});
