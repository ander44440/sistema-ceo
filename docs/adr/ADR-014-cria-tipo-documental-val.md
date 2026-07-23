# ADR-014 — Criação do tipo documental VAL (Plano de Validação)

> **Status: Aceita — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026.
> Esta ADR institucionaliza o tipo **VAL** na metodologia oficial do CEO. **Não** altera REQs, ARQs, IMPs nem o conteúdo técnico do VAL-004.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO homologou; Engenheiro (Cursor) registrou e publicou |
| Quando | 23/07/2026 |
| Por quê | O CTO autorizou o artefato VAL-004 antes da abertura da E1 da CAP-04; o tipo VAL não existia no catálogo oficial, e novo tipo documental deve nascer por ADR, nunca ad hoc |
| Baseado em quê | Regra do catálogo (`docs/README.md`); precedentes ADR-005 (ANL), ADR-010 (ARQ), ADR-012 (IMP); ADR-006 (etapa Validação do fluxo oficial); decisão metodológica do CTO; parecer técnico final — HOMOLOGADA |
| Resultado | Tipo VAL criado e incorporado ao catálogo; ADR-014 Aceita v1.0; VAL-004 homologado v1.0 no mesmo ato institucional; E1 não iniciada |

---

## Status

Aceita — v1.0, homologada pelo CTO em 23/07/2026.

---

## Decisão

Criar o tipo documental **VAL — Plano de Validação**:

| Atributo | Definição |
|----------|-----------|
| **Finalidade** | Planejar a etapa **Validação** do fluxo oficial (ADR-006): definir objetivo, escopo, itens a validar, evidências, critérios de aprovação e reprovação, rastreabilidade e condições de homologação/encerramento do ciclo — **sem executar** a Validação nem a Implementação |
| **Localização** | `docs/validation/` |
| **Identificação** | VAL-nnn, sequencial e permanente |
| **Elaboração** | Engenheiro ou CTO |
| **Aprovação** | CTO, com aval do Usuário |
| **Natureza** | Disciplina metodológica — o VAL não cria requisitos, não altera arquiteturas, não altera planos de implementação e não substitui a execução da Validação |

---

## 1. Finalidade do artefato VAL

O VAL existe para:

1. Tornar a Validação (ADR-006) **planejável, auditável e repetível** antes de sua execução.
2. Fixar **evidências esperadas** e **critérios objetivos** de aprovação/reprovação.
3. Garantir **rastreabilidade** entre requisitos, arquitetura, implementação e evidências.
4. Declarar as **condições de homologação final** do ciclo da capacidade (ou do mecanismo) no escopo validado.
5. Distinguir Validação de verificação intermediária de etapas do IMP (ex.: E3), sem substitui-las.

O VAL **não** é evidência; é o **plano** que disciplina a produção e a avaliação das evidências.

---

## 2. Momento em que deve ser produzido

| Momento | Regra |
|---------|--------|
| **Não antes** | Não se elabora VAL oficial sem REQs aprovados da capacidade/mecanismo e sem ARQ(s) homologada(s) que o IMP materializa (quando a capacidade tiver etapa ARQ). |
| **Após o IMP** | O VAL referencia um **IMP homologado** (ou, em emergência autorizada, IMP em versão estável explicitamente designada). Sem IMP, não há implementação a validar. |
| **Antes da execução da Validação** | O VAL deve estar **homologado** antes de se executar a Validação ADR-006 (evidências sob o plano). |
| **Em relação à execução do IMP** | Recomenda-se elaborar o VAL **após a homologação do IMP** e **antes da abertura da primeira etapa de execução do IMP** (padrão CAP-04: VAL antes da E1). Exceções exigem deliberação explícita do CTO/Governança. |
| **Não substitui gates do IMP** | A existência do VAL não autoriza pular gates E1…En do IMP. |

---

## 3. Relação entre REQ, ARQ, IMP e VAL

```
REQ (o que deve ser verdadeiro)
  ↓
ARQ (forma que satisfaz os REQs)
  ↓
IMP (plano de materializar a ARQ / mecanismo)
  ↓
VAL (plano de provar conformidade da implementação com REQ/ARQ/IMP)
  ↓
Execução da Validação (evidências) → homologação / encerramento do ciclo
```

| Tipo | Papel | O VAL faz | O VAL não faz |
|------|-------|-----------|---------------|
| **REQ** | Obrigações verificáveis | Rastreia critérios de aceitação → evidências | Não reescreve nem emenda REQs |
| **ARQ** | Forma arquitetural | Rastreia decisões A* / princípios → evidências | Não altera ARQs |
| **IMP** | Plano de implementação | Rastreia etapas, critérios de sucesso e limites → evidências | Não altera o IMP; não executa etapas |
| **VAL** | Plano de validação | Define como aprovar/reprovar e encerrar o ciclo | Não é a Validação executada |

**Hierarquia:** nenhum VAL pode contrariar REQ, ARQ ou IMP superiores. Lacunas de evidência no escopo documental devem ser declaradas (ex.: regime *mecanismo* × *diferido*), nunca ocultadas.

---

## 4. Regras mínimas de conteúdo

Todo VAL oficial contém, no mínimo:

| # | Seção obrigatória |
|---|-------------------|
| 1 | **Objetivo da validação** |
| 2 | **Escopo** (inclui / exclui / premissas) |
| 3 | **Itens a validar** por etapa do IMP (ou por unidade de entrega equivalente) |
| 4 | **Evidências esperadas** (código/identificador recuperável) |
| 5 | **Critérios objetivos de aprovação** |
| 6 | **Critérios de reprovação** |
| 7 | **Matriz de rastreabilidade** REQ → Evidência; ARQ → Evidência; IMP → Evidência |
| 8 | **Condições para homologação final** do ciclo no escopo |
| 9 | **Memória Organizacional** (cinco campos) e **histórico de versões** |

Recomenda-se ainda: distinção explícita entre verificação de etapa do IMP e Validação ADR-006; declaração do que é *diferido* sem bloquear o escopo documental, quando aplicável.

---

## 5. Critérios de rastreabilidade

| Critério | Exigência |
|----------|-----------|
| R1 | Cada REQ no escopo do VAL aparece na matriz com ao menos uma evidência **ou** marcação explícita *diferido* / *fora do escopo deste VAL* |
| R2 | Cada ARQ (e decisões A* relevantes) no escopo aparece na matriz com evidência ou exclusão justificada |
| R3 | Cada etapa (ou critério de sucesso) do IMP no escopo aparece na matriz |
| R4 | Evidências são **identificáveis e recuperáveis** (caminho, artefato, relatório) — não apenas intenções |
| R5 | Identificadores de itens de validação (ex.: V-E1-01) são estáveis na versão homologada do VAL |
| R6 | O VAL referencia explicitamente: REQs, ARQ(s), IMP e ADR-006 |

---

## 6. Critérios para homologação do VAL

O VAL somente se **homologa** quando:

| # | Critério |
|---|----------|
| V1 | Conteúdo mínimo (§4) completo |
| V2 | Rastreabilidade (§5) sem lacuna obrigatória aberta |
| V3 | Não contradiz REQ/ARQ/IMP vigentes no escopo |
| V4 | Escopo e diferimentos são explícitos (transparência — CON-001 Art. 9º princípio 8) |
| V5 | Parecer favorável do CTO (e aval do Usuário, conforme alçada desta ADR) |
| V6 | Tipo VAL já instituído por esta ADR **aceita** (ou aceitação conjunta desta ADR + primeiro VAL, por deliberação explícita) |

**Homologação do VAL ≠ execução da Validação ≠ homologação final da capacidade.**  
A homologação final do ciclo exige Validação **executada e aprovada** sob o VAL homologado (ADR-006).

---

## 7. Aplicabilidade às futuras CAPs

| Regra | Enunciado |
|-------|-----------|
| A1 | O tipo VAL é **transversal**: aplica-se a toda capacidade ou mecanismo que percorra a etapa Validação da ADR-006 |
| A2 | Cada ciclo de Validação de implementação relevante deve ter **um VAL próprio** (VAL-nnn), referenciando o IMP correspondente |
| A3 | Não é obrigatório um VAL por REQ individual; o agrupamento segue o IMP / mecanismo / capacidade deliberados |
| A4 | CAPs futuras **não** reutilizam o VAL-004; podem usá-lo apenas como precedente de forma |
| A5 | Ciclos já encerrados antes desta ADR **não** são reabertos retroativamente (simetria com ADR-006 — não retroatividade), salvo deliberação explícita |
| A6 | Emenda desta ADR exige novo registro; práticas locais não criam exceções silenciosas |

---

## Alternativas consideradas

* **Usar TST (Testes) para o plano de validação:** rejeitado — TST é evidência/execução de teste; o VAL é plano de governança da etapa Validação da ADR-006, análogo ao IMP para Implementação.
* **Fundir Validação no próprio IMP:** rejeitado — mistura planejamento de execução com planejamento de prova; enfraquece o gate L0 da ADR-006 (IMP → Validação).
* **Documento ad hoc sem tipo oficial:** rejeitado — viola a regra do catálogo (ADR-004 / `docs/README.md`).
* **Registrar apenas em learning:** rejeitado — sem força metodológica para disciplinar o encerramento de ciclos.

---

## Efeitos sobre o catálogo

Com a Aceitação desta ADR:

1. Incluída na taxonomia de `docs/README.md` a linha: **VAL** | Planos de validação | `docs/validation/` | Engenheiro/CTO | CTO, com aval do Usuário.
2. VAL vigentes passam a constar no índice documental.
3. A homologação de cada VAL permanece ato próprio — a Aceitação desta ADR não homologa automaticamente exemplares futuros; o VAL-004 foi homologado em ato concomitante do CTO (23/07/2026).

---

## Rastreabilidade

- Norma superior: CON-001 Art. 5º §2º; Art. 8º; catálogo oficial.
- Fluxo: ADR-006 (etapa Validação).
- Precedentes de tipo: ADR-005, ADR-010, ADR-012.
- Origem: decisão metodológica do CTO (23/07/2026) — institucionalizar VAL antes da homologação do VAL-004.
- Primeiro exemplar homologado: `docs/validation/VAL-004-plano-de-validacao-implementacao-documental-acervo-conhecimento.md` (v1.0).

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — finalidade, momento, relação REQ/ARQ/IMP/VAL, conteúdo mínimo, rastreabilidade, homologação, aplicabilidade futura | Decisão metodológica do CTO; ADR-006; precedentes ADR-005/010/012 | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro publicou | Homologação; tipo VAL oficial; catálogo atualizado | Parecer técnico final do CTO — HOMOLOGADA | **Aceita — publicada** |
