# F4-07 — Modelo Canônico de Componentização

> **Status: Homologada — Gate F4-07 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16 · RTB-01…RTB-08  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Camadas / RTB:** F4-05 · F4-06 — **obrigatórios**  
> **Força:** este Modelo de Componentização = **obrigatório** para toda definição de componentes arquiteturais.  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios:** PAT-01…PAT-12  
> **Marco:** [`marco-fundacao-componentizacao-arquitetura-tecnica.md`](marco-fundacao-componentizacao-arquitetura-tecnica.md)  
> **Proibições:** sem inventário neste registro; sem tecnologias; sem APIs; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir o **Modelo Canônico de Componentização**: critérios e regras normativas para **decompor** blocos RTB em **componentes lógico-técnicos** — granularidade, responsabilidade única, dependências, composição/reutilização e rastreabilidade — **sem** nomear tecnologias, APIs, infraestrutura ou implementar.

Este artefato responde: *como é lícito componentizar?* — não *quais componentes existem*.

**Definição operacional (neste modelo):** um **componente** é uma unidade lógico-técnica de responsabilidade única, confinada a um RTB (e à(s) sua(s) camada(s)), rastreável a CX — ainda **independente** de artefato de código, pacote ou serviço de runtime.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Critérios normativos de decomposição RTB → componentes.  
* Regras de granularidade e responsabilidade única.  
* Dependências permitidas/proibidas entre componentes.  
* Critérios de composição e reutilização.  
* Requisitos obrigatórios de rastreabilidade (componente → RTB → camada → CX → PAT/F1–F3).  
* Orientar F4-08+ (catálogos/especificações de componentes *sob* estas regras).

### Não compete a este artefato

* Listar ou batizar componentes concretos do MVP-A.  
* Escolher stack, frameworks, containers ou vendors (PAT-12).  
* Definir APIs, schemas, tópicos ou topologia.  
* Alterar RTB, camadas, CX ou PAT.  
* UX/UI / design system (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| RTB-01…08 + fronteiras | Entrada | Permanente | F4-06 |
| L0–L5, Tx, C1–C10 | Entrada | Permanente | F4-05 |
| PAT / DA / CX | Entrada | Permanente | F4-03; F1; F3 |
| Critérios CMP / regras G / dependências D | Saída | Permanente (norma) | F4-08+ |
| Matriz mínima de rastreio por componente | Saída | Permanente | Gates de componentização |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-06 (RTB obrigatório) | → estrutural |
| Depende de | F4-05 (camadas; comunicação) | → estrutural |
| Depende de | F4-01…04; F3 | → estrutural |
| É pré-requisito de | F4-08+ (componentes sob o modelo) | → |
| Relacionada | F4-02 (estrutura de artefato técnico) | ↔ — specs de componente futuras usam F4-02 + este modelo |

---

## 5. Critérios de validação técnica

1. Critérios CMP cobrem decomposição, granularidade, dependências, composição e rastreio.  
2. Nenhuma regra autoriza violar F4-05 §7.3 ou fronteiras RTB (F4-06).  
3. Modelo não introduz tech/API/infra nem inventário de componentes.  
4. Rastreabilidade F1/F2/F3/PAT explícita; conformidade F4-02 / D-F4 / N-F4.  
5. Exceções só via N-F4-03.

---

## 6. Restrições arquiteturais

* Proibido componentizar *antes* de citar RTB + camada + CX.  
* Proibido um componente atravessar a fronteira RTB-05 ∣ RTB-06 (encaminhar/executar).  
* Proibido componente cuja responsabilidade seja “escolher meio/ferramenta/IA”.  
* Proibido reutilizar componente de um COA como se compartilhasse permanente com outro (PAT-07).  
* Exceções: deliberação formal (N-F4-03).

---

## 7. Modelo canônico de componentização

### 7.1 Critérios normativos de decomposição (CMP)

Um RTB **só** pode ser decomposto em componentes se cada candidato satisfizer **todos** os critérios:

| ID | Critério | Enunciado |
|----|----------|-----------|
| **CMP-01** | Pertinência ao RTB | O componente realiza fatia **estrita** de um único RTB-01…08; não mistura dois RTB. |
| **CMP-02** | Confinamento de camada | Opera apenas na(s) camada(s) mapeada(s) ao seu RTB (F4-06 §7.2); não “fura” L4↔L5. |
| **CMP-03** | Realização de CX | Cita uma ou mais CX do MVP-A **já** ligadas ao RTB; não inventa capacidade. |
| **CMP-04** | Responsabilidade única | Uma frase de responsabilidade; tudo fora dela é *Não compete* explícito. |
| **CMP-05** | Testabilidade conceitual | Critérios de conclusão inspecionáveis sem código (análogo a F3-03 / F4-02). |
| **CMP-06** | Primazia funcional | Não redefine CX/precedência; traduz (D-F4-01/02; PAT-06). |
| **CMP-07** | Independência tecnológica | Descrição válida sem nomear linguagem, cloud, broker ou UI kit (PAT-12). |

**Regra de abertura:** decomposição de um RTB é **facultativa** até deliberação de F4-08+; quando ocorrer, CMP-01…07 são **obrigatórios**.

---

### 7.2 Granularidade e responsabilidade única

| ID | Regra |
|----|-------|
| **G1** | **Um componente = uma responsabilidade.** Se forem necessários “e” na frase de responsabilidade, separar ou justificar deliberação. |
| **G2** | Preferir o **menor** conjunto de componentes que cubra o RTB sem fragmentação inútil (não criar componente por verbo técnico de infra). |
| **G3** | Não criar componente só para “passar dados” entre camadas — comunicação segue C1–C10 (F4-05); componentes **realizam** atos/estados, não tubos. |
| **G4** | Componentes de **Tx** (RTB-07/08) são transversais no *uso*, mas mantêm responsabilidade única (renovação/restauração **ou** honestidade — não ambos no mesmo componente sem deliberação). |
| **G5** | Granularidade **não** segue organograma de times nem pastas de repositório — segue RTB/CX. |
| **G6** | Se dois candidatos compartilham a mesma responsabilidade, **fundir**; se um candidato cobre duas fronteiras críticas (ex.: encaminhar+executar), **rejeitar**. |

---

### 7.3 Dependências permitidas entre componentes

| ID | Regra |
|----|-------|
| **D1** | Dependência entre componentes **só** é lícita se a dependência entre seus RTB/camadas for **permitida** em F4-05 §7.2 e não constar em §7.3. |
| **D2** | Dependência **acíclica** no grafo de componentes de um mesmo fluxo de ciclo (salvo deliberação). |
| **D3** | Componente de RTB-05 **não** depende de componente de RTB-06 para “decidir meios”; RTB-06 **não** depende de RTB-05 para executar além do encaminhamento já consumido. |
| **D4** | Componentes leem permanente via RTB-04; não gravam plano de orquestração como patrimônio. |
| **D5** | Todo componente que muta permanente ou estado governado declara dependência de RTB-01 (lente COA). |
| **D6** | Tipos de dependência (documentação): estrutural → / ciclo ⇒ / governança ⇢ / transversal ↔ — espelho F3-02 / F4-05. |

**Proibidas (além de F4-05 §7.3):** dependência de componente “seletor de meios”; dependência que misture permanentes de COAs distintos; dependência oculta (sem rastreio).

---

### 7.4 Composição e reutilização

| ID | Critério |
|----|----------|
| **R1** | **Composição** agrega componentes sob o mesmo RTB ou sob fluxo de ciclo permitido (L1→L4→L5→L3→Tx) sem criar novo RTB ad hoc. |
| **R2** | **Reutilização** só entre contextos que preservem L0 (mesmo tipo de obrigação sob COA ativo); reutilizar não implica compartilhar permanente entre COAs. |
| **R3** | Componente reutilizável declara **invariantes** (IX/PAT) que o consumidor não pode violar. |
| **R4** | Proibido “reutilizar” componente de execução como atalho de encaminhamento (ou o inverso). |
| **R5** | Composição não autoriza contornar gates (RTB-05 / CX-11). |
| **R6** | Evolutivas (CX-02/06/17/18) não entram em composição MVP-A sem deliberação. |

---

### 7.5 Rastreabilidade obrigatória de cada componente

Todo componente futuro (F4-08+) **deve** expor, no mínimo:

| Eixo | Obrigatório | Conteúdo |
|------|-------------|----------|
| **ID do componente** | Sim | `CMP-nnn` ou convenção homologada em artefato posterior — estável |
| **RTB** | Sim | Exatamente um de RTB-01…08 |
| **Camada(s)** | Sim | Subconjunto de L0–L5 / Tx conforme F4-06 |
| **CX** | Sim | Uma ou mais CX do MVP-A ligadas ao RTB |
| **PAT** | Sim | PAT aplicáveis (mínimo os do RTB em F4-06) |
| **F1** | Sim | DA pertinente ou N/A justificado |
| **F2** | Sim | D1–D5 / mecanismo (ciclo, T≠P, etc.) |
| **F3** | Sim | F3-02/04 + specs CX |
| **F4** | Sim | F4-05, F4-06, F4-07 (este modelo) |
| **Dependências** | Sim | Componentes/RTB alvo + tipo D6 |
| **Não compete** | Sim | Fronteiras explícitas |

**Matriz mínima (obrigatória em toda spec de componente):**

| Componente | RTB | Camada(s) | CX | PAT | DA | Dependências |
|------------|-----|-----------|----|-----|-----|--------------|
| … | … | … | … | … | … | … |

Ausência de linha completa = componente **não oficial**.

---

### 7.6 Relação com artefatos posteriores

```text
F4-06 RTB (o quê organizar)
  → F4-07 Componentização (como decompor)  ← este documento
    → F4-08+ Catálogo / specs de componentes (o quê existe, sob CMP/G/D/R)
      → ARQ-nnn / REQ / IMP (ADR-006) quando deliberado
```

---

## 8. Rastreabilidade (deste artefato)

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001…003 via PAT e proibições de seletor/meios | Diretrizes |
| **F2** | D4≠D5; T≠P; COA; C1–C10 (via F4-05) | Conceito |
| **F3** | CX via RTB; F3-02 | Funcional |
| **PAT** | PAT-01,02,04,06,07,12 (núcleo do modelo); demais via RTB | Princípios |
| **F4** | F4-05/06; Fundação Organizacional | Base |
| **N-F4** | N-F4-01…03 | Normas |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-07 — Modelo de Componentização; F4-06 homologada |
| Baseado em quê | F4-06; F4-05; PAT; F4-02; D-F4/N-F4 |
| Resultado | F4-07 **homologada**; componentização obrigatória; Fundação de Componentização; F4-08 aberta |
