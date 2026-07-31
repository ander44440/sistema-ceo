/**
 * Capacidade: IA — motor de deliberação.
 * Rotas determinísticas locais; deliberativas via MRE + Speaker (Bloco 2).
 */
import {
  citacaoCurta,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import { obterCoaAtivo } from "../coaSessao.js";
import { obterResumoIdentidadeCeo } from "../constituicaoCeo.js";
import { montarMensagensLlm } from "../promptGovernanca.js";
import { deliberarComLlm, obterStatusLlm } from "../llmCliente.js";
import {
  ehRotaDeliberativa,
  executarRotaDeliberativa
} from "../../mre/integracaoNucleo.js";
import { flagMre } from "../../mre/roteamentoDeliberativo.js";

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
      if (/bom dia/.test(t)) return "Bom dia. Estou online — em que posso avançar consigo agora?";
      if (/boa tarde/.test(t)) return "Boa tarde. Estou online — em que posso avançar consigo agora?";
      if (/boa noite/.test(t)) return "Boa noite. Estou online — em que posso avançar consigo agora?";
      return "Olá. Estou online — em que posso avançar consigo agora?";
    }
    default:
      return null;
  }
}

function fallbackSemLlm(texto, motivo) {
  return (
    `Quero responder com fluidez a «${citacaoCurta(texto)}», mas o motor de linguagem ainda não está disponível (${motivo}).\n\n` +
    "Configure `CEO_LLM_API_KEY` em `app/.env` (veja `.env.example`), reinicie `npm run dev`, e volte a tentar.\n\n" +
    "Enquanto isso, posso ajudar com: data/hora, estado atual da sessão, projetos e navegação."
  );
}

export const capacidadeIa = Object.freeze({
  id: "ia",
  nome: "IA",
  descricao: "Motor de deliberação e interpretação semântica.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);
    const intencao = ctx.intencao || {};
    const coa = obterCoaAtivo();

    if (!texto) {
      return {
        ok: true,
        capacidade: "ia",
        mensagem: "Não recebi instrução. Envie uma pergunta ou um objetivo concreto.",
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
          rota: "deterministica"
        }
      };
    }

    if (ehRotaDeliberativa(intencao) && flagMre.ativo) {
      const status = await obterStatusLlm();
      if (!status || !status.configurado) {
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
            rota: "deliberativa-sem-llm"
          }
        };
      }

      try {
        const mreOut = await executarRotaDeliberativa(
          { ...ctx, coaAtivo: coa },
          { canal: ctx.canalSpeaker || "chat" }
        );
        return {
          ...mreOut,
          capacidade: "ia",
          dados: {
            ...(mreOut.dados || {}),
            instrucao: texto,
            intencao,
            memoria: mem,
            coa,
            llm: status
          }
        };
      } catch (err) {
        return {
          ok: true,
          capacidade: "ia",
          mensagem: fallbackSemLlm(
            texto,
            err && err.message ? err.message : "falha no MRE"
          ),
          modo: "fallback",
          dados: {
            instrucao: texto,
            intencao,
            memoria: mem,
            coa,
            erro: err && err.message,
            rota: "deliberativa-erro"
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
          rota: "legado"
        }
      };
    }

    try {
      const messages = montarMensagensLlm({
        instrucao: texto,
        historico: ctx.historico || [],
        memoria: mem,
        coa,
        intencao
      });

      const saida = await deliberarComLlm({ messages, temperature: 0.45 });

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
          rota: "legado-erro"
        }
      };
    }
  }
});
