# CX-09 — Ordenar prioridade e Foco entre objetivos

> **Status: Homologada — Gate F3-11 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada  
> **MVP arquitetural:** Sim  
> **Precedência:** O2  
> **Domínios:** D1 (espelho / privilégio), D3 (permanente)  
> **Nome canônico (F3-04):** Ordenar prioridade e Foco entre objetivos  
> **Papel conceitual:** Foco Executivo — seleção do objetivo Ativado privilegiado *agora*  
> **Nomenclatura oficial:** CX-03 Quadro de Atenção · CX-04 Objetivo/Intenção · **CX-09 Foco**  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Permitir **ordenar a prioridade** entre objetivos **Ativados** do COA ativo e estabelecer o **Foco** — a **seleção executiva** do objetivo (ou recorte dele) que a Atenção privilegia **agora** — sem extinguir os demais concorrentes (F2-03 §§2 e 4; G-02).

O Foco Executivo não cria objetivos nem define o COA: escolhe, entre o que já está vivo e elegível (CX-08), qual norte governa o ciclo corrente e o quadro de Atenção.

Sem CX-09, a experiência ou força um único Ativado (apagando concorrência) ou deixa vários Ativados sem privilégio claro — ambos violam a governança de comando.

---

## 2. Responsabilidade

### Compete a esta CX

* Selecionar e manter o **Foco** entre objetivos **Ativados** do COA ativo (seleção executiva).  
* Aplicar os **critérios conceituais de prioridade** (F2-03 §2), com prevalência da **declaração explícita do usuário** quando houver.  
* Permitir **mudança de Foco** sem alterar, por si só, o ciclo de vida dos objetivos (salvo quando o usuário conjugue ato de CX-08 — ex.: suspender o foco anterior).  
* Garantir que Suspensos, Concluídos e Cancelados **não** concorram pelo Foco (respeito integral a CX-08 / F2-03).  
* Alimentar **CX-03** com o Foco vigente e o contexto de Ativados secundários — sem que CX-03 decida o Foco.  
* Ancorar o ciclo corrente (intenção → meios → efeito) ao objetivo em Foco, em articulação com **CX-04** e **CX-10**, sem expor orquestração.  
* Preservar o Foco governado (ou sua ausência explícita) para **CX-15** restaurar entre sessões.  
* Distinguir na experiência: **COA** (lente) ≠ **Objetivo** (norte) ≠ **Foco** (privilégio de agora).

### Não compete a esta CX

* Estabelecer ou trocar o COA (**CX-01**, **CX-02**) — Foco opera *dentro* da lente.  
* Declarar/conduzir Objetivo/Intenção como formulação (**CX-04**) — CX-09 ordena privilégio entre Ativados já governados.  
* Criar, ativar, suspender, retomar, concluir ou cancelar objetivos (**CX-08**) — embora o usuário possa encadear atos de vida e de Foco.  
* Apresentar o quadro de Atenção (**CX-03**) — apenas fornece o que ele espelha sobre Foco/prioridade.  
* Escolher meios, gates, execução ou promoção (**CX-10**…**CX-13**).  
* Cancelar concorrentes ao focar (G-02) ou tratar COA como item de prioridade entre objetivos (G-03).  
* Usar prioridade para escolher ferramentas ou modelos.  
* Definir layout, componentes ou wireframes.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| COA ativo | Permanente (lente) | **CX-01** |
| Conjunto de objetivos Ativados elegíveis a Foco | Permanente | **CX-08** |
| Estados de vida (Suspenso / Concluído / Cancelado) | Permanente | **CX-08** — excluem da competição |
| Declaração explícita de Foco pelo usuário | Ato do usuário | Usuário (via **CX-05** quando pelo diálogo) |
| Sinais situacionais de prioridade (risco, prazo, dependência, impacto) | Permanente / situacional | **CX-07**; espelho em **CX-03** |
| Intenção em curso no objetivo privilegiado | Transitório → consolidável | **CX-04** |
| Foco governado anterior (para continuidade ou troca) | Permanente | Esta CX / **CX-15** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Foco vigente (objetivo Ativado privilegiado *agora*) | Permanente no COA | **CX-03**; ciclo (**CX-04**→**CX-10**…); **CX-15** |
| Ausência explícita de Foco (quando nenhum privilegiado) | Permanente / estado governado | **CX-03**; **CX-15** |
| Ordenação / sinalização de prioridade entre Ativados | Permanente / situacional | **CX-03** (secundários); julgamento executivo |
| Sinal de mudança de Foco para Nova Atenção | Permanente projetado | **CX-03** / **CX-14** quando a troca renovar o quadro |

**Não é saída desta CX:** novo estado de ciclo de vida (CX-08); COA ativo (CX-01); escolha de meios.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-08** | ⇢ / → — sem objetos Ativados com vida governada, não há Foco |
| Depende de | **CX-01** | → estrutural — Foco só no COA ativo |
| Depende de / espelhada em | **CX-03** | → — quadro reflete Foco e secundários |
| Relacionada | **CX-04** | ↔ — intenção do ciclo alinha-se ao Foco |
| Relacionada | **CX-05** | ↔ — canal frequente da declaração de Foco |
| Relacionada | **CX-07** | ↔ — sinais situacionais do permanente |
| É pré-requisito de | **CX-10** | ⇢ — meios alinham-se ao Foco (invisível) |
| É pré-requisito de | **CX-15** | → — continuidade restaura Foco governado |
| Relacionada | **CX-14** | ↔ — troca/conclusão de Foco pode renovar atenção |

**Precedência F3-02:** O2 (com CX-04 e CX-08; após núcleo O0–O1).  
**Anti-precedência:** CX-09 sem CX-08 — **proibido**.

---

## 6. Critérios de conclusão

A capacidade CX-09 considera-se **realizada** na experiência quando:

1. No COA ativo, entre objetivos **Ativados**, o usuário pode **declarar** (ou reconhecer) um **Foco** privilegiado.  
2. É possível **mudar de Foco** sem cancelar automaticamente os demais Ativados (G-02).  
3. Objetivos Suspensos, Concluídos ou Cancelados **não** entram na competição por Foco (CX-08).  
4. Foco ≠ Objetivo: o objetivo existe no ciclo de vida; o Foco é o privilégio de *agora* entre Ativados.  
5. Foco ≠ COA: trocar Foco não troca a lente; trocar COA (CX-02) muda o quadro, sem confundir contêiner com privilégio (G-03).  
6. CX-03 pode espelhar Foco atual e Ativados secundários sem decidir a seleção.  
7. O Foco governado (ou ausência explícita) **persiste** no COA para continuidade (CX-15).  
8. Narrativa UXC compatível com F2-03 §§2 e 4 / PX-07 / IX-02, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-09 |
|----|-------------------|
| **F2-03 §2** | Critérios de prioridade P1–P7 — núcleo da ordenação |
| **F2-03 §4** | Um Foco por vez na Atenção; concorrência preservada |
| **G-02** | Foco ≠ único Ativado — proibido cancelar concorrentes ao focar |
| **G-03** | COA ≠ objetivo — COA não é item de prioridade entre objetivos |
| **G-01** | Objetivo ≠ tarefa ≠ meio — Foco aplica-se a objetivos, não a tarefas/meios |
| **DA-001** | Ciclo sob Foco permanece objetivo-antes-de-meios |
| **DA-002** | Foco governado vive no permanente do COA |
| **IX-01 / IX-05** | Foco só no COA ativo; sem mistura entre COAs |
| **IX-02** | Atenção reflete Foco; não inventa privilégio paralelo |
| **PX-07** | Clareza de estado: Foco vs Ativados vs Suspensos |
| **Invisível** | Prioridade não escolhe meios nem expõe orquestração |

**Restrições adicionais:**

* Forma mínima MVP-A: declaração/mudança de Foco entre Ativados + respeito a exclusões de vida (CX-08).  
* Não fundir CX-09 com CX-03, CX-04 ou CX-08.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-09 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-04, CX-05, CX-07, CX-08, CX-10, CX-14, CX-15 | Lente; espelho; intenção; canal; sinais; vida; meios; renovação; continuidade |
| **Domínios** | D1, D3 | Privilégio/espelho; permanente do Foco |
| **DA** | DA-001, DA-002 | Objetivo sob Foco antes de meios; sobrevivência do Foco |
| **PX** | PX-07, PX-01, PX-02 | Estado governado; comando; objetivo |
| **IX** | IX-02, IX-01, IX-05, IX-08 | Foco refletido; COA; isolamento; atenção situacional |
| **F3-02** | Derivada; MVP-A Sim; O2 | Governança mínima do MVP-A |
| **F3-01** | Ficha CX-09 | Inventário |
| **F3-04** | Entrada CX-09 | Catálogo |
| **F2 apoio** | F2-03 §§2, 4, 5; G-02, G-03; F2-02 ciclo | Prioridade, Foco, D1 |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-11 — Spec CX-09 (Foco Executivo); homologação CX-08 |
| Baseado em quê | F3-03; F3-02; F3-04; F2-03 §§2/4; CX-08 homologada |
| Resultado | Spec CX-09 **homologada** (Gate F3-11); F3-12 (CX-10) aberta |
