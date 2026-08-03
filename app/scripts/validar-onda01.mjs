/**
 * Validação do critério de pronto da Onda 01 (sem browser).
 * Simula: selecionar projeto → registar → “fechar” → “reabrir”.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** localStorage mínimo em memória */
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
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  atualizarEstadoGabinete,
  recarregarCatalogo,
  obterProjetoAtivo,
  obterEstadoGabinete
} = await import(catUrl);

inicializarCatalogo();
selecionarProjeto("prj-mg2");
registrarDecisao("Validar Onda 01 com persistência local", "teste");
registrarPendencia("Retomar o dia no Gabinete sem reconstruir contexto");
registrarProximaAcao("Abrir o sistema e confirmar projeto ativo");
atualizarEstadoGabinete({ rotaId: "projetos" });

const antes = obterProjetoAtivo();
const gabAntes = obterEstadoGabinete();

recarregarCatalogo();

const depois = obterProjetoAtivo();
const gabDepois = obterEstadoGabinete();

const checks = [
  ["projeto ativo id", depois?.id === "prj-mg2"],
  ["projeto ativo nome", depois?.nome === "Motoboy Game 2"],
  [
    "decisão persiste",
    (depois?.decisoes || []).some((d) =>
      d.texto.includes("Validar Onda 01")
    )
  ],
  [
    "pendência persiste",
    (depois?.pendencias || []).some((p) =>
      p.texto.includes("Retomar o dia")
    )
  ],
  [
    "próxima ação persiste",
    (depois?.proximasAcoes || []).some((a) =>
      a.texto.includes("Abrir o sistema")
    )
  ],
  ["gabinete rota", gabDepois?.rotaId === "projetos"],
  ["contagens estáveis", antes.decisoes.length === depois.decisoes.length]
];

let ok = true;
for (const [nome, passou] of checks) {
  console.log(`${passou ? "OK" : "FAIL"} — ${nome}`);
  if (!passou) ok = false;
}

if (!ok) {
  console.error("Onda 01: critério de pronto FALHOU");
  console.error({ antes: gabAntes, depois: gabDepois, projeto: depois?.nome });
  process.exit(1);
}

console.log("Onda 01: critério de pronto VALIDADO");
