# 2026-07-24 — Institucionalização da CAP-R (Capacidade de Consolidação)

> **Status: Marco institucional — Deliberação Final do CTO (24/07/2026).**  
> Tipo: diário / aprendizado do projeto.  
> Norma: CON-001 Art. 8º; ADR-006; ADR-014; ADR-016; **ADR-017 Aceita v1.0**.

---

## O que ocorreu

O CTO aprovou a **ADR-017**, que institui a classificação oficial de capacidades do Sistema CEO:

| Classe | Papel |
|--------|-------|
| **CAP-E — Capacidade de Evolução** | Cria novas capacidades estratégicas (mapa CAP-001 / ROADMAP / ÉPICOS) |
| **CAP-R — Capacidade de Consolidação** | Consolida e aprimora capacidades **já homologadas**, a partir de Oportunidades de Evolução (OE) rastreáveis |

A taxonomia e o catálogo oficial (`docs/README.md`) foram atualizados para refletir a classificação.

## Por que registrar

Após os encerramentos da CAP-05 e da CAP-07, as VALs passaram a produzir OE arquivadas fora das baselines (EV-033…035 e EV-036…038). Faltava um mecanismo oficial de evolução contínua que absorvesse essas OE **sem** reabrir baselines homologadas. A ADR-017 fecha essa lacuna metodológica.

## Para quem

Patrocinador, CTO, Engenheiro e auditores futuros.

## Como medir

A classificação aparece na taxonomia do catálogo; a ADR-017 consta como Aceita v1.0; OE futuras passam a ter destino formal (arquivar / CAP-R / CAP-E / descartar) por deliberação.

---

## Regras centrais instituídas (resumo da ADR-017)

1. CAP-E cria novas capacidades estratégicas; CAP-R consolida as homologadas.  
2. **Nenhuma OE altera uma baseline homologada.**  
3. Toda OE possui rastreabilidade até sua origem (VAL, critério, evidência).  
4. CAP-R segue o mesmo fluxo metodológico: **VIS → REQ → ARQ → IMP → VAL** (gates ADR-006).  
5. A homologação de uma CAP-R gera **nova baseline** e integra a **próxima RELEASE**.  
6. Promoção de OE para CAP-E é excepcional e exige critérios explícitos (ADR-017 §8).

## O que NÃO ocorreu neste ato

* ROADMAP-001, ÉPICOS e CAPs homologadas permanecem inalterados.  
* **Nenhuma CAP-R foi aberta** — abertura exige deliberação própria do CTO.  
* Nenhum código foi modificado.  
* As OE arquivadas (CAP-05 e CAP-07) permanecem em seus arquivos, aguardando classificação futura (ADR-017 §10.2).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO deliberou; Engenheiro (Cursor) registrou |
| Quando | 24/07/2026 |
| Por quê | Institucionalizar o mecanismo oficial de evolução contínua (CAP-R) sem corromper baselines |
| Baseado em quê | Deliberação Final do CTO — ADR-017 APROVADA; precedentes VAL-006/VAL-007 (OE arquivadas) |
| Resultado | ADR-017 Aceita v1.0; taxonomia CAP-E/CAP-R oficial; catálogo e diário atualizados; nenhuma CAP-R aberta |
