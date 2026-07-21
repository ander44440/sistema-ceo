# REQ-009 — Política de admissão de conceitos organizacionais

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança (Mecanismo de Conceitos Organizacionais, Grupo D — ADR-008)

## Enunciado

O CEO deverá governar a promoção de termos à condição de conceito organizacional oficial exclusivamente por decisão formal de governança — plenamente rastreável, avaliada quanto à sua contribuição para a interpretação consistente da organização — cuja aprovação autoriza o registro do conceito (REQ-006) sem constituí-lo.

**Princípios obrigatórios** (CTO, 21/07/2026):

1. A admissão de um conceito organizacional constitui uma **decisão formal de governança**. Nenhum termo adquire status de conceito organizacional por uso recorrente, convenção informal ou prática operacional.
2. A decisão de admissão deve ser **plenamente rastreável**. Toda promoção referencia o artefato de governança que autorizou sua criação como conceito organizacional.
3. A política de admissão deve **preservar a estabilidade da autoridade semântica**. Novos conceitos somente são admitidos quando sua existência contribuir para a interpretação consistente da organização, evitando inflação conceitual e duplicidade de significado.
4. A **rejeição** de uma proposta de admissão não altera o significado de conceitos já existentes nem impede futura reapresentação mediante novo processo de governança.

## Tipo

Funcional; alto nível.

## Justificativa

Os Grupos A, B e C definiram como um conceito nasce no registro, evolui e é consultado — mas deixaram deliberadamente em aberto a porta de entrada: **quais termos merecem ser promovidos**. Sem política de admissão, ocorre um dos dois extremos mapeados na ANL-002 §5: a inflação conceitual (tudo vira conceito oficial e o mecanismo vira burocracia, violando o princípio 1 da CON-001) ou a informalidade (termos ganham força normativa por costume — exatamente o que o princípio obrigatório 1 proíbe). Este requisito fecha o ciclo do mecanismo separando as duas responsabilidades identificadas na ANL-002 §2: **decidir a promoção** (aqui) e **definir o significado** (mecanismo, via REQ-006). Responsabilidade única: **a decisão de admissão**; o ato de registro, a evolução e a resolução permanecem nos REQs 006–008.

## Critérios de aceitação

* Nenhum termo adquire status de conceito organizacional por uso recorrente, convenção informal ou prática operacional: todo conceito oficialmente registrado tem origem em uma decisão formal de admissão, e a ausência dessa decisão impede o registro (REQ-006).
* Toda proposta de admissão contém, no mínimo: o termo proposto, a definição proposta e a justificativa da contribuição para a interpretação consistente da organização (quais documentos ou interpretações dependem do termo).
* Toda decisão de admissão avalia e registra explicitamente: (a) a contribuição do termo para a interpretação consistente da organização; (b) a inexistência de conceito vigente com significado equivalente — nenhuma aprovação ocorre sem essas duas avaliações registradas.
* Toda promoção aprovada referencia o artefato de governança que a autorizou, e é esse artefato que o registro do conceito referencia como origem (REQ-006, critério de origem rastreável).
* A aprovação da admissão **autoriza** o registro do conceito conforme o REQ-006, mas não o constitui: o conceito só existe oficialmente após o ato de registro na autoridade semântica.
* Toda decisão — aprovação ou rejeição — gera registro na Memória Organizacional com os cinco campos (CON-001, Art. 8º).
* **A decisão de admissão produz um resultado explícito**: toda proposta submetida resulta em decisão formal de aprovação ou rejeição; nenhuma proposta permanece indefinidamente sem resultado dentro do processo de governança — estados indefinidos de propostas não existem.
* **A política de admissão é independente da origem da proposta** (princípio funcional): a análise considera exclusivamente os critérios organizacionais definidos pela governança; a origem da proposta — documento, pessoa, IA, equipe ou processo — não pode, por si só, influenciar a decisão de admissão. Este princípio reforça a impessoalidade da autoridade semântica.
* A rejeição de uma proposta não altera o significado de nenhum conceito existente e não impede a reapresentação futura do termo mediante novo processo de governança; cada reapresentação é uma nova proposta, com novo registro decisório.

## Fora do escopo

* O ato de registro do conceito admitido — REQ-006 (Grupo A).
* A evolução semântica de conceitos registrados — REQ-007 (Grupo B).
* A resolução do significado vigente — REQ-008 (Grupo C).
* A definição de quais alçadas decidem a admissão — responsabilidade da governança vigente; este requisito exige a decisão formal, não redefine quem a toma.
* A regularização das três definições preexistentes ao mecanismo (REQ-003, REQ-004/ANL-001, REQ-005) — tratada no corte único de migração (ANL-002 §6, etapa 3).
* Implementação, estrutura documental, formato dos registros, mecanismos de distribuição, workflow, prazos e alçadas.

## Dependências

* **REQ-006** — a aprovação de admissão desemboca no registro oficial; o critério de origem rastreável do REQ-006 consome o artefato autorizador produzido por este requisito.

## Riscos e incertezas

* **Julgamento inerente à avaliação:** "contribuir para a interpretação consistente" envolve juízo humano; o requisito torna o juízo **explícito e registrado** (as duas avaliações obrigatórias), mas não o elimina — limitação declarada (CON-001, Art. 9º, princípio 8).
* **Burocratização da proposta:** exigências excessivas desestimulariam propostas legítimas, perpetuando definições informais. Mitigação: a proposta exige apenas três elementos (termo, definição, justificativa).
* **Duplicidade não detectada:** a avaliação de equivalência com conceitos vigentes depende da qualidade da consulta ao acervo (REQ-008); equivalências sutis podem escapar. Mitigação: a evolução semântica (REQ-007) e a governança permitem corrigir posteriormente, com rastro.
* **Passivo pré-mecanismo:** as três definições existentes nunca passaram por admissão formal; permanecem legítimas sob a disposição transitória da ADR-007 até a migração, que deverá regularizá-las — limitação declarada.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança (mecanismo posicionado pela ADR-008, Decisão 1) |
| Norma superior | CON-001 Art. 5º, 6º, 7º, 8º e 9º (princípio 1); ADR-007 v1.0; ADR-008 v1.0 |
| Origem | ANL-002 v1.0 (§2 — separação entre definir e promover; política de admissão remetida aos REQs do mecanismo); sequência oficial do mecanismo; autorização do Grupo D pelo CTO com os quatro princípios obrigatórios (21/07/2026) |
| Dependências | REQ-006 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, incorporando os quatro princípios obrigatórios do CTO | Autorização do Grupo D do mecanismo | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionados critério de resultado explícito (sem estados indefinidos de propostas) e princípio de independência da origem da proposta (impessoalidade) | Revisão do CTO | **Aprovado — ciclo de requisitos do Mecanismo de Conceitos concluído** |
