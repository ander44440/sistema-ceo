/**
 * Checklist de fecho IMP-010 / preparação VAL (IMP-019 / F9).
 * Não executa a VAL — apenas consolida conformidade lógica.
 */

/**
 * Critérios F1–F8 observáveis (evidência documental + testes).
 */
export const CRITERIOS_FECHO_IMP010 = Object.freeze([
  {
    id: "F1",
    imp: "IMP-011",
    descricao: "Contrato e validação ParecerExecutivo (V1–V6)",
    evidencia: "app/src/mre/parecer/; test:mre:parecer"
  },
  {
    id: "F2",
    imp: "IMP-012",
    descricao: "Pipeline MRE estágios 0–7",
    evidencia: "app/src/mre/pipeline/; test:mre:pipeline"
  },
  {
    id: "F3",
    imp: "IMP-013",
    descricao: "Aprendizado Executivo estágio 8",
    evidencia: "app/src/mre/aprendizado/; test:mre:aprendizado"
  },
  {
    id: "F4",
    imp: "IMP-014",
    descricao: "Integração Núcleo → MRE",
    evidencia: "roteamentoDeliberativo.js; integracaoNucleo.js; bloco2 T14"
  },
  {
    id: "F5",
    imp: "IMP-015",
    descricao: "Speaker Executivo",
    evidencia: "speaker/speakerExecutivo.js; bloco2 T15"
  },
  {
    id: "F6",
    imp: "IMP-016",
    descricao: "Canais Chat / Voice / Centro",
    evidencia: "canais/; conversa.js; centroSituacao; bloco2 T16"
  },
  {
    id: "F7",
    imp: "IMP-017",
    descricao: "Despacho Fila a partir de acao.job",
    evidencia: "posDeliberacao/despachoFila.js; bloco3 T17"
  },
  {
    id: "F8",
    imp: "IMP-018",
    descricao: "Persistência retenção + Gate princípios (H1)",
    evidencia: "posDeliberacao/persistirRetencao.js; bloco3 T18"
  }
]);

/**
 * @param {Record<string, boolean>} marcas — id fase → concluído
 */
export function avaliarChecklistFecho(marcas = {}) {
  const itens = CRITERIOS_FECHO_IMP010.map((c) => ({
    ...c,
    ok: marcas[c.id] === true
  }));
  const incompletos = itens.filter((i) => !i.ok);
  return {
    completo: incompletos.length === 0,
    itens,
    incompletos: incompletos.map((i) => i.id),
    total: itens.length,
    okCount: itens.filter((i) => i.ok).length
  };
}

/**
 * Marcas padrão após Bloco 3 implementado (código presente).
 * A homologação humana do Gate continua externa.
 */
export function marcasBloco3Implementado() {
  return {
    F1: true,
    F2: true,
    F3: true,
    F4: true,
    F5: true,
    F6: true,
    F7: true,
    F8: true
  };
}

/**
 * Esboço lógico do plano VAL (não é VAL homologada).
 */
export function esbocoPlanoValMre() {
  return {
    id: "VAL-MRE-esboco",
    status: "esboco",
    norma: "ADR-006 — VAL após encerramento IMP",
    objetivos: [
      "Validar fidelidade deliberativa Speaker vs Parecer",
      "Validar matriz deliberativo vs determinístico no Núcleo",
      "Validar H1 (sem auto-aplicação de princípios)",
      "Validar despacho Fila só com parecer válido",
      "Validar rollback flagMre"
    ],
    foraDeEscopoDesteEsboco: [
      "Execução formal da VAL",
      "Declaração de produção",
      "Novas REQs"
    ],
    dependencias: ["IMP-010 F1–F8 concluídas", "Relatórios Bloco 1–3"]
  };
}

/**
 * Relatório de fecho programático.
 */
export function gerarRelatorioFechoImp010(marcas) {
  const checklist = avaliarChecklistFecho(marcas || marcasBloco3Implementado());
  const val = esbocoPlanoValMre();
  return {
    geradoEm: new Date().toISOString(),
    imp: "IMP-010",
    fechoF9: true,
    checklist,
    valEsboco: val,
    producao: {
      declarada: false,
      motivo: "Critérios P1–P8 do IMP-010: VAL ainda não homologada (P2)"
    },
    proximoPassoSugerido:
      "Gate valida Bloco 3; depois abrir artefato VAL formal (não iniciar novo bloco de IMP aqui)."
  };
}
