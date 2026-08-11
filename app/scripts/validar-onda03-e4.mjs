/**
 * Validação E4 — Onda 03: intenções Engine abrir_dia / encerrar_dia / consultar_estado.
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
const engineUrl = pathToFileURL(
  path.join(root, "src/executiveEngine/index.js")
).href;
const classUrl = pathToFileURL(
  path.join(root, "src/executiveEngine/classificar.js")
).href;

const {
  inicializarCatalogo,
  selecionarProjeto,
  obterDiaExecutivo,
  obterUltimaContinuidade,
  recarregarCatalogo
} = await import(catUrl);
const { classificarIntencao } = await import(classUrl);
const { executiveEngine } = await import(engineUrl);

inicializarCatalogo();
selecionarProjeto("prj-mg2");
executiveEngine.inicializar();

const checks = [];

function assert(nome, passou) {
  checks.push([nome, Boolean(passou)]);
}

assert(
  "classificar abrir o dia → abrir_dia",
  classificarIntencao("Abrir o dia").id === "abrir_dia"
);
assert(
  "classificar abrir o dia: foco → abrir_dia",
  classificarIntencao("abrir o dia: Avançar build MG2").id === "abrir_dia"
);
assert(
  "abrir o dia ≠ navegar",
  classificarIntencao("Abrir o dia").capacidade === "memoria" &&
    classificarIntencao("Abrir o dia").id !== "navegar"
);
assert(
  "abrir o dia ≠ atuar_em_projetos",
  classificarIntencao("Abrir o dia").id !== "atuar_em_projetos"
);
assert(
  "classificar encerrar o dia → encerrar_dia",
  classificarIntencao("Encerrar o dia").id === "encerrar_dia"
);
assert(
  "classificar estado atual → consultar_estado",
  classificarIntencao("Qual é o estado atual?").id === "consultar_estado"
);

const rAbrir = await executiveEngine.executar({
  texto: "abrir o dia: Avançar build do MG2"
});
assert("exec abrir ok", rAbrir.ok === true);
assert("exec abrir intencao", rAbrir.intencao?.id === "abrir_dia");
assert("após abrir status em_curso", obterDiaExecutivo()?.status === "em_curso");
assert(
  "após abrir intenção",
  obterDiaExecutivo()?.intencaoDoDia === "Avançar build do MG2"
);

const rEstadoAberto = await executiveEngine.executar({
  texto: "Qual é o estado atual?"
});
assert("exec consultar_estado ok", rEstadoAberto.ok === true);
assert(
  "consultar_estado menciona dia em curso",
  /dia em curso/i.test(rEstadoAberto.mensagem || "")
);
assert(
  "consultar_estado menciona foco",
  /Avançar build do MG2/i.test(rEstadoAberto.mensagem || "")
);

const rEncerrarVazio = await executiveEngine.executar({
  texto: "encerrar o dia"
});
assert("encerrar sem continuidade → ok false", rEncerrarVazio.ok === false);
assert(
  "ainda em_curso sem continuidade",
  obterDiaExecutivo()?.status === "em_curso"
);
assert(
  "encerrar vazio pede os três elementos",
  /três elementos|o que andou/i.test(rEncerrarVazio.mensagem || "")
);

const rEncerrarParcial = await executiveEngine.executar({
  texto: "encerrar o dia: Só o que andou"
});
assert("encerrar parcial → ok false", rEncerrarParcial.ok === false);
assert(
  "ainda em_curso após parcial",
  obterDiaExecutivo()?.status === "em_curso"
);
assert(
  "parcial não grava continuidade incompleta",
  !obterUltimaContinuidade()?.oQueAndou?.includes("Só o que andou") ||
    obterDiaExecutivo()?.status === "em_curso"
);

const rEncerrar = await executiveEngine.executar({
  texto:
    "encerrar o dia: Persistência E4 | Validar Gate E4 | Retomar amanhã"
});
assert("exec encerrar ok", rEncerrar.ok === true);
assert("exec encerrar intencao", rEncerrar.intencao?.id === "encerrar_dia");
assert(
  "após encerrar status encerrado",
  obterDiaExecutivo()?.status === "encerrado"
);
assert(
  "continuidade gravada",
  obterUltimaContinuidade()?.oQueAndou?.includes("Persistência E4")
);
assert(
  "mensagem encerrar cita O QUE ANDOU",
  /O QUE ANDOU/i.test(rEncerrar.mensagem || "")
);
assert(
  "mensagem encerrar cita PRÓXIMO PASSO",
  /PRÓXIMO PASSO DE AMANHÃ/i.test(rEncerrar.mensagem || "")
);

// Regressão: continuidade que menciona "abrir dia" não reclassifica.
assert(
  "encerrar com texto 'abrir dia' no corpo → encerrar_dia",
  classificarIntencao(
    "encerrar o dia: X | Y | Abrir dia amanhã"
  ).id === "encerrar_dia"
);

const rEstadoFim = await executiveEngine.executar({
  texto: "Qual é o estado atual?"
});
assert(
  "consultar_estado após encerrar menciona dia encerrado",
  /dia encerrado/i.test(rEstadoFim.mensagem || "")
);

const rReabrir = await executiveEngine.executar({
  texto: "abrir o dia"
});
assert("reabrir por conversa ok", rReabrir.ok === true);
assert(
  "reabrir reapresenta O QUE ANDOU",
  /O QUE ANDOU/i.test(rReabrir.mensagem || "") &&
    /Persistência E4/i.test(rReabrir.mensagem || "")
);
assert(
  "reabrir reapresenta O QUE FICA",
  /O QUE FICA/i.test(rReabrir.mensagem || "") &&
    /Validar Gate E4/i.test(rReabrir.mensagem || "")
);
assert(
  "reabrir reapresenta PRÓXIMO PASSO DE AMANHÃ",
  /PRÓXIMO PASSO DE AMANHÃ/i.test(rReabrir.mensagem || "") &&
    /Retomar amanhã/i.test(rReabrir.mensagem || "")
);
assert(
  "reabrir declara dia retomado",
  /Dia retomado/i.test(rReabrir.mensagem || "")
);
assert(
  "após reabrir status em_curso",
  obterDiaExecutivo()?.status === "em_curso"
);

recarregarCatalogo();
selecionarProjeto("prj-mg2", { registrarAlteracao: false });
assert(
  "reabrir status em_curso após reload",
  obterDiaExecutivo()?.status === "em_curso"
);
assert(
  "reabrir continuidade",
  (obterDiaExecutivo()?.continuidade || []).length >= 1
);

let ok = true;
for (const [nome, passou] of checks) {
  console.log(`${passou ? "OK" : "FAIL"} — ${nome}`);
  if (!passou) ok = false;
}

if (!ok) {
  console.error("Onda 03 E4 FALHOU");
  process.exit(1);
}

console.log("Onda 03 E4: intenções Engine VALIDADAS");
