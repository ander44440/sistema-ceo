# CAP-002 — Estratégia de Priorização das Capacidades

> **Status: APROVADA.**
> Versão 1.0 — 21/07/2026, aprovada na decisão final da Fase 0 (ADR-004), com CAP-04 movida para a onda Fundação.
> Norma superior: CON-001 v1.0; VIS-001 v1.0. Origem: ADR-003 (Decisão 5, item 3). Depende de: CAP-001 v1.0.

---

## Padrão documental (ADR-002, Decisão 1)

**O que é?** A estratégia que define a ordem em que as doze capacidades do CAP-001 deverão evoluir ao longo do projeto, organizada em ondas com critérios explícitos.

**Por que existe?** Para que a engenharia de requisitos comece pelas capacidades que habilitam as demais, maximizando o progresso por unidade de tempo (CON-001, Art. 3º) e evitando construir sobre fundações inexistentes.

**Para quem existe?** Para o Usuário, a quem cabe a decisão final de prioridade (CON-001, Art. 6º); para o CTO, que planeja os grupos de requisitos; e para os agentes, que precisam saber onde concentrar esforço.

**Como seu sucesso será medido?** Quando cada grupo de requisitos iniciado corresponder à onda vigente, e nenhuma capacidade de onda posterior exigir retrabalho por falta de uma capacidade de onda anterior.

---

## Nota de governança

Prioridade é decisão do Usuário (CON-001, Art. 6º); esta estratégia foi aprovada na decisão final da Fase 0 (ADR-004). A priorização vale para a **ordem de detalhamento dos requisitos e evolução**, não como sequência rígida de implementação — capacidades são transversais e evoluem continuamente.

> **Emenda de priorização operacional (ADR-015, 23/07/2026):** sem alterar as ondas abaixo, aplica-se o filtro oficial — *"Esta entrega aproxima o usuário de utilizar o CEO diariamente no desenvolvimento do MG2?"* — para candidatar alta prioridade ou postergar (salvo infraestrutura indispensável). O rigor REQ/ARQ/IMP/VAL permanece. Ver [`ADR-015`](adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md).

---

## Critérios de priorização propostos

1. **Dependência estrutural** — capacidades de que as demais dependem vêm primeiro.
2. **Risco de governança** — o que protege a integridade do sistema (regras, registro, limites) precede o que amplia seu alcance.
3. **Valor por unidade de tempo** — priorizar o que mais acelera o progresso do usuário (CON-001, Art. 3º).
4. **Maturidade das definições** — capacidades já sustentadas por decisões registradas (ex.: REQ-001 em CAP-01) estão prontas para detalhamento antes das que ainda dependem de conceitos candidatos (ex.: BCO em CAP-06).

## Ondas propostas

### Onda 1 — Fundação (governar, registrar, estruturar conhecimento, comunicar)

| Capacidade | Justificativa |
|------------|---------------|
| CAP-01 Governança | Toda ação de qualquer agente depende das regras existirem e chegarem a ele; REQ-001 já pertence a esta capacidade. |
| CAP-04 Gestão do Conhecimento | O Aprendizado (CAP-06) depende de conhecimento estruturado: a estrutura de organização do conhecimento é fundacional, ainda que o conteúdo cresça com a operação (ajuste do CTO, ADR-004). |
| CAP-05 Memória Organizacional | Todas as demais capacidades geram decisões que precisam ser registradas desde o primeiro dia. |
| CAP-07 Comunicação | É a interface permanente com o usuário; sem ela não há aprovação, validação nem respeito ao tempo do usuário. |
| CAP-10 Segurança | Os limites e aprovações precisam existir antes de agentes começarem a agir em nome do CEO. |

### Onda 2 — Operação (coordenar e executar)

| Capacidade | Justificativa |
|------------|---------------|
| CAP-02 Gestão de Agentes | O núcleo da identidade estratégica (ADR-002 D2) — depende de regras (CAP-01) e limites (CAP-10) já definidos. |
| CAP-08 Planejamento | Transforma prioridades em trabalho distribuível; alimenta a gestão de agentes e projetos. |
| CAP-03 Gestão de Projetos | Conduz o fluxo obrigatório de ponta a ponta usando planejamento e agentes. |
| CAP-11 Integrações | Conecta os agentes e ferramentas que as capacidades da onda operam. |
| CAP-09 Observabilidade | Dá visibilidade à operação; ganha valor pleno quando há operação para observar. |

### Onda 3 — Evolução (acumular e desenvolver)

| Capacidade | Justificativa |
|------------|---------------|
| CAP-06 Aprendizado | Depende do BCO (conceito candidato ainda não decidido), de interações reais para observar competências e do conhecimento estruturado (CAP-04, Onda 1). |
| CAP-12 Desenvolvimento do Usuário | O ensino estruturado se apoia em decisões, memória e operação existentes — embora a explicação de decisões já ocorra desde a Fase 0 como prática. |

## Riscos da proposta

* **Rigidez indevida:** tratar as ondas como fases estanques contrariaria a natureza transversal das capacidades. Mitigação: as ondas ordenam o detalhamento de requisitos, não proíbem evolução paralela.
* **Adiamento do pilar Aprendizado:** as capacidades do pilar Aprendizado concentram-se na Onda 3. Mitigação: CAP-07 (Onda 1) já fortalece Aprendizado, e a prática educacional (CAP-12) continua ativa desde já, ainda que sem requisitos formais.

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0 (Art. 3º, 6º); VIS-001 v1.0 |
| Origem | ADR-003 (Decisão 5, item 3); CAP-001 v1.0 |
| Gera | Ordem dos grupos de REQ-xxx (após aprovação do Usuário) |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Proposta inicial: 4 critérios e 3 ondas | ADR-003, Decisão 5 | Aprovada com um ajuste |
| 1.0 | 21/07/2026 | CTO propôs; Engenheiro avaliou e concordou; Usuário aprovou | CAP-04 movida da Onda 3 para a Onda 1 (Fundação) | Aprendizado depende de conhecimento estruturado; a estrutura é fundacional, o conteúdo cresce com a operação | **Aprovada — decisão final da Fase 0 (ADR-004)** |
