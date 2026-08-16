/**
 * Transporte interno da vista C3 (ARQ-033 v1.2).
 * Boot IMP-073 + listarPropostasC3 — só leitura; fail-closed → [].
 * Não altera C1/C2/C3; não expõe acto POST.
 */

import { join } from 'node:path';
import { listarPropostasC3 } from '../../../app/src/mepCeo/c3.js';
import {
  inicializarPersistenciaFisica,
  reiniciarMepParaTestes,
} from '../../../app/src/mepCeo/registo.js';

/** @type {null | { ok: boolean, dir: string, motivo?: string }} */
let estadoBoot = null;

export const PATH_VISTA_C3 = '/api/ceo/mep/c3/propostas';

/**
 * Sede canónica: `{CEO_DATA_ROOT|/data}/mep-ceo/store`.
 * @param {string} repoRoot — resultado de resolverRepoRoot (CEO_DATA_ROOT)
 */
export function resolverDirectorioStoreMep(repoRoot) {
  const root = String(repoRoot || '').trim();
  if (!root) return join('mep-ceo', 'store');
  return join(root, 'mep-ceo', 'store');
}

/** Só para testes do transporte — não usar em produção. */
export function resetEstadoBootMepParaTestes() {
  estadoBoot = null;
  reiniciarMepParaTestes();
}

/**
 * @param {string} repoRoot
 * @returns {{ ok: boolean, dir: string, motivo?: string }}
 */
export function garantirBootMep(repoRoot) {
  const dir = resolverDirectorioStoreMep(repoRoot);
  if (estadoBoot && estadoBoot.dir === dir) {
    return estadoBoot;
  }
  try {
    const r = inicializarPersistenciaFisica(dir);
    if (r && r.ok === true) {
      estadoBoot = { ok: true, dir };
    } else {
      estadoBoot = {
        ok: false,
        dir,
        motivo: (r && r.motivo) || 'boot_recusado',
      };
    }
  } catch {
    estadoBoot = { ok: false, dir, motivo: 'boot_excecao' };
  }
  return estadoBoot;
}

/**
 * Serializa só os 4 campos da vista (defesa em profundidade).
 * @param {unknown} item
 */
function sanearItemVista(item) {
  if (!item || typeof item !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (item);
  return {
    id: String(o.id || ''),
    tipoLacunaProduto: String(o.tipoLacunaProduto || ''),
    enunciadoDesidentificado: String(o.enunciadoDesidentificado || ''),
    maturidade: 'CONCEBIDO',
  };
}

/**
 * @param {string} repoRoot
 * @returns {Array<{ id: string, tipoLacunaProduto: string, enunciadoDesidentificado: string, maturidade: string }>}
 */
export function obterVistaPropostasC3(repoRoot) {
  const boot = garantirBootMep(repoRoot);
  if (!boot.ok) return [];
  try {
    const bruto = listarPropostasC3();
    if (!Array.isArray(bruto)) return [];
    return bruto.map(sanearItemVista).filter(Boolean);
  } catch {
    return [];
  }
}
