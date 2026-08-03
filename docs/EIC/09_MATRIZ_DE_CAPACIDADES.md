# 09 — Matriz de Capacidades

> **Status:** BLOCO 2 — Engenharia consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Inventário de capacidades **já existentes** no mapa CAP / normas — sem criar CAP novas.  
> **Fontes:** CAP-001; ARQ-015…021; REQ-050/054/055/057/059; PX-003; Âncora Mestra; [`02_ARQUITETURA.md`](02_ARQUITETURA.md).

## Objetivo

Mapear as capacidades conversacionais do Sistema CEO relevantes para a EIC e a sua ligação ao catálogo CAP-001 — apenas consolidação.

## Finalidade

Inventário para priorização ([`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md)) e para o mapa conceptual ([`02_ARQUITETURA.md`](02_ARQUITETURA.md)).

---

## 1. Convenções da matriz

| Campo | Significado |
|-------|-------------|
| **CAP** | Identificador permanente CAP-001 |
| **Peça** | Norma ou componente já existente |
| **Estado** | Homologado / em uso / backlog (Âncora) — não inventado |
| **Papel EIC** | Como a disciplina documenta/evolui (doc only até Gate) |

---

## 2. Capacidades conversacionais (catálogo CAP-001)

| CAP | Nome | Relevância para a EIC |
|-----|------|------------------------|
| **CAP-07** | Comunicação | **Núcleo** da EIC — experiência conversacional, intenção, prosa |
| **CAP-01** | Governança | Regras permanentes; tempo do utilizador; autoridade |
| **CAP-11** | Integrações | CTO, fila, painel, APIs — destinos C4 e efeitos laterais |
| **CAP-05** | Executivo digital | Posto de comando / uso diário (VIS-003; ADR-015) |
| **CAP-06** | Aprendizado | Adaptação de comunicação; memória organizacional |

Outras CAP do mapa permanecem válidas mas **fora do perímetro conversacional imediato** da EIC (ex.: gestão documental pura), salvo impacto indirecto via C3/Motor.

---

## 3. Peças homologadas / em uso (eixo conversacional)

| ID | Peça | CAP típica | Estado | Papel EIC |
|----|------|------------|--------|-----------|
| ARQ-018 / REQ-057 | Classificador de Intenção (C1–C4) | CAP-07 | Homologado / implementado (IMP-057+) | Qualidade e regressão de classificação |
| PX-003 E4 | Qualidade percebida CN | CAP-07 | **Homologada** | Lastro de ritmo/iniciativa/densidade |
| PX-003 E1–E3 | Conversação Natural | CAP-07 | Homologada (prévia) | Camada de prosa (Âncora cita CN) |
| REQ-050 | Speaker Executivo | CAP-07 | Homologado | Produtor de prosa deliberativa |
| ARQ-016 / REQ-055 / IMP-055 | Painel de Orquestração | CAP-07 / CAP-01 | **Encerrado** em produção | Observabilidade; não delibera |
| ARQ-015 / REQ-054 / IMP-054 | Conector CTO | CAP-11 | Encerrado | Canal C4 / consulta ≠ Job |
| ARQ-017 / REQ-056 | Motor de Execução | CAP-11 | Homologado | Destino C3 |
| ARQ-019 / REQ-058 | Continuidade do Gate | CAP-11 | Homologado | Retoma pós-decisão humana |
| ARQ-020 / REQ-059 | Consciência Operacional | CAP-01 | Homologado | Lastros C2/C3 antes de responder |
| ARQ-021 / REQ-060 / IMP-060 | Fila oficial MVP | CAP-11 | Homologada | Efeitos de Job sem confundir prosa |
| VIS-002 §3.5–3.6 | Personalidade + interface conversacional | CAP-07 | Homologado | Identidade (BLOCO 1) |
| VIS-003 / ADR-015 | Uso diário MG2 | CAP-05 | Homologado | Filtro de prioridade |

---

## 4. Capacidades fora de perímetro (EIC imediata)

| Item | Motivo |
|------|--------|
| Dispatcher V3 cloud | Backlog Âncora — não é evolução de prosa |
| Novos estados de nó do painel fora do enum | Sob demanda Âncora — não é EIC core |
| Criar CAP-13+ | Proibido sem ADR — CAP-001 permanentes |
| Redesign MRE / NCS | Fora do eixo EIC salvo Gate + norma própria |

---

## 5. Lacunas documentais (não = bugs de produto)

| Lacuna | Documento EIC | Estado |
|--------|---------------|--------|
| CA/NA conversacionais detalhados | `04` | Estrutura apenas |
| Catálogo de testes conversacionais | `05` | Estrutura apenas |
| Governança EIC preenchida | `08` | Estrutura apenas |
| Processo de homologação EIC preenchido | `11` | Estrutura apenas |

Estas lacunas são **conteúdo EIC pendente**, não novas capacidades CAP.

---

## 6. Actualização da matriz

Actualizar quando:

- Nova norma conversacional for **homologada** (ARQ/REQ/PX/IMP)  
- A Âncora Mestra encerrar frente operacional relevante  
- O Roadmap EIC mudar status de módulo (sem inventar CAP)

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`02_ARQUITETURA.md`](02_ARQUITETURA.md) | Camadas L0–L5 |
| [`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md) | Prioridade sobre esta matriz |
| [`03_ROADMAP.md`](03_ROADMAP.md) | Onda C (04/05) |
| [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md) | Termos |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 2 — matriz de capacidades | Pronto para homologação |

---

**Estado:** BLOCO 2 — capacidades mapeadas. Sem CAP novas. Sem impacto no produto.
