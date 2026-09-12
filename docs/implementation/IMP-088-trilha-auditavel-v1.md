# IMP-088 — Trilha Auditável V1 (formalização das fatias 1–2)

> **Status: IMPLEMENTADA · VALIDADA · HOMOLOGADA — v1.0 (11/09/2026).**  
> **Versão:** 1.0 — 11/09/2026  
> Norma: **REQ-088 v1.0 Homologado**; **ARQ-088 v1.0 Homologada**; **VAL-088 APROVADO · HOMOLOGADO**.  
> Capacidade: **CAP-09** — Observabilidade.  
> **Natureza:** Formalização do código V1 **já existente** (fatias 1–2). **Sem** novos eventos; **sem** evolução de fiabilidade nesta homologação.  
> **Preservado (inalterados):** HFC v1.0; F5–F8; CAP-13/C3; REQ-086; ciclo REQ/ARQ/IMP/VAL-087; JOB-000118.  
> **Delta de código na IMP/VAL/encerramento:** **nenhum**.  
> **Gate da entrega:** fechado (homologada). **Próxima evolução da Trilha:** frente própria (não iniciada neste acto).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Entrega homologada que torna a Trilha V1 rastreável no ciclo REQ-088 → ARQ-088 → IMP-088 → VAL-088. |
| **Por que existe?** | Código das fatias 1–2 existia sem ciclo normativo (ADR-006). |
| **Para quem existe?** | CTO; Engenheiro; patrocinador (rastreio de execução). |
| **Como medir sucesso?** | VAL-088 APROVADO (51/51; critérios 1–12 PASS). |

---

## 1. Estado final V1

| Estado | Registo |
|--------|---------|
| **IMPLEMENTADA** | IMP-088 — formalização do código vigente |
| **VALIDADA** | VAL-088 APROVADO — 51/51 · 0 FAIL · 0 regressões |
| **HOMOLOGADA** | Encerramento formal V1 (11/09/2026) |

### Fora desta homologação

* Evolução de fiabilidade (espelho Railway; confirmação síncrona Gate/AD; F-TR ligado; `prevHash`).  
* Novos tipos de evento.  
* UI / consulta rica / backfill.  

Qualquer item acima = **frente própria** futura — **não** iniciada aqui.

### Limitações V1 (explícitas e vigentes)

* Railway sem espelho de Jobs  
* Gate/AD fire-and-forget  
* F-TR não ligado em produção  
* Ausência de `prevHash`  
* Somente 3 tipos de evento (`job.transicao`, `gate.decisao_terminal`, `ad.fecho_sob_delegacao`)

---

## 2. Mapeamento ARQ → código vigente

| Peça ARQ | Implementação (pré-existente, intocada) |
|----------|------------------------------------------|
| **D-TA** | `app/src/trilhaAuditavel/dominio.js` |
| **S-TA** | `persistencia.js` → `executive/audit/eventos.jsonl` |
| **A-TA** | `index.js` |
| **E-TA** | `emissor.js` |
| **P-TA** | `app/server/trilhaAuditavelPlugin.js` |
| **W-JOB** | `app/server/executionQueue.js` |
| **W-GATE** | `continuidadeGate/integracaoConversa.js` |
| **W-AD** | `autoridadeDelegada/autoridadeDelegada.js` |
| **T-TA** | `f8-fatia1-trilha.test.js`, `f8-fatia2-trilha.test.js` |

### Garantias V1

Append-only · idempotência · envelope · refs · fail-soft · payloads proibidos.

### Fronteiras

```
Trilha ≠ MO ≠ HFC ≠ MEP/CAP-13 ≠ F5-C3
```

---

## 3. Validação e homologação

| Artefacto | Resultado |
|-----------|-----------|
| **VAL-088** | **APROVADO · HOMOLOGADO** (11/09/2026) |
| Suíte | **51/51 pass** (Trilha 14 + HFC 8 + MO 9 + MEP 20) |

Documento: [`docs/validation/VAL-088-trilha-auditavel-v1.md`](../validation/VAL-088-trilha-auditavel-v1.md).

---

## 4. Arquivos do ciclo IMP

### Criados (documentação)

* `docs/implementation/IMP-088-trilha-auditavel-v1.md`

### Código

**Nenhum** ficheiro `.js` alterado por IMP-088 nem pelo encerramento.

---

## 5. Rastreio CA-088

| CA | Evidência |
|----|-----------|
| CA-088-1…11 | VAL-088 matriz 1–12 + IMP mapeamento + suíte verde |

---

## 6. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Formalização V1 + validação técnica | IMPLEMENTADA |
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | Encerramento pós-VAL-088 | **IMPLEMENTADA · VALIDADA · HOMOLOGADA** |
