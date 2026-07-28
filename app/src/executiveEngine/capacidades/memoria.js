/**
 * Capacidade: Memória — consulta e registo operacional no projeto ativo.
 * Onda 03 E4: orquestra abrir/encerrar dia via APIs do catálogo (sem duplicar domínio).
 */
import {
  resumirEstado,
  lerMemoria,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao
} from "../../executiveMemory/index.js";
import {
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  obterDiaExecutivo,
  obterProjetoAtivo
} from "../../catalogoProjetos/index.js";
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

/** Intenção do dia após ":" ou "intenção …". */
function extrairIntencaoDoDia(instrucao) {
  const raw = String(instrucao || "").trim();
  const apos = raw.match(/:\s*(.+)$/s);
  if (apos) return apos[1].trim();
  const m = raw.match(/\binten[cç][aã]o\s*[:\-]?\s*(.+)$/i);
  return m ? m[1].trim() : "";
}

/**
 * Continuidade a partir do texto (rótulos ou "A | B | C" / "A; B; C").
 * Regras de validação permanecem em encerrarDiaExecutivo.
 */
function extrairContinuidade(instrucao) {
  const raw = String(instrucao || "").trim();
  const apos = raw.match(/:\s*(.+)$/s);
  const body = apos ? apos[1].trim() : "";
  if (!body) {
    return { oQueAndou: "", oQueFica: "", proximoPassoAmanha: "" };
  }

  const labeled = {
    oQueAndou: (body.match(/\b(?:andou|o\s+que\s+andou)\s*:\s*([^;|]+)/i) ||
      [])[1],
    oQueFica: (body.match(/\b(?:fica|o\s+que\s+fica)\s*:\s*([^;|]+)/i) ||
      [])[1],
    proximoPassoAmanha: (body.match(
      /\b(?:amanh[aã]|pr[oó]ximo(?:\s+passo)?)\s*:\s*([^;|]+)/i
    ) || [])[1]
  };

  if (labeled.oQueAndou || labeled.oQueFica || labeled.proximoPassoAmanha) {
    return {
      oQueAndou: String(labeled.oQueAndou || "").trim(),
      oQueFica: String(labeled.oQueFica || "").trim(),
      proximoPassoAmanha: String(labeled.proximoPassoAmanha || "").trim()
    };
  }

  const parts = body
    .split(/\s*[|;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    oQueAndou: parts[0] || "",
    oQueFica: parts[1] || "",
    proximoPassoAmanha: parts[2] || ""
  };
}

export const capacidadeMemoria = Object.freeze({
  id: "memoria",
  nome: "Memória",
  descricao: "Consulta e exposição da Memória Executiva do projeto ativo.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const intencao = ctx.intencao || {};
    const conteudo = extrairConteudo(texto);

    if (intencao.id === "abrir_dia") {
      const ativo = obterProjetoAtivo();
      if (!ativo) {
        return {
          ok: false,
          capacidade: "memoria",
          mensagem: montarResposta({
            compreendi: `Pedido para abrir o dia: «${citacaoCurta(texto)}».`,
            acao: "Não há projeto ativo no gabinete.",
            contexto: null,
            proximo: "Abra ou selecione um projeto (ex.: Motoboy Game 2).",
            limite: null
          }),
          dados: { intencao, jaPersistido: true }
        };
      }

      const intencaoDoDia = extrairIntencaoDoDia(texto);
      const dia = abrirDiaExecutivo({ intencaoDoDia });
      const estado = lerMemoria();
      return {
        ok: Boolean(dia),
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Abrir o dia em «${ativo.nome}».`,
          acao: dia
            ? intencaoDoDia
              ? `Dia em curso. Foco: ${intencaoDoDia}.`
              : "Dia em curso. Informe o foco quando quiser."
            : "Não foi possível abrir o dia.",
          contexto: resumirContexto(estado),
          proximo: "Trabalhe no Centro ou peça o estado atual.",
          limite: null
        }),
        dados: { dia, intencao, jaPersistido: true }
      };
    }

    if (intencao.id === "encerrar_dia") {
      const ativo = obterProjetoAtivo();
      if (!ativo) {
        return {
          ok: false,
          capacidade: "memoria",
          mensagem: montarResposta({
            compreendi: `Pedido para encerrar o dia: «${citacaoCurta(texto)}».`,
            acao: "Não há projeto ativo no gabinete.",
            contexto: null,
            proximo: "Selecione um projeto antes de encerrar o dia.",
            limite: null
          }),
          dados: { intencao, jaPersistido: true }
        };
      }

      const campos = extrairContinuidade(texto);
      const resultado = encerrarDiaExecutivo(campos);
      const estado = lerMemoria();

      if (!resultado) {
        return {
          ok: false,
          capacidade: "memoria",
          mensagem: montarResposta({
            compreendi: `Encerrar o dia em «${ativo.nome}».`,
            acao: "Não foi possível encerrar o dia.",
            contexto: resumirContexto(estado),
            proximo: "Verifique o projeto ativo e tente de novo.",
            limite: null
          }),
          dados: { intencao, jaPersistido: true }
        };
      }

      if (resultado.ok === false && resultado.erro === "informe_continuidade") {
        return {
          ok: false,
          capacidade: "memoria",
          mensagem: montarResposta({
            compreendi: `Encerrar o dia em «${ativo.nome}».`,
            acao: "Falta o registro de continuidade.",
            contexto: resumirContexto(estado),
            proximo:
              "Informe o que andou, o que fica e o próximo passo — ex.: «encerrar o dia: X | Y | Z» — ou use o painel Encerrar o dia no Centro.",
            limite: null
          }),
          dados: {
            dia: resultado.dia || obterDiaExecutivo(),
            intencao,
            jaPersistido: true
          }
        };
      }

      return {
        ok: true,
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Encerrar o dia em «${ativo.nome}».`,
          acao: "Dia encerrado. Continuidade registrada no projeto.",
          contexto: resumirContexto(estado),
          proximo: "Amanhã: abra o dia para retomar a continuidade.",
          limite: null
        }),
        dados: {
          dia: resultado.dia,
          registro: resultado.registro,
          intencao,
          jaPersistido: true
        }
      };
    }

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
