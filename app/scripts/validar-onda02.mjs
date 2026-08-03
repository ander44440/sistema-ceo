/**
 * Validação do critério de pronto da Onda 02.
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
const estadoUrl = pathToFileURL(
  path.join(root, "src/catalogoProjetos/estadoExecutivo.js")
).href;

const {
  inicializarCatalogo,
  selecionarProjeto,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  obterPainelExecutivo,
  obterProjetoAtivo
} = await import(catUrl);

const {
  classificarEstadoExecutivo,
  gerarResumoExecutivo,
  montarLinhaDoTempo
} = await import(estadoUrl);

inicializarCatalogo();
selecionarProjeto("prj-mg2");
registrarDecisao("Manter foco no MVP operacional", "teste");
registrarPendencia("Revisar backlog da sprint");
registrarPendencia("Urgente: desbloquear build do MG2");
registrarProximaAcao("Abrir dashboard do projeto ativo");

const projeto = obterProjetoAtivo();
const painel = obterPainelExecutivo();
const linha = montarLinhaDoTempo(projeto);
const resumo = gerarResumoExecutivo(projeto, { ativo: true });
const estado = classificarEstadoExecutivo(projeto);

const checks = [
  ["painel existe", Boolean(painel)],
  ["métrica decisões", painel?.metricas?.decisoes >= 1],
  ["métrica pendências", painel?.metricas?.pendencias >= 2],
  ["métrica próximas ações", painel?.metricas?.proximasAcoes >= 1],
  ["última atividade", Boolean(painel?.metricas?.ultimaAtividadeEm)],
  ["estado executivo crítico/atenção", estado === "Crítico" || estado === "Atenção"],
  ["resumo menciona decisões", /decis/i.test(resumo)],
  ["resumo menciona pendências", /pend/i.test(resumo)],
  ["resumo menciona próxima ação", /próxima ação|proximas ações/i.test(resumo)],
  [
    "linha do tempo tem decisão",
    linha.some((e) => e.rotulo === "Decisão registrada")
  ],
  [
    "linha do tempo tem pendência",
    linha.some((e) => e.rotulo === "Pendência criada")
  ],
  [
    "linha do tempo tem próxima ação",
    linha.some((e) => e.rotulo === "Próxima ação adicionada")
  ],
  ["painel.estadoExecutivo", Boolean(painel?.estadoExecutivo)],
  ["painel.resumoExecutivo", Boolean(painel?.resumoExecutivo)]
];

// Troca de projeto → evento "Projeto alterado"
selecionarProjeto("prj-sistema-ceo");
selecionarProjeto("prj-mg2");
const depoisTroca = obterProjetoAtivo();
const linha2 = montarLinhaDoTempo(depoisTroca);
checks.push([
  "evento projeto alterado",
  linha2.some((e) => e.rotulo === "Projeto alterado")
]);

let ok = true;
for (const [nome, passou] of checks) {
  console.log(`${passou ? "OK" : "FAIL"} — ${nome}`);
  if (!passou) ok = false;
}

if (!ok) {
  console.error("Onda 02: critério de pronto FALHOU");
  console.error({ estado, resumo, painel });
  process.exit(1);
}

console.log("Onda 02: critério de pronto VALIDADO");
console.log("--- Resumo gerado ---");
console.log(resumo);
console.log("--- Estado ---", estado);
