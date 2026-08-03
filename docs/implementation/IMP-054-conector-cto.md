# IMP-054 — Conector CTO (REQ-054)

> **Status: Homologada — frente encerrada** (01/08/2026).  
> Norma: **REQ-054** (homologada); **ARQ-015 v0.2** (homologada).  
> **Gate técnico:** aprovado pelo patrocinador. Commit/push/deploy autorizados.

## Objetivo

Materializar o CTO Connector: Orquestrador → `POST /api/ceo/cto/consultar` → transporte HTTP partilhado (Opção B) → `ResultadoCto` validado — sem fundir com MRE.

## Plano executado

| # | Entrega | Estado |
|---|---------|--------|
| 1 | Extrair `app/server/llmTransport.js` (`configDeEnv` + `chamarLlm`) e reusar no plugin Vite | Feito |
| 2 | Módulo domínio CTO (validação, policy, schemas, retry schema) | Feito |
| 3 | Rota `POST /api/ceo/cto/consultar` (Vite + `server`) | Feito |
| 4 | Cliente browser + capacidade `consultar_cto` + `executiveEngine.consultarCto()` | Feito |
| 5 | Testes automatizados | Feito — `npm run test:cto` → **11 pass** |
| 6 | Documentação operacional | Feito |

## Budget (V-E3)

| Campo | Limite |
|-------|--------|
| `pergunta` | 4 000 caracteres |
| `contextoExecutivo` (JSON) | 12 000 caracteres |
| `artefactosRef` | máx. 30 entradas |

## Paridade Vite / Railway

* Vite: `app/server/ceoLlmPlugin.js` + `app/server/ctoConnector/` + `llmTransport.js`.  
* Produção: `server/src/routes/cto.js` + `server/src/services/ctoConnector/` reusando `server/src/services/llm.js` (padrão BP-001; root Railway = `server/`).  
* Domínio CTO em paridade de conteúdo entre `app/server/ctoConnector` e `server/src/services/ctoConnector`.

## Relatório CA → evidência (homologação técnica)

| CA | Evidência |
|----|-----------|
| CA1 | Rota `POST /api/ceo/cto/consultar` ≠ `/api/ceo/deliberar` |
| CA2 | Capacidade + `executiveEngine.consultarCto`; testes de montagem `ok` com mock LLM |
| CA3 | Teste «pacote inválido não chama LLM» |
| CA4 | Teste retry + `erro_schema` |
| CA5 | Cliente só chama `/api/ceo/cto/consultar` |
| CA6 | Plugin importa `chamarLlm`/`configDeEnv` de `llmTransport.js`; server CTO usa `services/llm.js` |
| CA7 | `validarCorpoSchema` rejeita `patch`/diff/commit; POLICY_CTO |
| CA8 | `app/server/ctoConnector/README.md` + esta IMP + `server/README.md` |
| CA9 | Capacidade com `efeitosAplicados: []`; sem publicação de Jobs |

| NA | Evidência |
|----|-----------|
| NA1 | Classificador `consultar_cto` ≠ `ia`; sem chamada MRE |
| NA2 | Sem `publicarJobFila` no conector |
| NA3 | Sem `CEO_CTO_API_KEY` |
| NA4 | Canal isolado; falhas tipadas em `ResultadoCto` |

## Como validar manualmente (após Gate + commit)

```text
consultar cto: devemos manter a Opção B da ARQ-015?
```

## Pedido

~~Homologação técnica da IMP-054. **Sem commit/push/deploy até aprovação explícita.**~~

**Gate técnico homologado** (01/08/2026). Frente encerrada após commit + push + deploy + evidência em produção.
