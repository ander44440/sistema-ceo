# CX-10 — Solicitar meios sem expor orquestração

> **Status: Homologada — Gate F3-12 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada (de ciclo)  
> **MVP arquitetural:** Sim  
> **Precedência:** O3  
> **Domínios:** D2 → D4 (D4 **invisível** na superfície)  
> **Nome canônico (F3-04):** Solicitar meios sem expor orquestração  
> **Bloco de execução (F3-02 O3):** entrada — pedido de meios que habilita gate (**CX-11**) e acompanhamento de efeito (**CX-12**)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Permitir que, a partir de uma **intenção clara** no COA ativo, o usuário **solicite o cumprimento** dessa intenção — o **pedido de meios** — sem que a experiência exponha orquestração, seletor de ferramentas ou escolha de modelos (DA-001; IX-07; F2-02 O-01…O-04).

### Papel no bloco de execução (O3)

CX-10 é a **porta de entrada** do bloco de execução do MVP-A:

| Etapa O3 | Capacidade | Papel |
|----------|------------|--------|
| **Entrada** | **CX-10** | Pedir meios / encaminhamento (D2→D4) |
| Condicional | CX-11 | Gate humano quando risco exigir |
| Saída observável | CX-12 | Acompanhar execução e efeito (D5) |

Sem CX-10, o ciclo para na intenção: há governança e Foco, mas não há passagem conceitual para decisão de meios nem para execução.

---

## 2. Responsabilidade

### Compete a esta CX

* Receber o **pedido de cumprimento** da intenção (formulário conceitual: “faça avançar este norte”).  
* Encaminhar o pedido à **decisão/encaminhamento de meios** (D4) — **sem** tornar D4 uma superfície.  
* Consumir intenção (**CX-04**) alinhada ao **Foco** vigente (**CX-09**) e a objetivos **Ativados** (**CX-08**).  
* Ancorar o pedido no **recorte permanente** do COA (**CX-07**).  
* Usar a conversa (**CX-05**) como canal típico do pedido — sem deslocar o centro para toolbox.  
* Produzir **desfechos compreensíveis** do pedido (aceito para encaminhamento; esclarecimento necessário; recusa de escopo) — sem listar meios escolhidos.  
* Habilitar **CX-11** (quando houver gate) e **CX-12** (acompanhamento) a partir de um encaminhamento existente.  
* Preservar a separação: **governança** (CX-08/09) ≠ **decisão de meios** (D4 via esta CX) ≠ **execução** (D5 / CX-12).

### Não compete a esta CX

* Governar ciclo de vida de objetivos (**CX-08**) nem ordenar Foco (**CX-09**).  
* Declarar/reformular a intenção (**CX-04**) — apenas consome intenção já clara o bastante para pedir meios.  
* Expor UI de escolha de meios, home de orquestração ou seletor de modelos/agentes.  
* **Executar** o trabalho (D5 / **CX-12**) — D4 decide e encaminha; D5 executa (F2-02).  
* Autorizar gates (**CX-11**) — embora o pedido possa *disparar* a necessidade de gate.  
* Promover ao permanente (**CX-13**) ou renovar Atenção (**CX-14**).  
* Decidir qual COA está ativo (**CX-01**).  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo | Permanente (lente) | **CX-01** |
| Intenção clara o bastante para pedir meios | Transitório | **CX-04** |
| Foco vigente (objetivo Ativado privilegiado) | Permanente | **CX-09** |
| Objetivo Ativado sob o qual o pedido faz sentido | Permanente | **CX-08** |
| Recorte de conhecimento do COA | Permanente | **CX-07** |
| Ato do usuário solicitando cumprimento / avanço | Ato do usuário | Usuário (via **CX-05**) |
| Limites / incerteza já explicitados (se houver) | Transitório / permanente | **CX-16** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Pedido de meios interpretado / encaminhado (conceitualmente) | Transitório (plano de encaminhamento em D4) | D4 → habilita **CX-11** / **CX-12** |
| Desfecho compreensível do pedido (segue; precisa esclarecer; fora de escopo) | Transitório → espelhável | **CX-05**; **CX-03** se afetar atenção |
| Sinal de que há encaminhamento a autorizar (quando aplicável) | Transitório | **CX-11** |
| Sinal de que há execução a acompanhar (quando autorizada / sem gate) | Transitório | **CX-12** |

**Não é saída desta CX:** lista de meios escolhidos; efeito de execução; novo estado de ciclo de vida; mudança de Foco; promoção ao permanente.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-04** | ⇢ — intenção antes de meios |
| Depende de | **CX-07** | → — recorte para decisão de meios |
| Depende de | **CX-05** | ↔ — canal típico do pedido |
| Depende de | **CX-01** | → estrutural |
| Coerência obrigatória | **CX-09** | ↔ — pedido sob Foco Executivo |
| Coerência obrigatória | **CX-08** | ↔ — pedido sob objetivo Ativado (não Suspenso/Concluído/Cancelado) |
| É pré-requisito de | **CX-11** | ⇢ — gate sobre encaminhamento |
| É pré-requisito de | **CX-12** | ⇢ — execução só após encaminhamento (gate condicional) |
| Relacionada | **CX-03** | ↔ — atenção pode refletir estado de pedido/encaminhamento |
| Relacionada | **CX-16** | ↔ — limites honestos no pedido |

**Precedência F3-02:** O3 (bloco de execução; após O2: CX-04, CX-08, CX-09).  
**Anti-precedências:** CX-10 sem CX-04; “escolher meio” como superfície; CX-12 antes de CX-10.

---

## 6. Critérios de conclusão

A capacidade CX-10 considera-se **realizada** na experiência quando:

1. A partir de intenção clara no COA ativo, o usuário pode **pedir meios** / cumprimento sem escolher ferramenta.  
2. A orquestração (D4) permanece **invisível** como superfície — não há home nem seletor de meios.  
3. O pedido alinha-se ao **Foco** (CX-09) e a objetivo **Ativado** (CX-08); não “executa” objetivo Suspenso/Concluído/Cancelado como se vigente.  
4. Separação preservada: governança (vida/Foco) ≠ decisão de meios (esta CX/D4) ≠ execução (CX-12/D5).  
5. Desfechos do pedido são **compreensíveis** (segue / esclarece / recusa) sem expor o plano interno de meios.  
6. CX-11 e CX-12 têm um encaminhamento conceitual a consumir (gate condicional).  
7. DA-001 / IX-07 sustentados: objetivo/intenção antes de meios; meios não são escolha do usuário.  
8. Narrativa UXC compatível com F2-02 O-01…O-04, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-10 |
|----|-------------------|
| **DA-001** | Meios só após objetivo/intenção; usuário não escolhe ferramenta |
| **IX-07** | Orquestração invisível — núcleo desta CX |
| **F2-02** | D4 decide/encaminha; **nunca** executa; D5 é o executor |
| **O-01…O-04** | Interpretar → decidir meios → gate se preciso → encaminhar a D5 |
| **PX-02** | Objetivo/intenção antes do pedido de meios |
| **IX-01 / IX-05** | Pedido só no COA ativo |
| **G-01** | Meio ≠ objetivo — pedido de meios não redefine o norte |
| **Invisível** | Proibido rotular escolha de meio como CX-10 |

**Restrições adicionais:**

* Forma mínima MVP-A: pedido + desfecho compreensível + encaminhamento conceitual sem UI de meios.  
* Não fundir CX-10 com CX-11 (gate) nem CX-12 (efeito).  
* Não usar CX-10 para alterar ciclo de vida (CX-08) ou Foco (CX-09) — salvo efeitos colaterais de atenção via CX-03/14.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-10 | Esta especificação |
| **CX relacionadas** | CX-01, CX-04, CX-05, CX-07, CX-08, CX-09, CX-11, CX-12, CX-03, CX-16 | Lente; intenção; canal; âncora; vida; Foco; gate; efeito; atenção; limites |
| **Domínios** | D2 → D4 (D4 invisível); D5 só como destino do encaminhamento | Porta da vontade → decisão; execução fora desta CX |
| **DA** | **DA-001** | Diretriz central |
| **PX** | PX-02, PX-04, PX-08 | Objetivo; conversa; honestidade de limites |
| **IX** | IX-07, IX-01, IX-05, IX-06 | Invisível; COA; isolamento; gate (fronteira com CX-11) |
| **F3-02** | Derivada de ciclo; MVP-A Sim; O3 | Entrada do bloco de execução |
| **F3-01** | Ficha CX-10 | Inventário |
| **F3-04** | Entrada CX-10 | Catálogo |
| **F2 apoio** | F2-02 §§ ciclo, O-01…O-04, F-Int/F-Exe; F2-04 invisível | Decisão ≠ execução |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-12 — Spec CX-10; homologação CX-09 |
| Baseado em quê | F3-03; F3-02 O3; F3-04; F2-02; DA-001; IX-07; CX-08/09 |
| Resultado | Spec CX-10 **homologada** (Gate F3-12); F3-13 (CX-11) aberta |
