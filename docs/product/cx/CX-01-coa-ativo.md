# CX-01 — Estabelecer e exibir o COA ativo

> **Status: Homologada — Gate F3-05 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Fundamental  
> **MVP arquitetural:** Sim  
> **Precedência:** O0  
> **Domínios:** D1 (identidade situacional), D3 (recorte de contexto)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Garantir que a experiência do CEO opere e torne **perceptível**, em todo momento, **exatamente um Contexto Operacional Ativo (COA)** — a lente que recorta atenção, conversa, conhecimento, governança de objetivos e demais capacidades.

Sem esta capacidade, não há posto de comando com isolamento de contexto: a experiência degenera em superfície genérica ou em mistura de patrimônios (antimodelos já rejeitados na Fundação Conceitual).

---

## 2. Responsabilidade

### Compete a esta CX

* Estabelecer qual COA está **ativo** na experiência.  
* **Exibir** de forma inequívoca a identidade do COA ativo (o usuário sabe “em que contexto estou”).  
* Aplicar o **recorte** desse COA como premissa para o que é operável e perceptível nos domínios D1–D5.  
* Sustentar a premissa de que **não existe** experiência operável sem COA ativo (IX-01).  
* Servir de base estrutural (F3-02) a todas as demais CX que dependem da lente.

### Não compete a esta CX

* Trocar de COA (isso é **CX-02**).  
* Apresentar o quadro completo de Atenção / Foco / objetivos ( **CX-03**, **CX-08**, **CX-09** ).  
* Conduzir a conversa ou a intenção ( **CX-05**, **CX-04** ).  
* Armazenar ou promover o patrimônio além do recorte necessário à identidade ativa (consulta ampla: **CX-07**; promoção: **CX-13** ).  
* Expor orquestração, escolha de meios ou execução (D4/D5; **CX-10**…**CX-12** ).  
* Definir layout, navegação visual ou componentes de interface.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| Existência de ao menos um COA reconhecido para o usuário no âmbito do produto | Permanente | Patrimônio / configuração de contextos do usuário |
| Ato de iniciar ou retomar o uso no posto de comando | Ato do usuário | Entrada na experiência / sessão |
| Identidade do COA a tornar ativo (quando já houver escolha prévia ou único COA) | Permanente ou Ato do usuário | Último COA governado (continuidade) ou seleção implícita se houver apenas um |
| Proibição de operar sem lente | Invariante normativo | VIS-007 / IX-01 (não é “dado”, é premissa) |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Identidade do **COA ativo** perceptível e única | Permanente (lente vigente) | Usuário; D1 (identidade situacional); todas as CX dependentes |
| Recorte ativo: somente o que pertence a esse COA é operável | Permanente (aplicação da lente) | D1–D5 em circulação |
| Estado “COA estabelecido” como pré-condição satisfeita para o restante do MVP-A | Permanente (premissa de sessão/ciclo) | CX que dependem estruturalmente de CX-01 |

**Não é saída desta CX:** lista de todos os COAs, Foco entre objetivos, resultado de execução, plano de meios.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | — (capacidade de base / O0) | — |
| É pré-requisito de | CX-02, CX-03, CX-04, CX-05, CX-06, CX-07*, CX-08, CX-09, CX-10, CX-11, CX-12, CX-13, CX-14, CX-15, CX-16, CX-17, CX-18 | → estrutural (lente onipresente) |
| Relacionada | CX-07 | → / ↔ — CX-07 aprofunda o permanente *dentro* do recorte; CX-01 estabelece *qual* recorte está ativo |
| Relacionada | CX-02 | → — troca pressupõe COA já estabelecível/exibível |
| Relacionada | CX-15 | → — continuidade restaura o COA ativo entre sessões |

\*CX-07 também é fundamental em O0 (F3-02): coexiste com CX-01 na base; tipicamente o permanente consultado por CX-07 já está sob o COA ativo estabelecido por CX-01.

**Anti-precedência:** nenhuma CX operável pode omitir CX-01 (F3-02).

---

## 6. Critérios de conclusão

A capacidade CX-01 considera-se **realizada** na experiência quando:

1. Em qualquer momento de uso operável, a pergunta *“Em que contexto (COA) estou?”* tem **uma** resposta imediata e inequívoca.  
2. Não é possível operar o posto de comando em estado “sem COA ativo”.  
3. O que a experiência apresenta como operável está **recortado** por esse COA — não há mistura perceptível com outro COA na mesma superfície operável (IX-05, na medida em que CX-01 aplica a lente; a *troca* isolada é CX-02).  
4. A identidade do COA ativo permanece estável até ato explícito de troca (CX-02) ou regra de continuidade que a restaure (CX-15) — não “deriva” por navegação de nível (IX-10).  
5. Avaliadores aplicando UXC-02 / IX-01 (F2-04) aprovam a narrativa da jornada sem exigir wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-01 |
|----|-------------------|
| **IX-01** | Sempre há um COA ativo identificável — núcleo desta CX |
| **IX-05** | Isolamento: o recorte ativo não apresenta patrimônio de outro COA como se fosse o atual |
| **IX-10** | Estabelecer/exibir COA ≠ navegação de nível; nível não troca COA |
| **PX-03** | Um contexto ativo por vez |
| **PX-01** | A clareza do COA reforça o posto de comando (controle situacional) |
| **B-01 / G-03 (F2)** | COA é lente/contêiner — não é um “objetivo” entre outros |
| **Invisível** | CX-01 **não** expõe orquestração nem escolha de meios |

**Restrições adicionais:**

* Não criar superfície cujo job seja inventário multi-COA operável simultâneo.  
* Não tratar “projeto”, “chat” ou “pasta” como sinônimos frouxos que driblem o vocabulário COA.  
* Não autorizar implementação por si (fronteira ADR-006).

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-01 | Esta especificação |
| **CX relacionadas** | CX-02, CX-03, CX-07, CX-15; pré-requisito amplo | Troca; atenção; conhecimento; continuidade; base |
| **Domínios** | D1 (primário situacional), D3 (recorte) | Identidade + aplicação da lente |
| **DA** | — (suporte indireto a DA-002 via recorte que sobrevive) | Lente que torna DA-002 aplicável por COA |
| **PX** | PX-03; PX-01 | Um COA; posto de comando |
| **IX** | IX-01; IX-05; IX-10 | Ativo único; isolamento; nível ≠ troca |
| **F3-02** | Fundamental; MVP-A Sim; O0 | Base da arquitetura funcional |
| **F3-01** | Ficha CX-01 | Inventário de origem |
| **F3-04** | Entrada CX-01 | Catálogo oficial |
| **F2 apoio** | F2-01 (COA como lente); F2-02 (F-Coa / isolamento); F2-03 (§3 papel do COA) | Definição conceitual da lente |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-05 — primeira especificação canônica (CX-01) sob F3-03 |
| Baseado em quê | F3-03 canônico; F3-01; F3-02; F3-04; F2-01…F2-04; VIS-007 |
| Resultado | Spec CX-01 **homologada** (Gate F3-05); catálogo atualizado |
