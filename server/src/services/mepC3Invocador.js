/**
 * Invocador C3 interno (ARQ-034 / CAP-13).
 * Node-only: boot IMP-073 + proporEvolucaoDesidentificada.
 * Sem rota HTTP, sem POST, sem promoção, sem duplicar C3.
 */

import { proporEvolucaoDesidentificada } from '../../../app/src/mepCeo/c3.js';
import { reiniciarMepParaTestes } from '../../../app/src/mepCeo/registo.js';
import {
  garantirBootMep,
  resetEstadoBootMepParaTestes,
} from './mepC3Vista.js';

const CAMPOS_ACTO = Object.freeze([
  'papel',
  'tipoLacunaProduto',
  'objectoCandidato',
  'enunciadoDesidentificado',
  'evidenciaNaoPrivada',
]);

const CHAVES_TOPO = Object.freeze(['acto', 'confirmacao', 'dryRun']);

const OBJECTOS_OK = Object.freeze(['MCP', 'EPC', 'MDL']);

function recusa(motivo, extra = {}) {
  return Object.freeze({ ok: false, motivo, dryRun: extra.dryRun === true, ...extra });
}

function sanearSucesso(objecto, { dryRun }) {
  const payload = objecto && objecto.payload && typeof objecto.payload === 'object'
    ? objecto.payload
    : {};
  return Object.freeze({
    ok: true,
    dryRun: dryRun === true,
    id: String(objecto.id || ''),
    maturidade: 'CONCEBIDO',
    origemCanal: 'C3',
    tipoLacunaProduto: String(payload.tipoLacunaProduto || ''),
    enunciadoDesidentificado: String(
      payload.enunciadoDesidentificado || objecto.titulo || '',
    ),
  });
}

function validarTopo(entrada) {
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
    return recusa('entrada_invalida');
  }
  const extras = Object.keys(entrada).filter((k) => !CHAVES_TOPO.includes(k));
  if (extras.length) {
    return recusa('campos_nao_permitidos', { extra: extras });
  }
  return null;
}

function validarActoShape(acto) {
  if (!acto || typeof acto !== 'object' || Array.isArray(acto)) {
    return recusa('acto_invalido');
  }
  const extras = Object.keys(acto).filter((k) => !CAMPOS_ACTO.includes(k));
  if (extras.length) {
    return recusa('campos_nao_permitidos', { extra: extras });
  }
  for (const k of CAMPOS_ACTO) {
    if (!String(acto[k] ?? '').trim()) {
      return recusa(`campo_obrigatorio:${k}`);
    }
  }
  const objectoCandidato = String(acto.objectoCandidato).trim();
  if (!OBJECTOS_OK.includes(objectoCandidato)) {
    return recusa('objecto_candidato_invalido');
  }
  return null;
}

/**
 * Executa o acto C3 canónico contra o store da sede.
 *
 * @param {{ acto: object, confirmacao?: boolean, dryRun?: boolean }} entrada
 * @param {{ repoRoot: string }} opts — `CEO_DATA_ROOT` (produção: `/data`)
 * @returns {{ ok: boolean, motivo?: string, dryRun?: boolean, id?: string, maturidade?: string, origemCanal?: string, tipoLacunaProduto?: string, enunciadoDesidentificado?: string }}
 */
export function executarActoC3(entrada = {}, opts = {}) {
  const dryRun = entrada && entrada.dryRun === true;

  const topo = validarTopo(entrada);
  if (topo) return Object.freeze({ ...topo, dryRun });

  if (entrada.confirmacao !== true) {
    return recusa(
      entrada.confirmacao === undefined || entrada.confirmacao === null
        ? 'confirmacao_obrigatoria'
        : 'confirmacao_falsa',
      { dryRun },
    );
  }

  const shape = validarActoShape(entrada.acto);
  if (shape) return Object.freeze({ ...shape, dryRun });

  const repoRoot = opts && opts.repoRoot != null ? String(opts.repoRoot) : '';
  const boot = garantirBootMep(repoRoot);
  if (!boot.ok) {
    return recusa('boot_falhou', {
      dryRun,
      motivoBoot: boot.motivo || 'boot_recusado',
      dir: boot.dir,
    });
  }

  const acto = {
    papel: String(entrada.acto.papel).trim(),
    tipoLacunaProduto: String(entrada.acto.tipoLacunaProduto).trim(),
    objectoCandidato: String(entrada.acto.objectoCandidato).trim(),
    enunciadoDesidentificado: String(entrada.acto.enunciadoDesidentificado).trim(),
    evidenciaNaoPrivada: String(entrada.acto.evidenciaNaoPrivada).trim(),
  };

  if (dryRun) {
    // Valida via C3 canónico sem gravar no store da sede:
    // desliga persistência (reinício em memória) → acto → restaura boot do disco.
    reiniciarMepParaTestes();
    let resultado;
    try {
      resultado = proporEvolucaoDesidentificada(acto);
    } catch {
      resetEstadoBootMepParaTestes();
      garantirBootMep(repoRoot);
      return recusa('excecao_c3', { dryRun: true });
    }
    const sanado = resultado && resultado.ok === true
      ? sanearSucesso(resultado.objecto, { dryRun: true })
      : recusa(resultado?.motivo || 'recusa_c3', {
          dryRun: true,
          motivos: resultado?.motivos,
        });
    reiniciarMepParaTestes();
    resetEstadoBootMepParaTestes();
    garantirBootMep(repoRoot);
    return sanado;
  }

  let resultado;
  try {
    resultado = proporEvolucaoDesidentificada(acto);
  } catch {
    return recusa('excecao_c3', { dryRun: false });
  }

  if (!resultado || resultado.ok !== true) {
    return recusa(resultado?.motivo || 'recusa_c3', {
      dryRun: false,
      motivos: resultado?.motivos,
    });
  }

  const origem = resultado.objecto?.payload?.origemCanal;
  if (resultado.objecto?.maturidade !== 'CONCEBIDO' || origem !== 'C3') {
    return recusa('invariante_c3', { dryRun: false });
  }

  return sanearSucesso(resultado.objecto, { dryRun: false });
}

export const CAMPOS_ACTO_C3_INVOCADOR = CAMPOS_ACTO;
