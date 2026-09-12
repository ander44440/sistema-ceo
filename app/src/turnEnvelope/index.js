/**
 * TurnEnvelope — Fatia 0 (IMP-090) + infra Fatia 1 Bloco B1 (IMP-091)
 * Fatia 0: unidade central em sombra; não decide rota/destino/prosa/política.
 * B1: COW — registarPasso / gravarSinalAppendOnce / selarInterpretacao (só materializa).
 * Não integra detectores; não projecta flags; não altera Precedência.
 */

export const CANAL_DEFAULT = "chat";
export const COA_SENTINEL = "__sem_coa__";
export const OBJECTO_INDEFINIDO = "indefinido";

/**
 * @typedef {object} TurnEnvelope
 * @property {string} idTurno
 * @property {string} timestamp
 * @property {string} canal
 * @property {string} coaId
 * @property {string} mensagemAtual
 * @property {string} perguntaAtual
 * @property {string} objecto
 * @property {null|object} intençãoAtual
 * @property {null|string} modo
 * @property {unknown[]} fioConversacional
 * @property {unknown[]} evidênciasRelevantes
 * @property {null} memóriaRelevante
 * @property {null} estadoDaTarefa
 * @property {null|object} restrições
 * @property {null|unknown} autoridade
 * @property {null|Readonly<Record<string, Readonly<object>>>} sinais
 * @property {ReadonlyArray<object>} rastreio
 * @property {null} parecer
 * @property {null} candidatoProsa
 * @property {null} prosaFinal
 * @property {null} políticaSubstituição
 */

/**
 * @param {object} opts
 * @param {string} opts.mensagemAtual — texto de normalizarInstrucao (âncora única)
 * @param {string|null|undefined} [opts.coaIdEntrada]
 * @param {string|null|undefined} [opts.canal]
 * @param {(() => { id?: string }|null|undefined)|null} [opts.obterCoaAtivo]
 * @returns {Readonly<TurnEnvelope>}
 */
export function criarTurnEnvelope(opts = {}) {
  const mensagemAtual = String(opts.mensagemAtual ?? "");
  const canalRaw = opts.canal;
  const canal =
    canalRaw != null && String(canalRaw).trim() !== ""
      ? String(canalRaw).trim()
      : CANAL_DEFAULT;

  let coaId;
  const entrada = opts.coaIdEntrada;
  if (entrada != null && String(entrada).trim() !== "") {
    coaId = String(entrada).trim();
  } else {
    const obter = opts.obterCoaAtivo;
    let ativo = null;
    if (typeof obter === "function") {
      try {
        ativo = obter();
      } catch {
        ativo = null;
      }
    }
    coaId =
      ativo && ativo.id != null && String(ativo.id).trim() !== ""
        ? String(ativo.id).trim()
        : COA_SENTINEL;
  }

  const idTurno =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `turno-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const timestamp = new Date().toISOString();

  const rastreioCreate = Object.freeze({
    fase: "create",
    idTurno,
    coaId,
    canal,
    tamanhoMensagem: mensagemAtual.length
  });

  /** @type {TurnEnvelope} */
  const envelope = {
    idTurno,
    timestamp,
    canal,
    coaId,
    mensagemAtual,
    perguntaAtual: mensagemAtual,
    objecto: OBJECTO_INDEFINIDO,
    intençãoAtual: null,
    modo: null,
    fioConversacional: Object.freeze([]),
    evidênciasRelevantes: Object.freeze([]),
    memóriaRelevante: null,
    estadoDaTarefa: null,
    restrições: null,
    autoridade: null,
    sinais: null,
    rastreio: Object.freeze([rastreioCreate]),
    parecer: null,
    candidatoProsa: null,
    prosaFinal: null,
    políticaSubstituição: null
  };

  return Object.freeze(envelope);
}

/**
 * Anexa o envelope em dados.envelope sem alterar mensagem/modo/capacidade.
 * Shadow: não altera comportamento observável da prosa.
 * @param {object} resposta
 * @param {TurnEnvelope|null|undefined} envelope
 */
export function anexarTurnEnvelopeNaResposta(resposta, envelope) {
  if (!resposta || typeof resposta !== "object" || !envelope) {
    return resposta;
  }
  const dadosPrev =
    resposta.dados && typeof resposta.dados === "object" ? resposta.dados : {};
  return {
    ...resposta,
    dados: {
      ...dadosPrev,
      envelope
    }
  };
}

/**
 * Congela um passo de rastreio (objecto plano).
 * @param {object} passo
 */
function freezePasso(passo) {
  return Object.freeze({ ...(passo && typeof passo === "object" ? passo : {}) });
}

/**
 * Congela um registo de sinal no formato ARQ-091.
 * @param {object} registo
 * @param {string} chave
 */
function normalizarRegistoSinal(registo, chave) {
  const src = registo && typeof registo === "object" ? registo : {};
  return Object.freeze({
    id: src.id != null ? String(src.id) : chave,
    valor: src.valor,
    fonte: src.fonte != null ? String(src.fonte) : "",
    em: src.em != null ? String(src.em) : new Date().toISOString(),
    fase: src.fase != null ? String(src.fase) : "sinais"
  });
}

/**
 * Copy-on-write: novo envelope congelado a partir do anterior.
 * Campos Fatia 0 selados (mensagemAtual, perguntaAtual, coaId, idTurno, timestamp, canal)
 * são sempre copiados — nunca reinterpretados.
 * @param {Readonly<TurnEnvelope>} envelope
 * @param {object} patch
 * @returns {Readonly<TurnEnvelope>}
 */
export function aplicarPatchEnvelope(envelope, patch = {}) {
  if (!envelope || typeof envelope !== "object") {
    throw new TypeError("aplicarPatchEnvelope: envelope inválido");
  }
  const next = {
    idTurno: envelope.idTurno,
    timestamp: envelope.timestamp,
    canal: envelope.canal,
    coaId: envelope.coaId,
    mensagemAtual: envelope.mensagemAtual,
    perguntaAtual: envelope.perguntaAtual,
    objecto: envelope.objecto,
    intençãoAtual: envelope.intençãoAtual,
    modo: envelope.modo,
    fioConversacional: envelope.fioConversacional,
    evidênciasRelevantes: envelope.evidênciasRelevantes,
    memóriaRelevante: envelope.memóriaRelevante,
    estadoDaTarefa: envelope.estadoDaTarefa,
    restrições: envelope.restrições,
    autoridade: envelope.autoridade,
    sinais: envelope.sinais,
    rastreio: envelope.rastreio,
    parecer: envelope.parecer,
    candidatoProsa: envelope.candidatoProsa,
    prosaFinal: envelope.prosaFinal,
    políticaSubstituição: envelope.políticaSubstituição,
    ...(envelope.derivacoes !== undefined
      ? { derivacoes: envelope.derivacoes }
      : {}),
    ...patch
  };
  return Object.freeze(next);
}

/**
 * @param {Readonly<TurnEnvelope>} envelope
 * @param {object} patch
 * @returns {Readonly<TurnEnvelope>}
 */
function clonarEnvelopeCongelado(envelope, patch = {}) {
  return aplicarPatchEnvelope(envelope, patch);
}

/**
 * Concatena um passo em `rastreio` (copy-on-write). Não muta o envelope original.
 * @param {Readonly<TurnEnvelope>} envelope
 * @param {object} passo
 * @returns {Readonly<TurnEnvelope>}
 */
export function registarPassoEnvelope(envelope, passo) {
  const rastreioAntigo = Array.isArray(envelope?.rastreio)
    ? envelope.rastreio
    : [];
  const rastreio = Object.freeze([
    ...rastreioAntigo,
    freezePasso(passo)
  ]);
  return clonarEnvelopeCongelado(envelope, { rastreio });
}

/**
 * Append-once por chave em `envelope.sinais`.
 * Segunda escrita: mantém o primeiro valor; regista telemetria em `rastreio`; não aborta.
 * @param {Readonly<TurnEnvelope>} envelope
 * @param {string} chave
 * @param {object} registo — { id, valor, fonte, em, fase }
 * @returns {Readonly<TurnEnvelope>}
 */
export function gravarSinalAppendOnce(envelope, chave, registo) {
  const key = String(chave ?? "").trim();
  if (!key) {
    throw new TypeError("gravarSinalAppendOnce: chave inválida");
  }

  const sinaisPrev =
    envelope.sinais && typeof envelope.sinais === "object"
      ? envelope.sinais
      : null;

  if (sinaisPrev && Object.prototype.hasOwnProperty.call(sinaisPrev, key)) {
    return registarPassoEnvelope(envelope, {
      fase: "append_once_rejeitado",
      chave: key,
      mantido: true,
      em: new Date().toISOString()
    });
  }

  const entrada = normalizarRegistoSinal(registo, key);
  const sinaisMap = { ...(sinaisPrev || {}) };
  sinaisMap[key] = entrada;
  const sinais = Object.freeze(sinaisMap);

  const comSinais = clonarEnvelopeCongelado(envelope, { sinais });
  return registarPassoEnvelope(comSinais, {
    fase: "sinais",
    chave: key,
    valor: entrada.valor,
    fonte: entrada.fonte
  });
}

/**
 * Materializa no envelope a decisão já tomada pela Precedência.
 * **Sem** lógica interpretativa própria: só copia campos presentes em `decisaoPrecedencia`.
 *
 * Campos reconhecidos (quando `!== undefined`):
 * - `modo`, `objecto`, `intençãoAtual`, `autoridade`
 * - `sinais` (objecto parcial) — merge append-once das chaves fornecidas
 *   (tipicamente `classe_c`, `destino`, `objeto_operacional` após Precedência)
 *
 * @param {Readonly<TurnEnvelope>} envelope
 * @param {object} decisaoPrecedencia
 * @returns {Readonly<TurnEnvelope>}
 */
export function selarInterpretacao(envelope, decisaoPrecedencia) {
  const d =
    decisaoPrecedencia && typeof decisaoPrecedencia === "object"
      ? decisaoPrecedencia
      : {};

  /** @type {Partial<TurnEnvelope>} */
  const patch = {};

  if (Object.prototype.hasOwnProperty.call(d, "modo")) {
    patch.modo = d.modo;
  }
  if (Object.prototype.hasOwnProperty.call(d, "objecto")) {
    patch.objecto = d.objecto;
  }
  if (Object.prototype.hasOwnProperty.call(d, "intençãoAtual")) {
    const intencao = d.intençãoAtual;
    patch.intençãoAtual =
      intencao && typeof intencao === "object"
        ? Object.freeze({ ...intencao })
        : intencao;
  }
  if (Object.prototype.hasOwnProperty.call(d, "autoridade")) {
    const aut = d.autoridade;
    patch.autoridade =
      aut && typeof aut === "object" && !Array.isArray(aut)
        ? Object.freeze({ ...aut })
        : aut;
  }

  let base = clonarEnvelopeCongelado(envelope, patch);

  if (d.sinais && typeof d.sinais === "object") {
    for (const [chave, registo] of Object.entries(d.sinais)) {
      base = gravarSinalAppendOnce(base, chave, registo);
    }
  }

  return registarPassoEnvelope(base, {
    fase: "selagem",
    campos: Object.keys(patch),
    em: new Date().toISOString()
  });
}
