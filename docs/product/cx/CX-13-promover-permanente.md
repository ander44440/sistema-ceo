# CX-13 — Aprender e promover ao Permanente

> **Status: Homologada — Gate F3-15 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada (de ciclo)  
> **MVP arquitetural:** Sim  
> **Precedência:** O4  
> **Domínios:** D5 → D3  
> **Nome canônico (F3-04):** Aprender e promover ao Permanente  
> **Bloco pós-execução (F3-02 O4):** Aprendizado → Atualização do Conhecimento (F-Ret); alimenta **CX-14** (Nova Atenção)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Realizar a etapa **Aprendizado → Atualização do Conhecimento** (F2-02 F-Ret): promover **seletivamente** contexto e efeitos relevantes do ciclo ao **Estado Permanente** do COA ativo — o patrimônio que sobrevive a tarefas, conversas e sessões (DA-002; IX-09).

**Nem todo** contexto, andamento ou resultado de execução deve ser promovido. A promoção é julgamento de comando, não arquivamento automático.

Sem CX-13, o ciclo executa e mostra efeito (CX-12), mas o conhecimento do COA não se atualiza — ou tudo vira “memória”, incluindo plano bruto de orquestração e ruído transitório.

---

## 2. Responsabilidade

### Compete a esta CX

* Avaliar o que, do efeito/aprendizado pós-execução, **merece** integrar o permanente do COA.  
* Realizar a **promoção seletiva** Transitório → Permanente em D3 (Atualização do Conhecimento).  
* Incluir, quando relevante à governança: efeitos consolidados, evidências promovidas, decisões/fundamentos, cancelamentos relevantes (E-OUT-03).  
* Alimentar o permanente que **CX-07** consulta e que **CX-03** / **CX-14** usam para Nova Atenção.  
* Explicitar, na experiência, a distinção entre o que **foi só do ciclo** e o que **passou a ser patrimônio** (IX-09; com **CX-16** quando útil).  
* Operar apenas no **COA ativo** — sem misturar patrimônios (IX-05; DA-002).

### Não compete a esta CX

* **Executar** a ação nem tornar o efeito perceptível no momento do comando (**CX-12**).  
* Solicitar meios (**CX-10**) ou autorizar gates (**CX-11**).  
* Renovar o quadro de Atenção como capacidade própria (**CX-14**) — apenas fornece a atualização que a motiva.  
* Promover **automaticamente** tudo o que transitou no ciclo.  
* Promover plano bruto de orquestração, andamento bruto da execução ou conversa completa como memória institucional (F2-02 §2.3).  
* Estabelecer/trocar COA (**CX-01** / **CX-02**).  
* Definir layout, componentes ou wireframes.

### Fronteira: CX-12 × CX-13

| | **CX-12 — Execução e efeito** | **CX-13 — Promoção ao permanente** |
|---|--------------------------------|-------------------------------------|
| Pergunta | *A ação autorizada correu? O que mudou agora?* | *O que disso deve sobreviver no COA?* |
| Classe | Efeito **transitório** observável | Patrimônio **permanente** (seletivo) |
| Domínio | D5 → D1/D2 | D5 → D3 |
| Inclui | Em curso; efeito; bloqueio | Promoção Transitório→Permanente; cancelamentos relevantes |
| Exclui | Memória institucional automática | Reexecutar a ação; dump de log como patrimônio |

**Regra:** CX-12 produz o candidato; CX-13 **escolhe o que promove**. Ver efeito ≠ ter promovido.

### Seletividade (obrigatória)

**Não promover por padrão:**

* plano de encaminhamento / orquestração;  
* andamento bruto da execução;  
* conversa completa;  
* qualquer rastro cujo único fim foi viabilizar a execução.

**Candidatos típicos à promoção (quando o julgamento de comando assim decidir):**

* efeito consolidado relevante ao objetivo/Foco;  
* evidência que altera o contexto do COA;  
* decisão/fundamento que deve sobreviver;  
* cancelamento relevante à governança.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| Efeito / evidência candidata (pós-execução) | Transitório | **CX-12** |
| COA ativo (destino do permanente) | Permanente (lente) | **CX-01** |
| Recorte atual do conhecimento (para integrar sem contradizer às cegas) | Permanente | **CX-07** |
| Objetivo Ativado / Foco (critério de relevância) | Permanente | **CX-08** / **CX-09** |
| Julgamento de promoção (o que importa ao comando) | Ato / julgamento | Usuário e ciclo (via **CX-05** / Atenção) |
| Cancelamento / rejeição relevante (quando houver) | Transitório | **CX-11** / ciclo (E-OUT-03) |
| Limites sobre o que ainda é transitório | Transitório | **CX-16** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Elementos promovidos ao Estado Permanente do COA | Permanente | D3; **CX-07**; **CX-15** |
| Atualização do conhecimento disponível à Atenção | Permanente projetado | **CX-14** → **CX-03** |
| Registro de não-promoção implícito (o que permaneceu transitório e se encerra) | — (descarta / encerra transitório) | Ciclo; honestidade via **CX-16** |
| Cancelamento relevante promovido (quando devido) | Permanente | D3 / governança |

**Não é saída desta CX:** reexecução; Nova Atenção já renovada (CX-14); exposição de meios.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-12** | ⇢ / ⇒ — efeito candidato a promover |
| Depende de | **CX-07** | → — destino/leitura do permanente |
| Depende de | **CX-01** | → estrutural |
| Relacionada | **CX-08**, **CX-09** | ↔ — relevância ao objetivo/Foco |
| Relacionada | **CX-05**, **CX-03** | ↔ — julgamento e espelho pós-atualização |
| É pré-requisito de | **CX-14** | ⇢ — Nova Atenção após atualização |
| Relacionada | **CX-15** | ↔ — permanente restaura entre sessões |
| Relacionada | **CX-16** | ↔ — transitório ≠ permanente |
| Relacionada | **CX-17** | ↔ — decisão/justificativa pode ser promovida |
| Relacionada | **CX-10**, **CX-11** | ↔ — origem do ciclo; não promovem orquestração |

**Precedência F3-02:** O4 (após O3: CX-10…12).  
**Anti-precedência:** promover sem efeito/candidato de CX-12; promover plano de meios como patrimônio.

---

## 6. Critérios de conclusão

A capacidade CX-13 considera-se **realizada** na experiência quando:

1. Após efeito de **CX-12**, é possível **promover seletivamente** o que deve integrar o permanente do COA.  
2. Fica claro que **nem todo** contexto/resultado é promovido.  
3. Fronteira CX-12 × CX-13 é observável na narrativa: ver efeito ≠ ter virado patrimônio.  
4. Plano de orquestração / andamento bruto / conversa completa **não** viram memória institucional por padrão.  
5. O permanente atualizado é consultável via **CX-07** e alimenta **CX-14**.  
6. Promoção respeita o **COA ativo** (DA-002 / IX-05).  
7. Cancelamentos relevantes *podem* ser promovidos quando a governança exigir — sem obrigar promoção de todo aborto.  
8. Narrativa UXC compatível com DA-002 / IX-09 / F-Ret, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-13 |
|----|-------------------|
| **DA-002** | Diretriz central — conhecimento do COA sobrevive; promoção é o caminho formal |
| **IX-09** | Transitório ≠ permanente — núcleo da seletividade |
| **F2-02 §2.3 / F-Ret** | O que promove / o que não promove; retorno do conhecimento |
| **PX-06** | Continuidade do ciclo e do conhecimento |
| **IX-05 / IX-01** | Isolamento; só no COA ativo |
| **IX-07** | Não promover orquestração como superfície de memória |
| **DA-001** | Patrimônio ancora objetivo/contexto, não catálogo de ferramentas |
| **E-OUT-05** | Fim de sessão **não** apaga permanente (articulação CX-15) |

**Restrições adicionais:**

* Forma mínima MVP-A: promoção seletiva pós-efeito + permanente atualizado no COA.  
* Não fundir CX-13 com CX-12 (efeito) nem CX-14 (Nova Atenção).  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-13 | Esta especificação |
| **CX relacionadas** | CX-12, CX-07, CX-14, CX-01, CX-08, CX-09, CX-03, CX-05, CX-15, CX-16, CX-17 | Efeito; permanente; renovação; lente; vida; Foco; espelho; canal; continuidade; limites; decisão |
| **Domínios** | D5 → D3 | Aprendizado → atualização do patrimônio |
| **DA** | **DA-002** (central); DA-001 | Sobrevivência do conhecimento; âncora de comando |
| **PX** | PX-06, PX-08, PX-10 | Continuidade; honestidade; aprendizado |
| **IX** | IX-09, IX-05, IX-01, IX-07 | Seletividade; isolamento; COA; não promover meios |
| **F3-02** | Derivada de ciclo; MVP-A Sim; O4 | Pós-execução |
| **F3-01** | Ficha CX-13 | Inventário |
| **F3-04** | Entrada CX-13 | Catálogo |
| **F2 apoio** | F2-02 §2 Transitório/Permanente, F-Ret, O-06 | Promoção formal |
| **HP** | HP-006 (obs., indireto) | Justificativa pode viver no permanente — não promove a hipótese |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-15 — Spec CX-13; homologação CX-12 |
| Baseado em quê | F3-03; F3-02 O4; F3-04; DA-002; IX-09; F2-02 F-Ret; fronteira CX-12 |
| Resultado | Spec CX-13 **homologada** (Gate F3-15); ciclo executivo até promoção registrado; F3-16 (CX-14) aberta |
