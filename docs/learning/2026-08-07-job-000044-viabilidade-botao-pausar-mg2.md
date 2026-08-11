# Botão Pausar faz sentido para o MG2? — JOB-000044

> **Entrega do Job da fila CEO.** Parecer sobre viabilidade e timing do botão Pausar no contexto MG2.  
> **Origem:** MRE (parecer `parecer-c3-1786146927282-59kbu8`).  
> **Data:** 07/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Veredito executivo

| Pergunta | Resposta |
|----------|----------|
| **Faz sentido implementar Pausar *no jogo* MG2 agora?** | **Não** |
| **Faz sentido Pausar *no CEO* para o circuito diário MG2?** | **Sim — já entregue** (JOB-000039 / JOB-000041) |
| **Confiança** | Alta — alinhado a JOB-000042, inventário CAP-04, briefing §7 e distinção CEO↔oficina |
| **Quando reavaliar Pausar no jogo** | Após F1+F2 fechados **e** pedido explícito do Patrocinador com caso de uso concreto (ex.: interromper missão/tráfego durante playtest longo) |

**Síntese:** Há **dois objetos distintos** — (A) botão Pausar do **shell CEO** (TTS, escuta, modo Ouvindo) e (B) pausa **in-game** no WorldLab2. Para (A), a necessidade no uso diário CEO↔MG2 é real e **já está satisfeita** no canto superior direito do CEO (`#action-pause`, `botaoPausar.js`). Para (B), não há dor documentada, não desbloqueia F1/F2 nem aproxima o Patrocinador do playtest estável; implementar agora seria escopo de **oficina** com retorno baixo face a bug moto e performance.

---

## 2. Distinção obrigatória: CEO Pausar ≠ Pausar do jogo

| Capacidade | Onde vive | Estado | Função |
|------------|-----------|--------|--------|
| **Botão Pausar CEO** | Shell CEO (`app/src/botaoPausar.js`, `#action-pause`) | **Entregue** | Pausa TTS em curso, termina escuta activa, sinaliza Conversa (`ceo:pausar`) |
| **Pausar in-game MG2** | Repo `Projoto motoboy game` / WorldLab2 | **Inexistente** | Congelaria simulação (tráfego, missão, física) — feature de jogo |

O inventário de conhecimento MG2 regista explicitamente: *«UI CEO Pausar ≠ jogo»* (`docs/learning/2026-08-07-inventario-conhecimento-mg2.md`). Confundir os dois levaria a Job de oficina desalinhado ou duplicação de controlo.

---

## 3. Critérios de avaliação (Pausar **no jogo** MG2)

| Critério | Peso | Avaliação |
|----------|------|-----------|
| **ADR-015** — aproxima uso diário CEO no MG2? | Alto | **Não** — não corrige bug moto (F1) nem stutter (F2) |
| **JOB-000042** — ranking de prioridades | Alto | **Ausente** — F1–F9 não listam menu/botão pausa |
| **Feedback documentado** | Alto | **Ausente** — nenhum pedido de pausa in-game em briefing, checkpoint ou sessões CEO |
| **Briefing §7** — fora de escopo? | Médio | Não listado explicitamente, mas **não** é bloqueador de jogabilidade |
| **Fronteira REQ-030** | Alto | Implementação seria **oficina** (repo do jogo), não CEO |
| **Esforço vs impacto** | Médio | Esforço baixo-médio (UI + freeze loop); impacto **baixo** agora |

---

## 4. Por que Pausar **no CEO** já cobre o caso MG2 relevante

No circuito diário ADR-015, CEO e MG2 correm em **processos separados** (Vite tipicamente :5173 vs :5174). O Patrocinador alterna entre conversar com o CEO e playtest/código no jogo.

| Cenário de uso | Pausar CEO resolve? |
|----------------|---------------------|
| CEO a falar TTS durante playtest | **Sim** — interrompe fala |
| CEO em modo Ouvindo enquanto se conduz no MG2 | **Sim** — termina escuta |
| Interromper tráfego/missão **dentro** do WorldLab2 | **Não** — exige pausa in-game (não pedida) |

Conclusão: o valor operacional para MG2 está no **controlo da presença vocal do CEO**, não num segundo botão equivalente dentro do canvas 3D — salvo demanda explícita em contrário.

---

## 5. Estado técnico

| Factor | Implicação |
|--------|------------|
| `botaoPausar.js` entregue | CEO-side coberto; sem Job pendente de reimplementação |
| MG2 sem `pause` / menu pausa (grep repo jogo) | Greenfield in-game; não há base existente |
| WorldLab2 monolítico ~14k LOC | Qualquer feature UI no jogo compete com F1/F2 por atenção de oficina |
| Bug moto vertical **aberto** (F1) | Pausar in-game não mitiga bloqueador #1 de jogabilidade |

---

## 6. Comparação com alternativas de maior retorno

| Alternativa | Impacto no uso diário | Esforço relativo |
|-------------|----------------------|------------------|
| **F1 — Corrigir bug moto vertical** | Crítico | Baixo-médio |
| **F2 — Validar perf Sprint 1; LOD se ok** | Alto | Médio |
| **Manter CEO Pausar em smoke test voz** | Médio (UX CEO↔MG2) | **Zero** (já entregue) |
| **Pausar in-game MG2** | Baixo (sem dor documentada) | Baixo-médio |

---

## 7. Recomendação ao CEO

1. **Não despachar** Job de oficina para botão/menu Pausar **no jogo** MG2 nesta janela.  
2. **Tratar CEO Pausar como encerrado** para o circuito MG2; incluir em checklist de smoke voz/conversa se útil.  
3. **Se** o Patrocinador pedir pausa in-game: exigir caso de uso (ex.: «preciso parar tráfego para inspecionar via X») e só então Job oficina **após** F1+F2.  
4. **Não** confundir comando conversacional «pausar» (estado operacional / fila) com feature de UI do WorldLab2.

---

## 8. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Botão Pausar CEO | `app/src/botaoPausar.js`, `app/src/shell.js` |
| JOB-000039 / JOB-000041 (entrega CEO) | `executive/queue/JOB-000039.json`, `JOB-000041.json` |
| Prioridades MG2 | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Inventário conhecimento | `docs/learning/2026-08-07-inventario-conhecimento-mg2.md` |
| Briefing operacional MG2 | `docs/mvp/briefing-operacional-mg2.md` |
| ADR-015 | `docs/adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md` |
| Repo MG2 — ausência pause in-game | `E:\anderson\Projoto motoboy game` (grep) |

---

## Resultado da fila

`completed` — parecer entregue: **Pausar no jogo MG2 não agora**; **Pausar no CEO sim e já entregue** para o circuito diário. Sem implementação técnica nem alteração de Constituição/Governança.
