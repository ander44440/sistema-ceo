# DESP-010 — Calibração em produção (1.º ciclo de evidências)

> **Data:** 06/08/2026  
> **Status:** **HOMOLOGADO** — 06/08/2026 · integra Baseline; inaugura **calibração contínua por evidências**  
> **Precedente:** DESP-009 **HOMOLOGADO**  
> **Restrições:** só refinamentos com evidência de missão; sem novas capacidades / arquitectura / governação

---

## Evidência observada

Missão headless MG2 (`scripts/desp-010-missao-observacao.mjs`), 5 turnos, mesmo `executiveEngine.executar` + histórico da Conversa.

| Turno | Utilizador | CEO (antes) | Sintoma |
|-------|------------|-------------|---------|
| 1 | abrir o dia: Missão MG2… | Objectivo com prefixo «abrir o dia:» | Poluição do enunciado |
| 2 | Adiar outdoor e focar pagamento… | «Seguimos no outdoor ou passamos ao pagamento?» | Decisão clara → falsa ambiguidade |
| 3 | ok | «Refere-te a outdoor ou pagamento?» | Cascata da falsa ambiguidade |
| 4 | Agora quero falar da arte… | fragmento `env` (` na prosa | Vazamento técnico |
| 5 | encerrar o dia | Fecho com objectivo | OK |

Registo JSON: `docs/learning/desp-010-observacao-missao.json`.

---

## Diagnóstico

1. `gestorTopicos`: ≥2 âncoras sem activo → `ambiguo_topico`, mesmo com verbos de prioridade (adiar/focar).  
2. Objectivo conversacional herdava o ritual «abrir o dia:».  
3. Sanitização não cobria resíduos `env` / chave.

---

## Refinamento (só o comprovado)

| Fix | Onde |
|-----|------|
| Decisão de prioridade ≠ ambiguidade | `gestorTopicos.js` |
| Limpar prefixo ritual do objectivo | `contextoImediato.js` |
| Remover fragmentos técnicos | `sanitizarProsa.js` + `compor.js` |

«Outdoor ou pagamento?» **continua** a pedir clarificação (regressão preservada).

---

## Validação

| Suite / observação | Resultado |
|--------------------|-----------|
| `gestorTopicos.test.js` | **16/16** |
| `test:cn` | **68/68** |
| `test:refino-eic` | **15/15** |
| `test:continuidade-gate:e4` | **7/7** |
| Re-missão turnos 1–2 | Objectivo limpo; tópico → **pagamento**; **sem** pergunta outdoor/pagamento |

### Antes → Depois (turno 2)

- **Antes:** `Seguimos no «outdoor» ou passamos ao «pagamento»?`  
- **Depois:** shift para «pagamento» (conduz a decisão; não pergunta o que já foi decidido)

### Residual (próximo ciclo com LLM em produção)

- Turnos sem chave LLM ainda caem em prosa de sistema («Tenha isto em conta…» / motor indisponível).  
- Observar de novo na Conversa com motor configurado.

---

## Aderência

- nenhuma nova capacidade;
- nenhuma alteração arquitectural;
- nenhuma alteração de governação;
- refinamentos comportamentais com evidência de missão.

---

## Ficheiros

- `app/src/classificadorIntencao/gestorTopicos.js` (+ teste)
- `app/src/conversacaoNatural/contextoImediato.js`
- `app/src/conversacaoNatural/sanitizarProsa.js`
- `app/src/conversacaoNatural/compor.js`
- `app/scripts/desp-010-missao-observacao.mjs`
- `docs/learning/desp-010-observacao-missao.json`
