/**
 * Correção 4 — identidade real de projeto em nova missão nomeada.
 * Reutiliza catalogoProjetos.criarProjeto (cria se não existir; senão selecciona).
 * Só actua com intenção explícita de iniciar/usar nova missão nesse projecto.
 */

import {
  criarProjeto,
  listarProjetos,
  obterProjetoAtivo
} from "../catalogoProjetos/index.js";
import { normalizarTexto } from "../classificadorIntencao/lexicon.js";

/**
 * Intenção explícita: iniciar/usar nova missão no/em projecto nomeado.
 * Não captura menções incidentais nem «independente do projecto X».
 * @param {string} texto
 * @returns {boolean}
 */
export function ehIntencaoNovaMissaoEmProjeto(texto) {
  return Boolean(extrairNomeProjetoNovaMissao(texto));
}

/**
 * Extrai o nome canónico do projecto-alvo (ex.: «PROJETO TESTE BETA»).
 * @param {string} texto
 * @returns {string|null}
 */
export function extrairNomeProjetoNovaMissao(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return null;
  const t = normalizarTexto(raw);

  // Exige âncora de nova missão / início de missão no|em projecto
  const ancora =
    /\bnova\s+missao\s+(no|em|dentro\s+d[oe])\s+projeto\b/.test(t) ||
    /\b(iniciar|comecar|quero)\b[\s\S]{0,80}?\bmissao\s+(no|em|dentro\s+d[oe])\s+projeto\b/.test(
      t
    );
  if (!ancora) return null;

  // «missão independente do projecto X» não é alvo (sem no|em)
  const m = raw.match(
    /\bmiss[aã]o\s+(?:no|em|dentro\s+d[oe])\s+(projeto\s+[^\n]+)/i
  );
  if (!m) return null;

  let nome = String(m[1] || "").trim();
  nome = nome
    .split(
      /\s*(?:\.|$|\n|Objetivo|Objectivo|Conte[uú]do|Execute|N[aã]o\s+utilize|N[aã]o\s+altere)/i
    )[0]
    .trim();
  nome = nome.replace(/[«»"'.,;:]+$/g, "").trim();
  if (!nome || nome.length < 3) return null;
  if (/independente/i.test(nome)) return null;

  if (/^projeto\s+/i.test(nome)) {
    nome = `PROJETO ${nome.replace(/^projeto\s+/i, "").trim()}`;
  }

  return nome;
}

/**
 * Garante COA/projecto activo alinhado com a nova missão nomeada.
 * @param {string} texto
 * @param {{
 *   criarProjeto?: Function,
 *   listarProjetos?: Function,
 *   obterProjetoAtivo?: Function
 * }} [portas]
 * @returns {{
 *   aplicado: boolean,
 *   criado: boolean,
 *   nome: string|null,
 *   projeto: object|null
 * }}
 */
export function garantirProjetoParaNovaMissao(texto, portas = {}) {
  const nome = extrairNomeProjetoNovaMissao(texto);
  const obterAtivo =
    typeof portas.obterProjetoAtivo === "function"
      ? portas.obterProjetoAtivo
      : obterProjetoAtivo;

  if (!nome) {
    return { aplicado: false, criado: false, nome: null, projeto: obterAtivo() };
  }

  const listar =
    typeof portas.listarProjetos === "function"
      ? portas.listarProjetos
      : listarProjetos;
  const criar =
    typeof portas.criarProjeto === "function" ? portas.criarProjeto : criarProjeto;

  const antes = listar() || [];
  const existia = antes.some(
    (p) => String(p.nome || "").toLowerCase() === nome.toLowerCase()
  );

  const projeto = criar({
    nome,
    ...(existia
      ? {}
      : {
          descricao: `Contexto criado por nova missão explícita («${nome}»).`
        })
  });

  return {
    aplicado: true,
    criado: !existia,
    nome,
    projeto: projeto || null
  };
}

/**
 * Correção 7 — missão/projecto do turno corrente para filtro de acompanhamento.
 * Se a mensagem estabelece nova missão nomeada, essa missão prevalece sobre o COA anterior.
 * Não muta o catálogo (a Correção 4 continua a criar/seleccionar no C3).
 *
 * @param {string} texto
 * @param {{
 *   missaoActiva?: { id?: string|null, nome?: string|null }|null,
 *   listarProjetos?: Function,
 *   obterProjetoAtivo?: Function
 * }} [portas]
 * @returns {{ id?: string|null, nome?: string|null }|null}
 */
export function resolverMissaoActivaDoTurno(texto, portas = {}) {
  const nome = extrairNomeProjetoNovaMissao(texto);
  if (nome) {
    const listar =
      typeof portas.listarProjetos === "function"
        ? portas.listarProjetos
        : listarProjetos;
    const encontrado = (listar() || []).find(
      (p) => String(p?.nome || "").toLowerCase() === nome.toLowerCase()
    );
    if (encontrado) {
      return {
        id: encontrado.id != null ? encontrado.id : null,
        nome: encontrado.nome || nome
      };
    }
    return { id: null, nome };
  }

  if (Object.prototype.hasOwnProperty.call(portas, "missaoActiva")) {
    return portas.missaoActiva;
  }

  const obterAtivo =
    typeof portas.obterProjetoAtivo === "function"
      ? portas.obterProjetoAtivo
      : obterProjetoAtivo;
  try {
    const ativo = obterAtivo();
    if (!ativo) return null;
    return {
      id: ativo.id != null ? ativo.id : null,
      nome: ativo.nome != null ? ativo.nome : null
    };
  } catch {
    return null;
  }
}
