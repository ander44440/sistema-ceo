# Oportunidade de evolução da governança — Conceitos organizacionais oficiais

> Registro de aprendizado, 21/07/2026. Origem: análise metodológica solicitada pelo CTO na revisão do REQ-005. Não normativo.

## A necessidade observada

A Fase 1 vem produzindo **definições conceituais com força normativa** que hoje vivem espalhadas pelos documentos que primeiro precisaram delas:

| Conceito | Definido em | Definido por |
|----------|-------------|--------------|
| Decisão sob governança | REQ-003 (Enunciado) | CTO, 21/07/2026 |
| Item de conhecimento (fronteira CAP-04 × CAP-05) | ANL-001 §2, replicado no REQ-004 | CTO, 21/07/2026 |
| Contexto de Trabalho | REQ-005 (Enunciado) | CTO, 21/07/2026 |

## A análise

Definições distribuídas entre requisitos repetem, para conceitos, o problema que o REQ-002 resolveu para normas: sem fonte canônica, cada novo documento pode redefinir sutilmente o mesmo termo, e a divergência é silenciosa. O caso "item de conhecimento" já exibe o sintoma: a mesma definição existe em dois lugares (ANL-001 e REQ-004) e depende de disciplina manual para permanecer idêntica.

A Constituição não prevê mecanismo para conceitos organizacionais (glossário ou equivalente), e o catálogo oficial não possui tipo documental para isso. Pela regra do catálogo, a criação desse mecanismo exige ADR.

## Encaminhamento registrado

* **Provisório (em vigor):** cada definição oficial permanece no documento em que o CTO a estabeleceu, citada por referência pelos demais (nunca copiada, para evitar bifurcação).
* **Evolução proposta (a decidir pelo CTO/Usuário):** criar, por ADR, um mecanismo de conceitos organizacionais — por exemplo, um glossário oficial com identificadores permanentes, no padrão do registro canônico de normas (REQ-002) — e migrar para ele as três definições existentes, deixando nos documentos de origem apenas a referência.

## O que isso ensina

Conceitos compartilhados são ativos de governança tão críticos quanto normas: a linguagem comum é o que permite que critérios de aceitação sejam objetivos entre revisores diferentes. Em engenharia de software, é o papel da *linguagem ubíqua*: um vocabulário único, mantido em fonte canônica, usado igualmente por documentos, código e conversas.
