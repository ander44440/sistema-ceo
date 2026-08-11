/**
 * E4 — Inventário de formulações de sequenciamento que AINDA escapam
 * de `ehRecomendacaoOperacional` (marcador insuficiente → C2/MRE).
 *
 * NÃO altera a regra. Caracteriza o gap actual.
 * Quando a regra for alargada: esvaziar `GAPS_ACTUAIS` e activar
 * os testes de contrato desejado (bloco «após alargamento»).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ehRecomendacaoOperacional,
  temMarcadorRecomendacao,
  temObjetoOperacional,
  ehDeliberacaoDeProposta
} from "./recomendacaoOperacional.js";
import { normalizarTexto } from "./lexicon.js";
import { classificar } from "./regras.js";

/**
 * Formulações de sequenciamento/prioridade operacional que DEVEM cair em C4
 * quando a regra for alargada — hoje escapam (marcador=false, objecto=true).
 *
 * Familias de gap:
 * A — «qual a (próxima) prioridade» sem «é» / «deve ser»
 * B — «após/depois de» + infinitivo («validar») em vez de substantivo («validação»)
 * C — marco temporal / participio («quando validarmos», «concluída», «validada»)
 * D — «a seguir» / «na sequência» sem «depois|após|qual sequência»
 * E — elipse conversacional («E depois?») com sprint só entre parênteses
 */
export const FORMULACOES_SEQUENCIAMENTO_DESEJADAS = Object.freeze([
  // A — artigo + prioridade sem auxiliar
  {
    id: "A1",
    familia: "qual_a_proxima_prioridade",
    texto: "Qual a próxima prioridade?",
    nota: "falta «é»/«deve ser»; objecto=prioridade"
  },
  {
    id: "A2",
    familia: "qual_a_proxima_prioridade",
    texto: "Qual a próxima prioridade operacional?",
    nota: "idem + «operacional»"
  },
  {
    id: "A3",
    familia: "qual_a_proxima_prioridade",
    texto: "Após validar a Sprint 1, qual a próxima prioridade?",
    nota: "A + B compostos"
  },
  {
    id: "A4",
    familia: "qual_a_proxima_prioridade",
    texto: "Depois de validar a Sprint 1, qual a prioridade?",
    nota: "A + B"
  },
  {
    id: "A5",
    familia: "qual_a_proxima_prioridade",
    texto: "Quando validarmos a Sprint 1, qual a prioridade?",
    nota: "A + C"
  },
  {
    id: "A6",
    familia: "qual_a_proxima_prioridade",
    texto: "Concluída a Sprint 1, qual a prioridade?",
    nota: "A + C"
  },
  {
    id: "A7",
    familia: "qual_a_proxima_prioridade",
    texto: "Com a Sprint 1 validada, qual a prioridade?",
    nota: "A + C"
  },
  {
    id: "A8",
    familia: "qual_a_proxima_prioridade",
    texto: "Uma vez validada a Sprint 1, qual a prioridade?",
    nota: "A + C"
  },
  {
    id: "A9",
    familia: "qual_a_proxima_prioridade",
    texto: "A seguir da Sprint 1, qual a prioridade?",
    nota: "A + D"
  },
  {
    id: "A10",
    familia: "qual_a_proxima_prioridade",
    texto: "Passada a validação da Sprint 1, qual a prioridade?",
    nota: "A + C (passada a validação)"
  },

  // B — após/depois + infinitivo; «o que vem» sem «depois»
  {
    id: "B1",
    familia: "apos_infinitivo",
    texto: "Após validar a Sprint 1, o que vem?",
    nota: "«após validar» ≠ «após validação»; «o que vem» ≠ «o que vem depois»"
  },
  {
    id: "B2",
    familia: "apos_infinitivo",
    texto: "Depois de validarmos a Sprint 1, o que priorizar?",
    nota: "depois de + flexão verbal"
  },

  // D — sequência lexical sem marcador actual
  {
    id: "D1",
    familia: "na_sequencia",
    texto: "Na sequência da Sprint 1, o que fazer?",
    nota: "«na sequência» não activa «qual sequência»; «o que fazer» é só objecto"
  },
  {
    id: "D2",
    familia: "na_sequencia",
    texto: "Feita a validação da Sprint 1, o que vem?",
    nota: "marco + «o que vem» sem «depois»"
  },

  // E — elipse (baixo prioridade de cobertura, mas documentada)
  {
    id: "E1",
    familia: "elipse",
    texto: "E depois? (Sprint 1)",
    nota: "«depois» sem complemento operacional no padrão actual; sprint só entre parênteses"
  }
]);

/** Snapshot do inventário actual — deve coincidir com escapes reais. */
export const GAPS_ACTUAIS = Object.freeze(
  FORMULACOES_SEQUENCIAMENTO_DESEJADAS.map((x) => x.id)
);

/** Controlo negativo: NÃO devem virar recomendação operacional. */
const CONTROLO_DELIBERATIVO = Object.freeze([
  "Analise a proposta do bairro popular.",
  "Você recomenda aprovar a proposta do bairro?",
  "Avalie segundo o Manifesto."
]);

/** Controlo positivo: já cobertas pela regra actual. */
const CONTROLO_JA_COBERTO = Object.freeze([
  "Qual deve ser nossa prioridade depois da validação da Sprint 1?",
  "o que vem depois da Sprint 1?",
  "qual sequência devemos seguir depois da Sprint 1?",
  "Após a validação da Sprint 1, qual deve ser a prioridade?",
  "Qual a próxima prioridade após a Sprint 1?",
  "Validada a Sprint 1, qual deve ser a prioridade?"
]);

function diagnostico(texto) {
  const n = normalizarTexto(texto);
  return {
    operacional: ehRecomendacaoOperacional(texto),
    marcador: temMarcadorRecomendacao(n),
    objeto: temObjetoOperacional(n),
    deliberacao: ehDeliberacaoDeProposta(texto),
    classe: classificar(texto).classe
  };
}

test("caracterização: inventário de gaps coincide com escapes reais", () => {
  const escapes = FORMULACOES_SEQUENCIAMENTO_DESEJADAS.filter(
    (f) => !ehRecomendacaoOperacional(f.texto)
  ).map((f) => f.id);

  assert.deepEqual(
    escapes,
    [...GAPS_ACTUAIS],
    "Se falhar: ou a regra já cobriu um gap (remover do inventário) " +
      "ou surgiu um novo escape (adicionar ao inventário)."
  );
});

test("caracterização: cada gap tem objecto operacional mas NÃO marcador", () => {
  for (const f of FORMULACOES_SEQUENCIAMENTO_DESEJADAS) {
    const d = diagnostico(f.texto);
    assert.equal(d.operacional, false, `${f.id} ainda deve escapar`);
    assert.equal(d.marcador, false, `${f.id}: causa = marcador ausente (${f.nota})`);
    assert.equal(d.objeto, true, `${f.id}: objecto operacional presente`);
    assert.equal(d.deliberacao, false, `${f.id}: não é deliberação de proposta`);
    assert.notEqual(
      d.classe,
      "comando_operacional",
      `${f.id}: hoje não é C4 (vai a ${d.classe})`
    );
  }
});

test("controlo positivo: formulações já cobertas continuam operacionais", () => {
  for (const texto of CONTROLO_JA_COBERTO) {
    assert.equal(
      ehRecomendacaoOperacional(texto),
      true,
      `regressão: deveria continuar coberta: ${texto}`
    );
    assert.equal(classificar(texto).classe, "comando_operacional", texto);
  }
});

test("controlo negativo: deliberação de proposta não entra no inventário operacional", () => {
  for (const texto of CONTROLO_DELIBERATIVO) {
    assert.equal(ehRecomendacaoOperacional(texto), false, texto);
    assert.equal(ehDeliberacaoDeProposta(texto), true, texto);
  }
});

/**
 * Contrato desejado (ainda não activo).
 * Activar quando alargar `temMarcadorRecomendacao` — e esvaziar GAPS_ACTUAIS.
 */
test("contrato desejado: gaps devem tornar-se C4 (PENDENTE — não alterar regra ainda)", {
  todo: true
}, () => {
  for (const f of FORMULACOES_SEQUENCIAMENTO_DESEJADAS) {
    assert.equal(
      ehRecomendacaoOperacional(f.texto),
      true,
      `${f.id} → operacional`
    );
    assert.equal(
      classificar(f.texto).classe,
      "comando_operacional",
      `${f.id} → C4`
    );
  }
});
