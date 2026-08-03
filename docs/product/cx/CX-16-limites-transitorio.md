# CX-16 — Explicitar limites e estados transitórios

> **Status: Homologada — Gate F3-18 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Transversal  
> **MVP arquitetural:** Sim  
> **Precedência:** O5  
> **Domínios:** D1, D2  
> **Nome canônico (F3-04):** Explicitar limites e estados transitórios  
> **Papel O5:** honestidade situacional — completa o mínimo O5 com **CX-15**; **não** integra o bloco de Continuidade ([`../marco-bloco-continuidade.md`](../marco-bloco-continuidade.md))  
> **Marco transversal:** [`../marco-bloco-transversal-mvp-a.md`](../marco-bloco-transversal-mvp-a.md)  
> **Encerramento F3:** [`../marco-encerramento-f3.md`](../marco-encerramento-f3.md)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Tornar **visível**, quando afetam o comando, a **incerteza**, o estado **“ainda não consolidado”** (transitório vs permanente) e os **limites** do sistema — inclusive “não sei / não posso” honestos e pendências de promoção (PX-08; IX-09; CON-001 p.8).

CX-16 é **transversal**: atravessa o ciclo e a continuidade sem substituir COA, atenção, intenção, meios, execução ou promoção. No MVP-A é **obrigatória em forma mínima** nos pontos críticos (F3-02) — não é cosmética pós-MVP.

Sem CX-16, a experiência tende a fingir conclusão, esconder gate necessário ou apresentar transitório como se já fosse patrimônio.

---

## 2. Responsabilidade

### Compete a esta CX

* Explicitar **limites** do que o sistema pode afirmar ou fazer no momento (quando isso impacta a decisão do usuário).  
* Explicitar estados **transitórios** vs **permanentes** — sobretudo pré-promoção e na retomada de sessão.  
* Sinalizar **pendência de promoção** / consolidação sem fingir patrimônio (coerência com **CX-13** e **CX-15**).  
* Permitir “não sei / não posso” **honestos** na conversa e na atenção (**CX-05**, **CX-03**).  
* Apoiar a legibilidade de **gates** (**CX-11**) sem escondê-los em telemetria.  
* Operar sob o **COA ativo** (**CX-01**) — mensagem sem lente é inválida (F3-02).

### Não compete a esta CX

* Estabelecer COA, quadro, objetivo, Foco ou ciclo de vida (**CX-01**, **CX-03**, **CX-04**, **CX-08**, **CX-09**).  
* Solicitar meios, autorizar, executar ou promover (**CX-10**…**CX-13**).  
* Renovar Nova Atenção ou preservar continuidade entre sessões (**CX-14**, **CX-15**) — apenas honestiza estados nesses fluxos.  
* Expor orquestração (D4) ou tornar limites em seletor de meios.  
* Substituir fundamentais: CX-16 sem CX-01 é mensagem sem contexto.  
* Fingir conclusão ou autonomia irreversível surpresa.  
* Definir layout, componentes ou wireframes.

### Coerência com capacidades homologadas

| CX | Como CX-16 se articula |
|----|------------------------|
| CX-04 / CX-05 | Honestidade na intenção e no diálogo |
| CX-10…CX-12 | Limites no pedido, no gate e no efeito |
| CX-13 | Transitório ainda não promovido ≠ permanente |
| CX-14 | Nova Atenção não apresenta residual como patrimônio novo |
| CX-15 | Pendências na retomada são explícitas |
| CX-07 / CX-01 | Limites no recorte do COA ativo |

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| Situação de incerteza / limite / pré-promoção | Transitório ou permanente situacional | Ciclo (**CX-04**, **CX-10**…**CX-14**); retomada (**CX-15**) |
| COA ativo | Permanente (lente) | **CX-01** |
| Distinção candidata transitório vs permanente | Conceitual | F2-02 §2; **CX-13** |
| Necessidade de gate ou “não posso” | Transitório | **CX-11** / orquestração invisível |
| Ato do usuário que exige resposta honesta | Ato do usuário | Usuário (via **CX-05** / **CX-03**) |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Sinal situacional de limite / incerteza / “não sei / não posso” | Transitório espelhável | **CX-05**; **CX-03** |
| Marcação honesta de estado ainda não consolidado | Transitório | Usuário; coerência com **CX-13** / **CX-15** |
| Apoio à legibilidade do gate (sem expor meios) | Transitório | **CX-11** |
| Clareza de que algo *não* foi promovido | Situacional | Evita falsa memória institucional |

**Não é saída desta CX:** promoção; execução; mudança de Foco/ciclo de vida; superfície de orquestração.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → estrutural — limites sempre no COA ativo |
| Atravessa | **CX-04**, **CX-05**, **CX-10**…**CX-14**, **CX-11** | ↔ transversal (F3-02) |
| Relacionada | **CX-13** | ↔ — seletividade; pré-promoção |
| Relacionada | **CX-15** | ↔ — pendências honestas na retomada |
| Relacionada | **CX-03** | ↔ — espelho situacional |
| Relacionada | **CX-07** | ↔ — o que é / não é permanente no recorte |

**Precedência F3-02:** O5 (completude do MVP-A com CX-15); na prática pode aparecer cedo nos pontos de contato, mas **não** é descartável nem cosmética.  
**Anti-precedências:** CX-16 sem CX-01; tratar CX-16 como opcional pós-MVP; usar CX-16 para expor D4.

---

## 6. Critérios de conclusão

A capacidade CX-16 considera-se **realizada** na experiência quando:

1. Nos pontos críticos (gate, pré-promoção, “não posso”, retomada), limites e transitório são **perceptíveis**.  
2. Não se finge conclusão nem se esconde gate necessário.  
3. Transitório ≠ permanente permanece legível (IX-09), em coerência com CX-13/15.  
4. CX-16 não substitui nem funde capacidades de ciclo/continuidade.  
5. Forma mínima MVP-A atendida (F3-02): limites + transitório vs permanente nos pontos críticos.  
6. Precedência O5 / dependência de CX-01 respeitadas.  
7. Narrativa UXC compatível com PX-08 / IX-09 / CON-001 p.8, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-16 |
|----|-------------------|
| **PX-08** | Honestidade — núcleo |
| **IX-09** | Transitório ≠ permanente — núcleo |
| **CON-001 p.8** | Transparência sobre limitações |
| **IX-07** | Limites não viram seletor de meios |
| **IX-06** | Não esconder gate |
| **IX-01 / IX-05** | Só no COA ativo |
| **DA-002** | Não apresentar efêmero como patrimônio |
| **F3-02** | Transversal obrigatória no MVP-A (forma mínima) |

**Restrições adicionais:**

* Forma mínima: sinais de limite/incerteza/pré-promoção nos pontos críticos — sem catálogo técnico de erros.  
* Não fundir com CX-13, CX-14 ou CX-15.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-16 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-04, CX-05, CX-07, CX-10…CX-15 | Lente; espelho; intenção; canal; permanente; ciclo; continuidade |
| **Domínios** | D1, D2 | Atenção e conversa — superfície da honestidade |
| **DA** | DA-002 | Evitar falsa sobrevivência de transitório |
| **PX** | **PX-08**; PX-01 | Honestidade; comando informado |
| **IX** | **IX-09**; IX-06, IX-07, IX-01, IX-05 | Transitório; gate; invisível; COA; isolamento |
| **F3-02** | Transversal; MVP-A Sim; O5 | Completude com CX-15 |
| **F3-01** | Ficha CX-16 | Inventário |
| **F3-04** | Entrada CX-16 | Catálogo |
| **F2 apoio** | F2-02 §2 Transitório/Permanente; F2-04 PX-08 | Honestidade situacional |
| **HP** | — | — |
| **Marco** | Bloco Continuidade (CX-14/15) | Encerrado; CX-16 é O5 de honestidade, fora desse bloco |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-18 — Spec CX-16; homologação CX-15; encerramento bloco Continuidade |
| Baseado em quê | F3-03; F3-02 O5/transversal; F3-04; PX-08; IX-09; coerência CX-01…15 |
| Resultado | Spec CX-16 **homologada** (Gate F3-18); bloco transversal e F3 encerrados; F4 aberta |
