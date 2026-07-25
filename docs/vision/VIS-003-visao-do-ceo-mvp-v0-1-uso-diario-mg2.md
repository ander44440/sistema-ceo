# VIS-003 — Visão do CEO MVP v0.1 (Uso Diário no MG2)

> **Status: Homologado — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026.
> **Identificação:** VIS-003 (o identificador VIS-002 já está ocupado por *Identidade Institucional do Produto* — homologado). Este documento responde à autorização do CTO de abrir o ciclo “VIS do CEO MVP v0.1”.
> **Natureza:** visão de produto da **primeira versão operacional** do CEO. Complementa VIS-001 e VIS-002 **sem** revogá-los.
> Norma superior: CON-001 v1.0; VIS-001 v1.0; VIS-002 v1.0; ADR-015 v1.0; marco `CEO-MVP-START`.
> **Proibição explícita:** este documento **não** contém requisitos técnicos, arquitetura nem implementação. Responde apenas: **"Como será utilizar o CEO diariamente?"**
> **Fase de Requisitos do MVP:** aberta com a homologação deste VIS (autorização CTO, 23/07/2026).

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A visão de como o patrocinador usa o CEO **todos os dias** enquanto desenvolve o Motoboy Game 2 (MG2) — o menor produto operacional útil. |
| **Por que existe?** | Para ancorar o MVP no uso real (ADR-015), antes de requisitos: alinhar expectativa de experiência diária sem antecipar solução técnica. |
| **Para quem existe?** | Para o Usuário/patrocinador (persona principal), o CTO (homologação) e o Engenheiro (escopo do que virá a ser exigido). |
| **Como seu sucesso será medido?** | Quando o critério objetivo da §7 for observável na prática diária do MG2 — sem depender de roadmap futuro. |

---

## 1. Missão do MVP

O CEO MVP v0.1 existe para que o patrocinador **comece e termine o dia de trabalho no MG2 com o CEO como posto de comando**:

* saber **onde parou** e **o que importa agora**;
* **registrar** o que foi decidido e o que foi aprendido, sem perder o fio;
* receber do CEO apenas o **mínimo necessário** para avançar com segurança no próximo passo do MG2.

Não é a missão do MVP ser “o sistema completo de governança”. É ser **útil todos os dias**, no menor formato possível, no contexto do MG2.

---

## 2. Persona principal

**Anderson — Patrocinador / Fundador / PO do CEO e do MG2**

| Traço | Implicação para o uso diário |
|-------|------------------------------|
| Conduz o MG2 com apoio de IAs (ex.: Cursor, ChatGPT) | O CEO não substitui essas ferramentas; **orquestra o dia** e guarda o que não pode se perder entre elas |
| Tempo é o recurso mais escasso | O CEO **não** pede burocracia; entrega o próximo passo e o registro essencial |
| Autoridade final é dele | O CEO **sugere e organiza**; ele decide |
| Quer progresso mensurável no jogo e no produto CEO | O uso diário deve deixar rastros claros: decisões, conhecimento, próximo foco |

**Não é persona do MVP v0.1:** equipes grandes, múltiplos POs, agentes externos conectados em massa, ou usuários que não estão no contexto MG2.

---

## 3. Fluxo diário de utilização

Um dia típico com o CEO MVP:

### Manhã — Abrir o dia

1. O patrocinador abre o CEO.
2. Vê o **estado do MG2 de ontem**: foco atual, última decisão relevante, conhecimento útil à mão, próximo passo sugerido.
3. Confirma ou ajusta o **foco do dia** (uma frase).
4. Parte para o trabalho no MG2 (nas ferramentas de execução), **sem** reexplicar o contexto do zero.

### Durante o dia — Registrar o que importa

5. Quando surge uma **decisão** (escolha que deve sobreviver à sessão), registra no CEO: o quê, por quê, com base em quê, resultado esperado ou obtido.
6. Quando surge um **aprendizado reutilizável** (padrão, regra do jogo, lição técnica do MG2), registra como conhecimento — não como conversa efêmera.
7. Quando trava, pergunta ao CEO: “o que já sabemos sobre isto?” — e recebe o que está registrado, ou a declaração explícita de ausência.

### Fim do dia — Fechar o dia

8. O patrocinador indica o que avançou e o que ficou pendente.
9. O CEO propõe o **próximo passo de amanhã** e o estado a preservar.
10. O patrocinador confirma e encerra — amanhã o CEO reabre neste ponto.

**Ritmo:** poucos atos, altos de valor. O MVP falha se o fluxo diário exigir mais esforço do que o benefício de não perder contexto.

---

## 4. Primeira tela do CEO

A primeira tela é o **Painel do Dia** — uma única composição, não um dashboard de métricas.

O patrocinador vê, de imediato:

| Elemento | Conteúdo |
|----------|----------|
| **Marca / posto** | CEO — posto de comando do dia |
| **Contexto ativo** | MG2 (projeto em foco) |
| **Foco de hoje** | Uma frase editável / confirmável |
| **Onde paramos** | Último estado relevante (decisão ou marco curto) |
| **Próximo passo** | Uma ação sugerida para agora |
| **Atenção** | No máximo 1–3 itens que exigem decisão do patrocinador (ou “nada pendente”) |
| **Ações rápidas** | Registrar decisão · Registrar conhecimento · Fechar o dia |

Não há, na primeira tela do MVP: listas longas, múltiplos projetos, gráficos, configurações de agentes, filas de tarefas genéricas ou “feed” de atividade.

A pergunta que a primeira tela responde:

> **“O que eu faço agora no MG2 — e o que o CEO já guarda por mim?”**

---

## 5. Capacidades mínimas

O que o patrocinador **precisa poder fazer** no MVP v0.1 (em linguagem de uso, não de sistema):

| # | Capacidade mínima de uso |
|---|--------------------------|
| M1 | Abrir o dia no contexto MG2 e ver foco + próximo passo |
| M2 | Ajustar o foco do dia em uma frase |
| M3 | Registrar uma decisão com motivo e base (memória do que foi escolhido) |
| M4 | Registrar um conhecimento reutilizável ligado ao MG2 |
| M5 | Consultar o que já está registrado sobre um tema do trabalho atual |
| M6 | Ver o que exige a atenção dele agora (ou que não há pendência) |
| M7 | Fechar o dia e deixar o estado pronto para amanhã |

Tudo isso cabe na experiência diária descrita nas §§3–4. Sem esses sete atos, o MVP não cumpre a missão.

---

## 6. Capacidades explicitamente fora do MVP

O MVP v0.1 **não** inclui (mesmo que existam na visão de longo prazo):

| Fora | Motivo em uma linha |
|------|---------------------|
| Múltiplos projetos em paralelo na interface diária | O foco do MVP é o MG2 |
| Escolha/orquestração avançada de várias IAs pelo usuário | O usuário não escolhe stack no dia a dia do MVP |
| Aprendizado automático de competências de agentes (ciclo BCO completo) | Evolução posterior à experiência de uso |
| Distribuição automática de normas a agentes externos | Infraestrutura de governança plena ≠ MVP diário |
| Segurança avançada, papéis múltiplos, multi-usuário | Um patrocinador, um contexto |
| Ensino formal / trilha pedagógica completa (CAP-12 ampla) | Fora do uso diário mínimo |
| Dashboards, relatórios executivos, métricas de portfólio | A primeira tela não é BI |
| Automação técnica do pipeline do MG2 (build, deploy, loja) | O CEO governa o dia; não substitui a oficina do jogo |
| População massiva do acervo “por obrigação” | Só o conhecimento que o dia realmente gerar |

Se algo não aproxima o uso diário no MG2 **agora**, fica fora do MVP (ADR-015).

---

## 7. Critério objetivo de sucesso do MVP

O CEO MVP v0.1 é **bem-sucedido** quando, por **cinco dias úteis consecutivos** de trabalho no MG2, o patrocinador:

1. **Abre o dia pelo CEO** (Painel do Dia) antes de retomar a execução;
2. **Registra pelo menos uma decisão ou um conhecimento** relevante no período (não precisa ser um por dia, mas o hábito existe);
3. **Fecha o dia pelo CEO** ao menos três vezes nos cinco dias;
4. Declara, ao final dos cinco dias, que **não precisou reconstruir de memória** o foco e o próximo passo do MG2 — o CEO já os tinha.

**Falha objetiva:** se, ao fim dos cinco dias, o patrocinador ainda depende principalmente de conversas soltas ou da memória pessoal para saber “onde o MG2 parou” e “o que fazer agora”, o MVP v0.1 **não** atingiu o sucesso — independentemente de quantos documentos internos existam.

---

## Relação com VIS-001 e VIS-002

* **VIS-001** permanece a visão de produto de longo prazo.
* **VIS-002** permanece a identidade institucional (o CEO administra organizações).
* **VIS-003** delimita apenas a **experiência do MVP v0.1** no contexto MG2 — o primeiro passo operacional da ADR-015.

Nenhuma tensão aqui revoga os VIS anteriores: o MVP é o caminho curto até o uso diário; a identidade e a visão longa continuam válidas.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO em revisão |
| Quando | 23/07/2026 |
| Por quê | Abrir o ciclo de visão do CEO MVP v0.1 antes da fase de Requisitos, respondendo “como será utilizar o CEO diariamente” no MG2 |
| Baseado em quê | Autorização do CTO — ciclo VIS MVP; ADR-015; marco `CEO-MVP-START`; VIS-001; VIS-002; CON-001 Art. 1º, 3º, 6º, 9º |
| Resultado | VIS-003 homologado v1.0; fase de Requisitos do MVP aberta |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — missão, persona, fluxo diário, primeira tela, mínimas, fora, sucesso objetivo | Autorização CTO — VIS do MVP v0.1; ADR-015 | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Homologação; abertura da fase de Requisitos do MVP | Autorização CTO — fase REQ do MVP | **Homologado** |
