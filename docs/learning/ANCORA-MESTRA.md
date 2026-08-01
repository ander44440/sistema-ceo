# Âncora Mestra — Estado operacional vigente

> **Tipo:** aprendizado / continuidade operacional (sem efeito normativo sobre CON/ADR).  
> **Atualização:** 01/08/2026 — encerramento formal REQ-053 (Dispatcher V2).  
> **Finalidade:** ponto único de retomada para o patrocinador, CTO e Engenheiro — frentes homologadas, autonomia atual e backlog consciente.

---

## 1. Autonomia de execução (vigente)

| Campo | Valor |
|-------|--------|
| **Modo** | **Local (V2)** |
| **Significado** | PC do patrocinador ligado + watcher/dispatcher ativo |
| **Canal** | Fila REQ-045 → Dispatcher REQ-053 → Cursor Agent (SDK) |
| **IDE Cursor** | **Não** obrigatória para o ciclo CEO → Job → execução |
| **Limite** | Com PC off / sem watcher, Jobs permanecem `pending` |

---

## 2. Frentes / entregas recentes

| ID | Entrega | Estado | Notas |
|----|---------|--------|-------|
| **REQ-053** | Dispatcher V2 (watcher + Cursor SDK + autostart Windows) | **Homologada** — frente **encerrada** 01/08/2026 | Evidência: Jobs 000011, 000012, 000014 `finished`; checkpoint learning |
| REQ-045 | Fila de Execução V1 local | Aprovada / em uso | Base do despacho; CEO não conhece o Cursor |
| PX-003 E4 | Qualidade percebida CN | Homologada (prévia) | Fora desta frente |

---

## 3. Backlog consciente (não autorizado agora)

| Item | Descrição | Prioridade |
|------|-----------|------------|
| **Dispatcher V3** | Cloud / 24×7 com máquina desligada (SDK cloud ou Automations + fila acessível remotamente) | **Backlog** — execução futura; exige REQ/ADR próprios |
| IMP/VAL formais REQ-053 | Opcional a critério do CTO (checkpoint + evidência de Jobs pode bastar no MVP V2) | Aguardam deliberação CTO |

---

## 4. Ponto de retomada

* **Frente REQ-053:** oficialmente **encerrada**.  
* **Próxima frente:** **a definir** (aguardar definição do patrocinador / CTO).  
* **Operação diária:** usar o CEO; despachos técnicos via fila; watcher sobe no login (`CEO-fila-dispatcher`).

### Referências rápidas

| Artefacto | Caminho |
|-----------|---------|
| REQ-053 | `docs/requirements/REQ-053-dispatcher-fila-execucao-v2-local.md` |
| Checkpoint CTO | `docs/learning/2026-08-01-checkpoint-dispatcher-fila-v2-req-053.md` |
| Dispatcher | `executive/dispatcher/` |
| Autostart | `executive/dispatcher/install-autostart.ps1` |

---

## 5. Memória organizacional (este update)

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (homologação operacional) + Engenheiro (Cursor) |
| Quando | 01/08/2026 |
| Por quê | Encerrar formalmente REQ-053 e ancorar autonomia local vs backlog V3 |
| Baseado em quê | REQ-053; REQ-045; decisão V2 (menor custo/risco); evidência de 3 Jobs |
| Resultado | Âncora Mestra atualizada; frente REQ-053 encerrada; aguarda próxima frente |

---

*Documento vivo — atualizar em cada encerramento formal de frente operacional relevante.*
