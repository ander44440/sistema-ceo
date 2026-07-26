/**
 * Capacidade: Memória — consulta e registo operacional no projeto ativo.
 */
import {
  resumirEstado,
  lerMemoria,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao
} from "../../executiveMemory/index.js";
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  textoInstrucao
} from "../resposta.js";

function extrairConteudo(instrucao) {
  const raw = String(instrucao || "").trim();
  const apos = raw.match(/:\s*(.+)$/);
  if (apos) return apos[1].trim();
  return raw
    .replace(/^(registrar|criar|adicionar)\s+/i, "")
    .replace(/^(decis[aã]o|pend[eê]ncia|pr[oó]xima\s+a[cç][aã]o)\s*/i, "")
    .replace(/^:\s*/, "")
    .trim() || raw;
}

export const capacidadeMemoria = Object.freeze({
  id: "memoria",
  nome: "Memória",
  descricao: "Consulta e exposição da Memória Executiva do projeto ativo.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const intencao = ctx.intencao || {};
    const conteudo = extrairConteudo(texto);

    if (intencao.id === "registrar_decisao") {
      const item = registrarDecisao(conteudo, "conversa");
      const estado = lerMemoria();
      return {
        ok: true,
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Registo de decisão: «${citacaoCurta(conteudo)}».`,
          acao: item
            ? "Decisão persistida no workspace do projeto ativo."
            : "Não foi possível registar a decisão.",
          contexto: resumirContexto(estado),
          proximo: "Pode criar uma pendência ou uma próxima ação.",
          limite: null
        }),
        dados: { estado, item, intencao, jaPersistido: true }
      };
    }

    if (intencao.id === "registrar_pendencia") {
      const item = registrarPendencia(conteudo);
      const estado = lerMemoria();
      return {
        ok: true,
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Criação de pendência: «${citacaoCurta(conteudo)}».`,
          acao: item
            ? "Pendência persistida no workspace do projeto ativo."
            : "Não foi possível criar a pendência.",
          contexto: resumirContexto(estado),
          proximo: "Indique uma próxima ação ou peça o estado atual.",
          limite: null
        }),
        dados: { estado, item, intencao, jaPersistido: true }
      };
    }

    if (intencao.id === "registrar_proxima_acao") {
      const item = registrarProximaAcao(conteudo);
      const estado = lerMemoria();
      return {
        ok: true,
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Próxima ação: «${citacaoCurta(conteudo)}».`,
          acao: item
            ? "Próxima ação persistida no workspace do projeto ativo."
            : "Não foi possível registar a próxima ação.",
          contexto: resumirContexto(estado),
          proximo: "Feche e reabra o sistema para validar a retomada automática.",
          limite: null
        }),
        dados: { estado, item, intencao, jaPersistido: true }
      };
    }

    const estado = typeof ctx.memoria === "function" ? ctx.memoria() : lerMemoria();
    const pens = (estado.pendencias || []).filter((p) => p.status === "aberta");

    if (intencao.id === "analisar_pendencias") {
      const lista = pens.length
        ? pens
            .slice(0, 5)
            .map((p, i) => `${i + 1}. ${p.texto}`)
            .join("\n")
        : "Nenhuma pendência aberta no projeto ativo.";

      return {
        ok: true,
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Pediu análise de pendências: «${citacaoCurta(texto)}».`,
          acao: `Pendências abertas:\n${lista}`,
          contexto: resumirContexto(estado),
          proximo: pens.length
            ? "Indique qual pendência quer atacar primeiro."
            : "Crie uma pendência descrevendo o que falta fazer.",
          limite: null
        }),
        dados: { estado, intencao }
      };
    }

    return {
      ok: true,
      capacidade: "memoria",
      mensagem: resumirEstado(),
      dados: {
        estado,
        intencao,
        pedido: texto
      }
    };
  }
});
