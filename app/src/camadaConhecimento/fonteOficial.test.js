/**
 * IMP-070 B1 / REQ-070 — Fonte Oficial.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  FONTE_OFICIAL_ID,
  LACUNA_SEM_ITEM_APTO,
  carregarItensAcervoParaTestes,
  consultarFonteOficial,
  contagemRegistroAcervo,
  factosDaFonteOficial,
  reiniciarAcervoParaTestes,
  rotuloProjecaoSubordinada,
  subordinarProjecao
} from "./fonteOficial.js";
import {
  obterFactosBriefingProjeto,
  obterProjecaoBriefing
} from "../executiveEngine/briefingsProjeto.js";
import { montarEntradaMre } from "../mre/integracaoNucleo.js";
import { montarMensagensLlm } from "../executiveEngine/promptGovernanca.js";

beforeEach(() => {
  reiniciarAcervoParaTestes();
});

test("CA-070-1: pertença oficial só via Acervo (índice em memória)", () => {
  assert.equal(contagemRegistroAcervo(), 0);
  const vazio = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(vazio.fonte, FONTE_OFICIAL_ID);
  assert.equal(vazio.unica, true);
  assert.equal(vazio.itens.length, 0);

  carregarItensAcervoParaTestes([
    {
      id: "KNW-001",
      conteudo: "Regra DEC-MVP-001: taxa zerada em cancelamento",
      aptidao: "apto",
      ambitoCoa: "prj-mg2",
      versaoConteudo: "v1"
    }
  ]);
  const c = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(c.itens.length, 1);
  assert.equal(c.itens[0].id, "KNW-001");
  assert.equal(c.lacuna, null);
});

test("CA-070-2: projecção subordinada; não é Fonte Oficial", () => {
  const p = obterProjecaoBriefing({ id: "prj-mg2", nome: "Motoboy Game 2" });
  assert.ok(p);
  assert.equal(p.naoEFonteOficial, true);
  assert.equal(p.fonteCanononica, FONTE_OFICIAL_ID);
  assert.equal(p.tipo, "projecao_subordinada");
  assert.match(p.textoRotulado, /PROJEÇÃO SUBORDINADA/i);
  assert.match(p.textoRotulado, /não é Fonte Oficial/i);

  const factosProj = obterFactosBriefingProjeto({ id: "prj-mg2" });
  assert.ok(factosProj.some((f) => /WorldLab2/i.test(f)));

  const oficial = factosDaFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.ok(oficial.some((f) => /LACUNA EXPLÍCITA/i.test(f)));
  assert.ok(!oficial.some((f) => /WorldLab2/i.test(f)));
});

test("CA-070-3: item COA tem ID e âmbito — não texto órfão", () => {
  carregarItensAcervoParaTestes([
    {
      id: "KNW-002",
      conteudo: "Objectivo janela: validar Sprint 1",
      aptidao: "apto",
      ambitoCoa: "prj-mg2"
    }
  ]);
  const c = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(c.itens[0].id, "KNW-002");
  assert.equal(c.itens[0].ambitoCoa, "prj-mg2");
  const factos = factosDaFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.match(factos[0], /^KNW-002:/);
});

test("CA-070-4: sem item apto → lacuna explícita; não inventa", () => {
  const c = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(c.haConhecimentoApto, false);
  assert.equal(c.lacuna, LACUNA_SEM_ITEM_APTO);
  assert.match(c.lacuna, /LACUNA EXPLÍCITA/i);
  assert.match(c.lacuna, /Não inventar/i);

  carregarItensAcervoParaTestes([
    {
      id: "KNW-003",
      conteudo: "obsoleto",
      aptidao: "nao_apto",
      ambitoCoa: "prj-mg2"
    }
  ]);
  const c2 = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(c2.haConhecimentoApto, false);
  assert.ok(c2.lacuna);
});

test("montarEntradaMre: factosOficiais não incluem WorldLab2 do briefing; têm lacuna", () => {
  const entrada = montarEntradaMre({
    instrucao: "O que sabes sobre este projeto?",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ proximoPasso: "Validar Sprint 1", pendencias: [] }),
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.equal(entrada.fonteOficial, FONTE_OFICIAL_ID);
  assert.ok(
    entrada.factosOficiais.some((f) => /LACUNA EXPLÍCITA/i.test(f))
  );
  assert.ok(!entrada.factosOficiais.some((f) => /WorldLab2/i.test(f)));
  assert.equal(entrada.projecaoSubordinada?.naoEFonteOficial, true);
  assert.ok(
    entrada.projecaoSubordinada.factos.some((f) => /WorldLab2/i.test(f))
  );
  assert.match(entrada.mensagem, /Projecção subordinada|NÃO é Fonte Oficial/i);
  assert.match(String(entrada.snapshotPainel?.resumo), /Projecção subordinada|Validar Sprint 1/i);
});

test("montarMensagensLlm: Fonte Oficial + projecção rotulada", () => {
  const msgs = montarMensagensLlm({
    instrucao: "estado do MG2",
    historico: [],
    memoria: {},
    coa: { id: "prj-mg2", nome: "Motoboy Game 2" }
  });
  const blob = msgs.map((m) => m.content).join("\n");
  assert.match(blob, /PORTA DE RECUPERAÇÃO/i);
  assert.match(blob, /LACUNA EXPLÍCITA/i);
  assert.match(blob, /PROJEÇÃO SUBORDINADA/i);
  assert.match(blob, /WorldLab2/i);
});

test("subordinarProjecao e rotulo", () => {
  const s = subordinarProjecao({ texto: "x" });
  assert.equal(s.naoEFonteOficial, true);
  assert.match(rotuloProjecaoSubordinada("hello"), /PROJEÇÃO SUBORDINADA[\s\S]*hello/);
});
