# CX-05 — Conversar como interface principal

> **Status: Homologada — Gate F3-08 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Fundamental  
> **MVP arquitetural:** Sim  
> **Precedência:** O1  
> **Domínios:** D2 (primário); satélites D1 / D3  
> **Nome canônico (F3-04):** Conversar como interface principal  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Realizar a **conversa como interface principal** do Executivo Digital (VIS-007 / PX-04): o usuário conduz o trabalho no COA ativo dialogando com o CEO — com atenção e conhecimento como **satélites** — e não preenchendo formulários nem operando uma toolbox.

Sem CX-05, Objetivo/Intenção (CX-04), gates (CX-11) e a sensação de comando conversacional perdem o canal canônico da experiência.

---

## 2. Responsabilidade

### Compete a esta CX

* Oferecer o **canal conversacional** como centro da experiência no COA ativo.  
* Permitir condução por linguagem para intenções, esclarecimentos, autorizações e continuidade do raciocínio na sessão.  
* Manter a conversa **ancorada** ao COA (não chat genérico sem contexto — antimodelo RC-03).  
* Articular-se com o quadro de Atenção (**CX-03**) e o conhecimento (**CX-07**) como apoios satélites — sem ser deslocada por eles (IX-11).  
* Servir de canal preferencial para declaração de Objetivo/Intenção (**CX-04**) e para gates humanos (**CX-11**).  
* Preservar continuidade conversacional **na sessão** (thread do diálogo), distinguindo-a do patrimônio permanente (DA-002 / IX-09).

### Não compete a esta CX

* Estabelecer ou trocar o COA (**CX-01**, **CX-02**).  
* Ser o quadro de Atenção (**CX-03**) nem o arquivo de conhecimento (**CX-07**).  
* Governar ciclo de vida / Foco dos objetivos (**CX-08**, **CX-09**) — embora a conversa possa expressar atos que essas CX consolidam.  
* Expor orquestração ou escolha de meios (**CX-10** permanece invisível quanto a D4).  
* Executar no mundo operacional (**CX-12**) ou promover ao permanente (**CX-13**) — a conversa pode *relatar* e *encaminhar*, não substituir essas CX.  
* Tratar o histórico completo do diálogo como Memória Organizacional.  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo | Permanente (lente) | **CX-01** |
| Recorte de conhecimento para contextualizar o diálogo | Permanente | **CX-07** |
| Quadro situacional (atenção / Foco), quando relevante ao turno | Permanente projetado | **CX-03** |
| Atos do usuário em linguagem (perguntas, ordens, esclarecimentos, autorizações) | Ato do usuário | Usuário |
| Sinais de limite / transitório a comunicar no diálogo | Transitório / normativo | **CX-16** |
| Pedido de gate a apresentar no canal conversacional | Transitório / Ato | **CX-11** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Diálogo situacional contínuo no COA ativo | Transitório (sessão) | Usuário; D2 |
| Canal disponível para Objetivo/Intenção | Capacidade / Ato | **CX-04** |
| Canal disponível para autorização humana | Capacidade / Ato | **CX-11** |
| Expressão de limites e incertezas no fluxo conversacional | Transitório perceptível | Usuário (com **CX-16**) |
| Encaminhamento conversacional ao pedido de meios (sem expor D4) | Transitório | **CX-10** |

**Não é saída desta CX:** patrimônio permanente; plano de orquestração; telemetria de execução; multi-COA no mesmo fio operável.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → estrutural |
| Depende de | **CX-07** | → estrutural (âncora; evita chat genérico) |
| Relacionada | **CX-03** | ↔ — satélite situacional; não desloca o centro |
| É pré-requisito de | **CX-04** | → — canal de declaração |
| É pré-requisito de | **CX-10** | → — pedido de meios via conversa |
| É pré-requisito de | **CX-11** | → — superfície preferencial do gate |
| Relacionada | **CX-16** | ↔ — honestidade no diálogo |
| Relacionada | **CX-12** | ↔ — relatos de efeito podem aparecer na conversa sem virar log-centro |

**Precedência F3-02:** O1 (com CX-03; após O0: CX-01, CX-07).  
**Anti-precedência:** conversa sem COA (viola VIS-007 / inventário F3).

---

## 6. Critérios de conclusão

A capacidade CX-05 considera-se **realizada** na experiência quando:

1. O usuário conduz o trabalho principal **pelo diálogo**, no COA ativo — não por formulário como centro.  
2. Remover ou esvaziar o centro conversacional **esvazia** a experiência de comando (IX-11 / teste PX-04).  
3. A conversa permanece **ancorada** ao COA: não opera como chat genérico sem contexto.  
4. Atenção (CX-03) e conhecimento (CX-07) **apoiam** sem usurpar o centro.  
5. Declaração de intenção (CX-04) e gates (CX-11), quando ocorrem, **podem** fluir pelo canal conversacional.  
6. O usuário não é levado a tratar o fio da conversa como substituto do permanente do COA (IX-09).  
7. UXC-04 / PX-04 (F2-04) aprovam a narrativa sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-05 |
|----|-------------------|
| **VIS-007 / PX-04** | Conversa = interface principal |
| **IX-11** | Centro conversacional; apoios satélites |
| **IX-01 / IX-05** | Diálogo sob um COA; sem mistura |
| **IX-07** | Conversa ≠ home de orquestração |
| **IX-09** | Thread transitória ≠ patrimônio |
| **PX-08 / CX-16** | Honestidade de limites no diálogo |
| **RC-03 (antimodelo)** | Rejeitar chat genérico sem COA/objetivo |
| **Invisível** | Não expor escolha de meios no centro conversacional |

**Restrições adicionais:**

* Não implementar “sala de chat” desligada do COA.  
* Não deslocar o centro para dashboard, inbox de execução ou seletor de ferramentas.  
* Não fundir CX-05 com CX-04 no catálogo (canal ≠ declaração de objetivo, embora o canal a sirva).

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-05 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-04, CX-07, CX-10, CX-11, CX-16 | Lente; atenção; intenção; conhecimento; meios; gates; limites |
| **Domínios** | D2 (primário); D1, D3 (satélites) | Conversa + apoios |
| **DA** | DA-001 (indireto: canal para objetivo antes de meios) | Suporte à jornada |
| **PX** | **PX-04**; PX-03; PX-08 | Conversa principal; COA; honestidade |
| **IX** | **IX-11**; IX-01; IX-05; IX-07; IX-09 | Centro; COA; isolamento; sem orquestração-UI; transitório≠permanente |
| **F3-02** | Fundamental; MVP-A Sim; O1 | Posto + conversa |
| **F3-01** | Ficha CX-05 | Inventário |
| **F3-04** | Entrada CX-05 | Catálogo |
| **F2 apoio** | F2-01 D2; F2-04 PX/IX; VIS-007 | Definição |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-08 — Especificação Canônica CX-05; homologação CX-04 |
| Baseado em quê | F3-03; F3-01; F3-02; F3-04; VIS-007; PX-04 |
| Resultado | Spec CX-05 **homologada** (Gate F3-08); catálogo atualizado |
