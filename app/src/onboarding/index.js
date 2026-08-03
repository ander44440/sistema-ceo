/**
 * Módulo Onboarding do CEO Digital (REQ-046 / IMPLEMENTAÇÃO 001).
 */

import { carregarConfigOnboarding } from "./config/index.js";
import { criarVoice } from "./voice/index.js";
import { criarMemory } from "./memory/index.js";
import { criarStorage } from "./storage/index.js";
import { criarConversation } from "./conversation/index.js";
import { montarOnboardingUi } from "./ui/index.js";

/**
 * @param {HTMLElement} root
 * @param {{ onConcluido?: (perfil: object) => void }} [opts]
 */
export async function iniciarModuloOnboarding(root, opts = {}) {
  const config = carregarConfigOnboarding();
  const storage = criarStorage();
  const memory = criarMemory();
  const voice = criarVoice({
    tts: config.tts,
    stt: config.stt
  });

  const carregado = await storage.carregar();
  if (carregado.perfil?.completo) {
    memory.carregarPerfil(carregado.perfil);
    memory.carregarTranscricao(carregado.transcricao);
  }

  /** @type {ReturnType<typeof criarConversation> | null} */
  let conversation = null;

  const ui = montarOnboardingUi(root, {
    onIniciar: () => conversation?.iniciar(),
    onEncerrar: () => conversation?.encerrar(),
    onSim: () => conversation?.confirmarSim(),
    onNao: () => conversation?.confirmarNao(),
    onRegravar: (c) => conversation?.regravarCampo(c),
    onTexto: (t) => conversation?.textoManual(t)
  });

  conversation = criarConversation({ config, memory, voice, storage, ui });
  conversation.ligarVoice();

  const uiBridge = ui;
  uiBridge.onConcluido = (perfil) => opts.onConcluido?.(perfil);

  if (carregado.perfil?.completo) {
    ui.renderTranscricao(memory.getTranscricao());
    ui.renderResumo(
      memory.montarResumo(config.rotulosResumo || {}, config.resumoCampos || memory.CAMPOS)
    );
    ui.notify(
      "Perfil de onboarding já existente. Pode reiniciar a conversa ou continuar para o gabinete."
    );
    const bar = document.createElement("div");
    bar.className = "onb-controls";
    bar.style.marginTop = "0.5rem";
    bar.innerHTML = `<button type="button" class="onb-btn onb-btn--primary" id="onb-ir-gabinete">Ir para o Gabinete</button>`;
    root.querySelector(".onb-head")?.after(bar);
    bar.querySelector("#onb-ir-gabinete")?.addEventListener("click", () => {
      opts.onConcluido?.(memory.getPerfil());
    });
  } else {
    ui.notify(config.mensagens.aguardandoInicio);
  }

  if (!voice.suportado()) {
    ui.notify(config.mensagens.microfoneIndisponivel);
  }

  return {
    memory,
    storage,
    reiniciar: () => conversation?.iniciar(),
    perfil: () => memory.getPerfil()
  };
}

/**
 * @returns {Promise<object|null>}
 */
export async function carregarPerfilOnboarding() {
  const storage = criarStorage();
  const { perfil } = await storage.carregar();
  return perfil?.completo ? perfil : null;
}
