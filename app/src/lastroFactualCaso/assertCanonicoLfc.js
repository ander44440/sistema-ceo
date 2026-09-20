/**
 * Infraestrutura de teste LFC — validação canónica (IMP-092.3).
 * Uso exclusivo em testes. Não faz parte do contrato de produção.
 *
 * Impede falso PASS quando a recuperação veio de `reparse_fallback`
 * em vez do LfcReader.
 */

import assert from "node:assert/strict";

/** Fontes admitidas como leitura canónica do LFC. */
export const FONTES_LEITURA_CANONICA_LFC = Object.freeze(["lfc_reader"]);

/** Fontes admitidas como escrita canónica do LFC. */
export const FONTES_ESCRITA_CANONICA_LFC = Object.freeze(["lfc_writer"]);

/**
 * @param {unknown} out — resultado de processarTurnoLfc
 * @returns {boolean}
 */
export function ehReparseFallback(out) {
  return Boolean(out && out.fonte === "reparse_fallback");
}

/**
 * Leitura canónica: exige fonte lfc_reader.
 * reparse_fallback → FAIL explícito (nunca PASS de persistência).
 *
 * @param {{ fonte?: string, activo?: boolean, mensagem?: string }|null|undefined} out
 * @param {string} [rotulo]
 */
export function assertLeituraCanonicaLfc(out, rotulo = "recuperação LFC") {
  if (!out || out.activo !== true) {
    assert.fail(
      `[LFC canónico FAIL] ${rotulo}: resposta inactiva ou ausente (esperado fonte=lfc_reader).`
    );
  }
  if (ehReparseFallback(out)) {
    assert.fail(
      `[LFC canónico FAIL/NA] ${rotulo}: fonte=reparse_fallback — não conta como recuperação canónica do LFC.`
    );
  }
  assert.equal(
    out.fonte,
    "lfc_reader",
    `[LFC canónico FAIL] ${rotulo}: esperado fonte=lfc_reader, obtido fonte=${String(out.fonte)}.`
  );
}

/**
 * Escrita canónica: exige fonte lfc_writer (e nunca reparse).
 *
 * @param {{ fonte?: string, activo?: boolean }|null|undefined} out
 * @param {string} [rotulo]
 */
export function assertEscritaCanonicaLfc(out, rotulo = "escrita LFC") {
  if (!out || out.activo !== true) {
    assert.fail(
      `[LFC canónico FAIL] ${rotulo}: resposta inactiva ou ausente (esperado fonte=lfc_writer).`
    );
  }
  if (ehReparseFallback(out)) {
    assert.fail(
      `[LFC canónico FAIL/NA] ${rotulo}: fonte=reparse_fallback — inválido para escrita canónica.`
    );
  }
  assert.equal(
    out.fonte,
    "lfc_writer",
    `[LFC canónico FAIL] ${rotulo}: esperado fonte=lfc_writer, obtido fonte=${String(out.fonte)}.`
  );
}
