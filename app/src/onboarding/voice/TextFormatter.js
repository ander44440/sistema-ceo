/**
 * Pré-processamento de texto para fala executiva (REQ-047).
 */

const ABREVIACOES = [
  [/\bex\.\s*/gi, "por exemplo, "],
  [/\betc\.\b/gi, "et cetera"],
  [/\bSr\.\b/g, "Senhor"],
  [/\bSra\.\b/g, "Senhora"],
  [/\bDr\.\b/g, "Doutor"],
  [/\bMG2\b/g, "Motoboy Game 2"],
  [/\bCEO\b/g, "C E O"],
  [/\bAPI\b/g, "A P I"],
  [/\bOK\b/g, "ok"]
];

/**
 * @param {string} text
 * @param {{ executiveTone?: boolean }} [opts]
 */
export function formatForSpeech(text, opts = {}) {
  let t = String(text || "");

  t = t.replace(/\r\n/g, "\n");
  t = t.replace(/[`*_#>\|]/g, " ");
  t = t.replace(/https?:\/\/\S+/gi, " link ");
  t = t.replace(/\s{2,}/g, " ");

  // Listas → linguagem natural
  t = t.replace(/^\s*[-•*]\s+/gm, "");
  t = t.replace(/^\s*\d+[.)]\s+/gm, "");

  for (const [re, rep] of ABREVIACOES) {
    t = t.replace(re, rep);
  }

  // Pontuação para entonação
  t = t.replace(/\s*;\s*/g, ". ");
  t = t.replace(/\s*—\s*/g, ", ");
  t = t.replace(/\s*–\s*/g, ", ");

  if (opts.executiveTone !== false) {
    // Pausas entre assuntos (parágrafos → reticências curtas interpretáveis pelo TTS)
    t = t
      .split(/\n{2,}/)
      .map((p) => p.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .join("... ");
  } else {
    t = t.replace(/\n+/g, " ");
  }

  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

export const TextFormatter = { format: formatForSpeech };
