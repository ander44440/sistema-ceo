/**
 * Execução do Conector CTO — usa transporte LLM partilhado (REQ-054).
 */

import {
  validarPacoteConsultaCto,
  extrairJson,
  montarMensagensCto,
  montarResultadoDeParsed
} from "./dominio.js";

/**
 * @param {{
 *   configDeEnvCto: (env: object) => object,
 *   chamarLlm: (cfg: object, body: object) => Promise<{texto:string,modelo:string,uso?:object}>,
 *   env: object
 * }} deps
 */
export function criarExecutarConsultaCto(deps) {
  const { configDeEnvCto, chamarLlm, env } = deps;

  /**
   * @param {unknown} pacoteBruto
   * @returns {Promise<{ httpStatus: number, body: object }>}
   */
  return async function executarConsultaCto(pacoteBruto) {
    const criadoEm = new Date().toISOString();
    const t0 = Date.now();

    const v = validarPacoteConsultaCto(pacoteBruto);
    if (!v.ok) {
      return {
        httpStatus: 400,
        body: {
          consultaId:
            pacoteBruto &&
            typeof pacoteBruto === "object" &&
            /** @type {any} */ (pacoteBruto).consultaId
              ? /** @type {any} */ (pacoteBruto).consultaId
              : null,
          estado: "erro_schema",
          codigo: "PACOTE_INVALIDO",
          mensagem: v.mensagem,
          rastreio: {
            modelo: null,
            latenciaMs: Date.now() - t0,
            criadoEm
          }
        }
      };
    }

    const pacote = v.pacote;
    const cfg = configDeEnvCto(env || {});
    if (!cfg.configurado) {
      return {
        httpStatus: 503,
        body: {
          consultaId: pacote.consultaId,
          estado: "erro_transporte",
          codigo: "LLM_NAO_CONFIGURADO",
          mensagem:
            "Motor de linguagem não configurado. Defina CEO_LLM_API_KEY (ou OPENAI_API_KEY) no backend.",
          rastreio: {
            modelo: null,
            latenciaMs: Date.now() - t0,
            criadoEm
          }
        }
      };
    }

    async function umaChamada(correcaoSchema) {
      const messages = montarMensagensCto(pacote, { correcaoSchema });
      return chamarLlm(cfg, {
        messages,
        temperature: 0.2,
        max_tokens: 1200,
        model: cfg.model
      });
    }

    try {
      let llm = await umaChamada(false);
      let parsed = extrairJson(llm.texto);
      let montado = montarResultadoDeParsed(pacote, parsed, {
        modelo: llm.modelo,
        latenciaMs: Date.now() - t0,
        criadoEm
      });

      if (!montado.ok) {
        llm = await umaChamada(true);
        parsed = extrairJson(llm.texto);
        montado = montarResultadoDeParsed(pacote, parsed, {
          modelo: llm.modelo,
          latenciaMs: Date.now() - t0,
          criadoEm
        });
      }

      if (!montado.ok) {
        return { httpStatus: 422, body: montado.resultado };
      }
      return { httpStatus: 200, body: montado.resultado };
    } catch (err) {
      const msg = err && err.message ? err.message : "Falha ao contactar o modelo.";
      const isTimeout =
        /timeout|aborted|ETIMEDOUT|AbortError/i.test(msg) ||
        err?.codigoTransporte === "timeout";
      return {
        httpStatus: 502,
        body: {
          consultaId: pacote.consultaId,
          estado: isTimeout ? "timeout" : "erro_transporte",
          codigo: "LLM_FALHOU",
          mensagem: msg,
          rastreio: {
            modelo: cfg.model,
            latenciaMs: Date.now() - t0,
            criadoEm
          }
        }
      };
    }
  };
}
