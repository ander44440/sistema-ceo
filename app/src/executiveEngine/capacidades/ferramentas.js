/**
 * Capacidade: Ferramentas — honestidade + coerência.
 */
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";

export const capacidadeFerramentas = Object.freeze({
  id: "ferramentas",
  nome: "Ferramentas",
  descricao: "Meios e integrações externas sob governança do CEO.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);
    return {
      ok: true,
      capacidade: "ferramentas",
      mensagem: montarResposta({
        compreendi: `Pedido de ferramenta/integração: «${citacaoCurta(texto)}».`,
        acao:
          "Ainda não orquestro meios externos neste ciclo. " +
          "Registei a necessidade na sessão para não perder o pedido.",
        contexto: resumirContexto(mem),
        proximo: "Descreva o resultado que a ferramenta deveria produzir (não só o nome dela).",
        limite: "Seleção de meios permanece sob o CEO; a ligação real virá depois."
      }),
      dados: { instrucao: texto, intencao: ctx.intencao, memoria: mem }
    };
  }
});
