# REQ-038 — Troca de Contexto Operacional Ativo

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá permitir ao Patrocinador **trocar o COA ativo** de forma explícita e rápida; ao trocar, todo o contexto exibido e operável (foco, estado, registros, conversa) passa a ser o do novo COA, preservando integralmente o estado persistente do COA anteriormente ativo.

## Tipo

Funcional; detalhado.

## Justificativa

VIS-007 §1 e §4: trabalhar em Sistema CEO, MG2 e Última Milha no mesmo dia exige troca sem misturar contextos. REQ-017 proibia troca; este REQ a institui sob o modelo COA.

A troca explícita do COA é o **mecanismo oficial de navegação** entre contextos operacionais independentes.

## Critérios de aceitação

* Existe controle observável de troca rápida no topo da Home (seletor do COA ativo).
* Existe ação "Abrir" / "Tornar ativo" na tela de Projetos/COAs.
* Após a troca, Resumo Executivo, conversa e listas refletem apenas o novo COA.
* O COA anterior permanece intacto (sem perda de dados).
* Após retornar a um COA anteriormente utilizado, o ambiente executivo deverá ser restaurado conforme o estado persistido daquele COA.

## Fora do escopo

* Troca automática por inferência sem confirmação/ato explícito.
* Merge de contextos.

## Dependências

REQ-036; REQ-037; REQ-039.

## Riscos e incertezas

* Troca acidental no meio de uma conversa — ARQ deve definir se há confirmação mínima sem burocracia (REQ-028).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §1, §4 |
| Origem | Deliberação CTO 25/07/2026 |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Deliberação CTO | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: preservação do estado anterior; restauração ao retornar; troca como navegação oficial | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-038 HOMOLOGADO | **Homologado** |
