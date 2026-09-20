/**
 * Emissão LFC → Trilha Auditável (fail-soft).
 * Tipo lfc.mutacao — extensão mínima IMP-092.1 / ARQ-092 CTO-6.
 */

import {
  SCHEMA_VERSAO,
  calcularConteudoHashCampos,
  hashFnv1aHex,
  texto,
  validarPayloadSemFamiliasProibidas
} from "../trilhaAuditavel/dominio.js";
import { emitirEventoTrilha } from "../trilhaAuditavel/emissor.js";
import { TIPO_TRILHA_LFC_MUTACAO } from "./dominio.js";

/**
 * @param {object} entrada
 * @returns {{ ok: true, evento: object } | { ok: false, codigo: string, mensagem: string }}
 */
export function construirEventoLfcMutacao(entrada) {
  const coaId = texto(entrada?.coaId);
  const casoId = texto(entrada?.casoId);
  const operacao = texto(entrada?.operacao);
  if (!coaId || !casoId || !operacao) {
    return {
      ok: false,
      codigo: "lfc_refs_ausentes",
      mensagem: "coaId, casoId e operacao são obrigatórios para lfc.mutacao."
    };
  }

  const quando = texto(entrada?.quando) || new Date().toISOString();
  const versao = Number(entrada?.versao);
  const nFactos = Number(entrada?.nFactos);
  const superficie = texto(entrada?.superficie) || "desconhecida";
  const origemTurnoRef =
    entrada?.origemTurnoRef == null ? null : texto(entrada.origemTurnoRef);

  const hashCampos = {
    tipo: TIPO_TRILHA_LFC_MUTACAO,
    coaId,
    casoId,
    operacao,
    versao: Number.isFinite(versao) ? String(versao) : "",
    nFactos: Number.isFinite(nFactos) ? String(nFactos) : "",
    superficie,
    quando
  };
  const conteudoHash = calcularConteudoHashCampos(hashCampos);
  const id = `ta-lfc-${casoId.slice(0, 8)}-${operacao.slice(0, 16)}-${hashFnv1aHex(
    `${conteudoHash}|${quando}`
  ).slice(-10)}`;

  const evento = {
    id,
    schemaVersao: SCHEMA_VERSAO,
    quando,
    actor: texto(entrada?.actor) || "utilizador",
    tipo: TIPO_TRILHA_LFC_MUTACAO,
    coaId,
    refs: { coaId, casoId, operacao },
    detalhe: {
      operacao,
      versao: Number.isFinite(versao) ? versao : null,
      nFactos: Number.isFinite(nFactos) ? nFactos : null,
      superficie,
      origemTurnoRef,
      resumo: `lfc.${operacao}`
    },
    resultado: texto(entrada?.resultado) || "ok",
    conteudoHash
  };

  const proibido = validarPayloadSemFamiliasProibidas(evento);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: proibido.codigo,
      mensagem: `Payload proibido: ${proibido.chaves.join(", ")}`
    };
  }
  return { ok: true, evento };
}

/**
 * Fail-soft: falha de Trilha não reverte escrita LFC.
 * @param {object} entrada
 */
export function espelharLfcMutacaoNaTrilha(entrada) {
  try {
    const c = construirEventoLfcMutacao(entrada);
    if (!c.ok) {
      return { ok: false, codigo: c.codigo, mensagem: c.mensagem };
    }
    return emitirEventoTrilha(c.evento);
  } catch (err) {
    return {
      ok: false,
      codigo: "lfc_trilha_falhou",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}
