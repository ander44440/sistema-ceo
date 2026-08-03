# REQ-066 — Tempo de resposta proporcional à complexidade

> **Status:** Em análise v0.1 — 03/08/2026  
> **Versão:** 0.1  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O Sistema CEO deverá **dimensionar o esforço de resposta** (caminho local, uma chamada LLM, ou pipeline deliberativo completo) de forma **proporcional à complexidade da decisão**, de modo que pedidos simples sejam rápidos e só decisões complexas invoquem o MRE completo.

## Tipo

Não funcional (latência / experiência) com efeito funcional no roteamento; detalhado sob CAP-07.

## Justificativa

CON-001 Art. 9º.1 (respeito absoluto ao tempo do utilizador); ADR-015 (uso diário MG2); evidência pós-IMP-065: clarificações locais são instantâneas, enquanto deliberação C2/MRE (vários estágios LLM) demora ~1 min mesmo para retomas simples. A regra *«tempo ∝ complexidade»* evita pagar o custo do MRE quando a decisão não o exige.

## Objetivo

1. Classificar a complexidade da decisão em níveis explícitos (instantâneo / leve / moderado / completa).  
2. Encaminhar cada nível para um caminho com custo proporcional.  
3. Preservar MRE completo para decisões complexas.  
4. Não alterar limiar 0,55, C1–C4, Gate, Motor, NCS nem criação de Jobs.  
5. Classificador permanece único decisor de classe.

## Níveis (V1)

| Nível | Exemplos | Caminho |
|-------|----------|---------|
| **instantaneo** | Saudação, data/hora, clarificação local | Sem LLM |
| **leve** | Conhecimento geral, C4 operacional | 1 LLM; `max_tokens` baixo |
| **moderado** | Retoma («onde paramos»), follow-up curto de projecto | 1 LLM deliberativo; **sem** pipeline MRE 0–7 |
| **completa** | Priorizar, decidir entre opções, trade-offs, planeamento | MRE completo (pipeline actual) |

## Critérios de aceitação

1. Pedidos **instantaneo** / clarificação não chamam `/api/ceo/deliberar`.  
2. Pedidos **leve** (ex.: capital, aritmética) usam no máximo **1** chamada LLM e não o MRE.  
3. Pedidos **moderado** (ex.: «Voltando ao MG2, onde paramos?») **não** executam o pipeline MRE 0–7.  
4. Pedidos **completa** (ex.: «Como devemos priorizar outdoor vs pagamento?») mantêm o MRE.  
5. Metadado `complexidadeDecisao` auditável na resposta.  
6. Regressão Classificador / Continuidade / Consciência / Motor sem regressão funcional dos CA existentes.

## Fora do escopo

* Reescrever estágios internos do MRE.  
* Parallelizar estágios do MRE.  
* Alterar prompts Constitucionais / NCS.  
* SLAs numéricos rígidos (ms) — a proporcionalidade é de **caminho**, não de cronómetro de rede.  
* Novas classes C1–C4.

## Dependências

REQ-057 / ARQ-018 (Classificador); IMP-065 (VCA); MRE / ADR-019 (rota deliberativa).

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Falso «moderado» em decisão difícil | Marcadores L3 explícitos; default completa se dúvida deliberativa |
| Perder qualidade em retomas | Prompt deliberativo único ainda usa governança LLM |
| Bypass do MRE indevido | Só níveis ≤ moderado; Jobs/C3 intactos |

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma | CON-001 Art. 9º.1; ADR-015 |
| Origem | Feedback patrocinador 03/08/2026 (latência ~1 min) |
| Decisões derivadas | ARQ-027; IMP-066 |
| Testes | CT-CX01… |

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação + implementação autorizada |
