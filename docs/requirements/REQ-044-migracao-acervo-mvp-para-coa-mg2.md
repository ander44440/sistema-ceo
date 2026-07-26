# REQ-044 — Migração do acervo do MVP v0.1 para o COA Motoboy Game 2

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá migrar integralmente o acervo operacional do MVP v0.1 (decisões, conhecimentos, estado do dia e correlatos do contexto MG2) para o Contexto Operacional **Motoboy Game 2**, sem perda, preservando a identidade e os relacionamentos dos registros, e sem misturá-los com outros COAs.

## Tipo

Funcional / continuidade; detalhado.

## Justificativa

VIS-007 §5: preservar o patrimônio já validado no uso diário MG2 ao introduzir COA, sem invalidar a VAL-005 (que conclui normalmente).

A migração constitui um mecanismo de **preservação da continuidade operacional** e do patrimônio de conhecimento acumulado, assegurando a transição para a arquitetura baseada em COAs sem ruptura histórica.

## Critérios de aceitação

* Após a migração (na IMP futura), todos os registros do MVP v0.1 referentes ao MG2 aparecem sob o COA "Motoboy Game 2".
* Nenhum registro migrado aparece em Sistema CEO ou Última Milha.
* Após a migração, a quantidade de registros associados ao contexto MG2 no MVP deverá corresponder integralmente à quantidade de registros existentes no COA "Motoboy Game 2", ressalvadas apenas transformações deliberadas e documentadas na ARQ/IMP.
* A VAL-005 continua podendo ser concluída sobre o MVP v0.1 congelado **sem** depender desta migração para encerrar o calendário.
* Há evidência rastreável do mapeamento antigo→novo.

## Fora do escopo

* Reescrever o MVP v0.1 durante a VAL-005.
* Migração antes da homologação deste ciclo.

## Dependências

REQ-036; REQ-037; REQ-039; VIS-003 / MVP v0.1 (fonte).

## Riscos e incertezas

* Datas e formatos do acervo atual — inventário na ARQ/IMP.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §5; Deliberação CTO — VAL-005 preservada |
| Origem | Continuidade do patrimônio MG2 |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Migração MG2 → COA | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: identidade/relacionamentos; completude quantitativa; continuidade operacional | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-044 HOMOLOGADO | **Homologado** |
