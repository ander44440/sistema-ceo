/**
 * Componente M — Planejamento Executivo (IMP-008 / ARQ-011).
 *
 * Emite recomendação somente após Análise Executiva suficiente (L)
 * e monta plano coordenado (proposta ≠ vigência). Não executa MG2.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoPlanejamentoExecutivo = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VIGENCIA = Object.freeze({
    PROPOSTA: "proposta",
    VIGENTE: "vigente",
    NA: "N/A"
  });

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function criar(deps) {
    const d = deps || {};
    const analiseApi = d.analise;
    if (!analiseApi || typeof analiseApi.obterAnalise !== "function") {
      throw new TypeError(
        "M requer dependência analise (componente L) com obterAnalise."
      );
    }

    let seqRec = 0;
    let seqPlano = 0;
    const recomendacoes = new Map();
    const planos = new Map();

    function resolverAnalise(analiseOuId) {
      if (analiseOuId && typeof analiseOuId === "object" && analiseOuId.id) {
        return analiseOuId;
      }
      return analiseApi.obterAnalise(analiseOuId);
    }

    function recomendar(opcoes) {
      const opts = opcoes || {};
      const analise = resolverAnalise(opts.analise || opts.analiseId);

      if (analise.suficiencia !== "suficiente") {
        throw new Error(
          "RF-03/RF-04: M bloqueia recomendação — Análise Executiva insuficiente (" +
            analise.id +
            ")."
        );
      }

      const enunciado =
        texto(opts.enunciado) ||
        texto(analise.objetivo) ||
        "Avançar conforme justificativa da análise " + analise.id;

      if (!texto(enunciado)) {
        throw new Error("RF-04: enunciado da recomendação não pode ser vazio.");
      }

      seqRec += 1;
      const recomendacao = Object.freeze({
        id: "REC-" + String(seqRec).padStart(3, "0"),
        enunciado: enunciado,
        analiseId: analise.id,
        vigencia: VIGENCIA.PROPOSTA,
        confianca: texto(opts.confianca) || analise.confianca,
        incertezasRemanescentes: analise.incertezasRemanescentes,
        justificativaTiming: analise.justificativaTiming,
        avisoVigencia:
          "Recomendação proposta — não vigora até confirmação do patrocinador.",
        fronteiraExecucao:
          "Recomendação ≠ execução: orientação apenas; execução MG2 permanece fora do CEO."
      });

      recomendacoes.set(recomendacao.id, {
        recomendacao: recomendacao,
        analise: analise
      });
      return recomendacao;
    }

    function planejar(opcoes) {
      const opts = opcoes || {};
      let recomendacao = opts.recomendacao;
      let entry = null;

      if (typeof opts.recomendacaoId === "string") {
        if (!recomendacoes.has(opts.recomendacaoId)) {
          throw new Error(
            "Recomendação desconhecida para planejamento: " + opts.recomendacaoId
          );
        }
        entry = recomendacoes.get(opts.recomendacaoId);
        recomendacao = entry.recomendacao;
      } else if (recomendacao && recomendacao.id) {
        if (!recomendacoes.has(recomendacao.id)) {
          // aceita objeto emitido por esta instância se re-registrado
          recomendacoes.set(recomendacao.id, {
            recomendacao: recomendacao,
            analise: resolverAnalise(recomendacao.analiseId)
          });
        }
        entry = recomendacoes.get(recomendacao.id);
        recomendacao = entry.recomendacao;
      } else {
        throw new Error(
          "RF-05: informe recomendacao ou recomendacaoId para planejar."
        );
      }

      const analise = entry.analise || resolverAnalise(recomendacao.analiseId);
      if (analise.suficiencia !== "suficiente") {
        throw new Error(
          "RF-03/RF-05: não é permitido planejar a partir de análise insuficiente."
        );
      }

      let passos = opts.passos;
      if (!Array.isArray(passos) || !passos.length) {
        passos = [
          {
            id: "P1",
            enunciado: recomendacao.enunciado,
            ordem: 1
          }
        ];
      }

      const passosNorm = passos.map(function (p, idx) {
        if (typeof p === "string") {
          return Object.freeze({
            id: "P" + (idx + 1),
            enunciado: texto(p),
            ordem: idx + 1
          });
        }
        return Object.freeze({
          id: p.id || "P" + (idx + 1),
          enunciado: texto(p.enunciado) || texto(p.titulo) || "Passo " + (idx + 1),
          ordem: p.ordem != null ? p.ordem : idx + 1,
          dependeDe: p.dependeDe || null
        });
      });

      const ordemOuDependencias =
        texto(opts.ordemOuDependencias) ||
        (passosNorm.length === 1
          ? "Passo único justificado pela recomendação " + recomendacao.id
          : "Ordem sequencial dos passos conforme enunciado");

      seqPlano += 1;
      const plano = Object.freeze({
        id: "PLN-" + String(seqPlano).padStart(3, "0"),
        passos: Object.freeze(passosNorm),
        ordemOuDependencias: ordemOuDependencias,
        recomendacaoId: recomendacao.id,
        analiseId: analise.id,
        vigencia: VIGENCIA.PROPOSTA,
        avisoVigencia:
          "Plano proposto — não vigora até confirmação do patrocinador.",
        fronteiraExecucao:
          "Plano ≠ execução: o CEO não executa o MG2; execução permanece fora.",
        confianca: recomendacao.confianca
      });

      planos.set(plano.id, plano);
      return plano;
    }

    function obterRecomendacao(id) {
      if (!id || !recomendacoes.has(id)) {
        throw new Error("Recomendação desconhecida: " + id);
      }
      return recomendacoes.get(id).recomendacao;
    }

    function obterPlano(id) {
      if (!id || !planos.has(id)) {
        throw new Error("Plano desconhecido: " + id);
      }
      return planos.get(id);
    }

    return Object.freeze({
      recomendar: recomendar,
      planejar: planejar,
      obterRecomendacao: obterRecomendacao,
      obterPlano: obterPlano
    });
  }

  return Object.freeze({
    VIGENCIA: VIGENCIA,
    criar: criar
  });
});
