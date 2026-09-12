/**
 * UI — campos #cs-dia-* = frases executivas tipadas (sem dump de mensagens).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  htmlFaixaDoDia,
  sugerirCamposEncerramento,
  sugerirCamposEncerramentoSync,
  TEXTO_NAO_IDENTIFICADO
} from "./faixaDoDia.js";
import {
  definirMemoriaTrabalhoExecutiva,
  resetMemoriaTrabalhoExecutiva
} from "../../executiveEngine/refinoEicSessao.js";
import {
  acrescentarMensagem,
  criarMensagem,
  reiniciarStoreConversaParaTestes
} from "../conversa/store.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  resetMemoriaTrabalhoExecutiva();
  reiniciarStoreConversaParaTestes();
});

test("UI: painel encerrar (dia encerrado) preenche #cs-dia-* com continuidade persistida", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo,
    encerrarDiaExecutivo,
    obterUltimaContinuidade
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "Homologacao UI relato" });
  encerrarDiaExecutivo({
    oQueAndou: "JOB-000074: ficheiro de homologacao criado",
    oQueFica: "JOB-000074 em needs_correction",
    proximoPassoAmanha: "Retomar JOB-000074 a partir do resultado"
  });
  const cont = obterUltimaContinuidade();
  assert.ok(cont);

  const html = htmlFaixaDoDia("encerrar");
  assert.match(html, /id="cs-dia-andou"/);
  assert.match(html, /id="cs-dia-fica"/);
  assert.match(html, /id="cs-dia-amanha"/);
  assert.match(html, /value="JOB-000074: ficheiro de homologacao criado"/);
  assert.match(html, /value="JOB-000074 em needs_correction"/);
  assert.match(html, /value="Retomar JOB-000074 a partir do resultado"/);
});

test("UI: progresso real sem dump de mensagens", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo,
    registrarPendencia,
    registrarProximaAcao,
    registrarDecisao,
    registrarAcaoHistorico,
    definirProximoPasso
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "Testes reais do CEO" });
  registrarDecisao("Seguir com testes reais no Sistema CEO");
  registrarPendencia("Validar auto-preenchimento do encerrar o dia");
  registrarProximaAcao("Confirmar encerramento no painel");
  registrarAcaoHistorico({
    instrucao:
      "Bom dia, CEO. Qual é o papel da empresa Patrocinador neste contexto operacional amplo?",
    capacidade: "ia",
    intencao: "consulta",
    ok: true,
    resumo: "resposta longa"
  });
  definirProximoPasso(
    "Empresa Patrocinador — contexto institucional default dos COAs operacionais e descrição truncada"
  );

  const sync = sugerirCamposEncerramentoSync();
  assert.match(sync.oQueAndou, /Decisão registada: Seguir com testes reais/);
  assert.doesNotMatch(sync.oQueAndou, /\[ia\]/);
  assert.doesNotMatch(sync.oQueAndou, /Pendência:/);
  assert.doesNotMatch(sync.oQueAndou, /Próxima ação:/);
  assert.doesNotMatch(sync.oQueAndou, /;/);
  assert.match(sync.oQueFica, /Validar auto-preenchimento/);
  assert.match(sync.proximoPassoAmanha, /Confirmar encerramento/);
  assert.doesNotMatch(sync.proximoPassoAmanha, /Empresa Patrocinador/);

  const html = htmlFaixaDoDia("encerrar");
  assert.match(html, /Decisão registada: Seguir com testes reais/);
  assert.doesNotMatch(html, /\[ia\]/);
});

test("UI: pendência no lastro/MTE preenche O que fica e deriva amanhã", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "Continuidade lastro" });

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => [],
    lastroConsciencia: {
      temContextoRelevante: true,
      memoriaTrabalhoExecutiva: {
        pendencias: ["Fechar revisão do fluxo Encerrar o dia"],
        proximaAcao: null
      }
    }
  });

  assert.equal(campos.oQueAndou, TEXTO_NAO_IDENTIFICADO);
  assert.match(campos.oQueFica, /Fechar revisão do fluxo Encerrar o dia/);
  assert.match(campos.proximoPassoAmanha, /^Resolver:/);
  assert.match(campos.proximoPassoAmanha, /Fechar revisão/);
});

test("UI: sem evidência → Não foi identificado nos três campos", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "" });

  const sync = sugerirCamposEncerramentoSync();
  assert.equal(sync.oQueAndou, TEXTO_NAO_IDENTIFICADO);
  assert.equal(sync.oQueFica, TEXTO_NAO_IDENTIFICADO);
  assert.equal(sync.proximoPassoAmanha, TEXTO_NAO_IDENTIFICADO);

  const html = htmlFaixaDoDia("encerrar");
  assert.match(html, new RegExp(`value="${TEXTO_NAO_IDENTIFICADO}"`));
});

test("UI: Job/promo gera progresso, fica e próximo passo executivo", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "Homologacao operacional" });

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => [
      {
        id: "JOB-000074",
        projeto: "prj-mg2",
        estado: "needs_correction",
        resultado: {
          status: "sucesso",
          resumo: "Ficheiro de homologacao criado",
          evidencia: "executive/queue/evidencia.txt"
        }
      }
    ],
    lastroConsciencia: {
      temContextoRelevante: true,
      resultadoMissaoActivo: {
        jobId: "JOB-000074",
        estado: "needs_correction",
        sintese: "Ficheiro de homologacao criado",
        evidencia: "executive/queue/evidencia.txt"
      },
      memoriaTrabalhoExecutiva: {
        pendencias: [],
        proximaAcao: "Retomar JOB-000074 a partir do resultado"
      }
    }
  });

  assert.match(campos.oQueAndou, /JOB-000074: Ficheiro de homologacao criado/);
  assert.doesNotMatch(campos.oQueAndou, /;/);
  assert.match(campos.oQueFica, /JOB-000074|needs_correction/);
  assert.match(campos.proximoPassoAmanha, /Retomar JOB-000074/);
});

test("UI: isolamento — ValeVerde não recebe Job órfão de outro contexto", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos", descricao: "Contexto de teste" });
  abrirDiaExecutivo({ intencaoDoDia: "Leitura inicial ValeVerde" });

  const jobOrfao = {
    id: "JOB-000070",
    projeto: null,
    estado: "needs_correction",
    resultado: {
      status: "sucesso",
      resumo:
        "Ordem JOB-000064 executada (itens 2+3): silhuetas carros NPC + DEC-MVP-001 cancelamento corrida",
      evidencia: "docs/learning/2026-08-09-job-000070-execucao-mg2-ordem-expansoes.md"
    }
  };
  const jobOutroContexto = {
    id: "JOB-000099",
    projeto: "prj-mg2",
    projetoNome: "Motoboy Game 2",
    estado: "needs_correction",
    resultado: {
      status: "sucesso",
      resumo: "Entrega exclusiva MG2",
      evidencia: "executive/queue/mg2.txt"
    }
  };

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => [jobOrfao, jobOutroContexto],
    lastroConsciencia: {
      temContextoRelevante: true,
      resultadoMissaoActivo: {
        jobId: "JOB-000070",
        estado: "needs_correction",
        sintese: jobOrfao.resultado.resumo,
        evidencia: jobOrfao.resultado.evidencia
      },
      memoriaTrabalhoExecutiva: { pendencias: [], proximaAcao: null }
    }
  });

  assert.doesNotMatch(campos.oQueAndou, /JOB-000070|silhuetas|DEC-MVP-001|JOB-000064/);
  assert.doesNotMatch(campos.oQueFica, /JOB-000070|needs_correction/);
  assert.doesNotMatch(campos.proximoPassoAmanha, /JOB-000070/);
  assert.doesNotMatch(campos.oQueAndou, /JOB-000099|Entrega exclusiva MG2/);
});

test("UI: isolamento — Job da missão activa permanece disponível", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo,
    obterProjetoAtivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos", descricao: "Contexto de teste" });
  const ativo = obterProjetoAtivo();
  abrirDiaExecutivo({ intencaoDoDia: "Operação ValeVerde" });

  const jobMissao = {
    id: "JOB-000201",
    projeto: ativo.id,
    projetoNome: ativo.nome,
    estado: "needs_correction",
    resultado: {
      status: "sucesso",
      resumo: "Diagnóstico de margem ValeVerde registado",
      evidencia: "executive/queue/valeverde.txt"
    }
  };
  const jobOrfao = {
    id: "JOB-000070",
    projeto: null,
    estado: "needs_correction",
    resultado: {
      status: "sucesso",
      resumo: "Ordem JOB-000064 silhuetas carros NPC",
      evidencia: "docs/learning/2026-08-09-job-000070-execucao-mg2-ordem-expansoes.md"
    }
  };

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => [jobOrfao, jobMissao]
  });

  assert.match(campos.oQueAndou, /JOB-000201: Diagnóstico de margem ValeVerde/);
  assert.match(campos.oQueFica, /JOB-000201/);
  assert.doesNotMatch(campos.oQueAndou, /JOB-000070|silhuetas/);
  assert.doesNotMatch(campos.oQueFica, /JOB-000070/);
});

test("UI: isolamento — Job órfão é excluído da montagem", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "Sem órfãos" });

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => [
      {
        id: "JOB-000070",
        projeto: null,
        estado: "needs_correction",
        resultado: {
          status: "sucesso",
          resumo: "Ordem JOB-000064 silhuetas NPC",
          evidencia: "docs/learning/x.md"
        }
      }
    ]
  });

  assert.equal(campos.oQueAndou, TEXTO_NAO_IDENTIFICADO);
  assert.equal(campos.oQueFica, TEXTO_NAO_IDENTIFICADO);
  assert.equal(campos.proximoPassoAmanha, TEXTO_NAO_IDENTIFICADO);
});

test("UI: MTE de sessão é lido no refine quando injectado via definirMemoria", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "MTE sessão" });

  definirMemoriaTrabalhoExecutiva({
    coaId: "prj-mg2",
    pendencias: ["Questão pendente observada na sessão"],
    proximaAcao: null,
    decisoesTomadas: [],
    objectivoActual: null,
    estadoConversa: { emExecucao: null, pendentes: [] }
  });

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => []
  });

  assert.match(campos.oQueFica, /Questão pendente observada/);
  assert.match(campos.proximoPassoAmanha, /^Resolver:/);
});

test("UI: conversa ValeVerde alimenta encerramento quando estruturado está vazio", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos", descricao: "Contexto de teste" });
  abrirDiaExecutivo({ intencaoDoDia: "Condução ValeVerde" });

  acrescentarMensagem(
    criarMensagem({
      papel: "usuario",
      texto:
        "A empresa possui 120 funcionários. Faturamento anual: R$ 48 milhões. Margem líquida caiu de 8% para 4%. Matéria-prima aumentou 15%. O comercial quer aumentar preços em 10%, mas teme perder clientes. A produção pode reduzir desperdícios em 5%. Analise a situação, identifique o problema central e recomende a prioridade. Não execute nada."
    })
  );
  acrescentarMensagem(
    criarMensagem({
      papel: "ceo",
      texto:
        "A queda da margem líquida de 8% para 4% é o problema central, pressionada pelo aumento de 15% na matéria-prima. Alternativas: ajustar preços ou reduzir desperdícios. Recomendação: modificar."
    })
  );

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => []
  });

  assert.match(campos.oQueAndou, /Análise|análises/i);
  assert.doesNotMatch(campos.oQueAndou, /120 funcionários/);
  assert.doesNotMatch(campos.oQueAndou, /Bom dia/);
  assert.match(campos.oQueFica, /preços|desperdícios|Prioridade|Recomendação/i);
  assert.match(campos.proximoPassoAmanha, /Decidir|Confirmar|Resolver/i);
  assert.doesNotMatch(campos.proximoPassoAmanha, /120 funcionários/);
});

test("UI: conversa de outro COA não entra no encerramento", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo,
    obterProjetoAtivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos", descricao: "Contexto de teste" });
  const vv = obterProjetoAtivo();
  abrirDiaExecutivo({ intencaoDoDia: "ValeVerde limpo" });

  const campos = await sugerirCamposEncerramento({
    listarJobs: async () => [],
    listarHfcPorCoa: (coaId) => {
      if (String(coaId) === String(vv.id)) return [];
      return [
        {
          msgId: "msg-outro",
          papel: "usuario",
          texto:
            "JOB-000070 silhuetas carros NPC e DEC-MVP-001 no Motoboy Game 2. Analise e recomende."
        }
      ];
    },
    mensagensConversa: []
  });

  assert.equal(campos.oQueAndou, TEXTO_NAO_IDENTIFICADO);
  assert.doesNotMatch(String(campos.oQueAndou), /silhuetas|JOB-000070|MG2/);
  assert.doesNotMatch(String(campos.oQueFica), /silhuetas|JOB-000070/);
});

test("UI: conversa não vira dump bruto nos campos", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos" });
  abrirDiaExecutivo({ intencaoDoDia: "Sem dump" });

  const longo =
    "CEO, seguem os primeiros dados da ValeVerde Alimentos:\n" +
    "A empresa possui 120 funcionários.\nFaturamento anual: R$ 48 milhões.\n" +
    "Analise a situação e recomende prioridade. Não execute nada.";

  acrescentarMensagem(criarMensagem({ papel: "usuario", texto: longo }));
  acrescentarMensagem(
    criarMensagem({
      papel: "ceo",
      texto:
        "Análise: a margem e os custos exigem prioridade clara entre preço e desperdício. Recomendação: aprovar."
    })
  );

  const campos = await sugerirCamposEncerramento({ listarJobs: async () => [] });
  assert.doesNotMatch(campos.oQueAndou, /CEO, seguem/);
  assert.doesNotMatch(campos.oQueAndou, /\n/);
  assert.ok(campos.oQueAndou.length < 200);
  assert.ok(!campos.oQueFica.includes(longo.slice(0, 40)));
});

test("UI: fica e amanhã derivados de evidência explícita da conversa", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos" });
  abrirDiaExecutivo({ intencaoDoDia: "Derivação" });

  acrescentarMensagem(
    criarMensagem({
      papel: "usuario",
      texto:
        "Matéria-prima +15%. Comercial quer aumentar preços 10% e teme perder clientes. Produção reduz desperdícios 5%. Analise alternativas e prioridade. Não execute nada."
    })
  );
  acrescentarMensagem(
    criarMensagem({
      papel: "ceo",
      texto:
        "Problema central na margem. Alternativas viáveis: preços ou desperdícios. Recomendação: modificar."
    })
  );

  const campos = await sugerirCamposEncerramento({ listarJobs: async () => [] });
  assert.match(campos.oQueFica, /preços|desperdícios|Prioridade|Recomendação/i);
  assert.match(campos.proximoPassoAmanha, /Decidir|Confirmar|Resolver/i);
  assert.doesNotMatch(campos.proximoPassoAmanha, /Matéria-prima \+15%/);
});

test("UI: sem evidência conversacional tipável → Não foi identificado", async () => {
  const {
    inicializarCatalogo,
    criarProjeto,
    abrirDiaExecutivo
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  criarProjeto({ nome: "ValeVerde Alimentos" });
  abrirDiaExecutivo({ intencaoDoDia: "" });

  acrescentarMensagem(
    criarMensagem({ papel: "usuario", texto: "ok, obrigado." })
  );
  acrescentarMensagem(
    criarMensagem({ papel: "ceo", texto: "Quando quiser, seguimos." })
  );

  const campos = await sugerirCamposEncerramento({ listarJobs: async () => [] });
  assert.equal(campos.oQueAndou, TEXTO_NAO_IDENTIFICADO);
  assert.equal(campos.oQueFica, TEXTO_NAO_IDENTIFICADO);
  assert.equal(campos.proximoPassoAmanha, TEXTO_NAO_IDENTIFICADO);
});
