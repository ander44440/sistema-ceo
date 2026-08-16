/**
 * GET interno — vista C3 só-leitura (ARQ-033 v1.2).
 * Não é API pública de produto. Sem POST / CRUD / acto C3.
 */

import {
  obterVistaPropostasC3,
  PATH_VISTA_C3,
} from '../services/mepC3Vista.js';

/**
 * @param {import('hono').Hono} app
 * @param {{ repoRoot: string }} opts
 */
export function registrarMepC3Vista(app, { repoRoot }) {
  app.get(PATH_VISTA_C3, (c) => {
    const propostas = obterVistaPropostasC3(repoRoot);
    return c.json(propostas);
  });
}
