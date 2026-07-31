import { montarShell } from "./shell.js";
import { iniciarRouter, onRota } from "./router.js";
import { renderModulo } from "./modules/placeholders.js";
import { montarConversa } from "./modules/conversa/conversa.js";
import { montarCentroSituacao } from "./modules/centroSituacao/centroSituacao.js";
import { montarProjetos } from "./modules/projetos/projetos.js";
import { montarDevVoice } from "./modules/dev/voice.js";
import { executiveEngine } from "./executiveEngine/index.js";
import {
  atualizarEstadoGabinete,
  inicializarCatalogo,
  obterEstadoGabinete,
  obterProjetoAtivo
} from "./catalogoProjetos/index.js";

function boot() {
  const root = document.getElementById("app");
  if (!root) return;

  inicializarCatalogo();
  executiveEngine.inicializar();

  const shell = montarShell(root);

  const gabinete = obterEstadoGabinete();
  const ativo = obterProjetoAtivo();
  shell.definirStatus(
    ativo
      ? `CEO Online · Projeto ativo: ${ativo.nome}`
      : "CEO Online · Gabinete Executivo"
  );

  const hashVazio =
    !location.hash ||
    location.hash === "#" ||
    location.hash === "#/" ||
    location.hash === "#/dashboard";
  if (gabinete?.rotaId && gabinete.rotaId !== "dashboard" && hashVazio) {
    location.replace(`#/${gabinete.rotaId}`);
  }

  iniciarRouter();

  onRota((rota) => {
    // Rotas de desenvolvimento não poluem o estado do gabinete.
    if (rota.nav !== false) {
      atualizarEstadoGabinete({ rotaId: rota.id });
    }
    shell.atualizarNav();
    shell.workspace.classList.remove("is-conversa", "is-centro");

    const projeto = obterProjetoAtivo();
    if (projeto) {
      shell.definirStatus(`CEO Online · Projeto ativo: ${projeto.nome}`);
    }

    if (rota.id === "dashboard") {
      shell.workspace.classList.add("is-centro");
      shell.renderModule(montarCentroSituacao());
      document.title = "CEO — Centro de Situação";
      return;
    }

    if (rota.id === "conversa") {
      shell.workspace.classList.add("is-conversa");
      shell.renderModule(montarConversa());
      document.title = `CEO — ${rota.titulo}`;
      return;
    }

    if (rota.id === "projetos") {
      shell.renderModule(montarProjetos());
      document.title = `CEO — ${rota.titulo}`;
      return;
    }

    if (rota.id === "dev-voice" || rota.id === "settings-voice") {
      shell.renderModule(montarDevVoice());
      document.title = "CEO — Dev · Voice Engine";
      return;
    }

    shell.renderModule(renderModulo(rota));
    document.title = `CEO — ${rota.titulo}`;
  });
}

boot();
