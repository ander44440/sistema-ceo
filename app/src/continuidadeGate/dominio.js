/**
 * Domínio da Continuidade do Gate — IMP-058 E1 / REQ-058 / ARQ-019.
 * Estados, decisões, modelo de Gate pendente e validações de ciclo de vida.
 * Sem Conversa, Motor, UI, Fila, Dispatcher, Classificador ou I/O.
 */

/** @typedef {"aprovado"|"rejeitado"|"adiado"} DecisaoGate */

/**
 * Estados de vida do Gate (ARQ-019 §4.2).
 * `adiado` não cria estado terminal — permanece `pendente` (E1-CA2).
 * @typedef {"inexistente"|"pendente"|"resolvido_aprovado"|"resolvido_rejeitado"} EstadoGate
 */

/**
 * Três decisões canónicas V1 (ARQ-019 §4.1 / REQ-058).
 * @type {ReadonlyArray<DecisaoGate>}
 */
export const DECISOES_GATE = Object.freeze([
  "aprovado",
  "rejeitado",
  "adiado"
]);

/**
 * Estados canónicos V1 (vista Continuidade).
 * @type {ReadonlyArray<EstadoGate>}
 */
export const ESTADOS_GATE = Object.freeze([
  "inexistente",
  "pendente",
  "resolvido_aprovado",
  "resolvido_rejeitado"
]);

/**
 * Efeito canónico de cada decisão sobre o estado (domínio — sem Job real).
 * @type {Readonly<Record<DecisaoGate, {
 *   estadoDestino: EstadoGate,
 *   podeCriarJob: boolean,
 *   permanecePendente: boolean
 * }>>}
 */
export const EFEITO_POR_DECISAO = Object.freeze({
  aprovado: Object.freeze({
    estadoDestino: /** @type {EstadoGate} */ ("resolvido_aprovado"),
    podeCriarJob: true,
    permanecePendente: false
  }),
  rejeitado: Object.freeze({
    estadoDestino: /** @type {EstadoGate} */ ("resolvido_rejeitado"),
    podeCriarJob: false,
    permanecePendente: false
  }),
  adiado: Object.freeze({
    estadoDestino: /** @type {EstadoGate} */ ("pendente"),
    podeCriarJob: false,
    permanecePendente: true
  })
});

/**
 * Modelo mínimo do Gate pendente / registo de Continuidade (ARQ-019 §3.2; IMP-058 E1).
 * @typedef {object} GatePendente
 * @property {string} gateId
 * @property {string} parecerId
 * @property {string|null} cicloId
 * @property {string} abertoEm — ISO-8601
 * @property {EstadoGate} estado
 * @property {number} adiamentos — contagem de decisões `adiado` aplicadas
 * @property {DecisaoGate|null} ultimaDecisao
 * @property {string|null} ultimaDecisaoEm — ISO-8601
 */

/**
 * @param {string} decisao
 * @returns {decisao is DecisaoGate}
 */
export function ehDecisaoGate(decisao) {
  return DECISOES_GATE.includes(/** @type {DecisaoGate} */ (decisao));
}

/**
 * @param {string} estado
 * @returns {estado is EstadoGate}
 */
export function ehEstadoGate(estado) {
  return ESTADOS_GATE.includes(/** @type {EstadoGate} */ (estado));
}

/**
 * Continuidade só aplica decisão quando o Gate está `pendente` (E1-CA3).
 * @param {EstadoGate|string|null|undefined} estado
 */
export function continuidadeAplica(estado) {
  return estado === "pendente";
}

/**
 * Efeito canónico da decisão (throws se inválida).
 * @param {DecisaoGate} decisao
 */
export function efeitoDaDecisao(decisao) {
  if (!ehDecisaoGate(decisao)) {
    throw new TypeError(`Decisão de Gate inválida: ${decisao}`);
  }
  return EFEITO_POR_DECISAO[decisao];
}

/**
 * Valida transição de estado perante uma decisão.
 * Só a partir de `pendente` (ARQ-019 §4.3 / E1-CA3).
 *
 * @param {EstadoGate|string|null|undefined} de
 * @param {string} decisao
 * @returns {{
 *   ok: true,
 *   de: EstadoGate,
 *   decisao: DecisaoGate,
 *   para: EstadoGate,
 *   podeCriarJob: boolean,
 *   permanecePendente: boolean
 * } | {
 *   ok: false,
 *   mensagem: string
 * }}
 */
export function validarTransicaoGate(de, decisao) {
  if (!ehEstadoGate(/** @type {string} */ (de))) {
    return {
      ok: false,
      mensagem: `Estado de Gate inválido: ${de}.`
    };
  }
  if (!ehDecisaoGate(decisao)) {
    return {
      ok: false,
      mensagem: `Decisão de Gate inválida: ${decisao}.`
    };
  }
  if (!continuidadeAplica(de)) {
    return {
      ok: false,
      mensagem:
        de === "inexistente"
          ? "Continuidade não aplica: nenhum Gate pendente."
          : `Continuidade não aplica: Gate em estado ${de}.`
    };
  }

  const efeito = EFEITO_POR_DECISAO[/** @type {DecisaoGate} */ (decisao)];
  return {
    ok: true,
    de: /** @type {EstadoGate} */ (de),
    decisao: /** @type {DecisaoGate} */ (decisao),
    para: efeito.estadoDestino,
    podeCriarJob: efeito.podeCriarJob,
    permanecePendente: efeito.permanecePendente
  };
}

/**
 * Valida o modelo GatePendente (campos mínimos).
 * @param {unknown} gate
 * @returns {{ ok: true, gate: GatePendente } | { ok: false, mensagem: string }}
 */
export function validarGatePendente(gate) {
  if (!gate || typeof gate !== "object") {
    return { ok: false, mensagem: "GatePendente em falta." };
  }
  const g = /** @type {Record<string, unknown>} */ (gate);

  if (typeof g.gateId !== "string" || !g.gateId.trim()) {
    return { ok: false, mensagem: "gateId obrigatório." };
  }
  if (typeof g.parecerId !== "string" || !g.parecerId.trim()) {
    return { ok: false, mensagem: "parecerId obrigatório." };
  }
  if (g.cicloId != null && typeof g.cicloId !== "string") {
    return { ok: false, mensagem: "cicloId deve ser string ou null." };
  }
  if (typeof g.abertoEm !== "string" || !g.abertoEm.trim()) {
    return { ok: false, mensagem: "abertoEm obrigatório (ISO-8601)." };
  }
  if (typeof g.estado !== "string" || !ehEstadoGate(g.estado)) {
    return { ok: false, mensagem: `estado inválido: ${g.estado}.` };
  }
  if (typeof g.adiamentos !== "number" || g.adiamentos < 0 || !Number.isFinite(g.adiamentos)) {
    return { ok: false, mensagem: "adiamentos deve ser number ≥ 0." };
  }
  if (g.ultimaDecisao != null && !ehDecisaoGate(/** @type {string} */ (g.ultimaDecisao))) {
    return { ok: false, mensagem: `ultimaDecisao inválida: ${g.ultimaDecisao}.` };
  }
  if (g.ultimaDecisaoEm != null && typeof g.ultimaDecisaoEm !== "string") {
    return { ok: false, mensagem: "ultimaDecisaoEm deve ser string ou null." };
  }

  return { ok: true, gate: /** @type {GatePendente} */ (g) };
}

/**
 * Cria registo de Gate pendente (in-memory — sem persistência).
 * @param {{
 *   parecerId: string,
 *   cicloId?: string|null,
 *   gateId?: string,
 *   abertoEm?: string
 * }} input
 * @returns {GatePendente}
 */
export function criarGatePendente(input) {
  if (!input || typeof input.parecerId !== "string" || !input.parecerId.trim()) {
    throw new TypeError("parecerId obrigatório para criar Gate pendente.");
  }
  const abertoEm =
    typeof input.abertoEm === "string" && input.abertoEm.trim()
      ? input.abertoEm.trim()
      : new Date().toISOString();
  const gateId =
    typeof input.gateId === "string" && input.gateId.trim()
      ? input.gateId.trim()
      : `GATE-${abertoEm}-${input.parecerId.trim()}`;

  /** @type {GatePendente} */
  const gate = {
    gateId,
    parecerId: input.parecerId.trim(),
    cicloId:
      input.cicloId == null || input.cicloId === ""
        ? null
        : String(input.cicloId),
    abertoEm,
    estado: "pendente",
    adiamentos: 0,
    ultimaDecisao: null,
    ultimaDecisaoEm: null
  };

  const v = validarGatePendente(gate);
  if (!v.ok) throw new Error(v.mensagem);
  return v.gate;
}

/**
 * Aplica decisão ao Gate (puro — devolve novo objecto).
 * `adiado` mantém `pendente` e incrementa `adiamentos` (E1-CA2).
 *
 * @param {GatePendente} gate
 * @param {string} decisao
 * @param {{ agora?: string }} [opts]
 * @returns {{
 *   ok: true,
 *   gate: GatePendente,
 *   decisao: DecisaoGate,
 *   podeCriarJob: boolean,
 *   permanecePendente: boolean
 * } | {
 *   ok: false,
 *   mensagem: string
 * }}
 */
export function aplicarDecisaoGate(gate, decisao, opts = {}) {
  const validado = validarGatePendente(gate);
  if (!validado.ok) return validado;

  const t = validarTransicaoGate(validado.gate.estado, decisao);
  if (!t.ok) return t;

  const agora =
    typeof opts.agora === "string" && opts.agora.trim()
      ? opts.agora.trim()
      : new Date().toISOString();

  /** @type {GatePendente} */
  const seguinte = {
    ...validado.gate,
    estado: t.para,
    ultimaDecisao: t.decisao,
    ultimaDecisaoEm: agora,
    adiamentos:
      t.decisao === "adiado"
        ? validado.gate.adiamentos + 1
        : validado.gate.adiamentos
  };

  const v = validarGatePendente(seguinte);
  if (!v.ok) return v;

  return {
    ok: true,
    gate: v.gate,
    decisao: t.decisao,
    podeCriarJob: t.podeCriarJob,
    permanecePendente: t.permanecePendente
  };
}

/**
 * Compara dois Gates pelo instante de abertura (mais recente = maior `abertoEm`).
 * Empate: estável por `gateId` lexicográfico.
 * @param {GatePendente} a
 * @param {GatePendente} b
 * @returns {number} &gt;0 se a mais recente que b
 */
export function compararGateMaisRecente(a, b) {
  const va = validarGatePendente(a);
  const vb = validarGatePendente(b);
  if (!va.ok || !vb.ok) {
    throw new TypeError("compararGateMaisRecente exige Gates válidos.");
  }
  if (va.gate.abertoEm !== vb.gate.abertoEm) {
    return va.gate.abertoEm > vb.gate.abertoEm ? 1 : -1;
  }
  if (va.gate.gateId === vb.gate.gateId) return 0;
  return va.gate.gateId > vb.gate.gateId ? 1 : -1;
}

/**
 * Selecciona o Gate pendente mais recente duma lista (RF4 — helper de domínio).
 * Ignora estados ≠ `pendente`.
 * @param {ReadonlyArray<GatePendente>} gates
 * @returns {GatePendente|null}
 */
export function seleccionarGatePendenteMaisRecente(gates) {
  if (!Array.isArray(gates) || gates.length === 0) return null;
  /** @type {GatePendente|null} */
  let melhor = null;
  for (const g of gates) {
    const v = validarGatePendente(g);
    if (!v.ok || v.gate.estado !== "pendente") continue;
    if (!melhor || compararGateMaisRecente(v.gate, melhor) > 0) {
      melhor = v.gate;
    }
  }
  return melhor;
}
