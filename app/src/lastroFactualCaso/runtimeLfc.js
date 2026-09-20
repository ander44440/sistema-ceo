/**
 * Runtime LFC para o motor conversacional (browser → ponte HTTP; testes → inject).
 * Desacoplado de HFC / MO / CSC.
 */

/**
 * @param {string} url
 * @param {object} body
 */
async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  });
  return res.json();
}

/**
 * @param {string} [base]
 */
export function criarLfcWriterHttp(base = "") {
  const endpoint = `${base}/api/ceo/lfc/writer`;
  return {
    id: "lfc-writer-http",
    criarCaso(cmd) {
      return postJson(endpoint, { op: "criarCaso", cmd });
    },
    acrescentarFactos(cmd) {
      return postJson(endpoint, { op: "acrescentarFactos", cmd });
    },
    corrigirFacto(cmd) {
      return postJson(endpoint, { op: "corrigirFacto", cmd });
    },
    anularFacto(cmd) {
      return postJson(endpoint, { op: "anularFacto", cmd });
    },
    arquivarCaso(cmd) {
      return postJson(endpoint, { op: "arquivarCaso", cmd });
    },
    excluirCaso(cmd) {
      return postJson(endpoint, { op: "excluirCaso", cmd });
    }
  };
}

/**
 * @param {string} [base]
 */
export function criarLfcReaderHttp(base = "") {
  const endpoint = `${base}/api/ceo/lfc/reader`;
  return {
    id: "lfc-reader-http",
    obterCaso(coaId, casoId, opts) {
      return postJson(endpoint, { op: "obterCaso", args: { coaId, casoId, opts } });
    },
    listarCasosDoCoa(coaId, opts) {
      return postJson(endpoint, { op: "listarCasosDoCoa", args: { coaId, opts } });
    },
    obterCasoActivo(coaId) {
      return postJson(endpoint, { op: "obterCasoActivo", args: { coaId } });
    },
    resolverCaso(coaId, cmd) {
      return postJson(endpoint, { op: "resolverCaso", args: { coaId, cmd } });
    },
    listarFactosActivos(coaId, casoId) {
      return postJson(endpoint, {
        op: "listarFactosActivos",
        args: { coaId, casoId }
      });
    },
    obterFactoActivo(coaId, casoId, cmd) {
      return postJson(endpoint, {
        op: "obterFactoActivo",
        args: { coaId, casoId, cmd }
      });
    }
  };
}

/**
 * @param {{
 *   writer?: object,
 *   reader?: object,
 *   baseUrl?: string
 * }} [ctx]
 */
export function obterLfcRuntime(ctx = {}) {
  if (ctx.writer && ctx.reader) {
    return { writer: ctx.writer, reader: ctx.reader, origem: "inject" };
  }
  const base = ctx.baseUrl || "";
  return {
    writer: criarLfcWriterHttp(base),
    reader: criarLfcReaderHttp(base),
    origem: "http"
  };
}
