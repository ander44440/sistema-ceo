/**
 * Capacidade: Fila — consulta operacional da Execution Queue (REQ-045).
 * Criação/publicação de Jobs é exclusiva do Motor (C3).
 */

import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import { listarJobsPendentes } from "../filaCliente.js";

export const capacidadeFila = Object.freeze({
  id: "fila",
  nome: "Fila de Execução",
  descricao: "Consulta Jobs na Execution Queue local. Não publica Jobs.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);
    const intencao = ctx.intencao || {};

    if (intencao.id !== "listar_jobs_fila") {
      return {
        ok: false,
        capacidade: "fila",
        modo: "publicacao_job_proibida_c4",
        mensagem: montarResposta({
          compreendi: `Pedido de fila que não é consulta: «${citacaoCurta(texto)}».`,
          acao: "C4/fila só consulta a fila. Criar ou publicar Job segue o Motor de Execução.",
          contexto: resumirContexto(mem),
          proximo:
            "Diga «listar jobs» para consultar, ou um pedido de trabalho para o Motor criar o Job.",
          limite: "Somente o Motor cria/publica Jobs de execução."
        }),
        dados: {
          intencao,
          memoria: mem,
          publicacaoDirecta: false,
          motorAcionado: false
        }
      };
    }

    try {
      const jobs = await listarJobsPendentes();
      const lista = jobs.length
        ? jobs
            .map((j) => `- ${j.id}: ${j.titulo} (${j.projeto || "sem projeto"})`)
            .join("\n")
        : "(nenhum Job pending)";
      return {
        ok: true,
        capacidade: "fila",
        mensagem: montarResposta({
          compreendi: `Consulta à fila: «${citacaoCurta(texto)}».`,
          acao: `Jobs pendentes:\n${lista}`,
          contexto: resumirContexto(mem),
          proximo:
            "Com o dispatcher V2 a correr (executive/dispatcher), o Agent consome sozinho; " +
            "senão, no Cursor: «consuma a fila».",
          limite: "A fila não executa trabalho — só despacha."
        }),
        dados: { jobs, intencao, memoria: mem, publicacaoDirecta: false }
      };
    } catch (err) {
      return {
        ok: false,
        capacidade: "fila",
        mensagem: montarResposta({
          compreendi: `Tentativa de consultar a fila: «${citacaoCurta(texto)}».`,
          acao: err && err.message ? err.message : "Falha na fila.",
          contexto: resumirContexto(mem),
          proximo: "Confirme que `npm run dev` está ativo em app/ e tente de novo.",
          limite: null
        }),
        dados: { intencao, memoria: mem, publicacaoDirecta: false }
      };
    }
  }
});
