# F3-04 — Catálogo Oficial de Capacidades do CEO

> **Status: Homologada — Gate F3-04 APROVADO (CTO, 26/07/2026). Cobertura MVP-A completa (Gate F3-18).**  
> Pré-condições: F3-01, F3-02 e F3-03 **homologados**.  
> Natureza: **índice normativo** das capacidades CX — homologado.  
> **Fase F3 encerrada** — [`marco-encerramento-f3.md`](marco-encerramento-f3.md). Specs MVP-A: todas **homologadas**.  
> Pendências de spec: apenas evolutivas CX-02, CX-06, CX-17, CX-18.  
> **Proibições neste registro:** sem requisitos; sem arquitetura técnica; sem wireframes; sem commit.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O catálogo oficial e citável de todas as capacidades de experiência (CX) do CEO: identidade, classificação, estado documental, ponte para a especificação canônica e rastreio condensado à Fundação Conceitual. |
| **Por que existe?** | F3-01 descreve; F3-02 ordena; F3-03 padroniza o *como* escrever. Falta o **índice normativo** único para governança, auditoria e abertura de especificações/REQs futuros. |
| **Para quem?** | CTO (fonte da verdade do inventário); Engenheiro (ponto de entrada); Usuário (transparência). |
| **Sucesso?** | Nenhuma CX é citada em artefato futuro sem constar aqui; estados e referências de especificação permanecem coerentes com F3-01…F3-03. |

---

## 1. Regras do catálogo

1. **Uma linha por CX** — IDs exclusivamente `CX-01`…`CX-18` até deliberação que altere F3-01.  
2. **Não duplicar especificações** — propósito longo, entradas/saídas e critérios ficam no documento canônico da CX (F3-03); aqui só índice.  
3. **Nome canônico** — o da coluna Nome prevalece sobre sinônimos informais.  
4. **Classificação** — espelha F3-02; divergência exige emenda a F3-02, não “ajuste local”.  
5. **Estado documental** — vocabulário fechado (§2).  
6. **Referência de especificação** — caminho oficial do artefato canônico; se ainda não existir arquivo, estado = `proposta` (especificação) mantendo a CX **homologada no inventário**.  
7. **Rastreabilidade** — condensada; detalhe completo só na especificação CX.

### Convenção de caminho das especificações

| Situação | Referência oficial |
|----------|-------------------|
| Especificação canônica ainda não elaborada | `docs/product/cx/CX-nn-<slug>.md` (**pendente**) — padrão F3-03 |
| Especificação elaborada / homologada | Caminho real do arquivo sob `docs/product/cx/` |
| Definição-resumo (não canônica) | [`F3-01-mapa-de-capacidades-ceo.md`](F3-01-mapa-de-capacidades-ceo.md) §3.2 — *apenas apoio* até existir o canônico |

---

## 2. Vocabulário de estado documental

| Estado | Significado |
|--------|-------------|
| **proposta** | Entrada ou especificação em elaboração / ainda não homologada no nível indicado |
| **homologada** | Aceita pelo CTO no nível indicado (inventário e/ou especificação canônica) |
| **obsoleta** | Retirada do uso normativo; mantida só para histórico |

**Dois níveis (não confundir):**

| Nível | Coluna | Hoje (Gate F3-04) |
|-------|--------|-------------------|
| **Inventário (catálogo)** | Estado no catálogo | CX-01…18 = **homologada** (via F3-01) |
| **Especificação canônica (F3-03)** | Ref. especificação | Todas = **pendente** → tratado como especificação em **proposta** até gate próprio |

---

## 3. Catálogo oficial (índice)

| ID | Nome canônico | Classificação | MVP-A | Prec. | Estado catálogo | Especificação canônica | Estado especificação |
|----|---------------|---------------|-------|-------|-----------------|--------------------------|----------------------|
| **CX-01** | Estabelecer e exibir o COA ativo | Fundamental | Sim | O0 | homologada | [`cx/CX-01-coa-ativo.md`](cx/CX-01-coa-ativo.md) | **homologada** (Gate F3-05) |
| **CX-02** | Trocar o COA ativo com isolamento | Derivada / Evolutiva | Não | O6 | homologada | `docs/product/cx/CX-02-troca-coa.md` (pendente) | proposta |
| **CX-03** | Apresentar o quadro de Atenção | Fundamental | Sim | O1 | homologada | [`cx/CX-03-quadro-atencao.md`](cx/CX-03-quadro-atencao.md) | **homologada** (Gate F3-06) |
| **CX-04** | Declarar e conduzir Objetivo / Intenção | Fundamental | Sim | O2 | homologada | [`cx/CX-04-objetivo-intencao.md`](cx/CX-04-objetivo-intencao.md) | **homologada** (Gate F3-07) |
| **CX-05** | Conversar como interface principal | Fundamental | Sim | O1 | homologada | [`cx/CX-05-conversa-principal.md`](cx/CX-05-conversa-principal.md) | **homologada** (Gate F3-08) |
| **CX-06** | Navegar níveis de abstração no COA | Derivada / Evolutiva | Não | O6 | homologada | `docs/product/cx/CX-06-niveis-abstracao.md` (pendente) | proposta |
| **CX-07** | Consultar e ancorar Contexto / Conhecimento | Fundamental | Sim | O0 | homologada | [`cx/CX-07-contexto-conhecimento.md`](cx/CX-07-contexto-conhecimento.md) | **homologada** (Gate F3-09) |
| **CX-08** | Governar ciclo de vida de Objetivos | Derivada | Sim | O2 | homologada | [`cx/CX-08-ciclo-vida-objetivos.md`](cx/CX-08-ciclo-vida-objetivos.md) | **homologada** (Gate F3-10) |
| **CX-09** | Ordenar prioridade e Foco entre objetivos | Derivada | Sim | O2 | homologada | [`cx/CX-09-prioridade-foco.md`](cx/CX-09-prioridade-foco.md) | **homologada** (Gate F3-11) |
| **CX-10** | Solicitar meios sem expor orquestração | Derivada | Sim | O3 | homologada | [`cx/CX-10-solicitar-meios.md`](cx/CX-10-solicitar-meios.md) | **homologada** (Gate F3-12) |
| **CX-11** | Obter autorização humana (gates) | Derivada | Sim | O3 | homologada | [`cx/CX-11-gates-autorizacao.md`](cx/CX-11-gates-autorizacao.md) | **homologada** (Gate F3-13) |
| **CX-12** | Acompanhar Execução e Efeito | Derivada | Sim | O3 | homologada | [`cx/CX-12-execucao-efeito.md`](cx/CX-12-execucao-efeito.md) | **homologada** (Gate F3-14) |
| **CX-13** | Aprender e promover ao Permanente | Derivada | Sim | O4 | homologada | [`cx/CX-13-promover-permanente.md`](cx/CX-13-promover-permanente.md) | **homologada** (Gate F3-15) |
| **CX-14** | Renovar Nova Atenção após atualização | Derivada | Sim | O4 | homologada | [`cx/CX-14-nova-atencao.md`](cx/CX-14-nova-atencao.md) | **homologada** (Gate F3-16) |
| **CX-15** | Preservar continuidade entre sessões | Derivada / Transversal* | Sim | O5 | homologada | [`cx/CX-15-continuidade-sessoes.md`](cx/CX-15-continuidade-sessoes.md) | **homologada** (Gate F3-17) |
| **CX-16** | Explicitar limites e estados transitórios | Transversal | Sim | O5 | homologada | [`cx/CX-16-limites-transitorio.md`](cx/CX-16-limites-transitorio.md) | **homologada** (Gate F3-18) |
| **CX-17** | Registrar decisão e justificativa no COA | Derivada / Evolutiva | Não | O7 | homologada | `docs/product/cx/CX-17-decisao-justificativa.md` (pendente) | proposta |
| **CX-18** | Distinguir progresso de comando vs. checklist | Derivada / Evolutiva | Não | O7 | homologada | `docs/product/cx/CX-18-progresso-comando.md` (pendente) | proposta |

\*CX-15: derivada na construção; transversal no tempo (F3-02).

**Nenhuma CX obsoleta neste catálogo.**

---

## 4. Rastreabilidade condensada (índice)

Detalhe completo → especificação canônica (quando existir). Abaixo: âncoras normativas por CX.

| ID | D1–D5 | DA | PX (principais) | IX (principais) | F3 |
|----|-------|----|-----------------|-----------------|-----|
| CX-01 | D1, D3 | — | PX-03 | IX-01, IX-05 | F3-01; F3-02 Fund./MVP/O0 |
| CX-02 | D1, D3 | — | PX-03 | IX-05, IX-10 | F3-01; F3-02 Evol./O6 |
| CX-03 | D1 | — | PX-01, PX-05, PX-07 | IX-02, IX-08 | F3-01; F3-02 Fund./MVP/O1 |
| CX-04 | D2 | DA-001 | PX-02 | IX-03 | F3-01; F3-02 Fund./MVP/O2 |
| CX-05 | D2 | — | PX-04 | IX-11 | F3-01; F3-02 Fund./MVP/O1 |
| CX-06 | D1, D3 | DA-003 | PX-05 | IX-10 | F3-01; F3-02 Evol./O6 |
| CX-07 | D3 | DA-002 | PX-06 | IX-04, IX-09 | F3-01; F3-02 Fund./MVP/O0 |
| CX-08 | D1, D2, D3 | DA-001 | PX-07 | IX-02 | F3-01; F3-02 Deriv./MVP/O2 |
| CX-09 | D1, D3 | — | PX-07 | IX-02 | F3-01; F3-02 Deriv./MVP/O2 |
| CX-10 | D2→D4 | DA-001 | PX-02 | IX-07 | F3-01; F3-02 Deriv./MVP/O3 |
| CX-11 | D1/D2↔D4 | — | PX-01, PX-08 | IX-06 | F3-01; F3-02 Deriv./MVP/O3 |
| CX-12 | D5 | — | PX-01 | IX-08 | F3-01; F3-02 Deriv./MVP/O3 |
| CX-13 | D5→D3 | DA-002 | PX-06 | IX-09 | F3-01; F3-02 Deriv./MVP/O4 |
| CX-14 | D3→D1 | — | PX-06 | IX-02 | F3-01; F3-02 Deriv./MVP/O4 |
| CX-15 | D3→D1 | DA-002 | PX-06 | IX-04 | F3-01; F3-02 Deriv./MVP/O5 |
| CX-16 | D1, D2 | — | PX-08 | IX-09 | F3-01; F3-02 Transv./MVP/O5 |
| CX-17 | D2, D3 | — | PX-10 | — | F3-01; F3-02 Evol./O7; HP-006 obs. |
| CX-18 | D1, D3 | — | PX-10 | — | F3-01; F3-02 Evol./O7; HP-005 obs. |

**F3 (coluna):** inventário e classificação oficiais; o canônico F3-03 aplica-se a todas as especificações futuras.

---

## 5. Vistas auxiliares do índice

### 5.1 Por classificação

| Classificação | IDs |
|---------------|-----|
| Fundamental | CX-01, CX-03, CX-04, CX-05, CX-07 |
| Derivada (MVP-A) | CX-08, CX-09, CX-10, CX-11, CX-12, CX-13, CX-14, CX-15 |
| Transversal | CX-16 (CX-15 também transversal no tempo) |
| Evolutiva | CX-02, CX-06, CX-17, CX-18 |

### 5.2 MVP arquitetural vs evolutivo

| Conjunto | IDs |
|----------|-----|
| **MVP-A** | CX-01, CX-03, CX-04, CX-05, CX-07, CX-08, CX-09, CX-10, CX-11, CX-12, CX-13, CX-14, CX-15, CX-16 |
| **Evolutivo** | CX-02, CX-06, CX-17, CX-18 |

### 5.3 Pendências de especificação canônica

| Pendência | Quantidade | Ação típica |
|-----------|------------|-------------|
| Specs homologadas (MVP-A) | **Todas** as CX do MVP-A (CX-01, 03–05, 07–16) — cobertura funcional completa | [`marco-encerramento-f3.md`](marco-encerramento-f3.md) |
| Specs ainda pendentes / proposta | CX-02, CX-06, CX-17, CX-18 | Evolutivas (O6/O7) — fora do MVP-A |
| Fase | **F3 encerrada**; F4 aberta em [`F4-01-mandato-arquitetura-tecnica.md`](F4-01-mandato-arquitetura-tecnica.md) | — |

### 5.4 Correção formal de nomenclatura (pós-Gate F3-06)

| Registro | Oficial |
|----------|---------|
| Erro material no enunciado F3-06 | “CX-03 — Objetivo Ativo” — **invalidado** |
| **CX-03** | Quadro de Atenção (Apresentar o quadro de Atenção) |
| **CX-04** | Objetivo / Intenção |
| **CX-09** | Foco (Ordenar prioridade e Foco entre objetivos) |

---

## 6. Governança de mudanças no catálogo

| Mudança | Exige |
|---------|--------|
| Renomear CX / alterar classificação | Deliberação CTO + emenda F3-01 e/ou F3-02 + atualização deste catálogo |
| Homologar especificação canônica | Gate da spec; atualizar coluna Estado especificação + caminho real |
| Tornar CX obsoleta | Deliberação CTO; estado `obsoleta`; não reutilizar ID |
| Nova CX | Deliberação que reabre inventário (F3-01) **antes** de incluir aqui |
| Duplicar texto de spec neste arquivo | **Proibido** |

---

## 7. Fora de escopo

* Corpo das especificações CX (propósito longo, I/O, critérios).  
* Requisitos, arquitetura técnica, wireframes, implementação.  
* Criação dos arquivos em `docs/product/cx/` neste gate (apenas reserva de caminho).  
* Promoção de HP-004/005/006.

---

## 8. Deliberação do CTO (Gate F3-04 — homologado)

| Item | Registro |
|------|----------|
| Catálogo Oficial CX-01…CX-18 | ✅ Homologado |
| Distinção estado catálogo vs especificação | ✅ Confirmada |
| Convenção `docs/product/cx/CX-nn-*.md` | ✅ Confirmada |
| Próxima capacidade | **F3-05** — Especificação Canônica **CX-01** |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO (Gate F3-04 homologado) |
| Quando | 26/07/2026 |
| Por quê | Gate F3-04 — Catálogo Oficial; abertura F3-05 (CX-01) |
| Baseado em quê | F3-01…F3-03; deliberação CTO |
| Resultado | Catálogo homologado; F3-05 em curso; sem commit |
