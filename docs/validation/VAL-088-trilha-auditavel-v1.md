# VAL-088 — Validação da IMP-088 (Trilha Auditável V1)

> **Status:** **APROVADO · HOMOLOGADO** — 11/09/2026. Encerramento da Trilha Auditável V1 com IMP-088.  
> **Tipo:** VAL (ADR-006). **Identificação:** VAL-088 (VAL da IMP-088).  
> **Capacidade:** CAP-09 — Observabilidade.  
> **Norma:** REQ-088 v1.0 Homologado · ARQ-088 v1.0 Homologada · IMP-088 v1.0 **IMPLEMENTADA · VALIDADA · HOMOLOGADA**.  
> **Código:** **não alterado** na VAL nem no encerramento. Sem novos eventos. Sem remediação das limitações V1.  
> **Preservado:** HFC v1.0; F5–F8; CAP-13/C3; REQ-086; ciclo 087; JOB-000118.  
> **Limitações V1 (permanecem):** Railway sem espelho; Gate/AD fire-and-forget; F-TR não ligado; sem `prevHash`; somente 3 tipos.  
> **Próxima evolução:** frente própria — **não** iniciada neste acto.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a Trilha V1 (fatias 1–2 formalizadas) cumpre REQ-088 / ARQ-088 sem regressão HFC/MO/MEP. |
| **Por que existe?** | Despacho VAL após IMP-088 (formalização; 51/51 na entrega). |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Itens 1–12 do despacho em PASS; 0 FAIL na suíte; limitações declaradas ≠ FAIL. |

---

## 1. Testes executados

| ID | Acto | Resultado |
|----|------|-----------|
| **E1** | `f8-fatia1-trilha.test.js` | **7/7 pass** |
| **E2** | `f8-fatia2-trilha.test.js` | **7/7 pass** |
| **E3** | `hfc-fatia1.test.js` | **8/8 pass** |
| **E4** | `f5c7-mo-persistencia.test.js` | **9/9 pass** |
| **E5** | `mepCeo.test.js` | **20/20 pass** |
| **E6** | Batch E1–E5 | **51/51 pass · 0 fail** |
| **E7** | Evidência API: append em path `…/executive/audit/eventos.jsonl`; envelope completo; `apagar`/`compactar` → `historico_append_only` | **PASS** (temp root; API vigente) |
| **E8** | Inspecção estática: Railway sem espelho; emissor `void fetch`; F-TR só via `deps.listarPorMo`; AD Trilha só em `fecho_sob_delegacao`; `TIPOS_V1` = 3 tipos | **PASS** |

cwd: `app/`. Data: 11/09/2026.

---

## 2. Matriz de validação (despacho 1–12)

| # | Critério | Veredicto | Evidência |
|---|----------|-----------|-----------|
| **1** | `job.transicao`: emissão, persistência, idempotência, fail-soft | **PASS** | E1: append JSONL; duplicado_id/hash; paridade `historicoCiclo`; Job permanece em fail-soft |
| **2** | `gate.decisao_terminal`: pós-MO, `moRegistroId`, aprovado/rejeitado, adiado sem evento | **PASS** | E2: F2 aprovado/rejeitado com `refs.moRegistroId`; adiado → 0 MO e 0 Trilha |
| **3** | `ad.fecho_sob_delegacao`: pós-MO, `moRegistroId`; não-fecho sem evento | **PASS** | E2: AD fecho + `moRegistroId`; E8: `espelharAdFechoNaTrilha` só dentro de `fecho_sob_delegacao` |
| **4** | Store canónico `executive/audit/eventos.jsonl` | **PASS** | E1 `caminhoEventos`; E7 path relativo `executive/audit/eventos.jsonl` |
| **5** | Append-only (update/delete/compact recusados) | **PASS** | E7 `historico_append_only`; código `persistencia.js` (sem API update) |
| **6** | Idempotência / sem duplicação | **PASS** | E1 duplicidade; E2 Gate 1 MO + 1 evento |
| **7** | Envelope completo | **PASS** | E7 `envelope: true` (10 campos); E1 schemaVersao/conteudoHash/refs |
| **8** | Payloads proibidos rejeitados | **PASS** | E1 teste famílias transcript/MEP/KNW |
| **9** | Fail-soft Job / MO / fecho AD | **PASS** | E1 Job; E2 falha Trilha não reverte MO (Gate e AD) |
| **10** | Isolamento HFC / MO / MEP / F5-C3 | **PASS** | E3–E5 verdes; Trilha não escreve stores alheios; payload proíbe transcript/MEP |
| **11** | Regressão Trilha + HFC + MO + MEP | **PASS** | E6 **51/51** |
| **12** | Limitações V1 explícitas e não tratadas como defeito | **PASS** | §3 abaixo; alinhado REQ-088 CA-088-10 |

---

## 3. Limitações V1 (confirmadas — não FAIL)

| Limitação | Confirmação |
|-----------|-------------|
| Railway sem espelho de Jobs | E8: `server/src/services/executionQueue.js` sem `espelharNovasEntradas*` / Trilha |
| Gate/AD fire-and-forget | E8: `emissor.js` `void fetch(...).catch` |
| F-TR não ligado em produção | E8: `lerRefsTrilhaOpcional` exige `deps.listarPorMo`; orquestrador produção não injecta |
| Sem `prevHash` | E8/E7: envelope V1 sem cadeia; hash = campos |
| Somente 3 eventos | E8: `TIPOS_V1` fechado; sem tipos novos nesta VAL |

---

## 4. Regressões

Nenhuma. HFC, MO e MEP permaneceram verdes; Trilha fatias 1–2 verdes.

---

## 5. Veredicto final

**APROVADO**

Trilha Auditável V1 comprovadamente conforme a REQ-088 + ARQ-088 (CA-088-1…11 cobertos por E1–E8); **0 FAIL**; **0 regressões**; limitações V1 declaradas e não remedidas (conforme escopo).

**Encerramento:** Trilha V1 = **IMPLEMENTADA + VALIDADA + HOMOLOGADA**. Nenhuma evolução de fiabilidade nem novos eventos nesta homologação. Próxima evolução da Trilha = **frente própria** (não iniciada).

---

## 6. Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | VAL da Trilha V1 formalizada (IMP-088) | **APROVADO** |
| 1.1 | 11/09/2026 | Engenheiro (Cursor) | Registo de homologação / encerramento V1 | **APROVADO · HOMOLOGADO** |
