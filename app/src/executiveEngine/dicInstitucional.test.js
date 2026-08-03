/**
 * IMP-067 — Dossier Institucional Curado (DIC)
 */
import assert from "node:assert/strict";
import { describe, test, afterEach } from "node:test";
import {
  DIC_ID,
  DIC_VERSAO,
  DIC_INJECAO_ATIVA,
  definirDicInjacaoAtiva,
  deveInjectarDic,
  obterDicVigente,
  obterResumoIdentidadeDoDic
} from "./dicInstitucional.js";
import { montarMensagensLlm, metadadoDicInjecao } from "./promptGovernanca.js";
import { obterResumoIdentidadeCeo } from "./constituicaoCeo.js";
import { obterBriefingProjeto } from "./briefingsProjeto.js";

const MEM = {
  diaAberto: true,
  projetoAtivoId: "prj-mg2",
  decisoes: [],
  pendencias: [],
  ultimasAcoes: []
};

const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };

describe("IMP-067 DIC", () => {
  afterEach(() => {
    definirDicInjacaoAtiva(true);
  });

  test("CT-DIC01: DIC vigente contém S1–S9 e fontes CON", () => {
    const t = obterDicVigente();
    assert.match(t, new RegExp(DIC_ID));
    assert.match(t, new RegExp(`v${DIC_VERSAO}`));
    for (const s of [
      "S1 —",
      "S2 —",
      "S3 —",
      "S4 —",
      "S5 —",
      "S6 —",
      "S7 —",
      "S8 —",
      "S9 —"
    ]) {
      assert.ok(t.includes(s), `falta ${s}`);
    }
    assert.match(t, /CON-001/);
    assert.match(t, /Art\. 6º|Art\. 6/);
    assert.match(t, /Usuário|Utilizador|Fundador/i);
    assert.match(t, /CTO/);
    assert.match(t, /Cursor|Engenheiro/);
    assert.match(t, /maximizar o progresso/i);
    assert.doesNotMatch(t, /\bNCS\b.*schema|\/api\/ceo/i);
  });

  test("CT-DIC02: deveInjectarDic — papel / meta / VCA metaconversa", () => {
    assert.equal(deveInjectarDic({ texto: "Qual é o seu papel?" }), true);
    assert.equal(
      deveInjectarDic({
        texto:
          "Você consegue perceber quando eu estou apenas refletindo e quando realmente espero uma decisão?"
      }),
      true
    );
    assert.equal(
      deveInjectarDic({
        texto: "ok",
        validacaoContexto: { veredicto: "metaconversa" }
      }),
      true
    );
  });

  test("CT-DIC03: NÃO injecta em conhecimento geral / retoma projecto", () => {
    assert.equal(deveInjectarDic({ texto: "O que é um ADR?" }), false);
    assert.equal(
      deveInjectarDic({ texto: "Voltando ao MG2, onde paramos?" }),
      false
    );
    assert.equal(
      deveInjectarDic({ texto: "Como devemos priorizar outdoor vs LOD?" }),
      false
    );
  });

  test("CT-DIC04: montarMensagensLlm — ordem mandato → governação → DIC; sem briefing", () => {
    const briefing = obterBriefingProjeto(COA_MG2);
    assert.ok(briefing, "fixture exige briefing MG2");

    const msgs = montarMensagensLlm({
      instrucao: "Qual a diferença entre você e o CTO?",
      historico: [],
      memoria: MEM,
      coa: COA_MG2,
      intencao: { classe: "conversa_projeto", destino: "nucleo_mre" }
    });

    const systems = msgs.filter((m) => m.role === "system").map((m) => m.content);
    assert.ok(systems[0].includes("CONSTITUIÇÃO DO CEO"));
    assert.ok(systems[1].includes("GOVERNANÇA DO LLM"));
    assert.ok(systems[2].includes("DOSSIER INSTITUCIONAL CURADO"));
    assert.ok(systems[3].includes("PAINEL EXECUTIVO") || systems[3].includes("CONTEXTO"));
    assert.ok(
      !systems.some(
        (c) =>
          c === briefing ||
          c.startsWith("BRIEFING OPERACIONAL CURADO")
      ),
      "path meta não deve incluir briefing COA"
    );
    assert.equal(metadadoDicInjecao({ texto: "Qual a diferença entre você e o CTO?" }).injectado, true);
  });

  test("CT-DIC05: path projecto — SEM DIC; COM briefing se COA", () => {
    const briefing = obterBriefingProjeto(COA_MG2);
    const msgs = montarMensagensLlm({
      instrucao: "Voltando ao MG2, onde paramos?",
      historico: [],
      memoria: MEM,
      coa: COA_MG2,
      intencao: { classe: "conversa_projeto", destino: "nucleo_mre" }
    });
    const systems = msgs.filter((m) => m.role === "system").map((m) => m.content);
    assert.ok(!systems.some((c) => c.includes("DOSSIER INSTITUCIONAL CURADO")));
    assert.ok(systems.some((c) => c.includes("BRIEFING") || c === briefing));
    assert.equal(
      metadadoDicInjecao({ texto: "Voltando ao MG2, onde paramos?" }).injectado,
      false
    );
  });

  test("CT-DIC06: flag DIC_INJECAO_ATIVA=false — rollback L1", () => {
    definirDicInjacaoAtiva(false);
    assert.equal(DIC_INJECAO_ATIVA, false);
    assert.equal(deveInjectarDic({ texto: "Qual é o seu papel?" }), false);
    const msgs = montarMensagensLlm({
      instrucao: "Qual é o seu papel?",
      historico: [],
      memoria: MEM,
      coa: COA_MG2
    });
    assert.ok(
      !msgs.some((m) => String(m.content).includes("DOSSIER INSTITUCIONAL CURADO"))
    );
  });

  test("CT-DIC07: resumo identidade alinhado ao DIC (S1/S3)", () => {
    const r = obterResumoIdentidadeCeo();
    assert.equal(r, obterResumoIdentidadeDoDic());
    assert.match(r, /Sistema Executivo de Governança|progresso/i);
    assert.match(r, /CTO|Engenheiro|Cursor/i);
    assert.match(r, /não programo|não program/i);
  });

  test("CT-DIC08: mapa divulgável sem APIs/prompts", () => {
    const t = obterDicVigente();
    assert.match(t, /Classificador|Gate|Job|Fila/i);
    assert.doesNotMatch(t, /CEO_LLM_API_KEY|system\[0\]|criarChamarLlmCeo/);
  });
});
