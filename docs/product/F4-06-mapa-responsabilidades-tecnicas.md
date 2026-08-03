# F4-06 — Mapa Canônico de Responsabilidades Técnicas

> **Status: Homologada — Gate F4-06 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Camadas:** [`F4-05-modelo-canonico-camadas.md`](F4-05-modelo-canonico-camadas.md) — **obrigatório**  
> **Força:** este Mapa RTB = **referência obrigatória** para toda futura decomposição em componentes.  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios:** PAT-01…PAT-12  
> **Marco:** [`marco-fundacao-organizacional-arquitetura-tecnica.md`](marco-fundacao-organizacional-arquitetura-tecnica.md)  
> **Proibições:** sem componentes concretos; sem tecnologias; sem APIs; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir o **Mapa Canônico de Responsabilidades Técnicas**: os **grandes blocos** de responsabilidade da arquitetura, sua relação com as camadas **L0–L5 e Tx**, e as **fronteiras** entre blocos — para orientar F4-07+ sem nomear componentes, tecnologias, APIs ou infraestrutura.

Este mapa responde: *quem (bloco) é responsável por quê?* — não *qual serviço implementa*.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Identificar blocos canônicos de responsabilidade técnica (RTB).  
* Mapear cada bloco às camadas L0–L5 / Tx.  
* Definir o que cada bloco assume e recusa.  
* Manter rastreabilidade F1/F2/F3/PAT.  
* Servir de índice para detalhamento modular posterior.

### Não compete a este artefato

* Inventariar componentes, classes, microsserviços ou telas.  
* Definir APIs, schemas ou infra.  
* Reabrir limites de camada (F4-05) ou alterar CX/PAT.  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Camadas L0–L5 + Tx + C1–C10 | Entrada | Permanente | F4-05 |
| Visão / PAT / CX MVP-A | Entrada | Permanente | F4-03/04; F3 |
| Catálogo de blocos RTB-01…RTB-08 | Saída | Permanente | F4-07+ |
| Matriz bloco ↔ camada ↔ CX | Saída | Permanente | Auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-05 (camadas obrigatórias) | → estrutural |
| Depende de | F4-01…04 | → estrutural |
| Depende de | F3-04 / specs CX | → estrutural |
| É pré-requisito de | F4-07+ (módulos / contextos por bloco) | → |
| Relacionada | Dependências entre camadas F4-05 | ↔ — blocos não violam §7.3 de F4-05 |

---

## 5. Critérios de validação técnica

1. Todo bloco RTB mapeia a ≥1 camada; toda camada tem ≥1 bloco.  
2. Fronteiras de bloco não contradizem limites de camada nem CX.  
3. Nenhum bloco absorve “escolha de meios” ou execução em L4.  
4. Matriz F1/F2/F3/PAT completa; conformidade F4-02 / D-F4 / N-F4.  
5. Zero tech/componentes/APIs/infra.

---

## 6. Restrições arquiteturais

* Não fundir RTB-Encaminhamento com RTB-Execução.  
* Não criar bloco de “toolbox / seletor de IA”.  
* Não alterar precedências F3-02 via agrupamento de blocos.  
* Exceções: N-F4-03.

---

## 7. Mapa canônico — blocos de responsabilidade (RTB)

### 7.1 Catálogo dos blocos

| ID | Bloco | Essência |
|----|-------|----------|
| **RTB-01** | Identidade de Contexto (Lente) | Qual COA está ativo; isolamento |
| **RTB-02** | Superfície de Comando | Atenção situacional + conversa como porta da intenção |
| **RTB-03** | Governança de Objetivos | Ciclo de vida + Foco executivo |
| **RTB-04** | Patrimônio de Conhecimento | Permanente: consulta, âncora, promoção seletiva |
| **RTB-05** | Encaminhamento de Meios | Pedido → decisão/encaminhamento invisível + gates |
| **RTB-06** | Execução e Efeito | Executar autorizado; efeito perceptível |
| **RTB-07** | Continuidade Temporal | Nova Atenção + continuidade entre sessões |
| **RTB-08** | Honestidade Situacional | Limites, incerteza, transitório ≠ permanente |

### 7.2 Relação blocos ↔ camadas

| Bloco | Camada(s) primária(s) | Camada(s) de apoio |
|-------|----------------------|--------------------|
| RTB-01 | **L0** | — |
| RTB-02 | **L1** | Tx (eco de renovação/honestidade) |
| RTB-03 | **L2** | L3 (âncora permanente) |
| RTB-04 | **L3** | L5 (candidato); Tx (retomada) |
| RTB-05 | **L4** | L1 (gate legível); L2 (pré-condições) |
| RTB-06 | **L5** | L1 (efeito); L3 (candidato a promoção) |
| RTB-07 | **Tx** | L0, L1, L2, L3 |
| RTB-08 | **Tx** | L1, L4, L5 (pontos críticos) |

```text
RTB-01 (L0)
    │
    ├── RTB-02 (L1) ◄──► RTB-03 (L2)
    │         │                │
    │         └──────► RTB-05 (L4) ──► RTB-06 (L5)
    │                       │              │
    └── RTB-04 (L3) ◄───────┴──────────────┘
              ▲
    RTB-07 / RTB-08 (Tx) ── atravessam ciclo e tempo
```

### 7.3 Responsabilidades e fronteiras por bloco

#### RTB-01 — Identidade de Contexto

| Compete | Não compete |
|---------|-------------|
| Estabelecer/exibir COA ativo; isolar patrimônios | Conteúdo de atenção; governança de objetivos; execução |

**CX:** CX-01 · **PAT:** PAT-05, PAT-07

#### RTB-02 — Superfície de Comando

| Compete | Não compete |
|---------|-------------|
| Quadro de Atenção; conversa como interface principal; acolher intenção e atos do usuário | Ciclo de vida/Foco (RTB-03); permanente amplo (RTB-04); encaminhar/executar |

**CX:** CX-03, CX-05 · **PAT:** PAT-01, PAT-08

#### RTB-03 — Governança de Objetivos

| Compete | Não compete |
|---------|-------------|
| Declarar/conduzir objetivo-intenção; criar/ativar/suspender/retomar/concluir/cancelar; ordenar Foco | Meios; execução; promoção; ser a home conversacional |

**CX:** CX-04, CX-08, CX-09 · **PAT:** PAT-09

#### RTB-04 — Patrimônio de Conhecimento

| Compete | Não compete |
|---------|-------------|
| Consultar/ancorar permanente; promoção seletiva Transitório→Permanente | Executar; orquestrar; arquivar plano de meios / andamento bruto por padrão |

**CX:** CX-07, CX-13 · **PAT:** PAT-03, PAT-04

#### RTB-05 — Encaminhamento de Meios

| Compete | Não compete |
|---------|-------------|
| Pedido de meios; decisão/encaminhamento invisível; gates (autorizar/rejeitar) | Executar (RTB-06); expor seletor de ferramentas; gravar plano como permanente |

**CX:** CX-10, CX-11 · **PAT:** PAT-01, PAT-02, PAT-10

#### RTB-06 — Execução e Efeito

| Compete | Não compete |
|---------|-------------|
| Executar ação autorizada; efeito/bloqueio em linguagem de comando | Escolher meios; promover ao permanente; substituir Atenção |

**CX:** CX-12 · **PAT:** PAT-02, PAT-04

#### RTB-07 — Continuidade Temporal

| Compete | Não compete |
|---------|-------------|
| Nova Atenção pós-atualização; restaurar estado governado entre sessões | Suspender/concluir por logout; reexecutar automaticamente |

**CX:** CX-14, CX-15 · **PAT:** PAT-03, PAT-08

#### RTB-08 — Honestidade Situacional

| Compete | Não compete |
|---------|-------------|
| Explicitar limites, incerteza, “não posso”, transitório ainda não consolidado | Fingir conclusão; esconder gate; expor orquestração |

**CX:** CX-16 · **PAT:** PAT-11

### 7.4 Matriz bloco ↔ CX (cobertura MVP-A)

| CX | Bloco(s) |
|----|----------|
| CX-01 | RTB-01 |
| CX-03, CX-05 | RTB-02 |
| CX-04, CX-08, CX-09 | RTB-03 |
| CX-07, CX-13 | RTB-04 |
| CX-10, CX-11 | RTB-05 |
| CX-12 | RTB-06 |
| CX-14, CX-15 | RTB-07 |
| CX-16 | RTB-08 |

Nenhuma CX do MVP-A fica órfã; nenhum bloco introduz CX evolutiva.

### 7.5 Fronteiras críticas entre blocos

| Fronteira | Regra |
|-----------|-------|
| RTB-05 ∣ RTB-06 | Encaminhar ≠ executar (PAT-02) |
| RTB-06 ∣ RTB-04 | Efeito ≠ promoção (PAT-04) |
| RTB-02 ∣ RTB-05 | Pedido de cumprimento ≠ seletor de meios (PAT-01) |
| RTB-03 ∣ RTB-01 | Objetivo/Foco ≠ COA (G-03) |
| RTB-07 ∣ RTB-03 | Sessão ≠ ciclo de vida (G-04) |
| RTB-08 ∣ todos | Honestidade transversal; não substitui donos de bloco |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001 → RTB-05; DA-002 → RTB-04/07; DA-003 → RTB-01 | Diretrizes |
| **F2** | D1–D5; ciclo; T≠P; D4≠D5; governança | Conceito |
| **F3** | CX por bloco §7.4; F3-02 | Funcional |
| **PAT** | Mapeados por bloco §7.3 | Princípios |
| **F4** | F4-05 camadas; Fundação Estrutural | Estrutura |
| **PX/IX** | IX-01/03/04/05/06/07/09; PX-02/06/08 | Invariantes |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-06 — Mapa de Responsabilidades; F4-05 homologada |
| Baseado em quê | F4-05; F4-04; PAT; F3; F4-02 |
| Resultado | F4-06 **homologada**; RTB referência obrigatória de componentização; Fundação Organizacional; F4-07 aberta |
