/**
 * README operacional — Conector CTO (REQ-054)
 *
 * Endpoint: POST /api/ceo/cto/consultar
 * Distinto de: POST /api/ceo/deliberar (MRE / CEO Digital)
 *
 * Credencial: a mesma do backend (CEO_LLM_API_KEY | OPENAI_API_KEY | CEO_OPENAI_API_KEY).
 * Opcional: CEO_CTO_MODEL (override de modelo, sem nova chave).
 *
 * Body: PacoteConsultaCto (ver REQ-054).
 * Resposta: ResultadoCto.
 *
 * No chat do CEO: «consultar cto: …» ou «parecer do cto sobre …»
 */
