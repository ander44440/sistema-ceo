/**
 * Protocolo do Agente Executivo (DIC S2/S5/S6) — respostas determinísticas.
 * Evita MRE/LLM em perguntas meta sobre o procedimento do CEO e
 * o falso «Não tenho lastro / Falha técnica no raciocínio».
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";

/**
 * @typedef {"primeira_accao"|"procedimento_pre_execucao"|"fluxo_ate_execucao"|"reautorizacao"|"apos_cto_recebeu"|"apos_cto_entregou"|"acao_pronta_especialista"|"autodiagnostico_papel"|"papel_sistema"|"diferenca_especialista"|"coa_sessao_activo"|"lacuna_nao_bloqueante"} ModoProtocoloExecutivo
 */

/**
 * Confirmação / consulta do COA·projecto activo (DIC sessão — TC-01).
 * Não cobre deliberação que apenas menciona «COA».
 * @param {string} t texto já normalizado
 * @returns {boolean}
 */
function ehPedidoConfirmacaoCoaSessao(t) {
  if (
    /\b(analis[eéa]|recomenda|prioriz|deliber|outdoor|pagamento|factos?|fatos?|lastro|regist|codigo\s+secreto)\b/.test(
      t
    )
  ) {
    return false;
  }
  const ancora =
    /\b(coa|projeto|projecto)\b/.test(t) &&
    /\b(activ[oa]|ativ[oa]|neste\s+momento|agora)\b/.test(t);
  if (!ancora) return false;
  return (
    /\b(confirm[ea]|confirme|confirmar)\b/.test(t) ||
    /\bqual\s+[eé]\s+(o\s+)?(coa|projeto|projecto)\b/.test(t) ||
    (/\bnome\b/.test(t) && /\b(identificador|\bid\b)\b/.test(t))
  );
}

/**
 * @param {string} [instrucao]
 * @returns {{ activo: true, modo: ModoProtocoloExecutivo } | { activo: false, modo: null }}
 */
export function detectarPedidoProtocoloExecutivo(instrucao) {
  const t = normalizarTexto(instrucao);
  if (!t) return { activo: false, modo: null };

  // 0) Papel / diferença vs especialista (antes do resto)
  if (
    /\bdiferenca\s+entre\b/.test(t) &&
    /\b(agente\s+executivo|seu\s+papel|voce|tu|ceo)\b/.test(t) &&
    /\b(especialista|ia\s+especialista)\b/.test(t)
  ) {
    return { activo: true, modo: "diferenca_especialista" };
  }
  if (
    /\b(seu|sua|teu|tua)\s+papel\b/.test(t) &&
    /\b(sistema|ceo|neste\s+sistema|contexto\s+ceo)\b/.test(t)
  ) {
    return { activo: true, modo: "papel_sistema" };
  }
  if (
    /\bqual\s+[eé]\s+o\s+seu\s+papel\b/.test(t) ||
    (/\bpapel\b/.test(t) &&
      /\bneste\s+sistema\b/.test(t) &&
      /\b(voce|tu|seu|ceo)\b/.test(t))
  ) {
    return { activo: true, modo: "papel_sistema" };
  }

  // 0b) COA / projecto activo (DIC sessão — TC-01; antes de C2/MRE)
  if (ehPedidoConfirmacaoCoaSessao(t)) {
    return { activo: true, modo: "coa_sessao_activo" };
  }

  // 1) Reautorização (sim/não)
  if (
    (/\b(precisa|devo|deve|tenho\s+de|necessario)\b/.test(t) ||
      /\bpedir\b/.test(t) ||
      /\bsolicitar\b/.test(t)) &&
    /\b(nova|novamente|outra|de\s+novo)\b/.test(t) &&
    /\b(autoriza|aprovacao|aprova)\b/.test(t) &&
    (/\bcto\b/.test(t) ||
      /\bespecialista\b/.test(t) ||
      /\bencaminh/.test(t) ||
      /\bexecu/.test(t))
  ) {
    return { activo: true, modo: "reautorizacao" };
  }
  if (
    /\bautoriza/.test(t) &&
    !/\bja\b/.test(t) &&
    /\bantes\s+de\b/.test(t) &&
    (/\bcto\b/.test(t) || /\bespecialista\b/.test(t))
  ) {
    return { activo: true, modo: "reautorizacao" };
  }
  if (
    /\bja\s+(autoriz|aprov)/.test(t) &&
    /\b(nova|novamente|outra|de\s+novo|solicitar\s+novamente)\b/.test(t) &&
    /\bautoriz/.test(t)
  ) {
    return { activo: true, modo: "reautorizacao" };
  }

  // 2) Situação completa → encaminhar especialista (antes de «CTO concluiu»)
  if (
    /\bespecialista\b/.test(t) &&
    /\b(pronta|pronto)\b/.test(t) &&
    /\b(orientacao|analise)\b/.test(t) &&
    (/\bja\s+autoriz/.test(t) || /\bautorizou\b/.test(t)) &&
    /\b(acao|o\s+que|qual\s+acao|agora|ocorrer)\b/.test(t)
  ) {
    return { activo: true, modo: "acao_pronta_especialista" };
  }

  // 3) CTO recebeu / a analisar
  if (
    /\bcto\b/.test(t) &&
    /\brecebeu\b/.test(t) &&
    /\b(demanda|analise)\b/.test(t) &&
    !/\b(concluiu|terminou|entregou)\b/.test(t) &&
    /\b(o\s+que\s+(voce|tu)|agente\s+executivo|sua\s+responsab|faz\s+agora|deve\s+fazer)\b/.test(
      t
    )
  ) {
    return { activo: true, modo: "apos_cto_recebeu" };
  }

  // 4) CTO concluiu / entregou orientação
  if (
    /\bcto\b/.test(t) &&
    (/\b(concluiu|terminou|entregou)\b/.test(t) ||
      /\b(orientacao\s+tecnica|analise\s+tecnica)\b/.test(t) ||
      (/\bapresentou\b/.test(t) && /\borientacao\b/.test(t))) &&
    /\b(responsab|papel|cabe\s+a\s+voce|o\s+que\s+(voce|tu)|agente\s+executivo|depois\s+que)\b/.test(
      t
    )
  ) {
    return { activo: true, modo: "apos_cto_entregou" };
  }

  // 5) Primeira acção
  if (
    /\bprimeira\s+coisa\b/.test(t) &&
    /\b(demanda|pedido|instrucao|solicit)/.test(t) &&
    /\b(receb|cheg|nova)\b/.test(t)
  ) {
    return { activo: true, modo: "primeira_accao" };
  }

  // 6) Fluxo até execução (passo a passo / faz agora sem lacunas)
  if (
    /\bdemanda\b/.test(t) &&
    /\bclara\b/.test(t) &&
    (/\bpasso\s+a\s+passo\b/.test(t) ||
      /\bate\s+encaminhar\b/.test(t) ||
      (/\b(nao\s+existem\s+informa|sem\s+informa|nao\s+falt|informacoes\s+faltantes)\b/.test(
        t
      ) &&
        /\b(o\s+que\s+(voce|tu)\s+faz|faz\s+agora)\b/.test(t)))
  ) {
    return { activo: true, modo: "fluxo_ate_execucao" };
  }

  // 7) Procedimento pré-execução (genérico)
  if (
    /\bprocedimento\b/.test(t) &&
    /\b(antes|previa|pr[eé]via)\b/.test(t) &&
    /\b(execu|iniciar|comecar)\b/.test(t)
  ) {
    return { activo: true, modo: "procedimento_pre_execucao" };
  }
  if (
    /\bdemanda\b/.test(t) &&
    /\bclara\b/.test(t) &&
    /\bprocedimento\b/.test(t) &&
    !/\bcto\b/.test(t)
  ) {
    return { activo: true, modo: "procedimento_pre_execucao" };
  }

  // 8) Autodiagnóstico / autoavaliação do próprio funcionamento
  // Pedido explícito de autodiagnóstico: não exige «papel|ceo|agente executivo».
  if (/\bautodiagnostico\b/.test(t) || /\bauto\s*diagnostico\b/.test(t)) {
    return { activo: true, modo: "autodiagnostico_papel" };
  }
  // Autoavaliação das próprias capacidades / funcionamento
  if (
    (/\bautoavaliacao\b/.test(t) || /\bauto\s*avaliacao\b/.test(t)) &&
    /\b(capacidades?|funcionamento|limita|seu|sua|suas|teu|tua|voce|tu)\b/.test(
      t
    )
  ) {
    return { activo: true, modo: "autodiagnostico_papel" };
  }
  // «Avalie seu próprio funcionamento / capacidades»
  if (
    /\bavali[ea]\b/.test(t) &&
    /\b(propri[oa]|seu|sua|suas|teu|tua)\b/.test(t) &&
    /\b(funcionamento|capacidades?|limita)\b/.test(t) &&
    !/\b(mg2|motoboy|outdoor|worldlab|projeto|projecto)\b/.test(t)
  ) {
    return { activo: true, modo: "autodiagnostico_papel" };
  }
  // «Suas limitações» / «em quais situações você falha»
  if (
    !/\b(mg2|motoboy|outdoor|worldlab|projeto|projecto)\b/.test(t) &&
    ((/\b(suas?|teus?|tuas?)\s+limita/.test(t) &&
      !/\b(do|da|de|dos|das)\s+(sistema|gate|fluxo|outdoor|job)\b/.test(t)) ||
      (/\b(voce|tu)\s+falha/.test(t) ||
        (/\bsituac/.test(t) &&
          /\bfalh/.test(t) &&
          /\b(voce|tu)\b/.test(t))))
  ) {
    return { activo: true, modo: "autodiagnostico_papel" };
  }

  // 9) PE-4 — lacuna não bloqueante (TC-14); exclui lacuna explicitamente bloqueante
  if (ehPedidoLacunaNaoBloqueante(t)) {
    return { activo: true, modo: "lacuna_nao_bloqueante" };
  }

  return { activo: false, modo: null };
}

/**
 * PE-4 / TC-14 — demanda incompleta com lacuna explicitamente não bloqueante.
 * Lacuna bloqueante / «impede o avanço» (sem «não») não activa.
 * @param {string} t texto já normalizado
 * @returns {boolean}
 */
function ehPedidoLacunaNaoBloqueante(t) {
  // Bloqueante explícito → nunca PE-4
  if (
    /\blacuna\s+bloqueante\b/.test(t) ||
    /\b(e|é)\s+bloqueante\b/.test(t) ||
    (/\bimpede\s+(o\s+)?(avanco|progresso|continuidade)\b/.test(t) &&
      !/\bnao\s+impede\b/.test(t))
  ) {
    return false;
  }
  // Deliberação / LFC / análise de projecto
  if (
    /\b(analis[eéa]|recomenda|prioriz|deliber|outdoor|pagamento|factos?|fatos?|lastro|codigo\s+secreto)\b/.test(
      t
    )
  ) {
    return false;
  }

  const ancoraIncompleta =
    /\bincomplet[ao]\b/.test(t) ||
    (/\blacuna\b/.test(t) && /\b(demanda|pedido|informa)\b/.test(t)) ||
    (/\blacuna\b/.test(t) && /\bnao\s+impede\b/.test(t));

  const naoBloqueante =
    /\bnao\s+impede\b/.test(t) ||
    /\bnao\s+(e|é)\s+bloqueante\b/.test(t) ||
    /\bnao\s+bloqueante\b/.test(t) ||
    /\bsem\s+(ser\s+)?bloqueante\b/.test(t);

  const pedeProcedimento =
    /\bo\s+que\s+(voce|tu)\s+(deve\s+)?fazer\b/.test(t) ||
    /\bo\s+que\s+fazer\b/.test(t) ||
    /\bprocedimento\b/.test(t) ||
    /\bcomo\s+(deve|devo|proceder)\b/.test(t);

  return ancoraIncompleta && naoBloqueante && pedeProcedimento;
}

/**
 * @param {ModoProtocoloExecutivo} modo
 * @returns {string}
 */
export function comporRespostaProtocoloExecutivo(modo) {
  switch (modo) {
    case "papel_sistema":
      return (
        "Sou o **Agente Executivo** do Sistema CEO. " +
        "Coordeno, priorizo, delibero, mantenho o contexto, registo decisões e oriento a execução técnica com critério de pronto. " +
        "Não programo nem substituo a autoridade final do utilizador. " +
        "Papéis: você decide; o CTO arquiteta; o Engenheiro (Cursor) implementa; eu coordeno."
      );

    case "diferenca_especialista":
      return (
        "Como **Agente Executivo**, governo o processo: classificar intenção, deliberar, manter contexto, " +
        "definir o próximo gesto e orientar a execução — sem implementar no chat.\n\n" +
        "Uma **IA especialista** (ou o Engenheiro via Job) executa trabalho técnico concreto " +
        "(análise, código, operação) no âmbito que eu oriento e que o utilizador autoriza quando o Gate exige. " +
        "Eu coordeno; a especialista executa."
      );

    case "primeira_accao":
      return (
        "Quando recebo uma nova demanda, a primeira coisa que faço é **classificar a intenção** " +
        "no contexto activo (COA/sessão): é deliberação, execução técnica, consulta ou meta sobre o próprio CEO.\n\n" +
        "Em seguida verifico se falta **dado bloqueante**. Se faltar, faço **uma** pergunta ancorada no objectivo. " +
        "Se estiver claro, avanço para deliberação ou orientação de execução — sem inventar factos e sem implementar no chat."
      );

    case "procedimento_pre_execucao":
      return (
        "Com a demanda clara, antes de qualquer execução:\n" +
        "1. Ancoro a demanda no contexto/COA activo.\n" +
        "2. Classifico: deliberação vs execução técnica vs consulta.\n" +
        "3. Defino o **próximo gesto** (deliberar, propor Job, ou pedir CTO se faltar arquitectura).\n" +
        "4. Se for execução técnica com Gate: só então peço **aprovação explícita** para criar/despachar o Job.\n" +
        "5. Não implemento código no chat; oriento o canal de implementação (Engenheiro/Cursor) com critério de pronto.\n\n" +
        "Não peço autorização ritual de novo só porque a demanda está clara — a autorização de execução é o Gate, quando aplicável."
      );

    case "fluxo_ate_execucao":
      return (
        "Demanda clara e sem lacunas bloqueantes — procedimento até encaminhar a execução:\n" +
        "1. Registar a demanda no contexto activo.\n" +
        "2. Classificar a intenção (deliberação / Job / consulta).\n" +
        "3. Se precisar de arquitectura ou desenho: encaminhar ao **CTO** (análise), sem eu implementar.\n" +
        "4. Se for trabalho técnico pronto a despachar: preparar Job com objectivo e critério de pronto.\n" +
        "5. Gate de execução: aprovação explícita do utilizador **quando a política do Job exigir**.\n" +
        "6. Despachar à fila / Engenheiro; acompanhar ciclo (handoff ≠ conclusão).\n\n" +
        "Eu coordeno e oriento; não substituo a sua autoridade final nem programo no lugar do Engenheiro."
      );

    case "reautorizacao":
      return (
        "**Não.** Com a demanda clara (e, se já existir, com autorização de execução e orientação do CTO), " +
        "**não** peço uma nova autorização ritual só para encaminhar ao CTO ou à IA especialista.\n\n" +
        "Peço autorização de novo apenas se: mudou o âmbito, surgiu risco/custo novo, ou a política do Gate " +
        "exige aprovação explícita para **criar/despachar** aquele Job concreto."
      );

    case "apos_cto_recebeu":
      return (
        "Com o CTO a analisar a demanda, o meu papel é:\n" +
        "1. Manter o contexto e o objectivo visíveis.\n" +
        "2. **Não** duplicar a análise técnica do CTO.\n" +
        "3. Acompanhar o ciclo e reportar estado se perguntado.\n" +
        "4. Preparar o encaixe da orientação do CTO no próximo gesto executivo (prioridade, Gate, Job).\n\n" +
        "Não avanço execução técnica à margem da análise que pedimos ao CTO."
      );

    case "apos_cto_entregou":
      return (
        "Quando o CTO entrega a orientação técnica, cabe-me:\n" +
        "1. Sintetizar a orientação no contexto do objectivo do utilizador.\n" +
        "2. Traduzir em **próximo gesto** executivo (aprovar âmbito, Job, ou decisão em aberto).\n" +
        "3. Se a execução já estava autorizada e a orientação está pronta: encaminhar ao canal de implementação / especialista.\n" +
        "4. Registar a decisão/orientação no contexto — sem reabrir autorização sem motivo.\n\n" +
        "Eu não reimplemento a análise do CTO; oriento a execução com critério de pronto."
      );

    case "acao_pronta_especialista":
      return (
        "Neste ponto a acção correcta é **encaminhar a orientação para execução** " +
        "(IA especialista / Engenheiro via Job), sem pedir nova autorização ritual ao utilizador, " +
        "porque a execução já foi autorizada e o CTO já concluiu a análise.\n\n" +
        "Eu mantenho o critério de pronto, o acompanhamento do ciclo e a clareza do objectivo."
      );

    case "autodiagnostico_papel":
      return (
        "Autodiagnóstico do papel (Agente Executivo):\n\n" +
        "**Responsabilidades centrais:** coordenar; priorizar; deliberar; manter contexto; registar decisões; " +
        "orientar execução técnica com critério de pronto; sugerir sem impor.\n\n" +
        "**Posso avançar com autonomia:** organizar o próximo gesto; classificar intenção; propor Jobs; " +
        "pedir CTO quando falta arquitectura; uma pergunta de bloqueio se faltar dado essencial.\n\n" +
        "**Não faço:** decidir em substituição do utilizador; implementar código; inventar factos de projecto; " +
        "expor orquestração interna; pedir reautorização ritual quando a demanda já está clara e autorizada.\n\n" +
        "**Erros a evitar:** clarificar em loop sem objectivo; cair em «lastro insuficiente» em perguntas meta sobre o meu protocolo; " +
        "tratar toda pergunta institucional como deliberação de projecto sem DIC/protocolo."
      );

    case "lacuna_nao_bloqueante":
      return (
        "Com a demanda **incompleta** mas com lacuna **não bloqueante**:\n" +
        "1. **Avanço** com o que já está claro — defino o próximo gesto operacional sem esperar o detalhe em falta.\n" +
        "2. **Registo a incerteza** no contexto (o que falta e que não bloqueia) — sem inventar o valor ausente.\n" +
        "3. **Não** monto checklist genérico de consultoria nem «suposições razoáveis» factuais.\n" +
        "4. Só faço **uma** pergunta ancorada se a lacuna **passar a ser bloqueante** para o próximo gesto.\n\n" +
        "Lacuna não bloqueante ≠ clarificação em loop; avanço disciplinado com incerteza documentada."
      );

    default:
      return (
        "Como Agente Executivo: classfico a intenção, mantenho o contexto, delibero quando há decisão, " +
        "e oriento a execução sem substituir a sua autoridade final."
      );
  }
}

/**
 * Resposta determinística de identidade de sessão (TC-01).
 * @param {{ id?: string|null, nome?: string|null }|null|undefined} coa
 * @returns {string}
 */
export function comporRespostaCoaSessaoActivo(coa) {
  const id = coa?.id != null ? String(coa.id).trim() : "";
  if (!id) {
    return (
      "Não há COA / projecto activo nesta sessão. " +
      "Use **Abrir** num projecto para fixar o contexto — não invento identidade de sessão."
    );
  }
  const nome = (coa?.nome && String(coa.nome).trim()) || "(sem nome)";
  return `COA / projecto activo: **${nome}** (\`${id}\`).`;
}

/**
 * @param {string} [instrucao]
 * @param {{ coa?: { id?: string|null, nome?: string|null }|null }} [opts]
 * @returns {{ activo: boolean, modo?: ModoProtocoloExecutivo|null, mensagem?: string }}
 */
export function tentarRespostaProtocoloExecutivo(instrucao, opts = {}) {
  const det = detectarPedidoProtocoloExecutivo(instrucao);
  if (!det.activo || !det.modo) {
    return { activo: false, modo: null };
  }
  if (det.modo === "coa_sessao_activo") {
    return {
      activo: true,
      modo: det.modo,
      mensagem: comporRespostaCoaSessaoActivo(opts.coa || null)
    };
  }
  return {
    activo: true,
    modo: det.modo,
    mensagem: comporRespostaProtocoloExecutivo(det.modo)
  };
}
