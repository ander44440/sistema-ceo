# F4-03 — Princípios Arquiteturais da Arquitetura Técnica

> **Status: Homologada — Gate F4-03 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16 (princípios transversais a todo o MVP-A)  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Diretrizes:** D-F4-01, D-F4-02, D-F4-03  
> **Normas:** N-F4-01, N-F4-02, N-F4-03  
> **Força:** **PAT-01…PAT-12** = Princípios Arquiteturais Técnicos **oficiais** do projeto.  
> **Marco:** [`marco-fundacao-normativa-arquitetura-tecnica.md`](marco-fundacao-normativa-arquitetura-tecnica.md)  
> **Proibições:** sem tecnologias; sem componentes; sem APIs; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir os **princípios arquiteturais técnicos permanentes (PAT)** que orientam todos os artefatos técnicos posteriores da F4 — derivados das **DA** homologadas em F1, alinhados à Fundação Conceitual (F2) e aderentes às capacidades funcionais homologadas (F3) — **sem** amarrar tecnologia, componente, API ou infraestrutura.

Este artefato **não** mapeia módulos; estabelece as **leis** às quais F4-04+ devem obedecer.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Derivar princípios técnicos permanentes a partir de **DA-001…003**.  
* Explicitar alinhamento a D1–D5, ciclo, Transitório/Permanente, governança e PX/IX (F2).  
* Explicitar aderência às CX do MVP-A (F3) sem alterar suas responsabilidades (D-F4-02).  
* Orientar estrutura, fronteiras e dependências dos artefatos F4 posteriores.  
* Permanecer independente de stack, vendor, API, infra e UI.

### Não compete a este artefato

* Escolher ou sugerir tecnologias, frameworks, bancos ou provedores.  
* Definir componentes, APIs, schemas ou topologia de implantação.  
* Produzir wireframes ou tokens de design (F5 / D-F4-03).  
* Alterar DA, PX, IX, CX ou precedências F3-02.  
* Substituir o Modelo Canônico (F4-02) — apenas o consome.  
* Promover HP-004/005/006 à força normativa plena.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| DA-001…003 | Entrada | Permanente (norma) | F1 / diretrizes |
| Fundação Conceitual (D1–D5, ciclo, governança, PX/IX) | Entrada | Permanente (norma) | F2 |
| Specs CX MVP-A + F3-02/04 | Entrada | Permanente (norma) | F3 |
| D-F4 / N-F4 / F4-02 | Entrada | Permanente (norma) | F4-01/02 |
| Conjunto PAT-01…PAT-12 | Saída | Permanente (norma técnica) | F4-04+; futuros ARQ/REQ |
| Matriz de aderência CX / DA / F2 | Saída | Permanente | Auditoria de gates F4 |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-02 (estrutura e validação) | → estrutural |
| Depende de | F4-01 (mandato / D-F4) | → estrutural |
| Depende de | DA-001…003 | → estrutural (F1) |
| Depende de | F2-01…F2-04 | → estrutural (F2) |
| Depende de | F3-01…F3-04 + specs CX MVP-A | → estrutural (F3) |
| É pré-requisito de | F4-04+ (mapas, fronteiras, módulos) | ⇢ / → |
| Relacionada | PX / IX | ↔ — princípios de experiência informam princípios técnicos |

---

## 5. Critérios de validação técnica

1. Cada PAT deriva de ao menos uma **DA** e/ou mecanismo F2 explícito.  
2. Cada PAT cita aderência a **CX** do MVP-A (ou transversal a todas) sem contradizer specs.  
3. Nenhum PAT introduz tecnologia, API, componente, infra ou UI.  
4. Estrutura F4-02 completa; rastreabilidade F1/F2/F3 explícita (N-F4-02).  
5. Conformidade D-F4-01…03 e N-F4-01…03.  
6. Conjunto PAT é suficiente para orientar F4-04+ sem reabrir F3.

---

## 6. Restrições arquiteturais

* Não alterar DA, CX ou precedências (D-F4-02).  
* Não promover HP-004/005/006 neste artefato.  
* Não detalhar módulos concretos (fica para F4-04+).  
* Não introduzir conteúdo de F5.  
* Exceção a qualquer PAT exige deliberação formal (N-F4-03), além de eventual emenda a este documento.

---

## 7. Princípios Arquiteturais Técnicos (PAT)

### 7.1 Derivação a partir das DA (F1)

#### PAT-01 — Intenção antes de encaminhamento de meios  
**Origem:** DA-001.  
**Enunciado:** Toda organização técnico-lógica trata **objetivo/intenção** como pré-condição do encaminhamento de meios; nenhum módulo existe para o usuário *escolher* ferramenta, modelo ou provedor.  
**F2:** D2→D4; O-01…O-04; PX-02; IX-03, IX-07.  
**F3:** CX-04 ≺ CX-10; CX-10 não expõe orquestração.

#### PAT-02 — Orquestração decide e encaminha; nunca executa  
**Origem:** DA-001 (meios como responsabilidade do CEO) + F2-02.  
**Enunciado:** O domínio lógico de orquestração **decide e encaminha**; a **execução** é exclusiva do domínio executor. Confundir os dois é violação arquitetural.  
**F2:** D4 ≠ D5; F-Exe.  
**F3:** CX-10/11 (encaminhamento/gate) ≠ CX-12 (execução/efeito).

#### PAT-03 — Patrimônio do COA sobrevive a tarefa, conversa e sessão  
**Origem:** DA-002.  
**Enunciado:** Estado e conhecimento **permanentes** do COA não se apagam ao concluir tarefa, encerrar conversa ou fechar sessão; logout ≠ ciclo de vida de objetivo.  
**F2:** Permanente vs Transitório; F2-03 §6; G-04.  
**F3:** CX-07, CX-13, CX-15; IX-04.

#### PAT-04 — Promoção seletiva ao permanente  
**Origem:** DA-002.  
**Enunciado:** Nem todo efeito ou contexto transitório torna-se patrimônio; a promoção é **julgamento seletivo**, não arquivamento automático (plano de orquestração e andamento bruto não são memória institucional por padrão).  
**F2:** F-Ret; §2.3.  
**F3:** CX-12 ≠ CX-13; CX-16 (honestidade pré-promoção).

#### PAT-05 — Níveis de abstração sem perda da lente  
**Origem:** DA-003.  
**Enunciado:** A arquitetura técnica deve **permitir** transição entre níveis de abstração do comando **sem** perder o COA ativo nem misturar patrimônios; zoom fino multi-nível rico pode ser evolutivo, mas a **obrigação de não perder a lente** já vale no MVP-A.  
**F2:** DA-003; D1↔D3.  
**F3:** CX-01 (lente); CX-06 evolutiva — não absorvida; isolamento IX-05.

### 7.2 Princípios estruturais permanentes (orientação a F4-04+)

#### PAT-06 — Primazia da Arquitetura Funcional  
**Enunciado:** Toda fatia técnico-lógica **realiza** CX homologadas; não as redefine (D-F4-01, D-F4-02).  
**F3:** F3-04; specs CX.

#### PAT-07 — Um COA ativo como premissa de isolamento  
**Enunciado:** Operações de leitura/escrita de permanente e de ciclo ocorrem sob **um COA ativo**; mistura entre COAs é proibida.  
**F2:** IX-01, IX-05.  
**F3:** CX-01; CX-02 evolutiva.

#### PAT-08 — Integridade do ciclo contínuo  
**Enunciado:** O arco Objetivo→Intenção→Contexto→Orquestração→Execução→Aprendizado→Atualização→Nova Atenção permanece a espinha dorsal; artefatos técnicos não “matam” o ciclo na tarefa.  
**F2:** F2-02; PX-06.  
**F3:** CX-04, 07, 10–14.

#### PAT-09 — Governança de objetivos antes de priorização de Foco  
**Enunciado:** Objetos de Foco são objetivos com **ciclo de vida**; Foco não cancela concorrentes nem confunde COA com objetivo.  
**F2:** F2-03; G-01…G-03.  
**F3:** CX-08 ≺ CX-09.

#### PAT-10 — Controle humano em risco (gates)  
**Enunciado:** Encaminhamento/execução sob risco, irreversibilidade ou ambiguidade **pausa** para autorização; gate não expõe meios.  
**F2:** O-03; IX-06.  
**F3:** CX-11.

#### PAT-11 — Honestidade de limites e estados  
**Enunciado:** Incerteza, “não posso” e transitório ainda não consolidado são obrigações técnico-lógicas perceptíveis nos pontos críticos — não cosmética.  
**F2:** PX-08; IX-09.  
**F3:** CX-16.

#### PAT-12 — Independência tecnológica neste estágio  
**Enunciado:** Princípios e artefatos F4 descrevem **obrigações lógicas**; não amarram linguagem, cloud, vendor ou protocolo. Amarras tecnológicas só por deliberação posterior (ADR-006/010).  
**Fundamento:** CON-001; ADR-010; F4-01.

---

### 7.3 Tabela-resumo PAT → F1 / F2 / F3

| PAT | DA (F1) | Âncoras F2 | CX / F3 (aderência) |
|-----|---------|------------|---------------------|
| PAT-01 | DA-001 | D2→D4; IX-03/07 | CX-04, CX-10 |
| PAT-02 | DA-001 | D4≠D5 | CX-10/11 vs CX-12 |
| PAT-03 | DA-002 | Permanente; G-04 | CX-07, 13, 15 |
| PAT-04 | DA-002 | F-Ret; T≠P | CX-12, 13, 16 |
| PAT-05 | DA-003 | Lente COA | CX-01 (CX-06 fora MVP-A) |
| PAT-06 | — (D-F4) | — | Todas CX MVP-A |
| PAT-07 | — | IX-01/05 | CX-01 |
| PAT-08 | DA-002 | Ciclo F2-02 | CX-04, 07, 10–14 |
| PAT-09 | — | F2-03 | CX-08, 09 |
| PAT-10 | — | O-03; IX-06 | CX-11 |
| PAT-11 | — | PX-08; IX-09 | CX-16 |
| PAT-12 | — | CON/ADR-010 | Transversal F4 |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001, DA-002, DA-003 | Derivação direta PAT-01…05 |
| **F2** | F2-01 D1–D5; F2-02 ciclo/T≠P/D4≠D5; F2-03 governança; F2-04 PX/IX | Alinhamento conceitual |
| **F3** | F3-02; F3-04; CX-01, 03–05, 07–16 | Aderência obrigatória; sem alteração de responsabilidades |
| **F4** | F4-01; F4-02; D-F4-01…03; N-F4-01…03 | Mandato, canônico, normas |
| **PX** | PX-02, 06, 07, 08 | Experiência → obrigação técnica |
| **IX** | IX-01, 03, 04, 05, 06, 07, 09 | Invariantes preservados na técnica |
| **HP** | HP-004/005/006 | Apenas informativo — não promovidos |
| **Este artefato** | PAT-01…PAT-12 | Princípios permanentes da F4 |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-03 — Princípios Arquiteturais Técnicos; F4-02 homologada; N-F4 |
| Baseado em quê | F4-02; DA-001…003; F2; F3 MVP-A; D-F4 / N-F4 |
| Resultado | F4-03 **homologada**; PAT-01…12 oficiais; Fundação Normativa consolidada; F4-04 aberta |
