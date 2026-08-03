/**
 * Utilitários de resposta coerente (determinísticos — sem IA).
 */

export function textoInstrucao(ctx) {
  return String(ctx && ctx.instrucao ? ctx.instrucao : "").trim();
}

export function snapshotMemoria(ctx) {
  if (typeof ctx.memoria === "function") return ctx.memoria();
  if (ctx.memoria && typeof ctx.memoria === "object") return ctx.memoria;
  return {
    projetosAtivos: [],
    decisoes: [],
    pendencias: [],
    ultimasAcoes: [],
    proximoPasso: null
  };
}

export function resumirContexto(mem) {
  const ativo = mem.projetoAtivo?.nome;
  const pens = (mem.pendencias || []).filter((p) => p.status === "aberta");
  const px = mem.proximasAcoes || [];
  const partes = [];
  if (ativo) partes.push(`projeto ativo: ${ativo}`);
  else partes.push("nenhum projeto ativo");
  partes.push(
    pens.length
      ? `${pens.length} pendência(s) aberta(s)`
      : "sem pendências abertas"
  );
  if (px.length) partes.push(`${px.length} próxima(s) ação(ões)`);
  if (mem.proximoPasso) partes.push(`próximo passo: ${mem.proximoPasso}`);
  return partes.join("; ");
}

export function citacaoCurta(texto, max = 120) {
  const t = String(texto || "").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * Envelope padrão de resposta executiva coerente.
 */
export function montarResposta({
  compreendi,
  acao,
  contexto,
  proximo,
  limite
}) {
  const linhas = [];
  if (compreendi) linhas.push(compreendi);
  if (acao) linhas.push(acao);
  if (contexto) linhas.push(`Contexto desta sessão: ${contexto}.`);
  if (proximo) linhas.push(`Próximo passo sugerido: ${proximo}`);
  if (limite) linhas.push(limite);
  return linhas.filter(Boolean).join("\n\n");
}
