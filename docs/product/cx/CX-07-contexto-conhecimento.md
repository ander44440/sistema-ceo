# CX-07 — Consultar e ancorar Contexto / Conhecimento

> **Status: Homologada — Gate F3-09 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Fundamental  
> **MVP arquitetural:** Sim  
> **Precedência:** O0  
> **Domínios:** D3 (primário)  
> **Nome canônico (F3-04):** Consultar e ancorar Contexto / Conhecimento  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Dar acesso ao **recorte permanente** do COA ativo — contexto e conhecimento que **sobrevivem** a tarefas, conversas e sessões (DA-002) — e **ancorar** nele a atenção, a conversa, a intenção e o pedido de meios.

Sem CX-07, o ciclo executivo não tem âncora patrimonial: a experiência degenera em chat efêmero ou em execução sem memória de comando.

---

## 2. Responsabilidade

### Compete a esta CX

* Permitir **consulta** ao conhecimento/contexto permanente do COA ativo (D3).  
* **Ancorar** atos de atenção, conversa e intenção ao recorte desse permanente.  
* Fornecer o alimento situacional que D1 (**CX-03**) e D2 (**CX-05** / **CX-04**) leem do patrimônio.  
* Fornecer o recorte que D4 consome conceitualmente para decidir meios (**CX-10**) — sem expor orquestração.  
* Distinguir, na experiência, o que é **permanente** do que é apenas transitório na sessão (em articulação com **CX-16**).  
* Sustentar a premissa de que o conhecimento do COA **não se apaga** ao fim de uma tarefa ou conversa (DA-002).

### Não compete a esta CX

* Estabelecer qual COA está ativo (**CX-01**) — CX-07 opera *dentro* da lente.  
* Trocar COA (**CX-02**).  
* Ser o quadro de Atenção (**CX-03**) ou a conversa como centro (**CX-05**).  
* Declarar objetivo/intenção (**CX-04**) — apenas ancora.  
* **Promover** efeito ao permanente (**CX-13**) — CX-07 consulta/ancora o que já é (ou foi tornado) permanente.  
* Federar “todo conhecimento de todos os contextos” numa superfície misturada (IX-05).  
* Expor wiki genérico desligado do posto de comando.  
* Expor orquestração, escolha de meios ou telemetria de execução.  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo | Permanente (lente) | **CX-01** |
| Patrimônio permanente do COA (evidências, estado, memória governada) | Permanente | D3 / ciclos anteriores; **CX-13** quando houver promoção |
| Pedido de consulta ou necessidade de âncora (atenção, conversa, intenção, meios) | Ato do usuário ou demanda de outra CX | **CX-03**, **CX-04**, **CX-05**, **CX-10** |
| Nível de abstração atual (recorte fino/grosso), quando houver | Transitório de navegação | **CX-06** (evolutiva); senão, nível situacional único |
| Indicação do que ainda é transitório (não consultar como se fosse lei) | Transitório | **CX-16**; execução em curso (**CX-12**) |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Recorte permanente legível do COA ativo | Permanente (leitura) | **CX-03**, **CX-04**, **CX-05**, **CX-10**, usuário |
| Âncora: “isto se refere a este contexto/conhecimento do COA” | Permanente aplicado | D1, D2, D4 (conceitual) |
| Sinalização de ausência ou insuficiência de conhecimento no COA | Permanente / honestidade | Usuário; **CX-16** |
| Base para continuidade entre sessões (o que restaura) | Permanente | **CX-15** |

**Não é saída desta CX:** novo permanente criado por promoção (isso é **CX-13**); plano de meios; Foco entre objetivos.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → estrutural (lente; isolamento do permanente) |
| É pré-requisito de | **CX-03**, **CX-04**, **CX-05**, **CX-10**, **CX-13**, **CX-15**, **CX-17**, **CX-18** | → estrutural / ciclo (conforme F3-02) |
| Relacionada | **CX-06** | → — níveis alteram o *recorte* consultado, não o COA |
| Relacionada | **CX-13** | ⇒ — promoção *escreve* o permanente que CX-07 *lê* |
| Relacionada | **CX-14** | ↔ — Nova Atenção usa permanente atualizado |
| Relacionada | **CX-16** | ↔ — não apresentar transitório como permanente |

**Precedência F3-02:** O0 (com CX-01; fundamentais de base).  
**Anti-precedência:** promoção (CX-13) ou atenção rica sem âncora de conhecimento — viola integridade do ciclo / DA-002.

---

## 6. Critérios de conclusão

A capacidade CX-07 considera-se **realizada** na experiência quando:

1. No COA ativo, o usuário (e as CX dependentes) dispõem de um **recorte de contexto/conhecimento permanente** consultável.  
2. Atenção, conversa e intenção **podem ancorar-se** nesse recorte — não flutuam como chat genérico.  
3. O permanente **sobrevive** ao fim de tarefa/conversa/sessão no mesmo COA (DA-002 / IX-04) — verificado em articulação com **CX-15**.  
4. Não há mistura perceptível do permanente de outro COA no recorte ativo (IX-05).  
5. O que ainda é transitório **não** é apresentado como patrimônio consolidado (IX-09 / CX-16).  
6. Pedido de meios (**CX-10**), quando ocorre, pode consumir recorte de conhecimento sem expor D4.  
7. UXC-06 / DA-002 (F2-04) aprovam a narrativa sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-07 |
|----|-------------------|
| **DA-002** | Contexto/conhecimento sobrevive — núcleo desta CX |
| **IX-04** | Continuidade do permanente entre sessões (com CX-15) |
| **IX-05** | Isolamento por COA |
| **IX-09** | Transitório ≠ permanente na percepção |
| **IX-01** | Consulta sempre sob COA ativo |
| **PX-06** | Ciclo não morre na tarefa — permanente ancora a continuidade |
| **G-05 (F2-03)** | Conhecimento consultável ≠ despejar arquivo no centro de D1 |
| **Invisível** | Não transformar consulta em orquestração ou escolha de meios |

**Restrições adicionais:**

* Não implementar “busca enterprise” multi-contexto sem lente COA.  
* Não fazer de CX-07 a home conversacional (centro permanece CX-05).  
* Não confundir consulta (CX-07) com promoção (CX-13).

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-07 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-04, CX-05, CX-06, CX-10, CX-13, CX-14, CX-15, CX-16 | Lente; atenção; intenção; conversa; níveis; meios; promoção; nova atenção; continuidade; limites |
| **Domínios** | D3 (primário) | Contexto e conhecimento |
| **DA** | **DA-002** | Diretriz central |
| **PX** | PX-06; PX-03 | Continuidade do ciclo; um COA |
| **IX** | IX-04, IX-05, IX-09, IX-01 | Sobrevivência; isolamento; transitório≠permanente; COA |
| **F3-02** | Fundamental; MVP-A Sim; O0 | Base patrimonial |
| **F3-01** | Ficha CX-07 | Inventário |
| **F3-04** | Entrada CX-07 | Catálogo |
| **F2 apoio** | F2-01 D3; F2-02 Transitório/Permanente e F-Ret; F2-03 continuidade | Definição |
| **HP** | HP-006 (obs., indireto) | Justificativa vive no permanente — não promove |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-09 — Especificação Canônica CX-07; homologação CX-05 |
| Baseado em quê | F3-03; F3-01; F3-02; F3-04; DA-002 |
| Resultado | Spec CX-07 **homologada** (Gate F3-09); núcleo fundamental MVP-A consolidado |
