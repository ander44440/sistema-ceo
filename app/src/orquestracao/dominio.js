/**
 * Domínio do Painel de Orquestração — IMP-055 E1 / REQ-055 / ARQ-016.
 * Sem I/O, sem UI, sem rotas.
 */

/** @typedef {"Disponivel"|"Executando"|"Aguardando"|"Ocioso"|"Erro"} EstadoOrquestracao */

export const ESTADOS = Object.freeze([
  "Disponivel",
  "Executando",
  "Aguardando",
  "Ocioso",
  "Erro"
]);

/** Precedência: maior índice vence (Erro > … > Ocioso). */
export const PRECEDENCIA_ESTADO = Object.freeze({
  Ocioso: 0,
  Disponivel: 1,
  Aguardando: 2,
  Executando: 3,
  Erro: 4
});

export const NOS_V1 = Object.freeze([
  "ceo",
  "cto",
  "agent",
  "dispatcher",
  "backend",
  "speaker"
]);

export const NOMES_NOS = Object.freeze({
  ceo: "CEO",
  cto: "CTO",
  agent: "Agent",
  dispatcher: "Dispatcher",
  backend: "Backend",
  speaker: "Speaker"
});

/**
 * Campos permitidos na vista principal (Princípio da Progressividade).
 * `detalhe` e `origemSinal` existem no modelo completo mas NÃO entram aqui.
 */
export const CAMPOS_VISTA_PRINCIPAL = Object.freeze([
  "nome",
  "estado",
  "descricaoResumida"
]);

/**
 * Copy humana fixa: nó × estado → descrição resumida (1 linha).
 * Cobertura completa V1 (E1-CA3).
 */
export const DESCRICOES_RESUMIDAS = Object.freeze({
  ceo: {
    Disponivel: "Pronto a receber a sua instrução.",
    Executando: "A deliberar e coordenar agora.",
    Aguardando: "A aguardar a sua voz.",
    Ocioso: "Em silêncio — sem ciclo activo.",
    Erro: "Falha ao executar a última instrução."
  },
  cto: {
    Disponivel: "Pronto a consultar.",
    Executando: "Consulta ao CTO em curso.",
    Aguardando: "A aguardar resposta do canal CTO.",
    Ocioso: "Sem consulta recente.",
    Erro: "Canal CTO indisponível ou em falha."
  },
  agent: {
    Disponivel: "Executor pronto.",
    Executando: "A executar um Job.",
    Aguardando: "Há trabalho na fila.",
    Ocioso: "Sem Jobs a tratar.",
    Erro: "Último Job falhou."
  },
  dispatcher: {
    Disponivel: "A observar a fila.",
    Executando: "A acordar o Agent.",
    Aguardando: "A aguardar sinal do PC.",
    Ocioso: "Fila vazia — a vigiar.",
    Erro: "Watcher ausente ou em falha."
  },
  backend: {
    Disponivel: "API online.",
    Executando: "A processar pedidos.",
    Aguardando: "A aguardar recuperação.",
    Ocioso: "API online sem carga relevante.",
    Erro: "API inacessível."
  },
  speaker: {
    Disponivel: "Pronto a comunicar.",
    Executando: "A falar ou a redigir comunicado.",
    Aguardando: "Há fala na fila.",
    Ocioso: "Em silêncio.",
    Erro: "Falha na voz ou no comunicado."
  }
});

/**
 * @param {string} estado
 * @returns {estado is EstadoOrquestracao}
 */
export function ehEstadoValido(estado) {
  return ESTADOS.includes(/** @type {EstadoOrquestracao} */ (estado));
}

/**
 * @param {string} id
 */
export function ehNoV1(id) {
  return NOS_V1.includes(/** @type {*} */ (id));
}

/**
 * @param {EstadoOrquestracao} a
 * @param {EstadoOrquestracao} b
 * @returns {EstadoOrquestracao}
 */
export function aplicarPrecedencia(a, b) {
  if (!ehEstadoValido(a)) throw new TypeError(`Estado inválido: ${a}`);
  if (!ehEstadoValido(b)) throw new TypeError(`Estado inválido: ${b}`);
  return PRECEDENCIA_ESTADO[a] >= PRECEDENCIA_ESTADO[b] ? a : b;
}

/**
 * @param {ReadonlyArray<EstadoOrquestracao>} estados
 * @returns {EstadoOrquestracao}
 */
export function reduzirEstados(estados) {
  if (!Array.isArray(estados) || !estados.length) {
    throw new TypeError("reduzirEstados exige pelo menos um estado.");
  }
  return estados.reduce((acc, e) => aplicarPrecedencia(acc, e));
}

/**
 * @param {string} idNo
 * @param {string} estado
 * @returns {string}
 */
export function obterDescricaoResumida(idNo, estado) {
  if (!ehNoV1(idNo)) throw new TypeError(`Nó V1 desconhecido: ${idNo}`);
  if (!ehEstadoValido(estado)) throw new TypeError(`Estado inválido: ${estado}`);
  const mapa = DESCRICOES_RESUMIDAS[idNo];
  const texto = mapa && mapa[estado];
  if (typeof texto !== "string" || !texto.trim()) {
    throw new Error(`descricaoResumida em falta para ${idNo}/${estado}`);
  }
  return texto;
}

/**
 * Extrai apenas os campos da vista principal (Progressividade).
 * @param {object} no
 * @returns {{ nome: string, estado: string, descricaoResumida: string }}
 */
export function extrairVistaPrincipal(no) {
  if (!no || typeof no !== "object") {
    throw new TypeError("Nó em falta.");
  }
  return {
    nome: String(no.nome || ""),
    estado: String(no.estado || ""),
    descricaoResumida: String(no.descricaoResumida || "")
  };
}

/**
 * Garante que um objecto de vista principal não traz campos proibidos.
 * @param {object} vista
 */
export function validarVistaPrincipal(vista) {
  if (!vista || typeof vista !== "object") {
    return { ok: false, mensagem: "Vista principal em falta." };
  }
  const keys = Object.keys(vista);
  for (const k of keys) {
    if (!CAMPOS_VISTA_PRINCIPAL.includes(k)) {
      return {
        ok: false,
        mensagem: `Campo proibido na vista principal: ${k}.`
      };
    }
  }
  for (const k of CAMPOS_VISTA_PRINCIPAL) {
    if (typeof vista[k] !== "string" || !vista[k].trim()) {
      return { ok: false, mensagem: `Campo obrigatório vazio: ${k}.` };
    }
  }
  if (!ehEstadoValido(vista.estado)) {
    return { ok: false, mensagem: `Estado inválido: ${vista.estado}.` };
  }
  return { ok: true };
}

/**
 * @param {unknown} no
 * @returns {{ ok: true, no: object } | { ok: false, mensagem: string }}
 */
export function validarNo(no) {
  if (!no || typeof no !== "object") {
    return { ok: false, mensagem: "OrquestracaoNo em falta." };
  }
  const n = /** @type {Record<string, unknown>} */ (no);
  if (typeof n.id !== "string" || !ehNoV1(n.id)) {
    return { ok: false, mensagem: `id inválido ou fora da V1: ${n.id}.` };
  }
  if (typeof n.nome !== "string" || !n.nome.trim()) {
    return { ok: false, mensagem: "nome obrigatório." };
  }
  if (typeof n.estado !== "string" || !ehEstadoValido(n.estado)) {
    return { ok: false, mensagem: `estado inválido: ${n.estado}.` };
  }
  if (typeof n.descricaoResumida !== "string" || !n.descricaoResumida.trim()) {
    return { ok: false, mensagem: "descricaoResumida obrigatória." };
  }
  if (typeof n.atualizadoEm !== "string" || !n.atualizadoEm.trim()) {
    return { ok: false, mensagem: "atualizadoEm obrigatório." };
  }
  // detalhe e origemSinal são opcionais no modelo completo (E1-CA4)
  if (n.origemSinal !== undefined && typeof n.origemSinal !== "string") {
    return { ok: false, mensagem: "origemSinal deve ser string." };
  }
  return { ok: true, no: n };
}

/**
 * @param {unknown} snapshot
 */
export function validarSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return { ok: false, mensagem: "Snapshot em falta." };
  }
  const s = /** @type {Record<string, unknown>} */ (snapshot);
  if (typeof s.em !== "string" || !s.em.trim()) {
    return { ok: false, mensagem: "em (ISO) obrigatório." };
  }
  if (!Array.isArray(s.nos)) {
    return { ok: false, mensagem: "nos deve ser array." };
  }
  if (s.nos.length !== NOS_V1.length) {
    return {
      ok: false,
      mensagem: `nos deve ter ${NOS_V1.length} entradas (V1).`
    };
  }
  const ids = new Set();
  for (const no of s.nos) {
    const v = validarNo(no);
    if (!v.ok) return v;
    ids.add(/** @type {object} */ (v.no).id);
  }
  for (const id of NOS_V1) {
    if (!ids.has(id)) {
      return { ok: false, mensagem: `Nó V1 em falta no snapshot: ${id}.` };
    }
  }
  return { ok: true, snapshot: s };
}

/**
 * Constrói um nó V1 completo a partir de id + estado (+ opcionais).
 * @param {string} id
 * @param {EstadoOrquestracao} estado
 * @param {{ detalhe?: unknown, origemSinal?: string, atualizadoEm?: string, descricaoResumida?: string }} [opts]
 */
export function montarNo(id, estado, opts = {}) {
  if (!ehNoV1(id)) throw new TypeError(`Nó V1 desconhecido: ${id}`);
  if (!ehEstadoValido(estado)) throw new TypeError(`Estado inválido: ${estado}`);
  const no = {
    id,
    nome: NOMES_NOS[id],
    estado,
    descricaoResumida:
      opts.descricaoResumida || obterDescricaoResumida(id, estado),
    atualizadoEm: opts.atualizadoEm || new Date().toISOString()
  };
  if (opts.detalhe !== undefined) no.detalhe = opts.detalhe;
  if (opts.origemSinal !== undefined) no.origemSinal = opts.origemSinal;
  const v = validarNo(no);
  if (!v.ok) throw new Error(v.mensagem);
  return no;
}

/**
 * Snapshot V1 com o mesmo estado em todos os nós (utilitário de teste/fábrica).
 * @param {EstadoOrquestracao} estado
 * @param {string} [em]
 */
export function montarSnapshotV1Uniforme(estado, em) {
  const nos = NOS_V1.map((id) => montarNo(id, estado));
  const snapshot = { em: em || new Date().toISOString(), nos };
  const v = validarSnapshot(snapshot);
  if (!v.ok) throw new Error(v.mensagem);
  return snapshot;
}
