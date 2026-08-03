/**
 * Capacidade: Dashboard — visão executiva coerente com a sessão.
 */
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";

export const capacidadeDashboard = Object.freeze({
  id: "dashboard",
  nome: "Dashboard",
  descricao: "Visão executiva do posto de comando.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
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
        limite: "Ainda sem telemetria operacional ligada — o quadro usa a memória da sessão."
      }),
      dados: { instrucao: texto, intencao: ctx.intencao, memoria: mem }
    };
  }
});
