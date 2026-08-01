/**
 * Rotas LLM — paridade com app/server/ceoLlmPlugin.js (BP-001 E3).
 * GET  /api/ceo/llm-status
 * POST /api/ceo/deliberar
 */

import { chamarLlm, configDeEnv } from '../services/llm.js';
import { sinaisRuntimeGlobal } from '../services/orquestracao/sinaisRuntime.js';

export function registrarLlm(app, env = process.env) {
  app.get('/api/ceo/llm-status', (c) => {
    const cfg = configDeEnv(env);
    return c.json({
      ok: true,
      configurado: cfg.configurado,
      modelo: cfg.model,
      base: cfg.base.replace(/https?:\/\//, '').split('/')[0],
      tlsInseguro: cfg.tlsInseguro,
    });
  });

  app.post('/api/ceo/deliberar', async (c) => {
    const cfg = configDeEnv(env);
    if (!cfg.configurado) {
      return c.json(
        {
          ok: false,
          codigo: 'LLM_NAO_CONFIGURADO',
          mensagem:
            'Motor de linguagem não configurado. Defina CEO_LLM_API_KEY (ou OPENAI_API_KEY) em app/.env e reinicie o servidor.',
        },
        503,
      );
    }

    sinaisRuntimeGlobal.inicioCicloCeo();
    try {
      const body = await c.req.json().catch(() => null);
      if (!body || !Array.isArray(body.messages) || !body.messages.length) {
        return c.json(
          {
            ok: false,
            codigo: 'PEDIDO_INVALIDO',
            mensagem: 'messages[] é obrigatório.',
          },
          400,
        );
      }

      const resultado = await chamarLlm(cfg, body);
      if (!resultado.texto) {
        return c.json(
          {
            ok: false,
            codigo: 'RESPOSTA_VAZIA',
            mensagem: 'O modelo devolveu resposta vazia.',
          },
          502,
        );
      }

      return c.json({
        ok: true,
        texto: resultado.texto,
        modelo: resultado.modelo,
        uso: resultado.uso,
        origem: 'llm',
      });
    } catch (err) {
      const status = err.status && err.status < 600 ? err.status : 502;
      return c.json(
        {
          ok: false,
          codigo: 'LLM_FALHOU',
          mensagem:
            err && err.message ? err.message : 'Falha ao contactar o modelo.',
        },
        status,
      );
    } finally {
      sinaisRuntimeGlobal.fimCicloCeo();
    }
  });
}
