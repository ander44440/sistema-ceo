/**
 * DESP-005 — Antecipação executiva (calibração comportamental).
 * Só actua com evidência no contexto (parecer / memória de trabalho / pendências).
 * No máximo um sinal por turno; utilizador mantém o controlo.
 */

import { deveAnteciparPendencia } from "./prioridadeIntencao.js";

/**
 * @typedef {object} SinalAntecipacao
 * @property {"risco"|"dependencia"|"oportunidade"|"pendencia"|"proximo"} tipo
 * @property {string} prosa
 * @property {string|null} pergunta
 * @property {number} prioridade — menor = mais urgente
 */

/**
 * @param {object} opts
 * @param {object} [opts.parecer]
 * @param {object} [opts.ctxImediato]
 * @param {string} [opts.canal]
 * @param {string} [opts.estado]
 * @param {boolean} [opts.jaTemPlanoComRisco]
 * @returns {SinalAntecipacao|null}
 */
export function seleccionarAntecipacao(opts = {}) {
  const canal = opts.canal || "chat";
  if (canal === "centro_situacao") return null;

  const estado = opts.estado || opts.parecer?.decisaoExecutiva?.estado;
  if (estado === "solicitar_dados") return null;

  const sinais = recolherSinais(opts);
  if (!sinais.length) return null;

  sinais.sort((a, b) => a.prioridade - b.prioridade);
  return sinais[0];
}

/**
 * @param {object} opts
 * @returns {SinalAntecipacao[]}
 */
export function recolherSinais(opts = {}) {
  const parecer = opts.parecer || null;
  const ctx = opts.ctxImediato || {};
  /** @type {SinalAntecipacao[]} */
  const out = [];

  const riscos = Array.isArray(parecer?.riscos) ? parecer.riscos : [];
  const oportunidades = Array.isArray(parecer?.oportunidades)
    ? parecer.oportunidades
    : [];
  const pendencias = Array.isArray(ctx.pendencias) ? ctx.pendencias : [];
  const proximaAcao = String(ctx.proximaAcao || "").trim();
  const acao = String(parecer?.acao?.descricao || "").trim();
  const jaPlanoRisco = opts.jaTemPlanoComRisco === true;

  // 1. Risco implícito / futuro (evidência em parecer.riscos)
  if (!jaPlanoRisco) {
    const risco = escolherRiscoRelevante(riscos);
    if (risco) {
      const nivel = risco.nivel ? `[${risco.nivel}] ` : "";
      const texto = encurtar(String(risco.texto || ""), 90);
      const mit = String(risco.mitigacao || "").trim();
      out.push({
        tipo: "risco",
        prosa: mit
          ? `Antecipo risco ${nivel}${texto} — mitigação possível: ${encurtar(mit, 70)}.`
          : `Antecipo risco ${nivel}${texto}.`,
        pergunta: "Quer que tratemos deste risco agora ou só se materializar?",
        prioridade: prioridadeRisco(risco.nivel)
      });
    }
  } else if (riscos.length) {
    // Plano já mostrou o risco: antecipar impacto futuro da mitigação
    const risco = escolherRiscoRelevante(riscos);
    const mit = String(risco?.mitigacao || "").trim();
    if (mit && /ap[oó]s|depois/i.test(mit)) {
      out.push({
        tipo: "risco",
        prosa: `Impacto futuro: a mitigação «${encurtar(mit, 70)}» condiciona o calendário.`,
        pergunta: "Reservamos folga para isso ou aceitamos o risco de atraso?",
        prioridade: 2
      });
    }
  }

  // 2. Dependência antecipada (evidência na acção / escopo)
  const dep = extrairDependencia(acao, parecer?.enquadramento?.escopo);
  if (dep) {
    out.push({
      tipo: "dependencia",
      prosa: `Antecipo dependência: ${dep}. Sem isto, o passo seguinte bloqueia.`,
      pergunta: "Confirmamos esta dependência antes de avançar?",
      prioridade: 3
    });
  }

  // 3. Oportunidade de simplificação (evidência em oportunidades)
  const opp = escolherOportunidade(oportunidades);
  if (opp) {
    out.push({
      tipo: "oportunidade",
      prosa: `Oportunidade: ${encurtar(opp.texto, 90)}${
        opp.condicao ? ` (se ${encurtar(opp.condicao, 40)})` : ""
      }.`,
      pergunta: "Simplificamos por este caminho ou mantemos o plano actual?",
      prioridade: opp.valor === "alto" ? 4 : 5
    });
  }

  // 4. Pendência aberta — só se pedida / relevante / deliberação genérica (P1)
  if (
    pendencias.length &&
    deveAnteciparPendencia({
      instrucao: opts.instrucao,
      intencaoId: opts.intencaoId,
      modo: opts.modo,
      pendencias,
      parecer: opts.parecer
    })
  ) {
    const p = encurtar(String(pendencias[0]), 70);
    out.push({
      tipo: "pendencia",
      prosa: `Antecipo pendência aberta: «${p}».`,
      pergunta: "Tratamos essa pendência agora ou depois desta decisão?",
      prioridade: 3
    });
  }

  // 5. Próximo passo (só se não houver sinais mais fortes e há evidência)
  if (proximaAcao && out.length === 0) {
    out.push({
      tipo: "proximo",
      prosa: `Próximo passo já em vista: ${encurtar(proximaAcao, 80)}.`,
      pergunta: "Avançamos para aí em seguida?",
      prioridade: 6
    });
  }

  return out;
}

/**
 * Formata sinal para camada de prosa (N).
 * @param {SinalAntecipacao|null} sinal
 * @param {string} [canal]
 */
export function formatarAntecipacao(sinal, canal = "chat") {
  if (!sinal || !sinal.prosa) return null;
  if (canal === "voz") {
    return encurtar(sinal.prosa, 140);
  }
  return sinal.prosa;
}

/**
 * @param {object[]} riscos
 */
function escolherRiscoRelevante(riscos) {
  if (!riscos.length) return null;
  const ordem = { critico: 0, alto: 1, medio: 2, baixo: 3 };
  const sorted = [...riscos].sort(
    (a, b) =>
      (ordem[String(a?.nivel || "").toLowerCase()] ?? 9) -
      (ordem[String(b?.nivel || "").toLowerCase()] ?? 9)
  );
  const top = sorted[0];
  if (!String(top?.texto || "").trim()) return null;
  // baixo só se for o único e tiver mitigação
  if (String(top.nivel || "").toLowerCase() === "baixo" && !top.mitigacao) {
    return null;
  }
  return top;
}

/**
 * @param {string|undefined} nivel
 */
function prioridadeRisco(nivel) {
  const n = String(nivel || "").toLowerCase();
  if (n === "critico") return 0;
  if (n === "alto") return 1;
  if (n === "medio") return 2;
  return 4;
}

/**
 * @param {object[]} oportunidades
 */
function escolherOportunidade(oportunidades) {
  if (!oportunidades.length) return null;
  const ordem = { alto: 0, medio: 1, baixo: 2 };
  const sorted = [...oportunidades].sort(
    (a, b) =>
      (ordem[String(a?.valor || "").toLowerCase()] ?? 9) -
      (ordem[String(b?.valor || "").toLowerCase()] ?? 9)
  );
  const top = sorted[0];
  if (!String(top?.texto || "").trim()) return null;
  return {
    texto: String(top.texto).trim(),
    condicao: String(top.condicao || "").trim() || null,
    valor: String(top.valor || "").toLowerCase()
  };
}

/**
 * @param {string} acao
 * @param {string} [escopo]
 */
function extrairDependencia(acao, escopo) {
  const m = String(acao || "").match(
    /(?:ap[oó]s|depois\s+de|depende\s+de|condicionado\s+a)\s+([^.;]+)/i
  );
  if (m) return encurtar(m[1].trim(), 80);
  const e = String(escopo || "");
  if (/n[aã]o\s+inclui|exceto|fora\s+do/i.test(e)) {
    return encurtar(e, 80);
  }
  return null;
}

/**
 * @param {string} s
 * @param {number} max
 */
function encurtar(s, max) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Pergunta genérica de autorização — pode ceder lugar à antecipação.
 * @param {string} pergunta
 */
export function perguntaEhGenericaAutorizacao(pergunta) {
  return /pr[oó]ximo passo que autorizamos|Confirmamos e avançamos|Avançamos para a[ií]/i.test(
    String(pergunta || "")
  );
}
