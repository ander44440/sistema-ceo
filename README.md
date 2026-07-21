# CEO

**Sistema Executivo de Governança para colaboração entre Humanos e Inteligências Artificiais.** Ele não apenas distribui tarefas: governa processos, conhecimento, agentes e decisões, preservando contexto, rastreabilidade e qualidade.

**Missão:** maximizar o progresso do usuário por unidade de tempo.

## Documentos normativos

Hierarquia oficial: **Constituição → Visão → Requisitos → ADRs → Implementação.**

* [`docs/CON-001-constituicao.md`](docs/CON-001-constituicao.md) — Constituição do CEO (**aprovada**, v1.0)
* [`docs/vision/VIS-001-visao-do-produto.md`](docs/vision/VIS-001-visao-do-produto.md) — Visão do Produto (**aprovada**, v1.0)
* [`docs/CAP-001-mapa-de-capacidades.md`](docs/CAP-001-mapa-de-capacidades.md) — Mapa de Capacidades (**aprovado**, v1.0)
* [`docs/CAP-002-priorizacao-das-capacidades.md`](docs/CAP-002-priorizacao-das-capacidades.md) — Estratégia de Priorização (**aprovada**, v1.0)
* [`docs/README.md`](docs/README.md) — Índice documental: catálogo oficial da documentação (**aprovado**, v1.0)
* [`docs/D0-fundacao.md`](docs/D0-fundacao.md) — Documento Zero (fundação histórica do projeto)
* [`docs/adr/ADR-001-revisao-cto-sistema-de-governanca.md`](docs/adr/ADR-001-revisao-cto-sistema-de-governanca.md) — decisões da revisão técnica do CTO
* [`docs/adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md`](docs/adr/ADR-002-diretrizes-estrategicas-e-padrao-documental.md) — identidade estratégica, aprendizado organizacional, BCO e padrão documental

## Fase atual

**Fase 1 — Engenharia de Requisitos** (Fase 0 encerrada em 21/07/2026, ADR-004). Ainda não existe implementação, arquitetura definitiva nem código. Os requisitos seguem o [`TEMPLATE-REQ`](docs/requirements/TEMPLATE-REQ.md) e a ordem de ondas do CAP-002, começando pela Onda 1 — Fundação (CAP-01, CAP-04, CAP-05, CAP-07, CAP-10).

## Estrutura da documentação

| Pasta | Conteúdo | IDs |
|-------|----------|-----|
| `docs/vision` | Visão do produto | VIS-nnn |
| `docs/requirements` | Requisitos | REQ-nnn |
| `docs/architecture` | Arquitetura | — |
| `docs/adr` | Decisões de arquitetura | ADR-nnn |
| `docs/flows` | Fluxos | FLW-nnn |
| `docs/tasks` | Tarefas | TSK-nnn |
| `docs/tests` | Testes | TST-nnn |
| `docs/learning` | Registros educacionais | — |

## Regra fundamental

Nada será implementado sem existir um requisito correspondente.

Fluxo obrigatório: Visão → Requisitos → Arquitetura → Fluxos → Implementação → Testes → Validação.
