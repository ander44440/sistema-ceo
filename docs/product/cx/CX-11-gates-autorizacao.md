# CX-11 — Obter autorização humana (gates)

> **Status: Homologada — Gate F3-13 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada  
> **MVP arquitetural:** Sim  
> **Precedência:** O3  
> **Domínios:** D1 / D2 ↔ D4 (e fronteira com D5 — sem executar)  
> **Nome canônico (F3-04):** Obter autorização humana (gates)  
> **Bloco de execução (F3-02 O3):** etapa condicional da orquestração — O-03 / E-IN-05 entre o pedido de meios (**CX-10**) e a execução efetiva (**CX-12**)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Pausar o **encaminhamento ou a execução** quando risco, irreversibilidade ou ambiguidade exigirem, e **devolver o controle ao usuário** para autorizar ou rejeitar (P1; F2-02 O-03 / E-IN-05; IX-06) — **sem** transformar a pausa em superfície de orquestração ou escolha de meios.

### Papel na orquestração da execução (bloco O3)

CX-11 é a **etapa condicional** da orquestração no caminho pedido → efeito:

| Etapa O3 | Capacidade | Papel |
|----------|------------|--------|
| Entrada | CX-10 | Solicita meios / gera encaminhamento conceitual |
| **Condicional** | **CX-11** | Gate humano sobre o encaminhamento (ou retomada sob risco) |
| Saída observável | CX-12 | Acompanha execução e efeito **após** autorização (ou quando O-03 não exige gate) |

CX-11 **recebe** a solicitação/encaminhamento proveniente de **CX-10**. Não inventa meios; não executa. Autoriza ou aborta o que a orquestração (D4) já encaminhou conceitualmente — mantendo D4 **invisível**.

Sem CX-11, o bloco O3 ou avança com autonomia irreversível surpresa, ou força o usuário a “pilotar” meios para sentir controle — ambos violam P1 / IX-06 / IX-07.

---

## 2. Responsabilidade

### Compete a esta CX

* Interromper o fluxo quando O-03 exigir gate (risco, irreversibilidade, ambiguidade).  
* Apresentar o **pedido de autorização** de forma compreensível na superfície legítima (D1/D2 — tipicamente **CX-03** / **CX-05**), **sem** expor o plano interno de meios.  
* Registrar o ato do usuário: **autorizar** ou **rejeitar** (E-IN-05).  
* Em autorização: liberar a continuidade do encaminhamento para **CX-12** (D5 executa).  
* Em rejeição: abortar ou devolver ao ciclo de intenção/atenção **sem** executar.  
* Preservar a **invisibilidade da orquestração** (IX-07): o gate fala de *consequência / risco / o que será feito em linguagem de comando*, não de *qual ferramenta/modelo/agente*.  
* Operar sob o COA ativo, Foco e objetivo Ativado coerentes com o pedido de **CX-10** (**CX-01**, **CX-09**, **CX-08**).

### Não compete a esta CX

* Formular o pedido de meios (**CX-10**) — CX-11 consome encaminhamento já existente.  
* **Executar** o trabalho ou acompanhar efeito operacional (**CX-12** / D5).  
* Decidir quais meios usar (O-02) ou replanejar meios internamente (O-05) — isso permanece em D4, invisível.  
* Expor seletor de ferramentas, home de orquestração ou telemetria como substituto do gate.  
* Governar ciclo de vida (**CX-08**) ou Foco (**CX-09**) — salvo efeitos de atenção após rejeição.  
* Promover ao permanente (**CX-13**) ou renovar Atenção como capacidade própria (**CX-14**).  
* Autonomia irreversível sem gate quando O-03 exige (B-10).  
* Definir layout, componentes ou wireframes.

### Delimitação CX-11 × CX-12

| | **CX-11** | **CX-12** |
|---|-----------|-----------|
| Pergunta | *Posso / devo seguir?* | *O que está acontecendo / qual o efeito?* |
| Ato | Autorizar ou rejeitar | Observar execução e efeito |
| Domínio | D1/D2 ↔ D4 (fronteira) | D5 → D1/D2 |
| Orquestração | Visível só como *gate de comando*; meios invisíveis | Não revela meios; revela efeito compreensível |
| Dependência | Recebe de CX-10; condicional | Após CX-10; e após CX-11 quando gate exigido |

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| Encaminhamento / pedido de meios a autorizar | Transitório | **CX-10** (obrigatório) |
| Sinal de que O-03 exige gate (risco, irreversibilidade, ambiguidade) | Transitório (decisão D4) | Orquestração invisível; disparado no fluxo pós-CX-10 |
| COA ativo | Permanente | **CX-01** |
| Foco / objetivo Ativado do pedido | Permanente | **CX-09** / **CX-08** |
| Recorte situacional para explicar o que está em jogo | Permanente / situacional | **CX-07**; espelho **CX-03** |
| Ato do usuário (autorizar / rejeitar) | Ato do usuário | Usuário (via **CX-05** / atenção **CX-03**) |
| Limites já explicitados | Transitório | **CX-16** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Autorização concedida (seguir encaminhamento) | Ato / transitório | **CX-12** (habilita execução observável) |
| Rejeição / aborto do encaminhamento | Ato / transitório | **CX-04** / **CX-05** / **CX-03** (retoma comando sem executar) |
| Estado “aguardando autorização” compreensível | Transitório espelhável | **CX-03**; **CX-05** |
| Registro relevante da decisão de gate (quando importar à governança) | Permanente (se promovido depois) | Via **CX-13** / **CX-17** — não grava CX-11 sozinha como arquivo técnico |

**Não é saída desta CX:** plano de meios; efeito de execução; conclusão do objetivo; escolha de ferramenta.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-10** | ⇢ — sem solicitação/encaminhamento, não há o que autorizar |
| Depende de | **CX-05** / **CX-03** | ↔ — superfície legítima do gate |
| Depende de | **CX-01** | → estrutural |
| Coerência | **CX-08**, **CX-09** | ↔ — gate no contexto de vida/Foco do pedido |
| É pré-requisito condicional de | **CX-12** | ⇢ — quando O-03 exige gate, CX-12 só após autorização |
| Relacionada | **CX-07** | ↔ — contexto do que está em risco |
| Relacionada | **CX-16** | ↔ — honestidade de limites no pedido de autorização |
| Relacionada | **CX-04** | ↔ — rejeição pode devolver à intenção |

**Precedência F3-02:** O3 (com CX-10 e CX-12; dependência **condicional** CX-11 → CX-12).  
**Nota F3-02:** sem gate, CX-12 depende de CX-10 diretamente; com gate, CX-11 é obrigatória no caminho.

---

## 6. Critérios de conclusão

A capacidade CX-11 considera-se **realizada** na experiência quando:

1. Diante de encaminhamento proveniente de **CX-10** que exija O-03, o fluxo **pausa** e pede autorização ao usuário.  
2. O usuário pode **autorizar** ou **rejeitar** de forma explícita e compreensível (E-IN-05).  
3. A orquestração de meios permanece **invisível** — o gate não vira seletor de ferramentas.  
4. Autorização habilita **CX-12**; rejeição **não** executa.  
5. CX-11 não substitui nem absorve o acompanhamento de efeito (**CX-12**).  
6. Gate não fica escondido só em telemetria; tampouco há autonomia irreversível surpresa quando O-03 exige (B-10).  
7. Coerência com COA, Foco e objetivo Ativado do pedido (CX-01/08/09).  
8. Narrativa UXC compatível com IX-06 / P1 / F2-02 O-03, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-11 |
|----|-------------------|
| **IX-06** | Controle humano / gate — núcleo |
| **IX-07** | Orquestração invisível — gate sem expor meios |
| **P1 / PX-01** | Autoridade máxima do usuário na autorização |
| **F2-02 O-03 / E-IN-05** | Exigir gate; autorizar/rejeitar |
| **B-10** | O-03 não pode ser contornado |
| **DA-001** | Gate não introduz escolha de ferramenta pelo usuário |
| **F2-02** | D4 não executa; autorização libera encaminhamento a D5 |
| **IX-01 / IX-05** | Gate só no COA ativo |
| **PX-08** | Honestidade sobre risco/irreversibilidade |

**Restrições adicionais:**

* Forma mínima MVP-A: pausa + autorizar/rejeitar + continuidade sem UI de meios.  
* Não fundir CX-11 com CX-10 (pedido) nem CX-12 (efeito).  
* Dependência de CX-12 é **condicional** (F3-02).  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-11 | Esta especificação |
| **CX relacionadas** | CX-10, CX-12, CX-03, CX-05, CX-01, CX-04, CX-07, CX-08, CX-09, CX-16 | Pedido; efeito; superfície; canal; lente; intenção; contexto; vida; Foco; limites |
| **Domínios** | D1, D2 ↔ D4; fronteira D5 | Atenção/conversa; orquestração; não executa |
| **DA** | DA-001 | Gate sem seletor de meios |
| **PX** | PX-01, PX-08, PX-04 | Autoridade; honestidade; canal conversacional |
| **IX** | IX-06, IX-07, IX-01, IX-05 | Gate; invisível; COA; isolamento |
| **F3-02** | Derivada; MVP-A Sim; O3; condicional → CX-12 | Bloco de execução |
| **F3-01** | Ficha CX-11 | Inventário |
| **F3-04** | Entrada CX-11 | Catálogo |
| **F2 apoio** | F2-02 O-03, E-IN-05, B-10; ciclo Orquestração→Gate→Execução | Papel na orquestração |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-13 — Spec CX-11; homologação CX-10 |
| Baseado em quê | F3-03; F3-02 O3; F3-04; F2-02 O-03/E-IN-05; IX-06/07; CX-10 |
| Resultado | Spec CX-11 **homologada** (Gate F3-13); F3-14 (CX-12) aberta |
