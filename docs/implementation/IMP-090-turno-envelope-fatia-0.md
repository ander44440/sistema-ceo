# IMP-090 — TurnEnvelope Fatia 0 (contrato e nascimento)

> **Status: IMPLEMENTADA — v0.1 (12/09/2026).** Aguarda VAL / homologação CTO.  
> **Versão:** 0.1 — 12/09/2026  
> Norma: **REQ-090 v0.2** (Rascunho tecnicamente homologado); **ARQ-090 v0.2** (idem).  
> Capacidade: **CAP-01** — Governança. Lastro adjacente CAP-07 / ARQ-018 (inalterados).  
> **Natureza:** Fatia 0 — factory + nascimento + transporte sombra; **zero** migração de autoridade; **zero** mudança comportamental observável.  
> **Não inclui:** Fatias 1+; sinais canónicos; packaging MRE; políticaSubstituição; alterações Speaker/CN/NCS/disciplina/reflexo.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Implementação da Fatia 0 do TurnEnvelope: criar, selar e transportar o envelope em sombra no `executiveEngine`. |
| **Por que existe?** | REQ/ARQ-090 exigem unidade central antes de migrar autoridade. |
| **Para quem existe?** | Engenheiro (VAL); CTO (homologação); pipeline futuro. |
| **Como medir sucesso?** | CA-090-1…10 verdes; build OK; suíte relevante sem regressão de prosa/rota. |

---

## 1. Estratégia de selagem (CA-090-8)

**Escolhida:** `Object.freeze` no objecto `TurnEnvelope` (e arrays vazios / `rastreio` de create).

Tentativa de reatribuir `mensagemAtual`, `perguntaAtual`, `coaId` (e demais propriedades) → **`TypeError`** em modo estrito (ESM). Valor permanece o da criação.

## 2. Canal default

Quando `entrada.canal` e `deps.canal` estão ausentes → **`chat`** (`CANAL_DEFAULT`).

## 3. Entrega técnica

| Peça | Local |
|------|--------|
| Factory | `app/src/turnEnvelope/index.js` |
| Nascimento | `executiveEngine.executar` imediatamente após `normalizarInstrucao` |
| Transporte resposta | `dados.envelope` via `anexarTurnEnvelopeNaResposta` / `comEnvelope` em early-returns e saída final |
| Transporte C2 | `ctx.envelope` em `contextoCapacidade` |
| Testes | `app/src/turnEnvelope/imp090-fatia0.test.js` |

## 4. Shadow (I11 / CA-090-9)

Nenhum módulo de produção (ia, MRE, CN, disciplina, reflexo, Speaker, regras) consulta `ctx.envelope` para decidir. Campos `modo` / `objecto` / `intençãoAtual` permanecem reservados (`null` / `indefinido`).

## 5. Trilha V1

Sem import/escrita Trilha; `rastreio` só em memória no envelope.

## 6. Testes

`node --test src/turnEnvelope/imp090-fatia0.test.js` (+ regressão executiveEngine / continuidade Gate / AD / VCA conforme VAL).

## Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 12/09/2026 | Engenheiro | IMP Fatia 0 | Implementada — sem commit |
