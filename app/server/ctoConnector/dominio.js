/**
 * Domínio CTO Connector — enums, budgets, validação (REQ-054).
 * Sem I/O de rede.
 */

export const TIPOS_CONSULTA = Object.freeze([
  "parecer_arquitetural",
  "revisao_req",
  "revisao_arq",
  "gate",
  "duvida_normativa",
  "outro"
]);

export const SCHEMAS = Object.freeze([
  "cto.parecer_v1",
  "cto.revisao_artefacto_v1",
  "cto.gate_v1",
  "cto.duvida_normativa_v1"
]);

export const BUDGET = Object.freeze({
  perguntaMax: 4000,
  contextoJsonMax: 12000,
  artefactosMax: 30
});

export const POLICY_CTO = [
  "Tu és o CTO do Sistema CEO (CON-001 Art. 6º II): requisitos, arquitetura, revisão e gates.",
  "Nunca implementas código, nunca propões patches, diffs de repositório, commits nem PRs.",
  "Não usurpas o patrocinador na homologação nem o Engenheiro (Cursor) na implementação.",
  "Responde APENAS com um único objeto JSON válido (sem markdown) no formato pedido.",
  "papelConfirmado deve ser exactamente a string CTO.",
  "estado deve ser ok ou recusa.",
  "corpoEstruturado deve cumprir o schema indicado; não incluas campos de código/patch/commit."
].join(" ");

/**
 * @param {unknown} pacote
 * @returns {{ ok: true, pacote: object } | { ok: false, mensagem: string }}
 */
export function validarPacoteConsultaCto(pacote) {
  if (!pacote || typeof pacote !== "object") {
    return { ok: false, mensagem: "PacoteConsultaCto em falta." };
  }
  const p = /** @type {Record<string, unknown>} */ (pacote);
  for (const campo of [
    "consultaId",
    "tipo",
    "pergunta",
    "contextoExecutivo",
    "expectativaSchema"
  ]) {
    if (p[campo] === undefined || p[campo] === null || p[campo] === "") {
      return { ok: false, mensagem: `Campo obrigatório em falta: ${campo}.` };
    }
  }
  if (typeof p.consultaId !== "string" || !String(p.consultaId).trim()) {
    return { ok: false, mensagem: "consultaId inválido." };
  }
  if (!TIPOS_CONSULTA.includes(/** @type {string} */ (p.tipo))) {
    return { ok: false, mensagem: `tipo inválido: ${p.tipo}.` };
  }
  if (!SCHEMAS.includes(/** @type {string} */ (p.expectativaSchema))) {
    return {
      ok: false,
      mensagem: `expectativaSchema inválido: ${p.expectativaSchema}.`
    };
  }
  if (typeof p.pergunta !== "string") {
    return { ok: false, mensagem: "pergunta deve ser string." };
  }
  if (p.pergunta.length > BUDGET.perguntaMax) {
    return {
      ok: false,
      mensagem: `pergunta excede ${BUDGET.perguntaMax} caracteres.`
    };
  }
  if (typeof p.contextoExecutivo !== "object" || p.contextoExecutivo === null) {
    return { ok: false, mensagem: "contextoExecutivo deve ser objeto." };
  }
  let ctxJson;
  try {
    ctxJson = JSON.stringify(p.contextoExecutivo);
  } catch {
    return { ok: false, mensagem: "contextoExecutivo não serializável." };
  }
  if (ctxJson.length > BUDGET.contextoJsonMax) {
    return {
      ok: false,
      mensagem: `contextoExecutivo excede ${BUDGET.contextoJsonMax} caracteres.`
    };
  }
  if (p.artefactosRef !== undefined) {
    if (!Array.isArray(p.artefactosRef)) {
      return { ok: false, mensagem: "artefactosRef deve ser array." };
    }
    if (p.artefactosRef.length > BUDGET.artefactosMax) {
      return {
        ok: false,
        mensagem: `artefactosRef excede ${BUDGET.artefactosMax} entradas.`
      };
    }
  }
  if (p.prioridade !== undefined && p.prioridade !== "normal" && p.prioridade !== "alta") {
    return { ok: false, mensagem: "prioridade inválida." };
  }
  return { ok: true, pacote: p };
}

function temCampoProibido(obj) {
  if (!obj || typeof obj !== "object") return false;
  const proibidos = [
    "patch",
    "diff",
    "commit",
    "pullRequest",
    "pull_request",
    "codigoFonte",
    "codePatch",
    "filesToEdit"
  ];
  const stack = [obj];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    for (const [k, v] of Object.entries(cur)) {
      if (proibidos.includes(k)) return true;
      if (v && typeof v === "object") stack.push(v);
    }
  }
  return false;
}

/** Normaliza aliases comuns do modelo para os campos canónicos do schema. */
export function normalizarCorpoEstruturado(schemaId, corpo) {
  if (!corpo || typeof corpo !== "object") return corpo;
  const c = { ...corpo };
  if (schemaId === "cto.parecer_v1") {
    if (typeof c.conclusao !== "string") {
      const alt =
        c.conclusão || c.conclusion || c.parecer || c.resumo || c.veredito;
      if (typeof alt === "string" && alt.trim()) c.conclusao = alt.trim();
    }
  }
  if (schemaId === "cto.gate_v1" && typeof c.decisao !== "string") {
    const alt = c.decisão || c.decision || c.gate;
    if (typeof alt === "string") c.decisao = alt.trim();
  }
  if (schemaId === "cto.revisao_artefacto_v1" && typeof c.veredicto !== "string") {
    const alt = c.veredito || c.verdicto || c.resultado;
    if (typeof alt === "string") c.veredicto = alt.trim();
  }
  if (
    schemaId === "cto.duvida_normativa_v1" &&
    typeof c.interpretacao !== "string"
  ) {
    const alt = c.interpretação || c.interpretation || c.resposta;
    if (typeof alt === "string") c.interpretacao = alt.trim();
  }
  return c;
}

/**
 * @param {string} schemaId
 * @param {unknown} corpo
 */
export function validarCorpoSchema(schemaId, corpo) {
  const normalizado = normalizarCorpoEstruturado(schemaId, corpo);
  if (!normalizado || typeof normalizado !== "object") {
    return { ok: false, mensagem: "corpoEstruturado em falta." };
  }
  if (temCampoProibido(normalizado)) {
    return {
      ok: false,
      mensagem: "corpoEstruturado contém campos de implementação proibidos."
    };
  }
  const c = /** @type {Record<string, unknown>} */ (normalizado);
  switch (schemaId) {
    case "cto.parecer_v1":
      if (typeof c.conclusao !== "string" || !c.conclusao.trim()) {
        return { ok: false, mensagem: "cto.parecer_v1 exige conclusao." };
      }
      return { ok: true };
    case "cto.revisao_artefacto_v1": {
      const v = c.veredicto;
      if (
        v !== "aprovado" &&
        v !== "aprovado_com_oe" &&
        v !== "rejeitado"
      ) {
        return {
          ok: false,
          mensagem: "cto.revisao_artefacto_v1 exige veredicto válido."
        };
      }
      return { ok: true };
    }
    case "cto.gate_v1": {
      const d = c.decisao;
      if (d !== "go" && d !== "no_go" && d !== "condicionado") {
        return { ok: false, mensagem: "cto.gate_v1 exige decisao válida." };
      }
      return { ok: true };
    }
    case "cto.duvida_normativa_v1":
      if (typeof c.interpretacao !== "string" || !c.interpretacao.trim()) {
        return {
          ok: false,
          mensagem: "cto.duvida_normativa_v1 exige interpretacao."
        };
      }
      return { ok: true };
    default:
      return { ok: false, mensagem: `Schema desconhecido: ${schemaId}.` };
  }
}

/**
 * Extrai JSON de resposta do modelo (permite fence opcional).
 * @param {string} texto
 */
export function extrairJson(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    /* continue */
  }
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      /* continue */
    }
  }
  const i = raw.indexOf("{");
  const j = raw.lastIndexOf("}");
  if (i >= 0 && j > i) {
    try {
      return JSON.parse(raw.slice(i, j + 1));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * @param {object} pacote
 * @param {object} parsed
 * @param {{ modelo: string, latenciaMs: number, criadoEm: string }} rastreioBase
 */
export function montarResultadoDeParsed(pacote, parsed, rastreioBase) {
  if (!parsed || typeof parsed !== "object") {
    return {
      ok: false,
      resultado: {
        consultaId: pacote.consultaId,
        estado: "erro_schema",
        rastreio: rastreioBase,
        mensagem: "Resposta do modelo não é JSON."
      }
    };
  }
  const estado = parsed.estado === "recusa" ? "recusa" : "ok";
  if (parsed.papelConfirmado !== "CTO") {
    return {
      ok: false,
      resultado: {
        consultaId: pacote.consultaId,
        estado: "erro_schema",
        rastreio: rastreioBase,
        mensagem: "papelConfirmado deve ser CTO."
      }
    };
  }
  if (estado === "ok") {
    const corpoNorm = normalizarCorpoEstruturado(
      pacote.expectativaSchema,
      parsed.corpoEstruturado
    );
    const vs = validarCorpoSchema(pacote.expectativaSchema, corpoNorm);
    if (!vs.ok) {
      return {
        ok: false,
        resultado: {
          consultaId: pacote.consultaId,
          estado: "erro_schema",
          rastreio: rastreioBase,
          mensagem: vs.mensagem
        }
      };
    }
    parsed.corpoEstruturado = corpoNorm;
  }
  /** @type {Record<string, unknown>} */
  const resultado = {
    consultaId: pacote.consultaId,
    estado,
    papelConfirmado: "CTO",
    rastreio: {
      ...rastreioBase,
      modelo: rastreioBase.modelo
    }
  };
  if (typeof parsed.resumo === "string") resultado.resumo = parsed.resumo;
  if (parsed.corpoEstruturado !== undefined) {
    resultado.corpoEstruturado = parsed.corpoEstruturado;
  }
  if (parsed.opcoes !== undefined) resultado.opcoes = parsed.opcoes;
  if (parsed.recomendacao !== undefined) {
    resultado.recomendacao = parsed.recomendacao;
  }
  if (parsed.riscos !== undefined) resultado.riscos = parsed.riscos;
  if (parsed.proximosPassosSugeridos !== undefined) {
    resultado.proximosPassosSugeridos = parsed.proximosPassosSugeridos;
  }
  return { ok: true, resultado };
}

export function montarMensagensCto(pacote, { correcaoSchema = false } = {}) {
  function esquemaCorpoHint(schemaId) {
    switch (schemaId) {
      case "cto.parecer_v1":
        return {
          conclusao: "string obrigatória",
          alternativas: "opcional array",
          riscos: "opcional",
          condicoes: "opcional"
        };
      case "cto.revisao_artefacto_v1":
        return {
          veredicto: "aprovado|aprovado_com_oe|rejeitado",
          oes: "opcional array"
        };
      case "cto.gate_v1":
        return {
          decisao: "go|no_go|condicionado",
          checklist: "opcional array"
        };
      case "cto.duvida_normativa_v1":
        return { interpretacao: "string obrigatória", refs: "opcional array" };
      default:
        return `conforme ${schemaId}`;
    }
  }

  const userPayload = {
    consultaId: pacote.consultaId,
    tipo: pacote.tipo,
    pergunta: pacote.pergunta,
    contextoExecutivo: pacote.contextoExecutivo,
    artefactosRef: pacote.artefactosRef || [],
    restricoes: pacote.restricoes || null,
    expectativaSchema: pacote.expectativaSchema,
    prioridade: pacote.prioridade || "normal",
    coaId: pacote.coaId || null,
    projeto: pacote.projeto || null,
    formatoResposta: {
      papelConfirmado: "CTO",
      estado: "ok|recusa",
      resumo: "string",
      corpoEstruturado: esquemaCorpoHint(pacote.expectativaSchema),
      opcoes: "opcional",
      recomendacao: "opcional",
      riscos: "opcional",
      proximosPassosSugeridos: "opcional"
    }
  };
  const messages = [
    { role: "system", content: POLICY_CTO },
    {
      role: "user",
      content: JSON.stringify(userPayload)
    }
  ];
  if (correcaoSchema) {
    messages.push({
      role: "user",
      content:
        "A resposta anterior falhou a validação de schema. Devolve JSON corrigido, só o objeto, sem markdown, com papelConfirmado=CTO e corpoEstruturado válido para " +
        pacote.expectativaSchema +
        "."
    });
  }
  return messages;
}
