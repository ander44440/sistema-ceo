/**
 * Helper de teste — garante projectos com IDs fixos no catálogo (Abrir = sessão).
 * Usado por IMP-094 F4 e sim-mvp LFC.
 */
import {
  carregarDocumento,
  gravarDocumento
} from "../catalogoProjetos/persistencia.js";
import {
  inicializarCatalogo,
  recarregarCatalogo,
  selecionarProjeto,
  obterProjeto
} from "../catalogoProjetos/index.js";
import { definirContextoConversacional } from "../modules/conversa/store.js";

/**
 * @param {string} id
 * @param {string} nome
 */
export function garantirProjetoCatalogoId(id, nome) {
  inicializarCatalogo();
  if (obterProjeto(id)) return;
  const doc = carregarDocumento();
  if (!doc || !Array.isArray(doc.projetos)) {
    throw new Error("catálogo indisponível para garantirProjetoCatalogoId");
  }
  const empresaId =
    doc.empresaAtivaId ||
    (Array.isArray(doc.empresas) && doc.empresas[0] && doc.empresas[0].id) ||
    "emp-patrocinador";
  const agora = new Date().toISOString();
  doc.projetos.push({
    id,
    nome,
    descricao: `COA ensaio ${nome}`,
    estado: "ativo",
    empresaId,
    criadoEm: agora,
    ultimaAtividadeEm: agora,
    decisoes: [],
    pendencias: [],
    proximasAcoes: [],
    historicoResumido: [],
    proximoPassoSugerido: null,
    diaExecutivo: {
      status: "nao_iniciado",
      abertoEm: null,
      encerradoEm: null,
      intencaoDoDia: null,
      continuidade: []
    }
  });
  gravarDocumento(doc);
  recarregarCatalogo();
}

/**
 * @param {string} id
 * @param {string} [nome]
 */
export function abrirCoaParaTeste(id, nome = id) {
  garantirProjetoCatalogoId(id, nome);
  const sel = selecionarProjeto(id);
  if (!sel || String(sel.id) !== String(id)) {
    throw new Error(`falha Abrir COA teste: ${id}`);
  }
  definirContextoConversacional(id);
  return sel;
}
