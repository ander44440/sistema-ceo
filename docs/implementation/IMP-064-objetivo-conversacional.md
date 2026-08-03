# IMP-064 — Objetivo Conversacional (Goal Tracking)

> **Status:** **Homologada** (03/08/2026) — Gate do patrocinador.  
> Norma: **REQ-064**; **ARQ-025** v0.1; base **ANL-009**.  
> Depende de: **IMP-061** (janela); **IMP-062** (referentes); **IMP-063** (tópicos); **ARQ-018** / IMP-057 (Classificador).  
> Capacidade: **CAP-07** — Comunicação (4ª melhoria perceptível EIC / CSC).

---

## 1. Objetivo

Implementar o **Gestor de Objectivos Conversacionais** como módulo **auxiliar** puro: estabelecer / continuar / mudar / ambiguidade / neutro, com **≤1 activo** e **≤1 anterior**, pergunta curta / clarificação Gate×objectivo — **sem** alterar o Classificador como único decisor, limiar 0,55, C1–C4, Gate, Motor, NCS ou Jobs, e **sem** confundir Objectivo com Tópico / Classe / Job.

## 2. Escopo realizado

| Item | Estado |
|------|--------|
| `gestorObjectivo.js` | Feito |
| `objectivoSessao.js` | Feito |
| 1 activo + 1 anterior | Feito |
| Eventos estabelecer/continuar/mudar/ambiguo/neutro | Feito |
| Integração após 061→063→062 | Feito |
| `objetivoConversacional` no contexto do Classificador (sem pontuar C3) | Feito |
| Clarificação Gate×objectivo | Feito |
| Prioridade: Gate×obj > ambiguo_obj > Gate×shift > tópico > referente | Feito |
| CT-G01…14 | Feito |
| Classificador / limiar / C3 / Gate / Motor / NCS | Intocados |

## 3. Ficheiros

| Path | Papel |
|------|--------|
| `app/src/classificadorIntencao/gestorObjectivo.js` | Módulo auxiliar C-OBJ |
| `app/src/classificadorIntencao/objectivoSessao.js` | Store de sessão + flag rollback |
| `app/src/classificadorIntencao/gestorObjectivo.test.js` | CT-G01…14 |
| `app/src/classificadorIntencao/regras.js` | Typedef `objetivoConversacional` (contexto) |
| `app/src/classificadorIntencao/index.js` | Exports |
| `app/src/executiveEngine/index.js` | Orquestra 061→063→062→gestor→classificar |
| `app/package.json` | `test:classificador:e64` |

## 4. Fluxo

```text
Gate
  └─ clarificação + mudar/estabelecer → clarificacao_gate_objectivo
historicoRecente (061)
  → gestorTopicos (063)
  → resolverReferencias (062; pode ler âncora do objectivo de sessão)
  → gestorObjectivo (064)
  → primeiroPassoClassificar (+ objetivoConversacional no contexto; único decisor)
  → clarificações por prioridade
  → destinos + lastro (objectivo / tópico / referente) em C2/C1
```

## 5. Parâmetros V1

| Parâmetro | Valor |
|-----------|-------|
| `LIMIAR_OBJECTIVO` | 0,65 |
| `MARGEM_OBJECTIVO` | 0,12 |
| Flag rollback | `GESTOR_OBJECTIVO_ATIVO` |

## 6. Validação

| Suite | Resultado |
|-------|-----------|
| `test:classificador:e64` (CT-G) | **15/15 PASS** |
| `test:classificador` (057+061+062+063+064 / SC-01…05) | **135/135 PASS** |
| `test:continuidade-gate` | **51/51 PASS** |
| `test:consciencia-operacional` | **46/46 PASS** |
| `test:motor` | **38/38 PASS** |
| `test:cn` | **15/15 PASS** |
| `test:mre:ncs` | **37/37 PASS** |

**Regressão:** 100% verde nos eixos obrigatórios.

## 7. Rollback

`definirGestorObjectivoAtivo(false)` ou omitir C-OBJ ⇒ path IMP-061+062+063 (ARQ-025 L1/L2).

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Implementação + CT-G + validação |
