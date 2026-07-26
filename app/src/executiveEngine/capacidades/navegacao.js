import { navegar, listarRotas } from "../../router.js";
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";

/**
 * Capacidade: Navegação — deslocamento entre módulos do shell.
 */
export const capacidadeNavegacao = Object.freeze({
  id: "navegacao",
  nome: "Navegação",
  descricao: "Coordenação de rotas do posto de comando.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const lower = texto.toLowerCase();
    const mem = snapshotMemoria(ctx);
    const rotas = listarRotas();

    const alvo =
      rotas.find((r) => lower.includes(r.id)) ||
      rotas.find((r) => lower.includes(r.titulo.toLowerCase())) ||
      (/\bsitua/.test(lower) ? rotas.find((r) => r.id === "dashboard") : null);

    if (alvo) {
      navegar(alvo.id);
      return {
        ok: true,
        capacidade: "navegacao",
        mensagem: montarResposta({
          compreendi: `Pediu navegação: «${citacaoCurta(texto)}».`,
          acao: `A abrir o módulo «${alvo.titulo}».`,
          contexto: resumirContexto(mem),
          proximo: "Continue o trabalho nesse módulo ou volte à conversa.",
          limite: null
        }),
        dados: { destino: alvo.id, intencao: ctx.intencao }
      };
    }

    return {
      ok: true,
      capacidade: "navegacao",
      mensagem: montarResposta({
        compreendi: `Pediu navegação: «${citacaoCurta(texto)}».`,
        acao: `Módulos disponíveis: ${rotas.map((r) => r.titulo).join(", ")}.`,
        contexto: resumirContexto(mem),
        proximo: "Diga qual módulo abrir (ex.: «abrir projetos»).",
        limite: null
      }),
      dados: { destinos: rotas.map((r) => r.id), intencao: ctx.intencao }
    };
  }
});
