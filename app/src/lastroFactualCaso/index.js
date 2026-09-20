/**
 * Lastro Factual do Caso — IMP-092.1 Writer + IMP-092.2 Reader + IMP-092.3 Wiring.
 */

export {
  SCHEMA_VERSAO_LFC,
  ESTADO_LASTRO,
  ESTADO_FACTO,
  ORIGEM_UTILIZADOR,
  TIPO_TRILHA_LFC_MUTACAO,
  gerarCasoId,
  gerarFactoId,
  normalizarTitulo,
  haContradiçãoSectorActiva,
  criarDocumentoLfc,
  criarFactoActivo
} from "./dominio.js";

export {
  REL_DIR_LFC,
  caminhoStoreLfc,
  caminhoCoa,
  caminhoDocumento
} from "./persistencia.js";

export { criarLfcStore, criarLfcStoreNoRepo } from "./store.js";

export { criarLfcWriter, WRITER_CANONICO_ID } from "./writer.js";

export { criarLfcReader, READER_CANONICO_ID } from "./reader.js";

export {
  construirEventoLfcMutacao,
  espelharLfcMutacaoNaTrilha
} from "./trilhaLfc.js";

export {
  processarTurnoLfc,
  tentarMutacaoContraditoriaSemCorrecao,
  MODOS_LFC
} from "./wiringConversacional.js";

export {
  obterLfcRuntime,
  criarLfcWriterHttp,
  criarLfcReaderHttp
} from "./runtimeLfc.js";
