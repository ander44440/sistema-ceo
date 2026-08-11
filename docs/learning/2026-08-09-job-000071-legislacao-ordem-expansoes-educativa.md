# Legislação operacional MG2 — ordem de expansões — JOB-000071

> **Entrega do Job da fila CEO.** Implementar e executar a legislação operacional (ordem JOB-000064) com enquadramento educativo (CON-001 Art. 10 / Manifesto MG2 §1).  
> **Origem:** MRE (parecer `parecer-c3-1786279675337-tvsuh5`).  
> **Data:** 09/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. O que é a «legislação»

A **legislação operacional MG2** é a ordem vinculante de expansões fixada em JOB-000064/065:

| Ordem | Expansão | Executável na oficina? |
|-------|----------|:----------------------:|
| **1** | Gates M0+M1 (moto vertical + perf ≥10 min) | Não — playtest Patrocinador |
| **2** | Silhuetas carros NPC (2ª fatia JOB-000063) | **Sim** |
| **3** | F6 — DEC-MVP-001 cancelamento (taxa R$ 0) | **Sim** |
| **4** | Refino visual noite (M3) | Já entregue (JOB-000055); gate após M0/M1 |

Esta ordem **não** altera Constituição/Governança CEO — governa apenas o sequenciamento técnico MG2.

---

## 2. Por que implementar e executar (princípio educativo)

| Pergunta Art. 10 | Resposta |
|------------------|----------|
| **Porquê?** | JOB-000070 entregou código mas falhou verificação CEO — faltava prova executável e enquadramento explícito da ordem como norma operacional. |
| **Alternativas consideradas** | (a) Reimplementar silhuetas do zero — descartado (já em SCENE_REV 155). (b) Ignorar item 1 — descartado; documentado como gate Patrocinador. (c) Script de verificação + build — **escolhida**. |
| **Riscos** | Gates M0/M1 em aberto bloqueiam item 4 em produção; WIP > 2 se abrir F8/F9 em paralelo. |
| **O que ensina?** | Ordem de expansão como «legislação» verificável; DEC-MVP-001 como consequência económica visível (cancelar = R$ 0); silhuetas como leitura visual rápida de arquétipos. |

**Alinhamento Manifesto MG2:** educação por consequência (taxa zero ao cancelar) e leitura visual (silhuetas distintas) — **sem** aula expositiva.

---

## 3. Implementação deste Job

### 3.1 Verificador executável (novo)

**Ficheiro:** `app/scripts/verificar-leg-mg2-001-ordem-expansoes.mjs`

| Verificação | Critério |
|-------------|----------|
| SCENE_REV | ≥ 155 |
| Silhuetas | ramos `compact`, `suv`, sedan com linha de cintura |
| DEC-MVP-001 | `cancelActiveJob`, `pay = 0`, mensagem «taxa R$ 0» |
| Build | `npm run build` MG2 OK |

### 3.2 Código MG2 (já entregue JOB-000070 — revalidado)

| Item | Ficheiro | Estado |
|------|----------|--------|
| Silhuetas carros | `WorldLab2Canvas.jsx` → `makeTrafficCar()` | OK |
| Cancelamento F6 | `cancelActiveJob()` + tecla **X** | OK |
| SCENE_REV | 155 | OK |

---

## 4. Execução (evidência)

```text
node app/scripts/verificar-leg-mg2-001-ordem-expansoes.mjs
→ 7/7 verificações OK
→ MG2 build OK (57 módulos)
```

---

## 5. Pendência Patrocinador (item 1 da legislação)

Checklist M0+M1 — sessão `/mg2` hard-refresh:

1. Segurar **W** até 5ª — moto permanece ereta (M0).
2. Tráfego denso ≥10 min — FPS estável (M1).
3. Resposta explícita: passou / falhou.

---

## Resultado da fila

`result` — Legislação operacional LEG-MG2-001 implementada (verificador) e executada (7/7 checks + build); itens 2+3 conformes; item 1 aguarda playtest Patrocinador.
