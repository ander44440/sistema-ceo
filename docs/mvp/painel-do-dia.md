# Superfície do Dia — Painel do Dia (Módulo A)

> **Módulo A (ARQ-008).** REQ-016, REQ-021; contribui a REQ-028, REQ-032.  
> **Status: Operacional — Gate E3 Homologado (CTO, 23/07/2026).**  
> Identidade visual: consolidação iniciada nesta E3 (recomendação CTO pós-E1).

---

## Enunciado operacional

A **primeira e única composição de entrada** do CEO MVP v0.1 é o **Painel do Dia**.

Arquivo de superfície: [`index.html`](index.html) (abrir o MVP = abrir o Painel).

O painel **compõe** estado fornecido pelo módulo F (`estado-do-dia.md`) e contexto do módulo B. **Não** persiste estado (ARQ-008 A — Não faz).

---

## Sete elementos obrigatórios (VIS-003 §4 / REQ-016)

| # | Elemento | Fonte nesta E3 |
|---|----------|----------------|
| 1 | Marca / posto | “CEO — Posto de comando” |
| 2 | Contexto ativo | MG2 (REQ-017) |
| 3 | Foco de hoje | Lido de F |
| 4 | Onde paramos | Lido de F |
| 5 | Próximo passo | Lido de F (um) |
| 6 | Atenção | 0–3 itens ou “nada pendente” (REQ-021) |
| 7 | Ações rápidas | Registrar decisão · Registrar conhecimento · Fechar o dia |

Pergunta respondida pela composição:

> **“O que eu faço agora no MG2 — e o que o CEO já guarda por mim?”**

---

## Exclusões (REQ-016)

O Painel **não** apresenta:

* listas longas  
* múltiplos projetos  
* gráficos / dashboards  
* configurações de agentes  
* filas genéricas de tarefas  
* feed de atividade  

---

## Ações rápidas (exposição E3)

As três ações estão **expostas** na superfície. O comportamento detalhado (ciclo, confirmação, gravação) pertence a **E4** (módulo C) e **E5** (módulos D/E) — não iniciado nesta etapa.

---

## Observável (critérios E3)

| Critério | Estado E3 |
|----------|-----------|
| Painel é a primeira superfície | **Sim** — `index.html` |
| Sete elementos presentes | **Sim** — `index.html` / checklist |
| Atenção ≤3 ou “nada pendente” | **Sim** — estado vigente: 1 item |
| Exclusões REQ-016 respeitadas | **Sim** |
| Sem persistir / decidir / executar MG2 | **Sim** — só composição |

---

## Fora do módulo A (E3)

* Atos Abrir / Foco / Próximo / Fechar / Confirmar (módulo C — E4)  
* Registro pleno decisão/conhecimento/consulta (D/E — E5)  
* Persistência de estado (módulo F já homologado)
