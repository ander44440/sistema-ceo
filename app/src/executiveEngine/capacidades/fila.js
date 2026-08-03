/**
 * Capacidade: Fila — publicação de Jobs na Execution Queue (REQ-045).
 * Não invoca executores; só publica / consulta a fila.
 */

import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import { obterCoaAtivo } from "../coaSessao.js";
import { listarJobsPendentes, publicarJobFila } from "../filaCliente.js";

function extrairTituloDescricao(texto) {
  const raw = String(texto || "").trim();
  const apos = raw.match(
    /(?:publicar|criar|despachar|enviar)\s+job\s*:?\s*(.+)$/i
  );
  const corpo = (apos ? apos[1] : raw).trim();
  const partes = corpo.split(/\s+[—\-]\s+|:\s+/);
  if (partes.length >= 2) {
    return {
      titulo: partes[0].trim().slice(0, 160),
      descricao: partes.slice(1).join(": ").trim()
    };
  }
  return {
    titulo: corpo.slice(0, 160) || "Job de execução técnica",
    descricao: corpo
  };
}

export const capacidadeFila = Object.freeze({
  id: "fila",
  nome: "Fila de Execução",
  descricao: "Publica e consulta Jobs na Execution Queue local.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);
    const intencao = ctx.intencao || {};
    const coa = obterCoaAtivo();

    try {
      if (intencao.id === "listar_jobs_fila") {
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
          dados: { jobs, intencao, memoria: mem }
        };
      }

      const { titulo, descricao } = extrairTituloDescricao(texto);
      const job = await publicarJobFila({
        origem: "ceo",
        projeto: coa ? coa.nome : mem.projetoAtivo?.nome || null,
        tipo: "execucao_tecnica",
        titulo,
        descricao,
        prioridade: "normal"
      });

      return {
        ok: true,
        capacidade: "fila",
        mensagem: montarResposta({
          compreendi: `Despacho para a Fila de Execução: «${citacaoCurta(titulo)}».`,
          acao:
            `Job ${job.id} publicado com estado pending.\n` +
            `Projeto: ${job.projeto || "(n/d)"}.\n` +
            "Não invoquei nenhum executor — a Queue é o único canal.",
          contexto: resumirContexto(mem),
          proximo:
            "Se o dispatcher V2 (REQ-053) estiver a observar a fila no PC, o Agent é acordado sozinho. " +
            "Senão: no Cursor diga «consuma a fila do CEO».",
          limite:
            "V2 local: watcher + Cursor SDK com PC ligado (executive/dispatcher). " +
            "Sem cloud 24/7 nem mensageria paga."
        }),
        dados: { job, intencao, memoria: mem, jaPersistido: true }
      };
    } catch (err) {
      return {
        ok: false,
        capacidade: "fila",
        mensagem: montarResposta({
          compreendi: `Tentativa de operar a fila: «${citacaoCurta(texto)}».`,
          acao: err && err.message ? err.message : "Falha na fila.",
          contexto: resumirContexto(mem),
          proximo: "Confirme que `npm run dev` está ativo em app/ e tente de novo.",
          limite: null
        }),
        dados: { intencao, memoria: mem }
      };
    }
  }
});
