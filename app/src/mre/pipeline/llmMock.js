/**
 * Mock injetável de LLM por estágio — testes IMP-012/013 (sem rede).
 */

import {
  PRINCIPIO_USO_DIARIO_ACTIVO,
  PRINCIPIO_USO_DIARIO_MG2
} from "./catalogoPrincipios.js";

/**
 * @param {Record<string, object|((pedido:object)=>object)>} mapa
 * @param {object} [opts]
 * @param {number} [opts.falharVezes] — falhas antes de sucesso (por chamada)
 * @param {string} [opts.estagioFalhar]
 */
export function criarChamarLlmMock(mapa, opts = {}) {
  const contadores = new Map();

  return async function chamarLlm(pedido) {
    const estagio = pedido.estagio;
    const n = (contadores.get(estagio) || 0) + 1;
    contadores.set(estagio, n);

    if (opts.estagioFalhar === estagio && n <= (opts.falharVezes || 1)) {
      const err = new Error(opts.mensagemErro || "Timeout LLM simulado");
      err.codigo = opts.codigoErro || "TIMEOUT";
      throw err;
    }

    const handler = mapa[estagio];
    if (!handler) {
      throw new Error(`Mock LLM sem handler para estágio ${estagio}`);
    }
    return typeof handler === "function" ? handler(pedido) : handler;
  };
}

/**
 * Respostas padrão para fluxo feliz (aprovar + orientar).
 * Por omissão: princípios globais (sem escopo MG2).
 * @param {Record<string, object|Function>} [overrides]
 * @param {{ escopoMg2?: boolean }} [opts]
 */
export function mapaLlmFluxoFeliz(overrides = {}, opts = {}) {
  const principioUso =
    opts.escopoMg2 === true
      ? PRINCIPIO_USO_DIARIO_MG2
      : PRINCIPIO_USO_DIARIO_ACTIVO;

  return {
    "0_diagnostico": {
      objetivoReal: "Decidir prioridade do outdoor vs pagamento",
      problemaNegocio: "Conflito de foco na sprint",
      natureza: "tatica"
    },
    "1_enquadramento": {
      tipoPedido: "decisao",
      urgencia: "media",
      escopo: "Priorização outdoor vs pagamento"
    },
    "3_principios": {
      principiosAplicados: [
        "Respeito absoluto ao tempo do utilizador",
        principioUso
      ]
    },
    "4_analise": {
      analise:
        "Pagamento desbloqueia uso diário; outdoor é polish adiado sem perda crítica imediata."
    },
    "5a_riscos": {
      riscos: [
        {
          nivel: "medio",
          texto: "Atraso visual perceptível",
          mitigacao: "Reagendar após pagamento"
        }
      ]
    },
    "5b_oportunidades": {
      oportunidades: [
        {
          valor: "alto",
          texto: "Foco na integração que gera receita",
          condicao: "Manter outdoor fora do caminho crítico"
        }
      ]
    },
    "6_decisao": {
      estado: "aprovar",
      recomendacao: "Aprovar adiamento do outdoor e focar pagamento",
      alternativas: ["Fazer outdoor em paralelo"],
      justificativa:
        `Com base no princípio ${principioUso} e no risco medio de atraso visual, aprova-se o adiamento. Oportunidade de foco na integração.`
    },
    "7_acao": {
      descricao: "Manter outdoor fora do caminho crítico até concluir pagamento"
    },
    "7_acao_job": {
      descricao: "Despachar implementação do outdoor",
      job: {
        titulo: "Outdoor lateral",
        descricao: "Implementar assets laterais",
        prioridade: "baixa"
      }
    },
    ...overrides
  };
}
