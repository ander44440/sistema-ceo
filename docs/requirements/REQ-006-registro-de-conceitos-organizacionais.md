# REQ-006 — Registro oficial de conceitos organizacionais

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança (Mecanismo de Conceitos Organizacionais, Grupo A — ADR-008)

## Enunciado

O CEO deverá registrar oficialmente na autoridade semântica cada conceito organizacional promovido pelas alçadas de governança, atribuindo-lhe identificador permanente emitido pelo próprio mecanismo, exatamente uma definição oficial vigente, origem rastreável e histórico desde o registro.

**Conceito referenciado:** *conceito organizacional*, conforme definição oficial estabelecida pelo CTO na ANL-002 §2 (transcrição informativa, não vinculante — ADR-008, Decisão 4: "termo cujo significado precisa permanecer único e normativamente consistente para garantir a correta interpretação de um ou mais documentos da organização").

## Tipo

Funcional; alto nível.

## Justificativa

A ADR-007 decidiu que a autoridade semântica existe e é responsável pela definição normativa única e vigente de cada conceito; a ADR-008 a integrou à arquitetura documental sob a CAP-01, com registro próprio. Falta o elo funcional inaugural: **como um conceito passa a existir oficialmente**. Sem ele, o princípio "nenhuma definição local altera significado" (ADR-007) não tem porta de entrada legítima — todo conceito continuaria nascendo distribuído, como os três casos que motivaram a suspensão da CAP-04. Responsabilidade única: **o ato de registro**; decidir quais termos merecem promoção (Grupo D), alterar significados (Grupo B) e consultar o significado vigente (Grupo C) são de requisitos posteriores.

## Critérios de aceitação

* Todo conceito organizacional oficialmente registrado possui identificador permanente emitido pela própria autoridade semântica — nunca renumerado nem reutilizado — em espaço de identificação próprio, sem dependência da estrutura interna de identificadores de outros mecanismos (ADR-008, Decisão 3 e princípio arquitetural).
* Todo registro contém exatamente uma definição oficial vigente do conceito no momento do registro.
* Todo registro identifica quem aprovou a definição e quando (a alçada de aprovação é a definida pela governança vigente — não é redefinida aqui).
* Todo registro contém a origem do conceito: a referência, por identificador, ao **artefato de governança responsável por autorizar sua existência oficial**, preservando a rastreabilidade da decisão organizacional. Quais artefatos podem exercer essa autorização permanece responsabilidade da governança — não é definido aqui.
* Todo ato de registro gera entrada de histórico com os cinco campos da Memória Organizacional: quem, quando, por quê, baseado em quê e resultado (CON-001, Art. 8º).
* **O histórico associado ao registro do conceito é imutável** (princípio funcional): correções ou alterações nunca modificam eventos históricos já registrados — produzem novos eventos, preservando a auditabilidade.
* Nenhum conceito organizacional passa a existir oficialmente por outro meio que não o registro na autoridade semântica; definições anteriores a este requisito permanecem válidas sob a disposição transitória da ADR-007 até o corte único de migração.

## Fora do escopo

* Política de admissão — decidir *quais* termos devem ser promovidos a conceito organizacional — Grupo D do mecanismo.
* Evolução semântica — alteração, substituição ou revogação de definições registradas — Grupo B do mecanismo.
* Resolução de conceitos — consulta e determinação do significado vigente para uso — Grupo C do mecanismo.
* Execução da migração das três definições existentes (REQ-003, REQ-004/ANL-001, REQ-005) — etapa 3 da ordem da ANL-002 §6, que aplicará este requisito quando autorizada.
* Formato do registro, estrutura documental e esquema concreto de identificação — definições posteriores, respeitados os princípios da ADR-008.

## Dependências

Nenhuma dependência de outros requisitos. Fundamenta-se nas decisões já aprovadas: ADR-007 (existência e responsabilidade) e ADR-008 (integração arquitetural).

## Riscos e incertezas

* **Janela sem política de admissão:** até o Grupo D, a promoção de termos é decidida caso a caso pelas alçadas de governança, sem política formal — limitação declarada (CON-001, Art. 9º, princípio 8); o registro exige origem rastreável exatamente para que essas decisões caso a caso não fiquem sem histórico.
* **Dupla autoridade transitória:** enquanto a migração não ocorrer, as três definições existentes vivem fora do registro. Mitigação: regime transitório da ADR-007 (referência, nunca cópia) e corte único previsto na ordem oficial.
* **Registro oneroso:** exigências demais no ato de registro desestimulariam a promoção de conceitos e perpetuariam definições informais. Mitigação: os campos exigidos são os mínimos — identificador, definição, aprovação, origem e histórico.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança (mecanismo posicionado pela ADR-008, Decisão 1) |
| Norma superior | CON-001 Art. 5º, 7º, 8º; ADR-007 v1.0; ADR-008 v1.0 |
| Origem | ANL-002 v1.0 (§1, §6); sequência oficial do mecanismo e autorização do Grupo A pelo CTO (21/07/2026) |
| Dependências | — |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação | Autorização do Grupo A do mecanismo pelo CTO, com gate aberto pela ADR-008 | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Origem refinada: referência ao artefato de governança autorizador (sem definir quais); adicionado princípio funcional de imutabilidade do histórico | Revisão do CTO | **Aprovado — primeiro requisito do Mecanismo de Conceitos** |
