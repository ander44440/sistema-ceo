/**
 * Briefings fixos por projeto — conhecimento de domínio (camada de contexto).
 * Fonte canónica curada: docs/mvp/briefing-operacional-mg2.md
 * Gate Opção A: Deliberação CTO 30/07/2026.
 * B1 (autorizado Patrocinador 30/07/2026): factos do briefing entram na entrada MRE
 * via Núcleo (`montarEntradaMre`) — sem alterar lógica deliberativa do MRE/Speaker.
 */

/** @type {Record<string, string>} */
const BRIEFINGS_POR_ID = {
  "prj-mg2": [
    "BRIEFING OPERACIONAL CURADO — Motoboy Game 2 (MG2) — v1.0 (30/07/2026):",
    "- Identidade: protótipo 3D web (Three.js/Vite), cidade Bombinhas, cena WorldLab2 (rotas / e /mg2). Alias: MG2 = Motoboy Game 2 = «o jogo» neste COA.",
    "- Papel do CEO: governar foco, decisões, conhecimento e despachos. Execução técnica (código, build, deploy, 3D) é na oficina (Cursor / repo do jogo), nunca embutida no CEO (REQ-030).",
    "- Objetivo atual: uso jogável estável + cidade crível + menos hitch, para o Patrocinador usar o CEO no dia a dia do MG2 (ADR-015).",
    "- Estado (30/07): WorldLab2 monolítico; Sprint 1 perf feito (raio update ~140 m; pixelRatio adaptativo; SCENE_REV 147). LOD e chunks ainda não. Outdoors nas laterais + luminosos piscantes (JOB-000010). DAY_ONLY=true no protótipo.",
    "- Repo jogo: E:\\anderson\\Projoto motoboy game. Dev: Vite (ex. :5174 se :5173 for o CEO). Fila CEO: executive/queue/.",
    "- Decisões: DEC-MVP-001 taxa zerada em corrida cancelada (23/07); outdoors laterais+piscantes (30/07); perf = distância primeiro, depois LOD, depois chunks; lastro via briefing/contexto — proibido fingir conhecimento no MRE/Speaker.",
    "- Dores: hitch residual (load/draw); briefing em mitigação; observação consultivo vs ação sem Gate de código.",
    "- Próximo passo único: validar Sprint 1 de perf com o Patrocinador; se ok → LOD (Sprint 2) na oficina.",
    "- Fora de escopo agora: build no CEO; alterar MRE/Speaker; multiplayer/pagamento complexo; ciclo VIS→REQ→ARQ estrutural sem evidências adicionais.",
    "- Regra de ouro: se faltar facto (ex. margem, métricas), declarar lacuna e perguntar o mínimo — não inventar Job. Pedidos técnicos → oficina com título/descrição concretos.",
    "- Fonte canónica: docs/mvp/briefing-operacional-mg2.md (atualizar lá primeiro)."
  ].join("\n")
};

/**
 * Factos discretos para `factosOficiais` da entrada MRE (B1).
 * Mantidos alinhados ao briefing canónico — atualizar em conjunto.
 * @type {Record<string, string[]>}
 */
const FACTOS_BRIEFING_POR_ID = {
  "prj-mg2": [
    "COA MG2 = Motoboy Game 2 — protótipo 3D web (Three.js/Vite), cidade Bombinhas, cena principal WorldLab2 (rotas / e /mg2).",
    "Objetivo atual: uso jogável estável + cidade crível + menos hitch (ADR-015); execução de código/build fica na oficina, não no CEO (REQ-030).",
    "Estado técnico: WorldLab2 monolítico; Sprint 1 de performance feito (raio de update ~140 m, pixelRatio adaptativo, SCENE_REV 147); LOD e streaming/chunks ainda não feitos.",
    "Outdoors da avenida: nas laterais dos prédios (não na fachada frontal), tipo luminosos piscantes (JOB-000010, 30/07/2026).",
    "DAY_ONLY=true no protótipo WorldLab2 (ciclo só dia).",
    "Repo do jogo: E:\\anderson\\Projoto motoboy game; CEO em outro processo (Vite tipicamente :5173); MG2 pode usar :5174.",
    "DEC-MVP-001: em corrida cancelada, taxa do motoboy é zerada (não rateada) — 23/07/2026.",
    "Dor ativa: hitch/carga residual (cidade inteira na memória; Sprint 1 mitiga CPU por frame).",
    "Próximo passo curado: validar Sprint 1 de perf com o Patrocinador; se ok → planear LOD (Sprint 2) na oficina.",
    "Fora de escopo agora: embutir build do MG2 no CEO; multiplayer; pagamento complexo; reescrever a cidade de uma vez."
  ]
};

// Alias de id usado em alguns testes / caminhos legados
BRIEFINGS_POR_ID["coa-mg2"] = BRIEFINGS_POR_ID["prj-mg2"];
FACTOS_BRIEFING_POR_ID["coa-mg2"] = FACTOS_BRIEFING_POR_ID["prj-mg2"];

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

/**
 * Factos do briefing para entrada factual do MRE (B1 — camada de contexto).
 * @param {{ id?: string, nome?: string } | null | undefined} coa
 * @returns {string[]}
 */
export function obterFactosBriefingProjeto(coa) {
  if (!coa) return [];
  if (coa.id && FACTOS_BRIEFING_POR_ID[coa.id]) {
    return FACTOS_BRIEFING_POR_ID[coa.id].slice();
  }
  const nome = String(coa.nome || "").toLowerCase();
  if (/motoboy\s*game\s*2|\bmg2\b/.test(nome)) {
    return FACTOS_BRIEFING_POR_ID["prj-mg2"].slice();
  }
  return [];
}
