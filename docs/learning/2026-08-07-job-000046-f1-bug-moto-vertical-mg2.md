# F1 — Bug moto vertical — JOB-000046

> **Entrega do Job da fila CEO.** Primeira melhoria MG2 (ranking F1, JOB-000042).  
> **Data:** 07/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## Diagnóstico

| Aspecto | Detalhe |
|---------|---------|
| **Sintoma** | Moto fica vertical/de ponta-cabeça ao segurar W e subir marchas (3ª→5ª) |
| **Causa** | Introdução de `moto.rotation.order = 'YXZ'` + empino (commit heli 17/jul) acoplava pitch/yaw/lean; resets parciais (`rotation.y` só) nos rituais deixavam pitch residual |
| **Não era** | Empino intencional (double-tap W) — utilizador confirmou «NÃO É O EMPINO» |

---

## Correção

Repo `E:\anderson\Projoto motoboy game` — `WorldLab2Canvas.jsx`:

1. **`syncMotoUpright(moto, yaw, lean)`** — ordem `XYZ`, `pitch=0` sempre, yaw + inclinação lateral.
2. **Removido** `YXZ` da moto player (heli mantém YXZ).
3. **Loop principal** e **rituais de entrega** passam por `syncMotoUpright` (sem `rotation.y` parcial).
4. **`SCENE_REV = 148`** — força remount pós-HMR.

Build: `npm run build` ✓

---

## Validação pendente

Playtest manual: hard-refresh `/mg2`, segurar W até 5ª — moto não deve levantar sozinha.

---

## Resultado da fila

`completed` — F1 implementado; sem alteração Constituição/Governança CEO.
