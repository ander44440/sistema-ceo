/**
 * Capacidade: Memória — consulta e registo operacional no projeto ativo.
 * Onda 03 E4: orquestra abrir/encerrar dia via APIs do catálogo (sem duplicar domínio).
 */
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  textoInstrucao
} from "../resposta.js";
import {
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  obterDiaExecutivo,
  obterProjetoAtivo,
  obterUltimaContinuidade
} from "../../catalogoProjetos/index.js";
import {
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  lerMemoria,
  resumirEstado
} from "../../executiveMemory/index.js";
import { executarConsultaEstado } from "./consultarEstado.js";
import { executarRecomendacaoOperacional } from "./recomendacaoOperacional.js";

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
 * Persistência continua em encerrarDiaExecutivo (contrato inalterado).
 * @param {string} instrucao
 */
export function extrairContinuidade(instrucao) {
  const raw = String(instrucao || "").trim();
  // Preferir blocos rotulados no corpo completo (relato multi-linha)
  const labeledFull = {
    oQueAndou: (raw.match(/\bO\s+QUE\s+ANDOU\s*:\s*([^\n]+)/i) || [])[1],
    oQueFica: (raw.match(/\bO\s+QUE\s+FICA\s*:\s*([^\n]+)/i) || [])[1],
    proximoPassoAmanha: (raw.match(
      /\bPR[OÓ]XIMO\s+PASSO(?:\s+DE\s+AMANH[AÃ])?\s*:\s*([^\n]+)/i
    ) || [])[1]
  };
  const limparInstrucao = (s) => {
    const v = String(s || "").trim();
    if (!v || v === "—" || v === "-") return "";
    if (
      /^(relate|indique|preencha|o\s+que\s+foi|pendenc)/i.test(v) &&
      v.length > 80
    ) {
      return "";
    }
    if (/^relate objetivamente/i.test(v) || /^indique a pr/i.test(v)) {
      return "";
    }
    return v;
  };
  if (
    labeledFull.oQueAndou ||
    labeledFull.oQueFica ||
    labeledFull.proximoPassoAmanha
  ) {
    const campos = {
      oQueAndou: limparInstrucao(labeledFull.oQueAndou),
      oQueFica: limparInstrucao(labeledFull.oQueFica),
      proximoPassoAmanha: limparInstrucao(labeledFull.proximoPassoAmanha)
    };
    if (
      campos.oQueAndou ||
      campos.oQueFica ||
      campos.proximoPassoAmanha
    ) {
      return campos;
    }
  }

  const apos = raw.match(/:\s*(.+)$/s);
  const body = apos ? apos[1].trim() : "";
  if (!body) {
    return { oQueAndou: "", oQueFica: "", proximoPassoAmanha: "" };
  }

  const labeled = {
    oQueAndou: (body.match(/\b(?:andou|o\s+que\s+andou)\s*:\s*([^;|\n]+)/i) ||
      [])[1],
    oQueFica: (body.match(/\b(?:fica|o\s+que\s+fica)\s*:\s*([^;|\n]+)/i) ||
      [])[1],
    proximoPassoAmanha: (body.match(
      /\b(?:amanh[aã]|pr[oó]ximo(?:\s+passo)?)\s*:\s*([^;|\n]+)/i
    ) || [])[1]
  };

  if (labeled.oQueAndou || labeled.oQueFica || labeled.proximoPassoAmanha) {
    return {
      oQueAndou: limparInstrucao(labeled.oQueAndou),
      oQueFica: limparInstrucao(labeled.oQueFica),
      proximoPassoAmanha: limparInstrucao(labeled.proximoPassoAmanha)
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

/** Conversa: os três elementos são obrigatórios (sem fecho parcial silencioso). */
function continuidadeConversacionalCompleta(campos) {
  return Boolean(
    campos?.oQueAndou && campos?.oQueFica && campos?.proximoPassoAmanha
  );
}

/**
 * Gera os três campos a partir do lastro / Jobs F2 / MTE (sem store paralelo).
 * @param {object} ctx
 * @returns {Promise<{ oQueAndou: string, oQueFica: string, proximoPassoAmanha: string }|null>}
 */
export async function gerarContinuidadeDeEstadoOperacional(ctx = {}) {
  const lastro =
    ctx.lastroConsciencia && typeof ctx.lastroConsciencia === "object"
      ? ctx.lastroConsciencia
      : null;
  const mte =
    lastro?.memoriaTrabalhoExecutiva &&
    typeof lastro.memoriaTrabalhoExecutiva === "object"
      ? lastro.memoriaTrabalhoExecutiva
      : null;
  const promo =
    lastro?.resultadoMissaoActivo &&
    typeof lastro.resultadoMissaoActivo === "object"
      ? lastro.resultadoMissaoActivo
      : null;

  /** @type {object[]} */
  let jobs = [];
  try {
    if (typeof ctx.listarJobs === "function") {
      jobs = (await ctx.listarJobs(null)) || [];
    } else {
      const { listarJobsEmAcompanhamento } = await import("../filaCliente.js");
      jobs = (await listarJobsEmAcompanhamento()) || [];
    }
  } catch {
    jobs = [];
  }
  if (!Array.isArray(jobs)) jobs = [];

  const abertos = jobs.filter((j) => {
    const e = String(j?.estado || j?.status || "");
    return (
      e === "dispatched" ||
      e === "running" ||
      e === "result" ||
      e === "needs_correction"
    );
  });
  let missao = null;
  try {
    const { obterCoaAtivo } = await import("../coaSessao.js");
    const coa = obterCoaAtivo();
    missao = coa ? { id: coa.id, nome: coa.nome } : null;
  } catch {
    missao = null;
  }
  let abertosMissao = abertos;
  if (missao) {
    try {
      const { filtrarJobsPorMissaoActiva } = await import(
        "../../motorExecucao/acompanhamentoJob.js"
      );
      abertosMissao = filtrarJobsPorMissaoActiva(abertos, missao);
    } catch {
      abertosMissao = abertos;
    }
  }
  const job =
    abertosMissao.find((j) => j?.resultado) ||
    abertosMissao[0] ||
    null;

  let sintese = "";
  let evidencia = "";
  let jobId = "";
  let estado = "";
  if (promo?.sintese) {
    sintese = String(promo.sintese);
    evidencia = promo.evidencia ? String(promo.evidencia) : "";
    jobId = String(promo.jobId || "");
    estado = String(promo.estado || "");
  } else if (job) {
    jobId = String(job.id || "");
    estado = String(job.estado || job.status || "");
    try {
      const { sintetizarResultadoJob } = await import(
        "../../motorExecucao/resultadoEncerramento.js"
      );
      sintese = sintetizarResultadoJob(job) || "";
    } catch {
      sintese =
        (job.resultado &&
          typeof job.resultado === "object" &&
          String(job.resultado.resumo || "")) ||
        "";
    }
    if (
      job.resultado &&
      typeof job.resultado === "object" &&
      typeof job.resultado.evidencia === "string"
    ) {
      evidencia = job.resultado.evidencia.trim();
    }
  }

  const factos = Array.isArray(lastro?.factosOficiais)
    ? lastro.factosOficiais
    : [];
  if (!sintese) {
    const factoRes = factos.find((f) =>
      /Resultado reconciliado|resultado:/i.test(String(f))
    );
    if (factoRes) sintese = String(factoRes).replace(/^Estado Executivo —\s*/i, "");
  }

  if (!sintese && !mte?.proximaAcao && !jobId) {
    return null;
  }

  const oQueAndou = sintese
    ? jobId
      ? `${jobId}: ${sintese}${evidencia ? ` (evidência: ${evidencia})` : ""}`
      : sintese
    : mte?.estadoConversa?.emExecucao
      ? String(mte.estadoConversa.emExecucao)
      : "Operação acompanhada no período — sem síntese de entrega registada.";

  const pendMte = Array.isArray(mte?.pendencias) ? mte.pendencias[0] : null;
  const oQueFica =
    estado === "needs_correction"
      ? `${jobId || "Job"} em needs_correction — resultado disponível; verificação não fechou (≠ completed).`
      : estado === "result"
        ? `${jobId || "Job"} em result — aguarda verificação (≠ completed).`
        : pendMte
          ? String(pendMte)
          : jobId
            ? `${jobId} ainda em acompanhamento (${estado || "aberto"}).`
            : "Pendências operacionais em aberto na missão activa.";

  const proximoPassoAmanha =
    (mte?.proximaAcao && String(mte.proximaAcao)) ||
    (estado === "needs_correction" && jobId
      ? `Retomar ${jobId} a partir do resultado reconciliado e continuar a missão.`
      : estado === "result" && jobId
        ? `Verificar resultado de ${jobId} e fechar ou corrigir.`
        : jobId
          ? `Prosseguir acompanhamento de ${jobId} até fecho válido.`
          : "Retomar a missão activa a partir do estado operacional actual.");

  return {
    oQueAndou: oQueAndou.slice(0, 500),
    oQueFica: oQueFica.slice(0, 500),
    proximoPassoAmanha: proximoPassoAmanha.slice(0, 500)
  };
}

/**
 * Reapresentação explícita da última continuidade (só texto de resposta).
 * @param {import("../../catalogoProjetos/diaExecutivo.js").RegistroContinuidade|null} cont
 */
function textoUltimaContinuidade(cont) {
  if (!cont) {
    return "Última continuidade: nenhuma registada ainda.";
  }
  return [
    "Última continuidade:",
    `O QUE ANDOU: ${cont.oQueAndou}`,
    `O QUE FICA: ${cont.oQueFica}`,
    `PRÓXIMO PASSO DE AMANHÃ: ${cont.proximoPassoAmanha}`
  ].join("\n");
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

      const continuidade = obterUltimaContinuidade();
      const intencaoDoDia = extrairIntencaoDoDia(texto);
      const dia = abrirDiaExecutivo({ intencaoDoDia });
      const estado = lerMemoria();
      const blocoContinuidade = textoUltimaContinuidade(continuidade);
      const retomada = intencaoDoDia
        ? `Dia retomado. Foco: ${intencaoDoDia}.`
        : "Dia retomado.";
      return {
        ok: Boolean(dia),
        capacidade: "memoria",
        mensagem: montarResposta({
          compreendi: `Abrir o dia em «${ativo.nome}».`,
          acao: dia
            ? `${blocoContinuidade}\n\n${retomada}`
            : "Não foi possível abrir o dia.",
          contexto: resumirContexto(estado),
          proximo: continuidade?.proximoPassoAmanha
            ? `Retome a partir de: ${continuidade.proximoPassoAmanha}`
            : "Trabalhe no Centro ou peça o estado atual.",
          limite: null
        }),
        dados: { dia, continuidade, intencao, jaPersistido: true }
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

      let campos = extrairContinuidade(texto);
      let origemCampos = "texto";
      if (!continuidadeConversacionalCompleta(campos)) {
        const auto = await gerarContinuidadeDeEstadoOperacional(ctx);
        if (auto && continuidadeConversacionalCompleta(auto)) {
          campos = auto;
          origemCampos = "estado_operacional";
        }
      }
      const estado = lerMemoria();

      if (!continuidadeConversacionalCompleta(campos)) {
        return {
          ok: false,
          capacidade: "memoria",
          mensagem: montarResposta({
            compreendi: `Encerrar o dia em «${ativo.nome}».`,
            acao:
              "Encerramento por conversa exige os três elementos: o que andou, o que fica e o próximo passo de amanhã.",
            contexto: resumirContexto(estado),
            proximo:
              "Informe os três — ex.: «encerrar o dia: X | Y | Z» — ou use o painel Encerrar o dia no Centro.",
            limite: null
          }),
          dados: {
            dia: obterDiaExecutivo(),
            intencao,
            jaPersistido: true,
            erro: "continuidade_incompleta"
          }
        };
      }

      const resultado = encerrarDiaExecutivo(campos);

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
        mensagem:
          origemCampos === "estado_operacional"
            ? [
                `O QUE ANDOU: ${campos.oQueAndou}`,
                `O QUE FICA: ${campos.oQueFica}`,
                `PRÓXIMO PASSO: ${campos.proximoPassoAmanha}`
              ].join("\n")
            : montarResposta({
                compreendi: `Encerrar o dia em «${ativo.nome}».`,
                acao: [
                  "Dia encerrado. Continuidade registrada:",
                  `O QUE ANDOU: ${campos.oQueAndou}`,
                  `O QUE FICA: ${campos.oQueFica}`,
                  `PRÓXIMO PASSO DE AMANHÃ: ${campos.proximoPassoAmanha}`
                ].join("\n"),
                contexto: resumirContexto(estado),
                proximo: "Amanhã: abra o dia para retomar a continuidade.",
                limite: null
              }),
        modo:
          origemCampos === "estado_operacional"
            ? "relato_encerramento"
            : "encerrar_dia",
        dados: {
          dia: resultado.dia,
          registro: resultado.registro,
          intencao,
          jaPersistido: true,
          origemCampos,
          continuidade: campos
        }
      };
    }

    if (intencao.id === "consultar_estado") {
      const consulta = await executarConsultaEstado(texto, {
        obterJob: ctx.obterJob,
        listarJobs: ctx.listarJobs,
        storeContinuidade: ctx.storeContinuidade,
        lerMemoriaFn: typeof ctx.memoria === "function" ? ctx.memoria : lerMemoria
      });
      return {
        ok: consulta.ok !== false,
        capacidade: "memoria",
        mensagem: consulta.mensagem,
        modo: consulta.modo || "consulta_estado",
        dados: {
          ...(consulta.dados || {}),
          intencao,
          jaPersistido: true
        }
      };
    }

    if (intencao.id === "recomendar_operacional") {
      const rec = await executarRecomendacaoOperacional(texto, {
        obterJob: ctx.obterJob,
        listarJobs: ctx.listarJobs,
        storeContinuidade: ctx.storeContinuidade,
        lerMemoriaFn: typeof ctx.memoria === "function" ? ctx.memoria : lerMemoria
      });
      return {
        ok: rec.ok !== false,
        capacidade: "memoria",
        mensagem: rec.mensagem,
        modo: rec.modo || "recomendacao_operacional",
        dados: {
          ...(rec.dados || {}),
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
