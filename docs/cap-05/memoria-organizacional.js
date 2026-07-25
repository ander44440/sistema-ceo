/**
 * Componente H — Memória Organizacional Viva (IMP-006 E1).
 *
 * Persiste e recupera somente decisões registradas no contexto MG2.
 * Não monta contexto, recomenda, prioriza ou coordena papéis (E2+).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoMemoriaOrganizacional = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORE_KEY = "ceo.cap05.memoria-organizacional.v1";
  const CONTEXTO_ATIVO = "Motoboy Game 2 (MG2)";
  const CAMPOS_OBRIGATORIOS = [
    "quem",
    "quando",
    "porque",
    "baseadoEm",
    "resultado"
  ];

  const REGISTROS_INICIAIS = [
    {
      id: "DEC-MVP-001",
      contexto: CONTEXTO_ATIVO,
      decisao:
        "No cancelamento de corrida, a taxa do motoboy será zerada (não rateada) nesta versão",
      quem: "Patrocinador (MVP)",
      quando: "2026-07-23",
      porque: "Evitar ambiguidade no payout e alinhar expectativa do entregador",
      baseadoEm:
        "Revisão do cálculo de taxa no cenário de corrida cancelada; atenção pendente do Dia",
      resultado: "Regra clara para implementar no edge case de cancelamento"
    }
  ];

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function validarStorage(storage) {
    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function"
    ) {
      throw new TypeError("Storage compatível com getItem/setItem é obrigatório.");
    }
  }

  function validarRegistro(registro) {
    const ausentes = [];
    if (!texto(registro && registro.decisao)) ausentes.push("decisao");
    CAMPOS_OBRIGATORIOS.forEach(function (campo) {
      if (!texto(registro && registro[campo])) ausentes.push(campo);
    });
    if (ausentes.length) {
      throw new TypeError(
        "Registro decisório incompleto. Campos obrigatórios ausentes: " +
          ausentes.join(", ") +
          "."
      );
    }
  }

  function normalizar(registro, id) {
    validarRegistro(registro);
    return {
      id: texto(registro.id) || id,
      contexto: CONTEXTO_ATIVO,
      decisao: texto(registro.decisao),
      quem: texto(registro.quem),
      quando: texto(registro.quando),
      porque: texto(registro.porque),
      baseadoEm: texto(registro.baseadoEm),
      resultado: texto(registro.resultado)
    };
  }

  function criar(storage) {
    validarStorage(storage);

    function ler() {
      const bruto = storage.getItem(STORE_KEY);
      if (!bruto) return [];
      try {
        const dados = JSON.parse(bruto);
        return Array.isArray(dados) ? dados : [];
      } catch (_erro) {
        return [];
      }
    }

    function salvar(registros) {
      storage.setItem(STORE_KEY, JSON.stringify(registros));
    }

    function inicializar() {
      const existentes = ler();
      if (existentes.length) return copiar(existentes);
      salvar(REGISTROS_INICIAIS);
      return copiar(REGISTROS_INICIAIS);
    }

    function listar() {
      const registros = ler();
      if (!registros.length) {
        return {
          status: "ausente",
          contexto: CONTEXTO_ATIVO,
          registros: [],
          mensagem:
            "Ausência explícita: nenhuma decisão registrada na Memória Organizacional do contexto MG2."
        };
      }
      return {
        status: "encontrado",
        contexto: CONTEXTO_ATIVO,
        registros: copiar(registros)
      };
    }

    function consultar(termo) {
      const busca = texto(termo).toLocaleLowerCase("pt-BR");
      if (!busca) {
        return {
          status: "ausente",
          contexto: CONTEXTO_ATIVO,
          registros: [],
          mensagem: "Ausência explícita: informe um tema para consultar a memória registrada."
        };
      }

      const encontrados = ler().filter(function (registro) {
        return [
          registro.id,
          registro.decisao,
          registro.quem,
          registro.quando,
          registro.porque,
          registro.baseadoEm,
          registro.resultado,
          registro.contexto
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(busca);
      });

      if (!encontrados.length) {
        return {
          status: "ausente",
          contexto: CONTEXTO_ATIVO,
          registros: [],
          mensagem:
            "Ausência explícita: nada registrado sobre “" +
            texto(termo) +
            "” no contexto MG2."
        };
      }

      return {
        status: "encontrado",
        contexto: CONTEXTO_ATIVO,
        registros: copiar(encontrados)
      };
    }

    function registrar(registro) {
      const registros = ler();
      const proximoId =
        "DEC-ORG-" + String(registros.length + 1).padStart(3, "0");
      const novo = normalizar(registro, proximoId);
      if (registros.some(function (item) { return item.id === novo.id; })) {
        throw new TypeError("Já existe um registro com o ID " + novo.id + ".");
      }
      registros.push(novo);
      salvar(registros);
      return copiar(novo);
    }

    return Object.freeze({
      inicializar: inicializar,
      listar: listar,
      consultar: consultar,
      registrar: registrar
    });
  }

  return Object.freeze({
    STORE_KEY: STORE_KEY,
    CONTEXTO_ATIVO: CONTEXTO_ATIVO,
    CAMPOS_OBRIGATORIOS: CAMPOS_OBRIGATORIOS.slice(),
    criar: criar
  });
});
