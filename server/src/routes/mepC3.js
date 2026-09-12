/**
 * Vista C3 só-leitura — GET /api/ceo/mep/c3/propostas
 * Fail-closed: [] se MEP indisponível ou sem lastro (ARQ-034).
 */

export function registrarMepC3(app) {
  app.get('/api/ceo/mep/c3/propostas', async (c) => {
    try {
      const { listarPropostasC3 } = await import('../../../app/src/mepCeo/c3.js');
      const propostas = listarPropostasC3();
      return c.json(Array.isArray(propostas) ? propostas : []);
    } catch {
      return c.json([]);
    }
  });
}
