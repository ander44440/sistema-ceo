/**
 * Botão de voz — integração UI ↔ Orquestrador (PX-002 E3/E4).
 * Estados + unlock; E4 liga interromper/ouvir pendente ao motor TTS.
 */

import { ESTADO_VOZ } from "./estados.js";
import { tentarAutorizacaoBrowser } from "./autorizacaoBrowser.js";
import {
  interromperFalaCeo,
  onMudancaEstadoVoz,
  ouvirPendenteCeo
} from "./reproduzirResposta.js";
import { obterOrquestradorVozSessao } from "./sessao.js";

const ROTULOS = Object.freeze({
  [ESTADO_VOZ.DESATIVADA]: "Voz desativada",
  [ESTADO_VOZ.AGUARDANDO_AUTORIZACAO]: "Aguardando autorização",
  [ESTADO_VOZ.ATIVA]: "Voz ativa",
  [ESTADO_VOZ.FALANDO]: "CEO a falar",
  [ESTADO_VOZ.OUVINDO]: "A ouvir",
  [ESTADO_VOZ.ERRO]: "Erro de voz"
});

const ACOES = Object.freeze({
  [ESTADO_VOZ.DESATIVADA]: "Ativar voz do CEO",
  [ESTADO_VOZ.AGUARDANDO_AUTORIZACAO]: "Cancelar autorização de voz",
  [ESTADO_VOZ.ATIVA]: "Desativar voz",
  [ESTADO_VOZ.FALANDO]: "Interromper fala",
  [ESTADO_VOZ.OUVINDO]: "Parar de ouvir",
  [ESTADO_VOZ.ERRO]: "Tentar voz novamente"
});

/**
 * @param {ReturnType<typeof obterOrquestradorVozSessao>} orch
 */
function acaoEfetiva(orch) {
  const snap = orch.snapshot();
  if (snap.textoPendente && snap.estado === ESTADO_VOZ.ERRO) {
    return "Ouvir resposta (pendente)";
  }
  if (
    snap.estado === ESTADO_VOZ.ATIVA &&
    snap.enabled &&
    !snap.sessaoDesbloqueada
  ) {
    return "Autorizar voz nesta sessão";
  }
  if (snap.textoPendente && snap.estado === ESTADO_VOZ.ATIVA) {
    return "Ouvir resposta (pendente)";
  }
  return ACOES[snap.estado] || "Voz";
}

/**
 * @param {HTMLButtonElement} btn
 * @param {ReturnType<typeof obterOrquestradorVozSessao>} orch
 */
export function pintarBotaoVoz(btn, orch) {
  const snap = orch.snapshot();
  const estado = snap.estado;
  btn.dataset.voiceState = estado;
  btn.dataset.voiceUnlocked = snap.sessaoDesbloqueada ? "1" : "0";
  btn.dataset.voiceEnabled = snap.enabled ? "1" : "0";
  btn.setAttribute("aria-label", `${ROTULOS[estado]}. ${acaoEfetiva(orch)}`);
  btn.title = `${ROTULOS[estado]} — ${acaoEfetiva(orch)}`;

  const label = btn.querySelector("[data-voice-label]");
  if (label) {
    label.textContent = ROTULOS[estado];
  }

  if (snap.mensagemErro) {
    btn.dataset.voiceError = snap.mensagemErro;
  } else {
    delete btn.dataset.voiceError;
  }
}

/**
 * Trata um gesto no botão (click / Enter / Space).
 * @param {ReturnType<typeof obterOrquestradorVozSessao>} orch
 * @param {{ autorizarBrowser?: () => { ok: boolean, motivo?: string }, motor?: { speak: Function, stop: Function } }} [deps]
 * @returns {Promise<object>|object} snapshot (Promise se consumir pendente / falar)
 */
export function executarGestoBotaoVoz(orch, deps = {}) {
  const autorizar = deps.autorizarBrowser || tentarAutorizacaoBrowser;
  const snap = orch.snapshot();

  if (snap.estado === ESTADO_VOZ.DESATIVADA) {
    orch.solicitarAtivacao();
    const auth = autorizar();
    if (!auth.ok) {
      orch.marcarErro(auth.motivo);
      return orch.snapshot();
    }
    orch.confirmarAutorizacao();
    return orch.snapshot();
  }

  if (snap.estado === ESTADO_VOZ.AGUARDANDO_AUTORIZACAO) {
    orch.cancelarAutorizacao();
    return orch.snapshot();
  }

  if (snap.estado === ESTADO_VOZ.ERRO) {
    const retry = orch.tentarNovamente();
    if (retry.enabled) {
      const auth = autorizar();
      if (!auth.ok) {
        orch.marcarErro(auth.motivo);
        return orch.snapshot();
      }
      orch.desbloquearSessao();
      // Mesmo gesto: se há resposta pendente, fala agora (recovery pós-await)
      if (orch.textoPendente()) {
        return ouvirPendenteCeo(orch, {
          motor: deps.motor,
          autorizarBrowser: autorizar
        }).then(() => orch.snapshot());
      }
    }
    return orch.snapshot();
  }

  if (snap.estado === ESTADO_VOZ.FALANDO) {
    return interromperFalaCeo(orch);
  }

  if (snap.estado === ESTADO_VOZ.OUVINDO) {
    orch.terminarEscuta();
    return orch.snapshot();
  }

  if (snap.estado === ESTADO_VOZ.ATIVA) {
    if (!snap.sessaoDesbloqueada) {
      const auth = autorizar();
      if (!auth.ok) {
        orch.marcarErro(auth.motivo);
        return orch.snapshot();
      }
      orch.desbloquearSessao();
      return orch.snapshot();
    }
    if (snap.textoPendente) {
      return ouvirPendenteCeo(orch, {
        motor: deps.motor,
        autorizarBrowser: autorizar
      }).then(() => orch.snapshot());
    }
    try {
      interromperFalaCeo(orch);
    } catch {
      /* ignore */
    }
    orch.desativar();
    return orch.snapshot();
  }

  return orch.snapshot();
}

/**
 * Cria e liga o botão ao orquestrador da sessão.
 * @param {ParentNode} host — contentor (ex.: header-right)
 * @returns {{ botao: HTMLButtonElement, orquestrador: object, atualizar: () => void }}
 */
export function montarBotaoVoz(host) {
  const orch = obterOrquestradorVozSessao();
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "action-voice";
  btn.className = "shell-icon-btn shell-voice-btn";
  btn.innerHTML = `
    <svg class="shell-voice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
    <span class="shell-voice-label" data-voice-label></span>
  `;

  function atualizar() {
    pintarBotaoVoz(btn, orch);
  }

  btn.addEventListener("click", () => {
    const r = executarGestoBotaoVoz(orch);
    if (r && typeof r.then === "function") {
      void r.finally(atualizar);
    } else {
      atualizar();
    }
  });

  const off = onMudancaEstadoVoz(() => atualizar());

  host.appendChild(btn);
  atualizar();

  return {
    botao: btn,
    orquestrador: orch,
    atualizar,
    destruir: () => off()
  };
}
