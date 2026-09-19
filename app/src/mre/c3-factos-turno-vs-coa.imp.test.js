/**
 * C3 — factos explícitos do turno vs short-circuit COA/Painel (isolamento).
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  calcularShortCircuitNcs,
  ehLacunaInstitucionalCoaPainel,
  factosTurnoCobremAnaliseSemCoaPainel,
  soLacunasInstitucionaisCoaPainel,
  temFactosMateriaisDoUtilizador
} from "./ncs/politicas.js";
import { PREFIXO_FACTO_UTILIZADOR } from "./factosTurnoUtilizador.js";
import { garantirDisciplinaLastroInsuficiente } from "../conscienciaOperacional/disciplinaLastroInsuficiente.js";
import {
  ajustarParecerSobFactosTurno,
  montarEntradaMre
} from "./integracaoNucleo.js";
import { executarPipeline07 } from "./pipeline/orquestrador.js";
import { criarChamarLlmMock, mapaLlmFluxoFeliz } from "./pipeline/llmMock.js";
import { estagio2Dossier } from "./pipeline/estagios.js";

const MSG_C3 =
  "Analise apenas a situação: orçamento exclusivo R$ 1.337.000 e fornecedor exclusivo NorteAzul Ltda. Faça só análise. Não dê recomendação, não diga aprovar/modificar/não priorizar.";

const FACTOS = [
  `${PREFIXO_FACTO_UTILIZADOR} orçamento exclusivo R$ 1.337.000 e fornecedor exclusivo NorteAzul Ltda`
];

describe("C3 helpers institucionais vs factos turno", () => {
  test("detecta lacunas COA/Painel e factos do utilizador", () => {
    assert.equal(ehLacunaInstitucionalCoaPainel("COA ativo ausente"), true);
    assert.equal(
      ehLacunaInstitucionalCoaPainel("Painel executivo ausente ou vazio"),
      true
    );
    assert.equal(ehLacunaInstitucionalCoaPainel("orçamento Q3"), false);
    assert.equal(temFactosMateriaisDoUtilizador(FACTOS), true);
    assert.equal(
      soLacunasInstitucionaisCoaPainel([
        "COA ativo ausente",
        "Painel executivo ausente ou vazio"
      ]),
      true
    );
  });

  test("short-circuit NÃO dispara com factos do turno + só COA/Painel", () => {
    const lacunas = [];
    const entrada = {
      mensagem: MSG_C3,
      coaId: null,
      snapshotPainel: null,
      factosOficiais: FACTOS
    };
    estagio2Dossier(entrada, lacunas);
    assert.ok(lacunas.some((l) => /COA/i.test(l)));
    assert.equal(
      factosTurnoCobremAnaliseSemCoaPainel(
        entrada,
        lacunas,
        { tipoPedido: "decisao" }
      ),
      true
    );
    assert.equal(
      calcularShortCircuitNcs(entrada, lacunas, { tipoPedido: "decisao" }, null),
      false
    );
  });

  test("short-circuit MANTÉM sem factos do turno (fail-closed institucional)", () => {
    const lacunas = ["COA ativo ausente", "Painel executivo ausente ou vazio"];
    const entrada = {
      mensagem: "Qual o estado do projecto?",
      coaId: null,
      snapshotPainel: null,
      factosOficiais: []
    };
    assert.equal(
      calcularShortCircuitNcs(entrada, lacunas, { tipoPedido: "decisao" }, null),
      true
    );
  });
});

describe("C3 pipeline + disciplina + ajuste parecer", () => {
  test("pipeline: sem COA/Painel mas com factos → analisa (não short-circuit)", async () => {
    const r = await executarPipeline07(
      {
        mensagem: MSG_C3,
        coaId: null,
        snapshotPainel: null,
        factosOficiais: FACTOS,
        intencao: { id: "analisar", capacidade: "ia" }
      },
      {
        chamarLlm: criarChamarLlmMock({
          ...mapaLlmFluxoFeliz(),
          "4_analise": {
            analise:
              "Orçamento exclusivo R$ 1.337.000 com fornecedor NorteAzul Ltda. Análise situacional sem recomendação prescritiva."
          },
          "6_decisao": {
            estado: "monitorar",
            recomendacao: "Continuar a análise dos factos do turno",
            alternativas: [],
            justificativa:
              "Factos do utilizador cobrem o pedido; princípios de transparência."
          }
        }),
        pedidoAnaliseDeliberativa: true
      }
    );
    assert.equal(r.falhaControlada, false);
    assert.equal(r.parcial.shortCircuit, false);
    assert.match(String(r.parcial.analise || ""), /1\.337\.000|NorteAzul/i);
    assert.notEqual(r.parcial.decisaoExecutiva.estado, "solicitar_dados");
  });

  test("disciplina: factos turno + só COA/Painel → não aplica wipe", () => {
    const out = garantirDisciplinaLastroInsuficiente("Análise: NorteAzul e 1.337.000", {
      factosOficiais: FACTOS,
      parecer: {
        lacunas: ["COA ativo ausente", "Painel executivo ausente ou vazio"],
        decisaoExecutiva: { estado: "solicitar_dados" }
      },
      instrucao: MSG_C3
    });
    assert.equal(out.aplicada, false);
    assert.equal(out.motivo, "factos_turno_sem_lacuna_material_nomeada");
    assert.match(out.mensagem, /NorteAzul/);
  });

  test("ajustarParecerSobFactosTurno: solicitar_dados institucional → monitorar", () => {
    const p = ajustarParecerSobFactosTurno(
      {
        lacunas: ["COA ativo ausente", "Painel executivo ausente ou vazio"],
        decisaoExecutiva: {
          estado: "solicitar_dados",
          recomendacao: "",
          justificativa: "x"
        },
        analise: "Orçamento R$ 1.337.000 NorteAzul",
        acao: { tipo: "perguntar", descricao: "pedir COA" }
      },
      FACTOS
    );
    assert.equal(p.decisaoExecutiva.estado, "monitorar");
    assert.equal(p.lacunas.length, 0);
  });

  test("montarEntradaMre (isolamento): extrai factos do enunciado C3", () => {
    const entrada = montarEntradaMre({
      instrucao: MSG_C3,
      historico: [],
      coaAtivo: null,
      memoria: null
    });
    assert.equal(entrada.coaId, null);
    assert.equal(entrada.snapshotPainel, null);
    assert.ok(
      (entrada.factosOficiais || []).some((f) =>
        String(f).includes(PREFIXO_FACTO_UTILIZADOR)
      )
    );
    assert.ok(
      (entrada.factosOficiais || []).some((f) =>
        /1\.337\.000|NorteAzul/i.test(String(f))
      )
    );
  });
});
