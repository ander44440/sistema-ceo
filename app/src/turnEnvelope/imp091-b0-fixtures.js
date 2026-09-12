/**
 * IMP-091 Bloco B0 — definições de fixtures (inputs apenas).
 * Sem sinais novos, sem detectores novos, sem regras de precedência.
 */

export const COA_VV = "prj-valeverde";
export const COA_MG2 = "prj-mg2";

export const T1_VALEVERDE = `CEO, seguem os primeiros dados da ValeVerde Alimentos:

A empresa possui 120 funcionários.
Faturamento anual: R$ 48 milhões.
Nos últimos 6 meses, a margem líquida caiu de 8% para 4%.
A principal causa identificada pela diretoria financeira é o aumento de 15% no custo das matérias-primas.
A diretoria comercial quer aumentar preços em 10%.
A diretoria comercial teme perder clientes.
A produção afirma que consegue reduzir desperdícios em aproximadamente 5%.
Não existem outras informações disponíveis neste momento.`;

export const T2_PRIORIDADE = "Qual deve ser nossa prioridade agora?";
export const T2_OPERACIONAL_NU = "Qual é a próxima decisão que você recomenda?";
export const T2_PD = "Tome a decisão agora.";
export const ORDEM_74 =
  "CEO, antes de falar com o cliente, quais informações você gostaria de obter " +
  "para decidir se vale a pena negociar preço, defender o valor atual ou aceitar " +
  "o risco de perder esse cliente?";

export const MISTO_A_B =
  "Há um JOB-000067 na fila. Dois fornecedores para essa matéria-prima: o actual anunciou +12% e o outro é 8% mais barato, mas só cobre 60% do volume. Qual deve ser nossa prioridade agora?";

export const AD_ACTIVACAO =
  "VOCE ESTA AUTORIZADO A TOMAR TODAS AS MEDIDAS QUE JULGA NECESSÁRIAS, PARA UMA MELHOR PERFORMANCE DO MG2 OK..";

/**
 * @typedef {object} FixtureB0
 * @property {string} id
 * @property {string} familia
 * @property {string} texto
 * @property {object[]} [historico]
 * @property {string|null} [coaId]
 * @property {'none'|'gate'|'ad_ack'|'vca'|'setup_only'} [setup]
 * @property {string} [nota]
 */

/** @type {FixtureB0[]} */
export const FIXTURES_B0 = [
  // --- A–F ---
  {
    id: "A",
    familia: "A-F",
    texto: T2_PRIORIDADE,
    historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    coaId: COA_VV,
    nota: "T1 factos → T2 prioridade negócio"
  },
  {
    id: "B",
    familia: "A-F",
    texto: T2_PD,
    historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    coaId: COA_VV,
    nota: "PD explícito após factos"
  },
  {
    id: "C",
    familia: "A-F",
    texto: T2_OPERACIONAL_NU,
    historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    coaId: COA_VV,
    nota: "E4 operacional nu + fio (não herda B)"
  },
  {
    id: "D",
    familia: "A-F",
    texto: ORDEM_74,
    historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    coaId: COA_VV,
    nota: "IG + PD lexical em propósito"
  },
  {
    id: "E",
    familia: "A-F",
    texto: MISTO_A_B,
    historico: [],
    coaId: COA_VV,
    nota: "Pedido misto A+B"
  },
  {
    id: "F",
    familia: "A-F",
    texto: T2_PRIORIDADE,
    historico: [
      {
        papel: "usuario",
        texto: "Analise a proposta do bairro popular segundo o Manifesto.",
        coaId: COA_MG2
      },
      { papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }
    ],
    coaId: COA_VV,
    nota: "Fio outro COA não deve entrar no objecto do VV"
  },

  // --- N1–N7 ---
  {
    id: "N1",
    familia: "N1-N7",
    texto: "Quais informações precisamos obter para decidir?",
    historico: [],
    coaId: null,
    nota: "para decidir / propósito"
  },
  {
    id: "N2",
    familia: "N1-N7",
    texto: ORDEM_74,
    historico: [],
    coaId: COA_VV,
    nota: "Ordem IG tipo 74"
  },
  {
    id: "N3",
    familia: "N1-N7",
    texto: "prioridade",
    historico: [],
    coaId: null,
    nota: "Prioridade lexical isolada"
  },
  {
    id: "N4",
    familia: "N1-N7",
    texto: T2_PRIORIDADE,
    historico: [
      {
        papel: "assistente",
        texto:
          "Recomendação: aprovar a retenção de clientes. Mandato: execute quando autorizado.",
        coaId: COA_VV
      },
      { papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }
    ],
    coaId: COA_VV,
    nota: "Fio com mandato/recomendação anterior"
  },
  {
    id: "N5",
    familia: "N1-N7",
    texto: "Analise e recomende a prioridade da Sprint 2 após o gate.",
    historico: [],
    coaId: COA_MG2,
    nota: "C4/A operacional"
  },
  {
    id: "N6",
    familia: "N1-N7",
    texto:
      "Temos dois fornecedores possíveis. O actual aumentou 12%; o outro é 8% mais barato com 60% do volume. Qual é a melhor decisão?",
    historico: [],
    coaId: COA_VV,
    nota: "B legítimo"
  },
  {
    id: "N7",
    familia: "N1-N7",
    texto: T2_OPERACIONAL_NU,
    historico: [
      {
        papel: "usuario",
        texto: "Analise a proposta do bairro popular.",
        coaId: COA_MG2
      }
    ],
    coaId: COA_VV,
    nota: "Outro COA no histórico; alvo VV"
  },

  // --- S1–S4 ---
  {
    id: "S1",
    familia: "S1-S4",
    texto: "onde paramos?",
    historico: [],
    coaId: COA_MG2,
    nota:
      "ARQ S1 exemplo «onde paramos?» — baseline regista comportamento actual (detector situacional pode ser false)"
  },
  {
    id: "S2",
    familia: "S1-S4",
    texto: "qual é o próximo passo? executa o LOD agora",
    historico: [],
    coaId: COA_MG2,
    nota: "Situacional actual (próximo passo) + execução lexical"
  },
  {
    id: "S3",
    familia: "S1-S4",
    texto: "onde paramos?",
    historico: [],
    coaId: COA_MG2,
    nota: "Mesmo input S1 — âncora para flag órfã pós-Fatia 1"
  },
  {
    id: "S1b",
    familia: "S1-S4",
    texto: "qual é o próximo passo do trabalho?",
    historico: [],
    coaId: COA_MG2,
    nota: "Situacional puro com detector actual true (complemento S1)"
  },
  {
    id: "S4",
    familia: "S1-S4",
    texto: "executa e me diga o estado da fila",
    historico: [],
    coaId: COA_MG2,
    nota: "consulta_composta"
  },

  // --- Casos especiais IMP ---
  {
    id: "GATE",
    familia: "especial",
    texto: "Aprovado.",
    setup: "gate",
    historico: [],
    coaId: null,
    nota: "Gate pendente + Aprovado."
  },
  {
    id: "AD_ACK",
    familia: "especial",
    texto: AD_ACTIVACAO,
    setup: "ad_ack",
    historico: [],
    coaId: null,
    nota: "Activação AD sem EXECUTE"
  },
  {
    id: "VCA",
    familia: "especial",
    texto: "pagamento?",
    setup: "vca",
    historico: [],
    coaId: null,
    nota: "ambiguo_contexto com tópico activo outdoor"
  },
  {
    id: "E4_A",
    familia: "especial",
    texto: T2_OPERACIONAL_NU,
    historico: [],
    coaId: null,
    nota: "E4 A isolado (sem fio B)"
  },
  {
    id: "B_C2",
    familia: "especial",
    texto: T2_PD,
    historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    coaId: COA_VV,
    nota: "B/C2 — PD após factos (alias observacional de B)"
  },
  {
    id: "IG_PD_D25",
    familia: "especial",
    texto: ORDEM_74,
    historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    coaId: COA_VV,
    nota: "IG/PD/D25 — ordem 74 com fio"
  }
];
