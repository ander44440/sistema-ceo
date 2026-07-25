/**
 * Componente J — Coordenação de Papéis (IMP-006 E4).
 *
 * Classifica atenção em Patrocinador / CTO / Engenheiro com base em
 * memória e estado. Não substitui deliberação nem implementação.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoCoordenacaoPapeis = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PAPEIS = Object.freeze({
    PATROCINADOR: "Patrocinador",
    CTO: "CTO",
    ENGENHEIRO: "Engenheiro"
  });

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function classificarTexto(enunciado) {
    const t = texto(enunciado).toLocaleLowerCase("pt-BR");
    if (!t) return PAPEIS.PATROCINADOR;

    if (
      /\b(req-|arq-|adr-|requisito|arquitetura|homolog|valida[cç][aã]o|cto)\b/i.test(
        t
      )
    ) {
      return PAPEIS.CTO;
    }
    if (
      /(implement|c[oó]digo|teste|commit|build|engenheir|cursor)/i.test(t)
    ) {
      return PAPEIS.ENGENHEIRO;
    }
    if (
      /(decis|prioridade|confirmar|autoridade|foco|pr[oó]ximo passo)/i.test(t)
    ) {
      return PAPEIS.PATROCINADOR;
    }
    // RN-05.2 — sem papel claro permanece com o Patrocinador
    return PAPEIS.PATROCINADOR;
  }

  function criar(deps) {
    if (!deps || !deps.memoria || !deps.estadoDia) {
      throw new TypeError("memoria (H) e estadoDia (F) são obrigatórios.");
    }

    function coordenar(opcoes) {
      const opts = opcoes || {};
      const estadoRes = deps.estadoDia.obter();
      const memoriaRes = deps.memoria.listar();
      const itens = [];

      if (Array.isArray(opts.itens) && opts.itens.length) {
        opts.itens.forEach(function (item, idx) {
          const enunciado = texto(item && (item.enunciado || item));
          itens.push({
            id: (item && item.id) || "ATT-EXT-" + (idx + 1),
            enunciado: enunciado || "— (ausente)",
            origem: "explicito",
            papel: classificarTexto(enunciado),
            base: "Item informado pelo estado/memória operacional"
          });
        });
      }

      if (estadoRes.status === "encontrado" && estadoRes.estado) {
        (estadoRes.estado.atencoes || []).forEach(function (att, idx) {
          itens.push({
            id: "ATT-F-" + (idx + 1),
            enunciado: att,
            origem: "F",
            papel: classificarTexto(att),
            base: "Estado do Dia — atenção pendente"
          });
        });
      }

      if (memoriaRes.status === "encontrado") {
        memoriaRes.registros.slice(0, 5).forEach(function (reg) {
          itens.push({
            id: "ATT-H-" + reg.id,
            enunciado: "Acompanhar efeito da decisão " + reg.id + ": " + reg.decisao,
            origem: "H",
            papel: classificarTexto(reg.decisao + " " + reg.resultado),
            base: "Memória Organizacional " + reg.id
          });
        });
      }

      if (!itens.length) {
        return {
          status: "ausente",
          mensagem:
            "Ausência explícita: nenhum item de atenção classificável a partir de memória/estado.",
          porPapel: {
            Patrocinador: [],
            CTO: [],
            Engenheiro: []
          },
          itens: []
        };
      }

      const porPapel = {
        Patrocinador: [],
        CTO: [],
        Engenheiro: []
      };
      itens.forEach(function (item) {
        porPapel[item.papel].push(item);
      });

      return {
        status: "encontrado",
        mensagem:
          "Atenção classificada por papel. O CEO coordena o fluxo; não substitui CTO nem Engenheiro.",
        porPapel: porPapel,
        itens: itens
      };
    }

    return Object.freeze({
      coordenar: coordenar,
      classificarTexto: classificarTexto
    });
  }

  return Object.freeze({
    PAPEIS: PAPEIS,
    criar: criar,
    classificarTexto: classificarTexto
  });
});
