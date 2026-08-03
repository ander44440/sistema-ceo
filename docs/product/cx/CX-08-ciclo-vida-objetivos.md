# CX-08 — Governar ciclo de vida de Objetivos

> **Status: Homologada — Gate F3-10 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada  
> **MVP arquitetural:** Sim  
> **Precedência:** O2  
> **Domínios:** D2 (atos), D3 (permanente), D1 (espelho)  
> **Nome canônico (F3-04):** Governar ciclo de vida de Objetivos  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Marco prévio:** [`../marco-nucleo-fundamental-mvp-a.md`](../marco-nucleo-fundamental-mvp-a.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Permitir **governar o ciclo de vida** dos objetivos no COA ativo — criar, ativar, suspender, retomar, concluir e cancelar — conforme o Modelo de Governança (F2-03), de modo que o estado dos objetivos seja **permanente** no patrimônio e **espelhável** na Atenção.

Sem CX-08, Objetivo/Intenção (CX-04) fica sem estados de vida governados: não há suspensão/retomada/conclusão/cancelamento como atos de comando, e o Foco (CX-09) não tem objetos estáveis para ordenar.

---

## 2. Responsabilidade

### Compete a esta CX

* Realizar as **transições de ciclo de vida** do objetivo: Criado → Ativado ⇄ Suspenso → Concluído | Cancelado (F2-03).  
* Registrar no **permanente do COA** as mudanças de estado relevantes (DA-002).  
* Garantir que objetivos Suspensos/Concluídos/Cancelados **deixem de competir** pelo Foco ativo conforme as regras de governança.  
* Articular-se com a declaração de Objetivo/Intenção (**CX-04**) na criação/ativação.  
* Fornecer a base de objetos Ativados sobre a qual **CX-09** ordena prioridade e Foco.  
* Permitir que **CX-03** espelhe o estado governado (sem que CX-03 decida as transições).  
* Preservar estados de vida na **continuidade entre sessões** (com **CX-15**).

### Não compete a esta CX

* Declarar a intenção conversacional do momento (**CX-04**) — CX-08 governa *vida do objetivo*, não substitui o canal de intenção.  
* Ordenar Foco/prioridade entre Ativados (**CX-09**).  
* Apresentar o quadro de Atenção (**CX-03**) — apenas alimenta o que ele espelha.  
* Estabelecer/trocar COA (**CX-01**, **CX-02**).  
* Solicitar meios, executar ou promover efeitos de execução (**CX-10**…**CX-13**).  
* Tratar tarefa ou meio como “objetivo” (G-01).  
* Suspender/apagar objetivos por mero fim de sessão (G-04 / CX-15).  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo | Permanente (lente) | **CX-01** |
| Objetivo/intenção formulada (candidato a criação/ativação) | Transitório → a consolidar | **CX-04** |
| Ato de governança do usuário (ativar, suspender, retomar, concluir, cancelar) | Ato do usuário | Usuário (via **CX-05** quando pelo diálogo) |
| Estado atual do objetivo no permanente | Permanente | D3 / esta CX em ciclos anteriores |
| Recorte de conhecimento para justificar/ancorar a transição | Permanente | **CX-07** |
| Necessidade de espelhar estado na Atenção | Demanda de espelho | **CX-03** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Objetivo em estado de vida atualizado (Criado/Ativado/Suspenso/Concluído/Cancelado) | Permanente | D3; **CX-09**; **CX-03**; **CX-15** |
| Registro da transição relevante (incluindo cancelamento quando importar à governança) | Permanente | D3 |
| Conjunto de objetivos Ativados elegíveis a Foco | Permanente | **CX-09** |
| Sinal para Nova Atenção quando conclusão/cancelamento alterar o quadro | Permanente projetado | **CX-03** / ciclo (**CX-14** quando houver atualização maior) |

**Não é saída desta CX:** Foco escolhido (CX-09); intenção transitória não consolidada; efeito de execução.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → estrutural |
| Depende de | **CX-04** | ⇢ / → — declaração alimenta criação/ativação |
| Depende de | **CX-07** | → estrutural — permanente do COA |
| Depende de / espelhada em | **CX-03** | → — quadro reflete estados |
| Relacionada | **CX-05** | ↔ — canal frequente dos atos de governança |
| É pré-requisito de | **CX-09** | ⇢ — sem ciclo de vida não há Foco/prioridade |
| É pré-requisito de | **CX-15** | → — continuidade restaura estados de vida |
| Relacionada | **CX-14** | ↔ — conclusão/cancelamento pode renovar atenção |
| Relacionada | **CX-17** | ↔ — decisão formal pode acompanhar conclusão |

**Precedência F3-02:** O2 (após núcleo O0–O1; com CX-04).  
**Anti-precedência:** CX-09 sem CX-08 — proibido.

---

## 6. Critérios de conclusão

A capacidade CX-08 considera-se **realizada** na experiência quando:

1. No COA ativo, o usuário pode **criar/ativar** um objetivo e reconhecê-lo como governado (não só como frase de chat).  
2. É possível **suspender** e **retomar** sem apagar o patrimônio do objetivo.  
3. É possível **concluir** ou **cancelar**, com o objetivo deixando de competir pelo Foco conforme F2-03.  
4. Estados de vida **persistem** no COA além da sessão conversacional (com CX-15).  
5. CX-09 dispõe de objetos Ativados reais para ordenar Foco.  
6. CX-03 pode espelhar Foco/Ativados/ecos de conclusão sem decidir as transições.  
7. Logout **não** equivale a suspender/concluir/cancelar (G-04).  
8. Narrativa UXC compatível com F2-03 / PX-07, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-08 |
|----|-------------------|
| **F2-03 §1** | Ciclo de vida Criado…Cancelado — núcleo |
| **G-01** | Objetivo ≠ tarefa ≠ meio |
| **G-02** | Foco ≠ único Ativado — concorrência preservada via estados |
| **G-04** | Sessão ≠ ciclo de vida |
| **DA-001** | Criação/ativação parte de objetivo, não de ferramenta |
| **DA-002** | Estados no permanente do COA |
| **IX-01 / IX-05** | Governança só no COA ativo; sem mistura |
| **PX-07** | Clareza de estado governado |
| **Invisível** | Não expor orquestração nas transições de vida |

**Restrições adicionais:**

* Forma mínima MVP-A: criar/ativar/concluir ou cancelar; suspensão/retomada devem existir ao menos conceitualmente no modelo (F3-02 exige governança mínima).  
* Não fundir CX-08 com CX-04 ou CX-09.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-08 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-04, CX-05, CX-07, CX-09, CX-14, CX-15, CX-17 | Lente; espelho; intenção; canal; permanente; Foco; renovação; continuidade; decisão |
| **Domínios** | D2, D3, D1 | Ato; patrimônio; espelho |
| **DA** | DA-001, DA-002 | Objetivo antes de meios; sobrevivência do estado |
| **PX** | PX-02, PX-07, PX-06 | Objetivo; estado governado; ciclo contínuo |
| **IX** | IX-01, IX-02, IX-04, IX-05 | COA; Foco refletido; continuidade; isolamento |
| **F3-02** | Derivada; MVP-A Sim; O2 | Governança mínima do MVP-A |
| **F3-01** | Ficha CX-08 | Inventário |
| **F3-04** | Entrada CX-08 | Catálogo |
| **F2 apoio** | F2-03 §§1–6; F2-02 ciclo | Definição do ciclo de vida |
| **HP** | — | — |
| **Marco** | Núcleo Fundamental MVP-A | Pré-condição documental da onda de derivadas |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-10 — Spec CX-08; marco núcleo fundamental; homologação CX-07 |
| Baseado em quê | F3-03; F3-02; F3-04; F2-03; marco núcleo fundamental |
| Resultado | Spec CX-08 **homologada** (Gate F3-10); F3-11 (CX-09) aberta |
