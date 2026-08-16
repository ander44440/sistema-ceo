# VAL-078 — Validação do invocador C3 interno (IMP-076)

> **Status:** **HOMOLOGADA** — 16/08/2026 (CTO + Usuário — despacho de publicação). **12/12 PASS · 0 FAIL.**  
> **Tipo:** VAL (ADR-006 / ADR-014). **Identificação:** VAL-078 (VAL da IMP-076 — invocador C3).  
> **Capacidade:** CAP-13 — Memória de Evolução do Produto (CAP-E; ADR-020).  
> **Norma:** VIS-009 v1.1 · REQ-085 v1.1 · ARQ-033 v1.1/v1.2 · [`ARQ-034` proposta](../architecture/ARQ-034-invocador-c3-producao-proposta.md) (Opção A) · [`IMP-076`](../implementation/IMP-076-invocador-c3-interno.md).  
> **Antecedentes:** VAL-075/076 (C3/UI); VAL-077 (transporte GET). Esta VAL **não** reabre transporte nem domínio C3; valida o **invocador Node**.  
> **Fora:** deploy; execução em produção; lastro real no volume `/data`.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que `executarActoC3` é seguro, fail-closed, Node-only, sem HTTP de escrita, e não altera C1/C2/C3/IMP-073/GET/UI. |
| **Por que existe?** | Despacho: publicar IMP do invocador só após VAL PASS. |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Critérios 1–12 PASS; 0 FAIL. |

---

## 1. Escopo validado

```
Node (ceo-api lab)
  → executarActoC3({ acto, confirmacao, dryRun }, { repoRoot })
  → garantirBootMep → proporEvolucaoDesidentificada
GET /api/ceo/mep/c3/propostas  (regressão só-leitura)
```

**Fora:** Railway produção; `railway run` do acto; formulário; POST; UI.

---

## 2. Evidências executadas (16/08/2026)

Worktree: `E:\anderson\CEO-cap13-c3`.

| ID | Evidência | Resultado |
|----|-----------|-----------|
| **E1** | `cd server && npm run test:mep-c3-invocador` | **10/10 pass** — critérios 1–9 + GET pós-invocador |
| **E2** | `cd server && npm run test:mep-c3-vista` | **9/9 pass** — GET intacto; POST 404/405 |
| **E3** | `cd app && npm run test:mep-ceo` | **20/20 pass** |
| **E4** | `cd app && npm run test:mep-ceo-persistencia` | **15/15 pass** |
| **E5** | `cd app && npm run test:mep-ceo-c3` | **9/9 pass** |
| **E6** | `cd app && npx vite build` | **OK** |
| **E7** | Inspecção `app.js` / routes | Só `registrarMepC3Vista` (GET); **zero** rota do invocador; **zero** POST C3 |
| **E8** | Inspecção `mepC3Invocador.js` | Chama só `proporEvolucaoDesidentificada`; reusa `garantirBootMep`; resultado sanitizado |
| **E9** | `git diff` núcleo | Sem alterações a `c3.js`, `registo.js`, `adapterFs.js`, `persistencia.js`, `isolamento.js`, Centro, `mepC3Vista.js` (contrato) |

**Não executado:** invocador contra `/data` de produção; deploy.

---

## 3. Matriz dos critérios

| # | Critério | Veredicto | Evidência |
|---|----------|-----------|-----------|
| 1 | Acto válido + `confirmacao=true` → CONCEBIDO / origem C3 | **PASS** | E1 teste 1 |
| 2 | `dryRun=true` não persiste | **PASS** | E1 teste 2 |
| 3 | Confirmação ausente → recusa | **PASS** | E1 teste 3 |
| 4 | Confirmação falsa → recusa | **PASS** | E1 teste 4 |
| 5 | Campo extra → recusa | **PASS** | E1 teste 5 |
| 6 | Conteúdo privado/proibido → recusa | **PASS** | E1 teste 6 |
| 7 | `objectoCandidato` inválido → recusa | **PASS** | E1 teste 7 |
| 8 | Boot falho → fail-closed | **PASS** | E1 teste 8 |
| 9 | Resultado não expõe payload privado | **PASS** | E1 teste 9 |
| 10 | GET continua somente leitura | **PASS** | E1 teste 10; E2 |
| 11 | Nenhuma rota POST criada | **PASS** | E1 teste 10; E2; E7 |
| 12 | Regressão completa MEP + vista + build | **PASS** | E2–E6 |

**FAIL: 0.**

---

## 4. Limitações (não são FAIL)

| # | Limitação |
|---|-----------|
| **L1** | Invocador ainda não deployado em Railway no acto desta VAL. |
| **L2** | Sem lastro C3 no store de produção (proibido — acto separado). |
| **L3** | `dryRun` restaura o boot via `reiniciarMepParaTestes` + re-boot; adequado a invocação controlada, não a carga concorrente com GET no mesmo processo sem coordenação. |

---

## 5. Isolamento — síntese

| Fronteira | Estado |
|-----------|--------|
| C1 / C2 / `c3.js` / IMP-073 / adapter | Intactos (E5, E9) |
| Transporte GET / UI | Intactos (E2, E6) |
| HTTP escrita | Ausente (E7) |
| Store | Canónico `{CEO_DATA_ROOT}/mep-ceo/store` |
| Produção / volume `/data` | **Não tocados** nesta VAL |

---

## 6. Veredicto

**VAL-078 HOMOLOGADA com 12/12 PASS e 0 FAIL.**

A IMP-076 cumpre o contrato do invocador interno Node. Autoriza-se publicação em `main` **sem** deploy e **sem** execução do acto em produção.

---

## 7. Histórico

| Data | Acto |
|------|------|
| 16/08/2026 | VAL-078 executada; 12/12 PASS; publicação IMP-076 + VAL-078 |

---

*Fim VAL-078.*
