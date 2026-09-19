/**
 * Capacidade: Dashboard — visão executiva coerente com a sessão.
 * R-H02: pedidos de painel/job institucionais sem lastro → insuficiência
 * (sem usar seed/memória/resumirContexto como substituto).
 */
import { obterPainelExecutivo as obterPainelCatalogo } from "../../catalogoProjetos/index.js";
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";

/**
 * Pedido que exige lastro institucional de painel executivo e/ou job activo.
 * Não cobre navegação genérica («mostra o painel» / centro de situação).
 * @param {string} texto
 * @returns {{ exigePainel: boolean, exigeJob: boolean, exige: boolean }}
 */
export function detetarPedidoLastroInstitucionalPainelJob(texto) {
  const t = String(texto || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  const exigePainel =
    /\bpainel\s+executivo\b/.test(t) ||
    (/\bestado\b/.test(t) && /\bpainel\b/.test(t));
  const exigeJob =
    /\bjobs?\s+activ[oa]s?\b/.test(t) ||
    (/\bestado\b/.test(t) && /\bjobs?\b/.test(t));
  return {
    exigePainel,
    exigeJob,
    exige: exigePainel || exigeJob
  };
}

/**
 * Lastro institucional utilizável para o pedido (não basta seed/catálogo).
 * @param {object} ctx
 * @param {{ exigePainel: boolean, exigeJob: boolean }} pedido
 */
export async function lastroInstitucionalPainelJobDisponivel(ctx, pedido) {
  let painelOk = !pedido.exigePainel;
  let jobOk = !pedido.exigeJob;

  if (pedido.exigePainel) {
    const coa = ctx?.coaAtivo;
    if (!coa || !coa.id) {
      painelOk = false;
    } else if (typeof ctx.obterPainelExecutivo === "function") {
      try {
        const painel = await ctx.obterPainelExecutivo(coa.id);
        painelOk = painel != null;
      } catch {
        painelOk = false;
      }
    } else {
      try {
        painelOk = obterPainelCatalogo(coa.id) != null;
      } catch {
        painelOk = false;
      }
    }
  }

  if (pedido.exigeJob) {
    let jobs = [];
    try {
      if (typeof ctx.listarJobs === "function") {
        jobs = (await ctx.listarJobs(null)) || [];
      } else if (typeof ctx.obterJob === "function" && ctx.jobIdActivo) {
        const um = await ctx.obterJob(ctx.jobIdActivo);
        jobs = um ? [um] : [];
      }
    } catch {
      jobs = [];
    }
    const lista = Array.isArray(jobs) ? jobs : [];
    jobOk = lista.some((j) => {
      if (!j || typeof j !== "object") return false;
      const est = String(j.estado || j.status || "").toLowerCase();
      if (!est) return true;
      return !/complet|cancel|failed|falh|done|encerr/.test(est);
    });
  }

  return painelOk && jobOk;
}

function mensagemInsuficienciaInstitucional(texto, pedido) {
  const partes = [];
  if (pedido.exigePainel) partes.push("painel executivo");
  if (pedido.exigeJob) partes.push("job activo");
  const objecto =
    partes.length > 1
      ? partes.join(" e ")
      : partes[0] || "estado institucional pedido";

  return montarResposta({
    compreendi: texto
      ? `Pediu o estado de «${citacaoCurta(texto)}».`
      : "Pediu o estado institucional do projecto.",
    acao:
      `Não tenho lastro institucional utilizável para informar o ${objecto}. ` +
      "Sem painel e/ou job disponíveis para este pedido, não afirmo estado a partir da memória de sessão nem do catálogo.",
    contexto: null,
    proximo:
      "Disponibilize o painel do projecto ou indique um job concreto, e volte a pedir o estado.",
    limite:
      "Lacuna institucional — sem inventar COA, painel, jobs ou pendências."
  });
}

export const capacidadeDashboard = Object.freeze({
  id: "dashboard",
  nome: "Dashboard",
  descricao: "Visão executiva do posto de comando.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const pedido = detetarPedidoLastroInstitucionalPainelJob(texto);

    if (pedido.exige) {
      const disponivel = await lastroInstitucionalPainelJobDisponivel(
        ctx,
        pedido
      );
      if (!disponivel) {
        return {
          ok: true,
          capacidade: "dashboard",
          modo: "capacidade_operacional",
          mensagem: mensagemInsuficienciaInstitucional(texto, pedido),
          dados: {
            instrucao: texto,
            intencao: ctx.intencao,
            lastroInstitucionalInsuficiente: true,
            exigePainel: pedido.exigePainel,
            exigeJob: pedido.exigeJob,
            consultaSemMutacao: true
          }
        };
      }
    }

    const mem = snapshotMemoria(ctx);
    return {
      ok: true,
      capacidade: "dashboard",
      mensagem: montarResposta({
        compreendi: texto
          ? `Pediu visão do posto de comando: «${citacaoCurta(texto)}».`
          : "Pediu a visão do posto de comando.",
        acao:
          "O Centro de Situação é a superfície atual para esta leitura. " +
          "Use a conversa para transformar o quadro em ação.",
        contexto: resumirContexto(mem),
        proximo: mem.proximoPasso || "Abra o Centro de Situação ou peça o estado atual.",
        limite:
          "Ainda sem telemetria operacional ligada — o quadro usa a memória da sessão."
      }),
      dados: { instrucao: texto, intencao: ctx.intencao, memoria: mem }
    };
  }
});
