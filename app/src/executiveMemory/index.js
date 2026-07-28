/**
 * Memória Executiva — vista do workspace do projeto ativo.
 * Persistência local via catálogo de projetos (Onda 01 / ADR-015).
 */

import {
  definirProximoPasso as catDefinirProximoPasso,
  listarProjetos,
  obterDiaExecutivo,
  obterPainelExecutivo,
  obterProjetoAtivo,
  obterUltimaContinuidade,
  obterWorkspaceAtivo,
  registrarAcaoHistorico,
  registrarDecisao as catRegistrarDecisao,
  registrarPendencia as catRegistrarPendencia,
  registrarProximaAcao as catRegistrarProximaAcao,
  selecionarProjetoPorRef
} from "../catalogoProjetos/index.js";
import { gerarResumoDoDia } from "../catalogoProjetos/estadoExecutivo.js";

/**
 * @typedef {object} EstadoMemoria
 * @property {Array<{ id: string, nome: string, desde: string }>} projetosAtivos
 * @property {object[]} decisoes
 * @property {object[]} pendencias
 * @property {object[]} proximasAcoes
 * @property {object[]} ultimasAcoes
 * @property {string|null} proximoPasso
 * @property {string|null} sessaoIniciadaEm
 * @property {string|null} atualizadoEm
 * @property {{ id: string, nome: string } | null} projetoAtivo
 */

function montarEstado() {
  const ws = obterWorkspaceAtivo();
  const ativo = ws.projeto;
  const catalogo = listarProjetos();
  const projetosAtivos = catalogo
    .filter((p) => p.ativo || p.estado === "ativo")
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      desde: p.criadoEm
    }));

  if (ativo && !projetosAtivos.some((p) => p.id === ativo.id)) {
    projetosAtivos.unshift({
      id: ativo.id,
      nome: ativo.nome,
      desde: ativo.criadoEm
    });
  }

  const ultimasAcoes = (ws.historicoResumido || []).map((h) => ({
    id: h.id,
    quando: h.quando,
    instrucao: h.texto,
    capacidade: "historico",
    intencao: "",
    ok: true,
    resumo: h.texto
  }));

  return {
    projetosAtivos,
    projetoAtivo: ativo
      ? { id: ativo.id, nome: ativo.nome }
      : null,
    decisoes: ws.decisoes || [],
    pendencias: ws.pendencias || [],
    proximasAcoes: ws.proximasAcoes || [],
    ultimasAcoes,
    proximoPasso: ws.proximoPasso,
    sessaoIniciadaEm: ativo?.criadoEm || null,
    atualizadoEm: ativo?.ultimaAtividadeEm || null
  };
}

/**
 * Snapshot do estado atual (projeto ativo).
 * @returns {EstadoMemoria}
 */
export function obterEstado() {
  return montarEstado();
}

export function lerMemoria() {
  return obterEstado();
}

/** Compat: reinício não apaga persistência — apenas rehidrata. */
export function reiniciarMemoria() {
  return obterEstado();
}

/**
 * @param {{ id?: string, nome: string }} projeto
 */
export function registrarProjetoAtivo(projeto) {
  const selecionado = selecionarProjetoPorRef(projeto);
  return selecionado
    ? { id: selecionado.id, nome: selecionado.nome, desde: selecionado.criadoEm }
    : null;
}

/**
 * @param {string} texto
 * @param {string} [origem]
 */
export function registrarDecisao(texto, origem) {
  return catRegistrarDecisao(texto, origem);
}

/**
 * @param {string} texto
 */
export function registrarPendencia(texto) {
  return catRegistrarPendencia(texto);
}

/**
 * @param {string} texto
 */
export function registrarProximaAcao(texto) {
  return catRegistrarProximaAcao(texto);
}

/** @param {string|null} texto */
export function definirProximoPasso(texto) {
  return catDefinirProximoPasso(texto);
}

/**
 * @param {object} acao
 */
export function registrarAcao(acao) {
  return registrarAcaoHistorico(acao);
}

/**
 * Atualiza a memória após uma instrução processada pelo Executive Engine.
 * Regras determinísticas — sem IA.
 *
 * @param {object} evento
 */
export function atualizarAposInstrucao(evento) {
  const instrucao = String(evento.instrucao || "").trim();
  const capacidade = evento.capacidade || "desconhecida";
  const intencaoId = (evento.intencao && evento.intencao.id) || "";
  const ok = evento.ok !== false;
  const mensagem = String(evento.mensagem || "").trim();

  registrarAcao({
    instrucao,
    capacidade,
    intencao: intencaoId,
    ok,
    resumo: mensagem.slice(0, 180)
  });

  if (
    intencaoId === "consultar_estado" ||
    intencaoId === "abrir_dia" ||
    intencaoId === "encerrar_dia" ||
    intencaoId === "pergunta_data" ||
    intencaoId === "pergunta_hora" ||
    intencaoId === "pergunta_identidade" ||
    intencaoId === "analisar_pendencias"
  ) {
    return obterEstado();
  }

  const lower = instrucao.toLowerCase();

  if (capacidade === "projetos" || /\b(projeto|coa|mg2|motoboy)\b/.test(lower)) {
    const nome =
      (evento.dados && evento.dados.projeto) ||
      extrairNomeProjeto(instrucao);
    if (nome) registrarProjetoAtivo({ nome: String(nome) });
  }

  const jaPersistido = Boolean(evento.dados && evento.dados.jaPersistido);

  if (
    !jaPersistido &&
    (intencaoId === "registrar_decisao" ||
      /\b(decidi|decidir|aprovado|aprovar|defini que|fica decidido|decis[aã]o\s*:)\b/.test(
        lower
      ) ||
      /\bregistrar\s+decis/.test(lower))
  ) {
    registrarDecisao(extrairConteudo(instrucao, /decis/i), capacidade);
  }

  if (
    !jaPersistido &&
    (intencaoId === "registrar_pendencia" ||
      /\b(pendente|pend[eê]ncia|TODO|a fazer|falt[ao]|precisa|necess[aá]rio)\b/.test(
        lower
      ) ||
      /\b(criar|registrar)\s+pend/.test(lower))
  ) {
    registrarPendencia(extrairConteudo(instrucao, /pend/i));
  }

  if (
    !jaPersistido &&
    (intencaoId === "registrar_proxima_acao" ||
      /\bpr[oó]xima\s+a[cç][aã]o\b/.test(lower) ||
      /\bpr[oó]ximas\s+a[cç][oõ]es\b/.test(lower) ||
      /\bregistrar\s+pr[oó]xima\b/.test(lower))
  ) {
    registrarProximaAcao(extrairConteudo(instrucao, /pr[oó]xima|a[cç][aã]o/i));
  }

  definirProximoPasso(derivarProximoPasso({ capacidade, ok, instrucao }));

  return obterEstado();
}

function extrairConteudo(instrucao, marcador) {
  const raw = String(instrucao || "").trim();
  const aposDoisPontos = raw.match(/:\s*(.+)$/);
  if (aposDoisPontos) return aposDoisPontos[1].trim();
  const semPrefixo = raw.replace(
    /^(registrar|criar|adicionar)\s+/i,
    ""
  );
  if (marcador.test(semPrefixo)) {
    return semPrefixo.replace(/^[^:]+:\s*/, "").trim() || raw;
  }
  return raw;
}

function extrairNomeProjeto(instrucao) {
  const mg2 = instrucao.match(/\b(MG2|Motoboy Game 2)\b/i);
  if (mg2) return mg2[1] === "MG2" ? "Motoboy Game 2" : mg2[1];
  const citado = instrucao.match(/projeto\s+[«"']?([^«"'.!?,;]+)[»"']?/i);
  if (citado) return citado[1].trim();
  return null;
}

function derivarProximoPasso({ capacidade, ok, instrucao }) {
  if (!ok) {
    return "Revisar a última instrução que falhou e reenviar com mais clareza.";
  }
  switch (capacidade) {
    case "projetos":
      return "Confirmar o projeto ativo ou detalhar o próximo passo do trabalho.";
    case "dashboard":
      return "Usar a conversa para transformar a visão do dashboard em uma ação.";
    case "conhecimento":
      return "Indicar qual conhecimento deve ser consultado ou promovido.";
    case "navegacao":
      return "Operar no módulo aberto ou pedir o estado atual.";
    case "ferramentas":
      return "Especificar o meio/ferramenta necessária para o objetivo.";
    case "memoria":
      return "Escolher o próximo objetivo executivo com base no resumo.";
    default:
      return instrucao
        ? "Definir o efeito esperado da última instrução ou pedir o estado atual."
        : "Enviar uma instrução executiva concreta.";
  }
}

/**
 * Resumo executivo do projeto ativo (inclui status do dia — Onda 03).
 * @returns {string}
 */
export function resumirEstado() {
  const ativo = obterProjetoAtivo();
  if (!ativo) {
    return "Nenhum projeto ativo no gabinete.";
  }

  const dia = obterDiaExecutivo();
  const continuidade = obterUltimaContinuidade();
  const resumoDia = gerarResumoDoDia(ativo, { dia, continuidade });

  const painel = obterPainelExecutivo();
  const linhas = [resumoDia];

  if (painel?.resumoExecutivo) {
    linhas.push("");
    linhas.push(painel.resumoExecutivo);
  }

  return linhas.join("\n");
}

export const executiveMemory = {
  obterEstado,
  lerMemoria,
  resumirEstado,
  atualizarAposInstrucao,
  registrarProjetoAtivo,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  definirProximoPasso,
  registrarAcao,
  reiniciarMemoria
};

export default executiveMemory;
