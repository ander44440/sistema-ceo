/**
 * Voice Controller — orquestra turno CEO Ouvindo (ARQ-029 / IMP-068).
 * Fronteira EIC: apenas `enviarTexto(texto)` injectado pela UI.
 */

import { ESTADO_TURNO } from "./estados.js";
import { criarVoiceStateManager } from "./voiceStateManager.js";
import { criarAudioDeviceManager } from "./audioDeviceManager.js";
import { criarSttAdapter } from "./sttAdapter.js";
import { criarTtsAdapter } from "./ttsAdapter.js";
import { diagStt } from "../onboarding/voice/debugStt.js";

/**
 * @param {object} deps
 * @param {(texto: string) => Promise<{ ok?: boolean, mensagem?: string, dados?: object }>} deps.enviarTexto
 * @param {(ev: object) => void} [deps.onEvento]
 * @param {(snap: object) => void} [deps.onEstado]
 * @param {boolean} [deps.retornoAutomaticoOuvindo] — IMP-068: default true
 * @param {ReturnType<typeof criarVoiceStateManager>} [deps.state]
 * @param {ReturnType<typeof criarAudioDeviceManager>} [deps.devices]
 * @param {ReturnType<typeof criarSttAdapter>} [deps.stt]
 * @param {ReturnType<typeof criarTtsAdapter>} [deps.tts]
 */
export function criarVoiceController(deps) {
  if (!deps || typeof deps.enviarTexto !== "function") {
    throw new Error("Voice Controller exige deps.enviarTexto");
  }

  const eventos = [];
  const onEvento = (ev) => {
    eventos.push({ ...ev, em: new Date().toISOString() });
    if (eventos.length > 100) eventos.shift();
    console.info("[ceoOuvindo]", ev.tipo || "evento", ev);
    if (typeof deps.onEvento === "function") {
      try {
        deps.onEvento(ev);
      } catch {
        /* ignore */
      }
    }
  };

  const state = deps.state || criarVoiceStateManager({ onEvento });
  const devices = deps.devices || criarAudioDeviceManager({ onEvento });
  const stt = deps.stt || criarSttAdapter({ onEvento });
  const tts = deps.tts || criarTtsAdapter({ onEvento });
  const autoOuvindo = deps.retornoAutomaticoOuvindo !== false;

  /** @type {boolean} */
  let cancelarTurno = false;
  /** @type {Promise<void>|null} */
  let cicloActivo = null;

  if (typeof deps.onEstado === "function") {
    state.onMudanca(deps.onEstado);
  }

  function snapUi() {
    return {
      ...state.snapshot(),
      sttSuportado: stt.suportado(),
      micSuportado: devices.suportado()
    };
  }

  async function reiniciarEscutaSeAuto() {
    if (!autoOuvindo || cancelarTurno) {
      state.transitar(ESTADO_TURNO.IDLE, { motivo: "fim_turno" });
      return;
    }
    const t = state.transitar(ESTADO_TURNO.OUVINDO, {
      motivo: "retorno_automatico"
    });
    if (!t.ok) {
      state.forcarIdle();
      return;
    }
    try {
      stt.iniciar();
    } catch (err) {
      state.transitar(ESTADO_TURNO.ERRO, {
        mensagemErro: (err && err.message) || "STT falhou ao reiniciar."
      });
    }
  }

  /**
   * Processa texto final: pipeline → TTS → Ouvindo.
   * @param {string} texto
   */
  async function processarTranscricao(texto) {
    const t = String(texto || "").trim();
    if (!t) return;
    if (state.estado() !== ESTADO_TURNO.OUVINDO) return;

    cancelarTurno = false;
    stt.parar();
    devices.fecharCaptura();

    const proc = state.transitar(ESTADO_TURNO.PROCESSANDO, {
      motivo: "transcricao_concluida"
    });
    if (!proc.ok) return;

    diagStt("10. Texto enviado ao Gate/Núcleo", t);
    onEvento({ tipo: "processamento_iniciado", detalhe: { texto: t } });

    try {
      const resposta = await deps.enviarTexto(t);
      diagStt("11. Resposta recebida do Gate/Núcleo", {
        ok: resposta?.ok,
        mensagem: String(resposta?.mensagem || "").slice(0, 120)
      });
      if (cancelarTurno) {
        state.transitar(ESTADO_TURNO.INTERROMPIDO, { motivo: "cancelado" });
        state.transitar(ESTADO_TURNO.IDLE, { motivo: "apos_interrupcao" });
        return;
      }

      const mensagem =
        (resposta && resposta.mensagem) ||
        "Sem resposta do Núcleo.";
      const textoVoz =
        (resposta &&
          resposta.dados &&
          (resposta.dados.textoVoz || resposta.mensagem)) ||
        mensagem;

      const resp = state.transitar(ESTADO_TURNO.RESPONDENDO, {
        motivo: "resposta_pronta"
      });
      if (!resp.ok) return;

      onEvento({ tipo: "resposta_pronta", detalhe: { ok: resposta?.ok } });

      const fala = await tts.speak(textoVoz);
      if (cancelarTurno) {
        tts.stop();
        state.transitar(ESTADO_TURNO.INTERROMPIDO, { motivo: "stop_fala" });
        state.transitar(ESTADO_TURNO.IDLE, { motivo: "apos_interrupcao" });
        return;
      }

      if (fala && fala.falou === false && fala.motivo === "erro-sintese") {
        state.transitar(ESTADO_TURNO.ERRO, {
          mensagemErro:
            fala.erro ||
            "A voz não reproduziu. O texto mantém-se no ecrã."
        });
        return;
      }

      await reiniciarEscutaSeAuto();
    } catch (err) {
      const msg = (err && err.message) || "Falha no processamento por voz.";
      diagStt("11. Erro ao falar com Gate/Núcleo", msg);
      onEvento({ tipo: "erro_voz", detalhe: { origem: "pipeline", motivo: msg } });
      state.transitar(ESTADO_TURNO.ERRO, { mensagemErro: msg });
    }
  }

  stt.configurar({
    onFinal: (texto) => {
      cicloActivo = processarTranscricao(texto).finally(() => {
        cicloActivo = null;
      });
    },
    onErro: (ev) => {
      const code = (ev && ev.error) || "";
      if (code === "aborted" || code === "no-speech") return;
      if (state.estado() !== ESTADO_TURNO.OUVINDO) return;
      stt.parar();
      devices.fecharCaptura();
      state.transitar(ESTADO_TURNO.ERRO, {
        mensagemErro:
          code === "not-allowed"
            ? "Permissão de microfone negada para reconhecimento."
            : `STT: ${code || "erro"}`
      });
    }
  });

  async function iniciarEscuta() {
    cancelarTurno = false;
    const actual = state.estado();
    if (
      actual === ESTADO_TURNO.PROCESSANDO ||
      actual === ESTADO_TURNO.RESPONDENDO
    ) {
      return { ok: false, erro: "turno em curso", ...snapUi() };
    }

    if (!stt.suportado()) {
      state.transitar(ESTADO_TURNO.ERRO, {
        mensagemErro:
          "Reconhecimento de voz indisponível. Use Chrome/Edge ou o teclado."
      });
      return { ok: false, erro: "stt-indisponivel", ...snapUi() };
    }

    // Chrome exige recognition.start() no mesmo turno síncrono do gesto do utilizador.
    // Qualquer await (permissions / getUserMedia) ANTES de start() quebra a captura:
    // UI fica em Ouvindo, mas sem onaudiostart/onresult → «CEO não ouviu».
    devices.fecharCaptura();
    try {
      tts.stop();
    } catch {
      /* ignore */
    }

    if (actual === ESTADO_TURNO.ERRO || actual === ESTADO_TURNO.INTERROMPIDO) {
      state.transitar(ESTADO_TURNO.IDLE, { motivo: "reset_pre_escuta" });
    }

    const t = state.transitar(ESTADO_TURNO.OUVINDO, {
      motivo: "iniciar_escuta"
    });
    if (!t.ok) return { ok: false, erro: t.erro, ...snapUi() };

    try {
      stt.iniciar();
      onEvento({
        tipo: "iniciar_escuta",
        detalhe: { syncStart: true, micVia: "delegado-stt" }
      });
    } catch (err) {
      state.transitar(ESTADO_TURNO.ERRO, {
        mensagemErro: (err && err.message) || "Falha ao iniciar STT."
      });
      return { ok: false, erro: "stt-start", ...snapUi() };
    }

    // Permissão só como diagnóstico em background (não bloqueia start)
    Promise.resolve(devices.garantirPermissaoMic())
      .then((perm) => {
        if (perm && perm.ok === false) {
          diagStt("mic permissão background", perm);
        }
      })
      .catch(() => {});

    return { ok: true, ...snapUi() };
  }

  function pararEscuta() {
    cancelarTurno = true;
    stt.parar();
    devices.fecharCaptura();
    const e = state.estado();
    if (e === ESTADO_TURNO.OUVINDO) {
      state.transitar(ESTADO_TURNO.INTERROMPIDO, { motivo: "parar_escuta" });
      state.transitar(ESTADO_TURNO.IDLE, { motivo: "apos_parar" });
    }
    onEvento({ tipo: "parar_escuta", detalhe: null });
    return snapUi();
  }

  function interromper() {
    cancelarTurno = true;
    stt.parar();
    tts.stop();
    devices.fecharCaptura();
    const e = state.estado();
    if (
      e === ESTADO_TURNO.OUVINDO ||
      e === ESTADO_TURNO.RESPONDENDO ||
      e === ESTADO_TURNO.PROCESSANDO
    ) {
      state.transitar(ESTADO_TURNO.INTERROMPIDO, {
        motivo: "interrupcao_utilizador"
      });
      state.transitar(ESTADO_TURNO.IDLE, { motivo: "apos_interrupcao" });
    }
    onEvento({ tipo: "interrupcao_utilizador", detalhe: { de: e } });
    return snapUi();
  }

  function recuperar() {
    cancelarTurno = false;
    stt.parar();
    devices.fecharCaptura();
    if (state.estado() === ESTADO_TURNO.ERRO) {
      state.transitar(ESTADO_TURNO.IDLE, { motivo: "recuperar_de_erro" });
    }
    onEvento({ tipo: "recuperar_de_erro", detalhe: null });
    return snapUi();
  }

  return {
    ESTADO_TURNO,
    snapshot: snapUi,
    estado: () => state.estado(),
    mensagemErro: () => state.mensagemErro(),
    onMudancaEstado: (fn) => state.onMudanca(fn),
    iniciarEscuta,
    pararEscuta,
    interromper,
    recuperar,
    /** @internal testes */
    _eventos: () => eventos.slice(),
    _processarTranscricao: processarTranscricao
  };
}
