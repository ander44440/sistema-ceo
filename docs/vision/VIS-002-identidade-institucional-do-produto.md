# VIS-002 — Identidade Institucional do Produto

> **Status: HOMOLOGADO — v1.0 (Governança, 22/07/2026).**
> Versão 1.0 — 22/07/2026.
> **Natureza:** este documento constitui uma **evolução da visão institucional do produto**. Complementa o VIS-001, **sem revogá-lo, substituí-lo ou modificar seu conteúdo**.
> Norma superior: CON-001 v1.0. Alinha-se ao VIS-001 v1.0 e às diretrizes estratégicas da ADR-002. Não cria requisitos, capacidades, conceitos nem decisões arquiteturais.
> Origem: deliberação final da Governança (22/07/2026) sobre a incorporação da Âncora Estratégica; parecer técnico do CTO (aprovado com ajustes editoriais); **homologação da Governança (22/07/2026)**.

---

Este documento registra a evolução da visão institucional do Projeto CEO, consolidando princípios estratégicos identificados durante a maturação do sistema de governança. Complementa o VIS-001, preservando integralmente sua validade e sem produzir efeitos retroativos sobre artefatos anteriormente homologados.

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A formalização da identidade institucional do CEO como Sistema Executivo de Governança que administra **organizações** — não meros projetos ou documentos. |
| **Por que existe?** | Até aqui, o esforço concentrou-se na construção do sistema de governança. Passa a existir um eixo permanente de evolução da identidade do produto, para orientar deliberações estratégicas futuras sem reescrever a visão fundacional (VIS-001). |
| **Para quem existe?** | Para o Usuário (autoridade máxima), o CTO e todos os agentes conectados que precisam de uma referência única sobre *o que é o CEO*, distinta dos requisitos que descrevem *como a organização funciona*. |
| **Como seu sucesso será medido?** | Quando decisões estratégicas futuras se apoiem nesta identidade sem contradizer CON-001 nem invalidar o VIS-001; quando a distinção VIS (identidade) × REQ (funcionamento) permanecer clara na arquitetura documental. |

---

## 1. Relação com o VIS-001

O VIS-001 permanece a visão oficial do produto na forma em que foi aprovada: o problema, o propósito, o horizonte de longo prazo, o escopo, o público e a medida de sucesso ali registrados **continuam vigentes**.

O VIS-002 **não emenda** o VIS-001. Ele registra a consolidação institucional da identidade do produto — o eixo que responde prioritariamente à pergunta **“O que é o CEO?”** — enquanto os requisitos (REQ) continuam a responder **“Como a organização funciona?”**.

Tensões de linguagem entre o horizonte fundacional (ênfase em projetos e ciclo de desenvolvimento) e o horizonte institucional deste documento (ênfase em organizações) não revogam o VIS-001: constituem evolução registrada. Qualquer harmonização futura do VIS-001, se deliberada, percorrerá o fluxo oficial de governança.

---

## 2. Identidade institucional

O CEO é um **Sistema Executivo de Governança** (CON-001, Art. 2º).

Na identidade institucional consolidada por este documento:

* o CEO **administra organizações** — conjuntos duradouros de papéis, normas, conhecimento, decisões e agentes sob governança;
* o CEO **não se reduz** a administrar projetos isolados, repositórios de documentos ou filas de tarefas;
* projetos, documentos e tarefas são **instrumentos** da organização governada, não o objeto último da identidade do produto.

Essa formulação aprofunda a natureza já estabelecida na CON-001 (Art. 2º §2º): o CEO não apenas distribui tarefas — governa processos, conhecimento, agentes e decisões — e alinha a identidade do produto à missão de maximizar o progresso do usuário por unidade de tempo (CON-001, Art. 3º).

---

## 3. Princípios de identidade institucional

Os princípios abaixo orientam a evolução estratégica do produto. Não são requisitos verificáveis; sua eventual formalização normativa ocorrerá, quando oportuno, pelo fluxo oficial (ADR-006).

### 3.1 Governança por papéis

A organização opera por **papéis organizacionais** definidos e rastreáveis (CON-001, Art. 6º), não por personalismos de ferramenta ou de episódio de interação. Autoridade, responsabilidade e alçada decorrem do papel — Usuário, CTO, Engenheiro, Agente Executivo e demais papéis organizacionais que a governança vier a instituir — e do vínculo formal do agente conectado (CNC-005), quando aplicável.

### 3.2 Independência tecnológica

Nenhuma capacidade essencial do CEO pode depender de um fornecedor ou meio de acesso específico (CON-001, Art. 7º §2º). Meios de execução são participantes substituíveis; a identidade do produto e as normas da organização permanecem no acervo canônico sob `/docs`.

### 3.3 Coordenação de agentes

O CEO transforma participantes humanos e agentes de inteligência artificial em **uma equipe sob governança** (ADR-002, Decisão 2). O usuário não escolhe qual agente utilizar; o CEO coordena. Agentes são fontes de execução e de aprendizado observável — nunca donos do conhecimento institucional.

### 3.4 Operação proativa

O CEO não se limita a responder quando acionado: **antecipa**, preserva contexto, propõe próximos passos e devolve ao usuário apenas o que exige sua atenção — sempre sugerindo sem impor (CON-001, Art. 9º, princípio 9) e sem usurpar a autoridade final do Usuário (Art. 6º).

### 3.5 Personalidade institucional

O CEO possui **personalidade institucional** estável: coerência de comunicação, de critérios e de memória ao longo do tempo e entre meios de acesso. Essa personalidade é patrimônio da organização, não atributo de um participante específico ou de um episódio de interação.

### 3.6 Interface conversacional

O meio preferencial de interação com o usuário é **conversacional**: o diálogo conduz governança, coordenação e aprendizado. Conversação, porém, não confunde o CEO com um chatbot (CON-001, Art. 2º §1º): o diálogo serve à execução governada, não a substitui.

---

## 4. O que este documento não faz

* Não altera CON-001, VIS-001, CAP-001/002, ADRs, REQs, ARQs, IMPs nem conceitos (CNC) já homologados.
* Não cria requisitos, arquitetura, implementação nem conceitos organizacionais.
* Não reabre os Grupos A ou B da Distribuição de Governança.
* Não introduz dependências para o REQ-012 nem para qualquer artefato da Frente 1 já em curso.
* Não define tecnologia, plataforma ou formato de interface.

---

## 5. Orientação às deliberações futuras

A partir da deliberação da Governança de 22/07/2026, este documento passa a integrar o **eixo permanente de evolução da identidade institucional do produto**.

Deliberações estratégicas futuras deverão considerar esta identidade — sem que isso, por si só, altere decisões já homologadas. Qualquer decorrência normativa (REQ, CAP, ADR ou emenda de visão) nascerá apenas pelo fluxo oficial, com rastreabilidade completa.

---

## Princípio Institucional

O CEO não administra ferramentas.

O CEO não administra documentos.

O CEO não administra projetos.

O CEO administra organizações.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0 |
| Complementa | VIS-001 v1.0 (sem revogação nem substituição) |
| Alinha-se a | ADR-002 (Decisões 1–3 — padrão documental, identidade estratégica, aprendizado) |
| Origem | Âncora Estratégica submetida à Governança; parecer do CTO; deliberação final da Governança (22/07/2026) |
| Não gera automaticamente | REQ, ADR, CAP, CNC |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Redação da evolução da identidade institucional, complementando o VIS-001 | Deliberação final da Governança (22/07/2026) — incorporação da Âncora Estratégica | Aprovado pelo CTO com ajustes editoriais |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Parágrafo de contextualização; Princípio Institucional final; linguagem organizacional preferida à tecnológica | Revisão técnica do CTO | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Incorporação ao acervo oficial como documento de Visão; camada estratégica da arquitetura documental | Homologação da Governança — evolução institucional do Projeto CEO | **Homologado — VIS-002 em vigor** |
