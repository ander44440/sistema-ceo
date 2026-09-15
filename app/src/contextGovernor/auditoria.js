/**
 * Context Governor — auditoria cg.autorizacao (CG-AUDIT).
 * Fail-soft; não escreve LFC/MO/HFC/CSC.
 */

import {
  SCHEMA_VERSAO,
  calcularConteudoHashCampos,
  hashFnv1aHex,
  texto,
  validarPayloadSemFamiliasProibidas
} from "../trilhaAuditavel/dominio.js";
import { emitirEventoTrilha } from "../trilhaAuditavel/emissor.js";
import { TIPO_CG_AUTORIZACAO } from "./contratos.js";

/**
 * @param {object} entrada
 * @returns {{ ok: true, evento: object } | { ok: false, codigo: string, mensagem: string }}
 */
export function construirEventoCgAutorizacao(entrada) {
  const actoChamada = texto(entrada?.actoChamada);
  if (!actoChamada) {
    return {
      ok: false,
      codigo: "cg_acto_ausente",
      mensagem: "actoChamada obrigatório para cg.autorizacao."
    };
  }

  const quando = texto(entrada?.quando) || new Date().toISOString();
  const estado = texto(entrada?.estado) || "desconhecido";
  const modo = texto(entrada?.modo) || "sombra";
  const autorizado = entrada?.autorizado === true;
  const teriaBloqueado = entrada?.teriaBloqueado === true;
  const coaId = texto(entrada?.coaId) || null;
  const casoId = texto(entrada?.casoId) || null;
  const fontesDeclaradas = Array.isArray(entrada?.fontesDeclaradas)
    ? entrada.fontesDeclaradas.map(String)
    : [];
  const violacoes = Array.isArray(entrada?.violacoes)
    ? entrada.violacoes.map(String)
    : [];
  const remocoesCodigos = Array.isArray(entrada?.remocoes)
    ? entrada.remocoes.map((r) =>
        typeof r === "string" ? r : texto(r?.codigo)
      ).filter(Boolean)
    : [];

  const hashCampos = {
    tipo: TIPO_CG_AUTORIZACAO,
    actoChamada,
    estado,
    modo,
    autorizado: autorizado ? "1" : "0",
    quando
  };
  const conteudoHash = calcularConteudoHashCampos(hashCampos);
  const id = `ta-cg-${actoChamada.slice(0, 24)}-${hashFnv1aHex(
    `${conteudoHash}|${quando}`
  ).slice(-10)}`;

  const evento = {
    id,
    schemaVersao: SCHEMA_VERSAO,
    quando,
    actor: texto(entrada?.actor) || "sistema",
    tipo: TIPO_CG_AUTORIZACAO,
    coaId,
    refs: {
      actoChamada,
      ...(coaId ? { coaId } : {}),
      ...(casoId ? { casoId } : {})
    },
    detalhe: {
      estado,
      autorizado,
      modo,
      violacoes,
      remocoes: remocoesCodigos,
      fontesDeclaradas,
      teriaBloqueado,
      resumo: `cg.${estado}`
    },
    resultado: autorizado ? "ok" : "info",
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
 * @param {import("./contratos.js").PedidoGovernancaContexto} pedido
 * @param {import("./contratos.js").ResultadoGovernancaContexto} resultado
 * @param {string} modo
 * @returns {{ ok: boolean, id?: string, codigo?: string, mensagem?: string }}
 */
export function emitirAuditoriaCg(pedido, resultado, modo) {
  try {
    const remocoes =
      resultado?.remocoesHipoteticas || resultado?.remocoes || [];
    const c = construirEventoCgAutorizacao({
      actoChamada: pedido?.actoChamada,
      estado: resultado?.estado,
      autorizado: resultado?.autorizado === true,
      modo,
      teriaBloqueado:
        resultado?.teriaBloqueado === true || resultado?.autorizado === false,
      coaId: pedido?.coaAtivo?.id || pedido?.metaAuditoria?.coaId || null,
      casoId: pedido?.casoAtivo?.casoId || null,
      fontesDeclaradas: pedido?.fontesLastroAutorizadas || [],
      violacoes: resultado?.violacoes || [],
      remocoes,
      actor: "context_governor"
    });
    if (!c.ok) {
      return { ok: false, codigo: c.codigo, mensagem: c.mensagem };
    }
    const emitido = emitirEventoTrilha(c.evento);
    return {
      ok: emitido.ok !== false,
      id: c.evento.id,
      codigo: emitido.codigo,
      mensagem: emitido.mensagem
    };
  } catch (err) {
    return {
      ok: false,
      codigo: "cg_auditoria_falhou",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}
