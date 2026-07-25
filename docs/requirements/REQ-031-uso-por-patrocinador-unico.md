# REQ-031 — Uso por patrocinador único

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-10 — Segurança

## Enunciado

O CEO MVP v0.1 deverá operar sob a premissa de **um único patrocinador** (persona do VIS-003): sem papéis múltiplos, multi-usuário ou delegação de autoridade a outros operadores na experiência diária.

## Tipo

Não funcional; alto nível (restritivo).

## Justificativa

VIS-003 §2 e §6. Reduz complexidade que não aproxima os cinco dias de uso do Anderson no MG2.

## Critérios de aceitação

* A experiência diária do MVP não exige seleção de perfil/papel além do patrocinador.
* Não há fluxos de aprovação entre múltiplos usuários no MVP.
* A autoridade de confirmação (REQ-027) é sempre a do patrocinador persona.

## Fora do escopo

* IAM, times, permissões granulares.

## Dependências

REQ-027.

## Riscos e incertezas

* Necessidade futura de segundo usuário — fora do MVP; evolui após experiência real (ADR-015).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-10 |
| Norma superior | VIS-003 §2, §6; CON-001 Art. 6º; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 persona única | Em análise |
