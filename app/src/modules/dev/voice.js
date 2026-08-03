/**
 * Tela de desenvolvimento — teste do Voice Engine (REQ-047).
 * Rota: #/dev/voice ou #/settings/voice — fora da navegação principal.
 */

import { VoiceFactory } from "../../onboarding/voice/VoiceFactory.js";
import { loadVoiceConfig } from "../../onboarding/voice/VoiceConfig.js";

export function montarDevVoice() {
  const cfg = loadVoiceConfig();
  const root = document.createElement("section");
  root.className = "workspace-module";
  root.dataset.module = "dev-voice";
  root.innerHTML = `
    <p class="meta">Desenvolvimento · Voice Engine</p>
    <h1>Teste de voz</h1>
    <p>Infraestrutura interna (REQ-047). Não faz parte da experiência do utilizador.</p>
    <p class="meta">Provedor atual: <code>${cfg.provider}</code> · idioma <code>${cfg.language}</code> · speed <code>${cfg.speed}</code></p>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin:1rem 0">
      <button type="button" class="onb-btn onb-btn--primary" id="dv-speak">Falar amostra</button>
      <button type="button" class="onb-btn" id="dv-stop">Parar</button>
    </div>
    <label class="label" for="dv-text">Texto</label>
    <textarea id="dv-text" rows="4" style="width:100%;max-width:40rem">Olá. Eu sou o CEO Digital. Este é um teste da camada profissional de voz.</textarea>
    <p class="meta" id="dv-status" aria-live="polite"></p>
    <p class="meta"><a href="#/dashboard">← Voltar ao Centro de Situação</a></p>
  `;

  const voice = VoiceFactory.create();
  const status = root.querySelector("#dv-status");

  root.querySelector("#dv-speak")?.addEventListener("click", async () => {
    const texto = root.querySelector("#dv-text")?.value || "";
    status.textContent = "A falar…";
    try {
      await voice.speak(texto);
      status.textContent = "Concluído.";
    } catch (err) {
      status.textContent = err?.message || "Falha no provider.";
    }
  });

  root.querySelector("#dv-stop")?.addEventListener("click", () => {
    voice.stop();
    status.textContent = "Interrompido.";
  });

  return root;
}
