# IMP-059 E2 — Evidência (Agregador de Consciência Operacional)

> **Data:** 01/08/2026  
> **Etapa:** E2 — Agregador de Consciência Operacional  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-020 §4–§5; REQ-059 RF2 / RF9 / RNF3–RNF4; IMP-059 §6 E2  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Agregador **somente leitura** que monta o **Estado Executivo Atual** a partir de leitores injectáveis F1–F8, com degradação isolada por fonte, prioridade P1–P7 da E1, snapshot imutável e metadados de diagnóstico (`consultadoEm`, `fontesDegradadas`) — **sem** Conversa, Núcleo, Motor, UI, escrita na Fila ou SDK.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Agregador | `app/src/conscienciaOperacional/agregarEstado.js` |
| Testes | `app/src/conscienciaOperacional/agregarEstado.test.js` |
| API pública | `app/src/conscienciaOperacional/index.js` (exporta E1+E2) |
| Script | `npm run test:consciencia-operacional:e2` |

### API

* `agregarEstadoExecutivo({ leitores, agora, conflitosFoco })` → `ConsultaEstadoExecutivo`  
* `criarAgregadorConsciencia({ leitores, agora }).consultar(override?)`  
* `normalizarLeituraFonte(id, bruto)` — validação/normalização por fonte  

### `ConsultaEstadoExecutivo`

| Campo | Papel |
|-------|--------|
| `estado` | Snapshot imutável E1 (F1–F8) |
| `consultadoEm` | Timestamp ISO (RNF3) |
| `temContextoRelevante` | Helper E1 |
| `prioridadeActiva` | Fontes activas ordenadas P1→P7 |
| `diagnostico.fontes` | ok / degradada / activa / origem por Fi |
| `diagnostico.fontesDegradadas` | Lista de falhas isoladas |
| `diagnostico.ordemPrioridade` | `["P1"…"P7"]` |

### Degradação (RNF4)

* Leitor lança / payload inválido → default ocioso **dessa** fonte; restantes intactas.  
* Defaults **não** inventam Jobs nem Gates (arrays vazios / estados ociosos).  
* Leitura clona payloads — arrays/objectos das fontes **não** são mutados.

## 3. Critérios de aceite E2

| ID | Critério | Resultado |
|----|----------|-----------|
| E2-CA1 | Snapshot válido com oito fontes (presentes ou ausentes) | **OK** |
| E2-CA2 | Falha de fonte não inventa Jobs/Gates | **OK** |
| E2-CA3 | Sem publish Job / mutação Motor / decisão Gate | **OK** |
| E2-CA4 | Sem `@cursor/sdk` / sem escrita na Fila | **OK** |

Extras: prioridade P1–P7 na consulta; snapshot imutável; fontes não mutadas.

## 4. Testes

```text
npm run test:consciencia-operacional:e2
```

Resultado: **9/9** testes a verde (01/08/2026).

Regressão E1: **7/7** a verde (`npm run test:consciencia-operacional:e1`).

## 5. Fora de escopo (confirmado)

* Sem Conversa / Núcleo / Motor / UI  
* Sem alteração a ARQ-020 / REQ-059  
* Sem commit  
* Sem wiring a Fila/Continuidade reais (leitores injectáveis — E3+)

## 6. Pedido de Gate E2

Homologar a E2 para autorizar a **E3** (Consulta obrigatória antes de responder C2/C3)?
