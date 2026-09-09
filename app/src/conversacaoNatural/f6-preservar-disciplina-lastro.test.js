/**
 * F6 P0 — Preservar fail-closed após Conversação Natural (H1–H3).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE,
  garantirDisciplinaLastroInsuficiente
} from "../conscienciaOperacional/disciplinaLastroInsuficiente.js";
import { naturalizarRespostaNucleo } from "./index.js";
import { TIPO_TURNO } from "./tiposTurno.js";

const INVENTARIO =
  "O outdoor do Centro está 100% pago e a sprint 9 fechou com sucesso total.";

function parecerInventivo(estado = "solicitar_dados") {
  return {
    decisaoExecutiva: {
      estado,
      recomendacao: INVENTARIO,
      justificativa: INVENTARIO,
      alternativas: []
    },
    lacunas: estado === "solicitar_dados" ? ["orçamento Q3"] : [],
    analise: INVENTARIO,
    diagnostico: { objetivoReal: "decidir outdoor" },
    acao: { tipo: "comunicar", descricao: "Aprovar outdoor com base no inventário" },
    confianca: 0.3,
    riscos: [],
    oportunidades: []
  };
}

function contarPrefixo(texto) {
  const re = new RegExp(
    PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    ),
    "gi"
  );
  return (String(texto || "").match(re) || []).length;
}

test("H1: fail-closed ponta a ponta — CN não reintroduz inventário do parecer", () => {
  const disc = garantirDisciplinaLastroInsuficiente(INVENTARIO, {
    factosOficiais: ["LASTRO INSUFICIENTE: orçamento não confirmado"],
    parecer: parecerInventivo("solicitar_dados"),
    pedidoConsulta: false
  });
  assert.equal(disc.aplicada, true);
  assert.ok(disc.mensagem.includes(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE));
  assert.ok(!/outdoor do Centro|sprint 9/i.test(disc.mensagem));

  const bruto = {
    ok: true,
    mensagem: disc.mensagem,
    modo: "mre",
    capacidade: "ia",
    dados: {
      parecer: parecerInventivo("solicitar_dados"),
      disciplinaLastro: disc,
      instrucao: "Decide o orçamento do outdoor"
    }
  };

  const out = naturalizarRespostaNucleo(bruto, {
    instrucao: "Decide o orçamento do outdoor",
    historico: []
  });

  assert.equal(out.dados.disciplinaLastro.aplicada, true);
  assert.equal(out.dados.conversacaoNatural.tipoTurno, TIPO_TURNO.SISTEMA);
  assert.ok(
    out.mensagem.includes(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE),
    "prefixo de insuficiência deve permanecer"
  );
  assert.ok(
    !/outdoor do Centro|sprint 9|100% pago|sucesso total/i.test(out.mensagem),
    "inventário do parecer não pode reaparecer"
  );
  assert.equal(
    out.mensagem.trim(),
    disc.mensagem.trim(),
    "mensagem final deve ser a fail-closed do Núcleo"
  );
});

test("H1b: mesmo com estado decidir — CN preserva fail-closed", () => {
  const disc = garantirDisciplinaLastroInsuficiente(INVENTARIO, {
    factosOficiais: ["LASTRO INSUFICIENTE: lacuna material"],
    parecer: parecerInventivo("decidir"),
    pedidoConsulta: false
  });
  assert.equal(disc.aplicada, true);

  const out = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: disc.mensagem,
      modo: "mre",
      dados: {
        parecer: parecerInventivo("decidir"),
        disciplinaLastro: disc,
        instrucao: "Qual o status do outdoor?"
      }
    },
    { instrucao: "Qual o status do outdoor?", historico: [] }
  );

  assert.equal(out.dados.disciplinaLastro.aplicada, true);
  assert.ok(out.mensagem.includes(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE));
  assert.ok(!/outdoor do Centro|sprint 9/i.test(out.mensagem));
});

test("H2: sem disciplina aplicada — CN deliberativa permanece", () => {
  const parecer = {
    decisaoExecutiva: {
      estado: "decidir",
      recomendacao: "Priorizar a sprint 10 com o critério já aprovado.",
      justificativa: "Há lastro suficiente no estado operacional.",
      alternativas: []
    },
    lacunas: [],
    analise: "Com o lastro disponível, a prioridade é a sprint 10.",
    diagnostico: { objetivoReal: "priorizar sprint" },
    acao: { tipo: "comunicar", descricao: "Priorizar sprint 10" },
    confianca: 0.85,
    riscos: [],
    oportunidades: []
  };

  const out = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: "Prosa preliminar do speaker.",
      modo: "mre",
      dados: {
        parecer,
        disciplinaLastro: {
          aplicada: false,
          motivo: "sem_sinal_explicito",
          sinal: null
        },
        instrucao: "O que priorizamos na sprint?"
      }
    },
    { instrucao: "O que priorizamos na sprint?", historico: [] }
  );

  assert.equal(out.dados.disciplinaLastro.aplicada, false);
  assert.notEqual(out.dados.conversacaoNatural.tipoTurno, TIPO_TURNO.SISTEMA);
  assert.ok(
    !out.mensagem.includes(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE),
    "caminho normal não deve injectar fail-closed"
  );
  assert.ok(
    /sprint 10|Priorizar/i.test(out.mensagem),
    "CN deve continuar a compor a partir do parecer"
  );
});

test("H2b: disciplinaLastro ausente — CN deliberativa permanece", () => {
  const parecer = parecerInventivo("decidir");
  parecer.decisaoExecutiva.recomendacao = "Manter o plano vigente.";
  parecer.analise = "Plano vigente confirmado.";
  parecer.acao.descricao = "Manter o plano";

  const out = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: "Prosa preliminar.",
      modo: "mre",
      dados: {
        parecer,
        instrucao: "Seguimos com o plano?"
      }
    },
    { instrucao: "Seguimos com o plano?", historico: [] }
  );

  assert.equal(out.dados.disciplinaLastro, undefined);
  assert.notEqual(out.dados.conversacaoNatural.tipoTurno, TIPO_TURNO.SISTEMA);
  assert.ok(/plano/i.test(out.mensagem));
});

test("H3: idempotência — segunda passagem CN sem duplicar prefixo nem reconstruir parecer", () => {
  const disc = garantirDisciplinaLastroInsuficiente(INVENTARIO, {
    factosOficiais: ["LASTRO INSUFICIENTE: dados em falta"],
    parecer: parecerInventivo("solicitar_dados"),
    pedidoConsulta: false
  });
  assert.equal(disc.aplicada, true);

  const bruto = {
    ok: true,
    mensagem: disc.mensagem,
    modo: "mre",
    dados: {
      parecer: parecerInventivo("solicitar_dados"),
      disciplinaLastro: disc,
      instrucao: "Fecha a decisão"
    }
  };

  const uma = naturalizarRespostaNucleo(bruto, {
    instrucao: "Fecha a decisão",
    historico: []
  });
  const duas = naturalizarRespostaNucleo(uma, {
    instrucao: "Fecha a decisão",
    historico: []
  });

  assert.equal(duas.dados.disciplinaLastro.aplicada, true);
  assert.equal(contarPrefixo(duas.mensagem), 1);
  assert.ok(!/outdoor do Centro|sprint 9/i.test(duas.mensagem));
  assert.equal(duas.mensagem.trim(), uma.mensagem.trim());
});
