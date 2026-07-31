/**
 * Fachada de integração Núcleo → MRE → Speaker → efeitos F7/F8 (Blocos 2–3).
 */

import { obterPainelExecutivo } from "../catalogoProjetos/index.js";
import { lerMemoria } from "../executiveMemory/index.js";
import { publicarJobFila } from "../executiveEngine/filaCliente.js";
import { obterFactosBriefingProjeto } from "../executiveEngine/briefingsProjeto.js";
import { criarChamarLlmCeo } from "./adaptadorLlmCeo.js";
import { gerarComunicadoExecutivo } from "./speaker/speakerExecutivo.js";
import { textoParaVoz } from "./canais/adaptarCanal.js";
import { executarDeliberacaoMre } from "./executarDeliberacao.js";
import { ehRotaDeliberativa } from "./roteamentoDeliberativo.js";
import { aplicarEfeitosPosDeliberacao } from "./posDeliberacao/efeitosPosDeliberacao.js";
import { criarStoreRetencaoMemoria } from "./posDeliberacao/persistirRetencao.js";

/** Store de retenção da sessão (browser/Node). */
let storeRetencaoSessao = criarStoreRetencaoMemoria();
/** Idempotência de despacho na sessão. */
const registroDespachoSessao = new Map();

export function obterStoreRetencaoSessao() {
  return storeRetencaoSessao;
}

export function reiniciarStoresPosDeliberacaoParaTestes() {
  storeRetencaoSessao = criarStoreRetencaoMemoria();
  registroDespachoSessao.clear();
}

/**
 * Monta entrada do MRE a partir do contexto do Núcleo.
 * B1: factos do Briefing Curado entram em `factosOficiais` (camada de contexto).
 * @param {object} ctx
 */
export function montarEntradaMre(ctx) {
  const texto = String(ctx.instrucao || "").trim();
  const coa = ctx.coaAtivo || null;
  const mem = typeof ctx.memoria === "function" ? ctx.memoria() : null;

  let painel = null;
  try {
    painel = obterPainelExecutivo();
  } catch {
    painel = null;
  }

  const factos = [];
  // B1 — lastro operacional do COA (antes da memória volátil)
  const factosBriefing = obterFactosBriefingProjeto(coa);
  for (const f of factosBriefing) {
    if (f) factos.push(f);
  }
  if (mem?.proximoPasso) factos.push(`Próximo passo: ${mem.proximoPasso}`);
  if (Array.isArray(mem?.pendencias)) {
    for (const p of mem.pendencias.slice(0, 5)) {
      if (p?.texto) factos.push(`Pendência: ${p.texto}`);
    }
  }
  if (painel?.proximoPasso) factos.push(`Painel próximo passo: ${painel.proximoPasso}`);

  const resumoBriefing =
    factosBriefing.length > 0
      ? `Briefing COA: ${factosBriefing.slice(0, 3).join(" | ")}`
      : null;

  const snapshotPainel = painel
    ? {
        resumo:
          [resumoBriefing, painel.resumo]
            .filter(Boolean)
            .join(" — ") ||
          [
            painel.proximoPasso && `Próximo: ${painel.proximoPasso}`,
            painel.estadoOperacional && `Estado: ${painel.estadoOperacional}`
          ]
            .filter(Boolean)
            .join("; ") ||
          "Painel disponível",
        proximoPasso: painel.proximoPasso,
        estado: painel.estadoOperacional
      }
    : mem || resumoBriefing
      ? {
          resumo:
            [
              resumoBriefing,
              mem?.proximoPasso
                ? `Memória: próximo passo ${mem.proximoPasso}`
                : null
            ]
              .filter(Boolean)
              .join(" — ") || "Contexto COA sem painel estruturado",
          proximoPasso: mem?.proximoPasso ?? null,
          estado: null
        }
      : null;

  return {
    mensagem: enriquecerMensagemComBriefing(texto, factosBriefing),
    coaId: coa?.id ?? mem?.projetoAtivo?.id ?? null,
    intencao: ctx.intencao || null,
    snapshotPainel,
    factosOficiais: factos
  };
}

/**
 * B1 — enquadra a mensagem na entrada (contexto), sem alterar o motor MRE.
 * Evita que o LLM trate «o que sabes?» como lacuna quando o dossier já tem o briefing.
 * @param {string} texto
 * @param {string[]} factosBriefing
 */
function enriquecerMensagemComBriefing(texto, factosBriefing) {
  if (!factosBriefing?.length) return texto;
  return (
    `${texto}\n\n` +
    "[Contexto oficial do COA: os factosOficiais / dossier já incluem o Briefing Curado " +
    "(WorldLab2, performance, outdoors, decisões, próximo passo). " +
    "Para perguntas sobre o que se sabe / diagnóstico do projeto, use esses factos. " +
    "Não solicite de novo dados que já constam no dossier; só declare lacuna se faltar " +
    "algo material que não esteja nos factosOficiais.]"
  );
}

/**
 * @param {object} ctx
 * @param {object} [deps]
 */
export async function executarRotaDeliberativa(ctx, deps = {}) {
  const canal = deps.canal || "chat";
  const entrada = montarEntradaMre(ctx);
  const chamarLlmBase = deps.chamarLlm || criarChamarLlmCeo();
  const temLastroBriefing = (entrada.factosOficiais || []).some((f) =>
    /WorldLab2|Briefing|COA MG2|Motoboy Game 2/i.test(String(f))
  );

  /** B1 — reforço só no adaptador do Núcleo (não altera ficheiros do motor MRE). */
  const chamarLlm = temLastroBriefing
    ? async (pedido) => {
        if (pedido?.estagio === "6_decisao") {
          return chamarLlmBase({
            ...pedido,
            schemaHint:
              `${pedido.schemaHint || ""} ` +
              "O dossier/factosOficiais já trazem o Briefing Curado do COA. " +
              "Se a pergunta for diagnóstico / o que se sabe do projeto e os factos bastam, " +
              "use estado=aprovar e uma recomendação que sintetize factos concretos " +
              "(WorldLab2, performance, outdoors, próximo passo). " +
              "Proibido solicitar_dados apenas porque a mensagem do utilizador é curta " +
              "ou não repete esses factos."
          });
        }
        return chamarLlmBase(pedido);
      }
    : chamarLlmBase;

  const resultado = await executarDeliberacaoMre(entrada, {
    chamarLlm,
    preferirSolicitarDados: temLastroBriefing ? false : undefined,
    metadados: { origem: "nucleo", intencaoId: ctx.intencao?.id }
  });

  if (!resultado.ok || !resultado.parecer) {
    return {
      ok: false,
      mensagem:
        "Não foi possível concluir a deliberação executiva com parecer válido.",
      modo: "mre-falha",
      dados: { mre: resultado, rota: "deliberativa" }
    };
  }

  const falado = gerarComunicadoExecutivo(resultado.parecer, canal);
  if (!falado.ok) {
    return {
      ok: false,
      mensagem: falado.erro || "Speaker recusou o parecer.",
      modo: "mre-speaker-falha",
      dados: {
        parecer: resultado.parecer,
        violacoes: falado.violacoes,
        rota: "deliberativa"
      }
    };
  }

  const comunicado = falado.comunicado;
  try {
    const { registarDestaquesDeliberacao } = await import(
      "./canais/centroSituacaoDeliberacao.js"
    );
    registarDestaquesDeliberacao(comunicado);
  } catch {
    /* centro opcional */
  }

  // F7 + F8 — efeitos pós-parecer (não bloqueiam a mensagem se falharem)
  let efeitos = null;
  try {
    const publicarJob =
      deps.publicarJob ||
      (async (pedido) => publicarJobFila(pedido));
    efeitos = await aplicarEfeitosPosDeliberacao(
      resultado.parecer,
      resultado.planoRetencao,
      {
        publicarJob: deps.skipFila ? undefined : publicarJob,
        storeRetencao: deps.storeRetencao || storeRetencaoSessao,
        registroDespacho: deps.registroDespacho || registroDespachoSessao
      }
    );
  } catch (err) {
    efeitos = {
      erro: err && err.message ? err.message : String(err)
    };
  }

  return {
    ok: true,
    mensagem: comunicado.texto,
    modo: "mre",
    dados: {
      rota: "deliberativa",
      parecer: resultado.parecer,
      comunicado,
      planoRetencao: resultado.planoRetencao,
      textoVoz: textoParaVoz(comunicado),
      parecerId: resultado.parecer.id,
      referenciaDecisao: comunicado.referenciaDecisao,
      efeitosPosDeliberacao: efeitos
    }
  };
}

export { ehRotaDeliberativa, lerMemoria };
