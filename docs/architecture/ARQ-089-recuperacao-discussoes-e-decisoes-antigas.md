# ARQ-089 — Recuperação de discussões e decisões antigas

> **Status: Homologada — v1.0 (11/09/2026).** Fatia 1 IMPLEMENTADA · VALIDADA · HOMOLOGADA (IMP-089 / VAL-089).  
> **Versão:** 1.0 — 11/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-089.  
> **Capacidade:** CAP-05 — Memória Organizacional (consulta; discussões = consumo read-only de HFC e, quando aplicável, vista F5-C3).  
> Norma superior: CON-001 Art. 8º e Art. 9º princípios 1, 2 e 8; ADR-006; ADR-010; ADR-015; CAP-001 (CAP-05); **REQ-089 v1.0 Homologado**; **REQ-086 v1.0 Homologado** (não emendar); **REQ-087 / ARQ-087** (HFC — consumo); **REQ-088 / ARQ-088** (Trilha — refs).  
> Base: deliberação técnica aprovada; diagnóstico IMP-086; proposta Fatia 1.  
> **Finalidade:** arquitectura **mínima** da evolução da **camada de consulta** IMP-086: F-TX lê HFC; F-TR injectável soft-fail; F-MO intacto; sem stores novos; sem nova memória.  
> **Gate ARQ:** fechado (homologada). **Entrega:** IMP-089 / VAL-089 — 92/92 PASS; build OK; 0 regressões.  
> **Preservado:** HFC-087 **não** reaberto/alterado; Trilha-088 **não** reaberta/alterada; F8/MO **não** alterada; F5-C3 preservado; CAP-13/C3 fora; JOB-000118 intocado.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura da Fatia 1 que evolui o acto de consulta já desenhado em ARQ-086: acrescenta consumo read-only do HFC no ramo discussão e activação soft-fail da Trilha como referências a partir de MO IDs. |
| **Por que existe?** | REQ-089 exige sobrevivência de discussões pós-limpeza do F5-C3 e lastro de execução sem fundir stores; HFC e Trilha já homologados como fontes distintas. |
| **Para quem existe?** | Patrocinador (reencontrar discussões/decisões antigas); Engenheiro (IMP-089); CTO (homologação). |
| **Como medir sucesso?** | CA-089-1…9 + preservação CA-086-1…9; invariantes abaixo; zero write nos stores no caminho de consulta. |

---

## 1. Baseline preservado (ARQ-086 / IMP-086)

Esta ARQ **não substitui** ARQ-086. Preserva e reutiliza:

| Peça | Estado |
|------|--------|
| **D-PED** | Intacta (âncoras +/− REQ-086) |
| **C-ORQ** | Intacta na orquestração de ramos; passa a receber deps de leitura HFC/Trilha |
| **C-SEP** | Intacta (Decisões / Discussões / Referências; ausência explícita) |
| **F-MO** | **Intacto** — única sede Art. 8º |
| **F-TX** | **Evoluído** — passa a poder ler HFC (ver §3) |
| **F-TR** | **Activável** — já desenhado; injectar leitura Trilha V1 em produção (soft-fail) |
| Hook Núcleo | **Mesmo ponto** — após Gate/AD, antes do classificador |
| I1–I8, I10 de ARQ-086 | Preservados; **I9 de ARQ-086** (“Histórico Físico fora da V1”) é **superseded apenas para o acto de consulta** desta evolução: HFC entra como **fonte lida**, sem invalidar a homologação histórica da V1 IMP-086 |

### O que já existia

* Consulta conversacional read-only sob pedido explícito.  
* Decisões só do MO; discussões só do transcript F5-C3 na V1.  
* Trilha opcional por design, tipicamente sem deps em produção.  
* Sem quarta memória; sem API HTTP.

### O que esta evolução acrescenta

* Porta/contrato de leitura HFC no F-TX (filtrado por COA).  
* Injecção de `listarPorMo` (ou equivalente estável da Trilha V1) no caminho de refs.  
* Política Fatia 1: HFC como fonte primária de discussão “antiga”; F5-C3 preservado como UI.

### O que permanece inalterado

* Writers e stores de MO, HFC, Trilha, F5-C3.  
* Contratos REQ/ARQ/IMP/VAL-087 e -088.  
* Semântica Art. 8º = só MO.

---

## 2. Princípios e invariantes (Fatia 1)

| ID | Invariante |
|----|------------|
| **I1** | **Somente leitura** no fluxo de consulta — zero append em MO, HFC, Trilha, F5-C3, MEP, workspace. |
| **I2** | **Isolamento por COA** — F-MO e leitura HFC filtrados pelo `coaId` efectivo. |
| **I3** | **Sede Art. 8º** — somente Memória Confiável V1 (F-MO intacto). |
| **I4** | **Discussão Fatia 1** — prosa recuperável primária = **HFC read-only** por COA; F5-C3 não é redesenhado nem usado como writer neste fluxo. |
| **I5** | **Separação** — Decisões ≠ Discussões ≠ Referências de execução. |
| **I6** | **Ausência explícita** — sem lastro no ramo ⇒ declaração; sem invenção. |
| **I7** | **Pedido explícito** — D-PED inalterado. |
| **I8** | **Trilha = refs** — nunca corpo de decisão nem arquivo de conversa; soft-fail obrigatório. |
| **I9** | **HFC = consumidor, não writer** — esta ARQ não altera schema/hook/store HFC. |
| **I10** | **Sem quarta memória / sem store novo / sem API HTTP** nesta Fatia 1. |
| **I11** | **Anti-duplicação** — não copiar dados entre MO ↔ HFC ↔ Trilha ↔ F5-C3. |
| **I12** | **Preservação de frentes** — F5-C3, F8/MO, HFC-087, Trilha-088, CAP-13/C3 inalterados nos seus contratos de escrita. |

---

## 3. Visão arquitectural

### 3.1 Fluxo proposto da consulta (Fatia 1)

```text
Mensagem (COA activo ou nomeado)
        │
        ▼
[precedências Gate / AD / …]     —— inalteradas
        │
        ▼
D-PED (REQ-086)                  —— inalterado
  ├─ não ⇒ outros destinos
  └─ sim
        │
        ▼
C-ORQ (coaId, ramo, termo?)
  ├─ decisão  → F-MO (consultarRegistosMo)     [INALTERado]
  ├─ discussão → F-TX*
  │                 └─ ler HFC por coaId (read-only)   [NOVO consumo]
  │                 └─ (± dedupe msgId face a F5-C3 se ainda presente; opcional IMP)
  └─ refs     → F-TR listarPorMo(moIds) | [] soft-fail [ACTIVAR deps]
        │
        ▼
C-SEP → Decisões | Discussões | Referências | ausências
        │
        ▼
Prosa conversacional — SEM writes
```

### 3.2 Como HFC entra

* **Consumo** do store homologado `executive/historico-conversas/mensagens.jsonl` via porta de leitura (módulo HFC existente ou adapter em `consultaRegistados`), **filtrado por `coaId`**.  
* Serve discussões que sobreviveram a `limparHistorico` / limpeza do bucket F5-C3.  
* **Não** altera writers HFC, schema, idempotência, fail-soft de gravação.  
* Limite de volume na prosa: responsabilidade da IMP (análogo a “últimas N”).

### 3.3 Como Trilha entra (somente referência)

* Activar o caminho já desenhado (`lerRefsTrilhaOpcional` / F-TR) injectando `deps.listarPorMo` (ou equivalente estável da Trilha V1).  
* Entrada: `moIds` das decisões F-MO.  
* Saída: apenas secção **Referências de execução**.  
* Soft-fail: Trilha indisponível ou vazia ⇒ consulta MO/HFC segue.

---

## 4. Componentes (delta)

| ID | Componente | Delta Fatia 1 | Escreve? |
|----|------------|---------------|----------|
| **D-PED** | Detector pedido explícito | Nenhum | Não |
| **C-ORQ** | Orquestrador | Aceitar deps HFC + Trilha | Não |
| **F-MO** | Porta MO | **Nenhum** | Não |
| **F-TX** | Porta discussão | Acrescentar leitura HFC por COA; política Fatia 1 (§1) | Não |
| **F-TR** | Porta Trilha | Ligar deps de produção; soft-fail | Não |
| **C-SEP** | Montagem | Ajustes mínimos de rótulo/limite se necessário | Não |
| **Hook** | `executiveEngine.executar` | Injectar deps; **mesmo ponto** no fluxo | Não |

**Proibido criar:** store `consulta.*`, endpoint HTTP novo, writers em HFC/Trilha/MO/F5-C3.

---

## 5. Contratos de leitura

### 5.1 Decisão (inalterado)

| Campo | Norma |
|-------|--------|
| Store | Memória Confiável V1 |
| Porta | `consultarRegistosMo` / equivalente |
| Não-fonte | HFC, Trilha, F5-C3, workspace, MEP |

### 5.2 Discussão (evoluído)

| Campo | Norma |
|-------|--------|
| Store primário Fatia 1 | HFC-087 (read-only) |
| Filtro | `coaId` |
| F5-C3 | Preservado; não alterado; dedupe por `msgId` admitido na apresentação |
| Posse do arquivo HFC | CAP-03 / REQ-087 — esta ARQ **só consome** |
| Papel CAP-05 | Consumo na consulta; sem posse do store |

### 5.3 Trilha (refs)

| Campo | Norma |
|-------|--------|
| Store | `executive/audit/eventos.jsonl` (Trilha V1) — **não alterar** |
| Entrada | `moIds` das decisões |
| Saída | apontadores / identificadores de eventos de execução |
| Proibido | prosa de chat; corpo Art. 8º; falha dura da consulta |

---

## 6. Relação com frentes vizinhas

| Artefacto | Relação |
|-----------|---------|
| **REQ-089** | Norma desta evolução |
| **REQ/ARQ/IMP-086** | Baseline; não emendados; preservados |
| **REQ/ARQ/IMP/VAL-087** | Fonte HFC; **consumo only** |
| **REQ/ARQ/IMP/VAL-088** | Fonte Trilha; **refs only** |
| **F5-C3** | UI/transcript mutável; preservado |
| **MEP / CAP-13** | Isolado; não lido neste fluxo |
| **ARQ-009 H** | Fora; não reabrir |

---

## 7. Fora do escopo (arquitectura Fatia 1)

* Alterar HFC-087, Trilha-088, F8/MO, F5-C3, CAP-13/C3.  
* Novo armazenamento / nova memória / API HTTP.  
* Duplicação de dados entre stores.  
* Busca semântica; UI dedicada; backfill; correlação obrigatória mensagem↔MO↔Trilha.  
* Novos tipos de evento Trilha; eventos de correcção HFC.  
* Emenda aos textos homologados 086/087/088.  
* Código neste acto documental.

---

## 8. Rastreio aos critérios REQ-089

| CA | Realização arquitectural |
|----|---------------------------|
| CA-089-1 | F-TX ← HFC + I4 + I6 |
| CA-089-2 | F-MO + I3 |
| CA-089-3 | I2 |
| CA-089-4 | F-TR + I8 |
| CA-089-5 | I1 / I10 |
| CA-089-6 | D-PED + hook §4 |
| CA-089-7 | I9 / I12 |
| CA-089-8 | I10 / I11 |
| CA-089-9 | Preservação ARQ-086 + regressão |

---

## 9. Critérios de homologação desta ARQ

1. Preserva I1–I12.  
2. Não contradiz REQ-089 v1.0 nem REQ-086 v1.0.  
3. Não altera contratos de escrita HFC/Trilha/MO/F5-C3.  
4. Evolução ocorre **somente** sobre a camada de consulta IMP-086 (`consultaRegistados`).  
5. Sem novo store / sem nova memória.

**Gate:** fechado com VAL-089 (92/92; build OK; 0 regressões).

## 10. Limites conhecidos da Fatia 1 (homologados)

* Sem busca semântica, UI dedicada, backfill, correlação obrigatória mensagem↔MO↔Trilha.  
* HFC/Trilha = **consumidores read-only** na consulta; writers/schema/stores homologados **inalterados**.  
* F-TR soft-fail; refs vazias ≠ falha.  
* Limite N na C-SEP para volume de discussões.

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Arquitectura Fatia 1 (HFC read + Trilha refs; F-MO intacto) | Autorização ABRIR REQ/ARQ/IMP; deliberação aprovada | Em análise |
| 1.0 | 11/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação Fatia 1; Gate ARQ fechado; VAL-089 | Despacho FECHAMENTO E HOMOLOGAÇÃO IMP-089 Fatia 1 | **Homologada** |
