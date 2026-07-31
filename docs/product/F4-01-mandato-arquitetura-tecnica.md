# F4-01 — Mandato da Arquitetura Técnica (abertura da F4)

> **Status: Homologada — Gate F4-01 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> Natureza: **mandato de abertura** da Fase F4 — Arquitetura Técnica.  
> Pré-condição: Fase F3 **encerrada** — [`marco-encerramento-f3.md`](marco-encerramento-f3.md).  
> **Fase F4:** oficialmente **iniciada** — [`marco-inicio-f4.md`](marco-inicio-f4.md).  
> Diretrizes normativas da F4: §2 e [`marco-inicio-f4.md`](marco-inicio-f4.md).  
> Próximo artefato: [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md).  
> **Proibições neste registro:** sem código; sem stack fechada; sem APIs detalhadas; sem componentes de UI; sem wireframes; sem IMP; sem commit neste registro.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O mandato que abre a Fase F4 e define **como** a Arquitetura Técnica da experiência (MVP-A) deve ser elaborada — subordinada à Arquitetura Funcional homologada na F3. |
| **Por que existe?** | Sem mandato explícito, a F4 arriscaria reinventar capacidades, contradizer CX homologadas ou saltar para implementação. |
| **Para quem?** | CTO (gate de abertura); Engenheiro (insumo obrigatório dos próximos ARQ/REQ); Usuário (transparência). |
| **Sucesso?** | CTO homologa: (a) F3 encerrada; (b) F4 aberta sob este mandato; (c) Arquitetura Funcional como referência normativa obrigatória; (d) escopo/proibições/próximo passo claros. |

---

## 1. Declaração de abertura

Fica aberta e **oficialmente iniciada** a **Fase F4 — Arquitetura Técnica** da IPR-001.

**Objeto:** traduzir a Arquitetura Funcional do MVP-A (capacidades CX-01, 03–05, 07–16 e seus vínculos F2/F1) em **arquitetura técnica** — organização lógica de módulos, fronteiras, estados e contratos conceituais de sistema — **sem** contradizer F1–F3.

**Nota de nomenclatura:** na IPR-001, a F4 significa **Arquitetura Técnica**. **UX/UI permanece reservado à F5**, conforme IPR-001.

---

## 2. Diretrizes normativas da F4 (obrigatórias)

| # | Diretriz | Força |
|---|----------|-------|
| **D-F4-01** | A **Arquitetura Funcional (F3)** é a **referência obrigatória** para toda decisão técnica da F4. | Normativa |
| **D-F4-02** | Nenhuma decisão técnica poderá **alterar** capacidades, precedências ou responsabilidades homologadas (F3-01…F3-04; specs CX) **sem deliberação arquitetural formal** (CTO / ADR quando exigido). | Normativa |
| **D-F4-03** | **UX/UI** permanece **reservado à F5**, conforme IPR-001 — fora do escopo da F4. | Normativa |

Estas diretrizes vinculam todos os artefatos F4-nn posteriores.

### Referência normativa em cascata

| Camada | Artefatos | Força na F4 |
|--------|-----------|-------------|
| **F3 — Funcional** | F3-01…F3-04; specs CX do MVP-A; marcos F3 | **Obrigatória** — D-F4-01 |
| **F2 — Conceitual** | F2-01…F2-04; Fundação Conceitual; DA | **Obrigatória** |
| **F1 — Diretrizes** | DA-001…003; síntese/antimodelos aplicáveis | **Obrigatória** |
| **Governança do projeto** | CON-001; ADR-006; ADR-010; ADR-015 | **Obrigatória** |

### Inventário MVP-A

CX-01, CX-03, CX-04, CX-05, CX-07, CX-08, CX-09, CX-10, CX-11, CX-12, CX-13, CX-14, CX-15, CX-16 — specs **homologadas**.

**Fora do escopo imediato (salvo deliberação):** evolutivas CX-02, CX-06, CX-17, CX-18.

---

## 3. Escopo da F4

| Inclui (conceitual / técnico-lógico) | Exclui |
|--------------------------------------|--------|
| Modelo canônico de artefatos técnicos (F4-02) | Código de produção |
| Mapeamento CX → módulos / contextos lógicos | Stack/vendor fechados neste mandato |
| Fronteiras permanente vs transitório | APIs detalhadas |
| Ciclo e continuidade em visão técnico-lógica | Schemas finais de persistência |
| Obrigações de gate e orquestração invisível | Wireframes / tokens de design (F5) |
| Rastreio CX ↔ futuros REQ/ARQ | IMP, VAL, deploy |

---

## 4. Princípios de condução

1. **Funcional antes de técnico** — toda proposta técnica cita CX/DA/PX/IX que realiza.  
2. **Não reinventar o ciclo** — D4 decide/encaminha; D5 executa; CX-13/14.  
3. **Um COA ativo** no MVP-A (CX-01).  
4. **Invisível** — orquestração não vira superfície.  
5. **Independência tecnológica** (CON-001 / ADR-010).  
6. **ADR-006 intacto**.  
7. **Sugerir sem impor** — Engenheiro elabora; CTO homologa.

---

## 5. Entregáveis da F4 (ordem atualizada pós-Gate F4-01)

| ID | Entrega | Estado |
|----|---------|--------|
| **F4-01** | Mandato de abertura | ✅ Homologada |
| **F4-02** | Modelo Canônico da Arquitetura Técnica | Em revisão |
| **F4-03+** | Artefatos técnicos sob F4-02 (ex.: mapa CX→módulos, fronteiras de estado) | Pendente |
| — | ARQ-nnn em `docs/architecture/` | Quando CTO exigir tipo ARQ formal (ADR-010) |
| — | Pacote REQ/ARQ via ADR-006 | Quando deliberado |

---

## 6. Restrições

* Não alterar specs CX homologadas sem deliberação formal (D-F4-02).  
* Não introduzir UX/UI na F4 (D-F4-03).  
* Sem código, stack fechada, APIs, wireframes ou IMP neste registro.  
* Sem commit até autorização.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F4-01 — iniciar F4; diretrizes D-F4-01…03; abrir F4-02 |
| Baseado em quê | Encerramento F3; mandato F4-01 |
| Resultado | F4-01 **homologada**; F4 iniciada; F4-02 submetido |
