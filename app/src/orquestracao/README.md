# Painel de Orquestração — implementação (IMP-055)

> Documentação técnica mínima do código em `app/src/orquestracao/`.  
> Normas: REQ-055 · ARQ-016 · IMP-055. Este README **não** substitui esses documentos.

## O que é

Painel **observacional** no Centro de Situação: mostra o estado dos actores do ciclo (CEO, CTO, Agent, Dispatcher, Backend, Speaker) sem deliberar, sem despachar Jobs e sem consultar o CTO.

## Princípio da Progressividade

| Camada | Conteúdo |
|--------|----------|
| Vista principal | **Nome** · **Estado** · **descrição resumida** |
| Sob clique/expansão | Detalhe allowlisted (Job, erro curto, Desde, Origem) — sem secrets |

A **Conversa** (SRF-T03) permanece central; o painel é apoio visual secundário.

## Estados (enum fechado)

`Disponivel` | `Executando` | `Aguardando` | `Ocioso` | `Erro`

Precedência: Erro > Executando > Aguardando > Disponivel > Ocioso.

## Nós V1

| id | Nome | Sinal (E6) |
|----|------|------------|
| ceo | CEO | ciclo núcleo (deliberar/CTO) |
| cto | CTO | llm configurado + consulta em voo |
| agent | Agent | fila pending/running/failed |
| dispatcher | Dispatcher | heartbeat (TTL 60s) |
| backend | Backend | health do processo |
| speaker | Speaker | heurístico V1 (`speaker-heuristico`) |

## Portas HTTP

| Método | Path | Função |
|--------|------|--------|
| GET | `/api/ceo/orquestracao/snapshot` | Snapshot completo |
| GET | `/api/ceo/orquestracao/stream` | SSE (`snapshot`, `pulse`, `no.atualizado`) |
| POST | `/api/ceo/orquestracao/heartbeat` | Escrita de sinal do watcher (não é controlo remoto) |

Cliente: prefere SSE; se falhar → polling 4s (`Actualização periódica`).

## Extensibilidade (E7)

`RegistoNoOrquestracao` em `registo.js`:

- `criarRegistoOrquestracao()` · `registrar()` · `listar()` · `montarSnapshot()`
- `registrarNosV1(registo, deps)` — os seis nós oficiais
- UI (`htmlGrelhaNos`) renderiza **qualquer** lista de nós do snapshot — sem `switch` por agente

Novos IDs fora de V1 exigem registo; novos **estados** fora do enum exigem emenda ARQ/REQ.

## Módulos

| Ficheiro | Etapa |
|----------|-------|
| `dominio.js` | E1 |
| `agregador.js` | E2 (+ registo E7) |
| `ui.js` / `cliente.js` / `detalhe.js` | E3–E4 |
| `streamContrato.js` / `tempoReal.js` / `streamServidor.js` | E5 |
| `coletores.js` / `mapeadores.js` / `heartbeat.js` / `sinaisRuntime.js` | E6 |
| `registo.js` | E7 |

## Testes

```bash
cd app
npm run test:orquestracao
```

Scripts por etapa: `test:orquestracao:e1` … `e7` (domínio cobertos em `test:orquestracao`).

## Evidências CA/NA

Ver `docs/implementation/evidencias/IMP-055-matriz-ca-na.md`.
