# P8 — Preparação para Produção do MRE

> **O que é?** Pacote operacional de autorização de produção do Motor de Raciocínio Executivo.  
> **Por que existe?** Cumprir o critério **P8** do IMP-010 §11 sem alterar arquitetura nem código funcional.  
> **Para quem?** Patrocinador (autoriza), CTO (homologa pré-requisitos), Engenheiro (executa ativação/rollback sob mandato).  
> **Sucesso:** Gate pode assinar Go/No-Go com checklist completo; produção só após assinatura explícita.  
> **Data:** 30/07/2026 · **Versão:** 1.1 (Gate Final)  
> **Estado:** produção **AUTORIZADA** — assinatura em §7 / P10 §6.  
> **Proibições históricas:** não altera código funcional; não cria REQ/ADR/ARQ/IMP.

---

## 1. Plano de Produção (ativação)

### 1.1 Definição de “produção” neste contexto

**Produção do MRE** = uso deliberativo real do caminho MRE → ParecerExecutivo → Speaker como **comportamento autorizado e monitorado** no dia a dia do patrocinador (ADR-015 / MG2), com rollback conhecido.

Isto **não** é:

* novo deploy de infraestrutura cloud;
* alteração de schema REQ-048;
* declaração implícita só porque `flagMre.ativo === true` no código.

### 1.2 Estado técnico atual (pré-autorização)

| Item | Estado |
|------|--------|
| Implementação F1–F9 | Concluída (Blocos 1–3) |
| Testes | `npm run test:mre` → 59 pass / 0 fail |
| VAL-009 | Emitida; **Aprovado para P2** (técnico); homologação Gate pendente |
| `flagMre.ativo` no código | `true` (caminho deliberativo **habilitado** quando LLM configurado) |
| Declaração formal de produção | **Pendente** — este documento prepara a autorização |

> Nota: o código já permite a rota MRE. P8 formaliza a **autorização de governação** e o regime de operação/monitoramento/rollback — não inventa feature nova.

### 1.3 Sequência de ativação (após Go)

| Passo | Ação | Responsável |
|-------|------|-------------|
| A1 | Confirmar homologação VAL-009 (P2) | Gate |
| A2 | Confirmar checklist Go/No-Go §3 = todos Go | Gate + Engenheiro |
| A3 | Assinar secção §7 (autorização explícita P8) | Patrocinador |
| A4 | Confirmar `CEO_LLM_API_KEY` / LLM operacional no ambiente de uso | Engenheiro |
| A5 | Confirmar `flagMre.ativo = true` (já default; só alterar se estiver false) | Engenheiro |
| A6 | Smoke operacional (3 cenários §5.1) no gabinete | Patrocinador / Engenheiro |
| A7 | Registar “Produção MRE autorizada em &lt;data&gt;” no checkpoint | Engenheiro |
| A8 | Iniciar janela de monitoramento §5 (mín. 3 dias úteis ou 10 deliberações) | Patrocinador |

**Produção só existe após A3+A7.** Até lá, uso é pré-produção / desenvolvimento.

### 1.4 Estratégia de rollout (`flagMre`)

| Fase | Duração sugerida | `flagMre.ativo` | Âmbito |
|------|------------------|-----------------|--------|
| **R0 — Preparação** | Até assinatura P8 | indiferente / true em dev | Sem declaração de produção |
| **R1 — Produção assistida** | 3–5 dias ou 10 deliberações | **true** | Uso diário MG2; monitorar §5 |
| **R2 — Produção estável** | Após R1 sem incidente P1/P2 | **true** | Regime normal |
| **Rx — Rollback** | Sob incidente | **false** | Ver §2 |

**Continuação do roadmap operacional:** após este P8, executar **[P9 — Ensaio operacional](2026-07-30-p9-ensaio-operacional-mre.md)** (R1) e **[P10 — Pacote de autorização](2026-07-30-p10-pacote-autorizacao-producao-mre.md)** (dossiê Gate). Produção só com assinatura P10.

Rollout é **binário por flag** (não percentagem de utilizadores — produto single-user). Mitigação de risco = monitoramento + rollback rápido, não canary multi-tenant.

---

## 2. Plano de Rollback

### 2.1 Gatilhos (obrigatório reverter)

| Severidade | Gatilho | Ação |
|------------|---------|------|
| **P1** | Parecer falso / decisão inventada comunicada como facto | Rollback imediato |
| **P1** | Princípio aplicado automaticamente (quebra H1) | Rollback imediato + auditoria |
| **P2** | Regressão em fluxo determinístico (abrir dia, data, memória) | Rollback imediato |
| **P2** | Fila a criar jobs sem parecer válido de forma recorrente | Rollback ou `skip` despacho + investigar |
| **P3** | Latência inaceitável / LLM indisponível em série | Rollback temporário ou fallback já existente |
| **P3** | Speaker distorce estado deliberativo | Rollback ou forçar template (já DET) |

### 2.2 Procedimento de rollback (sem novo código)

1. Definir `flagMre.ativo = false` em `app/src/mre/roteamentoDeliberativo.js`.  
2. Recarregar a aplicação (`npm run dev` / refresh do browser).  
3. Verificar: mensagem deliberativa **não** gera `modo: "mre"`; determinísticos (data, saudação, abrir dia) continuam OK.  
4. Registar incidente: data, sintoma, parecerId se houver, ação.  
5. **Não** apagar pareceres/jobs já emitidos; marcar para revisão se necessário.  
6. Reativação só com novo Go explícito do Patrocinador.

### 2.3 O que o rollback NÃO faz

* Não reverte Jobs já `pending` na fila (tratar via protocolo REQ-045).  
* Não apaga propostas `pendente_gate` (permanecem para Gate humano).  
* Não altera REQs/ADR/ARQ.

---

## 3. Checklist Go / No-Go

Marcar na autorização. **Qualquer No-Go bloqueia produção.**

### 3.1 Pré-requisitos normativos

| # | Item | Go? | Evidência |
|---|------|-----|-----------|
| N1 | REQ-048…051 aprovadas | ☐ | Catálogo / REQs |
| N2 | ARQ-013 aprovada | ☐ | ARQ-013 |
| N3 | IMP-010 F1–F9 implementados | ☐ | Blocos 1–3 |
| N4 | VAL-009 homologada pelo Gate (P2) | ☐ | VAL-009 + deliberação |
| N5 | Sem NC abertas na VAL-009 | ☐ | 0 NC |

### 3.2 Pré-requisitos técnicos

| # | Item | Go? | Evidência |
|---|------|-----|-----------|
| T1 | `npm run test:mre` → 0 fail (reexecutar no dia do Go) | ☐ | Output terminal |
| T2 | LLM configurado (`CEO_LLM_API_KEY`) no ambiente de uso | ☐ | `/api/ceo/llm-status` ou smoke |
| T3 | Procedimento de rollback ensaiado (flag off → on) | ☐ | Nota de ensaio §4 |
| T4 | Caminhos determinísticos OK com flag on e off | ☐ | Smoke abrir dia / data / saudação |
| T5 | Um cenário `solicitar_dados` e um estado fechado OK | ☐ | Smoke deliberativo |

### 3.3 Pré-requisitos operacionais

| # | Item | Go? | Evidência |
|---|------|-----|-----------|
| O1 | Patrocinador disponível para janela R1 | ☐ | Agenda |
| O2 | Canal de reporte de incidente definido (chat CTO / nota learning) | ☐ | Acordo verbal/escrito |
| O3 | OE-001…004 da VAL-009 aceites como não bloqueantes | ☐ | VAL-009 §8 |
| O4 | Assinatura P8 (§7) preenchida | ☐ | Este documento |

**Regra:** todos os ☐ → ☑ para **Go**. Um No-Go ⇒ produção **não** autorizada.

---

## 4. Validação de pré-requisitos operacionais (síntese)

| Pré-requisito | Status técnico pré-Gate | Bloqueante até |
|---------------|-------------------------|----------------|
| Artefactos REQ/ARQ/IMP | Prontos | — |
| VAL-009 | **Homologada** 30/07/2026 | Gate Final |
| Testes 59/59 | Verificados em 30/07/2026 | Re-run no dia do Go |
| Rollback documentado | Este §2 | Ensaio T3 |
| LLM | Depende do ambiente local | T2 |
| Autorização Patrocinador | Pendente | §7 |

---

## 5. Critérios de monitoramento inicial (R1)

### 5.1 Smoke obrigatório (dia 0 pós-Go)

| Cenário | Esperado |
|---------|----------|
| Saudação / data | Sem MRE; resposta local |
| Abrir dia / estado | Capacidade memória; sem MRE |
| Deliberação (“priorizar X no MG2”) | `modo: mre`; parecerId; texto Speaker alinhado ao estado |
| Pedido ambíguo / sem dados | Preferência `solicitar_dados` + perguntas |

### 5.2 Indicadores (janela R1)

| Indicador | Alvo / limiar | Ação se violar |
|-----------|---------------|----------------|
| Deliberações com parecer válido | ≥ 95% das deliberativas com LLM up | Investigar; se &lt;80% → rollback |
| Incidentes P1 | **0** | Rollback imediato |
| Incidentes P2 | **0** na janela | Rollback |
| Quebra H1 | **0** | Rollback + auditoria |
| Jobs sem `parecerId` vindos do MRE | **0** | Pausar despacho / rollback |
| Tempo percebido inaceitável pelo patrocinador | Subjetivo ADR-015 | OE-001; rollback temporário opcional |
| Fluxos determinísticos | Sem regressão reportada | Rollback se confirmado |

### 5.3 Ritmo de revisão

* Diário rápido (2 min) na janela R1.  
* Ao fim de R1: Go para R2 ou rollback / extensão R1.

---

## 6. Recomendação técnica para autorização de produção

| Aspeto | Recomendação |
|--------|----------------|
| Prontidão técnica do MRE | **Sim** — implementação + testes + VAL-009 (0 NC) |
| Autorizar produção agora? | **Condicional** — apenas após **Go** em §3 e assinatura §7 |
| Homologar VAL-009 antes? | **Obrigatório** (P2) |
| Re-run testes no dia do Go? | **Obrigatório** (T1) |
| Declarar produção neste documento? | **Não** — só o Gate/Patrocinador declara via §7 |

**Recomendação do Engenheiro:**  
Autorizar produção do MRE **quando** N4 (VAL homologada) + checklist §3 completo + assinatura §7.  
Não autorizar se VAL-009 ou T1/T2 falharem.

---

## 7. Documento de autorização para produção (P8)

> **Preenchido no Gate Final de Produção — 30/07/2026.** Fonte canónica da assinatura: [P10 §6](2026-07-30-p10-pacote-autorizacao-producao-mre.md).

| Campo | Valor |
|-------|--------|
| Data da autorização | **30/07/2026** |
| Patrocinador (nome / rubrica) | **Patrocinador** — mandato Gate Final |
| CTO (homologação VAL-009 / Go) | Ratificado pelo Patrocinador (autoridade máxima) |
| Engenheiro (execução A4–A7) | **Cursor (Auto)** |
| Resultado checklist §3 | ☑ **Go** |
| `flagMre.ativo` confirmado | ☑ **true** |
| Re-run `test:mre` | ☑ **pass** — 59/59 — 30/07/2026 |
| Decisão | ☑ **Produção MRE AUTORIZADA** |

**Texto de decisão (Go):**

> Autorizo a produção do Motor de Raciocínio Executivo no ambiente do Sistema CEO, sob o regime R1 deste plano P8, com rollback por `flagMre` conforme §2. Esta assinatura satisfaz o critério **P8** do IMP-010 §11. Não autoriza alterações de REQ/ADR/ARQ.

---

## 8. Rastreabilidade

| Elo | Referência |
|-----|------------|
| IMP-010 §11 | Critérios P1–P8 |
| VAL-009 | Validação formal MRE |
| Flag | `app/src/mre/roteamentoDeliberativo.js` → `flagMre` |
| Checkpoint | `docs/learning/2026-07-30-checkpoint-fases-mre.md` |
| Relatórios | BLOCO-1/2/3 |

---

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 1.0 | 30/07/2026 | Engenheiro (Cursor) | Plano P8 — preparação; sem declaração automática de produção |
| 1.1 | 30/07/2026 | Patrocinador (Gate); Engenheiro (registo) | §7 preenchida — Produção AUTORIZADA (ver P10) |
