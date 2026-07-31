# Marco — Encerramento da Fase F3 (Arquitetura Funcional)

> **Status: Oficial — Fase F3 CONCLUÍDA (CTO, 26/07/2026), após Gate F3-18.**  
> Natureza: **marco de encerramento de fase** — não é especificação CX nem ARQ técnica.  
> Sede: IPR-001 — Experiência e Desejabilidade do CEO.

---

## Declaração

Fica registrado oficialmente:

> **Fase F3 — Arquitetura Funcional — ENCERRADA.**

### Consolidação do MVP Arquitetural (MVP-A)

| Afirmação | Estado |
|-----------|--------|
| Todas as capacidades previstas para o **MVP-A** possuem especificação canônica **homologada** | ✅ |
| O **Catálogo Oficial (F3-04)** possui **cobertura funcional completa** do MVP-A | ✅ |
| A **Arquitetura Funcional** (F3: mapa, dependências, canônico, catálogo, specs CX do MVP-A) passa a ser a **referência normativa obrigatória** para a **Arquitetura Técnica** (F4) | ✅ |

### Capacidades MVP-A homologadas (specs)

| Precedência | IDs |
|-------------|-----|
| O0 | CX-01, CX-07 |
| O1 | CX-03, CX-05 |
| O2 | CX-04, CX-08, CX-09 |
| O3 | CX-10, CX-11, CX-12 |
| O4 | CX-13, CX-14 |
| O5 | CX-15, CX-16 |

**Fora do MVP-A (evolutivas — specs ainda pendentes):** CX-02, CX-06, CX-17, CX-18.

### Marcos de consolidação da F3 (cadeia)

| Marco | Artefato |
|-------|----------|
| Núcleo Fundamental MVP-A | [`marco-nucleo-fundamental-mvp-a.md`](marco-nucleo-fundamental-mvp-a.md) |
| Ciclo Executivo Funcional integral | [`marco-ciclo-executivo-ate-promocao.md`](marco-ciclo-executivo-ate-promocao.md) |
| Bloco de Continuidade | [`marco-bloco-continuidade.md`](marco-bloco-continuidade.md) |
| Bloco transversal MVP-A | [`marco-bloco-transversal-mvp-a.md`](marco-bloco-transversal-mvp-a.md) |
| **Encerramento F3** | Este documento |

### Herança normativa obrigatória para F4+

Nenhuma Arquitetura Técnica, REQ detalhado, IMP ou implementação da experiência MVP-A pode contradizer:

* **F1:** DA-001…003; antimodelos e síntese do benchmark (quando aplicável).  
* **F2:** D1–D5, Interações, Governança, PX/IX; Fundação Conceitual.  
* **F3:** F3-01…F3-04 e specs CX do MVP-A homologadas.

### O que a F3 não autoriza

* Implementação de código de interface ou backend da experiência.  
* Wireframes como substituto da arquitetura funcional.  
* Escolha de stack/fornecedor sem ciclo ADR-006 / ARQ oficial quando exigido.  
* Absorção das evolutivas (CX-02/06/17/18) no MVP-A sem deliberação.

---

## Abertura da Fase F4

A **Fase F4 — Arquitetura Técnica** fica **aberta** na capacidade **F4-01** — ver [`F4-01-mandato-arquitetura-tecnica.md`](F4-01-mandato-arquitetura-tecnica.md).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (encerramento F3; abertura F4); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F3-18 — MVP-A funcional completo com CX-16 |
| Baseado em quê | Homologação de todas as specs MVP-A; F3-02; F3-04 |
| Resultado | F3 concluída; F4 aberta em F4-01; sem commit |
