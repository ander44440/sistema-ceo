/**
 * Catálogo permanente de projetos + workspace por projeto (Onda 01).
 */

import { carregarDocumento, gravarDocumento } from "./persistencia.js";
import { montarPainelExecutivo } from "./estadoExecutivo.js";
import {
  copiarDiaExecutivo,
  dataRefLocal,
  diaExecutivoVazio,
  garantirDiaNoProjeto,
  obterUltimaContinuidadeDoProjeto
} from "./diaExecutivo.js";

const MAX_DECISOES = 50;
const MAX_PENDENCIAS = 50;
const MAX_PROXIMAS = 50;
const MAX_HISTORICO = 40;
const MAX_CONTINUIDADE = 60;

/** @type {object | null} */
let doc = null;
let seq = 0;

function agoraIso() {
  return new Date().toISOString();
}

function novoId(prefixo) {
  seq += 1;
  return `${prefixo}-${Date.now()}-${seq}`;
}

function workspaceVazio() {
  return {
    decisoes: [],
    pendencias: [],
    proximasAcoes: [],
    historicoResumido: [],
    /** Sugestão automática do motor — distinta das próximas ações registadas. */
    proximoPassoSugerido: null,
    /** Fluxo Executivo Diário (Onda 03). */
    diaExecutivo: diaExecutivoVazio()
  };
}

function projetoSeed(id, nome, descricao, estado) {
  const agora = agoraIso();
  return {
    id,
    nome,
    descricao,
    estado,
    criadoEm: agora,
    ultimaAtividadeEm: agora,
    ...workspaceVazio()
  };
}

function documentoInicial() {
  const projetos = [
    projetoSeed(
      "prj-sistema-ceo",
      "Sistema CEO",
      "Governança e evolução do próprio Sistema Executivo de Governança.",
      "ativo"
    ),
    projetoSeed(
      "prj-mg2",
      "Motoboy Game 2",
      "Primeiro contexto operacional do patrocinador (ADR-015).",
      "ativo"
    ),
    projetoSeed(
      "prj-ultima-milha",
      "Última Milha",
      "Contexto operacional de last mile / Flow Last Mile.",
      "pausado"
    )
  ];
  return {
    versao: 1,
    projetoAtivoId: "prj-mg2",
    gabinete: {
      rotaId: "dashboard",
      atualizadoEm: agoraIso()
    },
    projetos
  };
}

function persistir() {
  if (!doc) return;
  gravarDocumento(doc);
}

function garantirDoc() {
  if (doc) return doc;
  doc = carregarDocumento() || documentoInicial();
  if (!doc.gabinete) {
    doc.gabinete = { rotaId: "dashboard", atualizadoEm: agoraIso() };
  }
  if (!doc.projetoAtivoId || !doc.projetos.find((p) => p.id === doc.projetoAtivoId)) {
    doc.projetoAtivoId = doc.projetos[0]?.id || null;
  }
  for (const p of doc.projetos) {
    if (!p.decisoes) p.decisoes = [];
    if (!p.pendencias) p.pendencias = [];
    if (!p.proximasAcoes) p.proximasAcoes = [];
    if (!p.historicoResumido) p.historicoResumido = [];
    if (p.proximoPassoSugerido === undefined) p.proximoPassoSugerido = null;
    garantirDiaNoProjeto(p);
  }
  persistir();
  return doc;
}

function marcarAtividade(projeto) {
  projeto.ultimaAtividadeEm = agoraIso();
}

/**
 * Hidrata o catálogo a partir do armazenamento local.
 */
export function inicializarCatalogo() {
  garantirDoc();
  return obterProjetoAtivo();
}

/**
 * Descarta o estado em RAM e relê do armazenamento (simula reabrir o sistema).
 */
export function recarregarCatalogo() {
  doc = null;
  return inicializarCatalogo();
}

export function listarProjetos() {
  return garantirDoc().projetos.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    estado: p.estado,
    criadoEm: p.criadoEm,
    ultimaAtividadeEm: p.ultimaAtividadeEm,
    ativo: p.id === doc.projetoAtivoId
  }));
}

export function obterProjeto(id) {
  garantirDoc();
  const p = doc.projetos.find((x) => x.id === id);
  return p ? JSON.parse(JSON.stringify(p)) : null;
}

export function obterProjetoAtivo() {
  garantirDoc();
  const p = doc.projetos.find((x) => x.id === doc.projetoAtivoId);
  return p ? JSON.parse(JSON.stringify(p)) : null;
}

export function obterProjetoAtivoId() {
  return garantirDoc().projetoAtivoId;
}

/**
 * @param {string} id
 * @param {{ registrarAlteracao?: boolean }} [opts]
 */
export function selecionarProjeto(id, opts = {}) {
  garantirDoc();
  const p = doc.projetos.find((x) => x.id === id);
  if (!p) return null;
  const trocou = doc.projetoAtivoId !== p.id;
  doc.projetoAtivoId = p.id;
  if (trocou && opts.registrarAlteracao !== false) {
    acrescentarHistorico(p, "Projeto alterado");
  }
  marcarAtividade(p);
  persistir();
  return obterProjetoAtivo();
}

/**
 * Resolve por id ou nome (case-insensitive / alias MG2).
 * @param {{ id?: string, nome?: string }} ref
 */
export function selecionarProjetoPorRef(ref) {
  garantirDoc();
  const nome = String(ref?.nome || "").trim();
  const id = ref?.id;
  let p = null;
  if (id) p = doc.projetos.find((x) => x.id === id);
  if (!p && nome) {
    const lower = nome.toLowerCase();
    p = doc.projetos.find(
      (x) =>
        x.nome.toLowerCase() === lower ||
        (lower === "mg2" && x.id === "prj-mg2") ||
        x.nome.toLowerCase().includes(lower)
    );
  }
  if (!p) return null;
  return selecionarProjeto(p.id);
}

/**
 * @param {{ nome: string, descricao?: string, estado?: string }} dados
 */
export function criarProjeto(dados) {
  garantirDoc();
  const nome = String(dados.nome || "").trim();
  if (!nome) throw new Error("Nome do projeto é obrigatório.");
  const existente = doc.projetos.find(
    (p) => p.nome.toLowerCase() === nome.toLowerCase()
  );
  if (existente) {
    return selecionarProjeto(existente.id);
  }
  const agora = agoraIso();
  const projeto = {
    id: novoId("prj"),
    nome,
    descricao: String(dados.descricao || "").trim(),
    estado: dados.estado || "ativo",
    criadoEm: agora,
    ultimaAtividadeEm: agora,
    ...workspaceVazio()
  };
  doc.projetos.unshift(projeto);
  doc.projetoAtivoId = projeto.id;
  persistir();
  return obterProjetoAtivo();
}

function projetoMutavel() {
  garantirDoc();
  return doc.projetos.find((x) => x.id === doc.projetoAtivoId) || null;
}

/**
 * Workspace do projeto ativo (cópia).
 */
export function obterWorkspaceAtivo() {
  const p = projetoMutavel();
  if (!p) {
    return {
      projeto: null,
      ...workspaceVazio(),
      proximoPasso: null
    };
  }
  return {
    projeto: {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      estado: p.estado,
      criadoEm: p.criadoEm,
      ultimaAtividadeEm: p.ultimaAtividadeEm
    },
    decisoes: JSON.parse(JSON.stringify(p.decisoes)),
    pendencias: JSON.parse(JSON.stringify(p.pendencias)),
    proximasAcoes: JSON.parse(JSON.stringify(p.proximasAcoes)),
    historicoResumido: JSON.parse(JSON.stringify(p.historicoResumido)),
    diaExecutivo: copiarDiaExecutivo(p),
    proximoPasso:
      p.proximasAcoes[0]?.texto || p.proximoPassoSugerido || null
  };
}

/**
 * @param {string} texto
 * @param {string} [origem]
 */
export function registrarDecisao(texto, origem) {
  const p = projetoMutavel();
  if (!p) return null;
  const limpo = String(texto || "").trim();
  if (!limpo) return null;
  const item = {
    id: novoId("dec"),
    texto: limpo,
    quando: agoraIso(),
    origem: origem || "gabinete"
  };
  p.decisoes.unshift(item);
  if (p.decisoes.length > MAX_DECISOES) p.decisoes.length = MAX_DECISOES;
  acrescentarHistorico(p, `Decisão: ${limpo.slice(0, 120)}`);
  marcarAtividade(p);
  persistir();
  return item;
}

/**
 * @param {string} texto
 */
export function registrarPendencia(texto) {
  const p = projetoMutavel();
  if (!p) return null;
  const limpo = String(texto || "").trim();
  if (!limpo) return null;
  const item = {
    id: novoId("pen"),
    texto: limpo,
    status: "aberta",
    quando: agoraIso()
  };
  p.pendencias.unshift(item);
  if (p.pendencias.length > MAX_PENDENCIAS) p.pendencias.length = MAX_PENDENCIAS;
  acrescentarHistorico(p, `Pendência: ${limpo.slice(0, 120)}`);
  marcarAtividade(p);
  persistir();
  return item;
}

/**
 * @param {string} texto
 */
export function registrarProximaAcao(texto) {
  const p = projetoMutavel();
  if (!p) return null;
  const limpo = String(texto || "").trim();
  if (!limpo) return null;
  const item = {
    id: novoId("pxa"),
    texto: limpo,
    quando: agoraIso(),
    status: "aberta"
  };
  p.proximasAcoes.unshift(item);
  if (p.proximasAcoes.length > MAX_PROXIMAS) p.proximasAcoes.length = MAX_PROXIMAS;
  acrescentarHistorico(p, `Próxima ação: ${limpo.slice(0, 120)}`);
  marcarAtividade(p);
  persistir();
  return item;
}

/**
 * Atualiza a sugestão automática (não cria item em próximas ações).
 * @param {string|null} texto
 */
export function definirProximoPasso(texto) {
  const p = projetoMutavel();
  if (!p) return null;
  const limpo = texto == null ? null : String(texto).trim();
  p.proximoPassoSugerido = limpo || null;
  marcarAtividade(p);
  persistir();
  return p.proximoPassoSugerido;
}

/**
 * @param {{ instrucao: string, capacidade: string, intencao: string, ok: boolean, resumo: string }} acao
 */
export function registrarAcaoHistorico(acao) {
  const p = projetoMutavel();
  if (!p) return null;
  const item = {
    id: novoId("acao"),
    quando: agoraIso(),
    instrucao: String(acao.instrucao || "").trim(),
    capacidade: String(acao.capacidade || "desconhecida"),
    intencao: String(acao.intencao || ""),
    ok: acao.ok !== false,
    resumo: String(acao.resumo || "").trim()
  };
  p.historicoResumido.unshift({
    id: item.id,
    quando: item.quando,
    texto: `[${item.capacidade}] ${item.instrucao || item.resumo}`.trim().slice(0, 180)
  });
  if (p.historicoResumido.length > MAX_HISTORICO) {
    p.historicoResumido.length = MAX_HISTORICO;
  }
  marcarAtividade(p);
  persistir();
  return item;
}

function acrescentarHistorico(p, texto) {
  p.historicoResumido.unshift({
    id: novoId("hist"),
    quando: agoraIso(),
    texto: String(texto).slice(0, 180)
  });
  if (p.historicoResumido.length > MAX_HISTORICO) {
    p.historicoResumido.length = MAX_HISTORICO;
  }
}

/**
 * Snapshot do dia executivo do projeto ativo.
 */
export function obterDiaExecutivo() {
  const p = projetoMutavel();
  if (!p) return null;
  return copiarDiaExecutivo(p);
}

/**
 * Último registro de continuidade do projeto ativo.
 */
export function obterUltimaContinuidade() {
  const p = projetoMutavel();
  if (!p) return null;
  return obterUltimaContinuidadeDoProjeto(p);
}

/**
 * Lista de continuidade do projeto ativo (mais recente primeiro).
 */
export function listarContinuidade() {
  const dia = obterDiaExecutivo();
  return dia ? dia.continuidade.slice() : [];
}

/**
 * Abre o dia executivo no projeto ativo.
 * @param {{ intencaoDoDia?: string }} [opts]
 */
export function abrirDiaExecutivo(opts = {}) {
  const p = projetoMutavel();
  if (!p) return null;
  const dia = garantirDiaNoProjeto(p);
  const agora = agoraIso();
  const intencao = String(opts.intencaoDoDia || "").trim() || null;

  dia.status = "em_curso";
  dia.abertoEm = agora;
  dia.encerradoEm = null;
  dia.intencaoDoDia = intencao;

  acrescentarHistorico(p, "Dia aberto");
  marcarAtividade(p);
  persistir();
  return copiarDiaExecutivo(p);
}

/**
 * Encerra o dia e grava registro de continuidade.
 * @param {{ oQueAndou?: string, oQueFica?: string, proximoPassoAmanha?: string }} dados
 */
export function encerrarDiaExecutivo(dados = {}) {
  const p = projetoMutavel();
  if (!p) return null;
  const dia = garantirDiaNoProjeto(p);
  const agora = agoraIso();
  const oQueAndou = String(dados.oQueAndou || "").trim();
  const oQueFica = String(dados.oQueFica || "").trim();
  const proximoPassoAmanha = String(dados.proximoPassoAmanha || "").trim();

  if (!oQueAndou && !oQueFica && !proximoPassoAmanha) {
    return { ok: false, erro: "informe_continuidade", dia: copiarDiaExecutivo(p) };
  }

  const registro = {
    id: novoId("cont"),
    dataRef: dataRefLocal(),
    oQueAndou: oQueAndou || "(não informado)",
    oQueFica: oQueFica || "(não informado)",
    proximoPassoAmanha: proximoPassoAmanha || "(não informado)",
    projetoId: p.id,
    registradoEm: agora
  };

  dia.continuidade.unshift(registro);
  if (dia.continuidade.length > MAX_CONTINUIDADE) {
    dia.continuidade.length = MAX_CONTINUIDADE;
  }

  dia.status = "encerrado";
  dia.encerradoEm = agora;

  if (proximoPassoAmanha) {
    p.proximoPassoSugerido = proximoPassoAmanha;
  }

  acrescentarHistorico(p, "Dia encerrado");
  marcarAtividade(p);
  persistir();
  return { ok: true, registro, dia: copiarDiaExecutivo(p) };
}

export function obterEstadoGabinete() {
  garantirDoc();
  return { ...doc.gabinete };
}

/**
 * Painel executivo do projeto ativo (ou de um id).
 * @param {string} [projetoId]
 */
export function obterPainelExecutivo(projetoId) {
  garantirDoc();
  const id = projetoId || doc.projetoAtivoId;
  const p = doc.projetos.find((x) => x.id === id);
  if (!p) return null;
  return montarPainelExecutivo(p, { ativo: id === doc.projetoAtivoId });
}

/**
 * @param {{ rotaId?: string }} patch
 */
export function atualizarEstadoGabinete(patch) {
  garantirDoc();
  doc.gabinete = {
    ...doc.gabinete,
    ...patch,
    atualizadoEm: agoraIso()
  };
  persistir();
  return obterEstadoGabinete();
}

export const catalogoProjetos = {
  inicializarCatalogo,
  recarregarCatalogo,
  listarProjetos,
  obterProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  selecionarProjeto,
  selecionarProjetoPorRef,
  criarProjeto,
  obterWorkspaceAtivo,
  obterPainelExecutivo,
  obterDiaExecutivo,
  obterUltimaContinuidade,
  listarContinuidade,
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  definirProximoPasso,
  registrarAcaoHistorico,
  obterEstadoGabinete,
  atualizarEstadoGabinete
};

export default catalogoProjetos;
