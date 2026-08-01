# IMP-058 E1 — Evidência (Domínio do Gate)

> **Data:** 01/08/2026  
> **Etapa:** E1 — Domínio do Gate e estados  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-019 (homologada); REQ-058; IMP-058 §6 E1  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Modelo canónico in-memory da Continuidade do Gate: decisões, estados, modelo `GatePendente`, validações de ciclo de vida — **sem** Conversa, Motor, UI, Fila, Dispatcher, Classificador ou I/O.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Domínio | `app/src/continuidadeGate/dominio.js` |
| API pública E1 | `app/src/continuidadeGate/index.js` |
| Testes | `app/src/continuidadeGate/dominio.test.js` |
| Script | `npm run test:continuidade-gate:e1` |

### API de domínio

* Enums: `DECISOES_GATE`, `ESTADOS_GATE`, `EFEITO_POR_DECISAO`  
* Guards: `ehDecisaoGate`, `ehEstadoGate`, `continuidadeAplica`  
* Ciclo de vida: `validarTransicaoGate`, `aplicarDecisaoGate`  
* Modelo: `criarGatePendente`, `validarGatePendente`  
* Helpers RF4: `compararGateMaisRecente`, `seleccionarGatePendenteMaisRecente`

### Transições V1

| De | Decisão | Para | `podeCriarJob` |
|----|---------|------|----------------|
| `pendente` | `aprovado` | `resolvido_aprovado` | true |
| `pendente` | `rejeitado` | `resolvido_rejeitado` | false |
| `pendente` | `adiado` | `pendente` (+`adiamentos`) | false |
| `inexistente` / resolvido | * | **rejeitado** (Continuidade não aplica) | — |

## 3. Critérios de aceite E1

| ID | Critério | Resultado |
|----|----------|-----------|
| E1-CA1 | Exactamente três decisões; rejeição ad hoc | **OK** |
| E1-CA2 | Estados ARQ-019; `adiado` permanece `pendente` | **OK** |
| E1-CA3 | Só a partir de `pendente`; sem Gate → não aplica | **OK** |
| E1-CA4 | Domínio sem I/O/UI/Fila/Classificador/SDK | **OK** |

## 4. Testes

```text
npm run test:continuidade-gate:e1
```

Resultado: **6/6** testes a verde (ver execução nesta sessão).

## 5. Fora de escopo (confirmado)

* Sem integração Conversa / Núcleo  
* Sem chamada ao Motor / `conduzirAposDecisaoGate`  
* Sem UI / Dispatcher / Fila  
* Sem alteração a ARQ-019 / REQ-058  
* Sem commit

## 6. Pedido de Gate E1

Homologar a E1 para autorizar a **E2** (reconhecimento do léxico)?
