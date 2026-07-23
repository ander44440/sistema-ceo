# Plano de Implementação (pré-IMP) — CAP-04 Gestão do Conhecimento

> **Status: Homologado — v1.0 (CTO, 23/07/2026). Emenda de referência v1.1 (23/07/2026).**
> Natureza: **referência oficial** do planejamento pré-IMP da CAP-04. **Não** é IMP (ADR-012).
> Norma superior: CON-001 v1.0; CAP-001 (CAP-04); ADR-006; ADR-012; REQ-004, REQ-005, REQ-014, REQ-015 v1.0; ARQ-006 v1.0; ARQ-007 v1.0; Opção 2c; ANL-005 (Batch Gates — recomendação operacional).
> **Classificações:** decisão técnica do CTO registrada em [`docs/knowledge/decisao-conjunto-inicial-de-classificacoes.md`](../knowledge/decisao-conjunto-inicial-de-classificacoes.md) (v0.1 — aguarda homologação institucional).
> **IMP-004:** Homologado v1.0 — [`docs/implementation/IMP-004-plano-de-implementacao-documental-do-acervo-de-conhecimento.md`](../implementation/IMP-004-plano-de-implementacao-documental-do-acervo-de-conhecimento.md). Execução da Implementação **fechada** até autorização explícita do CTO para abertura da E1.

---

## 1. Objeto deste registro

Registrar, com rastreabilidade e Memória Organizacional, o **Plano de Implementação (pré-IMP)** da CAP-04 homologado pelo CTO, para servir de **referência única** na elaboração futura do IMP-004.

Este documento:

* **não** inicia Implementação;
* **não** cria `docs/knowledge/`;
* **não** substitui o IMP-004;
* **não** altera REQs nem ARQs.

---

## 2. Premissas

1. Implementação **exclusivamente documental** na Fase 1 (sede `docs/knowledge/`), análoga a IMP-002/003.
2. Acervo pode iniciar **operacionalmente vazio** (sem itens `KNW-nnn`) — estrutura ≠ conteúdo.
3. Emissão de `KNW-nnn` só no ato de registro de item (ARQ-007); etapas do IMP **não** inventam itens.
4. Nenhuma etapa produz efeitos permanentes antes do respectivo Gate.
5. Idempotência documental: reexecução de etapa homologada sem mudança deliberada = sem alterações adicionais.
6. O **conjunto inicial de classificações** é deliberação **fora** das etapas Ei do IMP, não atividade de Implementação.
7. O IMP **só executa** após homologação institucional desse conjunto e do próprio IMP; a Implementação **materializa** decisões já deliberadas — não as delibera.
8. Conjunto inicial definido (decisão técnica do CTO, 23/07/2026): Arquitetura; Requisitos; Análises; Decisões Arquiteturais (ADR); Implementação; Validação; Governança; Operação; Referências Externas; Conhecimento Geral — ver artefato em `docs/knowledge/decisao-conjunto-inicial-de-classificacoes.md`.

---

## 3. Decomposição em etapas

| Etapa | Nome | Natureza |
|-------|------|----------|
| **E1** | Materialização da estrutura do acervo | Estrutural |
| **E2** | Modelo de entrada do item + regras do índice | Estrutural / normativo-documental |
| **E3** | Verificação de conformidade e estabilidade | Verificação |
| **E4** | Encerramento institucional da Implementação documental | Institucional |

**Fora do IMP (pré-condição):** deliberação e homologação institucional do conjunto inicial de classificações — artefato: [`decisao-conjunto-inicial-de-classificacoes.md`](../knowledge/decisao-conjunto-inicial-de-classificacoes.md).

---

## 4. Dependências entre etapas

```
[Classificações deliberadas → homologação institucional]
        ↓
 Gate IMP (homologação do IMP-004 + abertura)
        ↓
 E1 → E2 → E3 → E4
```

| Dependência | Motivo |
|-------------|--------|
| Execução do IMP após classificações | Premissas 6–8: Implementação não delibera categorias |
| E2 após E1 | Modelo e regras residem no acervo já estruturado; classificações homologadas são referenciadas, não inventadas |
| E3 após E2 | Verifica estrutura + modelo + índice + aderência às classificações já deliberadas + ARQ-006/007 |
| E4 após E3 | Encerramento só com conformidade |

**Fora desta sequência:** registro de itens reais (`KNW-001`…) — operação/curadoria posterior; **não** obrigatório para encerrar o IMP documental do *mecanismo*.

---

## 5. Critérios de entrada e saída

### Pré-condição (fora das Ei)

| | |
|--|--|
| **Entrada** | ARQ-006/007 homologadas; REQs da CAP-04 vigentes |
| **Saída** | Conjunto inicial de classificações **deliberado** (decisão técnica CTO) e, para efeitos permanentes de Implementação, **homologado institucionalmente**; artefato em `docs/knowledge/decisao-conjunto-inicial-de-classificacoes.md`; Memória Organizacional |
| **Efeito** | Autoriza redação/homologação do IMP-004; **não** conclui a E1 (índice oficial ausente até a E1) |

### E1 — Materialização da estrutura

| | |
|--|--|
| **Entrada** | Pré-condição cumprida; Gate IMP autorizado; IMP-004 oficial aprovado |
| **Saída** | Pasta `docs/knowledge/` e índice `README.md` existem; princípios K1–K8 / A1 observáveis; classificações homologadas **refletidas** no índice (materialização, não deliberação); **zero** entradas `KNW-*`; fontes canônicas intocadas |
| **Gate** | Homologação antes de E2 |

### E2 — Modelo de entrada + regras do índice

| | |
|--|--|
| **Entrada** | E1 homologada |
| **Saída** | Template/modelo documental da entrada (seções A2 da ARQ-006); regras do índice alinhadas a ARQ-006 A1 e ARQ-007; campos de classificação **amarrados** ao conjunto já homologado; declaração de acervo **apto a emitir** IDs no registro futuro, ainda **sem** itens emitidos |
| **Gate** | Homologação antes de E3 |

### E3 — Verificação

| | |
|--|--|
| **Entrada** | E2 homologada |
| **Saída** | Relatório: aderência a K1–K8, A1–A8 ARQ-006, A1–A8 ARQ-007, REQ-004/005/014/015 no que couber ao *mecanismo vazio*; coerência índice ↔ classificações homologadas; inconsistências = 0 no domínio `docs/knowledge/`; escopo só CAP-04/acervo |
| **Gate** | Homologação antes de E4 |

### E4 — Encerramento

| | |
|--|--|
| **Entrada** | E3 homologada |
| **Saída** | Declaração de Implementação documental do acervo **operacional** (estrutura); IMP da CAP-04 encerrado neste ciclo; catálogo atualizado; fase técnica / população de itens **não** abertas por este ato |
| **Gate** | Homologação encerra o IMP |

---

## 6. Artefatos por etapa

| Etapa | Artefatos esperados |
|-------|---------------------|
| **Pré-condição** | [`docs/knowledge/decisao-conjunto-inicial-de-classificacoes.md`](../knowledge/decisao-conjunto-inicial-de-classificacoes.md) (fora das Ei) |
| **E1** | `docs/knowledge/`; `docs/knowledge/README.md` (índice estrutural, estado vazio, classificações materializadas) |
| **E2** | Template de entrada (ex.: `TEMPLATE-ITEM-CONHECIMENTO.md` ou equivalente); regras de emissão/índice documentadas no README |
| **E3** | Relatório de verificação de conformidade |
| **E4** | Encerramento institucional do IMP; apontamento cadastral |

**Explicitamente fora do IMP:** arquivos `KNW-001-…md` de conhecimento real (salvo deliberação futura de população); **deliberação** de novas classificações (Governança / A8).

---

## 7. Riscos técnicos previstos

| Risco | Mitigação |
|-------|-----------|
| Abrir IMP sem classificações homologadas | Critério de entrada do Gate IMP: pré-condição obrigatória |
| Pressão para deliberar categorias na E1/E2 | Premissas 6–7; E1 só materializa; E2 só referencia o conjunto homologado |
| Pressão para popular itens na E1–E2 | Critério de saída: zero `KNW` até operação autorizada |
| Antecipar sintaxe/tech de geração de ID | ARQ-007 define convenção lógica; IMP só documenta regras, sem código |
| Deslizamento para CAP-05/06/12 | Opção 2c + Limites ARQ-006 |
| Verificar REQ-005/014 sem itens | E3 valida *aptidão do mecanismo*, não entregas reais |
| Expandir classificações “de passagem” no IMP | Expansão = nova deliberação de Governança (ARQ-006 A8), não etapa de Implementação |

---

## 8. Estratégia de validação por etapa

| Etapa | Validação |
|-------|-----------|
| Pré-condição | Decisão com MO; conjunto nomeado e homologado **antes** do IMP |
| E1 | Checklist A1 ARQ-006: pasta + índice; classificações no índice = conjunto homologado; sem entradas; sem alteração de REQs/ARQs |
| E2 | Template cobre seções A2; classificação no modelo ⊆ conjunto homologado; README: emissão só no registro; `KNW-nnn` conforme ARQ-007; apto/não apto; versão ≠ novo ID |
| E3 | Matriz K1–K8 + A1–A8 (006) + A1–A8 (007); diferença índice×artefatos = 0; coerência com classificações; idempotência |
| E4 | Declaração formal; catálogo; sem abrir IMP técnico nem Validação ADR-006 do ciclo completo por este ato |

*Nota:* a etapa **Validação** do ADR-006 é **posterior** a este IMP documental e exige autorização própria — não se confunde com E3.

---

## 9. Batch Gates recomendados (operacionais — ADR-006 intacta)

| Lote / Gate | Conteúdo | Critério ANL-005 |
|-------------|----------|------------------|
| **Gate individual** | Homologação das **classificações** (pré-condição) | Deliberação de mérito (G3) — **fora** do IMP |
| **Gate individual** | Homologação do **IMP-004** oficial (plano) + abertura | L0 / abertura de etapa |
| **Lote B1** (opcional) | **E1** isolada — estrutural | B1–B8 |
| **Lote B2** | **E2** (template + regras) | Homogêneo, mecânico pós-E1 |
| **Lote B3** | **E3 + E4** (verificação + encerramento) | Precedente IMP-003 (verificação+fecho consolidados) |

Recomendação preferencial: **pré-condição** → gate individual; **IMP-004** → gate; **E1** → gate; **E2** → gate; **E3+E4** → batch final.

Não há Gate deliberativo *dentro* das Ei do IMP.

---

## 10. Rastreabilidade do plano

| REQ / ARQ | Onde se materializa |
|-----------|---------------------|
| REQ-004 (classificações) | Pré-condição = deliberação; **E1/E2** = materialização/referência |
| REQ-004 / ARQ-006 A1–A2 (estrutura e entrada) | E1, E2 |
| REQ-005 / ARQ-006 A4 | E2 (regras); evidência plena na Validação futura / operação |
| REQ-014 / ARQ-006 A6 | E2 (aptidão no modelo); operação futura |
| REQ-015 / ARQ-006 A5 | E2 (cadeia de versões no modelo) |
| ARQ-007 | E2 (regras `KNW-nnn` + índice) |
| Opção 2c | Todas — sem integrações CAP-05/06/12 |

---

## 11. Estado processual e próximos atos autorizados

| Ato | Status |
|-----|--------|
| Fase ARQ CAP-04 | Encerrada (ARQ-006 + ARQ-007) |
| Pré-IMP CAP-04 | **Homologado** (este documento; emenda de referência v1.1) |
| Conjunto inicial de classificações | Decisão técnica CTO registrada (v0.1) — aguarda homologação institucional |
| IMP-004 | **Homologado — v1.0** |
| Implementação (E1–E4) | **Fechada** até autorização explícita do CTO para abertura da E1 |

---

## 12. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO homologou; Engenheiro (Cursor) registrou |
| Quando | 23/07/2026 |
| Por quê | Fixar o pré-IMP da CAP-04 como referência oficial para o futuro IMP-004, sem abrir Implementação nem redigir o IMP antes da deliberação das classificações |
| Baseado em quê | Parecer CTO (APROVADO COM AJUSTE → revisão E1–E4); homologação final do pré-IMP; ARQ-006/007; REQ-004/005/014/015; Opção 2c; ADR-006; ADR-012 |
| Resultado | Referência oficial publicada; IMP-004 não redigido; aguarda exclusivamente a deliberação da Governança sobre classificações iniciais |

---

## 13. Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Registro do pré-IMP revisado (E1–E4; classificações fora do IMP) como referência oficial | Homologação final do CTO | **Homologado — referência para IMP-004** |
| 1.1 | 23/07/2026 | Engenheiro (Cursor) | Emenda de referência: conjunto inicial de 10 classificações + apontamento ao IMP-004 v0.1; estado processual atualizado | Decisão técnica CTO — classificações; redação do IMP-004 | **Homologado — referência atualizada (sem reabrir mérito do plano)** |
