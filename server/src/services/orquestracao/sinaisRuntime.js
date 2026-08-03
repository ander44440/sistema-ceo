/**
 * Sinais in-process (leitura) — IMP-055 E6.
 * Actualizados pelas rotas/núcleo; consumidos pelos coletores.
 */

/**
 * @returns {{
 *   inicioCicloCeo: () => void,
 *   fimCicloCeo: () => void,
 *   inicioConsultaCto: () => void,
 *   fimConsultaCto: (ultimoEstado?: string | null) => void,
 *   setSpeaker: (s: { falando?: boolean, erro?: boolean, ativo?: boolean }) => void,
 *   ler: () => object
 * }}
 */
export function criarSinaisRuntime() {
  let ciclosCeo = 0;
  let consultasCto = 0;
  /** @type {string | null} */
  let ultimoEstadoCto = null;
  /** @type {{ falando: boolean, erro: boolean, ativo: boolean }} */
  let speaker = { falando: false, erro: false, ativo: false };

  return {
    inicioCicloCeo() {
      ciclosCeo += 1;
    },
    fimCicloCeo() {
      ciclosCeo = Math.max(0, ciclosCeo - 1);
    },
    inicioConsultaCto() {
      consultasCto += 1;
    },
    fimConsultaCto(ultimoEstado = null) {
      consultasCto = Math.max(0, consultasCto - 1);
      if (ultimoEstado != null) ultimoEstadoCto = String(ultimoEstado);
    },
    setSpeaker(s = {}) {
      speaker = {
        falando: Boolean(s.falando),
        erro: Boolean(s.erro),
        ativo: Boolean(s.ativo)
      };
    },
    ler() {
      return {
        ceo: {
          emCiclo: ciclosCeo > 0,
          aguardandoUtilizador: false
        },
        cto: {
          emVoo: consultasCto > 0,
          ultimoEstado: ultimoEstadoCto
        },
        speaker: { ...speaker }
      };
    }
  };
}

/** Instância partilhada no processo Node (Vite plugin / server). */
export const sinaisRuntimeGlobal = criarSinaisRuntime();
