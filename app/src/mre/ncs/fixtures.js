/**
 * Fixtures B1 — ≥1 pacote válido por natureza + inválidos.
 */

import { montarPacoteNcs } from "./pacote.js";

export const fixturePacoteMetodo = () =>
  montarPacoteNcs({
    naturezaCognitiva: "metodo_de_decisao",
    confiancaNatureza: 0.9,
    fundamentoNatureza: "Pedido de critérios sem lista de itens"
  });

export const fixturePacoteDecisaoOperacional = () =>
  montarPacoteNcs({
    naturezaCognitiva: "decisao_operacional",
    confiancaNatureza: 0.85,
    fundamentoNatureza: "Escolha entre alternativas concretas"
  });

export const fixturePacotePlanejamento = () =>
  montarPacoteNcs({
    naturezaCognitiva: "planejamento",
    confiancaNatureza: 0.8,
    fundamentoNatureza: "Pedido de plano estruturado"
  });

export const fixturePacoteExplicacao = () =>
  montarPacoteNcs({
    naturezaCognitiva: "explicacao",
    confiancaNatureza: 0.88,
    fundamentoNatureza: "Pedido de justificação de estado existente"
  });

/** Natureza fora do catálogo. */
export const fixturePacoteNaturezaIlegal = () => ({
  naturezaCognitiva: "decisao",
  confiancaNatureza: 0.5,
  fundamentoNatureza: "valor livre ilegal",
  exigeItensConcretos: false,
  politicaLacunas: "inventario_nao_obrigatorio",
  modoEsperadoEstagio6: "entregar_criterios"
});

/** Campos obrigatórios em falta. */
export const fixturePacoteIncompleto = () => ({
  naturezaCognitiva: "metodo_de_decisao"
});
