# REQ-004 — Registro estruturado do conhecimento organizacional

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-04 — Gestão do Conhecimento

## Enunciado

O CEO deverá manter um registro estruturado dos conhecimentos organizacionais, no qual cada item de conhecimento possua identificador permanente, classificação, origem e relacionamentos expressos por identificadores rastreáveis.

**Definição** (fronteira oficial CAP-04 × CAP-05, CTO, 21/07/2026 — ANL-001 §2): *item de conhecimento* é todo conhecimento **reutilizável e independente de uma decisão específica**. Registros históricos de fatos, decisões, eventos e seus contextos pertencem à Memória Organizacional (CAP-05) e não são itens de conhecimento.

## Tipo

Funcional; alto nível.

## Justificativa

A CAP-04 promete transformar conhecimento em patrimônio que torna cada projeto mais rápido que o anterior (VIS-001 §4), e o conhecimento pertence ao CEO, não às ferramentas (ADR-002, Decisão 5). Nada disso é possível sem a estrutura elementar: saber o que é um item de conhecimento, identificá-lo de forma estável, classificá-lo e ligá-lo à sua origem. Este é o requisito fundacional do Grupo A da ANL-001 — os grupos de preservação, recuperação e curadoria pressupõem itens registrados de forma estruturada. Responsabilidade única: **estruturar o registro**; garantias de sobrevivência, busca e qualidade são de requisitos posteriores.

## Critérios de aceitação

* Todo item de conhecimento registrado possui identificador único e permanente (nunca renumerado nem reutilizado).
* Todo item registrado atende à definição oficial: é reutilizável e independente de decisão específica; um registro histórico de fato, decisão ou evento não é aceito como item de conhecimento.
* Todo item registra sua origem: o projeto, o agente ou a decisão que o produziu, referenciados por seus identificadores.
* Todo item possui pelo menos uma classificação, atribuída no momento do registro, a partir do conjunto de categorias mantido pelo próprio registro.
* Relacionamentos de um item — com decisões da Memória Organizacional, com normas do registro canônico (REQ-002) e com outros itens de conhecimento — são expressos exclusivamente por identificadores permanentes dos elementos referenciados.
* Todo item possui um estado de validade registrado. Este requisito exige apenas a existência do estado no registro: os critérios de atribuição, alteração, aprovação ou revisão desse estado não são definidos aqui — essas responsabilidades pertencem aos futuros requisitos do Grupo D (Curadoria do Conhecimento, ANL-001).

## Fora do escopo

* Preservação do registro entre sessões, agentes e ferramentas; integridade; versionamento dos itens — Grupo B da ANL-001 (requisito futuro).
* Recuperação e entrega contextual do conhecimento — Grupo C da ANL-001 (requisito futuro).
* Curadoria: regras de atualidade, obsolescência, deduplicação e validação — Grupo D da ANL-001 (requisito futuro).
* Registros históricos de fatos, decisões e eventos — CAP-05 (Memória Organizacional).
* Normas de governança e sua vigência — CAP-01 (REQ-002, REQ-003).
* Competências observadas em agentes, ciclo de maturação e BCO — CAP-06 (Aprendizado).
* Taxonomia concreta de categorias, formato de armazenamento, estrutura de dados ou qualquer implementação — decisões de arquitetura (ADRs futuros).

## Dependências

Nenhuma dependência bloqueante. Quando um item referenciar normas, utiliza os identificadores do registro canônico (REQ-002); quando referenciar decisões, utiliza os identificadores da Memória Organizacional (CAP-05, requisitos futuros) — as referências são possíveis desde já com os identificadores documentais existentes.

## Riscos e incertezas

* **Overengineering ontológico** (ANL-001 §5): metadados demais tornam o registro burocrático e ninguém o alimenta. Mitigação: os campos exigidos são os mínimos — identificador, classificação, origem, relacionamentos, situação de validade; extensões só com evidência de necessidade.
* **Ambiguidade residual de classificação:** haverá itens em que a distinção "reutilizável × histórico" exigirá julgamento. Mitigação: aplicar a definição oficial; casos genuinamente ambíguos são levados ao CTO/Usuário e o entendimento firmado vira conhecimento registrado.
* **Janela sem curadoria:** entre a vigência deste requisito e o futuro requisito do Grupo D, itens podem acumular sem regra de obsolescência. O critério de situação de validade cria a estrutura para a curadoria futura, mas não a executa — limitação declarada (CON-001, Art. 9º, princípio 8).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 — Gestão do Conhecimento |
| Norma superior | CON-001 Art. 3º, 4º (pilar Conhecimento), 8º; VIS-001 §4 |
| Origem | ANL-001 v1.0 (Grupo A, ordem sugerida item 1); ADR-002 Decisão 5; autorização do CTO com gate aberto pela ADR-006 (21/07/2026) |
| Dependências | — (referências cruzadas: REQ-002; CAP-05 futura) |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Gate de REQs da CAP-04 aberto (ANL-001 aprovada; ADR-006 em vigor); autorização do CTO | Aprovado com um ajuste |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Critério de validade explicitado: exige apenas a existência do estado registrado; atribuição, alteração, aprovação e revisão pertencem ao Grupo D | Revisão do CTO — REQ-004 estrutura o registro, não o gerencia | **Aprovado — primeiro requisito da CAP-04** |
