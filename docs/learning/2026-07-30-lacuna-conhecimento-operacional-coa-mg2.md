# Lacuna — Conhecimento operacional do COA MG2 (por que é difícil trabalhar com o CEO)

> **O que é?** Memória organizacional + rascunho de briefing mínimo: o CEO declara o COA MG2, mas **não carrega lastro operacional** do projeto nas deliberações.  
> **Por que existe?** O Patrocinador confirmou (30/07/2026) que esta lacuna torna o uso diário difícil — deliberações genéricas, jobs fracos, sensação de “CEO que não sabe do MG2”.  
> **Para quem?** Patrocinador (sente a dor; autoriza ciclo); CTO (VIS/REQ/ARQ se abrir Gate); Engenheiro (não implementa ligação MRE↔briefing até mandato).  
> **Sucesso:** Fica explícito que (1) o problema **não** é só o Speaker/NCS; (2) falta **patrimônio operacional do COA**; (3) há um **conteúdo mínimo** proposto para o briefing.  
> **Status:** Insumo — **sem** VIS/REQ/ARQ/IMP abertos; **sem** alteração de código do MRE.  
> **Data:** 30/07/2026 · **Autor do registo:** Engenheiro (Cursor), a pedido do Patrocinador

---

## 1. Diagnóstico (em linguagem direta)

O CEO sabe que o contexto ativo **se chama** MG2 (`docs/mvp/contexto-mg2.md`, CAP-03 / COA).  
O CEO **não sabe**, de forma utilizável na deliberação:

- o que o MG2 é tecnicamente agora;
- o que está a doer (ex.: travamentos / render);
- o que já foi decidido ou entregue esta semana;
- qual é o próximo passo com lastro;
- o que **não** pedir à oficina (Cursor) porque falta dado ou Gate.

Resultado: o MRE delibera **como chat genérico com formalismo executivo** — e o Patrocinador sente que “é difícil trabalhar com ele”.

Isto **dificulta** deliberação, priorização (ADR-015) e qualidade dos Jobs da fila.

---

## 2. Evidências recentes (mesma sessão / mesma data)

| Sinal | Leitura |
|-------|---------|
| Jobs MRE tipo “contratar especialista Scrum/Kanban”, margem sem dados, skills mapping sem REQ | Deliberação sem mapa do projeto |
| JOB-000010 (outdoors) funcionou melhor | Pedido **explícito e técnico** do Patrocinador, não inferência do CEO |
| Observação parecer consultivo vs ação | Sintoma paralelo: sem lastro, o motor “faz alguma coisa operacional” |
| `contexto-mg2.md` | Declara identidade do COA; **não** é briefing operacional |
| CAP-04 (conhecimento) | Requisitos/arquitetura existem; **alimentação viva** do MRE ainda não é o dia a dia |

---

## 3. O que **não** é a solução

- Importar o repositório / build do MG2 para dentro do CEO (REQ-030 / fronteira).
- Fazer o CEO “programar o jogo”.
- Mais prompts genéricos sem fatos curados do COA.
- Tratar isto só como bug do Speaker ou da NCS.

---

## 4. O que **é** a solução (direção — para Gate do CTO)

**Briefing operacional do COA MG2** — artefato curto, curado, que o MRE (e a conversa) leem **antes** de deliberar.

Fronteira correta (ADR-015):

| Pertence ao CEO (COA) | Permanece na oficina (MG2 / Cursor) |
|------------------------|--------------------------------------|
| Objetivos e foco atuais | Código, Vite, meshes, commits do jogo |
| Estado / riscos / decisões | Implementação e debug técnico |
| Próximo passo governado | Execução na fila / IDE |
| O que já foi validado pelo Patrocinador | Detalhe de ficheiros e PRs |

Começa **documental/curado**; depois pode ligar a recuperação (REQ-005) — **só após** VIS→REQ→ARQ se o CTO abrir o ciclo.

---

## 5. Conteúdo mínimo do briefing (proposta)

Campos que, se preenchidos e lidos pelo MRE, já mudam a qualidade da deliberação:

| # | Campo | Pergunta que responde | Exemplo (rascunho — validar com Patrocinador) |
|---|--------|------------------------|-----------------------------------------------|
| 1 | Identidade | O que é este COA? | Motoboy Game 2 — protótipo 3D WorldLab2 (Bombinhas) |
| 2 | Objetivo atual | O que importa **esta semana**? | Uso jogável estável + cidade crível; menos hitch |
| 3 | Estado técnico (1 ecrã) | Onde estamos? | WorldLab2 na raiz `/` e `/mg2`; cena grande monolítica; Sprint 1 perf (raio ~140 m) feito 30/07 |
| 4 | Dores ativas | O que dói agora? | Travamentos / carga; CEO sem lastro MG2; outdoors laterais feitos |
| 5 | Decisões recentes | O que já foi decidido? | Outdoors nas laterais + piscantes; perf = update por distância primeiro, LOD/chunks depois |
| 6 | Próximo passo | Qual a única aposta agora? | Validar Sprint 1 com o Patrocinador; se ok → LOD (Sprint 2) |
| 7 | Fora de escopo agora | O que **não** deliberar? | Pagamentos, multiplayer, importar engine do MG2 para o CEO |
| 8 | Fontes / caminhos | Onde está a verdade? | Repo jogo: `E:\anderson\Projoto motoboy game`; CEO: este repositório; fila: `executive/queue/` |
| 9 | Critério ADR-015 | Isto aproxima uso diário? | Sim se reduzir fricção CEO↔oficina e hitch do protótipo |

**Regra de ouro:** se o campo estiver vazio, o CEO deve **declarar ignorância** e perguntar o mínimo — não inventar Job.

---

## 6. Rascunho preenchível (copiar para curadoria)

```text
COA: Motoboy Game 2 (MG2)
Atualizado em: ____-__-__
Atualizado por: Patrocinador / CTO / Engenheiro (curadoria)

Objetivo desta semana:
-

Estado (3 bullets):
-
-
-

Dores ativas:
-

Decisões recentes (data + o quê):
-

Próximo passo único:
-

Proibido / fora de escopo agora:
-

Notas para deliberação (o que o MRE NÃO deve assumir):
-
```

---

## 7. Deliberação do CTO (recebida 30/07/2026)

**Opção C aprovada.** Ver [`2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md`](./2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md).

- **Agora:** Briefing Curado — [`../mvp/briefing-operacional-mg2.md`](../mvp/briefing-operacional-mg2.md) + espelho em `briefingsProjeto.js`.  
- **Gate:** **ENCERRADO** — [`2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md`](./2026-07-30-parecer-final-cto-gate-briefing-mg2-encerrado.md).  
- **Depois:** Opção B (VIS→REQ→ARQ) só com evidências de uso.  
- **Proibido neste eixo:** alterar MRE/Speaker; alterações adicionais além de curadoria factual do briefing.

---

## 8. Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (diagnóstico de uso); Engenheiro (registo e rascunho) |
| Quando | 30/07/2026 |
| Por quê | Uso diário difícil: CEO delibera sem lastro operacional do MG2 |
| Baseado em quê | ADR-015; VIS-003/004; CAP-03 (COA); CAP-04 (ainda não alimenta MRE no dia a dia); sessão de jobs + observação consultivo vs ação |
| Resultado | Lacuna documentada; CTO aprovou Opção C; Briefing Curado v1.0 publicado |

---

## Relacionados

- [`2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md`](./2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md)  
- [`2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md`](./2026-07-30-comunicado-cto-lacuna-conhecimento-coa-mg2.md)  
- [`2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md`](./2026-07-30-deliberacao-cto-opcao-c-briefing-curado-mg2.md)  
- [`../mvp/briefing-operacional-mg2.md`](../mvp/briefing-operacional-mg2.md)  
- [`../mvp/contexto-mg2.md`](../mvp/contexto-mg2.md)  
- [`../adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md`](../adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md)
