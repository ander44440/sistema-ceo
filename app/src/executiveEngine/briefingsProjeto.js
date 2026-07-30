/**
 * Briefings fixos por projeto — conhecimento de domínio (não definem quem o CEO é).
 * Fonte: docs do CEO (ADR-015, MVP MG2). Atualizar quando o patrocinador validar novos factos.
 */

/** @type {Record<string, string>} */
const BRIEFINGS_POR_ID = {
  "prj-mg2": [
    "BRIEFING DO PROJETO ATIVO — Motoboy Game 2 (MG2):",
    "- O MG2 é o produto/jogo em desenvolvimento pelo patrocinador; é o primeiro contexto operacional real do CEO (ADR-015).",
    "- Neste COA, o trabalho do dia refere-se ao desenvolvimento do MG2; a execução técnica (código, build, deploy) ocorre fora do CEO, na oficina de implementação.",
    "- Alias: MG2 = Motoboy Game 2. Quando o utilizador falar em «o jogo», «a corrida» ou «o payout» neste COA, trata-se do MG2 salvo indicação contrária.",
    "- Domínio de produto (visão operacional no acervo do CEO): fluxo de corrida do motoboy até o payout; regras de taxa (incluindo corrida cancelada: zerar vs ratear) foram tema de decisão/continuidade no MVP documental.",
    "- Este briefing não cobre implementação detalhada nem estado corrente da sessão; o estado dinâmico está apenas no CONTEXTO EXECUTIVO."
  ].join("\n")
};

/**
 * @param {{ id?: string, nome?: string } | null | undefined} coa
 * @returns {string|null}
 */
export function obterBriefingProjeto(coa) {
  if (!coa) return null;
  if (coa.id && BRIEFINGS_POR_ID[coa.id]) return BRIEFINGS_POR_ID[coa.id];
  const nome = String(coa.nome || "").toLowerCase();
  if (/motoboy\s*game\s*2|\bmg2\b/.test(nome)) {
    return BRIEFINGS_POR_ID["prj-mg2"];
  }
  return null;
}
