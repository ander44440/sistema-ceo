/**
 * Fixtures de ParecerExecutivo para IMP-011 (REQ-048).
 */

import { VERSAO_CONTRATO } from "./enums.js";
import {
  PRINCIPIO_USO_DIARIO_ACTIVO,
  PRINCIPIO_USO_DIARIO_MG2
} from "../pipeline/catalogoPrincipios.js";

/**
 * Parecer válido completo de referência (T11-01).
 * Por omissão: princípios globais (sem escopo MG2).
 * @param {{ escopoMg2?: boolean }} [opts]
 * @returns {object}
 */
export function parecerValidoCompleto(opts = {}) {
  const escopoMg2 = opts.escopoMg2 === true;
  const principioUso = escopoMg2
    ? PRINCIPIO_USO_DIARIO_MG2
    : PRINCIPIO_USO_DIARIO_ACTIVO;
  const coaId = escopoMg2 ? "coa-mg2-fixture" : "coa-fixture";
  const rotuloCoa = escopoMg2 ? "MG2" : "projecto activo";

  return {
    id: "parecer-fixture-valido-001",
    criadoEm: "2026-07-30T17:00:00.000Z",
    versaoContrato: VERSAO_CONTRATO,
    coaId,
    confianca: 0.82,
    lacunas: [],
    diagnostico: {
      objetivoReal: `Decidir se avança o outdoor lateral no ${rotuloCoa} nesta sprint`,
      problemaNegocio: "Escopo visual compete com prazo de integração de pagamento",
      natureza: "tatica"
    },
    enquadramento: {
      tipoPedido: "decisao",
      urgencia: "media",
      escopo: "Apenas outdoors laterais; não inclui home nem loja"
    },
    dossier: {
      resumoPainel: `COA ${rotuloCoa} ativo; próximo passo: integração pagamento; outdoor adiado`,
      factosUsados: [
        "Outdoor lateral estava em JOB cancelado",
        "Pagamento é prioridade do dia"
      ],
      fontes: ["painel", "memoria"]
    },
    principiosAplicados: [
      "Respeito absoluto ao tempo do utilizador",
      principioUso
    ],
    analise:
      `O outdoor lateral não desbloqueia o uso diário do CEO no ${rotuloCoa}; a integração de pagamento sim. Adiar o outdoor preserva foco sem rejeitar o trabalho futuro.`,
    riscos: [
      {
        nivel: "medio",
        texto: "Atraso perceptivo de polish visual",
        mitigacao: "Reagendar após gate de pagamento"
      }
    ],
    oportunidades: [
      {
        valor: "alto",
        texto: "Concentrar capacidade na integração que desbloqueia receita",
        condicao: "Manter outdoor fora do caminho crítico"
      }
    ],
    decisaoExecutiva: {
      estado: "aprovar",
      recomendacao: "Aprovar o adiamento do outdoor e manter pagamento como foco",
      alternativas: ["Executar outdoor em paralelo", "Rejeitar outdoor definitivamente"],
      justificativa:
        `Com base no princípio ${principioUso} e no risco medio de atraso visual controlável, aprova-se adiar o outdoor. A oportunidade de concentrar capacidade na integração supera o polish imediato.`
    },
    acao: {
      tipo: "orientar",
      descricao: "Manter outdoor fora do caminho crítico; retomar após integração de pagamento",
      job: null
    },
    aprendizado: {
      registrarMemoria: true,
      criarPrecedente: true,
      atualizarPrincipios: false,
      notas: "Padrão: polish visual cede a desbloqueio operacional"
    },
    metadados: {
      fixture: true,
      origem: "IMP-011"
    }
  };
}

/**
 * Clona e aplica mutações superficiais (1 nível + caminhos pontuais usados nos testes).
 * @param {object} base
 * @param {Record<string, unknown>} mutacoes — chaves com notação pontilhada simples
 */
export function clonarComMutacoes(base, mutacoes = {}) {
  const clone = structuredClone(base);
  for (const [caminho, valor] of Object.entries(mutacoes)) {
    const partes = caminho.split(".");
    let alvo = clone;
    for (let i = 0; i < partes.length - 1; i++) {
      const p = partes[i];
      const m = /^(\w+)\[(\d+)\]$/.exec(p);
      if (m) {
        alvo = alvo[m[1]][Number(m[2])];
      } else {
        alvo = alvo[p];
      }
    }
    const ultimo = partes[partes.length - 1];
    const mUlt = /^(\w+)\[(\d+)\]$/.exec(ultimo);
    if (mUlt) {
      alvo[mUlt[1]][Number(mUlt[2])] = valor;
    } else {
      alvo[ultimo] = valor;
    }
  }
  return clone;
}

export function parecerSolicitarDadosValido() {
  return clonarComMutacoes(parecerValidoCompleto(), {
    id: "parecer-fixture-solicitar-dados",
    confianca: 0.4,
    lacunas: ["Falta orçamento disponível para outdoor"],
    "decisaoExecutiva.estado": "solicitar_dados",
    "decisaoExecutiva.recomendacao": "Pedir o orçamento antes de decidir",
    "decisaoExecutiva.justificativa":
      "Há lacuna material; sem orçamento não se aplica o princípio Respeito absoluto ao tempo do utilizador com decisão prematura. Riscos de retrabalho se avançarmos às cegas.",
    "acao.tipo": "perguntar",
    "acao.descricao": "Perguntar qual o orçamento máximo para outdoors laterais",
    "acao.job": null,
    "aprendizado.registrarMemoria": false,
    "aprendizado.criarPrecedente": false
  });
}

export function parecerDelegarValido() {
  return clonarComMutacoes(parecerValidoCompleto(), {
    id: "parecer-fixture-delegar",
    "decisaoExecutiva.estado": "delegar",
    "decisaoExecutiva.recomendacao": "Delegar implementação do outdoor à fila",
    "decisaoExecutiva.justificativa":
      "A decisão de executar está tomada; o risco medio de atraso visual é aceite. Delega-se execução preservando Priorizar uso diário no contexto operacional activo (ADR-015) no acompanhamento.",
    "acao.tipo": "despachar",
    "acao.descricao": "Criar job na fila para outdoors laterais",
    "acao.job": {
      titulo: "Outdoors laterais",
      descricao: "Implementar assets laterais conforme briefing",
      prioridade: "baixa"
    }
  });
}
