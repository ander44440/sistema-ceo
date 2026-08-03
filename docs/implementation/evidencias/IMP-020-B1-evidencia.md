# Evidência — IMP-020 Bloco B1 (NCS: C1, C3, C4)

> **Data:** 30/07/2026  
> **Status:** B1 implementado — gate interno cumprido; **B2 não iniciado**.  
> Norma: IMP-020; IMP-020-blocos §B1; ARQ-014; REQ-052.

---

## 1. Componentes

| ID | Componente | Sede |
|----|------------|------|
| C1 | Catálogo NCS | `app/src/mre/ncs/catalogo.js` |
| C3 | Pacote NCS + derivações | `app/src/mre/ncs/pacote.js` |
| C4 | Validador de fronteira | `app/src/mre/ncs/validarPacoteNcs.js` |

Fixtures: `app/src/mre/ncs/fixtures.js` · API: `app/src/mre/ncs/index.js`

**Não implementado (fora de B1):** C2, C5–C8, políticas de estágio, integração pipeline, metadados no parecer, `flagNcs`.

---

## 2. Critérios B1 ↔ evidência

| # | Critério do plano | Evidência |
|---|-------------------|-----------|
| 1 | Catálogo com exatamente 4 naturezas | TB1-01; `NaturezaCognitiva` |
| 2 | Pacote montável com derivações | TB1-02…04; `montarPacoteNcs` / `derivarCamposNcs` |
| 3 | Validador aceita válido / rejeita ilegal e incompleto | TB1-06…08 |
| 4 | ≥1 fixture válida por natureza + inválidos | `fixtures.js`; TB1-06…08 |
| 5 | Sem alteração do fluxo deliberativo | Nenhum ficheiro de pipeline/fachada/Speaker alterado |
| 6 | Testes unitários passam | `npm run test:mre:ncs:b1` → 10 pass |

---

## 3. Resultado dos testes

```text
npm run test:mre:ncs:b1  → 10 pass / 0 fail
npm run test:mre         → 69 pass / 0 fail  (59 baseline + 10 B1)
```

---

## 4. Gate B1

**Cumprido.** Autoriza B2 sob mandato explícito. Esta evidência **não** inicia B2 nem declara produção NCS.

---

## Histórico

| Data | Quem | O quê |
|------|------|-------|
| 30/07/2026 | Engenheiro (Cursor) | Entrega B1 C1/C3/C4 |
