# Briefing Operacional Curado — Motoboy Game 2 (MG2)

> **O que é?** Lastro operacional do COA MG2 para uso diário do CEO (camada de contexto).  
> **Por que existe?** Deliberação CTO 30/07/2026 — Opção A (mitigação imediata); Opção B (ligação arquitetural) condicionada a evidências.  
> **Para quem?** Patrocinador (valida/atualiza); CEO / camada de contexto (lê); Engenheiro (curadoria; oficina executa fora).  
> **Sucesso:** Deliberações e conversas do COA deixam de ser genéricas; na dúvida, o CEO **declara ignorância** e pergunta o mínimo — não inventa Jobs.  
> **Status:** Curado v1.0 — 30/07/2026 · **Gate CTO: ENCERRADO**  
> **Parecer final:** [`../learning/2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md`](../learning/2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md)  
> **Parecer técnico:** [`../learning/2026-07-30-parecer-tecnico-briefing-operacional-mg2.md`](../learning/2026-07-30-parecer-tecnico-briefing-operacional-mg2.md)  
> **Fonte de Gate:** [`../learning/2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md`](../learning/2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md)  
> **Não é:** código do jogo; REQ/ARQ nova; alteração do MRE/Speaker.

---

## 1. Identidade

| Campo | Valor |
|-------|-------|
| COA / projeto | Motoboy Game 2 (**MG2**) |
| IDs conhecidos | `prj-mg2` (catálogo); aliases conversacionais: MG2, «o jogo», Motoboy Game 2 |
| Natureza | Protótipo / jogo 3D web (Three.js + Vite) — cidade **Bombinhas**, cena **WorldLab2** |
| Papel do CEO | Governar foco, decisões, conhecimento e despachos; **não** executar build/deploy/código do MG2 (REQ-030) |
| Oficina | Cursor / repositório do jogo (fora do CEO) |

---

## 2. Objetivo atual (esta janela)

**Uso jogável estável e cidade crível**, com menos travamentos, para o Patrocinador poder desenvolver o MG2 **com o CEO no circuito diário** (ADR-015).

Filtro: *Isto aproxima o uso diário do CEO no desenvolvimento do MG2?*

---

## 3. Estado técnico (resumo)

| Item | Estado (30/07/2026) |
|------|---------------------|
| Repo do jogo | `E:\anderson\Projoto motoboy game` (package `motoboy-game-2`) |
| Entrada principal | Rotas `/` e `/mg2` → WorldLab2; `/lab` → LabMg2 |
| Dev server típico | Vite — se 5173 ocupada pelo CEO, usar outra porta (ex. **5174**) |
| Cena | Mundo grande montado de uma vez (`WorldLab2Canvas.jsx`); monolítico |
| Perf Sprint 1 | Feito: raio de update ~140 m (tráfego/pedestres/portas/materiais); `pixelRatio` adaptativo; `SCENE_REV` 147 |
| Perf Sprint 2/3 | **Não** feitos: LOD; streaming/chunks |
| Outdoors avenida | Laterais dos prédios + luminosos piscantes (JOB-000010, 30/07) |
| Ciclo dia/noite no protótipo | `DAY_ONLY = true` (só dia) no WorldLab2 atual |

---

## 4. Dores ativas

1. **Hitch / carga** — cidade inteira na memória; Sprint 1 mitiga CPU por frame; load inicial e draw longe ainda pesados.  
2. **CEO sem lastro** (em mitigação por **este** briefing) — deliberações genéricas / Jobs fracos.  
3. **Parecer consultivo vs ação** — observação de produto registada; **sem** mudança de MRE até novo Gate.

---

## 5. Decisões recentes (curadas)

| Quando | Decisão |
|--------|---------|
| 23/07/2026 | DEC-MVP-001 — taxa do motoboy **zerada** (não rateada) em corrida cancelada |
| 30/07/2026 | Outdoors nas **laterais** (não na frente) + tipo luminoso piscante |
| 30/07/2026 | Perf: primeiro **raio de update**; depois LOD; depois chunks |
| 30/07/2026 | CTO: lastro via **briefing/contexto**; **proibido** “fingir” conhecimento no MRE/Speaker |

---

## 6. Próximo passo único (foco)

1. **Validar Sprint 1 de perf** com o Patrocinador no WorldLab2 (sensação de stutter).  
2. Se ok → planear **LOD (Sprint 2)** na oficina; se insuficiente → reavaliar raio / esconder mais meshes.  
3. Manter este briefing **atualizado** após cada decisão relevante do dia.

---

## 7. Fora de escopo agora (não deliberar / não despachar sem Gate)

- Embutir pipeline/build do MG2 no CEO  
- Alterar MRE / Speaker / schema de parecer “para conhecer o MG2”  
- Multiplayer, monetização/pagamento complexa, reescrever a cidade inteira de uma vez  
- Abrir VIS→REQ→ARQ da Opção B sem evidências de uso deste briefing  

---

## 8. Fontes da verdade

| O quê | Onde |
|-------|------|
| Identidade do COA | [`contexto-mg2.md`](./contexto-mg2.md) |
| Este briefing | Este ficheiro |
| Decisões MVP | [`decisoes.md`](./decisoes.md) |
| Conhecimentos de uso | [`conhecimentos-uso-diario.md`](./conhecimentos-uso-diario.md) |
| Fila de execução | `executive/queue/` (CEO) |
| Código do jogo | Repo `Projoto motoboy game` — oficina |

---

## 9. Regras para o CEO (camada de contexto)

1. Tratar factos deste briefing como **conhecimento do COA**, não inventar detalhe de implementação.  
2. Se faltar dado (ex.: margem financeira, métricas de loja): **declarar lacuna** e pedir o mínimo — não publicar Job impossível.  
3. Pedidos de código/build/3D → despacho à **oficina** (fila / Cursor), com título e descrição concretos.  
4. Não confundir “parecer analítico” com “ação operacional” sem o Patrocinador pedir execução.  
5. Atualizar este briefing (ou pedir atualização) quando o próximo passo ou as dores mudarem.

---

## 10. Memória — curadoria v1.0

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (compilou); mandato CTO Opção A; Patrocinador pode emendar |
| Quando | 30/07/2026 |
| Por quê | Mitigar bloqueio de uso diário do COA MG2 |
| Baseado em quê | Deliberação CTO Opção C; sessão 30/07; DEC-MVP-001; estado WorldLab2 |
| Resultado | Briefing Curado v1.0 publicado; espelho em `briefingsProjeto.js` |
