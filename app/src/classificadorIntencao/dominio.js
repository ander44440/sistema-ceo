/**
 * Domínio do Classificador de Intenção — IMP-057 E1 / REQ-057 / ARQ-018.
 * Enum C1–C4, contrato de saída, flags derivadas e limiar.
 * Sem regras de classificação, Núcleo, Motor, UI ou I/O.
 */

/** @typedef {"conhecimento_geral"|"conversa_projeto"|"trabalho_executivo"|"comando_operacional"} ClasseIntencao */

/** @typedef {"resposta_leve"|"nucleo_mre"|"motor_execucao"|"capacidade_operacional"|"clarificacao"} DestinoClassificador */

/**
 * Quatro classes canónicas V1 (ARQ-018 §3) — enum fechado.
 * @type {ReadonlyArray<ClasseIntencao>}
 */
export const CLASSES_INTENCAO = Object.freeze([
  "conhecimento_geral",
  "conversa_projeto",
  "trabalho_executivo",
  "comando_operacional"
]);

/** Aliases curtos C1–C4 ↔ enum. */
export const CLASSE_POR_ID = Object.freeze({
  C1: "conhecimento_geral",
  C2: "conversa_projeto",
  C3: "trabalho_executivo",
  C4: "comando_operacional"
});

export const ID_POR_CLASSE = Object.freeze({
  conhecimento_geral: "C1",
  conversa_projeto: "C2",
  trabalho_executivo: "C3",
  comando_operacional: "C4"
});

/** Limiar de confiança V1 (REQ-057 RES7). */
export const LIMIAR_CONFIANCA = 0.55;

/**
 * Flags derivadas por classe (ARQ-018 §3 / IMP-057 E1-CA3).
 * C4: frente activa opcional → default false; Job só se override explícito (E2+).
 * @type {Readonly<Record<ClasseIntencao, { usaFrenteActiva: boolean, permiteJob: boolean }>>}
 */
export const FLAGS_POR_CLASSE = Object.freeze({
  conhecimento_geral: Object.freeze({
    usaFrenteActiva: false,
    permiteJob: false
  }),
  conversa_projeto: Object.freeze({
    usaFrenteActiva: true,
    permiteJob: false
  }),
  trabalho_executivo: Object.freeze({
    usaFrenteActiva: true,
    permiteJob: true
  }),
  comando_operacional: Object.freeze({
    usaFrenteActiva: false,
    permiteJob: false
  })
});

/**
 * Destino lógico default por classe (encaminhamento — domínio só mapeia).
 * @type {Readonly<Record<ClasseIntencao, DestinoClassificador>>}
 */
export const DESTINO_POR_CLASSE = Object.freeze({
  conhecimento_geral: "resposta_leve",
  conversa_projeto: "nucleo_mre",
  trabalho_executivo: "motor_execucao",
  comando_operacional: "capacidade_operacional"
});

/** @type {ReadonlyArray<DestinoClassificador>} */
export const DESTINOS = Object.freeze([
  "resposta_leve",
  "nucleo_mre",
  "motor_execucao",
  "capacidade_operacional",
  "clarificacao"
]);

/**
 * @typedef {object} SaidaClassificador
 * @property {ClasseIntencao} classe
 * @property {number} confianca — 0..1
 * @property {string} razaoCurta
 * @property {DestinoClassificador} destino
 * @property {boolean} usaFrenteActiva
 * @property {boolean} permiteJob
 * @property {boolean} [precisaClarificacao]
 */

/**
 * @param {string} classe
 * @returns {classe is ClasseIntencao}
 */
export function ehClasseIntencao(classe) {
  return CLASSES_INTENCAO.includes(/** @type {ClasseIntencao} */ (classe));
}

/**
 * @param {string} destino
 * @returns {destino is DestinoClassificador}
 */
export function ehDestino(destino) {
  return DESTINOS.includes(/** @type {DestinoClassificador} */ (destino));
}

/**
 * Flags canónicas da classe (sem overrides).
 * @param {ClasseIntencao} classe
 */
export function flagsDaClasse(classe) {
  if (!ehClasseIntencao(classe)) {
    throw new TypeError(`Classe inválida: ${classe}`);
  }
  return FLAGS_POR_CLASSE[classe];
}

/**
 * Destino default da classe.
 * @param {ClasseIntencao} classe
 */
export function destinoDaClasse(classe) {
  if (!ehClasseIntencao(classe)) {
    throw new TypeError(`Classe inválida: ${classe}`);
  }
  return DESTINO_POR_CLASSE[classe];
}

/**
 * Confiança abaixo do limiar V1.
 * @param {number} confianca
 */
export function abaixoDoLimiar(confianca) {
  return typeof confianca === "number" && confianca < LIMIAR_CONFIANCA;
}

/**
 * Valida contrato de saída RF7 (+ coerência de flags/destino).
 * @param {unknown} saida
 * @returns {{ ok: true, saida: SaidaClassificador } | { ok: false, mensagem: string }}
 */
export function validarSaida(saida) {
  if (!saida || typeof saida !== "object") {
    return { ok: false, mensagem: "SaidaClassificador em falta." };
  }
  const s = /** @type {Record<string, unknown>} */ (saida);

  if (typeof s.classe !== "string" || !ehClasseIntencao(s.classe)) {
    return { ok: false, mensagem: `classe inválida: ${s.classe}.` };
  }
  if (typeof s.confianca !== "number" || Number.isNaN(s.confianca)) {
    return { ok: false, mensagem: "confianca deve ser number." };
  }
  if (s.confianca < 0 || s.confianca > 1) {
    return { ok: false, mensagem: "confianca deve estar em [0, 1]." };
  }
  if (typeof s.razaoCurta !== "string" || !s.razaoCurta.trim()) {
    return { ok: false, mensagem: "razaoCurta obrigatória." };
  }
  if (/CURSOR_API_KEY|sk-[a-zA-Z0-9]{10,}/i.test(s.razaoCurta)) {
    return { ok: false, mensagem: "razaoCurta não pode conter segredos." };
  }
  if (typeof s.destino !== "string" || !ehDestino(s.destino)) {
    return { ok: false, mensagem: `destino inválido: ${s.destino}.` };
  }
  if (typeof s.usaFrenteActiva !== "boolean") {
    return { ok: false, mensagem: "usaFrenteActiva deve ser boolean." };
  }
  if (typeof s.permiteJob !== "boolean") {
    return { ok: false, mensagem: "permiteJob deve ser boolean." };
  }
  if (
    s.precisaClarificacao !== undefined &&
    typeof s.precisaClarificacao !== "boolean"
  ) {
    return { ok: false, mensagem: "precisaClarificacao deve ser boolean." };
  }

  const flags = FLAGS_POR_CLASSE[/** @type {ClasseIntencao} */ (s.classe)];
  void flags; // referência canónica disponível para extensões

  // Flags canónicas: não permitir contradizer o mapa base
  // (C4 permiteJob true só via override documentado — validado em montarSaida)
  if (s.classe === "conhecimento_geral") {
    if (s.usaFrenteActiva !== false || s.permiteJob !== false) {
      return {
        ok: false,
        mensagem: "C1 exige usaFrenteActiva=false e permiteJob=false."
      };
    }
  }
  if (s.classe === "conversa_projeto") {
    if (s.usaFrenteActiva !== true || s.permiteJob !== false) {
      return {
        ok: false,
        mensagem: "C2 exige usaFrenteActiva=true e permiteJob=false."
      };
    }
  }
  if (s.classe === "trabalho_executivo") {
    if (s.usaFrenteActiva !== true) {
      return {
        ok: false,
        mensagem: "C3 exige usaFrenteActiva=true."
      };
    }
    // permiteJob=true em caminho normal; false se precisaClarificacao (sem Job)
    if (s.precisaClarificacao === true) {
      if (s.permiteJob !== false) {
        return {
          ok: false,
          mensagem: "C3 em clarificação exige permiteJob=false."
        };
      }
    } else if (s.permiteJob !== true) {
      return {
        ok: false,
        mensagem: "C3 exige permiteJob=true (salvo clarificação)."
      };
    }
  }
  if (s.classe === "comando_operacional") {
    if (s.usaFrenteActiva !== false) {
      return {
        ok: false,
        mensagem: "C4 V1 default: usaFrenteActiva=false."
      };
    }
  }

  if (s.precisaClarificacao === true && s.destino !== "clarificacao") {
    return {
      ok: false,
      mensagem: "precisaClarificacao exige destino clarificacao."
    };
  }
  if (
    s.precisaClarificacao !== true &&
    s.destino === "clarificacao"
  ) {
    return {
      ok: false,
      mensagem: "destino clarificacao exige precisaClarificacao=true."
    };
  }
  if (
    s.precisaClarificacao !== true &&
    s.destino !== DESTINO_POR_CLASSE[/** @type {ClasseIntencao} */ (s.classe)]
  ) {
    return {
      ok: false,
      mensagem: `destino ${s.destino} incompatível com classe ${s.classe}.`
    };
  }

  // Flags coerentes verificadas acima

  return { ok: true, saida: /** @type {SaidaClassificador} */ (s) };
}

/**
 * Constrói saída canónica a partir da classe (domínio — sem classificar texto).
 * @param {ClasseIntencao} classe
 * @param {number} confianca
 * @param {string} razaoCurta
 * @param {{
 *   precisaClarificacao?: boolean,
 *   permiteJobOverride?: boolean
 * }} [opts]
 * @returns {SaidaClassificador}
 */
export function montarSaida(classe, confianca, razaoCurta, opts = {}) {
  if (!ehClasseIntencao(classe)) {
    throw new TypeError(`Classe inválida: ${classe}`);
  }
  if (typeof confianca !== "number" || confianca < 0 || confianca > 1) {
    throw new TypeError("confianca inválida.");
  }
  const flags = { ...FLAGS_POR_CLASSE[classe] };
  if (
    classe === "comando_operacional" &&
    opts.permiteJobOverride === true
  ) {
    flags.permiteJob = true;
  }

  const precisaClarificacao =
    opts.precisaClarificacao === true || abaixoDoLimiar(confianca);

  /** @type {SaidaClassificador} */
  const saida = {
    classe,
    confianca,
    razaoCurta: String(razaoCurta || "").trim(),
    destino: precisaClarificacao
      ? "clarificacao"
      : DESTINO_POR_CLASSE[classe],
    usaFrenteActiva: flags.usaFrenteActiva,
    permiteJob: precisaClarificacao ? false : flags.permiteJob,
    precisaClarificacao
  };

  const v = validarSaida(saida);
  if (!v.ok) throw new Error(v.mensagem);
  return v.saida;
}
