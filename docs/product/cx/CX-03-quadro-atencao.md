# CX-03 — Apresentar o quadro de Atenção

> **Status: Homologada — Gate F3-06 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Fundamental  
> **MVP arquitetural:** Sim  
> **Precedência:** O1  
> **Domínios:** D1 (primário) ← D3 (alimento situacional)  
> **Nome canônico (F3-04):** Apresentar o quadro de Atenção  
> **Correção formal (CTO):** a referência “CX-03 — Objetivo Ativo” no enunciado do Gate F3-06 foi **erro material de nomenclatura**. Oficiais: **CX-03** Quadro de Atenção · **CX-04** Objetivo/Intenção · **CX-09** Foco.  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Materializar o domínio **D1 — Comando e Atenção**: apresentar o **quadro situacional** do COA ativo — o que exige atenção **agora** — de modo que o usuário perceba Foco (quando houver), sinais relevantes e a continuidade do ciclo executivo após atualizações de conhecimento.

O quadro de Atenção é o espelho do estado governado (F2-03), não o inventário do patrimônio nem o centro conversacional. Sem CX-03, o CEO deixa de ser posto de comando perceptível (PX-01, PX-05).

---

## 2. Responsabilidade

### Compete a esta CX

* Apresentar o **quadro de Atenção** do COA ativo (D1).  
* Tornar perceptível o **Foco** atual ou a **ausência explícita** de Foco (IX-02), quando o estado governado assim estiver.  
* Refletir, com parcimônia, **objetivos Ativados** concorrentes relevantes — sem roubar o objetivo único da superfície (P6 / PX-09).  
* Sinalizar alertas de **risco / prazo / dependência** quando a governança os eleva à atenção (F2-03 critérios de prioridade).  
* Ecoar **Nova Atenção** após promoção ao permanente (ciclo F2-02; alimentada por CX-14).  
* Manter a **identidade do COA ativo** visível no quadro situacional (em articulação com CX-01).  
* Privilegiar **atenção antes do inventário** (PX-05).

### Não compete a esta CX

* Estabelecer qual COA está ativo (**CX-01**) nem trocar COA (**CX-02**).  
* Declarar / conduzir Objetivo e Intenção (**CX-04**) — embora o quadro *reflita* o objetivo em Foco.  
* Ser a conversa como interface principal (**CX-05**).  
* Governar o ciclo de vida dos objetivos (**CX-08**) ou decidir prioridade/Foco (**CX-09**) — CX-03 **espelha** o resultado desses atos.  
* Consulta ampla ao conhecimento (**CX-07**) ou arquivo de concluídos/cancelados.  
* Solicitar meios, gates, execução ou promoção (**CX-10**…**CX-13**).  
* Expor orquestração, escolha de meios ou telemetria de execução como centro (IX-07, IX-08).  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo estabelecido e perceptível | Permanente (lente) | **CX-01** |
| Recorte situacional do permanente do COA (o que mudou / o que importa) | Permanente | **CX-07** / D3; após ciclo, **CX-13**→**CX-14** |
| Estado governado dos objetivos (Ativado, Suspenso relevante, Foco) | Permanente | **CX-08**, **CX-09** |
| Sinais de prioridade (risco, prazo, dependência, declaração do usuário) | Permanente ou Ato do usuário | Governança F2-03; ato em CX-09 |
| Pedido de renovação do quadro (Nova Atenção) | Permanente projetado | **CX-14** |
| Ato de “abrir o posto” / retomar sessão no COA | Ato do usuário | Entrada na experiência; **CX-15** na retomada |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Quadro situacional perceptível: o que exige atenção agora | Permanente projetado em D1 | Usuário |
| Foco atual **ou** ausência explícita de Foco | Permanente projetado | Usuário; satélite para **CX-05** / **CX-04** |
| Eco situacional de mudanças recentes (ex.: conclusão, efeito consolidado) | Permanente projetado (transitório na ênfase) | Usuário |
| Convite situacional à intenção (atenção → declaração de objetivo) | Ato potencial do usuário | Encaminha conceitualmente a **CX-04** / **CX-05** — sem executar por si |

**Não é saída desta CX:** lista completa do patrimônio; plano de meios; andamento bruto de execução; multi-COA.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → estrutural (lente) |
| Depende de | **CX-07** | → estrutural (alimento situacional do permanente) |
| É pré-requisito de / alimenta | **CX-04** | → — atenção convida intenção |
| É pré-requisito de / alimenta | **CX-09** | → — Foco se reflete no quadro (CX-09 decide; CX-03 espelha) |
| É pré-requisito de | **CX-14** | → — Nova Atenção renova este quadro |
| É pré-requisito de | **CX-02**, **CX-06**, **CX-08**, **CX-15**, **CX-18** | → — conforme F3-02 |
| Relacionada | **CX-05** | ↔ — conversa é centro; D1 é satélite situacional (PX-04) |
| Relacionada | **CX-11**, **CX-16** | ↔ — gates e limites podem aparecer no quadro sem virar telemetria |
| Relacionada | **CX-12** | ↔ — efeito pode ecoar na atenção sem substituir D1 por log de execução |

**Precedência F3-02:** O1 (após O0: CX-01, CX-07).  
**Anti-precedência:** não apresentar “execução” como posto de comando sem CX-01/quadro (IX-08).

---

## 6. Critérios de conclusão

A capacidade CX-03 considera-se **realizada** na experiência quando:

1. No COA ativo, o usuário identifica **o que exige atenção agora** sem vasculhar inventário.  
2. O **Foco** (ou sua ausência explícita) é perceptível (IX-02).  
3. O quadro está claramente sob **um** COA (CX-01 / IX-01) — sem misturar outro contexto.  
4. Atenção prevalece sobre arquivo: o centro situacional não é substituído por lista completa de memória ou de tarefas (PX-05; G-05).  
5. Após uma Atualização do Conhecimento relevante, o quadro **pode** refletir Nova Atenção (ciclo contínuo) — não permanece congelado como se nada houvesse mudado.  
6. Andamento de execução, quando ecoado, **não** expulsa o quadro situacional (IX-08).  
7. UXC-05 / PX-05 (F2-04) aprovam a narrativa sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-03 |
|----|-------------------|
| **IX-01** | Quadro sempre sob COA ativo |
| **IX-02** | Foco ou ausência explícita perceptível |
| **IX-05** | Sem mistura de COAs no quadro |
| **IX-08** | Execução não substitui Atenção |
| **IX-11** | Conversa permanece centro; D1 é satélite — não desloca CX-05 |
| **PX-01** | Posto de comando |
| **PX-05** | Atenção antes do inventário |
| **PX-07** | Clareza de estado governado (Foco / Ativados relevantes) |
| **PX-09** | Um objetivo perceptível por superfície — não transformar D1 em dashboard multi-job |
| **G-05 (F2-03)** | D1 ≠ arquivo morto |
| **Invisível** | Não expor orquestração / escolha de meios no quadro |

**Restrições adicionais:**

* Não implementar CX-03 como “home de orquestração” ou seletor de ferramentas.  
* Não confundir esta CX com **CX-04** (Objetivo/Intenção) nem com **CX-09** (Foco) — apenas espelhar o estado governado.  
* Nomenclatura oficial (correção CTO pós-F3-06): CX-03 Quadro de Atenção · CX-04 Objetivo/Intenção · CX-09 Foco.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-03 | Esta especificação |
| **CX relacionadas** | CX-01, CX-07, CX-04, CX-05, CX-08, CX-09, CX-14, CX-15, CX-16 | Lente; alimento; intenção; conversa; governança; Foco; renovação; continuidade; limites |
| **Domínios** | D1 (primário), D3 (secundário) | Quadro ← permanente |
| **DA** | DA-003 (indireto: atenção em um nível) | Nível atual informa o recorte situacional; navegação de nível é CX-06 |
| **PX** | PX-01, PX-05, PX-07, PX-09 | Comando; atenção; estado; um objetivo de superfície |
| **IX** | IX-01, IX-02, IX-05, IX-08, IX-11 | COA; Foco; isolamento; não telemetria; conversa no centro |
| **F3-02** | Fundamental; MVP-A Sim; O1 | Base perceptiva do posto |
| **F3-01** | Ficha CX-03 | Inventário |
| **F3-04** | Entrada CX-03 | Catálogo |
| **F2 apoio** | F2-01 D1; F2-02 ciclo / Nova Atenção; F2-03 §5 (D1 espelha governança) | Definição do quadro |
| **HP** | HP-004 (observação) | Informa “atenção antes da informação”; não promove |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); CTO (Gate F3-06 homologado + correção de nomenclatura) |
| Quando | 26/07/2026 |
| Por quê | Homologar CX-03; corrigir erro material “Objetivo Ativo”; abrir F3-07 (CX-04) |
| Baseado em quê | F3-03; F3-04; deliberação CTO F3-06 |
| Resultado | CX-03 **homologada**; nomenclatura oficial confirmada; sem commit |
