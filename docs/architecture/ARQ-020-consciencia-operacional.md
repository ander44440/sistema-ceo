# ARQ-020 — Consciência Operacional

> **Status: Homologada v0.1** (01/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-020.  
> **Capacidade:** CAP-01 — Orquestração (consciência do Estado Executivo); apoio CAP-07 (Conversa); CAP-11 (integração com Fila/Dispatcher/Painel).  
> Norma superior: CON-001 (contexto; tempo do utilizador; sem respostas desligadas da realidade operacional); ADR-015; ADR-019; ADR-006; ARQ-016; ARQ-017; ARQ-018 / REQ-057; ARQ-019 / REQ-058; REQ-045; REQ-053; REQ-054; REQ-055; REQ-030.  
> **Finalidade:** arquitectura da **Consciência Operacional** — o CEO consulta o **Estado Executivo Atual** como contexto obrigatório antes de responder a intenções C2 ou C3.  
> **Gate:** homologada. **Próximo artefacto:** REQ-059 (Consciência Operacional).  
> **Sem implementação** até REQ homologado + IMP + autorização por etapa.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada arquitectural que obriga o Núcleo / CEO Digital a **ler e usar** o estado operacional corrente (Jobs, Gates, Dispatcher, CTO, Agent, Painel, frente activa) **antes** de deliberar ou encaminhar respostas a pedidos C2 e C3. |
| **Por que existe?** | Sem consciência operacional, o CEO pode recomendar «priorizar X» ou abrir novo C3 enquanto há Job em execução, Gate pendente ou Agent ocupado — respostas desligadas da realidade, risco de conflito de foco e violação do princípio de nunca perder o contexto (CON-001). |
| **Para quem existe?** | Patrocinador (recebe recomendações situadas); CEO Digital / Núcleo (consulta e formula); Painel (observa); Fila/Dispatcher/Agent/CTO (fontes de estado). |
| **Como medir sucesso?** | (1) Em C2/C3, existe consulta ao Estado Executivo Atual **antes** da resposta substantive; (2) Respostas reflectem Jobs/Gates/execução em curso quando relevantes; (3) Exemplo canónico §3.3 verificável; (4) Continuidade do Gate (ARQ-019) e Classificador (ARQ-018) **não** são substituídos; (5) Sem o CEO executar oficina (REQ-030). |

---

## 1. Objetivo

### 1.1 Objectivo

**Permitir que o CEO utilize o estado operacional atual como contexto obrigatório antes de responder ao utilizador**, de forma a alinhar deliberação (C2) e trabalho executivo (C3) com Jobs, Gates, Dispatcher, Agent, CTO, Painel e frente activa.

### 1.2 Objectivos operacionais

| ID | Objectivo |
|----|-----------|
| O1 | Definir o **Estado Executivo Atual** como snapshot canónico consultável. |
| O2 | Explicitar o **fluxo de Consciência Operacional** (classificar → consultar estado → responder/encaminhar). |
| O3 | Catalogar **fontes mínimas** de contexto e a sua **prioridade**. |
| O4 | Tornar a consulta **obrigatória** antes de respostas substantive a **C2** e **C3**. |
| O5 | Garantir que a prosa reflecte conflitos de foco (ex.: Job em execução vs. novo pedido de priorização). |
| O6 | Manter fronteiras: Consciência **observa e informa**; Fila/Dispatcher/Agent **executam**; Painel **visualiza**. |

### 1.3 Não-objectivos (desta ARQ)

| ID | Fora |
|----|------|
| NO1 | Implementar código, IMP, UI nova ou alteração de CON/ADR nesta fase. |
| NO2 | Redesign do Classificador, Motor, Continuidade do Gate ou Painel. |
| NO3 | Substituir a Continuidade do Gate (ARQ-019) — decisões de Gate continuam a ter prioridade própria. |
| NO4 | Auto-aprovação de Gates ou criação automática de Jobs a partir da consciência. |
| NO5 | Monitorização multi-utilizador / RBAC na V1. |

---

## 2. Escopo

### 2.1 Dentro do escopo (V1 arquitectural)

* Modelo de **Consciência Operacional** e de **Estado Executivo Atual**.  
* **Fluxo** §3: Classificador → (se C2/C3) consultar estado → composição da resposta / encaminhamento.  
* **Fontes mínimas** §4 e **prioridade** §5.  
* **Responsabilidades** §6.  
* **Critérios arquitecturais** §7 para futuros REQ/IMP.  
* Relação com: Classificador (ARQ-018); Motor / Gates (ARQ-017 / ARQ-019); Fila (REQ-045); Dispatcher (REQ-053); CTO (ARQ-015 / REQ-054); Painel (ARQ-016 / REQ-055); Memória / frente activa (COA).

### 2.2 Fora do escopo

* Código, schemas obrigatórios novos, ou emenda textual a ARQ-016…019 nesta fase (emendas futuras só se o Gate o exigir).  
* UI dedicada de «consciência» (o Painel já observa; V1 pode ser só lastro na Conversa).  
* Aplicar a regra a **C1** e **C4** como obrigação (podem usar estado de forma oportunista; não são o foco desta ARQ).  
* Abrir REQ/IMP antes da homologação desta ARQ.

### 2.3 Relação com o que já existe

| Peça | Papel face à Consciência |
|------|--------------------------|
| **Classificador (ARQ-018)** | Determina se a mensagem é C2/C3 (gatilho da consulta obrigatória). |
| **Continuidade do Gate (ARQ-019)** | Se há Gate pendente + decisão de léxico → Continuidade **antes**; Consciência não compete com a retoma do Gate. |
| **Motor (ARQ-017)** | Fonte de ciclo / Gate / estágio de execução. |
| **Fila (REQ-045)** | Fonte de Jobs `pending` / `running` / terminais. |
| **Dispatcher (REQ-053)** | Fonte de estado de despacho / watcher. |
| **CTO (REQ-054)** | Fonte de consultas CTO em curso / última resposta. |
| **Agent** | Fonte de ocupação / execução de oficina (observada, não controlada pelo browser CEO). |
| **Painel (ARQ-016)** | Agrega visão; Consciência **reutiliza** sinais compatíveis, não duplica UI. |
| **Frente activa / COA** | Contexto de projecto (ex.: MG2) para situar recomendações. |

---

## 3. Fluxo de Consciência Operacional

### 3.1 Regra principal

**Antes de responder qualquer pergunta ou pedido classificado como C2 (Conversa sobre Projeto) ou C3 (Trabalho Executivo), o CEO deverá consultar o Estado Executivo Atual.**

* C1 / C4: consulta **não** obrigatória na V1 (pode enriquecer se barato).  
* Decisão de Gate (ARQ-019): Continuidade processa **antes** da Consciência deliberativa — não reabre priorização no lugar de «Aprovado.».

### 3.2 Fluxo mínimo canónico

```text
Mensagem do utilizador
  → Continuidade do Gate? (Gate pendente + léxico)
       ├─ sim → fluxo ARQ-019 (fora do âmbito deliberativo desta ARQ)
       └─ não → Classificador (ARQ-018)
                    │
                    ├─ C1 / C4 → destino normal (consciência opcional)
                    │
                    └─ C2 / C3
                         → Consultar Estado Executivo Atual (fontes §4)
                         → Sintetizar conflitos / ocupação / Gates / Jobs
                         → Responder (C2) ou encaminhar ao Motor (C3)
                              com lastro operacional explícito quando relevante
```

### 3.3 Exemplo canónico (aceitação conceptual)

**Estado:** existe Job em execução (ex.: correção de bugs).

**Utilizador:** «Como devemos priorizar o MG2?»

**Resposta esperada (padrão):**  
«Neste momento existe uma execução em andamento para correção dos bugs. Minha recomendação é concluir essa execução antes de redefinir prioridades.»

*A resposta **deve** referenciar o estado operacional; **não** deve deliberar prioridades como se o sistema estivesse ocioso.*

### 3.4 Premissas do fluxo

1. O Estado Executivo Atual é um **snapshot** (ponto no tempo), não uma fonte de verdade paralela à Fila.  
2. A Consciência **não** cria Jobs nem aprova Gates.  
3. Em C3, o lastro operacional pode **sugerir** adiar novo despacho, clarificar, ou seguir para o Motor com aviso — política fina no REQ.  
4. Ambiguidade de estado (fonte indisponível) → degradar com transparência; **não** inventar Jobs.

### 3.5 O que a Consciência **não** faz

* Não substitui o Painel como superfície de observação.  
* Não substitui o Classificador nem a Continuidade do Gate.  
* Não invoca Agent/SDK no browser do CEO.  
* Não transforma C2 em C3 só porque há Jobs na fila.

---

## 4. Fontes de Contexto

### 4.1 Fontes mínimas V1 (obrigatórias no modelo)

| ID | Fonte | Sinal típico |
|----|-------|--------------|
| F1 | **Jobs pendentes** | Jobs `pending` na Fila (REQ-045) |
| F2 | **Jobs em execução** | Jobs `running` (e ciclo Motor em Execucao/Monitoramento) |
| F3 | **Gates pendentes** | Gate do Motor / Continuidade à espera de decisão (ARQ-017 / ARQ-019) |
| F4 | **Dispatcher** | Estado do dispatcher / watcher (activo, ocioso, erro) — REQ-053 |
| F5 | **CTO** | Consulta CTO em curso ou última interação relevante — REQ-054 |
| F6 | **Agent** | Ocupação / execução de oficina (observada) |
| F7 | **Painel de Orquestração** | Agregado observacional compatível com ARQ-016 (não fonte soberana) |
| F8 | **Frente activa** | COA / projecto activo (ex.: MG2) |

### 4.2 Estado Executivo Atual (vista conceptual)

O Estado Executivo Atual é a **síntese** das fontes F1–F8 num pacote mínimo para o Núcleo, por exemplo:

* `jobsPendentes[]` / `jobsEmExecucao[]` (ids, títulos curtos)  
* `gatesPendentes[]` (parecerId / resumo)  
* `dispatcher` / `agent` / `cto` (estado resumido)  
* `frenteActiva` (id/nome)  
* `conflitosFoco[]` (derivados — ex.: «Job running + pedido de re-priorização»)

Detalhe de schema → REQ.

---

## 5. Prioridade das Fontes

Quando várias fontes estão activas, a Consciência deve ponderar na seguinte **ordem de prioridade** (da mais vinculativa para a mais contextual):

| Prioridade | Fonte | Porquê |
|------------|-------|--------|
| P1 | **Gates pendentes** | Decisão humana em aberto bloqueia ou condiciona despacho |
| P2 | **Jobs em execução** | Trabalho já em curso — evitar re-priorização cega |
| P3 | **Jobs pendentes** | Fila de compromisso já aceite |
| P4 | **Agent** / **Dispatcher** | Capacidade real de absorver novo trabalho |
| P5 | **CTO** | Consulta arquitetural em curso pode condicionar C2 |
| P6 | **Painel** | Vista agregada (secundária se F1–F5 já cobrem) |
| P7 | **Frente activa** | Enquadra o domínio (MG2), não sobrepõe ocupação operacional |

### 5.1 Regras de resolução

1. Gate pendente (P1) **nunca** é ignorado em C2/C3 deliberativo — mencionar ou remeter à Continuidade.  
2. Job em execução (P2) perante pedido de «priorizar / replanejar» → recomendar **concluir ou explicitamente suspender** antes de redefinir prioridades (exemplo §3.3).  
3. Frente activa (P7) **contextualiza** a prosa; não justifica ignorar P1–P2.  
4. Empate entre fontes do mesmo nível → mencionar ambas de forma mínima (CON-001: sem parede de texto).

---

## 6. Responsabilidades

| Actor / componente | Responsabilidade | Não faz |
|--------------------|------------------|---------|
| **Utilizador** | Pergunta / pede trabalho | Não precisa listar Jobs manualmente |
| **Classificador** | Identifica C2/C3 (gatilho) | Não monta o Estado Executivo |
| **Continuidade do Gate** | Consome decisões de Gate | Não delibera prioridades |
| **Consciência Operacional (esta ARQ)** | Consulta fontes; sintetiza lastro; informa resposta/encaminhamento | Não publica Jobs; não decide Gates |
| **Núcleo / MRE / Speaker** | Usa o lastro na prosa C2 (e avisos C3) | Não inventa estado |
| **Motor** | Fornece ciclo/Gate | Não classifica intenção |
| **Fila / Dispatcher / Agent** | Fontes de execução | Não respondem ao utilizador |
| **CTO Connector** | Fonte de estado CTO | Não orquestra Consciência |
| **Painel** | Observa / agrega UI | Não é autoridade exclusiva do snapshot |
| **Frente activa / memória** | Contexto de projecto | Não substitui Fila |

---

## 7. Critérios Arquitecturais

### 7.1 Critérios de conformidade (obrigatórios)

| ID | Critério |
|----|----------|
| CA1 | Em C2 e C3, a consulta ao Estado Executivo Atual ocorre **antes** da resposta substantive / despacho deliberativo. |
| CA2 | Fontes mínimas F1–F8 estão no modelo V1. |
| CA3 | Prioridade P1–P7 §5 é respeitada na resolução de conflitos de foco. |
| CA4 | Exemplo §3.3 (Job em execução + pergunta de priorização) produz resposta que **referencia** a execução em curso. |
| CA5 | Consciência **não** cria Jobs nem aprova/rejeita Gates. |
| CA6 | Continuidade do Gate (ARQ-019) tem precedência sobre deliberação consciente quando há decisão de léxico. |
| CA7 | Classificador (ARQ-018) permanece o limiar de classe; Consciência **não** reclassifica. |
| CA8 | REQ-030: Consciência não executa oficina / não importa `@cursor/sdk`. |
| CA9 | Degradação transparente se uma fonte falhar — sem inventar Jobs/Gates. |
| CA10 | Painel e CTO **não** substituem a consulta no caminho Conversa→Núcleo. |

### 7.2 Critérios de qualidade / risco

| ID | Critério |
|----|----------|
| CQ1 | Respostas C2 não devem ignorar Job `running` relevante ao mesmo domínio/frente. |
| CQ2 | Prosa mínima: lastro operacional em 1–3 frases quando há conflito; sem dump da fila. |
| CQ3 | C3 com Gate/Job activos: clarificar ou avisar antes de empilhar despachos conflitantes (detalhe no REQ). |
| CQ4 | Extensão de fontes só por emenda ARQ/REQ. |

### 7.3 Critérios de homologação desta ARQ (Gate)

A ARQ-020 considera-se **homologada** quando o patrocinador confirmar:

1. Objectivo e escopo §1–§2 adequados.  
2. Fluxo §3 (incl. exemplo) aceite como canónico.  
3. Fontes §4 e prioridade §5 suficientes.  
4. Responsabilidades §6 coerentes com o sistema actual.  
5. Critérios §7 suficientes para abrir o **REQ** (sem código ainda).  
6. Autorização explícita para o próximo artefacto: **REQ** (não IMP/código).

### 7.4 Critérios para avançar a implementação (referência futura)

Só após: ARQ-020 homologada → REQ homologado → IMP → autorização por etapa (ADR-006).  
**Proibido:** implementar Consciência Operacional nesta fase.

---

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Consciência atrasar C1/saudação | Obrigação só C2/C3 (O4 / §3.1) |
| Conflito com Continuidade do Gate | Precedência ARQ-019 (CA6) |
| Dump verboso da fila | CQ2; síntese mínima |
| Estado obsoleto / race | Snapshot pontual; transparência CQ9 |
| Scope creep (UI nova, multi-tenant) | NO2–NO5 |

---

## 9. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 (primária); CAP-07; CAP-11 |
| Norma superior | CON-001; ADR-015; ADR-006 |
| Classificação | ARQ-018; REQ-057 |
| Motor / Gate / Continuidade | ARQ-017; ARQ-019; REQ-056; REQ-058 |
| Fila / Dispatcher / CTO / Painel | REQ-045; REQ-053; REQ-054; REQ-055; ARQ-016 |
| Origem | Necessidade de respostas situadas ao estado real (pós-IMP-057/058) · 01/08/2026 |
| Implementação | *Proibida até Gate desta ARQ + REQ + IMP + E autorizada* |

---

## 10. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura ARQ-020 — Consciência Operacional | Estado operacional como lastro obrigatório em C2/C3 | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação ARQ-020 | Autoriza abertura do REQ | **Homologada** |

---

*Nenhuma linha de código sob esta ARQ até REQ-059 homologado + IMP + autorização explícita.*

---

**Gate ARQ-020:** Homologada. Próximo artefacto: **REQ-059**.
