# IMP-062 — Resolução de Referências Conversacionais

> **Status:** **Homologada** (03/08/2026) — Gate do patrocinador (cadeia EIC CSC).  
> Norma: **REQ-062**; **ARQ-023** v0.1; base **ANL-007**.  
> Depende de: **ARQ-022** / **IMP-061** (janela 4/200/800); **ARQ-018** / IMP-057 (Classificador).  
> Capacidade: **CAP-07** — Comunicação (2ª melhoria perceptível EIC / CSC).

---

## 1. Objetivo

Implementar o **Resolvedor de Referências Conversacionais** como módulo **auxiliar** puro: identificar o referente de deixis («isso», «continua», «o anterior», …) ou declarar ambiguidade com pergunta curta — **sem** alterar o Classificador como único decisor de classe, limiar 0,55, C1–C4, Gate, Motor, NCS ou Jobs.

## 2. Escopo realizado

| Item | Estado |
|------|--------|
| `resolverReferencias.js` | Feito |
| Reutilização janela IMP-061 | Feito |
| `resolvido` / `ambiguo` / `nenhum` | Feito |
| Pergunta curta contextualizada | Feito |
| Integração Núcleo pós-Gate | Feito |
| Lastro C2/C1 com referente | Feito |
| CT-R01…12 | Feito |
| Classificador / limiar / C3 / Gate / Motor / NCS | Intocados |

## 3. Ficheiros

| Path | Papel |
|------|--------|
| `app/src/classificadorIntencao/resolverReferencias.js` | Módulo auxiliar C-REF |
| `app/src/classificadorIntencao/resolverReferencias.test.js` | CT-R01…12 |
| `app/src/classificadorIntencao/index.js` | Exports |
| `app/src/executiveEngine/index.js` | Orquestra resolvedor + classificar |
| `app/package.json` | `test:classificador:e62` |

## 4. Fluxo

```text
Gate → historicoRecente (IMP-061) → resolverReferencias
     → primeiroPassoClassificar (único decisor de classe)
     → se ambiguo: clarificacao_referente (pergunta curta)
     → senão destinos + lastro.referente se resolvido (C2/C1)
```

## 5. Validação

| Suite | Resultado |
|-------|-----------|
| `test:classificador:e62` (CT-R01…12) | **13/13 PASS** |
| `test:classificador` (IMP-057+061+062 / SC-01…05) | **105/105 PASS** |
| `test:continuidade-gate` | **51/51 PASS** |
| `test:consciencia-operacional` | **46/46 PASS** |
| `test:motor` | **38/38 PASS** |
| `test:cn` | **15/15 PASS** |
| `test:mre:ncs` | **37/37 PASS** |

**Regressão:** 100% verde nos eixos obrigatórios.

## 6. Rollback

Omitir chamada a `resolverReferencias` no Núcleo ⇒ comportamento IMP-061 (ARQ-023 L1).

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Implementação + CT-R |
