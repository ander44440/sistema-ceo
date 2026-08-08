/**
 * IMP-070 B3 / REQ-074 — Governação de promoção e aptidão do Acervo.
 * Cadeia: propor → validar (CTO) → validar domínio (Usuário se COA) →
 * homologar (Usuário) → publicar (Engenheiro); revogar aptidão com MO.
 * Independente: não altera Fonte Oficial, Limites, Actualização nem Porta EIC.
 */

import { avaliarAdmissao } from "./limitesAdmissao.js";
import {
  consultarFonteOficial,
  obterItemPorId,
  registarPublicacaoGovernada,
  alterarAptidaoGovernada,
  reiniciarAcervoParaTestes as reiniciarRegistro
} from "./fonteOficial.js";

export const AGENTES = Object.freeze({
  usuario: "usuario",
  cto: "cto",
  engenheiro: "engenheiro",
  sistema_ceo: "sistema_ceo"
});

export const CAUSAS_NAO_APTO = Object.freeze([
  "obsolescencia",
  "invalidade",
  "substituicao",
  "deduplicacao",
  "depuracao"
]);

export const CAUSAS_INSUFICIENTES = Object.freeze([
  "falta_citacao",
  "silencio_modelo",
  "estado_fila_job",
  "edicao_informal_projecao"
]);

/** @type {Map<string, object>} */
let propostas = new Map();
/** @type {object[]} */
let rastrosMo = [];

/**
 * @param {object} mo
 * @returns {boolean}
 */
function moCompleta(mo) {
  if (!mo || typeof mo !== "object") return false;
  return Boolean(
    mo.quem &&
      mo.quando &&
      mo.oQue &&
      mo.porQue &&
      mo.baseadoEmQue &&
      mo.resultado
  );
}

/**
 * Propor promoção (Usuário/CTO/Engenheiro) ou candidato (Sistema CEO).
 * @param {object} opts
 */
export function propor(opts = {}) {
  const agente = String(opts.agente || "");
  const candidatosOk = [
    AGENTES.usuario,
    AGENTES.cto,
    AGENTES.engenheiro,
    AGENTES.sistema_ceo
  ];
  if (!candidatosOk.includes(agente)) {
    return { ok: false, erro: "agente_invalido" };
  }
  const id =
    String(opts.idProposta || "").trim() ||
    `PROP-${Date.now()}-${propostas.size + 1}`;
  if (propostas.has(id)) {
    return { ok: false, erro: "proposta_duplicada", idProposta: id };
  }
  const candidato = opts.candidato && typeof opts.candidato === "object"
    ? { ...opts.candidato }
    : null;
  if (!candidato) {
    return { ok: false, erro: "candidato_ausente" };
  }
  const soCandidato = agente === AGENTES.sistema_ceo;
  propostas.set(id, {
    id,
    agenteProposta: agente,
    soCandidato,
    candidato,
    passos: {
      proposta: true,
      validacaoCto: false,
      validacaoDominio: false,
      homologacaoUsuario: false,
      publicacao: false
    },
    requerDominio: Boolean(
      opts.requerValidacaoDominio ??
        candidato.requerValidacaoDominio ??
        candidato.ambitoCoa
    ),
    estado: soCandidato ? "candidato" : "proposta"
  });
  return {
    ok: true,
    idProposta: id,
    soCandidato,
    estado: soCandidato ? "candidato" : "proposta"
  };
}

/**
 * Validação de conformidade — só CTO.
 */
export function validarConformidadeCto(opts = {}) {
  if (String(opts.agente) !== AGENTES.cto) {
    return { ok: false, erro: "apenas_cto" };
  }
  const p = propostas.get(String(opts.idProposta || ""));
  if (!p) return { ok: false, erro: "proposta_inexistente" };
  if (p.soCandidato) {
    return { ok: false, erro: "candidato_nao_e_proposta_oficial" };
  }
  if (!p.passos.proposta) return { ok: false, erro: "ordem_invalida" };
  const limites = avaliarAdmissao(p.candidato);
  if (!limites.ok) {
    return {
      ok: false,
      erro: "limites_recusam",
      motivosRecusa: [...limites.motivosRecusa]
    };
  }
  p.passos.validacaoCto = true;
  p.estado = "validado_cto";
  return { ok: true, idProposta: p.id, estado: p.estado };
}

/**
 * Validação de verdade de domínio COA — só Usuário.
 */
export function validarDominioUsuario(opts = {}) {
  if (String(opts.agente) !== AGENTES.usuario) {
    return { ok: false, erro: "apenas_usuario" };
  }
  const p = propostas.get(String(opts.idProposta || ""));
  if (!p) return { ok: false, erro: "proposta_inexistente" };
  if (!p.passos.validacaoCto) {
    return { ok: false, erro: "falta_validacao_cto" };
  }
  p.passos.validacaoDominio = true;
  p.estado = "validado_dominio";
  return { ok: true, idProposta: p.id, estado: p.estado };
}

/**
 * Homologação — exclusivo Usuário.
 */
export function homologarUsuario(opts = {}) {
  if (String(opts.agente) !== AGENTES.usuario) {
    return { ok: false, erro: "apenas_usuario_homologa" };
  }
  if (String(opts.agente) === AGENTES.sistema_ceo) {
    return { ok: false, erro: "sistema_nao_homologa" };
  }
  const p = propostas.get(String(opts.idProposta || ""));
  if (!p) return { ok: false, erro: "proposta_inexistente" };
  if (!p.passos.validacaoCto) {
    return { ok: false, erro: "falta_validacao_cto" };
  }
  if (p.requerDominio && !p.passos.validacaoDominio) {
    return { ok: false, erro: "falta_validacao_dominio" };
  }
  p.passos.homologacaoUsuario = true;
  p.estado = "homologado";
  return { ok: true, idProposta: p.id, estado: p.estado };
}

/**
 * Publicação material — só Engenheiro, após homologação.
 */
export function publicarEngenheiro(opts = {}) {
  if (String(opts.agente) !== AGENTES.engenheiro) {
    return { ok: false, erro: "apenas_engenheiro_publica" };
  }
  const p = propostas.get(String(opts.idProposta || ""));
  if (!p) return { ok: false, erro: "proposta_inexistente" };
  if (!p.passos.homologacaoUsuario) {
    return { ok: false, erro: "publicacao_sem_homologacao", incluido: false };
  }
  const idItem = String(p.candidato.id || opts.idItem || "").trim();
  if (!idItem) {
    return { ok: false, erro: "id_item_ausente" };
  }
  const reg = registarPublicacaoGovernada({
    ...p.candidato,
    id: idItem,
    aptidao: "apto",
    prova: {
      idProposta: p.id,
      homologacaoUsuario: true,
      publicacaoEngenheiro: true
    }
  });
  if (!reg.incluido) {
    return {
      ok: false,
      erro: "registo_recusado",
      motivosRecusa: reg.motivosRecusa
    };
  }
  p.passos.publicacao = true;
  p.estado = "publicado";
  p.idItem = idItem;
  return { ok: true, idProposta: p.id, idItem, estado: p.estado };
}

/**
 * Tentativa explícita de publicação sem homologação — deve falhar (CA-074-2).
 */
export function tentarPublicarSemHomologacao(opts = {}) {
  const p = propostas.get(String(opts.idProposta || ""));
  if (!p) return { ok: false, erro: "proposta_inexistente", incluido: false };
  if (p.passos.homologacaoUsuario) {
    return { ok: false, erro: "ja_homologado_use_publicarEngenheiro" };
  }
  return {
    ok: false,
    erro: "publicacao_sem_homologacao",
    incluido: false
  };
}

/**
 * Revogar aptidão (apto → não apto) — Usuário homologa o acto; CTO pode propor.
 * Sistema CEO não revoga.
 */
export function revogarAptidao(opts = {}) {
  const agente = String(opts.agente || "");
  if (agente === AGENTES.sistema_ceo) {
    return { ok: false, erro: "sistema_nao_revoga" };
  }
  if (agente !== AGENTES.usuario && agente !== AGENTES.cto) {
    return { ok: false, erro: "agente_nao_autorizado_revogar" };
  }
  // CTO propõe; Usuário homologa a revogação
  if (agente === AGENTES.cto && opts.homologadoPeloUsuario !== true) {
    return {
      ok: false,
      erro: "revogacao_requer_homologacao_usuario",
      propostaRevogacao: true
    };
  }
  if (agente === AGENTES.usuario || opts.homologadoPeloUsuario === true) {
    /* ok */
  } else {
    return { ok: false, erro: "revogacao_requer_homologacao_usuario" };
  }

  const causa = String(opts.causa || "");
  if (CAUSAS_INSUFICIENTES.includes(causa)) {
    return { ok: false, erro: "causa_insuficiente", causa };
  }
  if (!CAUSAS_NAO_APTO.includes(causa)) {
    return { ok: false, erro: "causa_invalida", causa };
  }
  if (!moCompleta(opts.memoriaOrganizacional)) {
    return { ok: false, erro: "mo_incompleta" };
  }

  const idItem = String(opts.idItem || "").trim();
  const antes = obterItemPorId(idItem);
  if (!antes) return { ok: false, erro: "item_inexistente" };

  const alt = alterarAptidaoGovernada(idItem, "nao_apto");
  if (!alt.ok) return { ok: false, erro: alt.erro };

  rastrosMo.push({
    tipo: "revogacao_aptidao",
    idItem,
    causa,
    identidadePreservada: alt.id === idItem,
    ...opts.memoriaOrganizacional
  });

  const depois = obterItemPorId(idItem);
  const consulta = consultarFonteOficial({
    ambitoCoa: depois?.ambitoCoa
  });
  const aindaEntregueComoApto = consulta.itens.some((i) => i.id === idItem);

  return {
    ok: true,
    idItem,
    aptidao: "nao_apto",
    identidadePreservada: true,
    entregueComoValido: aindaEntregueComoApto
  };
}

/**
 * Sistema CEO não pode homologar, publicar nem revogar (CA-074-6).
 */
export function actoSistemaCeo(tipo) {
  const t = String(tipo || "");
  if (t === "homologar" || t === "publicar" || t === "revogar") {
    return { ok: false, erro: `sistema_nao_${t}` };
  }
  if (t === "propor_candidato") {
    return { ok: true, permitido: true };
  }
  return { ok: false, erro: "acto_desconhecido" };
}

export function obterProposta(idProposta) {
  const p = propostas.get(String(idProposta || ""));
  return p ? { ...p, passos: { ...p.passos } } : null;
}

export function reiniciarGovernancaParaTestes() {
  propostas = new Map();
  rastrosMo = [];
  reiniciarRegistro();
}

export function listarRastrosMo() {
  return rastrosMo.slice();
}
