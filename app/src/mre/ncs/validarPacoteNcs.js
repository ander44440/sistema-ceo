/**
 * C4 — Validador de fronteira do Pacote NCS (IMP-020 B1).
 * Determinístico; sem LLM; sem acoplamento ao pipeline.
 */

import {
  ModoEsperadoEstagio6,
  NaturezaCognitiva,
  PoliticaLacunasNcs,
  ehNaturezaCognitiva
} from "./catalogo.js";
import { derivarCamposNcs } from "./pacote.js";

/**
 * @typedef {{ regra: string, caminho: string, mensagem: string }} ViolacaoNcs
 * @typedef {{ ok: boolean, violacoes: ViolacaoNcs[] }} ResultadoValidacaoNcs
 */

/**
 * @param {string} regra
 * @param {string} caminho
 * @param {string} mensagem
 * @returns {ViolacaoNcs}
 */
function v(regra, caminho, mensagem) {
  return { regra, caminho, mensagem };
}

/**
 * @param {unknown} pacote
 * @returns {ResultadoValidacaoNcs}
 */
export function validarPacoteNcs(pacote) {
  /** @type {ViolacaoNcs[]} */
  const violacoes = [];

  if (pacote === null || typeof pacote !== "object" || Array.isArray(pacote)) {
    return {
      ok: false,
      violacoes: [v("NCS-V1", "pacote", "Pacote NCS deve ser um objeto")]
    };
  }

  const p = /** @type {Record<string, unknown>} */ (pacote);

  if (!ehNaturezaCognitiva(p.naturezaCognitiva)) {
    violacoes.push(
      v(
        "NCS-V1",
        "naturezaCognitiva",
        `Valor inválido ou ausente; esperado um de: ${NaturezaCognitiva.join(" | ")}`
      )
    );
  }

  if (typeof p.confiancaNatureza !== "number" || Number.isNaN(p.confiancaNatureza)) {
    violacoes.push(
      v("NCS-V1", "confiancaNatureza", "confiancaNatureza deve ser número")
    );
  } else if (p.confiancaNatureza < 0 || p.confiancaNatureza > 1) {
    violacoes.push(
      v("NCS-V1", "confiancaNatureza", "confiancaNatureza deve estar em [0, 1]")
    );
  }

  if (typeof p.fundamentoNatureza !== "string" || !p.fundamentoNatureza.trim()) {
    violacoes.push(
      v("NCS-V1", "fundamentoNatureza", "fundamentoNatureza obrigatório e não vazio")
    );
  }

  if (typeof p.exigeItensConcretos !== "boolean") {
    violacoes.push(
      v("NCS-V1", "exigeItensConcretos", "exigeItensConcretos deve ser boolean")
    );
  }

  if (
    typeof p.politicaLacunas !== "string" ||
    !PoliticaLacunasNcs.includes(p.politicaLacunas)
  ) {
    violacoes.push(
      v(
        "NCS-V1",
        "politicaLacunas",
        `politicaLacunas inválida; esperado um de: ${PoliticaLacunasNcs.join(" | ")}`
      )
    );
  }

  if (
    typeof p.modoEsperadoEstagio6 !== "string" ||
    !ModoEsperadoEstagio6.includes(p.modoEsperadoEstagio6)
  ) {
    violacoes.push(
      v(
        "NCS-V1",
        "modoEsperadoEstagio6",
        `modoEsperadoEstagio6 inválido; esperado um de: ${ModoEsperadoEstagio6.join(" | ")}`
      )
    );
  }

  // Consistência com derivações canónicas quando a natureza é válida
  if (ehNaturezaCognitiva(p.naturezaCognitiva) && violacoes.length === 0) {
    const d = derivarCamposNcs(/** @type {string} */ (p.naturezaCognitiva));
    if (p.exigeItensConcretos !== d.exigeItensConcretos) {
      violacoes.push(
        v(
          "NCS-V2",
          "exigeItensConcretos",
          `Inconsistente com natureza ${p.naturezaCognitiva} (esperado ${d.exigeItensConcretos})`
        )
      );
    }
    if (p.politicaLacunas !== d.politicaLacunas) {
      violacoes.push(
        v(
          "NCS-V2",
          "politicaLacunas",
          `Inconsistente com natureza ${p.naturezaCognitiva} (esperado ${d.politicaLacunas})`
        )
      );
    }
    if (p.modoEsperadoEstagio6 !== d.modoEsperadoEstagio6) {
      violacoes.push(
        v(
          "NCS-V2",
          "modoEsperadoEstagio6",
          `Inconsistente com natureza ${p.naturezaCognitiva} (esperado ${d.modoEsperadoEstagio6})`
        )
      );
    }
  } else if (ehNaturezaCognitiva(p.naturezaCognitiva)) {
    // Natureza ok mas já há V1 — ainda assim checar coerência booleana clássica
    const esperadoExige = p.naturezaCognitiva === "decisao_operacional";
    if (
      typeof p.exigeItensConcretos === "boolean" &&
      p.exigeItensConcretos !== esperadoExige
    ) {
      violacoes.push(
        v(
          "NCS-V2",
          "exigeItensConcretos",
          `Deve ser ${esperadoExige} para natureza ${p.naturezaCognitiva}`
        )
      );
    }
  }

  return { ok: violacoes.length === 0, violacoes };
}
