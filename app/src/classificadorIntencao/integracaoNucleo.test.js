/**
 * IMP-057 E4 — Integração Núcleo (Classificador primeiro + C3→Motor).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import { executiveEngine } from "../executiveEngine/index.js";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import {
  classificar,
  classificarEEncaminhar,
  contemSugiroComoRespostaFinal,
  conduzirTrabalhoExecutivoC3,
  primeiroPassoClassificar
} from "./index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

const DEMO_C3 = "Quero que você resolva os bugs do projeto.";

beforeEach(() => {
  // Isolamento face ao store de Continuidade (IMP-058 E4) — não altera o Classificador.
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

test("E4-CA3: classificarIntencao usa Classificador canónico (origem)", () => {
  const i = classificarIntencao("Bom dia");
  assert.equal(i.origem, "classificador_canonico");
  assert.equal(i.classe, "conhecimento_geral");
  assert.equal(i.classificacao?.destino, "resposta_leve");
});

test("EIC-V1: classificarIntencao reutiliza saidaPrevia (sem reclassificar)", () => {
  const rota = primeiroPassoClassificar("Onde estamos no outdoor?", {
    frenteActiva: true
  });
  const i = classificarIntencao("Onde estamos no outdoor?", rota.classificacao);
  assert.equal(i.classificacao, rota.classificacao);
  assert.equal(i.classe, rota.classificacao.classe);
  assert.equal(i.confianca, rota.classificacao.confianca);
  assert.equal(i.origem, "classificador_canonico");
});

test("EIC-V1: Núcleo passa classificacao única a classificarIntencao", () => {
  const src = readFileSync(join(rootSrc, "executiveEngine/index.js"), "utf8");
  assert.match(
    src,
    /classificarIntencao\(\s*texto\s*,\s*classificacao\s*\)/
  );
  assert.doesNotMatch(
    src,
    /const intencao = classificarIntencao\(\s*texto\s*\)\s*;/
  );
});

/** SC-01…05 — EIC 05_TESTES_CONVERSACIONAIS (T-CL) sobre Classificador homologado */
test("SC-01: pergunta genérica ADR → C1; sem Job", () => {
  const s = classificar("O que é um ADR?");
  assert.equal(s.classe, "conhecimento_geral");
  assert.equal(s.permiteJob, false);
  assert.equal(s.destino, "resposta_leve");
});

test("SC-02: onde estamos no outdoor? + frente → C2; sem Job automático", () => {
  const s = classificar("onde estamos no outdoor?", { frenteActiva: true });
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.permiteJob, false);
  assert.notEqual(s.destino, "motor_execucao");
});

test("SC-03: implementa o outdoor lateral → C3 → Motor (não Job directo)", () => {
  const rota = primeiroPassoClassificar("implementa o outdoor lateral");
  assert.equal(rota.classificacao.classe, "trabalho_executivo");
  assert.equal(rota.destino, "motor_execucao");
  assert.equal(rota.classificacao.permiteJob, true);
});

test("SC-04: lista os jobs → C4", () => {
  const s = classificar("lista os jobs");
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
});

test("SC-05: mensagem ambígua → não inventar C3", () => {
  const s = classificar("resolve isso");
  assert.ok(
    s.precisaClarificacao === true ||
      s.confianca < 0.55 ||
      s.classe !== "trabalho_executivo"
  );
  assert.equal(
    s.permiteJob && s.classe === "trabalho_executivo",
    false,
    "ambíguo não deve abrir C3+Job"
  );
});

test("E4-CA4: Classificador / encaminhador / integração sem @cursor/sdk", () => {
  for (const rel of [
    "classificadorIntencao/regras.js",
    "classificadorIntencao/encaminhador.js",
    "classificadorIntencao/integracaoNucleo.js",
    "executiveEngine/classificar.js",
    "executiveEngine/index.js"
  ]) {
    const src = readFileSync(join(rootSrc, rel), "utf8");
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
    assert.equal(/from\s+["']@cursor/.test(src), false, rel);
  }
});

test("E4-CA2: C1 não invoca MRE (mreInvocado false)", async () => {
  const out = await executiveEngine.executar("Bom dia");
  assert.equal(out.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(out.dados?.encaminhamento?.destino, "resposta_leve");
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.motorAcionado, false);
  assert.ok(
    out.modo === "resposta_leve" || out.modo === "local",
    `modo C1 leve, recebido: ${out.modo}`
  );
});

test("E4-CA1: classificação registada antes do efeito (C4 listar jobs)", async () => {
  const out = await executiveEngine.executar("listar jobs");
  assert.ok(out.dados?.classificacao);
  assert.equal(out.dados.classificacao.classe, "comando_operacional");
  assert.equal(out.dados.encaminhamento.destino, "capacidade_operacional");
  assert.equal(out.capacidade, "fila");
});

test("E4-CA8: clarificação não força Motor; C2 usa nucleo_mre", async () => {
  const clar = await executiveEngine.executar("xyz");
  assert.equal(clar.modo, "clarificacao");
  assert.equal(clar.dados?.motorAcionado, false);
  assert.equal(clar.dados?.encaminhamento?.destino, "clarificacao");

  const c2 = classificarEEncaminhar("Como priorizar o pagamento no MG2?");
  assert.equal(c2.destino, "nucleo_mre");
  assert.equal(c2.classificacao.classe, "conversa_projeto");
});

test("E4-CA5: Implementa… e despacha → Motor + Job (não Sugiro)", async () => {
  const fila = criarPublicadorFilaMemoria();
  let motorChamado = 0;
  const out = await executiveEngine.executar(
    "Implementa o outdoor e despacha",
    {
      publicarJob: fila.publicarJob.bind(fila),
      decisaoAprovacao: "aprovado",
      conduzirMotor: async (parecer, deps) => {
        motorChamado += 1;
        return executiveEngine.conduzirMotorExecucao(parecer, deps);
      }
    }
  );

  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(out.modo, "motor_execucao");
  assert.equal(out.dados?.motorAcionado, true);
  assert.ok(motorChamado >= 1);
  assert.equal(out.dados?.motor?.publicado, true);
  assert.ok(out.dados?.motor?.job?.id);
  assert.equal(contemSugiroComoRespostaFinal(out.mensagem), false);
  assert.match(out.mensagem, /Job|pending|Execução iniciada/i);
});

test("E4-CA6: C3 não fecha só com Parecer (parecerPonte.respostaFinal=false)", async () => {
  const out = await executiveEngine.executar(DEMO_C3, {
    publicarJob: criarPublicadorFilaMemoria().publicarJob
  });
  assert.equal(out.dados?.parecerPonte?.respostaFinal, false);
  assert.equal(out.dados?.motorAcionado, true);
  assert.ok(out.dados?.motor);
  assert.equal(out.modo, "motor_execucao");
});

test("E4-CA7: Gate do Motor reflectido na resposta (via Motor)", async () => {
  const out = await executiveEngine.executar(DEMO_C3, {});
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(out.dados?.motor?.aguardandoGate, true);
  assert.match(out.mensagem, /Gate|aprova/i);
  assert.equal(contemSugiroComoRespostaFinal(out.mensagem), false);
  assert.equal(/^Sugiro\b/i.test(out.mensagem.trim()), false);
});

test("E4 demo: «resolva os bugs do projeto» → C3 → Motor → Gate/Job anti-Sugiro", async () => {
  const saida = classificar(DEMO_C3);
  assert.equal(saida.classe, "trabalho_executivo");
  assert.equal(saida.destino, "motor_execucao");

  const rota = primeiroPassoClassificar(DEMO_C3);
  assert.equal(rota.destino, "motor_execucao");

  const out = await executiveEngine.executar(DEMO_C3);
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(out.dados?.motorAcionado, true);
  assert.ok(
    out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.publicado === true,
    "Gate ou Job esperado"
  );
  assert.equal(contemSugiroComoRespostaFinal(out.mensagem), false);
  assert.doesNotMatch(out.mensagem, /^Sugiro\b/i);
  console.log("\n--- DEMO E4 ---");
  console.log("Usuário:", DEMO_C3);
  console.log("Classe:", out.dados?.classificacao?.classe);
  console.log("Motor:", {
    aguardandoGate: out.dados?.motor?.aguardandoGate,
    publicado: out.dados?.motor?.publicado,
    jobId: out.dados?.motor?.job?.id,
    motivo: out.dados?.motor?.motivo
  });
  console.log("Resposta:", out.mensagem);
  console.log("--- fim DEMO ---\n");
});

test("E4: conduzirTrabalhoExecutivoC3 exige conduzirMotor", async () => {
  await assert.rejects(
    () =>
      conduzirTrabalhoExecutivoC3(
        "Implementa X",
        classificar("Implementa X"),
        {}
      ),
    /conduzirMotor/
  );
});
