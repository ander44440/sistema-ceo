/**
 * Etapa 9-B — verificação independente de evidência física (caso mínimo: arquivo).
 * Módulo puro: sem `node:fs` / sem `node:path`. Path + I/O injectáveis (Node/Dispatcher).
 */

export const MOTIVO_EVIDENCIA_VERIFICADA = "evidencia_verificada";
export const MOTIVO_OBSERVACAO_INDISPONIVEL = "observacao_fisica_indisponivel";
export const MOTIVO_PATH_NAO_PERMITIDO = "path_nao_permitido";
export const MOTIVO_ARQUIVO_AUSENTE = "arquivo_ausente";
export const MOTIVO_NAO_E_ARQUIVO = "alvo_nao_e_arquivo";
export const MOTIVO_CONTEUDO_DIVERGENTE = "conteudo_divergente";
export const MOTIVO_LEITURA_EXCEDIDA = "leitura_excedida";
export const MOTIVO_EVIDENCIA_INVALIDA = "evidencia_verificavel_invalida";

/** Limite de leitura controlada (bytes). */
export const MAX_BYTES_LEITURA_EVIDENCIA = 64 * 1024;

/**
 * @param {unknown} resultado
 * @returns {{ tipo: string, alvo: string, conteudoExacto: string } | null}
 */
export function extrairEvidenciaVerificavel(resultado) {
  if (!resultado || typeof resultado !== "object") return null;
  const ev = /** @type {Record<string, unknown>} */ (resultado).evidenciaVerificavel;
  if (!ev || typeof ev !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (ev);
  const tipo = String(o.tipo || "").trim().toLowerCase();
  const alvo = String(o.alvo || "").trim();
  const conteudoExacto =
    typeof o.conteudoExacto === "string" ? o.conteudoExacto : null;
  if (tipo !== "arquivo" || !alvo || conteudoExacto == null) return null;
  return { tipo: "arquivo", alvo, conteudoExacto };
}

/**
 * @typedef {{
 *   resolve: (...parts: string[]) => string,
 *   normalize: (p: string) => string,
 *   isAbsolute: (p: string) => boolean,
 *   sep: string
 * }} PathApiEvidencia
 */

/**
 * @param {PathApiEvidencia} P
 * @param {string} root
 * @param {string} resolved
 */
export function pathDentroDoRoot(P, root, resolved) {
  const r = P.resolve(root);
  const t = P.resolve(resolved);
  if (t === r) return true;
  const prefix = r.endsWith(P.sep) ? r : r + P.sep;
  return t.startsWith(prefix);
}

/**
 * @param {PathApiEvidencia} P
 * @param {string} alvo
 * @param {string[]} roots
 * @returns {string[]}
 */
export function candidatosDeResolucao(P, alvo, roots) {
  const a = String(alvo || "").trim();
  if (!a) return [];
  if (P.isAbsolute(a)) return [P.normalize(a)];
  const out = [];
  for (const root of roots) {
    if (!root) continue;
    out.push(P.resolve(String(root), a));
  }
  return out;
}

/**
 * @typedef {{
 *   exists: (p: string) => boolean,
 *   stat: (p: string) => { isFile: boolean, isDirectory: boolean, size: number },
 *   realpath: (p: string) => string,
 *   readFile: (p: string, maxBytes: number) => { ok: true, conteudo: string, bytes: number } | { ok: false, motivo: string, bytes?: number }
 * }} IoEvidenciaArquivo
 */

/**
 * Observação independente: arquivo + conteúdo exacto dentro de roots.
 * Não confia em declaração do Agent além do apontador (alvo + condição).
 *
 * @param {{ tipo: string, alvo: string, conteudoExacto: string }} spec
 * @param {{
 *   rootsPermitidos: string[],
 *   io: IoEvidenciaArquivo,
 *   pathApi: PathApiEvidencia,
 *   maxBytes?: number
 * }} ctx
 * @returns {{ ok: boolean, motivo: string, detalhes: object }}
 */
export function verificarEvidenciaArquivo(spec, ctx) {
  const P = ctx.pathApi;
  const io = ctx.io;
  const maxBytes = ctx.maxBytes ?? MAX_BYTES_LEITURA_EVIDENCIA;
  /** @type {string[]} */
  const verificacoes = [];

  if (!spec || spec.tipo !== "arquivo") {
    return {
      ok: false,
      motivo: MOTIVO_EVIDENCIA_INVALIDA,
      detalhes: { verificacoes: ["tipo_nao_suportado"] }
    };
  }
  if (!io || typeof io.exists !== "function" || !P || typeof P.resolve !== "function") {
    return {
      ok: false,
      motivo: MOTIVO_OBSERVACAO_INDISPONIVEL,
      detalhes: { verificacoes: ["io_ou_path_ausente"] }
    };
  }

  const roots = (ctx.rootsPermitidos || [])
    .map((r) => String(r || "").trim())
    .filter(Boolean)
    .map((r) => P.resolve(r));

  if (!roots.length) {
    return {
      ok: false,
      motivo: MOTIVO_PATH_NAO_PERMITIDO,
      detalhes: { verificacoes: ["roots_ausentes"], alvo: spec.alvo }
    };
  }

  const candidatos = candidatosDeResolucao(P, spec.alvo, roots);
  if (!candidatos.length) {
    return {
      ok: false,
      motivo: MOTIVO_PATH_NAO_PERMITIDO,
      detalhes: { verificacoes: ["sem_candidato"], alvo: spec.alvo }
    };
  }

  /** @type {string|null} */
  let permitido = null;
  for (const cand of candidatos) {
    const normalizado = P.resolve(cand);
    const dentro = roots.some((root) => pathDentroDoRoot(P, root, normalizado));
    if (!dentro) {
      verificacoes.push(`candidato_fora_allowlist:${normalizado}`);
      continue;
    }
    permitido = normalizado;
    break;
  }

  if (!permitido) {
    return {
      ok: false,
      motivo: MOTIVO_PATH_NAO_PERMITIDO,
      detalhes: {
        verificacoes: [...verificacoes, "nenhum_path_permitido"],
        alvo: spec.alvo
      }
    };
  }
  verificacoes.push("path_dentro_allowlist");

  if (!io.exists(permitido)) {
    return {
      ok: false,
      motivo: MOTIVO_ARQUIVO_AUSENTE,
      detalhes: {
        pathResolvido: permitido,
        bytes: 0,
        verificacoes: [...verificacoes, "existe:false"]
      }
    };
  }
  verificacoes.push("existe:true");

  let real;
  try {
    real = P.resolve(io.realpath(permitido));
  } catch {
    return {
      ok: false,
      motivo: MOTIVO_ARQUIVO_AUSENTE,
      detalhes: {
        pathResolvido: permitido,
        bytes: 0,
        verificacoes: [...verificacoes, "realpath:falhou"]
      }
    };
  }

  if (!roots.some((root) => pathDentroDoRoot(P, root, real))) {
    return {
      ok: false,
      motivo: MOTIVO_PATH_NAO_PERMITIDO,
      detalhes: {
        pathResolvido: real,
        bytes: 0,
        verificacoes: [...verificacoes, "realpath_fora_allowlist"]
      }
    };
  }
  verificacoes.push("realpath_dentro_allowlist");

  let st;
  try {
    st = io.stat(real);
  } catch {
    return {
      ok: false,
      motivo: MOTIVO_ARQUIVO_AUSENTE,
      detalhes: {
        pathResolvido: real,
        bytes: 0,
        verificacoes: [...verificacoes, "stat:falhou"]
      }
    };
  }

  if (st.isDirectory || !st.isFile) {
    return {
      ok: false,
      motivo: MOTIVO_NAO_E_ARQUIVO,
      detalhes: {
        pathResolvido: real,
        bytes: st.size || 0,
        verificacoes: [
          ...verificacoes,
          st.isDirectory ? "isDirectory:true" : "isFile:false"
        ]
      }
    };
  }
  verificacoes.push("isFile:true");

  if (typeof st.size === "number" && st.size > maxBytes) {
    return {
      ok: false,
      motivo: MOTIVO_LEITURA_EXCEDIDA,
      detalhes: {
        pathResolvido: real,
        bytes: st.size,
        maxBytes,
        verificacoes: [...verificacoes, "size_excede_limite"]
      }
    };
  }

  const leitura = io.readFile(real, maxBytes);
  if (!leitura.ok) {
    return {
      ok: false,
      motivo: leitura.motivo || MOTIVO_LEITURA_EXCEDIDA,
      detalhes: {
        pathResolvido: real,
        bytes: leitura.bytes ?? 0,
        verificacoes: [...verificacoes, "leitura:falhou"]
      }
    };
  }
  verificacoes.push("leitura:ok");

  const observado = leitura.conteudo;
  const esperado = spec.conteudoExacto;
  if (observado !== esperado) {
    return {
      ok: false,
      motivo: MOTIVO_CONTEUDO_DIVERGENTE,
      detalhes: {
        pathResolvido: real,
        bytes: leitura.bytes,
        verificacoes: [...verificacoes, "conteudoExacto:false"],
        esperadoChars: esperado.length,
        observadoBytes: leitura.bytes
      }
    };
  }
  verificacoes.push("conteudoExacto:true");

  return {
    ok: true,
    motivo: MOTIVO_EVIDENCIA_VERIFICADA,
    detalhes: {
      pathResolvido: real,
      bytes: leitura.bytes,
      verificacoes
    }
  };
}
