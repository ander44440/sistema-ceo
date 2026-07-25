# Estado do Dia de Trabalho

> **Mecanismo canônico de continuidade (módulo F / ARQ-008).**  
> Leitura e escrita do estado preservado entre sessões/dias.  
> Contexto: **MG2** (REQ-017). Norma: REQ-026, REQ-029.  
> **E4:** Ciclo do Dia opera sobre este estado (`index.html`); consolidação do fecho só após REQ-027.

---

## Estado vigente (após ciclo E4 — fecho confirmado — 23/07/2026)

| Campo | Valor |
|-------|-------|
| Contexto ativo | Motoboy Game 2 (MG2) |
| Status do dia | `fechado` |
| Foco vigente | Fechar o fluxo de corrida até o payout do motoboy |
| Onde parou | Revisado o cálculo de taxa no cenário de cancelamento |
| Próximo passo confirmado | Decidir regra de taxa em corrida cancelada |
| Atenções pertinentes | (1) Decisão: zerar ou ratear a taxa no cancelamento |
| Vínculos a registros | DEC-MVP-001; KNW-DIA-001 (E5) |
| Última atualização | 23/07/2026 — fecho confirmado E4 |
| Reexplicação do MG2 exigida? | **Não** — estado suficiente para retomar (REQ-029) |

---

## Contrato de ausência (primeiro uso / sem confirmação)

Quando não houver estado confirmado, o mecanismo declara explicitamente:

| Campo | Valor de ausência |
|-------|-------------------|
| Status do dia | `ausente` |
| Foco vigente | — (ausente) |
| Onde parou | — (ausente) |
| Próximo passo confirmado | — (ausente) |
| Atenções pertinentes | nada pendente |
| Reexplicação | Somente se o patrocinador optar por alterar o estado ou se status = `ausente` |

---

## Trilha E4 — atos confirmados

| Passo | Ato | Confirmação |
|-------|-----|-------------|
| 1 | Abrir o dia | Implícito ao ato (reapresenta estado) |
| 2 | Ajuste de foco / próximo (se houver) | Só após Confirmar (REQ-027) |
| 3 | Fechar o dia | Consolida estado acima após Confirmar |

Evidência visual: [`e4-ciclo-screenshot.png`](e4-ciclo-screenshot.png) · superfície [`index.html`](index.html).

---

## Regras de escrita

* Um próximo passo por vez.
* Atenções: no máximo 3 itens, ou “nada pendente”.
* Contexto permanece MG2.
* Não embute execução do MG2 (REQ-030).
* Alterações de autoridade exigem confirmação (REQ-027) — módulo C / E4.
