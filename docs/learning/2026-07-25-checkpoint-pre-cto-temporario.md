# Checkpoint da Transição Abortada — 25/07/2026

> **Status: Histórico — transição abortada; não é o estado vigente.**
> Tipo: aprendizado / continuidade (sem efeito normativo além do registrado).  
> **Tag Git:** `checkpoint-pre-cto-temporario-2026-07-25`  
> **Branch histórica:** `mandato-cto-temporario`
> Norma vigente: CON-001 v1.2; ADR-018 v1.1 Revogada.
>
> **Correção de registro:** apesar do nome da tag, o commit marcado também contém a documentação que instituiu o mandato. Portanto, a tag registra a **transição**, não um estado documental anterior ao mandato. A revogação posterior na `main` é o estado correto para continuidade.

---

## Finalidade

Registrar o estado técnico da transição para o mandato de CTO temporário, de modo que:

1. seja possível **reverter tecnicamente** o repositório a este ponto;
2. a avaliação do CTO original, ao retornar, tenha um marco auditável;
3. aprendizados úteis da experiência possam ser aproveitados mesmo se o código/docs do mandato forem descartados.

---

## Estado do projeto neste marco

| Item | Estado |
|------|--------|
| Fase I — Fundação metodológica | Encerrada |
| Fase II — Evolução do produto | Em curso |
| MVP (`docs/mvp/`) | Congelado; VAL-005 operacional em curso |
| CAP-05 | Homologada — baseline |
| CAP-07 | Homologada — baseline |
| CAP-08 | Homologada v1.0 — baseline; relatório de encerramento oficial |
| ÉPICO-002 | Aberto; CAP-08 concluída; CAP-02 / CAP-03 **não** abertas |
| ROADMAP-001 | Homologado — não alterar sem deliberação |
| CTO | ChatGPT — papel permanente restabelecido |
| Cursor | Engenheiro; mandato temporário **revogado** |

### Cadeias homologadas (não reabrir sem ciclo formal)

```text
MVP:     VIS-003 → REQ-016…032 → ARQ-008 → IMP-005 → VAL-005 (operacional)
CAP-05:  VIS-004 → REQ-033 → ARQ-009 → IMP-006 → VAL-006
CAP-07:  VIS-005 → REQ-034 → ARQ-010 → IMP-007 → VAL-007
CAP-08:  VIS-006 → REQ-035 → ARQ-011 → IMP-008 → VAL-008
```

### OE no backlog (fora das baselines)

EV-033…040 — arquivadas nas sedes CAP-05/07/08; encaminhamento só via CAP-R (ADR-017) sob deliberação.

---

## Estado após a revogação

O projeto continua na branch `main`, com CON-001 v1.2 e ADR-018 revogada. **Não usar a tag para restaurar a governança**, pois ela contém a versão que instituiu o mandato. Consultar `2026-07-25-revogacao-mandato-cto-temporario.md`.

---

## Aproveitamento da experiência (mesmo após reversão)

Combinado com o Usuário (25/07/2026): se o mandato não der certo, **ainda assim** poderemos aproveitar aprendizados da experiência — desde que registrados como aprendizado/OE e **não** misturados silenciosamente nas baselines homologadas.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Usuário autorizou; Engenheiro (Cursor) registrou o checkpoint |
| Quando | 25/07/2026 |
| Por quê | Criar ponto de retorno seguro antes do mandato de CTO temporário |
| Baseado em quê | Autorização explícita do Usuário; ADR-018; CON-001 Art. 11 |
| Resultado | Transição registrada e posteriormente revogada; tag/branch preservadas somente para auditoria |
