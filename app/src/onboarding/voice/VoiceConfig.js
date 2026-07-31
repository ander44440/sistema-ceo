/**
 * Carrega e normaliza config/voice.json (REQ-047).
 */

import voiceJson from "../config/voice.json" with { type: "json" };

/**
 * @returns {{
 *   provider: string,
 *   language: string,
 *   voice: string,
 *   speed: number,
 *   pitch: number,
 *   volume: number,
 *   personality: object
 * }}
 */
export function loadVoiceConfig() {
  const raw = structuredClone(voiceJson);
  return {
    provider: String(raw.provider || "browser").toLowerCase(),
    language: raw.language || "pt-BR",
    voice: raw.voice || "auto",
    speed: Number(raw.speed ?? 0.95),
    pitch: Number(raw.pitch ?? 1),
    volume: Number(raw.volume ?? 1),
    personality: raw.personality || {
      pauseBetweenParagraphsMs: 320,
      executiveTone: true
    }
  };
}

export const VoiceConfig = { load: loadVoiceConfig };
