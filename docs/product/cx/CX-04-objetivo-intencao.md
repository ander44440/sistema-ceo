# CX-04 — Declarar e conduzir Objetivo / Intenção

> **Status: Homologada — Gate F3-07 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Fundamental  
> **MVP arquitetural:** Sim  
> **Precedência:** O2  
> **Domínios:** D2 (primário); âncora em D3  
> **Nome canônico (F3-04):** Declarar e conduzir Objetivo / Intenção  
> **Nomenclatura oficial:** CX-03 Quadro de Atenção · **CX-04 Objetivo/Intenção** · CX-09 Foco.  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Permitir que o usuário **declare e conduza** o **Objetivo** e a **Intenção** do trabalho no COA ativo — o norte do ciclo executivo — **antes** de qualquer escolha ou exposição de meios (DA-001 / PX-02).

Esta capacidade realiza a entrada conceitual Objetivo → Intenção do ciclo contínuo (F2-02). Sem ela, a experiência tende a toolbox, chat genérico ou execução sem comando.

---

## 2. Responsabilidade

### Compete a esta CX

* Permitir a **formulação** do objetivo (o que se quer alcançar ou decidir) no COA ativo.  
* Permitir a **condução da intenção** em curso (refinar, reafirmar, descartar a intenção atual sem necessariamente concluir o objetivo no sentido de CX-08).  
* Ancorar objetivo/intenção ao **recorte do COA** (leitura em D3).  
* Alimentar o pedido de meios (**CX-10**) com uma intenção clara — sem expor orquestração.  
* Articular-se com a conversa (**CX-05**) como canal principal de declaração.  
* Contribuir para a **criação/ativação conceitual** de objetivos no sentido da governança (em articulação com **CX-08**), sem substituir o ciclo de vida completo.  
* Manter a precedência **objetivo antes da ferramenta** em toda jornada que inicie trabalho.

### Não compete a esta CX

* Apresentar o quadro de Atenção (**CX-03**) — embora possa nascer de um convite situacional dele.  
* Ordenar **Foco** entre vários objetivos Ativados (**CX-09**).  
* Suspender, retomar, concluir ou cancelar objetivos no sentido pleno do ciclo de vida (**CX-08**) — CX-04 declara/conduz a intenção; CX-08 governa os estados de vida.  
* Trocar COA (**CX-02**) ou estabelecer a lente (**CX-01**).  
* Solicitar/escolher meios, executar ou promover ao permanente (**CX-10**…**CX-13**).  
* Expor seletor de ferramentas, modelos ou capacidades internas.  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo | Permanente (lente) | **CX-01** |
| Canal conversacional disponível | Ato / capacidade | **CX-05** |
| Recorte de conhecimento para ancorar o objetivo | Permanente | **CX-07** |
| Convite situacional (atenção → intenção), quando houver | Permanente projetado / Ato | **CX-03** |
| Declaração do usuário (objetivo ou intenção) | Ato do usuário | Usuário via D2 |
| Objetivo já Ativado / Foco vigente (para conduzir intenção em curso) | Permanente | **CX-08**, **CX-09** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Objetivo formulado (norte declarado) | Transitório até consolidação em governança; tende a Permanente via **CX-08** | D2; D3 (âncora); **CX-08** |
| Intenção em curso (vontade explícita do momento) | Transitório | D2; **CX-10** (pedido de meios) |
| Intenção descartada ou satisfeita (no trecho) | Ato / Transitório encerrado | Ciclo F2-02 (E-OUT-01 conceitual); Nova Atenção via demais CX |
| Âncora “trabalhamos sob este objetivo/intenção neste COA” | Permanente quando promovida pela governança | D3 / **CX-08** |

**Não é saída desta CX:** plano de meios; Foco entre concorrentes; efeito de execução; promoção patrimonial completa (CX-13).

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → estrutural |
| Depende de | **CX-05** | → estrutural (canal de declaração) |
| Depende de | **CX-07** | → estrutural (âncora) |
| Depende de / alimentada por | **CX-03** | → — atenção convida intenção (não obrigatória em todo ato) |
| É pré-requisito de | **CX-08** | ⇢ / → — governança de vida do objetivo |
| É pré-requisito de | **CX-10** | ⇒ ciclo — intenção antes de meios |
| É pré-requisito de | **CX-17** | → — decisão formal parte de objetivo/intenção |
| Relacionada | **CX-09** | ⇢ — Foco privilegia qual objetivo Ativado está “na frente”; não substitui declaração |
| Relacionada | **CX-16** | ↔ — honestidade se a intenção for ambígua ou inviável |

**Precedência F3-02:** O2 (após O0–O1).  
**Anti-precedência:** CX-10 sem CX-04 (meios sem intenção) — proibido.

---

## 6. Critérios de conclusão

A capacidade CX-04 considera-se **realizada** na experiência quando:

1. O usuário consegue **declarar** um objetivo/intenção no COA ativo sem passar por escolha de ferramenta (IX-03 / DA-001).  
2. A intenção em curso é **reconhecível** na experiência (o trabalho tem norte), ancorada ao COA — não é chat genérico sem contexto.  
3. É possível **conduzir** a intenção (ajustar ou abandonar o trecho) sob controle do usuário (P1).  
4. O caminho para solicitar meios (**CX-10**), quando acionado, parte de uma intenção — não de um seletor de meios.  
5. Objetivo/intenção não se confundem perceptivelmente com Foco (CX-09) nem com o quadro de Atenção (CX-03), embora se articulem.  
6. UXC-03 / PX-02 (F2-04) aprovam a narrativa sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-04 |
|----|-------------------|
| **DA-001** | Objetivo antes da ferramenta — núcleo desta CX |
| **IX-03** | Intenção aparece antes de meios na jornada |
| **IX-01 / IX-05** | Declaração sempre no COA ativo; sem misturar COAs |
| **IX-07** | Não transformar declaração em superfície de orquestração |
| **PX-02** | Objetivo antes de qualquer meio |
| **PX-04** | Condução preferencial via conversa (com CX-05) |
| **PX-09** | Um objetivo executivo perceptível por superfície |
| **G-01 (F2-03)** | Objetivo ≠ tarefa ≠ meio |
| **Invisível** | Escolha e composição de meios permanecem fora desta CX |

**Restrições adicionais:**

* Não implementar “wizard de ferramentas” sob o rótulo de objetivo.  
* Não fundir CX-04 com CX-03 ou CX-09 no catálogo ou na especificação.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-04 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-05, CX-07, CX-08, CX-09, CX-10, CX-16, CX-17 | Lente; atenção; conversa; conhecimento; vida do objetivo; Foco; meios; limites; decisão |
| **Domínios** | D2 (primário), D3 (âncora) | Intenção / objetivo |
| **DA** | **DA-001** | Diretriz central |
| **PX** | PX-02, PX-04, PX-09 | Objetivo primeiro; conversa; um objetivo de superfície |
| **IX** | IX-03, IX-01, IX-05, IX-07 | Antes dos meios; COA; isolamento; sem orquestração-UI |
| **F3-02** | Fundamental; MVP-A Sim; O2 | Norte do ciclo |
| **F3-01** | Ficha CX-04 | Inventário |
| **F3-04** | Entrada CX-04 | Catálogo |
| **F2 apoio** | F2-02 ciclo (Objetivo→Intenção); F2-03 ciclo de vida (criação/ativação); F2-01 D2 | Definição |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-07 — Especificação Canônica CX-04; correção nomenclatura F3-06; homologação CX-03 |
| Baseado em quê | F3-03; F3-01; F3-02; F3-04; DA-001; deliberação CTO |
| Resultado | Spec CX-04 **homologada** (Gate F3-07); catálogo atualizado |
