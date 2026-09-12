# IMP-087 — Histórico Físico das Conversas (1ª fatia)

> **Status: IMPLEMENTADA · VALIDADA · HOMOLOGADA — v1.0 (11/09/2026).**  
> **Versão:** 1.0 — 11/09/2026  
> Norma: **REQ-087 v1.0 Homologado**; **ARQ-087 v1.0 Homologada**; **VAL-087 APROVADO**.  
> Capacidade: **CAP-03** — Gestão de Projetos (arquivo físico da conversa por COA).  
> **Natureza:** 1ª fatia encerrada — gravação append-only de mensagens novas elegíveis; **sem** leitor de produto.  
> **Preservado (inalterados):** F5–F8, Trilha Auditável, CAP-13/C3, MEP, REQ-086, contrato `persistenciaChat.js`, JOB-000118.  
> **Gate da entrega:** fechado (homologada). **Próxima capacidade:** não iniciada neste acto.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Entrega homologada da 1ª fatia HFC: JSONL append-only + módulo + ponte HTTP + hook fail-soft no store conversacional. |
| **Por que existe?** | REQ/ARQ-087; transcript F5-C3 não é arquivo físico. |
| **Para quem existe?** | Patrocinador (rastro físico de mensagens novas); Engenheiro; CTO. |
| **Como medir sucesso?** | VAL-087 APROVADO (54/54; critérios 1–12 PASS); CA-087-1…8. |

---

## 1. Estado final da 1ª fatia

| Estado | Registo |
|--------|---------|
| **IMPLEMENTADA** | IMP-087 v1.0 — módulo, store, plugin, hook |
| **VALIDADA** | VAL-087 APROVADO — 54/54 · 0 FAIL · 0 regressões |
| **HOMOLOGADA** | Encerramento formal da 1ª fatia (11/09/2026) |

### Vigência operacional

A partir da implementação homologada, o **HFC físico existe** para **mensagens novas elegíveis** (`pronta` \| `erro`) emitidas pelo store conversacional. Mensagens apenas no transcript F5-C3 anteriores à activação **não** foram objecto de backfill.

### Limites actuais (explícitos — fora da 1ª fatia)

* **Sem leitor** de produto  
* **Sem busca**  
* **Sem recuperação** / consulta conversacional sobre o HFC  
* **Sem backfill** do passado F5-C3  
* **Sem correlação** automática MO / Trilha  
* **Sem eventos de correcção** de texto  

REQ-086 permanece a V1 de consulta sobre transcript F5-C3 + Memória Confiável; **não** emendado.

---

## 2. Entrega técnica

| Peça ARQ | Implementação |
|----------|----------------|
| **S-HFC** | `executive/historico-conversas/mensagens.jsonl` via `persistencia.js` |
| **D-HFC** | `app/src/historicoFisicoConversas/dominio.js` |
| **E-HFC** | `emissor.js` (adaptador FS / `POST` fail-soft) |
| **P-HFC** | `app/server/historicoFisicoConversasPlugin.js` → `POST /api/ceo/historico-conversas/mensagens` |
| **C-STORE hook** | `store.js` → `espelharHfcSeDuravel` após `persistirBucketActivo` |
| **T-HFC** | `hfc-fatia1.test.js` |

### Regras de gravação

* `pronta` / `erro` → registar; `pendente` → não; `msgId` já físico → idempotente (sem 2ª linha).  
* `ordem` monotónica no S-HFC; update/delete/compact → `historico_append_only`.  
* Fail-soft: excepção/falha HFC não reverte F5-C3.

---

## 3. Arquivos da implementação

### Criados

* `docs/implementation/IMP-087-historico-fisico-das-conversas.md`
* `app/src/historicoFisicoConversas/{dominio,persistencia,emissor,index,hfc-fatia1.test}.js`
* `app/server/historicoFisicoConversasPlugin.js`

### Alterados (mínimo, na IMP)

* `app/src/modules/conversa/store.js` — hook HFC fail-soft  
* `app/vite.config.js` — registo do plugin  

### Não tocados

`persistenciaChat.js`, `memoriaConfiavel/*`, `trilhaAuditavel/*`, `mepCeo/*`, `consultaRegistados/*`, `enviarAoNucleo.js`, JOB-000118.

---

## 4. Validação e homologação

| Artefacto | Resultado |
|-----------|-----------|
| **VAL-087** | **APROVADO** (11/09/2026) |
| Suíte VAL | **54/54 pass** · 0 fail · 0 regressões |
| Critérios despacho 1–12 | Todos **PASS** |
| Evidência física | `executive/historico-conversas/mensagens.jsonl` |

Documento: [`docs/validation/VAL-087-historico-fisico-das-conversas.md`](../validation/VAL-087-historico-fisico-das-conversas.md).

---

## 5. Rastreio CA

| CA | Cobertura |
|----|-----------|
| CA-087-1 | domínio + hook (pendente vs durável) |
| CA-087-2 | APIs append-only |
| CA-087-3 | idempotência `msgId` |
| CA-087-4 | isolamento COA |
| CA-087-5 | limpar UI ≠ apagar HFC |
| CA-087-6 | fail-soft |
| CA-087-7 | módulo sem imports MO/Trilha/MEP |
| CA-087-8 | `persistenciaChat` intacto; F5-C3 regressão |

---

## 6. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | 1ª fatia HFC | Implementada |
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | Encerramento pós-VAL-087 | **IMPLEMENTADA · VALIDADA · HOMOLOGADA** |
