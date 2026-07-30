# REQ-045 — Fila de Execução (Execution Queue) V1 local

> **Status:** Aprovado  
> **Versão:** 0.1 — 29/07/2026  
> **Capacidade:** CAP-11 — Integrações

## Enunciado

O CEO deverá poder publicar Jobs de execução técnica numa Fila de Execução local baseada em ficheiros, sem conhecer nem invocar diretamente qualquer executor (incluindo o Cursor); o consumo e encaminhamento dos Jobs pendentes deverá ser possível sem serviços pagos de mensagem nem intervenção de copiar/colar manual do conteúdo do Job.

## Tipo

Funcional; detalhado (MVP V1).

## Justificativa

ADR-015 (uso diário MG2); REQ-030 (CEO não substitui ferramentas de execução); princípio CON-001 de respeito ao tempo do patrocinador. A ponte humana por copiar/colar entre CEO e Cursor atrasa o ciclo deliberação → execução. A Queue desacopla governança de execução sem custo de infraestrutura cloud.

## Critérios de aceitação

* O CEO (via instrução reconhecida) publica um Job em `executive/queue/JOB-*.json` com estados canónicos (`pending` | `running` | `completed` | `failed` | `cancelled`).
* O CEO não referencia o Cursor (nem outro executor) no ato de publicar — apenas o Job.
* Existe API local (dev server) para publicar, listar pendentes e atualizar estado — sem RabbitMQ/Kafka/Redis.
* O Cursor, neste repositório, consegue descobrir Jobs `pending` e executá-los seguindo o protocolo do skill/regra do projeto, sem o utilizador colar o texto do Job.
* Jobs `JOB-*.json` não são versionados no git (apenas estrutura/README).
* Não altera o repositório do MG2 nem a Constituição/Governança/Briefing do LLM.

## Fora do escopo

* Dispatcher autónomo em background 24/7 sem abrir o Cursor.
* Executores além do Cursor.
* Filas cloud ou mensageria paga.
* Publicação automática de Job a partir de qualquer deliberação LLM (V1: publicação explícita por instrução).

## Dependências

REQ-030; ADR-015; arquitetura de identidade/prompt já homologada (inalterada).

## Riscos e incertezas

* Hooks `sessionStart` do Cursor podem não injetar contexto de forma fiável — V1 usa regra + skill + ficheiros.
* Trabalho no workspace do MG2 (fora deste repo) exige ler o caminho absoluto da fila do CEO.
* Sem processo Cursor aberto, Jobs permanecem `pending` (aceitável na V1 sem custo).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 |
| Norma superior | CON-001; ADR-015; REQ-030 |
| Origem | Deliberação operacional 29/07/2026 — ponte CEO↔Cursor sem custo |
| Decisões derivadas | — |
| Implementação | `executive/queue`, `app/server/executionQueue*`, capacidade `fila`, skill/regra Cursor |
| Testes | Verificação manual: publicar Job → consumir no Cursor |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 29/07/2026 | Patrocinador + Cursor | Criação e aprovação operacional V1 | Viabilizar ponte sem despesa | Aprovado para implementação V1 |
