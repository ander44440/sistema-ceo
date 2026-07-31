/**
 * Montagem do ParecerExecutivo e deliberação completa 0–8.
 * Valida exclusivamente com IMP-011.
 */

import {
  avaliarAprendizado,
  montarPlanoRetencao
} from "./aprendizado/avaliarAprendizado.js";
import { VERSAO_CONTRATO } from "./parecer/enums.js";
import { validarParecerExecutivo } from "./parecer/validarParecerExecutivo.js";
import { executarPipeline07 } from "./pipeline/orquestrador.js";
import { isNcsAtiva } from "./ncs/flagNcs.js";
import { mesclarMetadadosNcs } from "./ncs/metadadosParecer.js";
import { anexarPacoteNcs, resolverPacoteNcsCorrida } from "./ncs/portador.js";

/** Web Crypto — funciona no browser e no Node (sem `node:crypto`). */
function novoUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/**
 * @param {object} parcial
 * @param {object} aprendizado
 * @param {object} [meta]
 */
export function montarParecerExecutivo(parcial, aprendizado, meta = {}) {
  const id = meta.id || `parecer-${novoUuid()}`;
  return {
    id,
    criadoEm: meta.criadoEm || new Date().toISOString(),
    versaoContrato: VERSAO_CONTRATO,
    coaId: parcial.coaId === undefined ? null : parcial.coaId,
    confianca: typeof parcial.confianca === "number" ? parcial.confianca : 0.5,
    lacunas: Array.isArray(parcial.lacunas) ? parcial.lacunas : [],
    diagnostico: parcial.diagnostico,
    enquadramento: parcial.enquadramento,
    dossier: parcial.dossier,
    principiosAplicados: parcial.principiosAplicados || [],
    analise: parcial.analise,
    riscos: parcial.riscos || [],
    oportunidades: parcial.oportunidades || [],
    decisaoExecutiva: parcial.decisaoExecutiva,
    acao: parcial.acao,
    aprendizado,
    ...(meta.metadados ? { metadados: meta.metadados } : {})
  };
}

/**
 * Stub de aprendizado apenas para testes isolados do pipeline 0–7.
 * IMP-013 substitui pelo avaliador real.
 */
export function stubAprendizadoNeutro() {
  return {
    registrarMemoria: false,
    criarPrecedente: false,
    atualizarPrincipios: false,
    notas: "stub-imp-012"
  };
}

/**
 * Deliberação MRE completa (0–8) → ParecerExecutivo validado.
 * @param {import('./pipeline/orquestrador.js').EntradaMre} entrada
 * @param {object} deps
 * @param {object} [optsAprendizado]
 */
export async function executarDeliberacaoMre(entrada, deps, optsAprendizado = {}) {
  const depsIn = deps || {};
  const ncsAtiva = isNcsAtiva(depsIn);

  // C5 — Pacote: injetado (harness) ou classificado se flagNcs on (C8); null = baseline
  const pacoteNcs = resolverPacoteNcsCorrida(entrada, depsIn);
  const entradaComNcs = pacoteNcs ? anexarPacoteNcs(entrada, pacoteNcs) : entrada;
  const depsComNcs = pacoteNcs ? { ...depsIn, pacoteNcs } : { ...depsIn };

  const pipeline = await executarPipeline07(entradaComNcs, depsComNcs);
  const parcial = pipeline.parcial;

  // Imutabilidade da decisão: aprendizado recebe cópia read-only conceptual
  const snapshotDecisao = structuredClone(parcial.decisaoExecutiva);
  const snapshotAcao = structuredClone(parcial.acao);

  const aprendizado = avaliarAprendizado(parcial, {
    mensagemOriginal: entrada.mensagem,
    ...optsAprendizado
  });

  // Garantir que não mutámos decisão/ação (nem NCS no pacote)
  parcial.decisaoExecutiva = snapshotDecisao;
  parcial.acao = snapshotAcao;

  // C7 — metadados NCS só com flag on (observabilidade; V1–V6 intactos)
  const metadadosBase = {
    falhaControlada: pipeline.falhaControlada,
    ordemEstagios: pipeline.ordem,
    ...(depsIn.metadados || {})
  };
  const metadados = mesclarMetadadosNcs(metadadosBase, pacoteNcs, ncsAtiva);

  const parecer = montarParecerExecutivo(parcial, aprendizado, { metadados });

  const validacao = validarParecerExecutivo(parecer);
  if (!validacao.ok) {
    // Uma regeneração só do aprendizado/raiz — decisões intactas
    const aprendizadoSeguro = {
      registrarMemoria: false,
      criarPrecedente: false,
      atualizarPrincipios: false,
      notas: `Regeneração pós-validação: ${validacao.violacoes.map((v) => v.regra).join(",")}`
    };
    const metadadosRegen = mesclarMetadadosNcs(
      { regenerado: true, violacoesAnteriores: validacao.violacoes },
      pacoteNcs,
      ncsAtiva
    );
    const parecer2 = montarParecerExecutivo(parcial, aprendizadoSeguro, {
      metadados: metadadosRegen
    });
    const validacao2 = validarParecerExecutivo(parecer2);
    const plano = montarPlanoRetencao(parecer2.id, aprendizadoSeguro);
    return {
      ok: validacao2.ok,
      parecer: parecer2,
      planoRetencao: plano,
      validacao: validacao2,
      pipeline,
      aprendizado: aprendizadoSeguro,
      pacoteNcs
    };
  }

  const planoRetencao = montarPlanoRetencao(parecer.id, aprendizado);
  return {
    ok: true,
    parecer,
    planoRetencao,
    validacao,
    pipeline,
    aprendizado,
    pacoteNcs
  };
}
