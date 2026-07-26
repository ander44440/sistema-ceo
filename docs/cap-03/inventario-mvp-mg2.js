/**
 * Inventário congelado do acervo MG2 do MVP v0.1 (IMP-009 E8 / REQ-044).
 *
 * Fixture estruturada aprovada pelo CTO (deliberação 1 da Proposta E8):
 * cópia 1:1 do acervo operacional observável em `docs/mvp/` — a fonte
 * normativa permanece o MVP congelado (D7/D8); este módulo é somente leitura.
 *
 * Escopo quantitativo (deliberação 2): 1 decisão + 1 conhecimento +
 * 1 estado do dia + identidade do COA "Motoboy Game 2".
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoInventarioMvpMg2 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** Identidade do COA de destino — fonte: docs/mvp/contexto-mg2.md (REQ-017). */
  const COA_DESTINO = Object.freeze({
    nome: "Motoboy Game 2",
    objetivoPrincipal:
      "Desenvolver o Motoboy Game 2 — contexto operacional único do MVP v0.1, preservado na migração para COA (REQ-044)",
    descricao:
      "COA de destino da migração do acervo do MVP v0.1 (contexto MG2). Fonte de identidade: docs/mvp/contexto-mg2.md.",
    fonte: "docs/mvp/contexto-mg2.md"
  });

  /**
   * Registros operacionais migráveis — mapeamento 1:1 (D17), sem
   * transformação semântica. `origemId` é a chave de idempotência.
   */
  const REGISTROS = Object.freeze([
    Object.freeze({
      origemId: "DEC-MVP-001",
      tipo: "decisao",
      fonte: "docs/mvp/decisoes.md",
      titulo: "Taxa zerada em corrida cancelada",
      conteudo: Object.freeze({
        enunciado:
          "No cancelamento de corrida, a taxa do motoboy será zerada (não rateada) nesta versão",
        porQue:
          "Evitar ambiguidade no payout e alinhar expectativa do entregador",
        baseadoEm:
          "Revisão do cálculo de taxa no cenário de corrida cancelada; atenção pendente do Dia",
        resultado:
          "Regra clara para implementar no edge case de cancelamento",
        quem: "Patrocinador (MVP)",
        quando: "23/07/2026",
        contexto: "Motoboy Game 2 (MG2)"
      })
    }),
    Object.freeze({
      origemId: "KNW-DIA-001",
      tipo: "conhecimento",
      fonte: "docs/mvp/conhecimentos-uso-diario.md",
      titulo: "Edge case: corrida cancelada e taxa",
      conteudo: Object.freeze({
        conteudo:
          "Quando a corrida é cancelada antes da conclusão, o cálculo de payout deve tratar a taxa do motoboy como caso especial — não reutilizar o caminho feliz sem ramificação explícita.",
        contexto: "Motoboy Game 2 (MG2)",
        natureza: "Conhecimento reutilizável (não é decisão)",
        quando: "23/07/2026",
        quem: "Patrocinador (MVP)"
      })
    }),
    Object.freeze({
      origemId: "ESTADO-DIA-MG2",
      tipo: "estadoDia",
      fonte: "docs/mvp/estado-do-dia.md",
      titulo: "Estado do Dia de Trabalho — fecho E4 (23/07/2026)",
      conteudo: Object.freeze({
        contextoAtivo: "Motoboy Game 2 (MG2)",
        statusDoDia: "fechado",
        focoVigente: "Fechar o fluxo de corrida até o payout do motoboy",
        ondeParou:
          "Revisado o cálculo de taxa no cenário de cancelamento",
        proximoPassoConfirmado:
          "Decidir regra de taxa em corrida cancelada",
        atencoesPertinentes: Object.freeze([
          "Decisão: zerar ou ratear a taxa no cancelamento"
        ]),
        vinculos: Object.freeze(["DEC-MVP-001", "KNW-DIA-001"]),
        ultimaAtualizacao: "23/07/2026 — fecho confirmado E4"
      })
    })
  ]);

  return Object.freeze({
    COA_DESTINO: COA_DESTINO,
    REGISTROS: REGISTROS,
    TOTAL_REGISTROS: REGISTROS.length
  });
});
