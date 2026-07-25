# REQ-029 — Sem reexplicar o contexto

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá permitir que, após abrir o dia com estado preservado, o patrocinador **parta para o trabalho no MG2 sem reexplicar o contexto do zero** ao CEO naquele momento.

## Tipo

Não funcional; alto nível.

## Justificativa

VIS-003 §3 passo 4; §7 item 4. É o benefício central do posto de comando.

## Critérios de aceitação

* Com estado previamente confirmado (foco e próximo passo), a abertura do dia não exige reentrada narrativa completa do projeto MG2.
* O patrocinador pode iniciar a execução no MG2 imediatamente após consultar o Painel do Dia.
* Reexplicação só é necessária se o patrocinador optar por alterar o estado ou se o estado estiver ausente (primeiro uso / ausência declarada).

## Fora do escopo

* Sincronização automática com ferramentas externas do MG2.

## Dependências

REQ-018; REQ-026.

## Riscos e incertezas

* Estado incompleto no primeiro dia — ausência deve ser explícita (REQ-024 / transparência).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | VIS-003 §3 passo 4, §7; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 sem reexplicar | Em análise |
