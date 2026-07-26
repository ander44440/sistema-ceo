/**
 * Estado central de rota (SPA) — sem recarregar a página.
 */
const ROTAS = Object.freeze([
  Object.freeze({
    id: "dashboard",
    path: "#/dashboard",
    titulo: "Centro de Situação",
    descricao: "Posto de comando do Executivo Digital."
  }),
  Object.freeze({
    id: "conversa",
    path: "#/conversa",
    titulo: "Conversa",
    descricao: "Interface principal de diálogo com o CEO."
  }),
  Object.freeze({
    id: "capacidades",
    path: "#/capacidades",
    titulo: "Capacidades",
    descricao: "Módulos e capacidades do sistema."
  }),
  Object.freeze({
    id: "projetos",
    path: "#/projetos",
    titulo: "Projetos",
    descricao: "Contextos operacionais (COA)."
  }),
  Object.freeze({
    id: "conhecimento",
    path: "#/conhecimento",
    titulo: "Conhecimento",
    descricao: "Património e memória do contexto ativo."
  }),
  Object.freeze({
    id: "configuracoes",
    path: "#/configuracoes",
    titulo: "Configurações",
    descricao: "Preferências e infraestrutura da aplicação."
  })
]);

const DEFAULT_ID = "dashboard";

/** @type {{ id: string, path: string, titulo: string, descricao: string }} */
let rotaAtual = ROTAS[0];
const listeners = new Set();

function resolverPorHash() {
  const raw = (location.hash || "").replace(/^#\/?/, "");
  const id = (raw.split("/")[0] || DEFAULT_ID).toLowerCase();
  return ROTAS.find((r) => r.id === id) || ROTAS[0];
}

function publicar() {
  for (const fn of listeners) fn(rotaAtual);
}

export function listarRotas() {
  return ROTAS.slice();
}

export function obterRota() {
  return rotaAtual;
}

export function navegar(destinoId) {
  const alvo = ROTAS.find((r) => r.id === destinoId) || ROTAS[0];
  if (location.hash !== alvo.path) {
    location.hash = alvo.path;
  } else {
    rotaAtual = alvo;
    publicar();
  }
}

export function iniciarRouter() {
  const sync = () => {
    rotaAtual = resolverPorHash();
    if (!location.hash || location.hash === "#") {
      location.replace(rotaAtual.path);
      return;
    }
    publicar();
  };
  window.addEventListener("hashchange", sync);
  sync();
  return () => window.removeEventListener("hashchange", sync);
}

export function onRota(listener) {
  listeners.add(listener);
  listener(rotaAtual);
  return () => listeners.delete(listener);
}
