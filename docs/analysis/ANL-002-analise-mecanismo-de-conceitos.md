# ANL-002 — Análise do Mecanismo de Conceitos Organizacionais

> **Status: APROVADA.**
> Versão 1.0 — 21/07/2026, aprovada pelo CTO com dois ajustes (definição oficial de "conceito organizacional"; separação entre definir significado e decidir promoção).
> Norma superior: CON-001 v1.0; ADR-007 v1.0.
> Nota de tipo: o tipo ANL (ADR-005) foi definido para capacidades; sua aplicação a um mecanismo arquitetural foi determinada pelo CTO em 21/07/2026, seguindo a metodologia da ADR-006 (compreender a responsabilidade antes dos requisitos).
> Documento preparatório: não propõe implementação, estrutura documental, formato nem solução técnica.

---

## 1. Responsabilidade do mecanismo

A ADR-007 já decidiu a responsabilidade nuclear: o mecanismo é a **autoridade semântica oficial do CEO** — mantém a definição normativa única e vigente de cada conceito organizacional. Esta análise a desdobra em quatro responsabilidades observáveis:

1. **Deter** a definição oficial de cada conceito, com identificador permanente e histórico completo (cinco campos do Art. 8º).
2. **Garantir unicidade**: exatamente uma definição vigente por conceito, em qualquer instante.
3. **Servir de referência obrigatória**: consumo sempre por referência, nunca por cópia; nenhuma definição local pode alterar significado (princípio arquitetural da ADR-007).
4. **Reger a evolução semântica**: alterações de significado ocorrem primeiro no mecanismo, pelas alçadas de governança, e propagam-se por referência aos consumidores.

## 2. Fronteiras — o que pertence e o que não pertence

### Pertence ao mecanismo

* Conceitos organizacionais **com força normativa** — termos cuja interpretação única é condição para que normas, requisitos e critérios de aceitação sejam objetivos (casos atuais: "decisão sob governança", "item de conhecimento", "Contexto de Trabalho").
* A definição vigente, o histórico de evolução e a identificação permanente de cada conceito.
* O vínculo de cada conceito com os documentos que o consomem (rastreabilidade de uso).

### Não pertence ao mecanismo

| Item | Pertence a | Razão |
|------|-----------|-------|
| Normas (obrigações de conduta) | CAP-01 (REQ-002/REQ-003) | Conceito define significado; norma obriga comportamento |
| Conhecimento reutilizável (glossários técnicos de projetos, padrões, lições) | CAP-04 | Informa sem força normativa; fronteira oficial da ANL-001 §2 |
| Registros históricos de fatos, decisões e eventos | CAP-05 | O histórico *de um conceito* pertence ao mecanismo; os demais registros históricos, não |
| Qualidade e mérito das definições | Alçadas de governança (CTO/Usuário) | O mecanismo serve definições; não as julga |
| Aplicação dos conceitos em cada contexto | Documentos e processos consumidores | ADR-007, "problemas que não resolve" |
| Distribuição dos conceitos aos agentes | CAP-01 / REQ-001 | Conceitos integram o conjunto distribuível; o mecanismo é fonte, não canal |

**Definição** (CTO, 21/07/2026): **conceito organizacional é um termo cujo significado precisa permanecer único e normativamente consistente para garantir a correta interpretação de um ou mais documentos da organização.**

*Nota de promoção (indicativa, sem força normativa):* na prática, a promoção de um termo a conceito organizacional normalmente ocorre quando ele é reutilizado por múltiplos documentos normativos.

**Duas responsabilidades distintas** a não confundir:

1. **Definir o significado** de um conceito organizacional — responsabilidade do mecanismo (autoridade semântica, ADR-007), exercida pelas alçadas de governança.
2. **Decidir a promoção** — decidir que determinado termo deve ser elevado à condição de conceito organizacional. A política de admissão de novos conceitos será tratada futuramente pelos **requisitos do próprio mecanismo**.

## 3. Relações com os elementos da organização

* **Constituição (CON-001):** subordinação plena (Art. 5º). Termos definidos na Constituição prevalecem; o mecanismo os referencia, nunca os redefine. A criação do mecanismo não exige emenda constitucional: ele se apoia no Art. 7º (governança) e no Art. 8º (memória).
* **CAP-01 — Governança:** relação de pertencimento provável (ver §4). Conceitos têm força normativa; a autoridade semântica é infraestrutura da governança, e o princípio arquitetural do mecanismo replica o do registro canônico (REQ-002): fonte única, identificador permanente, histórico. Se o mecanismo será servido *pelo mesmo* registro do REQ-002 ou por registro próprio é decisão da futura ADR de formato.
* **CAP-04 — Gestão do Conhecimento:** vizinhança com fronteira nítida — conceito obriga interpretação; conhecimento informa. A CAP-04 é também **consumidora** urgente: o Grupo D (Curadoria) dependerá de conceitos como "estado de validade", razão prática da suspensão vigente.
* **CAP-05 — Memória Organizacional:** o mecanismo usa o padrão de memória (cinco campos) para o histórico dos conceitos; não administra os demais registros históricos.
* **REQ-001 (distribuição):** conceitos integram o pacote de governança distribuído a qualquer agente conectado — vocabulário compartilhado é pré-condição de obediência às normas.
* **REQ-003 (resolução da norma vigente):** análogo funcional — assim como o CEO resolve a norma vigente antes de decidir, deverá resolver o significado vigente ao interpretar; os futuros REQs do mecanismo devem espelhar essa simetria.
* **ADRs, REQs, ANLs, CAPs e demais documentos:** consumidores por referência. Documentos aprovados que hoje contêm definições (REQ-003, REQ-004, REQ-005, ANL-001) tornam-se consumidores após a migração prevista na disposição transitória da ADR-007.
* **Catálogo documental (`docs/README.md`):** se a futura ADR de formato criar tipo documental para conceitos, ele nasce pela regra do catálogo.

## 4. Natureza: capacidade ou outra forma de responsabilidade?

**Recomendação: o mecanismo NÃO é uma nova capacidade; é um mecanismo arquitetural de governança, sob a CAP-01.**

Fundamentos:

* **Precedente organizacional:** a ADR-003 (Decisão 2) firmou a distinção — o BCO "não é uma capacidade, mas um mecanismo arquitetural que dá suporte a capacidades". O mecanismo de conceitos é o caso simétrico: dá suporte à CAP-01 (e, por consumo, a todas as demais).
* **Teste do CAP-001:** capacidades descrevem "o que o CEO precisa saber fazer" no domínio do problema do usuário. A autoridade semântica não é um serviço prestado ao usuário; é infraestrutura interna que torna as capacidades governáveis.
* **Teste da matriz:** uma CAP-13 exigiria origem constitucional e na Visão (regra da matriz CON → VIS → CAP); a sustentação normativa do mecanismo (Art. 7º e 8º) já flui inteira pela CAP-01.

Alternativas analisadas: **(a)** nova capacidade CAP-13 — rejeitada pelos três fundamentos acima; **(b)** subcapacidade da CAP-04 — rejeitada pela fronteira oficial (conhecimento não obriga); **(c)** mecanismo sob a CAP-01 — recomendada.

## 5. Riscos

* **Ossificação semântica:** se alterar um conceito for pesado demais, os documentos voltarão a criar definições locais informais — exatamente o que o princípio da ADR-007 proíbe. Mitigação: o processo de evolução deve ser proporcional (alçada clara, sem cerimônia além da memória organizacional).
* **Inflação de conceitos:** sem política de admissão, tudo vira conceito oficial e o mecanismo vira burocracia (viola o princípio 1). Mitigação: a política de admissão será definida pelos requisitos do próprio mecanismo (§2), separando a responsabilidade de promover da de definir.
* **Circularidade fundacional:** o próprio termo "conceito organizacional" precisa de definição oficial, que idealmente residiria no mecanismo que ele define. Mitigação: a definição de admissão nasce na ADR de formato ou no primeiro REQ do mecanismo, com aprovação do Usuário, e migra para dentro do mecanismo quando ele existir.
* **Migração incompleta:** as três definições existentes precisam migrar sem janela de dupla autoridade (duas fontes "oficiais" simultâneas). Mitigação: migração como etapa explícita da ordem recomendada (§6), com corte único.
* **Divergência com espelhos e agentes:** conceito atualizado no mecanismo e desatualizado nos agentes reproduz o risco já registrado no REQ-002. Mitigação: integração com o REQ-001; detecção de divergência permanece candidata à CAP-09.

## 6. Dependências e ordem recomendada

**Dependências:** ADR-007 (existência e responsabilidade — aprovada); padrão do registro canônico (REQ-002) como princípio; alçadas de governança da CON-001 e do catálogo.

**Ordem recomendada:**

1. **ADR de posicionamento e formato** (gate seguinte da ADR-006): decidir o posicionamento recomendado no §4 (mecanismo sob a CAP-01) e se o mecanismo usa o registro do REQ-002 ou registro próprio; a política de admissão fica para os REQs do mecanismo (§2).
2. **REQ(s) do mecanismo** — como grupo de requisitos da CAP-01 (a segunda etapa da CAP-01 entra no fluxo da ADR-006 pela etapa cabível, conforme sua cláusula de não retroatividade): registro de conceitos, resolução do significado vigente e evolução semântica.
3. **Migração das três definições existentes** (REQ-003, REQ-004/ANL-001, REQ-005), com corte único, permanecendo referências nos documentos de origem.
4. **Integração com a distribuição** (REQ-001): conceitos passam a compor o pacote distribuído aos agentes.
5. **Retomada da CAP-04 — Grupo D**, que consumirá conceitos oficiais (ex.: "estado de validade") já servidos pelo mecanismo.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0 (Art. 5º, 7º, 8º); ADR-007 v1.0 |
| Origem | Ordem do CTO (21/07/2026) — abertura de ANL para o mecanismo, conforme metodologia da ADR-006 |
| Baseia-se em | `docs/learning/2026-07-21-conceitos-organizacionais.md`; ADR-003 (precedente BCO); ANL-001 (fronteiras CAP-04/CAP-05); REQ-002/REQ-003 (padrão canônico e resolução) |
| Gera | ADR de posicionamento/formato; futuros REQs do mecanismo (após aprovação) |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Ordem do CTO — compreender a responsabilidade antes dos requisitos (ADR-006) | Aprovada com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Definição oficial de "conceito organizacional" substituiu a proposta; explicitada a separação entre definir significado e decidir promoção, com a política de admissão remetida aos REQs do mecanismo | Revisão do CTO | **Aprovada — base para a ADR de posicionamento/formato** |
