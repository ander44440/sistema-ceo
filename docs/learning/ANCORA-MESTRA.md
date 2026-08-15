# Âncora Mestra — Estado operacional vigente

> **Tipo:** aprendizado / continuidade operacional (sem efeito normativo sobre CON/ADR).  
> **Atualização:** 15/08/2026 — Frente 3 / VAL-073: DESP-009 emendado (disciplina factual). Anterior: 07/08/2026 — **BASELINE OFICIAL ACTUALIZADA**.  
> **Finalidade:** ponto único de retomada — frentes homologadas, autonomia actual, operação sob Baseline.

### Baseline operacional oficial

| Componente | Estado |
|------------|--------|
| EIC | Baseline |
| Executive Engine | Baseline |
| CTO-003 — Estado Operacional | Baseline |
| CAP-04 — Capacidade de Conhecimento | Baseline · ENCERRADA |
| CAP-01 — Autoridade Delegada | Baseline · ENCERRADA |

Registo: [`2026-08-07-despacho-baseline-oficial-maturidade.md`](2026-08-07-despacho-baseline-oficial-maturidade.md).

---

## 1. Capacidade de conversação (vigente)

| Campo | Valor |
|-------|--------|
| **Estado** | **Maturidade** — capacidade conversacional consolidada |
| **Baseline** | EIC-001 + DESP-002…010 — **estável** |
| **Arquitectura / Engine / EIC / Governação** | **Consolidadas** (parecer CTO) |
| **Modo operacional** | Calibração contínua por evidências + [`FILTRO-EVIDENCIA-CTO.md`](FILTRO-EVIDENCIA-CTO.md) |
| **Documento de status** | [`2026-08-06-status-capacidade-conversacao.md`](2026-08-06-status-capacidade-conversacao.md) |

### Comportamento (resumo)

| Dimensão | Estado |
|----------|--------|
| Pensar (MRE + ciclo EIC-001) | Operacional |
| Conversar (CN + CSC + VCA) | Operacional |
| Decidir (Classificador + Gate + Motor) | Operacional |
| Conduzir (hierarquia + encerramento) | Operacional |

Rollback interno EIC-001: `REFINO_EIC_ATIVO=false`.  
Metadado `dados.refinoEic` — só diagnóstico.

---

## 2. Autonomia de execução (vigente)

| Campo | Valor |
|-------|--------|
| **Modo execução técnica** | **Local (V2)** — PC ligado + watcher/dispatcher |
| **Canal Engenheiro** | Fila REQ-045 → Dispatcher REQ-053 → Cursor Agent (SDK) |
| **Canal CTO** | Orquestrador → Conector CTO (REQ-054) → OpenAI (mesma chave; Opção B) → `ResultadoCto` |
| **Transparência operacional** | Painel de Orquestração (REQ-055) no Centro — snapshot + SSE/polling |
| **IDE Cursor** | **Não** obrigatória para Jobs nem para consulta CTO |
| **Limite Jobs** | PC off / sem watcher → Jobs `pending`; Dispatcher no painel → Erro sem heartbeat |
| **Capacidade** | CEO consulta CTO de forma autónoma; painel **só leitura** (não delibera / não despacha) |

---

## 3. Frentes / entregas recentes

| ID | Entrega | Estado | Notas |
|----|---------|--------|-------|
| **IMP-071** | Autoridade Delegada (CAP-01) | **Homologada** 07/08/2026 | **Baseline CAP-01** |
| **IMP-070** | Capacidade de Conhecimento (Camada) | **Homologada** 07/08/2026 | **Baseline CAP-04** |
| **EIC-001** | Refino — calibração por evidências | **Homologado** 06/08/2026 | Baseline interna EIC |
| **DESP-002** | Calibração comportamento conversacional | **Homologado** 06/08/2026 | Baseline condução |
| **DESP-003** | Ciclo Decidir | **Homologado** 06/08/2026 | Critério, alternativa, monitorar, Gate |
| **DESP-004** | Ciclo Planejar | **Homologado** 06/08/2026 | Plano multi-etapa antes da decisão |
| **DESP-005** | Ciclo Antecipar | **Homologado** 06/08/2026 | Antecipação com evidência; não intrusivo |
| **DESP-006** | Ciclo Adaptar | **Homologado** 06/08/2026 | Profundidade/detalhe/condução ao momento |
| **DESP-007** | Ciclo Memória executiva | **Homologado** 06/08/2026 | Continuidade cognitiva em conversas longas |
| **DESP-008** | Inteligência executiva | **Homologado** 06/08/2026 | Conduzir missão do início ao fim |
| **DESP-009** | Execução executiva | **Homologado** 06/08/2026 · **Emendado** 15/08/2026 (Frente 3) | Costura decide→executar **sem** promover recomendação a vigente; VAL-073 |
| **DESP-010** | Calibração em produção | **Homologado** 06/08/2026 | 1.º ciclo por evidências; mode contínuo |
| **DEC-010** | Foco dos ciclos | **Aprovado com ressalvas** | Comportamento em operação, não engenharia de processo |
| **REL-001 / GATE-009** | Estado + prontidão | Homologados | Apto com ressalvas (paridade voz F1) |
| **IMP-068** | Modo CEO Ouvindo | Encerrado (ENC-006) | Canal; EIC sem classe «voz» |
| **IMP-055** | Painel de Orquestração | Homologada — encerrada 01/08/2026 | Só leitura operacional |
| **IMP-054** | Conector CTO | Homologada — encerrada 01/08/2026 | `/api/ceo/cto/consultar` |
| **REQ-053** | Dispatcher V2 | Homologada — encerrada 01/08/2026 | Watcher + heartbeat |
| PX-003 E4 | Conversação Natural | Homologada | Prosa ao utilizador |

---

## 4. Backlog consciente (não autorizado agora)

| Item | Descrição | Prioridade |
|------|-----------|------------|
| `Aprovo a recomendação` sem objecto | Risco residual da Frente 3 (VAL-073 FORA DE ESCOPO) | Separado; **não** reabre F3 |
| Calibração contínua | Só com **evidência objectiva** de missão real | Aguarda evidência |
| **Dispatcher V3** | Cloud / 24×7 com máquina desligada | **Backlog** |
| NCS em produção | `flagNcs` off — só com mandato | Não declarado |

---

## 5. Ponto de retomada

* **Capacidade de conversação:** operacional; baseline EIC-001 + DESP-002…010.  
* **Executive Engine · CTO-003:** Baseline (estado operacional / interceptação).  
* **Autoridade Delegada (CAP-01):** **Baseline oficial** · ciclo **ENCERRADO**.  
* **Capacidade de Conhecimento (CAP-04 Camada):** **Baseline oficial** · ciclo **ENCERRADO**.  
* **Modo do Sistema:** **MATURIDADE POR EVIDÊNCIAS — ACTIVO** — frentes arquitecturais **nenhuma**.  
* **Pergunta permanente:** «Existe evidência suficiente para justificar uma mudança?» (não «o que podemos melhorar?»).  
* **Baselines a preservar:** EIC · EE · CTO-003 · CAP-01 AD (ARQ-032 · REQ-075…084 · IMP-071) · CAP-04 Camada (ARQ-031 · REQ-070…074 · IMP-070) — congelados.  
* **Modo CTO:** observação técnica permanente (filtro de evidências; silêncio pós-fecho salvo evidência/regressão).  
* **Operação diária:** CEO no browser (Conversa + Painel); Jobs via fila+dispatcher; lastro de domínio via Porta EIC; AD sob mandato explícito.
### Referências rápidas

| Artefacto | Caminho |
|-----------|---------|
| Status conversação | `docs/learning/2026-08-06-status-capacidade-conversacao.md` |
| REL-001 | `docs/REL-001-estado-atual-do-sistema-ceo.md` |
| EIC | `docs/EIC/` |
| Refino código | `app/src/executiveEngine/refinoEic.js` |
| Classificador / CSC / VCA | `app/src/classificadorIntencao/` |

---

## 6. Memória organizacional (este update)

| Campo | Registro |
|-------|----------|
| Quem | Cursor (Engenheiro) |
| Quando | 15/08/2026 |
| Por quê | Encerrar Frente 3 após VAL-073 |
| Baseado em quê | VAL-073 aprovada; emenda DESP-009 |
| Resultado | Âncora: DESP-009 emendado; residual `Aprovo a recomendação` no backlog consciente |

---

## 6b. Memória organizacional (update anterior 06/08)

| Campo | Registro |
|-------|----------|
| Quem | Cursor 1 (Engenheiro) |
| Quando | 06/08/2026 |
| Por quê | Actualizar status da capacidade de conversação pós EIC-001 + DEC-010 |
| Baseado em quê | Homologação EIC-001; DEC-010; REL-001; runtime CAP-07/EIC |
| Resultado | Âncora Mestra + status conversacional alinhados ao comportamento em operação |

---

*Documento vivo — atualizar em cada encerramento formal de frente operacional relevante.*
