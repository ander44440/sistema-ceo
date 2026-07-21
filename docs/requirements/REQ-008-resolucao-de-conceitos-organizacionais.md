# REQ-008 — Resolução de conceitos organizacionais

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança (Mecanismo de Conceitos Organizacionais, Grupo C — ADR-008)

## Enunciado

O CEO deverá determinar e fornecer, a qualquer consumidor autorizado que informe o identificador permanente de um conceito organizacional, a definição normativa vigente correspondente no momento da consulta — de forma explícita, fiel ao registro e sem produzir qualquer alteração no registro, no histórico ou na vigência das definições.

**Princípios obrigatórios** (CTO, 21/07/2026):

1. A resolução de um conceito sempre retorna a definição normativa vigente correspondente ao identificador informado.
2. Na inexistência de definição vigente para o identificador solicitado, o mecanismo produz uma resposta explícita — nunca um resultado implícito ou silencioso.
3. A resolução de conceitos nunca altera o registro, o histórico ou a vigência das definições: seu papel é exclusivamente determinar e fornecer a definição normativa oficial aplicável ao momento da consulta.

## Tipo

Funcional; alto nível.

## Justificativa

O mecanismo já sabe como um conceito nasce (REQ-006) e como evolui (REQ-007); falta o elo que o torna útil no dia a dia: **como qualquer consumidor determina, de forma inequívoca, o significado oficial vigente**. É o análogo semântico do REQ-003 — assim como nenhuma decisão se fundamenta em norma não vigente, nenhuma interpretação deve se fundamentar em definição não vigente. Sem resolução oficial, cada consumidor "lembraria" sua própria versão do conceito, reintroduzindo por leitura a divergência que a ADR-007 eliminou na escrita. Responsabilidade única: **determinar e fornecer a definição vigente**; registrar (Grupo A), evoluir (Grupo B) e admitir (Grupo D) são de outros requisitos.

## Critérios de aceitação

* Dada uma consulta com o identificador permanente de um conceito, a resposta é a definição normativa vigente correspondente àquele identificador no momento da consulta.
* A resolução nunca retorna mais de uma definição para a mesma consulta — consequência verificável da unicidade temporal da vigência (REQ-007).
* A definição fornecida é idêntica à definição vigente registrada na autoridade semântica: a resolução não parafraseia, não resume e não complementa o texto normativo.
* Na inexistência de definição vigente para o identificador solicitado — identificador desconhecido ou sem vigência —, a resposta declara essa condição explicitamente; nunca há silêncio, resultado implícito ou definição substituta.
* A resolução é operação exclusivamente de leitura: nenhuma consulta altera o registro, o histórico, a vigência ou a cadeia evolutiva das definições.
* Quando a consulta indicar um instante de referência passado, a resposta é a definição que estava vigente naquele instante, determinável pelo histórico imutável (REQ-006) e pela cadeia evolutiva (REQ-007) — simetria com o rastro temporal do REQ-003, conforme ADR-008 (Decisão 4). *Nota (CTO, 21/07/2026): a resolução histórica não constitui nova responsabilidade do mecanismo; é consequência direta da combinação REQ-006 + REQ-007 + ADR-008 e pertence naturalmente ao Grupo C.*
* **A resolução é determinística**: todos os consumidores autorizados que consultem o mesmo identificador utilizando o mesmo instante de referência recebem o mesmo resultado.
* **A resolução é independente do documento consumidor** (princípio funcional): a definição oficial retornada depende exclusivamente do identificador do conceito e do instante de referência — nunca do documento que realizou a consulta. Este princípio preserva a autoridade semântica única da organização.

## Fora do escopo

* Política de admissão de conceitos — Grupo D do mecanismo.
* Evolução semântica das definições — REQ-007 (Grupo B).
* Criação e registro de novos conceitos — REQ-006 (Grupo A).
* Critérios de identidade de conceitos — responsabilidade da governança.
* Definição de quais consumidores são autorizados — responsabilidade da governança; este requisito pressupõe a autorização, não a concede.
* Descoberta de conceitos a partir de termos, palavras ou texto — a resolução opera exclusivamente por identificador; descoberta envolveria mecanismos de busca, expressamente excluídos.
* Implementação, estrutura documental, mecanismos de busca, indexação, armazenamento, cache ou otimizações.

## Dependências

* **REQ-006** — identificadores permanentes, registro oficial e histórico imutável sobre os quais a resolução opera.
* **REQ-007** — unicidade temporal da definição vigente e cadeia evolutiva que tornam a resposta única e o instante passado determinável.

## Riscos e incertezas

* **Resposta de inexistência tratada como licença:** um consumidor que receba "não há definição vigente" pode se sentir autorizado a definir localmente — o que a ADR-007 proíbe. Mitigação: a resposta explícita cria o rastro do vazio semântico; o caminho legítimo é propor a promoção do termo (Grupo D futuro).
* **Dependência da integridade do registro:** a resolução herda a confiabilidade do REQ-006/REQ-007 — histórico corrompido invalida a resolução temporal (mesmo risco estrutural declarado no REQ-003).
* **Consumidores com cópias defasadas:** agentes podem operar com definição obtida antes de uma evolução; o risco pertence ao canal de distribuição (REQ-001) e à detecção de divergência (candidata à CAP-09), não à resolução em si — limitação declarada (CON-001, Art. 9º, princípio 8).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança (mecanismo posicionado pela ADR-008, Decisão 1) |
| Norma superior | CON-001 Art. 5º, 7º, 8º; ADR-007 v1.0; ADR-008 v1.0 (Decisão 4) |
| Origem | ANL-002 v1.0 (§3 — simetria com REQ-003); sequência oficial do mecanismo; autorização do Grupo C pelo CTO com os três princípios obrigatórios (21/07/2026) |
| Dependências | REQ-006; REQ-007 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, incorporando os três princípios obrigatórios do CTO | Autorização do Grupo C do mecanismo | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Resolução histórica mantida (consequência de REQ-006 + REQ-007 + ADR-008, sem ampliação de escopo); adicionados critério de determinismo e princípio de independência do documento consumidor | Revisão do CTO | **Aprovado — Grupo C do Mecanismo de Conceitos concluído** |
