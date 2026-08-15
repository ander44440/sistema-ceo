/**
 * IMP-072 — Núcleo persistente da MEP-CEO (CAP-13).
 * Superfície pública. Não exporta C3. Não importa Motor/MRE/EIC/CAP-04/CAP-05.
 */

export {
  CAMPOS_DCP,
  EIXO_PRODUTO,
  MATURIDADES,
  PAPEIS,
  TIPOS_CATALOGO_EXIGE_USUARIO,
  TIPOS_CONTEUDO_ORGANIZACAO,
  TIPOS_EVIDENCIA,
  TIPOS_OBJECTO,
  TRABALHOS,
  TRANSICOES_CANONICAS,
  classificacaoDeMaturidade
} from "./dominio.js";

export { CHAVES_PAYLOAD_PROIBIDAS, avaliarIsolamento, recusarIsolamento } from "./isolamento.js";

export { alçadaSuficiente, saltoIlicito, transicaoCanonica } from "./transicoes.js";

export {
  apagarEvento,
  apagarObjecto,
  consultarObjecto,
  contagemEventos,
  criarNovaBaseline,
  criarObjecto,
  definirEstadoTrabalho,
  historico,
  inicializarPersistenciaFisica,
  listarObjectos,
  promoverMaturidade,
  proporMaturidade,
  reiniciarMepParaTestes
} from "./registo.js";

export {
  PATH_CANONICO,
  desactivarPersistenciaFisica,
  persistenciaActiva
} from "./persistencia.js";

export {
  apagarEventoFisico,
  apagarObjectoFisico,
  appendRegistoFisico,
  compactarStoreFisico,
  lerProjeccaoCache,
  validarEnvelope
} from "./adapterFs.js";
