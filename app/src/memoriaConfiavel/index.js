/**
 * Memória Confiável de Longo Prazo — Ledger MO Art. 8º (1ª fatia).
 * Eixo organização. Distinto de transcript, CAP-04/KNW e MEP/CAP-13.
 */

export {
  EIXO_ORGANIZACAO,
  VERSAO_DOCUMENTO,
  COA_SEM_CONTEXTO,
  ORIGENS_MO,
  TIPOS_MO,
  CHAVES_PAYLOAD_PROIBIDAS,
  calcularConteudoHash,
  documentoVazioMo,
  validarEntradaRegistroMo
} from "./dominio.js";

export {
  STORAGE_KEY_MO,
  ErroPersistenciaMo,
  carregarDocumentoMo,
  gravarDocumentoMo,
  limparDocumentoMo,
  mediumPersistenciaMo
} from "./persistenciaMo.js";

export {
  appendRegistroMo,
  listarRegistosMo,
  obterRegistoMo,
  consultarRegistosMo,
  hidratarMemoriaConfiavel,
  obterEstadoPersistenciaMo,
  reiniciarMemoriaConfiavelParaTestes,
  limparEstadoCorruptoMoParaTestes
} from "./ledgerMo.js";
