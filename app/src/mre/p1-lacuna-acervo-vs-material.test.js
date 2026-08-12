/**
 * REQ-070 CA-070-5/6 — LACUNA EXPLÍCITA (Acervo) ≠ lacuna material de decisão (REQ-048).
 * Front: peso decisório indevido da lacuna de Acervo no estágio 6.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  LACUNA_SEM_ITEM_APTO,
  hintEstagio6LacunaFonteOficial,
  reiniciarAcervoParaTestes,
  consultarFonteOficial,
  contagemRegistroAcervo
} from "../camadaConhecimento/fonteOficial.js";
import {
  executarRotaDeliberativa,
  montarEntradaMre,
  reiniciarStoresPosDeliberacaoParaTestes
} from "./integracaoNucleo.js";
import {
  ehFatoBloqueanteNomeado,
  aplicarPoliticaDecisaoSobConflito
} from "./politicaDecisaoSobConflito.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "./pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const COA_ROTASUL = {
  id: "prj-1786482665174-1",
  nome: "RotaSul — Administração",
  status: "ativo"
};

const MSG_INSUFICIENTE = `Preciso decidir o orçamento do Q3.
Não tenho o valor aprovado nem o prazo contratual.
Decide o que fazer.`;

const MSG_ROTASUL_SUFICIENTE = `Não quero que você execute nenhuma ação externa, crie Jobs ou altere qualquer coisa.

Quero uma posição executiva clara sobre a RotaSul.

Factos já fornecidos nesta conversa:
- cliente responsável por aproximadamente 12% do faturamento;
- cliente estratégico insatisfeito;
- 70% dos atrasos por liberação tardia nas sextas;
- causa operacional conhecida (pico de sexta + liberação tardia);
- ação possível: reorganizar capacidade existente e priorizar o cliente;
- sem orçamento para expansão de frota.

Apresente uma posição executiva clara e justifique. Não execute nada.`;

beforeEach(() => {
  reiniciarAcervoParaTestes();
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarStoresPosDeliberacaoParaTestes();
});

test("unit: hintEstagio6 separa lacuna de Acervo de lacuna material", () => {
  const h = hintEstagio6LacunaFonteOficial();
  assert.match(h, /LACUNA EXPLÍCITA/i);
  assert.match(h, /NÃO constitui, por si só, lacuna material/i);
  assert.match(h, /NÃO use estado=solicitar_dados/i);
  assert.match(h, /estado=monitorar/i);
  assert.match(h, /património oficial/i);
  assert.match(h, /MATERIALMENTE necessária/i);
});

test("unit: texto LACUNA EXPLÍCITA não é facto bloqueante nomeado (REQ-048)", () => {
  assert.equal(ehFatoBloqueanteNomeado(LACUNA_SEM_ITEM_APTO), false);
  assert.equal(
    ehFatoBloqueanteNomeado(
      "LACUNA EXPLÍCITA do Acervo — sem item apto para o âmbito"
    ),
    false
  );
});

test("TESTE D — Acervo vazio → LACUNA EXPLÍCITA continua em factosOficiais", () => {
  assert.equal(contagemRegistroAcervo(), 0);
  const entrada = montarEntradaMre({
    instrucao: MSG_ROTASUL_SUFICIENTE,
    coaAtivo: COA_ROTASUL,
    memoria: () => ({ pendencias: [] }),
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.ok(entrada.factosOficiais.some((f) => /LACUNA EXPLÍCITA/i.test(f)));
  assert.equal(
    consultarFonteOficial({ ambitoCoa: COA_ROTASUL.id }).lacuna,
    LACUNA_SEM_ITEM_APTO
  );
});

test("TESTE A — Acervo vazio + info insuficiente → solicitar_dados permitido", async () => {
  const pub = criarPublicadorFilaMemoria();
  let hint6 = "";
  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": (pedido) => {
      hint6 = String(pedido.schemaHint || "");
      return {
        estado: "solicitar_dados",
        recomendacao:
          "Solicitar o orçamento aprovado do Q3 e o prazo contratual antes de fechar",
        alternativas: [],
        justificativa:
          "Sem orçamento Q3 e sem prazo contratual não há critério financeiro material."
      };
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_INSUFICIENTE,
      coaAtivo: COA_ROTASUL,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.match(hint6, /LACUNA EXPLÍCITA/i);
  assert.match(hint6, /NÃO use estado=solicitar_dados/i);
  const estado = out.dados?.parecer?.decisaoExecutiva?.estado;
  assert.equal(estado, "solicitar_dados");
  assert.match(
    String(out.dados?.parecer?.decisaoExecutiva?.recomendacao || out.mensagem),
    /orçamento|Q3|prazo/i
  );
});

test("TESTE B — Acervo vazio + factos suficientes + PD → lacuna sozinha não força solicitar/monitorar", async () => {
  const pub = criarPublicadorFilaMemoria();
  let hint6 = "";
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": {
      analise:
        "Cliente 12% insatisfatório; 70% atrasos por liberação tardia; causa conhecida; frota nova fora de orçamento; reorganizar capacidade é ação viável."
    },
    "6_decisao": (pedido) => {
      hint6 = String(pedido.schemaHint || "");
      return {
        estado: "aprovar",
        recomendacao:
          "Reorganizar a capacidade existente para priorizar o cliente de 12% nas sextas, sem expansão de frota. Factos da conversa — não património oficial do Acervo.",
        alternativas: [
          "Manter operação actual",
          "Expandir frota (inviável sem orçamento)"
        ],
        justificativa:
          "Factos materiais já na mensagem; LACUNA EXPLÍCITA do Acervo não bloqueia a posição."
      };
    },
    "7_acao": {
      descricao:
        "Priorizar cliente 12% nas sextas e deslocar carga menor para outros dias"
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ROTASUL_SUFICIENTE,
      coaAtivo: COA_ROTASUL,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.match(hint6, /LACUNA EXPLÍCITA/i);
  assert.match(hint6, /NÃO constitui, por si só, lacuna material/i);
  assert.match(hint6, /NÃO use estado=solicitar_dados nem estado=monitorar apenas porque o Acervo está vazio/i);
  const estado = out.dados?.parecer?.decisaoExecutiva?.estado;
  assert.ok(
    ["aprovar", "rejeitar"].includes(estado),
    `estado não deve ser forçado a solicitar_dados/monitorar pela lacuna; got=${estado}`
  );
  assert.notEqual(estado, "solicitar_dados");
  assert.notEqual(estado, "monitorar");
});

test("TESTE C — Acervo vazio + problema material + ação concreta → decisão executiva possível", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": {
      estado: "aprovar",
      recomendacao:
        "Aprovar realocação operacional para proteger o cliente de 12% sem capex de frota.",
      alternativas: ["Status quo"],
      justificativa: "Causa conhecida e ação dentro da frota actual."
    },
    "7_acao": {
      descricao:
        "Reservar capacidade de sexta para o cliente estratégico; cutoff para demais cargas"
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ROTASUL_SUFICIENTE,
      coaAtivo: COA_ROTASUL,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const estado = out.dados?.parecer?.decisaoExecutiva?.estado;
  assert.equal(estado, "aprovar");
  assert.match(
    String(out.dados?.parecer?.acao?.descricao || out.mensagem),
    /capacidade|cliente|sexta/i
  );
  const factos = montarEntradaMre({
    instrucao: MSG_ROTASUL_SUFICIENTE,
    coaAtivo: COA_ROTASUL,
    memoria: () => ({ pendencias: [] })
  }).factosOficiais;
  assert.ok(factos.some((f) => /LACUNA EXPLÍCITA/i.test(f)));
});

test("TESTE E — factos do utilizador não viram património oficial do Acervo", async () => {
  assert.equal(contagemRegistroAcervo(), 0);
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": {
      estado: "aprovar",
      recomendacao:
        "Com base nos factos fornecidos nesta conversa (não no Acervo Oficial), priorizar o cliente de 12%.",
      alternativas: [],
      justificativa: "Deliberação sobre contexto corrente sem registo KNW."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ROTASUL_SUFICIENTE,
      coaAtivo: COA_ROTASUL,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.equal(contagemRegistroAcervo(), 0);
  const consulta = consultarFonteOficial({ ambitoCoa: COA_ROTASUL.id });
  assert.equal(consulta.haConhecimentoApto, false);
  assert.equal(consulta.itens.length, 0);
  assert.equal(consulta.lacuna, LACUNA_SEM_ITEM_APTO);
  const blob = `${out.mensagem}\n${JSON.stringify(out.dados?.parecer || {})}`;
  assert.doesNotMatch(blob, /KNW-\d+/);
  assert.doesNotMatch(
    blob,
    /patrim[oó]nio oficial do Acervo.*(12%|70%|faturamento)/i
  );
});

test("política: solicitar_dados só por LACUNA de Acervo sem facto material → remapeável sob PD", () => {
  const out = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "solicitar_dados",
      recomendacao:
        "Solicitar dados porque o Acervo está vazio (LACUNA EXPLÍCITA)",
      alternativas: ["Priorizar cliente 12%", "Status quo"],
      justificativa: "Sem item apto no Acervo"
    },
    {
      pedidoDecisao: true,
      lacunas: [LACUNA_SEM_ITEM_APTO]
    }
  );
  // LACUNA EXPLÍCITA não é facto bloqueante nomeado → política não preserva solicitar_dados
  assert.notEqual(out.estado, "solicitar_dados");
});

test("RotaSul limpo — lacuna declarada; hint não bloqueia; fecho executivo possível", async () => {
  const pub = criarPublicadorFilaMemoria();
  let hint6 = "";
  const entradaPre = montarEntradaMre({
    instrucao: MSG_ROTASUL_SUFICIENTE,
    coaAtivo: COA_ROTASUL,
    memoria: () => ({ pendencias: [], decisoes: [] }),
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.ok(entradaPre.factosOficiais.some((f) => /LACUNA EXPLÍCITA/i.test(f)));

  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": (pedido) => {
      hint6 = String(pedido.schemaHint || "");
      return {
        estado: "aprovar",
        recomendacao:
          "Proteger o cliente de 12% reorganizando a operação de sexta sem expansão de frota (factos da conversa).",
        alternativas: ["Manter status quo", "Expandir frota"],
        justificativa:
          "Causa operacional conhecida e ação possível dentro da capacidade instalada."
      };
    },
    "7_acao": {
      descricao: "Realocar capacidade de sexta para o cliente estratégico"
    }
  });

  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ROTASUL_SUFICIENTE,
      coaAtivo: COA_ROTASUL,
      // MTE = null, Jobs filtrados = [] — contexto limpo
      lastroConsciencia: {
        temContextoRelevante: false,
        factosOficiais: []
      },
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );

  assert.equal(out.ok, true);
  assert.match(hint6, /LACUNA EXPLÍCITA/i);
  assert.match(hint6, /NÃO use estado=solicitar_dados nem estado=monitorar apenas porque o Acervo está vazio/i);
  const estado = out.dados?.parecer?.decisaoExecutiva?.estado;
  assert.ok(["aprovar", "rejeitar"].includes(estado), `estado=${estado}`);
  assert.equal(pub.jobs.length, 0);
  assert.equal(contagemRegistroAcervo(), 0);
});
