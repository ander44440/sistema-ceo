/**
 * Emenda E5.1 (IMP-057) — gerador definitivo do destino `resposta_leve` (C1).
 * LLM directo; proibido MRE, Motor, Job e Gate.
 */

import { deliberarComLlm, obterStatusLlm } from "../executiveEngine/llmCliente.js";
import { avaliarComplexidadeDecisao } from "../executiveEngine/complexidadeDecisao.js";

const STUB_PROIBIDO =
  /resposta imediata\s*\(C1\)|Que detalhe precisa\?/i;

/** System prompt mínimo — conhecimento geral, sem deliberação de projecto. */
export const SYSTEM_RESPOSTA_LEVE = Object.freeze(
  [
    "És o Executivo Digital do CEO.",
    "Responde em português do Brasil, de forma natural, clara e completa,",
    "a perguntas de conhecimento geral (definições, explicações, factos, receitas, ciência, tecnologia, história, etc.).",
    "Quando a pergunta já estiver completa, NÃO peças clarificação nem digas «Que detalhe precisa?».",
    "NÃO mentions classificação C1, Classificador, MRE, Motor, Job ou Gate.",
    "NÃO transforms a resposta numa deliberação de projecto nem peças prioridade de frentes.",
    "NÃO te apresentes como assistente genérico, chatbot ou «IA útil para qualquer tópico».",
    "Se te perguntarem quem és: és o Executivo Digital do Sistema CEO (governança), não um chatbot.",
    "Para factos de actualidade (ex.: cargos políticos em datas posteriores ao teu conhecimento), declara o limite e não afirmes dados desactualizados como certos.",
    "Entrega a resposta útil de imediato."
  ].join(" ")
);

/**
 * @param {{ texto: string, historico?: ReadonlyArray<{papel:string,texto:string}> }} p
 * @returns {Array<{role:string,content:string}>}
 */
export function montarMensagensRespostaLeve({ texto, historico = [] }) {
  const messages = [{ role: "system", content: SYSTEM_RESPOSTA_LEVE }];
  const recentes = Array.isArray(historico) ? historico.slice(-6) : [];
  for (const turn of recentes) {
    if (!turn || !turn.texto) continue;
    if (turn.papel === "usuario") {
      messages.push({ role: "user", content: String(turn.texto) });
    } else if (turn.papel === "ceo" || turn.papel === "assistente") {
      messages.push({ role: "assistant", content: String(turn.texto) });
    }
  }
  const pergunta = String(texto || "").trim();
  const ultimo = recentes[recentes.length - 1];
  const jaNoHistorico =
    ultimo &&
    ultimo.papel === "usuario" &&
    String(ultimo.texto).trim() === pergunta;
  if (pergunta && !jaNoHistorico) {
    messages.push({ role: "user", content: pergunta });
  }
  return messages;
}

/**
 * @param {string} texto
 * @param {string} motivo
 */
export function fallbackRespostaLeveSemLlm(texto, motivo) {
  const citacao = String(texto || "").trim().slice(0, 100);
  return (
    `Não consigo gerar agora a resposta completa a «${citacao}${String(texto || "").length > 100 ? "…" : ""}» ` +
    `(motor de linguagem indisponível: ${motivo}). ` +
    "A pergunta está clara — tente novamente em instantes."
  );
}

/**
 * Detecta o stub de desenvolvimento proibido pela Emenda E5.1.
 * @param {string} mensagem
 */
export function ehStubRespostaLeveProibido(mensagem) {
  return STUB_PROIBIDO.test(String(mensagem || ""));
}

/**
 * Gera resposta natural de conhecimento geral (C1).
 *
 * @param {object} p
 * @param {string} p.texto
 * @param {ReadonlyArray<{papel:string,texto:string}>} [p.historico]
 * @param {object} [p.deps] — `gerarRespostaLeve` ou `deliberarComLlm` injectáveis (testes)
 * @returns {Promise<{ok:boolean,mensagem:string,modo:string,dados:object}>}
 */
export async function gerarRespostaConhecimentoGeral({
  texto,
  historico = [],
  deps = {}
}) {
  if (typeof deps.gerarRespostaLeve === "function") {
    const out = await deps.gerarRespostaLeve({ texto, historico });
    return {
      ok: out?.ok !== false,
      mensagem: String(out?.mensagem || ""),
      modo: out?.modo || "resposta_leve",
      dados: {
        gerador: "injectado",
        mreInvocado: false,
        motorAcionado: false,
        ...(out?.dados && typeof out.dados === "object" ? out.dados : {})
      }
    };
  }

  const deliberar =
    typeof deps.deliberarComLlm === "function"
      ? deps.deliberarComLlm
      : deliberarComLlm;
  const statusFn =
    typeof deps.obterStatusLlm === "function"
      ? deps.obterStatusLlm
      : obterStatusLlm;

  const status = await statusFn();
  if (!status || !status.configurado) {
    return {
      ok: true,
      mensagem: fallbackRespostaLeveSemLlm(texto, "chave não configurada"),
      modo: "resposta_leve_fallback",
      dados: {
        gerador: "fallback",
        mreInvocado: false,
        motorAcionado: false,
        llm: status
      }
    };
  }

  try {
    const messages = montarMensagensRespostaLeve({ texto, historico });
    const cx = avaliarComplexidadeDecisao({
      texto,
      classe: "conhecimento_geral",
      destino: "resposta_leve"
    });
    const saida = await deliberar({
      messages,
      temperature: 0.5,
      max_tokens: cx.maxTokens || 450
    });
    const mensagem = String(saida?.texto || "").trim();
    if (!mensagem || ehStubRespostaLeveProibido(mensagem)) {
      return {
        ok: true,
        mensagem: fallbackRespostaLeveSemLlm(
          texto,
          "resposta vazia ou inválida do motor"
        ),
        modo: "resposta_leve_fallback",
        dados: {
          gerador: "fallback",
          mreInvocado: false,
          motorAcionado: false,
          complexidadeDecisao: cx
        }
      };
    }
    return {
      ok: true,
      mensagem,
      modo: "resposta_leve",
      dados: {
        gerador: "llm",
        mreInvocado: false,
        motorAcionado: false,
        complexidadeDecisao: cx,
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
      mensagem: fallbackRespostaLeveSemLlm(
        texto,
        err && err.message ? err.message : "falha na chamada"
      ),
      modo: "resposta_leve_fallback",
      dados: {
        gerador: "fallback",
        mreInvocado: false,
        motorAcionado: false,
        erro: err && err.message ? err.message : String(err)
      }
    };
  }
}
