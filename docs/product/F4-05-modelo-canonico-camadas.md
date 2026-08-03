# F4-05 — Modelo Canônico de Camadas Arquiteturais

> **Status: Homologada — Gate F4-05 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Escopo MVP-A:** CX-01, CX-03…CX-05, CX-07…CX-16  
> **Padrão:** [`F4-02-modelo-canonico-arquitetura-tecnica.md`](F4-02-modelo-canonico-arquitetura-tecnica.md) — **obrigatório**  
> **Força:** este Modelo de Camadas = **obrigatório** para toda a Arquitetura Técnica.  
> **Diretrizes / Normas:** D-F4-01…03; N-F4-01…03  
> **Princípios:** PAT-01…PAT-12  
> **Visão:** [`F4-04-visao-canonica-arquitetura-tecnica.md`](F4-04-visao-canonica-arquitetura-tecnica.md)  
> **Marco:** [`marco-fundacao-estrutural-arquitetura-tecnica.md`](marco-fundacao-estrutural-arquitetura-tecnica.md)  
> **Proibições:** sem componentes; sem tecnologias; sem APIs; sem infraestrutura; sem implementação; sem wireframes; sem commit neste registro.

---

## 1. Objetivo do artefato

Normatizar o **Modelo Canônico de Camadas Arquiteturais**: responsabilidade, **limites**, dependências **permitidas e proibidas**, e **regras de comunicação** entre L0–L5 e Tx — aprofundando a Visão Canônica (F4-04) sem introduzir componentes, tecnologias, APIs ou infraestrutura.

Este artefato é o contrato de fronteiras entre camadas; F4-06+ detalha módulos *dentro* dessas fronteiras.

---

## 2. Responsabilidades técnico-lógicas

### Compete a este artefato

* Definir responsabilidade e limites de **cada** camada (L0–L5, Tx).  
* Estabelecer dependências permitidas e proibidas entre camadas.  
* Definir regras de comunicação (o que pode circular, em que sentido, com que classe de estado).  
* Manter rastreabilidade F1/F2/F3/PAT.  
* Servir de norma para validação de desenhos posteriores.

### Não compete a este artefato

* Nomear componentes, serviços, filas ou bancos.  
* Definir APIs, schemas ou protocolos.  
* Escolher tecnologias (PAT-12).  
* Alterar a macroestrutura oficial (F4-04) sem deliberação.  
* Alterar CX ou PAT (D-F4-02).  
* UX/UI (F5).

---

## 3. Entradas e saídas lógico-técnicas

| Item | Direção | Classe | Origem/destino |
|------|---------|--------|----------------|
| Macroestrutura L0–L5 + Tx | Entrada | Permanente | F4-04 |
| PAT-01…12; F2; F3; DA | Entrada | Permanente | F4-03; F1–F3 |
| Fichas de camada (limites) | Saída | Permanente | F4-06+; auditoria |
| Matriz de dependências permitidas/proibidas | Saída | Permanente | Gates F4 |
| Regras de comunicação | Saída | Permanente | Desenho de módulos |

---

## 4. Dependências e responsabilidades cruzadas

| Relação | Alvo | Tipo |
|---------|------|------|
| Depende de | F4-04 (visão / IDs de camada) | → estrutural |
| Depende de | F4-01…03 | → estrutural |
| Depende de | F2-01/02; F3-02/04 | → estrutural |
| É pré-requisito de | F4-06+ (módulos sob camadas) | → |
| Relacionada | CX MVP-A | ↔ — realização por camada |

---

## 5. Critérios de validação técnica

1. Toda camada L0–L5 e Tx tem responsabilidade, limites e CX.  
2. Matriz de dependências permitidas/proibidas é completa e coerente com PAT-02 (L4≠L5).  
3. Regras de comunicação respeitam Transitório/Permanente e invisibilidade de L4.  
4. Nenhuma CX MVP-A fica sem camada; nenhuma camada introduz “escolha de meios”.  
5. Rastreabilidade F1/F2/F3/PAT explícita; conformidade F4-02 / D-F4 / N-F4.  
6. Zero tech/componentes/APIs/infra.

---

## 6. Restrições arquiteturais

* Não redefinir IDs de camada fora de F4-04 sem deliberação.  
* Não permitir dependência proibida “por conveniência de implementação”.  
* Não usar comunicação entre camadas para expor orquestração ao usuário.  
* Exceções: N-F4-03.

---

## 7. Modelo canônico das camadas

### 7.1 Responsabilidade e limites por camada

#### L0 — Lente COA

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Estabelecer e manter o **único COA ativo**; recortar todas as camadas; garantir isolamento entre patrimônios |
| **Limite superior** | Não é conteúdo de atenção, conversa ou conhecimento — é a *lente* |
| **Limite inferior** | Não executa, não encaminha meios, não promove permanente |
| **CX** | CX-01 (CX-02 fora do MVP-A) |
| **PAT** | PAT-05, PAT-07 |

#### L1 — Comando (Atenção + Conversa)

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Posto perceptível: quadro situacional (Atenção) e conversa como interface principal de intenção |
| **Limite** | Não governa ciclo de vida/Foco (L2); não é arquivo (L3); não encaminha meios (L4); não executa (L5) |
| **CX** | CX-03, CX-05 (+ eco CX-14/16) |
| **PAT** | PAT-01, PAT-08 |

#### L2 — Governança de Objetivos

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Ciclo de vida dos objetivos e Foco executivo no COA ativo |
| **Limite** | Não declara meios; não executa; não substitui conversa (L1); não é o permanente genérico (L3) — apenas o estado governado de objetivos/Foco nele ancorado |
| **CX** | CX-04, CX-08, CX-09 |
| **PAT** | PAT-09 |

#### L3 — Patrimônio (Conhecimento)

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Consultar/ancorar Estado Permanente; receber promoção seletiva; sobreviver a tarefa/sessão |
| **Limite** | Não promove *por si* o andamento bruto (isso é seletivo pós-L5); não é log de execução; não orquestra |
| **CX** | CX-07, CX-13 |
| **PAT** | PAT-03, PAT-04 |

#### L4 — Encaminhamento

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Pedido de meios → decisão/encaminhamento **invisível**; gates humanos quando exigidos |
| **Limite** | **Nunca executa** (PAT-02); nunca é superfície de escolha de ferramenta; não grava patrimônio no lugar de L3 |
| **CX** | CX-10, CX-11 |
| **PAT** | PAT-01, PAT-02, PAT-10 |

#### L5 — Execução e Efeito

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Executar ação autorizada; tornar efeito/bloqueio perceptível em linguagem de comando |
| **Limite** | Não escolhe meios; não promove ao permanente (L3/CX-13); não substitui Atenção (L1) |
| **CX** | CX-12 |
| **PAT** | PAT-02, PAT-04 |

#### Tx — Continuidade e Honestidade

| | Conteúdo |
|---|----------|
| **Responsabilidade** | Nova Atenção pós-atualização; continuidade entre sessões; explicitar limites e transitório |
| **Limite** | Não substitui L1–L5; não promove; não executa; não redefine Foco por logout |
| **CX** | CX-14, CX-15, CX-16 |
| **PAT** | PAT-03, PAT-08, PAT-11 |

---

### 7.2 Dependências permitidas

| De | Para | Tipo | Condição |
|----|------|------|----------|
| L0 | L1…L5, Tx | → lente | Sempre — operação sob COA ativo |
| L3 | L1 | → alimento | Permanente projeta atenção |
| L3 | L2 | → âncora | Estados de vida/Foco no permanente |
| L3 | L4 | → recorte | Contexto para decisão de meios |
| L1 | L2 | ↔ | Intenção ↔ consolidação de vida/Foco |
| L1 | L4 | → pedido | Intenção clara; sob Foco/Ativado (L2) |
| L2 | L4 | → pré-condição | Objetivo Ativado + Foco coerente |
| L4 | L5 | → encaminhamento | Após decisão; + autorização se gate |
| L5 | L1 | → efeito | Estado em curso / efeito / bloqueio (sem log como centro) |
| L5 | L3 | ⇒ candidato | Efeito transitório elegível a promoção seletiva |
| L3 | Tx / L1 | → renovação | Pós-promoção → Nova Atenção |
| Tx | L0, L2, L3, L1 | → restauração | Retomada de sessão |
| Tx | L1, L4, L5 | ↔ honestidade | Limites / transitório / gate legível |

---

### 7.3 Dependências proibidas

| De | Para | Motivo | PAT / F3 |
|----|------|--------|----------|
| L5 | L4 | Execução não orquestra | PAT-02 |
| L4 | L1 como home | Orquestração não é superfície | PAT-01, IX-07 |
| L4 | L3 gravação direta de plano | Plano de meios ≠ permanente | PAT-04 |
| L5 | L3 promoção total automática | Seletividade obrigatória | PAT-04; CX-13 |
| L1 | L5 | Conversa não executa | F2-02 |
| L2 | L5 | Governança não executa | F2-02 |
| Qualquer | “escolha de meios pelo usuário” | Viola DA-001 | PAT-01 |
| L0 omitido | qualquer escrita de permanente | Sem lente | PAT-07 |
| Logout (Tx) | L2 suspender/concluir | Sessão ≠ ciclo de vida | PAT-03; G-04 |
| Camada evolutiva (multi-COA rico) | absorvida no MVP-A | Fora do escopo | D-F4-02 |

---

### 7.4 Regras de comunicação entre camadas

| ID | Regra |
|----|-------|
| **C1** | Toda comunicação ocorre **sob L0** (COA ativo); payload conceitual carrega identidade do COA. |
| **C2** | Classificar o que circula: **Permanente**, **Transitório** ou **Ato** (F2-02). Transitório não atravessa sessão como se permanente (salvo pendência honesta via Tx). |
| **C3** | L1↔L2: atos de intenção e governança; não circulam planos de meios. |
| **C4** | L1→L4: apenas pedido de cumprimento / intenção + recorte necessário; **sem** seletor de meios. |
| **C5** | L4→L5: encaminhamento autorizado (ou pós-gate); L5 **não** devolve plano interno de orquestração a L1. |
| **C6** | L5→L1: efeito em linguagem de comando (em curso / mudou / bloqueio); não dump de execução. |
| **C7** | L5→L3: apenas **candidatos** a promoção; L3/CX-13 decide o que permanente. |
| **C8** | L4 **não** fala com o usuário como camada de escolha; gates (CX-11) usam L1 (e atenção) em linguagem de risco/comando. |
| **C9** | Tx→L1: renovação de quadro ou restauração pós-sessão; não reexecuta L5 automaticamente. |
| **C10** | Comunicação que viole §7.3 é **inválida** arquiteturalmente — mesmo que “funcione” em implementação futura. |

---

### 7.5 Diagrama de comunicação (permitido)

```text
L0 ──recorta──► L1 L2 L3 L4 L5 Tx

L3 ──permanente──► L1, L2, L4
L1 ◄──► L2
L1 ──pedido──► L4 ──encaminha──► L5
L5 ──efeito──► L1
L5 ──candidato──► L3 ──(via Tx)──► L1  (Nova Atenção)
Tx ──restaura──► L0, L2, L3, L1
Tx ──honestidade──► L1, L4, L5
```

---

## 8. Rastreabilidade

| Eixo | Referências | Papel |
|------|-------------|-------|
| **F1** | DA-001 (C4, proibições L4); DA-002 (L3, C2, Tx); DA-003 (L0) | Diretrizes |
| **F2** | D1–D5↔L1–L5; COA↔L0; T≠P; D4≠D5; O-03 | Conceito |
| **F3** | CX por camada §7.1; F3-02 anti-precedências | Funcional |
| **PAT** | PAT-01…12 mapeados nas fichas e em §7.2–7.4 | Princípios oficiais |
| **F4** | F4-04 macroestrutura; F4-02/03; Estrutura Canônica | Visão e método |
| **PX/IX** | IX-01/05/06/07/09; PX-02/06/08 | Invariantes |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F4-05 — Modelo Canônico de Camadas; F4-04 homologada |
| Baseado em quê | F4-04; PAT; F2-02; F3; F4-02 |
| Resultado | F4-05 **homologada**; camadas obrigatórias; Fundação Estrutural consolidada; F4-06 aberta |
