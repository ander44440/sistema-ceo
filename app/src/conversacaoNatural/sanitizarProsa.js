/**
 * Remove marcadores de template deliberativo da prosa ao utilizador (PX-003 E3).
 * Rastreio técnico permanece em dados.conversacaoNatural / metadados.
 */

const LINHAS_LIXO =
  /^\s*(Sobre|Aprovo|Rejeito|Delego a execução|Vou monitorar|Preciso de dados|Adio a deliberação|Porquê|Porque|Lacunas residuais)\s*:\s*/i;

/**
 * @param {string} texto
 * @returns {string}
 */
export function sanitizarProsaUsuario(texto) {
  let t = String(texto || "").trim();
  if (!t) return t;

  t = t
    .split(/\n+/)
    .map((linha) => {
      let L = linha.trim();
      if (!L) return "";
      if (/^Lacunas residuais\s*:/i.test(L)) return "";
      if (/^Sobre\s*:/i.test(L)) return "";
      L = L.replace(LINHAS_LIXO, "");
      L = L.replace(/^Aprovo\s*:\s*/i, "");
      L = L.replace(/^Rejeito\s*:\s*/i, "");
      L = L.replace(/^Próximo gesto\s*:\s*/i, "Sugiro ");
      L = L.replace(/^Porquê\s*:\s*/i, "");
      return L.trim();
    })
    .filter(Boolean)
    .join("\n\n");

  // Resíduos inline
  t = t.replace(/\bSobre:\s*/gi, "");
  t = t.replace(/\bAprovo:\s*/gi, "");
  t = t.replace(/\bRejeito:\s*/gi, "");
  t = t.replace(/\bPorquê:\s*/gi, "");
  t = t.replace(/\bLacunas residuais:\s*[^\n]*/gi, "");
  // DESP-010 (evidência missão): fragmentos técnicos de .env / chave
  t = t.replace(/CEO_LLM_API_KEY/gi, "");
  t = t.replace(/\.env\.example/gi, "");
  t = t.replace(/\benv`\s*\(?/gi, "");
  t = t.replace(/`+\s*\(?\s*$/gm, "");
  // CTO-002: nunca ecoar objectivo inventado pelo sistema
  t = t.replace(
    /Objectivo principal:\s*Definir o efeito esperado da [uú]ltima instru[cç][aã]o[^.]*\.?/gi,
    ""
  );
  t = t.replace(
    /Pr[oó]ximo passo j[aá] em vista:\s*Definir o efeito esperado[^.]*\.?/gi,
    ""
  );
  t = t.replace(
    /Definir o efeito esperado da [uú]ltima instru[cç][aã]o ou pedir o estado atual\.?/gi,
    ""
  );
  t = t.replace(/\n{3,}/g, "\n\n").trim();

  return t;
}

/**
 * True se a prosa ainda expõe estrutura interna de deliberação.
 * @param {string} texto
 */
export function expoeEstruturaDeliberacao(texto) {
  const t = String(texto || "");
  return (
    /\bSobre\s*:/i.test(t) ||
    /\bAprovo\s*:/i.test(t) ||
    /\bRejeito\s*:/i.test(t) ||
    /\bPorquê\s*:/i.test(t) ||
    /\bLacunas residuais\s*:/i.test(t)
  );
}
