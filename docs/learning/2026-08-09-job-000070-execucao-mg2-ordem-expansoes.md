# Execução MG2 — ordem das expansões — JOB-000070

> **Entrega do Job da fila CEO.** Execução técnica na ordem JOB-000064/065 (itens 2 e 3; item 1 = gate Patrocinador).  
> **Origem:** MRE (parecer `parecer-c3-1786278074392-jm56jx`).  
> **Data:** 09/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Ordem executada

| Ordem | Expansão | Acção neste Job |
|-------|----------|-----------------|
| **1** | Gates M0+M1 | **Não executável na oficina** — requer playtest Patrocinador |
| **2** | Silhuetas carros NPC (2ª fatia JOB-000063) | **Entregue** |
| **3** | F6 — pagamento corrida cancelada (DEC-MVP-001) | **Entregue** |
| **4** | Refino visual noite (M3) | Já entregue (JOB-000055) |
| **—** | F8/F9/Bairro Popular | Fora da onda |

---

## 2. Item 2 — Silhuetas carros NPC

**Ficheiro:** `WorldLab2Canvas.jsx` → `makeTrafficCar()`

| Kind | Melhoria proporcional |
|------|----------------------|
| **compact** | Wheelbase curto (3.15), habitáculo alto (0.68), porta traseira inclinada (−0.38 rad) |
| **suv** | Altura +25% (0.88), rodas +20% (r=0.48), trilhos de tejadilho reforçados |
| **sedan** | Capô:habitáculo:porta-malas ≈ 1:1:0.6, linha de cintura cromada |

Motos NPC (3 silhuetas) mantidas de JOB-000064. Fusca/sport/supercar/luxury inalterados nesta fatia.

**SCENE_REV:** 155 · **key:** `mg2-scene-v155`

---

## 3. Item 3 — DEC-MVP-001 cancelamento

**Regra:** taxa motoboy **zerada** (não rateada) em corrida cancelada.

| Componente | Detalhe |
|------------|---------|
| `cancelActiveJob()` | Aborta fase `toPickup`/`toDropoff`; `pay=0`; sem crédito parcial |
| Atalho | **X** durante corrida activa (fora de ritual) |
| HUD | «Corrida cancelada · taxa R$ 0» |

---

## 4. Verificação

| Comando / smoke | Resultado |
|-----------------|-----------|
| `npm run build` (MG2) | OK — 57 módulos |
| Hard-refresh `/mg2` | Cruzamento tráfego — hatch/SUV/sedan distinguíveis |
| Tecla X com pedido activo | Cancela sem alterar `cash` |

---

## 5. Pendências (Patrocinador)

- Gate M0 (moto vertical) e M1 (perf ≥10 min) — playtest manual.

---

## Resultado da fila

`result` — Itens 2 e 3 da ordem JOB-000064 executados; item 1 aguarda Patrocinador.
