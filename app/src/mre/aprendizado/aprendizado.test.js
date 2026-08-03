/**
 * Testes IMP-013 — Aprendizado Executivo estágio 8 (T13-01…T13-10).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aplicarPrincipiosProibido,
  avaliarAprendizado,
  criarChamarLlmMock,
  executarDeliberacaoMre,
  mapaLlmFluxoFeliz,
  montarPlanoRetencao,
  validarParecerExecutivo
} from "../index.js";

function parcialBase(extra = {}) {
  return {
    coaId: "coa-mg2",
    confianca: 0.82,
    lacunas: [],
    diagnostico: {
      objetivoReal: "Priorizar pagamento",
      problemaNegocio: "Conflito de foco",
      natureza: "tatica"
    },
    enquadramento: {
      tipoPedido: "decisao",
      urgencia: "media",
      escopo: "Sprint atual"
    },
    dossier: {
      resumoPainel: "Painel ok",
      factosUsados: ["Pagamento prioritário"],
      fontes: ["painel"]
    },
    principiosAplicados: ["Priorizar uso diário no MG2 (ADR-015)"],
    analise: "Foco no pagamento",
    riscos: [{ nivel: "medio", texto: "Atraso visual" }],
    oportunidades: [{ valor: "alto", texto: "Receita" }],
    decisaoExecutiva: {
      estado: "aprovar",
      recomendacao: "Adiar outdoor",
      alternativas: [],
      justificativa:
        "Princípio Priorizar uso diário no MG2 (ADR-015); risco medio aceite."
    },
    acao: { tipo: "orientar", descricao: "Focar pagamento", job: null },
    ...extra
  };
}

test("T13-01: despacho → registrarMemoria true (M2)", () => {
  const a = avaliarAprendizado(
    parcialBase({
      acao: {
        tipo: "despachar",
        descricao: "Fila",
        job: { titulo: "X", descricao: "Y" }
      },
      decisaoExecutiva: {
        estado: "delegar",
        recomendacao: "Delegar",
        alternativas: [],
        justificativa: "Princípio Priorizar uso diário no MG2 (ADR-015); risco medio."
      }
    })
  );
  assert.equal(a.registrarMemoria, true);
});

test("T13-02: solicitar_dados sem factos novos → registrarMemoria false", () => {
  const a = avaliarAprendizado(
    parcialBase({
      lacunas: ["Falta orçamento"],
      confianca: 0.3,
      dossier: { resumoPainel: "Sem painel", factosUsados: [], fontes: [] },
      decisaoExecutiva: {
        estado: "solicitar_dados",
        recomendacao: "Pedir dados",
        alternativas: [],
        justificativa: "Sem riscos materiais identificados; pedir dados."
      },
      acao: { tipo: "perguntar", descricao: "Perguntar orçamento", job: null }
    })
  );
  assert.equal(a.registrarMemoria, false);
});

test("T13-03: adiar/solicitar_dados → criarPrecedente false", () => {
  const a1 = avaliarAprendizado(
    parcialBase({
      decisaoExecutiva: {
        estado: "adiar",
        recomendacao: "Adiar",
        alternativas: [],
        justificativa: "Sem riscos materiais identificados; adiar."
      },
      acao: { tipo: "aguardar", descricao: "Aguardar", job: null }
    })
  );
  assert.equal(a1.criarPrecedente, false);

  const a2 = avaliarAprendizado(
    parcialBase({
      lacunas: ["x"],
      decisaoExecutiva: {
        estado: "solicitar_dados",
        recomendacao: "Pedir",
        alternativas: [],
        justificativa: "Sem riscos materiais identificados."
      },
      acao: { tipo: "perguntar", descricao: "Perguntar", job: null }
    })
  );
  assert.equal(a2.criarPrecedente, false);
});

test("T13-04: estratégica/tática + aprovar + confiança alta → precedente elegível", () => {
  const a = avaliarAprendizado(parcialBase({ confianca: 0.9, lacunas: [] }));
  assert.equal(a.criarPrecedente, true);
});

test("T13-05: sem tensão de princípios → atualizarPrincipios false", () => {
  const a = avaliarAprendizado(parcialBase());
  assert.equal(a.atualizarPrincipios, false);
  assert.equal(a.propostaPrincipio, undefined);
});

test("T13-06: tensão R1–R4 → proposta + plano pendente_gate", () => {
  const a = avaliarAprendizado(parcialBase(), {
    tensaoPrincipios: true,
    propostaPrincipio:
      "Sempre que polish visual competir com desbloqueio operacional do MG2, priorizar o desbloqueio.",
    propostaGeral: true,
    semAlternativaMemoriaPrecedente: true
  });
  assert.equal(a.atualizarPrincipios, true);
  assert.ok(a.propostaPrincipio.length > 10);
  const plano = montarPlanoRetencao("p-1", a);
  assert.ok(plano.efeitos.includes("abrir_proposta_principio"));
  assert.equal(plano.estadoHomologacaoPrincipio, "pendente_gate");
});

test("T13-07: aplicar princípios é proibido (H1)", () => {
  assert.throws(() => aplicarPrincipiosProibido(), (err) => err.codigo === "H1_PROIBIDO");
});

test("T13-08: aprendizado não muta decisão/ação", async () => {
  const out = await executarDeliberacaoMre(
    {
      mensagem: "Adiar outdoor?",
      coaId: "coa-mg2",
      snapshotPainel: { resumo: "ok" },
      factosOficiais: ["f1"],
      intencao: { id: "deliberar" }
    },
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  assert.equal(out.parecer.decisaoExecutiva.estado, "aprovar");
  assert.ok(out.parecer.acao);
  assert.equal(out.ok, true);
});

test("T13-09: parecer final passa validador IMP-011", async () => {
  const out = await executarDeliberacaoMre(
    {
      mensagem: "Adiar outdoor e focar pagamento",
      coaId: "coa-mg2",
      snapshotPainel: { resumo: "Painel MG2" },
      factosOficiais: ["Pagamento prioritário"],
      intencao: { id: "deliberar" }
    },
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  const v = validarParecerExecutivo(out.parecer);
  assert.equal(v.ok, true, JSON.stringify(v.violacoes, null, 2));
  assert.equal(out.ok, true);
});

test("T13-10: atualizarPrincipios sem proposta não é emitido pelo avaliador", () => {
  const a = avaliarAprendizado(parcialBase(), {
    tensaoPrincipios: true,
    propostaPrincipio: "",
    propostaGeral: true,
    semAlternativaMemoriaPrecedente: true
  });
  assert.equal(a.atualizarPrincipios, false);
});
