/**
 * Capacidade: IA — motor de deliberação.
 * Rotas determinísticas locais; deliberativas via MRE + Speaker (Bloco 2).
 * PX-003 E2: prosa passa pela Conversação Natural (MRE inalterado).
 */
import {
  citacaoCurta,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import { obterCoaAtivo } from "../coaSessao.js";
import { obterResumoIdentidadeCeo } from "../constituicaoCeo.js";
import {
  metadadoDicInjecao,
  montarMensagensLlm
} from "../promptGovernanca.js";
import { deliberarComLlm, obterStatusLlm } from "../llmCliente.js";
import {
  ehRotaDeliberativa,
  executarRotaDeliberativa
} from "../../mre/integracaoNucleo.js";
import { flagMre } from "../../mre/roteamentoDeliberativo.js";
import { naturalizarRespostaNucleo } from "../../conversacaoNatural/index.js";
import {
  comporProsaLastro,
  garantirReflexoEstadoExecutivo
} from "../../conscienciaOperacional/influenciaDeliberacao.js";
import { avaliarComplexidadeDecisao } from "../complexidadeDecisao.js";

function formatarDataAgora() {
  const agora = new Date();
  const data = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(agora);
  return data.charAt(0).toUpperCase() + data.slice(1);
}

function formatarHoraAgora() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function respostaLocal(intencaoId, texto) {
  switch (intencaoId) {
    case "pergunta_data":
      return `Hoje é ${formatarDataAgora()}.`;
    case "pergunta_hora":
      return `Agora são ${formatarHoraAgora()}.`;
    case "pergunta_identidade":
      return obterResumoIdentidadeCeo();
    case "saudacao": {
      const t = String(texto || "").toLowerCase();
      if (/bom dia/.test(t)) {
        return "Bom dia. Qual é o objetivo de agora?";
      }
      if (/boa tarde/.test(t)) {
        return "Boa tarde. Qual é o objetivo de agora?";
      }
      if (/boa noite/.test(t)) {
        return "Boa noite. Qual é o objetivo de agora?";
      }
      return "Pronto. Vamos continuar de onde paramos ou surgiu uma nova prioridade?";
    }
    default:
      return null;
  }
}

function fallbackSemLlm(texto, motivo) {
  return (
    `Não consigo deliberar com fluidez sobre «${citacaoCurta(texto)}»: motor de linguagem indisponível (${motivo}).\n\n` +
    "Configure `CEO_LLM_API_KEY` em `app/.env` (veja `.env.example`), reinicie o servidor e volte a tentar.\n\n" +
    "Enquanto isso, seguimos no local: data/hora, estado da sessão, projetos e navegação. Qual frente atacamos agora?"
  );
}

/**
 * Execução bruta (antes da Conversação Natural).
 * @param {object} ctx
 */
async function executarBruto(ctx) {
  const texto = textoInstrucao(ctx);
  const mem = snapshotMemoria(ctx);
  const intencao = ctx.intencao || {};
  const coa = obterCoaAtivo();

  if (!texto) {
    return {
      ok: true,
      capacidade: "ia",
      mensagem: "Não recebi instrução. Qual é o objetivo de agora?",
      modo: "local",
      dados: { intencao, memoria: mem, coa, rota: "deterministica" }
    };
  }

  const localIds = new Set([
    "pergunta_data",
    "pergunta_hora",
    "pergunta_identidade",
    "saudacao"
  ]);
  if (localIds.has(intencao.id)) {
    const cxLocal = avaliarComplexidadeDecisao({
      texto,
      intencao,
      classe: intencao.classe,
      destino: intencao.destino
    });
    return {
      ok: true,
      capacidade: "ia",
      mensagem: respostaLocal(intencao.id, texto),
      modo: "local",
      dados: {
        instrucao: texto,
        intencao,
        memoria: mem,
        coa,
        rota: "deterministica",
        complexidadeDecisao: cxLocal
      }
    };
  }

  const complexidade = avaliarComplexidadeDecisao({
    texto,
    intencao,
    classe: intencao.classe,
    destino: intencao.destino,
    frenteActiva: Boolean(coa)
  });

  if (ehRotaDeliberativa(intencao) && flagMre.ativo) {
    const lastro = ctx.lastroConsciencia || null;

    // REQ-066: só decisões «completa» pagam o pipeline MRE 0–7
    if (complexidade.permiteMreCompleto) {
      const status = await obterStatusLlm();
      if (!status || !status.configurado) {
        // IMP-059 E4: com lastro operacional, contextualizar mesmo sem LLM
        const prosaLastro = comporProsaLastro(lastro, texto);
        if (prosaLastro) {
          return {
            ok: true,
            capacidade: "ia",
            mensagem: prosaLastro,
            modo: "consciencia_operacional",
            dados: {
              instrucao: texto,
              intencao,
              memoria: mem,
              coa,
              llm: status,
              lastroConsciencia: lastro,
              rota: "deliberativa-consciencia-sem-llm",
              complexidadeDecisao: complexidade
            }
          };
        }
        return {
          ok: true,
          capacidade: "ia",
          mensagem: fallbackSemLlm(texto, "chave não configurada — MRE indisponível"),
          modo: "fallback",
          dados: {
            instrucao: texto,
            intencao,
            memoria: mem,
            coa,
            llm: status,
            rota: "deliberativa-sem-llm",
            complexidadeDecisao: complexidade
          }
        };
      }

      try {
        const mreOut = await executarRotaDeliberativa(
          {
            ...ctx,
            coaAtivo: coa,
            ...(lastro ? { lastroConsciencia: lastro } : {})
          },
          {
            canal: ctx.canalSpeaker || "chat",
            skipFila: ctx.skipFilaConsciencia === true ? true : undefined
          }
        );
        const reflexo = garantirReflexoEstadoExecutivo(
          mreOut.mensagem,
          lastro,
          texto
        );
        return {
          ...mreOut,
          mensagem: reflexo.mensagem,
          capacidade: "ia",
          dados: {
            ...(mreOut.dados || {}),
            instrucao: texto,
            intencao,
            memoria: mem,
            coa,
            llm: status,
            conscienciaInfluencia: reflexo,
            complexidadeDecisao: complexidade,
            ...(lastro ? { lastroConsciencia: lastro } : {})
          }
        };
      } catch (err) {
        const fallback = fallbackSemLlm(
          texto,
          err && err.message ? err.message : "falha no MRE"
        );
        const reflexo = garantirReflexoEstadoExecutivo(fallback, lastro, texto);
        return {
          ok: true,
          capacidade: "ia",
          mensagem: reflexo.mensagem,
          modo: "fallback",
          dados: {
            instrucao: texto,
            intencao,
            memoria: mem,
            coa,
            erro: err && err.message,
            rota: "deliberativa-erro",
            conscienciaInfluencia: reflexo,
            complexidadeDecisao: complexidade
          }
        };
      }
    }

    // Nível moderado/leve deliberativo → 1× LLM (sem pipeline MRE)
    const statusMod = await obterStatusLlm();
    if (!statusMod || !statusMod.configurado) {
      const prosaLastro = comporProsaLastro(lastro, texto);
      if (prosaLastro) {
        return {
          ok: true,
          capacidade: "ia",
          mensagem: prosaLastro,
          modo: "consciencia_operacional",
          dados: {
            instrucao: texto,
            intencao,
            memoria: mem,
            coa,
            llm: statusMod,
            lastroConsciencia: lastro,
            rota: "deliberativa-rapida-sem-llm",
            complexidadeDecisao: complexidade
          }
        };
      }
      return {
        ok: true,
        capacidade: "ia",
        mensagem: fallbackSemLlm(texto, "chave não configurada"),
        modo: "fallback",
        dados: {
          instrucao: texto,
          intencao,
          memoria: mem,
          coa,
          llm: statusMod,
          rota: "deliberativa-rapida-sem-llm",
          complexidadeDecisao: complexidade
        }
      };
    }

    try {
      const paramsMsg = {
        instrucao: texto,
        historico: ctx.historico || [],
        memoria: mem,
        coa,
        intencao,
        validacaoContexto: ctx.validacaoContexto || null
      };
      const messages = montarMensagensLlm(paramsMsg);
      const dicMeta = metadadoDicInjecao(paramsMsg);
      const saida = await deliberarComLlm({
        messages,
        temperature: 0.4,
        max_tokens: complexidade.maxTokens
      });
      const reflexo = garantirReflexoEstadoExecutivo(saida.texto, lastro, texto);
      return {
        ok: true,
        capacidade: "ia",
        mensagem: reflexo.mensagem,
        modo: "llm_rapido",
        dados: {
          instrucao: texto,
          intencao,
          memoria: mem,
          coa,
          rota: "deliberativa-rapida",
          complexidadeDecisao: complexidade,
          dicInjecao: dicMeta,
          conscienciaInfluencia: reflexo,
          llm: {
            modelo: saida.modelo,
            uso: saida.uso,
            origem: saida.origem
          },
          ...(lastro ? { lastroConsciencia: lastro } : {})
        }
      };
    } catch (err) {
      const fallback = fallbackSemLlm(
        texto,
        err && err.message ? err.message : "falha na chamada rápida"
      );
      const reflexo = garantirReflexoEstadoExecutivo(fallback, lastro, texto);
      return {
        ok: true,
        capacidade: "ia",
        mensagem: reflexo.mensagem,
        modo: "fallback",
        dados: {
          instrucao: texto,
          intencao,
          memoria: mem,
          coa,
          erro: err && err.message,
          rota: "deliberativa-rapida-erro",
          complexidadeDecisao: complexidade,
          conscienciaInfluencia: reflexo
        }
      };
    }
  }

  const status = await obterStatusLlm();
  if (!status || !status.configurado) {
    return {
      ok: true,
      capacidade: "ia",
      mensagem: fallbackSemLlm(texto, "chave não configurada"),
      modo: "fallback",
      dados: {
        instrucao: texto,
        intencao,
        memoria: mem,
        coa,
        llm: status,
        rota: "legado",
        complexidadeDecisao: complexidade
      }
    };
  }

  try {
    const paramsMsg = {
      instrucao: texto,
      historico: ctx.historico || [],
      memoria: mem,
      coa,
      intencao,
      validacaoContexto: ctx.validacaoContexto || null
    };
    const messages = montarMensagensLlm(paramsMsg);
    const dicMeta = metadadoDicInjecao(paramsMsg);

    const saida = await deliberarComLlm({
      messages,
      temperature: 0.45,
      max_tokens: complexidade.maxTokens || 900
    });

    return {
      ok: true,
      capacidade: "ia",
      mensagem: saida.texto,
      modo: "llm",
      dados: {
        instrucao: texto,
        intencao,
        memoria: mem,
        coa,
        rota: "legado-llm",
        complexidadeDecisao: complexidade,
        dicInjecao: dicMeta,
        llm: {
          modelo: saida.modelo,
          uso: saida.uso,
          origem: saida.origem
        }
      }
    };
  } catch (err) {
    return {
      ok: true,
      capacidade: "ia",
      mensagem: fallbackSemLlm(
        texto,
        err && err.message ? err.message : "falha na chamada"
      ),
      modo: "fallback",
      dados: {
        instrucao: texto,
        intencao,
        memoria: mem,
        coa,
        erro: err && err.message,
        rota: "legado-erro",
        complexidadeDecisao: complexidade
      }
    };
  }
}

export const capacidadeIa = Object.freeze({
  id: "ia",
  nome: "IA",
  descricao: "Motor de deliberação e interpretação semântica.",
  async executar(ctx) {
    const bruto = await executarBruto(ctx);
    return naturalizarRespostaNucleo(bruto, {
      ...ctx,
      instrucao: textoInstrucao(ctx)
    });
  }
});
