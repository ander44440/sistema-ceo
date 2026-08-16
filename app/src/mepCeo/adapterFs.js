/**
 * IMP-073 — Adapter filesystem da MEP-CEO (CAP-13).
 * Único sítio com node:fs neste módulo. Não importa Motor/MRE/EIC/Gate/MTE/CAP-04/CAP-05.
 * Log canónico: eventos.jsonl. Projecção subordinada. Sem delete/squash.
 */

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EIXO_PRODUTO } from "./dominio.js";
import { avaliarIsolamento, CHAVES_PAYLOAD_PROIBIDAS } from "./isolamento.js";

const REPO_RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export const PATH_CANONICO = join(REPO_RAIZ, "mep-ceo", "store");
export const SCHEMA_VERSION = 1;
export const PRODUTO_CANONICO = "sistema-ceo";
export const CAPACIDADE_DONA = "CAP-13";

export const FICHEIRO_MANIFESTO = "manifesto.json";
export const FICHEIRO_EVENTOS = "eventos.jsonl";
export const FICHEIRO_PROJECCAO = "projeccao.json";

export const CAMPOS_EVENTO = Object.freeze([
  "id",
  "quando",
  "objectoId",
  "tipoObjecto",
  "estadoAnterior",
  "estadoNovo",
  "papel",
  "papeis",
  "acto",
  "classificacao",
  "evidencia",
  "lacunaEvidencia",
  "propostoPara",
  "cobre",
  "precedenteBsl"
]);

export const CAMPOS_OBJECTO = Object.freeze([
  "id",
  "tipo",
  "eixo",
  "titulo",
  "maturidade",
  "trabalho",
  "pndIds",
  "classificacao",
  "evidencia",
  "lacunaEvidencia",
  "payload",
  "referenciasExternas",
  "criadoPor",
  "congelado",
  "cobre",
  "precedenteBsl"
]);

export const CHAVES_ENVELOPE_PROIBIDAS = Object.freeze([
  "coaId",
  "projetoId",
  "clienteId",
  "empresaId",
  "mensagens",
  "transcript",
  "mte",
  "jobId",
  "knwConteudo",
  "itemKnwConteudo",
  "decisaoOrganizacional",
  "decisaoCap05",
  "conversasCliente",
  "conversaCliente",
  "transcriptCliente",
  "dadosCliente",
  "conhecimentoOperacionalCliente",
  "decisaoPrivadaCliente",
  "factoOrganizacao",
  "factosOrganizacao",
  "memoriaOrganizacional"
]);

const CHAVES_MANIFESTO = Object.freeze([
  "schemaVersion",
  "eixo",
  "produtoCanonico",
  "capacidadeDona",
  "criadoEm"
]);

function recusa(motivo, extra = {}) {
  return { ok: false, motivo, ...extra };
}

function ok(extra = {}) {
  return { ok: true, ...extra };
}

function caminho(dir, ficheiro) {
  return join(dir, ficheiro);
}

function hashSha256(texto) {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

function escreverAtomico(destino, conteudo) {
  const tmp = `${destino}.tmp`;
  writeFileSync(tmp, conteudo, "utf8");
  try {
    renameSync(tmp, destino);
  } catch {
    copyFileSync(tmp, destino);
    unlinkSync(tmp);
  }
  const lido = readFileSync(destino, "utf8");
  if (lido !== conteudo) {
    throw new Error("read_after_write_divergente");
  }
}

function objectoTemChaveProibida(valor, motivos, caminhoAtual = "") {
  if (valor == null || typeof valor !== "object") return;
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => objectoTemChaveProibida(item, motivos, `${caminhoAtual}[${i}]`));
    return;
  }
  for (const chave of Object.keys(valor)) {
    const aqui = caminhoAtual ? `${caminhoAtual}.${chave}` : chave;
    if (CHAVES_ENVELOPE_PROIBIDAS.includes(chave) || CHAVES_PAYLOAD_PROIBIDAS.includes(chave)) {
      motivos.push(`chave_proibida:${aqui}`);
    }
    objectoTemChaveProibida(valor[chave], motivos, aqui);
  }
}

function chavesForaDaLista(obj, permitidas) {
  return Object.keys(obj).filter((k) => !permitidas.includes(k));
}

/**
 * Recusa envelope com identidade de cliente/COA/conversa/MTE/KNW/CAP-05
 * ou campos fora do schema fechado.
 */
export function validarEnvelope(evento, objecto) {
  const motivos = [];
  if (!evento || typeof evento !== "object") {
    return recusa("envelope_invalido", { motivos: ["evento_ausente"] });
  }
  if (!objecto || typeof objecto !== "object") {
    return recusa("envelope_invalido", { motivos: ["objecto_ausente"] });
  }

  const extraEvento = chavesForaDaLista(evento, CAMPOS_EVENTO);
  const extraObjecto = chavesForaDaLista(objecto, CAMPOS_OBJECTO);
  for (const k of extraEvento) motivos.push(`campo_nao_permitido:evento.${k}`);
  for (const k of extraObjecto) motivos.push(`campo_nao_permitido:objecto.${k}`);

  objectoTemChaveProibida(evento, motivos, "evento");
  objectoTemChaveProibida(objecto, motivos, "objecto");

  if (objecto.eixo && objecto.eixo !== EIXO_PRODUTO) {
    motivos.push("eixo_nao_produto");
  }

  const isolamento = avaliarIsolamento({
    eixo: objecto.eixo || EIXO_PRODUTO,
    payload: objecto.payload
  });
  if (!isolamento.ok) {
    motivos.push(...isolamento.motivos);
  }

  if (motivos.length) {
    return recusa("envelope_contaminado", { motivos });
  }
  return ok();
}

export function validarManifesto(manifesto) {
  if (!manifesto || typeof manifesto !== "object") {
    return recusa("manifesto_invalido");
  }
  const extra = chavesForaDaLista(manifesto, CHAVES_MANIFESTO);
  if (extra.length) {
    return recusa("manifesto_contaminado", { extra });
  }
  const motivos = [];
  objectoTemChaveProibida(manifesto, motivos, "manifesto");
  if (motivos.length) {
    return recusa("manifesto_contaminado", { motivos });
  }
  if (manifesto.schemaVersion !== SCHEMA_VERSION) {
    return recusa("schema_incompativel", { schemaVersion: manifesto.schemaVersion });
  }
  if (manifesto.eixo !== EIXO_PRODUTO) {
    return recusa("identidade_invalida", { campo: "eixo" });
  }
  if (manifesto.produtoCanonico !== PRODUTO_CANONICO) {
    return recusa("identidade_invalida", { campo: "produtoCanonico" });
  }
  if (manifesto.capacidadeDona !== CAPACIDADE_DONA) {
    return recusa("identidade_invalida", { campo: "capacidadeDona" });
  }
  return ok();
}

function manifestoNovo() {
  return {
    schemaVersion: SCHEMA_VERSION,
    eixo: EIXO_PRODUTO,
    produtoCanonico: PRODUTO_CANONICO,
    capacidadeDona: CAPACIDADE_DONA,
    criadoEm: new Date().toISOString()
  };
}

function parseJsonl(raw) {
  if (raw == null || raw === "") {
    return ok({ eventos: [], logHash: hashSha256("") });
  }
  const logHash = hashSha256(raw);
  const linhas = raw.split(/\r?\n/);
  if (linhas.length && linhas[linhas.length - 1] === "") {
    linhas.pop();
  }
  const eventos = [];
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.trim() === "") {
      return recusa("log_truncado", { linha: i + 1 });
    }
    try {
      eventos.push(JSON.parse(linha));
    } catch {
      return recusa("log_truncado", { linha: i + 1 });
    }
  }
  return ok({ eventos, logHash });
}

function serializarRegisto(evento, objecto) {
  const limpoEvento = {};
  for (const k of CAMPOS_EVENTO) {
    if (evento[k] !== undefined) limpoEvento[k] = evento[k];
  }
  const limpoObjecto = {};
  for (const k of CAMPOS_OBJECTO) {
    if (objecto[k] !== undefined) limpoObjecto[k] = objecto[k];
  }
  return JSON.stringify({ ...limpoEvento, objecto: limpoObjecto });
}

function objectosDesdeLog(registos) {
  const mapa = new Map();
  for (const rec of registos) {
    if (rec && rec.objecto && rec.objecto.id) {
      mapa.set(rec.objecto.id, rec.objecto);
    }
  }
  return [...mapa.values()];
}

function gravarProjeccao(dir, rawLog, registos) {
  const doc = {
    logHash: hashSha256(rawLog),
    contagemEventos: registos.length,
    objectos: objectosDesdeLog(registos)
  };
  escreverAtomico(caminho(dir, FICHEIRO_PROJECCAO), `${JSON.stringify(doc, null, 2)}\n`);
}

function garantirPrimeiroBoot(dir) {
  mkdirSync(dir, { recursive: true });
  const pMan = caminho(dir, FICHEIRO_MANIFESTO);
  const pLog = caminho(dir, FICHEIRO_EVENTOS);
  const temMan = existsSync(pMan);
  const temLog = existsSync(pLog);
  if (!temMan && !temLog) {
    const man = manifestoNovo();
    escreverAtomico(pMan, `${JSON.stringify(man, null, 2)}\n`);
    escreverAtomico(pLog, "");
    gravarProjeccao(dir, "", []);
    return ok({ manifesto: man, primeiroBoot: true });
  }
  if (!temMan && temLog) {
    return recusa("manifesto_ausente");
  }
  if (temMan && !temLog) {
    escreverAtomico(pLog, "");
  }
  return ok({ primeiroBoot: false });
}

/**
 * Carrega o store. Fail closed: truncamento, manifesto inválido, identidade errada.
 * Projecção divergente é ignorada — o log vence.
 */
export function carregarStore(dir) {
  if (!dir || typeof dir !== "string") {
    return recusa("directorio_invalido");
  }
  const boot = garantirPrimeiroBoot(dir);
  if (!boot.ok) return boot;

  let manifesto;
  try {
    manifesto = JSON.parse(readFileSync(caminho(dir, FICHEIRO_MANIFESTO), "utf8"));
  } catch {
    return recusa("manifesto_ilegivel");
  }
  const idOk = validarManifesto(manifesto);
  if (!idOk.ok) return idOk;

  let raw;
  try {
    raw = readFileSync(caminho(dir, FICHEIRO_EVENTOS), "utf8");
  } catch {
    return recusa("log_ilegivel");
  }
  const parsed = parseJsonl(raw);
  if (!parsed.ok) return parsed;

  for (const rec of parsed.eventos) {
    const { objecto, ...evento } = rec;
    const env = validarEnvelope(evento, objecto);
    if (!env.ok) return env;
  }

  return ok({
    manifesto,
    eventos: parsed.eventos,
    logHash: parsed.logHash,
    primeiroBoot: boot.primeiroBoot === true
  });
}

/**
 * Append-only após C1+C2 aceitarem. Recusa envelope contaminado.
 * Não apaga, não faz squash.
 */
export function appendRegistoFisico(dir, evento, objecto) {
  const env = validarEnvelope(evento, objecto);
  if (!env.ok) return env;

  const carga = carregarStore(dir);
  if (!carga.ok) return carga;

  const linha = serializarRegisto(evento, objecto);
  const existentes = carga.eventos.map((rec) => {
    const { objecto: obj, ...ev } = rec;
    return serializarRegisto(ev, obj);
  });
  existentes.push(linha);
  const novoRaw = existentes.map((l) => `${l}\n`).join("");

  try {
    escreverAtomico(caminho(dir, FICHEIRO_EVENTOS), novoRaw);
  } catch (err) {
    return recusa("falha_persistencia", { detalhe: String(err && err.message) });
  }

  const confirmacao = readFileSync(caminho(dir, FICHEIRO_EVENTOS), "utf8");
  const parsed = parseJsonl(confirmacao);
  if (!parsed.ok) return parsed;
  const ultimo = parsed.eventos[parsed.eventos.length - 1];
  if (!ultimo || ultimo.id !== evento.id) {
    return recusa("falha_persistencia", { detalhe: "read_after_write_id" });
  }

  try {
    gravarProjeccao(dir, confirmacao, parsed.eventos);
  } catch {
    /* cache subordinada: log já está canónico */
  }

  return ok({ medium: "filesystem", id: evento.id });
}

export function apagarEventoFisico() {
  return recusa("historico_append_only");
}

export function apagarObjectoFisico() {
  return recusa("historico_append_only");
}

export function compactarStoreFisico() {
  return recusa("historico_append_only");
}

export function lerProjeccaoCache(dir) {
  const p = caminho(dir, FICHEIRO_PROJECCAO);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export function hashDoLog(dir) {
  if (!existsSync(caminho(dir, FICHEIRO_EVENTOS))) return hashSha256("");
  return hashSha256(readFileSync(caminho(dir, FICHEIRO_EVENTOS), "utf8"));
}
