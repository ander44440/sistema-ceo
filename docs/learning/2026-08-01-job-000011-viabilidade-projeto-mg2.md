# Análise de Viabilidade — Motoboy Game 2 (JOB-000011)

> **Entrega do Job da fila CEO.** Recolha de dados e avaliação de viabilidade/desafios do COA `prj-mg2`.  
> **Origem:** MRE (parecer `parecer-3e7c2fd2-4c34-4bc6-b65c-d1c0d41c3357`) — pedido de diagnóstico do projeto.  
> **Data:** 01/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Veredito executivo

| Dimensão | Avaliação |
|----------|-----------|
| **Viabilidade técnica** | **Alta** — stack madura (Vite + React + Three.js), build OK, jogo jogável, repo ativo |
| **Viabilidade operacional (CEO↔MG2)** | **Média** — briefing curado v1.0 mitiga lacuna; caminho MRE ainda fraco (OE-01); fila REQ-045 funcional |
| **Viabilidade de uso diário (ADR-015)** | **Média-alta** — Sprint 1 perf entregue; bloqueador de jogabilidade (moto vertical) aberto; foco claro |
| **Risco principal** | Monólito `WorldLab2Canvas.jsx` (~14k linhas) + cidade inteira em memória — escala futura exige LOD/chunks |
| **Recomendação** | **Prosseguir** com validação Sprint 1 perf (Patrocinador) antes de Sprint 2; fechar bug da moto (P1 do plano JOB-000007) |

---

## 2. Identidade e objetivo do projeto

| Campo | Valor (fontes: briefing, contexto, repo) |
|-------|------------------------------------------|
| Nome | Motoboy Game 2 (MG2) |
| IDs | `prj-mg2`; aliases: MG2, «o jogo» |
| Natureza | Protótipo / jogo 3D web — cidade **Bombinhas**, cena **WorldLab2** |
| Objetivo atual | Uso jogável estável e cidade crível, com menos travamentos, para desenvolvimento diário com o CEO no circuito |
| Papel do CEO | Governar foco, decisões, conhecimento e despachos — **não** executar código/build do MG2 (REQ-030) |
| Oficina | Repo `E:\anderson\Projoto motoboy game` (package `motoboy-game-2`) |

---

## 3. Dados técnicos recolhidos (01/08/2026)

### 3.1 Repositório do jogo

| Item | Evidência |
|------|-----------|
| Stack | React 18, Three.js 0.171, Vite 6, Tailwind 3 |
| Entrada | `/` e `/mg2` → WorldLab2; `/lab` → LabMg2 |
| Build produção | **OK** — `npm run build` conclui em ~19 s; bundle JS ~936 kB (gzip ~269 kB) |
| Git | **Detached HEAD** em `6f21ba5`; branch `main` existe; alterações locais não commitadas (incl. `WorldLab2Canvas.jsx`) |
| Cena | `SCENE_REV = 147`; `DAY_ONLY = true` (só dia no protótipo atual) |
| Monólito | `WorldLab2Canvas.jsx` — **~14 243 linhas**, ~500 kB |

### 3.2 Performance e escala

| Item | Estado |
|------|--------|
| Sprint 1 perf | **Feito** — raio de update ~140 m; `pixelRatio` adaptativo |
| Sprint 2 LOD | **Não feito** |
| Sprint 3 streaming/chunks | **Não feito** |
| Carga | Cidade inteira montada de uma vez — hitch/load inicial ainda pesados |
| Outdoors | Laterais + luminosos piscantes (JOB-000010, 30/07) |

### 3.3 Jogabilidade

| Item | Estado |
|------|--------|
| Bug moto vertical | **Aberto** — prioridade máxima em `docs/START-TOMORROW.md`; não é empino |
| Controles | Moto, heli, touch mobile — documentados no README |
| Roadmap visual 5 dias | Dias 1, 3, 4 ✅; dia 2 revertido; dia 5 pendente (após bug moto) |

### 3.4 Temporada 2 — Cidade Convence

| Sistema | Status |
|---------|--------|
| Materiais V1 | Em desenvolvimento — aguardando Gate |
| Fachadas, mobiliário, calçadas, comunicação visual | Fila |
| Regra | Arquitetura + impacto perf **antes** de implementar |

### 3.5 Arquivo multi-hub

Branch `archive/mg2-multi-hub-sc` preservada; expansão SC (Bombinhas · Porto Belo · BC) **fora de escopo imediato** — núcleo enxuto prioritário.

---

## 4. Dados organizacionais (CEO)

| Item | Estado |
|------|--------|
| Contexto ativo MG2 | Homologado (REQ-017, Gate E1) |
| Briefing operacional curado v1.0 | Publicado 30/07; Gate CTO encerrado |
| Lacuna MRE ↔ briefing | **Confirmada** (OE-01); B1 autorizado (injetar briefing na entrada MRE) |
| Fila de execução | REQ-045 operacional; Jobs concretos entregam (ex.: JOB-000010 outdoors) |
| Decisões recentes | DEC-MVP-001 (taxa zerada em cancelamento); perf raio→LOD→chunks |
| Conhecimentos de uso | KNW-DIA-001 (edge case taxa); acervo ainda fino |

---

## 5. Fatores de viabilidade (positivos)

1. **Produto jogável hoje** — dev server, build, controles, trânsito, áudio, heli, outdoors.
2. **Stack simples e conhecida** — sem dependências exóticas; um dev (Patrocinador + Cursor) sustenta o ritmo.
3. **Governança CEO↔MG2 definida** — fronteiras claras (CEO governa; oficina executa); ADR-015 ancora priorização.
4. **Briefing curado** — lastro operacional mínimo existe; mitiga deliberações totalmente cegas.
5. **Entregas recentes comprovadas** — Sprint 1 perf, outdoors laterais, plano arquitetura (JOB-000007).
6. **Roadmap incremental** — Temporada 2 por sistemas (materiais → fachadas → …) com Gate; evita rewrite.
7. **Arquivo preservado** — multi-hub não perdido; expansão futura possível sem recomeçar do zero.

---

## 6. Desafios e riscos

| # | Desafio | Severidade | Mitigação conhecida |
|---|---------|------------|---------------------|
| D1 | Monólito 14k linhas — manutenção e regressões | Alta | Extração cirúrgica (P5 JOB-000007); não rewrite |
| D2 | Perf — cidade inteira em memória | Alta | LOD (Sprint 2) e chunks (Sprint 3) já planeados |
| D3 | Bug moto vertical — bloqueia sensação de jogo | Alta | P1 plano JOB-000007; vídeo de referência existe |
| D4 | Git detached HEAD + working tree sujo | Média | P0 plano — fixar branch antes de trabalho diário |
| D5 | CEO/MRE sem lastro completo do briefing | Média | B1 implementado; validar em uso real |
| D6 | Bundle >500 kB — load inicial web | Média | Code-split futuro; aceitável para protótipo local |
| D7 | Temporada 2 materiais V1 sem Gate fechado | Baixa-média | Aguardar aprovação antes de avançar fila visual |
| D8 | Tensão parecer consultivo vs Job operacional | Baixa (produto CEO) | Observação registada; não bloqueia MG2 |

---

## 7. Fora de escopo / não viável agora (sem Gate)

- Embutir pipeline/build do MG2 no CEO
- Multiplayer, monetização complexa, rewrite da cidade inteira
- Expansão multi-hub SC completa
- Alterar MRE/Speaker para «conhecer» o jogo por código

---

## 8. Próximo passo recomendado (alinhado ao briefing §6)

1. **Validar Sprint 1 perf** com o Patrocinador no WorldLab2 (stutter/hitch).
2. Se ok → planear **LOD (Sprint 2)** na oficina; se insuficiente → reavaliar raio.
3. **Paralelo:** fechar bug da moto (bloqueador de jogabilidade).
4. Manter briefing atualizado após cada decisão relevante.

*(JOB-000014 na fila espelha este foco — prioridades diárias.)*

---

## 9. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Briefing operacional MG2 | `docs/mvp/briefing-operacional-mg2.md` |
| Contexto ativo | `docs/mvp/contexto-mg2.md` |
| Plano arquitetura (JOB-000007) | `docs/learning/2026-07-30-job-000007-plano-arquitetura-mg2.md` |
| Lacuna conhecimento COA | `docs/learning/2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md` |
| Evidência briefing insuficiente MRE | `docs/learning/2026-07-30-evidencia-briefing-insuficiente-caminho-mre.md` |
| Repo MG2 — START-TOMORROW | `E:\anderson\Projoto motoboy game\docs\START-TOMORROW.md` |
| Repo MG2 — ROADMAP | `E:\anderson\Projoto motoboy game\docs\ROADMAP-MG2.md` |
| Repo MG2 — Temporada 2 | `E:\anderson\Projoto motoboy game\docs\TEMPORADA-2-CIDADE-CONVENCE.md` |
| Inspeção direta | `package.json`, `WorldLab2Canvas.jsx`, `npm run build`, `git status` |

---

## Resultado da fila

`completed` — análise de viabilidade com dados recolhidos; sem implementação técnica neste Job.
