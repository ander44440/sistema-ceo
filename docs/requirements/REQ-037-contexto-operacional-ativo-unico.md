# REQ-037 — Contexto Operacional Ativo (COA) único

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos  
> Norma: VIS-007 v0.2; CON-001; ADR-006.  
> **Sucedâneo previsto de:** REQ-017 (contexto fixo MG2) — apenas após homologação e IMP deste ciclo; MVP v0.1 permanece sob REQ-017 até lá.

## Enunciado

O CEO deverá operar, a qualquer momento, sobre **exatamente um** Contexto Operacional Ativo (COA), selecionado dentre os Contextos Operacionais cadastrados (REQ-036); toda conversa, registro, foco, estado do dia e histórico operáveis referem-se exclusivamente a esse COA.

## Tipo

Funcional; detalhado. **Conceito fundador** do ciclo.

## Justificativa

Definição CTO (VIS-007 §1): *"O CEO sempre opera sobre exatamente um Contexto Operacional Ativo."* Substitui a premissa de contexto único fixo no MG2 por contexto único **selecionável**.

Este requisito estabelece o **princípio operacional central** do Ambiente Executivo Conversacional, sobre o qual os demais requisitos da CAP-03 são construídos.

## Critérios de aceitação

* Em qualquer instante observável existe um e somente um COA ativo.
* O COA ativo é selecionado dentre os Contextos Operacionais cadastrados (REQ-036).
* Toda conversa iniciada pertence ao COA ativo.
* Foco, onde paramos, próximo passo, decisões e conhecimentos exibidos referem-se ao COA ativo.
* Após a troca de COA, todo o ambiente executivo deverá passar a refletir exclusivamente o novo COA ativo (REQ-038).
* Não é possível operar "sem COA" na experiência diária (primeiro uso exige seleção ou default deliberado na ARQ).

## Fora do escopo

* Operação simultânea sobre dois COAs.
* Compartilhamento de registros entre COAs (coberto por REQ-039).

## Dependências

VIS-007; REQ-036; REQ-038.

## Riscos e incertezas

* Default inicial do COA na primeira abertura pós-migração — definir na ARQ.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §1; Deliberação CTO 25/07/2026 |
| Origem | Substituição conceitual de REQ-017 |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Deliberação CTO — COA | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: seleção entre cadastrados; critério pós-troca; princípio operacional central | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-037 HOMOLOGADO | **Homologado** |
