/**
 * IMP-070 B1 / REQ-070 — Fonte Oficial única do conhecimento organizacional.
 * Acervo Oficial = única fonte canónica. Projecções são subordinadas.
 * Lacuna explícita quando não há item apto.
 * IMP-070 B2: inclusão com guarda de limites (REQ-073) via tentarIncluirComLimites.
 */

import { avaliarAdmissao } from "./limitesAdmissao.js";

export const FONTE_OFICIAL_ID = "acervo_oficial";

export const LACUNA_SEM_ITEM_APTO =
  "LACUNA EXPLÍCITA (Fonte Oficial / Acervo): não há item de conhecimento apto registado no Acervo Oficial para este âmbito. Não inventar factos nem tratar projecções (ex.: briefing) como património oficial.";

/**
 * Hint estágio 6 — declara lacuna de Acervo sem a tratar como lacuna material de decisão
 * (REQ-070 CA-070-5/6; distinto de REQ-048 solicitar_dados).
 * @returns {string}
 */
export function hintEstagio6LacunaFonteOficial() {
  return (
    " Fonte Oficial (Acervo) sem item apto: há LACUNA EXPLÍCITA. " +
    "Não inventar conhecimento organizacional; a projecção subordinada " +
    "(briefing), se existir, não substitui o Acervo. " +
    "LACUNA EXPLÍCITA do Acervo indica ausência de conhecimento oficial persistente; " +
    "NÃO constitui, por si só, lacuna material de decisão nem facto bloqueante. " +
    "NÃO use estado=solicitar_dados nem estado=monitorar apenas porque o Acervo está vazio. " +
    "Se a mensagem/conversa já fornecer factos suficientes para a decisão pedida, " +
    "delibere sobre esses factos sem os apresentar como património oficial do Acervo. " +
    "solicitar_dados só se faltar informação MATERIALMENTE necessária à decisão e essa " +
    "informação estiver realmente ausente do contexto corrente."
  );
}

/**
 * @typedef {object} ItemConhecimentoOficial
 * @property {string} id — KNW-nnn
 * @property {string} conteudo
 * @property {"apto"|"nao_apto"} aptidao
 * @property {string} [ambitoCoa]
 * @property {string} [versaoConteudo]
 */

/**
 * @typedef {object} ConsultaFonteOficial
 * @property {typeof FONTE_OFICIAL_ID} fonte
 * @property {true} unica
 * @property {ReadonlyArray<ItemConhecimentoOficial>} itens
 * @property {string|null} lacuna
 * @property {boolean} haConhecimentoApto
 */

/** @type {ItemConhecimentoOficial[]} */
let registroItens = [];

/**
 * Consulta a Fonte Oficial (Acervo). Única superfície canónica de conhecimento organizacional.
 * @param {object} [opts]
 * @param {string} [opts.ambitoCoa]
 * @returns {ConsultaFonteOficial}
 */
export function consultarFonteOficial(opts = {}) {
  const ambito = String(opts.ambitoCoa || "").trim();
  const itens = registroItens.filter((it) => {
    if (!it || it.aptidao !== "apto") return false;
    if (!ambito) return true;
    const a = String(it.ambitoCoa || "").trim();
    if (!a) return true;
    return a === ambito || nomesCoaEquivalentes(a, ambito);
  });

  if (itens.length === 0) {
    return Object.freeze({
      fonte: FONTE_OFICIAL_ID,
      unica: true,
      itens: Object.freeze([]),
      lacuna: LACUNA_SEM_ITEM_APTO,
      haConhecimentoApto: false
    });
  }

  return Object.freeze({
    fonte: FONTE_OFICIAL_ID,
    unica: true,
    itens: Object.freeze(itens.map((it) => Object.freeze({ ...it }))),
    lacuna: null,
    haConhecimentoApto: true
  });
}

/**
 * Factos oficiais derivados só do Acervo (nunca de projecções).
 * Inclui lacuna explícita quando vazio.
 * Preferir a Porta (REQ-072) nos consumidores EIC/EE/MRE/CN.
 * @param {object} [opts]
 * @param {string} [opts.ambitoCoa]
 * @returns {string[]}
 */
export function factosDaFonteOficial(opts = {}) {
  const c = consultarFonteOficial(opts);
  if (c.lacuna) return [c.lacuna];
  return c.itens.map((it) => {
    const ver = it.versaoConteudo ? ` [${it.versaoConteudo}]` : "";
    return `${it.id}${ver}: ${it.conteudo}`;
  });
}

/**
 * Leitura opaca para a Porta de recuperação (B5 / REQ-072).
 * Não expõe aptidão, cadeia de versões, nem estrutura do registo interno.
 * @param {object} [opts]
 * @param {string} [opts.ambitoCoa]
 */
export function lerAptoParaConsumo(opts = {}) {
  const c = consultarFonteOficial(opts);
  if (c.lacuna) {
    return Object.freeze({
      factos: Object.freeze([c.lacuna]),
      itens: Object.freeze([]),
      referenciasVersao: Object.freeze([]),
      lacuna: c.lacuna,
      haApto: false
    });
  }
  const itens = c.itens.map((it) =>
    Object.freeze({
      id: it.id,
      conteudo: it.conteudo,
      versao: it.versaoConteudo || null
    })
  );
  const referenciasVersao = c.itens
    .filter((it) => it.versaoConteudo)
    .map((it) =>
      Object.freeze({ id: it.id, versao: it.versaoConteudo })
    );
  const factos = c.itens.map((it) => {
    const ver = it.versaoConteudo ? ` [${it.versaoConteudo}]` : "";
    return `${it.id}${ver}: ${it.conteudo}`;
  });
  return Object.freeze({
    factos: Object.freeze(factos),
    itens: Object.freeze(itens),
    referenciasVersao: Object.freeze(referenciasVersao),
    lacuna: null,
    haApto: true
  });
}

/**
 * Marca um artefacto como projecção subordinada à Fonte Oficial.
 * @param {object} projecao
 */
export function subordinarProjecao(projecao) {
  if (!projecao || typeof projecao !== "object") {
    return {
      tipo: "projecao_subordinada",
      fonteCanononica: FONTE_OFICIAL_ID,
      naoEFonteOficial: true,
      conteudo: null
    };
  }
  return {
    ...projecao,
    tipo: "projecao_subordinada",
    fonteCanononica: FONTE_OFICIAL_ID,
    naoEFonteOficial: true
  };
}

/**
 * Prefixo obrigatório quando uma projecção é exposta a consumidores.
 * @param {string} texto
 */
export function rotuloProjecaoSubordinada(texto) {
  const corpo = String(texto || "").trim();
  if (!corpo) return "";
  return (
    "PROJEÇÃO SUBORDINADA (não é Fonte Oficial — em divergência prevalece o Acervo Oficial):\n" +
    corpo
  );
}

/**
 * @param {string} a
 * @param {string} b
 */
function nomesCoaEquivalentes(a, b) {
  const na = String(a).toLowerCase();
  const nb = String(b).toLowerCase();
  if (na === nb) return true;
  const mg2 = (x) => /prj-mg2|coa-mg2|motoboy\s*game\s*2|\bmg2\b/.test(x);
  return mg2(na) && mg2(nb);
}

/** @param {ItemConhecimentoOficial[]} itens */
export function carregarItensAcervoParaTestes(itens) {
  registroItens = Array.isArray(itens)
    ? itens.map((it) => ({
        id: String(it.id || "").trim(),
        conteudo: String(it.conteudo || "").trim(),
        aptidao: it.aptidao === "nao_apto" ? "nao_apto" : "apto",
        ambitoCoa: it.ambitoCoa ? String(it.ambitoCoa) : undefined,
        versaoConteudo: it.versaoConteudo ? String(it.versaoConteudo) : undefined
      }))
    : [];
}

export function reiniciarAcervoParaTestes() {
  registroItens = [];
}

/**
 * Quantidade de itens no registro (incl. não aptos) — só diagnóstico/teste.
 */
export function contagemRegistroAcervo() {
  return registroItens.length;
}

/**
 * Inclui item no registro apenas se passar os limites (REQ-073 / B2).
 * Não executa cadeia de governação (REQ-074 / B3).
 * Preferir `registarPublicacaoGovernada` para promoção oficial.
 * @param {object} candidato
 * @returns {{ incluido: boolean, motivosRecusa: string[], id?: string }}
 */
export function tentarIncluirComLimites(candidato = {}) {
  const av = avaliarAdmissao(candidato);
  if (!av.ok) {
    return {
      incluido: false,
      motivosRecusa: [...av.motivosRecusa]
    };
  }
  const id = String(candidato.id || "").trim();
  if (!id) {
    return { incluido: false, motivosRecusa: ["id_ausente"] };
  }
  const versaoInicial = candidato.versaoConteudo
    ? String(candidato.versaoConteudo)
    : "v1";
  const conteudo = String(candidato.conteudo || "").trim();
  registroItens.push({
    id,
    conteudo,
    aptidao: candidato.aptidao === "nao_apto" ? "nao_apto" : "apto",
    ambitoCoa: candidato.ambitoCoa
      ? String(candidato.ambitoCoa)
      : undefined,
    versaoConteudo: versaoInicial,
    versoes: [
      {
        versao: versaoInicial,
        conteudo,
        quando: candidato.quando || null
      }
    ]
  });
  return { incluido: true, motivosRecusa: [], id };
}

/**
 * Publicação oficial só com prova de governação (REQ-074 / B3).
 * @param {object} candidato
 * @returns {{ incluido: boolean, motivosRecusa: string[], id?: string }}
 */
export function registarPublicacaoGovernada(candidato = {}) {
  const prova = candidato.prova || {};
  if (!prova.homologacaoUsuario || !prova.publicacaoEngenheiro) {
    return {
      incluido: false,
      motivosRecusa: ["publicacao_sem_prova_governanca"]
    };
  }
  return tentarIncluirComLimites(candidato);
}

/**
 * @param {string} id
 */
export function obterItemPorId(id) {
  const key = String(id || "").trim();
  const it = registroItens.find((x) => x.id === key);
  if (!it) return null;
  return {
    ...it,
    versoes: Array.isArray(it.versoes) ? it.versoes.map((v) => ({ ...v })) : []
  };
}

/**
 * Cadeia de versões de conteúdo (mesma identidade).
 * @param {string} id
 */
export function obterCadeiaVersoes(id) {
  const it = registroItens.find((x) => x.id === String(id || "").trim());
  if (!it) return null;
  return {
    id: it.id,
    versaoVigente: it.versaoConteudo || null,
    versoes: Array.isArray(it.versoes) ? it.versoes.map((v) => ({ ...v })) : []
  };
}

/**
 * Nova versão de conteúdo — mesma identidade (REQ-071 / B4).
 * Exige prova de curadoria governada.
 * @param {object} opts
 */
export function aplicarNovaVersaoConteudo(opts = {}) {
  const prova = opts.prova || {};
  if (!prova.actoCuradoriaGovernada) {
    return { ok: false, erro: "sem_acto_curadoria_governada" };
  }
  const key = String(opts.id || "").trim();
  const it = registroItens.find((x) => x.id === key);
  if (!it) return { ok: false, erro: "item_inexistente" };
  const novo = String(opts.conteudo || "").trim();
  if (!novo) return { ok: false, erro: "conteudo_vazio" };
  if (!Array.isArray(it.versoes)) {
    it.versoes = [
      {
        versao: it.versaoConteudo || "v1",
        conteudo: it.conteudo,
        quando: null
      }
    ];
  }
  const n = it.versoes.length + 1;
  const versao = String(opts.versaoConteudo || `v${n}`);
  it.versoes.push({
    versao,
    conteudo: novo,
    quando: opts.quando || null
  });
  it.conteudo = novo;
  it.versaoConteudo = versao;
  return {
    ok: true,
    id: it.id,
    versaoConteudo: versao,
    identidadePreservada: true,
    versoes: it.versoes.length
  };
}

/**
 * Altera aptidão preservando identidade (REQ-074).
 * @param {string} id
 * @param {"apto"|"nao_apto"} aptidao
 */
export function alterarAptidaoGovernada(id, aptidao) {
  const key = String(id || "").trim();
  const it = registroItens.find((x) => x.id === key);
  if (!it) return { ok: false, erro: "item_inexistente" };
  if (aptidao !== "apto" && aptidao !== "nao_apto") {
    return { ok: false, erro: "aptidao_invalida" };
  }
  it.aptidao = aptidao;
  return { ok: true, id: it.id, aptidao: it.aptidao };
}
