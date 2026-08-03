# REQ-053 — Dispatcher local da Fila de Execução (V2)

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-11 — Integrações

## Enunciado

O Sistema CEO deverá poder acionar o consumo de Jobs `pending` da Fila de Execução (REQ-045) num processo local do patrocinador, sem que o utilizador copie/cole o conteúdo do Job nem abra manualmente um chat no Cursor para cada despacho; o CEO continua a publicar apenas Jobs e **não** referencia nem invoca o Cursor.

## Tipo

Funcional; detalhado (MVP V2 local).

## Justificativa

REQ-045 V1 removeu a ponte de conteúdo, mas manteve o patrocinador como gatilho humano (“consuma a fila”). ADR-015 e CON-001 (respeito ao tempo do utilizador) exigem fechar o ciclo deliberação → execução com o menor atrito. O patrocinador autorizou a opção de menor custo/risco: watcher local + Cursor SDK (PC ligado), em vez de automação cloud 24/7.

## Critérios de aceitação

* Existe um processo local (dispatcher) que observa `executive/queue/` (ou a API local de pendentes) e deteta Jobs com `estado = pending`.
* Ao detetar pending, o dispatcher invoca um Agent Cursor **local** (`@cursor/sdk`) com instrução para consumir a fila segundo o skill/protocolo REQ-045 — sem o utilizador colar o Job.
* O CEO / capacidade `fila` **não** passa a conhecer o Cursor; o dispatcher é camada externa à deliberação.
* Modo `--dry-run` lista o que seria despachado **sem** chamar o SDK.
* Credencial `CURSOR_API_KEY` fica só no ambiente local (`.env` / variáveis); nunca no git.
* Documentação operacional descreve: instalar, configurar chave, iniciar watcher, parar.
* Fora do PC ligado / sem chave: comportamento degradado previsível (Jobs ficam `pending`; mensagem clara no log).

## Fora do escopo

* Dispatcher 24/7 com máquina desligada (cloud / Automations) — candidato a V3.
* Alterar o schema dos Jobs ou a regra “CEO não conhece o executor”.
* Versionar Jobs no git.
* Filas cloud / mensageria paga.
* Executores além do Cursor Agent.

## Dependências

REQ-045; REQ-030; ADR-015; skill `consumir-fila-execucao`.

## Riscos e incertezas

* SDK em beta pública — API pode mudar; fixar versão no `package.json` do dispatcher.
* Agent local consome quota/API do Cursor; risco de despachos duplicados se dois watchers correrem — mitigar com lock file.
* Jobs já `pending` (ex. legado) serão consumidos ao ligar o watcher — comportamento esperado; o patrocinador pode `cancelled` antes.
* Node.js ≥ 22.13 pode ser exigido pelo `@cursor/sdk`.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 |
| Norma superior | CON-001; ADR-015; REQ-045 |
| Origem | Decisão do patrocinador 01/08/2026 — V2 watcher + SDK (menor custo/risco) |
| Decisões derivadas | — |
| Implementação | `executive/dispatcher/` |
| Testes | `--dry-run`; smoke manual com chave |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Patrocinador + Cursor | Criação e aprovação operacional V2 | Fechar ponte humana residual | Aprovado para implantação |
| 0.1 | 01/08/2026 | Patrocinador | Homologação e encerramento formal da frente | Evidência Jobs + Âncora Mestra | **Homologada** — frente encerrada |
