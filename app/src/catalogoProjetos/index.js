/**
 * Catálogo permanente de projetos + workspace por projeto (Onda 01).
 * FASE 1: camada EMPRESA (empresaAtivaId) acima dos projetos.
 */

import {
  carregarDocumento,
  gravarDocumento,
  mediumPersistenciaCatalogo,
  VERSAO
} from "./persistencia.js";
import { montarPainelExecutivo } from "./estadoExecutivo.js";
import {
  copiarDiaExecutivo,
  dataRefLocal,
  diaExecutivoVazio,
  garantirDiaNoProjeto,
  obterUltimaContinuidadeDoProjeto
} from "./diaExecutivo.js";
import { resetMemoriaTrabalhoExecutiva } from "../executiveEngine/refinoEicSessao.js";

const MAX_DECISOES = 50;
const MAX_PENDENCIAS = 50;
const MAX_PROXIMAS = 50;
const MAX_HISTORICO = 40;
const MAX_CONTINUIDADE = 60;

/** Id estável da empresa seed (migração v1→v2). */
export const ID_EMPRESA_PATROCINADOR = "emp-patrocinador";

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

function empresaSeedPatrocinador() {
  const agora = agoraIso();
  return {
    id: ID_EMPRESA_PATROCINADOR,
    nome: "Patrocinador",
    descricao: "Contexto institucional default dos COAs operacionais.",
    estado: "ativa",
    criadoEm: agora,
    atualizadoEm: agora
  };
}

function projetoSeed(id, nome, descricao, estado, empresaId) {
  const agora = agoraIso();
  return {
    id,
    nome,
    descricao,
    estado,
    empresaId,
    criadoEm: agora,
    ultimaAtividadeEm: agora,
    ...workspaceVazio()
  };
}

/**
 * @param {object[]} projetos
 * @returns {string|null}
 */
function escolherPrimeiroProjetoId(projetos) {
  if (!Array.isArray(projetos) || projetos.length === 0) return null;
  const activo = projetos.find((p) => p.estado === "ativo");
  return (activo || projetos[0]).id;
}

function documentoInicial() {
  const emp = empresaSeedPatrocinador();
  const projetos = [
    projetoSeed(
      "prj-sistema-ceo",
      "Sistema CEO",
      "Governança e evolução do próprio Sistema Executivo de Governança.",
      "ativo",
      emp.id
    ),
    projetoSeed(
      "prj-mg2",
      "Motoboy Game 2",
      "Primeiro contexto operacional do patrocinador (ADR-015).",
      "ativo",
      emp.id
    ),
    projetoSeed(
      "prj-ultima-milha",
      "Última Milha",
      "Contexto operacional de last mile / Flow Last Mile.",
      "pausado",
      emp.id
    )
  ];
  return {
    versao: VERSAO,
    empresaAtivaId: emp.id,
    projetoAtivoId: "prj-mg2",
    gabinete: {
      rotaId: "dashboard",
      atualizadoEm: agoraIso()
    },
    empresas: [emp],
    projetos
  };
}

/**
 * Migração v1 → v2 (idempotente também em v2 incompleto).
 * @param {object} bruto
 * @returns {{ doc: object, migrou: boolean }}
 */
export function migrarDocumentoParaV2(bruto) {
  const d = structuredClone(bruto);
  let migrou = d.versao !== VERSAO;

  if (!Array.isArray(d.empresas)) {
    d.empresas = [];
    migrou = true;
  }
  if (!d.empresas.some((e) => e && e.id === ID_EMPRESA_PATROCINADOR)) {
    d.empresas.unshift(empresaSeedPatrocinador());
    migrou = true;
  }

  if (!Array.isArray(d.projetos)) d.projetos = [];

  for (const p of d.projetos) {
    if (!p.empresaId || !d.empresas.some((e) => e.id === p.empresaId)) {
      p.empresaId = ID_EMPRESA_PATROCINADOR;
      migrou = true;
    }
  }

  const activo = d.projetos.find((p) => p.id === d.projetoAtivoId);
  if (activo && activo.empresaId) {
    if (d.empresaAtivaId !== activo.empresaId) {
      d.empresaAtivaId = activo.empresaId;
      migrou = true;
    }
  } else if (
    !d.empresaAtivaId ||
    !d.empresas.some((e) => e.id === d.empresaAtivaId)
  ) {
    d.empresaAtivaId = ID_EMPRESA_PATROCINADOR;
    migrou = true;
  }

  if (d.versao !== VERSAO) {
    d.versao = VERSAO;
    migrou = true;
  }

  return { doc: d, migrou };
}

function persistir() {
  if (!doc) return;
  gravarDocumento(doc);
}

/**
 * Normaliza campos obrigatórios do documento em RAM (sem gravar).
 * @param {object} d
 */
function normalizarDocumentoEmRam(d) {
  d.versao = VERSAO;

  if (!d.gabinete) {
    d.gabinete = { rotaId: "dashboard", atualizadoEm: agoraIso() };
  }
  if (!Array.isArray(d.empresas)) d.empresas = [];
  if (!Array.isArray(d.projetos)) d.projetos = [];

  if (!d.empresas.some((e) => e && e.id === ID_EMPRESA_PATROCINADOR)) {
    d.empresas.unshift(empresaSeedPatrocinador());
  }

  for (const e of d.empresas) {
    if (!e.nome) e.nome = "Empresa";
    if (e.descricao === undefined) e.descricao = "";
    if (!e.estado) e.estado = "ativa";
    if (!e.criadoEm) e.criadoEm = agoraIso();
    if (!e.atualizadoEm) e.atualizadoEm = e.criadoEm;
  }

  for (const p of d.projetos) {
    if (!p.empresaId || !d.empresas.some((e) => e.id === p.empresaId)) {
      p.empresaId = ID_EMPRESA_PATROCINADOR;
    }
    if (!p.decisoes) p.decisoes = [];
    if (!p.pendencias) p.pendencias = [];
    if (!p.proximasAcoes) p.proximasAcoes = [];
    if (!p.historicoResumido) p.historicoResumido = [];
    if (p.proximoPassoSugerido === undefined) p.proximoPassoSugerido = null;
    garantirDiaNoProjeto(p);
  }

  if (
    !d.empresaAtivaId ||
    !d.empresas.some((e) => e.id === d.empresaAtivaId)
  ) {
    d.empresaAtivaId = ID_EMPRESA_PATROCINADOR;
  }

  // Projecto activo inválido → null (não forçar outro projecto de outra empresa)
  if (d.projetoAtivoId) {
    const pAct = d.projetos.find((x) => x.id === d.projetoAtivoId);
    if (!pAct) {
      const daEmp = d.projetos.filter((x) => x.empresaId === d.empresaAtivaId);
      d.projetoAtivoId = escolherPrimeiroProjetoId(daEmp);
    }
  }

  // Coerência: projecto activo manda na empresa activa
  if (d.projetoAtivoId) {
    const pAct = d.projetos.find((x) => x.id === d.projetoAtivoId);
    if (pAct && pAct.empresaId !== d.empresaAtivaId) {
      d.empresaAtivaId = pAct.empresaId;
    }
  }

  return d;
}

/**
 * @param {object} bruto
 * @returns {{ doc: object, precisaPersistir: boolean }}
 */
function prepararDocumentoCarregado(bruto) {
  const { doc: migrado, migrou } = migrarDocumentoParaV2(bruto);
  normalizarDocumentoEmRam(migrado);
  return { doc: migrado, precisaPersistir: migrou || bruto.versao !== VERSAO };
}

function garantirDoc() {
  if (doc) return doc;
  const carregado = carregarDocumento();
  if (carregado) {
    const prep = prepararDocumentoCarregado(carregado);
    doc = prep.doc;
    if (prep.precisaPersistir) persistir();
    return doc;
  }
  doc = documentoInicial();
  normalizarDocumentoEmRam(doc);
  persistir();
  return doc;
}

/**
 * Correção 9 — antes de criar/seleccionar (identidade), descartar RAM stale
 * e ler o storage oficial quando localStorage está disponível.
 */
function reidratarAntesDeMutacaoIdentidade() {
  if (mediumPersistenciaCatalogo() !== "localStorage") {
    garantirDoc();
    return;
  }
  const fresco = carregarDocumento();
  if (fresco && Array.isArray(fresco.projetos)) {
    const prep = prepararDocumentoCarregado(fresco);
    doc = prep.doc;
    if (prep.precisaPersistir) persistir();
    return;
  }
  doc = null;
  garantirDoc();
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

/**
 * @param {string} [empresaId]
 */
export function listarProjetosDaEmpresa(empresaId) {
  garantirDoc();
  const eid = empresaId || doc.empresaAtivaId;
  return doc.projetos
    .filter((p) => p.empresaId === eid)
    .map((p) => ({
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

export function listarEmpresas() {
  return garantirDoc().empresas.map((e) => ({
    id: e.id,
    nome: e.nome,
    descricao: e.descricao,
    estado: e.estado,
    criadoEm: e.criadoEm,
    atualizadoEm: e.atualizadoEm,
    ativa: e.id === doc.empresaAtivaId
  }));
}

export function obterEmpresa(id) {
  garantirDoc();
  const e = doc.empresas.find((x) => x.id === id);
  return e ? JSON.parse(JSON.stringify(e)) : null;
}

export function obterEmpresaAtiva() {
  garantirDoc();
  const e = doc.empresas.find((x) => x.id === doc.empresaAtivaId);
  return e ? JSON.parse(JSON.stringify(e)) : null;
}

export function obterEmpresaAtivaId() {
  return garantirDoc().empresaAtivaId;
}

/**
 * Selecção de empresa sem reidratar (uso interno após mutações em RAM).
 * @param {string} id
 */
function aplicarSelecaoEmpresa(id) {
  const e = doc.empresas.find((x) => x.id === id);
  if (!e) return null;
  doc.empresaAtivaId = e.id;
  e.atualizadoEm = agoraIso();

  const pAct = doc.projetos.find((x) => x.id === doc.projetoAtivoId);
  if (pAct && pAct.empresaId === e.id) {
    persistir();
    return obterEmpresaAtiva();
  }

  const daEmp = doc.projetos.filter((x) => x.empresaId === e.id);
  const proximoId = escolherPrimeiroProjetoId(daEmp);
  doc.projetoAtivoId = proximoId;
  if (proximoId) {
    const p = doc.projetos.find((x) => x.id === proximoId);
    if (p) marcarAtividade(p);
  }
  persistir();
  return obterEmpresaAtiva();
}

/**
 * @param {string} id
 */
export function selecionarEmpresa(id) {
  reidratarAntesDeMutacaoIdentidade();
  return aplicarSelecaoEmpresa(id);
}

/**
 * Resolve por id exacto ou nome exacto (case-insensitive). Sem fuzzy/includes.
 * @param {{ id?: string, nome?: string }} ref
 */
export function selecionarEmpresaPorRef(ref) {
  reidratarAntesDeMutacaoIdentidade();
  const nome = String(ref?.nome || "").trim();
  const id = ref?.id;
  let e = null;
  if (id) e = doc.empresas.find((x) => x.id === id);
  if (!e && nome) {
    const lower = nome.toLowerCase();
    e = doc.empresas.find((x) => String(x.nome || "").toLowerCase() === lower);
  }
  if (!e) return null;
  return aplicarSelecaoEmpresa(e.id);
}

/**
 * @param {{ nome: string, descricao?: string, estado?: string }} dados
 */
export function criarEmpresa(dados) {
  reidratarAntesDeMutacaoIdentidade();
  const nome = String(dados.nome || "").trim();
  if (!nome) throw new Error("Nome da empresa é obrigatório.");
  const existente = doc.empresas.find(
    (e) => String(e.nome || "").toLowerCase() === nome.toLowerCase()
  );
  if (existente) {
    return aplicarSelecaoEmpresa(existente.id);
  }
  const agora = agoraIso();
  const empresa = {
    id: novoId("emp"),
    nome,
    descricao: String(dados.descricao || "").trim(),
    estado: dados.estado === "pausada" ? "pausada" : "ativa",
    criadoEm: agora,
    atualizadoEm: agora
  };
  const empresasAntes = doc.empresas.slice();
  const empresaAntes = doc.empresaAtivaId;
  const projetoAntes = doc.projetoAtivoId;
  doc.empresas.push(empresa);
  try {
    const out = aplicarSelecaoEmpresa(empresa.id);
    if (!out) {
      throw new Error("Falha ao activar a empresa criada.");
    }
    return out;
  } catch (err) {
    doc.empresas = empresasAntes;
    doc.empresaAtivaId = empresaAntes;
    doc.projetoAtivoId = projetoAntes;
    throw err;
  }
}

/**
 * @param {string} id
 * @param {{ registrarAlteracao?: boolean }} [opts]
 */
export function selecionarProjeto(id, opts = {}) {
  reidratarAntesDeMutacaoIdentidade();
  const p = doc.projetos.find((x) => x.id === id);
  if (!p) return null;
  const trocou = doc.projetoAtivoId !== p.id;
  doc.projetoAtivoId = p.id;
  doc.empresaAtivaId = p.empresaId;
  if (trocou && opts.registrarAlteracao !== false) {
    acrescentarHistorico(p, "Projeto alterado");
  }
  marcarAtividade(p);
  persistir();
  return obterProjetoAtivo();
}

/**
 * Remove o contexto activo sem apagar o projecto do catálogo.
 * Histórico, decisões, Jobs e continuidade do dia permanecem.
 * Fecha também a MTE residual do COA (Opção C).
 * @returns {null}
 */
export function limparProjetoAtivo() {
  reidratarAntesDeMutacaoIdentidade();
  garantirDoc();
  resetMemoriaTrabalhoExecutiva();
  if (doc.projetoAtivoId == null) {
    return null;
  }
  doc.projetoAtivoId = null;
  persistir();
  return null;
}

/**
 * Resolve por id exacto, nome exacto (case-insensitive) ou alias exacto "mg2".
 * CTO-003.1: sem match por substring (includes) — evita regressão silenciosa a MG2.
 * @param {{ id?: string, nome?: string }} ref
 */
export function selecionarProjetoPorRef(ref) {
  reidratarAntesDeMutacaoIdentidade();
  const nome = String(ref?.nome || "").trim();
  const id = ref?.id;
  let p = null;
  if (id) p = doc.projetos.find((x) => x.id === id);
  if (!p && nome) {
    const lower = nome.toLowerCase();
    p = doc.projetos.find((x) => x.nome.toLowerCase() === lower);
    if (!p && lower === "mg2") {
      p = doc.projetos.find((x) => x.id === "prj-mg2") || null;
    }
  }
  if (!p) return null;
  return selecionarProjeto(p.id);
}

/**
 * @param {{ nome: string, descricao?: string, estado?: string }} dados
 */
export function criarProjeto(dados) {
  reidratarAntesDeMutacaoIdentidade();
  const nome = String(dados.nome || "").trim();
  if (!nome) throw new Error("Nome do projeto é obrigatório.");
  const existente = doc.projetos.find(
    (p) => p.nome.toLowerCase() === nome.toLowerCase()
  );
  if (existente) {
    return selecionarProjeto(existente.id);
  }
  const empresaId =
    doc.empresaAtivaId &&
    doc.empresas.some((e) => e.id === doc.empresaAtivaId)
      ? doc.empresaAtivaId
      : ID_EMPRESA_PATROCINADOR;
  const agora = agoraIso();
  const projeto = {
    id: novoId("prj"),
    nome,
    descricao: String(dados.descricao || "").trim(),
    estado: dados.estado || "ativo",
    empresaId,
    criadoEm: agora,
    ultimaAtividadeEm: agora,
    ...workspaceVazio()
  };
  const activoAnterior = doc.projetoAtivoId;
  const empresaAnterior = doc.empresaAtivaId;
  doc.projetos.unshift(projeto);
  doc.projetoAtivoId = projeto.id;
  doc.empresaAtivaId = empresaId;
  try {
    persistir();
  } catch (err) {
    doc.projetos = doc.projetos.filter((p) => p.id !== projeto.id);
    doc.projetoAtivoId = activoAnterior;
    doc.empresaAtivaId = empresaAnterior;
    throw err;
  }
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
  listarProjetosDaEmpresa,
  obterProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  selecionarProjeto,
  selecionarProjetoPorRef,
  limparProjetoAtivo,
  criarProjeto,
  listarEmpresas,
  obterEmpresa,
  obterEmpresaAtiva,
  obterEmpresaAtivaId,
  selecionarEmpresa,
  selecionarEmpresaPorRef,
  criarEmpresa,
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
