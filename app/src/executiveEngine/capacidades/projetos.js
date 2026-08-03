/**
 * Capacidade: Projetos — catálogo / projeto ativo.
 */
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import { definirCoaAtivo } from "../coaSessao.js";
import { listarProjetos } from "../../catalogoProjetos/index.js";

function extrairNomeProjeto(texto) {
  const raw = String(texto || "");
  const mg2 = raw.match(/\b(Motoboy Game 2|MG2)\b/i);
  if (mg2) return mg2[1] === "MG2" ? "Motoboy Game 2" : mg2[1];
  const abrir = raw.match(/abrir\s+projeto\s+(.+)$/i);
  if (abrir) return abrir[1].replace(/[?.!].*$/, "").trim();
  const projeto = raw.match(/projeto\s+[«"']?([^«"'.!?,;]+)[»"']?/i);
  if (projeto) return projeto[1].trim();
  return null;
}

export const capacidadeProjetos = Object.freeze({
  id: "projetos",
  nome: "Projetos",
  descricao: "Catálogo permanente e projeto ativo.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);
    const lower = texto.toLowerCase();

    if (/\b(listar|mostrar|quais)\b/.test(lower) && /\bprojetos?\b/.test(lower)) {
      const nomes = listarProjetos()
        .map((p) => `${p.nome}${p.ativo ? " (ativo)" : ""}`)
        .join("; ");
      return {
        ok: true,
        capacidade: "projetos",
        mensagem: montarResposta({
          compreendi: `Pediu o catálogo: «${citacaoCurta(texto)}».`,
          acao: `Projetos: ${nomes || "catálogo vazio"}.`,
          contexto: resumirContexto(mem),
          proximo: "Diga «abrir projeto [nome]» para selecionar o ativo.",
          limite: null
        }),
        dados: { catalogo: listarProjetos(), memoriaSessao: mem }
      };
    }

    const nome =
      extrairNomeProjeto(texto) ||
      (mem.projetoAtivo && mem.projetoAtivo.nome) ||
      ((mem.projetosAtivos || [])[0] && mem.projetosAtivos[0].nome) ||
      "Motoboy Game 2";

    const coa = definirCoaAtivo({ nome });

    return {
      ok: true,
      capacidade: "projetos",
      mensagem: montarResposta({
        compreendi: `Sobre projetos, compreendi: «${citacaoCurta(texto)}».`,
        acao: `Projeto ativo: «${coa.nome}». Decisões, pendências e próximas ações passam a gravar neste contexto.`,
        contexto: resumirContexto(mem),
        proximo: `Registe uma decisão ou pendência de «${coa.nome}», ou abra o módulo Projetos.`,
        limite: null
      }),
      dados: {
        instrucao: texto,
        intencao: ctx.intencao,
        projeto: coa.nome,
        coa,
        memoriaSessao: mem
      }
    };
  }
});
