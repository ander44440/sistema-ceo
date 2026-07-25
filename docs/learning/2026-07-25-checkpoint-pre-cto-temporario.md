# Checkpoint — Pré Mandato CTO Temporário (25/07/2026)

> **Status: Marco técnico e organizacional — ponto de retorno.**  
> Tipo: aprendizado / continuidade (sem efeito normativo além do registrado).  
> **Tag Git:** `checkpoint-pre-cto-temporario-2026-07-25`  
> **Branch de trabalho do mandato:** `mandato-cto-temporario`  
> Norma: CON-001 Art. 8º e Art. 11; ADR-018.

---

## Finalidade

Preservar o estado do projeto **antes** do início do mandato de CTO temporário, de modo que:

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
| CTO titular (ChatGPT) | Ausente temporariamente |
| CTO temporário (Cursor) | Autorizado pelo Usuário (ADR-018 / CON-001 disposição transitória) |

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

## Como reverter (procedimento técnico)

Se o mandato perder a direção e o Usuário decidir retornar:

```powershell
git switch main
git reset --hard checkpoint-pre-cto-temporario-2026-07-25
# opcional: descartar ou arquivar a branch do mandato
# git branch -D mandato-cto-temporario
```

**Atenção:** isso restaura arquivos e histórico do repositório neste ponto. Não desfaz automaticamente decisões externas, dados de uso ou tempo gasto. Aprendizados úteis devem ser **extraídos deliberadamente** (diário / OE / nota) antes ou depois da reversão.

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
| Resultado | Estado inventariado; tag e branch definidos; mandato pode iniciar |
