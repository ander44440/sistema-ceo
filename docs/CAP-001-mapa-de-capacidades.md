# CAP-001 — Mapa de Capacidades do CEO

> **Status: APROVADA.**
> Versão 1.0 — 21/07/2026, aprovada na decisão final da Fase 0 (ADR-004).
> Norma superior: CON-001 v1.0 e VIS-001 v1.0. Origem: ADR-002 (Decisão 6) e ADR-003.

---

## Padrão documental (ADR-002, Decisão 1)

**O que é?** O mapa das capacidades que o CEO deverá desenvolver ao longo de sua evolução, com identificadores permanentes (CAP-01 a CAP-12) e estrutura padronizada. Organiza o domínio do problema antes do detalhamento dos requisitos — não define arquitetura, implementação nem prioridades.

**Por que existe?** Para que os futuros grupos de requisitos nasçam organizados por capacidade, com rastreabilidade clara até a Constituição e a Visão, evitando requisitos soltos e lacunas no domínio (CON-001, Art. 1º e 5º).

**Para quem existe?** Para o Usuário e o CTO, como instrumento de planejamento da engenharia de requisitos; e para qualquer agente conectado, como referência comum do domínio do CEO.

**Como seu sucesso será medido?** Quando todo requisito futuro puder ser rastreado a exatamente uma capacidade deste mapa, e toda capacidade fortalecer pelo menos um dos quatro pilares (CON-001, Art. 4º).

---

## Notas de leitura

* Cada capacidade descreve **o que o CEO precisa saber fazer** (domínio do problema), nunca **como** será construído.
* Os identificadores CAP-01 a CAP-12 são **permanentes** (ADR-003, Decisão 3): não serão renumerados nem reutilizados.
* O **BCO (Banco de Competências Organizacionais)** não é uma capacidade: é conceito arquitetural candidato (ADR-002, Decisão 4; ADR-003, Decisão 2) que futuramente dará suporte a capacidades como a CAP-06.

---

## Capacidades

### CAP-01 — Governança

* **Identificador:** CAP-01
* **Nome:** Governança
* **Objetivo:** Garantir que todo o trabalho de humanos e agentes obedeça às normas do projeto.
* **Descrição:** Estabelecer, distribuir e manter regras permanentes válidas para qualquer agente conectado, de forma independente de ferramenta; assegurar que nenhuma ação contrarie a hierarquia normativa (Constituição → Visão → Requisitos → ADRs → Implementação).
* **Fora do Escopo:** Executar as tarefas governadas (CAP-02, CAP-03); armazenar o histórico das decisões (CAP-05).
* **Pilares Fortalecidos:** Governança.
* **Fontes Normativas:** CON-001 Art. 5º e 7º; REQ-001; ADR-001 Decisão 3.
* **Observações:** O primeiro requisito do projeto (REQ-001 — distribuição da Constituição) pertence a esta capacidade.

### CAP-02 — Gestão de Agentes

* **Identificador:** CAP-02
* **Nome:** Gestão de Agentes
* **Objetivo:** Transformar diferentes IAs em uma equipe de alto desempenho a serviço do usuário.
* **Descrição:** Conectar, coordenar e dirigir agentes de IA: decidir qual agente usar, quando, em que ordem, quando solicitar novas análises e quando devolver o resultado ao usuário, entregando uma experiência única, consistente e contínua.
* **Fora do Escopo:** Escolha de IA pelo usuário (essa responsabilidade é sempre do CEO — ADR-002, Decisão 2); executar o trabalho especializado dos agentes.
* **Pilares Fortalecidos:** Execução; Governança.
* **Fontes Normativas:** ADR-002 Decisão 2; CON-001 Art. 2º §2º; VIS-001 §5.
* **Observações:** —

### CAP-03 — Gestão de Projetos

* **Identificador:** CAP-03
* **Nome:** Gestão de Projetos
* **Objetivo:** Conduzir projetos de ponta a ponta preservando contexto e qualidade.
* **Descrição:** Acompanhar múltiplos projetos em paralelo pelo fluxo obrigatório (Visão → Requisitos → Arquitetura → Fluxos → Implementação → Testes → Validação), mantendo o contexto entre sessões, etapas e agentes.
* **Fora do Escopo:** Definir visão e prioridades (papel do Usuário — CON-001, Art. 6º); registrar decisões (CAP-05).
* **Pilares Fortalecidos:** Execução.
* **Fontes Normativas:** CON-001 Art. 5º §2º; D0 (Objetivos); VIS-001 §4.
* **Observações:** —

### CAP-04 — Gestão do Conhecimento

* **Identificador:** CAP-04
* **Nome:** Gestão do Conhecimento
* **Objetivo:** Transformar o que os projetos produzem em patrimônio consultável.
* **Descrição:** Organizar, preservar e recuperar o conhecimento gerado pelos projetos, tornando cada novo projeto mais rápido que o anterior.
* **Fora do Escopo:** O registro decisório em si (CAP-05); a absorção de competências de outras IAs (CAP-06).
* **Pilares Fortalecidos:** Conhecimento.
* **Fontes Normativas:** D0 (Objetivos); VIS-001 §4; ADR-002 Decisão 5.
* **Observações:** —

### CAP-05 — Memória Organizacional

* **Identificador:** CAP-05
* **Nome:** Memória Organizacional
* **Objetivo:** Nenhuma decisão sem histórico.
* **Descrição:** Registrar toda decisão importante com seus cinco campos — quem decidiu, quando, por quê, baseado em quê e qual foi o resultado — e manter esse histórico vivo e consultável.
* **Fora do Escopo:** Conhecimento não decisório (CAP-04); exibição do andamento dos trabalhos (CAP-09).
* **Pilares Fortalecidos:** Conhecimento.
* **Fontes Normativas:** CON-001 Art. 8º; ADR-001 Decisão 5.
* **Observações:** —

### CAP-06 — Aprendizado

* **Identificador:** CAP-06
* **Nome:** Aprendizado
* **Objetivo:** Evoluir continuamente sem depender de nenhum agente específico.
* **Descrição:** Aprender sobre o usuário e absorver competências observáveis de outras IAs — métodos, processos, técnicas e padrões — submetendo cada competência ao ciclo de maturação (Observação → Hipótese → Validação → Aprovação → Evolução contínua) antes de incorporá-la ao patrimônio organizacional.
* **Fora do Escopo:** Copiar ou reproduzir modelos de outras IAs (ADR-002, Decisão 3); ensinar o usuário (CAP-12).
* **Pilares Fortalecidos:** Aprendizado.
* **Fontes Normativas:** CON-001 Art. 9º princípio 6; ADR-002 Decisões 3, 4 e 5.
* **Observações:** O BCO é o conceito arquitetural candidato a dar suporte a esta capacidade (ADR-003, Decisão 2).

### CAP-07 — Comunicação

* **Identificador:** CAP-07
* **Nome:** Comunicação
* **Objetivo:** Entregar ao usuário o mínimo necessário para que avance com segurança.
* **Descrição:** Comunicar-se de forma adaptada ao perfil do usuário, sem burocracia nem repetição, com transparência sobre limitações e incertezas.
* **Fora do Escopo:** Aprender o perfil do usuário (CAP-06); conteúdo educacional estruturado (CAP-12).
* **Pilares Fortalecidos:** Aprendizado; Execução.
* **Fontes Normativas:** CON-001 Art. 9º princípios 1, 7 e 8.
* **Observações:** —

### CAP-08 — Planejamento

* **Identificador:** CAP-08
* **Nome:** Planejamento
* **Objetivo:** Nunca executar sem objetivo claro.
* **Descrição:** Transformar a visão e as prioridades do usuário em planos e tarefas distribuíveis entre humanos e agentes, com objetivos explícitos e critérios de conclusão.
* **Fora do Escopo:** Definir prioridades (papel do Usuário — CON-001, Art. 6º); acompanhar a execução (CAP-03, CAP-09).
* **Pilares Fortalecidos:** Execução.
* **Fontes Normativas:** CON-001 Art. 9º princípio 3; CON-001 Art. 6º.
* **Observações:** —

### CAP-09 — Observabilidade

* **Identificador:** CAP-09
* **Nome:** Observabilidade
* **Objetivo:** Tornar visível o andamento e a rastreabilidade de tudo o que acontece.
* **Descrição:** Acompanhar e dar visibilidade ao progresso dos trabalhos e à cadeia completa de rastreabilidade (requisito → decisão → implementação → commit → teste → homologação → deploy).
* **Fora do Escopo:** Registrar as decisões em si (CAP-05); intervir na execução (CAP-02, CAP-03).
* **Pilares Fortalecidos:** Governança; Execução.
* **Fontes Normativas:** CON-001 Art. 8º §3º; D0 (Rastreabilidade).
* **Observações:** —

### CAP-10 — Segurança

* **Identificador:** CAP-10
* **Nome:** Segurança
* **Objetivo:** Garantir que nenhum agente ultrapasse os limites estabelecidos.
* **Descrição:** Assegurar que as ações de agentes respeitem os limites e as aprovações devidas: a autoridade final é sempre do usuário, e decisões relevantes exigem registro e aprovação conforme a governança.
* **Fora do Escopo:** Definir as regras em si (CAP-01); aprovar decisões (papel do Usuário).
* **Pilares Fortalecidos:** Governança.
* **Fontes Normativas:** CON-001 Art. 6º e Art. 11; VIS-001 §5.
* **Observações:** —

### CAP-11 — Integrações

* **Identificador:** CAP-11
* **Nome:** Integrações
* **Objetivo:** Conectar-se a qualquer agente ou ferramenta sem depender de nenhum.
* **Descrição:** Conectar agentes, ferramentas e sistemas externos mantendo a independência de ferramenta: qualquer agente é um participante substituível, nunca uma dependência.
* **Fora do Escopo:** Coordenar o trabalho dos agentes conectados (CAP-02); distribuir regras (CAP-01).
* **Pilares Fortalecidos:** Governança; Execução.
* **Fontes Normativas:** CON-001 Art. 7º §2º; REQ-001; ADR-002 Decisão 5.
* **Observações:** —

### CAP-12 — Desenvolvimento do Usuário

* **Identificador:** CAP-12
* **Nome:** Desenvolvimento do Usuário
* **Objetivo:** Ampliar continuamente a capacidade intelectual e produtiva do usuário.
* **Descrição:** Ensinar Engenharia de Software e Engenharia de IA durante o uso: explicar decisões, alternativas, riscos e princípios aplicados, de modo que o usuário saiba mais engenharia a cada projeto.
* **Fora do Escopo:** Aprendizado do próprio CEO (CAP-06); comunicação operacional do dia a dia (CAP-07).
* **Pilares Fortalecidos:** Aprendizado.
* **Fontes Normativas:** CON-001 Art. 1º e Art. 10; D0 (Objetivo educacional); VIS-001 §3, §6 e §7.
* **Observações:** Proposta pelo Engenheiro na v0.1 como "Formação do Usuário"; aprovada e renomeada pelo CTO (ADR-003, Decisão 1) para refletir a missão do Art. 1º.

---

## Matriz de Rastreabilidade Estratégica (CON → VIS → CAP)

Origem explícita de cada capacidade (ADR-003, Decisão 5, item 2):

| Capacidade | Origem na CON-001 | Origem na VIS-001 | Outras fontes |
|------------|-------------------|-------------------|---------------|
| CAP-01 Governança | Art. 5º (hierarquia); Art. 7º (governança) | §5 escopo: governar | REQ-001; ADR-001 D3 |
| CAP-02 Gestão de Agentes | Art. 2º §2º (governa agentes); Art. 6º (papéis) | §1; §5 escopo: coordenar | ADR-002 D2 |
| CAP-03 Gestão de Projetos | Art. 5º §2º (fluxo obrigatório) | §4 pilar Execução; §5 | D0 (Objetivos) |
| CAP-04 Gestão do Conhecimento | Art. 4º (pilar Conhecimento) | §4 pilar Conhecimento | D0; ADR-002 D5 |
| CAP-05 Memória Organizacional | Art. 8º (memória organizacional) | §5 escopo: registrar | ADR-001 D5 |
| CAP-06 Aprendizado | Art. 9º princípio 6 | §4 pilar Aprendizado | ADR-002 D3, D4, D5 |
| CAP-07 Comunicação | Art. 9º princípios 1, 7 e 8 | §1 (experiência do usuário) | — |
| CAP-08 Planejamento | Art. 9º princípio 3; Art. 6º | §5 escopo: coordenar | — |
| CAP-09 Observabilidade | Art. 8º §3º (cadeia de rastreabilidade) | §7 (medida de sucesso) | D0 (Rastreabilidade) |
| CAP-10 Segurança | Art. 6º (autoridade do usuário); Art. 11 | §5 escopo: não decidir pelo usuário | — |
| CAP-11 Integrações | Art. 7º §2º (independência de ferramenta) | §4; §5 | REQ-001; ADR-002 D5 |
| CAP-12 Desenvolvimento do Usuário | Art. 1º (propósito); Art. 10 (educacional) | §3; §6; §7 | D0; ADR-003 D1 |

Toda capacidade possui pelo menos uma origem constitucional e uma origem na Visão: não há capacidade órfã nem norma estratégica sem capacidade correspondente.

---

## Matriz capacidade × pilar

| Capacidade | Governança | Conhecimento | Execução | Aprendizado |
|------------|:---:|:---:|:---:|:---:|
| CAP-01 Governança | ● | | | |
| CAP-02 Gestão de Agentes | ● | | ● | |
| CAP-03 Gestão de Projetos | | | ● | |
| CAP-04 Gestão do Conhecimento | | ● | | |
| CAP-05 Memória Organizacional | | ● | | |
| CAP-06 Aprendizado | | | | ● |
| CAP-07 Comunicação | | | ● | ● |
| CAP-08 Planejamento | | | ● | |
| CAP-09 Observabilidade | ● | | ● | |
| CAP-10 Segurança | ● | | | |
| CAP-11 Integrações | ● | | ● | |
| CAP-12 Desenvolvimento do Usuário | | | | ● |

Todos os quatro pilares estão cobertos por pelo menos duas capacidades.

---

## O que este documento não faz

* Não define arquitetura nem implementação.
* Não prioriza capacidades — a estratégia de priorização é o CAP-002, e a decisão final é do Usuário (CON-001, Art. 6º).
* Não cria requisitos: os REQ-xxx futuros derivarão das capacidades aqui mapeadas, usando o template oficial (`docs/requirements/TEMPLATE-REQ.md`).

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; VIS-001 v1.0 |
| Origem | ADR-002 (Decisão 6); ADR-003 (Decisões 1 a 5) |
| Gera | CAP-002 (priorização); grupos de REQ-xxx por capacidade (após encerramento da Fase 0) |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Rascunho inicial: 11 capacidades do CTO + 1 proposta | ADR-002, Decisão 6 | Revisado pelo CTO |
| 1.0 | 21/07/2026 | CTO decidiu; Engenheiro consolidou; Usuário aprovou | CAP-12 renomeada para Desenvolvimento do Usuário; estrutura padronizada de 8 campos; IDs permanentes; matriz CON → VIS → CAP incorporada; BCO explicitado como mecanismo, não capacidade | ADR-003 | **Aprovada — decisão final da Fase 0 (ADR-004)** |
