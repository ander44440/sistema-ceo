/**
 * Diagnóstico: a mensagem craft.do chegou ao MRE?
 * node scripts/diag-rota-mensagem.mjs
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

globalThis.localStorage = {
  _m: new Map(),
  getItem(k) {
    return this._m.has(k) ? this._m.get(k) : null;
  },
  setItem(k, v) {
    this._m.set(k, String(v));
  },
  removeItem(k) {
    this._m.delete(k);
  }
};

const MENSAGEM =
  process.argv[2] ||
  "Entre no repositório https://agents.craft.do/, analise a solução e produza um parecer executivo sobre o quanto ela pode contribuir para a evolução do projeto CEO. Considere benefícios, riscos, limitações, impacto arquitetural e uma recomendação final.";

async function main() {
  const { classificarIntencao, normalizarTexto } = await import(
    pathToFileURL(path.join(root, "src/executiveEngine/classificar.js")).href
  );
  const { ehRotaDeliberativa, flagMre } = await import(
    pathToFileURL(path.join(root, "src/mre/roteamentoDeliberativo.js")).href
  );
  const { executiveEngine } = await import(
    pathToFileURL(path.join(root, "src/executiveEngine/index.js")).href
  );

  // Observar se o pipeline LLM é atingido (proxy do início do MRE)
  let pipelineIniciado = false;
  let llmCalls = 0;

  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    let u = String(url);
    if (u.startsWith("/")) u = `http://localhost:5173${u}`;
    if (u.includes("/api/ceo/llm-status")) {
      return {
        ok: true,
        json: async () => ({ ok: true, configurado: true, modelo: "diag-stub" })
      };
    }
    if (u.includes("/api/ceo/deliberar")) {
      pipelineIniciado = true;
      llmCalls += 1;
      const estagio = (() => {
        try {
          const body = JSON.parse(opts?.body || "{}");
          const user = body.messages?.find((m) => m.role === "user");
          return JSON.parse(user?.content || "{}").estagio || "desconhecido";
        } catch {
          return "desconhecido";
        }
      })();
      const payloads = {
        "0_diagnostico": {
          objetivoReal: "Avaliar contribuição do Craft Agents ao CEO",
          problemaNegocio: "Avaliar ferramenta externa",
          natureza: "operacional"
        },
        "1_enquadramento": {
          tipoPedido: "decisao",
          urgencia: "media",
          escopo: "Craft Agents vs evolução CEO"
        },
        "3_principios": {
          principiosAplicados: ["Respeito absoluto ao tempo do utilizador"]
        },
        "4_analise": { analise: "Análise diagnóstica stub." },
        "5a_riscos": {
          riscos: [
            {
              nivel: "medio",
              texto: "Dependência externa",
              mitigacao: "Avaliar contrato"
            }
          ]
        },
        "5b_oportunidades": {
          oportunidades: [{ valor: "medio", texto: "Acelerar agentes" }]
        },
        "6_decisao": {
          estado: "monitorar",
          recomendacao: "Monitorar Craft Agents sem adoção imediata",
          alternativas: ["Adiar", "Piloto"],
          justificativa:
            "Sem riscos materiais inventados; princípios de cautela aplicados."
        },
        "7_acao_job": {
          descricao: "Abrir nota de avaliação Craft Agents",
          job: {
            titulo: "Avaliar Craft Agents",
            descricao: "Nota executiva",
            prioridade: "normal"
          }
        }
      };
      const obj = payloads[estagio] || payloads["0_diagnostico"];
      return {
        ok: true,
        json: async () => ({
          ok: true,
          texto: JSON.stringify(obj),
          modelo: "diag-stub"
        })
      };
    }
    if (typeof origFetch === "function") return origFetch(u, opts);
    throw new Error(`fetch não mockado: ${u}`);
  };

  const textoNorm = normalizarTexto(MENSAGEM);
  const intencao = classificarIntencao(MENSAGEM);
  const deliberativa = ehRotaDeliberativa(intencao);

  const saudacaoHit =
    /^(ol[aá]|oi|bom dia|boa tarde|boa noite|hey|hello)([!. ]|$)/.test(textoNorm) ||
    /^(ol[aá]|oi|bom dia|boa tarde|boa noite)\b/.test(textoNorm);

  const pre = {
    mensagemRecebidaPeloMotor: MENSAGEM,
    normalizada: textoNorm.slice(0, 160),
    classificador: intencao,
    saudacaoRegexHit: saudacaoHit,
    flagMre: flagMre.ativo,
    ehRotaDeliberativa: deliberativa,
    caminhoEsperado:
      intencao.id === "saudacao"
        ? "INTERRUPT: ia.respostaLocal(saudacao) — executarDeliberacao NÃO chamado; pipeline 0–8 NÃO inicia"
        : deliberativa && flagMre.ativo
          ? "MRE: executarRotaDeliberativa → executarDeliberacaoMre → pipeline 0–8"
          : "outro caminho determinístico/fallback"
  };

  const resp = await executiveEngine.executar({ texto: MENSAGEM, historico: [] });
  const pos = {
    respostaMensagem: String(resp.mensagem || "").slice(0, 240),
    intencaoNaResposta: resp.intencao,
    modo: resp.modo,
    rota: resp.dados?.rota,
    mrePresente: Boolean(resp.dados?.mre || resp.dados?.parecer),
    parecerId: resp.dados?.parecer?.id || null,
    pipelineIniciadoViaLlm: pipelineIniciado,
    llmCalls,
    executarDeliberacaoInferido: pipelineIniciado || Boolean(resp.dados?.parecer)
  };

  console.log(JSON.stringify({ pre, pos }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
