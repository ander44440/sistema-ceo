# F5-01 — Mandato da Arquitetura UX/UI (abertura da F5)

> **Status: Homologada — Gate F5-01 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: **mandato de abertura** da Fase F5 — Arquitetura UX/UI.  
> Pré-condição: Fase F4 **encerrada** — [`marco-encerramento-f4.md`](marco-encerramento-f4.md).  
> **Fase F5:** oficialmente **iniciada** — [`marco-inicio-f5.md`](marco-inicio-f5.md).  
> Diretrizes normativas permanentes: **D-F5-01**, **D-F5-02**, **D-F5-03** (§2).  
> Próximo artefato: [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md).  
> **Proibições neste registro:** sem código de produção; sem stack fechada; sem alteração de CX/CMP/FLX; sem IMP; sem commit neste registro.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O mandato que abre a Fase F5 e define **como** a Arquitetura UX/UI da experiência (MVP-A) deve ser elaborada — subordinada à Arquitetura Funcional (F3) e à Arquitetura Técnica (F4). |
| **Por que existe?** | Sem mandato explícito, a F5 arriscaria inventar superfícies que contradizem CX/CMP/FLX, ou saltar para implementação. |
| **Para quem?** | CTO (gate de abertura); Engenheiro (insumo de specs de superfície e design); Usuário (transparência). |
| **Sucesso?** | CTO homologa: (a) F4 encerrada; (b) F5 aberta sob este mandato; (c) F3+F4 como referências normativas; (d) escopo/proibições/próximo passo claros. |

---

## 1. Declaração de abertura

Fica aberta e **oficialmente iniciada** a **Fase F5 — Arquitetura UX/UI** da IPR-001.

**Objeto:** traduzir a experiência do MVP-A (capacidades CX homologadas + organização técnica F4) em **arquitetura de experiência e interface** — papéis de superfície, navegação lógica, fluxos de uso e obrigações de interação — **sem** contradizer F1–F4 e **sem** implementar código.

**Nota de nomenclatura:** na IPR-001, a F5 significa **Arquitetura UX/UI**. A aplicação em código permanece na **F6** (ciclos ADR-006), conforme IPR-001.

---

## 2. Diretrizes normativas permanentes da F5 (obrigatórias)

| # | Diretriz | Força |
|---|----------|-------|
| **D-F5-01** | A **Arquitetura Funcional (F3)** é **referência obrigatória** para toda decisão de **UX**. | Normativa — permanente |
| **D-F5-02** | A **Arquitetura Técnica (F4)**, incluindo **FLX** e **MVA**, é **referência obrigatória** para toda decisão de **UI** e **interação**. | Normativa — permanente |
| **D-F5-03** | A F5 permanece **independente de código, stack e implementação**, conforme **ADR-006**. | Normativa — permanente |

Estas diretrizes vinculam todos os artefatos F5-nn posteriores.

### Referência normativa em cascata

| Camada | Artefatos | Força na F5 |
|--------|-----------|-------------|
| **F4 — Técnica** | F4-01…F4-13; FLX; MVA; CMP; IFA; CAT | **Obrigatória** — D-F5-02 |
| **F3 — Funcional** | F3-01…F3-04; specs CX MVP-A | **Obrigatória** — D-F5-01 |
| **F2 — Conceitual** | F2-01…F2-04; D1–D5; PX/IX | **Obrigatória** |
| **F1 — Diretrizes** | DA-001…003; princípios P1–P6 | **Obrigatória** |
| **Governança** | CON-001; ADR-006; ADR-015 | **Obrigatória** — D-F5-03 |

### Inventário MVP-A (herdado)

CX-01, CX-03…05, CX-07…16 — specs **homologadas**.  
CMP-001…014 · FLX-01…06 · MVA — **homologados**.

**Fora do escopo imediato (salvo deliberação):** evolutivas CX-02, CX-06, CX-17, CX-18.

---

## 3. Escopo da F5

| Inclui (documental / experiência) | Exclui |
|-----------------------------------|--------|
| Modelo canônico de artefatos UX/UI (F5-02) | Código de produção / componentes React |
| Mapeamento CX/CMP → papéis de superfície e interação | Alterar CX, PAT, CMP, FLX ou MVA |
| Navegação lógica; posto de comando; conversa como centro | Seletor de meios / IA na superfície |
| Fluxos de uso alinhados a FLX (sem reinventar o ciclo) | Stack, APIs, schemas de persistência |
| Obrigações de honestidade na interação (CX-16) | IMP, VAL, deploy |
| Fundações e padrões visuais **quando** deliberados sob F5-02+ | Absorver evolutivas no MVP-A sem deliberação |

---

## 4. Princípios de condução

1. **Funcional e técnico antes do visual** — toda decisão de UX/UI cita CX/CMP/FLX que realiza.  
2. **Conversa é a interface principal** (REQ-041 / VIS-007) — superfícies auxiliares não competem.  
3. **Um COA ativo** (CX-01 / DA-003).  
4. **Objetivo antes da ferramenta** (DA-001) — zero seletor de meios.  
5. **Contexto que sobrevive** (DA-002) — permanente ≠ descartável.  
6. **P1–P6** e sobriedade executiva (P4).  
7. **ADR-006 intacto** — F5 especifica; não implementa (D-F5-03).  
8. **Sugerir sem impor** — Engenheiro elabora; CTO homologa.

---

## 5. Entregáveis da F5 (ordem atualizada pós-Gate F5-01)

| ID | Entrega | Estado |
|----|---------|--------|
| **F5-01** | Mandato de abertura | ✅ Homologada |
| **F5-02** | Modelo Canônico da Arquitetura UX/UI | Em revisão |
| **F5-03+** | Artefatos sob F5-02 | Pendente |
| — | Specs em `docs/product/ux/` e `docs/product/ui/` | Conforme artefatos |
| — | Pacote REQ/ARQ/IMP via ADR-006 (F6) | Quando deliberado |

---

## 6. Restrições

* Não alterar specs CX nem artefatos F4 sem deliberação formal (D-F5-01/02).  
* Não introduzir código, stack ou implementação na F5 (D-F5-03).  
* Não expor orquestração (D4) nem fundir D4 com D5 na superfície.  
* Sem commit até autorização.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-01 — iniciar F5; D-F5-01…03 permanentes; abrir F5-02 |
| Baseado em quê | Encerramento F4; mandato F5-01 |
| Resultado | F5-01 **homologada**; F5 oficialmente iniciada; F5-02 submetido |
