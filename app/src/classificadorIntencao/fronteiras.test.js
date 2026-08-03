/**
 * IMP-057 E6 — Fronteiras, regressão e anti-bypass.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import { executiveEngine } from "../executiveEngine/index.js";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import {
  classificar,
  classificarEEncaminhar,
  CLASSES_INTENCAO,
  LIMIAR_CONFIANCA,
  validarSaida,
  montarSaida
} from "./index.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

function ler(rel) {
  return readFileSync(join(rootSrc, rel), "utf8");
}

const MODULOS_PUROS = [
  "classificadorIntencao/dominio.js",
  "classificadorIntencao/lexicon.js",
  "classificadorIntencao/regras.js",
  "classificadorIntencao/encaminhador.js"
];

test("E6-CA1: Classificador puro sem Fila / SDK / Motor / Dispatcher", () => {
  for (const rel of MODULOS_PUROS) {
    const src = ler(rel);
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
    assert.equal(/\bfetch\s*\(/.test(src), false, rel);
    assert.equal(/publicarJob|criarJobDoParecer/.test(src), false, rel);
    assert.equal(/from\s+["'].*motorExecucao/.test(src), false, rel);
    assert.equal(/from\s+["'].*executiveEngine/.test(src), false, rel);
    assert.equal(/from\s+["'].*dispatcher/i.test(src), false, rel);
    assert.equal(/node:fs|writeFile/.test(src), false, rel);
  }
});

test("E6-CA1: C1 e C2 não publicam Job", async () => {
  let jobs = 0;
  const pub = async () => {
    jobs += 1;
    return { id: "JOB-LEAK", estado: "pending" };
  };
  await executiveEngine.executar("Bom dia", { publicarJob: pub });
  await executiveEngine.executar("Como priorizar o pagamento no MG2?", {
    publicarJob: pub
  });
  assert.equal(jobs, 0);
});

test("E6-CA1: ambiguidade não força C3 nem Job", () => {
  const vago = classificar("resolve isso");
  assert.ok(
    vago.precisaClarificacao === true || vago.confianca < LIMIAR_CONFIANCA
  );
  assert.equal(vago.permiteJob, false);
  assert.notEqual(
    vago.classe === "trabalho_executivo" && vago.permiteJob === true,
    true
  );
});

test("E6-CA2: stub legado é adapter canónico (origem classificador_canonico)", () => {
  const src = ler("executiveEngine/classificar.js");
  assert.match(src, /classificador_canonico/);
  assert.match(src, /classificarCanonico|classificadorIntencao\/regras/);
  assert.equal(/origem:\s*["']stub["']/.test(src), false);

  const i = classificarIntencao("listar jobs");
  assert.equal(i.origem, "classificador_canonico");
  assert.ok(i.classificacao);
});

test("E6-CA3: regressão C4 memoria + fila", async () => {
  const estado = await executiveEngine.executar("qual e o estado atual");
  assert.equal(estado.dados?.classificacao?.classe, "comando_operacional");
  assert.equal(estado.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(estado.capacidade, "memoria");
  assert.equal(estado.dados?.motorAcionado, false);

  const jobs = await executiveEngine.executar("listar jobs");
  assert.equal(jobs.capacidade, "fila");
  assert.equal(jobs.dados?.classificacao?.classe, "comando_operacional");
  assert.notEqual(jobs.dados?.classificacao?.classe, "trabalho_executivo");
});

test("E6-CA4: razaoCurta sem segredos (amostra + validação)", () => {
  const amostras = [
    "Bom dia",
    "listar jobs",
    "Implementa o outdoor e despacha",
    "Como priorizar o pagamento no MG2?",
    "Quero que você resolva os bugs do projeto."
  ];
  for (const t of amostras) {
    const s = classificar(t);
    assert.equal(/CURSOR_API_KEY|sk-[a-zA-Z0-9]{10,}/i.test(s.razaoCurta), false, t);
  }
  const rejeitado = validarSaida(
    montarSaida("conhecimento_geral", 0.9, "ok")
  );
  assert.equal(rejeitado.ok, true);
  const comSegredo = validarSaida({
    classe: "conhecimento_geral",
    confianca: 0.9,
    razaoCurta: "leak CURSOR_API_KEY=abc",
    destino: "resposta_leve",
    usaFrenteActiva: false,
    permiteJob: false
  });
  assert.equal(comSegredo.ok, false);
});

test("E6: Conversa e Centro/Painel passam pelo Núcleo (não saltam Classificador)", () => {
  const conversa = ler("modules/conversa/conversa.js");
  const centro = ler("modules/centroSituacao/centroSituacao.js");
  assert.match(conversa, /executiveEngine\.executar/);
  assert.match(centro, /executiveEngine\.executar/);
  // Não classificam à margem do Núcleo
  assert.equal(/classificarIntencao\s*\(/.test(conversa), false);
  assert.equal(/classificarIntencao\s*\(/.test(centro), false);
  assert.equal(/from\s+["'].*classificadorIntencao\/regras/.test(conversa), false);
  assert.equal(/from\s+["'].*classificadorIntencao\/regras/.test(centro), false);
});

test("E6: um só entrypoint canónico — classificar em regras.js; Núcleo via executar", () => {
  const idx = ler("executiveEngine/index.js");
  assert.match(idx, /primeiroPassoClassificar|executarPorDestino/);
  assert.match(idx, /classificarIntencao/);

  // Adapter aponta ao canónico
  const adapter = ler("executiveEngine/classificar.js");
  assert.match(adapter, /from\s+["']\.\.\/classificadorIntencao\/regras\.js["']/);

  // Função pura canónica existe uma vez
  const regras = ler("classificadorIntencao/regras.js");
  assert.match(regras, /export function classificar\(/);
});

test("E6: isolamento — destinos/integração não importam Dispatcher nem @cursor/sdk", () => {
  for (const rel of [
    "classificadorIntencao/destinos.js",
    "classificadorIntencao/integracaoNucleo.js",
    "executiveEngine/index.js"
  ]) {
    const src = ler(rel);
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
    assert.equal(/from\s+["']@cursor/.test(src), false, rel);
  }
});

test("E6: enum C1–C4 produzível e exclusivo; CA2 smoke", () => {
  assert.equal(CLASSES_INTENCAO.length, 4);
  const mapa = {
    conhecimento_geral: classificar("Que horas são?"),
    conversa_projeto: classificar("Onde estamos no outdoor?", {
      frenteActiva: true
    }),
    trabalho_executivo: classificar("Implementa o outdoor e despacha"),
    comando_operacional: classificar("listar jobs")
  };
  const classes = Object.values(mapa).map((s) => s.classe);
  assert.deepEqual(new Set(classes).size, 4);
  for (const [esperada, s] of Object.entries(mapa)) {
    assert.equal(s.classe, esperada);
  }
});

test("E6 demo regressão C1–C4 (fecho)", async () => {
  const c1 = await executiveEngine.executar("Bom dia");
  const c2 = await executiveEngine.executar(
    "Como priorizar o pagamento no MG2?",
    {
      publicarJob: async () => {
        throw new Error("C2 não deve publicar");
      }
    }
  );
  const c3 = await executiveEngine.executar(
    "Quero que você resolva os bugs do projeto."
  );
  resetStoreContinuidadePadrao();
  const c4 = await executiveEngine.executar("listar jobs");

  console.log("\n--- DEMO E6/E7 C1–C4 ---");
  for (const [nome, out] of [
    ["C1", c1],
    ["C2", c2],
    ["C3", c3],
    ["C4", c4]
  ]) {
    console.log(nome, {
      classe: out.dados?.classificacao?.classe,
      destino: out.dados?.encaminhamento?.destino,
      capacidade: out.capacidade,
      motor: out.dados?.motorAcionado,
      modo: out.modo
    });
  }
  console.log("--- fim DEMO ---\n");

  assert.equal(c1.dados?.encaminhamento?.destino, "resposta_leve");
  assert.equal(c2.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(c3.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(c4.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(c3.dados?.motorAcionado, true);
  assert.equal(c4.capacidade, "fila");
});

test("E6: ficheiros do módulo Classificador inventariados", () => {
  const ficheiros = readdirSync(__dirname).filter((f) => f.endsWith(".js"));
  for (const obrigatorio of [
    "dominio.js",
    "lexicon.js",
    "regras.js",
    "encaminhador.js",
    "integracaoNucleo.js",
    "destinos.js",
    "index.js",
    "fronteiras.test.js"
  ]) {
    assert.ok(ficheiros.includes(obrigatorio), obrigatorio);
  }
});
