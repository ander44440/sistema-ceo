/**
 * Rotas CTO Connector — paridade com app/server (REQ-054).
 * POST /api/ceo/cto/consultar
 */

import { chamarLlm, configDeEnvCto } from '../services/llm.js';
import { criarExecutarConsultaCto } from '../services/ctoConnector/index.js';

export function registrarCto(app, env = process.env) {
  const executarCto = criarExecutarConsultaCto({
    configDeEnvCto,
    chamarLlm,
    env,
  });

  app.post('/api/ceo/cto/consultar', async (c) => {
    try {
      const body = await c.req.json().catch(() => null);
      const out = await executarCto(body);
      return c.json(out.body, out.httpStatus);
    } catch (err) {
      return c.json(
        {
          estado: 'erro_transporte',
          codigo: 'CTO_INTERNO',
          mensagem: err?.message || 'Falha no Conector CTO.',
          rastreio: {
            modelo: null,
            latenciaMs: 0,
            criadoEm: new Date().toISOString(),
          },
        },
        500,
      );
    }
  });
}
