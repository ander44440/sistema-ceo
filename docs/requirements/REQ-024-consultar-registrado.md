# REQ-024 — Consultar o registrado

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento

## Enunciado

O CEO deverá permitir ao patrocinador **consultar** o que já está registrado sobre um tema do trabalho atual no MG2 (decisões e/ou conhecimentos pertinentes) e, quando nada houver, **declarar ausência de forma explícita** — nunca por silêncio ambíguo nem por invenção.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §3 passo 7; M5. Sem consulta com ausência explícita, o patrocinador não confia no posto de comando quando trava.

## Critérios de aceitação

* O patrocinador pode solicitar o que já se sabe sobre um tema do trabalho atual no MG2.
* A resposta utiliza apenas o que está registrado (decisões e/ou conhecimentos do contexto).
* Quando não houver registrado aplicável, a ausência é declarada explicitamente.
* Nenhum conteúdo não registrado é apresentado como conhecimento ou decisão organizacional do CEO.

## Fora do escopo

* Recuperação proativa completa multi-projeto (REQ-005 em amplitude plena).
* Busca em ferramentas externas do MG2.

## Dependências

REQ-017; REQ-022; REQ-023.

## Riscos e incertezas

* Alucinação / inventar contexto — proibido pelos critérios.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 |
| Norma superior | VIS-003 §3, M5; CON-001 Art. 9º princípio 8; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 M5 | Em análise |
