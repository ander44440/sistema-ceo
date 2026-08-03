/**
 * Capacidade: consultar CTO (REQ-054).
 * Não delibera via MRE; não publica Jobs.
 */

import { consultarCto, novoConsultaId } from "../../ctoConnector/cliente.js";
import { obterCoaAtivo } from "../coaSessao.js";
import { resumirContexto, citacaoCurta, montarResposta } from "../resposta.js";

function inferirTipoESchema(texto) {
  const t = String(texto || "").toLowerCase();
  if (/\bgate\b|go\/no-go|homolog/.test(t)) {
    return { tipo: "gate", expectativaSchema: "cto.gate_v1" };
  }
  if (/\brevis(ão|ao)\s+(do\s+)?req|revisar\s+req\b/.test(t)) {
    return { tipo: "revisao_req", expectativaSchema: "cto.revisao_artefacto_v1" };
  }
  if (/\brevis(ão|ao)\s+(da\s+)?arq|revisar\s+arq\b/.test(t)) {
    return { tipo: "revisao_arq", expectativaSchema: "cto.revisao_artefacto_v1" };
  }
  if (/\bnormativ|constitui|adr-|\breq-/.test(t) && /\b(duvida|dúvida|interpret)/.test(t)) {
    return {
      tipo: "duvida_normativa",
      expectativaSchema: "cto.duvida_normativa_v1"
    };
  }
  if (/\bparecer\b|arquitet/.test(t)) {
    return {
      tipo: "parecer_arquitetural",
      expectativaSchema: "cto.parecer_v1"
    };
  }
  return {
    tipo: "outro",
    expectativaSchema: "cto.parecer_v1"
  };
}

function extrairPergunta(texto) {
  const raw = String(texto || "").trim();
  const m = raw.match(
    /(?:consultar|consulta|pedir|peça|peca|parecer\s+(?:do|ao)|pergunte?\s+ao)\s+cto\s*[:\-–]?\s*(.+)$/i
  );
  if (m && m[1]) return m[1].trim();
  const m2 = raw.match(/cto\s*[:\-–]\s*(.+)$/i);
  if (m2 && m2[1]) return m2[1].trim();
  return raw
    .replace(/consultar\s+o?\s*cto/gi, "")
    .replace(/parecer\s+do\s+cto/gi, "")
    .trim() || raw;
}

function formatarResultado(resultado) {
  if (!resultado || typeof resultado !== "object") {
    return "O Conector CTO não devolveu resultado legível.";
  }
  if (resultado.estado === "ok" || resultado.estado === "recusa") {
    const partes = [];
    if (resultado.resumo) partes.push(resultado.resumo);
    if (resultado.recomendacao) {
      partes.push(`Recomendação: ${resultado.recomendacao}`);
    }
    if (resultado.estado === "recusa") {
      partes.unshift("O CTO recusou emitir parecer nestes termos.");
    }
    if (resultado.corpoEstruturado && typeof resultado.corpoEstruturado === "object") {
      const c = resultado.corpoEstruturado;
      if (c.conclusao) partes.push(`Conclusão: ${c.conclusao}`);
      if (c.decisao) partes.push(`Decisão de gate: ${c.decisao}`);
      if (c.veredicto) partes.push(`Veredicto: ${c.veredicto}`);
      if (c.interpretacao) partes.push(c.interpretacao);
    }
    return partes.filter(Boolean).join("\n\n") || "Consulta CTO concluída.";
  }
  return (
    resultado.mensagem ||
    `Consulta CTO sem sucesso (estado=${resultado.estado || "?"}).`
  );
}

export const capacidadeConsultarCto = {
  id: "consultar_cto",
  nome: "Consultar CTO",
  descricao:
    "Consulta o CTO via Conector (REQ-054) — canal distinto do MRE.",

  async executar(ctx) {
    const texto = String((ctx && ctx.instrucao) || "").trim();
    const mem = typeof ctx.memoria === "function" ? ctx.memoria() : null;
    const coa = ctx.coaAtivo || obterCoaAtivo();
    const { tipo, expectativaSchema } = inferirTipoESchema(texto);
    const pergunta = extrairPergunta(texto);

    const pacote = {
      consultaId: novoConsultaId(),
      tipo,
      pergunta,
      contextoExecutivo: {
        situacao: citacaoCurta(texto, 240),
        normaAplicavel: ["CON-001 Art. 6º II", "ARQ-015", "REQ-054"],
        estado: resumirContexto(mem),
        evidencia: coa
          ? `COA ativo: ${coa.nome || coa.id || "n/d"}`
          : "Sem COA activo na sessão.",
        pedidoFormato: `Schema ${expectativaSchema}`
      },
      artefactosRef: ["docs/architecture/ARQ-015-cto-connector.md", "docs/requirements/REQ-054-conector-cto.md"],
      expectativaSchema,
      prioridade: "normal",
      coaId: coa && (coa.id || coa.coaId) ? coa.id || coa.coaId : null,
      projeto: coa && coa.nome ? coa.nome : null
    };

    const resultado = await consultarCto(pacote);
    const ok =
      resultado &&
      (resultado.estado === "ok" || resultado.estado === "recusa");

    return {
      ok: Boolean(ok),
      capacidade: "consultar_cto",
      mensagem: montarResposta({
        compreendi: `Consulta ao CTO: «${citacaoCurta(pergunta)}».`,
        acao: formatarResultado(resultado),
        contexto: resumirContexto(mem),
        proximo:
          "O Connector não executa efeitos — se couber engenharia, despache Job na fila; se couber artefacto, abra REQ/ARQ.",
        limite:
          "Canal CTO distinto do MRE; mesma chave OpenAI no backend (Opção B)."
      }),
      dados: {
        resultadoCto: resultado,
        pacoteResumo: {
          consultaId: pacote.consultaId,
          tipo: pacote.tipo,
          expectativaSchema: pacote.expectativaSchema
        },
        intencao: ctx.intencao,
        efeitosAplicados: []
      }
    };
  }
};
