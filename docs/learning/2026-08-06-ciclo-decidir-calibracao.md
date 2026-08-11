# Ciclo Decidir — Calibração do comportamento decisório na conversa

> **Data:** 06/08/2026  
> **Precedente:** DESP-002 **HOMOLOGADO** (baseline condução)  
> **Lente:** DEC-010 — como o CEO **decide** na conversa  
> **Status:** **HOMOLOGADO** como **DESP-003** — 06/08/2026 · integra Baseline da Capacidade de Conversação

---

## Diagnóstico

| Sintoma | Causa |
|---------|--------|
| Aprovar cedo demais | Hint de briefing forçava `aprovar`; `preferirSolicitarDados=false` em exploração |
| Decisão sem critério | Camada A = só recomendação |
| Alternativas invisíveis | Só apareciam em pergunta D |
| `monitorar` = não-decisão | Mesma pergunta «autorizamos?» |
| Gate abrupto | «Aguardando aprovação (Gate G2).» sem o quê / como responder |

---

## Refinamentos

1. **MRE hints** — exploração ≠ diagnóstico; `preferirSolicitarDados` true em exploração  
2. **CN prosa A** — critério + alternativa descartada; monitorar com critério de mudança  
3. **Gate** — em causa + Aprovado/Cancela/Adiar; pós-decisão com rótulo «Decisão:»

---

## Validação

- `test:cn` 21/21  
- B1 + ciclo Decidir 6/6  
- `test:continuidade-gate:e4` 7/7  

---

## Arquivos

- `app/src/conversacaoNatural/compor.js`
- `app/src/mre/integracaoNucleo.js`
- `app/src/continuidadeGate/integracaoConversa.js`
- testes CN / B1 / Gate E4
