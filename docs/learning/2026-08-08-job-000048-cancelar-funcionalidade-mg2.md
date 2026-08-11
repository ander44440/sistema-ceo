# Cancelar uma funcionalidade para acelerar o MG2 — JOB-000048

> **Entrega do Job da fila CEO.** Parecer sobre qual funcionalidade cancelar (ou adiar formalmente) para ganhar velocidade no Motoboy Game 2.  
> **Origem:** MRE (parecer `parecer-c3-1786147651422-t0105v`).  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Veredito executivo

| Pergunta | Resposta |
|----------|----------|
| **Qual funcionalidade cancelaria para acelerar o projeto?** | **Temporada 2 — materiais e fachadas (F8 / marco M5 «cidade convence»)** |
| **Confiança** | Alta — alinhado a JOB-000042, JOB-000047, ADR-015, briefing §7 e precedente DESP-010 |
| **Efeito esperado** | Liberta **1–2+ semanas** de oficina e reduz risco de regressão perf no monólito |
| **O que **não** cancelar** | F1 (bug moto), F2 (perf/LOD), F3 (mobile/LAN baseline) — bloqueiam uso diário |

**Síntese:** Se for obrigatório cortar **uma** funcionalidade ainda no horizonte activo, cortaria **Temporada 2 (F8)**. É a de **menor retorno imediato** face a esforço, já está no fim do roadmap (M5), e o Patrocinador já demonstrou preferência por clareza de missão (pagamento) sobre expansão visual de cidade. Manter F1→F2→F4 (visual noite) e F6 (pagamento cancelamento) em paralelo baixo risco; **retirar M5 da onda actual** sem prejudicar o objectivo ADR-015 de uso diário CEO↔MG2.

---

## 2. Critérios de decisão

| Critério | Peso | F8 Temporada 2 | Alternativas descartadas |
|----------|------|----------------|--------------------------|
| **ADR-015** — aproxima uso diário? | Alto | **Baixo** — polish estético difuso | F1/F2 **não** canceláveis (críticos) |
| **Ranking JOB-000042** | Alto | **F8 = médio-baixo agora** | F4 visual noite = médio-alto (motivação) |
| **Esforço vs impacto** | Alto | Esforço **alto** (sistema materiais); impacto **difuso** | F6 pagamento = esforço baixo-médio, impacto médio |
| **Dependências / risco** | Médio-alto | Toca perf, monólito 14k LOC; gate CTO se economia | Multiplayer/pause **já** «NÃO agora» (JOB-000043/044) |
| **Precedente utilizador** | Médio | DESP-010: pagamento > outdoor | — |
| **Roadmap JOB-000047** | Médio | M5 = semana 7–8+, **último** marco | Cortar M5 não quebra M0–M4 |

---

## 3. Por que Temporada 2 (F8) e não outra

### 3.1 O que é F8 / M5

| Campo | Detalhe |
|-------|---------|
| **Escopo** | Sistema de materiais/fachadas para a cidade «convencer» (`TEMPORADA-2-CIDADE-CONVENCE.md`) |
| **Estado** | Gate aberto; **não** iniciado na oficina |
| **Posição no roadmap** | M5 — após M0 (F1), M1–M2 (perf), M3 (visual noite), M4 (pagamento) |

### 3.2 Por que cancelar (ou adiar formalmente) **agora**

1. **Menor leverage imediato** — F8 não corrige bug moto (F1) nem stutter (F2); o jogo continua «jogável mas frustrante» sem F1/F2, independentemente de fachadas.  
2. **Custo desproporcionado** — material system transversal na cidade implica iterar meshes, shaders, passes FPS mobile+PC; competição directa com M2 (LOD) pelo mesmo orçamento de atenção no monólito.  
3. **Regra «um sistema de cada vez»** — M5 empilha sobre M3 (visual) e M4 (economia); cancelar M5 **simplifica** a onda sem remover identidade noite (M3).  
4. **Precedente de scope tradeoff** — Patrocinador escolheu **pagamento** sobre outdoor (DESP-010); F8 é expansão estética de cidade, mesma família de «polish grande» adiável.  
5. **Já classificado como adiável** — JOB-000042: «Só após F1+F2»; JOB-000047: M5 explícito como semana 7–8+; cortar M5 **não contradiz** governança existente.

### 3.3 Alternativas consideradas e rejeitadas como «cancelamento»

| Funcionalidade | Por que **não** cancelar |
|----------------|--------------------------|
| **F1 — Bug moto vertical** | Bloqueador #1; cancelar = abandonar jogabilidade credível |
| **F2 — Performance / LOD** | Bloqueador #2; sem fluidez não há sessões diárias |
| **F4 — Visual noite (dias 2+5)** | Médio-alto impacto emocional; roadmap visual já parcial; **adiar** dias 2+5 só **se** M1 falhar, não cancelar de raiz |
| **F6 — Pagamento corrida cancelada** | Baixo esforço, decisão DEC-MVP-001 já tomada; paralelo baixo risco |
| **Multiplayer / Pausar in-game** | Já **fora** da onda (JOB-000043/044) — não estão no plano activo a cortar |
| **F5/F7 — Trânsito, outdoors** | **Entregues** — cancelar seria regressão, não aceleração |

---

## 4. Ganho de velocidade estimado

| Efeito | Estimativa |
|--------|------------|
| **Tempo oficina recuperado** | 1–2+ semanas (conforme `TEMPORADA-2-CIDADE-CONVENCE.md` e complexidade real) |
| **WIP libertado** | 1 slot no limite WIP ≤ 2 (JOB-000047) |
| **Risco perf** | Menos commits transversais no WorldLab2 durante M2 (LOD) |
| **Foco CEO/fila** | Jobs concretos F1/F2/M3 sem dispersão para «cidade convence» |

**Trade-off aceite:** cidade continua funcional e com identidade noite parcial (M3); fachadas/materiais globais ficam para **onda futura** com gate próprio.

---

## 5. Onda recomendada pós-corte

```
M0 (F1 gate) → M1 (F2 gate) → M2 (LOD) → M3 (visual noite) → M4 (pagamento)
                                                                    │
                                                          M5 (F8) CANCELADO nesta onda
```

| Ordem | Manter | Cortar desta onda |
|-------|--------|-------------------|
| 1 | F1, F2, gates Patrocinador | — |
| 2 | M3 visual dias 2+5 (se M0+M1 OK) | — |
| 3 | M4 pagamento (paralelo baixo risco) | — |
| 4 | — | **M5 Temporada 2 / F8** |

---

## 6. Quando reabrir F8

Reavaliar **Temporada 2** apenas se **todas** as condições:

1. M0 + M1 + M2 fechados com gate Patrocinador.  
2. M3 (visual noite) entregue sem regressão perf.  
3. Pedido **explícito** do Patrocinador com critério de done (ex.: «uma rua piloto convence»).  
4. Gate CTO se tocar economia ou monetização.

---

## 7. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Ranking funcionalidades | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Roadmap M0–M5 | `docs/learning/2026-08-08-job-000047-roadmap-mg2.md` |
| Multiplayer / pause | `docs/learning/2026-08-07-job-000043-viabilidade-multiplayer-mg2.md`, `docs/learning/2026-08-07-job-000044-viabilidade-botao-pausar-mg2.md` |
| Temporada 2 | `E:\anderson\Projoto motoboy game\docs\TEMPORADA-2-CIDADE-CONVENCE.md` |
| Missão pagamento vs outdoor | `docs/learning/desp-010-observacao-missao.json` |
| Briefing operacional | `docs/mvp/briefing-operacional-mg2.md` |
| ADR-015 | `docs/adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md` |

---

## Resultado da fila

`completed` — parecer entregue: cancelar **Temporada 2 (F8 / M5)** desta onda para acelerar MG2; manter F1–F4 activos e F6 em paralelo baixo risco; sem implementação técnica nem alteração de Constituição/Governança.
