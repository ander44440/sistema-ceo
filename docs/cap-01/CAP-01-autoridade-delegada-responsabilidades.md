# CAP-01 — Autoridade Delegada: Responsabilidades operacionais

> **Status:** Ciclo **ABERTO** — decomposição da ARQ-032.  
> **Capacidade:** CAP-01 — Governança.  
> **ARQ:** [`ARQ-032`](../architecture/ARQ-032-autoridade-delegada.md) Homologada / **congelada**.  
> **Finalidade:** especificar **como** a Autoridade Delegada deve comportar-se em operação, só via responsabilidades implementáveis.  
> **Vedado:** alterar ARQ-032; tecnologia; novos estados arquitecturais; ampliar escopo da delegação.

---

## Princípio (inalterável)

Não cria novo dono da missão. Período controlado de competência para decidir nos limites do Usuário.

---

## Catálogo de responsabilidades

### R1 — Validar o acto de delegação

**Comportamento operacional esperado:** perante enunciado do Usuário, o sistema só inicia Autoridade Delegada se o acto for explícito, do Usuário, dirigido ao CEO, e conceder competência de **fecho** (não mera confirmação pontual).

**Origem:** A2, A4 (V1–V2).  
**Não faz:** inferir delegação de silêncio, «ok» ou continuidade de missão.

---

### R2 — Activar e manter o estado activo

**Comportamento operacional esperado:** quando a delegação é válida, o sistema opera sob o estado lógico já definido na ARQ (`autoridade_delegada_activa`): missão do Usuário; competência de fecho concedida ao CEO no perímetro.

**Origem:** A3, A4.  
**Não faz:** inventar estados arquitecturais adicionais.

---

### R3 — Exercer fecho no perímetro

**Comportamento operacional esperado:** com estado activo, o CEO pode fechar decisões executivas operacionais cobertas pelo perímetro **sem** novo acto de fecho do Usuário a cada passo coberto.

**Origem:** A1, A3, A6.  
**Não faz:** fechar fora do perímetro; alienar a missão.

---

### R4 — Recusar fora dos limites

**Comportamento operacional esperado:** recusar ou devolver ao Usuário qualquer fecho que viole os limites objectivos (soberania, perímetro, reservas constitucionais, não redelegação, distinção face a execução técnica e a autorização pontual).

**Origem:** A6.  
**Não faz:** alargar o perímetro por iniciativa do CEO.

---

### R5 — Encerrar por critérios

**Comportamento operacional esperado:** encerrar a delegação ao verificar qualquer critério E1–E6 (revogação, exaurimento, expiração, perda de âmbito, acto soberano, retorno automático).

**Origem:** A5.  
**Não faz:** manter alçada após termo.

---

### R6 — Retorno automático ao Usuário

**Comportamento operacional esperado:** no instante do encerramento, a competência de fecho regressa ao Usuário sem acto adicional de «pedido de devolução».

**Origem:** A7.  
**Não faz:** conservar competência residual.

---

### R7 — Prevalência soberana contínua

**Comportamento operacional esperado:** em qualquer momento, acto explícito do Usuário prevalece sobre decisões sob delegação; o Usuário pode revogar ou fechar directamente.

**Origem:** A1, A6, A7.  
**Não faz:** opor-se ao Usuário soberano.

---

### R8 — Ortogonalidade aos modos executivos

**Comportamento operacional esperado:** Deliberar / Executar / Recuperar continuam a descrever a postura do momento; a Autoridade Delegada apenas determina se há competência de fecho no perímetro. Não criar quarto modo; não alterar CTO-003.

**Origem:** A8.  
**Não faz:** redesenhar a disciplina CTO-002/003.

---

### R9 — Rastreabilidade do fecho sob delegação

**Comportamento operacional esperado:** toda decisão importante fechada sob delegação regista Memória Organizacional, incluindo que o fecho ocorreu sob Autoridade Delegada (quem delegou, perímetro, quando / termo).

**Origem:** A3, A7; CON-001 Art. 8º.  
**Não faz:** fechos sem histórico.

---

### R10 — Distinções conceptuais em operação

**Comportamento operacional esperado:** tratar como conceitos distintos e não intercambiáveis:

| Conceito | Papel |
|----------|-------|
| Autoridade Delegada | Competência temporária de **fecho** |
| Autorização operacional pontual | Confirmação de um acto já enquadrado (ex.: Gate) |
| Delegação de execução | CEO → fila / oficina (**fazer**) |

**Origem:** A1.  
**Não faz:** fundir os três conceitos num único comportamento.

---

## Mapa R → A (rastreio)

| R | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|---|----|----|----|----|----|----|----|-----|
| R1 | | ● | | ● | | | | |
| R2 | | | ● | ● | | | | |
| R3 | ● | | ● | | | ● | | |
| R4 | | | | | | ● | | |
| R5 | | | | | ● | | | |
| R6 | | | | | ● | | ● | |
| R7 | ● | | | | | ● | ● | |
| R8 | | | | | | | | ● |
| R9 | | | ● | | | | ● | |
| R10 | ● | | | | | | | |

---

## Próximo passo

Pacote [`CAP-01-pacote-reqs-autoridade-delegada.md`](CAP-01-pacote-reqs-autoridade-delegada.md) — REQ-075…084 **Em análise** junto do CTO.  
IMP **vedada** até homologação completa dos REQs.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Engenheiro (decompôs + redigiu REQs) · CTO (autorizou) |
| Quando | 07/08/2026 |
| O quê | Responsabilidades R1–R10 + pacote REQ-075…084 |
| Resultado | REQs em análise · ARQ-032 intacta |
