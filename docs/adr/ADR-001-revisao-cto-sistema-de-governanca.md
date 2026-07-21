# ADR-001 — Revisão Técnica do CTO: CEO como Sistema Executivo de Governança

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO (ChatGPT), com aval do Usuário (CEO/Fundador) |
| Quando | 21/07/2026 |
| Por quê | A visão de "orquestrador" era insuficiente: o produto precisa governar processos, conhecimento, agentes e decisões, não apenas distribuir tarefas |
| Baseado em quê | Documento Zero (`docs/D0-fundacao.md`) e revisão técnica da estrutura criada na Fase 0 |
| Resultado | Registrado. CON-001 aprovada (v1.0, 21/07/2026, com Ajustes 1–4 do CTO); REQ-001 criado |

## Status

Aceito.

## Decisões

### Decisão 1 — Nova visão

O projeto deixa de ser tratado apenas como um Orquestrador. A visão passa a ser:

> **CEO é um Sistema Executivo de Governança para colaboração entre Humanos e Inteligências Artificiais.**

Ele não apenas distribui tarefas. Ele governa processos, conhecimento, agentes e decisões.

### Decisão 2 — Constituição acima da Visão

Criação do documento **CON-001 — Constituição do CEO**, o documento mais importante do projeto. Toda decisão futura deverá estar de acordo com ele.

Hierarquia oficial:

CON-001 Constituição → VIS-001 Visão → REQ-xxx Requisitos → ADR-xxx Decisões Arquiteturais → Implementação

### Decisão 3 — Conceito de Governança

O CEO deverá ser capaz de estabelecer regras permanentes que possam ser seguidas por qualquer agente de IA. Essas regras não poderão depender do Cursor. A solução deverá ser independente da ferramenta utilizada.

### Decisão 4 — Primeiro requisito de alto nível

Nasce o **REQ-001** (ver `docs/requirements/REQ-001-distribuicao-da-constituicao.md`):

> "O CEO deverá possuir um mecanismo próprio para distribuir e manter sua Constituição e suas regras de governança para qualquer agente conectado ao sistema."

### Decisão 5 — Conceito de Memória Organizacional

O CEO deverá registrar conhecimento organizacional, não apenas histórico. Toda decisão importante deverá responder: Quem decidiu? Quando? Por quê? Baseado em quê? Qual foi o resultado?

### Decisão 6 — Manutenção da Fase 0

Nenhuma implementação deverá começar antes da conclusão da documentação fundamental (CON-001 aprovada e, na sequência, VIS-001).

## Rastreabilidade

- Origem: `docs/D0-fundacao.md`
- Gera: `docs/CON-001-constituicao.md` (rascunho), `docs/requirements/REQ-001-distribuicao-da-constituicao.md`
- Reflexo operacional imediato: `.cursor/rules/projeto-ceo.mdc` atualizado (espelho local, não canônico — ver Decisão 3)
