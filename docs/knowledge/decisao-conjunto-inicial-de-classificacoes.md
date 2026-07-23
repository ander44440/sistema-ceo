# Decisão Formal — Conjunto Inicial de Classificações do Acervo de Conhecimento

> **Status: Definido — decisão técnica do CTO (23/07/2026). Aguarda homologação institucional da alçada competente para efeitos permanentes de Implementação.**
> Versão 0.1 — 23/07/2026.
> Destino institucional: `docs/knowledge/` (pré-condição do IMP-004). **Não** constitui execução da E1: não cria o índice oficial do acervo (`README.md`); não registra itens `KNW-nnn`.
> Esta decisão **não** altera REQs nem ARQs; apenas estabelece a configuração inicial do acervo (REQ-004; ARQ-006 A8).

---

## 1. Objeto

Definir formalmente o **conjunto inicial mínimo viável de classificações** do Acervo de Conhecimento da CAP-04, como pré-condição para a redação e a posterior execução do IMP-004.

Fundamentos: CON-001; CAP-001 (CAP-04); REQ-004; ARQ-006 (em especial A2, A8); ARQ-007; pré-IMP CAP-04 homologado; deliberação técnica do CTO (23/07/2026).

---

## 2. Diretrizes da decisão

| Diretriz | Enunciado |
|----------|-----------|
| Alcance | Conjunto **inicial mínimo viável** |
| Extensão | Expansão futura **permitida** conforme ARQ-006 A8 |
| Hierarquia | Nenhuma categoria possui hierarquia sobre outra |
| Obrigatoriedade | Classificação é **obrigatória** para todo item `KNW` |
| Multiplicidade | Um item poderá possuir classificação **principal** e classificações **secundárias**, conforme regras futuras |
| Limite normativo | Não altera REQs nem ARQs |

---

## 3. Conjunto inicial homologável

| # | Classificação |
|---|---------------|
| 1 | Arquitetura |
| 2 | Requisitos |
| 3 | Análises |
| 4 | Decisões Arquiteturais (ADR) |
| 5 | Implementação |
| 6 | Validação |
| 7 | Governança |
| 8 | Operação |
| 9 | Referências Externas |
| 10 | Conhecimento Geral |

Este elenco é o **único** conjunto autorizado para materialização no índice e no modelo de entrada até nova deliberação (A8).

---

## 4. Efeitos e não-efeitos

| Faz | Não faz |
|-----|---------|
| Satisfaz a pré-condição deliberativa do pré-IMP / IMP-004 quanto ao conteúdo das classificações | Não inicia a Implementação (E1–E4) |
| Autoriza a redação do IMP-004 oficial (ADR-012), sob as demais regras do fluxo | Não cria o acervo operacional (índice `README.md`, template de item, entradas `KNW`) |
| Serve de referência única para E1 (reflexão no índice) e E2 (campos do modelo) | Não define regras finas de principal × secundárias (regras futuras) |
| | Não altera REQ-004/005/014/015, ARQ-006 nem ARQ-007 |

---

## 5. Relação com a E1

A Etapa E1 do IMP-004 **materializa** este conjunto no índice oficial do acervo (`docs/knowledge/README.md`), sem reabrir deliberação de mérito. A existência deste artefato deliberativo sob `docs/knowledge/` **não** equivale à conclusão da E1.

---

## 6. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO decidiu (decisão técnica); Engenheiro (Cursor) registrou |
| Quando | 23/07/2026 |
| Por quê | Encerrar a fase de preparação da CAP-04 com configuração inicial mínima viável de classificações, desbloqueando a redação do IMP-004 sem executar Implementação |
| Baseado em quê | REQ-004; ARQ-006 A8; pré-IMP CAP-04 homologado; instrução CTO — conjunto inicial de 10 classificações |
| Resultado | Conjunto inicial definido (v0.1); artefato em `docs/knowledge/`; IMP-004 autorizado à redação; E1 não iniciada |

---

## 7. Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | CTO decidiu; Engenheiro registrou | Criação — 10 classificações iniciais; diretrizes A8 / obrigatoriedade / sem hierarquia | Decisão técnica do CTO — CAP-04 próximo passo | **Em análise — aguarda homologação institucional** |
