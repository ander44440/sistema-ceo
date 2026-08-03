# IMP-059 E1 — Evidência (Domínio do Estado Executivo)

> **Data:** 01/08/2026  
> **Etapa:** E1 — Domínio do Estado Executivo  
> **Status:** Implementada — **aguarda homologação**  
> **Norma:** ARQ-020 (homologada); REQ-059; IMP-059 §6 E1  
> **Commit:** não realizado (proibido nesta fase)

---

## 1. Objectivo cumprido

Modelo canónico in-memory do **Estado Executivo Atual**: fontes F1–F8, prioridade P1–P7, snapshot imutável, validações e helpers (`temContextoOperacionalRelevante`, `priorizarFontes`) — **sem** agregador, Conversa, Núcleo, Motor, UI, Fila real, Classificador ou I/O.

## 2. Entregáveis

| Artefacto | Caminho |
|-----------|---------|
| Domínio | `app/src/conscienciaOperacional/dominio.js` |
| API pública E1 | `app/src/conscienciaOperacional/index.js` |
| Testes | `app/src/conscienciaOperacional/dominio.test.js` |
| Script | `npm run test:consciencia-operacional:e1` |

### API de domínio

* Catálogo: `FONTES_ESTADO_EXECUTIVO` (F1–F8), `PRIORIDADE_FONTES` (P1–P7)  
* Guards: `ehIdFonte`, `ehNivelPrioridade`, `prioridadeDaFonte`, `compararPrioridadeFontes`  
* Modelo: `criarEstadoExecutivo`, `estadoExecutivoVazio`, `validarEstadoExecutivo`  
* Validadores: `validarJobResumo`, `validarGateResumo`, `validarConflitoFoco`  
* Helpers: `fonteEstaActiva`, `temContextoOperacionalRelevante`, `priorizarFontes`, `fontePrioritaria`

### Fontes F1–F8

| ID | Chave | Nome |
|----|-------|------|
| F1 | `jobsPendentes` | Jobs pendentes |
| F2 | `jobsEmExecucao` | Jobs em execução |
| F3 | `gatesPendentes` | Gates pendentes |
| F4 | `dispatcher` | Dispatcher |
| F5 | `cto` | CTO |
| F6 | `agent` | Agent |
| F7 | `painel` | Painel de Orquestração |
| F8 | `frenteActiva` | Frente activa |

### Prioridade P1–P7

| Nível | Fontes | Nome |
|-------|--------|------|
| P1 | F3 | Gates pendentes |
| P2 | F2 | Jobs em execução |
| P3 | F1 | Jobs pendentes |
| P4 | F6, F4 | Agent / Dispatcher |
| P5 | F5 | CTO |
| P6 | F7 | Painel |
| P7 | F8 | Frente activa |

## 3. Critérios de aceite E1

| ID | Critério | Resultado |
|----|----------|-----------|
| E1-CA1 | Oito fontes mínimas (RF2 / CA7) no modelo V1 | **OK** |
| E1-CA2 | Prioridade P1–P7 alinhada a ARQ-020 §5 / RF11 | **OK** |
| E1-CA3 | Snapshot vazio / irrelevante → `temContextoOperacionalRelevante === false` | **OK** |
| E1-CA4 | Domínio sem I/O/UI/Fila/Motor/Classificador/SDK | **OK** |

Critérios adicionais cobertos nos testes: modelo imutável (`Object.freeze`); validações rejeitam payloads inválidos.

## 4. Testes

```text
npm run test:consciencia-operacional:e1
```

Resultado: **7/7** testes a verde (01/08/2026).

## 5. Fora de escopo (confirmado)

* Sem agregador (E2)  
* Sem integração Conversa / Núcleo / Motor / UI  
* Sem alteração a ARQ-020 / REQ-059  
* Sem commit

## 6. Pedido de Gate E1

Homologar a E1 para autorizar a **E2** (Agregador de Consciência Operacional)?
