# IMP-071 — Autoridade Delegada

> **Status:** **HOMOLOGADA / ENCERRADA** — 07/08/2026 (Despacho CTO).  
> **Tipo:** IMP (ADR-012). **Identificação:** IMP-071.  
> **Capacidade:** CAP-01 — Governança (ciclo Autoridade Delegada) · **Baseline**.  
> **Norma:** **ARQ-032** Homologada (**congelada**); **REQ-075…084** (**congelados**).  
> **VAL:** [`VAL-IMP-071`](../validation/VAL-IMP-071.md) — **Homologada**.  
> **Baseline:** [`cap-01/README.md`](../cap-01/README.md).  
> **Congelado:** ARQ-032 · CAP-01 · REQ-075…084 · IMP-071.  
> **Natureza:** implementação incremental concluída. **Não** emenda ARQ-032 / CAP-01 / CTO-003 / CAP-04.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Implementação da Autoridade Delegada conforme REQ-075…084. |
| **Por que existe?** | Operacionalizar a competência temporária de fecho Usuário→CEO sem alienar a missão. |
| **Para quem existe?** | Usuário (soberania); CTO (gates); Engenheiro (execução). |
| **Como medir sucesso?** | CAs PASS/FAIL; VAL homologada; ARQ-032 intacta — **cumprido**. |

---

## 1. Cadeia (fechada)

```
ARQ-032 → CAP-01 → REQ-075…084 → IMP-071 → VAL-IMP-071 → Homologação → Baseline
```

---

## 2. Blocos (todos homologados)

| Bloco | REQs | VAL | Estado |
|-------|------|-----|--------|
| B1 | 075–076 | VAL-IMP-071-B1 | Homologado |
| B2 | 077–078 | VAL-IMP-071-B2 | Homologado |
| B3 | 079–080 | VAL-IMP-071-B3 | Homologado |
| B4 | 081–082 | VAL-IMP-071-B4 | Homologado |
| B5 | 083–084 | VAL-IMP-071-B5 | Homologado |
| B6 | conjunto | VAL-IMP-071 | Homologado |

---

## 3. Estado final

| Item | Estado |
|------|--------|
| IMP-071 | **HOMOLOGADA / ENCERRADA** |
| Suite | 48/48 PASS |
| CAs | 40/40 PASS |
| Baseline | CAP-01 Autoridade Delegada **oficial** |
| Evolução futura | Só com evidência de uso real |

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (homologou) · Engenheiro (registou) |
| Quando | 07/08/2026 |
| O quê | Homologação final IMP-071 · Baseline CAP-01 |
| Resultado | IMP encerrada · capacidade na Baseline · maturidade por evidências |
