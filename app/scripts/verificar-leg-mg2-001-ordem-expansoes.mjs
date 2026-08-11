/**
 * LEG-MG2-001 — Verificação executável da ordem de expansões (JOB-000064).
 * Implementa a «legislação operacional» MG2: itens 2 (silhuetas carros) e 3 (DEC-MVP-001).
 * Princípio educativo (CON-001 Art. 10): o script ensina o que a ordem exige e como provar.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mg2Root = process.env.MG2_REPO_ROOT || "E:/anderson/Projoto motoboy game";
const canvasPath = path.join(mg2Root, "src/prototypes/worldLab2/WorldLab2Canvas.jsx");
const legDocPath = path.join(mg2Root, "docs/LEG-MG2-001-ordem-expansoes.md");

const checks = [];

function assert(nome, passou, detalhe = "") {
  checks.push({ nome, ok: Boolean(passou), detalhe });
}

if (!fs.existsSync(canvasPath)) {
  console.error("MG2 canvas não encontrado:", canvasPath);
  process.exit(2);
}

const src = fs.readFileSync(canvasPath, "utf8");

const revM = src.match(/const SCENE_REV = (\d+)/);
const sceneRev = revM ? Number(revM[1]) : 0;
assert("LEG-MG2-001 — documento normativo MG2", fs.existsSync(legDocPath));

assert("SCENE_REV >= 156 (LEG-MG2-001 repetição)", sceneRev >= 156, `SCENE_REV=${sceneRev}`);

assert("makeTrafficCar — ramo compact (JOB-063 fatia 2)", /kind === 'compact'/.test(src));
assert("makeTrafficCar — ramo suv (JOB-063 fatia 2)", /kind === 'suv'/.test(src));
assert("makeTrafficCar — sedan com linha de cintura", /waistLine|linha de cintura/.test(src));

assert(
  "DEC-MVP-001 — cancelActiveJob com taxa zerada",
  /DEC-MVP-001/.test(src) &&
    /cancelActiveJob/.test(src) &&
    /pay = 0/.test(src) &&
    /taxa R\$ 0/i.test(src)
);

assert("Atalho X — cancelamento corrida activa", /cancelActiveJob\(audio\)/.test(src));

const build = spawnSync("npm", ["run", "build"], {
  cwd: mg2Root,
  shell: true,
  encoding: "utf8"
});
assert("MG2 npm run build", build.status === 0, build.status !== 0 ? (build.stderr || build.stdout || "").slice(0, 200) : "OK");

const falhas = checks.filter((c) => !c.ok);
for (const c of checks) {
  console.log(`${c.ok ? "OK" : "FAIL"} — ${c.nome}${c.detalhe ? ` (${c.detalhe})` : ""}`);
}

if (falhas.length) {
  console.error(`\n${falhas.length}/${checks.length} verificações falharam.`);
  process.exit(1);
}

console.log(`\nLEG-MG2-001: ${checks.length}/${checks.length} verificações OK.`);
