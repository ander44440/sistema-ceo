# 00 — Visão Geral

> **Status:** BLOCO 1 — Identidade consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Documentação oficial de identidade — sem implementação de código, prompts ou alteração de comportamento.  
> **Fontes:** CON-001; VIS-001; VIS-002; VIS-003; ADR-015; ARQ-018; PX-003 E4; Âncora Mestra; `03_ROADMAP.md`; `13_MARCO_ZERO.md`.

## Objetivo

Definir oficialmente o que é a Engenharia da Inteligência Conversacional (EIC), por que existe, qual a sua missão e visão, e como se relaciona com o Sistema CEO e com a Âncora Mestra — consolidando apenas decisões já aprovadas.

## Finalidade

Documento âncora de **identidade** da EIC. Princípios detalhados → [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md). Terminologia → [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md). Encerramento estrutural → [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md).

---

## 1. Contexto da criação da EIC

A EIC nasce como **camada documental exclusiva** para evoluir a inteligência conversacional do CEO **sem** alterar, por si só, código, prompts ou comportamento do produto.

Fundamento já existente no projeto:

| Fonte | Decisão aproveitada |
|-------|---------------------|
| CON-001 Art. 2º | O CEO **não** é chatbot; governa processos, conhecimento, agentes e decisões |
| VIS-002 §3.6 | O meio preferencial de interação é **conversacional**, ao serviço da execução governada |
| VIS-002 §3.5 | O CEO tem **personalidade institucional** estável (comunicação, critérios, memória) |
| ARQ-018 | Toda mensagem passa pelo **Classificador de Intenção** antes de qualquer efeito |
| PX-003 E4 | Qualidade percebida da Conversação Natural (ritmo, iniciativa, continuidade, densidade, variação) — **homologada** |
| ADR-015 / VIS-003 | Uso diário no MG2: mínimo necessário para avançar com segurança |
| Âncora Mestra | Continuidade operacional: Conversa central; Painel só leitura; frentes homologadas registadas |

A Fase 1 estrutural foi encerrada no **Marco Zero** ([`13_MARCO_ZERO.md`](13_MARCO_ZERO.md)). Este documento inicia a formalização de **conteúdo de identidade** (BLOCO 1), ainda sem impacto no produto.

---

## 2. Definição

A **Engenharia da Inteligência Conversacional (EIC)** é a disciplina documental oficial do Projeto CEO para:

- governar a **evolução** da qualidade e da coerência da conversação do CEO;
- preservar a distinção constitucional entre **diálogo governado** e **chatbot**;
- alinhar evolução conversacional às normas superiores (CON → VIS → REQ → ADR → ARQ → IMP);
- permanecer **desacoplada** da implementação até Gate explícito (`03_ROADMAP.md`, Gates G-EIC-*).

A EIC **não** substitui o Classificador (ARQ-018), o Motor (ARQ-017), o MRE, o Painel (ARQ-016) nem a Conversação Natural (PX-003): documenta e ordena como essas peças, já existentes, evoluem no eixo conversacional.

---

## 3. Missão

**Missão da EIC** (derivada de CON-001 Art. 1º e Art. 3º):

> Fazer com que a conversação do CEO **amplie a capacidade intelectual e produtiva do utilizador** e **maximize o progresso por unidade de tempo**, sem burocracia, sem perda de contexto e sem confundir o CEO com um chatbot.

---

## 4. Visão

**Visão da EIC** (derivada de VIS-001 §4, VIS-002 §3.4–3.6 e VIS-003):

> A conversação do CEO é o **posto de comando** do dia a dia: coerente na personalidade institucional, classificada antes de agir, proporcional ao tempo do utilizador, e útil no uso diário (ADR-015 / MG2) — sempre a sugerir sem impor (CON-001 Art. 9º, princípio 9).

---

## 5. Objectivos estratégicos

Objectivos da disciplina EIC (não são novos requisitos de produto; consolidam rumos já aprovados):

| ID | Objectivo | Base |
|----|-----------|------|
| OE1 | Preservar a identidade: conversação ao serviço da governação, não chatbot | CON-001 Art. 2º; VIS-002 §3.6 |
| OE2 | Respeitar o tempo do utilizador em todo turno conversacional | CON-001 Art. 9º.1; VIS-003 |
| OE3 | Manter classificação de intenção **antes** de qualquer efeito | ARQ-018 |
| OE4 | Evoluir qualidade percebida (ritmo, iniciativa, continuidade, densidade, variação) sob normas já homologadas | PX-003 E4 |
| OE5 | Adaptar comunicação ao perfil sem perder personalidade institucional | CON-001 Art. 9º.7; VIS-002 §3.5 |
| OE6 | Documentar evolução conversacional com rastreabilidade e Gates | CON-001 Art. 8º; Roadmap EIC |
| OE7 | Não alterar produto sem autorização explícita | Marco Zero; Roadmap G-EIC-D |

---

## 6. Perímetro

### 6.1 Inclui

- Identidade, princípios, glossário e roadmap da evolução conversacional
- Critérios e testes **documentais** da qualidade conversacional (quando preenchidos)
- Referência a normas conversacionais já homologadas (ARQ-018, PX-003, VIS-002, etc.)
- Relação com a Âncora Mestra como continuidade operacional

### 6.2 Não inclui (nesta fase / por desenho)

- Implementar código, prompts ou UI
- Redesenhar Motor, MRE, Classificador, Gate, Fila ou Painel
- Decidir no lugar do Usuário (CON-001 Art. 6º)
- Substituir a Âncora Mestra ou a Constituição

---

## 7. Relação com a Âncora Mestra

| Aspeto | Relação |
|--------|---------|
| Natureza da Âncora | Aprendizado / continuidade operacional — **sem** efeito normativo sobre CON/ADR (`docs/learning/ANCORA-MESTRA.md`) |
| Natureza da EIC | Documentação oficial da **disciplina** conversacional — subordinada a CON/VIS/REQ/ADR |
| Complementaridade | A Âncora regista **estado operacional vigente** e frentes homologadas; a EIC ordena **como evoluir** a conversação com rigor documental |
| Conversa central | Âncora: Conversa + Painel no Centro; Painel só leitura — a EIC não contradiz esse modelo |
| PX-003 | Âncora cita Conversação Natural homologada; a EIC trata-a como lastro de qualidade já aprovado |
| Actualização | Encerramentos relevantes de frentes conversacionais devem continuar a actualizar a Âncora; a EIC regista a doutrina e o Marco Zero |

**Regra:** em conflito aparente, prevalece a hierarquia normativa (CON → …). A Âncora informa o estado; a EIC não a sobrescreve.

---

## 8. Critérios de sucesso da disciplina

Sucesso da EIC (disciplina), medido documentalmente — alinhado a CON-001 Art. 1º/3º e às quatro perguntas ADR-002:

| # | Critério | Evidência típica |
|---|----------|------------------|
| S1 | Identidade conversacional clara e não-chatbot | Este documento + VIS-002 §3.6 |
| S2 | Princípios conversacionais rastreáveis às normas superiores | [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) |
| S3 | Terminologia estável e sem ambiguidade | [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md) |
| S4 | Ordem de evolução e Gates respeitados | [`03_ROADMAP.md`](03_ROADMAP.md) |
| S5 | Produto intocado sem Gate G-EIC-D | Marco Zero / restrições |
| S6 | Continuidade com a Âncora Mestra (sem dupla verdade operacional) | Secção 7 |

---

## 9. Estado documental

| Item | Estado |
|------|--------|
| BLOCO 1 — Identidade | **Consolidado** (00 + 01 + 06 + 13) |
| Fase 1 — Estrutura | **Encerrada** (Marco Zero) |
| Fase 2 — Conteúdo restante (02, 04, 05, …) | Pendente de autorização / preenchimento |
| Impacto no produto | **Nenhum** |

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) | Princípios oficiais |
| [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md) | Termos e siglas |
| [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Encerramento Fase 1 + registo BLOCO 1 |
| [`03_ROADMAP.md`](03_ROADMAP.md) | Ordem M0–M9 |
| [`ÍNDICE.md`](ÍNDICE.md) | Porta de entrada |
| `docs/learning/ANCORA-MESTRA.md` | Continuidade operacional |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Estrutura inicial | Esqueleto |
| 0.2 | 03/08/2026 | Engenheiro (Cursor) | Auditoria de padronização | Padrão único |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 1 — identidade consolidada | Referência oficial de visão EIC |

---

**Estado:** BLOCO 1 — visão consolidada. Sem impacto no produto.
