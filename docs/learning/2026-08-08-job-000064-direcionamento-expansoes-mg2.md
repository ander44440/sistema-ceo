# Direcionamento e continuidade das expansões — JOB-000064

> **Entrega do Job da fila CEO.** Direcionamento operacional, pendências resolvidas e continuidade das expansões MG2.  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Pendências resolvidas

| Pendência | Acção | Evidência |
|-----------|-------|-----------|
| Teste `continuidade-gate` E6 falhando | Entrypoint Conversa→Núcleo migrou para `enviarAoNucleo.js` (IMP-068); teste actualizado | `npm run test:continuidade-gate` — 51/51 OK |
| Expansão visual motos NPC (JOB-000063) | MVP 3 silhuetas implementado | `makeMotoCub` / `makeMotoSport` / `makeMotoUtil` em `WorldLab2Canvas.jsx`; SCENE_REV 154; build OK |

---

## 2. Pendências que **não** são resolvíveis na oficina (requerem Patrocinador)

| ID | Item | Bloqueio |
|----|------|----------|
| **M0** | Gate F1 — bug moto vertical | Playtest Patrocinador (JOB-000046 entregue) |
| **M1** | Gate F2 — performance Sprint 1–3 | Veredito sessão ≥10 min (JOB-000060 entregue) |
| **M3** | Gate visual noite | Playtest pós-M0/M1 (JOB-000055 entregue) |

**Acção imediata do Patrocinador:** uma sessão `/mg2` com checklist M0+M1 (hard-refresh, W até 5ª, tráfego denso 10 min). Resposta explícita: passou / falhou.

---

## 3. Direcionamento — ordem das expansões

Filtro ADR-015: *«Aproxima o uso diário do CEO no desenvolvimento do MG2?»*

| Ordem | Expansão | Estado | Próximo passo |
|-------|----------|--------|---------------|
| **1** | Gates M0+M1 | **Bloqueante** | Patrocinador playtest |
| **2** | Silhuetas carros NPC (2ª fatia JOB-000063) | Pronto para Job | Proporções + assinatura por `kind` em `makeTrafficCar()` |
| **3** | F6 — pagamento corrida cancelada (M4) | Decisão DEC-MVP-001 | Job oficina edge case payout |
| **4** | Refino visual noite (M3 gate) | Entregue tecnicamente | Só após M0/M1 OK |
| **—** | F8 Temporada 2 / F9 mapa | **Fora da onda** | JOB-000048 |

**WIP ≤ 2:** não abrir silhuetas carros + pagamento em paralelo com gates M0/M1 em aberto crítico.

---

## 4. Expansão entregue neste Job

**Vocabulário de silhueta moto NPC (MVP):**

- `makeMotoCub` — delivery (wheelbase curto, baú traseiro) — ex-`makeMoto()`
- `makeMotoSport` — wheelbase longo, carenagem inclinada, escape lateral
- `makeMotoUtil` — garfo visível, para-lama torus, guidão alto
- `makeTrafficMoto()` sorteia entre as 3 + pisca-luzes partilhadas

**Verificação:** hard-refresh `/mg2`; cruzamento com tráfego denso — contar ≥3 silhuetas moto distintas.

---

## 5. CEO / fila — próximos despachos sugeridos

1. **Após gate M0+M1:** Job silhuetas carros (2ª fatia JOB-000063).
2. **Paralelo baixo risco (se WIP ≤ 2):** Job F6 pagamento cancelamento.
3. **Não despachar:** F8, F9, multiplayer.

---

## Resultado da fila

`completed` — Pendência teste CEO resolvida; expansão motos NPC entregue; direcionamento consolidado; gates M0/M1 aguardam Patrocinador.
