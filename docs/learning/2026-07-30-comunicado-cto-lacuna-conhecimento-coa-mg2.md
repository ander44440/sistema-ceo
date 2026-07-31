# Comunicado ao CTO — Lacuna de conhecimento operacional do COA MG2

> **Tipo:** Submissão formal ao CTO (ChatGPT) — **não** é deliberação; **não** abre VIS/REQ/ARQ.  
> **De:** Patrocinador (Anderson), via Engenheiro (Cursor)  
> **Para:** CTO (ChatGPT)  
> **Data:** 30/07/2026  
> **Prioridade:** Alta para o uso diário (ADR-015)  
> **Estado:** **Gate ENCERRADO** — [`2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md`](./2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md)  
> Briefing Curado em uso: [`../mvp/briefing-operacional-mg2.md`](../mvp/briefing-operacional-mg2.md)

---

## 1. Pedido

CTO, pedimos que **reconheça e delibere** sobre o seguinte caso de produto/conhecimento:

> O CEO opera com COA **MG2** declarado, mas **sem lastro operacional** do projeto Motoboy Game 2.  
> O Patrocinador confirma que **isto torna difícil trabalhar com o CEO** no dia a dia.

Não pedimos implementação neste ato. Pedimos **orientação e próximo Gate**.

---

## 2. Sintoma (voz do Patrocinador)

- “O CEO não sabe nada sobre o projeto MG2.”  
- “Por isso está tão difícil trabalhar com ele.”  
- Autorizou registo e **informação formal ao CTO** (esta peça).

---

## 3. Diagnóstico (Engenheiro — alinhado ao acervo)

| Camada | Estado |
|--------|--------|
| Identidade do COA | Existe (`docs/mvp/contexto-mg2.md`, CAP-03) |
| Briefing operacional curado (objetivos, dores, estado, próximo passo) | **Ausente / insuficiente** para alimentar deliberação |
| MRE em produção (R1) | Autorizado (P10) — delibera com formalismo, **sem mapa vivo do MG2** |
| CAP-04 (conhecimento) | Normativos existem; **não** alimentam o MRE no uso diário atual |
| Fronteira correta | CEO **não** importa código do MG2 (REQ-030); **deve** conhecer o COA como patrimônio operacional |

**Conclusão:** não é (só) bug de Speaker/NCS; é **lacuna de patrimônio operacional do COA** que degrada a qualidade deliberativa e a fila.

---

## 4. Evidências recentes (30/07/2026)

- Jobs gerados pelo MRE genéricos ou inviáveis (ex.: margem sem dados; “contratar especialista”; mapeamento de skills sem REQ).  
- Pedidos técnicos explícitos do Patrocinador (ex.: outdoors laterais) executam melhor que inferências do CEO.  
- Observação paralela: parecer consultivo vs ação executiva — [`2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md`](./2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md).  
- Insumo detalhado + briefing mínimo proposto: [`2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md`](./2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md).

---

## 5. O que **não** fazer (até o CTO decidir)

- Alterar pipeline MRE / Speaker / schema do parecer “para parecer que sabe do MG2”.  
- Embutir o repositório ou build do MG2 no CEO.  
- Abrir IMP de código sem VIS→REQ→ARQ.

---

## 6. Opções pedidas ao CTO (escolha / combinação)

| Opção | Descrição | Notas |
|-------|-----------|-------|
| **A** | Briefing operacional curado do COA MG2 (mínimo documental) | Rápido; Patrocinador + curadoria; já há rascunho de campos no insumo |
| **B** | Ciclo formal VIS→REQ→ARQ: briefing (ou acervo) **lido** pelo MRE antes de deliberar | Liga CAP-04 / CX-07 ao MRE; rigor ADR-006 |
| **C** | Ondas A depois B | Recomendação do Engenheiro para desbloquear uso diário cedo |
| **D** | Outra leitura do CTO | Ex.: priorizar outra lacuna primeiro |

---

## 7. Perguntas explícitas ao CTO

1. Concorda que esta lacuna é **bloqueante** para o valor ADR-015 (CEO no dia a dia do MG2)?  
2. Qual opção (A/B/C/D) autoriza como próximo passo?  
3. Até o briefing existir, o CEO deve **declarar ignorância** e perguntar o mínimo em vez de despachar Jobs genéricos? (recomenda-se **sim**)

---

## 8. Artefatos para leitura (ordem sugerida)

1. Este comunicado  
2. [`2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md`](./2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md)  
3. [`../mvp/contexto-mg2.md`](../mvp/contexto-mg2.md)  
4. [`../adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md`](../adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md)  
5. (opcional) observação consultivo vs ação — mesmo dia  

---

## 9. Texto curto para colar no chat do CTO

```text
CTO — Comunicado do Patrocinador (30/07/2026).

Caso: o CEO declara COA MG2 mas não tem lastro operacional do Motoboy Game 2.
Isto está a tornar difícil o uso diário (ADR-015).

Não pedimos código agora. Pedimos deliberação:
- É bloqueante?
- Opção A (briefing curado), B (ciclo VIS→REQ→ARQ ligação MRE), C (A depois B), ou D?

Insumo: docs/learning/2026-07-30-lacuna-conhecimento-operacional-coa-mg2.md
Comunicado: docs/learning/2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md

Até Gate: sem alterar MRE/Speaker “para fingir conhecimento”.
```

---

## 10. Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (autorizou informar o CTO); Engenheiro (redigiu o comunicado) |
| Quando | 30/07/2026 |
| Por quê | Uso diário difícil por ausência de conhecimento operacional do MG2 no CEO |
| Baseado em quê | Experiência do Patrocinador; ADR-015; insumo da lacuna; evidências de jobs/MRE do mesmo dia |
| Resultado | Comunicado emitido; **aguarda resposta deliberativa do CTO** |
