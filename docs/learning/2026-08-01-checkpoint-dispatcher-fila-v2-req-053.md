# Checkpoint — Dispatcher V2 da Fila (REQ-053) e fecho da ponte humana

> **Data:** 01/08/2026  
> **Para:** CTO (ChatGPT)  
> **De:** Engenheiro (Cursor), sob mandato do Patrocinador  
> **Estado:** **Homologada** — frente REQ-053 **encerrada**; ver `docs/learning/ANCORA-MESTRA.md`

## O que é?

Entrega da **opção V2** (menor custo/risco): watcher local + Cursor SDK, para o CEO despachar Jobs (REQ-045) e o Agent Cursor consumir a fila **sem** o patrocinador copiar/colar nem dizer «consuma a fila» em cada ciclo.

## Por que existe?

A REQ-045 removeu a ponte de *conteúdo*, mas manteve o gatilho humano. O patrocinador autorizou fechar esse residual com PC ligado (não cloud 24/7).

## Para quem existe?

Patrocinador (uso diário ADR-015) e CTO (governança CAP-11 / fila).

## Como o sucesso será medido?

- Job `pending` → Agent acordado sem instrução manual no chat.
- Dispatcher observável; autostart no login Windows.
- CEO continua a **não** conhecer o Cursor (só publica Jobs).

---

## Decisão do patrocinador

Entre V2 (watcher + SDK, PC ligado) e V3 (cloud 24/7), escolheu **V2** por menor custo e risco. Autorizou implantação imediata.

## Artefactos

| Item | Referência |
|------|------------|
| Requisito | `docs/requirements/REQ-053-dispatcher-fila-execucao-v2-local.md` (Aprovado v0.1) |
| Código | `executive/dispatcher/` (`@cursor/sdk`, CLI, testes) |
| Autostart Windows | Tarefa `CEO-fila-dispatcher` (AtLogOn); scripts `install-autostart.ps1`, `start-watcher.ps1`, `stop-watcher.ps1` |
| Norma base | REQ-045 (fila); skill `consumir-fila-execucao` |

## Validação observada (01/08/2026)

Com `npm start` / watcher:

| Job | Título (resumo) | Resultado |
|-----|-----------------|-----------|
| JOB-000011 | Coleta viabilidade | Agent `finished` (~70s) |
| JOB-000012 | BP-001 E6 smoke | Agent `finished` (~66s) |
| JOB-000014 | Prioridades diárias | Agent `finished` (~39s) |

Fila vazia a seguir → watcher em idle (`nenhum Job pending`) — comportamento esperado do modo `watch`.

## Modelo operacional vigente

```text
Patrocinador ↔ CEO (decisão)
CEO → Job pending (REQ-045)
Dispatcher local (REQ-053) → Agent Cursor (SDK)
Agent → completed/failed
```

- **Não** é obrigatório abrir a IDE Cursor para o ciclo funcionar.
- **Sim** é necessário PC ligado + watcher (autostart no login).
- V3 (máquina off / cloud) **fora** deste marco.

## Pedido ao CTO

1. Tomar conhecimento e, se couber, **homologar** REQ-053 no catálogo / parecer breve.
2. Indicar se deseja IMP/VAL formais ou se o checkpoint + evidência de Jobs basta para este MVP V2.
3. Confirmar que V3 permanece backlog (não autorizado agora).

## Riscos residuais (transparência)

- Chave `CURSOR_API_KEY` no `.env` local (já houve exposição no chat; chave rodada).
- Dois watchers em paralelo se `npm start` + `start-watcher` simultâneos — mitigado por PID/lock e instrução operacional.
- SDK em beta — versão fixada no `package.json` do dispatcher.

---

*Memória organizacional — quem: Patrocinador + Engenheiro; quando: 01/08/2026; porquê: fechar ponte humana residual da fila; baseado em: REQ-045 + decisão V2; resultado: ciclo ponta a ponta validado com 3 Jobs.*
