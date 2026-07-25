# Registros do Dia — Decisões e Conhecimento (Módulos D e E)

> **Módulos D e E (ARQ-008).** REQ-022, 023, 024.  
> **Status: Operacional — Gate E5 Homologado (CTO, 23/07/2026).**

---

## Enunciado operacional

A partir do Painel do Dia, o patrocinador pode:

1. **Registrar decisão** (módulo D / REQ-022) — o quê, por quê, baseado em quê, resultado; quem/quando.  
2. **Registrar conhecimento reutilizável** (módulo E / REQ-023) — padrão/regra/lição do MG2, distinto de decisão.  
3. **Consultar o registrado** (REQ-024) — só o que está gravado; se vazio → **ausência explícita** (nunca inventar).

Superfície: [`index.html`](index.html).  
Acervos canônicos do MVP: [`decisoes.md`](decisoes.md) · [`conhecimentos-uso-diario.md`](conhecimentos-uso-diario.md).

---

## Distinção D × E

| | Decisão (D) | Conhecimento (E) |
|--|-------------|------------------|
| Natureza | Escolha histórica do dia | Item reutilizável (CNC-002) |
| Campos | enunciado, por quê, baseado em quê, resultado, quem, quando | título, conteúdo, contexto MG2 |
| Não é | Conhecimento reutilizável | Registro de decisão |

---

## Consulta e ausência (REQ-024)

* Resposta usa **apenas** itens em `decisoes.md` / `conhecimentos-uso-diario.md` (e espelho na sessão do Painel).  
* Sem match → declaração explícita: *“Ausência: nada registrado sobre este tema no contexto MG2.”*  
* Proibido apresentar conteúdo não registrado como decisão ou conhecimento do CEO.

---

## Fora da E5

* Emissão em massa de `KNW-nnn` no acervo oficial CAP-04 (E3+ da CAP-04)  
* Curadoria avançada / multi-projeto  
* Integração / verificação ponta a ponta (E6)  
* Encerramento IMP (E7)  
