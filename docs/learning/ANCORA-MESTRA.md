# Âncora Mestra — Estado operacional vigente

> **Tipo:** aprendizado / continuidade operacional (sem efeito normativo sobre CON/ADR).  
> **Atualização:** 01/08/2026 — encerramento formal IMP-054 (Conector CTO).  
> **Finalidade:** ponto único de retomada para o patrocinador, CTO e Engenheiro — frentes homologadas, autonomia atual e backlog consciente.

---

## 1. Autonomia de execução (vigente)

| Campo | Valor |
|-------|--------|
| **Modo execução técnica** | **Local (V2)** — PC ligado + watcher/dispatcher |
| **Canal Engenheiro** | Fila REQ-045 → Dispatcher REQ-053 → Cursor Agent (SDK) |
| **Canal CTO** | Orquestrador → Conector CTO (REQ-054) → OpenAI (mesma chave; Opção B) → `ResultadoCto` |
| **IDE Cursor** | **Não** obrigatória para Jobs nem para consulta CTO |
| **Limite Jobs** | PC off / sem watcher → Jobs `pending` |
| **Capacidade nova** | O CEO pode **consultar o CTO de forma autónoma** (`consultar cto: …` / `executiveEngine.consultarCto`) |

---

## 2. Frentes / entregas recentes

| ID | Entrega | Estado | Notas |
|----|---------|--------|-------|
| **ARQ-015** | CTO Connector | **Homologada v0.2** | Opção B; isolamento lógico |
| **REQ-054** | Conector CTO | **Homologada** | Contratos IFA-CTO-*; CAP-11 |
| **IMP-054** | Implementação Conector CTO | **Homologada** — frente **encerrada** 01/08/2026 | Produção: rota `/api/ceo/cto/consultar` |
| **REQ-053** | Dispatcher V2 | **Homologada** — encerrada 01/08/2026 | Watcher + autostart |
| REQ-045 | Fila de Execução V1 | Em uso | CEO não conhece o Cursor |
| PX-003 E4 | Conversação Natural | Homologada (prévia) | Fora desta frente |

---

## 3. Backlog consciente (não autorizado agora)

| Item | Descrição | Prioridade |
|------|-----------|------------|
| **Dispatcher V3** | Cloud / 24×7 com máquina desligada | **Backlog** |
| IMP/VAL formais REQ-053 | Opcional a critério do CTO | Backlog leve |
| Extensões de schemas `cto.*` | Só por emenda REQ | Sob demanda |

---

## 4. Ponto de retomada

* **Frente IMP-054 / Conector CTO:** oficialmente **encerrada** (ARQ + REQ + IMP homologadas; disponível em produção).  
* **Próxima frente:** **a definir**.  
* **Operação diária:** CEO no browser; Jobs via fila+dispatcher; consultas CTO via «consultar cto: …».

### Referências rápidas

| Artefacto | Caminho |
|-----------|---------|
| ARQ-015 | `docs/architecture/ARQ-015-cto-connector.md` |
| REQ-054 | `docs/requirements/REQ-054-conector-cto.md` |
| IMP-054 | `docs/implementation/IMP-054-conector-cto.md` |
| README Connector | `app/server/ctoConnector/README.md` |
| Dispatcher | `executive/dispatcher/` |

---

## 5. Memória organizacional (este update)

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (Gates ARQ/REQ/IMP) + Engenheiro (Cursor) |
| Quando | 01/08/2026 |
| Por quê | Encerrar IMP-054 e registar Conector CTO em produção |
| Baseado em quê | ARQ-015 v0.2; REQ-054; IMP-054; Opção B |
| Resultado | Âncora Mestra atualizada; frente CTO Connector encerrada; CEO consulta CTO de forma autónoma |

---

*Documento vivo — atualizar em cada encerramento formal de frente operacional relevante.*
