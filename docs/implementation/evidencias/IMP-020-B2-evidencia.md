# Evidência — IMP-020 Bloco B2 (NCS: C2)

> **Data:** 30/07/2026  
> **Status:** B2 implementado — gate interno cumprido; **B3 não iniciado**.  
> Norma: IMP-020; IMP-020-blocos §B2; ARQ-014; REQ-052 R3.  
> Depende de: B1 (C1/C3/C4) — sem alteração de contrato além de export do C2.

---

## 1. Componente

| ID | Componente | Sede |
|----|------------|------|
| C2 | Classificador NCS | `app/src/mre/ncs/classificador.js` |

API: `classificarNaturezaCognitiva`, `decidirNaturezaCognitiva` (via `ncs/index.js`).

**Não implementado:** C5–C8, políticas de estágio, integração pipeline/fachada, metadados, `flagNcs`.  
**C1/C3/C4:** inalterados (apenas reexport do C2 no `index.js`).

---

## 2. Critérios B2 ↔ evidência

| # | Critério | Evidência |
|---|----------|-----------|
| 1 | Fora do Núcleo e do Speaker | Módulo só em `mre/ncs/`; sem imports em `classificar.js`, `ia.js`, Speaker |
| 2 | TN-01…04 | `ncs.b2.test.js` — método / operacional / planejamento / explicação |
| 3 | Saída passa em C4 | TB2-05; cada TN valida `validarPacoteNcs` |
| 4 | Desempate R3 | TB2-R3 (operacional > método; planejamento > método) |
| 5 | Sem alteração do fluxo deliberativo | Nenhum ficheiro de pipeline/fachada alterado |

Caso de produção: *«Como você decidiria quais fazer primeiro?»* → `metodo_de_decisao` (TN-01).

---

## 3. Resultado dos testes

```text
npm run test:mre:ncs:b2  → 10 pass / 0 fail
npm run test:mre:ncs     → 20 pass / 0 fail
npm run test:mre         → 79 pass / 0 fail  (59 baseline + 10 B1 + 10 B2)
```

---

## 4. Gate B2

**Cumprido.** Autoriza B3 sob mandato explícito. Esta evidência **não** inicia B3.

---

## Histórico

| Data | Quem | O quê |
|------|------|-------|
| 30/07/2026 | Engenheiro (Cursor) | Entrega B2 C2 |
