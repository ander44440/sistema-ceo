/**
 * CONSULTA situacional no caminho REAL (capacidadeIa) — não LLM rápido.
 */
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { capacidadeIa } from "./ia.js";
import { avaliarComplexidadeDecisao } from "../complexidadeDecisao.js";
import { flagMre } from "../../mre/roteamentoDeliberativo.js";
import { detectarPedidoConsultaResposta } from "../../mre/politicaAnaliseDeliberativa.js";
import { detectarPedidoDecisaoExplicita } from "../../classificadorIntencao/pedidoDecisaoExplicita.js";
import { reiniciarStoresPosDeliberacaoParaTestes } from "../../mre/integracaoNucleo.js";

const PERGUNTA_4 =
  "Em que etapa estamos?\nO que acabamos de concluir?\nO que estamos fazendo agora?\nQual deveria ser o próximo passo?";

beforeEach(() => {
  reiniciarStoresPosDeliberacaoParaTestes();
  flagMre.ativo = true;
});

describe("P5c CONSULTA — caminho real capacidadeIa", () => {
  it("complexidade da pergunta 4 é moderado, mas continua CONSULTA", () => {
    const cx = avaliarComplexidadeDecisao({
      texto: PERGUNTA_4,
      classe: "conversa_projeto",
      destino: "nucleo_mre",
      intencao: {
        id: "deliberar_objetivo",
        classe: "conversa_projeto",
        destino: "nucleo_mre"
      },
      frenteActiva: true
    });
    assert.equal(cx.nivel, "moderado");
    assert.equal(cx.permiteMreCompleto, false);
    assert.equal(detectarPedidoConsultaResposta(PERGUNTA_4), true);
  });

  it("UI-path: pergunta 4 NÃO vai a deliberativa-rapida; usa snapshot", async () => {
    const lastroGenerico = {
      temContextoRelevante: true,
      factosOficiais: [
        "Estado operacional: Atenção",
        "Estado Executivo — Frente activa: MG2"
      ],
      memoriaTrabalhoExecutiva: {
        hierarquia: { entregaCorrente: "fase de continuidade" },
        estadoConversa: { emExecucao: "Atenção" },
        proximaAcao: "Atenção",
        decisoesTomadas: ["Estado operacional Atenção"],
        pendencias: ["pendências sobre riscos e papel do usuário"]
      },
      contagens: { gatesPendentes: 0, jobsEmExecucao: 0 }
    };

    const out = await capacidadeIa.executar({
      instrucao: PERGUNTA_4,
      historico: [
        {
          papel: "usuario",
          texto: "Criar a V1 de resolução de precedência"
        },
        {
          papel: "ceo",
          texto: "Precedência V1 implementada e testes aprovados."
        },
        {
          papel: "usuario",
          texto: "Corrigir CONSULTA → RESPONDER e Snapshot Situacional"
        },
        {
          papel: "ceo",
          texto: "Snapshot situacional ligado no caminho factual."
        }
      ],
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto",
        destino: "nucleo_mre"
      },
      consultaNaoEAcao: true,
      tipoTurno: "consulta",
      lastroConsciencia: lastroGenerico,
      memoria: () => ({})
    });

    assert.equal(out.ok, true);
    assert.equal(out.dados?.rota, "consulta_situacional_snapshot");
    assert.equal(out.modo, "consulta-snapshot-sem-llm");
    assert.equal(out.dados?.complexidadeDecisao?.forcarMreConsulta, true);
    assert.ok(out.dados?.snapshotSituacional);
    assert.doesNotMatch(String(out.dados?.rota || ""), /deliberativa-rapida/);
    assert.doesNotMatch(out.mensagem, /fase de continuidade/);
    assert.doesNotMatch(out.mensagem, /Estado operacional Atenção/);
    assert.doesNotMatch(out.mensagem, /pendências sobre riscos/);
    assert.match(
      out.mensagem,
      /Sessão|precedência|Snapshot|LACUNA|evidência recente|Etapa/i
    );
  });

  it("sem evidência de sessão: lacuna honesta, não Atenção/continuidade", async () => {
    const out = await capacidadeIa.executar({
      instrucao: PERGUNTA_4,
      historico: [],
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto",
        destino: "nucleo_mre"
      },
      lastroConsciencia: {
        temContextoRelevante: true,
        factosOficiais: ["Estado operacional: Atenção"],
        memoriaTrabalhoExecutiva: {
          hierarquia: { entregaCorrente: "fase de continuidade" },
          estadoConversa: { emExecucao: "Atenção" },
          proximaAcao: "Atenção"
        }
      },
      memoria: () => ({})
    });

    assert.equal(out.dados?.rota, "consulta_situacional_snapshot");
    assert.match(
      out.mensagem,
      /evidência recente insuficiente|Informação ausente|LACUNA/i
    );
    assert.doesNotMatch(out.mensagem, /fase de continuidade/);
    assert.doesNotMatch(out.mensagem, /Estado operacional Atenção/);
  });

  it("DECISÃO explícita não é forçada como CONSULTA (regressão)", () => {
    const msg = "Decide entre Alfa e Beta com os factos actuais.";
    assert.equal(detectarPedidoDecisaoExplicita(msg), true);
    assert.equal(detectarPedidoConsultaResposta(msg), false);
  });

  it("«onde paramos?» → CONSULTA situacional (snapshot; evidência de sessão)", async () => {
    assert.equal(detectarPedidoConsultaResposta("onde paramos?"), true);

    const out = await capacidadeIa.executar({
      instrucao: "onde paramos?",
      historico: [
        {
          papel: "usuario",
          texto: "Fechar a rota de retoma conversacional"
        },
        {
          papel: "ceo",
          texto: "Retoma alinhada ao snapshot situacional com evidência do fio."
        }
      ],
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto",
        destino: "nucleo_mre"
      },
      lastroConsciencia: {
        temContextoRelevante: true,
        factosOficiais: ["Estado operacional: Atenção"],
        memoriaTrabalhoExecutiva: {
          hierarquia: { entregaCorrente: "fase de continuidade" },
          estadoConversa: { emExecucao: "Atenção" },
          proximaAcao: "Atenção"
        }
      },
      memoria: () => ({})
    });

    assert.equal(out.ok, true);
    assert.equal(out.dados?.rota, "consulta_situacional_snapshot");
    assert.equal(out.modo, "consulta-snapshot-sem-llm");
    assert.ok(out.dados?.snapshotSituacional);
    assert.doesNotMatch(out.mensagem, /fase de continuidade/);
    assert.doesNotMatch(out.mensagem, /Estado operacional Atenção/);
    assert.match(
      out.mensagem,
      /Sessão|retoma|snapshot|LACUNA|evidência recente|Etapa/i
    );
  });
});
