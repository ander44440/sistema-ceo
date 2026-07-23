# TEMPLATE — Entrada de Item de Conhecimento

> **Status: Oficial — Gate E2 do IMP-004 Homologado (CTO, 23/07/2026 — Deliberação Extraordinária / MILESTONE 01).**
> Modelo institucional da entrada de item de conhecimento, conforme ARQ-006 (A2). Toda entrada futura sob `docs/knowledge/` deve conter, obrigatoriamente, as seções abaixo.
> Identificadores: espaço `KNW-nnn` (ARQ-007). Emissão **somente** no ato de registro no acervo — este template **não** emite identificador.
> Classificações admitidas: exclusivamente o conjunto materializado no [índice oficial](README.md) (§4) / [`decisao-conjunto-inicial-de-classificacoes.md`](decisao-conjunto-inicial-de-classificacoes.md).
> **Não** é um item de conhecimento. **Não** consome `KNW-nnn`.

---

# KNW-nnn — [Título designativo]

## 1. Identificação

| Campo | Valor |
|-------|-------|
| Identificador | KNW-nnn *(permanente; emitido no ato de registro no índice — ARQ-007; jamais alterado, renumerado ou reutilizado)* |
| Título / termo designativo | [nome do item] |

## 2. Conteúdo vigente

> [Representação do conhecimento reutilizável na versão corrente (REQ-004; REQ-015). Deve atender CNC-002: reutilizável e independente de decisão específica — não é registro histórico CAP-05.]

## 3. Classificação

| Campo | Valor |
|-------|-------|
| Classificação principal | [exatamente uma do conjunto oficial — ver índice §4] |
| Classificações secundárias | [opcional; ⊆ conjunto oficial; regras finas de principal×secundárias = futuras — não inventar nesta entrada] |

Conjunto autorizado (sem hierarquia entre categorias): Arquitetura; Requisitos; Análises; Decisões Arquiteturais (ADR); Implementação; Validação; Governança; Operação; Referências Externas; Conhecimento Geral.

## 4. Origem

| Campo | Valor |
|-------|-------|
| Projeto / contexto | [identificador rastreável, se houver] |
| Agente | [identificador ou designação rastreável] |
| Decisão (se aplicável) | [identificador — CAP-05 quando existir; Opção 2c] |

## 5. Relacionamentos

Referências **exclusivamente** por identificadores permanentes (REQ-004):

| Tipo | Identificador | Nota |
|------|---------------|------|
| Norma | [PREFIXO-nnn] | Registro canônico (REQ-002) |
| Conceito | [CNC-nnn] | Autoridade semântica |
| Item de conhecimento | [KNW-nnn] | Outro item do acervo |
| Decisão / registro histórico | [quando existir] | CAP-05 — sem contrato de integração (Opção 2c) |

## 6. Aptidão

| Campo | Valor |
|-------|-------|
| Categoria lógica | **apto** \| **não apto** (REQ-014; K3) |
| Rótulo fino (opcional) | [ex.: obsoleto, inválido, substituído — extensível; não substitui a categoria lógica] |

Aptidão **não** altera a identidade nem o identificador (K3; ARQ-007 A4).

## 7. Cadeia de versões de conteúdo

Tabela **append-oriented** (ARQ-006 A5; REQ-015; K4). Nova versão **não** constitui novo item nem novo `KNW-nnn`.

| Versão | Data | Conteúdo / delta | Quem | Por quê | Baseado em quê | Resultado |
|--------|------|------------------|------|---------|----------------|-----------|
| 1 | [data] | [texto ou remissão ao conteúdo vigente inicial] | [quem] | [por quê] | [base] | [resultado] |

## 8. Eventos de curadoria

Decisões sob governança (CNC-001) que alteram aptidão, resolvem duplicidade ou depuram (REQ-014), com Memória Organizacional (CON-001 Art. 8º):

| Evento | Data | Tipo | Quem | Por quê | Baseado em quê | Resultado |
|--------|------|------|------|---------|----------------|-----------|
| — | — | — | — | — | — | — |
