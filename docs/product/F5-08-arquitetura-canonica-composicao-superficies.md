# F5-08 — Arquitetura Canônica de Composição de Superfícies

> **Status: Homologada — Gate F5-08 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** SRF-T01…11 · NAV · INT · AX · CX MVP-A · FLX · PUX  
> **Padrão:** [`F5-02-modelo-canonico-arquitetura-ux-ui.md`](F5-02-modelo-canonico-arquitetura-ux-ui.md) — **obrigatório**  
> **SRF:** [`F5-07-arquitetura-canonica-superficies.md`](F5-07-arquitetura-canonica-superficies.md) — **obrigatória**  
> **Força:** **CMP-S** (REG · COR · COC) = **referência obrigatória** para a **especificação das superfícies arquiteturais** da F5.  
> **NAV / ACI-X / AX:** F5-06 · F5-05 · F5-04 — **obrigatórias**  
> **Diretrizes / Normas / PUX:** D-F5-01…03 · N-F5-01…03 · PUX-01…12  
> **Marco:** [`marco-arquitetura-estrutural-ux-ui.md`](marco-arquitetura-estrutural-ux-ui.md)  
> **Proibições neste registro:** sem layouts finais; sem posicionamento visual; sem estilos; sem componentes gráficos; sem design system; sem implementação; sem commit neste registro.

---

## 1. Objetivo do artefato

Definir a **Arquitetura Canônica de Composição de Superfícies (CMP-S)** do MVP-A: **regiões arquiteturais**, papéis funcionais de cada região, regras de composição entre regiões, continuidade/consistência estrutural e preservação do **AX-COA** — com rastreio a **SRF**, **NAV**, **INT**, **AX**, **PUX**, **F3** e **F4**.

> Nota: **CMP-S** (composição de superfícies) ≠ **CMP-001…014** (componentes técnicos F4).

**Região**, neste artefato, é uma **zona de responsabilidade experiencial** na composição do posto — **não** posição em pixels, coluna, painel visual ou estilo.

---

## 2. Responsabilidades de experiência

### Compete a este artefato

* Definir regiões arquiteturais (REG).  
* Atribuir papéis funcionais e superfícies SRF hospedáveis por região.  
* Definir regras de composição (COR) entre regiões.  
* Definir continuidade/consistência estrutural (COC).  
* Garantir AX-COA na composição.  
* Manter rastreabilidade SRF / NAV / INT / AX / PUX / F3 / F4.

### Não compete a este artefato

* Layouts finais, grids visuais ou posicionamento espacial.  
* Estilos, tipografia, cor, espaçamento visual.  
* Componentes gráficos ou design system.  
* Wireframes ou protótipos.  
* Código, stack ou implementação (D-F5-03).  
* Alterar SRF, NAV, INT, AX, PUX, CX ou FLX.

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| SRF-T / SRF-R / SRF-C | Entrada | Permanente | F5-07 |
| NAV / INT / AX | Entrada | Permanente | F5-06…04 |
| PUX; CX; FLX | Entrada | Permanente | F5-03; F3; F4 |
| Regiões REG · regras COR · critérios COC | Saída | Permanente | F5 posteriores (se deliberados); auditoria |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F5-07 (SRF) — **obrigatória** | → estrutural |
| Depende de | F5-06 (NAV); F5-05 (INT); F5-04 (AX) | → estrutural |
| Depende de | F5-03; F3; F4 | → estrutural |
| É pré-requisito de | F5 posteriores **somente** se CTO autorizar | ⇢ |
| Relacionada | SRF-R02 (conversa centro) | ↔ — composição materializa primazia, sem layout |

---

## 5. Critérios de validação da experiência arquitetural

1. Cada REG cita SRF-T e INT/NAV aplicáveis.  
2. Regras COR não violam SRF-R, IRT, NAV-X nem AX.  
3. Região de conversa permanece centro; nenhuma região de meios.  
4. AX-COA preservado em toda composição.  
5. Zero layout final / posicionamento visual / estilo / componente gráfico / design system / código.  
6. Conformidade F5-02, D-F5, PUX, AX, INT, NAV, SRF.

---

## 6. Restrições arquiteturais

* Região ≠ painel visual ≠ coluna ≠ card.  
* Composição ≠ wireframe.  
* Exceções: N-F5-03.

---

## 7. Arquitetura Canônica de Composição (CMP-S)

### 7.1 Regiões arquiteturais (REG)

| ID | Região | Definição arquitetural | SRF hospedáveis | NAV / INT típicos |
|----|--------|------------------------|-----------------|-------------------|
| **REG-01** | Região de Lente | Zona de estabelecimento/sinalização do COA ativo | T01 | P01, P06 · INT-01, 11 |
| **REG-02** | Região de Atenção | Zona do quadro situacional (o que exige atenção) | T02 | P02, P08 · INT-02 |
| **REG-03** | Região de Conversa | Zona central de diálogo e atos do utilizador | T03 (+ atos de T04/T06/T07/T11 via conversa) | P02, P03, P07 · INT-03…06, 10 |
| **REG-04** | Região de Intenção | Zona de objetivos, vida e Foco | T04 | P02, P08 · INT-03, 04 |
| **REG-05** | Região de Âncora | Zona de permanente/conhecimento do COA | T05 | P02 · INT-03 (ancoragem) |
| **REG-06** | Região de Cumprimento | Zona de pedido/andamento de cumprimento **sem** meios | T06 | P03 · INT-05 |
| **REG-07** | Região de Gate | Zona de autorização humana | T07 | P03 · INT-06 |
| **REG-08** | Região de Efeito | Zona de efeito/bloqueio perceptível | T08 | P03, P04 · INT-07 |
| **REG-09** | Região de Renovação | Zona de candidato / Nova Atenção | T09 | P04 · INT-08 |
| **REG-10** | Região de Continuidade | Zona de encerramento/restauração de sessão | T10 | P05 · INT-09 |
| **REG-11** | Região de Honestidade | Zona overlay de limites (pode coexistir) | T11 | P07 · INT-10 |

**Não existe REG de catálogo de meios / escolha de IA.**

### 7.2 Papéis funcionais de cada região

| REG | Papel funcional | Primazia |
|-----|-----------------|----------|
| **REG-01** | Garantir lente única perceptível como premissa | Estrutural — pré-condição |
| **REG-02** | Situar “o que importa agora” | Apoio ao centro |
| **REG-03** | Conduzir a interação principal | **Centro** (PUX-12) |
| **REG-04** | Tornar intenção/Foco governáveis | Apoio ao centro |
| **REG-05** | Tornar permanente consultável/ancorável | Apoio ao centro |
| **REG-06** | Aceitar cumprimento sem expor orquestração | Situacional (P03) |
| **REG-07** | Concentrar decisão de gate | Situacional (O-03) |
| **REG-08** | Concentrar percepção de efeito | Situacional (P03/P04) |
| **REG-09** | Concentrar renovação do ciclo | Situacional (P04) |
| **REG-10** | Concentrar continuidade temporal | Situacional (P05) |
| **REG-11** | Concentrar honestidade sem substituir donos | Overlay |

---

### 7.3 Regras arquiteturais de composição (COR)

| ID | Regra | Enunciado |
|----|-------|-----------|
| **COR-01** | Lente sempre composta | Toda composição válida do posto inclui **REG-01** (explícita ou como premissa vigente AX-S1+) |
| **COR-02** | Centro obrigatório | Toda composição de trabalho ativo inclui **REG-03** como região central de interação |
| **COR-03** | Apoios não usurpam centro | REG-02/04/05 contextualizam REG-03; não a substituem nem a rebaixam a inventário |
| **COR-04** | Composição de orientação | Em NAV-P02/P08: REG-01 + REG-03 + (REG-02 e/ou REG-04) + REG-05 quando âncora for necessária |
| **COR-05** | Composição de cumprimento | Em NAV-P03: REG-03 permanece; REG-06 entra; REG-07 só se O-03; REG-08 após autorização ou sem gate |
| **COR-06** | Gate não coexiste com efeito no mesmo trecho rejeitado | Se REG-07 rejeita, REG-08 **não** entra nesse trecho |
| **COR-07** | Composição de renovação | Em NAV-P04: REG-08 → REG-09 → retorno a composição de orientação (REG-02/03) |
| **COR-08** | Composição de sessão | Em NAV-P05: REG-10 ativa; demais regiões de cumprimento **não** autoexecutam na restauração |
| **COR-09** | Troca de COA | REG-01 (INT-11) reinicia; regiões de conteúdo do COA anterior **não** permanecem compostas no novo COA |
| **COR-10** | Overlay de honestidade | REG-11 pode compor-se com qualquer REG-02…10 **sem** criar REG de meios |
| **COR-11** | Exclusão de meios | Nenhuma composição pode introduzir região de escolha de ferramentas/IAs |
| **COR-12** | Unicidade de cumprimento visível | REG-06 e REG-08 não se apresentam como “orquestração escolhível”; encaminhamento permanece fora de região |
| **COR-13** | Densidade arquitetural | Em um momento, privilegiar o mínimo de regiões situacionais (06–10) necessário ao NAV-P ativo — reduzir carga (PUX-04) |
| **COR-14** | Subordinação SRF | Só se compostam SRF-T declarados; relações respeitam SRF-R01…12 |

```text
Composição-base (orientação):
  REG-01 + REG-03*[centro] + REG-02 + REG-04 + REG-05?

Cumprimento (situacional):
  … + REG-06 + REG-07? + REG-08

Renovação / Sessão / Honestidade:
  REG-09 · REG-10 · REG-11(overlay)

* = centro obrigatório em trabalho ativo
```

---

### 7.4 Continuidade e consistência estrutural (COC)

| ID | Critério | Enunciado |
|----|----------|-----------|
| **COC-01** | Continuidade de lente | REG-01 não “desaparece” semanticamente ao longo de P02–P04 no mesmo COA |
| **COC-02** | Continuidade de centro | REG-03 permanece na composição durante P02–P03–P04 (atos podem migrar, centro não some) |
| **COC-03** | Continuidade de ciclo | Saída de REG-08/09 devolve à composição de orientação — não a inventário sem atenção |
| **COC-04** | Continuidade de sessão | REG-10 → reafirma REG-01 antes de REG-02/04 |
| **COC-05** | Consistência SRF | Cada REG só hospeda SRF-T da tabela §7.1 |
| **COC-06** | Consistência NAV/INT | Entrada/saída de regiões situacionais segue NAV-P e IRT |
| **COC-07** | Consistência D4≠D5 | Nenhuma composição equipara REG-06 a execução nem cria região de meios |
| **COC-08** | Consistência PUX | PUX-03, 04, 07, 08, 12 (clareza, carga, consistência, intenção, conversa+COA) |
| **COC-09** | Consistência AX-COA | Ver §7.5 |
| **COC-10** | Forma | Sem layout final, posicionamento visual, estilos, componentes gráficos, design system, código |

---

### 7.5 Preservação do AX-COA

| AX-COA | Na composição |
|--------|---------------|
| **01** | Composição válida ⇒ um COA; REG-01 vigente |
| **02** | REG-02…09 exibem/operam só conteúdo do COA ativo |
| **03** | Troca via REG-01: composição de conteúdo anterior não migra |
| **04** | REG-10 não implica esvaziar REG-05 nem atos de vida em REG-04 |
| **05** | Restauração: REG-10 → REG-01 → REG-02/03/04 |

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **SRF** | SRF-T; SRF-R; SRF-C | Superfícies compostas |
| **NAV** | NAV-P; NAV-E; NAV-R | Quando regiões entram/saem |
| **INT** | INT; IRT; IRS | Atos por região |
| **AX** | AX-S; AX-COA | Espaço de experiência |
| **PUX** | PUX-01…12 | Princípios |
| **F3** | CX MVP-A | Capacidades |
| **F4** | FLX; CMP-001…014; MVA | Organização técnica |
| **F5** | F5-01…07 | Mandato → SRF |
| **Este** | REG · COR · COC | Composição arquitetural |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (homologação F5-08); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-08 — Arquitetura Canônica de Composição de Superfícies |
| Baseado em quê | SRF; NAV; INT; AX; PUX; CX; FLX |
| Resultado | F5-08 **homologada**; CMP-S = referência obrigatória da especificação de superfícies; Arquitetura Estrutural da UX/UI consolidada; F5-09 aberta |
