/**
 * IMP-070 B5 / REQ-072 — Porta de recuperação EIC.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import {
  PORTA_RECUPERACAO_ID,
  factosViaPorta,
  solicitarLastroConhecimento
} from "./portaRecuperacao.js";
import {
  LACUNA_SEM_ITEM_APTO,
  carregarItensAcervoParaTestes,
  reiniciarAcervoParaTestes
} from "./fonteOficial.js";
import { montarEntradaMre } from "../mre/integracaoNucleo.js";
import { montarMensagensLlm } from "../executiveEngine/promptGovernanca.js";

const __dir = dirname(fileURLToPath(import.meta.url));

beforeEach(() => {
  reiniciarAcervoParaTestes();
});

test("CA-072-2: entrada exige contexto/COA e necessidade", () => {
  const semNec = solicitarLastroConhecimento({
    contextoTrabalho: { id: "prj-mg2" }
  });
  assert.equal(semNec.ok, false);
  assert.equal(semNec.erro, "necessidade_obrigatoria");

  const ok = solicitarLastroConhecimento({
    coa: { id: "prj-mg2" },
    necessidade: "lastro para deliberar Sprint 1"
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.necessidade, "lastro para deliberar Sprint 1");
  assert.equal(ok.ambitoCoa, "prj-mg2");
  assert.equal(ok.porta, PORTA_RECUPERACAO_ID);
  assert.equal(ok.unicaSuperficieLeitura, true);
});

test("CA-072-3: só aptos + lacuna; zero não apto como válido", () => {
  carregarItensAcervoParaTestes([
    {
      id: "KNW-010",
      conteudo: "Regra apta DEC-001",
      aptidao: "apto",
      ambitoCoa: "prj-mg2",
      versaoConteudo: "v2"
    },
    {
      id: "KNW-011",
      conteudo: "Rascunho não apto — NÃO entregar",
      aptidao: "nao_apto",
      ambitoCoa: "prj-mg2",
      versaoConteudo: "v1"
    }
  ]);

  const lastro = solicitarLastroConhecimento({
    contextoTrabalho: "prj-mg2",
    necessidade: "regra de domínio vigente"
  });

  assert.equal(lastro.ok, true);
  assert.equal(lastro.haConhecimentoApto, true);
  assert.equal(lastro.incluiNaoAptos, false);
  assert.equal(lastro.lacuna, null);
  assert.equal(lastro.itens.length, 1);
  assert.equal(lastro.itens[0].id, "KNW-010");
  assert.equal(lastro.itens[0].versao, "v2");
  assert.ok(lastro.referenciasVersao.some((r) => r.id === "KNW-010" && r.versao === "v2"));
  assert.ok(!lastro.factosOficiais.some((f) => /NÃO entregar|KNW-011/i.test(f)));
  assert.ok(!JSON.stringify(lastro.itens).includes("nao_apto"));
  assert.ok(!JSON.stringify(lastro.itens).includes("aptidao"));
});

test("CA-072-3b: lacuna explícita quando sem apto", () => {
  carregarItensAcervoParaTestes([
    {
      id: "KNW-012",
      conteudo: "só não apto",
      aptidao: "nao_apto",
      ambitoCoa: "prj-mg2"
    }
  ]);
  const lastro = solicitarLastroConhecimento({
    coa: { id: "prj-mg2" },
    necessidade: "factos oficiais"
  });
  assert.equal(lastro.haConhecimentoApto, false);
  assert.equal(lastro.itens.length, 0);
  assert.equal(lastro.lacuna, LACUNA_SEM_ITEM_APTO);
  assert.ok(lastro.factosOficiais.some((f) => /LACUNA EXPLÍCITA/i.test(f)));
});

test("CA-072-1: MRE/EE consomem Camada só via Porta (sem bypass fonte)", () => {
  const mreSrc = readFileSync(join(__dir, "../mre/integracaoNucleo.js"), "utf8");
  const eeSrc = readFileSync(
    join(__dir, "../executiveEngine/promptGovernanca.js"),
    "utf8"
  );
  assert.match(mreSrc, /portaRecuperacao/);
  assert.match(eeSrc, /portaRecuperacao/);
  assert.doesNotMatch(
    mreSrc,
    /from ["'].*camadaConhecimento\/fonteOficial/
  );
  assert.doesNotMatch(
    eeSrc,
    /from ["'].*camadaConhecimento\/fonteOficial/
  );

  carregarItensAcervoParaTestes([
    {
      id: "KNW-020",
      conteudo: "Validar Sprint 1 via Porta",
      aptidao: "apto",
      ambitoCoa: "prj-mg2",
      versaoConteudo: "v1"
    }
  ]);
  const entrada = montarEntradaMre({
    instrucao: "o que está decidido?",
    coaAtivo: { id: "prj-mg2", nome: "MG2" },
    memoria: () => null
  });
  assert.ok(entrada.factosOficiais.some((f) => /KNW-020|Validar Sprint 1/i.test(f)));
  assert.equal(entrada.viaPortaRecuperacao, true);

  const msgs = montarMensagensLlm({
    instrucao: "decidir próximo passo",
    historico: [],
    memoria: { projetoAtivo: { id: "prj-mg2" } },
    coa: { id: "prj-mg2" }
  });
  const blob = msgs.map((m) => m.content).join("\n");
  assert.match(blob, /KNW-020|Validar Sprint 1/);
  assert.match(blob, /PORTA DE RECUPERAÇÃO|FONTE OFICIAL/i);
});

test("CA-072-4: Porta não importa governação/curadoria/limites; lastro opaco", () => {
  const portaSrc = readFileSync(join(__dir, "portaRecuperacao.js"), "utf8");
  assert.doesNotMatch(portaSrc, /governancaAcervo|limitesAdmissao|atualizacaoAcervo/);
  assert.doesNotMatch(
    portaSrc,
    /obterItemPorId|aplicarNovaVersao|registarPublicacao|contagemRegistro|registroItens/
  );
  assert.match(portaSrc, /lerAptoParaConsumo/);

  carregarItensAcervoParaTestes([
    {
      id: "KNW-040",
      conteudo: "item opaco",
      aptidao: "apto",
      ambitoCoa: "prj-mg2",
      versaoConteudo: "v3"
    }
  ]);
  const lastro = solicitarLastroConhecimento({
    contextoTrabalho: { id: "prj-mg2" },
    necessidade: "consulta"
  });
  assert.equal(lastro.itens.length, 1);
  const keys = Object.keys(lastro.itens[0]);
  assert.deepEqual(keys.sort(), ["conteudo", "id", "versao"].sort());
  assert.ok(!keys.includes("aptidao"));
  assert.ok(!keys.includes("versoes"));
  assert.ok(!keys.includes("ambitoCoa"));
});

test("CA-072-5: classificador e interceptação não substituem a Porta", () => {
  const preservar = readFileSync(
    join(__dir, "../classificadorIntencao/preservarMissao.js"),
    "utf8"
  );
  const intercept = readFileSync(
    join(__dir, "../conversacaoNatural/interceptacaoOperacional.js"),
    "utf8"
  );
  assert.doesNotMatch(preservar, /portaRecuperacao|fonteOficial|camadaConhecimento/);
  assert.doesNotMatch(intercept, /portaRecuperacao|fonteOficial|solicitarLastro/);
  assert.ok(intercept.includes("factosOficiais: []"));
});

test("factosViaPorta: helper devolve só factos do lastro", () => {
  assert.deepEqual(
    factosViaPorta({ coa: "prj-mg2" }),
    []
  );
  carregarItensAcervoParaTestes([
    {
      id: "KNW-030",
      conteudo: "facto via helper",
      aptidao: "apto",
      ambitoCoa: "prj-mg2"
    }
  ]);
  const f = factosViaPorta({
    contextoTrabalho: "prj-mg2",
    necessidade: "helper"
  });
  assert.equal(f.length, 1);
  assert.match(f[0], /KNW-030/);
});
