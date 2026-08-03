# Evidência — IMP-020 Bloco B3 (NCS: C5, C6)

> **Data:** 30/07/2026  
> **Status:** B3 implementado — gate interno cumprido; **B4 implementado** (ver [`IMP-020-B4-evidencia.md`](IMP-020-B4-evidencia.md)).  
> Norma: IMP-020; IMP-020-blocos §B3; ARQ-014; REQ-052 R4–R7.  
> Depende de: B1 (C1/C3/C4) + B2 (C2).

---

## 1. Componentes

| ID | Componente | Sede |
|----|------------|------|
| C5 | Portador de contexto deliberativo | `app/src/mre/ncs/portador.js` |
| C6 | Políticas por estágio (2–7) | `app/src/mre/ncs/politicas.js` |

**Integração:** `executarDeliberacao.js` (resolve/anexa uma vez), `pipeline/orquestrador.js`, `pipeline/estagios.js` (contexto LLM + dossier).

**Não implementado neste bloco (feito em B4):** C7 metadados no parecer, C8 `flagNcs`.  
**Não alterado em B3:** Speaker, contrato/estrutura do `ParecerExecutivo` (sem NCS em `metadados` sob flag off).

---

## 2. Critérios B3 ↔ evidência

| # | Critério | Evidência |
|---|----------|-----------|
| 1 | Pacote criado uma vez; não sobrescrito | `resolverPacoteNcsCorrida` + `congelarPacoteNcs` + `anexarPacoteNcs`; TN-06 |
| 2 | Topologia 0–8 inalterada | TB3-topo: ordem `0,1,2,3,4,5a,5b,6,7`; T12-* verdes |
| 3 | `metodo_de_decisao` sem inventário obrigatório | TN-07: LLM pede `solicitar_dados` → R4 remapeia para `aprovar`; sem lacuna de itens |
| 4 | `decisao_operacional` pode `solicitar_dados` | TN-08: lacuna «Itens/alternativas concretas ausentes» + short-circuit |
| 5 | Sem Speaker / metadados / flagNcs | TB3-deliberacao: `parecer.metadados.naturezaCognitiva === undefined`; git sem diff em Speaker |

---

## 3. Resultado dos testes

```text
npm run test:mre:ncs:b3  → 6 pass / 0 fail
npm run test:mre:ncs     → 26 pass / 0 fail  (B1+B2+B3)
npm run test:mre         → 85 pass / 0 fail  (79 pré-B3 + 6 B3)
```

---

## 4. Gate B3

**Cumprido.** Autoriza B4 sob mandato explícito. Esta evidência **não** inicia B4.

---

## Histórico

| Data | Quem | O quê |
|------|------|-------|
| 30/07/2026 | Engenheiro (Cursor) | Entrega B3 C5+C6 + wiring pipeline |
