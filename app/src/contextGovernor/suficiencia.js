/**
 * Context Governor — suficiência pós-isolamento (CG-SUFF).
 * M1: versão conservadora — sem inventar conteúdo.
 */

/**
 * @param {object} opts
 * @param {import("./contratos.js").FragmentoContexto[]} opts.residual
 * @param {import("./contratos.js").RemocaoFragmento[]} opts.remocoes
 * @param {string|null|undefined} opts.objetivoOuAssuntoTurno
 * @returns {{ suficiente: boolean, esclarecer: boolean, motivo: string }}
 */
export function avaliarSuficienciaAposIsolamento(opts = {}) {
  const residual = Array.isArray(opts.residual) ? opts.residual : [];
  const remocoes = Array.isArray(opts.remocoes) ? opts.remocoes : [];
  const objetivo = String(opts.objetivoOuAssuntoTurno || "").trim();

  if (remocoes.length === 0) {
    return { suficiente: true, esclarecer: false, motivo: "Sem remoções." };
  }

  // Ambiguidade de caso sinalizada nas remoções → esclarecimento.
  if (remocoes.some((r) => r && r.codigo === "V2_CASO" && /ambigu/i.test(String(r.motivo || "")))) {
    return {
      suficiente: false,
      esclarecer: true,
      motivo: "Ambiguidade de caso — esclarecimento obrigatório."
    };
  }

  if (residual.length > 0) {
    // Conservador M1: residual não vazio ⇒ suficiente para o acto.
    return {
      suficiente: true,
      esclarecer: false,
      motivo: "Lastro residual após isolamento."
    };
  }

  if (!objetivo) {
    // Sem objectivo declarado e residual vazio: ainda conservador — insuficiência só se houve remoções materiais.
    return {
      suficiente: false,
      esclarecer: false,
      motivo: "Pacote esvaziado após isolamento."
    };
  }

  return {
    suficiente: false,
    esclarecer: false,
    motivo: "Lastro insuficiente após isolamento para o objectivo do turno."
  };
}
