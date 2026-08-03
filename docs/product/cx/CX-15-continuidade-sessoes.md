# CX-15 — Preservar continuidade entre sessões

> **Status: Homologada — Gate F3-17 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada / Transversal*  
> **MVP arquitetural:** Sim  
> **Precedência:** O5  
> **Domínios:** D3 → D1  
> **Nome canônico (F3-04):** Preservar continuidade entre sessões  
> **Bloco de continuidade (F3-02 O5):** continuidade **inter-sessões** — distinta da renovação **intra-ciclo** (**CX-14**)  
> **Marco do ciclo:** [`../marco-ciclo-executivo-ate-promocao.md`](../marco-ciclo-executivo-ate-promocao.md)  
> **Marco de continuidade:** [`../marco-bloco-continuidade.md`](../marco-bloco-continuidade.md)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

\*F3-02: derivada na construção; transversal no tempo.

---

## 1. Propósito

Garantir que, ao **reabrir** o mesmo COA após o fim de uma sessão (posto de comando), a experiência **restaure o estado governado permanente** — objetivos, Foco (ou ausência explícita), atenção derivada do permanente — e permita a **retomada de trabalho** sem tratar logout como ato de ciclo de vida (DA-002; F2-03 §6; IX-04; G-04).

Sem CX-15, o ciclo executivo funcional existe *dentro* da sessão, mas o patrimônio e a governança não atravessam o tempo entre postos — violando DA-002.

---

## 2. Responsabilidade

### Compete a esta CX

* Preservar, além da sessão, o **Estado Permanente** do COA (objetivos e seus estados de vida, Foco governado, conhecimento promovido).  
* Na **retomada** no mesmo COA: restaurar lente (**CX-01**), estados de vida (**CX-08**), Foco (**CX-09**), quadro de Atenção derivado do permanente (**CX-03** / eco de **CX-14**).  
* Explicitar **pendências transitórias honestas** na retomada (ex.: promoção ainda pendente) — sem fingir permanente nem apagar o vestígio (F2-03 §6.2; com **CX-16**).  
* Distinguir **continuidade inter-sessões** (esta CX) de **continuidade intra-ciclo / Nova Atenção** (**CX-14**).  
* Impedir que encerrar sessão seja interpretado como suspender, concluir ou cancelar objetivos (G-04).

### Não compete a esta CX

* Renovar Nova Atenção *dentro* do ciclo contínuo após promoção (**CX-14**).  
* Promover ao permanente (**CX-13**) — apenas restaura o que já é permanente e sinaliza pendências.  
* Executar, autorizar ou pedir meios (**CX-10**…**CX-12**).  
* Reexecutar automaticamente trabalho sem nova intenção do usuário.  
* Trocar COA (**CX-02**) — embora a continuidade seja *por* COA.  
* Definir layout, componentes ou wireframes.

### Distinção explícita: CX-14 × CX-15

| | **CX-14 — Intra-ciclo** | **CX-15 — Inter-sessões** |
|---|-------------------------|---------------------------|
| Momento | Após atualização do permanente *na mesma* jornada de ciclo | Após **fim de sessão** e **reabertura** do posto |
| Pergunta | *O quadro de Atenção reflete o que acabou de ser promovido?* | *O que governei ontem ainda está aqui ao voltar?* |
| Disparo | F-Ret / pós-CX-13 | E-OUT-05 (saída) → nova sessão no mesmo COA |
| Não faz | Sobreviver ao logout | Fechar o ciclo Objetivo→…→Nova Atenção |
| Precedência | O4 | O5 (após O0–O4 íntegros no MVP-A) |

**Regra:** Nova Atenção (CX-14) fecha o *ciclo*; continuidade entre sessões (CX-15) atravessa o *tempo entre postos*. Não são a mesma capacidade.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| Permanente do COA a preservar/restaurar | Permanente | **CX-07** / **CX-13** |
| Estados de vida dos objetivos | Permanente | **CX-08** |
| Foco governado (ou ausência explícita) | Permanente | **CX-09** |
| Identidade do COA a retomar | Permanente (lente) | **CX-01** |
| Ato de encerrar / reabrir sessão | Ato do usuário | Usuário (posto) |
| Pendências transitórias ao fechar (se houver) | Transitório | Ciclo / **CX-12**–**CX-13**; honestidade **CX-16** |
| Quadro de Atenção a derivar na retomada | Permanente projetado | **CX-03** (alimentado pelo permanente, não por chat efêmero) |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Estado governado restaurado no mesmo COA | Permanente projetado | **CX-01**; **CX-08**; **CX-09**; **CX-03** |
| Quadro de Atenção coerente com o permanente (não com conversa perdida) | Permanente projetado | **CX-03**; usuário |
| Pendências transitórias explícitas na retomada (quando houver) | Transitório honestamente marcado | Usuário; **CX-16**; possível retorno a **CX-13** |
| Condições para retomada de intenção/trabalho | Situacional | **CX-04**; **CX-05** — sem autoexecução |

**Não é saída desta CX:** suspensão/conclusão automática por logout; reexecução automática; Nova Atenção pós-promoção (CX-14).

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-01** | → — lente a restaurar |
| Depende de | **CX-07** | → — permanente |
| Depende de | **CX-08**, **CX-09** | → — estado governado a restaurar |
| Depende de | **CX-03** | → — quadro derivado na retomada |
| Relacionada | **CX-13** | ↔ — o que foi promovido sobrevive; pendências de promoção |
| Relacionada (distinta) | **CX-14** | ↔ — intra-ciclo ≠ inter-sessões |
| Relacionada | **CX-16** | ↔ — honestidade na retomada |
| Relacionada | **CX-04**, **CX-05** | ↔ — retomada de trabalho com intenção |

**Precedência F3-02:** O5 (após O0–O4; amarra o MVP-A no tempo).  
**Anti-precedências:** tratar logout como CX-08; fundir CX-15 com CX-14; restaurar a partir de conversa efêmera em vez do permanente.

---

## 6. Critérios de conclusão

A capacidade CX-15 considera-se **realizada** na experiência quando:

1. Ao reabrir o mesmo COA, objetivos, Foco e atenção derivada do **permanente** estão **restaurados**.  
2. Encerrar sessão **não** suspende, conclui nem cancela objetivos (G-04).  
3. Distinção clara entre renovação intra-ciclo (**CX-14**) e continuidade inter-sessões (**esta CX**).  
4. Pendências transitórias na retomada são **honestas** (não fingem permanente nem somem).  
5. Não há reexecução automática sem intenção do usuário.  
6. Precedência O5 / dependências de CX-01, 07, 08, 09, 03 respeitadas.  
7. Narrativa UXC compatível com DA-002 / F2-03 §6 / IX-04, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-15 |
|----|-------------------|
| **DA-002** | Diretriz central — sobrevivência do conhecimento/estado do COA |
| **G-04** | Sessão ≠ ciclo de vida |
| **F2-03 §6** | O que sobrevive; regras de continuidade e retomada |
| **IX-04** | Continuidade / sobrevivência pós-sessão |
| **IX-05 / IX-01** | Isolamento; restauração no COA correto |
| **IX-09** | Pendência transitória ≠ permanente na retomada |
| **E-OUT-05** | Saída do posto não apaga permanente |
| **PX-06** | Continuidade do comando no tempo |
| **DA-001** | Retomada não vira toolbox automática |

**Restrições adicionais:**

* Forma mínima MVP-A: restaurar COA + vida/Foco + atenção do permanente + honestidade de pendências.  
* Não fundir CX-15 com CX-14.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-15 | Esta especificação |
| **CX relacionadas** | CX-01, CX-03, CX-07, CX-08, CX-09, CX-13, CX-14, CX-16, CX-04, CX-05 | Lente; quadro; permanente; vida; Foco; promoção; intra-ciclo; limites; intenção; canal |
| **Domínios** | D3 → D1 | Permanente restaura Atenção entre sessões |
| **DA** | **DA-002** (central) | Sobrevivência e retomada |
| **PX** | PX-06, PX-07, PX-08 | Continuidade; estado; honestidade |
| **IX** | IX-04, IX-05, IX-01, IX-09 | Continuidade; isolamento; COA; transitório |
| **F3-02** | Derivada/Transversal; MVP-A Sim; O5 | Amarra O0–O4 no tempo |
| **F3-01** | Ficha CX-15 | Inventário |
| **F3-04** | Entrada CX-15 | Catálogo |
| **F2 apoio** | F2-03 §6; G-04; F2-02 E-OUT-05 | Continuidade entre sessões |
| **HP** | — | — |
| **Marco** | Ciclo Executivo Funcional integral | Pré-condição: ciclo O4 fechado; CX-15 é continuidade temporal |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-17 — Spec CX-15; homologação CX-14; marco ciclo integral |
| Baseado em quê | F3-03; F3-02 O5; F3-04; DA-002; F2-03 §6; distinção CX-14 |
| Resultado | Spec CX-15 **homologada** (Gate F3-17); bloco Continuidade encerrado; F3-18 (CX-16) aberta |
