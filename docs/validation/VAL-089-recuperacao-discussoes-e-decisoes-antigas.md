# VAL-089 — Validação da IMP-089 (Recuperação de discussões e decisões antigas — Fatia 1)

> **Status:** **APROVADO · HOMOLOGADO** — 11/09/2026. Encerramento da Fatia 1 do IMP-089.  
> **Tipo:** VAL (ADR-006). **Identificação:** VAL-089 (VAL da IMP-089).  
> **Capacidade:** CAP-05 — Memória Organizacional (consulta).  
> **Norma:** REQ-089 v1.0 Homologado · ARQ-089 v1.0 Homologada · IMP-089 v1.0 **IMPLEMENTADA · VALIDADA · HOMOLOGADA**.  
> **Baseline:** evolução da **camada de consulta** IMP-086 — **não** emenda REQ/ARQ/IMP-086.  
> **Código neste acto de VAL/fechamento:** **não alterado**. Sem commit/push.  
> **Preservado (explícito):**  
> * **HFC-087** — **não** reaberto nem alterado;  
> * **Trilha-088** — **não** reaberta nem alterada;  
> * **F8/MO** — **não** alterada;  
> * **F5-C3** — preservado;  
> * **sem** novo store; **sem** nova memória;  
> * CAP-13/C3 fora; JOB-000118 intocado; resíduos pré-existentes preservados.  
> **Evidência agregada:** **92/92 PASS · 0 FAIL**; build OK; **0 regressões**.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a Fatia 1 (HFC read-only na discussão + Trilha refs soft-fail) cumpre CA-089 e preserva IMP-086 / HFC / Trilha / MO / F5-C3. |
| **Por que existe?** | Despacho de validação completa + fechamento/homologação após implementação Fatia 1. |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | CA-089-1…9 PASS; 92/92; build OK; 0 regressões; frentes vizinhas intocadas. |

---

## 1. Testes executados

| ID | Acto | Resultado |
|----|------|-----------|
| **E1** | `imp089.fatia1.test.js` (IMP-089) | **6/6 PASS** |
| **E2** | `npm run test:consulta-registados` (IMP-086 + 089 + integração Núcleo) | **23/23 PASS** |
| **E3** | F8/MO: `f5c7-mo-persistencia` + `f5c9-gate-ledger-mo` + `f5c8-ad-ledger-mo` | **PASS** (incluídos no batch E6) |
| **E4** | HFC-087: `hfc-fatia1.test.js` | **8/8 PASS** |
| **E5** | Trilha-088: `f8-fatia1-trilha` + `f8-fatia2-trilha` | **PASS** |
| **E6** | F5-C3: `f5c3-chat-persistencia` + `p1-isolamento-conversacional-coa` | **PASS** |
| **E7** | executiveEngine: `p0-consulta-estado` + `complexidadeDecisao` (+ integração em E2) | **PASS** |
| **E8** | Batch regressão E3–E7 | **69/69 PASS** |
| **E9** | Agregado E2 + E8 | **92/92 PASS · 0 FAIL** |
| **E10** | `npm run build` | **OK** |

cwd: `app/`. Data: 11/09/2026.

---

## 2. Matriz CA-089

| ID | Critério | Veredicto | Evidência |
|----|----------|-----------|-----------|
| **CA-089-1** | Discussão pós-limpeza F5-C3 via HFC | **PASS** | E1 |
| **CA-089-2** | Decisão só do MO (HFC≠Art. 8º) | **PASS** | E1; CA-086-9 em E2 |
| **CA-089-3** | Isolamento por COA | **PASS** | E1; CA-086-3; E4/E6 |
| **CA-089-4** | Trilha refs + soft-fail | **PASS** | E1 |
| **CA-089-5** | Consulta read-only (sem writes) | **PASS** | E1; CA-086-5 |
| **CA-089-6** | D-PED / hook preservados | **PASS** | E2 (âncoras + integração Núcleo) |
| **CA-089-7** | HFC/Trilha só consumo | **PASS** | E4/E5 verdes; writers sem diff funcional |
| **CA-089-8** | Sem store/memória novos | **PASS** | Inspecção delta Fatia 1 = `consultaRegistados` + deps + hook |
| **CA-089-9** | Regressão IMP-086 | **PASS** | E2 CA-086-* |

---

## 3. Validações especiais (despacho)

| # | Item | Veredicto |
|---|------|-----------|
| 1 | Decisão exclusivamente do MO | **PASS** |
| 2 | HFC somente leitura na consulta | **PASS** |
| 3 | HFC recupera após limpeza F5-C3 | **PASS** |
| 4 | Dedupe por `msgId` | **PASS** |
| 5 | Isolamento `coaId` | **PASS** |
| 6 | Trilha só como referências de MO IDs | **PASS** |
| 7 | Trilha indisponível não derruba consulta | **PASS** |
| 8 | Consulta sem writes | **PASS** |
| 9 | D-PED e C-SEP preservados | **PASS** |
| 10 | Sem alteração funcional writers HFC / Trilha / F8-MO | **PASS** |

---

## 4. Regressões

**Nenhuma.** MO, HFC, Trilha, F5-C3 e executiveEngine permaneceram verdes (E8/E9).

---

## 5. Limites conhecidos da Fatia 1 (não são FAIL)

* Sem busca semântica, UI dedicada, backfill, correlação obrigatória mensagem↔MO↔Trilha.  
* HFC vazio (pré-writer) ⇒ ausência explícita.  
* Limite N na C-SEP.  
* Refs Trilha vazias se não houver lastro de execução.  
* Limitações V1 da Trilha (ex. Railway) **permanecem** — fora do objecto desta fatia.  
* HFC-087 / Trilha-088 / F8/MO **não** foram reabertos: a evolução é da **consulta** IMP-086.

---

## 6. Veredicto final

**APROVADO · HOMOLOGADO**

Fatia 1 do IMP-089 = **IMPLEMENTADA + VALIDADA + HOMOLOGADA**.  
**92/92 PASS**; build OK; **0 regressões**; CA-089 atendidos.  
Evolução circunscrita à camada de consulta IMP-086.  
HFC-087, Trilha-088 e F8/MO preservados (não reabertos). Sem novo store / sem nova memória.

**Encerramento documental:** 11/09/2026. Próxima fatia / capacidade **não** iniciada neste acto.

---

## 7. Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 11/09/2026 | Engenheiro (Cursor); Usuário (homologação) | VAL completa 92/92 + fechamento Fatia 1 | **APROVADO · HOMOLOGADO** |
