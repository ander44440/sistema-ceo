/**
 * Context Governor — políticas de regime (CG-POLICY).
 * Interpreta regimeEspecial + fontes autorizadas sem reabrir ADR.
 */

import { FONTES_CG, USOS_CG } from "./contratos.js";

/**
 * @param {string[]} fontesAutorizadas
 * @param {import("./contratos.js").FragmentoContexto} frag
 * @param {object} [regimeEspecial]
 * @returns {{ ok: true } | { ok: false, codigo: string, motivo: string }}
 */
export function avaliarFonteEUso(fontesAutorizadas, frag, regimeEspecial = {}) {
  const fontes = Array.isArray(fontesAutorizadas) ? fontesAutorizadas : [];
  const fonte = String(frag?.fonte || FONTES_CG.NAO_DECLARADA);
  const uso = String(frag?.uso || USOS_CG.MANDATO_PROMPT);
  const regime =
    regimeEspecial && typeof regimeEspecial === "object" ? regimeEspecial : {};

  if (
    fonte === FONTES_CG.NAO_DECLARADA ||
    (fonte !== FONTES_CG.NAO_ETIQUETADO && !fontes.includes(fonte))
  ) {
    return {
      ok: false,
      codigo: "V3_FONTE",
      motivo: `Fonte '${fonte}' não autorizada no acto.`
    };
  }

  // Legacy não etiquetado: não é autorização implícita (IN-1); marca V3.
  if (fonte === FONTES_CG.NAO_ETIQUETADO && !fontes.includes(FONTES_CG.NAO_ETIQUETADO)) {
    return {
      ok: false,
      codigo: "V3_FONTE",
      motivo: "Fragmento nao_etiquetado sem autorização explícita (disponível ≠ autorizado)."
    };
  }

  if (
    regime.rfr === true &&
    (fonte === FONTES_CG.HFC_CONTINUIDADE ||
      fonte === FONTES_CG.HFC_PROVA ||
      fonte === FONTES_CG.NAO_ETIQUETADO) &&
    (uso === USOS_CG.FACTO || uso === USOS_CG.OBJECTO)
  ) {
    return {
      ok: false,
      codigo: "V3_FONTE",
      motivo: "Sob RFR, HFC/fio não pode entrar como facto ou objecto."
    };
  }

  if (regime.vca_isolamento_csc === true && fonte === FONTES_CG.CSC) {
    return {
      ok: false,
      codigo: "V3_FONTE",
      motivo: "CSC isolado pelo VCA — não reautorizar no CG."
    };
  }

  if (fonte === FONTES_CG.MO_CONSULTA && !fontes.includes(FONTES_CG.MO_CONSULTA)) {
    return {
      ok: false,
      codigo: "V3_FONTE",
      motivo: "MO sem consulta explícita autorizada."
    };
  }

  return { ok: true };
}
