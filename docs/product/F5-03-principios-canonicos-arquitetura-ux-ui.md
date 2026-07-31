# F5-03 — Princípios Canônicos da Arquitetura UX/UI

> **Status: Homologada — Gate F5-03 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16 (princípios transversais)  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **Diretrizes:** D-F5-01, D-F5-02, D-F5-03  
> **Normas:** N-F5-01, N-F5-02, N-F5-03  
> **Força:** **PUX-01…PUX-12** = referência **obrigatória** para toda decisão arquitetural de UX/UI.  
> **Marco:** [`marco-base-principiologica-arquitetura-ux-ui.md`](marco-base-principiologica-arquitetura-ux-ui.md)  
> **Proibições neste registro:** sem layouts; sem wireframes; sem design visual; sem sistema de design; sem mapas de superfície; sem arquitetura de telas; sem papéis de superfície; sem navegação; sem protótipos; sem código; sem implementação; sem commit neste registro.  
> **Nota de condução:** evolução da F5 sob deliberação progressiva do CTO — **não** abrir F5-04+ até autorização formal.

---

## 1. Objetivo do artefato

Definir os **princípios canônicos permanentes (PUX)** que orientam **toda** decisão de UX/UI na F5 — com rastreabilidade às **CX** do MVP-A e aderência às diretrizes da **F3** e da **F4** — **sem** amarrar layout, wireframe, design visual, sistema de design, código ou implementação.

Este artefato **não** define mapas, telas, papéis de superfície nem navegação; estabelece as **leis** às quais artefatos F5 posteriores (quando deliberados pelo CTO) devem obedecer.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Derivar princípios canônicos de UX/UI a partir de DA, P1–P6, PX/IX, PAT e D-F5.  
* Explicitar rastreio a **CX** do MVP-A e aderência a F3/F4 (FLX, MVA).  
* Cobrir clareza, continuidade, previsibilidade, consistência, redução de carga cognitiva, transparência e honestidade arquitetural.  
* Orientar decisões de UX/UI posteriores **sem** antecipar modelos de experiência.  
* Permanecer independente de layout, wireframe, design visual, design system, código e IMP.

### Não compete a este artefato

* Mapas de superfície, arquitetura de telas, papéis de superfície ou navegação.  
* Layouts, wireframes, tokens, paletas, tipografia, grid ou sistema de design.  
* Protótipos, mocks ou especificação visual.  
* Código, stack, APIs ou implementação (D-F5-03).  
* Alterar DA, PX, IX, PAT, CX, CMP, FLX ou MVA.  
* Substituir F5-02 — apenas o consome.  
* Antecipar F5-04+ sem deliberação do CTO.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| DA-001…003; P1–P6 | Entrada | Permanente | F1 / F0 |
| PX / IX (F2-04) | Entrada | Permanente | F2 |
| Specs CX MVP-A; F3-02/04 | Entrada | Permanente | F3 |
| PAT; FLX; MVA; F4-01…13 | Entrada | Permanente | F4 |
| D-F5 / N-F5 / F5-02 | Entrada | Permanente | F5-01/02 |
| Conjunto PUX-01…PUX-12 | Saída | Permanente (norma UX/UI) | F5 posteriores (quando deliberados) |
| Matriz PUX → CX / F3 / F4 | Saída | Permanente | Auditoria de gates F5 |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-02 (estrutura e validação) | → estrutural |
| Depende de | F5-01 (mandato / D-F5) | → estrutural |
| Depende de | F3 (CX; D-F5-01) | → estrutural |
| Depende de | F4 (FLX; MVA; D-F5-02) | → estrutural |
| Depende de | DA; P1–P6; PX/IX; PAT | → estrutural |
| É pré-requisito de | Artefatos F5 posteriores **somente** após deliberação CTO | ⇢ |
| Relacionada | MVA | ↔ — princípios devem permanecer validáveis documentalmente |

---

## 5. Critérios de validação da experiência arquitetural

1. Cada PUX deriva de ao menos uma **DA / P / PX / PAT / D-F5** explícita.  
2. Cada PUX cita aderência a **CX** do MVP-A (ou transversal) sem contradizer specs.  
3. Cada PUX respeita F4 (FLX/MVA) quando a fatia toca UI ou interação.  
4. Nenhum PUX introduz layout, wireframe, design visual, design system, código ou IMP.  
5. Nenhum PUX define mapa de superfície, tela, papel de superfície ou navegação.  
6. Estrutura F5-02 completa; rastreabilidade F3/F4 explícita (N-F5-02).  
7. Conformidade D-F5-01…03 e N-F5-01…03.

---

## 6. Restrições arquiteturais

* Não alterar DA, CX, CMP, FLX, MVA ou PAT.  
* Não antecipar modelos de experiência além de princípios (deliberação CTO).  
* Não introduzir conteúdo visual, de layout ou de implementação.  
* Exceção a qualquer PUX exige deliberação formal (N-F5-03), além de eventual emenda a este documento.

---

## 7. Princípios Canônicos (PUX)

### 7.1 Primazia normativa (F3 / F4)

#### PUX-01 — UX subordinada à Arquitetura Funcional  
**Origem:** D-F5-01.  
**Enunciado:** Toda decisão de **UX** realiza capacidades **CX** homologadas; não as redefine nem inventa obrigações fora do catálogo MVP-A.  
**F3:** F3-04; specs CX.  
**F4:** PAT-06.

#### PUX-02 — UI e interação subordinadas à Arquitetura Técnica  
**Origem:** D-F5-02.  
**Enunciado:** Toda decisão de **UI** e **interação** respeita organização técnica (CMP, FLX, IFA) e permanece **validável** pela MVA; não funde D4 e D5 nem expõe seletor de meios.  
**F4:** FLX-01…06; MVA; PAT-01, PAT-02.  
**F3:** CX-10 ≠ CX-12; CX-11.

### 7.2 Clareza e carga cognitiva

#### PUX-03 — Clareza antes de sofisticação  
**Origem:** P3; PX-01.  
**Enunciado:** A experiência privilegia o que o usuário **compreende de imediato**; complexidade só entra quando comprovadamente necessária à decisão.  
**F3:** Transversal MVP-A.  
**F1:** P3.

#### PUX-04 — Redução de carga cognitiva  
**Origem:** CON-001 princípio 1; P2; P6.  
**Enunciado:** Cada ato de uso deve minimizar burocracia, repetição e competição de estímulos; informação sem papel na decisão é ruído arquitetural.  
**F3:** CX-03 (atenção); CX-04 (intenção).  
**F2:** PX-05.

### 7.3 Continuidade e previsibilidade

#### PUX-05 — Continuidade do contexto e do ciclo  
**Origem:** DA-002; PAT-03; PAT-08.  
**Enunciado:** A experiência preserva o **permanente** do COA e a integridade do ciclo contínuo; logout, fim de conversa ou conclusão de tarefa **não** apagam patrimônio nem “matam” o ciclo.  
**F3:** CX-07, CX-13, CX-14, CX-15.  
**F4:** FLX-04, FLX-05.

#### PUX-06 — Previsibilidade do comportamento  
**Origem:** P1; PX-01.  
**Enunciado:** Diante das mesmas condições arquiteturais, a experiência deve reagir de modo **previsível**; surpresas de interação que violem FLX ou CX são falha.  
**F4:** FLX (comportamento integrado).  
**F3:** Ciclo O0…O5.

### 7.4 Consistência e intenção

#### PUX-07 — Consistência acima de variação local  
**Origem:** P5.  
**Enunciado:** Padrões de interação e de significado se repetem; variação local sem fundamento em CX/FLX é proibida.  
**Nota:** este princípio **não** autoriza, por si, um sistema de design visual — apenas a consistência de **comportamento e significado**.  
**F3/F4:** Transversal.

#### PUX-08 — Intenção antes de meios na experiência  
**Origem:** DA-001; PAT-01; PX-02.  
**Enunciado:** A experiência conduz à **intenção/objetivo** antes de qualquer percepção de meios; nunca abre pela escolha de ferramenta, modelo ou provedor.  
**F3:** CX-04 ≺ CX-10.  
**F4:** FLX-02, FLX-03.

### 7.5 Transparência e honestidade

#### PUX-09 — Transparência de estado e de controle  
**Origem:** P1; CON-001 princípio 8.  
**Enunciado:** O usuário deve perceber **onde está**, **o que está ativo** (COA/Foco) e **o que pode fazer em seguida**, sem estado oculto que prejudique o comando.  
**F3:** CX-01, CX-03, CX-09.  
**F4:** FLX-01, FLX-02.

#### PUX-10 — Honestidade arquitetural  
**Origem:** PAT-11; PX-08; CX-16.  
**Enunciado:** Limites, incerteza, “não sei / não posso” e estados ainda não consolidados são obrigações de experiência nos pontos críticos — não cosmética nem omissão.  
**F3:** CX-16.  
**F4:** FLX-06; CMP-014.

### 7.6 Independência e integridade do método

#### PUX-11 — Independência de forma visual e de implementação  
**Origem:** D-F5-03; ADR-006; PAT-12.  
**Enunciado:** Princípios e artefatos F5, neste estágio, descrevem **obrigações de experiência**; não amarram layout, wireframe, design visual, design system, stack ou código.  
**Governança:** ADR-006 / F6 para IMP.

#### PUX-12 — Primazia da conversa e da lente ativa  
**Origem:** VIS-007 / REQ-041; DA-003; PX-03; PX-04.  
**Enunciado:** A **conversa** permanece o centro da experiência; a **lente de um COA ativo** não se perde em nenhuma decisão de UX/UI do MVP-A.  
**F3:** CX-01, CX-05.  
**F4:** CMP-001, CMP-003; FLX-01.

---

### 7.3 Tabela-resumo PUX → F3 / F4

| PUX | Tema | CX / F3 | F4 / outros |
|-----|------|---------|-------------|
| PUX-01 | Primazia funcional | Todas CX MVP-A | PAT-06; D-F5-01 |
| PUX-02 | Primazia técnica | CX-10/11/12 | FLX; MVA; D-F5-02 |
| PUX-03 | Clareza | Transversal | P3 |
| PUX-04 | Carga cognitiva | CX-03, 04 | PX-05; P2/P6 |
| PUX-05 | Continuidade | CX-07, 13–15 | FLX-04/05; PAT-03/08 |
| PUX-06 | Previsibilidade | Ciclo O0…O5 | FLX |
| PUX-07 | Consistência | Transversal | P5 |
| PUX-08 | Intenção≺meios | CX-04, 10 | FLX-02/03; DA-001 |
| PUX-09 | Transparência | CX-01, 03, 09 | FLX-01/02; P1 |
| PUX-10 | Honestidade | CX-16 | FLX-06; PAT-11 |
| PUX-11 | Independência forma/IMP | — | D-F5-03; ADR-006 |
| PUX-12 | Conversa + COA | CX-01, 05 | CMP-001/003; FLX-01 |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001…003 | Diretrizes |
| **F0** | P1–P6 | Princípios de produto |
| **F2** | PX / IX (F2-04) | Experiência conceitual |
| **F3** | CX MVP-A; F3-02/04 | Capacidades (D-F5-01) |
| **F4** | PAT; FLX; MVA | Organização e validação (D-F5-02) |
| **F5** | F5-01; F5-02; D-F5; N-F5 | Mandato e canônico |
| **Este** | PUX-01…PUX-12 | Princípios canônicos UX/UI |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-03); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-03 — Princípios Canônicos da Arquitetura UX/UI |
| Baseado em quê | F5-01/02; DA; P1–P6; PX/IX; PAT; CX; FLX; MVA |
| Resultado | F5-03 **homologada**; PUX = referência obrigatória de UX/UI; Base Principiológica consolidada; F5-04+ bloqueados até autorização CTO; sem commit |
