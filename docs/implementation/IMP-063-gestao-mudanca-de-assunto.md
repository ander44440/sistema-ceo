# IMP-063 — Gestão de Mudança de Assunto

> **Status:** **Homologada** (03/08/2026) — Gate do patrocinador (cadeia EIC CSC).  
> Norma: **REQ-063**; **ARQ-024** v0.1; base **ANL-008**.  
> Depende de: **ARQ-022** / **IMP-061** (janela); **ARQ-023** / **IMP-062** (referentes); **ARQ-018** / IMP-057 (Classificador).  
> Capacidade: **CAP-07** — Comunicação (3ª melhoria perceptível EIC / CSC).

---

## 1. Objetivo

Implementar o **Gestor de Tópicos** como módulo **auxiliar** puro: detectar `continuar` / `shift` / `retomar` / `ambiguo_topico` / `neutro`, manter **≤1 activo** e **≤2 pausas**, com pergunta curta / clarificação Gate×shift — **sem** alterar o Classificador como único decisor de classe, limiar 0,55, C1–C4, Gate, Motor, NCS ou Jobs, e **sem** influência em C3.

## 2. Escopo realizado

| Item | Estado |
|------|--------|
| `gestorTopicos.js` | Feito |
| `topicosSessao.js` (store injectável) | Feito |
| 1 activo + ≤2 pausas | Feito |
| Eventos continuar/shift/retomar/ambiguo/neutro | Feito |
| Integração após IMP-061 e com IMP-062 | Feito |
| Orientação `topicoActivo` → Resolvedor | Feito |
| Clarificação Gate×shift (sem alterar Gate) | Feito |
| Prioridade: Gate×shift > tópico > referente | Feito |
| CT-T01…13 | Feito |
| Classificador / limiar / C3 / Gate / Motor / NCS | Intocados |

## 3. Ficheiros

| Path | Papel |
|------|--------|
| `app/src/classificadorIntencao/gestorTopicos.js` | Módulo auxiliar C-TOP |
| `app/src/classificadorIntencao/topicosSessao.js` | Store de sessão + flag rollback |
| `app/src/classificadorIntencao/gestorTopicos.test.js` | CT-T01…13 |
| `app/src/classificadorIntencao/resolverReferencias.js` | Aceita `topicoActivo` (orientação) |
| `app/src/classificadorIntencao/index.js` | Exports |
| `app/src/executiveEngine/index.js` | Orquestra 061 → gestor → 062 → classificar |
| `app/package.json` | `test:classificador:e63` |

## 4. Fluxo

```text
Gate
  └─ se clarificação + shift → clarificacao_gate_shift (enriquecimento; Gate intacto)
historicoRecente (IMP-061)
  → gestorTopicos (+ store sessão)
  → resolverReferencias (+ topicoActivo)
  → primeiroPassoClassificar (único decisor de classe)
  → se ambiguo_topico: clarificacao_topico
  → senão se ambiguo referente: clarificacao_referente
  → senão destinos + lastro temático/referente (C2/C1)
```

## 5. Parâmetros V1

| Parâmetro | Valor |
|-----------|-------|
| `LIMIAR_SHIFT` | 0,65 |
| `MARGEM_TOPICO` | 0,12 |
| `MAX_PAUSAS` | 2 |
| Flag rollback | `GESTOR_TOPICOS_ATIVO` / `definirGestorTopicosAtivo(false)` |

## 6. Validação

| Suite | Resultado |
|-------|-----------|
| `test:classificador:e63` (CT-T) | **15/15 PASS** |
| `test:classificador` (057+061+062+063 / CT-01…12 / CT-R01…12) | **120/120 PASS** |
| `test:continuidade-gate` | **51/51 PASS** |
| `test:consciencia-operacional` | **46/46 PASS** |
| `test:motor` | **38/38 PASS** |
| `test:cn` | **15/15 PASS** |
| `test:mre:ncs` | **37/37 PASS** |

**Regressão:** 100% verde nos eixos obrigatórios.

## 7. Rollback

`definirGestorTopicosAtivo(false)` ou omitir C-TOP ⇒ path IMP-061+062 (ARQ-024 L1/L2).

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Implementação + CT-T + validação |
