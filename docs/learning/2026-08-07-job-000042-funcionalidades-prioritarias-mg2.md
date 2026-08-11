# Identificação de Funcionalidades Prioritárias — MG2 (JOB-000042)

> **Entrega do Job da fila CEO.** Funcionalidades de maior impacto no Motoboy Game 2, ordenadas por feedback documentado de utilizadores.  
> **Origem:** MRE (parecer `parecer-bfd7fef9-dd7e-4a73-bf6e-07bc11cc1136`).  
> **Data:** 07/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Metodologia

| Aspecto | Critério |
|---------|----------|
| **Utilizador** | Patrocinador (Anderson) — único jogador real documentado; feedback directo (vídeo, sessões CEO, decisões MVP) |
| **Evidência** | Artefactos com citação explícita do utilizador ou sintoma observado em playtest |
| **Impacto** | Bloqueio de jogabilidade > sensação de fluidez > identidade visual > economia/missões > expansão |
| **Filtro ADR-015** | «Aproxima o uso diário do CEO no desenvolvimento do MG2?» |

**Nota:** Não há canal formal de feedback de jogadores externos. A análise usa o acervo interno (briefing, checkpoints, roadmap, sessões CEO, decisões MVP).

---

## 2. Ranking de funcionalidades por impacto

| Rank | Funcionalidade | Impacto | Evidência de feedback | Estado | Acção recomendada |
|------|----------------|---------|----------------------|--------|-------------------|
| **F1** | **Corrigir bug da moto vertical («de pé»)** | **Crítico** — quebra imersão e confiança no controlo | Vídeo do utilizador (`START-TOMORROW.md`); citação explícita: *«NÃO É O EMPINO»*; prioridade máxima oficina | **Aberto** | Job oficina P1; smoke test W seguro em `/mg2` |
| **F2** | **Performance / fluidez (stutter, hitch, carga)** | **Alto** — impede sessões longas e uso diário | Briefing §4 «Dores ativas»; gate P0 JOB-000014; critério roadmap «dá vontade de dirigir» | Sprint 1 feito; **gate Patrocinador pendente** | Validar Sprint 1; se ok → LOD (Sprint 2) |
| **F3** | **Controles mobile + tela cheia + LAN** | **Alto** — jogo jogável no telemóvel | Checkpoint 15/jul: touch só no celular, fullscreen, `host: true` | **Entregue** (baseline) | Manter em smoke test de cada pacote |
| **F4** | **Atmosfera noturna / identidade visual (mood SP + litoral SC)** | **Médio-alto** — motivação emocional para jogar | Roadmap 5 dias: meta «noite cinematográfica… dá vontade de dirigir»; dias 1,3,4 ✅; dia 2 revertido por feedback visual | **Parcial** | Retomar dia 2 (bloom leve) e dia 5 (orla/câmera) **após F1** |
| **F5** | **Trânsito credível + polícia + estacionamento** | **Médio** — cidade «viva» | Checkpoint 15/jul elogia engarrafamento, policial, ciclo estacionamento | **Entregue** | Preservar ao optimizar perf (F2) |
| **F6** | **Regra de pagamento em corrida cancelada** | **Médio** — clareza de missão/economia | Estado do dia 23/jul; DEC-MVP-001; missão DESP-010: utilizador escolheu **pagamento** sobre outdoor | Decisão tomada; **implementação jogo** incerta | Job oficina: edge case payout (KNW-DIA-001) |
| **F7** | **Outdoors laterais + luminosos** | **Médio** | Decisão 30/jul (laterais, não frente); JOB-000010 entregue | **Entregue** | Não competir com F1/F2; manter |
| **F8** | **Temporada 2 — materiais e fachadas (cidade convence)** | **Médio-baixo agora** | `TEMPORADA-2-CIDADE-CONVENCE.md`; utilizador adiou outdoor para pagamento (DESP-010) | Gate aberto | Só após F1+F2; um sistema de cada vez |
| **F9** | **Expansão multi-hub / BR-101** | **Baixo (adiado)** | Roadmap: núcleo enxuto; embrete BR-101 alerta para trabalho «sem o jogador ver» | Arquivado | Não despachar sem Gate próprio |

---

## 3. Top 3 — detalhe executivo

### F1 — Bug da moto vertical

| Campo | Valor |
|-------|-------|
| Sintoma | Moto fica vertical/de ponta-cabeça ao segurar W (marchas 3ª→5ª); confundido com empino |
| Feedback | Utilizador grava vídeo e distingue explicitamente do recurso de empino |
| Impacto | Bloqueador de jogabilidade — impede validar qualquer outra melhoria |
| Próximo Job sugerido | Oficina: «Corrigir orientação/física moto WorldLab2» (smoke `/mg2`) |

### F2 — Performance e fluidez

| Campo | Valor |
|-------|-------|
| Sintoma | Hitch na carga inicial; stutter em tráfego denso; cidade inteira em memória |
| Feedback | Briefing lista como dor #1; Sprint 1 (raio ~140 m, pixelRatio) já mitiga CPU |
| Impacto | Sem fluidez aceitável, utilizador não mantém sessões de desenvolvimento diário |
| Próximo passo | Patrocinador valida gate P0; CEO autoriza ou bloqueia Sprint 2 LOD |

### F3 — Mobile / acesso LAN

| Campo | Valor |
|-------|-------|
| Sintoma | (Preventivo) jogo deve funcionar em celular e via IP local |
| Feedback | Checkpoint 15/jul consagra como entrega estável |
| Impacto | Permite playtest rápido fora do PC de desenvolvimento |
| Manutenção | Incluir passes FPS mobile em cada checkpoint visual |

---

## 4. Funcionalidades **despriorizadas** por feedback

| Funcionalidade | Motivo |
|----------------|--------|
| Bloom/asfalto dia 2 (roadmap) | Tentativa **revertida** — «exagerou faixas/letreiros» |
| Multi-hub SC completo | Utilizador voltou ao núcleo enxuto (16/jul) |
| Multiplayer / monetização complexa | Fora de escopo briefing §7 |
| Rewrite monólito 14k linhas | Risco alto; plano JOB-000007 prefere extração cirúrgica |

---

## 5. Matriz impacto × esforço (síntese)

```
Impacto alto + esforço baixo/médio  →  F1 (bug moto), gate F2
Impacto alto + esforço alto         →  LOD/chunks (F2 pós-gate)
Impacto médio + entregue            →  F3, F5, F7
Impacto médio + fila futura         →  F6 (pagamento), F8 (Temporada 2)
Impacto baixo / adiado              →  F9 (expansão mapa)
```

---

## 6. Recomendação ao CEO (próximos despachos)

1. **Imediato (oficina):** Job concreto para F1 — bug moto vertical.  
2. **Gate (Patrocinador):** Sessão playtest F2 — veredito stutter Sprint 1.  
3. **Sequência pós-gate:** F2 Sprint 2 LOD **ou** reavaliar raio; depois F4 (visual noite dia 2/5).  
4. **Paralelo baixo risco:** F6 implementação DEC-MVP-001 na oficina, se código de payout existir.  
5. **Não despachar agora:** F8 Temporada 2 materiais, F9 expansão mapa.

---

## 7. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Briefing operacional MG2 | `docs/mvp/briefing-operacional-mg2.md` |
| Bug moto + vídeo | `E:\anderson\Projoto motoboy game\docs\START-TOMORROW.md` |
| Roadmap visual 5 dias | `E:\anderson\Projoto motoboy game\docs\ROADMAP-MG2.md` |
| Checkpoint jogabilidade | `E:\anderson\Projoto motoboy game\docs\CHECKPOINT-MG2-2026-07-15.md` |
| Temporada 2 | `E:\anderson\Projoto motoboy game\docs\TEMPORADA-2-CIDADE-CONVENCE.md` |
| Prioridades diárias | `docs/learning/2026-08-01-job-000014-prioridades-diarias-mg2.md` |
| Viabilidade | `docs/learning/2026-08-01-job-000011-viabilidade-projeto-mg2.md` |
| Plano arquitetura | `docs/learning/2026-07-30-job-000007-plano-arquitetura-mg2.md` |
| Decisão pagamento | `docs/mvp/decisoes.md` (DEC-MVP-001) |
| Missão pagamento vs outdoor | `docs/learning/desp-010-observacao-missao.json` |
| ADR-015 | `docs/adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md` |

---

## Resultado da fila

`completed` — ranking de funcionalidades prioritárias MG2 entregue com base em feedback documentado; sem implementação técnica nem alteração de Constituição/Governança.
