# Priorização — três situações simultâneas — JOB-000115

> **Entrega do Job da fila CEO.** Deliberação executiva sem execução técnica.  
> **Data:** 25/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.  
> **Origem:** parecer `parecer-c3-1787695327721-qfe7vx`.  
> **Projeto:** prj-1786308577407-3 (PROJETO TESTE ALFA).

---

## 1. Situações recebidas

| # | Situação | Natureza do risco | Urgência aparente |
|---|----------|-------------------|-------------------|
| **A** | Cliente importante pode cancelar contrato | Receita, relação comercial, reputação | Alta — ameaça de perda iminente (não confirmada) |
| **B** | Sistema principal apresentou falhas | Continuidade operacional, capacidade de servir todos os clientes e processos | Imediata — impacto transversal |
| **C** | Oportunidade de expansão precisa de resposta em 48 horas | Crescimento, posicionamento competitivo | Alta com prazo fixo — janela temporal definida |

---

## 2. Diagnóstico executivo

As três situações são simultâneas mas **não equivalentes em tipo de risco**. Confundir urgência emocional com prioridade estratégica levaria a tratar primeiro o cliente ou a oportunidade enquanto a base operacional continua degradada.

**Situação B (falhas no sistema principal) é fundacional.** Sem sistema estável:
- a capacidade de reter o cliente (A) fica comprometida — falhas podem ser a causa directa ou agravante do risco de cancelamento;
- a resposta credível à oportunidade (C) fica enfraquecida — propostas de expansão assentam em confiança operacional;
- o dano pode **escalar** para outros clientes e processos além do caso imediato.

**Situação A (cliente importante) é o segundo foco prioritário**, a iniciar em paralelo assim que a estabilização de B estiver em curso (ou imediatamente se a causa do risco de cancelamento for independente das falhas). A perda de um cliente importante tem impacto directo e mensurável, mas «pode cancelar» indica ameaça — exige contacto proactivo e plano de retenção, não necessariamente precedência absoluta sobre a infraestrutura que sustenta toda a operação.

**Situação C (expansão em 48 h) tem prazo definido mas depende de capacidade operacional.** 48 horas permitem sequenciamento: estabilizar (B), assegurar retenção mínima (A), e **então** dedicar recursos qualificados à resposta de expansão (C). Adiar C até B estar controlado não significa ignorar o prazo — significa responder com base sólida em vez de comprometer-se sobre fundações instáveis.

---

## 3. Decisão executiva

**PRIORIDADE 1: Falhas no sistema principal (B).**

**Motivo principal:** A continuidade operacional é pré-condição para reter clientes, cumprir contratos existentes e responder credivelmente a oportunidades. Falhas no sistema principal têm impacto transversal, risco de cascata e podem ser causa directa do risco de cancelamento (A). Tratar B primeiro não é negligenciar A ou C — é restaurar a capacidade de actuar sobre ambas.

**Critério dominante:** Priorizar pelo **efeito fundacional e multiplicador** — o que, se não estabilizado, impede ou agrava a resolução das demais situações.

**Sequência recomendada:**

| Ordem | Situação | Acção imediata |
|-------|----------|----------------|
| **1º** | B — Falhas no sistema | Diagnosticar, conter impacto, restaurar serviço mínimo estável; identificar se falhas explicam insatisfação do cliente |
| **2º** | A — Cliente em risco | Contacto proactivo com cliente importante assim que B estiver contido (ou em paralelo se equipas distintas); plano de retenção com prazo e responsável |
| **3º** | C — Expansão 48 h | Preparar e enviar resposta dentro do prazo, após base operacional estável; se necessário, resposta inicial de reconhecimento + proposta detalhada em follow-up dentro das 48 h |

**Risco principal assumido:** Se o cancelamento do cliente (A) for iminente e independente das falhas (B), a sequência B→A pode atrasar retenção crítica. Mitigação: activar contacto comercial em paralelo à estabilização técnica, sem inverter a prioridade de recursos de engenharia/operações.

**Alternativas descartadas:**

- **[Priorizar A (cliente) primeiro]** — Risco de tratar sintoma comercial enquanto a causa operacional (B) persiste; retenção frágil se o sistema continuar a falhar.
- **[Priorizar C (expansão) primeiro]** — O prazo de 48 h cria pressão, mas comprometer-se a expansão com infraestrutura instável expõe a empresa a promessas incumpríveis e dano reputacional duplo.
- **[Tratar as três em igualdade, sem ordem]** — Dispersa recursos escassos; em crise simultânea, ordem explícita evita paralisia e maximiza efeito de cada acção.

**Próximo gesto (deliberação — não executado neste Job):** Activar war-room técnico para B; designar owner comercial para A em paralelo; reservar janela nas 48 h para C após estabilização ou resposta preliminar dentro do prazo.

---

## 4. Limites respeitados

- Sem acção externa
- Sem criação de Jobs adicionais
- Sem alteração de código, Constituição ou Governança CEO

---

## Resultado da fila (Agent)

Decisão registada: **prioridade 1 às falhas no sistema principal (B)**, seguida de retenção do cliente importante (A) e resposta à oportunidade de expansão (C). Estado `result` — verificação formal pendente do CEO/dispatcher.
