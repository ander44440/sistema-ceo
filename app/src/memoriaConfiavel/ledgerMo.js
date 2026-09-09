/**
 * Ledger MO Art. 8º — API append-only + consulta + hidratação.
 */

import {
  calcularConteudoHash,
  copiarProfundo,
  documentoVazioMo,
  gerarIdRegistroMo,
  normalizarRegistroMo,
  texto,
  validarEntradaRegistroMo
} from "./dominio.js";
import {
  ErroPersistenciaMo,
  carregarDocumentoMo,
  criarDocumentoVazioPersistivel,
  gravarDocumentoMo,
  limparDocumentoMo,
  mediumPersistenciaMo
} from "./persistenciaMo.js";

/** @type {object} */
let cacheDoc = documentoVazioMo();

/** @type {"nao_hidratado"|"ok"|"ausente"|"corrupto"} */
let estadoHidratacao = "nao_hidratado";

/** @type {string|null} */
let motivoCorrupcao = null;

function exigirHidratacaoOk() {
  if (estadoHidratacao === "corrupto") {
    throw new ErroPersistenciaMo(
      "Ledger MO em estado corrupto — append recusado até limpeza explícita.",
      undefined,
      "estado_corrupto"
    );
  }
  if (estadoHidratacao === "nao_hidratado") {
    hidratarMemoriaConfiavel();
  }
  if (estadoHidratacao === "corrupto") {
    throw new ErroPersistenciaMo(
      "Ledger MO em estado corrupto — append recusado até limpeza explícita.",
      undefined,
      "estado_corrupto"
    );
  }
}

/**
 * @param {object} doc
 * @returns {object}
 */
function clonarDoc(doc) {
  return {
    versao: doc.versao,
    eixo: doc.eixo,
    actualizadoEm: doc.actualizadoEm ?? null,
    registos: Array.isArray(doc.registos)
      ? doc.registos.map((r) => copiarProfundo(r))
      : []
  };
}

/**
 * Hidrata cache a partir do storage. Fail-closed se corrupto (não apaga chave).
 * @returns {{ ok: boolean, total: number, medium: string, status: string, motivo?: string }}
 */
export function hidratarMemoriaConfiavel() {
  const lido = carregarDocumentoMo();
  if (lido.status === "ausente") {
    cacheDoc = criarDocumentoVazioPersistivel();
    estadoHidratacao = "ausente";
    motivoCorrupcao = null;
    return {
      ok: true,
      total: 0,
      medium: lido.medium,
      status: "ausente"
    };
  }
  if (lido.status === "corrupto") {
    cacheDoc = documentoVazioMo();
    estadoHidratacao = "corrupto";
    motivoCorrupcao = lido.motivo || "corrupto";
    return {
      ok: false,
      total: 0,
      medium: lido.medium,
      status: "corrupto",
      motivo: motivoCorrupcao
    };
  }
  cacheDoc = clonarDoc(lido.doc);
  estadoHidratacao = "ok";
  motivoCorrupcao = null;
  return {
    ok: true,
    total: cacheDoc.registos.length,
    medium: lido.medium,
    status: "ok"
  };
}

/**
 * @returns {{ versao: number, total: number, actualizadoEm: string|null, medium: string, status: string, motivo?: string }}
 */
export function obterEstadoPersistenciaMo() {
  return {
    versao: cacheDoc.versao,
    total: cacheDoc.registos.length,
    actualizadoEm: cacheDoc.actualizadoEm,
    medium: mediumPersistenciaMo(),
    status: estadoHidratacao,
    ...(motivoCorrupcao ? { motivo: motivoCorrupcao } : {})
  };
}

/**
 * Uma tentativa de append sobre um documento base.
 * @param {object} docBase
 * @param {object} registo
 * @returns {object} novoDoc
 */
function aplicarAppend(docBase, registo) {
  const registos = Array.isArray(docBase.registos)
    ? docBase.registos.map((r) => copiarProfundo(r))
    : [];

  if (registos.some((r) => r && r.id === registo.id)) {
    throw new ErroPersistenciaMo(
      `Registo MO duplicado por id: ${registo.id}`,
      undefined,
      "duplicado_id"
    );
  }
  if (
    registos.some(
      (r) =>
        r &&
        r.coaId === registo.coaId &&
        r.conteudoHash === registo.conteudoHash
    )
  ) {
    throw new ErroPersistenciaMo(
      `Registo MO duplicado por conteudoHash+coaId (${registo.coaId})`,
      undefined,
      "duplicado_hash"
    );
  }

  registos.push(copiarProfundo(registo));
  return {
    versao: docBase.versao,
    eixo: docBase.eixo,
    actualizadoEm: new Date().toISOString(),
    registos
  };
}

/**
 * @param {object} entrada
 * @returns {object} RegistroMo (cópia)
 * @throws {ErroPersistenciaMo}
 */
export function appendRegistroMo(entrada) {
  exigirHidratacaoOk();

  const validacao = validarEntradaRegistroMo(entrada);
  if (!validacao.ok) {
    throw new ErroPersistenciaMo(
      `Entrada MO inválida: ${validacao.motivos.join(", ")}`,
      undefined,
      "schema_invalido"
    );
  }

  const entradaNorm = {
    coaId: texto(entrada.coaId),
    decisao: texto(entrada.decisao),
    quem: texto(entrada.quem),
    quando: texto(entrada.quando),
    porque: texto(entrada.porque),
    baseadoEm: texto(entrada.baseadoEm),
    resultado: texto(entrada.resultado),
    origem: texto(entrada.origem) || "manual",
    tipo: texto(entrada.tipo) || "decisao"
  };

  const conteudoHash = calcularConteudoHash(entradaNorm);

  /**
   * @param {number} tentativa
   * @returns {object}
   */
  function tentar(tentativa) {
    const lido = carregarDocumentoMo();
    if (lido.status === "corrupto") {
      estadoHidratacao = "corrupto";
      motivoCorrupcao = lido.motivo || "corrupto";
      throw new ErroPersistenciaMo(
        "Ledger MO corrupto — append recusado.",
        undefined,
        "estado_corrupto"
      );
    }

    const docBase =
      lido.status === "ok" && lido.doc
        ? clonarDoc(lido.doc)
        : criarDocumentoVazioPersistivel();

    const expectedActualizadoEm = docBase.actualizadoEm;
    const seq = docBase.registos.length + 1;
    const id =
      texto(entrada.id) ||
      gerarIdRegistroMo(entradaNorm.coaId, entradaNorm.quando, seq);

    const registo = normalizarRegistroMo(entradaNorm, {
      id,
      conteudoHash,
      criadoEm: entradaNorm.quando
    });

    const novoDoc = aplicarAppend(docBase, registo);

    // Proteção multi-aba: re-ler antes de gravar
    const relido = carregarDocumentoMo();
    if (relido.status === "corrupto") {
      estadoHidratacao = "corrupto";
      motivoCorrupcao = relido.motivo || "corrupto";
      throw new ErroPersistenciaMo(
        "Ledger MO corrupto durante append.",
        undefined,
        "estado_corrupto"
      );
    }
    const actual =
      relido.status === "ok" && relido.doc
        ? relido.doc.actualizadoEm
        : null;
    if (actual !== expectedActualizadoEm) {
      if (tentativa < 1) {
        return tentar(tentativa + 1);
      }
      throw new ErroPersistenciaMo(
        "Conflito de versão no ledger MO (corrida multi-aba).",
        undefined,
        "conflito_versao"
      );
    }

    gravarDocumentoMo(novoDoc);
    cacheDoc = clonarDoc(novoDoc);
    estadoHidratacao = "ok";
    motivoCorrupcao = null;
    return copiarProfundo(registo);
  }

  return tentar(0);
}

/**
 * @param {{ coaId?: string }} [filtros]
 * @returns {object[]}
 */
export function listarRegistosMo(filtros = {}) {
  if (estadoHidratacao === "nao_hidratado") {
    hidratarMemoriaConfiavel();
  }
  if (estadoHidratacao === "corrupto") {
    return [];
  }
  const coa = texto(filtros.coaId);
  const lista = cacheDoc.registos.filter((r) => {
    if (!r || typeof r !== "object") return false;
    if (coa && texto(r.coaId) !== coa) return false;
    return true;
  });
  return lista
    .slice()
    .sort((a, b) => String(a.quando).localeCompare(String(b.quando)))
    .map((r) => copiarProfundo(r));
}

/**
 * @param {string} id
 * @returns {object|null}
 */
export function obterRegistoMo(id) {
  if (estadoHidratacao === "nao_hidratado") {
    hidratarMemoriaConfiavel();
  }
  if (estadoHidratacao === "corrupto") return null;
  const alvo = texto(id);
  if (!alvo) return null;
  const r = cacheDoc.registos.find((x) => x && texto(x.id) === alvo);
  return r ? copiarProfundo(r) : null;
}

/**
 * @param {{ coaId?: string, termo?: string }} opts
 * @returns {{ status: "encontrado"|"ausente", registos: object[], mensagem?: string }}
 */
export function consultarRegistosMo(opts = {}) {
  if (estadoHidratacao === "nao_hidratado") {
    hidratarMemoriaConfiavel();
  }
  if (estadoHidratacao === "corrupto") {
    return {
      status: "ausente",
      registos: [],
      mensagem:
        "Ausência explícita: ledger MO indisponível (estado corrupto)."
    };
  }

  const coa = texto(opts.coaId);
  const termo = texto(opts.termo).toLocaleLowerCase("pt-BR");
  let lista = listarRegistosMo(coa ? { coaId: coa } : {});

  if (termo) {
    lista = lista.filter((registro) =>
      [
        registro.id,
        registro.decisao,
        registro.quem,
        registro.quando,
        registro.porque,
        registro.baseadoEm,
        registro.resultado,
        registro.coaId
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }

  if (!lista.length) {
    return {
      status: "ausente",
      registos: [],
      mensagem: termo
        ? `Ausência explícita: nada registrado sobre “${texto(opts.termo)}”.`
        : "Ausência explícita: nenhuma decisão registrada na Memória Confiável."
    };
  }

  return { status: "encontrado", registos: lista };
}

/**
 * Isolamento de testes — limpa cache e storage.
 */
export function reiniciarMemoriaConfiavelParaTestes() {
  limparDocumentoMo();
  cacheDoc = documentoVazioMo();
  estadoHidratacao = "nao_hidratado";
  motivoCorrupcao = null;
}

/**
 * Limpeza explícita pós-corrupção (testes / recuperação controlada).
 * Apaga a chave e reidrata como ausente.
 * @returns {ReturnType<typeof hidratarMemoriaConfiavel>}
 */
export function limparEstadoCorruptoMoParaTestes() {
  limparDocumentoMo();
  cacheDoc = documentoVazioMo();
  estadoHidratacao = "nao_hidratado";
  motivoCorrupcao = null;
  return hidratarMemoriaConfiavel();
}

export { ErroPersistenciaMo };
