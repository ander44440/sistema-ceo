# Continuidade de Estado (Módulo F)

> **Módulo F (ARQ-008).** REQ-026, REQ-029.  
> **Status: Operacional — Gate E2 Homologado (CTO, 23/07/2026).**

---

## Enunciado operacional

O CEO MVP v0.1 **preserva entre sessões e dias** o estado do Dia de Trabalho do contexto MG2 necessário à reabertura — sem exigir que o patrocinador reconstrua de memória o foco e o próximo passo já confirmados, e sem reexplicar o contexto do zero.

O mecanismo canônico de leitura/escrita é o artefato [`estado-do-dia.md`](estado-do-dia.md).

---

## Campos preservados (ARQ-008 F / REQ-026)

| Campo | Obrigatoriedade | Nota |
|-------|-----------------|------|
| Contexto ativo | Sempre | Fixo = MG2 (REQ-017) |
| Foco vigente | Quando confirmado | Uma frase; ausência explícita se vazio |
| Onde parou | Quando houver | Texto curto do ponto de parada |
| Próximo passo confirmado | Quando confirmado | Um por vez; ausência explícita se vazio |
| Atenções pertinentes | 0–3 | Ou indicação “nada pendente” |
| Vínculos a registros | Opcional | Referências a decisão/conhecimento do fluxo (E5 materializa o registro pleno) |
| Status do dia | Sempre | `aberto` \| `fechado` \| `ausente` (primeiro uso) |
| Última atualização | Sempre | Data/hora do último fechamento ou ajuste |

---

## Operações do mecanismo

| Operação | Efeito |
|----------|--------|
| **Ler** | Reapresenta o estado preservado na reabertura (sessão/dia seguinte) |
| **Escrever (fecho simulado / fecho)** | Persiste foco, onde parou, próximo passo, atenções e vínculos confirmados |
| **Declarar ausência** | Estado vazio explícito — primeiro uso ou sem confirmação prévia (transparência) |

---

## Observável (critérios REQ-026 e REQ-029)

| Critério | Estado E2 |
|----------|-----------|
| Após fecho simulado, estado reapresentável sem reentrada do foco/próximo passo | **Sim** — ver `estado-do-dia.md` + `continuidade.html` |
| Continuidade amarrada ao contexto MG2 | **Sim** — campo contexto fixo |
| Reabertura sem reexplicação narrativa completa do MG2 | **Sim** — estado carrega o necessário; nota REQ-029 |
| Ausência explícita quando não há estado | **Sim** — status `ausente` / campos “— (ausente)” |

---

## Fora do módulo F (E2)

* Painel do Dia completo (módulo A — E3)
* Atos Abrir/Foco/Próximo/Fechar com confirmação interativa (módulo C — E4)
* Registro pleno de decisão/conhecimento (módulos D/E — E5)
* Backup técnico, replicação, escolha de mídia de infraestrutura
* Continuidade multi-projeto
