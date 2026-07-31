/**
 * Speaker Executivo (IMP-015 / REQ-050).
 * Não delibera. Não consulta memória. Não altera o parecer.
 */

import { validarParecerExecutivo } from "../parecer/validarParecerExecutivo.js";

const CANAIS = new Set(["chat", "voz", "centro_situacao"]);

const ROTULO_ESTADO = {
  aprovar: "Aprovo",
  rejeitar: "Rejeito",
  delegar: "Delego a execução",
  monitorar: "Vou monitorar",
  solicitar_dados: "Preciso de dados",
  adiar: "Adio a deliberação"
};

/**
 * @param {object} parecer
 * @param {"chat"|"voz"|"centro_situacao"} canal
 * @param {object} [preferencias]
 * @returns {{ ok: boolean, comunicado?: object, erro?: string }}
 */
export function gerarComunicadoExecutivo(parecer, canal, preferencias = {}) {
  if (!CANAIS.has(canal)) {
    return { ok: false, erro: `Canal inválido: ${canal}` };
  }

  const validacao = validarParecerExecutivo(parecer);
  if (!validacao.ok) {
    return {
      ok: false,
      erro: "ParecerExecutivo inválido — Speaker recusa geração",
      violacoes: validacao.violacoes
    };
  }

  const estado = parecer.decisaoExecutiva.estado;
  const recomendacao = parecer.decisaoExecutiva.recomendacao;
  const justificativa = parecer.decisaoExecutiva.justificativa;
  const acaoDesc = parecer.acao.descricao;
  const lacunas = Array.isArray(parecer.lacunas) ? parecer.lacunas : [];
  const objetivo = parecer.diagnostico.objetivoReal;

  const perguntas =
    estado === "solicitar_dados"
      ? lacunas.map((l) => (/\?$/.test(l) ? l : `${l}?`))
      : [];

  if (estado === "solicitar_dados" && perguntas.length === 0) {
    perguntas.push("Que informação essencial falta para decidir?");
  }

  const rotulo = ROTULO_ESTADO[estado] || estado;
  const cautela =
    parecer.confianca < 0.5 || lacunas.length > 0
      ? " Com a informação disponível, avanço com cautela."
      : "";

  const textoChat = [
    `Sobre: ${objetivo}.`,
    `${rotulo}: ${recomendacao}.${cautela}`,
    `Porquê: ${encurtar(justificativa, preferencias.brevidade ? 180 : 320)}`,
    `Próximo gesto: ${acaoDesc}.`,
    perguntas.length ? `Perguntas: ${perguntas.join(" ")}` : null,
    lacunas.length && estado !== "solicitar_dados"
      ? `Lacunas residuais: ${lacunas.join("; ")}.`
      : null
  ]
    .filter(Boolean)
    .join("\n\n");

  const guiãoVoz = [
    `Sobre ${objetivo}.`,
    `${rotulo}. ${recomendacao}.`,
    `A seguir: ${acaoDesc}.`,
    perguntas.length ? perguntas.slice(0, 2).join(" ") : null
  ]
    .filter(Boolean)
    .join(" ");

  const destaques = [
    `Decisão: ${estado}`,
    `Ação: ${parecer.acao.tipo} — ${encurtar(acaoDesc, 80)}`,
    lacunas[0] ? `Lacuna: ${encurtar(lacunas[0], 60)}` : null
  ].filter(Boolean);

  let texto = textoChat;
  let guião = null;
  let destaquesOut = undefined;

  if (canal === "voz") {
    texto = guiãoVoz;
    guião = guiãoVoz;
  } else if (canal === "centro_situacao") {
    texto = `${rotulo}: ${recomendacao}. Próximo: ${acaoDesc}.`;
    destaquesOut = destaques;
  } else {
    guião = null;
  }

  return {
    ok: true,
    comunicado: {
      parecerId: parecer.id,
      canal,
      texto,
      perguntas,
      ...(destaquesOut ? { destaques: destaquesOut } : canal === "chat" ? {} : {}),
      ...(canal === "centro_situacao" ? { destaques } : {}),
      guiãoVoz: canal === "voz" ? guião : null,
      referenciaDecisao: estado,
      metadados: {
        confianca: parecer.confianca,
        gerador: "speaker-det-v1"
      }
    }
  };
}

function encurtar(s, max) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default gerarComunicadoExecutivo;
