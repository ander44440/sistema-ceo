/**
 * F12 / F10-C5 — execução explícita determinada não desvia para clarificacao_topico.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { classificar } from "./regras.js";
import { gestorTopicos } from "./gestorTopicos.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { abrirCoaParaTeste } from "../executiveEngine/garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "../executiveEngine/coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "./envelopeSessaoCoa.js";
import {
  ehProibicaoExecucaoExplicita,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "./regras.js";

const MSG_F10_C5 =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

const MSG_F11 =
  "Com base apenas nos fatos registrados sobre a ValeVerde, compare os riscos " +
  "da queda de margem versus o aumento de custos e delibere a preocupação " +
  "executiva central. Não despache Jobs.";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  limparCoaAtivo();
});

test("F12-C5: gestor — Job+bugs sem «ou» não é ambiguo_topico", () => {
  const r = gestorTopicos({
    mensagem: MSG_F10_C5,
    topicoActivo: null,
    pausas: [],
    frenteActiva: true
  });
  assert.notEqual(r.evento, "ambiguo_topico");
  assert.equal(r.perguntaCurta == null || r.perguntaCurta === "", true);
});

test("F12-C5: Execute agora criar Job… → C3/motor (não clarificacao_topico); Gate→fila", async () => {
  const s = classificar(MSG_F10_C5);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  assert.equal(s.permiteJob, true);

  const coa = abrirCoaParaTeste("coa-f12-c5", "F12 C5");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_F10_C5, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  assert.notEqual(out.modo, "clarificacao_topico");
  assert.equal(/Seguimos no/i.test(String(out.mensagem || "")), false);
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.modo, "motor_execucao");
  // G2 pode exigir aprovação antes do despacho — não é falha F12
  assert.ok(
    fila.jobs.length >= 1 ||
      out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.motivo === "aguardando_gate",
    "deve chegar ao motor C3 (Job ou Gate)"
  );

  if (fila.jobs.length === 0 && out.dados?.motor?.aguardandoGate) {
    const out2 = await executiveEngine.executar(
      { texto: "Aprovado", historico: [], coaId: coa.id },
      { publicarJob: fila.publicarJob.bind(fila) }
    );
    assert.ok(
      fila.jobs.length >= 1,
      `após Aprovado deve publicar Job (modo=${out2.modo}, jobs=${fila.jobs.length})`
    );
  }
});

test("F12-C5: ambiguidade real com «ou» continua clarificacao_topico", async () => {
  const r = gestorTopicos({
    mensagem: "Outdoor ou pagamento?",
    topicoActivo: null,
    pausas: [],
    frenteActiva: true
  });
  assert.equal(r.evento, "ambiguo_topico");

  const coa = abrirCoaParaTeste("coa-f12-c5-amb", "F12 amb");
  definirCoaAtivo(coa);
  const out = await executiveEngine.executar(
    {
      texto: "Outdoor ou pagamento?",
      historico: [
        { papel: "usuario", texto: "Sobre o outdoor." },
        { papel: "ceo", texto: "Outdoor em curso." },
        { papel: "usuario", texto: "Há também o pagamento." },
        { papel: "ceo", texto: "Pagamento em análise." }
      ],
      coaId: coa.id
    },
    {}
  );
  assert.equal(out.modo, "clarificacao_topico");
  assert.match(out.mensagem, /\?/);
});

test("F12: F11 preservada — deliberar + Não despache → C2, 0 Jobs", async () => {
  const t = normalizarTexto(MSG_F11);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);
  const s = classificar(MSG_F11);
  assert.equal(s.destino, "nucleo_mre");
  assert.equal(s.permiteJob, false);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_F11, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});
