/**
 * ADR-022 CM12 — LFC activo + lacuna genérica não dispara wipe de disciplina.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  garantirDisciplinaLastroInsuficiente,
  temFactosLfcActivosNoTurno,
  soLacunasGenericasEssenciais
} from "../conscienciaOperacional/disciplinaLastroInsuficiente.js";
import { ajustarParecerSobLfcActivo } from "../mre/integracaoNucleo.js";
import { PREFIXO_FACTO_LFC } from "../mre/consumoLfcMre.js";

const LFC = [
  `${PREFIXO_FACTO_LFC} margem líquida caiu de 8% para 4%`,
  `${PREFIXO_FACTO_LFC} custo das matérias-primas subiu 15%`
];

test("CM12: LFC + lacuna genérica → disciplina não aplica wipe", () => {
  assert.equal(temFactosLfcActivosNoTurno(LFC), true);
  assert.equal(
    soLacunasGenericasEssenciais(["Informação essencial não especificada"]),
    true
  );
  const out = garantirDisciplinaLastroInsuficiente("prosa inventiva do speaker", {
    factosOficiais: LFC,
    parecer: {
      lacunas: ["Informação essencial não especificada"],
      decisaoExecutiva: { estado: "solicitar_dados" }
    },
    instrucao: "qual a principal preocupação?"
  });
  assert.equal(out.aplicada, false);
  assert.equal(out.motivo, "lfc_activo_sem_lacuna_material_nomeada");
  assert.match(out.mensagem, /prosa inventiva/i);
});

test("CM12: LFC + lacuna nomeada → disciplina continua", () => {
  const out = garantirDisciplinaLastroInsuficiente("prosa", {
    factosOficiais: LFC,
    parecer: {
      lacunas: ["orçamento Q3 não confirmado"],
      decisaoExecutiva: { estado: "solicitar_dados" }
    }
  });
  assert.equal(out.aplicada, true);
  assert.equal(out.motivo, "parecer_solicitar_dados");
});

test("ajustarParecerSobLfcActivo: solicitar_dados genérico → monitorar", () => {
  const p = ajustarParecerSobLfcActivo(
    {
      lacunas: ["Informação essencial não especificada"],
      decisaoExecutiva: {
        estado: "solicitar_dados",
        recomendacao: "",
        justificativa: "x"
      },
      diagnostico: { objetivoReal: "preocupação" },
      analise: "a",
      confianca: 0.7,
      acao: { tipo: "perguntar", descricao: "pedir dados" }
    },
    LFC
  );
  assert.equal(p.decisaoExecutiva.estado, "monitorar");
  assert.equal(p.acao.tipo, "aguardar");
  assert.equal(p.lacunas.length, 0);
  assert.match(p.decisaoExecutiva.recomendacao, /margem|LFC|custos/i);
});
