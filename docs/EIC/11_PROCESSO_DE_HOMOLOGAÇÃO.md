# 11 — Processo de Homologação

> **Status:** BLOCO 3 — Qualidade consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Processo documental de aceite — alinhado a ADR-006, Gates EIC e CA/NA existentes. Sem alterar produto.  
> **Fontes:** [`04`](04_CRITÉRIOS_DE_QUALIDADE.md); [`05`](05_TESTES_CONVERSACIONAIS.md); [`03_ROADMAP.md`](03_ROADMAP.md); [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md); CON-001 Art. 6º/8º; Âncora Mestra.

## Objetivo

Descrever o processo oficial de homologação das evoluções da Inteligência Conversacional sob a EIC — documental e, quando autorizado, de produto.

## Finalidade

Responder *quem aceita, com que evidência*. Critérios → [`04`](04_CRITÉRIOS_DE_QUALIDADE.md). Verificação → [`05`](05_TESTES_CONVERSACIONAIS.md).

---

## 1. Relação Critérios → Testes → Homologação

```text
04 define CA/NA
05 executa SC-* e regista EXE-*
11 decide: HOMOLOGAR | HOMOLOGAR COM RESSALVA | REPROVAR
         └─ se produto: exige G-EIC-D + ADR-006 cumprido
         └─ se doc EIC: patrocinador/CTO conforme papel
```

| Objecto | Evidência mínima | Decisor |
|---------|------------------|---------|
| Conteúdo EIC (blocos/docs) | Coerência 04↔05↔normas citadas | Patrocinador (aprova); CTO (revisa) |
| Mudança de produto conversacional | EXE-* PASS nos SC aplicáveis; sem NA crítica | Patrocinador + Gates IMP/EIC |

---

## 2. Objecto de homologação

Pode ser homologado sob este processo:

1. **Documento / bloco EIC** (ex.: BLOCO 3) — sem efeito runtime.  
2. **Onda documental** (ex.: Onda C) — após 04+05 coerentes.  
3. **Entrega de produto conversacional** — só após G-EIC-D e fluxo ADR-006 (REQ/ARQ/IMP/VAL conforme o caso).

Não é objecto deste processo: Dispatcher V3, extensões de painel fora do enum (backlog Âncora).

---

## 3. Pré-requisitos

| Objecto | Pré-requisitos |
|---------|----------------|
| Doc / Bloco EIC | Padrão documental; referências a normas existentes; sem conceitos novos |
| Onda C | M4+M5 preenchidos; alinhados a PX-003 E4 e ARQ-018 |
| Produto | G-EIC-C discutido; G-EIC-D obtido; IMP autorizada por etapa; testes T-RG/T-MN com registo |

---

## 4. Passos do processo

### 4.1 Homologação documental (EIC)

1. Autor entrega o documento/bloco com histórico de revisões.  
2. Verificação de consistência: cita fontes? conflita com CON/VIS/ARQ?  
3. Cruzamento 04↔05 (se aplicável): CA/NA têm SC correspondente?  
4. Revisão CTO (quando pedido pelo patrocinador).  
5. Decisão do patrocinador: **HOMOLOGAR** / **RESSALVA** / **REPROVAR**.  
6. Registo Art. 8º (quem, quando, por quê, baseado em quê, resultado).  
7. Se frente operacional relevante → actualizar Âncora Mestra.

### 4.2 Homologação de produto (após Gate)

1. Confirmar G-EIC-D + autorização IMP.  
2. Executar SC-* aplicáveis ([`05`](05_TESTES_CONVERSACIONAIS.md)); registar EXE-*.  
3. Qualquer NA **crítica** ⇒ **REPROVAR** (sem compensação).  
4. NA alta ⇒ corrigir ou REPROVAR; média ⇒ RESSALVA só com aceite explícito.  
5. Decisão do patrocinador.  
6. Memória + Âncora se encerramento formal de frente.  
7. Gate G-EIC-E quando a onda de produto fecha ([`03_ROADMAP.md`](03_ROADMAP.md)).

---

## 5. Papéis na homologação

| Papel | Função |
|-------|--------|
| **Patrocinador / Usuário** | Aprovação final (CON-001 Art. 6º) |
| **CTO** | Revisão de qualidade normativa / QA — não implementa |
| **Engenheiro** | Evidências, EXE-*, correcções pós-Gate |
| **EIC (docs)** | Critérios e catálogo de testes — não substituem VAL de produto quando existir |

---

## 6. Evidências exigidas

| Tipo | Evidência |
|------|-----------|
| Doc EIC | Diff/documentos; tabela de fontes; ausência de conceito novo |
| Classificação | Resultado de classe vs SC-01…05 (manual ou suite existente do Classificador, se Gate) |
| Prosa | Avaliação T-MN contra CA-04…10 / PX-003 E4 |
| Fronteira | Confirmação de que CN não alterou parecer; Classificador não publicou Job |
| Registo | EXE-* preenchido; NA críticas listadas |

---

## 7. Decisão e fecho

| Decisão | Significado |
|---------|-------------|
| **HOMOLOGAR** | Objecto aceite; pode avançar no Roadmap |
| **HOMOLOGAR COM RESSALVA** | Aceite com NA médias explícitas e prazo/condição |
| **REPROVAR** | Não avança; correcção obrigatória |

Fecho: actualizar [`12_HISTÓRICO_DA_EIC.md`](12_HISTÓRICO_DA_EIC.md) (quando preenchido) e, se aplicável, Âncora Mestra.

---

## 8. Estados actuais (transparência)

| Objecto | Estado neste ciclo |
|---------|-------------------|
| BLOCO 1 / 2 / 3 (docs) | **Prontos para homologação** do patrocinador |
| Execuções SC-* em produto | **Não iniciadas** (desacoplamento) |
| G-EIC-D | **Bloqueado** |

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`04_CRITÉRIOS_DE_QUALIDADE.md`](04_CRITÉRIOS_DE_QUALIDADE.md) | CA/NA |
| [`05_TESTES_CONVERSACIONAIS.md`](05_TESTES_CONVERSACIONAIS.md) | SC / EXE |
| [`03_ROADMAP.md`](03_ROADMAP.md) | Gates G-EIC-* |
| [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md) | Ciclo até Gate |
| [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md) | Autoridade (estrutura) |
| `docs/learning/ANCORA-MESTRA.md` | Continuidade pós-fecho |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 3 — processo de homologação | Pronto para homologação |

---

**Estado:** BLOCO 3 — processo consolidado. Sem impacto no produto.
