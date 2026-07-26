/**
 * Painel executivo por projeto — Onda 02 / ADR-015.
 * Regras determinísticas; sem LLM.
 */

/**
 * @typedef {"Estável" | "Em andamento" | "Atenção" | "Crítico"} EstadoExecutivo
 */

/**
 * @typedef {object} MetricasProjeto
 * @property {number} decisoes
 * @property {number} pendencias
 * @property {number} proximasAcoes
 * @property {string|null} ultimaAtividadeEm
 */

/**
 * @typedef {object} EventoLinhaTempo
 * @property {string} id
 * @property {string} quando
 * @property {string} rotulo
 * @property {string} [detalhe]
 * @property {"decisao" | "pendencia" | "proxima" | "projeto"} tipo
 */

/**
 * @typedef {object} PainelExecutivo
 * @property {MetricasProjeto} metricas
 * @property {EstadoExecutivo} estadoExecutivo
 * @property {string} resumoExecutivo
 * @property {EventoLinhaTempo[]} linhaDoTempo
 * @property {string|null} proximaAcao
 */

function pendenciasAbertas(projeto) {
  return (projeto?.pendencias || []).filter((p) => p.status === "aberta");
}

/**
 * Classificação operacional simples (sem IA).
 * @param {object} projeto
 * @returns {EstadoExecutivo}
 */
export function classificarEstadoExecutivo(projeto) {
  const pens = pendenciasAbertas(projeto);
  const nPens = pens.length;
  const nDec = (projeto?.decisoes || []).length;
  const nPx = (projeto?.proximasAcoes || []).length;
  const critica = pens.some((p) =>
    /cr[ií]tic|urgente|bloque/i.test(String(p.texto || ""))
  );

  if (critica || nPens >= 5) return "Crítico";
  if (nPens >= 3 || (nPens >= 1 && nPx === 0)) return "Atenção";
  if (nDec > 0 || nPx > 0 || nPens > 0) return "Em andamento";
  return "Estável";
}

/**
 * @param {string|null|undefined} iso
 * @param {Date} [agora]
 */
export function formatarRelativoAtividade(iso, agora = new Date()) {
  if (!iso) return "sem registro de atividade";
  const diffMs = agora.getTime() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "sem registro de atividade";
  const min = Math.max(0, Math.round(diffMs / 60000));
  if (min < 1) return "agora";
  if (min === 1) return "há 1 minuto";
  if (min < 60) return `há ${min} minutos`;
  const h = Math.round(min / 60);
  if (h === 1) return "há 1 hora";
  if (h < 48) return `há ${h} horas`;
  const d = Math.round(h / 24);
  if (d === 1) return "há 1 dia";
  return `há ${d} dias`;
}

/**
 * Resumo executivo determinístico do projeto.
 * @param {object} projeto
 * @param {{ ativo?: boolean, agora?: Date }} [opts]
 * @returns {string}
 */
export function gerarResumoExecutivo(projeto, opts = {}) {
  if (!projeto) {
    return "Nenhum projeto selecionado.";
  }

  const nDec = (projeto.decisoes || []).length;
  const nPens = pendenciasAbertas(projeto).length;
  const nPx = (projeto.proximasAcoes || []).length;
  const ativo = opts.ativo !== false;
  const relativo = formatarRelativoAtividade(
    projeto.ultimaAtividadeEm,
    opts.agora || new Date()
  );

  const linhas = [];
  linhas.push(ativo ? "Projeto ativo." : `Projeto «${projeto.nome}».`);
  linhas.push(
    nDec === 1
      ? "1 decisão registrada."
      : `${nDec} decisões registradas.`
  );
  linhas.push(
    nPens === 1
      ? "1 pendência aberta."
      : `${nPens} pendências abertas.`
  );
  linhas.push(
    nPx === 0
      ? "Nenhuma próxima ação definida."
      : nPx === 1
        ? "Próxima ação definida."
        : `${nPx} próximas ações definidas.`
  );
  linhas.push(`Última atividade ${relativo}.`);

  return linhas.join("\n");
}

/**
 * Histórico cronológico simples (mais recente primeiro).
 * @param {object} projeto
 * @returns {EventoLinhaTempo[]}
 */
export function montarLinhaDoTempo(projeto) {
  /** @type {EventoLinhaTempo[]} */
  const eventos = [];

  for (const d of projeto?.decisoes || []) {
    eventos.push({
      id: d.id || `dec-${d.quando}`,
      quando: d.quando,
      rotulo: "Decisão registrada",
      detalhe: d.texto,
      tipo: "decisao"
    });
  }

  for (const p of projeto?.pendencias || []) {
    eventos.push({
      id: p.id || `pen-${p.quando}`,
      quando: p.quando,
      rotulo: "Pendência criada",
      detalhe: p.texto,
      tipo: "pendencia"
    });
  }

  for (const a of projeto?.proximasAcoes || []) {
    eventos.push({
      id: a.id || `pxa-${a.quando}`,
      quando: a.quando,
      rotulo: "Próxima ação adicionada",
      detalhe: a.texto,
      tipo: "proxima"
    });
  }

  for (const h of projeto?.historicoResumido || []) {
    const texto = String(h.texto || "");
    if (/^projeto alterado/i.test(texto)) {
      eventos.push({
        id: h.id || `prj-${h.quando}`,
        quando: h.quando,
        rotulo: "Projeto alterado",
        detalhe: texto,
        tipo: "projeto"
      });
    }
  }

  eventos.sort(
    (a, b) => new Date(b.quando).getTime() - new Date(a.quando).getTime()
  );
  return eventos;
}

/**
 * @param {object} projeto
 * @returns {MetricasProjeto}
 */
export function obterMetricasProjeto(projeto) {
  return {
    decisoes: (projeto?.decisoes || []).length,
    pendencias: pendenciasAbertas(projeto).length,
    proximasAcoes: (projeto?.proximasAcoes || []).length,
    ultimaAtividadeEm: projeto?.ultimaAtividadeEm || null
  };
}

/**
 * Dashboard executivo completo de um projeto.
 * @param {object} projeto
 * @param {{ ativo?: boolean }} [opts]
 * @returns {PainelExecutivo | null}
 */
export function montarPainelExecutivo(projeto, opts = {}) {
  if (!projeto) return null;
  const metricas = obterMetricasProjeto(projeto);
  return {
    metricas,
    estadoExecutivo: classificarEstadoExecutivo(projeto),
    resumoExecutivo: gerarResumoExecutivo(projeto, opts),
    linhaDoTempo: montarLinhaDoTempo(projeto),
    proximaAcao: projeto.proximasAcoes?.[0]?.texto || null
  };
}

/**
 * Classe CSS auxiliar para o estado (sem redesenhar o shell).
 * @param {EstadoExecutivo} estado
 */
export function tomEstadoExecutivo(estado) {
  switch (estado) {
    case "Crítico":
      return "critico";
    case "Atenção":
      return "atencao";
    case "Em andamento":
      return "andamento";
    default:
      return "estavel";
  }
}
