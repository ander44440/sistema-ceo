# 10 — Matriz de Priorização

> **Status:** BLOCO 2 — Engenharia consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Critérios de prioridade **já vigentes** no projeto — sem inventar escala proprietária nova.  
> **Fontes:** ADR-015; CON-001 Art. 9º.1; VIS-003; Âncora Mestra; [`03_ROADMAP.md`](03_ROADMAP.md); [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md).

## Objetivo

Definir o quadro oficial para priorizar evolução conversacional na EIC, usando apenas filtros e factos já aprovados.

## Finalidade

Ordenar o que entra na Onda C (conteúdo 04/05) e o que, mais tarde, pode candidatar-se a G-EIC-D — alinhado ao Roadmap.

---

## 1. Critérios de priorização (já existentes)

Avaliar **nesta ordem** (primeiro que falhar, descarta ou rebaixa):

| # | Critério | Origem |
|---|----------|--------|
| P1 | **Uso diário MG2** — aproxima o utilizador de usar o CEO diariamente no MG2? | ADR-015; VIS-003 |
| P2 | **Tempo do utilizador** — reduz burocracia, repetição ou diálogo sem propósito? | CON-001 Art. 9º.1 |
| P3 | **Identidade** — reforça CEO ≠ chatbot e personalidade institucional? | CON-001 Art. 2º; VIS-002 §3.5–3.6 |
| P4 | **Classificar antes de agir** — melhora ou protege o limiar ARQ-018? | ARQ-018 |
| P5 | **Qualidade percebida já normativa** — concretiza PX-003 E4 sem reabrir identidade? | PX-003 E4 |
| P6 | **Desacoplamento** — pode avançar como documentação EIC sem código? | Marco Zero; Roadmap |
| P7 | **Não é backlog Âncora de infra** — evita Dispatcher V3 / extensões laterais agora | Âncora Mestra |

---

## 2. Escalas (qualitativas — sem métrica inventada)

| Nível | Significado |
|-------|-------------|
| **P0 — Agora (doc)** | Preencher EIC bloqueante (Onda C: 04, 05) |
| **P1 — Em seguida (doc)** | Governança/homologação EIC (08, 11) e histórico (12) |
| **P2 — Candidato a produto** | Só após G-EIC-C/D + ADR-006 |
| **P3 — Backlog consciente** | Itens Âncora / fora do perímetro conversacional imediato |

Não há pesos numéricos novos: a ordem P1→P7 acima é a escala.

---

## 3. Matriz de itens (estado actual)

| Item | Tipo | Nível | Justificativa (critérios) |
|------|------|-------|---------------------------|
| Preencher `04` Critérios de Qualidade | Doc EIC | **P0** | P6; desbloqueia M4/Onda C; lastro PX-003 E4 + CON |
| Preencher `05` Testes Conversacionais | Doc EIC | **P0** | P6; desbloqueia M5 e futuros Gates |
| Homologar BLOCO 1 e BLOCO 2 | Gate doc | **P0** | Coerência antes de Onda C profunda |
| Preencher `08` Governança EIC | Doc EIC | **P1** | Autoridade dos Gates EIC |
| Preencher `11` Processo de Homologação | Doc EIC | **P1** | Fecho M9 documental |
| Regressão Classificador (só se Gate produto) | Produto | **P2** | P4; requer G-EIC-D + norma |
| Ajustes prosa CN/Speaker (só se Gate) | Produto | **P2** | P5; PX-003 já homologada — IMP só com Gate |
| Dispatcher V3 | Infra | **P3** | Âncora backlog; falha P1/P7 para EIC agora |
| Extensões de nós do painel | Infra/UX | **P3** | Âncora sob demanda |

---

## 4. Regras de desempate

Se dois itens empatam em P0–P2:

1. Preferir o que **só** exige documentação EIC (menor risco).  
2. Preferir o que desbloqueia o **próximo módulo do Roadmap**.  
3. Preferir o que serve o **uso diário MG2** (ADR-015).  
4. Em dúvida, **perguntar ao patrocinador** (CON-001 Art. 6º) — não inventar prioridade.

---

## 5. Revisão periódica

Rever esta matriz quando:

- BLOCO 1/2 for homologado  
- Onda C (04/05) for preenchida  
- A Âncora Mestra encerrar frente conversacional  
- O patrocinador alterar prioridades ADR-015

---

## 6. Relação com o Roadmap (03)

| Roadmap | Priorização |
|---------|-------------|
| Onda B | Concluída em conteúdo (BLOCO 1+2) |
| Onda C | Itens P0 desta matriz |
| Onda D/E | Itens P2 — só após Gates |

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`03_ROADMAP.md`](03_ROADMAP.md) | Ordem M0–M9 |
| [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md) | Inventário |
| [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md) | Como avançar |
| [`02_ARQUITETURA.md`](02_ARQUITETURA.md) | Fronteiras |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 2 — priorização | Pronto para homologação |

---

**Estado:** BLOCO 2 — priorização consolidada. Sem impacto no produto.
