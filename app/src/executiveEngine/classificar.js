/**
 * Classificação de intenção — adapter do Classificador canónico (IMP-057 E4).
 * Um único limiar/caminho: `classificadorIntencao` → Intencao legada (capacidade).
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import { classificar as classificarCanonico } from "../classificadorIntencao/regras.js";
import { ID_POR_CLASSE } from "../classificadorIntencao/dominio.js";
import { ehRecomendacaoOperacional } from "../classificadorIntencao/recomendacaoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import {
  detectarAncoraEmpresa,
  temAncoraExplicitaProjeto
} from "../classificadorIntencao/ancoraEmpresa.js";

export { normalizarTexto };

/**
 * @typedef {"empresa"|"projeto"|"missao"|null} AlvoContexto
 * @typedef {"trocar"|"consultar"|"decidir"|"mencionar"|null} AcaoContexto
 */

/**
 * Metadado de alvo/ação — sem novo destino canónico.
 * @param {string} texto
 * @returns {{ alvoContexto: AlvoContexto, acaoContexto: AcaoContexto }}
 */
export function resolverMetadadosContexto(texto) {
  const t = normalizarTexto(texto);
  if (!t) return { alvoContexto: null, acaoContexto: null };

  if (detectarPedidoDecisaoExplicita(texto)) {
    return { alvoContexto: null, acaoContexto: "decidir" };
  }
  if (temAncoraExplicitaProjeto(texto)) {
    return { alvoContexto: "projeto", acaoContexto: "trocar" };
  }
  if (detectarAncoraEmpresa(texto)) {
    return { alvoContexto: "empresa", acaoContexto: "trocar" };
  }
  if (
    /\bnova\s+missao\s+(no|em|dentro\s+d[oe])\s+projeto\b/.test(t) ||
    /\b(iniciar|comecar|quero)\b[\s\S]{0,80}?\bmissao\s+(no|em|dentro\s+d[oe])\s+projeto\b/.test(
      t
    )
  ) {
    return { alvoContexto: "missao", acaoContexto: "trocar" };
  }
  if (
    /\bempresa\b/.test(t) &&
    /\b(estado|situacao|como\s+esta|qual\s+[eé])\b/.test(t)
  ) {
    return { alvoContexto: "empresa", acaoContexto: "consultar" };
  }
  if (
    /\b(projeto|coa)\b/.test(t) &&
    /\b(estado|situacao|como\s+esta|qual\s+[eé]|atrasad)/.test(t)
  ) {
    return { alvoContexto: "projeto", acaoContexto: "consultar" };
  }
  if (/^\s*empresa\b/.test(t) || /\bempresa\b/.test(t)) {
    return { alvoContexto: "empresa", acaoContexto: "mencionar" };
  }
  if (/\b(projeto|coa|mg2|motoboy)\b/.test(t)) {
    return { alvoContexto: "projeto", acaoContexto: "mencionar" };
  }
  return { alvoContexto: null, acaoContexto: null };
}

/**
 * @param {object} intencao
 * @param {string} texto
 */
function comMetadadosContexto(intencao, texto) {
  const meta = resolverMetadadosContexto(texto);
  return { ...intencao, ...meta };
}

/**
 * @typedef {object} Intencao
 * @property {string} id
 * @property {string} capacidade
 * @property {number} confianca
 * @property {"classificador_canonico"|"stub"} origem
 * @property {string} [classe]
 * @property {string} [destino]
 * @property {object} [classificacao]
 * @property {AlvoContexto} [alvoContexto]
 * @property {AcaoContexto} [acaoContexto]
 */

/**
 * Mapa texto → capacidade registada (C1/C2/C4 e legado operacional).
 * C3 não usa capacidade — o Núcleo chama o Motor.
 * @param {string} texto
 * @returns {{ id: string, capacidade: string, confianca: number }}
 */
export function mapearCapacidadePorTexto(texto) {
  const t = normalizarTexto(texto);

  if (!t) {
    return { id: "instrucao_vazia", capacidade: "ia", confianca: 1 };
  }

  // Precedência: âncora projecto > âncora empresa > E4 (decisão não mapeia WRITE aqui)
  if (
    !detectarPedidoDecisaoExplicita(texto) &&
    temAncoraExplicitaProjeto(texto)
  ) {
    return { id: "atuar_em_projetos", capacidade: "projetos", confianca: 0.8 };
  }

  if (
    !detectarPedidoDecisaoExplicita(texto) &&
    detectarAncoraEmpresa(texto)
  ) {
    return { id: "atuar_em_empresas", capacidade: "empresas", confianca: 0.8 };
  }

  // E4 — recomendação operacional antes de consulta genérica / deliberação
  if (ehRecomendacaoOperacional(t)) {
    return {
      id: "recomendar_operacional",
      capacidade: "memoria",
      confianca: 0.95
    };
  }

  // Relato/encerramento (três campos) — antes de consulta de estado
  if (
    /\b(encerrar|fechar)\s+(o\s+)?dia\b/.test(t) ||
    /\bencerramento\s+executivo\b/.test(t) ||
    /\brelato\s+(da\s+)?(missao|encerramento|executivo)\b/.test(t) ||
    (/\bo\s+que\s+andou\b/.test(t) &&
      /\bo\s+que\s+fica\b/.test(t) &&
      /\bpr[oó]ximo\s+passo\b/.test(t))
  ) {
    return { id: "encerrar_dia", capacidade: "memoria", confianca: 0.97 };
  }

  if (
    /^(ol[aá]|oi|bom dia|boa tarde|boa noite|hey|hello)([!. ]|$)/.test(t) ||
    /^(ol[aá]|oi|bom dia|boa tarde|boa noite)\b/.test(t)
  ) {
    return { id: "saudacao", capacidade: "ia", confianca: 0.95 };
  }

  if (
    /\b(que dia (e|é)|qual (e|é) (o )?dia|data de hoje|hoje e que dia|hoje é que dia)\b/.test(
      t
    ) ||
    /\bdia (e|é) hoje\b/.test(t) ||
    /^data$/.test(t)
  ) {
    return { id: "pergunta_data", capacidade: "ia", confianca: 0.98 };
  }

  if (
    /\b(que horas|qual (e|é) a hora|hora atual|horas sao|horas são)\b/.test(t) ||
    /^hora$/.test(t)
  ) {
    return { id: "pergunta_hora", capacidade: "ia", confianca: 0.98 };
  }

  if (
    /\b(quem (e|é|es|és) (voc[eê]|voce|tu)|o que (e|é) (voc[eê]|voce|o ceo)|o que (voc[eê]|voce) (e|é|faz)|quem e vc)\b/.test(
      t
    )
  ) {
    return { id: "pergunta_identidade", capacidade: "ia", confianca: 0.95 };
  }

  if (
    /qual\s+[eé]\s+o\s+estado\s+atual/.test(t) ||
    /\bestado\s+atual\b/.test(t) ||
    /\bestado\s+da\s+fila\b/.test(t) ||
    /\b(resumo\s+(executivo|da\s+sess[aã]o)|mem[oó]ria\s+executiva)\b/.test(t) ||
    /\bgates?\s+pendentes?\b/.test(t) ||
    /\bquais\s+gates?\b/.test(t) ||
    /\bqual\s+[eé]?\s*(o\s+)?gates?\b/.test(t) ||
    /\bid\s+(do\s+)?gates?\b/.test(t) ||
    /\bestado\s+(do\s+)?jobs?-?\d*\b/.test(t) ||
    /\bjobs?-\d+\b/.test(t) ||
    /\b(resultado|verificad|verificacao).*\bjobs?-\d*\b/.test(t) ||
    /\bconsulte?\s+(o\s+)?estado\b/.test(t) ||
    /\bo\s+que\s+esta\s+(pendente|aguardando)\b/.test(t) ||
    /\bme\s+diga\s+o\s+que\s+esta\s+pendente\b/.test(t)
  ) {
    return { id: "consultar_estado", capacidade: "memoria", confianca: 0.95 };
  }

  {
    const cabeca = t.split(":")[0].trim();
    if (/\b(encerrar|fechar)\s+(o\s+)?dia\b/.test(cabeca)) {
      return { id: "encerrar_dia", capacidade: "memoria", confianca: 0.96 };
    }
    if (
      /\babrir\s+(o\s+)?dia\b/.test(cabeca) ||
      /\b(iniciar|come[cç]ar)\s+(o\s+)?dia\b/.test(cabeca)
    ) {
      return { id: "abrir_dia", capacidade: "memoria", confianca: 0.96 };
    }
  }

  if (
    /(?:consultar|consulta|pedir|pe[cç]a|parecer)\s+(?:o\s+|ao\s+|do\s+)?cto\b/.test(
      t
    ) ||
    /\bcto\s*:\s*\S+/.test(t) ||
    /\bpergunte?\s+ao\s+cto\b/.test(t)
  ) {
    return { id: "consultar_cto", capacidade: "consultar_cto", confianca: 0.94 };
  }

  if (
    /\b(publicar|criar|despachar|enviar)\s+job\b/.test(t) ||
    /^job\s*:/.test(t) ||
    /\b(publicar|despachar|enviar).*\bpara\s+a\s+fila\b/.test(t)
  ) {
    return { id: "publicar_job_fila", capacidade: "fila", confianca: 0.93 };
  }

  if (
    /\b(listar|ver|mostrar|consultar)\s+(jobs?|fila)\b/.test(t) ||
    /\bjobs?\s+pendentes\b/.test(t) ||
    /\b(listar|ver|mostrar|consultar)\s+fila\s+de\s+execu/.test(t)
  ) {
    return { id: "listar_jobs_fila", capacidade: "fila", confianca: 0.92 };
  }

  if (
    /\b(registrar|criar|adicionar)\s+decis/.test(t) ||
    /^decis[aã]o\s*:/.test(t)
  ) {
    return { id: "registrar_decisao", capacidade: "memoria", confianca: 0.92 };
  }

  if (
    /\b(registrar|criar|adicionar)\s+pend/.test(t) ||
    /^pend[eê]ncia\s*:/.test(t)
  ) {
    return { id: "registrar_pendencia", capacidade: "memoria", confianca: 0.92 };
  }

  if (
    /\b(registrar|criar|adicionar)\s+pr[oó]xima/.test(t) ||
    /^pr[oó]xima\s+a[cç][aã]o\s*:/.test(t)
  ) {
    return {
      id: "registrar_proxima_acao",
      capacidade: "memoria",
      confianca: 0.92
    };
  }

  if (/\b(pend[eê]ncia|pendencias|analisar pend)/.test(t)) {
    return {
      id: "analisar_pendencias",
      capacidade: "memoria",
      confianca: 0.85
    };
  }

  if (
    /\b(abrir|ir para|navegar|mostrar|ir ao|ir à)\b/.test(t) &&
    /\b(dashboard|situação|situacao|conversa|capacidades|projetos|conhecimento|configura)/.test(
      t
    )
  ) {
    return { id: "navegar", capacidade: "navegacao", confianca: 0.8 };
  }

  if (
    /\b(abrir projeto|ativar (o )?coa|trocar (para o )?projeto|definir coa)\b/.test(
      t
    ) ||
    (/^\s*(projeto|coa)\b/.test(t) && t.length < 80)
  ) {
    return { id: "atuar_em_projetos", capacidade: "projetos", confianca: 0.8 };
  }

  // Braço curto: «empresa …» sem verbo de troca — consulta/classificação, SEM WRITE
  if (/^\s*empresa\b/.test(t) && t.length < 80) {
    return {
      id: "consultar_empresa",
      capacidade: "empresas",
      confianca: 0.75
    };
  }

  if (
    /\b(dashboard|painel|visão executiva|visao executiva|posto de comando|centro de situa)/.test(
      t
    )
  ) {
    return {
      id: "consultar_dashboard",
      capacidade: "dashboard",
      confianca: 0.7
    };
  }

  if (
    /\b(conhecimento|patrim[oó]nio|documento|acervo|buscar no acervo)\b/.test(t)
  ) {
    return {
      id: "consultar_conhecimento",
      capacidade: "conhecimento",
      confianca: 0.75
    };
  }

  if (/\b(ferramenta|tool|integra[cç][aã]o|conectar)\b/.test(t)) {
    return { id: "usar_ferramenta", capacidade: "ferramentas", confianca: 0.65 };
  }

  if (
    /\b(prioriz|planej|decid|analis|revis|organiz|próximo passo|proximo passo|objetivo|motoboy|mg2)\b/.test(
      t
    )
  ) {
    return { id: "deliberar_objetivo", capacidade: "ia", confianca: 0.7 };
  }

  if (/^(que|qual|quando|onde|como|por que|porque|quem)\b/.test(t)) {
    return { id: "pergunta_aberta", capacidade: "ia", confianca: 0.5 };
  }

  return { id: "deliberar", capacidade: "ia", confianca: 0.4 };
}

/**
 * Adapta SaidaClassificador canónica → Intencao legada (capacidade).
 * Ponto único de classificação: passar `saidaPrevia` do `primeiroPassoClassificar`
 * para **não** reexecutar `classificar` (EIC V1 — CAP-07 / IMP-057).
 *
 * @param {string} texto
 * @param {object|null} [saidaPrevia] — saída já produzida pelo Classificador canónico
 * @returns {Intencao}
 */
export function classificarIntencao(texto, saidaPrevia = null) {
  const saida =
    saidaPrevia &&
    typeof saidaPrevia === "object" &&
    typeof saidaPrevia.classe === "string"
      ? saidaPrevia
      : classificarCanonico(texto);
  const idClasse = ID_POR_CLASSE[saida.classe] || "C?";

  if (saida.classe === "trabalho_executivo" && !saida.precisaClarificacao) {
    return comMetadadosContexto(
      {
        id: "trabalho_executivo",
        capacidade: "motor_execucao",
        confianca: saida.confianca,
        origem: "classificador_canonico",
        classe: saida.classe,
        destino: saida.destino,
        classificacao: saida,
        idClasse
      },
      texto
    );
  }

  if (saida.precisaClarificacao || saida.destino === "clarificacao") {
    return comMetadadosContexto(
      {
        id: "clarificacao",
        capacidade: "ia",
        confianca: saida.confianca,
        origem: "classificador_canonico",
        classe: saida.classe,
        destino: "clarificacao",
        classificacao: saida,
        idClasse,
        precisaClarificacao: true
      },
      texto
    );
  }

  const mapa = mapearCapacidadePorTexto(texto);

  if (saida.classe === "conhecimento_geral") {
    const locais = new Set([
      "saudacao",
      "pergunta_data",
      "pergunta_hora",
      "pergunta_identidade",
      "pergunta_aberta",
      "instrucao_vazia"
    ]);
    const id = locais.has(mapa.id) ? mapa.id : "resposta_leve";
    return comMetadadosContexto(
      {
        id,
        capacidade: "ia",
        confianca: saida.confianca,
        origem: "classificador_canonico",
        classe: saida.classe,
        destino: saida.destino,
        classificacao: saida,
        idClasse
      },
      texto
    );
  }

  if (saida.classe === "comando_operacional") {
    let mapaC4 = mapearCapacidadePorTexto(texto);
    // P0-3: C4 de consulta nunca pode cair em capacidade «ia» (destino inválido).
    if (mapaC4.capacidade === "ia" || mapaC4.capacidade === "motor_execucao") {
      mapaC4 = {
        id: "consultar_estado",
        capacidade: "memoria",
        confianca: Math.max(0.9, mapaC4.confianca || 0.9)
      };
    }
    return comMetadadosContexto(
      {
        id: mapaC4.id,
        capacidade: mapaC4.capacidade,
        confianca: saida.confianca,
        origem: "classificador_canonico",
        classe: saida.classe,
        destino: saida.destino,
        classificacao: saida,
        idClasse
      },
      texto
    );
  }

  // C2 — conversa de projecto → IA/MRE
  return comMetadadosContexto(
    {
      id: mapa.capacidade === "ia" ? mapa.id : "deliberar_objetivo",
      capacidade: "ia",
      confianca: saida.confianca,
      origem: "classificador_canonico",
      classe: saida.classe,
      destino: saida.destino,
      classificacao: saida,
      idClasse
    },
    texto
  );
}
