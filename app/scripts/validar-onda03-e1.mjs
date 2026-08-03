/**
 * Validação E1 — Onda 03: diaExecutivo + continuidade persistem após “reabrir”.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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

globalThis.localStorage = criarStorage();

const catUrl = pathToFileURL(
  path.join(root, "src/catalogoProjetos/index.js")
).href;

const {
  inicializarCatalogo,
  selecionarProjeto,
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  obterDiaExecutivo,
  obterUltimaContinuidade,
  recarregarCatalogo,
  obterProjetoAtivo
} = await import(catUrl);

inicializarCatalogo();
selecionarProjeto("prj-mg2");

let dia = obterDiaExecutivo();
const checks = [["status inicial nao_iniciado", dia?.status === "nao_iniciado"]];

abrirDiaExecutivo({ intencaoDoDia: "Avançar build do MG2" });
dia = obterDiaExecutivo();
checks.push(["após abrir = em_curso", dia?.status === "em_curso"]);
checks.push(["abertoEm gravado", Boolean(dia?.abertoEm)]);
checks.push(["intenção gravada", dia?.intencaoDoDia === "Avançar build do MG2"]);

const fim = encerrarDiaExecutivo({
  oQueAndou: "Persistência do dia executivo",
  oQueFica: "UI Abrir/Encerrar no Centro",
  proximoPassoAmanha: "Implementar D01/D05/D06"
});
checks.push(["encerrar ok", fim?.ok === true]);
dia = obterDiaExecutivo();
checks.push(["após encerrar = encerrado", dia?.status === "encerrado"]);
checks.push(["continuidade length ≥ 1", (dia?.continuidade || []).length >= 1]);

recarregarCatalogo();
selecionarProjeto("prj-mg2", { registrarAlteracao: false });

const depois = obterDiaExecutivo();
const cont = obterUltimaContinuidade();
const ativo = obterProjetoAtivo();

checks.push(["reabrir status encerrado", depois?.status === "encerrado"]);
checks.push(["reabrir continuidade", (depois?.continuidade || []).length >= 1]);
checks.push([
  "último registro oQueAndou",
  cont?.oQueAndou?.includes("Persistência")
]);
checks.push([
  "próximo passo amanhã",
  cont?.proximoPassoAmanha?.includes("D01")
]);
checks.push(["projeto ativo MG2", ativo?.id === "prj-mg2"]);
checks.push([
  "histórico tem Dia aberto/encerrado",
  (ativo?.historicoResumido || []).some((h) => /Dia (aberto|encerrado)/i.test(h.texto))
]);

let ok = true;
for (const [nome, passou] of checks) {
  console.log(`${passou ? "OK" : "FAIL"} — ${nome}`);
  if (!passou) ok = false;
}

if (!ok) {
  console.error("Onda 03 E1 FALHOU", { depois, cont });
  process.exit(1);
}

console.log("Onda 03 E1: persistência diaExecutivo VALIDADA");
