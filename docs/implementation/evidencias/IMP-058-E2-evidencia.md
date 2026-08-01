# IMP-058 E2 — Evidência (Reconhecimento do léxico)

> **Data:** 01/08/2026  
> **Etapa:** E2 — Reconhecimento das respostas do utilizador  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-019 §3.4; REQ-058 RF5 / RF16; IMP-058 §6 E2  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Matching **determinístico** do léxico mínimo de decisão de Gate, com normalização de sinónimos, integrado ao domínio E1 — **sem** Conversa, Motor, UI, Dispatcher ou I/O.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Reconhecimento | `app/src/continuidadeGate/reconhecerDecisao.js` |
| Testes | `app/src/continuidadeGate/reconhecerDecisao.test.js` |
| API | `app/src/continuidadeGate/index.js` (exporta E2) |
| Script | `npm run test:continuidade-gate:e2` |

### Léxico V1 (sinónimos → decisão)

| Enunciado | Decisão |
|-----------|---------|
| Aprovado · Pode executar · Autorizado · Pode prosseguir | `aprovado` |
| Cancela · Rejeitado | `rejeitado` |
| Depois · Adiar | `adiado` |

### API

* `normalizarEnunciadoDecisao(texto)` — NFKC, caixa, espaços, pontuação final, aspas  
* `reconhecerDecisao(texto)` → `{ reconhecida, decisao, enunciadoNormalizado, sinonimo }`  
* `reconhecerParaGate(texto, gate, opts?)` — ponte E2→E1 (`validarTransicaoGate` / `aplicarDecisaoGate`)  
* `LEXICO_DECISAO_GATE` — mapa fechado (8 chaves)

## 3. Critérios de aceite E2

| ID | Critério | Resultado |
|----|----------|-----------|
| E2-CA1 | Oito enunciados mínimos mapeiam correctamente | **OK** |
| E2-CA2 | Variações triviais (ponto, caixa, espaços) | **OK** |
| E2-CA3 | Fora do léxico → `reconhecida: false` | **OK** |
| E2-CA4 | Função pura (sem fetch/Fila/Motor/SDK) | **OK** |
| E2-CA5 | Léxico V1 fechado (sem ad hoc) | **OK** |

## 4. Testes

```text
npm run test:continuidade-gate:e2
```

Resultado: **6/6** a verde. Regressão E1: **6/6** a verde.

## 5. Fora de escopo (confirmado)

* Sem Conversa / Motor / UI / Dispatcher  
* Sem alteração a ARQ-019 / REQ-058  
* Sem commit  
* Sem extensão do léxico além dos 8 enunciados V1

## 6. Pedido de Gate E2

Homologar a **E2** para autorizar a **E3** (contexto do Gate pendente)?
