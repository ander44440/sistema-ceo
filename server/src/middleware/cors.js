/**
 * CORS — BP-001 E10.
 * CEO_ALLOWED_ORIGIN definida → só essa origem.
 * Ausente → apenas localhost / 127.0.0.1 (dev seguro; sem *).
 */

import { cors } from 'hono/cors';

/**
 * @param {string | undefined} allowedEnv — valor de CEO_ALLOWED_ORIGIN
 * @param {string} requestOrigin — header Origin
 * @returns {string | null} origem a espelhar em ACAO, ou null
 */
export function resolverOrigemCors(allowedEnv, requestOrigin) {
  const origin = String(requestOrigin || '').trim();
  if (!origin) return null;

  const configured = String(allowedEnv || '')
    .trim()
    .replace(/\/$/, '');

  if (configured) {
    return origin === configured ? origin : null;
  }

  // Dev: só loopback
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      return origin;
    }
  } catch {
    return null;
  }
  return null;
}

export function registrarCors(app, env = process.env) {
  app.use(
    '*',
    cors({
      origin: (origin) =>
        resolverOrigemCors(env.CEO_ALLOWED_ORIGIN, origin) || '',
      allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
      maxAge: 86400,
    }),
  );
}
