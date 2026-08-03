/**
 * Diagnóstico de corrida MRE — reexecução da pergunta craft.do com log completo.
 * Uso: node scripts/diag-corrida-mre.mjs
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "scripts", "diag-corrida-mre-resultado.json");

const PERGUNTA =
  "OLA..   entre neste repositório (https://agents.craft.do/) e avaliae o quanto isso seria util para nossos projetos";

const LLM_BASE = process.env.CEO_DIAG_LLM_BASE || "http://localhost:5173";

globalThis.localStorage = {
  _m: new Map(),
  getItem(k) {
    return this._m.has(k) ? this._m.get(k) : null;
  },
  setItem(k, v) {
    this._m.set(k, String(v));
  },
  removeItem(k) {
    this._m.delete(k);
  }
};

async function deliberarViaApi(pedido) {
  const resp = await fetch(`${LLM_BASE}/api/ceo/deliberar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: pedido.messages,
      temperature: pedido.temperature ?? 0.2,
      max_tokens: pedido.max_tokens ?? 700
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    const err = new Error(data?.mensagem || `Falha LLM HTTP ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return { texto: data.texto, modelo: data.modelo, uso: data.uso };
}

async function main() {
  const log = {
    pergunta: PERGUNTA,
    iniciadoEm: new Date().toISOString(),
    flagNcs: null,
    ncs: null,
    estagios: [],
    llmBruto: [],
    pipeline: null,
    parecerAntesSpeaker: null,
    validacao1: null,
    validacao2: null,
    primeiroPontoInvalido: null,
    excecao: null,
    stack: null,
    estadoEstagio6: null,
    speaker: null,
    ok: false
  };

  try {
    const { parseSaidaJson } = await import(
      pathToFileURL(path.join(root, "src/mre/pipeline/llmEstagio.js")).href
    );
    const { flagNcs, classificarNaturezaCognitiva } = await import(
      pathToFileURL(path.join(root, "src/mre/ncs/index.js")).href
    );
    const {
      estagio0Diagnostico,
      estagio1Enquadramento,
      estagio2Dossier,
      estagio3Principios,
      estagio4Analise,
      estagio5aRiscos,
      estagio5bOportunidades,
      estagio6Decisao,
      estagio7Acao
    } = await import(
      pathToFileURL(path.join(root, "src/mre/pipeline/estagios.js")).href
    );
    const {
      aplicarPoliticaDecisaoNcs,
      calcularShortCircuitNcs,
      talvezInjetarLacunaSolicitarDados
    } = await import(
      pathToFileURL(path.join(root, "src/mre/ncs/politicas.js")).href
    );
    const { resolverPacoteNcsCorrida, anexarPacoteNcs } = await import(
      pathToFileURL(path.join(root, "src/mre/ncs/portador.js")).href
    );
    const { isNcsAtiva } = await import(
      pathToFileURL(path.join(root, "src/mre/ncs/flagNcs.js")).href
    );
    const { avaliarAprendizado } = await import(
      pathToFileURL(path.join(root, "src/mre/aprendizado/avaliarAprendizado.js")).href
    );
    const { montarParecerExecutivo } = await import(
      pathToFileURL(path.join(root, "src/mre/executarDeliberacao.js")).href
    );
    const { validarParecerExecutivo } = await import(
      pathToFileURL(path.join(root, "src/mre/parecer/validarParecerExecutivo.js")).href
    );
    const { gerarComunicadoExecutivo } = await import(
      pathToFileURL(path.join(root, "src/mre/speaker/speakerExecutivo.js")).href
    );
    const { mesclarMetadadosNcs } = await import(
      pathToFileURL(path.join(root, "src/mre/ncs/metadadosParecer.js")).href
    );

    log.flagNcs = flagNcs.ativo ? "ON" : "OFF";

    const classificado = classificarNaturezaCognitiva({
      mensagem: PERGUNTA,
      intencao: { id: "deliberar", capacidade: "ia" }
    });
    log.ncs = {
      classificadorOk: classificado.ok,
      pacote: classificado.pacote || null,
      erro: classificado.erro || null,
      nota:
        "Com flagNcs OFF o limiar NÃO anexa este pacote à corrida (baseline). Abaixo: classificação lógica isolada + corrida real com flag default."
    };

    const entradaBase = {
      mensagem: PERGUNTA,
      coaId: "coa-mg2",
      intencao: { id: "deliberar", capacidade: "ia" },
      snapshotPainel: {
        resumo: "Dia em curso · Motoboy Game 2. Foco: Retomar após Gate E5.",
        proximoPasso: "Retomar após Gate E5",
        estado: "Estável"
      },
      factosOficiais: [
        "Próximo passo: Retomar após Gate E5",
        "Painel próximo passo: Retomar após Gate E5"
      ]
    };

    const deps = {
      flagNcs: flagNcs.ativo,
      chamarLlm: async (pedido) => {
        const messages = [
          {
            role: "system",
            content:
              "És um módulo interno do Motor de Raciocínio Executivo. " +
              "Responde APENAS com um único objeto JSON válido, sem markdown, sem prosa. " +
              `Schema esperado: ${pedido.schemaHint}`
          },
          {
            role: "user",
            content: JSON.stringify({
              estagio: pedido.estagio,
              retentativa: Boolean(pedido.retentativa),
              contexto: pedido.contexto
            })
          }
        ];
        const saida = await deliberarViaApi({
          messages,
          temperature: 0.2,
          max_tokens: 700
        });
        let parsed;
        try {
          parsed = parseSaidaJson(saida.texto);
        } catch (e) {
          log.llmBruto.push({
            estagio: pedido.estagio,
            retentativa: Boolean(pedido.retentativa),
            textoBruto: saida.texto,
            parseErro: e.message
          });
          throw e;
        }
        log.llmBruto.push({
          estagio: pedido.estagio,
          retentativa: Boolean(pedido.retentativa),
          textoBruto: saida.texto,
          parsed,
          modelo: saida.modelo
        });
        return parsed;
      }
    };

    const ncsAtiva = isNcsAtiva(deps);
    const pacoteNcs = resolverPacoteNcsCorrida(entradaBase, deps);
    const entrada = pacoteNcs ? anexarPacoteNcs(entradaBase, pacoteNcs) : entradaBase;
    if (pacoteNcs) deps.pacoteNcs = pacoteNcs;

    log.ncs.pacoteNaCorrida = pacoteNcs;
    log.ncs.limiarAtivo = ncsAtiva;

    const lacunasAcc = [];
    const ordem = [];

    // —— Estágio 0
    ordem.push("0");
    const diagnostico = await estagio0Diagnostico(entrada, deps);
    log.estagios.push({ id: "0", nome: "diagnostico", bruto: diagnostico });

    // —— Estágio 1
    ordem.push("1");
    const enquadramento = await estagio1Enquadramento(entrada, diagnostico, deps);
    if (enquadramento.tipoPedido === "ambiguo") {
      lacunasAcc.push("Pedido ambíguo — esclarecimento necessário");
    }
    log.estagios.push({ id: "1", nome: "enquadramento", bruto: enquadramento });

    // —— Estágio 2
    ordem.push("2");
    const { dossier } = estagio2Dossier(entrada, lacunasAcc, pacoteNcs);
    log.estagios.push({
      id: "2",
      nome: "dossier",
      bruto: { dossier, lacunasAcc: lacunasAcc.slice() }
    });

    const shortCircuit = calcularShortCircuitNcs(
      entrada,
      lacunasAcc,
      enquadramento,
      pacoteNcs
    );

    // —— Estágio 3
    ordem.push("3");
    const principiosAplicados = await estagio3Principios(
      diagnostico,
      enquadramento,
      deps,
      lacunasAcc
    );
    log.estagios.push({
      id: "3",
      nome: "principios",
      bruto: { principiosAplicados, lacunasAcc: lacunasAcc.slice() }
    });

    const baseParcial = {
      diagnostico,
      enquadramento,
      dossier,
      principiosAplicados,
      lacunas: lacunasAcc.slice(),
      shortCircuit
    };

    // —— Estágio 4
    ordem.push("4");
    const analise = shortCircuit
      ? "Bloqueio por lacuna: deliberação incompleta até obter dados essenciais."
      : await estagio4Analise(baseParcial, deps);
    log.estagios.push({
      id: "4",
      nome: "analise",
      shortCircuit,
      bruto: analise
    });

    const parcialPos4 = { ...baseParcial, analise };

    // —— 5a
    ordem.push("5a");
    const riscos = shortCircuit
      ? [{ nivel: "alto", texto: "Decidir sem dados essenciais" }]
      : await estagio5aRiscos(parcialPos4, deps);
    log.estagios.push({ id: "5a", nome: "riscos", bruto: riscos });

    // —— 5b
    ordem.push("5b");
    const oportunidades = shortCircuit
      ? []
      : await estagio5bOportunidades({ ...parcialPos4, riscos }, deps);
    log.estagios.push({ id: "5b", nome: "oportunidades", bruto: oportunidades });

    const parcialPos5 = {
      ...parcialPos4,
      riscos,
      oportunidades,
      lacunas: lacunasAcc.slice()
    };

    // —— 6
    ordem.push("6");
    let decisaoExecutiva;
    if (shortCircuit) {
      decisaoExecutiva = {
        estado: "solicitar_dados",
        recomendacao: "Solicitar os dados em falta antes de decidir",
        alternativas: ["Adiar", "Prosseguir com risco elevado"],
        justificativa:
          lacunasAcc.length > 0
            ? `Lacunas materiais impedem decisão segura. Princípios ${principiosAplicados.join(", ") || "aplicáveis"} exigem não inventar factos. Riscos de decidir às cegas.`
            : "Sem riscos materiais identificados além da ambiguidade; solicitar esclarecimento."
      };
    } else {
      decisaoExecutiva = await estagio6Decisao(parcialPos5, deps);
    }
    const decisaoAntesPolitica = structuredClone(decisaoExecutiva);
    decisaoExecutiva = aplicarPoliticaDecisaoNcs(
      decisaoExecutiva,
      lacunasAcc,
      pacoteNcs
    );
    talvezInjetarLacunaSolicitarDados(
      decisaoExecutiva.estado,
      lacunasAcc,
      pacoteNcs
    );
    log.estadoEstagio6 = decisaoExecutiva.estado;
    log.estagios.push({
      id: "6",
      nome: "decisao",
      shortCircuit,
      brutoAntesPoliticaNcs: decisaoAntesPolitica,
      bruto: decisaoExecutiva,
      lacunasAcc: lacunasAcc.slice()
    });

    // —— 7
    ordem.push("7");
    const acao = await estagio7Acao(
      decisaoExecutiva,
      { ...parcialPos5, lacunas: lacunasAcc },
      deps
    );
    log.estagios.push({ id: "7", nome: "acao", bruto: acao });

    let confianca = 0.75;
    if (lacunasAcc.length) confianca = Math.max(0.25, confianca - 0.15 * lacunasAcc.length);
    if (enquadramento.tipoPedido === "ambiguo") confianca = Math.min(confianca, 0.45);
    if (shortCircuit) confianca = Math.min(confianca, 0.35);

    const parcial = {
      diagnostico,
      enquadramento,
      dossier,
      principiosAplicados,
      analise,
      riscos,
      oportunidades,
      decisaoExecutiva,
      acao,
      lacunas: lacunasAcc.slice(),
      confianca,
      coaId: entrada.coaId ?? null,
      shortCircuit
    };

    // —— Estágio 8 (aprendizado)
    const snapshotDecisao = structuredClone(parcial.decisaoExecutiva);
    const snapshotAcao = structuredClone(parcial.acao);
    const aprendizado = avaliarAprendizado(parcial, {
      mensagemOriginal: entrada.mensagem
    });
    parcial.decisaoExecutiva = snapshotDecisao;
    parcial.acao = snapshotAcao;
    log.estagios.push({
      id: "8",
      nome: "aprendizado",
      bruto: aprendizado,
      decisaoMutada: JSON.stringify(parcial.decisaoExecutiva) !== JSON.stringify(snapshotDecisao),
      acaoMutada: JSON.stringify(parcial.acao) !== JSON.stringify(snapshotAcao)
    });

    const metadados = mesclarMetadadosNcs(
      {
        falhaControlada: false,
        ordemEstagios: ordem,
        origem: "diag-corrida-mre",
        flagNcs: ncsAtiva
      },
      pacoteNcs,
      ncsAtiva
    );

    const parecer = montarParecerExecutivo(parcial, aprendizado, { metadados });
    log.parecerAntesSpeaker = parecer;

    const validacao1 = validarParecerExecutivo(parecer);
    log.validacao1 = validacao1;
    if (!validacao1.ok) {
      log.primeiroPontoInvalido = {
        momento: "pós-montagem parecer (antes do Speaker)",
        aposEstagio: "8",
        violacoes: validacao1.violacoes
      };
      const aprendizadoSeguro = {
        registrarMemoria: false,
        criarPrecedente: false,
        atualizarPrincipios: false,
        notas: `Regeneração pós-validação: ${validacao1.violacoes.map((v) => v.regra).join(",")}`
      };
      const parecer2 = montarParecerExecutivo(parcial, aprendizadoSeguro, {
        metadados: mesclarMetadadosNcs(
          { regenerado: true, violacoesAnteriores: validacao1.violacoes },
          pacoteNcs,
          ncsAtiva
        )
      });
      const validacao2 = validarParecerExecutivo(parecer2);
      log.validacao2 = validacao2;
      log.parecerAntesSpeaker = parecer2;
      if (!validacao2.ok && !log.primeiroPontoInvalido.regeneracaoTambemFalhou) {
        log.primeiroPontoInvalido.regeneracaoTambemFalhou = validacao2.violacoes;
      }
      const falado = gerarComunicadoExecutivo(parecer2, "chat");
      log.speaker = falado;
      log.ok = validacao2.ok && falado.ok;
    } else {
      const falado = gerarComunicadoExecutivo(parecer, "chat");
      log.speaker = falado;
      log.ok = falado.ok;
      if (!falado.ok) {
        log.primeiroPontoInvalido = {
          momento: "Speaker recusou parecer",
          violacoes: falado.violacoes || falado.erro
        };
      }
    }

    log.pipeline = { ordem, shortCircuit, falhaControlada: false };
    log.concluidoEm = new Date().toISOString();
  } catch (err) {
    log.excecao = err instanceof Error ? err.message : String(err);
    log.stack = err instanceof Error ? err.stack : null;
    log.codigo = err?.codigo || null;
    if (!log.primeiroPontoInvalido) {
      log.primeiroPontoInvalido = {
        momento: "exceção durante pipeline",
        aposEstagios: log.estagios.map((e) => e.id),
        erro: log.excecao
      };
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(log, null, 2), "utf8");
  console.log(JSON.stringify(log, null, 2));
  console.error(`\n[diag] escrito em ${outPath}`);
}

main();
