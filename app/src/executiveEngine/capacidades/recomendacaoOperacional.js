/**
 * E4 — Capacidade: recomendação operacional (C4 / memória).
 * Responde ao estado e ao objeto nomeado; não delibera proposta genérica;
 * não ecoa lastro deliberativo, briefing nem dígito-falso-positivo.
 */

import { normalizarTexto } from "../../classificadorIntencao/lexicon.js";
import {
  ehPedidoMistoEstadoERecomendacaoOperacional,
  identificarObjetoRecomendacaoOperacional
} from "../../classificadorIntencao/recomendacaoOperacional.js";
import { lerMemoria, resumirEstado } from "../../executiveMemory/index.js";
import { executarConsultaEstado } from "./consultarEstado.js";
import {
  ehLastroDeliberativoIncompativel,
  ehLastroInstrucaoOuBriefing,
  seleccionarLastroOperacional
} from "./lastroOperacional.js";

/**
 * Remove resíduos deliberativos/briefing do panorama factual.
 * Cobre «Próximo passo» multi-linha (briefing numerado).
 * @param {string} panorama
 */
export function sanitizarPanoramaOperacional(panorama) {
  let texto = String(panorama || "");

  const sanearBloco = (prefixo, corpo) => {
    const c = String(corpo || "").trim();
    if (
      !c ||
      ehLastroDeliberativoIncompativel(c) ||
      ehLastroInstrucaoOuBriefing(c)
    ) {
      return `${prefixo}(sem âncora operacional compatível).`;
    }
    return `${prefixo}${corpo}`;
  };

  // Bloco até à próxima secção do resumo (contagens / projeto ativo / etc.)
  texto = texto.replace(
    /(Próximo passo:\s*)([\s\S]*?)(?=\n\n(?:\d+\s+decis|\d+\s+pend|Projeto ativo|Há |Nenhuma |Ainda |Situação|Continuidade:|O que permanece:)|$)/i,
    (_, pref, corpo) => sanearBloco(pref, corpo)
  );
  texto = texto.replace(
    /(Continuidade:\s*)([\s\S]*?)(?=\n\n(?:\d+\s+decis|\d+\s+pend|Projeto ativo|Há |Próximo passo:|O que permanece:)|$)/i,
    (_, pref, corpo) => sanearBloco(pref, corpo)
  );
  texto = texto.replace(
    /(O que permanece:\s*)([\s\S]*?)(?=\n\n(?:\d+\s+decis|\d+\s+pend|Projeto ativo|Há |Próximo passo:|Continuidade:)|$)/i,
    (_, pref, corpo) => sanearBloco(pref, corpo)
  );

  // Linhas isoladas (fallback)
  return texto
    .split(/\n/)
    .map((linha) => {
      const m = linha.match(
        /^(\s*(?:Próximo passo|Continuidade|O que permanece)\s*:\s*)(.+)$/i
      );
      if (!m) return linha;
      const corpo = m[2].trim();
      if (
        ehLastroDeliberativoIncompativel(corpo) ||
        ehLastroInstrucaoOuBriefing(corpo)
      ) {
        return `${m[1]}(sem âncora operacional compatível).`;
      }
      return linha;
    })
    .join("\n");
}

/**
 * @param {{ decisao: string|null, proxima: string|null, factual: string|null, pendencia: string|null }} lastro
 */
function montarJustificativaTipada(lastro) {
  /** @type {string[]} */
  const partes = [];
  if (lastro.decisao) {
    partes.push(`Decisão alinhada: «${lastro.decisao}».`);
  }
  if (lastro.proxima) {
    partes.push(`Há uma próxima acção alinhada: «${lastro.proxima}».`);
  }
  if (lastro.factual) {
    partes.push(`Estado factual alinhado: «${lastro.factual}».`);
  }
  if (lastro.pendencia && !lastro.decisao && !lastro.proxima && !lastro.factual) {
    partes.push(`Pendência alinhada: «${lastro.pendencia}».`);
  }
  if (!partes.length) {
    return (
      "Justificativa: não há decisão, acção ou estado factual alinhado a este objeto; " +
      "não reutilizo briefings, perguntas nem pareceres deliberativos."
    );
  }
  return `Justificativa: ${partes.join(" ")}`;
}

/**
 * @param {object} estado
 * @param {{ tipo: string, id: string|null, rotulo: string, detalhe?: string|null, referencia?: string|null }} objeto
 * @param {string} t
 */
function montarJuizoOperacional(estado, objeto, t) {
  const lastro = seleccionarLastroOperacional(estado, objeto);
  const temLastro = lastro.usouLastro;

  const linhas = [];
  linhas.push(`Objeto: ${objeto.rotulo}.`);

  const querManter = /\bmant(er|ém|em)\b/.test(t);
  const tiposManter = new Set([
    "sprint",
    "validacao_sprint",
    "manter",
    "prioridade"
  ]);

  if (objeto.tipo === "proxima_prioridade_apos") {
    const ref =
      objeto.referencia ||
      String(objeto.rotulo || "").replace(/^próxima prioridade após\s*/i, "") ||
      "o marco indicado";
    const sequencia = lastro.proxima || lastro.decisao || lastro.factual || null;
    if (sequencia) {
      linhas.push(
        `Recomendação operacional: após ${ref}, a sequência no lastro é «${sequencia}».`
      );
      linhas.push(montarJustificativaTipada(lastro));
    } else {
      linhas.push(
        `Não há uma próxima prioridade definida no estado atual após ${ref}.`
      );
      linhas.push(
        "Justificativa: sem lastro operacional de sequência alinhado; " +
          "não invento prioridade nem ecoo parecer deliberativo."
      );
    }
  } else if (querManter && tiposManter.has(objeto.tipo)) {
    if (temLastro) {
      linhas.push(
        `Recomendação operacional: manter «${objeto.rotulo}» como próxima prioridade.`
      );
    } else {
      linhas.push(
        `Recomendação operacional: manter «${objeto.rotulo}» como próxima prioridade, ` +
          "salvo indicação explícita em contrário — sem lastro operacional compatível registado."
      );
    }
    linhas.push(montarJustificativaTipada(lastro));
  } else if (objeto.tipo === "proxima_decisao" || objeto.tipo === "prioridade") {
    if (lastro.proxima) {
      linhas.push(
        `Recomendação operacional: a próxima decisão prioritária deve seguir a acção alinhada «${lastro.proxima}».`
      );
    } else if (lastro.decisao) {
      linhas.push(
        `Recomendação operacional: com base na decisão alinhada («${lastro.decisao}»), ` +
          "mantenha o foco nessa linha até haver mudança explícita de prioridade."
      );
    } else if (lastro.factual) {
      linhas.push(
        `Recomendação operacional: à luz do estado «${lastro.factual}», confirme a próxima prioridade antes de executar.`
      );
    } else if (lastro.pendencia) {
      linhas.push(
        `Recomendação operacional: atacar a pendência «${lastro.pendencia}» como próximo passo.`
      );
    } else {
      linhas.push(
        "Recomendação operacional: não há prioridade alinhada no lastro operacional — " +
          "confirme a próxima decisão antes de executar."
      );
    }
    linhas.push(montarJustificativaTipada(lastro));
  } else if (objeto.tipo === "job") {
    linhas.push(
      `Recomendação operacional: actuar sobre o ${objeto.id} conforme o seu estado acima — ` +
        "sem transformar o Job em deliberação de produto."
    );
    linhas.push(montarJustificativaTipada(lastro));
  } else {
    linhas.push(
      `Recomendação operacional: orientar a acção ao objeto «${objeto.rotulo}» ` +
        "usando apenas lastro operacional alinhado — sem deliberação de proposta."
    );
    linhas.push(montarJustificativaTipada(lastro));
  }

  return linhas.join("\n");
}

/**
 * @param {string} texto
 * @param {object} [portas]
 */
export async function executarRecomendacaoOperacional(texto, portas = {}) {
  const t = normalizarTexto(texto);
  const objeto = identificarObjetoRecomendacaoOperacional(texto);
  const misto = ehPedidoMistoEstadoERecomendacaoOperacional(texto);
  const lerMem =
    typeof portas.lerMemoriaFn === "function" ? portas.lerMemoriaFn : lerMemoria;
  const estado = lerMem() || {};
  /** @type {string[]} */
  const partes = [];

  if (misto || objeto.tipo === "job") {
    if (objeto.tipo === "job") {
      const consulta = await executarConsultaEstado(
        `Qual é o estado do ${objeto.id}?`,
        portas
      );
      partes.push(consulta.mensagem);
    } else {
      const panorama =
        typeof portas.resumirEstadoFn === "function"
          ? portas.resumirEstadoFn()
          : resumirEstado();
      partes.push(
        sanitizarPanoramaOperacional(
          String(panorama || "Estado actual do projeto activo.").trim()
        )
      );
    }
  }

  partes.push(montarJuizoOperacional(estado, objeto, t));

  const lastro = seleccionarLastroOperacional(estado, objeto);

  return {
    ok: true,
    mensagem: partes.join("\n\n"),
    modo: "recomendacao_operacional",
    dados: {
      tipo: "recomendacao_operacional",
      objeto,
      deliberacaoProposta: false,
      anexarManifesto: false,
      mreInvocado: false,
      consultaSemMutacao: true,
      mistoEstado: misto,
      lastroUsado: lastro.usouLastro,
      lastroAlinhado: {
        decisao: lastro.decisao,
        proxima: lastro.proxima,
        factual: lastro.factual,
        pendencia: lastro.pendencia,
        generoDecisao: lastro.generoDecisao,
        generoProxima: lastro.generoProxima
      }
    }
  };
}
