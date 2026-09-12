/**
 * IMP-086 / ARQ-086 C-SEP — montagem da resposta (decisão ≠ discussão).
 * IMP-089 Fatia 1 — rótulo de discussões cobre HFC (+ F5-C3 na união).
 */

/**
 * @param {{
 *   coaId: string,
 *   ramo: "decisao"|"discussao"|"ambos",
 *   decisoes?: { status: string, registos?: object[], mensagem?: string },
 *   discussoes?: { status: string, mensagens?: object[], mensagem?: string },
 *   refs?: object[]
 * }} entrada
 */
export function montarRespostaConsulta(entrada) {
  const coaId = String(entrada.coaId || "").trim() || "(sem COA)";
  const ramo = entrada.ramo || "ambos";
  const linhas = [];
  /** @type {string[]} */
  const ausencias = [];
  /** @type {object[]} */
  const decisoes = [];
  /** @type {object[]} */
  const discussoes = [];

  const querDec = ramo === "decisao" || ramo === "ambos";
  const querDisc = ramo === "discussao" || ramo === "ambos";

  linhas.push(`Consulta registada (COA: ${coaId}).`);

  if (querDec) {
    linhas.push("");
    linhas.push("## Decisões (Memória Confiável — Art. 8º)");
    const bloco = entrada.decisoes || { status: "ausente", registos: [] };
    if (bloco.status === "encontrado" && Array.isArray(bloco.registos) && bloco.registos.length) {
      for (const r of bloco.registos) {
        decisoes.push(r);
        linhas.push(
          `- [${r.id || "?"}] ${r.decisao || "(sem enunciado)"}` +
            (r.quando ? ` (${r.quando})` : "") +
            (r.quem ? ` — ${r.quem}` : "")
        );
        if (r.porque) linhas.push(`  Porquê: ${r.porque}`);
        if (r.baseadoEm) linhas.push(`  Baseado em: ${r.baseadoEm}`);
        if (r.resultado) linhas.push(`  Resultado: ${r.resultado}`);
      }
    } else {
      const msg =
        bloco.mensagem ||
        "Ausência explícita: nenhuma decisão registada na Memória Confiável para este COA.";
      ausencias.push(msg);
      linhas.push(msg);
    }
  }

  if (querDisc) {
    linhas.push("");
    linhas.push("## Discussões (histórico do COA)");
    const bloco = entrada.discussoes || { status: "ausente", mensagens: [] };
    if (
      bloco.status === "encontrado" &&
      Array.isArray(bloco.mensagens) &&
      bloco.mensagens.length
    ) {
      const max = 12;
      const slice = bloco.mensagens.slice(-max);
      for (const m of slice) {
        discussoes.push(m);
        const papel = m.papel || "?";
        const texto = String(m.texto || "").trim();
        const curto = texto.length > 220 ? `${texto.slice(0, 217)}…` : texto;
        linhas.push(`- (${papel}) ${curto}`);
      }
      if (bloco.mensagens.length > max) {
        linhas.push(`(… ${bloco.mensagens.length - max} mensagens anteriores omitidas)`);
      }
    } else {
      const msg =
        bloco.mensagem ||
        "Ausência explícita: nenhuma discussão registada no histórico deste COA.";
      ausencias.push(msg);
      linhas.push(msg);
    }
  }

  const refs = Array.isArray(entrada.refs) ? entrada.refs : [];
  if (refs.length) {
    linhas.push("");
    linhas.push("## Referências de execução (Trilha — opcional)");
    for (const ref of refs.slice(0, 8)) {
      linhas.push(
        `- MO ${ref.moRegistroId || "?"}` +
          (ref.tipo ? ` · ${ref.tipo}` : "") +
          (ref.jobId ? ` · job ${ref.jobId}` : "") +
          (ref.gateId ? ` · gate ${ref.gateId}` : "")
      );
    }
  }

  return {
    mensagem: linhas.join("\n").trim(),
    decisoes,
    discussoes,
    refs,
    ausencias,
    coaId,
    ramo
  };
}
