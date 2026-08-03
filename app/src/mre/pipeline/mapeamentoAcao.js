/**
 * Mapeamento normativo Decisão → Ação (REQ-049 T3).
 */

/**
 * @param {string} estado
 * @param {{ preferirDespacho?: boolean }} [opts]
 * @returns {{ tipo: string, exigeJob: boolean }}
 */
export function mapearTipoAcao(estado, opts = {}) {
  switch (estado) {
    case "solicitar_dados":
      return { tipo: "perguntar", exigeJob: false };
    case "delegar":
      return { tipo: "despachar", exigeJob: true };
    case "monitorar":
    case "adiar":
      return { tipo: "aguardar", exigeJob: false };
    case "rejeitar":
      return { tipo: "orientar", exigeJob: false };
    case "aprovar":
      if (opts.preferirDespacho) {
        return { tipo: "despachar", exigeJob: true };
      }
      return { tipo: "orientar", exigeJob: false };
    default:
      return { tipo: "aguardar", exigeJob: false };
  }
}
