# REQ-058 — Continuidade do Gate de Execução

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-11 — Integrações

## Enunciado

O Sistema CEO deverá **manter o contexto de um Gate do Motor pendente** e, perante uma decisão curta do utilizador na Conversa, **continuar automaticamente o ciclo** (aprovar → Job; rejeitar → encerrar sem Job; adiar → manter pendente) **sem** exigir que o utilizador repita a solicitação executiva original.

## Tipo

Funcional; detalhado (MVP V1 da Continuidade do Gate — ARQ-019).

## Justificativa

A **ARQ-019 v0.1** (homologada) define a Continuidade do Gate como extensão do ciclo do Motor (ARQ-017 / REQ-056): após C3 → Motor → Gate, a resposta humana («Aprovado.», «Cancela.», «Depois.», etc.) deve retomar o **mesmo** ciclo. Sem este requisito, a IMP-057 classifica a frase seguinte como pedido novo (C2/C3 órfão), gera deliberação («Sugiro…») e viola CON-001 (tempo do utilizador; sem repetição) e ADR-015. Alinha a REQ-045 / REQ-053 (Job só após aprovação) e REQ-030 (oficina ≠ browser CEO).

---

## Objetivo

1. Manter o **contexto do Gate pendente** (ciclo / parecer / pedido de aprovação) enquanto aguarda decisão.  
2. Garantir que o utilizador **não** precisa repetir a solicitação C3 original.  
3. Reconhecer, no mínimo, o léxico de decisão ARQ-019 §3.4.  
4. Aplicar a decisão ao **Gate pendente mais recente**.  
5. Em `aprovado`: criar Job e continuar o Motor até Monitoramento → Resultado → Encerramento.  
6. Em `rejeitado`: encerrar o Gate **sem** Job.  
7. Em `adiado`: manter o Gate **pendente** e o ciclo retomável.  
8. Impedir que decisões de Gate sejam tratadas como C2 deliberativo ou C3 órfão.

---

## Escopo

### Dentro do escopo (V1)

* Continuidade na Conversa após Gate do Motor (`pendente` / `aguardando_gate`).  
* Reconhecimento determinístico do léxico mínimo de decisão (§ RF5).  
* Aplicação da decisão ao Gate pendente **mais recente**.  
* Efeitos: `aprovado` → Job + continuação do Motor; `rejeitado` → Encerramento sem Job; `adiado` → Gate permanece pendente.  
* Prioridade da Continuidade sobre reclassificação C2/C3 órfã quando há Gate pendente e a mensagem casa com o léxico.  
* Idempotência: segunda aprovação no mesmo ciclo não cria Job duplicado.  
* Política V1 de convivência Gate pendente vs mensagem que **não** é decisão (§ RF12).  
* Critérios CA/NA verificáveis; documentação mínima.

### Capacidade

Exactamente uma capacidade primária: **CAP-11 — Integrações** (apoio conceptual CAP-07 Comunicação / CAP-01 Orquestração, conforme ARQ-019).

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF1 | Enquanto existir Gate do Motor em estado **pendente**, o sistema deverá **manter o contexto** do ciclo associado (identificador de ciclo/parecer/Gate) de forma a permitir retoma sem reintroduzir a solicitação C3 original. |
| RF2 | O utilizador **não** deverá ser obrigado a repetir a solicitação executiva original para decidir o Gate. |
| RF3 | Com Gate pendente, o sistema deverá interceptar a mensagem do utilizador **antes** de a tratar como deliberação C2 órfã ou novo C3 sem vínculo ao ciclo do Gate (ARQ-019 CA3). |
| RF4 | A decisão reconhecida deverá actuar sobre o **Gate pendente mais recente** (último Gate aberto ainda pendente na sessão/contexto aplicável). |
| RF5 | O sistema deverá reconhecer, no mínimo, os enunciados (normalização de pontuação/caixa admitida): **Aprovado** · **Pode executar** · **Autorizado** · **Pode prosseguir** → `aprovado`; **Cancela** · **Rejeitado** → `rejeitado`; **Depois** · **Adiar** → `adiado`. |
| RF6 | Face a decisão `aprovado`, o sistema deverá invocar a continuação do Motor (ex.: `conduzirAposDecisaoGate` ou equivalente REQ-056), **criar o Job** conforme política do Motor e permitir handoff ao Dispatcher (REQ-045 / REQ-053). |
| RF7 | Face a decisão `rejeitado`, o sistema deverá **encerrar o Gate/ciclo sem criar Job**. |
| RF8 | Face a decisão `adiado`, o sistema deverá **manter o Gate pendente**, preservar o ciclo e permitir nova decisão posterior com o mesmo léxico. |
| RF9 | Sem Gate pendente, enunciados do léxico RF5 **não** deverão inventar aprovação nem criar Job; a mensagem segue o Classificador normal (ARQ-018 / REQ-057). |
| RF10 | A Continuidade **não** deverá publicar Job quando o Gate é obrigatório e a decisão não é `aprovado`. |
| RF11 | Uma segunda mensagem `aprovado` no mesmo ciclo já resolvido com Job **não** deverá criar Job duplicado (idempotência; ARQ-019 CQ3). |
| RF12 | Com Gate pendente, se a mensagem **não** for reconhecida como decisão (léxico RF5) e constituir pedido novo claro, o sistema deverá, na V1, pedir **clarificação mínima** (decidir o Gate agora vs. tratar o novo pedido) — **sem** aprovar silenciosamente nem abandonar o Gate sem registo. |
| RF13 | A Continuidade **não** deverá invocar Agent/`@cursor/sdk`, nem executar oficina no browser do CEO (REQ-030). |
| RF14 | O Conector CTO e o Painel de Orquestração **não** deverão decidir o Gate no lugar do utilizador nem saltar a Continuidade. |
| RF15 | Extensão do léxico de decisão só por emenda a este REQ / ARQ-019 — proibido ad hoc no Orquestrador. |
| RF16 | Matching do léxico RF5 na V1 deverá ser **determinístico** (regras/normalização); LLM só como fallback se emenda futura o autorizar sem violar RNF1. |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF1 | **Tempo do utilizador:** uma frase curta basta; sem formulários nem repetição do C3. |
| RNF2 | **Segurança:** mensagens de Gate, metadados e Jobs sem credenciais (`CURSOR_API_KEY`, API keys). |
| RNF3 | **Observabilidade:** estado do Gate (`pendente` / resolvido) e decisão aplicada consultáveis em diagnóstico sem terminais ad hoc. |
| RNF4 | **Falsos positivos de aprovação** sem Gate pendente são preferencialmente evitados (ARQ-019 CQ1). |
| RNF5 | **Alinhamento ARQ-017 / REQ-056:** Continuidade orquestra decisão; Motor avança o ciclo; Fila/Dispatcher executam pós-Job. |
| RNF6 | **Alinhamento ARQ-018 / REQ-057:** Continuidade não substitui o Classificador; tem prioridade **só** com Gate pendente + léxico de decisão. |
| RNF7 | **UI:** V1 = texto na Conversa; botões de Gate não obrigatórios. |
| RNF8 | **Não efeitos laterais indevidos:** reconhecer decisão ≠ executar oficina; rejeitar ≠ publicar Job. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| CA1 | Com Gate pendente, o contexto do ciclo permanece disponível para retoma (RF1). |
| CA2 | Após Gate, o utilizador decide com frase do léxico RF5 **sem** reescrever o C3 original (RF2). |
| CA3 | «Aprovado.» / «Pode executar.» / «Autorizado.» / «Pode prosseguir.» → decisão `aprovado` no Gate mais recente. |
| CA4 | «Cancela.» / «Rejeitado.» → decisão `rejeitado`; **zero** Jobs criados nesse ciclo. |
| CA5 | «Depois.» / «Adiar.» → Gate permanece `pendente`; ciclo retomável. |
| CA6 | `aprovado` → Job criado e Motor continua (caminho Job → Dispatcher → … alinhado a ARQ-017). |
| CA7 | Com Gate pendente, a decisão do léxico **não** produz deliberação C2 do tipo «Sugiro…» no lugar da Continuidade. |
| CA8 | Sem Gate pendente, «Aprovado.» **não** cria Job (RF9). |
| CA9 | Segunda «Aprovado.» no mesmo ciclo já com Job **não** duplica Job (RF11). |
| CA10 | Código da Continuidade sem `@cursor/sdk` / sem execução de oficina no browser (RF13). |
| CA11 | Documentação mínima referencia ARQ-019, este REQ, ARQ-017 / REQ-056 e REQ-045 / REQ-053. |

### Critérios negativos

| ID | Critério |
|----|----------|
| NA1 | A Continuidade **não** substitui o Motor, a Fila nem o Dispatcher. |
| NA2 | A Continuidade **não** decide o Gate automaticamente sem mensagem do utilizador. |
| NA3 | A Continuidade **não** exige UI de botões na V1. |
| NA4 | Falha de reconhecimento **não** aprova silenciosamente; degradação: clarificação ou Classificador normal. |

---

## Casos de Uso

### CU1 — Aprovação com frase curta

1. C3 → Motor → Gate pendente (ex.: «Implemente X»).  
2. Utilizador: «Aprovado.» (ou «Pode executar.» / «Autorizado.» / «Pode prosseguir.»).  
3. Sistema aplica `aprovado` ao Gate **mais recente**.  
4. Job criado; Motor continua; handoff Dispatcher conforme política.  
5. Utilizador **não** repetiu «Implemente X».

**Sucesso:** CA2, CA3, CA6.

### CU2 — Rejeição

1. Gate pendente.  
2. Utilizador: «Cancela.» ou «Rejeitado.».  
3. Ciclo encerra **sem** Job.

**Sucesso:** CA4.

### CU3 — Adiamento e retoma

1. Gate pendente.  
2. Utilizador: «Depois.» ou «Adiar.».  
3. Gate permanece pendente.  
4. Mais tarde: «Autorizado.» → `aprovado` no mesmo Gate / ciclo preservado.

**Sucesso:** CA5, depois CA3/CA6.

### CU4 — Sem Gate pendente

1. Nenhum Gate aberto.  
2. Utilizador: «Aprovado.».  
3. Sem Job inventado; Classificador normal (REQ-057).

**Sucesso:** CA8.

### CU5 — Prioridade sobre deliberação órfã

1. Gate pendente após C3.  
2. Utilizador: «Pode prosseguir.».  
3. Continuidade consome a decisão; **não** abre C2 com «Sugiro…».

**Sucesso:** CA7.

### CU6 — Idempotência

1. Gate aprovado; Job já criado.  
2. Utilizador: «Aprovado.» novamente.  
3. Nenhum segundo Job para o mesmo ciclo.

**Sucesso:** CA9.

### CU7 — Mensagem nova com Gate ainda pendente

1. Gate pendente.  
2. Utilizador envia pedido claramente novo (fora do léxico RF5).  
3. Clarificação mínima (RF12): decidir o Gate agora vs. tratar o novo pedido.  
4. Gate não é aprovado nem abandonado em silêncio.

**Sucesso:** RF12 / NA4.

---

## Restrições

| ID | Restrição |
|----|-----------|
| RES1 | Norma: CON-001; ADR-015; ADR-006 (fluxo REQ→IMP). |
| RES2 | Alinhamento integral à **ARQ-019 homologada**. |
| RES3 | Avanço de ciclo alinhado a **ARQ-017 / REQ-056** — sem segundo Motor. |
| RES4 | Job / Dispatcher alinhados a **REQ-045 / REQ-053**. |
| RES5 | Classificador (ARQ-018 / REQ-057) permanece limiar geral; Continuidade só com Gate pendente + decisão. |
| RES6 | Sem implementação até IMP autorizada por etapa. |
| RES7 | Não alterar Constituição, Governança LLM, nem redesenhar ARQ-017/018 nesta frente além do necessário à interceptação/retoma. |
| RES8 | Léxico V1 fechado ao conjunto RF5; extensões só por emenda REQ/ARQ. |
| RES9 | Preferência de implementação: matching determinístico (RF16). |
| RES10 | REQ-030: Continuidade não executa oficina. |

---

## Fora de Escopo

| ID | Fora | Coberto por / nota |
|----|------|-------------------|
| FE1 | Implementação de código nesta fase | IMP futuro |
| FE2 | UI dedicada / botões de Gate | ARQ-019 NO5 / RNF7 |
| FE3 | Multi-utilizador / RBAC de aprovação | Futuro |
| FE4 | Confirmação por canal externo (e-mail, Slack) | ARQ-019 NO5 |
| FE5 | Redesign do Motor, Classificador ou Dispatcher | ARQ-017; ARQ-018; REQ-053 |
| FE6 | Gate para despachos que a política V1 do Motor **não** exige | ARQ-017 / REQ-056 |
| FE7 | Timeout automático com auto-aprovação | Proibido; abandono só com política explícita futura (V1 = pendente + RF12) |
| FE8 | Substituição do Speaker/CN ou deliberação MRE | ADR-019; Continuidade não delibera mérito |

---

## Dependências

| Dependência | Papel |
|-------------|--------|
| ARQ-019 | Arquitectura homologada (obrigatória) |
| ARQ-017 / REQ-056 | Motor, Gate, `conduzirAposDecisaoGate` |
| ARQ-018 / REQ-057 | Classificador; C3 origem típica; prioridade da Continuidade |
| REQ-045 / REQ-053 | Job e Dispatcher pós-aprovação |
| REQ-030 | Fronteira oficina |
| Conversa / Núcleo | Ponto de interceptação e retoma |
| ARQ-016 / REQ-055 | Painel observa; não decide |

## Riscos e incertezas

* «Aprovado.» classificado como C2 → «Sugiro…»; mitigar RF3 / CA7.  
* Job duplicado; mitigar RF11 / CA9.  
* Utilizador muda de assunto com Gate aberto; mitigar RF12.  
* Falso positivo sem Gate; mitigar RF9 / CA8.  
* Scope creep (botões, multi-canal); mitigar FE2–FE4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 |
| Norma superior | CON-001; ADR-015; ADR-006; REQ-030 |
| Origem | ARQ-019 homologada (01/08/2026) — Continuidade do Gate de Execução |
| Arquitectura | ARQ-019 |
| Motor / Gate | ARQ-017; REQ-056 |
| Classificação | ARQ-018; REQ-057 |
| Fila / Dispatcher | REQ-045; REQ-053 |
| Decisões derivadas | — |
| Implementação | *— após IMP autorizada* |
| Testes | *— após IMP* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura REQ-058 | Alinhar requisitos à Continuidade do Gate (ARQ-019) | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação REQ-058 (com IMP-058) | Gate requisitos + implementação | **Homologada** |

---

*Nenhuma implementação até homologação deste REQ-058 e IMP subsequente autorizada por etapa.*

---

**Pedido de Gate:** REQ-058 v0.1 pronta para homologação do patrocinador. Próximo artefacto após Gate: **IMP** (só com autorização explícita).
