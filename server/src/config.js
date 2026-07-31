/**
 * Configuração do Backend de Produção (BP-001).
 * Porta: process.env.PORT (Railway) ou 8787 em local.
 */

export function fromEnv(env = process.env) {
  const port = Number(env.PORT);
  return {
    port: Number.isFinite(port) && port > 0 ? port : 8787,
  };
}
