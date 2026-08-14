/**
 * Contexto do Gate pendente — IMP-058 E3 / REQ-058 RF1 · RF4.
 * Store in-memory: Gate activo = pendente mais recente; localização automática
 * perante decisão reconhecida (E2) — sem o utilizador repetir o C3.
 * Sem Conversa, Motor, UI, Fila, Dispatcher ou I/O externo.
 */

import {
  criarGatePendente,
  validarGatePendente,
  seleccionarGatePendenteMaisRecente,
  continuidadeAplica
} from "./dominio.js";
import { reconhecerDecisao, reconhecerParaGate } from "./reconhecerDecisao.js";

/**
 * Registo de continuidade na sessão (vínculo mínimo para E4/Motor).
 * @typedef {object} RegistoContextoGate
 * @property {import("./dominio.js").GatePendente} gate
 * @property {object|null} parecerSnapshot — clone superficial; sem I/O
 * @property {string|null} solicitacaoResumo — lastro opcional (não exigido ao decidir)
 * @property {string} registadoEm — ISO-8601
 */

/**
 * Snapshot seguro (sem funções; JSON-clone).
 * @param {unknown} valor
 * @returns {object|null}
 */
function clonarSnapshot(valor) {
  if (valor == null) return null;
  if (typeof valor !== "object") return null;
  try {
    return /** @type {object} */ (JSON.parse(JSON.stringify(valor)));
  } catch {
    return null;
  }
}

/**
 * Cria store de contexto de Gate (uma sessão lógica).
 * @returns {StoreContextoGate}
 */
export function criarStoreContextoGate() {
  /** @type {Map<string, RegistoContextoGate>} */
  const registos = new Map();
  /** @type {Map<string, string>} parecerId → jobId (idempotência RF11) */
  const registroJobs = new Map();

  /**
   * @returns {RegistoContextoGate[]}
   */
  function listarRegistos() {
    return [...registos.values()];
  }

  /**
   * @returns {import("./dominio.js").GatePendente[]}
   */
  function listarGates() {
    return listarRegistos().map((r) => r.gate);
  }

  /**
   * Abre Gate pendente e regista contexto (parecerId / cicloId / snapshot).
   * O contexto **activo** passa a ser este se for o mais recente.
   *
   * @param {{
   *   parecerId: string,
   *   cicloId?: string|null,
   *   gateId?: string,
   *   abertoEm?: string,
   *   parecerSnapshot?: object|null,
   *   solicitacaoResumo?: string|null
   * }} input
   * @returns {RegistoContextoGate}
   */
  function abrirGate(input) {
    const gate = criarGatePendente({
      parecerId: input.parecerId,
      cicloId: input.cicloId,
      gateId: input.gateId,
      abertoEm: input.abertoEm
    });
    const registadoEm = gate.abertoEm;
    /** @type {RegistoContextoGate} */
    const registo = {
      gate,
      parecerSnapshot: clonarSnapshot(input.parecerSnapshot ?? null),
      solicitacaoResumo:
        typeof input.solicitacaoResumo === "string" &&
        input.solicitacaoResumo.trim()
          ? input.solicitacaoResumo.trim()
          : null,
      registadoEm
    };
    registos.set(gate.gateId, registo);
    return obterRegisto(gate.gateId) || registo;
  }

  /**
   * @param {string} gateId
   * @returns {RegistoContextoGate|null}
   */
  function obterRegisto(gateId) {
    return registos.get(gateId) ?? null;
  }

  /**
   * Gate pendente mais recente = contexto activo (RF4).
   * @returns {import("./dominio.js").GatePendente|null}
   */
  function obterGatePendenteMaisRecente() {
    return seleccionarGatePendenteMaisRecente(listarGates());
  }

  /**
   * Registo completo do contexto activo (Gate + snapshot).
   * @returns {RegistoContextoGate|null}
   */
  function obterContextoActivo() {
    const gate = obterGatePendenteMaisRecente();
    if (!gate) return null;
    return registos.get(gate.gateId) ?? null;
  }

  /**
   * @returns {boolean}
   */
  function temGatePendente() {
    return obterGatePendenteMaisRecente() != null;
  }

  /**
   * Actualiza o Gate dentro do registo existente.
   * @param {import("./dominio.js").GatePendente} gate
   */
  function _substituirGate(gate) {
    const actual = registos.get(gate.gateId);
    if (!actual) {
      throw new Error(`Registo em falta para gateId=${gate.gateId}`);
    }
    registos.set(gate.gateId, { ...actual, gate });
  }

  /**
   * Localiza automaticamente o Gate activo perante texto de decisão (E2).
   * Não exige repetir a solicitação original.
   *
   * @param {unknown} texto
   * @returns {{
   *   reconhecimento: ReturnType<typeof reconhecerDecisao>,
   *   gate: import("./dominio.js").GatePendente|null,
   *   registo: RegistoContextoGate|null,
   *   localizado: boolean,
   *   mensagem?: string
   * }}
   */
  function localizarParaDecisao(texto) {
    const registoActivo = obterContextoActivo();
    const reconhecimento = reconhecerDecisao(texto, {
      gatePendente: Boolean(registoActivo)
    });
    if (!reconhecimento.reconhecida) {
      return {
        reconhecimento,
        gate: null,
        registo: null,
        localizado: false,
        mensagem: "Enunciado fora do léxico de decisão V1."
      };
    }
    const registo = registoActivo;
    if (!registo) {
      return {
        reconhecimento,
        gate: null,
        registo: null,
        localizado: false,
        mensagem: "Continuidade não aplica: nenhum Gate pendente."
      };
    }
    return {
      reconhecimento,
      gate: registo.gate,
      registo,
      localizado: true
    };
  }

  /**
   * Marca Gate como resolvido (`aprovado` / `rejeitado`) — deixa de ser activo.
   * @param {import("./dominio.js").GatePendente} gate
   * @returns {RegistoContextoGate}
   */
  function marcarResolvido(gate) {
    const v = validarGatePendente(gate);
    if (!v.ok) throw new Error(v.mensagem);
    if (continuidadeAplica(v.gate.estado)) {
      throw new Error(
        "marcarResolvido exige estado resolvido_aprovado ou resolvido_rejeitado."
      );
    }
    if (
      v.gate.estado !== "resolvido_aprovado" &&
      v.gate.estado !== "resolvido_rejeitado"
    ) {
      throw new Error(`Estado não resolvido: ${v.gate.estado}`);
    }
    _substituirGate(v.gate);
    return /** @type {RegistoContextoGate} */ (obterRegisto(v.gate.gateId));
  }

  /**
   * Após `adiado`: actualiza registo e mantém como pendente recuperável.
   * @param {import("./dominio.js").GatePendente} gate
   * @returns {RegistoContextoGate}
   */
  function manterPendenteAposAdiamento(gate) {
    const v = validarGatePendente(gate);
    if (!v.ok) throw new Error(v.mensagem);
    if (v.gate.estado !== "pendente") {
      throw new Error(
        "manterPendenteAposAdiamento exige Gate ainda pendente."
      );
    }
    _substituirGate(v.gate);
    return /** @type {RegistoContextoGate} */ (obterRegisto(v.gate.gateId));
  }

  /**
   * Consome decisão reconhecida no Gate activo (localização automática).
   * Preserva snapshot / resumo — utilizador não repete o C3.
   *
   * @param {unknown} texto
   * @param {{ agora?: string }} [opts]
   * @returns {{
   *   ok: boolean,
   *   localizado: boolean,
   *   reconhecimento: ReturnType<typeof reconhecerDecisao>,
   *   gate: import("./dominio.js").GatePendente|null,
   *   registo: RegistoContextoGate|null,
   *   podeCriarJob?: boolean,
   *   permanecePendente?: boolean,
   *   mensagem?: string
   * }}
   */
  function consumirDecisao(texto, opts = {}) {
    const loc = localizarParaDecisao(texto);
    if (!loc.localizado || !loc.gate) {
      return {
        ok: false,
        localizado: false,
        reconhecimento: loc.reconhecimento,
        gate: null,
        registo: null,
        mensagem: loc.mensagem
      };
    }

    const prep = reconhecerParaGate(texto, loc.gate, {
      aplicar: true,
      agora: opts.agora
    });

    if (!prep.aplicavel || !prep.aplicacao || !prep.aplicacao.ok) {
      return {
        ok: false,
        localizado: true,
        reconhecimento: loc.reconhecimento,
        gate: loc.gate,
        registo: loc.registo,
        mensagem: prep.mensagem || "Falha ao aplicar decisão ao Gate."
      };
    }

    const gateSeguinte = prep.aplicacao.gate;
    if (prep.aplicacao.permanecePendente) {
      manterPendenteAposAdiamento(gateSeguinte);
    } else {
      marcarResolvido(gateSeguinte);
    }

    const registo = obterRegisto(gateSeguinte.gateId);
    return {
      ok: true,
      localizado: true,
      reconhecimento: loc.reconhecimento,
      gate: gateSeguinte,
      registo,
      podeCriarJob: prep.aplicacao.podeCriarJob,
      permanecePendente: prep.aplicacao.permanecePendente
    };
  }

  /**
   * Remove registos já resolvidos (não pendentes). Seguro — não toca pendentes.
   * @returns {number} removidos
   */
  function limparResolvidos() {
    let n = 0;
    for (const [id, r] of [...registos.entries()]) {
      if (r.gate.estado !== "pendente") {
        registos.delete(id);
        n += 1;
      }
    }
    return n;
  }

  /**
   * Limpa toda a sessão de contexto.
   */
  function limparTudo() {
    registos.clear();
    registroJobs.clear();
  }

  return {
    abrirGate,
    obterRegisto,
    listarRegistos,
    listarGates,
    obterGatePendenteMaisRecente,
    obterContextoActivo,
    temGatePendente,
    localizarParaDecisao,
    consumirDecisao,
    marcarResolvido,
    manterPendenteAposAdiamento,
    limparResolvidos,
    limparTudo,
    /** @type {Map<string, string>} */
    registroJobs,
    registarJobPublicado(parecerId, jobId) {
      if (typeof parecerId === "string" && parecerId && typeof jobId === "string" && jobId) {
        registroJobs.set(parecerId, jobId);
      }
    },
    obterJobDoParecer(parecerId) {
      return typeof parecerId === "string" ? registroJobs.get(parecerId) : undefined;
    }
  };
}

/**
 * @typedef {ReturnType<typeof criarStoreContextoGate>} StoreContextoGate
 */
