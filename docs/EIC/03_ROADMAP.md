# 03 — Roadmap

> **Status:** BLOCO 2 — Engenharia consolidada (ordem oficial + estados actualizados)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Documentação — sem implementação de código, prompts ou alteração de comportamento.  
> **Fontes:** [`00`](00_VISÃO_GERAL.md)–[`02`](02_ARQUITETURA.md); [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md); ADR-006; ADR-015.

## Objetivo

Definir e manter a **ordem oficial** de evolução da Inteligência Conversacional do CEO: módulos, objectivos, status e Gates.

## Finalidade

Roteiro canónico da EIC. Nenhuma implementação de produto avança sem Gate explícito. Metodologia detalhada → [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md). Priorização → [`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md).

---

## 1. Estado actual

| Item | Estado |
|------|--------|
| Fase 1 — Estrutura | **Encerrada** (Marco Zero) |
| BLOCO 1 — Identidade (00, 01, 06, 13) | **Consolidado** (pronto p/ homologação) |
| BLOCO 2 — Engenharia (02, 03, 07, 09, 10) | **Consolidado** (este ciclo) |
| Código / prompts / comportamento | **Intocados** |

---

## 2. Ordem oficial de evolução

Não saltar módulos:

```text
M0 Fundação documental
  → M1 Visão
  → M2 Princípios
  → M3 Arquitectura
  → M4 Critérios de Qualidade
  → M5 Testes Conversacionais
  → M6 Glossário estável
  → M7 Gate de autorização (produto)
  → M8 Implementação (somente se autorizada)
  → M9 Homologação conversacional
```

Documentos de suporte (conteúdo em paralelo documental, sem alterar a ordem M1–M9):  
`07` Metodologia · `08` Governança · `09` Capacidades · `10` Priorização · `11` Homologação · `12` Histórico · `ÍNDICE`.

---

## 3. Módulos

| ID | Módulo | Objectivo | Artefacto | Status |
|----|--------|-----------|-----------|--------|
| **M0** | Fundação documental | Pasta e ficheiros oficiais EIC | `docs/EIC/*` | **Concluído** |
| **M1** | Visão | Identidade, missão, sucesso | `00_VISÃO_GERAL.md` | **Concluído** (BLOCO 1) |
| **M2** | Princípios | Julgamento conversacional | `01_PRINCÍPIOS.md` | **Concluído** (BLOCO 1) |
| **M3** | Arquitectura | Mapa conceptual das peças existentes | `02_ARQUITETURA.md` | **Concluído** (BLOCO 2) |
| **M4** | Critérios de Qualidade | CA/NA conversacionais | `04_CRITÉRIOS_DE_QUALIDADE.md` | **Pendente** (estrutura) |
| **M5** | Testes Conversacionais | Catálogo e procedimento | `05_TESTES_CONVERSACIONAIS.md` | **Pendente** (estrutura) |
| **M6** | Glossário | Vocabulário estável | `06_GLOSSÁRIO.md` | **Concluído** (BLOCO 1) |
| **M7** | Gate de autorização | Autorizar mudança de produto | Decisão + Gate | **Bloqueado** até M4–M5 + coerência |
| **M8** | Implementação | Código/prompts só com REQ/ARQ/IMP + Gate | Produto | **Não iniciado** |
| **M9** | Homologação conversacional | Evidências pós-implementação | Testes EIC + VAL | **Não iniciado** |

Nota: M6 concluído em paralelo documental com M1–M2 (BLOCO 1); M4–M5 continuam a bloquear G-EIC-D para produto.

---

## 4. Ondas

| Onda | Módulos | Objectivo | Status |
|------|---------|-----------|--------|
| **A — Base** | M0 | Estrutura oficial | **Concluída** |
| **B — Doutrina** | M1 → M2 → M3 | Visão, princípios, arquitectura | **Concluída** (conteúdo BLOCO 1+2) |
| **C — Qualidade** | M4 → M5 (+ fecho M6) | Critérios e testes preenchidos | **Pendente** (M6 ok; M4–M5 não) |
| **D — Gate** | M7 | Autorização de produto | **Bloqueada** |
| **E — Produto** | M8 → M9 | IMP + homologação | **Bloqueada** |

---

## 5. Dependências

| Módulo | Depende de |
|--------|------------|
| M1 | M0 |
| M2 | M1 |
| M3 | M1, M2 |
| M4 | M1, M2, M3 |
| M5 | M4 |
| M6 | M1–M2 (fecho lexical; alinhado a M4/M5 quando existirem CA) |
| M7 | M1–M6 coerentes **e** M4–M5 preenchidos para mudanças de prosa/produto |
| M8 | M7 + ADR-006 (REQ → ARQ → IMP) |
| M9 | M8 + M5 |

Normas superiores (CON → VIS → REQ → ADR → ARQ → IMP) prevalecem sempre.

---

## 6. Marcos de Gate

| Gate | Quando | Autoriza |
|------|--------|----------|
| **G-EIC-0** | Após M0 | Preencher documentos |
| **G-EIC-B** | Após Onda B | Avançar Critérios / Testes |
| **G-EIC-C** | Após Onda C | Discutir implementação |
| **G-EIC-D** | M7 | Alterar código, prompt ou comportamento conversacional |
| **G-EIC-E** | Após M9 | Encerrar onda de produto / atualizar Âncora |

Sem **G-EIC-D**, a EIC permanece documentação (+ conteúdo), não runtime.

---

## 7. Fora do roadmap (nesta fase)

- Implementar lógica conversacional  
- Alterar prompts / Classificador / Motor / Gate / Consciência / UI  
- Automatizar testes conversacionais em CI  
- Datas de calendário (isto é **ordem**, não cronograma)  
- Dispatcher V3 e extensões de painel (backlog Âncora Mestra)

---

## 8. Filtro ADR-015 (obrigatório em propostas de produto)

Toda proposta que saia de M7/M8 deve responder:

> *Esta entrega aproxima o utilizador de utilizar o CEO diariamente no desenvolvimento do MG2?*

Se não, não é prioridade operacional da EIC neste ciclo (ADR-015; VIS-003).

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`02_ARQUITETURA.md`](02_ARQUITETURA.md) | M3 |
| [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md) | Ciclo de avanço |
| [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md) | O que pode evoluir |
| [`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md) | Ordem relativa de frentes |
| [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Fase 1 / BLOCO 1 |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Ordem M0–M9 | Roadmap estruturado |
| 0.2 | 03/08/2026 | Engenheiro (Cursor) | Padronização + docs 07–12 | Auditoria |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 2 — estados M1–M3/M6 e Ondas | Pronto para homologação |

---

**Estado:** BLOCO 2 — roadmap actualizado. Sem impacto no produto.
