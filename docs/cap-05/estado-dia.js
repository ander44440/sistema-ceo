/**
 * Adaptador do Estado do Dia (módulo F / ARQ-008) para a CAP-05.
 * Fornece somente estado registrado — não inventa conteúdo.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoEstadoDia = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CONTEXTO_ATIVO = "Motoboy Game 2 (MG2)";
  const STORE_KEY = "ceo.cap05.estado-dia.v1";

  const ESTADO_INICIAL = {
    contexto: CONTEXTO_ATIVO,
    status: "fechado",
    foco: "Fechar o fluxo de corrida até o payout do motoboy",
    onde: "Revisado o cálculo de taxa no cenário de cancelamento",
    proximo: "Decidir regra de taxa em corrida cancelada",
    atencoes: ["Decisão: zerar ou ratear a taxa no cancelamento"],
    vinculos: ["DEC-MVP-001"]
  };

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function criar(storage) {
    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function"
    ) {
      throw new TypeError("Storage compatível com getItem/setItem é obrigatório.");
    }

    function ler() {
      const bruto = storage.getItem(STORE_KEY);
      if (!bruto) return null;
      try {
        return JSON.parse(bruto);
      } catch (_erro) {
        return null;
      }
    }

    function salvar(estado) {
      storage.setItem(STORE_KEY, JSON.stringify(estado));
    }

    function inicializar() {
      const existente = ler();
      if (existente) return copiar(existente);
      salvar(ESTADO_INICIAL);
      return copiar(ESTADO_INICIAL);
    }

    function obter() {
      const estado = ler();
      if (!estado) {
        return {
          status: "ausente",
          contexto: CONTEXTO_ATIVO,
          mensagem:
            "Ausência explícita: nenhum estado do Dia registrado para o contexto MG2.",
          estado: null
        };
      }
      return {
        status: "encontrado",
        contexto: CONTEXTO_ATIVO,
        estado: copiar(estado)
      };
    }

    function atualizar(parcial) {
      const atual = ler() || copiar(ESTADO_INICIAL);
      const proximo = {
        contexto: CONTEXTO_ATIVO,
        status: texto(parcial.status) || atual.status,
        foco: texto(parcial.foco) || atual.foco,
        onde: texto(parcial.onde) || atual.onde,
        proximo: texto(parcial.proximo) || atual.proximo,
        atencoes: Array.isArray(parcial.atencoes)
          ? parcial.atencoes.map(texto).filter(Boolean).slice(0, 3)
          : atual.atencoes,
        vinculos: Array.isArray(parcial.vinculos)
          ? parcial.vinculos.map(texto).filter(Boolean)
          : atual.vinculos
      };
      salvar(proximo);
      return copiar(proximo);
    }

    return Object.freeze({
      inicializar: inicializar,
      obter: obter,
      atualizar: atualizar
    });
  }

  return Object.freeze({
    STORE_KEY: STORE_KEY,
    CONTEXTO_ATIVO: CONTEXTO_ATIVO,
    criar: criar
  });
});
