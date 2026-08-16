# IMP-072 — Registo formal de homologação

> **Data:** 14/08/2026  
> **Acto:** Homologação da **IMP-072** (núcleo persistente MEP-CEO)  
> **VAL:** [`VAL-072`](../../validation/VAL-072-nucleo-persistente-mep-ceo.md) — **CONCLUÍDA** · 0 FAIL  
> **IMP:** [`IMP-072`](../IMP-072-nucleo-persistente-mep-ceo.md) — **IMPLEMENTADA** · **HOMOLOGADA**  
> **Capacidade:** CAP-13 — **não homologada** por este acto

---

## Declaração

Fica homologada a **IMP-072**, exclusivamente no recorte implementado **C1 + C2**.

| # | Facto |
|---|--------|
| 1 | IMP-072 — **IMPLEMENTADA** |
| 2 | VAL-072 — **CONCLUÍDA** com **0 FAIL** |
| 3 | IMP-072 — **HOMOLOGADA** |
| 4 | A homologação refere-se **exclusivamente** ao escopo C1 + C2 |
| 5 | Persistência física, adapters, C3, UI e integrações **permanecem fora** do escopo |
| 6 | As lacunas identificadas na VAL-072 **não** constituem FAIL nem defeito de conformidade |
| 7 | CAP-13 **não** fica marcada como HOMOLOGADA por este acto |

---

## Memória organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO despachou; Engenheiro (Cursor) formalizou |
| Quando | 14/08/2026 |
| O quê | Homologação da IMP-072 (C1 isolamento + C2 registo em memória) |
| Por quê | VAL-072: requisitos aplicáveis PASS; 0 FAIL; limitação de persistência volátil permitida |
| Baseado em quê | VIS-009 v1.0 · REQ-085 v1.0 · ARQ-033 v1.0 · IMP-072 · VAL-072 (suite 20/20; E1–E5) |
| Resultado | IMP-072 homologada no recorte C1+C2; CAP-13 permanece instituída e especificada, **não** homologada |

---

## Cadeia

```
ADR-020 → VIS-009 → REQ-085 → ARQ-033 → IMP-072 → VAL-072 → Homologação IMP-072 (C1+C2)
                                                                    ↓
                                              Homologação CAP-13 — não neste acto
```

---

## Fora deste acto

Código de produto não alterado. Sem C3. Sem UI. Sem persistência física. Sem Motor / MRE / EIC / G2 / MTE / CAP-04 / CAP-05. Sem commit.

---

## Acto posterior (não altera este registo)

Em 14/08/2026, CTO + Usuário homologaram a **CAP-13** em acto próprio: [`homologacao-cap-13.md`](../../cap-13/homologacao-cap-13.md). Os sete factos acima descrevem **somente** a homologação da IMP-072.
