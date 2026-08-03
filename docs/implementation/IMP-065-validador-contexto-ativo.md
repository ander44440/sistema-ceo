# IMP-065 — Validador de Contexto Ativo (VCA)

> **Status:** **Homologada** (03/08/2026) — Gate do patrocinador.  
> Norma: **REQ-065**; **ARQ-026** v0.1; base **ANL-010**.  
> Depende de: **IMP-061**…**IMP-064** (condicionados); **ARQ-018** / IMP-057 (Classificador).  
> Capacidade: **CAP-07** — Comunicação (5ª melhoria perceptível EIC / CSC).

---

## 1. Objetivo

Implementar o **Validador de Contexto Ativo** como módulo **auxiliar** pré-cadeia: decidir pertença/isolamento **após** o Gate e **antes** de IMP-061→064, com `autorizaLastroCsc` **somente** em `pertence`, stores preservados nos demais estados, **sem** alterar Classificador, limiar 0,55, C1–C4, Gate, Motor, NCS ou Jobs.

## 2. Escopo realizado

| Item | Estado |
|------|--------|
| `validadorContextoAtivo.js` | Feito |
| Estados V1 (6 veredictos) | Feito |
| `autorizaLastroCsc` (só `pertence`) | Feito |
| Integração pós-Gate / pré-CSC | Feito |
| Isolamento sem limpeza de stores | Feito |
| Pergunta curta `ambiguo_contexto` | Feito |
| Flag rollback `VCA_ATIVO` | Feito |
| CT-V01…14 | Feito |
| Classificador / limiar / C3 / Gate / Motor / NCS | Intocados |
| Contratos internos IMP-061…064 | Intocados (só condicionados) |

## 3. Ficheiros

| Path | Papel |
|------|--------|
| `app/src/classificadorIntencao/validadorContextoAtivo.js` | Módulo auxiliar C-VCA |
| `app/src/classificadorIntencao/validadorContextoAtivo.test.js` | CT-V01…14 |
| `app/src/classificadorIntencao/index.js` | Exports |
| `app/src/executiveEngine/index.js` | Orquestra Gate → VCA → CSC condicional → classificar |
| `app/package.json` | `test:classificador:e65` + suite completa |

## 4. Fluxo

```text
Gate
  ↓
VCA (validarContextoAtivo)
  ├─ ambiguo_contexto → pergunta curta (clarificacao_contexto)
  ├─ pertence → IMP-061 → 063 → 062 → 064 → Classificador → destinos
  └─ demais → Classificador sem lastro CSC (stores intactos)
```

## 5. Parâmetros V1

| Parâmetro | Valor |
|-----------|-------|
| Veredictos | pertence \| independente \| conhecimento_geral \| metaconversa \| novo_contexto \| ambiguo_contexto |
| `autorizaLastroCsc` | `true` ⟺ `pertence` |
| Flag rollback | `VCA_ATIVO` (`definirVcaAtivo(false)` ⇒ força pertence) |

## 6. Validação

| Suite | Resultado |
|-------|-----------|
| `test:classificador:e65` (CT-V) | **15/15 PASS** |
| `test:classificador` (057+061…065 / SC-01…05) | **150/150 PASS** |
| `test:continuidade-gate` | **51/51 PASS** |
| `test:consciencia-operacional` | **46/46 PASS** |
| `test:motor` | **38/38 PASS** |
| `test:cn` | **PASS** |
| `test:mre:ncs` | **PASS** |

**Regressão:** 100% verde nos eixos obrigatórios.

## 7. Rollback

`definirVcaAtivo(false)` ou omitir VCA ⇒ path IMP-061…064 imediato (ARQ-026 L1/L2).

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Implementação + CT-V + validação |
