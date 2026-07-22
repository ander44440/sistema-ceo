# Índice do Canal de Distribuição de Governança

> **Status: Operacional (estrutura) — Gate E1 homologado (Governança, 22/07/2026).**
> Norma superior: CON-001 v1.0; ARQ-005 v1.0; IMP-003 v1.0; REQ-010 a REQ-013 v1.0; ADR-013 v1.0 (D4); CNC-005.
> Este índice é a **fonte de estado do mecanismo de distribuição** (não das normas). A autoridade normativa e semântica permanece nas fontes canônicas (ARQ-005 D1, D4).
> **E1–E3 homologadas:** estrutura, alcance (vazio) e snapshot do pacote. Rastro segue Gate E4.

---

## O que é

Porta de entrada documental do canal de Distribuição de Governança sob `docs/distribution/` (ARQ-005 A1). Organiza o estado do *mecanismo*: aponta (quando existirem) a composição do pacote vigente derivado, o registro de alcance e o rastro — sem hospedar texto normativo canônico.

## Princípios observáveis (ARQ-005)

| ID | Princípio |
|----|-----------|
| D1 | Não duplicação de autoridade — o canal nunca é fonte normativa |
| D2 | Transitividade — transporta autoridade sem transformá-la |
| D3 | Dependência unidirecional — o canal depende das fontes; as fontes não dependem do canal |
| D4 | Fonte × canal (ADR-008) |
| D5 | Espelhos subordinados — em divergência, prevalece a fonte |
| D6 | Fronteira documental × técnica (ADR-013 D4) |

## Regras do canal

* **Interfaces:** exclusivamente de **leitura** com Constituição, Registro Canônico de Normas e autoridade semântica de conceitos (ARQ-005 A2).
* **Pacote:** projeção/snapshot das fontes no instante da composição — não espelho vivo (IMP-003 X7; E3).
* **Vínculos:** registro de alcance reflete CNC-005 e decisões sob governança; não redefine o conceito (A4; E2).
* **Rastro:** append-oriented; estrutura pode existir vazia e operacional (A6; IMP-003 X8; E4).
* **Identificadores:** reutilizam PREFIXO-nnn / CNC-nnn; IDs locais de ato, se necessários, são convenção interna (A7).
* **Vedação:** nenhum protocolo, tecnologia, sincronização automática ou ferramenta externa neste domínio documental (ADR-013 D4).

## Estado do mecanismo

| Componente (ARQ-005 A1) | Estado |
|-------------------------|--------|
| Índice do canal (este documento) | Homologado (E1) |
| Composição do pacote | Homologada E3 — [composicao-do-pacote.md](composicao-do-pacote.md) v1.0 (snapshot 22/07/2026) |
| Vínculos / registro de alcance | Homologado E2 — [decisão](decisao-estado-inicial-dos-vinculos.md) v1.0; [registro](registro-de-alcance.md) (vazio) |
| Rastro | Em estruturação (E4) |

## Fontes (somente leitura)

| Fonte | Local canônico |
|-------|----------------|
| Constituição | `docs/CON-001-constituicao.md` |
| Registro Canônico de Normas | `docs/norms/` |
| Conceitos | `docs/concepts/` |

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitetura | ARQ-005 A1 |
| Plano | IMP-003 E1 |
| Origem | Homologação IMP-003; Gate E1 (Governança, 22/07/2026) |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Criação de `docs/distribution/` e índice estrutural (D1–D6; regras; estado E1) | IMP-003 E1 autorizada após publicação do plano | Aguarda Gate E1 |
| 0.1 | 22/07/2026 | CTO | Revisão técnica — sem ajustes; escopo estrutural conforme IMP-003 | Conformidade ARQ-005 / IMP-003 / ADR-013 | Aprovada — encaminhada à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Estrutura documental inicial do domínio de Distribuição | Conformidade ADR-006/012/013; ARQ-005; IMP-003 | **Homologada — E1 encerrada; E2 autorizada** |
| — | 22/07/2026 | Governança | Gate E2 homologado — alcance inicial vazio | deliberação E2 | Ver decisão e registro de alcance |
| — | 22/07/2026 | Governança | Gate E3 homologado — snapshot do pacote | deliberação E3 | Ver composição do pacote |
