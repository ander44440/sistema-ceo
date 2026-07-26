/**
 * Capacidade: Conhecimento — respostas coerentes (sem acervo real ainda).
 */
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";

export const capacidadeConhecimento = Object.freeze({
  id: "conhecimento",
  nome: "Conhecimento",
  descricao: "Patrimônio e memória do contexto ativo.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);
    return {
      ok: true,
      capacidade: "conhecimento",
      mensagem: montarResposta({
        compreendi: `Pedido de conhecimento/acervo: «${citacaoCurta(texto)}».`,
        acao:
          "Ainda não há acervo documental ligado a este app permanente. " +
          "Posso, contudo, usar a memória executiva da sessão (projetos, decisões, pendências e últimas ações) como base provisória.",
        contexto: resumirContexto(mem),
        proximo:
          "Diga o tema a localizar, ou peça o estado atual para eu expor o que já está registado na sessão.",
        limite: "Consulta a património persistente de COA entra em ciclo seguinte."
      }),
      dados: { instrucao: texto, intencao: ctx.intencao, memoria: mem }
    };
  }
});
