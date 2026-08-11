# Identificação de Problemas e Plano Executivo — MG2 (JOB-000057)

> **Entrega do Job da fila CEO.** 20 maiores problemas do Motoboy Game 2, com foco nos 5 críticos e plano executivo baseado em dados concretos.  
> **Origem:** MRE (parecer `parecer-c7f0dfea-c995-40e5-809a-706e31595e76`).  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Metodologia

| Aspecto | Critério |
|---------|----------|
| **Escopo** | Projeto `prj-mg2` — jogo (repo oficina) + circuito CEO↔MG2 (governança, briefing, fila) |
| **Evidência** | Inspeção directa do repo jogo (08/08/2026); acervo CEO (`docs/mvp`, `docs/learning`); Jobs REQ-045 entregues |
| **Severidade** | Bloqueio de uso diário (ADR-015) > risco técnico > dívida organizacional > expansão futura |
| **Filtro** | *«Isto impede ou degrada o uso diário Patrocinador ↔ CEO no MG2?»* |

**Dados recolhidos hoje (repo jogo):**

| Métrica | Valor | Fonte |
|---------|-------|-------|
| `WorldLab2Canvas.jsx` | **16 066 linhas**, ~510 kB | Inspeção directa |
| `SCENE_REV` | **152** | Código L77 |
| `DAY_ONLY` | **`false`** (noite activa) | Código L79; JOB-000055 |
| LOD + chunking | Implementados (Sprints 2–3) | JOB-051/052; código L103–220, L424+ |
| `syncMotoUpright` | Presente | JOB-000046; código L1278+ |
| Build produção | **956 kB** JS (gzip ~274 kB), ~19 s | `npm run build` 08/08/2026 |
| Git | **Detached HEAD** `6f21ba5`; WIP extensivo | `git status` |
| Sistema missão/pagamento | **Ausente** no código | grep `corrida|missao|taxa|payout` → zero |

---

## 2. Os 20 maiores problemas (ordenados por severidade)

| # | Problema | Severidade | Evidência | Estado |
|---|----------|------------|-----------|--------|
| **P01** | **Gates M0/M1/M3 nunca fechados** — F1, perf S1–S3 e M3 entregues na oficina, mas **zero veredito Patrocinador** | **Crítica** | JOB-046/051/052/053/055 `completed`; roadmap M0/M1/M3-Gate «pendente» em todos os docs desde 01/08 | Aberto |
| **P02** | **Briefing operacional desactualizado** — CEO decide com lastro errado | **Crítica** | `briefing-operacional-mg2.md` §3 ainda diz Sprint 2/3 «Não feitos» e `DAY_ONLY=true`; código tem LOD/chunks e `DAY_ONLY=false` | Aberto |
| **P03** | **Monólito `WorldLab2Canvas.jsx` (~16k LOC)** — cresceu +1,8k linhas desde JOB-000011 | **Crítica** | 14 243 linhas (01/08) → 16 066 (08/08); risco regressão a cada sprint | Aberto |
| **P04** | **Git detached HEAD + working tree sujo** — perda de trabalho e diffs ilegíveis | **Alta** | `git status`: HEAD `(no branch)`, `MM WorldLab2Canvas.jsx`, ficheiros staged/untracked | Aberto |
| **P05** | **DEC-MVP-001 não implementado** — regra de pagamento em cancelamento só existe em docs | **Alta** | `decisoes.md` 23/07; grep código jogo: zero lógica missão/taxa | Aberto |
| P06 | Load inicial web pesado — bundle >500 kB sem code-split | Alta | Build Vite warning; JOB-000011 §3.1 | Parcialmente aceitável (protótipo local) |
| P07 | Validação perf subjetiva — sem métricas FPS capturadas | Alta | Todos os gates pedem «sensação»; nenhum registro numérico | Aberto |
| P08 | Histórico de reversão visual (bloom dia 2) | Média-alta | `START-TOMORROW.md` dia 2 «revertido»; M3 reimplementado (JOB-055) mas gate pendente | Monitorizar |
| P09 | HMR vs hard-refresh — `SCENE_REV` como workaround | Média | Múltiplos Jobs incrementam SCENE_REV para forçar remount | Recorrente |
| P10 | Zero testes automatizados no jogo | Média-alta | Repo jogo: sem suite de smoke/playwright | Aberto |
| P11 | Documentação partida CEO ↔ repo jogo | Média | Briefing CEO; ROADMAP/CHECKPOINT no repo jogo; sync manual | Aberto |
| P12 | Lacuna MRE ↔ briefing (OE-01) | Média | JOB-000011 §4; B1 autorizado mas validação uso real pendente | Mitigação parcial |
| P13 | Embrete BR-101 — risco de trabalho «invisível» | Média | `START-TOMORROW.md` §0; padrão heliporto | Vigilância |
| P14 | Pausar in-game inexistente (≠ CEO Pausar) | Média-baixa | JOB-000044/045; grep jogo sem pause | Adiado (correcto) |
| P15 | Temporada 2 cancelada (M5) mas ficheiros parciais no repo | Média-baixa | `buildingMaterials.js` untracked; JOB-000048 | Risco scope creep |
| P16 | Canal de feedback = um único utilizador | Média | JOB-000042 metodologia | Limitação conhecida |
| P17 | Mobile FPS não registado pós-chunking | Média | JOB-052 pede smoke mobile; sem artefacto de resultado | Aberto |
| P18 | Economia/missões inexistentes além de DEC-MVP-001 | Média | Sem sistema corrida/pagamento no código | Aberto |
| P19 | Multiplayer pedido implicitamente mas fora de escopo | Baixa | JOB-000043; briefing §7 | Adiado (correcto) |
| P20 | Expansão multi-hub arquivada — tentação de reabrir cedo | Baixa | Branch `archive/mg2-multi-hub-sc`; checkpoint 15/jul | Adiado (correcto) |

---

## 3. Top 5 críticos — detalhe executivo

### P01 — Gates de validação bloqueados (M0 + M1 + M3)

| Campo | Valor |
|-------|-------|
| **Sintoma** | Oficina entrega fixes; ninguém confirma se funcionam no playtest real |
| **Impacto** | Decisões subsequentes (M4, nova onda) baseadas em suposição — viola princípio «gate obrigatório» (JOB-000050) |
| **Dados** | 5 Jobs técnicos `completed` desde 07/08; **0** gates Patrocinador registados |
| **Resolução** | **Sessão única de playtest** (~30 min): checklist M0 + M1 + M3 num hard-refresh `/mg2` |

**Checklist consolidado (sessão gate única):**

- [ ] M0: W seguro 1ª→5ª — moto ereta (`syncMotoUpright`)
- [ ] M0: double-tap W (empino intencional) ainda funciona
- [ ] M1: sessão ≥10 min tráfego denso — veredito stutter (melhorou/aceitável/insuficiente)
- [ ] M1: cruzar centro → costa — sem hitch ao activar chunks
- [ ] M3: noite activa — glow sem lavar faixas; orla SC reconhecível
- [ ] Resposta explícita por marco: **passou / falhou / adiar**

---

### P02 — Briefing operacional desactualizado

| Campo | Valor |
|-------|-------|
| **Sintoma** | CEO e Jobs futuros citam estado de Julho (Sprint 2/3 «não feitos», só dia) |
| **Impacto** | Despachos duplicados ou contraditórios; perda de confiança no circuito CEO↔oficina |
| **Dados** | Briefing §3 vs código: LOD ✓, chunks ✓, `DAY_ONLY=false` ✓, `SCENE_REV=152` |
| **Resolução** | Actualizar `docs/mvp/briefing-operacional-mg2.md` §3–§6 após gates; espelho em `briefingsProjeto.js` |

**Campos a actualizar (mínimo):**

| Campo briefing | Valor correcto (08/08) |
|----------------|------------------------|
| Perf Sprint 2 | Feito (LOD, JOB-051) |
| Perf Sprint 3 | Feito (chunking, JOB-052) |
| F1 bug moto | Fix entregue; gate M0 pendente |
| Ciclo dia/noite | `DAY_ONLY=false`; M3 entregue; gate M3 pendente |
| Próximo passo | Gates M0/M1/M3 → M4 pagamento |

---

### P03 — Monólito 16k LOC

| Campo | Valor |
|-------|-------|
| **Sintoma** | Toda a lógica (física, tráfego, render, áudio, UI) num único ficheiro |
| **Impacto** | Cada alteração (perf, visual, bug) arrisca regressão cruzada; tempo de navegação ↑ |
| **Dados** | +1 823 linhas em 7 dias; plano JOB-000007 P5 recomenda extração cirúrgica, não rewrite |
| **Resolução** | Após gates: extrair **1 módulo por sprint** (ex.: `buildingLod.js`, `spatialChunks.js`, `motoPhysics.js`) |

---

### P04 — Git detached HEAD + WIP sujo

| Campo | Valor |
|-------|-------|
| **Sintoma** | Repo jogo sem branch activa; alterações staged e unstaged misturadas |
| **Impacto** | Commits perdidos; impossível bissect regressões; merge futuro arriscado |
| **Dados** | HEAD `6f21ba5`; `MM WorldLab2Canvas.jsx`; ficheiros novos unstaged |
| **Resolução** | Job oficina P0: `git checkout main` → commit atómico por entrega (F1, LOD, chunks, M3) |

---

### P05 — DEC-MVP-001 não implementado

| Campo | Valor |
|-------|-------|
| **Sintoma** | Decisão «taxa zerada em corrida cancelada» existe só em `decisoes.md` |
| **Impacto** | Economia de missão incoerente quando sistema for activado; dívida desde 23/07 |
| **Dados** | grep código: zero `corrida`, `missao`, `taxa`, `payout` |
| **Resolução** | Marco M4 (JOB-000050): Job oficina baixo risco **após** gates M0/M1; edge case isolado |

---

## 4. Plano executivo de resolução

### Horizonte: 2 semanas (S1–S2, Ago/2026)

```
Semana 1                          Semana 2
─────────                         ─────────
[GATE] M0+M1+M3 playtest    →     [DOC] Briefing v1.1
[GIT] Fix branch + commits  →     [M4] DEC-MVP-001 payout
                                  [REF] Extrair 1º módulo monólito
```

### Fase G — Gate único (Semana 1, dia 1–2)

| Passo | Responsável | Entregável | Critério done |
|-------|-------------|------------|---------------|
| G1 | Patrocinador | Vereditos M0/M1/M3 | Checklist §3 P01 completo |
| G2 | CEO | Registo gates + próximo Job | Entrada em `docs/mvp/estado-do-dia.md` ou learning |
| G3 | Engenheiro | Follow-up só se «falhou» | Job targeted com repro |

**Regra:** Se M1 = «insuficiente» → **não** abrir M4 nem extração monólito; reavaliar raio/chunks primeiro.

---

### Fase D — Documentação (Semana 1, pós-gate)

| Passo | Responsável | Entregável |
|-------|-------------|------------|
| D1 | CEO/Engenheiro | `briefing-operacional-mg2.md` v1.1 |
| D2 | Engenheiro | Espelho `briefingsProjeto.js` |
| D3 | CEO | Actualizar `PROXIMO.md` / despachos alinhados ao estado real |

---

### Fase V — Versionamento (Semana 1, paralelo)

| Passo | Detalhe |
|-------|---------|
| V1 | `git checkout main` no repo jogo |
| V2 | Commits atómicos: F1 (148), LOD (149), chunks (150), M3 (152) |
| V3 | Tag ou nota checkpoint com `SCENE_REV` |

---

### Fase M4 — Pagamento cancelamento (Semana 2, P2)

| Passo | Detalhe | Critério |
|-------|---------|----------|
| M4-A | Identificar ou criar hook de «corrida cancelada» | Código localizado |
| M4-B | Aplicar DEC-MVP-001: taxa = 0 | Smoke edge case |
| M4-C | Registar em `decisoes.md` como implementado | Link commit |

**Pré-requisito:** Gates M0/M1 não críticos abertos; WIP ≤ 2.

---

### Fase R — Refactor cirúrgico (Semana 2+, P3)

| Passo | Módulo candidato | Linhas estimadas |
|-------|------------------|------------------|
| R1 | `spatialChunks.js` | ~150 |
| R2 | `buildingLod.js` | ~120 |
| R3 | `motoPhysics.js` (`syncMotoUpright` + loop) | ~200 |

**Regra JOB-000007:** extração mínima; **não** rewrite; build + smoke após cada extração.

---

### Problemas adiados (não bloqueiam ADR-015 agora)

| Problema | Acção | Quando |
|----------|-------|--------|
| P06 bundle size | Code-split / lazy routes | Pós-M4 |
| P10 testes auto | Smoke script mínimo (W seguro + FPS log) | Pós-gate |
| P14 pause in-game | Não despachar | Gate próprio |
| P15 Temporada 2 parcial | Remover ou arquivar `buildingMaterials.js` untracked | Com gate M5 |
| P19/P20 multiplayer/expansão | Manter fora escopo | Briefing §7 |

---

## 5. RACI do plano

| Fase | Patrocinador | CEO | Engenheiro |
|------|--------------|-----|------------|
| G — Gates | **R** (playtest) | A (registo) | C (repro se falhar) |
| D — Briefing | I | A | R |
| V — Git | I | A | R |
| M4 — Pagamento | C (edge case) | A | R |
| R — Refactor | I | A | R |

---

## 6. Riscos do plano

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Gate adiado indefinidamente | CEO lembrete único; não despachar M4/refactor antes |
| R2 | M3 bloom repete exagero | Reverter bloom; manter noite (lição dia 2) |
| R3 | Extração monólito quebra jogo | 1 módulo/sprint; commit atómico; smoke imediato |
| R4 | Briefing actualizado antes do gate | Sequência: gate primeiro, doc depois |

---

## 7. Despachos recomendados ao CEO (pós-este Job)

| Prioridade | Job sugerido | Bloqueado por |
|------------|--------------|---------------|
| **Imediato** | Sessão gate M0+M1+M3 (Patrocinador — **não** Job oficina) | — |
| **P0 oficina** | Git: fixar branch + commits atómicos MG2 | Gate (pode paralelizar) |
| **P1 oficina** | Actualizar briefing v1.1 | Gate concluído |
| **P2 oficina** | M4: implementar DEC-MVP-001 | Gates M0/M1 OK |
| **P3 oficina** | Extrair `spatialChunks.js` | M1 passou |

---

## 8. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Briefing operacional | `docs/mvp/briefing-operacional-mg2.md` |
| Decisões MVP | `docs/mvp/decisoes.md` |
| Ranking funcionalidades | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Viabilidade | `docs/learning/2026-08-01-job-000011-viabilidade-projeto-mg2.md` |
| Roadmap | `docs/learning/2026-08-08-job-000050-roadmap-mg2.md` |
| F1 / perf / M3 Jobs | JOB-046, 051, 052, 053, 055 |
| Repo jogo — START-TOMORROW | `E:\anderson\Projoto motoboy game\docs\START-TOMORROW.md` |
| Repo jogo — código | `WorldLab2Canvas.jsx` (inspecção + build) |
| ADR-015 | `docs/adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md` |

---

## Resultado da fila

`completed` — 20 problemas identificados com evidência; top 5 críticos detalhados; plano executivo G→D→V→M4→R entregue; sem implementação técnica nem alteração Constituição/Governança.
