# REQ-007 — Evolução semântica dos conceitos organizacionais

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança (Mecanismo de Conceitos Organizacionais, Grupo B — ADR-008)

## Enunciado

O CEO deverá evoluir as definições oficiais dos conceitos organizacionais registrados exclusivamente por meio da autoridade semântica, produzindo, a cada evolução aprovada, uma nova definição vigente que substitui a anterior — preservando a identidade do conceito, seu identificador permanente e a imutabilidade do histórico.

**Princípios obrigatórios** (CTO, 21/07/2026):

1. A evolução semântica altera **exclusivamente a definição normativa vigente** do conceito. A identidade do conceito permanece preservada.
2. Toda evolução semântica deve **preservar a identidade** do conceito organizacional. Caso a identidade deixe de ser preservada, trata-se de um **novo conceito organizacional**, cuja criação seguirá o processo próprio de registro e governança (REQ-006).

## Tipo

Funcional; alto nível.

## Justificativa

Conceitos organizacionais precisarão evoluir — o vocabulário de uma organização viva não é estático. Sem um caminho oficial de evolução, ocorre exatamente o que a ADR-007 proíbe: definições locais alterando significado, agora sob pressão legítima de mudança. Este requisito cria esse caminho, equilibrando dois riscos opostos já mapeados na ANL-002 §5: a **ossificação semântica** (evoluir tão difícil que os documentos contornam o mecanismo) e a **deriva silenciosa** (evoluir tão informal que o significado muda sem rastro). Responsabilidade única: **alterar a definição vigente de um conceito já registrado**; registrar conceitos novos (REQ-006/Grupo A), consultar significados (Grupo C) e decidir promoções (Grupo D) são de outros requisitos.

## Critérios de aceitação

* Toda evolução semântica ocorre exclusivamente na autoridade semântica; alterações de significado fora dela não têm efeito normativo (ADR-007, princípio arquitetural).
* A evolução altera exclusivamente a definição normativa vigente: o identificador permanente do conceito permanece inalterado antes e depois de qualquer evolução.
* Após cada evolução aprovada, o conceito possui exatamente uma definição vigente — a nova; a definição anterior deixa de ser vigente e permanece recuperável no histórico.
* **A evolução semântica nunca produz mais de uma definição normativa vigente para o mesmo conceito**: o histórico pode conter múltiplas definições, mas apenas uma possui vigência em qualquer instante — a unicidade temporal da definição vigente é verificável a qualquer momento.
* **Toda evolução semântica é plenamente rastreável** (princípio funcional): cada evolução mantém referência ao evento imediatamente anterior da cadeia evolutiva do conceito, preservando a continuidade histórica da definição — da definição vigente é possível percorrer a cadeia completa até o registro original (REQ-006).
* Toda evolução identifica quem a aprovou e quando (a alçada de aprovação é a definida pela governança vigente — não é redefinida aqui) e gera evento de histórico com os cinco campos da Memória Organizacional (CON-001, Art. 8º).
* A imutabilidade do histórico (REQ-006) é preservada: a evolução produz novos eventos e nunca modifica eventos já registrados.
* As referências existentes ao conceito permanecem válidas após a evolução: consumidores que referenciam pelo identificador passam a consumir a nova definição vigente; quando a precisão temporal importar, a definição vigente no momento de um uso passado permanece determinável pelo histórico (simetria com o rastro temporal do REQ-003; ADR-008, Decisão 4).
* Proposta de evolução que não preserve a identidade do conceito não é processada como evolução: é encaminhada como criação de novo conceito (REQ-006), e o conceito original permanece inalterado por essa proposta.

## Fora do escopo

* Critérios para julgar a preservação da identidade e critérios de criação de novos conceitos — responsabilidade da governança; o julgamento em cada caso cabe às alçadas.
* Política de admissão de conceitos — Grupo D do mecanismo.
* Resolução de conceitos (consulta e determinação do significado vigente para uso) — Grupo C do mecanismo.
* Descontinuação ou revogação de conceitos registrados — não coberta por este requisito; será tratada quando a governança a demandar.
* Migração das definições preexistentes ao mecanismo — etapa 3 da ordem da ANL-002 §6.
* Formato do registro, estrutura documental, estrutura de versionamento, modelo de armazenamento, fluxo operacional de proposta ou qualquer implementação.

## Dependências

* **REQ-006** — só evolui o que está oficialmente registrado; a imutabilidade do histórico e o identificador permanente que esta evolução preserva são estabelecidos por ele.

## Riscos e incertezas

* **Ossificação semântica** (ANL-002 §5): se evoluir for cerimonioso demais, definições informais reaparecem. Mitigação: as exigências são as mínimas — aprovação de alçada e evento de histórico; nada além.
* **Subjetividade do juízo de identidade:** decidir se uma proposta preserva a identidade do conceito envolve julgamento humano; os critérios não são definidos aqui — limitação declarada (CON-001, Art. 9º, princípio 8), com a salvaguarda funcional de que a dúvida resolve-se a favor da criação de novo conceito, nunca da mutação silenciosa.
* **Consumidores desatualizados:** agentes podem operar com definição anterior à evolução até serem atualizados — risco de propagação pertencente ao canal de distribuição (REQ-001), não a este requisito; a detecção de divergência permanece candidata à CAP-09.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança (mecanismo posicionado pela ADR-008, Decisão 1) |
| Norma superior | CON-001 Art. 5º, 7º, 8º; ADR-007 v1.0; ADR-008 v1.0 |
| Origem | ANL-002 v1.0 (§1, responsabilidade 4 — reger a evolução semântica); sequência oficial do mecanismo; autorização do Grupo B pelo CTO com os dois princípios obrigatórios (21/07/2026) |
| Dependências | REQ-006 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, incorporando os dois princípios obrigatórios do CTO | Autorização do Grupo B do mecanismo | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionados critério de unicidade temporal da definição vigente e princípio funcional de rastreabilidade plena da cadeia evolutiva | Revisão do CTO | **Aprovado — Grupo B do Mecanismo de Conceitos concluído** |
