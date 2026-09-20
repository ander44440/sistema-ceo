/**
 * IMP-094 Fase 3 — Um caminho deliberativo (MRE + CG).
 * Rollback: CEO_FUNIL_DELIBERAR_UNICO=off
 */

/**
 * Deliberação única activa por omissão; desliga com CEO_FUNIL_DELIBERAR_UNICO=off.
 * @returns {boolean}
 */
export function funilDeliberarUnicoActiva() {
  const env =
    (typeof process !== "undefined" && process.env?.CEO_FUNIL_DELIBERAR_UNICO) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.CEO_FUNIL_DELIBERAR_UNICO) ||
    "";
  return String(env).trim().toLowerCase() !== "off";
}

/**
 * OBS-1 / OBS-3 / OBS-4 / OBS-8 — veredicto deliberar via MRE (+ CG se LLM).
 * @param {object} resposta
 * @param {{ llmInvocado?: boolean }} [opts]
 * @returns {object}
 */
export function anexarObservabilidadeDeliberar(resposta, opts = {}) {
  const llmInvocado = opts.llmInvocado === true;
  const dadosPrev =
    resposta?.dados && typeof resposta.dados === "object" ? resposta.dados : {};
  return {
    ...resposta,
    dados: {
      ...dadosPrev,
      veredictoCaminho: "deliberar",
      llmInvocado,
      /** OBS-4: CG aplica-se a todo LLM oficial (MRE → deliberarComLlm). */
      cgAplicado: llmInvocado,
      /** OBS-8: identidade do caminho — MRE, não llm_rapido paralelo. */
      caminhoDeliberativo: "mre"
    }
  };
}
