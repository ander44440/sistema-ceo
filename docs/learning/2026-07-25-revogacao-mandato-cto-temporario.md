# Revogação do Mandato de CTO Temporário — 25/07/2026

> **Status: Marco institucional.**  
> Tipo: aprendizado / memória organizacional.  
> Norma: CON-001 v1.2; ADR-018 v1.1 Revogada.

---

## O que ocorreu

O Usuário decidiu **abortar a mudança de papéis e continuar como antes**. O mandato de CTO temporário atribuído ao Cursor foi revogado na mesma manhã de sua instituição.

Nenhuma CAP, VIS, REQ, ARQ, IMP, VAL, baseline ou decisão técnica foi aberta sob a autoridade do mandato. A única interação operacional posterior foi a abertura do CEO MVP para uso pelo patrocinador.

## Estado restabelecido

| Papel | Responsável |
|-------|-------------|
| Usuário / Patrocinador | Visão, prioridades, aprovação e validação |
| CTO | ChatGPT — requisitos, arquitetura, planejamento, revisões e QA |
| Engenheiro | Cursor — implementação, testes, builds e commits; sem decisão arquitetural própria |

## Preservação

* MVP, CAP-05, CAP-07 e CAP-08 permanecem nas mesmas baselines.
* ÉPICO-002 permanece aberto; CAP-02 e CAP-03 não foram abertas.
* A branch `mandato-cto-temporario` e a tag `checkpoint-pre-cto-temporario-2026-07-25` permanecem apenas como histórico técnico.
* O projeto continua na branch `main`.

## Aprendizado

A tentativa confirmou a importância de separar decisão arquitetural e implementação. Também evidenciou que um checkpoint precisa anteceder — e não compartilhar o mesmo commit com — a mudança de governança. A tag criada registra a transição, mas não deve ser tratada como estado anterior à documentação do mandato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Usuário decidiu; Cursor registrou |
| Quando | 25/07/2026 |
| Por quê | Abortar a mudança e continuar segundo a governança anterior |
| Baseado em quê | Orientação explícita do Usuário |
| Resultado | Mandato revogado; papéis do CON-001 Art. 6º restabelecidos; nenhum trabalho técnico afetado |
