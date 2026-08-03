# Deliberação CTO — Opção C: Briefing Curado MG2 agora; Opção B condicionada

> **Status: Oficial — Deliberação do CTO (30/07/2026).**  
> **Origem:** Comunicado do Patrocinador [`2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md`](./2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md).  
> **Natureza:** Gate de mitigação imediata — **não** abre VIS/REQ/ARQ/IMP arquitetural.

---

## Declaração

Analisados o comunicado e os insumos:

- O problema **não** é do MRE nem do Speaker.  
- O problema é uma **lacuna de conhecimento operacional do COA MG2**.

| Classificação | Decisão |
|---------------|---------|
| Bloqueante para a arquitetura do CEO? | **Não** |
| Bloqueante para o uso diário do COA MG2? | **Sim** |

---

## Deliberação — Opção C aprovada

### 1. Executar agora — Opção A

- Produzir um **Briefing Curado** do Motoboy Game 2.  
- Objetivo: lastro operacional suficiente para o COA MG2 no uso diário.  
- **Não** alterar MRE nem Speaker.

### 2. Depois — Opção B condicionada

Após período de utilização e recolha de evidências, **reavaliar** a necessidade de ciclo formal VIS → REQ → ARQ para ligação arquitetural permanente COA ↔ conhecimento.

---

## Determinações expressas

1. Não alterar o MRE para compensar ausência de conhecimento.  
2. Não alterar o Speaker para “parecer” conhecer o projeto.  
3. O conhecimento deve ser fornecido pela **camada de contexto**, não simulado pela camada deliberativa.  
4. **Nenhuma** alteração de arquitetura, REQ, ARQ ou IMP é autorizada neste momento (além da curadoria do briefing / espelho na camada de contexto já existente).

---

## Gate CTO

**APROVADA** a mitigação imediata por Briefing Curado (Opção A).  
Solução arquitetural (Opção B) **condicionada** a evidências futuras.

**Parecer final (30/07/2026):** Gate **ENCERRADO** — [`2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md`](./2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md).

---

## Execução (Engenheiro)

| Entrega | Artefato |
|---------|----------|
| Briefing Curado canónico | [`../mvp/briefing-operacional-mg2.md`](../mvp/briefing-operacional-mg2.md) |
| Espelho na camada de contexto (já existente) | `app/src/executiveEngine/briefingsProjeto.js` |
| Identidade COA aponta ao briefing | [`../mvp/contexto-mg2.md`](../mvp/contexto-mg2.md) |

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (deliberação); Patrocinador (comunicado); Engenheiro (execução Opção A) |
| Quando | 30/07/2026 |
| Por quê | Uso diário do COA MG2 bloqueado por falta de lastro operacional |
| Baseado em quê | Comunicado 30/07; ADR-015; insumos da lacuna |
| Resultado | Opção C; A executada; Gate **ENCERRADO** (parecer final); B condicionada a evidências |
