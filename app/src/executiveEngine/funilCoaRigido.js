/**
 * IMP-094 Fase 4 — COA / sessão à prova de utilizador.
 * Rollback: CEO_FUNIL_COA_RIGIDO=off
 */

/**
 * Endurecimento COA activo por omissão; desliga com CEO_FUNIL_COA_RIGIDO=off.
 * @returns {boolean}
 */
export function funilCoaRigidoActiva() {
  const env =
    (typeof process !== "undefined" && process.env?.CEO_FUNIL_COA_RIGIDO) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.CEO_FUNIL_COA_RIGIDO) ||
    "";
  return String(env).trim().toLowerCase() !== "off";
}

/**
 * @param {unknown} v
 * @returns {string|null}
 */
function idCoa(v) {
  if (v == null || v === "") return null;
  if (typeof v === "object" && v.id != null && String(v.id).trim()) {
    return String(v.id).trim();
  }
  const s = String(v).trim();
  return s || null;
}

/**
 * Resolução única de COA para Porta Canónica e destino (ISO-1…ISO-4 / I-ISO-4).
 * Com flag ON: divergência entrada≠sessão ou sessão não autorizada ⇒ falha observável.
 * Com flag OFF (rollback): `entrada || sessão` (legado IMP-092).
 *
 * @param {{
 *   entrada?: string|null,
 *   sessao?: string|null|{ id?: string|null },
 *   autorizaContextoSessao?: boolean
 * }} p
 * @returns {{
 *   ok: boolean,
 *   coaId: string|null,
 *   divergencia: boolean,
 *   codigo: string|null,
 *   marcadoresLn: string[],
 *   mensagem: string|null,
 *   legado: boolean
 * }}
 */
export function resolverCoaTurno(p = {}) {
  const idEntrada = idCoa(p.entrada);
  const idSessao = idCoa(p.sessao);
  const autoriza = p.autorizaContextoSessao !== false;

  if (!funilCoaRigidoActiva()) {
    return {
      ok: true,
      coaId: idEntrada || idSessao || null,
      divergencia: Boolean(
        idEntrada && idSessao && idEntrada !== idSessao
      ),
      codigo: null,
      marcadoresLn: [],
      mensagem: null,
      legado: true
    };
  }

  if (idEntrada && idSessao && idEntrada !== idSessao) {
    return {
      ok: false,
      coaId: null,
      divergencia: true,
      codigo: "coa_divergente",
      marcadoresLn: ["LN-09"],
      mensagem:
        "COA da entrada e COA da sessão divergem. Não escolho lastro em silêncio — confirme o projecto Abrir (COA activo) e reenvie.",
      legado: false
    };
  }

  if (!autoriza) {
    return {
      ok: true,
      coaId: null,
      divergencia: false,
      codigo: "sessao_nao_autorizada",
      marcadoresLn: [],
      mensagem: null,
      legado: false
    };
  }

  const coaId = idEntrada || idSessao || null;
  if (!coaId) {
    return {
      ok: false,
      coaId: null,
      divergencia: false,
      codigo: "coa_ausente",
      marcadoresLn: ["LN-09"],
      mensagem:
        "Sem COA activo não há lastro de caso. Abra um projecto (Abrir) antes de consultar ou registar factos do LFC.",
      legado: false
    };
  }

  return {
    ok: true,
    coaId,
    divergencia: false,
    codigo: null,
    marcadoresLn: [],
    mensagem: null,
    legado: false
  };
}

/**
 * Com flag ON: hint textual **não retargeta** caso LFC no wiring PC
 * (só deixis / casoId explícito — ver `wiringConversacional`).
 * Não bloqueia a extracção de título explícito no pedido para resolução
 * dentro do COA activo (consumo MRE / CM6).
 * @returns {boolean}
 */
export function permitirHintTituloCasoLfc() {
  return !funilCoaRigidoActiva();
}

/**
 * OBS-5 (`coaId`/`casoId`) + OBS-6 (marcadores LN de isolamento).
 * @param {object} resposta
 * @param {{
 *   coaId?: string|null,
 *   casoId?: string|null,
 *   marcadoresLn?: string[],
 *   codigoCoa?: string|null
 * }} [obs]
 * @returns {object}
 */
export function anexarObservabilidadeCoa(resposta, obs = {}) {
  const dadosPrev =
    resposta?.dados && typeof resposta.dados === "object" ? resposta.dados : {};
  const marcadores = Array.isArray(obs.marcadoresLn)
    ? obs.marcadoresLn.filter(Boolean)
    : [];
  return {
    ...resposta,
    dados: {
      ...dadosPrev,
      coaId: obs.coaId != null ? obs.coaId : dadosPrev.coaId ?? null,
      casoId: obs.casoId != null ? obs.casoId : dadosPrev.casoId ?? null,
      ...(marcadores.length
        ? {
            marcadoresLn: marcadores,
            marcadoresIsolamento: marcadores
          }
        : {}),
      ...(obs.codigoCoa
        ? { codigoCoa: obs.codigoCoa }
        : dadosPrev.codigoCoa
          ? {}
          : {})
    }
  };
}
