# IMP-055 — Painel de Orquestração em Tempo Real

> **Status: Em análise — aguarda homologação do plano** (01/08/2026).  
> Norma: **REQ-055** (homologada); **ARQ-016 v0.2** (homologada).  
> **Natureza:** plano de implementação detalhado.  
> **Proibições neste artefacto:** código; alterar REQ/ARQ; abrir novas frentes.

---

## 1. Objetivo

Converter a REQ-055 num plano executável que entregue o Painel de Orquestração V1 no Centro de Situação: seis nós com estados padronizados, actualização quase em tempo real, **Princípio da Progressividade**, Conversa (SRF-T03) central, painel **exclusivamente observacional**.

## 2. Escopo

### 2.1 Inclui

* Serviço de Orquestração (agregação de sinais → `OrquestracaoNo`).  
* Portas `GET /api/ceo/orquestracao/snapshot` e `GET /api/ceo/orquestracao/stream` (SSE), com paridade Vite/`server`.  
* UI do painel no Centro de Situação (Progressividade + expansão sob clique).  
* Cliente front: SSE preferencial + polling fallback.  
* Coletores V1 para os seis nós (`ceo`, `cto`, `agent`, `dispatcher`, `backend`, `speaker`) via **leitura** de sinais existentes + heartbeat mínimo do dispatcher.  
* Testes e documentação operacional mínima.  
* Registo extensível de nós (estrutura pronta; só os seis obrigatórios activos na V1).

### 2.2 Exclui (explícito)

* Alterar enunciados REQ-055 / ARQ-016.  
* Controlo remoto start/stop do watcher.  
* Dashboard de infra (CPU, custos, logs brutos na vista principal).  
* Novos estados fora do enum.  
* RBAC multi-utilizador do stream.  
* Qualquer acção que invoque MRE, Fila (escrita), ou Conector CTO a partir do painel.

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-016 v0.2 e REQ-055 estão homologadas e são a norma. |
| P2 | Progressividade é **obrigatória**: vista principal = Nome · Estado · descrição resumida. |
| P3 | Conversa (SRF-T03) permanece o elemento central; o painel é apoio (SRF-T02). |
| P4 | O painel é **só observação** — zero efeitos laterais de execução. |
| P5 | Backend Railway e front Vercel já hospedam o ciclo CEO/CTO; dispatcher continua local (REQ-053). |
| P6 | Paridade Vite plugin ↔ `server/` (padrão BP-001 / IMP-054). |
| P7 | Descrições resumidas V1 são **copy humana fixa** (mapa estado×nó), não prosa gerada por LLM. |
| P8 | Heartbeat do dispatcher: canal mínimo decidido nesta IMP (ficheiro sob `executive/dispatcher/logs/` **e/ou** `POST` leve ao backend) — sem mudar REQ. |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-016 v0.2 | Contratos, estados, SSE, Progressividade, layout |
| REQ-055 | Critérios CA/NA |
| REQ-053 / dispatcher | Sinal Agent/Dispatcher (fila + heartbeat) |
| REQ-054 / CTO | Sinal de consulta em curso / último resultado (leitura) |
| `GET /health`, `GET /api/ceo/llm-status` | Backend / configuração LLM |
| Centro de Situação existente | Âncora de UI |
| Speaker / experiência de voz | Sinal Speaker (leitura de estado de fala, se exposto; senão heurística segura → Ocioso/Disponível) |

## 5. Estratégia de implementação

1. **Contrato e domínio primeiro** (tipos, enum, redução de sinais, copy) — testável sem UI.  
2. **API snapshot** antes de SSE; UI com polling; depois SSE.  
3. **UI Progressiva** antes de enriquecer detalhes.  
4. **Coletores por nó** incrementais; stubs honestos onde o sinal ainda for fraco (ex.: Speaker), sem inventar telemetria.  
5. **Não bloqueante:** falha do serviço de orquestração não afecta chat/MRE/CTO/Fila.  
6. **Gates por etapa (E1…):** cada E homologável isoladamente antes da seguinte.

---

## 6. Etapas (granulares e homologáveis)

### E1 — Domínio e contrato `OrquestracaoNo`

**Objectivo:** modelo canónico in-memory + validação do enum e da Progressividade no contrato de dados.

**Entregáveis:**

* Módulo domínio (ex. `orquestracao/dominio.js`): estados, IDs V1, `validarNo`, `aplicarPrecedencia`, mapa `descricaoResumida` fixa.  
* Tipo/shape `OrquestracaoSnapshot` / `OrquestracaoNo` alinhado à REQ-055.  
* Testes unitários do domínio.

**Critérios de aceite E1:**

* E1-CA1: Só os cinco estados do enum são aceites.  
* E1-CA2: Precedência Erro > Executando > Aguardando > Disponível > Ocioso verificada em teste.  
* E1-CA3: Todo nó V1 tem `descricaoResumida` não vazia para cada estado (ou subset documentado).  
* E1-CA4: Campos `detalhe` / `origemSinal` existem no modelo mas **não** são requisitos da vista principal.

**Homologação E1:** revisão + `npm test` do domínio. Sem UI. Sem rotas públicas obrigatórias.

---

### E2 — Serviço de agregação + Snapshot HTTP

**Objectivo:** `GET /api/ceo/orquestracao/snapshot` devolve os seis nós (Vite + `server`).

**Entregáveis:**

* Serviço agregador com registo de coletores (`RegistoNoOrquestracao`).  
* Coletores iniciais: `backend` (`/health` interno), restantes com sinal mínimo ou stub documentado (`Ocioso`/`Disponível`/`Erro` conforme regra).  
* Rota snapshot em plugin Vite e `server`.  
* Teste: snapshot tem 6 IDs; estados válidos.

**Critérios de aceite E2:**

* E2-CA1: Snapshot HTTP 200 com `nos.length === 6` e IDs canónicos.  
* E2-CA2: Paridade de path Vite/`server`.  
* E2-CA3: Falha de um coletor não derruba o snapshot (nó → Erro ou estado seguro documentado).  
* E2-CA4: Resposta sem segredos.

**Homologação E2:** curl/smoke local + testes. Sem UI ainda (opcional cliente mínimo só para smoke).

---

### E3 — UI Progressiva no Centro de Situação

**Objectivo:** renderizar o painel com Nome · Estado · descrição resumida; Conversa intacta e dominante.

**Entregáveis:**

* Módulo UI no Centro (região secundária: abaixo/ao lado da conversa — ARQ-016 §7).  
* Consumo do snapshot (polling 3–5 s nesta etapa).  
* CSS/estados acessíveis (rótulo + cor).  
* Checklist Progressividade: zero campos técnicos na vista principal.

**Critérios de aceite E3:**

* E3-CA1: Seis nós visíveis com exactamente os três campos principais.  
* E3-CA2: Checklist Progressividade PASS (revisão visual + teste DOM se aplicável).  
* E3-CA3: Conversa permanece a região dominante (revisão UX / hierarquia visual).  
* E3-CA4: Painel não chama APIs de escrita (Fila/CTO/MRE).  
* E3-CA5: Falha do snapshot mostra estados de Erro/degradação **sem** partir o chat.

**Homologação E3:** revisão visual no Centro + checklist Progressividade.

---

### E4 — Expansão de detalhe (Progressividade nível 2)

**Objectivo:** clique/expansão revela `detalhe`; recolher restaura a vista principal.

**Entregáveis:**

* Interacção expand/collapse por nó.  
* Conteúdo de detalhe allowlisted (Job id, erro curto, “desde quando”, origem) — sem keys.  
* Acessibilidade básica (teclado/aria se o padrão do Centro já o exigir).

**Critérios de aceite E4:**

* E4-CA1: Expansão mostra detalhe; colapso remove da vista principal.  
* E4-CA2: Vista principal continua só com os três campos.  
* E4-CA3: Sem navegação forçada para fora do Centro.

**Homologação E4:** teste manual de expansão + regressão Progressividade.

---

### E5 — SSE + fallback polling

**Objectivo:** `GET /api/ceo/orquestracao/stream`; cliente prefere SSE; se falhar, mantém polling.

**Entregáveis:**

* Endpoint SSE (`snapshot` inicial + `no.atualizado` / `pulse`).  
* Debounce 300–500 ms no servidor ou cliente.  
* Cliente: EventSource (ou equivalente) + fallback.  
* Indicador discreto “actualização periódica” só no fallback (não dominar a conversa).

**Critérios de aceite E5:**

* E5-CA1: Com SSE OK, UI actualiza sem reload.  
* E5-CA2: SSE cortado → polling assume sem derrubar chat (NA2).  
* E5-CA3: Paridade Vite/`server` do stream (ou documentar limitação transitória com Gate).

**Homologação E5:** smoke SSE + teste de corte de stream.

---

### E6 — Coletores reais V1 (sinais de leitura)

**Objectivo:** substituir stubs pelos sinais de leitura acordados, sem efeitos.

**Entregáveis (por nó):**

| Nó | Sinal mínimo V1 |
|----|-----------------|
| `backend` | Resultado de health do próprio processo / última verificação |
| `cto` | Consulta em voo (flag in-process) ou último estado tipado; `llm-status.configurado` |
| `ceo` | Ciclo `executiveEngine` em curso (flag) ou ocioso/aguardando |
| `agent` / `dispatcher` | Fila (`pending`/`running`/`failed`) + heartbeat dispatcher (TTL) |
| `speaker` | Estado de fala se já existir API interna; senão Ocioso/Disponível documentado |

* Heartbeat dispatcher: ficheiro `executive/dispatcher/logs/heartbeat.json` actualizado pelo watcher **e/ou** `POST /api/ceo/orquestracao/heartbeat` (só escrita de sinal; sem controlo remoto).  
* Documentar TTL (ex. 45–90 s sem pulse → Dispatcher Erro/Aguardando).

**Critérios de aceite E6:**

* E6-CA1: Cada nó reflecte pelo menos um sinal real de leitura (Speaker pode permanecer heurístico se documentado).  
* E6-CA2: Nenhuma escrita em Fila/Jobs a partir do painel.  
* E6-CA3: PC sem watcher → Dispatcher não fica “Disponível” falso para além do TTL.  
* E6-CA4: Testes de mapeamento sinal→estado para fila + health.

**Homologação E6:** smoke com fila vazia/pending e health down simulado.

---

### E7 — Extensibilidade + documentação + fecho CA REQ

**Objectivo:** registo de nós utilizável; docs; matriz CA1–CA8 / NA1–NA3; critérios de commit.

**Entregáveis:**

* API de registo (`RegistoNoOrquestracao`) usada pelos seis nós.  
* README curto do painel (estados, Progressividade, portas).  
* Evidência de testes + checklist Progressividade + hierarquia Conversa.  
* Actualização Âncora/catálogo na entrega final (após Gate de código — não nesta fase de plano).

**Critérios de aceite E7:**

* E7-CA1: Adicionar um nó *dummy* em teste não exige alterar o renderer (prova de extensão).  
* E7-CA2: CA1–CA8 e NA1–NA3 da REQ-055 mapeados a evidência.  
* E7-CA3: Documentação mínima publicada no repo.

**Homologação E7:** revisão do pacote de evidências → Gate técnico de implementação (futuro) → só então commit.

---

## 7. Ordem e dependências entre etapas

```text
E1 → E2 → E3 → E4
         ↘ E5 (pode iniciar após E2; UI liga em E3/E5)
E2 → E6 (coletores enriquecem snapshot)
E3–E6 → E7 (fecho)
```

Cada etapa exige **homologação interna** (patrocinador ou checklist assinado) antes de avançar código da seguinte — excepto E5 paralelo a E3/E4 se o snapshot já existir.

## 8. Estratégia de testes

| Tipo | O quê |
|------|--------|
| Unitário | Domínio: enum, precedência, descrições, validação de nó |
| Unitário | Mapeadores sinal→estado (fila, health, heartbeat TTL) |
| Integração | Snapshot 6 nós; SSE smoke; fallback polling |
| UI / manual | Progressividade; expansão; Conversa dominante; chat vivo com snapshot em Erro |
| Regressão | Chat, CTO (`/cto/consultar`), Fila e MRE inalterados em comportamento |
| Negativo | Painel sem chamadas de escrita; SSE down não mata chat |

Comando previsto (a criar na implementação): ex. `npm run test:orquestracao` em `app/`.

## 9. Critérios de homologação do **plano** IMP-055 (este documento)

O plano considera-se homologado quando o patrocinador confirmar:

1. Etapas E1–E7 suficientes e na ordem certa.  
2. Progressividade e Conversa central explícitas em todas as etapas de UI.  
3. Painel observacional (NR2/CA7) respeitado.  
4. Heartbeat dispatcher aceite como detalhe de IMP (P8) sem reabrir REQ.  
5. Autorização para **iniciar código pela E1** (e só E1) após este Gate.

## 10. Critérios de homologação da **implementação** (após código — referência)

* Todas as E homologadas.  
* CA1–CA8 e NA1–NA3 da REQ-055 com evidência.  
* Testes automatizados relevantes a verde.  
* Smoke em local (e produção só após commit autorizado).  
* Relatório técnico de fecho (como IMP-054).

## 11. Critérios para commit

Commit **só** quando:

1. Gate do plano IMP-055 estiver homologado **e**  
2. Implementação das etapas autorizadas estiver concluída e com Gate técnico de código **e**  
3. Escopo = apenas ficheiros do Painel/orquestração (sem BP/PX laterais) **e**  
4. Mensagem de commit referencie REQ-055 / IMP-055 **e**  
5. Patrocinador autorizar explicitamente commit/push/deploy.

**Proibido:** commit parcial que viole Progressividade; commit que altere REQ/ARQ; commit de controlo remoto do watcher.

## 12. Riscos do plano

| Risco | Mitigação na execução |
|-------|------------------------|
| SSE frágil em proxy | E5 com fallback obrigatório |
| Speaker sem sinal | Heurística documentada em E6 |
| Falso positivo Dispatcher | TTL heartbeat em E6 |
| UI a crescer demais | Checklist Progressividade em E3/E4/E7 |

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | REQ-055 |
| ARQ | ARQ-016 v0.2 |
| CAP | CAP-07 |
| Precedentes IMP | IMP-054 (paridade servidor); REQ-053/054 (sinais) |

## 14. Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Plano E1–E7 pós Gate REQ-055 | **Aguarda homologação do plano** |

---

*Fim do plano IMP-055 v0.1. Nenhum código nesta etapa. Aguarda Gate para iniciar E1.*
