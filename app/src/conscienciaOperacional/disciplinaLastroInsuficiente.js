/**
 * FRENTE 6 — Gate pós-LLM de disciplina de lastro insuficiente (C2 deliberativo).
 * Função pura: fail-closed quando o turno já declara insuficiência explícita.
 * Não é validador claim⊆lastro; não tipa facto/inferência/hipótese;
 * não toca CONSULTA nem INFO-GATHERING (solicitar_dados legítimo).
 */

import { detectarPedidoInfoGathering } from "../classificadorIntencao/pedidoInfoGathering.js";

/** Prefixo estável para idempotência / testes. */
export const PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE =
  "Não tenho lastro suficiente neste turno para afirmar isso com segurança.";

/**
 * @typedef {object} SinalInsuficienciaLastro
 * @property {true} ativo
 * @property {string} motivo
 * @property {ReadonlyArray<string>} lacunas
 */

/**
 * @typedef {object} ResultadoDisciplinaLastro
 * @property {string} mensagem
 * @property {boolean} aplicada
 * @property {string} motivo
 * @property {SinalInsuficienciaLastro|null} sinal
 */

/**
 * @param {{
 *   pedidoInfoGathering?: boolean,
 *   instrucao?: string
 * }} opts
 */
function ehInfoGatheringNosOpts(opts = {}) {
  if (opts.pedidoInfoGathering === true) return true;
  if (opts.pedidoInfoGathering === false) return false;
  return detectarPedidoInfoGathering(opts.instrucao);
}

/**
 * Extrai factos do turno (entrada + dossier do parecer, se houver).
 * @param {{
 *   factosOficiais?: ReadonlyArray<string>|null,
 *   parecer?: object|null
 * }} opts
 * @returns {string[]}
 */
export function listarFactosTurnoParaDisciplina(opts = {}) {
  /** @type {string[]} */
  const out = [];
  const base = opts.factosOficiais;
  if (Array.isArray(base)) {
    for (const f of base) {
      if (f) out.push(String(f));
    }
  }
  const usados = opts.parecer?.dossier?.factosUsados;
  if (Array.isArray(usados)) {
    for (const f of usados) {
      if (f) out.push(String(f));
    }
  }
  return out;
}

/**
 * Predicado: sinais explícitos já existentes no turno.
 * NÃO activa só com LACUNA EXPLÍCITA do Acervo (≠ lacuna material — REQ-070).
 * INFO-GATHERING: solicitar_dados é estado deliberativo legítimo — não activa.
 *
 * @param {{
 *   factosOficiais?: ReadonlyArray<string>|null,
 *   parecer?: object|null,
 *   pedidoConsulta?: boolean,
 *   pedidoInfoGathering?: boolean,
 *   instrucao?: string
 * }} opts
 * @returns {SinalInsuficienciaLastro|{ ativo: false, motivo: string, lacunas: ReadonlyArray<string> }}
 */
export function detectarInsuficienciaLastroTurno(opts = {}) {
  if (opts.pedidoConsulta === true) {
    return {
      ativo: false,
      motivo: "consulta_fora_de_escopo",
      lacunas: Object.freeze([])
    };
  }

  const infoGathering = ehInfoGatheringNosOpts(opts);

  const factos = listarFactosTurnoParaDisciplina(opts);
  const lacunasParecer = Array.isArray(opts.parecer?.lacunas)
    ? opts.parecer.lacunas.map((l) => String(l || "").trim()).filter(Boolean)
    : [];

  if (factos.some((f) => /LASTRO INSUFICIENTE/i.test(f))) {
    // Fora de IG: fail-closed por flag explícita.
    // Em IG: não wipe (solicitar_dados + prosa de lacunas é a resposta).
    if (infoGathering) {
      return {
        ativo: false,
        motivo: "info_gathering_preservado",
        lacunas: Object.freeze([])
      };
    }
    const lacunasFlag = factos
      .filter((f) => /LACUNA|LASTRO INSUFICIENTE/i.test(f))
      .map((f) => f.replace(/\s+/g, " ").trim())
      .slice(0, 6);
    return {
      ativo: true,
      motivo: "flag_lastro_insuficiente",
      lacunas: Object.freeze(
        lacunasFlag.length
          ? lacunasFlag
          : lacunasParecer.length
            ? lacunasParecer
            : ["evidência suficiente no lastro do turno"]
      )
    };
  }

  const estado = opts.parecer?.decisaoExecutiva?.estado;
  if (estado === "solicitar_dados") {
    // IG: solicitar_dados = listar o que falta — não é falha de lastro
    if (infoGathering) {
      return {
        ativo: false,
        motivo: "info_gathering_solicitar_dados_legitimo",
        lacunas: Object.freeze(lacunasParecer)
      };
    }
    return {
      ativo: true,
      motivo: "parecer_solicitar_dados",
      lacunas: Object.freeze(
        lacunasParecer.length
          ? lacunasParecer
          : ["dados materiais em falta (parecer: solicitar_dados)"]
      )
    };
  }

  return {
    ativo: false,
    motivo: "sem_sinal_explicito",
    lacunas: Object.freeze([])
  };
}

/**
 * Declaração fail-closed (sem inventar conteúdo).
 * @param {SinalInsuficienciaLastro|{ lacunas?: ReadonlyArray<string> }} sinal
 */
export function comporDeclaracaoLastroInsuficiente(sinal) {
  const lacunas = Array.isArray(sinal?.lacunas)
    ? sinal.lacunas.map((l) => String(l || "").trim()).filter(Boolean)
    : [];
  const ausentes = lacunas.length
    ? lacunas.join("; ")
    : "informação material em falta no lastro deste turno";
  return (
    `${PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE} ` +
    `Informação ausente: ${ausentes}. ` +
    `Não invento factos nem preenchimento sem base no lastro disponível.`
  );
}

/**
 * @param {string} mensagem
 */
export function prosaJaDeclaraLastroInsuficiente(mensagem) {
  return new RegExp(
    PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  ).test(String(mensagem || ""));
}

/**
 * Gate pós-LLM: se o turno já declara insuficiência, substitui prosa livre.
 * Pass-through se não houver sinal, se for CONSULTA, INFO-GATHERING, ou já declarado.
 *
 * @param {string} mensagem
 * @param {{
 *   factosOficiais?: ReadonlyArray<string>|null,
 *   parecer?: object|null,
 *   pedidoConsulta?: boolean,
 *   pedidoInfoGathering?: boolean,
 *   instrucao?: string
 * }} [opts]
 * @returns {ResultadoDisciplinaLastro}
 */
export function garantirDisciplinaLastroInsuficiente(mensagem, opts = {}) {
  const original = String(mensagem ?? "");

  if (opts.pedidoConsulta === true) {
    return {
      mensagem: original,
      aplicada: false,
      motivo: "consulta_fora_de_escopo",
      sinal: null
    };
  }

  // INFO-GATHERING: preservar prosa de lacunas (espelha CONSULTA)
  if (ehInfoGatheringNosOpts(opts)) {
    return {
      mensagem: original,
      aplicada: false,
      motivo: "info_gathering_fora_de_escopo",
      sinal: null
    };
  }

  const det = detectarInsuficienciaLastroTurno(opts);
  if (!det.ativo) {
    return {
      mensagem: original,
      aplicada: false,
      motivo: det.motivo,
      sinal: null
    };
  }

  /** @type {SinalInsuficienciaLastro} */
  const sinal = {
    ativo: true,
    motivo: det.motivo,
    lacunas: det.lacunas
  };

  if (prosaJaDeclaraLastroInsuficiente(original)) {
    return {
      mensagem: original,
      aplicada: false,
      motivo: "ja_declarado",
      sinal
    };
  }

  return {
    mensagem: comporDeclaracaoLastroInsuficiente(sinal),
    aplicada: true,
    motivo: sinal.motivo,
    sinal
  };
}
