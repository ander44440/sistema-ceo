/**
 * Ponte Orquestrador ↔ Voice Engine (PX-002 E4).
 * Decide se a resposta do CEO é falada; nunca altera texto/MRE/prompts.
 */

import { VoiceFactory } from "../onboarding/voice/VoiceFactory.js";
import { ESTADO_VOZ } from "./estados.js";
import { tentarAutorizacaoBrowser } from "./autorizacaoBrowser.js";
import { obterOrquestradorVozSessao } from "./sessao.js";

/** @type {ReturnType<typeof VoiceFactory.create> | null} */
let motor = null;

/** @type {Set<(snap: object) => void>} */
const ouvintes = new Set();

function motorVoz() {
  if (!motor) motor = VoiceFactory.create();
  return motor;
}

/**
 * @param {(snap: object) => void} fn
 * @returns {() => void}
 */
export function onMudancaEstadoVoz(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

function notificar(orch = obterOrquestradorVozSessao()) {
  const snap = orch.snapshot();
  for (const fn of ouvintes) {
    try {
      fn(snap);
    } catch {
      /* UI opcional */
    }
  }
}

/** Para testes: injeta motor / limpa. */
export function _definirMotorVozParaTestes(m) {
  motor = m;
}

export function _resetMotorVozParaTestes() {
  motor = null;
}

/**
 * Para o TTS e, se estiver Falando, volta a Ativa.
 * @param {ReturnType<typeof obterOrquestradorVozSessao>} [orch]
 */
export function interromperFalaCeo(orch = obterOrquestradorVozSessao()) {
  try {
    motorVoz().stop();
  } catch {
    /* ignore */
  }
  if (orch.estado() === ESTADO_VOZ.FALANDO) {
    orch.interromperFala();
  }
  notificar(orch);
  return orch.snapshot();
}

/**
 * Gesto síncrono de envio (Enter / Enviar): unlock + warm-up se preferência Ativa.
 * Deve correr **antes** do await da deliberação.
 * @param {ReturnType<typeof obterOrquestradorVozSessao>} [orch]
 * @param {{ autorizarBrowser?: () => { ok: boolean, motivo?: string } }} [deps]
 */
export function prepararGestoEnvio(
  orch = obterOrquestradorVozSessao(),
  deps = {}
) {
  const autorizar = deps.autorizarBrowser || tentarAutorizacaoBrowser;

  if (orch.estado() === ESTADO_VOZ.FALANDO) {
    interromperFalaCeo(orch);
  } else {
    try {
      motorVoz().stop();
    } catch {
      /* ignore */
    }
  }

  if (orch.preferenciaAtiva()) {
    const auth = autorizar();
    if (!auth.ok) {
      orch.marcarErro(
        auth.motivo ||
          "O browser bloqueou a fala. Toque no botão de voz para autorizar."
      );
      notificar(orch);
      return orch.snapshot();
    }
    orch.desbloquearSessao();
  }

  notificar(orch);
  return orch.snapshot();
}

/**
 * Após resposta do CEO: fala só se Ativa + sessão unlocked.
 * @param {string} texto
 * @param {{ orquestrador?: ReturnType<typeof obterOrquestradorVozSessao>, motor?: { speak: Function, stop: Function } }} [opts]
 */
export async function reproduzirRespostaCeo(texto, opts = {}) {
  const orch = opts.orquestrador || obterOrquestradorVozSessao();
  const voz = opts.motor || motorVoz();
  const t = String(texto || "").trim();

  if (!t || t === "…") {
    return { falou: false, motivo: "sem-texto" };
  }

  const snap = orch.snapshot();

  if (!snap.enabled || snap.estado === ESTADO_VOZ.DESATIVADA) {
    return { falou: false, motivo: "desativada" };
  }

  if (snap.estado === ESTADO_VOZ.AGUARDANDO_AUTORIZACAO) {
    return { falou: false, motivo: "aguardando" };
  }

  if (snap.estado === ESTADO_VOZ.ERRO) {
    return { falou: false, motivo: "erro", erro: snap.mensagemErro };
  }

  if (!snap.sessaoDesbloqueada) {
    orch.enfileirarPendente(t);
    notificar(orch);
    return { falou: false, motivo: "pendente", enfileirado: true };
  }

  const inicio = orch.iniciarFala();
  if (!inicio.ok) {
    orch.marcarErro(inicio.erro || "Não foi possível iniciar a fala.");
    console.warn("[experienciaVoz] iniciarFala:", inicio.erro);
    notificar(orch);
    return { falou: false, motivo: "iniciar", erro: inicio.erro };
  }
  notificar(orch);

  try {
    await voz.speak(t);
    if (orch.estado() === ESTADO_VOZ.FALANDO) {
      orch.terminarFala();
    }
    notificar(orch);
    return { falou: true };
  } catch (err) {
    const msg =
      (err && err.message) ||
      "A voz falhou nesta resposta. O texto mantém-se no ecrã.";
    try {
      voz.stop();
    } catch {
      /* ignore */
    }
    orch.marcarErro(msg);
    console.warn("[experienciaVoz] síntese:", msg, err);
    notificar(orch);
    return { falou: false, motivo: "erro-sintese", erro: msg };
  }
}

/**
 * Consome texto pendente e fala no gesto do botão “Ouvir”.
 * @param {ReturnType<typeof obterOrquestradorVozSessao>} [orch]
 * @param {{ motor?: { speak: Function, stop: Function } }} [opts]
 */
export async function ouvirPendenteCeo(
  orch = obterOrquestradorVozSessao(),
  opts = {}
) {
  const consumo = orch.consumirPendente();
  if (!consumo.ok) {
    return { falou: false, motivo: "sem-pendente", erro: consumo.erro };
  }
  return reproduzirRespostaCeo(consumo.texto, {
    orquestrador: orch,
    motor: opts.motor
  });
}
