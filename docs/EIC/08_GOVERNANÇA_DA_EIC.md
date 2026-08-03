# 08 — Governança da EIC

> **Status:** BLOCO 4 — Governança consolidada (pronta para homologação geral)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Quadro de autoridade — **só** papéis e Gates já definidos (CON-001; Roadmap EIC; Processo 11). Sem regras novas.  
> **Fontes:** CON-001 Art. 5º/6º/8º; [`03_ROADMAP.md`](03_ROADMAP.md); [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md); [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md); [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md).

## Objetivo

Estabelecer a governação oficial da EIC: quem decide, o que exige Gate, e como se regista — subordinada à Constituição e às normas do Sistema CEO.

## Finalidade

Operacionalizar a autoridade sobre a disciplina conversacional. Homologação detalhada → [`11`](11_PROCESSO_DE_HOMOLOGAÇÃO.md). Ordem e Gates → [`03`](03_ROADMAP.md).

---

## 1. Âmbito de governança

A governação da EIC cobre:

| Dentro | Fora |
|--------|------|
| Documentos `docs/EIC/` (conteúdo, status, blocos) | Alterar CON/VIS/ADR/REQ/ARQ sem fluxo próprio |
| Gates G-EIC-* (disciplina) | Despacho de Jobs / runtime do CEO |
| Homologação documental e (após Gate) conversacional de produto | Backlog infra Âncora (ex. Dispatcher V3) como se fosse EIC |
| Rastreabilidade Art. 8º das decisões EIC | Substituir a Âncora Mestra |

A EIC **não** governa o produto por si: governa **como** a conversação pode evoluir até o patrocinador autorizar mudança de produto (G-EIC-D + ADR-006).

---

## 2. Papéis e responsabilidades

Papéis **já** definidos na CON-001 Art. 6º — aplicação à EIC:

| Papel | Na EIC |
|-------|--------|
| **Usuário / Patrocinador** | Autoridade máxima: homologa blocos/docs EIC; autoriza Gates de produto; valida resultados |
| **CTO** | Revisa qualidade normativa; requisitos/arquitectura de mudanças futuras; **não** implementa código |
| **Engenheiro (Cursor)** | Redige/actualiza docs EIC sob comando; implementa produto **só** após norma + Gate |
| **CEO (Agente Executivo)** | Objecto da evolução conversacional no produto — não autor da governação EIC |

---

## 3. Decisões que exigem Gate

| Decisão | Gate / instrumento | Fonte |
|---------|-------------------|--------|
| Preencher / alterar doutrina EIC após Marco Zero | Autorização do patrocinador (comando) + registo | Marco Zero; Art. 6º |
| Homologar bloco ou onda documental | Processo [`11`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) §4.1 | BLOCO 3 |
| Discutir implementação conversacional | **G-EIC-C** | [`03`](03_ROADMAP.md) |
| Alterar código, prompts ou comportamento conversacional | **G-EIC-D** + ADR-006 (REQ/ARQ/IMP…) | [`03`](03_ROADMAP.md); Marco Zero |
| Encerrar onda de produto conversacional | **G-EIC-E** + Âncora se frente operacional | [`03`](03_ROADMAP.md) |
| Emenda a CA/NA ou catálogo SC-* | Homologação doc + citação de norma de origem | [`04`](04_CRITÉRIOS_DE_QUALIDADE.md) / [`05`](05_TESTES_CONVERSACIONAIS.md) |

---

## 4. Decisões que não exigem Gate de produto

Permitidas sob comando do patrocinador / trabalho documental EIC **sem** G-EIC-D:

- Correcções editoriais e padronização  
- Actualização de status no Índice / Histórico / Roadmap (espelho do estado real)  
- Consolidação de normas **já** homologadas (sem conceito novo)  
- Registo de EXE-* quando apenas observação documental  

**Proibido** mesmo sem “parecer Gate”: inventar critério técnico, alterar arquitectura de produto, ou tocar prompts/código.

---

## 5. Registo e rastreabilidade

Toda decisão relevante da EIC regista (CON-001 Art. 8º):

| Campo | Uso |
|-------|-----|
| Quem | Papel + agente |
| Quando | Data |
| Por quê | Motivo |
| Baseado em quê | Normas / comando |
| Resultado | Homologar / ressalva / reprovar / Gate |

Locais: histórico do documento tocado; [`12_HISTÓRICO_DA_EIC.md`](12_HISTÓRICO_DA_EIC.md); Âncora Mestra se encerramento operacional relevante.

---

## 6. Conflitos com normas superiores

```text
CON-001 → VIS → REQ → ADR → ARQ → IMP → EIC
```

1. Em conflito, prevalece o nível superior.  
2. A EIC cede; corrige-se o documento EIC.  
3. Âncora Mestra informa estado; **não** revoga CON/ADR ([`00`](00_VISÃO_GERAL.md) §7).  
4. Classificador NCS ≠ Classificador de Intenção — não fundir governações.

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`03_ROADMAP.md`](03_ROADMAP.md) | Gates G-EIC-* |
| [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md) | Ciclo até Gate |
| [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) | Aceite |
| [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Restrições pós-Fase 1 |
| [`ÍNDICE.md`](ÍNDICE.md) | Porta de entrada |
| `docs/learning/ANCORA-MESTRA.md` | Continuidade operacional |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 4 — governação consolidada | Pronto para homologação geral |

---

**Estado:** BLOCO 4 — governação consolidada. Sem regras novas. Sem impacto no produto.
