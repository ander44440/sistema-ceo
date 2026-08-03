# 02 — Arquitectura

> **Status:** BLOCO 2 — Engenharia consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Mapa conceptual de peças **já homologadas** — a EIC **não** cria arquitectura de produto nova.  
> **Fontes:** CON-001; VIS-002; ARQ-016; ARQ-017; ARQ-018; PX-003 E1/E4; REQ-050; Âncora Mestra; [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md); [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md).

## Objetivo

Descrever a arquitectura **conceptual** da conversação do CEO tal como já existe nas normas homologadas, e o lugar da EIC como disciplina documental desacoplada — sem inventar camadas runtime novas.

## Finalidade

Mapa de referência para evolução conversacional. Ordem de evolução → [`03_ROADMAP.md`](03_ROADMAP.md). Capacidades → [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md).

---

## 1. Visão arquitectónica

A conversação do CEO é uma **cadeia já definida** nas ARQ/PX:

1. O utilizador fala na **Conversa** (meio preferencial — VIS-002 §3.6).  
2. O **Classificador de Intenção** (ARQ-018) corre **antes** de qualquer efeito.  
3. O destino segue a classe (C1–C4): resposta leve, Núcleo/MRE, Motor, ou capacidades operacionais.  
4. A prosa ao utilizador passa pela **Conversação Natural** / Speaker (PX-003; REQ-050) — qualidade de turno, não deliberação.  
5. O **Painel de Orquestração** (ARQ-016) observa o sistema em paralelo; **só leitura** (Âncora Mestra).

A **EIC** não é um nó desta cadeia: é a **governação documental** de como essa cadeia evolui (qualidade, critérios, testes, Gates), até autorização de IMP.

---

## 2. Camadas (peças existentes)

| Camada | Peça existente | Norma | Papel conversacional |
|--------|----------------|-------|----------------------|
| L0 Superfície | Conversa / Centro | VIS-002; Âncora | Entrada/saída com o utilizador |
| L1 Intenção | Classificador de Intenção | ARQ-018 / REQ-057 | C1–C4 antes de qualquer efeito |
| L2 Deliberação / execução | Núcleo, MRE, Motor | ARQ-017; ADR-019 | Só após classificação; C3 → Motor |
| L3 Operação do sistema | Capacidades (fila, painel, memória, CTO…) | ARQ-015/016; REQ-054/055 | Destino típico C4 |
| L4 Prosa | Conversação Natural + Speaker | PX-003; REQ-050 | Ritmo, densidade, variação; **não** decide |
| L5 Observabilidade | Painel de Orquestração | ARQ-016; REQ-055 | Transparência; não despacha |
| **Doc** | **EIC** | `docs/EIC/` | Ordem, princípios, qualidade, Gates — **fora do runtime** |

---

## 3. Fluxo lógico (já normativo)

```text
Utilizador
   → Conversa
   → Classificador de Intenção (ARQ-018)     ← obrigatório, primeiro
        ├─ C1 → resposta imediata / capacidade leve
        ├─ C2 → Núcleo / MRE (+ frente activa)
        ├─ C3 → Motor de Execução (ARQ-017) → Job (política)
        └─ C4 → capacidades operacionais do CEO
   → Conversação Natural / Speaker (prosa ao utilizador)
```

Painel (ARQ-016) e heartbeat do Dispatcher observam o estado; **não** classificam nem saltam o Classificador (ARQ-018).

---

## 4. Fronteiras e desacoplamento

| Fronteira | Regra já aprovada |
|-----------|-------------------|
| EIC ↛ runtime | Documentação até Gate G-EIC-D ([`03_ROADMAP.md`](03_ROADMAP.md)) |
| CN ↛ MRE | PX-003: CN não move decisão do MRE |
| Classificador ↛ Jobs | ARQ-018: classificador não publica Jobs nem invoca Agent |
| Painel ↛ deliberação | Âncora / REQ-055: só leitura |
| CEO ≠ chatbot | CON-001 Art. 2º; VIS-002 §3.6 |
| NCS ≠ Intenção | Classificador NCS (ARQ-014) ≠ Classificador de Intenção (ARQ-018) |

---

## 5. Pontos de contacto com o produto (somente referência)

| Contacto | O que a EIC pode vir a orientar (documentalmente) | O que a EIC não faz sozinha |
|----------|--------------------------------------------------|----------------------------|
| Classificador | Critérios de qualidade de classificação / regressão | Alterar código sem REQ/IMP + Gate |
| CN / Speaker | Qualidade percebida (PX-003 E4) | Mudar prompts/templates sem Gate |
| Conversa UI | Experiência do turno | Redesign de UI sem norma |
| Motor / Fila | Só efeitos de C3 já governados | Usurpar ARQ-017 / REQ-060 |
| Painel | Coerência de sinais vs prosa | Escrever no painel como acção |

---

## 6. Decisões em aberto (não inventadas — apenas listadas)

Itens que **já** estão fora do escopo imediato da EIC documental ou em backlog consciente (Âncora Mestra):

| Item | Estado conhecido |
|------|------------------|
| Dispatcher V3 (cloud 24×7) | Backlog — Âncora Mestra |
| Extensões de nós do painel | Sob demanda — Âncora |
| Automação CI de testes conversacionais | Fora do roadmap EIC nesta fase ([`03_ROADMAP.md`](03_ROADMAP.md) §7) |
| Preenchimento de Critérios/Testes EIC (04/05) | Fase 2 — conteúdo pendente |

Nenhuma destas linhas é arquitectura nova proposta pela EIC.

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md) | Identidade |
| [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) | Princípios de encaminhamento e qualidade |
| [`03_ROADMAP.md`](03_ROADMAP.md) | Ordem M3 / Gates |
| [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md) | Como evoluir sem saltar normas |
| [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md) | CAP ligadas às camadas |
| [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md) | Termos C1–C4, CN, EIC |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 2 — mapa conceptual homologado | Pronto para homologação |

---

**Estado:** BLOCO 2 — arquitectura conceptual consolidada. Sem nova ARQ de produto. Sem impacto no runtime.
