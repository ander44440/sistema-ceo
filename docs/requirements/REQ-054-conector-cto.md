# REQ-054 — Conector CTO (CTO Connector)

> **Status:** Homologada  
> **Versão:** 0.1 — 01/08/2026  
> **Capacidade:** CAP-11 — Integrações

## Enunciado

O Sistema CEO deverá permitir ao Orquestrador (Núcleo Executivo) consultar o CTO (papel constitucional, ChatGPT via API) através de um **Conector CTO**: enviar um pacote de consulta com contexto executivo, obter uma resposta estruturada validada e retomar o fluxo de coordenação — **sem** fundir esse canal com a deliberação do Agente Executivo (MRE) e **sem** expor credenciais ao browser.

## Tipo

Funcional; detalhado (MVP do Conector CTO).

## Justificativa

CON-001 Art. 6º II define o CTO (ChatGPT) como responsável por requisitos, arquitetura e revisão — sem implementar código. Hoje esse papel só existe no chat humano, com ponte manual de contexto. A **ARQ-015 v0.2** (homologada) define o Connector como integração CAP-11: transporte + contratos + policy de papel, reutilizando a infra HTTP/OpenAI já existente no backend (Opção B: mesma chave; isolamento lógico). ADR-015 e o respeito ao tempo do utilizador exigem reduzir essa ponte sem violar a separação de papéis (ADR-002 D5; ADR-019).

## Objetivo funcional

1. Permitir consultas governadas ao CTO a partir do Orquestrador.  
2. Garantir respostas **estruturadas e validáveis** (schema).  
3. Manter **isolamento lógico** entre canal MRE (`/api/ceo/deliberar`) e canal CTO (`/api/ceo/cto/...`).  
4. Reutilizar a infraestrutura HTTP e a resolução de chave já existentes no backend.  
5. Devolver o resultado ao Orquestrador para este decidir efeitos (UI, artefacto, Fila) — o Connector **não** executa esses efeitos.

---

## Responsabilidades do componente

| ID | Responsabilidade |
|----|------------------|
| R1 | Aceitar `PacoteConsultaCto` emitido pelo Orquestrador. |
| R2 | Validar o pacote de entrada antes de chamar a API. |
| R3 | Aplicar **policy de papel CTO** (não implementar código; foco em requisitos/arquitetura/revisão/gates). |
| R4 | Invocar o **transporte HTTP partilhado** do backend (OpenAI-compatible `/chat/completions`) com a **mesma** credencial do canal MRE. |
| R5 | Validar a resposta contra o schema declarado em `expectativaSchema`. |
| R6 | Devolver `ResultadoCto` tipado ao Orquestrador (`ok` / `recusa` / erros de transporte/schema/timeout). |
| R7 | Registar rastreio mínimo (`consultaId`, modelo, latência, timestamps) **sem** vazar segredos nem a chave. |

---

## Limites do componente / não responsabilidade

O Conector CTO **não** deverá:

| ID | Não responsabilidade |
|----|----------------------|
| NR1 | Decidir *se* o CTO deve ser consultado (compete ao Orquestrador / política de gates). |
| NR2 | Deliberar como CEO Digital (MRE / REQ-048…051). |
| NR3 | Implementar código, abrir PRs ou publicar Jobs na Fila (REQ-045/053). |
| NR4 | Homologar REQ/ADR/ARQ (fluxo ADR-006 + patrocinador). |
| NR5 | Falar directamente com o utilizador (Speaker / Conversação Natural / canais). |
| NR6 | Exigir ou gerir uma **segunda** API key só para o CTO (Opção B da ARQ-015). |
| NR7 | Substituir o chat ChatGPT do patrocinador. |
| NR8 | Duplicar um segundo cliente HTTP OpenAI se o transporte partilhado for suficiente. |

---

## Contratos de entrada e saída

### Entrada — `PacoteConsultaCto` (IFA-CTO-01)

| Campo | Obrig. | Descrição |
|-------|--------|-----------|
| `consultaId` | sim | Identificador único da consulta (UUID/ULID), gerado pelo Orquestrador |
| `tipo` | sim | `parecer_arquitetural` \| `revisao_req` \| `revisao_arq` \| `gate` \| `duvida_normativa` \| `outro` |
| `pergunta` | sim | Questão objetiva ao CTO |
| `contextoExecutivo` | sim | Objeto com blocos mínimos: situação, norma aplicável (refs), estado/âncora, evidência, pedido de formato |
| `artefactosRef` | não | Lista de refs (paths/IDs REQ/ARQ/commits) — não blobs integrais por defeito |
| `restricoes` | não | Ex.: “não propor código”; “responder só A/B/C” |
| `expectativaSchema` | sim | Um de: `cto.parecer_v1` \| `cto.revisao_artefacto_v1` \| `cto.gate_v1` \| `cto.duvida_normativa_v1` |
| `prioridade` | não | `normal` \| `alta` |
| `coaId` / `projeto` | não | Ancoragem ao COA |

### Saída — `ResultadoCto` (IFA-CTO-02)

| Campo | Obrig. | Descrição |
|-------|--------|-----------|
| `consultaId` | sim | Eco da entrada |
| `estado` | sim | `ok` \| `recusa` \| `erro_transporte` \| `erro_schema` \| `timeout` |
| `papelConfirmado` | sim | Literal `CTO` quando `estado=ok` ou `recusa` com corpo do modelo; em erros de transporte pode omitir-se o corpo CTO |
| `resumo` | se ok | Síntese curta para Orquestrador / Speaker |
| `corpoEstruturado` | se ok | Conforme `expectativaSchema` |
| `opcoes` | não | Alternativas A/B/C quando aplicável |
| `recomendacao` | não | Preferência + justificação |
| `riscos` | não | Riscos explícitos |
| `proximosPassosSugeridos` | não | Sugestões ao Orquestrador (**não** ordens ao Engenheiro) |
| `rastreio` | sim | Pelo menos `modelo`, `latenciaMs`, `criadoEm` |

### Porta servidor — IFA-CTO-03

* Rota dedicada sob o backend do CEO (ex. `POST /api/ceo/cto/consultar`), **distinta** de `POST /api/ceo/deliberar`.  
* Cliente do Orquestrador chama só a API interna do CEO; **nunca** a OpenAI a partir do browser.  
* Credencial: resolução existente (`CEO_LLM_API_KEY` \| `OPENAI_API_KEY` \| `CEO_OPENAI_API_KEY`).

---

## Regras de validação

### Entrada

* V-E1: Rejeitar pacote sem `consultaId`, `tipo`, `pergunta`, `contextoExecutivo` ou `expectativaSchema`.  
* V-E2: `tipo` e `expectativaSchema` devem pertencer aos enums deste REQ.  
* V-E3: `pergunta` e contexto sujeitos a *budget* de tamanho (limite concreto na IMP; princípio: mínimo suficiente).  
* V-E4: Pacote inválido → `ResultadoCto` com estado de erro de validação de entrada **sem** chamar a OpenAI (tipagem: tratar como falha de contrato; na IMP pode mapear-se a código HTTP 400 + corpo `ResultadoCto` ou equivalente documentado).

### Saída / modelo

* V-S1: Resposta do modelo deve ser interpretável como JSON alinhado ao schema pedido.  
* V-S2: Em falha de schema: **no máximo um** retry de correção; se persistir → `estado=erro_schema`.  
* V-S3: Se `estado=ok`, `papelConfirmado` deve ser `CTO`.  
* V-S4: Schemas `cto.*` **não** incluem campos de patch de código, diff de repositório ou instruções de commit.  
* V-S5: Policy CTO deve instruir explicitamente: não implementar código; não usurpar o papel do Engenheiro nem do patrocinador na homologação.

### Transporte / credencial

* V-T1: Sem chave configurada no backend → `erro_transporte` (ou código equivalente alinhado ao canal MRE “não configurado”), mensagem clara, **sem** vazar nomes de ficheiros sensíveis além do necessário operacional.  
* V-T2: Timeout / falha de rede → `timeout` ou `erro_transporte`.  
* V-T3: O Connector **deve** reutilizar o cliente/config HTTP existente (`configDeEnv` + `chamarLlm` ou equivalente unificado); proibido segundo stack HTTP paralelo “só CTO” sem justificação na IMP.

### Isolamento lógico (obrigatório)

* V-I1: Rota CTO ≠ rota MRE deliberar.  
* V-I2: Contratos IFA-CTO ≠ payload de mensagens do MRE.  
* V-I3: Policy/contexto do CTO ≠ prompt de deliberação do CEO Digital.  
* V-I4: Capacidade/rota do Orquestrador para CTO ≠ capacidade `ia` deliberativa MRE.

---

## Integração com o Orquestrador

* O **Núcleo Executivo** (`executiveEngine`) é o único emissor canónico de `PacoteConsultaCto` no MVP.  
* Deve existir capacidade ou rota interna explícita (ex. `consultar_cto`) que:  
  1. monta o pacote;  
  2. chama o cliente do Connector;  
  3. consome `ResultadoCto`;  
  4. decide efeitos posteriores (**fora** do Connector): comunicar via Speaker/CN, actualizar estado, sugerir artefacto, ou despachar Job (REQ-045) se couber.  
* O Orquestrador **não** deve reutilizar a chamada `deliberarComLlm` / `/api/ceo/deliberar` como se fosse consulta CTO.

---

## Integração com o backend existente

* Reutilizar resolução de env e transporte HTTP já usados por `ceoLlmPlugin` / `server` (`/api/ceo/deliberar`).  
* Acrescentar rota(s) CTO no mesmo backend (Vite plugin em dev e/ou `server` em produção), partilhando o módulo de transporte.  
* Variáveis: **não** exigir `CEO_CTO_API_KEY`; opcionalmente `CEO_CTO_MODEL` na IMP se se quiser override de modelo **sem** nova chave.  
* Paridade local (Vite) e produção (Railway/`server`) deve ser preservada no mesmo espírito do canal LLM actual (detalhe na IMP).

---

## Critérios de aceitação

* CA1: Existe endpoint interno CTO distinto de `/api/ceo/deliberar`.  
* CA2: Dado um `PacoteConsultaCto` válido e backend com chave configurada, o Orquestrador recebe `ResultadoCto` com `estado=ok` ou `recusa` e corpo validável pelo schema pedido (teste automatizado ou evidência de smoke documentada).  
* CA3: Pacote inválido **não** provoca chamada à OpenAI.  
* CA4: Resposta fora do schema, após no máximo um retry, resulta em `erro_schema` tipado.  
* CA5: Browser **nunca** contém a API key; apenas chama a API do CEO.  
* CA6: Connector e MRE partilham a mesma fonte de credencial (Opção B) e código de transporte partilhado (evidência na IMP: import/reuse, não cópia divergente).  
* CA7: Policy CTO impede campos de implementação de código no schema aceite.  
* CA8: Documentação mínima (README ou secção IMP) descreve: como consultar, enums, estados de erro, e diferença face ao deliberar MRE.  
* CA9: Nenhuma alteração a este REQ permite ao Connector publicar Jobs ou alterar Constituição/Governança.

---

## Critérios de aceitação negativos (não responsabilidade observável)

* NA1: Consultar o CTO **não** passa pelo pipeline MRE 0–7.  
* NA2: Um `ResultadoCto` **não** cria Job na fila automaticamente.  
* NA3: Ausência de segunda API key **não** é defeito.  
* NA4: Falha do Connector **não** deve corromper o estado do MRE nem da Fila.

---

## Fora do escopo

* Implementação (IMP) e VAL formais — etapas seguintes após homologação deste REQ.  
* Dispatcher V3 / cloud 24/7 (backlog; Âncora Mestra).  
* Substituição do UI ChatGPT do patrocinador.  
* Novos schemas além do catálogo §contratos (extensões = emenda a este REQ ou REQ derivado).  
* Multi-fornecedor além de API OpenAI-compatible já suportada pelo backend.

## Dependências

* **ARQ-015 v0.2** (homologada) — norma arquitetural deste REQ.  
* Infra LLM backend existente (`configDeEnv` / `chamarLlm` / `/api/ceo/deliberar`).  
* CON-001 Art. 6º II; CAP-11; ADR-002 D5; ADR-015; ADR-019.  
* REQ-045 / REQ-053 — apenas como destino *opcional* de efeitos do Orquestrador **após** o resultado CTO (não parte do Connector).

## Riscos e incertezas

* Confusão operacional MRE ↔ CTO apesar da mesma chave — mitigado por rotas/contratos/testes de isolamento (V-I*).  
* Custo/latência de API — consultas devem ser gates conscientes no Orquestrador.  
* Modelo devolver prosa fora do JSON — retry único + `erro_schema`.  
* Drift entre Vite plugin e `server` em produção — IMP deve exigir paridade.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-11 — Integrações |
| Norma superior | CON-001 Art. 6º II, Art. 7º §2; ADR-002 D5; ADR-015; ADR-019 |
| Origem | Homologação ARQ-015 v0.2 (01/08/2026); abertura de fase REQ pelo patrocinador |
| Arquitetura | ARQ-015 |
| Decisões derivadas | — |
| Implementação | IMP-054 (aguarda homologação técnica) |
| Testes | `app` → `npm run test:cto` |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Criação pós Gate ARQ-015 | Abrir fase de requisitos | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação REQ; abertura IMP-054 | Gate de requisitos | **Homologada** |

---

*Nenhuma implementação até homologação deste REQ-054.*

---

*REQ-054 homologada 01/08/2026. Implementação sob IMP-054 — commit só após Gate técnico.*
