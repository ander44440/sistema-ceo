/**
 * Orquestrador de Experiência de Voz (PX-002 E2).
 * Máquina de estados + preferência + unlock de sessão + fila pendente.
 * Não chama Voice Engine / UI / conversa — só política de estados.
 */

import { ESTADO_VOZ } from "./estados.js";
import { criarPreferenciaVoz } from "./preferencia.js";

/**
 * @param {object} [opts]
 * @param {ReturnType<typeof criarPreferenciaVoz>} [opts.preferencia]
 * @param {Storage} [opts.storage]
 */
export function criarOrquestradorVoz(opts = {}) {
  const preferencia = opts.preferencia || criarPreferenciaVoz(opts.storage);
  const pref0 = preferencia.ler();

  /** @type {string} */
  let estado = pref0.enabled ? ESTADO_VOZ.ATIVA : ESTADO_VOZ.DESATIVADA;
  /** Preferência persistida (Ativa ≠ unlocked). */
  let enabled = pref0.enabled;
  /** Unlock de sessão — nunca persistido. */
  let sessaoDesbloqueada = false;
  /** @type {string|null} */
  let textoPendente = null;
  /** @type {string|null} */
  let mensagemErro = null;
  /** Estado antes de Erro, para retry. */
  let estadoAntesErro = ESTADO_VOZ.DESATIVADA;

  function snapshot() {
    return {
      estado,
      enabled,
      sessaoDesbloqueada,
      textoPendente,
      mensagemErro,
      podeFalarAutomaticamente:
        enabled &&
        sessaoDesbloqueada &&
        (estado === ESTADO_VOZ.ATIVA || estado === ESTADO_VOZ.FALANDO)
    };
  }

  function falhou(msg) {
    return { ok: false, erro: msg, ...snapshot() };
  }

  function ok() {
    return { ok: true, ...snapshot() };
  }

  /** Gesto: pedir ativação (Desativada → Aguardando autorização). */
  function solicitarAtivacao() {
    if (estado === ESTADO_VOZ.AGUARDANDO_AUTORIZACAO) return ok();
    if (estado !== ESTADO_VOZ.DESATIVADA && estado !== ESTADO_VOZ.ERRO) {
      return falhou(`solicitarAtivacao inválido a partir de ${estado}`);
    }
    estado = ESTADO_VOZ.AGUARDANDO_AUTORIZACAO;
    mensagemErro = null;
    return ok();
  }

  /** Autorização OK (Aguardando → Ativa + persistir + unlock). */
  function confirmarAutorizacao() {
    if (estado !== ESTADO_VOZ.AGUARDANDO_AUTORIZACAO) {
      return falhou(`confirmarAutorizacao inválido a partir de ${estado}`);
    }
    enabled = true;
    preferencia.gravar(true);
    sessaoDesbloqueada = true;
    estado = ESTADO_VOZ.ATIVA;
    mensagemErro = null;
    return ok();
  }

  /** Cancelar autorização (Aguardando → Desativada). */
  function cancelarAutorizacao() {
    if (estado !== ESTADO_VOZ.AGUARDANDO_AUTORIZACAO) {
      return falhou(`cancelarAutorizacao inválido a partir de ${estado}`);
    }
    enabled = false;
    preferencia.gravar(false);
    sessaoDesbloqueada = false;
    textoPendente = null;
    estado = ESTADO_VOZ.DESATIVADA;
    mensagemErro = null;
    return ok();
  }

  /** Desativar voz (qualquer estado operacional → Desativada). */
  function desativar() {
    enabled = false;
    preferencia.gravar(false);
    sessaoDesbloqueada = false;
    textoPendente = null;
    mensagemErro = null;
    estado = ESTADO_VOZ.DESATIVADA;
    return ok();
  }

  /**
   * Gesto de sessão (Enviar / botão) com preferência já Ativa.
   * Não muda estado se Falando/Ouvindo — só garante unlock.
   */
  function desbloquearSessao() {
    if (!enabled) {
      return falhou("desbloquearSessao exige preferência ativa");
    }
    if (estado === ESTADO_VOZ.DESATIVADA) {
      return falhou("desbloquearSessao inválido em desativada");
    }
    if (estado === ESTADO_VOZ.AGUARDANDO_AUTORIZACAO) {
      return falhou("desbloquearSessao: confirme autorização primeiro");
    }
    if (estado === ESTADO_VOZ.ERRO) {
      estado = ESTADO_VOZ.ATIVA;
      mensagemErro = null;
    }
    sessaoDesbloqueada = true;
    return ok();
  }

  /** Ativa (+ unlocked) → Falando. */
  function iniciarFala() {
    if (!enabled) return falhou("iniciarFala exige preferência ativa");
    if (!sessaoDesbloqueada) {
      return falhou("iniciarFala exige sessão desbloqueada");
    }
    if (estado === ESTADO_VOZ.OUVINDO) {
      return falhou("iniciarFala inválido durante escuta");
    }
    if (
      estado !== ESTADO_VOZ.ATIVA &&
      estado !== ESTADO_VOZ.FALANDO &&
      estado !== ESTADO_VOZ.ERRO
    ) {
      return falhou(`iniciarFala inválido a partir de ${estado}`);
    }
    if (estado === ESTADO_VOZ.ERRO) {
      mensagemErro = null;
    }
    estado = ESTADO_VOZ.FALANDO;
    return ok();
  }

  /** Falando → Ativa (fim natural). */
  function terminarFala() {
    if (estado !== ESTADO_VOZ.FALANDO) {
      return falhou(`terminarFala inválido a partir de ${estado}`);
    }
    estado = ESTADO_VOZ.ATIVA;
    return ok();
  }

  /** Falando → Ativa (stop explícito); limpa pendente opcionalmente não. */
  function interromperFala() {
    if (estado !== ESTADO_VOZ.FALANDO) {
      return falhou(`interromperFala inválido a partir de ${estado}`);
    }
    estado = ESTADO_VOZ.ATIVA;
    return ok();
  }

  /** Ativa → Ouvindo (para fala se necessário). */
  function iniciarEscuta() {
    if (!enabled) return falhou("iniciarEscuta exige preferência ativa");
    if (estado === ESTADO_VOZ.FALANDO) {
      estado = ESTADO_VOZ.ATIVA;
    }
    if (estado !== ESTADO_VOZ.ATIVA && estado !== ESTADO_VOZ.ERRO) {
      return falhou(`iniciarEscuta inválido a partir de ${estado}`);
    }
    mensagemErro = null;
    estado = ESTADO_VOZ.OUVINDO;
    return ok();
  }

  function terminarEscuta() {
    if (estado !== ESTADO_VOZ.OUVINDO) {
      return falhou(`terminarEscuta inválido a partir de ${estado}`);
    }
    estado = ESTADO_VOZ.ATIVA;
    return ok();
  }

  /**
   * Regista falha. Guarda estado anterior para retry.
   * @param {string} [mensagem]
   */
  function marcarErro(mensagem) {
    if (estado !== ESTADO_VOZ.ERRO) {
      estadoAntesErro = estado;
    }
    estado = ESTADO_VOZ.ERRO;
    mensagemErro =
      mensagem ||
      "A voz falhou nesta resposta. O texto mantém-se no ecrã.";
    return ok();
  }

  /** Erro → Ativa (se preferência on) ou Desativada. */
  function tentarNovamente() {
    if (estado !== ESTADO_VOZ.ERRO) {
      return falhou(`tentarNovamente inválido a partir de ${estado}`);
    }
    mensagemErro = null;
    if (enabled) {
      estado = ESTADO_VOZ.ATIVA;
      sessaoDesbloqueada = true;
    } else {
      estado = ESTADO_VOZ.DESATIVADA;
      sessaoDesbloqueada = false;
    }
    return ok();
  }

  /**
   * Enfileira texto quando Ativa mas sessão locked (ou política externa).
   * @param {string} texto
   */
  function enfileirarPendente(texto) {
    const t = String(texto || "").trim();
    if (!t) return falhou("enfileirarPendente exige texto");
    if (!enabled) return falhou("enfileirarPendente exige preferência ativa");
    textoPendente = t;
    return ok();
  }

  /** Consome pendente no gesto “Ouvir” — desbloqueia e devolve texto. */
  function consumirPendente() {
    if (!textoPendente) return falhou("sem texto pendente");
    if (!enabled) return falhou("consumirPendente exige preferência ativa");
    const texto = textoPendente;
    textoPendente = null;
    sessaoDesbloqueada = true;
    if (estado === ESTADO_VOZ.ERRO) {
      mensagemErro = null;
      estado = ESTADO_VOZ.ATIVA;
    }
    return { ok: true, texto, ...snapshot() };
  }

  function limparPendente() {
    textoPendente = null;
    return ok();
  }

  return {
    ESTADO_VOZ,
    estado: () => estado,
    preferenciaAtiva: () => enabled,
    sessaoDesbloqueada: () => sessaoDesbloqueada,
    textoPendente: () => textoPendente,
    mensagemErro: () => mensagemErro,
    snapshot,
    solicitarAtivacao,
    confirmarAutorizacao,
    cancelarAutorizacao,
    desativar,
    desbloquearSessao,
    iniciarFala,
    terminarFala,
    interromperFala,
    iniciarEscuta,
    terminarEscuta,
    marcarErro,
    tentarNovamente,
    enfileirarPendente,
    consumirPendente,
    limparPendente,
    /** Atalho: Desativada → Aguardando → Ativa num único gesto de teste/API. */
    ativarComGesto() {
      const a = solicitarAtivacao();
      if (!a.ok) return a;
      return confirmarAutorizacao();
    }
  };
}

export { ESTADO_VOZ, CHAVE_PREFERENCIA_VOZ } from "./estados.js";
export { criarPreferenciaVoz } from "./preferencia.js";
