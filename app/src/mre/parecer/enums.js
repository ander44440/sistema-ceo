/**
 * Enums fechados do ParecerExecutivo (REQ-048).
 * Estados / valores fora destas listas são inválidos.
 */

export const VERSAO_CONTRATO = "1.0";

export const NaturezaInteracao = Object.freeze([
  "estrategica",
  "tatica",
  "operacional"
]);

export const TipoPedido = Object.freeze([
  "informacao",
  "decisao",
  "execucao",
  "ambiguo"
]);

export const Urgencia = Object.freeze(["baixa", "media", "alta", "critica"]);

export const FonteFacto = Object.freeze([
  "painel",
  "memoria",
  "briefing",
  "utilizador",
  "precedente",
  "outro"
]);

export const NivelRisco = Object.freeze(["baixo", "medio", "alto", "critico"]);

export const ValorOportunidade = Object.freeze(["baixo", "medio", "alto"]);

export const EstadoDecisaoExecutiva = Object.freeze([
  "aprovar",
  "rejeitar",
  "delegar",
  "monitorar",
  "solicitar_dados",
  "adiar"
]);

export const TipoAcaoOperacional = Object.freeze([
  "orientar",
  "registar",
  "perguntar",
  "despachar",
  "aguardar"
]);

export const PrioridadeJob = Object.freeze(["baixa", "normal", "alta"]);
