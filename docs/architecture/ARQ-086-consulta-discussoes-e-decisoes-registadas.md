# ARQ-086 — Consulta de discussões e decisões registadas

> **Status: Homologada — v1.0 (09/09/2026).** Auditoria APTO contra REQ-086 v1.0 e definição V1; despacho de homologação registado.  
> **Versão:** 1.0 — 09/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-086.  
> **Capacidade:** CAP-05 — Memória Organizacional (consulta; discussões = consumo da interface conversacional).  
> Norma superior: CON-001 Art. 8º e Art. 9º princípios 1 e 8; ADR-006; ADR-010; ADR-015; CAP-001 (CAP-05); **REQ-086 v1.0 Homologado**; REQ-033 (não reabrir); REQ-037/038/039 (isolamento COA).  
> Base: definição V1 consolidada; D1–D9; quatro resoluções de homologação do REQ-086.  
> **Finalidade:** arquitectura **mínima V1** do acto de consulta conversacional de decisões (Art. 8º) e discussões (transcript), em **somente leitura**.  
> **Gate ARQ:** fechado (homologada). **Próximo artefacto:** IMP — somente após autorização ADR-006 / despacho explícito.  
> **Proibições deste documento:** implementação de código; alteração de REQ-086; criação de IMP neste acto; API HTTP dedicada; Histórico Físico; quarta memória; posse CAP-05 sobre o transcript.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do **acto de consulta** sob pedido explícito: ler Memória Confiável V1 e/ou transcript do COA, separar decisão de discussão, declarar ausência, sem escrever stores. |
| **Por que existe?** | REQ-086 homologado exige caminho conversacional testável; as fontes já existem; falta o desenho de integração sem fundir CAP-05 com arquivo conversacional nem com Trilha/MEP/KNW. |
| **Para quem existe?** | Patrocinador (reencontrar o registado); Engenheiro (IMP futura); CTO (homologação desta ARQ). |
| **Como medir sucesso?** | CA-086-1…9 verificáveis; invariantes I1–I10 abaixo; zero store novo; zero API HTTP V1. |

---

## 1. Princípios e invariantes V1

| ID | Invariante |
|----|------------|
| **I1** | **Somente leitura** — o fluxo desta ARQ não faz append/gravação em MO, transcript, Trilha, MEP, workspace nem índice paralelo. |
| **I2** | **Isolamento por COA** — consulta limitada ao COA activo ou ao COA explicitamente nomeado; sem fuga entre buckets/registos. |
| **I3** | **Sede Art. 8º** — decisão recuperável = **somente** Memória Confiável V1 (ledger MO). |
| **I4** | **Discussão** — prosa recuperável = **somente** transcript por COA (consumo); CAP-05 **não** é dona do arquivo. |
| **I5** | **Separação** — resposta distingue bloco **decisão** e bloco **discussão**; não funde conceitos. |
| **I6** | **Ausência explícita** — sem lastro aplicável ⇒ declaração explícita; nunca silêncio ambíguo nem invenção. |
| **I7** | **Pedido explícito** — só entra neste fluxo com âncoras REQ-086; casos negativos seguem outros destinos. |
| **I8** | **Trilha** — correlação **opcional** por `refs` existentes; nunca corpo de discussão/decisão. |
| **I9** | **Histórico Físico** — **fora da V1**; não é pré-requisito nem componente. |
| **I10** | **Sem quarta memória** — proibido cache/store dedicado “de recuperação”; sem API HTTP dedicada na V1. |

---

## 2. Visão arquitectural

### 2.1 O que esta ARQ não é

* Não redesenha Memória Confiável, transcript F5-C3, Trilha, ARQ-009 H, Porta EIC, Motor, Gate, AD, MEP/C3.  
* Não emenda REQ-033 nem REQ-024.  
* Não é recuperação de Job nem reactivação de fio (F5).  
* Não é Histórico Físico nem CAP-09.

### 2.2 Fluxo lógico V1

```text
Mensagem (COA activo ou nomeado)
        │
        ▼
┌───────────────────────────┐
│ D-PED — Detector pedido   │  âncoras +/− REQ-086
│         explícito         │
└─────────────┬─────────────┘
              │ não ⇒ outros destinos (F5 / Job / KNW / estado / …)
              ▼ sim
┌───────────────────────────┐
│ C-ORQ — Orquestrador de   │  resolve coaId; monta pedido de leitura
│         consulta (read)   │
└──────┬─────────────┬──────┘
       │             │
       ▼             ▼
┌────────────┐  ┌──────────────┐
│ F-MO       │  │ F-TX         │
│ Ledger MO  │  │ Transcript   │
│ (Art. 8º)  │  │ COA (prosa)  │
│ consultar* │  │ listar/filtrar│
└─────┬──────┘  └──────┬───────┘
      │                │
      └────────┬───────┘
               ▼
┌───────────────────────────┐
│ C-SEP — Separador +       │  decisões | discussões | ausência
│         montagem resposta │  (+ refs Trilha opcionais)
└─────────────┬─────────────┘
              ▼
        Prosa / destino conversacional
        (sem escrita nos stores)
```

\* `consultarRegistosMo` ou equivalente estável do ledger — **porta de leitura** existente; esta ARQ **não** cria segunda API de MO.

---

## 3. Componentes

| ID | Componente | Responsabilidade V1 | Escreve? |
|----|------------|---------------------|----------|
| **D-PED** | Detector de pedido explícito | Classifica mensagem vs âncoras +/− do REQ-086; em dúvida ⇒ desambiguação/limitação, sem inventar lastro | Não |
| **C-ORQ** | Orquestrador de consulta | Resolve `coaId`; decide ramos decisão / discussão / ambos; invoca só portas de leitura | Não |
| **F-MO** | Porta de leitura Memória Confiável V1 | `consultarRegistosMo` / `listarRegistosMo` filtrados por COA (e termo se houver) | Não (neste fluxo) |
| **F-TX** | Porta de leitura transcript COA | Lê bucket do COA (`ceo.conversa.transcript.v1` / API de store existente) | Não (neste fluxo) |
| **F-TR** | Porta opcional Trilha | Se `refs` já ligáveis, devolve **referências** auxiliares; nunca prosa de chat nem corpo Art. 8º | Não |
| **C-SEP** | Separador / montagem | Empacota resposta com secções distintas; aplica ausência explícita por ramo | Não |
| **C-UI** | Conversa (CAP-07/CAP-03) | Superfície de invocação e entrega; **dona** do transcript | Não neste acto de consulta |

**Proibido criar:** store `consulta.*`, índice invertido persistente, endpoint `/api/ceo/consulta-*` na V1.

---

## 4. Fontes e contratos de leitura

### 4.1 Decisão (Art. 8º)

| Campo | Norma |
|-------|--------|
| Store | Memória Confiável V1 (ledger MO) |
| Porta | Leitura existente do ledger (`consultarRegistosMo` ou equivalente) |
| Filtro mínimo | `coaId` (activo ou nomeado) |
| Não-fonte | `executiveMemory`, workspace, REQ-022 / Painel do Dia, prosa sem entrada no ledger |

### 4.2 Discussão

| Campo | Norma |
|-------|--------|
| Store | Transcript por COA (F5-C3) |
| Posse | Interface conversacional (CAP-07/CAP-03) |
| Papel CAP-05 | **Consumo read-only** apenas |
| Limitação declarada | Mutável; **não** é Histórico Físico append-only |

### 4.3 Trilha (opcional)

| Campo | Norma |
|-------|--------|
| Uso | Correlação por `refs` já existentes |
| Saída admitida | Identificadores / apontadores na resposta |
| Saída proibida | Transcript, KNW, MEP, corpo de decisão inventado |

### 4.4 Pedido explícito (contrato D-PED)

Incorpora por referência a secção **Pedido explícito (V1)** do REQ-086 (âncoras positivas e negativas). A política detalhada de matching (regex/heurística) é da IMP; a ARQ exige que D-PED seja **determinístico e testável** contra CA-086-8.

---

## 5. Ponto de integração no runtime

### 5.1 Superfície V1

Única superfície obrigatória: **caminho conversacional** (Conversa / Núcleo), após resoluções de precedência já existentes (Gate, AD, etc. **inalterados** por esta ARQ).

Ordem conceptual:

1. Destinos com precedência superior (Gate/AD/… conforme arquitectura vigente) — **não** redefinidos aqui.  
2. **D-PED** — se pedido explícito deste REQ ⇒ **C-ORQ** (consulta).  
3. Caso contrário ⇒ fluxos existentes (incl. F5, Jobs, Porta EIC, estado do dia, classificador).

### 5.2 Isolamento COA

* `coaId` efectivo = COA conversacional activo, salvo nomeação explícita de outro COA na mensagem.  
* F-MO e F-TX **recusam** misturar buckets/registos de COAs distintos numa única resposta sem indicação explícita.  
* Alinhado a REQ-037/038/039.

### 5.3 Montagem da resposta (C-SEP)

1. Secção **Decisões** — só entradas F-MO; ou ausência explícita de decisões.  
2. Secção **Discussões** — só excertos/mensagens F-TX; ou ausência explícita de discussões.  
3. Secção **Referências de execução** (opcional) — só se F-TR devolver `refs`.  
4. Proibido promover workspace a Art. 8º (CA-086-9).

Consulta parcial (só decisão ou só discussão) é admitida quando o pedido o indicar; o ramo não pedido pode omitir-se **sem** inventar.

---

## 6. Relação com arquitectura e REQs vizinhos

| Artefacto | Relação |
|-----------|---------|
| **REQ-086** | Norma de requisitos; esta ARQ realiza a V1 |
| **REQ-033** | Norma geral CAP-05; **não** emendada; esta ARQ cobre só o acto de consulta REQ-086 |
| **ARQ-009 H** | Não reabrir; alinhamento H↔ledger MO **fora** desta ARQ (como no REQ-086) |
| **ARQ-012 / conversa** | Fornece superfície e transcript; não absorvida |
| **ARQ-018 / REQ-061** | Histórico recente do classificador ≠ esta consulta de arquivo |
| **Porta EIC / ARQ-031** | KNW fora; CA-086-6 |
| **Trilha Auditável** | F-TR opcional; sem dependência de fecho da frente |
| **Histórico Físico** | Fora V1 |
| **MEP / CAP-13** | Isolado; não lido neste fluxo |

---

## 7. Fora do escopo (arquitectura V1)

* API HTTP dedicada de consulta.  
* Histórico Físico append-only.  
* Correlação estrutural obrigatória mensagem ↔ MO ↔ Trilha.  
* Novo store / índice / “memória de recuperação”.  
* Writers MO, Gate, AD, Motor, Fila, MEP/C3.  
* UI dedicada além da conversa.  
* Busca semântica avançada / ranking ML.  
* Emenda a REQ-086, REQ-033, REQ-024, ARQ-009.

---

## 8. Rastreio aos critérios REQ-086

| CA | Realização arquitectural |
|----|---------------------------|
| CA-086-1 | C-ORQ + F-MO/F-TX + I6 |
| CA-086-2 | C-SEP + I5 |
| CA-086-3 | I2 + resolução `coaId` |
| CA-086-4 | F-MO consome porta de consulta do ledger |
| CA-086-5 | I1 / I10 |
| CA-086-6 | D-PED + secção 5.1 |
| CA-086-7 | C-SEP ausência por ramo |
| CA-086-8 | D-PED + contrato §4.4 |
| CA-086-9 | I3 + §4.1 |

---

## 9. Riscos residuais (transparência)

* Writers MO estreitos ⇒ muitas “decisões” de workspace ausentes no ledger (comportamento correcto = ausência Art. 8º).  
* Transcript mutável ⇒ limitação declarada até Histórico Físico (fora V1).  
* “Sinónimos óbvios” no REQ ⇒ IMP deve fixar bateria de casos; D-PED permanece testável (CA-086-8).

---

## 10. Critérios de homologação desta ARQ

1. Preserva I1–I10.  
2. Não contradiz REQ-086 v1.0.  
3. Não cria componentes além de D-PED / C-ORQ / C-SEP e portas de **leitura** F-MO / F-TX / F-TR.  
4. Não abre IMP nem código neste acto.  
5. Deixa explícito o Gate: IMP só após homologação desta ARQ + autorização ADR-006.

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 09/09/2026 | Engenheiro (Cursor) | Criação — arquitectura V1 da consulta (REQ-086) | Despacho criar somente ARQ-086; sem IMP/código | Em análise |
| 1.0 | 09/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação formal: status Homologada; versão final 1.0; conteúdo normativo = v0.1 APTO | Despacho «Registrar a homologação do ARQ-086 v0.1»; auditoria APTO | **Homologada** |
