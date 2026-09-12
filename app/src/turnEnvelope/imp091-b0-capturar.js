/**
 * IMP-091 Bloco B0 — captura da baseline observável (somente leitura do runtime actual).
 * Não implementa Fatia 1; não altera arquitectura; não cria sinais/detectores/regras.
 *
 * Uso:
 *   node src/turnEnvelope/imp091-b0-capturar.js
 *   node src/turnEnvelope/imp091-b0-capturar.js --write
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import executiveEngine from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  ehPedidoConsultaOuRespostaComposta,
  ehOrdemExecucaoOperacional
} from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  criarTopico,
} from "../classificadorIntencao/gestorTopicos.js";
import {
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao
} from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import {
  ehPedidoSituacionalTrabalho,
  ehPedidoAutodiagnosticoOuAutoavaliacaoCeo
} from "../classificadorIntencao/regras.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { detectarPedidoInfoGathering } from "../classificadorIntencao/pedidoInfoGathering.js";
import {
  detectarPedidoConsultaResposta,
  detectarPedidoAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";
import { objectoDoTurno } from "../classificadorIntencao/recomendacaoOperacional.js";
import { seleccionarFioCoa } from "../classificadorIntencao/fioConversacional.js";
import { resolverPrecedenciaTurno } from "../executiveEngine/resolucaoPrecedenciaTurno.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { reiniciarStoresPosDeliberacaoParaTestes } from "../mre/integracaoNucleo.js";
import { FIXTURES_B0 } from "./imp091-b0-fixtures.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const BASELINE_PATH = join(__dirname, "imp091-b0-baseline.json");

const ISO_TOPICO = "2026-09-12T12:00:00.000Z";

export function resetEstadoB0() {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarStoresPosDeliberacaoParaTestes();
  executiveEngine.inicializar();
}

function depsPadrao() {
  const fila = criarPublicadorFilaMemoria();
  return {
    fila,
    deps: {
      publicarJob: fila.publicarJob.bind(fila),
      chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz({}, { escopoMg2: true })),
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "activo" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: false, alertas: 0 }),
        F8: async () => ({ id: "mg2", nome: "Motoboy Game 2" })
      },
      listarPorEstado: async () => []
    }
  };
}

function inferirEarlyPath(out) {
  const modo = out?.modo != null ? String(out.modo) : null;
  if (out?.dados?.continuidade === true || modo === "continuidade_gate") {
    return "gate";
  }
  if (modo === "continuidade_gate_clarificacao") return "gate_clarificacao";
  if (modo === "autoridade_delegada") return "ad_ack";
  if (modo === "clarificacao_contexto") return "vca";
  if (modo && /^clarificacao_/.test(modo)) return "csc";
  if (out?.dados?.classificadorSaltado === true) return "early_saltado";
  return "none";
}

function panoramaActual(texto) {
  const t = normalizarTexto(texto);
  const situacional = ehPedidoSituacionalTrabalho(t);
  return (
    !situacional &&
    !ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(t) &&
    (/\bestado\s+atual\b/.test(t) ||
      /\b(resumo\s+executivo|memoria\s+executiva)\b/.test(t))
  );
}

/**
 * Flags-chave e forcarC2 observados com os mesmos detectores/critérios
 * que o Núcleo usa hoje (gémeo observacional — não altera runtime).
 */
export function observarDetectoresEPrecedencia(texto, destinoClassificador) {
  const tNorm = normalizarTexto(texto);
  const flags = {
    pedidoInfoGathering: detectarPedidoInfoGathering(texto),
    pedidoDecisao: detectarPedidoDecisaoExplicita(texto),
    pedidoConsultaResposta: detectarPedidoConsultaResposta(texto),
    pedidoSituacionalTrabalho: ehPedidoSituacionalTrabalho(tNorm),
    panoramaEstadoGeral: panoramaActual(texto),
    pedidoConsultaOuRespostaComposta: ehPedidoConsultaOuRespostaComposta(texto),
    ordemExecucaoOperacional: ehOrdemExecucaoOperacional(texto),
    pedidoAnaliseDeliberativa: detectarPedidoAnaliseDeliberativa(texto)
  };
  const prec = resolverPrecedenciaTurno({
    pedidoDecisaoExplicita: flags.pedidoDecisao,
    pedidoSituacionalTrabalho: flags.pedidoSituacionalTrabalho,
    pedidoConsultaOuRespostaComposta: flags.pedidoConsultaOuRespostaComposta,
    panoramaEstadoGeral: flags.panoramaEstadoGeral,
    destinoClassificador: destinoClassificador || null,
    fase: "pos_classificador"
  });
  return {
    flags_chave: flags,
    forcarC2: prec.forcarC2 === true,
    precedencia_observacional: {
      autoridade: prec.autoridade,
      acao: prec.acao,
      destinoPermitido: prec.destinoPermitido ?? null,
      destinoFixo: prec.destinoFixo === true,
      tipoTurno: prec.tipoTurno,
      razao: prec.razao
    }
  };
}

export function extrairObservaveis(out, fixture, meta = {}) {
  const classif = out?.dados?.classificacao || null;
  const enc = out?.dados?.encaminhamento || null;
  const precAnexo = out?.dados?.precedenciaTurno || null;
  const destino =
    enc?.destino ??
    precAnexo?.destinoPermitido ??
    classif?.destino ??
    null;
  const classe =
    classif?.classe ??
    (out?.modo && inferirEarlyPath(out) !== "none" ? `early:${out.modo}` : null);
  const earlyPath = inferirEarlyPath(out);
  const obs = observarDetectoresEPrecedencia(fixture.texto, destino);

  const historico = Array.isArray(fixture.historico) ? fixture.historico : [];
  const fio = seleccionarFioCoa(historico, fixture.texto, {
    coaId: fixture.coaId || undefined
  });

  return {
    id: fixture.id,
    familia: fixture.familia,
    nota: fixture.nota || null,
    input: {
      texto: fixture.texto,
      coaId: fixture.coaId ?? null,
      historicoLen: historico.length,
      setup: fixture.setup || "none"
    },
    destino_efectivo: destino,
    classe,
    early_path: earlyPath,
    forcarC2: earlyPath === "none" ? obs.forcarC2 : null,
    flags_chave: obs.flags_chave,
    modo_resposta: out?.modo ?? null,
    capacidade: out?.capacidade ?? null,
    objecto_turno_observado: objectoDoTurno(fixture.texto, fio),
    classificacao: classif
      ? {
          classe: classif.classe ?? null,
          destino: classif.destino ?? null,
          permiteJob: classif.permiteJob ?? null
        }
      : null,
    encaminhamento: enc
      ? {
          destino: enc.destino ?? null,
          ok: enc.ok ?? null,
          idClasse: enc.idClasse ?? null
        }
      : null,
    precedencia_anexada: precAnexo
      ? {
          autoridade: precAnexo.autoridade ?? null,
          acao: precAnexo.acao ?? null,
          destinoPermitido: precAnexo.destinoPermitido ?? null,
          destinoFixo: precAnexo.destinoFixo ?? null,
          tipoTurno: precAnexo.tipoTurno ?? null
        }
      : null,
    precedencia_observacional: obs.precedencia_observacional,
    meta_resposta: {
      continuidade: out?.dados?.continuidade === true,
      classificadorSaltado: out?.dados?.classificadorSaltado === true,
      motorAcionado: out?.dados?.motorAcionado === true,
      mreInvocado: out?.dados?.mreInvocado === true,
      decisaoGate: out?.dados?.decisao ?? null,
      validacaoContexto: out?.dados?.validacaoContexto?.veredicto ?? null,
      temEnvelope: Boolean(out?.dados?.envelope),
      envelopeModo: out?.dados?.envelope?.modo ?? null,
      envelopeObjecto: out?.dados?.envelope?.objecto ?? null,
      envelopeIntencao: out?.dados?.envelope?.intençãoAtual ?? null
    },
    captura: {
      jobsPublicados: meta.jobsPublicados ?? 0,
      mensagemLen: String(out?.mensagem || "").length
    }
  };
}

async function executarFixture(fixture) {
  resetEstadoB0();
  const { fila, deps } = depsPadrao();
  let storeContinuidade = null;

  if (fixture.setup === "gate") {
    storeContinuidade = criarStoreContextoGate();
    await executiveEngine.executar("Resolva os bugs.", {
      ...deps,
      storeContinuidade,
      registro: new Map()
    });
  }

  if (fixture.setup === "vca") {
    const activo = criarTopico("outdoor", "usuario", ISO_TOPICO);
    definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  }

  const entrada = {
    texto: fixture.texto,
    historico: Array.isArray(fixture.historico) ? fixture.historico : [],
    coaId: fixture.coaId ?? null
  };

  const out = await executiveEngine.executar(entrada, {
    ...deps,
    ...(storeContinuidade ? { storeContinuidade, registro: new Map() } : {})
  });

  return extrairObservaveis(out, fixture, {
    jobsPublicados: fila.jobs.length
  });
}

export async function capturarBaselineB0() {
  /** @type {object[]} */
  const casos = [];
  for (const fixture of FIXTURES_B0) {
    const obs = await executarFixture(fixture);
    casos.push(obs);
  }
  return {
    meta: {
      artefacto: "IMP-091-B0-baseline",
      versao: "0.1",
      capturadoEm: new Date().toISOString(),
      norma: "REQ-091 v0.3 / ARQ-091 v0.3 / IMP-091 §B0",
      proposito:
        "Congelar observáveis pré-Fatia 1 para matriz de equivalência (CA-091-8)",
      nota:
        "Captura read-only do runtime actual. Não é implementação Fatia 1. envelope.modo/intençãoActual devem permanecer null (Fatia 0 sombra).",
      totalCasos: casos.length,
      ids: casos.map((c) => c.id)
    },
    casos
  };
}

export function serializarBaseline(baseline) {
  return `${JSON.stringify(baseline, null, 2)}\n`;
}

async function main() {
  const write = process.argv.includes("--write");
  const baseline = await capturarBaselineB0();
  const json = serializarBaseline(baseline);
  if (write) {
    writeFileSync(BASELINE_PATH, json, "utf8");
    console.error(`Baseline escrita: ${BASELINE_PATH}`);
  }
  console.log(json);
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
