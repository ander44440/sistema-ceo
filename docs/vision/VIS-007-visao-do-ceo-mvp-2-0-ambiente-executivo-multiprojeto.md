# VIS-007 — Visão do Contexto Operacional Ativo (COA) e Ambiente Executivo Conversacional

> **Status: Homologada — v1.0 (Gate Final CAP-03, CTO, 26/07/2026). Congelada.**  
> Versão 1.0 — 26/07/2026. Tipo VIS.  
> **Capacidade:** CAP-03 — Gestão de Projetos (CAP-001), com recorte inicial do ÉPICO-002; o conceito fundador é o **Contexto Operacional Ativo (COA)**.  
> **Identificação:** VIS-007.  
> Norma superior: CON-001 v1.2; VIS-001; VIS-002; ADR-006; ADR-015; ADR-017; ROADMAP-001; ÉPICO-002.  
> **Ciclo:** VIS-007 → REQ-036…044 → ARQ-012 → IMP-009 → VAL-003 — **CAP-03 Homologada**.  
> **Deliberação CTO (25/07/2026):** abertura da capacidade por necessidade descoberta em operação; VAL-005 do MVP v0.1 conclui normalmente (sem encerramento antecipado).  
> **Proibição:** não reabrir sem novo ciclo formal; não altera o MVP v0.1 congelado.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A visão de uma capacidade em que o CEO opera sempre sobre exatamente um **Contexto Operacional Ativo (COA)** — podendo ser projeto, iniciativa, programa, operação ou outro domínio executivo — com a **conversa** como interface principal do Executivo Digital. |
| **Por que existe?** | O uso real revelou que o MVP v0.1 (contexto fixo MG2) limita o Patrocinador, que conduz simultaneamente Sistema CEO, Motoboy Game 2 e Última Milha. A necessidade veio da operação, não de uma ideia de evolução. |
| **Para quem existe?** | Patrocinador (autoridade e uso diário); CTO (governança); Engenheiro (ciclo ADR-006). |
| **Como o sucesso será medido?** | Quando o Patrocinador trabalhar em mais de um domínio no mesmo dia apenas trocando o COA — cada um com foco, registros e próximo passo isolados — conversando com o CEO como com um executivo. |

---

## 1. Conceito fundador — Contexto Operacional Ativo (COA)

**Definição (Deliberação CTO, 25/07/2026):**

> O CEO sempre opera sobre exatamente um Contexto Operacional Ativo. O contexto pode representar um projeto, iniciativa, programa, operação ou outro domínio executivo.

* **Projeto** é a **especialização inicial** do COA neste ciclo.  
* Sempre existe **exatamente um** COA ativo.  
* Toda conversa, registro, foco, estado do dia e histórico pertencem ao COA ativo.  
* Trocar o COA troca automaticamente todo o contexto exibido e operável.  
* **Nenhum registro é compartilhado** entre COAs.

### COAs iniciais (especialização Projeto)

| COA (projeto) | Domínio |
|---------------|---------|
| Sistema CEO | O próprio produto CEO |
| Motoboy Game 2 | Game (contexto histórico do MVP v0.1) |
| Última Milha | App gerenciador de entregas para transportes |
| … | Futuros, sob abertura pelo Patrocinador |

---

## 2. Princípio de experiência (UX)

**Princípio (Deliberação CTO, 25/07/2026):**

> A conversa é a interface principal do Executivo Digital. Todos os demais componentes existem para fornecer contexto e apoiar a tomada de decisão.

Consequências:

* a caixa de conversa é o **centro** da Home;
* botões e listas de registro são **ferramentas auxiliares**;
* a sensação-alvo: conversar com um executivo, não preencher formulários;
* a interface conversacional especificada pelo Patrocinador é a **referência de UX** desta capacidade.

---

## 3. Missão desta capacidade

Dotar o CEO de:

1. **gerenciamento de contextos** (especialização inicial: projetos);  
2. **COA único** com troca explícita;  
3. **isolamento completo** entre contextos;  
4. **abertura de novos** contextos/projetos;  
5. **painel executivo** baseado no COA ativo (Resumo Executivo);  
6. **caixa de conversa** como principal forma de interação.

---

## 4. Home executiva (referência de UX)

| Região | Conteúdo |
|--------|----------|
| Topo | Marca CEO; saudação; seletor do COA ativo (troca rápida) |
| Card principal | Convite + caixa de conversa + exemplos de comandos |
| Resumo Executivo | Um cartão: COA, objetivo, situação, próximo passo, risco, pendências |
| Depois | Decisões pendentes; conhecimentos recentes; atividades recentes |
| Menu inferior | Painel · Projetos (COAs) · Conversas · Memória · Configurações |

---

## 5. Relação com o MVP v0.1 e a VAL-005

| Item | Tratamento |
|------|------------|
| MVP v0.1 (VIS-003) | **Permanece congelado**; sem alteração funcional |
| VAL-005 | **Conclui normalmente** (calendário vigente); sem encerramento antecipado |
| REQ-016 / REQ-017 | Serão **sucedidos** por REQ-036…044 após homologação deste ciclo — não emendados no congelamento |
| Acervo MG2 existente | Migra para o COA/projeto "Motoboy Game 2" na IMP futura (REQ-044) |

---

## 6. Escopo e fora de escopo

### Inclui (neste ciclo VIS→REQ→ARQ)

* COA; especialização Projeto; troca; isolamento; novo projeto; Home conversacional; Resumo Executivo; navegação auxiliar.

### Não inclui (neste ciclo)

* Implementação / código.  
* Multi-usuário.  
* Orquestração de múltiplas IAs.  
* Substituição das ferramentas de execução de cada domínio.  
* Encerramento antecipado da VAL-005.  
* Reabertura das baselines CAP-05/07/08.

---

## 7. Critério de sucesso observável

> "Trabalhei em mais de um Contexto Operacional Ativo no mesmo dia apenas trocando o COA — cada um manteve seu foco, seus registros e seu próximo passo, e conversei com o CEO em vez de preencher formulários."

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO deliberou; Patrocinador especificou a UX; Engenheiro (Cursor) registrou |
| Quando | 25/07/2026 |
| Por quê | Necessidade descoberta em operação: CEO maduro o bastante para múltiplos domínios reais |
| Baseado em quê | Deliberação CTO 25/07/2026; especificação do Patrocinador; limites do MVP v0.1 |
| Resultado | VIS-007 v0.2 aprovada para prosseguimento; fase REQ/ARQ autorizada; IMP vedada até homologação |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Rascunho multiprojeto / Home conversacional | Especificação do Patrocinador | Em deliberação |
| 0.2 | 25/07/2026 | CTO (deliberação) / Engenheiro (registro) | COA como conceito fundador; Projeto como especialização; princípio conversacional; VAL-005 preservada | Deliberação CTO | **Aprovada para prosseguimento** |
