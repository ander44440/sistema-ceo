# CTO-003 — Inconsistência de Pipeline (Diagnóstico + Correção)

> **Status:** **CORRIGIDO** — 06/08/2026 (despacho CTO de inconsistência pós-homologação).  
> **Natureza:** Correção da Baseline CTO-003 — **não** é frente nova.  
> **Critério CTO:** Com operação aberta, comando operacional **não** pode chegar ao classificador; a decisão operacional ocorre **antes** do interpretador conversacional.

---

## 1. Evidência (uso real)

Com operação aberta e Agent ocioso, comandos (`REPITA`, `REENVIAR`, …) produziam:

- «É isso — ou mudámos de prioridade?»
- «Entendi…»

Violação directa do CTO-003.

---

## 2. Ponto exacto do desvio

Pipeline `executiveEngine.executar` (ordem real):

```
Continuidade Gate
  → VCA / Gestor Tópicos / Gestor Objectivos / Referentes
      (podem devolver clarificações deliberativas)
  → primeiroPassoClassificar          ← ★ DESVIO
  → classificarIntencao
  → clarificações objectivo/tópico/referente (early return)
  → consultarEstadoExecutivoAntesDeResponder   ← Estado Operacional só AQUI
  → executarPorDestino
  → naturalizarRespostaNucleo (CTO-003 só na prosa)
```

**Desvio:** `primeiroPassoClassificar` (≈ L527) corre **antes** de `consultarEstadoExecutivoAntesDeResponder` (≈ L739).

A homologação CTO-003 cobriu a camada conversacional / clarificação **pós-classificador**.  
Não cobriu o **pré-classificador**. Por isso a suite HOM passou e o uso real falhou.

### Caminhos deliberativos que o comando operacional ainda alcançava

| # | Caminho | Momento |
|---|---------|---------|
| D1 | `gestorObjectivo` → `ambiguo_objetivo` / gate×objectivo | Antes do classificador |
| D2 | `gestorTopicos` → `ambiguo_topico` / gate×shift | Antes do classificador |
| D3 | `resolverReferencias` → ambiguo | Antes da consciência |
| D4 | `primeiroPassoClassificar` + destinos | Classificador |
| D5 | CN `ESPELHO` → «Entendi… mudámos de prioridade?» | Pós-destino |

---

## 3. Correção arquitectural

**Interceptação Operacional (CTO-003)** imediatamente após Continuidade Gate e **antes** de VCA/CSC/Classificador:

1. Ler Estado Operacional (fila + histórico).  
2. Se `operacaoAberta` **e** comando operacional → conduzir Motor / ack de recuperação.  
3. **Não** invocar classificador nem gestores de objectivo/tópico nesse turno.

Adicionalmente: `REPITA`/`repetir` passam a ser comando operacional; falhas antigas (completed posterior) não mantêm operação aberta só por `failed` residual.

---

## 4. Validação

Ver `interceptacaoOperacional.test.js` + revalidação HOM-CTO-003.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (despacho inconsistência); Engenheiro (diagnóstico + correção) |
| Quando | 06/08/2026 |
| O quê | Gate operacional pré-classificador |
| Por quê | Homologação não cobriu ordem do pipeline |
| Resultado | Correção Baseline CTO-003 |
