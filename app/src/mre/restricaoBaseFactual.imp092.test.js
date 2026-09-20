/**
 * IMP-092.5 / ADR-023 — RFR: detector + isolamento HFC no envelope MRE.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  ORIGEM_UTILIZADOR,
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader
} from "../lastroFactualCaso/index.js";
import {
  detectarRestricaoBaseFactual,
  removerFioRecenteDaMensagem,
  regimeRfrActivo,
  aplicarIsolamentoRfrNaEntrada,
  enriquecerEntradaMreComLfc,
  montarEntradaMre,
  MARCA_FIO_RECENTE,
  PREFIXO_FACTO_LFC
} from "./index.js";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

const COA = "coa-rfr-test";
const T05 =
  "CEO, analisando apenas os fatos registrados sobre a ValeVerde Alimentos, qual é hoje a principal preocupação executiva da empresa e por quê?";

const HIST_CONTAMINANTE = [
  {
    papel: "usuario",
    texto:
      "CEO, quero decidir se devemos aumentar em 10% o preço do principal serviço."
  },
  {
    papel: "ceo",
    texto:
      "Acompanho sem fechar decisão: Coletar informações sobre a elasticidade-preço da demanda dos clientes e pesquisa de mercado antes do aumento de 10%."
  }
];

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rfr-0925-"));
  const dirLfc = path.join(tmpRoot, "executive", "lastro-factual-casos");
  store = criarLfcStore(dirLfc);
  writer = criarLfcWriter(store, { superficie: "teste-rfr" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

async function seedLfcValeVerde() {
  const cri = writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: [
      "120 funcionários",
      "margem líquida caiu de 8% para 4%",
      "custo das matérias-primas subiu 15%",
      "faturamento anual de R$ 52 milhões"
    ],
    origem: ORIGEM_UTILIZADOR
  });
  assert.equal(cri.ok, true);
  return cri.casoId;
}

// --- Detector (ADR-023 G2/G3) ---

test("RFR detector: exemplos ADR-023 / T05", () => {
  assert.equal(detectarRestricaoBaseFactual(T05), true);
  assert.equal(
    detectarRestricaoBaseFactual(
      "analise só com os factos do lastro do caso qual o risco"
    ),
    true
  );
  assert.equal(
    detectarRestricaoBaseFactual(
      "Com base unicamente nos factos assertados, o que preocupa?"
    ),
    true
  );
  assert.equal(
    detectarRestricaoBaseFactual(
      "Analisando somente os factos registados sobre a empresa X, qual a prioridade?"
    ),
    true
  );
});

test("RFR detector: não dispara fora do contrato", () => {
  assert.equal(detectarRestricaoBaseFactual("Qual o próximo passo do sprint?"), false);
  assert.equal(
    detectarRestricaoBaseFactual("Liste os factos registados da ValeVerde"),
    false
  );
  assert.equal(
    detectarRestricaoBaseFactual("Devemos aumentar o preço em 10%?"),
    false
  );
  assert.equal(detectarRestricaoBaseFactual(""), false);
});

test("removerFioRecenteDaMensagem preserva pedido e blocos seguintes", () => {
  const msg =
    `${T05}\n\n${MARCA_FIO_RECENTE} A pergunta ACTUAL governa.]\n` +
    `CEO: elasticidade-preço e aumento de 10%\n\n` +
    `[LASTRO LFC — x]\n[LFC activo] 120 funcionários`;
  const out = removerFioRecenteDaMensagem(msg);
  assert.equal(out.includes("elasticidade"), false);
  assert.equal(out.includes("10%"), false);
  assert.match(out, /120 funcionários/);
  assert.match(out, /analisando apenas os fatos/i);
});

// --- Isolamento ---

test("CA-RFR-1/2: RFR + LFC + HFC contaminante → fio fora da mensagem", async () => {
  await seedLfcValeVerde();
  const entrada = montarEntradaMre({
    instrucao: T05,
    historico: HIST_CONTAMINANTE,
    coaAtivo: { id: COA, nome: "Teste" },
    intencao: { id: "deliberar" }
  });
  // FRENTE 7: fio vive em anexos, não na âncora.
  assert.match(
    String(entrada.anexosDeliberativos?.fioRecente || ""),
    /Fio recente|10%|elasticidade/i
  );
  assert.doesNotMatch(entrada.mensagem, /Fio recente/i);

  const out = await enriquecerEntradaMreComLfc(entrada, {
    reader,
    coaId: COA,
    instrucao: T05
  });
  assert.equal(out.rfr?.activo, true);
  assert.equal(out.lfcConsumo?.autorizado, true);
  assert.equal(out.lfcConsumo?.nFactos, 4);
  assert.equal(out.mensagem.includes(MARCA_FIO_RECENTE), false);
  assert.equal(/10\s*%/.test(out.mensagem), false);
  assert.equal(/elasticidade/i.test(out.mensagem), false);
  assert.equal(/pesquisa de mercado/i.test(out.mensagem), false);
  assert.match(out.mensagem, /RFR — deliberação com base factual restrita/);
  assert.ok(
    (out.factosOficiais || []).some((f) => String(f).includes(PREFIXO_FACTO_LFC))
  );
  assert.equal(Array.isArray(out.historico) && out.historico.length === 0, true);
});

test("CA-RFR: RFR + LFC sem HFC contaminante → LFC presente, sem fio", async () => {
  await seedLfcValeVerde();
  const entrada = montarEntradaMre({
    instrucao: T05,
    historico: [],
    coaAtivo: { id: COA, nome: "Teste" }
  });
  const out = await enriquecerEntradaMreComLfc(entrada, {
    reader,
    coaId: COA,
    instrucao: T05
  });
  assert.equal(out.rfr?.activo, true);
  assert.match(out.mensagem, /120 funcionários/);
  assert.equal(out.mensagem.includes(MARCA_FIO_RECENTE), false);
});

test("CA-RFR-4: sem RFR → fio HFC permanece em anexos/historico (não na âncora)", async () => {
  await seedLfcValeVerde();
  const pedido = "CEO, qual a principal preocupação da ValeVerde e por quê?";
  assert.equal(detectarRestricaoBaseFactual(pedido), false);
  const entrada = montarEntradaMre({
    instrucao: pedido,
    historico: HIST_CONTAMINANTE,
    coaAtivo: { id: COA, nome: "Teste" }
  });
  const out = await enriquecerEntradaMreComLfc(entrada, {
    reader,
    coaId: COA,
    instrucao: pedido
  });
  assert.equal(out.rfr?.activo, false);
  assert.doesNotMatch(out.mensagem, /Fio recente/i);
  assert.match(
    String(out.anexosDeliberativos?.fioRecente || ""),
    /Fio recente|10%/i
  );
  assert.ok((out.historico || []).length >= 1);
});

test("CM-RFR-1: RFR sem LFC autorizado → não isola", async () => {
  assert.equal(detectarRestricaoBaseFactual(T05), true);
  const entrada = montarEntradaMre({
    instrucao: T05,
    historico: HIST_CONTAMINANTE,
    coaAtivo: { id: COA, nome: "Teste" }
  });
  const out = await enriquecerEntradaMreComLfc(entrada, {
    reader,
    coaId: COA,
    instrucao: T05
  });
  // sem caso no store → consumo não autorizado com activos
  assert.equal(out.lfcConsumo?.autorizado !== true || out.lfcConsumo?.nFactos === 0, true);
  // se não autorizado, RFR inactivo
  if (out.lfcConsumo?.autorizado !== true) {
    assert.equal(out.rfr?.activo, false);
    assert.doesNotMatch(out.mensagem, /Fio recente/i);
    assert.match(
      String(out.anexosDeliberativos?.fioRecente || out.historico?.[0]?.texto || ""),
      /Fio recente|10%|elasticidade/i
    );
  }
});

test("regimeRfrActivo: ambiguidade → false (G5)", () => {
  assert.equal(
    regimeRfrActivo({
      instrucao: T05,
      consumo: { autorizado: false, ambiguidade: true }
    }),
    false
  );
  assert.equal(
    regimeRfrActivo({
      instrucao: T05,
      consumo: { autorizado: true, ambiguidade: false }
    }),
    true
  );
});

test("aplicarIsolamentoRfrNaEntrada: no-op sem RFR", () => {
  const entrada = {
    mensagem: `x\n\n${MARCA_FIO_RECENTE}]\nCEO: 10%\n`,
    historico: HIST_CONTAMINANTE,
    lfcConsumo: { autorizado: true, ambiguidade: false, nFactos: 1 }
  };
  const out = aplicarIsolamentoRfrNaEntrada(entrada, {
    instrucao: "O que fazer amanhã?",
    consumo: entrada.lfcConsumo
  });
  assert.equal(out.rfr?.activo, false);
  assert.match(out.mensagem, /10%/);
  assert.equal(out.historico.length, 2);
});

test("precedência LFC sob RFR: factosOficiais com LFC, sem temas HFC", async () => {
  await seedLfcValeVerde();
  const entrada = montarEntradaMre({
    instrucao: T05,
    historico: HIST_CONTAMINANTE,
    coaAtivo: { id: COA, nome: "Teste" }
  });
  const out = await enriquecerEntradaMreComLfc(entrada, {
    reader,
    coaId: COA,
    instrucao: T05
  });
  const blob = JSON.stringify(out.factosOficiais || []);
  assert.match(blob, /120 funcionários/);
  assert.equal(/10\s*%/.test(blob), false);
  assert.equal(/elasticidade/i.test(blob), false);
});
