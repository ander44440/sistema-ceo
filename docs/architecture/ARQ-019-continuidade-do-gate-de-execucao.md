# ARQ-019 — Continuidade do Gate de Execução

> **Status: Homologada v0.1** (01/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-019.  
> **Capacidade:** CAP-11 — Integrações (continuidade pós-aprovação); apoio CAP-07 (reconhecimento na Conversa); CAP-01 (Orquestração).  
> Norma superior: CON-001 (tempo do utilizador; sem repetição; sem burocracia); ADR-015; ADR-019; ADR-006; ARQ-017; ARQ-018 / REQ-057 (C3 → Motor); REQ-045; REQ-053; REQ-030.  
> **Finalidade:** arquitectura da **continuidade do Gate** — o CEO retoma automaticamente o ciclo do Motor após a decisão do utilizador, sem exigir que este repita a solicitação inicial.  
> **Gate:** homologada. **Próximo artefacto:** REQ-058 (Continuidade do Gate de Execução).  
> **Sem implementação** até REQ homologado + IMP + autorização por etapa.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada arquitectural que liga a **decisão humana sobre um Gate do Motor** à **continuação do fluxo** Intenção → Job → Dispatcher → execução → Resultado → Encerramento, reconhecendo respostas curtas de aprovação/rejeição/adiamento na Conversa. |
| **Por que existe?** | A IMP-057 / ARQ-017 já conduzem C3 ao Motor e podem parar em **Gate** (`aguardando_gate`). Sem continuidade, o utilizador vê o pedido de aprovação mas a resposta seguinte («Aprovado.») volta a ser classificada/deliberada como pedido novo — perde o ciclo e força repetição (violação CON-001 / ADR-015). |
| **Para quem existe?** | Patrocinador (decide com uma frase); CEO Digital / Núcleo (reconhece e retoma); Motor (ARQ-017); Fila/Dispatcher (REQ-045/053); Painel (observa). |
| **Como medir sucesso?** | (1) Após Gate, «Aprovado.» / equivalentes **retomam** o mesmo ciclo sem reescrever a intenção; (2) Aprovado → Job → Dispatcher → … → Encerramento; (3) Rejeitado → Encerramento sem Job; (4) Adiado → Gate permanece pendente; (5) Sem `@cursor/sdk` / sem o CEO executar código (REQ-030). |

---

## 1. Objetivo

### 1.1 Objectivo

**Permitir que o CEO continue automaticamente a execução após a decisão do utilizador sobre um Gate do Motor**, preservando o contexto do ciclo em curso e eliminando a necessidade de repetir a solicitação inicial.

### 1.2 Objectivos operacionais

| ID | Objectivo |
|----|-----------|
| O1 | Explicitar o **fluxo de continuidade** Gate → decisão → (Job \| encerramento \| espera). |
| O2 | Definir **estados do Gate** e transições canónicas alinhadas a ARQ-017. |
| O3 | Definir **reconhecimento** de decisões curtas na Conversa (léxico mínimo §3.4). |
| O4 | Garantir que a continuidade **amarra** ao ciclo/parecer/Gate já abertos — não abre um C3 paralelo por omissão. |
| O5 | Respeitar CON-001: uma palavra/frase basta; sem burocracia. |
| O6 | Manter fronteiras: Continuidade **orquestra**; Fila/Dispatcher/Agent **executam**. |

### 1.3 Não-objectivos (desta ARQ)

| ID | Fora |
|----|------|
| NO1 | Implementar código, IMP, UI nova ou alteração de CON/ADR nesta fase. |
| NO2 | Redesign do Motor (ARQ-017), Classificador (ARQ-018) ou Dispatcher (REQ-053). |
| NO3 | Gate para despachos que a política V1 **não** exige (já cobertos por ARQ-017). |
| NO4 | Multi-utilizador / RBAC de aprovação. |
| NO5 | Confirmação por canal externo (e-mail, Slack) na V1. |

---

## 2. Escopo

### 2.1 Dentro do escopo (V1 arquitectural)

* Modelo de **Continuidade do Gate de Execução** como extensão do ciclo do Motor (ARQ-017).  
* **Fluxo de continuidade** mínimo §3 (C3 → Motor → Gate → decisão → …).  
* **Estados do Gate** §4 e decisões `aprovado` \| `rejeitado` \| `adiado`.  
* **Responsabilidades** §5 (Núcleo, Classificador, Motor, Conversa, Fila, Dispatcher, Painel).  
* **Critérios arquitecturais** §6 para futuros REQ/IMP.  
* Léxico mínimo de reconhecimento de decisão §3.4.  
* Relação com: Classificador (ARQ-018 — C3 e possível classe/rota de “decisão de Gate”); Motor (IMP-056 / `conduzirAposDecisaoGate`); Fila; Dispatcher; Speaker/CN (prosa de Gate, não deliberação consultiva).

### 2.2 Fora do escopo

* Código, schemas obrigatórios novos, ou emenda textual a ARQ-017/018 nesta fase (emendas futuras só se o Gate o exigir).  
* UI dedicada de botões de Gate (opcional em UX posterior; V1 pode ser **só** texto na Conversa).  
* Reabrir E2.1 / Classificador além do necessário para **não** tratar «Aprovado.» como C2 deliberativo nem como novo C3 sem vínculo.  
* Abrir REQ/IMP antes da homologação desta ARQ.

### 2.3 Relação com o que já existe

| Peça | Papel face à Continuidade |
|------|---------------------------|
| **ARQ-017 / Motor** | Dono do ciclo Intenção→…→Encerramento; já prevê Gate e `aprovado`/`rejeitado`/`adiado`. |
| **IMP-056** | `conduzirAposParecer` / `conduzirAposDecisaoGate` — **insumo** técnico; a ARQ-019 define a continuidade **na Conversa**. |
| **ARQ-018 / C3** | Origem típica do ciclo que exige Gate (Trabalho Executivo). |
| **Conversa** | Canal onde o utilizador responde ao Gate com frase curta. |
| **Classificador** | Deve **reconhecer** decisão de Gate (ou o Núcleo interceptar **antes** de reclassificar como pedido novo) — detalhe no REQ. |
| **Fila / Dispatcher** | Só após **aprovado** e criação de Job. |
| **Painel (ARQ-016)** | Observa Gate pendente / Job; não decide. |

---

## 3. Fluxo de Continuidade

### 3.1 Fluxo mínimo canónico

```text
Trabalho Executivo (C3)
  → Motor de Execução
  → Gate (política V1 exige aprovação)
  → Aguardar decisão do utilizador
       │
       ├─ APROVADO  → Criar Job → Dispatcher → CTO / Engenheiro (oficina)
       │                 → Monitoramento → Resultado → Encerramento
       │
       ├─ REJEITADO → Encerrar sem Job
       │
       └─ ADIADO    → Manter Gate pendente (ciclo preservado)
```

### 3.2 Premissas do fluxo

1. Existe um **ciclo de Motor** em curso com Gate aberto (`aguardando_gate` / etapa `Aprovacao`).  
2. O utilizador **não** precisa repetir a solicitação C3 original.  
3. A decisão aplica-se ao **mesmo** `parecerId` / `cicloId` / pedido de Gate.  
4. Após **aprovado**, a criação do Job e o handoff ao Dispatcher respeitam ARQ-017 / REQ-045 / REQ-053.  
5. Após **rejeitado**, não há Job; o ciclo encerra de forma auditável.  
6. Após **adiado**, o Gate permanece; novas mensagens podem retomar a decisão ou mudar de assunto (política de timeout/abandono → REQ).

### 3.3 Diagrama lógico (estados)

```text
                    [C3 / Motor]
                         │
                         ▼
              ┌─────────────────────┐
              │  GATE_PENDENTE      │◄──── ADIADO (permanece)
              │  (aguarda decisão)  │
              └──────────┬──────────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      APROVADO      REJEITADO      (timeout / abandono — REQ)
           │             │
           ▼             ▼
    JOB → DISPATCHER   ENCERRADO
           │           (sem Job)
           ▼
    MONITORAMENTO
           │
           ▼
    RESULTADO → ENCERRAMENTO
```

### 3.4 Reconhecimento automático de decisão (léxico mínimo V1)

O CEO deve reconhecer, **no contexto de Gate pendente**, respostas equivalentes às decisões canónicas — **sem** exigir repetir a solicitação inicial.

| Decisão | Exemplos obrigatórios (mínimo V1) |
|---------|-----------------------------------|
| **Aprovado** | `Aprovado.` · `Pode executar.` · `Autorizado.` · `Pode prosseguir.` |
| **Rejeitado** | `Cancela.` · `Rejeitado.` |
| **Adiado** | `Depois.` · `Adiar.` |

*Notas:*

* Matching **determinístico** preferível na V1 (RES alinhado a REQ-057 RES8); LLM só como fallback se o REQ o autorizar.  
* Em ambiguidade («ok» sem Gate pendente) → **não** inventar aprovação; clarificar ou classificar normalmente.  
* Com Gate pendente, estes enunciados **têm prioridade** sobre reclassificação C2 deliberativa / novo C3 sem vínculo.

### 3.5 O que a Continuidade **não** faz

* Não publica Job sem decisão `aprovado` quando o Gate é obrigatório.  
* Não invoca Agent/SDK no browser do CEO.  
* Não substitui o Dispatcher.  
* Não transforma deliberação MRE («Sugiro…») em aprovação de Gate.

---

## 4. Estados do Gate

### 4.1 Enum de decisão (alinhado ao Motor V1)

| Decisão | Significado | Efeito no ciclo |
|---------|-------------|-----------------|
| `aprovado` | Utilizador autoriza o despacho | Avança para Criação do Job → Dispatcher → … |
| `rejeitado` | Utilizador recusa o despacho | Encerramento **sem** Job |
| `adiado` | Utilizador adia a decisão | Gate permanece **pendente**; ciclo preservado |

### 4.2 Estados de vida do Gate (vista Continuidade)

| Estado | Significado |
|--------|-------------|
| `inexistente` | Nenhum Gate aberto para a sessão/ciclo |
| `pendente` | Gate aberto; aguarda decisão do utilizador |
| `resolvido_aprovado` | Decisão `aprovado` consumida; Job em curso ou criado |
| `resolvido_rejeitado` | Decisão `rejeitado` consumida; ciclo encerrado sem Job |
| `resolvido_adiado` | Decisão `adiado` registada; Gate **volta** a `pendente` (ou permanece pendente com marca de adiamento — detalhe no REQ) |

### 4.3 Regras de transição

1. Só há Continuidade de Gate quando o estado efectivo é **`pendente`**.  
2. `aprovado` → criação de Job **só** se a política do Motor ainda o permitir (sem reabrir deliberação).  
3. `rejeitado` → **proibido** criar Job neste ciclo.  
4. `adiado` → **proibido** criar Job; **obrigatório** manter capacidade de retoma.  
5. Decisão sem Gate pendente → **não** aplica Continuidade; segue Classificador normal (ARQ-018).

---

## 5. Responsabilidades

| Actor / componente | Responsabilidade | Não faz |
|--------------------|------------------|---------|
| **Utilizador / Patrocinador** | Decide com frase curta (§3.4) | Não precisa reescrever o C3 |
| **Conversa** | Superfície de pergunta/resposta do Gate | Não publica Jobs |
| **Classificador / Núcleo** | Detecta decisão de Gate **ou** encaminha ao módulo de Continuidade antes de deliberar de novo | Não executa código |
| **Continuidade do Gate (esta ARQ)** | Liga decisão → `conduzirAposDecisaoGate` (ou equivalente) com o ciclo correcto | Não é o Dispatcher |
| **Motor (ARQ-017)** | Avança ciclo; cria Job se aprovado; encerra se rejeitado | Não classifica intenção |
| **Fila (REQ-045)** | Persiste Job `pending` | Não aprova Gate |
| **Dispatcher (REQ-053)** | Consome Job após criação | Não decide Gate |
| **CTO / Engenheiro (oficina)** | Executam o trabalho despachado | Não substituem a decisão do patrocinador |
| **Painel (ARQ-016)** | Mostra Gate pendente / Job | Não decide nem despacha |
| **Speaker / CN** | Prosa de «aguardando aprovação» / confirmação de retoma | Não deliberam o Gate |

---

## 6. Critérios Arquitecturais

### 6.1 Critérios de conformidade (obrigatórios)

| ID | Critério |
|----|----------|
| CA1 | O fluxo §3.1 é o caminho canónico pós-Gate. |
| CA2 | Decisões reconhecidas incluem, no mínimo, o léxico §3.4. |
| CA3 | Com Gate `pendente`, a Continuidade **impede** tratar a decisão como pedido C2/C3 órfão. |
| CA4 | `aprovado` → Job + handoff Dispatcher conforme ARQ-017 / REQ-045 / REQ-053. |
| CA5 | `rejeitado` → Encerramento **sem** Job. |
| CA6 | `adiado` → Gate permanece pendente; ciclo rastreável. |
| CA7 | Utilizador **não** é obrigado a repetir a solicitação C3 inicial. |
| CA8 | REQ-030: Continuidade não executa oficina no lugar do Agent. |
| CA9 | Sem segredos em mensagens de Gate / Jobs. |
| CA10 | Painel e CTO **não** substituem a decisão humana do Gate. |

### 6.2 Critérios de qualidade / risco

| ID | Critério |
|----|----------|
| CQ1 | Falso positivo de «Aprovado.» sem Gate pendente → clarificação ou classificação normal (sem Job). |
| CQ2 | Timeout / abandono de Gate pendente → política explícita no REQ (não silêncio infinito sem sinal). |
| CQ3 | Idempotência: segunda «Aprovado.» no mesmo ciclo não cria Job duplicado. |
| CQ4 | Extensão do léxico de decisão só por emenda REQ/ARQ — não ad hoc no Orquestrador. |

### 6.3 Critérios de homologação desta ARQ (Gate)

A ARQ-019 considera-se **homologada** quando o patrocinador confirmar:

1. Objectivo e escopo §1–§2 adequados.  
2. Fluxo de continuidade §3 aceite como canónico.  
3. Estados do Gate §4 e léxico §3.4 suficientes.  
4. Responsabilidades §5 coerentes com o sistema actual.  
5. Critérios §6 suficientes para abrir o **REQ** (sem código ainda).  
6. Autorização explícita para o próximo artefacto: **REQ** (não IMP/código).

### 6.4 Critérios para avançar a implementação (referência futura)

Só após: ARQ-019 homologada → REQ homologado → IMP → autorização por etapa (ADR-006).  
**Proibido:** implementar Continuidade do Gate nesta fase.

---

## 7. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| «Aprovado.» classificado como C2 → «Sugiro…» | CA3; interceptação / classe de decisão de Gate no REQ |
| Job duplicado | CQ3; registro parecerId→jobId (já no Motor) |
| Utilizador muda de assunto com Gate aberto | REQ: prioridade Gate vs novo pedido; clarificação mínima |
| Confundir Continuidade com novo C3 | O4 / CA3; vínculo explícito ao ciclo |
| Scope creep (botões, multi-canal) | NO3–NO5; V1 = texto na Conversa |

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 (primária); CAP-07; CAP-01 |
| Norma superior | CON-001; ADR-015; ADR-006 |
| Motor / Gate | ARQ-017; REQ-056; IMP-056 |
| Classificação C3 | ARQ-018; REQ-057; IMP-057 |
| Fila / Dispatcher | REQ-045; REQ-053 |
| Origem | Diagnóstico pós-IMP-057 (Gate sem retoma na Conversa) · 01/08/2026 |
| Implementação | *Proibida até Gate desta ARQ + REQ + IMP + E autorizada* |

---

## 9. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura ARQ-019 — Continuidade do Gate | Fechar o ciclo após decisão humana sem repetir o C3 | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação ARQ-019 | Autoriza abertura do REQ | **Homologada** |

---

*Nenhuma linha de código sob esta ARQ até REQ-058 homologado + IMP + autorização explícita.*

---

**Gate ARQ-019:** Homologada. Próximo artefacto: **REQ-058**.
