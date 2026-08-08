/**
 * IMP-070 B4 / REQ-071 — Actualização por curadoria governada.
 * Versionamento de conteúdo; actos de curadoria; manutenção de aptidão via governação.
 * Vedado: Porta EIC, alterar Fonte/Limites/Governança.
 */

import {
  alterarAptidaoGovernada,
  aplicarNovaVersaoConteudo,
  consultarFonteOficial,
  obterCadeiaVersoes,
  obterItemPorId
} from "./fonteOficial.js";
import { AGENTES } from "./governancaAcervo.js";

/** Store de projecções (não é Acervo). */
/** @type {Map<string, string>} */
const projecoes = new Map();

/**
 * @param {object} mo
 */
function moCompleta(mo) {
  return Boolean(
    mo &&
      mo.quem &&
      mo.quando &&
      mo.oQue &&
      mo.porQue &&
      mo.baseadoEmQue &&
      mo.resultado
  );
}

/**
 * Actualiza conteúdo vigente com nova versão — mesma identidade (CA-071-1).
 * Requer acto de curadoria governada (não sync, não sistema sozinho).
 */
export function versionarConteudo(opts = {}) {
  const agente = String(opts.agente || "");
  if (agente === AGENTES.sistema_ceo) {
    return { ok: false, erro: "sistema_nao_versiona_sozinho" };
  }
  if (![AGENTES.usuario, AGENTES.cto, AGENTES.engenheiro].includes(agente)) {
    return { ok: false, erro: "agente_invalido" };
  }
  if (!moCompleta(opts.memoriaOrganizacional)) {
    return { ok: false, erro: "mo_incompleta" };
  }
  if (opts.homologadoPeloUsuario !== true && agente !== AGENTES.usuario) {
    return { ok: false, erro: "actualizacao_requer_homologacao_usuario" };
  }

  const idAntes = String(opts.idItem || "").trim();
  const antes = obterItemPorId(idAntes);
  if (!antes) return { ok: false, erro: "item_inexistente" };

  const r = aplicarNovaVersaoConteudo({
    id: idAntes,
    conteudo: opts.conteudo,
    versaoConteudo: opts.versaoConteudo,
    quando: opts.memoriaOrganizacional.quando,
    prova: { actoCuradoriaGovernada: true }
  });
  if (!r.ok) return r;

  const depois = obterItemPorId(idAntes);
  return {
    ok: true,
    id: r.id,
    identidadePreservada: r.id === idAntes && antes.id === depois.id,
    versaoAnterior: antes.versaoConteudo,
    versaoConteudo: r.versaoConteudo,
    cadeia: obterCadeiaVersoes(idAntes)
  };
}

/**
 * Sync automático oficina → Acervo — sempre recusado (CA-071-2).
 */
export function sincronizarOficinaAutomatico(_opts = {}) {
  return {
    ok: false,
    erro: "sync_oficina_proibido",
    actualizouAcervo: false
  };
}

/**
 * Sistema CEO não eleva candidato a património sem governação (CA-071-3).
 */
export function elevarCandidatoSistema(_candidato) {
  return {
    ok: false,
    erro: "candidato_sistema_requer_governanca",
    incluidoNoIndice: false
  };
}

/**
 * Edita projecção subordinada sem tocar no Acervo (CA-071-4).
 */
export function actualizarProjecao(opts = {}) {
  const id = String(opts.idProjecao || "projecao-local").trim();
  const texto = String(opts.texto || "");
  projecoes.set(id, texto);
  const snapshotAcervo = consultarFonteOficial({
    ambitoCoa: opts.ambitoCoa
  });
  return {
    ok: true,
    idProjecao: id,
    texto,
    acervoInalterado: true,
    itensOficiais: snapshotAcervo.itens.length,
    lacuna: snapshotAcervo.lacuna
  };
}

/**
 * Manutenção de aptidão via acto de curadoria (reutiliza guarda de identidade).
 * Não redefine governação — exige os mesmos campos MO / causa via caller B3 ou aqui com prova.
 */
export function manterAptidaoCuradoria(opts = {}) {
  if (!moCompleta(opts.memoriaOrganizacional)) {
    return { ok: false, erro: "mo_incompleta" };
  }
  if (String(opts.agente) === AGENTES.sistema_ceo) {
    return { ok: false, erro: "sistema_nao_altera_aptidao" };
  }
  if (opts.homologadoPeloUsuario !== true && opts.agente !== AGENTES.usuario) {
    return { ok: false, erro: "requer_homologacao_usuario" };
  }
  const aptidao = opts.aptidao;
  if (aptidao !== "apto" && aptidao !== "nao_apto") {
    return { ok: false, erro: "aptidao_invalida" };
  }
  return alterarAptidaoGovernada(opts.idItem, aptidao);
}

export function obterProjecaoLocal(idProjecao) {
  return projecoes.get(String(idProjecao || "")) ?? null;
}

export function reiniciarProjecoesParaTestes() {
  projecoes.clear();
}

export { obterCadeiaVersoes };
