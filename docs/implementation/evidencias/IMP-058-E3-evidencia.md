# IMP-058 E3 — Evidência (Contexto do Gate pendente)

> **Data:** 01/08/2026  
> **Etapa:** E3 — Continuidade do contexto do Gate  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-019 §3.2; REQ-058 RF1 / RF4; IMP-058 §6 E3  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Store in-memory do contexto do Gate pendente: contexto **activo** = Gate pendente **mais recente**; localização automática perante decisão reconhecida (E2), preservando `parecerId` / `cicloId` / snapshot — **sem** o utilizador repetir o C3. Sem Conversa, Motor, UI ou Dispatcher.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Store | `app/src/continuidadeGate/contexto.js` |
| Testes | `app/src/continuidadeGate/contexto.test.js` |
| API | `criarStoreContextoGate` em `index.js` |
| Script | `npm run test:continuidade-gate:e3` |

### API do store

| Método | Papel |
|--------|-------|
| `abrirGate` | Regista Gate + snapshot / resumo |
| `obterGatePendenteMaisRecente` / `obterContextoActivo` | Contexto activo (RF4) |
| `localizarParaDecisao` | Localização automática via léxico E2 |
| `consumirDecisao` | Localiza + aplica (E1) + actualiza store |
| `marcarResolvido` | Após aprovado/rejeitado |
| `manterPendenteAposAdiamento` | Após adiar |
| `limparResolvidos` / `limparTudo` | Limpeza segura |

## 3. Critérios de aceite E3

| ID | Critério | Resultado |
|----|----------|-----------|
| E3-CA1 | Contexto recuperável sem repetir C3 | **OK** |
| E3-CA2 | Decisão no Gate **mais recente** | **OK** |
| E3-CA3 | Após aprovado/rejeitado deixa de estar pendente | **OK** |
| E3-CA4 | Após adiado permanece pendente / retomável | **OK** |
| E3-CA5 | Store sem Jobs / Motor / SDK | **OK** |

## 4. Testes

```text
npm run test:continuidade-gate:e3   → 6/6 pass
npm run test:continuidade-gate      → 18/18 pass (E1+E2+E3)
```

## 5. Fora de escopo (confirmado)

* Sem Conversa / Motor / UI / Dispatcher  
* Sem alteração a ARQ-019 / REQ-058  
* Sem commit

## 6. Pedido de Gate E3

Homologar a **E3** para autorizar a **E4** (integração Conversa → Motor)?
