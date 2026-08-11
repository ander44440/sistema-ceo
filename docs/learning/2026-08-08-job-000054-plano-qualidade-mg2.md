# Plano executivo — Qualidade MG2 (JOB-000054)

> **Entrega do Job da fila CEO.** Decisão estratégica única + plano executivo + despacho técnico.  
> **Origem:** MRE (parecer `parecer-c3-1786154231319-hsixlu`).  
> **Data:** 08/08/2026 · **Autor:** CEO MG2 (Autoridade Delegada), registado pelo Engenheiro via fila REQ-045.

---

## 1. Decisão — UMA frente de maior impacto

| Campo | Valor |
|-------|-------|
| **Frente escolhida** | **F4 — Atmosfera noturna / identidade visual cinematográfica (marco M3)** |
| **Alternativas descartadas** | F2 perf (Sprints 1–3 já entregues — JOB-051/052/053; resta gate Patrocinador, não nova frente); F6 pagamento (P2, impacto médio); F8 Temporada 2 (cancelada — JOB-000048) |
| **Filtro ADR-015** | Reativar e completar a noite transforma sessões de playtest em experiência emocionalmente credível — aproxima uso diário Patrocinador ↔ CEO |

### Porquê esta frente

1. **`DAY_ONLY = true` no código** — a identidade visual noturna (dias 1, 3, 4 já feitos) está **desligada**; o jogo corre em manhã clara permanente.
2. **Dias 2 e 5 abertos** no `ROADMAP-MG2.md` — bloom leve + orla/câmera SC são o gap restante para o critério *«noite cinematográfica numa cidade de litoral SC — dá vontade de dirigir»*.
3. **Perf não bloqueia** — chunking/LOD entregues; visual noite estava sempre sequenciado após perf (briefing §6, roadmap M3).
4. **ROI emocional máximo** — controlo (F1) e fluidez (F2) são pré-requisitos de base; **clima + contraste + lugar** é o que distingue protótipo de jogo que motiva sessões longas.

---

## 2. Plano executivo completo (M3)

### Objetivo

Entregar **noite litoral SC v1** jogável: mood SP (contraste, faróis, bloom contido) + território SC (silhueta baixa/média, orla) — sem assets externos, sem expandir mapa.

### Horizonte

| Fase | Duração alvo | Entregável |
|------|--------------|------------|
| **M3-A** | 1 sessão oficina | Reativar ciclo noite + bloom dia 2 (sem estourar faixas) |
| **M3-B** | 1 sessão oficina | Orla/câmera dia 5 + passes FPS mobile/PC |
| **M3-Gate** | ≤ 48 h | Playtest Patrocinador — veredito «dá vontade de dirigir» / ajustes |

### Pré-requisitos

| Item | Estado |
|------|--------|
| F1 moto ereta | Implementado (JOB-000046); gate M0 pendente — **não bloqueia** M3 |
| F2 perf Sprint 1–3 | Entregue (JOB-051/052/053); gate M1 pendente |
| WIP | 1 Job oficina (M3) — dentro do limite ≤ 2 |

### Fases detalhadas

#### M3-A — Noite de volta + brilho contido (dia 2)

| Passo | Detalhe | Critério |
|-------|---------|----------|
| A1 | `DAY_ONLY = false`; default noite ou ciclo completo | Faróis, postes, fachadas emissivas activos |
| A2 | Bloom leve (UnrealBloomPass ou equivalente) | Glow visível **sem** lavar faixas/letreiros (lição dia 2 revertido) |
| A3 | Asfalto mais escuro + roughness baixo | Contraste noite legível |
| A4 | Intensidade freio vermelho / farol branco no tráfego | Trânsito legível à noite |
| A5 | Exposure/tone mapping conservador | Sem «estourar» branco |
| A6 | `SCENE_REV++`; `npm run build` | Build OK |

#### M3-B — Polimento SC + checkpoint (dia 5)

| Passo | Detalhe | Critério |
|-------|---------|----------|
| B1 | Silhueta fundo: morro/orla baixa (não canyon SP) | Litoral SC reconhecível |
| B2 | Ajuste follow câmera (ângulo ligeiramente mais cinematográfico) | Presença motoboy sem nausea |
| B3 | Smoke FPS celular + PC | Sem regressão > 20% vs baseline pós-chunking |
| B4 | Commit + nota checkpoint | `SCENE_REV` documentado |

#### M3-Gate — Patrocinador

| Campo | Valor |
|-------|-------|
| **Sessão** | Hard-refresh `/mg2`; percorrer avenida principal centro → costa à noite |
| **Veredito** | passou / falhou / adiar (≤ 48 h) |
| **Se falhar bloom** | Reverter bloom; manter noite + materiais; commit atómico |
| **Se falhar FPS** | Reduzir bloom radius; não desligar chunking |

### RACI

| Papel | M3-A/B | M3-Gate |
|-------|--------|---------|
| **Engenheiro (oficina)** | R | C (ajustes se falhar) |
| **CEO** | A (aceita Job) | A (regista gate) |
| **Patrocinador** | I | R (playtest) |

### Riscos e mitigação

| ID | Risco | Mitigação |
|----|-------|-----------|
| R-V1 | Bloom repete exagero dia 2 | Threshold/radius baixos; revert < 1 h |
| R-V2 | FPS mobile cai com pós-process | Bloom opcional por `pixelRatio`; testar antes de M3-B |
| R-V3 | `DAY_ONLY` foi ligado por perf | Medir FPS pós-reativação; chunking/LOD já mitigam |
| R-V4 | Confundir com F8 Temporada 2 | Escopo só mood/luz/câmera — zero materiais novos de fachada |

### Fora de escopo M3

- Multi-hub, missões, economia (F6), Temporada 2 (F8)
- Assets externos, fotorealismo
- Rewrite monólito WorldLab2

---

## 3. Despacho técnico ao Engenheiro

**Job publicado:** `JOB-000055` (pending)

| Campo | Valor |
|-------|-------|
| **Título** | MG2 M3: Reativar noite + bloom dia 2 + orla dia 5 |
| **Repo** | `E:\anderson\Projoto motoboy game` |
| **Ficheiro principal** | `src/prototypes/worldLab2/WorldLab2Canvas.jsx` |
| **Referência** | `docs/ROADMAP-MG2.md` (dias 2 e 5) |

**Critério de done:** Hard-refresh `/mg2` à noite; glow visível sem lavar imagem; silhueta SC litoral; `npm run build` OK; `SCENE_REV` incrementado.

---

## 4. Sequência imediata pós-M3

1. Patrocinador gate M3 (48 h).
2. Se passou → CEO pode despachar M4 (F6 pagamento cancelamento) em paralelo baixo risco.
3. Gates M0/M1 (F1/F2) continuam pendentes — lembrete único, sem bloquear M3.

---

## 5. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Ranking funcionalidades | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Roadmap MG2 | `docs/learning/2026-08-08-job-000050-roadmap-mg2.md` |
| Perf Sprint 3 | `docs/learning/2026-08-08-job-000052-perf-sprint3-chunking-mg2.md` |
| Roadmap visual 5 dias | `E:\anderson\Projoto motoboy game\docs\ROADMAP-MG2.md` |
| Briefing operacional | `docs/mvp/briefing-operacional-mg2.md` |
| Código DAY_ONLY | `WorldLab2Canvas.jsx` L74–76 |

---

## Resultado da fila

`completed` — frente única F4/M3 escolhida; plano executivo M3-A/B/Gate entregue; despacho técnico publicado como JOB-000055; sem alteração Constituição/Governança.
