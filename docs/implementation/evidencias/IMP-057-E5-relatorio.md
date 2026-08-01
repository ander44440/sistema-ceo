# IMP-057 E5 — Relatório para homologação

**Data:** 01/08/2026  
**Etapa:** E5 — Destinos C1–C4 (ligação real)  
**Norma:** IMP-057 v0.4 · REQ-057 · ARQ-018 (não alteradas)  
**Commit:** *não realizado* (pedido explícito)

---

## 1. Objectivo cumprido

Despacho **estrito** por `destino` do Classificador:

| Classe | Destino | Sistema |
|--------|---------|---------|
| C1 | `resposta_leve` | Resposta imediata (sem MRE / Motor) |
| C2 | `nucleo_mre` | Capacidade IA → Núcleo/MRE (`publicarJob` proibido nesta via) |
| C3 | `motor_execucao` | **Exclusivamente** Motor de Execução |
| C4 | `capacidade_operacional` | Fila, memória, dashboard, CTO, … |

Destino desconhecido ou falha → **erro tipado**; **sem** fallback silencioso para outro caminho.

---

## 2. Entregáveis

| Item | Local |
|------|--------|
| Despacho C1–C4 | `app/src/classificadorIntencao/destinos.js` |
| Núcleo usa `executarPorDestino` | `app/src/executiveEngine/index.js` |
| Testes E5 | `app/src/classificadorIntencao/destinos.test.js` |
| Script | `npm run test:classificador:e5` |

---

## 3. Critérios de aceite

| ID | Resultado |
|----|-----------|
| E5-CA1 | OK — C2 + mock `publicarJob` → **0** chamadas |
| E5-CA2 | OK — C3 invoca Motor; prosa ≠ «Sugiro» isolado |
| E5-CA3 | OK — «listar jobs» → capacidade `fila`, não Motor |
| E5-CA4 | OK — falha C4 mantém rota operacional; Núcleo preserva `classificacao` |
| E5-CA5 | OK — falha Motor → `motor_execucao_falha`; `mreFallback: false` |

---

## 4. Suite de testes

```text
npm run test:classificador:e5  →  8/8 pass
npm run test:classificador     → 33/33 pass (E1–E5)
```

---

## 5. Demonstração C1–C4

| | Entrada | Classe | Destino | Efeito |
|--|---------|--------|---------|--------|
| **C1** | Bom dia | `conhecimento_geral` | `resposta_leve` | Resposta imediata; `motor=false`, `mre=false` |
| **C2** | Como priorizar o pagamento no MG2? | `conversa_projeto` | `nucleo_mre` | Via IA/MRE; `publicarJobProibido`; zero Job |
| **C3** | Quero que você resolva os bugs do projeto. | `trabalho_executivo` | `motor_execucao` | Motor + Gate G2; sem «Sugiro…» |
| **C4** | listar jobs | `comando_operacional` | `capacidade_operacional` | Capacidade `fila`; sem Motor |

---

## 6. Pedido de Gate

Homologar a **E5** da IMP-057. E6 (fronteiras/regressão) permanece por autorizar.
