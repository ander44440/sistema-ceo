# Ciclo do Dia (Módulo C)

> **Módulo C (ARQ-008).** REQ-018, 019, 020, 025, 027.  
> **Status: Operacional — Gate E4 Homologado (CTO, 23/07/2026).**

---

## Enunciado operacional

O Ciclo do Dia governa os atos de autoridade do patrocinador sobre o Dia de Trabalho no contexto MG2:

**Abrir o Dia → (ajustar Foco / Próximo passo) → Fechar o Dia**

Toda mudança de foco vigente, próximo passo vigente ou consolidação do fechamento **só produz efeito após confirmação explícita** (REQ-027).

Superfície de operação: [`index.html`](index.html) (Painel + atos do ciclo).  
Estado canônico: [`estado-do-dia.md`](estado-do-dia.md) (módulo F).

---

## Atos materializados

| Ato | REQ | Comportamento E4 |
|-----|-----|------------------|
| Abrir o Dia | 018 | Reapresenta estado F no Painel; status → `aberto`; permite partir ao MG2 sem reexplicar |
| Foco (uma frase) | 019 | Proposta editável; vigora só após confirmar |
| Próximo passo (um) | 020 | No máximo um vigente; nova proposta só vigora após confirmar (incl. no fecho) |
| Fechar o Dia | 025 | Avanços + pendências + proposta de amanhã; consolida só após confirmar |
| Confirmação | 027 | Confirmar / Ajustar-Cancelar em cada ponto de autoridade |

---

## O que o módulo C não faz (E4)

* Planejamento multi-etapa / filas de tarefas  
* Impor sugestões sem confirmação  
* Registrar decisão/conhecimento (E5)  
* Expandir além de um próximo passo  

---

## Observável (critérios IMP-005 E4)

| Critério | Estado E4 |
|----------|-----------|
| Atos do ciclo percorríveis | **Sim** — `index.html` |
| Autoridade só após confirmação | **Sim** — diálogos Confirmar / Cancelar |
| Um próximo passo por vez | **Sim** |
| E5–E7 não iniciadas | **Sim** |
