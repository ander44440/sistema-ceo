/**
 * @typedef {object} VoiceProvider
 * Contrato único de saída de voz (REQ-047).
 *
 * @property {(text: string) => Promise<void>} speak
 * @property {() => void} stop
 * @property {() => void} pause
 * @property {() => void} resume
 * @property {() => boolean} isSpeaking
 */

export {};
