/**
 * P1-3 — Integração do Manifesto canónico MG2 no runtime C2/MRE.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import fs from "node:fs";
import {
  MANIFESTO_MG2_RELATIVO,
  MANIFESTO_MG2_ORIGEM_ID,
  carregarManifestoMg2DoDisco,
  documentoUsaFonteCanonica,
  deveAnexarManifestoMg2,
  extrairSecoesManifesto,
  obterManifestoMg2,
  reiniciarCacheManifestoMg2ParaTestes
} from "../camadaConhecimento/manifestoMg2.js";
import { montarEntradaMre } from "../mre/integracaoNucleo.js";
import {
  executarRotaDeliberativa,
  reiniciarStoresPosDeliberacaoParaTestes
} from "../mre/integracaoNucleo.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { classificar } from "../classificadorIntencao/regras.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const MSG_BAIRRO = `Analise a proposta de criar, do outro lado da rodovia, um bairro popular com casas e pequenos prédios residenciais.

Não crie Job e não execute nada.

Avalie a proposta segundo o Manifesto do MG2 e dê uma recomendação executiva.

Não quero que você repita o Manifesto. Quero saber quais princípios da visão do MG2 influenciam sua recomendação e se você aprovaria, modificaria ou não priorizaria essa proposta.`;

beforeEach(() => {
  reiniciarCacheManifestoMg2ParaTestes();
  reiniciarStoresPosDeliberacaoParaTestes();
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
});

test("T1 — Disponibilidade: runtime carrega Manifesto canónico do disco", async () => {
  const doc = await obterManifestoMg2({ fs, forcar: true });
  assert.equal(doc.ok, true, doc.erro);
  assert.ok(doc.conteudo.includes("MANIFESTO DO MOTOBOY GAME 2"));
  assert.ok(doc.secoes.length >= 10);
  assert.ok(
    doc.principiosSelecionaveis.some((p) => /mundo deve contar/i.test(p))
  );
});

test("T2 — Origem: docs/MANIFESTO-MG2.md", () => {
  const doc = carregarManifestoMg2DoDisco({ fs, forcar: true });
  assert.equal(doc.caminhoRelativo, MANIFESTO_MG2_RELATIVO);
  assert.equal(doc.origem, MANIFESTO_MG2_ORIGEM_ID);
  assert.equal(documentoUsaFonteCanonica(doc), true);
  assert.match(String(doc.caminhoAbsoluto || "").replace(/\\/g, "/"), /docs\/MANIFESTO-MG2\.md$/);
});

test("P1-3 unit: secções derivadas cobrem visão pedida", () => {
  const doc = carregarManifestoMg2DoDisco({ fs });
  const titulos = doc.secoes.map((s) => s.titulo.toLowerCase()).join(" | ");
  assert.match(titulos, /progressão profissional|formação|consequência|mundo deve contar/i);
  assert.equal(deveAnexarManifestoMg2(MSG_BAIRRO, { id: "prj-mg2" }), true);
});

test("T3/T4/T5/T6 — Deliberação bairro: Manifesto → análise aplicada → 0 Jobs", async () => {
  assert.equal(classificar(MSG_BAIRRO).classe, "conversa_projeto");

  const doc = await obterManifestoMg2({ fs, forcar: true });
  assert.equal(doc.ok, true);

  const pub = criarPublicadorFilaMemoria();
  const principiosEsperados = [
    "§13 O mundo deve contar a história",
    "§14 Princípio de não-moralização",
    "§2 A ideia central",
    "§16 Princípio de decisão do CEO"
  ].filter((p) => doc.principiosSelecionaveis.includes(p));

  assert.ok(principiosEsperados.length >= 2, "catálogo derivado deve incluir §13/§14");

  const mapa = mapaLlmFluxoFeliz({
    "3_principios": {
      principiosAplicados: principiosEsperados.slice(0, 3)
    },
    "4_analise": {
      analise:
        "Aplicando §13 (mundo mostra realidades diferentes, incluindo popular): o bairro popular " +
        "do outro lado da rodovia pode tornar visível um caminho de vida distinto. " +
        "§14 (não-moralização): a cena deve permitir perceber contrastes sem sermão. " +
        "§2 (escolhas curto vs longo prazo): só faz sentido se o contraste alimentar " +
        "consequências jogáveis futuras — como fundo decorativo isolado, o alinhamento é parcial. " +
        "Recomendação concreta: modificar o âmbito (MVP visual) e não priorizar execução integral agora."
    },
    "6_decisao": {
      estado: "monitorar",
      recomendacao:
        "Modificar e não priorizar a execução integral agora; MVP visual só após lastro de prioridade",
      alternativas: ["Aprovar fatia decorativa mínima após gate"],
      justificativa:
        "Com base em §13 e §14 do Manifesto MG2: o contraste popular fortalece a visão, " +
        "mas sem mecânica de consequência (§2/§5) a execução completa dispersa o foco."
    }
  });

  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_BAIRRO,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
      manifestoMg2: doc
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub),
      fsManifesto: fs
    }
  );

  assert.equal(out.ok, true);
  assert.equal(pub.jobs.length, 0, "T6: zero Jobs");
  assert.equal(out.dados?.manifestoMg2?.caminhoRelativo, MANIFESTO_MG2_RELATIVO);
  assert.equal(out.dados?.manifestoMg2?.origem, MANIFESTO_MG2_ORIGEM_ID);

  const principios = out.dados?.parecer?.principiosAplicados || [];
  assert.ok(
    principios.some((p) => /^§\d+/.test(p)),
    `T4: princípios do Manifesto no parecer, got ${JSON.stringify(principios)}`
  );
  assert.ok(
    !principios.some((p) => /ADR-015|tempo do utilizador|governança/i.test(p)),
    "não substituir por catálogo CEO"
  );

  assert.match(out.mensagem, /§13|mundo|popular|Recomendação/i);
  assert.match(out.mensagem, /modificar|não prioriz|parcial/i);
  // T5: não deve despejar o manifesto quase integral
  assert.ok(out.mensagem.length < 3500, "não repetir o Manifesto");
  assert.doesNotMatch(out.mensagem, /Fim do manifesto/i);

  const fontes = out.dados?.parecer?.dossier?.fontes || [];
  const factos = out.dados?.parecer?.dossier?.factosUsados || [];
  assert.ok(fontes.includes("outro"), `fontes: ${fontes}`);
  assert.ok(
    factos.some((f) => /MANIFESTO-MG2\.md/i.test(f)),
    `factos devem citar Manifesto: ${factos.slice(0, 3)}`
  );
});

test("T1b — montarEntradaMre recebe Manifesto no contexto C2", () => {
  const doc = carregarManifestoMg2DoDisco({ fs });
  const entrada = montarEntradaMre({
    instrucao: "Avalie segundo o Manifesto.",
    intencao: { id: "deliberar_objetivo", capacidade: "ia" },
    coaAtivo: { id: "prj-mg2", nome: "MG2" },
    manifestoMg2: doc
  });
  assert.equal(entrada.manifestoMg2?.ok, true);
  assert.equal(entrada.manifestoMg2?.caminhoRelativo, "docs/MANIFESTO-MG2.md");
  assert.match(entrada.mensagem, /DIRETRIZ CANÓNICA — Manifesto/);
  assert.match(entrada.mensagem, /docs\/MANIFESTO-MG2\.md/);
});

test("extrairSecoesManifesto: não inventa títulos", () => {
  const fake = "# X\n\n## 1. Alfa\n\ncorpo a\n\n## 2. Beta\n\ncorpo b\n";
  const s = extrairSecoesManifesto(fake);
  assert.deepEqual(
    s.map((x) => x.id + " " + x.titulo),
    ["§1 Alfa", "§2 Beta"]
  );
});
