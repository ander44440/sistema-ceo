# Vale a pena implementar multiplayer agora? — MG2 (JOB-000043)

> **Entrega do Job da fila CEO.** Parecer sobre viabilidade e timing de multiplayer no Motoboy Game 2.  
> **Origem:** MRE (parecer `parecer-c3-1786146689007-nbkpmm`).  
> **Data:** 07/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Veredito executivo

| Pergunta | Resposta |
|----------|----------|
| **Vale a pena implementar multiplayer agora?** | **Não** |
| **Confiança** | Alta — alinhado a briefing §7, JOB-000042, ADR-015 e estado técnico do MG2 |
| **Quando reavaliar** | Após F1 (bug moto) + gate F2 (perf Sprint 1) fechados **e** pedido explícito do Patrocinador com caso de uso concreto |

**Síntese:** Multiplayer é **fora de escopo deliberado** do MG2 nesta janela. O jogo ainda tem bloqueadores de jogabilidade (moto vertical) e performance (stutter/hitch); não há feedback de utilizadores a pedir coop/competição; a arquitectura actual (monólito ~14k linhas, cidade inteira em memória) torna networking um multiplicador de risco desproporcionado ao benefício imediato para o uso diário CEO↔MG2.

---

## 2. Critérios de avaliação

| Critério | Peso | Avaliação |
|----------|------|-----------|
| **ADR-015** — aproxima uso diário CEO no MG2? | Alto | **Não** — não desbloqueia playtest nem desenvolvimento do Patrocinador |
| **Briefing §7** — fora de escopo? | Alto | **Sim** — multiplayer listado explicitamente |
| **Feedback documentado** | Alto | **Ausente** — único jogador real é o Patrocinador; nenhum pedido de coop online |
| **Prioridades F1–F3 (JOB-000042)** | Alto | F1 bug moto, F2 perf, F3 mobile/LAN **ainda por validar/fechar** |
| **Prontidão técnica** | Médio-alto | Sem stack de rede; monólito; sync de estado seria projecto paralelo |
| **Esforço vs impacto** | Alto | Esforço **muito alto** (autoridade, predição, tráfego partilhado, edge cases); impacto **baixo** agora |

---

## 3. Distinção importante: LAN ≠ multiplayer

| Capacidade | Estado | Notas |
|------------|--------|-------|
| **Acesso LAN** (`host: true`, IP local) | **Entregue** (F3, checkpoint 15/jul) | Permite abrir o jogo no telemóvel/outro dispositivo na mesma rede — **single-player** |
| **Multiplayer** (2+ jogadores sincronizados) | **Inexistente** | Exigiria servidor/autoridade, sync de posições, tráfego, missões, colisões |

O Patrocinador **já tem** playtest remoto básico via LAN. Multiplayer resolveria um problema **diferente** (sessão partilhada) que **não está documentado** como dor activa.

---

## 4. Estado técnico relevante

| Factor | Implicação para multiplayer |
|--------|----------------------------|
| `WorldLab2Canvas.jsx` ~14k linhas | Qualquer feature grande aumenta risco de regressão; networking exigiria refactor ou camada isolada |
| Cidade inteira em memória | Cada cliente precisaria do mesmo mundo; load inicial já pesado (D2 viabilidade) |
| Sprint 2 LOD / Sprint 3 chunks **não feitos** | Escala futura incerta; multiplayer amplifica custo de perf |
| Bug moto vertical **aberto** (F1) | Bloqueador de sensação de jogo — coop online exporia o bug a mais testadores |
| `syncPlayerToBoy` no código | Sync **local** moto↔personagem — **não** indica infra de rede |
| Sem WebSocket/WebRTC/Socket.io no repo | Greenfield completo para networking |

---

## 5. O que multiplayer implicaria (ordem de grandeza)

Não é «ligar um flag». Escopo mínimo credível incluiria:

1. **Modelo de autoridade** — servidor ou host-client para posições, tráfego, missões  
2. **Sync de entidades** — motos, NPCs/tráfego (ou simplificação severa), pedestres  
3. **Latência e predição** — especialmente relevante em condução 3D  
4. **Matchmaking / salas** — mesmo que só LAN, precisa descoberta e join  
5. **Edge cases** — desconexão, colisão entre jogadores, missões partilhadas vs individuais  
6. **Testes** — infra, CI, debugging remoto  

**Estimativa qualitativa:** projecto **S** (semanas a meses) para um dev solo — **desalinhado** com foco actual (horas/dias por melhoria incremental).

---

## 6. Comparação com alternativas de maior retorno

| Alternativa | Impacto no uso diário | Esforço relativo |
|-------------|----------------------|------------------|
| **F1 — Corrigir bug moto vertical** | Crítico | Baixo-médio |
| **F2 — Validar perf Sprint 1; LOD se ok** | Alto | Médio |
| **F4 — Retomar identidade visual noite** | Médio-alto | Médio |
| **F6 — Pagamento corrida cancelada (DEC-MVP-001)** | Médio | Baixo-médio |
| **Multiplayer** | Baixo (sem demanda) | **Muito alto** |

---

## 7. Cenários em que **sim** faria sentido reabrir

Reavaliar multiplayer **só** se **todas** as condições abaixo se verificarem:

1. F1 e gate F2 **fechados** (jogo estável e fluido em sessões longas).  
2. Patrocinador define **caso de uso concreto** (ex.: «dois motoboys na mesma cidade», «passageiro + condutor», «corrida competitiva LAN»).  
3. Decisão explícita de **Gate CTO** — hoje briefing §7 bloqueia despacho sem Gate.  
4. Protótipo **mínimo** acordado (ex.: só posições de 2 motos em LAN, sem tráfego partilhado) antes de comprometer arquitectura.

---

## 8. Recomendação ao CEO

1. **Não despachar** implementação de multiplayer nesta janela.  
2. **Manter** F3 (LAN single-player) como baseline de playtest remoto.  
3. **Sequência actual inalterada:** F1 → gate F2 → F4/F6 conforme JOB-000042.  
4. **Se o Patrocinador insistir:** pedir caso de uso + Gate CTO; sugerir spike **isolado** (branch/prototype) só após F1/F2, nunca em paralelo ao monólito principal.

---

## 9. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Briefing operacional MG2 §7 | `docs/mvp/briefing-operacional-mg2.md` |
| Ranking funcionalidades (JOB-000042) | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Viabilidade MG2 (JOB-000011) | `docs/learning/2026-08-01-job-000011-viabilidade-projeto-mg2.md` |
| Briefing espelho runtime | `app/src/executiveEngine/briefingsProjeto.js` |
| Inventário conhecimento MG2 | `docs/learning/2026-08-07-inventario-conhecimento-mg2.md` |
| Repo MG2 — grep multiplayer/rede | `E:\anderson\Projoto motoboy game` (sem infra de rede) |
| ADR-015 | `docs/adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md` |

---

## Resultado da fila

`completed` — parecer entregue: **não vale a pena implementar multiplayer agora**; reavaliar após F1+F2 e Gate CTO se houver demanda explícita. Sem implementação técnica nem alteração de Constituição/Governança.
