# F5-07 — Arquitetura Canônica de Superfícies

> **Status: Homologada — Gate F5-07 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** AX · INT · NAV · CX MVP-A · FLX-01…06 · PUX-01…12 · CMP (rastreio)  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **NAV / ACI-X / AX:** F5-06 · F5-05 · F5-04 — **obrigatórias**  
> **Força:** **SRF** (SRF-T · SRF-R · SRF-C) = **referência obrigatória** para toda **composição arquitetural das superfícies** da F5.  
> **Diretrizes / Normas / PUX:** D-F5-01…03 · N-F5-01…03 · PUX-01…12  
> **Marco:** [`marco-base-arquitetural-ux-ui.md`](marco-base-arquitetural-ux-ui.md)  
> **Proibições neste registro:** sem layouts; sem wireframes; sem design visual; sem design system; sem componentes gráficos; sem implementação; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir a **Arquitetura Canônica de Superfícies (SRF)** do MVP-A: tipos canônicos de superfícies de interação, responsabilidades arquiteturais, relações entre superfícies, continuidade/consistência e preservação do **AX-COA** — com rastreio a **AX**, **INT**, **NAV**, **PUX**, **F3** e **F4**.

**Superfície**, neste artefato, é um **papel experiencial** (onde certas INT/NAV ocorrem) — **não** uma tela, layout ou componente gráfico.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Tipificar superfícies canônicas (SRF-T).  
* Definir responsabilidades e fronteiras de cada superfície.  
* Definir relações arquiteturais entre superfícies (SRF-R).  
* Definir continuidade/consistência (SRF-C) e preservação AX-COA.  
* Manter rastreabilidade AX / INT / NAV / PUX / F3 / F4.

### Não compete a este artefato

* Layouts, wireframes, design visual ou design system.  
* Componentes gráficos, tokens ou composição visual.  
* Inventário de telas nomeadas de produto.  
* Código, stack ou implementação (D-F5-03).  
* Alterar AX, INT, NAV, PUX, CX ou FLX.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| NAV (percursos, estados) | Entrada | Permanente | F5-06 |
| INT / IEV / IRT / IRS | Entrada | Permanente | F5-05 |
| AX / AX-COA | Entrada | Permanente | F5-04 |
| PUX; CX; FLX; CMP | Entrada | Permanente | F5-03; F3; F4 |
| Tipos SRF-T · relações SRF-R · critérios SRF-C | Saída | Permanente | F5 posteriores (se deliberados); auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-06 (NAV) — **obrigatória** | → estrutural |
| Depende de | F5-05 (INT); F5-04 (AX) | → estrutural |
| Depende de | F5-03; F3; F4 | → estrutural |
| É pré-requisito de | F5 posteriores **somente** se CTO autorizar | ⇢ |
| Relacionada | NAV-P / INT | ↔ — superfície hospeda percursos/atos, não os redefine |

---

## 5. Critérios de validação da experiência arquitetural

1. Cada SRF-T cita INT, NAV-P e CX (e CMP quando aplicável).  
2. Relações SRF-R não violam IRT, NAV-X nem AX.  
3. Nenhuma superfície é “seletor de meios”.  
4. Conversa permanece centro; demais superfícies são apoio (PUX-12).  
5. AX-COA preservado em todas as superfícies.  
6. Zero layout/wireframe/design visual/design system/componentes gráficos/código.  
7. Conformidade F5-02, D-F5, PUX, AX, INT, NAV.

---

## 6. Restrições arquiteturais

* Superfície ≠ tela ≠ layout.  
* Relação entre superfícies ≠ navegação visual (menus/tabs).  
* Exceções: N-F5-03.

---

## 7. Arquitetura Canônica de Superfícies (SRF)

### 7.1 Tipos canônicos de superfícies (SRF-T)

| ID | Superfície | Papel arquitetural | INT | NAV-P | CX | CMP (rastreio) |
|----|------------|-------------------|-----|-------|----|----------------|
| **SRF-T01** | Lente / COA | Estabelecer e manter o COA ativo | INT-01, 11 | P01, P06 | CX-01 | CMP-001 |
| **SRF-T02** | Atenção | Projetar o quadro situacional (o que exige atenção) | INT-02 | P02, P08 | CX-03, 09 | CMP-002 |
| **SRF-T03** | Conversa | Interface principal de intenção e atos do utilizador | INT-03…06, 10 | P02, P03, P07 | CX-05 (+04/11/16) | CMP-003 |
| **SRF-T04** | Intenção / Objetivos | Declarar e governar objetivos, vida e Foco | INT-03, 04 | P02, P08 | CX-04, 08, 09 | CMP-004…006 |
| **SRF-T05** | Âncora / Conhecimento | Consultar permanente do COA que ancora a intenção | INT-03 (ancoragem) | P02 | CX-07 | CMP-007 |
| **SRF-T06** | Cumprimento | Pedir cumprimento e perceber andamento **sem** expor meios | INT-05, (S04 invisível) | P03 | CX-10 | CMP-009/010 |
| **SRF-T07** | Gate | Autorizar/rejeitar sob risco | INT-06 | P03 | CX-11 | CMP-011 |
| **SRF-T08** | Efeito | Tornar efeito/bloqueio perceptível | INT-07 | P03, P04 | CX-12 | CMP-012 |
| **SRF-T09** | Renovação | Candidato, promoção seletiva, Nova Atenção | INT-08 | P04 | CX-13, 14 | CMP-008, 013 |
| **SRF-T10** | Continuidade | Encerrar/restaurar sessão sob permanente | INT-09 | P05 | CX-15 | CMP-013 |
| **SRF-T11** | Honestidade | Explicitar limites/incerteza/não consolidado | INT-10 | P07 | CX-16 | CMP-014 |

**Não existe SRF canônica de “catálogo de meios / escolha de IA”.**

---

### 7.2 Responsabilidades arquiteturais por superfície

| SRF | Compete | Não compete |
|-----|---------|-------------|
| **T01** | Ativar/confirmar/trocar COA; sinalizar lente vigente | Misturar patrimônios; escolher meios |
| **T02** | Situar atenção e Foco perceptível | Governar ciclo de vida (T04); executar |
| **T03** | Conduzir diálogo; receber atos INT; ser centro | Virar formulário de meios; substituir T02/T04 |
| **T04** | Intenção, vida de objetivos, ordenação de Foco | Encaminhar meios; promover patrimônio |
| **T05** | Expor âncora permanente relevante | Arquivar tudo automaticamente; executar |
| **T06** | Aceitar pedido de cumprimento; ocultar orquestração | Expor seletor de meios; executar |
| **T07** | Pausar para autorização humana | Expor meios; executar se rejeitado |
| **T08** | Tornar efeito perceptível | Reencaminhar meios; promover por padrão |
| **T09** | Renovar atenção; candidatar promoção seletiva | Promover plano bruto de orquestração por padrão |
| **T10** | Continuidade entre sessões | Suspender/cancelar objetivos por logout |
| **T11** | Honestidade situacional | Substituir T07; autorizar execução |

---

### 7.3 Relações arquiteturais entre superfícies (SRF-R)

| ID | Relação | De → Para | Tipo | Norma |
|----|---------|-----------|------|-------|
| **SRF-R01** | Lente pré-condiciona | T01 → todas | → estrutural | Sem T01 vigente, demais inválidas |
| **SRF-R02** | Conversa é centro | T03 ↔ T02, T04, T06, T07, T08, T11 | ↔ | Apoios contextualizam; não competem (PUX-12) |
| **SRF-R03** | Atenção alimenta intenção | T02 ↔ T04 | ↔ / ⇒ ciclo | NAV-P02 |
| **SRF-R04** | Âncora sustenta intenção | T05 → T04 / T03 | → | CX-07 |
| **SRF-R05** | Intenção precede cumprimento | T04 → T06 | ⇒ | IRT-02; NAV-P03 |
| **SRF-R06** | Cumprimento pode exigir gate | T06 → T07 → T08 | ⇒ | IRT-04/05 |
| **SRF-R07** | Cumprimento sem gate | T06 → T08 | ⇒ | quando O-03 ausente |
| **SRF-R08** | Efeito alimenta renovação | T08 → T09 → T02 | ⇒ | NAV-P04 |
| **SRF-R09** | Continuidade envolve todas | T10 ↔ T01…T05, T11 | ↔ | NAV-P05; sem autoexecução |
| **SRF-R10** | Troca de COA reinicia | T01 (INT-11) ⇢ T02…T09 | ⇢ | Encerra trechos do COA anterior |
| **SRF-R11** | Honestidade overlay | T11 ↔ T03, T06…T10 | ↔ transversal | Não substitui donos |
| **SRF-R12** | Orquestração invisível | T06 não relaciona a superfície de meios | — | IEV-S04 sem SRF |

```text
T01 (lente)
  └── T03 (conversa) ◄──► T02 (atenção) ◄──► T04 (intenção) ◄── T05 (âncora)
                              │
                              ▼
                           T06 ──► T07? ──► T08 ──► T09 ──► T02
                              │
                         T11 (overlay) · T10 (sessão)
```

---

### 7.4 Continuidade e consistência

| ID | Critério | Enunciado |
|----|----------|-----------|
| **SRF-C01** | Continuidade de lente | T01 permanece implícita em T02…T11 no mesmo COA |
| **SRF-C02** | Continuidade de ciclo | T08→T09→T02 reabre P02; tarefa ≠ fim do COA |
| **SRF-C03** | Continuidade de sessão | T10 restaura T01 antes de T02/T04; permanente intacto |
| **SRF-C04** | Consistência de centro | T03 não é rebaixada a apoio de inventário |
| **SRF-C05** | Consistência de intenção≺meios | T06 nunca precede T04 no percurso canônico que exige objetivo |
| **SRF-C06** | Consistência D4≠D5 | Não existe superfície de orquestração escolhível; T08 ≠ T06 |
| **SRF-C07** | Consistência de gate | T07 rejeitado bloqueia T08 no trecho |
| **SRF-C08** | Consistência PUX | Conformidade PUX-01…12 aplicáveis |
| **SRF-C09** | Consistência NAV/INT | Cada SRF-T só hospeda INT/NAV-P declarados |
| **SRF-C10** | Forma | Sem layout/wireframe/design visual/design system/componentes gráficos/código |

---

### 7.5 Preservação do AX-COA

| AX-COA | Nas superfícies |
|--------|-----------------|
| **01** | Todas as SRF-T02…T11 operam sob T01 (um COA) |
| **02** | Conteúdo de T02/T04/T05/T06… é sempre do COA ativo |
| **03** | Só T01 via INT-11 troca lente; T02…T09 do COA anterior não migram |
| **04** | T10 não apaga T05 permanente nem força atos de vida em T04 |
| **05** | Restauração: T10 → T01 → T02/T04 |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **AX** | AX-S; AX-COA; AX-C | Espaço de experiência |
| **INT** | INT-01…11; IRT; IRS | Atos hospedados |
| **NAV** | NAV-P; NAV-E; NAV-R | Percursos entre superfícies |
| **PUX** | PUX-01…12 | Princípios |
| **F3** | CX-01, 03–05, 07–16 | Capacidades |
| **F4** | FLX; CMP-001…014; MVA | Organização técnica |
| **F5** | F5-01…06 | Mandato → NAV |
| **Este** | SRF-T · SRF-R · SRF-C | Arquitetura de superfícies |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-07); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-07 — Arquitetura Canônica de Superfícies |
| Baseado em quê | NAV; INT; AX; PUX; CX; FLX; CMP |
| Resultado | F5-07 **homologada**; SRF = referência obrigatória da composição arquitetural de superfícies; Base Arquitetural da UX/UI consolidada; F5-08 aberta |
