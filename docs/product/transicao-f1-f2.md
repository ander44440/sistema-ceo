# Transição F1 → F2 — Artefato ao CTO (IPR-001)

> **Status: Homologado — Gate de Transição F1→F2 APROVADO por autorização do Gate F2-01 (CTO, 26/07/2026).**  
> Pré-condição: Gate de Encerramento da F1 **homologado**.  
> Natureza: artefato de **transição** — F2 aberta na capacidade F2-01 (Arquitetura Conceitual da Experiência).  
> Próximo artefato: [`F2-01-arquitetura-conceitual-experiencia.md`](F2-01-arquitetura-conceitual-experiencia.md) — em revisão.  
> **Proibições:** sem implementação; sem alteração das 24 fichas; sem commit até homologação documental.

---

## 1. O que é / Por que / Para quem / Sucesso

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Documento de transição entre o Benchmark Estratégico (F1) e as Fundações Visuais (F2). |
| **Por que existe?** | Garantir que a F2, quando autorizada, parta de diretrizes arquiteturais já deliberadas — e não reabra coleta de mercado nem reinventação ad hoc. |
| **Para quem?** | CTO (Gate de Transição); Engenheiro (insumo obrigatório da F2); Usuário (transparência). |
| **Sucesso?** | CTO homologa: (a) F1 oficialmente concluída; (b) DA-001…003 vigentes para F2+; (c) HP-004/005/006 e lacunas L1/L2/L4/L5/L6 com status explícito; (d) autorização ou bloqueio da abertura da F2. |

---

## 2. Estado herdado da F1 (oficial)

| Item | Estado |
|------|--------|
| Fase F1 | ✅ **Concluída** |
| Corpus | **24** referências homologadas |
| Coleta | **Encerrada** |
| RC-03 | Antimodelo oficial (ChatGPT genérico) |
| L3 | Conceitualmente coberta |
| L1, L2, L4, L5, L6 | Decisões internas de arquitetura/governança |
| Artefato de encerramento | [`benchmark/encerramento-f1.md`](benchmark/encerramento-f1.md) — homologado |

---

## 3. Diretrizes arquiteturais vigentes (hipóteses promovidas)

Documento canônico: [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md).

| ID | Ex-HP | Diretriz | Força |
|----|-------|----------|-------|
| **DA-001** | HP-001 | Objetivo antes da Ferramenta | **Normativa** — vigente |
| **DA-002** | HP-002 | O contexto sobrevive às tarefas | **Normativa** — vigente |
| **DA-003** | HP-003 | Navegação por níveis de abstração | **Normativa** — vigente |

### Implicações obrigatórias para a F2 (quando aberta)

A F2 especifica cores, tipografia, grid e ícones — **sem código**. Essa especificação deve:

1. **Servir ao objetivo executivo** (DA-001 / P6): hierarquia tipográfica e layout conduzem ao objetivo da superfície, não a um seletor de ferramentas.  
2. **Preservar leitura de contexto persistente** (DA-002): tratamentos visuais de “contexto ativo / memória / continuidade” não podem parecer descartáveis como um chat efêmero.  
3. **Permitir níveis de abstração** (DA-003): escala tipográfica e densidade devem acomodar visão alta (empresa/objetivos) e visão baixa (execução/evidências) sem quebrar o COA.  
4. **Respeitar P1–P6** e CON-001: elegância sóbria (P4), um objetivo por superfície (P6), informação→decisão (P2).

A F2 **não** resolve L1–L6 por si; apenas não pode contradizê-las nem às DA vigentes.

---

## 4. Hipóteses que permanecem em observação

| ID | Status | Papel na F2 | Gatilho típico de reavaliação |
|----|--------|-------------|-------------------------------|
| **HP-004** | Em observação | *Consideração*: atenção antes do detalhe na hierarquia visual | Nova deliberação CTO ou anexação a P2 |
| **HP-005** | Em observação | *Consideração*: progresso ≠ % de tarefas; evitar metáforas de “dashboard de conclusão” | Decisão interna **L4** + ADR/REQ |
| **HP-006** | **Em observação avançada** | *Consideração forte*: rastro/evidência visualmente distinguível de ornamento | Distinguir justificativa de decisão vs. ciclo L2; possível promoção parcial |

**Regra:** HP em observação **informam** escolhas de F2, mas **não** geram requisito vinculante até promoção.

---

## 5. Lacunas internas — handoff para arquitetura/governança

| ID | Decisão interna | Relação com F2 |
|----|-----------------|----------------|
| L1 Home / COA | Forma do posto de comando | F2 prepara vocabulário visual; forma do COA → ADR/REQ (não F2 sozinha) |
| L2 Aprendizado maturável | Ciclo Observação→Aprovação | Fora de F2; ADR de conhecimento |
| L3 Orquestração Multi-IA | ✅ Coberta | Infra sob DA-001; sem UI de escolha de modelo |
| L4 Loop decisão→efeito | Desbloqueia HP-005 | Fora de F2 |
| L5 Identidade / tom | Tom de comando do fundador | **F2 + Branding** — input direto |
| L6 Multi-papel Human+AI | Papéis na superfície | Fora de F2; ADR de colaboração |

---

## 6. O que a F2 é / não é

| A F2 **é** | A F2 **não é** |
|------------|----------------|
| Especificação de fundações visuais (cores, tipografia, grid, ícones) | Implementação de código, tokens em repo de app, componentes |
| Consumidora de P1–P6 + DA-001…003 | Reabertura do benchmark F1 |
| Insumo para F3/F4 e ciclos ADR-006 futuros | Substituta de REQ/ADR |
| Momento de tratar L5 (tom) em nível de especificação | Momento de fechar L1/L2/L4/L6 |

Escopo detalhado pré-existente: [`design-system-roadmap.md`](design-system-roadmap.md) §1–4 (Cores, Tipografia, Grid, Ícones).

---

## 7. Critérios de aceite do Gate de Transição

| # | Critério | Estado proposto |
|---|----------|-----------------|
| T1 | F1 registrada como concluída no IPR-001 | ✅ Neste pacote documental |
| T2 | DA-001…003 publicadas e vinculadas aos princípios | ✅ [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md) |
| T3 | HP-004/005/006 com status explícito | ✅ |
| T4 | Lacunas L1/L2/L4/L5/L6 como decisões internas | ✅ |
| T5 | Nenhuma ficha homologada alterada | ✅ |
| T6 | Sem commit até homologação deste pacote | ✅ (aguardando) |
| T7 | CTO autoriza ou bloqueia **abertura da F2** | ⏳ Deliberação |

---

## 8. Pedido formal ao CTO

1. Homologar este artefato de transição.  
2. Confirmar DA-001…003 como **diretrizes arquiteturais vigentes** para toda a sequência F2+.  
3. Confirmar status de HP-004 (observação), HP-005 (observação) e HP-006 (observação avançada).  
4. **Deliberar a abertura da F2** (Fundações visuais) — ou indicar pendências bloqueantes.

**Engenheiro não inicia a F2 até autorização explícita. Sem commit.**

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate de Encerramento F1 homologado; preparar Gate de Transição F1→F2 |
| Baseado em quê | Deliberação HP (001–003 promovidas; 004/005 observação; 006 observação avançada); corpus 24; DA vigentes |
| Resultado | Artefato v0.1 submetido; F2 não iniciada; sem commit |
