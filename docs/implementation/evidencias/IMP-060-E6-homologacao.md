# IMP-060 E6 — Homologação final da Fila Oficial do MVP

> **Etapa:** E6 — AUTORIZADA / executada  
> **Data:** 01/08/2026  
> **Norma:** ARQ-021; REQ-060 CA1–CA10; IMP-060 § E6  
> **Natureza:** testes e evidência — sem nova arquitectura nem novos requisitos.

---

## Recomendação

# HOMOLOGAR

A restauração do invariante `CEO → executive/queue (PC) → Dispatcher → Agent` está demonstrada nas etapas E2–E5 e nos cenários T1–T8.  
Pendências abaixo são **operacionais / deploy**, não bloqueiam a conformidade REQ-060 do MVP local.

---

## Matriz T1–T8 (mandato do despacho)

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| **T1** | Criar Job pelo CEO | **PASS** | `JOB-000030.json` (e ciclos seguintes) em `executive/queue/` com `pending` via Gate→Aprovado |
| **T2** | Dispatcher detecta + heartbeat + inicia ciclo | **PASS** | `listarPendentes` + `npm run dry-run` vê o Job; `heartbeat.json` actualizado (`origem: watcher`) |
| **T3** | Agent Ocioso→Aguardando→Executando→Ocioso | **PASS** | Coletor `fila_oficial` com ciclo pending→running→completed |
| **T4** | Painel só fila oficial | **PASS** | Snapshot URL `/api/ceo/orquestracao/snapshot` (sem Railway); Agent `origemSinal=fila_oficial` |
| **T5** | Consciência (Jobs / pendência / execução) | **PASS** | F1/F2 via `listarJobsPorEstado`; consulta C2 `consultado=true`; sem `railway.app` |
| **T6** | Continuidade Gate | **PASS** | «Aprovado.» → Job + handoff; prosa sem «Falta publicador» |
| **T7** | Regressão Motor/Gate/Classificador/Continuidade/Dispatcher/Painel/Consciência | **PASS** | Suites verdes (ver § Regressão) |
| **T8** | Ciclo completo local | **PASS** | `JOB-000031`: Usuário→Motor/Gate→fila→Dispatcher vê→running→completed |

Script: `app/scripts/smoke-e6-homologacao.mjs` → **7/7 PASS** (T1–T6+T8).

---

## Regressão T7 (comandos)

| Área | Comando / suite | Resultado |
|------|-----------------|-----------|
| Motor | `npm run test:motor` | **38/38 PASS** |
| Classificador | `npm run test:classificador:e6` | **PASS** |
| Continuidade/Gate | `npm run test:continuidade-gate` | **PASS** |
| Painel | `npm run test:orquestracao` | **50/50 PASS** |
| Consciência + Fila E2/E4 | testes IMP-060 | **PASS** |
| Dispatcher | `executive/dispatcher` `npm test` | **6/6 PASS** |
| Server E4 queue + orquestração | `queue.e4` + `orquestracao.test` | **5/5 PASS** |
| Build | `npm run build` | **OK** |

---

## Cobertura REQ-060 (síntese)

| CA / NA | Estado |
|---------|--------|
| CA1–CA4 (fila oficial, Dispatcher, ciclo estados) | **PASS** (T1–T3, T8) |
| CA5 (sem handoff falso) | **PASS** (E2 inject + T6) |
| CA6–CA7 (Railway ≠ fila; BP-001 LLM/health) | **PASS** código E4; health prod 200; queue prod 410 **após deploy** |
| CA8 (sem redesign Motor/Gate/Classificador/Consciência) | **PASS** (T7) |
| CA9 (Painel/Consciência fila oficial) | **PASS** (T4–T5 / E5) |
| CA10 (documentação) | **PASS** (ARQ-021, REQ-060, IMP-060 E1–E6) |
| NA1–NA5 | **PASS** (sem fila Railway como verdade; sem V3 cloud) |

---

## Pendências (não bloqueantes para HOMOLOGAR MVP local)

| # | Pendência | Severidade | Nota |
|---|-----------|------------|------|
| P1 | Deploy `server/` para Railway devolver **410** em `/api/ceo/queue/*` | Operacional | **Resolvido em produção** 02/08/2026 — ver `IMP-060-homologacao-producao.md` |
| P2 | Heartbeat remoto no smoke E6 sem `CEO_API_BASE` no process env → `remoto=false` | Baixa | Dispatcher com `.env` correcto envia POST; ficheiro local OK para Painel Vite |
| P3 | `Agent.prompt` (SDK) em `npm start` pode terminar `status=error` | Operacional Cursor | Ciclo de fila/Dispatcher homologado; conclusão real do Agent depende do SDK/rede |
| P4 | SPA Vercel sem companion: Painel degrada (E5-CA3) | Esperado | MVP diário = Vite local ou `VITE_CEO_QUEUE_API_BASE` |

Nenhum defeito **crítico** de conformidade da fila oficial exigiu correcção de código nesta E6.

---

## Artefactos E1–E5 (rastreio)

| Etapa | Evidência |
|-------|-----------|
| E1 | `IMP-060-E1-inventario.md` |
| E2 | `IMP-060-E2-relatorio.md` |
| E3 | `IMP-060-E3-relatorio.md` |
| E4 | `IMP-060-E4-relatorio.md` |
| E5 | `IMP-060-E5-relatorio.md` |
| E6 | este documento |

---

## Decisão do patrocinador

1. ~~Homologar a implementação IMP-060 (E1–E6).~~ **Homologada** (02/08/2026).  
2. ~~Autorizar commit / push / deploy Railway (P1) e Vercel.~~ **Autorizado** (02/08/2026).  
3. Operação: manter `npm start` no Dispatcher com `CEO_API_BASE` para o cartão do Painel remoto.
