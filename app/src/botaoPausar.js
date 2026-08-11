/**
 * Botão Pausar — canto superior direito do shell (JOB-000039).
 * Pausa TTS em curso, interrompe escuta activa e sinaliza módulos (Conversa).
 */

import { VoiceFactory } from "./onboarding/voice/VoiceFactory.js";
import { ESTADO_VOZ } from "./experienciaVoz/estados.js";
import {
  interromperFalaCeo,
  onMudancaEstadoVoz
} from "./experienciaVoz/reproduzirResposta.js";
import { obterOrquestradorVozSessao } from "./experienciaVoz/sessao.js";

export const EVENTO_PAUSAR_CEO = "ceo:pausar";

/** @type {import("./onboarding/voice/VoiceProvider.js").VoiceProvider | null} */
let motor = null;
let pausado = false;

function motorVoz() {
  if (!motor) motor = VoiceFactory.create();
  return motor;
}

export function estaPausado() {
  return pausado;
}

/**
 * Executa pausa global: TTS + escuta + sinal à Conversa.
 * @returns {{ pausado: boolean }}
 */
export function executarPausa() {
  const orch = obterOrquestradorVozSessao();
  const snap = orch.snapshot();
  const voz = motorVoz();

  if (snap.estado === ESTADO_VOZ.FALANDO) {
    try {
      if (typeof voz.isSpeaking === "function" && voz.isSpeaking()) {
        voz.pause();
      } else {
        interromperFalaCeo(orch);
      }
    } catch {
      interromperFalaCeo(orch);
    }
  } else if (snap.estado === ESTADO_VOZ.OUVINDO) {
    orch.terminarEscuta();
  }

  window.dispatchEvent(new CustomEvent(EVENTO_PAUSAR_CEO));
  pausado = true;
  return { pausado: true };
}

/**
 * @param {HTMLButtonElement} btn
 */
export function pintarBotaoPausar(btn) {
  btn.dataset.pauseState = pausado ? "pausado" : "activo";
  btn.setAttribute("aria-label", pausado ? "Pausado" : "Pausar");
  btn.title = pausado ? "CEO pausado" : "Pausar";
  btn.classList.toggle("is-pausado", pausado);
}

/**
 * Cria e liga o botão Pausar no header.
 * @param {ParentNode} host
 * @param {{ onPausa?: (pausado: boolean) => void }} [opts]
 */
export function montarBotaoPausar(host, opts = {}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "action-pause";
  btn.className = "shell-icon-btn shell-pause-btn";
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
    </svg>
  `;

  function atualizar() {
    pintarBotaoPausar(btn);
  }

  btn.addEventListener("click", () => {
    executarPausa();
    atualizar();
    if (typeof opts.onPausa === "function") {
      opts.onPausa(pausado);
    }
  });

  const off = onMudancaEstadoVoz(() => atualizar());

  host.appendChild(btn);
  atualizar();

  return { botao: btn, atualizar, destruir: () => off() };
}
