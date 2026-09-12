# ARQ-088 — Trilha Auditável V1

> **Status: Homologada — v1.0 (11/09/2026).** Trilha V1 IMPLEMENTADA · VALIDADA · HOMOLOGADA (IMP-088 / VAL-088).  
> **Versão:** 1.0 — 11/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-088.  
> **Capacidade:** CAP-09 — Observabilidade.  
> Norma superior: CON-001 Art. 8º §3º e Art. 9º princípios 2 e 8; ADR-006; ADR-010; ADR-015; CAP-001 (CAP-09); **REQ-088 v1.0 Homologado**; REQ-086 (**não** emendar); REQ-087 / HFC v1.0 (**fronteira**; **não** reabrir).  
> Base: REQ-088; diagnóstico técnico da Trilha; implementação existente fatias 1–2 (`app/src/trilhaAuditavel/`).  
> **Finalidade:** arquitectura V1 **congelada** — três tipos, store JSONL, writers, append-only, idempotência, fail-soft — **sem** novos eventos nem correcções de fiabilidade nesta homologação.  
> **Gate ARQ:** **fechado** (homologada). **Entrega:** IMP-088 / VAL-088.  
> **Limitações V1 (vigentes):** Railway sem espelho; Gate/AD fire-and-forget; F-TR não ligado; sem `prevHash`; somente 3 tipos.  
> **Próxima evolução da Trilha:** frente própria — **não** iniciada neste documento.  
> **Preservado:** HFC v1.0, F5–F8, CAP-13/C3, REQ-086/087, JOB-000118.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do registo verificável append-only de **eventos de execução** (Job / Gate terminal / fecho AD), isolado de conversa, decisão Art. 8º e MEP. |
| **Por que existe?** | REQ-088 congela V1 já operacional; falta artefacto ARQ oficial (ADR-006) sem expandir o sistema. |
| **Para quem existe?** | Engenheiro (IMP/VAL); CTO (homologação); patrocinador (rastreio de execução). |
| **Como medir sucesso?** | CA-088-1…11 do REQ-088; invariantes I1–I12 abaixo; suíte `f8-fatia1`/`f8-fatia2` como lastro factual; zero alteração de código neste acto. |

---

## 1. Princípios e invariantes (V1)

| ID | Invariante |
|----|------------|
| **I1** | **Trilha ≠ Memória Confiável** — sede Art. 8º permanece no ledger MO; Trilha é espelho de execução com `refs` (ex. `moRegistroId`). |
| **I2** | **Trilha ≠ HFC** — store/módulo/API distintos; sem `msgId` / prosa conversacional. |
| **I3** | **Trilha ≠ MEP/CAP-13/C3** — payload MEP/KNW proibido; stores distintos. |
| **I4** | **Trilha ≠ F5-C3** — transcript UI isolado; chaves de transcript proibidas. |
| **I5** | **Conjunto fechado de tipos** — só `job.transicao`, `gate.decisao_terminal`, `ad.fecho_sob_delegacao`. |
| **I6** | **Append-only** — só append de linha JSONL; apagar/compactar → `historico_append_only`. |
| **I7** | **Idempotência** — `duplicado_id` e `duplicado_hash` (+ chave de correlação de `refs`) impedem segunda linha. |
| **I8** | **Fail-soft** — falha Trilha não reverte Job nem append MO. |
| **I9** | **MO antes de Gate/AD** — espelho Trilha só após `appendRegistroMo` bem-sucedido (caminhos V1). |
| **I10** | **Payload limpo** — `CHAVES_PAYLOAD_PROIBIDAS` (scan profundo). |
| **I11** | **Limitações declaradas ≠ defeito V1** — Railway, fire-and-forget, F-TR, ausência de `prevHash`, cobertura limitada. |
| **I12** | **Preservação** — HFC v1.0, F5–F8, CAP-13/C3, REQ-086, REQ-087 cycle, JOB-000118 inalterados. |

---

## 2. Componentes actuais

| ID | Componente | Local | Responsabilidade V1 |
|----|------------|-------|---------------------|
| **D-TA** | Domínio | `app/src/trilhaAuditavel/dominio.js` | Tipos, hash, IDs, construção de eventos, validação de payload |
| **S-TA** | Persistência | `persistencia.js` | JSONL append; recusas apagar/compactar |
| **A-TA** | API | `index.js` | `appendEvento`, `appendJobTransicao`, `appendGate*`, `appendAd*`, `espelharNovasEntradasHistorico`, listagens |
| **E-TA** | Emissor | `emissor.js` | Browser → `POST /api/ceo/trilha/eventos` (fire-and-forget); adaptador FS em testes |
| **P-TA** | Ponte HTTP | `app/server/trilhaAuditavelPlugin.js` | Middleware Vite: POST eventos; GET eventos / por job |
| **W-JOB** | Writer Job | `app/server/executionQueue.js` | Após `writeFileSync` do Job → `espelharNovasEntradasHistorico` |
| **W-GATE** | Writer Gate | `continuidadeGate/integracaoConversa.js` | Após MO em decisão terminal → `espelharGateDecisaoTerminalNaTrilha` |
| **W-AD** | Writer AD | `autoridadeDelegada/autoridadeDelegada.js` | Após MO em `fecho_sob_delegacao` → `espelharAdFechoNaTrilha` |
| **T-TA** | Testes | `f8-fatia1-trilha.test.js`, `f8-fatia2-trilha.test.js` | Lastro factual das fatias 1–2 |

**Não é componente V1 de escrita:** `server/src/services/executionQueue.js` (Railway) — **sem** espelho Trilha (limitação).

---

## 3. Store canónico

| Item | Valor |
|------|--------|
| Directório | `executive/audit/` |
| Ficheiro | `eventos.jsonl` |
| Path | `executive/audit/eventos.jsonl` |
| Modelo | Uma linha = um objecto JSON = um evento |
| Escrita | `fs.appendFileSync` (ou equivalente) |
| Git | Conteúdo tipicamente ignorado (`.gitignore`); durabilidade = FS runtime |

**Distinto de:** `executive/historico-conversas/mensagens.jsonl` (HFC); store MEP; Jobs em `executive/queue/`.

---

## 4. Envelope comum

Campos observáveis de cada evento V1:

`id` · `schemaVersao` · `quando` · `actor` · `tipo` · `coaId` · `refs` · `detalhe` · `resultado` · `conteudoHash`

* `schemaVersao`: `1`  
* `resultado`: domínio admite `ok` \| `falha` \| `info`; constructors V1 vigentes usam tipicamente `"ok"`  
* `conteudoHash`: FNV-1a 32-bit + comprimento sobre campos canónicos do tipo (integridade de conteúdo, **não** cadeia `prevHash`)

---

## 5. Tipos V1 (conjunto fechado)

| Tipo | Fatia | Semântica |
|------|-------|-----------|
| `job.transicao` | 1 | Transição de estado do Job espelhada de uma entrada nova de `historicoCiclo` |
| `gate.decisao_terminal` | 2 | Gate **aprovado** ou **rejeitado** após MO |
| `ad.fecho_sob_delegacao` | 2 | Fecho sob AD após MO |

Nenhum outro `tipo` na V1.

---

## 6. Identificadores e `refs`

| Tipo | Padrão de `id` | `refs` | `coaId` |
|------|----------------|--------|---------|
| `job.transicao` | `ta-{jobId}-{indice}-{hash12}` | `{ jobId }` | opcional (do Job) |
| `gate.decisao_terminal` | `ta-gate-{gateId}-{parecerId}-{decisao}-{hash12}` | `gateId`, `parecerId`, `moRegistroId`, `jobId?` | opcional |
| `ad.fecho_sob_delegacao` | `ta-ad-{coaId}-{hash12}` | `moRegistroId`, `adActoId?` | **obrigatório** |

Hash de Job inclui: tipo, jobId, quando, de, para, motivo, actor, indice.  
Gate/AD: mapas de campos específicos em `dominio.js` (incl. `moRegistroId`, decisão/tipoFecho, etc.).

---

## 7. Writers e pontos de emissão

### 7.1 Job (`job.transicao`)

```text
escreverJob (app/server/executionQueue)
  → writeFileSync(JOB-*.json)     // já commitido
  → espelharNovasEntradasHistorico(jobAnterior, jobNovo)  // fail-soft
       → diff historicoCiclo
       → appendJobTransicao por cada entrada nova
```

### 7.2 Gate (`gate.decisao_terminal`)

```text
decisão terminal aprovado|rejeitado
  → appendRegistroMo (...)        // sede Art. 8º
  → espelharGateDecisaoTerminalNaTrilha ({ moRegistroId, gateId, parecerId, ... })
       → emitirEventoTrilha → POST HTTP (browser) ou adaptador teste
```

Gate **adiado**: **não** emite evento V1.

### 7.3 AD (`ad.fecho_sob_delegacao`)

```text
tipoEvento === fecho_sob_delegacao
  → appendRegistroMo (origem: ad)
  → espelharAdFechoNaTrilha ({ moRegistroId, coaId, adActoId, ... })
       → emitirEventoTrilha (idem)
```

Actos AD que **não** são fecho: **não** emitem evento V1.

---

## 8. Append-only

* Única mutação do ficheiro: append de linha.  
* `apagarEventoFisico` / `compactarStoreFisico` → `{ ok: false, codigo: "historico_append_only" }`.  
* Sem API de update in-place.

---

## 9. Idempotência

Em `appendEvento` (A-TA):

1. Rejeitar se já existe evento com o mesmo `id` → `duplicado_id`.  
2. Rejeitar se mesmo `tipo` + `conteudoHash` + chave de correlação de `refs` → `duplicado_hash`.  
3. No espelho Job: duplicados contados como `ignorados` (Job já persistido).  
4. No emissor HTTP: cliente não confirma 409; fire-and-forget (limitação).

---

## 10. Fail-soft

| Caminho | Se Trilha falha |
|---------|-----------------|
| Job | Job permanece no disco |
| Gate pós-MO | Ledger MO permanece |
| AD fecho pós-MO | Ledger MO e fecho AD permanecem |

Hooks envolvidos: `try/catch` em W-JOB / W-GATE / W-AD; emissor devolve erro sem lançar para o ledger.

---

## 11. Payloads proibidos

Lista vigente (`CHAVES_PAYLOAD_PROIBIDAS`), scan profundo:

`mensagens`, `mensagem`, `transcript`, `transcriptCliente`, `conversasCliente`, `itemKnw`, `itemKnwConteudo`, `knw`, `eventosMep`, `mepCeo`

Violação → `payload_proibido`.

---

## 12. Isolamento entre stores

```text
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ F5-C3       │  │ HFC v1.0    │  │ MO (F8)     │  │ Trilha V1   │
│ transcript  │  │ historico-  │  │ localStorage│  │ audit/      │
│ LS mutável  │  │ conversas/  │  │ decisões    │  │ eventos.jsonl│
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
                                            ▲              │
                                            │  refs        │ espelho
                                            └──────────────┘  (Gate/AD)

┌─────────────┐
│ MEP CAP-13  │  isolado; chaves proibidas na Trilha
└─────────────┘
```

* Módulo Trilha **não** importa HFC nem MEP.  
* Não escreve no ledger MO (só lê IDs após append alheio).  
* REQ-086 F-TR: correlação **opcional**; na V1 de produção o wiring completo **não** é requisito desta ARQ (limitação).

---

## 13. Limitações conhecidas (aceites na V1)

| Limitação | Implicação arquitectural V1 |
|-----------|----------------------------|
| Railway / `server/src` **sem** espelho Job | Path de produção cloud pode não gerar `job.transicao` |
| Gate/AD **fire-and-forget** (`void fetch`) | Entrega não confirmada; possível perda silenciosa pós-MO |
| F-TR **não** ligado em produção | Consulta REQ-086 não depende da Trilha |
| Sem `prevHash` / cadeia criptográfica | Integridade = append-only + hash de campos |
| Cobertura limitada | Só os 3 tipos e writers §7; sem Gate adiado, AD não-fecho, MO puro |

Estas limitações **não** são objecto de remediação nesta ARQ.

---

## 14. Critérios arquitecturais V1 (rastreio REQ-088)

| CA | Realização ARQ |
|----|----------------|
| CA-088-1 | §5 conjunto fechado |
| CA-088-2 | §3 store canónico |
| CA-088-3 | §8 append-only |
| CA-088-4 | §9 idempotência |
| CA-088-5 | §4 envelope + hash |
| CA-088-6 | §6 ids/refs |
| CA-088-7 | §11 payloads |
| CA-088-8 | §10 fail-soft |
| CA-088-9 | §12 isolamento |
| CA-088-10 | §13 limitações declaradas |
| CA-088-11 | T-TA lastro; IMP/VAL sem exigir refactor |

---

## 15. Fora do escopo da V1

* Novos tipos de evento; novas rotas além das já existentes no plugin Vite.  
* Correcções: espelho Railway; confirmação síncrona Gate/AD; autenticação reforçada do POST.  
* UI; consulta rica; backfill; `prevHash`/Merkle.  
* Fusão com HFC ou Memória Confiável; tornar F-TR obrigatório.  
* Alterar HFC v1.0, F5–F8, CAP-13/C3, REQ-086, ciclo REQ/ARQ/IMP/VAL-087, JOB-000118.  
* Refactor da implementação existente como obrigação desta ARQ.

---

## 16. Relação com artefactos vizinhos

| Artefacto | Relação |
|-----------|---------|
| **REQ-088** | Norma; esta ARQ realiza o congelamento V1 |
| **REQ-086 / ARQ-086** | F-TR opcional; **não** emendados |
| **REQ-087 / HFC** | Fronteira negativa; homologados; intocados |
| **Memória Confiável** | Upstream de Gate/AD; inalterada |
| **Jobs / CAP-11 fila** | Fonte de `job.transicao` no path `app` |
| **CAP-09** | Capacidade de rastreabilidade/observabilidade |

---

## 17. Evolução futura (fora desta V1)

A IMP-088 **registou** o código vigente como entrega V1 (sem alteração funcional).  
Qualquer fix de fiabilidade, novo tipo de evento, espelho Railway, confirmação Gate/AD, F-TR ligado ou `prevHash` = **frente própria** — **não** faz parte desta homologação e **não** é aberta por este documento.

---

## 18. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | ARQ de congelamento da Trilha V1 existente | REQ-088 + diagnóstico + código fatias 1–2 | Em análise |
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | Homologação pós-VAL-088 / encerramento V1 | Gate ARQ fechado; limitações preservadas | **Homologada** |
