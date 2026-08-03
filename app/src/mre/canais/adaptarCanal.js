/**
 * Adaptação por canal (IMP-016 / REQ-050).
 */

import { gerarComunicadoExecutivo } from "../speaker/speakerExecutivo.js";

/**
 * Gera comunicados para chat, voz e centro a partir do mesmo parecer.
 * @param {object} parecer
 * @returns {{ ok: boolean, porCanal?: object, erro?: string }}
 */
export function gerarComunicadosPorCanal(parecer) {
  const chat = gerarComunicadoExecutivo(parecer, "chat");
  const voz = gerarComunicadoExecutivo(parecer, "voz");
  const centro = gerarComunicadoExecutivo(parecer, "centro_situacao");

  if (!chat.ok || !voz.ok || !centro.ok) {
    return {
      ok: false,
      erro: chat.erro || voz.erro || centro.erro
    };
  }

  const estados = [
    chat.comunicado.referenciaDecisao,
    voz.comunicado.referenciaDecisao,
    centro.comunicado.referenciaDecisao
  ];
  const mesmoSignificado = estados.every((e) => e === estados[0]);

  return {
    ok: true,
    mesmoSignificado,
    porCanal: {
      chat: chat.comunicado,
      voz: voz.comunicado,
      centro_situacao: centro.comunicado
    }
  };
}

/**
 * Texto a enviar à Voice Engine.
 * @param {object} comunicado
 */
export function textoParaVoz(comunicado) {
  if (!comunicado) return "";
  return String(comunicado.guiãoVoz || comunicado.texto || "").trim();
}

/**
 * Destaques para centro de situação / Painel.
 * @param {object} comunicado
 */
export function destaquesCentro(comunicado) {
  if (!comunicado) return [];
  if (Array.isArray(comunicado.destaques)) return comunicado.destaques.slice();
  return [
    `Decisão: ${comunicado.referenciaDecisao}`,
    comunicado.texto
  ].filter(Boolean);
}
