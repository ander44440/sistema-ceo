# REQ-060 — Restauração da Fila Oficial do MVP

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026 (Gate / encerramento IMP-060: 02/08/2026)  
> **Capacidade:** CAP-11 — Integrações

## Enunciado

O Sistema CEO deverá **publicar e consumir** todos os Jobs do ciclo oficial do MVP **exclusivamente** na Fila local `executive/queue/` no PC do patrocinador, de forma que produtor (CEO) e consumidor (Dispatcher) usem a **mesma** fonte de verdade — **sem** que as APIs Railway assumam o papel de fila oficial.

## Tipo

Funcional; detalhado (restauração de conformidade — ARQ-021; reafirma REQ-045 e REQ-053).

## Justificativa

A **ARQ-021 v0.1** (homologada) restaura o invariante da Fila oficial do MVP após o desvio do cutover BP-001 (E4+E8), em que o browser em produção publicava Jobs no filesystem Railway enquanto o Dispatcher (REQ-053) lia `executive/queue` no PC. Sem este requisito, o handoff «iniciado» permanece desligado do consumo real. Norma superior: CON-001 (tempo do utilizador; contexto); ADR-015; REQ-045; REQ-053; ARQ-017 / REQ-056; REQ-030. BP-001 permanece para serviços online (LLM/API), **não** para a fila oficial.

---

## Objetivo

1. Fixar `executive/queue/` no PC como **única** fila oficial do MVP.  
2. Obrigatoriedade: todo Job criado pelo fluxo oficial do CEO é publicado **só** nessa fila.  
3. Obrigatoriedade: o Dispatcher consome **só** essa fila.  
4. Durante `pending` → `running` → `completed` / `failed` (e `cancelled` quando aplicável), a **única** fonte de verdade é a fila oficial.  
5. Delimitar BP-001: APIs Railway **não** são a fila oficial dos Jobs do MVP.  
6. Restaurar o fluxo da fila **sem** modificar Motor, Gate, Classificador nem Consciência Operacional (contratos).  
7. Critérios CA/NA objectivos para homologação e IMP futura.

---

## Escopo

### Dentro do escopo (V1)

* Fonte oficial da fila e invariante produtor = consumidor.  
* Publicação exclusiva na fila oficial.  
* Consumo exclusivo pelo Dispatcher nessa fila.  
* Fonte de verdade do ciclo de estados do Job.  
* Fronteira BP-001 vs fila MVP.  
* Compatibilidade explícita com Motor / Gate / Classificador / Consciência (sem redesign).  
* Critérios de aceite e casos de uso verificáveis.

### Capacidade

Exactamente uma capacidade primária: **CAP-11 — Integrações**.

---

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF1 | A **fila oficial do MVP** é a pasta `executive/queue/` no filesystem do PC do patrocinador (raiz do repositório CEO / `CEO_REPO_ROOT`), conforme REQ-045. |
| RF2 | Todo Job criado pelo fluxo oficial do CEO (Motor / capacidade `fila` / C3 após política e Gate quando aplicável) deverá ser **publicado exclusivamente** na fila oficial (RF1), como `JOB-*.json` com estado inicial `pending` (salvo rejeição de política que **não** publique Job). |
| RF3 | O Dispatcher (REQ-053) deverá **consumir exclusivamente** a fila oficial (RF1) — observar `pending` nessa pasta (ou API **local** que leia **a mesma** pasta). |
| RF4 | Durante o ciclo do Job nos estados `pending`, `running`, `completed` e `failed` (e `cancelled` quando usado), a **única fonte de verdade** oficial do MVP é a fila oficial (RF1). |
| RF5 | É **proibido** declarar oficialmente «Job criado», «Job publicado» ou «Handoff ao Dispatcher iniciado» se o artefacto correspondente **não** existir na fila oficial (RF1). |
| RF6 | As APIs Railway (BP-001) **permanecem** responsáveis por serviços online (em especial LLM / health / CORS e demais rotas não-fila oficiais); **não** poderão assumir o papel de **fila oficial** dos Jobs do MVP. |
| RF7 | Rotas remotas `/api/ceo/queue/*` no host Railway **não** são destino oficial de publicação nem fonte de verdade do ciclo Job do MVP. |
| RF8 | Listagens e sinais oficiais de Jobs do MVP (Painel, Consciência, capacidade `fila` quando reportam o ciclo MVP) deverão referir a fila oficial (RF1), ou degradar com transparência — **sem** apresentar a fila Railway como canónica. |
| RF9 | Esta restauração **não** modifica os contratos do **Motor de Execução** (ARQ-017 / REQ-056), da **Continuidade do Gate** (ARQ-019 / REQ-058), do **Classificador** (ARQ-018 / REQ-057) nem da **Consciência Operacional** (ARQ-020 / REQ-059) — apenas o caminho de publicação/consumo da fila para cumprir RF1–RF5. |
| RF10 | O Agent Cursor, ao consumir via protocolo REQ-045/053, actualiza estados **na mesma** fila oficial (RF1 / RF4). |
| RF11 | REQ-045 e REQ-053 permanecem vigentes; este REQ **restaura conformidade** e **não** as revoga. |
| RF12 | Filas cloud / mensageria paga / Dispatcher 24/7 com máquina desligada permanecem **fora** do MVP (candidato V3 — REQ futuro). |

---

## Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF1 | **Tempo do utilizador:** após publicação conforme, o Dispatcher local deve poder detetar `pending` sem o utilizador copiar/colar o Job (REQ-053). |
| RNF2 | **Transparência:** se a publicação local falhar, o sistema informa falha — não finge handoff. |
| RNF3 | **Segurança:** `CURSOR_API_KEY` permanece só no ambiente local do Dispatcher; Jobs sem credenciais (REQ-045). |
| RNF4 | **Observabilidade:** Heartbeat do Dispatcher para a API remota (Painel) **pode** continuar; isso **não** autoriza fila Railway como fonte de Jobs. |
| RNF5 | **Compatibilidade BP-001:** deliberação LLM via Railway permanece permitida; desacoplada da persistência oficial de Jobs. |
| RNF6 | **Sem redesign:** alterações limitadas ao caminho da fila; sem reabrir arquitectura do Motor/Gate/Classificador/Consciência. |
| RNF7 | **IDs:** Jobs na fila oficial e quaisquer registos órfãos em Railway não devem ser tratados como o mesmo ciclo oficial sem norma futura. |

---

## Critérios de Aceite

| ID | Critério (verificável) |
|----|------------------------|
| CA1 | A fila oficial está documentada e implementável como `executive/queue/` no PC (RF1). |
| CA2 | Um Job criado pelo fluxo oficial do CEO aparece como `JOB-*.json` com `pending` **nessa** pasta (RF2). |
| CA3 | O Dispatcher local, com watcher activo, deteta esse Job **sem** ler a fila Railway (RF3). |
| CA4 | Transições `pending` → `running` → `completed` ou `failed` reflectem-se nos ficheiros da fila oficial (RF4). |
| CA5 | Com cutover que só escrevesse em Railway, o sistema **não** declara handoff oficial bem-sucedido sem artefacto local (RF5) — após conformidade, esse caminho deixa de ser o oficial. |
| CA6 | Publicação oficial do MVP **não** usa Railway `/api/ceo/queue/*` como destino (RF6, RF7). |
| CA7 | LLM / health via Railway continuam operacionais (smoke) sem serem a fila oficial (RF6, RNF5). |
| CA8 | Nenhuma alteração de contrato do Motor, Gate, Classificador ou Consciência além do necessário ao caminho da fila (RF9). |
| CA9 | Painel/Consciência, quando mostram Jobs do MVP, não misturam contagem Railway com a fila oficial como se fossem uma (RF8). |
| CA10 | Documentação mínima referencia ARQ-021, este REQ, REQ-045, REQ-053 e BP-001 (fronteira). |

### Critérios negativos

| ID | Critério |
|----|----------|
| NA1 | A fila Railway **não** é a fonte de verdade do ciclo Job MVP. |
| NA2 | O Dispatcher **não** é obrigado a consumir Jobs só existentes em Railway. |
| NA3 | Este REQ **não** autoriza Dispatcher cloud 24/7 (V3). |
| NA4 | Este REQ **não** modifica a política de Gate nem as classes do Classificador. |
| NA5 | Este REQ **não** autoriza o CEO no browser a invocar `@cursor/sdk` (REQ-030). |

---

## Casos de Uso

### CU1 — Publicação na fila oficial (CA2)

1. Utilizador conclui fluxo C3 / Gate que autoriza Job.  
2. Sistema publica Job.  
3. Existe `executive/queue/JOB-*.json` com `estado = pending` no PC.

**Sucesso:** CA2, RF2.

### CU2 — Dispatcher consome a mesma fila (CA3)

1. Job `pending` na fila oficial (CU1).  
2. Watcher Dispatcher activo no PC.  
3. Dispatcher deteta o Job e inicia o protocolo de consumo (lock / Agent), **sem** consultar a fila Railway.

**Sucesso:** CA3, RF3.

### CU3 — Fonte de verdade do ciclo (CA4)

1. Agent marca `running` e depois `completed` (ou `failed`).  
2. Os estados estão nos ficheiros da fila oficial.  
3. Nenhuma outra loja é necessária para considerar o ciclo oficial fechado.

**Sucesso:** CA4, RF4.

### CU4 — BP-001 sem usurpar a fila (CA6, CA7)

1. Front usa API Railway para LLM / health.  
2. Publicação oficial de Job **não** depende de `POST` Railway `/api/ceo/queue/jobs` como destino canónico.  
3. Health/LLM respondem OK.

**Sucesso:** CA6, CA7, RF6.

### CU5 — Sem redesign de Motor/Gate/Classificador/Consciência (CA8)

1. Implementação da restauração limita-se ao caminho da fila.  
2. Contratos ARQ-017/018/019/020 e REQ-056/057/058/059 permanecem; testes de regressão dessas frentes não exigem redesign.

**Sucesso:** CA8, RF9.

### CU6 — Proibição de handoff falso (CA5)

1. Se um caminho ainda escrevesse só em Railway, não pode reportar handoff oficial ao Dispatcher.  
2. Após conformidade, só a presença na fila oficial autoriza essa prosa/metadado.

**Sucesso:** CA5, RF5.

---

## Restrições

| ID | Restrição |
|----|-----------|
| RES1 | Norma: CON-001; ADR-015; ADR-006 (fluxo ARQ→REQ→IMP). |
| RES2 | Alinhamento integral à **ARQ-021 homologada**. |
| RES3 | Reafirma **REQ-045** e **REQ-053** — não as substitui. |
| RES4 | Motor: **ARQ-017 / REQ-056** — contratos preservados (RF9). |
| RES5 | Classificador: **ARQ-018 / REQ-057** — preservado. |
| RES6 | Continuidade do Gate: **ARQ-019 / REQ-058** — preservada. |
| RES7 | Consciência: **ARQ-020 / REQ-059** — preservada; passa a ler a fila oficial. |
| RES8 | BP-001: Backend de Produção para serviços online — **não** fila oficial. |
| RES9 | REQ-030: oficina no Agent/Cursor; CEO não executa SDK no browser. |
| RES10 | Sem implementação até IMP autorizada por etapa. |

---

## Fora de Escopo

| ID | Fora | Coberto por / nota |
|----|------|-------------------|
| FE1 | Código / IMP nesta fase | IMP futura após Gate deste REQ |
| FE2 | Dispatcher cloud 24/7 | V3 / REQ futuro |
| FE3 | Redesign do Motor, Gate, Classificador ou Consciência | REQ-056…059 |
| FE4 | Limpeza obrigatória de Jobs órfãos já criados em Railway | Operacional / IMP opcional |
| FE5 | Sincronização bidireccional Railway ↔ PC como solução MVP | Proibido como atalho; só norma futura |
| FE6 | Alterar CON / ADR / schema constitucional dos Jobs | Fora |
| FE7 | Escolha fina do mecanismo de publicação local em produção (companion, API local, etc.) | IMP — desde que cumpra RF1–RF7 |

---

## Dependências

| ID | Dependência |
|----|-------------|
| D1 | **ARQ-021** homologada |
| D2 | **REQ-045** (Fila V1 local) |
| D3 | **REQ-053** (Dispatcher V2 local) |
| D4 | **REQ-056** / ARQ-017 (Motor — publicação pós-política) |
| D5 | BP-001 (contexto de fronteira; não norma de fila) |

---

## Riscos e incertezas

| ID | Risco / incerteza | Mitigação |
|----|-------------------|-----------|
| RI1 | SPA na Vercel sem acesso directo ao disco do PC | IMP deve garantir caminho que escreva na fila local; RF5 impede handoff falso |
| RI2 | Dual-run (local conforme / prod ainda desconforme) | CA2–CA6; verificação em produção na IMP |
| RI3 | Confusão de IDs JOB-* entre Railway e local | RF8, RNF7; NA1 |
| RI4 | Tentação de sync silencioso Railway→PC | FE5; só com REQ futuro |
| RI5 | Regressão do Painel (heartbeat vs fila) | RNF4 — heartbeat ≠ fila |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 — Integrações |
| Norma superior | CON-001; ADR-015; ADR-006 |
| Arquitectura | **ARQ-021** (homologada) |
| Reafirmados | REQ-045; REQ-053 |
| Preservados | REQ-056; REQ-057; REQ-058; REQ-059 |
| Fronteira | BP-001 (Backend de Produção) |
| Origem | Gate ARQ-021; diagnóstico desvio cutover E4/E8 |
| Decisões derivadas | IMP-060 (plano E1–E6 — aguarda Gate do REQ + Gate do plano) |
| Implementação | IMP-060 — código proibido até Gates |
| Testes | — (definir na IMP) |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Criação REQ-060 | Materializar ARQ-021 homologada | Em análise — aguarda Gate |

---

**Fim do REQ-060 v0.1.** Aguardar Gate do patrocinador. **Não** implementar. **Não** abrir IMP sem autorização.
