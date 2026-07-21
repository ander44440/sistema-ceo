# ADR-003 — Consolidação do CAP-001 e entregas de encerramento da Fase 0

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO (ChatGPT), com aval do Usuário (CEO/Fundador) |
| Quando | 21/07/2026 |
| Por quê | Revisão técnica do CAP-001 v0.1 e definição das entregas finais para encerrar formalmente a Fase 0 com base documental completa e rastreável |
| Baseado em quê | CON-001 v1.0, VIS-001 v1.0, ADR-002, CAP-001 v0.1 |
| Resultado | Registrado. CAP-001 v1.0, CAP-002 (priorização), template de requisitos e matriz de rastreabilidade produzidos |

## Status

Aceito.

## Decisões

### Decisão 1 — CAP-12 aprovada com novo nome

A proposta do Engenheiro é promovida a capacidade oficial com o nome **CAP-12 — Desenvolvimento do Usuário** (substituindo "Formação do Usuário"). O novo nome representa melhor a missão de ampliar continuamente a capacidade intelectual e produtiva do usuário (CON-001, Art. 1º).

### Decisão 2 — BCO não é capacidade

O **BCO (Banco de Competências Organizacionais)** permanece como **conceito arquitetural candidato** (ADR-002, Decisão 4). Ele não é uma capacidade: é um mecanismo arquitetural que futuramente dará suporte a capacidades como o Aprendizado organizacional (CAP-06).

### Decisão 3 — Identificadores permanentes

Cada capacidade possui identificador permanente (CAP-01 a CAP-12), preservando a rastreabilidade futura dos requisitos.

### Decisão 4 — Estrutura padronizada das capacidades

Cada capacidade utiliza estrutura padronizada com, no mínimo: Identificador; Nome; Objetivo; Descrição; Fora do Escopo; Pilares Fortalecidos; Fontes Normativas; Observações.

### Decisão 5 — Entregas de encerramento da Fase 0

Antes de iniciar a escrita de requisitos, produzir:

1. **CAP-001 v1.0** incorporando as decisões acima;
2. **Matriz de Rastreabilidade Estratégica (CON → VIS → CAP)** com a origem explícita de cada capacidade;
3. **Estratégia de priorização das capacidades** (documento próprio ou seção, a critério da arquitetura documental);
4. **Template oficial de requisitos** para todos os REQs futuros.

A escrita dos requisitos só começa após essas entregas.

## Rastreabilidade

- Norma superior: CON-001 v1.0; VIS-001 v1.0.
- Origem: CAP-001 v0.1; ADR-002 (Decisões 4 e 6).
- Gera: CAP-001 v1.0 (com matriz CON → VIS → CAP incorporada); CAP-002 (priorização); `docs/requirements/TEMPLATE-REQ.md`.
