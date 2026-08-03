# REQ-055 — Painel de Orquestração em Tempo Real

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá apresentar, no posto de comando (Centro de Situação), um **Painel de Orquestração em Tempo Real** que mostre o estado operacional dos actores do ciclo (CEO, CTO, Agent, Dispatcher, Backend, Speaker), actualizado sem recarregar a página — **sem** deslocar a Conversa do centro da experiência e **sem** expor detalhe técnico na vista principal.

## Tipo

Funcional; detalhado (MVP V1 do Painel).

## Justificativa

Após REQ-053 (Dispatcher) e REQ-054 (Conector CTO), o ciclo é multi-processo (cloud + PC). O patrocinador precisa de transparência operacional sem abrir terminais nem o ChatGPT. A **ARQ-016 v0.2** (homologada) define o painel, o enum de estados, SSE+snapshot, extensibilidade por registo e o **Princípio da Progressividade**: vista principal = Nome + Estado + descrição resumida; detalhe só sob interacção. CON-001 (tempo do utilizador; transparência) e F5 (Conversa SRF-T03 central; Atenção SRF-T02 de apoio).

## Objetivo funcional

1. Exibir os **seis nós V1** com estado padronizado.  
2. Actualizar em tempo quase real (SSE + snapshot; polling se SSE falhar).  
3. Cumprir **Progressividade**: vista principal só Nome · Estado · descrição resumida.  
4. Manter a **Conversa** como elemento central; painel = transparência.  
5. Permitir registo futuro de nós **sem** redesenhar a arquitectura do painel.  
6. Painel **só leitura** — não delibera, não despacha, não consulta CTO.

---

## Responsabilidades

| ID | Responsabilidade |
|----|------------------|
| R1 | Agregar sinais dos nós V1 e reduzir ao enum de estados. |
| R2 | Expor `GET` snapshot e stream (SSE) de orquestração no backend. |
| R3 | Renderizar o painel no Centro com Progressividade. |
| R4 | Revelar `detalhe` apenas sob clique/expansão. |
| R5 | Debounce de mudanças de estado para evitar ruído visual. |
| R6 | Nunca exibir segredos (API keys, tokens) em resumo ou detalhe. |

---

## Limites / não responsabilidade

| ID | Não responsabilidade |
|----|----------------------|
| NR1 | Substituir ou ofuscar a Conversa. |
| NR2 | Executar Jobs, consultar CTO ou correr MRE. |
| NR3 | Dashboard de infra (CPU, custos, logs brutos) na vista principal. |
| NR4 | Controlo remoto do watcher (start/stop) na V1. |
| NR5 | Exigir IDE Cursor ou ChatGPT abertos. |
| NR6 | Alterar contratos REQ-053/054 além de *leitura* de sinais. |

---

## Estados padronizados (obrigatórios)

`Disponível` | `Executando` | `Aguardando` | `Ocioso` | `Erro`

Precedência: Erro > Executando > Aguardando > Disponível > Ocioso.

## Nós V1 (obrigatórios)

`ceo` · `cto` · `agent` · `dispatcher` · `backend` · `speaker`

## Progressividade (obrigatória)

| Camada | Conteúdo permitido |
|--------|-------------------|
| **Vista principal** | Nome; Estado; descrição resumida (1 linha humana) |
| **Sob interacção** | Detalhe técnico/histórico (Job id, erro curto, origem do sinal, “desde quando”) |

Proibido na vista principal: heartbeats crus, rotas HTTP, modelos LLM, PIDs, stack traces, histórico longo.

## Contratos (lógicos)

### Snapshot — `OrquestracaoSnapshot`

* `em`: ISO-8601  
* `nos`: array de `OrquestracaoNo`

### `OrquestracaoNo`

* `id`, `nome`, `estado`, `descricaoResumida`, `atualizadoEm` (obrigatórios na UI principal)  
* `detalhe` (opcional; só na expansão)  
* `origemSinal` (opcional; não na vista principal)

### Eventos SSE

* `snapshot` | `no.atualizado` | `pulse`

### Portas servidor (proposta)

* `GET /api/ceo/orquestracao/snapshot`  
* `GET /api/ceo/orquestracao/stream` (SSE)

## Integração com o Orquestrador

* Orquestrador e conectores **publicam** sinais; o Serviço de Orquestração agrega.  
* Falha do painel **não** bloqueia deliberação nem Fila/CTO.  
* Extensão: `RegistoNoOrquestracao` (ARQ-016 §6) — UI lista nós do registo.

## Integração UI

* Superfície: Centro de Situação; apoio a SRF-T02; **não** rivaliza SRF-T03.  
* Actualização: SSE preferencial; fallback polling 3–5 s.

---

## Critérios de aceitação

* CA1: Seis nós V1 visíveis com Nome + Estado + descrição resumida.  
* CA2: Nenhum campo técnico na vista principal (checklist Progressividade).  
* CA3: Clique/expansão revela detalhe; recolher restaura a vista principal.  
* CA4: Snapshot HTTP devolve os seis nós com enum válido.  
* CA5: SSE (ou polling documentado) actualiza estado sem reload.  
* CA6: Conversa permanece a região dominante; painel visualmente secundário.  
* CA7: Painel não invoca Fila, CTO Connector nem MRE.  
* CA8: Documentação mínima descreve estados, nós e Progressividade.

## Critérios negativos

* NA1: Painel não é a home conversacional.  
* NA2: Erro de SSE não derruba o chat.  
* NA3: Sem segunda API key nem dependência do browser ChatGPT.

## Fora do escopo

* IMP detalhada de heartbeat autenticado do dispatcher (pode ser subtarefa da IMP, sem mudar este enunciado).  
* Multi-utilizador / RBAC do stream.  
* Novos estados fora do enum (exigem emenda ARQ/REQ).

## Dependências

ARQ-016 v0.2 (homologada); REQ-053; REQ-054; backend `/health` e sinais existentes; F5 SRF-T02/T03.

## Riscos e incertezas

* Heartbeat do dispatcher em PC local — TTL e canal (ficheiro vs POST) a fechar na IMP.  
* SSE atrás de proxies — fallback polling obrigatório.  
* Descrições resumidas geradas mal → copy humana fixa por estado+nó na V1.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | CON-001; ADR-015; F5; ARQ-016 v0.2 |
| Origem | Homologação ARQ-016 com Progressividade (01/08/2026) |
| Arquitetura | ARQ-016 |
| Implementação | IMP-055 (plano em análise) |
| Testes | *— após implementação* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura pós Gate ARQ-016 v0.2 | Progressividade + painel | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação REQ; abertura IMP-055 | Gate de requisitos | **Homologada** |

---

*Nenhuma implementação até homologação deste REQ-055.*

---

*REQ-055 homologada 01/08/2026. Implementação sob IMP-055 — código só após Gate do plano e autorização por etapa.*
