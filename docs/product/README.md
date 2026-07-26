# IPR-001 — Experiência e Desejabilidade do CEO (sede documental)

> **Status: F0 Homologada. F1 CONCLUÍDA. F2 aberta — F2-01 homologada; Gate F2-02 em revisão.**  
> Tipo: Iniciativa de Produto (IPR) — **experimental v0.x**; uso autorizado; formalização definitiva do tipo depende de futura ADR.  
> Autorização: Abertura IPR-001 + Gate F0 APROVADO + F1 concluída (26/07/2026).  
> **Proibições vigentes:** não implementa código de interface; não altera CAP-03/REQ/ARQ; não cria telas nem componentes; não altera fichas homologadas; sem commit até homologação do pacote de transição.

---

## Objetivo da iniciativa

Estabelecer a **estratégia de UX, UI, identidade visual e experiência do produto CEO**, produzindo a documentação-base que orientará todas as futuras implementações de interface — para que o CEO seja não apenas correto e governado, mas **desejável, claro e digno de um ambiente executivo**.

## Escopo

| Dentro | Fora |
|--------|------|
| Princípios de produto e experiência | Implementação de telas ou componentes |
| Roadmap do design system (cores, tipografia, grid, componentes, ícones, animações, acessibilidade, responsividade) | Alteração de qualquer baseline técnica (MVP, CAP-03, CAP-05/07/08) |
| Estruturas para benchmark, UX, UI e branding; F1 = documentação de pesquisa **concluída** | Implementação visual; reabertura de fichas |
| Critérios de sucesso e fases da iniciativa | Escolha de stack de frontend (decisão de ARQ/IMP futura) |

## Relação com a ADR-006

A IPR-001 é **documentação estratégica de produto** — não é uma CAP e não substitui o fluxo obrigatório. Toda implementação visual futura decorrente desta iniciativa **continuará exigindo** o ciclo ADR-006 completo (ANL → ADR quando necessária → REQ → ARQ → IMP → VAL) com gates do CTO. Esta sede fornece o **insumo de produto** (princípios, referências, roadmap) que alimentará esses ciclos, sem autorizá-los por si.

## Relação com as capacidades futuras

| Capacidade / frente | Como a IPR-001 contribui |
|---------------------|---------------------------|
| CAP-03 (baseline COA) | Referência de evolução visual da Home Executiva Conversacional — sem reabrir a baseline |
| CAP-02 (Gestão de Agentes, futura) | Padrões de experiência para coordenação de agentes |
| CAP-09 (Acompanhamento) e demais superfícies | Linguagem visual e padrões consistentes desde o primeiro REQ |
| Release v0.7+ | Identidade e desejabilidade como diferencial do produto |

## Estrutura desta sede

| Caminho | Conteúdo |
|---------|----------|
| [`IPR-001-experiencia-do-produto.md`](IPR-001-experiencia-do-produto.md) | Documento-mestre da iniciativa |
| [`principios-de-produto.md`](principios-de-produto.md) | Princípios normativos P1–P6 |
| [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md) | **DA-001…003 vigentes** (+ HP em observação) |
| [`transicao-f1-f2.md`](transicao-f1-f2.md) | Transição F1→F2 — autorizada (Gate F2-01) |
| [`F2-01-arquitetura-conceitual-experiencia.md`](F2-01-arquitetura-conceitual-experiencia.md) | **F2-01** — Arquitetura Conceitual (D1–D5 + COA) — **homologada** |
| [`F2-02-modelo-de-interacoes-experiencia.md`](F2-02-modelo-de-interacoes-experiencia.md) | **F2-02** — Modelo de Interações — em revisão |
| [`design-system-roadmap.md`](design-system-roadmap.md) | Roadmap inicial do design system |
| [`benchmark/`](benchmark/README.md) | **F1 concluída** — 24 fichas; encerramento homologado |
| [`ux/`](ux/README.md) | Estrutura para documentação de UX (futura) |
| [`ui/`](ui/README.md) | Estrutura para documentação de UI (futura) |
| [`branding/`](branding/README.md) | Estrutura para identidade e posicionamento (futuros) |

## Observação normativa

O tipo **IPR** permanece **experimental (v0.x)** — autorizado para iniciativas de Produto; formalização definitiva como família documental dependerá de futura ADR, após amadurecimento do processo (Deliberação Gate IPR-001, 26/07/2026).
