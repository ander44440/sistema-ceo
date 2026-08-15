/**
 * IMP-073 — Persistência física + adapter filesystem (CAP-13).
 * Suíte separada. Não substitui mepCeo.test.js (núcleo C1+C2).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, beforeEach, test } from "node:test";
import {
  apagarEvento,
  apagarEventoFisico,
  appendRegistoFisico,
  compactarStoreFisico,
  consultarObjecto,
  contagemEventos,
  criarNovaBaseline,
  criarObjecto,
  definirEstadoTrabalho,
  historico,
  inicializarPersistenciaFisica,
  lerProjeccaoCache,
  listarObjectos,
  persistenciaActiva,
  promoverMaturidade,
  proporMaturidade,
  reiniciarMepParaTestes
} from "./index.js";
import { peekProximo } from "./identificadores.js";
import {
  FICHEIRO_EVENTOS,
  FICHEIRO_MANIFESTO,
  FICHEIRO_PROJECCAO,
  PATH_CANONICO
} from "./adapterFs.js";

const DIR = dirname(fileURLToPath(import.meta.url));
const WORKER = join(DIR, "persistenciaRestartWorker.js");
const EV = Object.freeze({ tipo: "IMP", referencia: "IMP-073" });
const temps = [];

function tempStore() {
  const d = mkdtempSync(join(tmpdir(), "mep-ceo-"));
  temps.push(d);
  return d;
}

function rawLog(dir) {
  const p = join(dir, FICHEIRO_EVENTOS);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function linhasLog(dir) {
  return rawLog(dir)
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
}

function spawnWorker(modo, dir) {
  const r = spawnSync(process.execPath, [WORKER, modo, dir], {
    encoding: "utf8",
    windowsHide: true
  });
  const stdout = String(r.stdout || "").trim();
  let parsed = null;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = null;
  }
  return { status: r.status, parsed, stderr: r.stderr, stdout };
}

beforeEach(() => {
  reiniciarMepParaTestes();
});

after(() => {
  for (const d of temps) {
    rmSync(d, { recursive: true, force: true });
  }
});

test("T1: append após criarObjecto ok", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const r = criarObjecto({
    tipo: "MDL",
    titulo: "t1",
    papel: "ceo_agente",
    lacunaEvidencia: "T1"
  });
  assert.equal(r.ok, true);
  assert.equal(r.objecto.id, "MDL-001");
  const linhas = linhasLog(dir);
  assert.equal(linhas.length, 1);
  const rec = JSON.parse(linhas[0]);
  assert.equal(rec.id, "MEV-001");
  assert.equal(rec.objectoId, "MDL-001");
  assert.equal(rec.objecto.titulo, "t1");
  assert.equal(consultarObjecto("MDL-001").maturidade, "CONCEBIDO");
});

test("T2: recusa C1/alçada/salto não grava no log", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  criarObjecto({
    tipo: "MDL",
    titulo: "base",
    papel: "ceo_agente",
    lacunaEvidencia: "T2"
  });
  const antes = rawLog(dir);
  const iso = criarObjecto({
    tipo: "MDL",
    papel: "ceo_agente",
    lacunaEvidencia: "x",
    payload: { dadosCliente: "segredo" }
  });
  assert.equal(iso.ok, false);
  const salto = promoverMaturidade("MDL-001", "HOMOLOGADO", {
    papeis: ["cto"],
    evidencia: EV
  });
  assert.equal(salto.ok, false);
  const alcada = promoverMaturidade("MDL-001", "DEFINIDO", {
    papel: "ceo_agente",
    evidencia: EV
  });
  assert.equal(alcada.ok, false);
  assert.equal(rawLog(dir), antes);
});

test("T3: restart REAL — dois processos Node", () => {
  const dir = tempStore();
  const a = spawnWorker("gravar", dir);
  assert.equal(a.status, 0, a.stderr || a.stdout);
  assert.equal(a.parsed.ok, true);
  const gravado = a.parsed;
  const b = spawnWorker("ler", dir);
  assert.equal(b.status, 0, b.stderr || b.stdout);
  assert.equal(b.parsed.ok, true);
  const mdl = b.parsed.mdl;
  assert.equal(mdl.id, gravado.id);
  assert.equal(mdl.titulo, "restart-real");
  assert.equal(mdl.maturidade, "BASELINE");
  assert.equal(mdl.congelado, true);
  assert.equal(mdl.trabalho, "EM_INVESTIGAÇÃO");
  assert.equal(b.parsed.contagem, gravado.contagem);
  const bsl = b.parsed.objectos.find((o) => o.tipo === "BSL");
  assert.ok(bsl);
  assert.equal(bsl.id, gravado.bslId);
  const actos = b.parsed.historico.filter((e) => e.objectoId === mdl.id).map((e) => e.acto);
  assert.deepEqual(actos, gravado.historico);
  assert.ok(b.parsed.historico.every((e) => e.transcript === undefined));
});

test("T4: restart após BASELINE + novo BSL; contadores não reutilizam", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const mdl = criarObjecto({
    tipo: "MDL",
    titulo: "t4",
    papel: "ceo_agente",
    lacunaEvidencia: "T4"
  });
  for (const para of ["DEFINIDO", "EM_CONSTRUÇÃO", "EM_VALIDAÇÃO", "HOMOLOGADO", "BASELINE"]) {
    const papeis = para === "BASELINE" ? ["usuario"] : ["cto"];
    assert.equal(
      promoverMaturidade(mdl.objecto.id, para, { papeis, evidencia: EV }).ok,
      true
    );
  }
  const bsl1 = criarNovaBaseline({ papel: "usuario", evidencia: EV, cobre: [mdl.objecto.id] });
  assert.equal(bsl1.ok, true);
  const bsl2 = criarNovaBaseline({ papel: "usuario", evidencia: EV, cobre: [mdl.objecto.id] });
  assert.equal(bsl2.ok, true);
  const id1 = bsl1.objecto.id;
  const id2 = bsl2.objecto.id;
  assert.notEqual(id1, id2);
  reiniciarMepParaTestes();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  assert.equal(consultarObjecto(id1).id, id1);
  assert.equal(consultarObjecto(id2).precedenteBsl, id1);
  assert.equal(consultarObjecto(mdl.objecto.id).congelado, true);
  assert.equal(peekProximo("BSL"), "BSL-003");
  assert.equal(peekProximo("MDL"), "MDL-002");
});

test("T5: proporMaturidade + restart — vigência inalterada", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const r = criarObjecto({
    tipo: "EPC",
    titulo: "t5",
    papel: "ceo_agente",
    lacunaEvidencia: "T5"
  });
  const prop = proporMaturidade(r.objecto.id, "DEFINIDO", { papel: "cto", evidencia: EV });
  assert.equal(prop.ok, true);
  assert.equal(consultarObjecto(r.objecto.id).maturidade, "CONCEBIDO");
  reiniciarMepParaTestes();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  assert.equal(consultarObjecto(r.objecto.id).maturidade, "CONCEBIDO");
  const evs = historico(r.objecto.id);
  assert.equal(evs.some((e) => e.acto === "propor" && e.propostoPara === "DEFINIDO"), true);
});

test("T6: manifesto com identidade inválida — load recusado", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  criarObjecto({ tipo: "MDL", titulo: "keep", papel: "ceo_agente", lacunaEvidencia: "T6" });
  const manPath = join(dir, FICHEIRO_MANIFESTO);
  const original = readFileSync(manPath, "utf8");
  writeFileSync(
    manPath,
    JSON.stringify({
      schemaVersion: 1,
      eixo: "produto",
      produtoCanonico: "outro-produto",
      capacidadeDona: "CAP-13",
      criadoEm: "2026-08-15T00:00:00.000Z"
    }),
    "utf8"
  );
  reiniciarMepParaTestes();
  const boot = inicializarPersistenciaFisica(dir);
  assert.equal(boot.ok, false);
  assert.equal(boot.motivo, "identidade_invalida");
  assert.equal(persistenciaActiva(), false);
  assert.equal(listarObjectos().length, 0);
  assert.equal(linhasLog(dir).length, 1);
  writeFileSync(manPath, original, "utf8");
});

test("T7: envelope contaminado recusado no adapter", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const evento = {
    id: "MEV-999",
    quando: new Date().toISOString(),
    objectoId: "MDL-001",
    tipoObjecto: "MDL",
    estadoAnterior: null,
    estadoNovo: { maturidade: "CONCEBIDO", trabalho: "SEM_PENDÊNCIA" },
    papel: "ceo_agente",
    papeis: ["ceo_agente"],
    acto: "criar",
    classificacao: "hipotese",
    coaId: "coa-mg2"
  };
  const objecto = {
    id: "MDL-001",
    tipo: "MDL",
    eixo: "produto",
    titulo: "x",
    maturidade: "CONCEBIDO",
    trabalho: "SEM_PENDÊNCIA",
    pndIds: [],
    classificacao: "hipotese",
    evidencia: null,
    lacunaEvidencia: "x",
    payload: {},
    referenciasExternas: [],
    criadoPor: "ceo_agente",
    congelado: false,
    cobre: [],
    precedenteBsl: null
  };
  const r = appendRegistoFisico(dir, evento, objecto);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "envelope_contaminado");
  const comKnw = appendRegistoFisico(
    dir,
    {
      id: "MEV-998",
      quando: new Date().toISOString(),
      objectoId: "MDL-001",
      tipoObjecto: "MDL",
      estadoAnterior: null,
      estadoNovo: { maturidade: "CONCEBIDO", trabalho: "SEM_PENDÊNCIA" },
      papel: "ceo_agente",
      papeis: ["ceo_agente"],
      acto: "criar",
      classificacao: "hipotese"
    },
    { ...objecto, payload: { itemKnwConteudo: "copia" } }
  );
  assert.equal(comKnw.ok, false);
});

test("T8: JSONL truncado — fail closed", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  criarObjecto({ tipo: "MDL", titulo: "t8", papel: "ceo_agente", lacunaEvidencia: "T8" });
  const p = join(dir, FICHEIRO_EVENTOS);
  writeFileSync(p, `${rawLog(dir)}{"id":"MEV-002","quando":`, "utf8");
  const truncado = rawLog(dir);
  reiniciarMepParaTestes();
  const boot = inicializarPersistenciaFisica(dir);
  assert.equal(boot.ok, false);
  assert.equal(boot.motivo, "log_truncado");
  assert.equal(rawLog(dir), truncado);
  assert.equal(listarObjectos().length, 0);
});

test("T9: grafo de imports do adapter sem frentes alheias", () => {
  const ficheiros = [
    "adapterFs.js",
    "persistencia.js",
    "registo.js",
    "index.js",
    "persistenciaRestartWorker.js"
  ];
  const texto = ficheiros.map((f) => readFileSync(join(DIR, f), "utf8")).join("\n");
  assert.doesNotMatch(texto, /from ["'].*motorExecucao/);
  assert.doesNotMatch(texto, /from ["'].*\/mre\//);
  assert.doesNotMatch(texto, /from ["'].*camadaConhecimento/);
  assert.doesNotMatch(texto, /from ["'].*executiveEngine/);
  assert.doesNotMatch(texto, /from ["'].*continuidadeGate/);
  assert.doesNotMatch(texto, /from ["'].*catalogoProjetos/);
  assert.doesNotMatch(texto, /from ["'].*modules\/conversa/);
  assert.doesNotMatch(texto, /localStorage/);
  assert.doesNotMatch(texto, /from ["']node:child_process["']/);
});

test("T10: apagarEvento após persistência — ficheiro inalterado", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  criarObjecto({ tipo: "MDL", titulo: "t10", papel: "ceo_agente", lacunaEvidencia: "T10" });
  const antes = rawLog(dir);
  assert.equal(apagarEvento().motivo, "historico_append_only");
  assert.equal(apagarEventoFisico().motivo, "historico_append_only");
  assert.equal(compactarStoreFisico().motivo, "historico_append_only");
  assert.equal(rawLog(dir), antes);
});

test("T11: projecção divergente — log vence", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  criarObjecto({ tipo: "MDL", titulo: "do-log", papel: "ceo_agente", lacunaEvidencia: "T11" });
  writeFileSync(
    join(dir, FICHEIRO_PROJECCAO),
    JSON.stringify({
      logHash: "divergente",
      contagemEventos: 99,
      objectos: [{ id: "MDL-001", titulo: "da-cache", tipo: "MDL" }]
    }),
    "utf8"
  );
  reiniciarMepParaTestes();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  assert.equal(consultarObjecto("MDL-001").titulo, "do-log");
  assert.equal(lerProjeccaoCache(dir).objectos[0].titulo, "da-cache");
});

test("T12: primeiro boot — manifesto + log vazio, sem seed", () => {
  const dir = tempStore();
  const boot = inicializarPersistenciaFisica(dir);
  assert.equal(boot.ok, true);
  assert.equal(boot.primeiroBoot, true);
  const man = JSON.parse(readFileSync(join(dir, FICHEIRO_MANIFESTO), "utf8"));
  assert.equal(man.eixo, "produto");
  assert.equal(man.produtoCanonico, "sistema-ceo");
  assert.equal(man.capacidadeDona, "CAP-13");
  assert.equal(linhasLog(dir).length, 0);
  assert.equal(listarObjectos().length, 0);
  assert.equal(contagemEventos(), 0);
});

test("T13: reiniciarMepParaTestes não apaga o store", () => {
  const dir = tempStore();
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  criarObjecto({ tipo: "MDL", titulo: "t13", papel: "ceo_agente", lacunaEvidencia: "T13" });
  const antes = rawLog(dir);
  assert.equal(persistenciaActiva(), true);
  reiniciarMepParaTestes();
  assert.equal(persistenciaActiva(), false);
  assert.equal(rawLog(dir), antes);
  assert.equal(PATH_CANONICO.endsWith(join("mep-ceo", "store")) || PATH_CANONICO.includes("mep-ceo"), true);
  assert.notEqual(dir, PATH_CANONICO);
});

test("T14: isolamento entre produtos — stores distintos", () => {
  const ceo = tempStore();
  const outro = tempStore();
  assert.equal(inicializarPersistenciaFisica(ceo).ok, true);
  criarObjecto({ tipo: "MDL", titulo: "so-ceo", papel: "ceo_agente", lacunaEvidencia: "T14" });
  writeFileSync(
    join(outro, FICHEIRO_MANIFESTO),
    JSON.stringify({
      schemaVersion: 1,
      eixo: "produto",
      produtoCanonico: "motoboy-game-2",
      capacidadeDona: "CAP-13",
      criadoEm: "2026-08-15T00:00:00.000Z"
    }),
    "utf8"
  );
  writeFileSync(join(outro, FICHEIRO_EVENTOS), "", "utf8");
  reiniciarMepParaTestes();
  const bootOutro = inicializarPersistenciaFisica(outro);
  assert.equal(bootOutro.ok, false);
  assert.equal(bootOutro.motivo, "identidade_invalida");
  const bootCeo = inicializarPersistenciaFisica(ceo);
  assert.equal(bootCeo.ok, true);
  assert.equal(consultarObjecto("MDL-001").titulo, "so-ceo");
  assert.equal(rawLog(outro).includes("MDL-001"), false);
  assert.equal(rawLog(ceo).includes("so-ceo"), true);
});

test("T9b: pasta mepCeo sem imports de frentes alheias (ficheiros de persistência)", () => {
  const ficheiros = readdirSync(DIR).filter((f) => f.endsWith(".js"));
  const texto = ficheiros
    .filter((f) => f !== "mepCeo.test.js" && f !== "mepCeo.persistencia.test.js")
    .map((f) => readFileSync(join(DIR, f), "utf8"))
    .join("\n");
  assert.doesNotMatch(texto, /from ["'].*motorExecucao/);
  assert.doesNotMatch(texto, /from ["'].*camadaConhecimento/);
});
