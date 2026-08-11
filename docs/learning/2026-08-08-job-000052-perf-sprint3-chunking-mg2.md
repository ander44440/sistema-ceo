# M2+ — Performance Sprint 3 (chunking) — JOB-000052

> **Entrega do Job da fila CEO.** Melhorias de performance prioritárias MG2 sob Autoridade Delegada.  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## Pedido

EXECUTE AS MELHORIAS QUE VC JULGA NECESSARIAS — fechar execução técnica das melhorias de performance prioritárias do MG2 (validação Sprint 1 / redução hitch / LOD / chunking conforme lastro da missão).

---

## Decisão operacional

| Item | Estado | Acção |
|------|--------|-------|
| Sprint 1 (raio ~140 m) | Já entregue | Mantido; validação Patrocinador continua pendente |
| Sprint 2 (LOD) | JOB-000051 | Mantido; `updateBuildingLod` agora alternado (2 frames) |
| Sprint 3 (chunking) | **Novo** | Culling espacial da periferia (floresta, costa, mega norte) |
| Hitch | **Refino** | LOD + chunks em cadência reduzida (2/3 frames) |

---

## Implementação

Repo `E:\anderson\Projoto motoboy game` — `WorldLab2Canvas.jsx`:

| Peça | Detalhe |
|------|---------|
| **`assignSpatialChunks`** | Indexa filhos estáticos periféricos (fora do núcleo `EDGE+25`) em células 95 m |
| **`updateSpatialChunks`** | Oculta chunks além de 245 m do player; actualização a cada 3 frames |
| **Exclusões** | Luzes, vias (`PlaneGeometry`), núcleo urbano, edifícios LOD |
| **LOD throttle** | `updateBuildingLod` a cada 2 frames (menos picos CPU) |
| **`SCENE_REV = 150`** | Força remount pós-HMR |

Build: `npm run build` ✓

---

## Validação pendente

Playtest Patrocinador: hard-refresh `/mg2`, percorrer centro → costa norte/leste — verificar ausência de hitch ao cruzar avenida e reaparecimento suave da periferia ao aproximar.

---

## Resultado da fila

`completed` — Sprint 3 chunking + refino anti-hitch; sem alteração Constituição/Governança CEO.
