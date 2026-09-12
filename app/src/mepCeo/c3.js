/**
 * IMP-074 / ARQ-033 v1.1 — Canal C3 (proposta desidentificada).
 * Não altera C1/C2/adapter. Não promove maturidade. Sem API pública.
 */
import { PAPEIS } from "./dominio.js";
import { CHAVES_PAYLOAD_PROIBIDAS, avaliarIsolamento } from "./isolamento.js";
import { criarObjecto, listarObjectos } from "./registo.js";

export const OBJECTOS_CANDIDATOS_C3 = Object.freeze(["MCP", "EPC", "MDL"]);

export const CAMPOS_ACTO_C3 = Object.freeze([
  "papel",
  "tipoLacunaProduto",
  "objectoCandidato",
  "enunciadoDesidentificado",
  "evidenciaNaoPrivada"
]);

const ALIASES_PAPEL = Object.freeze({
  usuario: "usuario",
  usuário: "usuario",
  cto: "cto",
  ceo_agente: "ceo_agente",
  "ceo-agente": "ceo_agente",
  engenheiro: "engenheiro"
});

const PROIBIDO_TEXTO = Object.freeze([
  /\bCOA-\d+/i,
  /\bJOB-\d+/i,
  /\bKNW-\d+/i,
  /\bCNC-\d+/i,
  /conversaId/i,
  /transcript/i,
  /memoriaOrganizacional/i,
  /dadosCliente/i,
  /itemKnwConteudo/i,
  /decisaoPrivada/i,
  /decisaoCap05/i,
  /factoOrganizacao/i,
  /conhecimentoOperacional/i,
  /conversasCliente/i
]);

function recusa(motivo, extra = {}) {
  return Object.freeze({ ok: false, motivo, ...extra });
}

function textoActo(acto) {
  return CAMPOS_ACTO_C3.map((k) => String(acto[k] ?? "")).join("\n");
}

function normalizarPapel(papel) {
  const chave = String(papel || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const canon = ALIASES_PAPEL[chave];
  if (canon && PAPEIS.includes(canon)) return canon;
  if (PAPEIS.includes(String(papel || "").trim())) return String(papel).trim();
  return "";
}

function camposExtra(acto) {
  return Object.keys(acto).filter((k) => !CAMPOS_ACTO_C3.includes(k));
}

function matrizProibida(acto) {
  const motivos = [];
  const blob = textoActo(acto);
  for (const re of PROIBIDO_TEXTO) {
    if (re.test(blob)) motivos.push(`conteudo_proibido:${re.source}`);
  }
  for (const chave of CHAVES_PAYLOAD_PROIBIDAS) {
    if (Object.prototype.hasOwnProperty.call(acto, chave) && acto[chave] != null) {
      motivos.push(`chave_proibida:${chave}`);
    }
  }
  return motivos;
}

function tipoEvidenciaDe(referencia) {
  const m = String(referencia)
    .trim()
    .match(/^(VIS|REQ|ARQ|IMP|VAL|ADR|ANL)\b/i);
  if (m) return m[1].toUpperCase();
  return "despacho";
}

/**
 * Acto explícito C3. Fail-closed. Um objecto CONCEBIDO / hipótese via C2.
 * @param {object} acto
 */
export function proporEvolucaoDesidentificada(acto = {}) {
  if (!acto || typeof acto !== "object" || Array.isArray(acto)) {
    return recusa("acto_invalido");
  }

  const extra = camposExtra(acto);
  if (extra.length) {
    return recusa("campos_nao_permitidos", { extra });
  }

  const papel = normalizarPapel(acto.papel);
  const tipoLacunaProduto = String(acto.tipoLacunaProduto ?? "").trim();
  const objectoCandidato = String(acto.objectoCandidato ?? "").trim();
  const enunciadoDesidentificado = String(acto.enunciadoDesidentificado ?? "").trim();
  const evidenciaNaoPrivada = String(acto.evidenciaNaoPrivada ?? "").trim();

  if (!papel) return recusa("papel_obrigatorio");
  if (!tipoLacunaProduto) return recusa("campo_obrigatorio:tipoLacunaProduto");
  if (!objectoCandidato) return recusa("campo_obrigatorio:objectoCandidato");
  if (!enunciadoDesidentificado) return recusa("campo_obrigatorio:enunciadoDesidentificado");
  if (!evidenciaNaoPrivada) return recusa("campo_obrigatorio:evidenciaNaoPrivada");

  if (!OBJECTOS_CANDIDATOS_C3.includes(objectoCandidato)) {
    return recusa("objecto_candidato_invalido");
  }

  const proibidos = matrizProibida({
    papel,
    tipoLacunaProduto,
    objectoCandidato,
    enunciadoDesidentificado,
    evidenciaNaoPrivada
  });
  if (proibidos.length) {
    return recusa("conteudo_proibido", { motivos: proibidos });
  }

  const isolamento = avaliarIsolamento({
    eixo: "produto",
    payload: {
      tipoLacunaProduto,
      enunciadoDesidentificado,
      origemCanal: "C3"
    }
  });
  if (!isolamento.ok) {
    return recusa("isolamento", { motivos: isolamento.motivos });
  }

  const criado = criarObjecto({
    tipo: objectoCandidato,
    titulo: enunciadoDesidentificado,
    papel,
    evidencia: {
      tipo: tipoEvidenciaDe(evidenciaNaoPrivada),
      referencia: evidenciaNaoPrivada
    },
    payload: {
      tipoLacunaProduto,
      enunciadoDesidentificado,
      origemCanal: "C3"
    }
  });

  if (!criado.ok) {
    return recusa(criado.motivo || "recusa_c2", {
      motivos: criado.motivos,
      extra: criado
    });
  }

  return Object.freeze({
    ok: true,
    objecto: criado.objecto,
    evento: criado.evento
  });
}

/**
 * Vista só-leitura para o Centro de Situação (CA-085-41/42).
 */
export function listarPropostasC3() {
  return listarObjectos()
    .filter(
      (o) =>
        o.maturidade === "CONCEBIDO" &&
        o.payload &&
        o.payload.origemCanal === "C3"
    )
    .map((o) =>
      Object.freeze({
        id: o.id,
        tipoLacunaProduto: String(o.payload.tipoLacunaProduto || ""),
        enunciadoDesidentificado: String(
          o.payload.enunciadoDesidentificado || o.titulo || ""
        ),
        maturidade: "CONCEBIDO"
      })
    );
}
