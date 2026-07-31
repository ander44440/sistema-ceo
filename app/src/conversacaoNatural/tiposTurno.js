/**
 * Tipos de turno — contrato PX-003 E1 §3.3.
 */

export const TIPO_TURNO = Object.freeze({
  ABERTURA: "abertura",
  ESPELHO: "espelho",
  DELIBERACAO: "deliberacao",
  BLOQUEIO: "bloqueio",
  FECHO: "fecho",
  SISTEMA: "sistema"
});

/**
 * @param {object} entrada
 * @param {object} [entrada.parecer]
 * @param {string} [entrada.modo]
 * @param {boolean} [entrada.ok]
 * @param {string} [entrada.rota]
 * @param {string} [entrada.intencaoId]
 * @param {boolean} [entrada.pedidoAmbiguo]
 */
export function classificarTipoTurno(entrada = {}) {
  const modo = String(entrada.modo || "");
  const rota = String(entrada.rota || entrada.dados?.rota || "");
  const intencaoId = entrada.intencaoId || entrada.dados?.intencao?.id;

  if (
    modo === "fallback" ||
    modo === "mre-falha" ||
    modo === "mre-speaker-falha" ||
    rota.includes("erro") ||
    rota.includes("sem-llm")
  ) {
    return TIPO_TURNO.SISTEMA;
  }

  if (intencaoId === "saudacao" || entrada.forcarAbertura) {
    return TIPO_TURNO.ABERTURA;
  }

  const parecer = entrada.parecer || entrada.dados?.parecer;
  if (parecer?.decisaoExecutiva?.estado === "solicitar_dados") {
    return TIPO_TURNO.BLOQUEIO;
  }

  if (entrada.pedidoAmbiguo) {
    return TIPO_TURNO.ESPELHO;
  }

  if (parecer && entrada.ok !== false) {
    const estado = parecer.decisaoExecutiva?.estado;
    if (estado === "adiar" && !parecer.acao?.descricao) {
      return TIPO_TURNO.FECHO;
    }
    return TIPO_TURNO.DELIBERACAO;
  }

  if (modo === "local" && intencaoId) {
    return TIPO_TURNO.ABERTURA;
  }

  if (modo === "llm" || modo === "local") {
    return TIPO_TURNO.DELIBERACAO;
  }

  return TIPO_TURNO.DELIBERACAO;
}
