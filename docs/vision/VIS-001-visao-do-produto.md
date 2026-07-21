# VIS-001 — Visão do Produto

> **Status: APROVADA.**
> Versão 1.0 — 21/07/2026 (conteúdo idêntico à v0.2, aprovada sem ajustes pela revisão técnica do CTO).
> Norma superior: CON-001 (v1.0). Conteúdo derivado exclusivamente de CON-001, D0, ADR-001 e REQ-001.

---

## 1. O que é o CEO

O CEO é um executivo digital: uma inteligência artificial que conduz projetos para você.

Hoje, quem trabalha com várias IAs e ferramentas precisa fazer sozinho o papel de coordenador: repetir contexto, lembrar decisões, distribuir tarefas e conferir resultados. O CEO assume esse papel. Você define a direção e as prioridades; ele organiza o trabalho entre pessoas e agentes de IA, guarda tudo o que foi decidido e por quê, acompanha o andamento e traz de volta apenas o que precisa da sua atenção.

Formalmente, o CEO é um **Sistema Executivo de Governança para colaboração entre Humanos e Inteligências Artificiais** (CON-001, Art. 2º). Ele não é um chatbot, não é um despachante de prompts e não é um simples gerenciador de tarefas.

---

## 2. O problema

O trabalho complexo assistido por IA hoje se perde entre conversas e ferramentas isoladas:

* **O contexto se perde.** Cada sessão, agente ou ferramenta começa do zero; o usuário repete as mesmas informações várias vezes.
* **As decisões se perdem.** Escolhas importantes são feitas e esquecidas, sem registro de quem decidiu, quando, por quê e com qual resultado.
* **As regras não viajam.** Cada ferramenta tem seu próprio jeito de receber instruções; as regras de trabalho precisam ser reescritas para cada agente.
* **O conhecimento não se acumula.** O que se aprende em um projeto não vira patrimônio para os próximos.
* **O tempo do usuário é consumido pela coordenação.** Em vez de decidir e criar, o usuário gasta tempo gerenciando manualmente as próprias ferramentas que deveriam acelerá-lo.

---

## 3. Propósito

O CEO existe para **ampliar a capacidade intelectual e produtiva do usuário** (CON-001, Art. 1º).

Ele devolve ao usuário o tempo e a energia gastos em coordenação, preservação de contexto e registro de decisões — para que esse tempo seja investido no que só o usuário pode fazer: definir visão, priorizar e decidir. Toda decisão do produto deverá priorizar esse objetivo.

---

## 4. Visão de longo prazo

Nos próximos anos, esperamos que o CEO seja **o melhor sistema operacional para desenvolvimento assistido por IA** (D0): o lugar onde humanos e agentes inteligentes trabalham juntos durante todo o ciclo de vida de um projeto.

Nesse horizonte, sustentado pelos quatro pilares da CON-001 (Art. 4º):

* **Governança** — as regras do usuário valem para qualquer agente conectado, de qualquer fornecedor ou ferramenta, distribuídas por mecanismo próprio do CEO (REQ-001). Agentes específicos são participantes substituíveis, nunca dependências.
* **Conhecimento** — a memória organizacional acumulada ao longo dos anos torna cada novo projeto mais rápido que o anterior: decisões, justificativas e resultados permanecem consultáveis e vivos.
* **Execução** — o CEO conduz múltiplos projetos em paralelo, coordenando humanos e agentes com rastreabilidade completa da visão ao deploy.
* **Aprendizado** — o CEO conhece cada vez melhor o usuário e adapta sua forma de trabalhar e de se comunicar; ao mesmo tempo, forma o usuário em Engenharia de Software e Engenharia de IA durante o próprio uso.

Esta visão não define tecnologias, plataformas nem arquitetura — isso pertence às etapas seguintes da hierarquia normativa.

---

## 5. Escopo

### Pertence ao CEO

* Governar: estabelecer, distribuir e manter regras permanentes para qualquer agente conectado, de forma independente de ferramenta (CON-001, Art. 7º; REQ-001).
* Coordenar: distribuir tarefas entre humanos e agentes, manter contexto e acompanhar projetos de ponta a ponta.
* Registrar: manter a memória organizacional — quem decidiu, quando, por quê, baseado em quê e com qual resultado (CON-001, Art. 8º).
* Rastrear: preservar a cadeia requisito → decisão → implementação → commit → teste → homologação → deploy.
* Aprender e ensinar: adaptar-se ao usuário e explicar as decisões, alternativas, riscos e princípios de engenharia aplicados (CON-001, Art. 10).

### Não pertence ao CEO

* Decidir no lugar do usuário: a autoridade final é sempre do usuário (CON-001, Art. 6º); o CEO sugere sem impor (Art. 9º, princípio 9).
* Substituir os agentes especialistas: o CEO coordena o trabalho de implementação, arquitetura ou análise — ele não é a ferramenta que os executa.
* Ser um chatbot, um despachante de prompts ou um gerenciador de tarefas (CON-001, Art. 2º).
* Depender de uma ferramenta específica: nenhuma capacidade do CEO pode exigir o Cursor ou qualquer plataforma em particular (CON-001, Art. 7º).

---

## 6. Público-alvo

Pessoas que conduzem trabalhos complexos com apoio de agentes de IA e não querem perder contexto, qualidade nem rastreabilidade:

* **Fundadores e donos de produto** — definem visão e prioridades e precisam que a execução avance com registro de decisões (o papel de Usuário da CON-001, Art. 6º).
* **Líderes e profissionais técnicos** — coordenam múltiplos agentes e projetos e precisam de regras consistentes entre ferramentas.
* **Quem está aprendendo engenharia** — o CEO é também uma plataforma de formação: o usuário aprende Engenharia de Software e Engenharia de IA acompanhando os próprios projetos (CON-001, Art. 10).

---

## 7. Medida de sucesso

A missão é a métrica (CON-001, Art. 3º):

> **Maximizar o progresso do usuário por unidade de tempo.**

O CEO é bem-sucedido quando:

* o usuário avança mais com o CEO do que sem ele, no mesmo tempo;
* nenhum contexto é perdido e nenhuma decisão fica sem histórico;
* as regras do usuário são seguidas por qualquer agente conectado;
* o usuário sabe mais engenharia hoje do que quando começou a usar o CEO.

---

## 8. Alinhamento e rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0 (Preâmbulo, Art. 1º–10) |
| Fontes | `docs/D0-fundacao.md` (visão, missão, objetivos, público), ADR-001 (Decisões 1, 3 e 5), REQ-001 |
| Não contém | Novas decisões de arquitetura, novos requisitos, escolhas de tecnologia ou implementação |
| Gera | REQ-xxx (Engenharia de Requisitos da Fase 0, após aprovação) |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Rascunho inicial | CON-001 aprovada; VIS-001 definido como próximo documento | Substituído pela v0.2 |
| 0.2 | 21/07/2026 | Engenheiro (Cursor) | Reestruturação nos 8 critérios do CTO: linguagem simplificada; novas seções Propósito e Visão de longo prazo; Escopo em pertence/não pertence | Critérios de revisão definidos pelo CTO | Aprovado sem ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Promoção a versão aprovada, sem alteração de conteúdo | Revisão técnica do CTO concluída | **Visão oficialmente aprovada** |
