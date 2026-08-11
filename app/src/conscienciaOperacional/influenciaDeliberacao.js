/**
 * Influência do Estado Executivo na deliberação do Núcleo/MRE — IMP-059 E4/E5.
 * Prosa naturalmente contextualizada; não muta Motor/Fila/Dispatcher.
 * Autonomia deliberativa do MRE preservada — lastro é camada de contexto.
 */

/**
 * @typedef {import("./consultarAntesDeResponder.js").LastroConscienciaNucleo} LastroConscienciaNucleo
 */

/**
 * Detecta se a prosa já reflecte lastro de Job em execução.
 * @param {string} mensagem
 */
export function prosaMencionaJobEmExecucao(mensagem) {
  return /\b(execu[cç][aã]o\s+em\s+andamento|job\s+em\s+execu|em\s+execu[cç][aã]o)\b/i.test(
    String(mensagem || "")
  );
}

/**
 * Detecta se a prosa já reflecte Gate pendente.
 * @param {string} mensagem
 */
export function prosaMencionaGatePendente(mensagem) {
  return /\b(gate\s+(pendente|aguardando)|aguardando\s+sua\s+decis|aguardando\s+a\s+sua\s+decis|aprova[cç][aã]o\s+pendente)\b/i.test(
    String(mensagem || "")
  );
}

/**
 * Conta ocorrências de menção a tópico activo (facto oficial).
 * @param {string} mensagem
 */
export function contarMencoesTopicoActivo(mensagem) {
  const m = String(mensagem || "").match(/\bt[oó]pico\s+activo\b/gi);
  return m ? m.length : 0;
}

/**
 * Um facto oficial de tópico activo no máximo uma vez na resposta final.
 * @param {string} mensagem
 */
export function deduplicarFactoTopicoActivo(mensagem) {
  const texto = String(mensagem ?? "");
  if (contarMencoesTopicoActivo(texto) <= 1) return texto;

  let visto = false;
  return texto
    .split(/\n/)
    .filter((linha) => {
      if (!/\bt[oó]pico\s+activo\b/i.test(linha)) return true;
      if (visto) return false;
      visto = true;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * O corpo já contém o núcleo factual da prosa de lastro (evita prefixo duplicado).
 * @param {string} mensagem
 * @param {string} prosa
 */
export function mensagemJaReflecteProsaLastro(mensagem, prosa) {
  const msg = String(mensagem || "");
  const p = String(prosa || "").trim();
  if (!msg || !p) return false;
  const primeira = p.split(/\n/)[0].replace(/\.\s*$/, "").trim();
  if (primeira.length < 8) return false;
  const esc = primeira.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(esc, "i").test(msg)) return true;
  if (
    /\bt[oó]pico\s+activo\b/i.test(p) &&
    contarMencoesTopicoActivo(msg) >= 1
  ) {
    return true;
  }
  return false;
}

/**
 * Extrai título do primeiro Job em execução a partir dos factos.
 * @param {LastroConscienciaNucleo} lastro
 */
function tituloJobEmExecucao(lastro) {
  const facto = (lastro.factosOficiais || []).find((f) =>
    /Job em execução/i.test(f)
  );
  if (!facto) return "trabalho em curso";
  const m = String(facto).match(/Job em execução\s+\S+:\s*(.+)$/i);
  return (m && m[1].trim()) || "trabalho em curso";
}

/**
 * Teste 3 — resultado reconciliado já no lastro (result|needs_correction).
 * @param {LastroConscienciaNucleo} lastro
 * @returns {{
 *   jobId: string,
 *   estado: string,
 *   sintese: string,
 *   evidencia: string|null,
 *   proximaAcao: string|null
 * }|null}
 */
function extrairResultadoReconciliadoDoLastro(lastro) {
  const activo = lastro?.resultadoMissaoActivo;
  if (activo && typeof activo === "object" && activo.jobId && activo.sintese) {
    return {
      jobId: String(activo.jobId),
      estado: String(activo.estado || "result"),
      sintese: String(activo.sintese),
      evidencia: activo.evidencia ? String(activo.evidencia) : null,
      proximaAcao:
        lastro.memoriaTrabalhoExecutiva?.proximaAcao != null
          ? String(lastro.memoriaTrabalhoExecutiva.proximaAcao)
          : null
    };
  }

  const factos = Array.isArray(lastro?.factosOficiais)
    ? lastro.factosOficiais
    : [];
  for (const f of factos) {
    const s = String(f || "");
    let m = s.match(
      /Resultado reconciliado\s+(JOB-\d+)\s*\((result|needs_correction)\)\s*:\s*(.+?)(?:\s*\|\s*evidência:\s*(.+))?$/i
    );
    if (m) {
      return {
        jobId: m[1],
        estado: m[2].toLowerCase(),
        sintese: m[3].trim(),
        evidencia: m[4] ? m[4].trim() : null,
        proximaAcao:
          lastro.memoriaTrabalhoExecutiva?.proximaAcao != null
            ? String(lastro.memoriaTrabalhoExecutiva.proximaAcao)
            : null
      };
    }
    m = s.match(
      /Job (?:com resultado|em correção)\s+(JOB-\d+):.+?—\s*resultado:\s*(.+?)(?:\s*\|\s*evidência:\s*(.+))?$/i
    );
    if (m) {
      const estado = /em correção/i.test(s) ? "needs_correction" : "result";
      return {
        jobId: m[1],
        estado,
        sintese: m[2].trim(),
        evidencia: m[3] ? m[3].trim() : null,
        proximaAcao:
          lastro.memoriaTrabalhoExecutiva?.proximaAcao != null
            ? String(lastro.memoriaTrabalhoExecutiva.proximaAcao)
            : null
      };
    }
  }
  return null;
}

/**
 * Prosa de continuidade quando o resultado já está no lastro (≠ “ainda a executar”).
 * @param {ReturnType<typeof extrairResultadoReconciliadoDoLastro>} r
 */
function comporProsaResultadoMissao(r) {
  if (!r) return null;
  const sintese = String(r.sintese || "").replace(/\.\s*$/, "");
  const ev = r.evidencia ? ` Evidência: ${r.evidencia}.` : "";
  const estadoTxt =
    r.estado === "needs_correction"
      ? "needs_correction (resultado disponível; não completed)"
      : "result (aguarda verificação; não completed)";
  const proximo =
    r.proximaAcao ||
    (r.estado === "needs_correction"
      ? `Retomar ${r.jobId} a partir deste resultado e continuar a missão`
      : `Usar o resultado de ${r.jobId} na continuidade da missão`);
  return (
    `Já incorporei o resultado reconciliado de ${r.jobId} à missão: ${sintese}.${ev}\n\n` +
    `Estado operacional: ${estadoTxt}. Próximo passo: ${proximo}.`
  );
}

/**
 * Sufixo de prioridades a partir da instrução (ex.: "do MG2").
 * @param {string} instrucao
 */
function sufixoPrioridades(instrucao) {
  const t = String(instrucao || "");
  if (/\bMG2\b/i.test(t)) return " as prioridades do MG2";
  if (/\bMotoboy\s+Game\s*2\b/i.test(t)) return " as prioridades do Motoboy Game 2";
  return " as prioridades";
}

/**
 * Prosa canónica de lastro (natural, 2 blocos) — P1 Gate > P2 Job running.
 * Alinha ARQ-020 §3.3 e demos IMP-059 E5.
 * Teste 3: result|needs_correction com payload → continuidade da missão (não “ainda a executar”).
 *
 * @param {LastroConscienciaNucleo|null|undefined} lastro
 * @param {string} [instrucao]
 * @returns {string|null} null se sem lastro relevante
 */
export function comporProsaLastro(lastro, instrucao = "") {
  if (!lastro || lastro.temContextoRelevante !== true) return null;

  const prioridade = lastro.fontePrioritaria?.id;
  const gates = lastro.contagens?.gatesPendentes || 0;
  const running = lastro.contagens?.jobsEmExecucao || 0;

  // P1 absoluto — Gate pendente (demo E5)
  if (prioridade === "F3" || gates > 0) {
    return (
      "Existe um Gate aguardando sua decisão.\n\n" +
      "Minha recomendação é concluir essa aprovação antes de iniciar novas frentes."
    );
  }

  // Teste 3 — resultado já reconciliado no lastro: continuidade, não “execução em andamento”
  const resultadoMissao = extrairResultadoReconciliadoDoLastro(lastro);
  if (resultadoMissao && (prioridade === "F2" || running > 0)) {
    return comporProsaResultadoMissao(resultadoMissao);
  }

  // P2 — Job em execução (demo E5 / ARQ-020 §3.3) — dispatched|running sem resultado
  if (prioridade === "F2" || running > 0) {
    const titulo = tituloJobEmExecucao(lastro);
    return (
      `Neste momento existe uma execução em andamento para ${titulo}.\n\n` +
      `Minha recomendação é concluir essa execução antes de redefinir${sufixoPrioridades(instrucao)}.`
    );
  }

  // Outras fontes — lastro mínimo, sem dump da fila (RNF1)
  const facto = (lastro.factosOficiais || [])[0];
  if (facto) {
    const limpo = facto.replace(/^Estado Executivo —\s*/i, "");
    return (
      `${limpo}.\n\n` +
      "Tenha isto em conta antes de avançar com novas prioridades."
    );
  }
  return null;
}

/**
 * Hint de schema/contexto para o adaptador LLM (não altera o motor MRE interno).
 * @param {LastroConscienciaNucleo} lastro
 * @param {string} [instrucao]
 */
export function schemaHintConsciencia(lastro, instrucao = "") {
  const prosa = comporProsaLastro(lastro, instrucao) || "";
  const gates = lastro.contagens?.gatesPendentes || 0;
  const resultadoMissao = extrairResultadoReconciliadoDoLastro(lastro);
  const prioridade =
    gates > 0 || lastro.fontePrioritaria?.id === "F3"
      ? "Gate pendente tem PRIORIDADE ABSOLUTA — mencionar e recomendar concluir a aprovação antes de novas frentes."
      : resultadoMissao
        ? "Resultado reconciliado do Job já está no lastro — incorporar à continuidade da missão; result/needs_correction ≠ completed; não pedir o contexto de novo."
        : lastro.fontePrioritaria?.id === "F2" ||
            (lastro.contagens?.jobsEmExecucao || 0) > 0
          ? "Job em execução deve influenciar a recomendação — concluir antes de redefinir prioridades."
          : "Usar o Estado Executivo nos factosOficiais.";

  return (
    "CONSCIÊNCIA OPERACIONAL (Estado Executivo Atual nos factosOficiais): " +
    prioridade +
    " A deliberação permanece sua — mas a recomendação DEVE reflectir o estado operacional de forma natural. " +
    "Proibido ignorar Jobs running ou Gates pendentes relevantes. " +
    "Proibido inventar Jobs/Gates ausentes dos factos. " +
    "Proibido dump da fila. " +
    (prosa ? `Padrão de prosa esperado:\n${prosa}` : "")
  );
}

/**
 * Garante que a resposta ao utilizador reflecte o Estado Executivo (E4/E5).
 * Com lastro Gate/Job: prosa canónica natural (não dump).
 * Sem lastro → mensagem **idêntica** (E5-CA3 / Demo 3).
 *
 * @param {string} mensagem
 * @param {LastroConscienciaNucleo|null|undefined} lastro
 * @param {string} [instrucao]
 * @returns {{ mensagem: string, aplicada: boolean, motivo: string }}
 */
export function garantirReflexoEstadoExecutivo(
  mensagem,
  lastro,
  instrucao = ""
) {
  const original = String(mensagem ?? "");
  if (!lastro || lastro.temContextoRelevante !== true) {
    return {
      mensagem: deduplicarFactoTopicoActivo(original),
      aplicada: false,
      motivo: "sem_lastro"
    };
  }

  const gates = lastro.contagens?.gatesPendentes || 0;
  const running = lastro.contagens?.jobsEmExecucao || 0;
  const prioridadeGate =
    lastro.fontePrioritaria?.id === "F3" || gates > 0;
  const prioridadeJob = !prioridadeGate && running > 0;

  const prosa = comporProsaLastro(lastro, instrucao);
  if (!prosa) {
    return {
      mensagem: deduplicarFactoTopicoActivo(original),
      aplicada: false,
      motivo: "sem_prosa"
    };
  }

  // Já reflecte de forma canónica / suficiente → não forçar
  if (prioridadeGate && prosaMencionaGatePendente(original)) {
    if (
      /concluir essa aprova[cç][aã]o|iniciar novas frentes/i.test(original)
    ) {
      return {
        mensagem: deduplicarFactoTopicoActivo(original),
        aplicada: false,
        motivo: "ja_reflecte_gate"
      };
    }
  }
  if (
    prioridadeJob &&
    prosaMencionaJobEmExecucao(original) &&
    /redefinir.*prioridades/i.test(original)
  ) {
    return {
      mensagem: deduplicarFactoTopicoActivo(original),
      aplicada: false,
      motivo: "ja_reflecte_job"
    };
  }

  // Facto oficial (ex. tópico activo) já no corpo → não prefixar de novo
  if (
    !prioridadeGate &&
    !prioridadeJob &&
    mensagemJaReflecteProsaLastro(original, prosa)
  ) {
    return {
      mensagem: deduplicarFactoTopicoActivo(original),
      aplicada: false,
      motivo: "ja_reflecte_facto"
    };
  }

  const resto = original.trim();
  const eFallback =
    !resto ||
    /modelo de linguagem indisponível|não consigo deliberar/i.test(resto);

  // Gate / Job: prosa canónica é a resposta natural ao utilizador (E5 demos)
  if (prioridadeGate || prioridadeJob) {
    return {
      mensagem: deduplicarFactoTopicoActivo(prosa),
      aplicada: true,
      motivo: eFallback ? "prosa_canonica_fallback" : "prosa_canonica_e5"
    };
  }

  if (eFallback) {
    return {
      mensagem: deduplicarFactoTopicoActivo(prosa),
      aplicada: true,
      motivo: "substituicao_fallback"
    };
  }

  return {
    mensagem: deduplicarFactoTopicoActivo(`${prosa}\n\n${resto}`),
    aplicada: true,
    motivo: "prefixo_lastro"
  };
}

/**
 * Bloco de contexto para enriquecer a mensagem de entrada do MRE.
 * @param {LastroConscienciaNucleo} lastro
 * @param {string} [instrucao]
 */
export function blocoContextoEntradaMre(lastro, instrucao = "") {
  const prosa = comporProsaLastro(lastro, instrucao);
  const factos = (lastro.factosOficiais || []).slice(0, 6).join(" | ");
  return (
    "[Estado Executivo Atual — Consciência Operacional: contextualize a resposta de forma natural. " +
    "Gate pendente tem prioridade absoluta. " +
    "Job em execução deve ser mencionado antes de redefinir prioridades. " +
    `Factos: ${factos}.` +
    (prosa ? `\nOrientação de prosa:\n${prosa}` : "") +
    "]"
  );
}
