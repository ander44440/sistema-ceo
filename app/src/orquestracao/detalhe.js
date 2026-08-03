/**
 * Detalhe allowlisted do Painel — IMP-055 E4 (Progressividade nível 2).
 * Sem secrets; só sob expansão na UI.
 */

const CHAVE_SECRETA =
  /(?:api[_-]?key|token|secret|password|authorization|bearer|credential)/i;

/** Chaves permitidas dentro de `detalhe` (objecto). */
export const CAMPOS_DETALHE_ALLOWLIST = Object.freeze([
  "jobId",
  "job",
  "erro",
  "mensagem",
  "motivo",
  "desdeQuando"
]);

const ROTULO_CAMPO = Object.freeze({
  jobId: "Job",
  job: "Job",
  erro: "Erro",
  mensagem: "Erro",
  motivo: "Motivo",
  desdeQuando: "Desde"
});

/**
 * @param {string} texto
 * @param {number} [max]
 */
function truncar(texto, max = 120) {
  const t = String(texto).trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * @param {string} iso
 */
export function formatarDesdeQuando(iso) {
  if (!iso || typeof iso !== "string") return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return truncar(iso, 40);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d);
  } catch {
    return truncar(iso, 40);
  }
}

/**
 * @param {string} origem
 */
export function humanizarOrigem(origem) {
  const o = String(origem || "").trim();
  if (!o) return "";
  if (o === "stub-e2") return "Sinal provisório (stub)";
  if (o === "agregador") return "Agregador";
  if (o === "health") return "Health check";
  return truncar(o.replace(/[_-]+/g, " "), 40);
}

/**
 * Extrai linhas humanas permitidas a partir do nó completo.
 * Nunca inclui apiKey/token/etc.
 * @param {object} no
 * @returns {Array<{ rotulo: string, valor: string }>}
 */
export function extrairLinhasDetalhe(no) {
  /** @type {Array<{ rotulo: string, valor: string }>} */
  const linhas = [];
  if (!no || typeof no !== "object") {
    return [{ rotulo: "Nota", valor: "Sem detalhe adicional neste momento." }];
  }

  if (typeof no.atualizadoEm === "string" && no.atualizadoEm.trim()) {
    const desde = formatarDesdeQuando(no.atualizadoEm);
    if (desde) linhas.push({ rotulo: "Desde", valor: desde });
  }

  if (typeof no.origemSinal === "string" && no.origemSinal.trim()) {
    const origem = humanizarOrigem(no.origemSinal);
    if (origem) linhas.push({ rotulo: "Origem", valor: origem });
  }

  const d = no.detalhe;
  if (typeof d === "string" && d.trim()) {
    if (!CHAVE_SECRETA.test(d) && !/sk-[a-zA-Z0-9]{8,}/.test(d)) {
      linhas.push({ rotulo: "Nota", valor: truncar(d) });
    }
  } else if (d && typeof d === "object" && !Array.isArray(d)) {
    for (const key of CAMPOS_DETALHE_ALLOWLIST) {
      if (CHAVE_SECRETA.test(key)) continue;
      if (d[key] == null) continue;
      const valor = String(d[key]).trim();
      if (!valor) continue;
      if (CHAVE_SECRETA.test(valor) || /sk-[a-zA-Z0-9]{8,}/.test(valor)) continue;
      const rotulo = ROTULO_CAMPO[key] || key;
      // evita duplicar "Desde" se já veio de atualizadoEm
      if (rotulo === "Desde" && linhas.some((l) => l.rotulo === "Desde")) continue;
      linhas.push({ rotulo, valor: truncar(valor) });
    }
  }

  if (!linhas.length) {
    linhas.push({ rotulo: "Nota", valor: "Sem detalhe adicional neste momento." });
  }
  return linhas;
}

/**
 * Alterna o id expandido (no máximo um seleccionado).
 * @param {string | null} atual
 * @param {string} clicado
 * @returns {string | null}
 */
export function alternarIdExpandido(atual, clicado) {
  if (!clicado) return atual;
  return atual === clicado ? null : clicado;
}
