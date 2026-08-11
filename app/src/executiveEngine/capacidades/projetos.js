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
import { definirCoaAtivo, obterCoaAtivo } from "../coaSessao.js";
import { listarProjetos } from "../../catalogoProjetos/index.js";

/**
 * CTO-003.1 P1 — só extrai alvo quando há âncora explícita de abertura/troca
 * (alinhada a mapearCapacidadePorTexto / atuar_em_projetos).
 * Menção incidental a MG2 / Motoboy Game 2 / outro nome NÃO activa troca.
 * @param {string} texto
 * @returns {string|null}
 */
function extrairNomeProjeto(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return null;

  const ancora =
    raw.match(/\babrir\s+projeto\s+(.+)$/i) ||
    raw.match(/\bativar\s+(?:o\s+)?coa\s+(.+)$/i) ||
    raw.match(/\btrocar\s+(?:para\s+(?:o\s+)?)?projeto\s+(.+)$/i) ||
    raw.match(/\bdefinir\s+coa\s+(.+)$/i);
  if (!ancora) return null;

  let nome = String(ancora[1] || "")
    .replace(/[?.!].*$/, "")
    .replace(/^[«"']+|[»"']+$/g, "")
    .trim();
  if (!nome) return null;
  // Alias exacto para selecionarProjetoPorRef
  if (/^mg2$/i.test(nome)) return "mg2";
  return nome;
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

    // CTO-003.1 P1: só troca com âncora explícita (abrir/ativar/trocar/definir).
    // Sem âncora → reporta o activo actual (sem definirCoaAtivo).
    const nome = extrairNomeProjeto(texto);
    const coa = nome ? definirCoaAtivo({ nome }) : obterCoaAtivo();
    const nomeActivo = coa?.nome || "nenhum";

    return {
      ok: true,
      capacidade: "projetos",
      mensagem: montarResposta({
        compreendi: `Sobre projetos, compreendi: «${citacaoCurta(texto)}».`,
        acao: `Projeto ativo: «${nomeActivo}». Decisões, pendências e próximas ações passam a gravar neste contexto.`,
        contexto: resumirContexto(mem),
        proximo: `Registe uma decisão ou pendência de «${nomeActivo}», ou abra o módulo Projetos.`,
        limite: null
      }),
      dados: {
        instrucao: texto,
        intencao: ctx.intencao,
        projeto: coa?.nome || null,
        coa,
        memoriaSessao: mem
      }
    };
  }
});
