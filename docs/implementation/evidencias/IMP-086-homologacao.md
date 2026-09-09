# IMP-086 — Registo formal de homologação da entrega

> **Data:** 09/09/2026  
> **Acto:** Homologação da **implementação** do IMP-086 (Consulta de discussões e decisões registadas — V1)  
> **REQ:** [`REQ-086`](../../requirements/REQ-086-consulta-discussoes-e-decisoes-registadas.md) — **Homologado v1.0** (inalterado)  
> **ARQ:** [`ARQ-086`](../../architecture/ARQ-086-consulta-discussoes-e-decisoes-registadas.md) — **Homologada v1.0** (inalterada)  
> **IMP:** [`IMP-086`](../IMP-086-consulta-discussoes-e-decisoes-registadas.md) — **v1.0** · **IMPLEMENTADA** · **HOMOLOGADA**  
> **Capacidade:** CAP-05 — Memória Organizacional (consulta)

---

## Declaração

Fica homologada a **entrega de implementação** do IMP-086 V1, exclusivamente no recorte já especificado (consulta conversacional read-only de decisões Art. 8º e discussões via transcript).

| # | Facto |
|---|--------|
| 1 | REQ-086 v1.0 — **Homologado** (mantido) |
| 2 | ARQ-086 v1.0 — **Homologada** (mantida) |
| 3 | IMP-086 v1.0 — plano **Homologado**; implementação **executada** |
| 4 | Validação técnica da implementação — **APTO** (CA-086-1…9; I1–I10) |
| 5 | Testes `npm run test:consulta-registados` — **17/17 PASS** |
| 6 | Build `npm run build` (app/) — **OK** |
| 7 | Implementação — **APROVADA / HOMOLOGADA** |
| 8 | Histórico Físico, API HTTP dedicada, quarta memória e writers — **fora** (preservados) |
| 9 | Commit/push/deploy — **não** autorizados por este acto |

---

## Memória organizacional

| Campo | Valor |
|-------|--------|
| Quem | Usuário (homologação); Engenheiro (Cursor) formalizou o registo |
| Quando | 09/09/2026 |
| O quê | Homologação da implementação IMP-086 V1 |
| Por quê | Auditoria técnica APTO; 17/17 testes; build OK; conformidade REQ/ARQ/IMP |
| Baseado em quê | REQ-086 v1.0 · ARQ-086 v1.0 · IMP-086 v1.0 · evidência de testes/build · veredito APTO da validação técnica |
| Resultado | Entrega IMP-086 homologada; REQ/ARQ intactos em v1.0; sem commit neste acto |

---

## Cadeia

REQ-086 v1.0 → ARQ-086 v1.0 → IMP-086 v1.0 (plano) → implementação V1 → validação técnica APTO → **homologação da entrega** (este acto)

---

## Evidência resumida

| Item | Resultado |
|------|-----------|
| Módulo | `app/src/consultaRegistados/` |
| Hook Núcleo | `app/src/executiveEngine/index.js` (ramo pós-Gate/AD) |
| Suite | `test:consulta-registados` — 17/17 |
| Build | `vite build` — OK |
