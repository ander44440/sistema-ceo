# Prioridades Diárias — COA MG2 (JOB-000014)

> **Entrega do Job da fila CEO.** Estabelecer e comunicar prioridades diárias à equipa do projeto COA MG2.  
> **Origem:** MRE (parecer `parecer-01fea21c-607e-407a-96b8-2865795cce4c`) — alinhado ao JOB-000011 (viabilidade).  
> **Data:** 01/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Foco do dia (CX-09)

**Validar Sprint 1 de performance no WorldLab2** — antes de qualquer planeamento de Sprint 2 (LOD).

Regra de ouro: **Sprint 2 fica bloqueada** até o Patrocinador confirmar (ou rejeitar) a sensação de stutter/hitch após a Sprint 1.

---

## 2. Equipa e papéis

| Papel | Quem | Responsabilidade hoje |
|-------|------|------------------------|
| **Patrocinador** | Anderson | Gate: jogar WorldLab2 e dar veredito sobre perf Sprint 1 |
| **CEO** | Sistema Executivo | Manter foco; não autorizar LOD/Sprint 2 sem evidência do gate |
| **Engenheiro** | Cursor (oficina) | Executar só o que o gate desbloquear; bug moto em paralelo se autorizado |
| **CTO** | ChatGPT | Consulta estratégica — não bloqueia o gate operacional |

---

## 3. Prioridades ordenadas

| # | Prioridade | O quê | Quem | Estado |
|---|------------|-------|------|--------|
| **P0** | **Gate** | Validar Sprint 1 perf no WorldLab2 (stutter/hitch, raio ~140 m, `pixelRatio` adaptativo, SCENE_REV 147) | Patrocinador | **Pendente** |
| **P1** | Paralelo (oficina) | Corrigir bug da moto vertical («de pé» — **não** é empino; ver `START-TOMORROW.md`) | Engenheiro | Aberto |
| **—** | **Bloqueado** | Planeamento e implementação **Sprint 2 LOD** | Todos | **Até P0 passar** |
| **P2** | Manutenção | Atualizar briefing após decisão do gate; manter fila CEO concreta | CEO + Engenheiro | Contínuo |

### Critérios do gate P0

1. Abrir WorldLab2 (`/` ou `/mg2`) — repo `E:\anderson\Projoto motoboy game`.
2. Percorrer a cidade (orla, avenida, tráfego denso) com W seguro.
3. Responder ao CEO: **melhorou / igual / pior** — sensação de hitch e stutter.
4. Se **melhorou ou igual aceitável** → CEO autoriza planear LOD (Sprint 2) na oficina.
5. Se **insuficiente** → reavaliar raio de update / esconder mais meshes **antes** de LOD.

---

## 4. O que **não** fazer hoje

- Abrir Sprint 2 (LOD) sem resultado do gate P0.
- Rewrite do monólito `WorldLab2Canvas.jsx` (~14k linhas).
- Temporada 2 (materiais V1, fachadas) — aguarda Gate próprio.
- Alterar MRE/Speaker/Constituição por causa deste despacho.
- Tratar outdoors (JOB-000010, feito) como competidor do gate perf.

---

## 5. Sequência recomendada (Kanban — JOB-000005)

```
A fazer          Em curso (WIP≤2)     Revisão           Feito
─────────────────────────────────────────────────────────────────
[P0 Gate perf] → Patrocinador testa → Veredito ao CEO → Sprint 2?
[P1 Bug moto]  → Oficina (paralelo) → Reteste W seguro  → Jogável
[Bloqueado LOD]   (espera P0)
```

---

## 6. Comunicação à equipa

### Para o Patrocinador

> Hoje o foco único do circuito CEO↔MG2 é **validar a Sprint 1 de perf**. Abra o WorldLab2, jogue 10–15 minutos e diga se o stutter melhorou. Sem isso, não abrimos LOD.

### Para o Engenheiro (oficina)

> **Não** iniciar LOD hoje. Pode trabalhar no **bug da moto vertical** (P1) em paralelo — bloqueador de jogabilidade documentado em `docs/START-TOMORROW.md`. Aguardar veredito P0 antes de qualquer Job de perf Sprint 2.

### Para o CEO

> Foco declarado: **P0 gate perf**. Bloquear despachos de Sprint 2 até evidência. Próximo passo após gate: se ok → Job concreto «planear LOD Sprint 2»; se não → Job «reavaliar raio Sprint 1».

---

## 7. Fontes

| Fonte | Caminho |
|-------|---------|
| Briefing operacional | `docs/mvp/briefing-operacional-mg2.md` §6 |
| Viabilidade (JOB-000011) | `docs/learning/2026-08-01-job-000011-viabilidade-projeto-mg2.md` |
| Plano arquitetura | `docs/learning/2026-07-30-job-000007-plano-arquitetura-mg2.md` |
| Bug moto (oficina) | `E:\anderson\Projoto motoboy game\docs\START-TOMORROW.md` |
| Kanban recomendado | `docs/learning/2026-07-30-job-000005-scrum-vs-kanban.md` |

---

## Resultado da fila

`completed` — prioridades diárias definidas e comunicadas; gate Sprint 1 → Sprint 2 estabelecido; sem alteração de Constituição/Governança.
