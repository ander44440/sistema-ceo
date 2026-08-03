/**
 * Contexto Executivo da sessão — Painel Executivo para o LLM.
 * Factos dinâmicos apenas; sem Constituição, Governança nem briefing.
 * Cada facto aparece uma única vez, na secção de maior prioridade.
 */

import {
  obterDiaExecutivo,
  obterProjetoAtivo,
  obterUltimaContinuidade
} from "../catalogoProjetos/index.js";
import { classificarEstadoExecutivo } from "../catalogoProjetos/estadoExecutivo.js";
import { obterCoaAtivo } from "./coaSessao.js";

/**
 * @param {string[]} itens
 * @param {string} vazio
 */
function listaOuVazio(itens, vazio) {
  if (!itens.length) return vazio;
  return itens.map((t) => `- ${t}`).join("\n");
}

/**
 * @param {string|null|undefined} valor
 * @param {string} [vazio]
 */
function valorOuVazio(valor, vazio = "(não definido)") {
  const t = String(valor || "").trim();
  return t || vazio;
}

/**
 * Riscos derivados apenas do estado e das pendências (sem repetir o texto das pendências).
 * @param {string} estadoOperacional
 * @param {Array<{ texto?: string }>} pendenciasAbertas
 */
function derivarRiscosConhecidos(estadoOperacional, pendenciasAbertas) {
  const riscos = [];
  if (estadoOperacional === "Crítico") {
    riscos.push("Estado operacional classificado como Crítico.");
  } else if (estadoOperacional === "Atenção") {
    riscos.push("Estado operacional classificado como Atenção.");
  }
  const nRisco = pendenciasAbertas.filter((p) =>
    /cr[ií]tic|urgente|bloque/i.test(String(p.texto || ""))
  ).length;
  if (nRisco === 1) {
    riscos.push(
      "1 pendência aberta com indício de risco (crítico/urgente/bloqueio) — ver Pendências abertas."
    );
  } else if (nRisco > 1) {
    riscos.push(
      `${nRisco} pendências abertas com indício de risco (crítico/urgente/bloqueio) — ver Pendências abertas.`
    );
  }
  return riscos;
}

/**
 * @param {object} params
 * @param {object} params.memoria
 * @param {object|null} params.coa
 * @param {object} [params.intencao]
 * @returns {string}
 */
export function construirContextoSessao({ memoria, coa, intencao }) {
  const coaAtual = coa || obterCoaAtivo();
  const mem = memoria || {};
  const projeto = obterProjetoAtivo();
  const dia = obterDiaExecutivo();
  const continuidade = obterUltimaContinuidade();

  const projetoAtivoNome = coaAtual
    ? `${coaAtual.nome} (${coaAtual.id}, ${coaAtual.status || "ativo"})`
    : mem.projetoAtivo
      ? `${mem.projetoAtivo.nome} (${mem.projetoAtivo.id})`
      : "(nenhum)";

  const estadoOperacional = projeto
    ? classificarEstadoExecutivo(projeto)
    : "Estável";

  const objetivoAtual =
    dia?.status === "em_curso" && dia.intencaoDoDia
      ? String(dia.intencaoDoDia).trim()
      : "";

  const decisoes = (mem.decisoes || [])
    .slice(0, 5)
    .map((d) => String(d.texto || "").trim())
    .filter(Boolean);

  const pendenciasAbertas = (mem.pendencias || []).filter(
    (p) => p.status === "aberta"
  );
  const pendenciasTextos = pendenciasAbertas
    .slice(0, 5)
    .map((p) => String(p.texto || "").trim())
    .filter(Boolean);

  const proximaAcaoRegistrada =
    (mem.proximasAcoes && mem.proximasAcoes[0] && mem.proximasAcoes[0].texto) ||
    null;

  const sugeridoBruto =
    (projeto && projeto.proximoPassoSugerido) ||
    (continuidade &&
      continuidade.proximoPassoAmanha &&
      continuidade.proximoPassoAmanha !== "(não informado)" &&
      continuidade.proximoPassoAmanha) ||
    null;

  const proximoPassoSugerido =
    sugeridoBruto &&
    String(sugeridoBruto).trim() !== String(proximaAcaoRegistrada || "").trim()
      ? String(sugeridoBruto).trim()
      : null;

  const riscos = derivarRiscosConhecidos(estadoOperacional, pendenciasAbertas);

  const secao1 = [
    "PAINEL EXECUTIVO — CONTEXTO DA SESSÃO",
    "Fonte de factos dinâmicos. A secção 1 é a base obrigatória da deliberação.",
    "",
    "══════════════════════════════════════",
    "1. ESTADO EXECUTIVO (fonte principal da deliberação)",
    "══════════════════════════════════════",
    `Projeto ativo: ${projetoAtivoNome}`,
    `Objetivo atual: ${valorOuVazio(objetivoAtual)}`,
    `Estado operacional: ${estadoOperacional}`,
    "Decisões registradas:",
    listaOuVazio(decisoes, "(nenhuma)"),
    "Pendências abertas:",
    listaOuVazio(pendenciasTextos, "(nenhuma)"),
    `Próxima ação registrada: ${valorOuVazio(
      proximaAcaoRegistrada,
      "(nenhuma)"
    )}`,
    `Próximo passo sugerido: ${valorOuVazio(
      proximoPassoSugerido,
      "(nenhum)"
    )}`,
    "Riscos conhecidos (derivados deste CONTEXTO):",
    listaOuVazio(riscos, "(nenhum risco explícito no contexto)")
  ];

  const statusDia = dia?.status || "nao_iniciado";
  const rotuloDia =
    statusDia === "em_curso"
      ? "em curso"
      : statusDia === "encerrado"
        ? "encerrado"
        : "ainda não aberto";

  const secao2 = [
    "",
    "──────────────────────────────────────",
    "2. SITUAÇÃO DO PROJETO",
    "──────────────────────────────────────",
    `Status do dia: ${rotuloDia}`
  ];
  if (dia?.status === "em_curso" && dia.abertoEm) {
    secao2.push(`Dia aberto em: ${dia.abertoEm}`);
  }
  if (continuidade?.oQueAndou && continuidade.oQueAndou !== "(não informado)") {
    secao2.push(`O que andou (última continuidade): ${continuidade.oQueAndou}`);
  }
  if (continuidade?.oQueFica && continuidade.oQueFica !== "(não informado)") {
    secao2.push(`O que permanece (última continuidade): ${continuidade.oQueFica}`);
  }
  if (mem.atualizadoEm) {
    secao2.push(`Última atividade registada: ${mem.atualizadoEm}`);
  }
  if (secao2.length === 4) {
    secao2.push("(sem detalhes adicionais além do Estado Executivo)");
  }

  /** Factos já na §1/§2 — não repetir no histórico. */
  const factosPrioritarios = new Set([
    ...decisoes.map((t) => t.toLowerCase()),
    ...pendenciasTextos.map((t) => t.toLowerCase())
  ]);
  if (proximaAcaoRegistrada) {
    factosPrioritarios.add(String(proximaAcaoRegistrada).trim().toLowerCase());
  }

  const historico = (mem.ultimasAcoes || [])
    .map((a) => {
      const texto = String(a.instrucao || a.resumo || "").trim();
      if (!texto) return "";
      const eco = texto.match(
        /^(Decisão|Pendência|Próxima ação|Dia aberto|Dia encerrado)\s*:?\s*(.*)$/i
      );
      if (eco) {
        const tipo = eco[1].toLowerCase();
        const resto = String(eco[2] || "").trim();
        if (tipo === "dia aberto" || tipo === "dia encerrado") return "";
        if (resto && factosPrioritarios.has(resto.toLowerCase())) return "";
      }
      const cap = a.capacidade ? `[${a.capacidade}] ` : "";
      return `${cap}${texto}`;
    })
    .filter(Boolean)
    .slice(0, 5);

  const secao3 = [
    "",
    "──────────────────────────────────────",
    "3. HISTÓRICO RECENTE",
    "──────────────────────────────────────",
    listaOuVazio(historico, "(nenhum)")
  ];

  const projetos =
    (mem.projetosAtivos || []).map((p) => p.nome).filter(Boolean).join(", ") ||
    "(nenhum)";

  const secao4 = [
    "",
    "──────────────────────────────────────",
    "4. DEMAIS INFORMAÇÕES DA SESSÃO",
    "──────────────────────────────────────",
    `Projetos acompanhados: ${projetos}`,
    `Intenção classificada pelo núcleo: ${
      (intencao && intencao.id) || "n/d"
    } → ${(intencao && intencao.capacidade) || "n/d"}`
  ];

  return [...secao1, ...secao2, ...secao3, ...secao4].join("\n");
}
