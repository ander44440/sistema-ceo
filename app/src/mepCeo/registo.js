/**
 * IMP-072 / ARQ-033 C2 — Registo persistente da MEP-CEO (núcleo em memória).
 * Append-only: eventos nunca apagados. Projecção de objecto subordinada ao log.
 * Sem C3. Sem persistência em ficheiro (não especificada). Sem adapters extra.
 */

import {
  CAMPOS_DCP,
  EIXO_PRODUTO,
  MATURIDADES,
  TIPOS_OBJECTO,
  TRABALHOS,
  classificacaoDeMaturidade,
  evidenciaValida,
  normalizarPapeis
} from "./dominio.js";
import { emitirIdentificador, reiniciarIdentificadores } from "./identificadores.js";
import { avaliarIsolamento } from "./isolamento.js";
import { alçadaSuficiente, saltoIlicito } from "./transicoes.js";

/** @type {Map<string, object>} */
let objectos = new Map();
/** @type {object[]} */
let eventos = [];

function agoraIso() {
  return new Date().toISOString();
}

function clonar(valor) {
  return structuredClone(valor);
}

function recusa(motivo, extra = {}) {
  return Object.freeze({ ok: false, motivo, ...extra });
}

function ok(extra = {}) {
  return Object.freeze({ ok: true, ...extra });
}

function appendEvento(campos) {
  const id = emitirIdentificador("MEV");
  const evento = Object.freeze({
    id,
    quando: agoraIso(),
    ...campos
  });
  eventos.push(evento);
  return evento;
}

function exigirEvidenciaOuLacuna(opts, { permitirLacuna }) {
  if (evidenciaValida(opts.evidencia)) return { ok: true, evidencia: { ...opts.evidencia } };
  if (permitirLacuna && String(opts.lacunaEvidencia || "").trim()) {
    return {
      ok: true,
      evidencia: null,
      lacunaEvidencia: String(opts.lacunaEvidencia).trim()
    };
  }
  return { ok: false };
}

/**
 * Criação em CONCEBIDO. Agente pode registar. Hipótese — evidência ou lacuna explícita.
 */
export function criarObjecto(entrada = {}) {
  const tipo = String(entrada.tipo || "").trim();
  if (!TIPOS_OBJECTO.includes(tipo) || tipo === "MEV") {
    return recusa("tipo_invalido");
  }

  const isolamento = avaliarIsolamento({
    eixo: entrada.eixo || EIXO_PRODUTO,
    tipoConteudo: entrada.tipoConteudo,
    conteudoOrganizacao: entrada.conteudoOrganizacao,
    absorveArtefactoReferenciado: entrada.absorveArtefactoReferenciado,
    payload: entrada.payload
  });
  if (!isolamento.ok) {
    return recusa("isolamento", { motivos: isolamento.motivos });
  }

  const papeis = normalizarPapeis(entrada.papel || entrada.papeis);
  if (!alçadaSuficiente(null, "CONCEBIDO", tipo, papeis)) {
    return recusa("alçada");
  }

  const ev = exigirEvidenciaOuLacuna(entrada, { permitirLacuna: true });
  if (!ev.ok) {
    return recusa("evidencia_ou_lacuna_obrigatoria");
  }

  const payload =
    entrada.payload && typeof entrada.payload === "object" ? { ...entrada.payload } : {};

  if (tipo === "DCP") {
    const faltam = CAMPOS_DCP.filter((c) => !String(payload[c] || "").trim());
    if (faltam.length) {
      return recusa("dcp_campos_incompletos", { faltam });
    }
  }

  if (tipo === "RMP") {
    // Sem semântica extra vs tipo documental ROADMAP (despacho CTO).
  }

  const id = emitirIdentificador(tipo);
  const trabalho = TRABALHOS.includes(entrada.trabalho)
    ? entrada.trabalho
    : "SEM_PENDÊNCIA";
  if (trabalho === "PENDÊNCIA_ATIVA") {
    const pnds = Array.isArray(entrada.pndIds) ? entrada.pndIds : [];
    if (pnds.length === 0) return recusa("pendencia_ativa_sem_pnd");
  }

  const objecto = {
    id,
    tipo,
    eixo: EIXO_PRODUTO,
    titulo: String(entrada.titulo || "").trim() || id,
    maturidade: "CONCEBIDO",
    trabalho,
    pndIds: Array.isArray(entrada.pndIds) ? [...entrada.pndIds] : [],
    classificacao: classificacaoDeMaturidade("CONCEBIDO"),
    evidencia: ev.evidencia,
    lacunaEvidencia: ev.lacunaEvidencia || null,
    payload,
    referenciasExternas: Array.isArray(entrada.referenciasExternas)
      ? [...entrada.referenciasExternas]
      : [],
    criadoPor: papeis[0],
    congelado: false,
    cobre: tipo === "BSL" && Array.isArray(entrada.cobre) ? [...entrada.cobre] : [],
    precedenteBsl: entrada.precedenteBsl || null
  };

  objectos.set(id, objecto);
  const mev = appendEvento({
    objectoId: id,
    tipoObjecto: tipo,
    estadoAnterior: null,
    estadoNovo: { maturidade: "CONCEBIDO", trabalho },
    papel: papeis[0],
    papeis,
    evidencia: ev.evidencia,
    lacunaEvidencia: ev.lacunaEvidencia || null,
    classificacao: objecto.classificacao,
    acto: "criar"
  });

  return ok({ objecto: clonar(objecto), evento: mev });
}

/**
 * Proposta de transição — não altera vigência (RN-05.1).
 */
export function proporMaturidade(id, para, opts = {}) {
  const objecto = objectos.get(id);
  if (!objecto) return recusa("objecto_inexistente");
  const papeis = normalizarPapeis(opts.papel || opts.papeis);
  if (!papeis.includes("ceo_agente") && !papeis.includes("cto") && !papeis.includes("usuario") && !papeis.includes("engenheiro")) {
    return recusa("alçada");
  }
  if (saltoIlicito(objecto.maturidade, para)) {
    return recusa("salto_ilicito");
  }
  const mev = appendEvento({
    objectoId: id,
    tipoObjecto: objecto.tipo,
    estadoAnterior: { maturidade: objecto.maturidade, trabalho: objecto.trabalho },
    estadoNovo: { maturidade: objecto.maturidade, trabalho: objecto.trabalho },
    propostoPara: para,
    papel: papeis[0],
    papeis,
    evidencia: evidenciaValida(opts.evidencia) ? { ...opts.evidencia } : null,
    classificacao: "hipotese",
    acto: "propor"
  });
  return ok({ objecto: clonar(objecto), evento: mev });
}

export function promoverMaturidade(id, para, opts = {}) {
  const objecto = objectos.get(id);
  if (!objecto) return recusa("objecto_inexistente");
  if (objecto.congelado || objecto.maturidade === "BASELINE") {
    return recusa("baseline_congelada");
  }
  if (saltoIlicito(objecto.maturidade, para)) {
    return recusa("salto_ilicito");
  }

  const papeis = normalizarPapeis(opts.papel || opts.papeis);
  if (!alçadaSuficiente(objecto.maturidade, para, objecto.tipo, papeis)) {
    return recusa("alçada");
  }

  if (para !== "CONCEBIDO" && classificacaoDeMaturidade(para) !== "hipotese") {
    if (!evidenciaValida(opts.evidencia)) {
      return recusa("evidencia_obrigatoria");
    }
  }

  if (para === "HOMOLOGADO" || para === "BASELINE") {
    if (objecto.classificacao === "hipotese" && objecto.maturidade === "CONCEBIDO") {
      return recusa("hipotese_nao_e_facto");
    }
  }

  const anterior = {
    maturidade: objecto.maturidade,
    trabalho: objecto.trabalho
  };

  objecto.maturidade = para;
  objecto.classificacao = classificacaoDeMaturidade(para);
  objecto.evidencia = { ...opts.evidencia };
  objecto.lacunaEvidencia = null;
  if (para === "BASELINE") {
    objecto.congelado = true;
  }

  const mev = appendEvento({
    objectoId: id,
    tipoObjecto: objecto.tipo,
    estadoAnterior: anterior,
    estadoNovo: { maturidade: objecto.maturidade, trabalho: objecto.trabalho },
    papel: papeis.includes("usuario") && para === "BASELINE" ? "usuario" : papeis[0],
    papeis,
    evidencia: { ...opts.evidencia },
    classificacao: objecto.classificacao,
    acto: "promover"
  });

  return ok({
    objecto: clonar(objecto),
    evento: mev
  });
}

function ultimoBslId() {
  const bsls = [...objectos.values()].filter((o) => o.tipo === "BSL");
  if (!bsls.length) return null;
  return bsls[bsls.length - 1].id;
}

function emitirNovaBaselineInterna({ cobre, evidencia, papeis, precedenteBsl }) {
  const id = emitirIdentificador("BSL");
  const objecto = {
    id,
    tipo: "BSL",
    eixo: EIXO_PRODUTO,
    titulo: `Baseline ${id}`,
    maturidade: "BASELINE",
    trabalho: "SEM_PENDÊNCIA",
    pndIds: [],
    classificacao: "facto_homologado",
    evidencia: { ...evidencia },
    lacunaEvidencia: null,
    payload: {},
    referenciasExternas: [...cobre],
    criadoPor: "usuario",
    congelado: true,
    cobre: [...cobre],
    precedenteBsl: precedenteBsl || null
  };
  objectos.set(id, objecto);
  appendEvento({
    objectoId: id,
    tipoObjecto: "BSL",
    estadoAnterior: null,
    estadoNovo: { maturidade: "BASELINE", trabalho: "SEM_PENDÊNCIA" },
    papel: "usuario",
    papeis,
    evidencia: { ...evidencia },
    classificacao: "facto_homologado",
    acto: "criar_baseline",
    cobre: [...cobre],
    precedenteBsl: precedenteBsl || null
  });
  return objecto;
}

/**
 * Nova baseline = sempre novo BSL-nnn. Não muta BSL anterior.
 * RMP: sem semântica extra. Objectos cobertos permanecem referenciados, não reescritos.
 */
export function criarNovaBaseline(opts = {}) {
  const papeis = normalizarPapeis(opts.papel || opts.papeis);
  if (!papeis.includes("usuario")) {
    return recusa("alçada");
  }
  if (!evidenciaValida(opts.evidencia)) {
    return recusa("evidencia_obrigatoria");
  }
  const cobre = Array.isArray(opts.cobre) ? opts.cobre : [];
  for (const oid of cobre) {
    const o = objectos.get(oid);
    if (!o) return recusa("objecto_inexistente", { id: oid });
  }
  if (opts.precedenteBsl) {
    const prev = objectos.get(opts.precedenteBsl);
    if (!prev || prev.tipo !== "BSL") return recusa("precedente_invalido");
  }
  const isolamento = avaliarIsolamento({
    eixo: EIXO_PRODUTO,
    payload: opts.payload,
    tipoConteudo: opts.tipoConteudo,
    conteudoOrganizacao: opts.conteudoOrganizacao,
    absorveArtefactoReferenciado: opts.absorveArtefactoReferenciado
  });
  if (!isolamento.ok) {
    return recusa("isolamento", { motivos: isolamento.motivos });
  }

  const precedente = opts.precedenteBsl || ultimoBslId();
  const bsl = emitirNovaBaselineInterna({
    cobre,
    evidencia: opts.evidencia,
    papeis,
    precedenteBsl: precedente
  });
  return ok({ objecto: clonar(bsl), precedenteBsl: precedente });
}

export function definirEstadoTrabalho(id, trabalho, opts = {}) {
  const objecto = objectos.get(id);
  if (!objecto) return recusa("objecto_inexistente");
  if (objecto.congelado || objecto.maturidade === "BASELINE") {
    return recusa("baseline_congelada");
  }
  if (!TRABALHOS.includes(trabalho)) return recusa("trabalho_invalido");
  if (trabalho === "PENDÊNCIA_ATIVA") {
    const pnds = Array.isArray(opts.pndIds) ? opts.pndIds : objecto.pndIds;
    if (!pnds || pnds.length === 0) return recusa("pendencia_ativa_sem_pnd");
    for (const pid of pnds) {
      const p = objectos.get(pid);
      if (!p || p.tipo !== "PND") return recusa("pnd_invalido", { id: pid });
    }
    objecto.pndIds = [...pnds];
  }
  const anterior = {
    maturidade: objecto.maturidade,
    trabalho: objecto.trabalho
  };
  objecto.trabalho = trabalho;
  const papeis = normalizarPapeis(opts.papel || opts.papeis);
  const mev = appendEvento({
    objectoId: id,
    tipoObjecto: objecto.tipo,
    estadoAnterior: anterior,
    estadoNovo: { maturidade: objecto.maturidade, trabalho: objecto.trabalho },
    papel: papeis[0] || "ceo_agente",
    papeis,
    evidencia: evidenciaValida(opts.evidencia) ? { ...opts.evidencia } : null,
    classificacao: objecto.classificacao,
    acto: "trabalho"
  });
  return ok({ objecto: clonar(objecto), evento: mev });
}

export function consultarObjecto(id) {
  const o = objectos.get(id);
  return o ? clonar(o) : null;
}

export function listarObjectos(filtro = {}) {
  let lista = [...objectos.values()];
  if (filtro.tipo) lista = lista.filter((o) => o.tipo === filtro.tipo);
  return lista.map(clonar);
}

export function historico(objectoId) {
  const lista = objectoId
    ? eventos.filter((e) => e.objectoId === objectoId)
    : [...eventos];
  return lista.map(clonar);
}

/** Sempre recusado — histórico append-only (CA-085-18). */
export function apagarEvento() {
  return recusa("historico_append_only");
}

export function apagarObjecto() {
  return recusa("historico_append_only");
}

export function reiniciarMepParaTestes() {
  objectos = new Map();
  eventos = [];
  reiniciarIdentificadores();
}

export function contagemEventos() {
  return eventos.length;
}

export { MATURIDADES, TIPOS_OBJECTO, TRABALHOS };
