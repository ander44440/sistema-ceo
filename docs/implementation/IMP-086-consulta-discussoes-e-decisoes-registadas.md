# IMP-086 — Consulta de discussões e decisões registadas

> **Status: IMPLEMENTADA · HOMOLOGADA — v1.0 (09/09/2026).**  
> Plano homologado; implementação V1 executada e **homologada** (validação técnica APTO; 17/17 testes; build OK).  
> **Versão:** 1.0 — 09/09/2026  
> Norma: **REQ-086 v1.0 Homologado**; **ARQ-086 v1.0 Homologada** — **inalterados** por este acto.  
> Capacidade: **CAP-05** — Memória Organizacional (consulta; discussões = consumo da interface conversacional).  
> **Natureza:** plano + entrega V1. Registo formal: [`evidencias/IMP-086-homologacao.md`](evidencias/IMP-086-homologacao.md).  
> **Gate da entrega:** fechado (homologada). **Commit/push/deploy:** fora deste acto.  
> **Preservado:** read-only; isolamento COA; MO Art. 8º; transcript; ausência explícita; pedido explícito; Trilha opcional; Histórico Físico fora; sem quarta memória; sem API HTTP dedicada.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Plano executável da consulta V1: pedido explícito → leitura MO +/ou transcript por COA → resposta separada com ausência explícita. |
| **Por que existe?** | REQ/ARQ homologados; falta materializar D-PED / C-ORQ / C-SEP sem violar I1–I10. |
| **Para quem existe?** | Engenheiro (execução futura); CTO/Usuário (Gates); patrocinador (uso diário). |
| **Como medir sucesso?** | CA-086-1…9 + invariantes ARQ I1–I10 verificáveis por testes; zero escrita nos stores no fluxo. |

---

## 1. Estrutura técnica necessária

### 1.1 Módulo novo (domínio puro)

Pasta proposta: `app/src/consultaRegistados/` (nome alinhado ao normativo; evita colisão com “recuperação” F5/Jobs).

| Peça ARQ | Módulo / API | Papel |
|----------|--------------|--------|
| **D-PED** | `pedidoExplicito.js` | Matcher determinístico âncoras +/− (REQ-086); saída `{ ehPedido, ramo: "decisao"\|"discussao"\|"ambos"\|null, coaNomeado? }` |
| **C-ORQ** | `orquestrarConsulta.js` | Resolve `coaId`; chama F-MO / F-TX / F-TR; **zero I/O de escrita** |
| **C-SEP** | `montarResposta.js` | Secções Decisões / Discussões / Referências opcionais; ausência explícita por ramo |
| **F-MO** | adapter fino sobre `memoriaConfiavel` | Só `consultarRegistosMo` / `listarRegistosMo` |
| **F-TX** | adapter fino sobre transcript | Só leitura de bucket COA |
| **F-TR** | adapter opcional | Só refs se ligáveis; falha soft (não bloqueia consulta) |
| barrel | `index.js` | Exports públicos do módulo |

### 1.2 Integração (sem store novo)

| Peça | Onde | Papel |
|------|------|--------|
| Hook Núcleo | `app/src/executiveEngine/index.js` (`executar`) | Após precedências Gate/AD vigentes: se D-PED ⇒ C-ORQ → resposta; **não** seguir Classificador/Motor/Porta EIC para esse turno |
| COA | contexto conversacional já existente | `coaId` activo; nomeação explícita se D-PED extrair |
| Transcript | `modules/conversa/persistenciaChat.js` + `store.js` | `carregarBucketChat` / `listarMensagens` no COA alvo — **read-only** neste fluxo |
| MO | `memoriaConfiavel` | Já hidratado no boot (`hidratarMemoriaConfiavel`) |
| Trilha | `trilhaAuditavel` (opcional) | `listarPorJob` / leitura por refs **se** existirem no registo MO; nunca obrigatório |

### 1.3 Invariantes de implementação (obrigatórias)

| ID | Regra de código |
|----|-----------------|
| I1 | Nenhuma chamada a `appendRegistroMo`, `gravarBucketChat`, `appendEvento*`, writers workspace no caminho IMP-086 |
| I2 | Todo filtro passa `coaId`; testes de fuga entre COAs |
| I3 | Decisões só de F-MO |
| I4 | Discussões só de F-TX; CAP-05 não “possui” o ficheiro de chat |
| I5–I7 | C-SEP + D-PED conforme REQ |
| I8 | F-TR opt-in; ausência de Trilha ≠ falha |
| I9–I10 | Sem módulo Histórico Físico; sem `consulta.*.store`; sem rota `/api/ceo/consulta*` |

---

## 2. Arquivos a criar / alterar

### 2.1 Criar (na execução futura)

| Arquivo | Motivo |
|---------|--------|
| `app/src/consultaRegistados/pedidoExplicito.js` | D-PED |
| `app/src/consultaRegistados/orquestrarConsulta.js` | C-ORQ |
| `app/src/consultaRegistados/montarResposta.js` | C-SEP |
| `app/src/consultaRegistados/portasLeitura.js` | F-MO / F-TX / F-TR (adapters) |
| `app/src/consultaRegistados/index.js` | API do módulo |
| `app/src/consultaRegistados/pedidoExplicito.test.js` | CA-086-6/8 |
| `app/src/consultaRegistados/orquestrarConsulta.test.js` | CA-086-1…5,7,9 + isolamento |
| `app/src/consultaRegistados/integracao.consulta.test.js` | Hook Núcleo / regressão destinos |

### 2.2 Alterar (mínimo, na execução futura)

| Arquivo | Delta permitido |
|---------|-----------------|
| `app/src/executiveEngine/index.js` | Import + ramo precoce pós-Gate/AD: pedido explícito → consulta; **sem** misturar F8/F5 unrelated |
| `app/package.json` *(opcional)* | Script `test:consulta-registados` se o padrão do repo o exigir |

### 2.3 Não alterar

REQ-086, ARQ-086, `trilhaAuditavel` (contrato), writers MO/Gate/AD, Porta EIC, MEP/C3, `recuperacaoJob.js`, servidor HTTP (sem rotas novas), Histórico Físico (inexistente).

---

## 3. Fluxo de leitura

```text
entrada.texto + coaConversacionalId
        │
        ▼
[precedências existentes: Gate / AD / …]  —— se consumirem a mensagem, IMP-086 não corre
        │
        ▼
D-PED(texto)
  ├─ não pedido ⇒ return null (fluxo normal: classificador / F5 / Job / EIC / …)
  └─ pedido
        │
        ▼
coaId = coaNomeado || coaActivo
  (sem coa ⇒ ausência explícita / desambiguação mínima; sem inventar)
        │
        ▼
C-ORQ(ramo, coaId, termo?)
  ├─ ramo inclui decisão  → F-MO.consultar({ coaId, termo? })
  ├─ ramo inclui discussão → F-TX.carregarBucket(coaId) [+ filtro termo leve opcional]
  └─ F-TR.opcional(refs de MO) → refs ou []
        │
        ▼
C-SEP → { decisoes[], discussoes[], refs[], ausencias[] }
        │
        ▼
resposta conversacional (prosa estruturada; lastro só das fontes)
        │
        ▼
FIM — sem writes
```

**Ausência explícita:** se F-MO vazio no ramo decisão ⇒ mensagem de ausência de decisões; idem transcript no ramo discussão; ambos vazios ⇒ ausência global sem preencher com workspace.

---

## 4. Pontos de integração existentes

| Ponto | Local | Uso IMP-086 |
|-------|-------|-------------|
| Boot MO | `executiveEngine` → `hidratarMemoriaConfiavel()` | Garantir ledger legível antes da consulta |
| Consulta MO | `memoriaConfiavel.consultarRegistosMo` / `listarRegistosMo` | F-MO — **já existe; deixar de ser órfã** (CA-086-4) |
| Transcript | `persistenciaChat.carregarBucketChat` | F-TX preferencial (bucket por chave COA) |
| Mensagens RAM | `modules/conversa/store.listarMensagens` | Só se alinhado ao mesmo COA; não misturar |
| Contexto COA | `store.obterContextoConversacional` / envelope sessão | `coaId` activo |
| Núcleo | `executiveEngine.executar` ~L425+ | Inserir ramo D-PED **depois** Gate/AD, **antes** classificador que desviaria o pedido |
| Trilha (opcional) | `trilhaAuditavel.listarPorJob` / eventos | Só se `refs.jobId` (ou equivalente) vier do registo MO |
| Não usar | `executiveMemory.lerMemoria` como Art. 8º; `recuperacaoJob`; Porta EIC; REQ-061 janela | Destinos / fontes proibidas |

---

## 5. Estratégia de testes

### 5.1 Unitários (domínio)

| Suite | Cobre |
|-------|--------|
| `pedidoExplicito.test.js` | Âncoras +/− REQ-086; flexões; casos negativos (continuar/despacha/KNW/estado); dúvida ⇒ não inventa (CA-086-8, CA-086-6) |
| `orquestrarConsulta.test.js` | MO hit/miss; transcript hit/miss; ambos; só um ramo; isolamento COA A≠B; read-only (spies: zero writes); workspace não aparece como Art. 8º (CA-086-9) |
| `montarResposta.test.js` | Separação secções; ausência explícita por ramo (CA-086-2, CA-086-7) |

### 5.2 Integração

| Suite | Cobre |
|-------|--------|
| `integracao.consulta.test.js` | Pedido no Núcleo (mock deps) ⇒ resposta consulta sem Job/Motor; pedido negativo ⇒ path inalterado; Gate pendente com léxico Gate **vence** (precedência preservada) |

### 5.3 Regressão obrigatória (na execução)

* `memoriaConfiavel` (f5c7 / ledger)  
* `f5c3-chat-persistencia` / isolamento conversa COA  
* continuidade Gate / AD (não regressar)  
* classificador (pedido negativo não vira consulta)  
* trilha (opt-in; falha soft)

### 5.4 Critério de fecho técnico da IMP

Todos CA-086-1…9 com teste pass/fail mapeado; I1 verificado por ausência de calls de escrita no caminho; sem rotas HTTP novas.

---

## 6. Riscos técnicos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Ordem no `executar` incorrecta | Pedido engolido por Classificador/F5/Job ou Gate | Ramo explícito + testes de precedência; não reordenar Gate/AD |
| Writers MO estreitos | “O que decidimos?” → ausência frequente | Comportamento **correcto** (REQ); não promover workspace |
| Transcript mutável / incompleto | Discussões “antigas” limitadas ao bucket actual | Limitação declarada; Histórico Físico fora V1 |
| Colisão semântica “recuperação” | Roteamento errado | D-PED negativo + CA-086-6; nome módulo `consultaRegistados` |
| Acoplar Trilha como obrigatória | Fragilidade / I/O | F-TR try/soft-fail; testes sem store audit |
| Quarta memória acidental | Violação I10 | Code review: zero `localStorage` novo; zero JSONL novo |
| Diff grande em `index.js` | Mistura frentes F5/F8/C3 | Delta mínimo comentado IMP-086; não tocar hooks alheios |
| “Sinónimos óbvios” | Falsos positivos/negativos | Bateria fixa de casos no teste; evoluir lista só com evidência |

---

## 7. Etapas de execução (futuras — não iniciar neste acto)

| Etapa | Conteúdo | Gate |
|-------|----------|------|
| **E1** | Domínio D-PED + testes âncoras | Homologar E1 |
| **E2** | C-ORQ + portas F-MO/F-TX + C-SEP + testes isolamento/ausência | Homologar E2 |
| **E3** | Hook Núcleo + integração + F-TR opcional | Homologar E3 |
| **E4** | Regressões + evidência CA-086 + fecho IMP | Homologar E4 / VAL se exigido |

**Gate do plano:** fechado. **E1–E4:** executadas. **Entrega:** **HOMOLOGADA** (09/09/2026) — ver [`evidencias/IMP-086-homologacao.md`](evidencias/IMP-086-homologacao.md).

---

## 8. Fora do escopo da IMP V1

* Histórico Físico; API HTTP dedicada; UI além da conversa.  
* Redesign MO/Trilha/transcript; writers; backfill.  
* Correlação obrigatória mensagem↔MO↔Trilha.  
* Emenda REQ-086 / ARQ-086.  
* Implementação de código neste acto de abertura do plano.

---

## 9. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | REQ-086 v1.0 Homologado (CA-086-1…9) — inalterado |
| ARQ | ARQ-086 v1.0 Homologada (I1–I10; D-PED/C-ORQ/C-SEP/F-*) — inalterada |
| Capacidade | CAP-05 |
| Imp. | **IMPLEMENTADA · HOMOLOGADA** v1.0 — [`evidencias/IMP-086-homologacao.md`](evidencias/IMP-086-homologacao.md) |
| Testes | `npm run test:consulta-registados` — **17/17 PASS** |
| Build | `npm run build` (app/) — **OK** |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 09/09/2026 | Engenheiro (Cursor) | Plano IMP V1 (estrutura, ficheiros, fluxo, integração, testes, riscos) | Despacho criar somente IMP-086; sem código | Em análise |
| 1.0 | 09/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação formal do plano: status Homologado; versão final 1.0; conteúdo = v0.1 APTO; sem execução de código | Despacho «Registrar a homologação do IMP-086 v0.1» | Plano **Homologado** |
| 1.0 (entrega) | 09/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação da implementação V1; evidência 17/17 + build OK; REQ/ARQ intactos | Despacho «Homologar a implementação do IMP-086»; validação técnica APTO | **IMPLEMENTADA · HOMOLOGADA** |
