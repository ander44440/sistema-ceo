/**
 * Destinos C1–C4 — IMP-057 E5 / REQ-057 / ARQ-018.
 * Despacho estrito por `destino` do Classificador — sem fallback silencioso.
 */

import {
  conduzirTrabalhoExecutivoC3,
  contemSugiroComoRespostaFinal
} from "./integracaoNucleo.js";

/** Capacidades operacionais válidas para C4 (nunca Motor/MRE). */
export const CAPACIDADES_C4 = Object.freeze([
  "memoria",
  "fila",
  "dashboard",
  "projetos",
  "conhecimento",
  "navegacao",
  "ferramentas",
  "consultar_cto"
]);

const LOCAIS_C1 = new Set([
  "saudacao",
  "pergunta_data",
  "pergunta_hora",
  "pergunta_identidade"
]);

/**
 * @typedef {object} ContextoDestino
 * @property {string} texto
 * @property {ReadonlyArray<{papel:string,texto:string}>} historico
 * @property {object} intencao
 * @property {import("./dominio.js").SaidaClassificador} classificacao
 * @property {import("./encaminhador.js").RotaEncaminhamento} rota
 * @property {Function} obterCapacidade
 * @property {Function} contextoCapacidade
 * @property {Function} naturalizar
 * @property {Function} [conduzirMotorPadrao]
 * @property {import("./integracaoNucleo.js").DepsE4} [deps]
 */

/**
 * @param {ContextoDestino} ctx
 * @param {object} parcial
 */
function baseResposta(ctx, parcial) {
  return {
    ok: parcial.ok !== false,
    mensagem: parcial.mensagem,
    intencao: ctx.intencao,
    capacidade: parcial.capacidade ?? null,
    dados: {
      ...(parcial.dados && typeof parcial.dados === "object"
        ? parcial.dados
        : {}),
      destinoRespeitado: ctx.rota.destino,
      classificacaoRespeitada: true
    },
    origem: "executiveEngine",
    modo: parcial.modo || "stub"
  };
}

/**
 * C1 — resposta imediata; sem MRE, sem Motor.
 * @param {ContextoDestino} ctx
 */
export async function executarDestinoC1(ctx) {
  const capacidadeIa = ctx.obterCapacidade("ia");
  let resultado;
  if (capacidadeIa && LOCAIS_C1.has(ctx.intencao.id)) {
    resultado = await capacidadeIa.executar(
      ctx.contextoCapacidade({
        texto: ctx.texto,
        historico: ctx.historico,
        intencao: ctx.intencao
      })
    );
  } else {
    resultado = {
      ok: true,
      mensagem:
        `Sobre «${ctx.texto.slice(0, 120)}${ctx.texto.length > 120 ? "…" : ""}»: ` +
        "resposta imediata (C1). Que detalhe precisa?",
      modo: "resposta_leve",
      dados: {}
    };
  }

  let resposta = baseResposta(ctx, {
    ok: resultado.ok !== false,
    mensagem: resultado.mensagem,
    capacidade: "ia",
    modo: resultado.modo || "resposta_leve",
    dados: {
      ...(resultado.dados || {}),
      mreInvocado: false,
      motorAcionado: false,
      rota: "resposta_leve"
    }
  });

  if (LOCAIS_C1.has(ctx.intencao.id) && typeof ctx.naturalizar === "function") {
    resposta = ctx.naturalizar(resposta);
  }
  return resposta;
}

/**
 * C2 — Núcleo / MRE; proibido Job automático / Motor nesta via.
 * @param {ContextoDestino} ctx
 */
export async function executarDestinoC2(ctx) {
  const capacidadeIa = ctx.obterCapacidade("ia");
  if (!capacidadeIa) {
    return baseResposta(ctx, {
      ok: false,
      mensagem: "C2 exige capacidade ia (Núcleo/MRE) — não registada.",
      capacidade: "ia",
      modo: "nucleo_mre_indisponivel",
      dados: { mreInvocado: false, motorAcionado: false, publicarJobChamado: false }
    });
  }

  // Garantir intenção deliberativa (frente activa / conversa de projecto)
  const intencaoC2 = {
    ...ctx.intencao,
    capacidade: "ia",
    id:
      ctx.intencao.id === "deliberar" ||
      ctx.intencao.id === "deliberar_objetivo" ||
      ctx.intencao.id === "pergunta_aberta"
        ? ctx.intencao.id
        : "deliberar_objetivo"
  };

  const lastroConsciencia =
    ctx.deps && ctx.deps.lastroConsciencia ? ctx.deps.lastroConsciencia : null;

  const resultado = await capacidadeIa.executar(
    ctx.contextoCapacidade({
      texto: ctx.texto,
      historico: ctx.historico,
      intencao: intencaoC2,
      ...(lastroConsciencia ? { lastroConsciencia } : {})
    })
  );

  let resposta = baseResposta(ctx, {
    ok: resultado.ok !== false,
    mensagem: resultado.mensagem,
    capacidade: "ia",
    modo: resultado.modo || "nucleo_mre",
    dados: {
      ...(resultado.dados || {}),
      mreInvocado: true,
      motorAcionado: false,
      /** E5-CA1: C2 não despacha Job nesta via */
      publicarJobProibido: true,
      rota: "nucleo_mre"
    }
  });

  if (typeof ctx.naturalizar === "function") {
    resposta = ctx.naturalizar({ ...resposta, intencao: intencaoC2 });
  }
  return { ...resposta, intencao: intencaoC2 };
}

/**
 * C3 — exclusivamente Motor; falha tipada, sem fallback MRE.
 * @param {ContextoDestino} ctx
 */
export async function executarDestinoC3(ctx) {
  const deps = { ...(ctx.deps || {}) };
  if (typeof deps.conduzirMotor !== "function" && ctx.conduzirMotorPadrao) {
    deps.conduzirMotor = ctx.conduzirMotorPadrao;
  }

  try {
    const resultadoC3 = await conduzirTrabalhoExecutivoC3(
      ctx.texto,
      ctx.classificacao,
      deps
    );

    const falhaMotor =
      resultadoC3.dados?.motor?.motivo === "falha_publicacao" ||
      resultadoC3.dados?.motorFalhou === true ||
      resultadoC3.ok === false;

    let mensagem = resultadoC3.mensagem;
    if (contemSugiroComoRespostaFinal(mensagem)) {
      mensagem =
        "Motor de Execução activado. Acompanhe Job, Gate ou handoff — não uma recomendação consultiva.";
    }

    return baseResposta(ctx, {
      ok: !falhaMotor,
      mensagem,
      capacidade: "motor_execucao",
      modo: falhaMotor ? "motor_execucao_falha" : "motor_execucao",
      dados: {
        ...(resultadoC3.dados || {}),
        mreInvocado: false,
        mreFallback: false,
        motorAcionado: true,
        rota: "motor_execucao"
      }
    });
  } catch (err) {
    // E5-CA5: erro tipado — NUNCA cair para MRE
    return baseResposta(ctx, {
      ok: false,
      mensagem:
        "Falha no Motor de Execução (C3): " +
        (err && err.message ? err.message : "erro desconhecido") +
        ". Sem fallback para deliberação MRE.",
      capacidade: "motor_execucao",
      modo: "motor_execucao_falha",
      dados: {
        mreInvocado: false,
        mreFallback: false,
        motorAcionado: true,
        motorFalhou: true,
        erroMotor: err && err.message ? err.message : String(err),
        rota: "motor_execucao"
      }
    });
  }
}

/**
 * C4 — capacidades operacionais; nunca Motor de implementação.
 * @param {ContextoDestino} ctx
 */
export async function executarDestinoC4(ctx) {
  const capId = ctx.intencao.capacidade;
  if (!CAPACIDADES_C4.includes(capId)) {
    return baseResposta(ctx, {
      ok: false,
      mensagem:
        `C4 classificado, mas capacidade «${capId}» não é operacional canónica. ` +
        "Sem fallback para MRE/Motor.",
      capacidade: capId,
      modo: "capacidade_operacional_invalida",
      dados: {
        mreInvocado: false,
        motorAcionado: false,
        rota: "capacidade_operacional"
      }
    });
  }

  const capacidade = ctx.obterCapacidade(capId);
  if (!capacidade) {
    return baseResposta(ctx, {
      ok: false,
      mensagem: `Capacidade operacional «${capId}» não registada (C4).`,
      capacidade: capId,
      modo: "capacidade_ausente",
      dados: {
        mreInvocado: false,
        motorAcionado: false,
        rota: "capacidade_operacional"
      }
    });
  }

  try {
    const resultado = await capacidade.executar(
      ctx.contextoCapacidade({
        texto: ctx.texto,
        historico: ctx.historico,
        intencao: ctx.intencao
      })
    );

    let resposta = baseResposta(ctx, {
      ok: resultado.ok !== false,
      mensagem:
        resultado.mensagem || "Comando operacional concluído sem mensagem.",
      capacidade: capacidade.id,
      modo: resultado.modo || "capacidade_operacional",
      dados: {
        ...(resultado.dados != null && typeof resultado.dados === "object"
          ? resultado.dados
          : {}),
        mreInvocado: false,
        motorAcionado: false,
        rota: "capacidade_operacional"
      }
    });

    if (typeof ctx.naturalizar === "function") {
      resposta = ctx.naturalizar(resposta);
    }
    return resposta;
  } catch (err) {
    // E5-CA4: classificação preservada pelo chamador via anexarClassificacao
    return baseResposta(ctx, {
      ok: false,
      mensagem:
        `Falha na capacidade operacional ${capId}: ` +
        (err && err.message ? err.message : "erro desconhecido"),
      capacidade: capId,
      modo: "capacidade_operacional_falha",
      dados: {
        mreInvocado: false,
        motorAcionado: false,
        rota: "capacidade_operacional",
        erroCapacidade: err && err.message ? err.message : String(err)
      }
    });
  }
}

/**
 * Clarificação — sem Motor / MRE / capacidades pesadas.
 * @param {ContextoDestino} ctx
 */
export function executarDestinoClarificacao(ctx) {
  return baseResposta(ctx, {
    ok: true,
    mensagem:
      "Preciso de um pouco mais de clareza antes de agir. " +
      "Quer deliberar sobre o projecto, executar um trabalho (Job), " +
      "ou um comando operacional (ex.: listar jobs, estado)?",
    capacidade: null,
    modo: "clarificacao",
    dados: { motorAcionado: false, mreInvocado: false, rota: "clarificacao" }
  });
}

/**
 * Despacho estrito — destino do Classificador é lei.
 * Qualquer destino desconhecido → erro tipado (sem fallback silencioso).
 *
 * @param {ContextoDestino} ctx
 */
export async function executarPorDestino(ctx) {
  const destino = ctx.rota?.destino;

  switch (destino) {
    case "clarificacao":
      return executarDestinoClarificacao(ctx);
    case "resposta_leve":
      return executarDestinoC1(ctx);
    case "nucleo_mre":
      return executarDestinoC2(ctx);
    case "motor_execucao":
      return executarDestinoC3(ctx);
    case "capacidade_operacional":
      return executarDestinoC4(ctx);
    default:
      return baseResposta(ctx, {
        ok: false,
        mensagem:
          `Destino de classificação desconhecido: «${destino}». ` +
          "Sem fallback silencioso.",
        capacidade: null,
        modo: "destino_desconhecido",
        dados: {
          mreInvocado: false,
          motorAcionado: false,
          classificacaoRespeitada: false,
          rota: destino || null
        }
      });
  }
}
