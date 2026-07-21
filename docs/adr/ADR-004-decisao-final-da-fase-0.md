# ADR-004 — Decisão final da Fase 0: aprovações, ajuste de priorização e encerramento

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO (ChatGPT) emitiu a decisão final; Usuário (CEO/Fundador) aprovou |
| Quando | 21/07/2026 |
| Por quê | As entregas de encerramento da Fase 0 (ADR-003) foram concluídas e revisadas; a base documental está completa, consistente e rastreável |
| Baseado em quê | CAP-001 v1.0; CAP-002 v0.1; TEMPLATE-REQ; Índice Documental (docs/README.md); análise de governança do Engenheiro |
| Resultado | **Fase 0 oficialmente encerrada.** Início da Fase 1 — Engenharia de Requisitos |

## Status

Aceito.

## Decisões

### Decisão 1 — CAP-001 v1.0 aprovado

Mantidos a **CAP-12 — Desenvolvimento do Usuário** e o **BCO como mecanismo arquitetural** (não capacidade).

### Decisão 2 — CAP-002 aprovado como documento próprio, com ajuste

O CTO solicitou avaliar mover Gestão do Conhecimento (CAP-04) para a onda Fundação, pois o Aprendizado depende de conhecimento estruturado. **Avaliação do Engenheiro: procedente.** O risco original ("precisa de operação real gerando conhecimento") aplica-se ao *conteúdo*, não à *estrutura*: estruturar o conhecimento desde o início evita retrofit. CAP-04 movida da Onda 3 para a Onda 1; CAP-002 aprovado como v1.0.

### Decisão 3 — Índice Documental aprovado

`docs/README.md` passa a ser o **catálogo oficial da documentação**. Todo novo tipo documental deverá nascer por ADR.

### Decisão 4 — Commits autorizados

Versionamento da base documental da Fase 0 autorizado, em sequência lógica (fundação → CON/VIS → REQ-001 → CAP-001 → CAP-002 → TEMPLATE-REQ → ADRs → Índice/README), evitando um único "pacotão".

### Decisão 5 — Encerramento da Fase 0

Com os ajustes aplicados e os commits realizados, a **Fase 0 está oficialmente encerrada**. A próxima etapa é a **Fase 1 — Engenharia de Requisitos**, seguindo o CAP-002 (ondas) e o TEMPLATE-REQ.

## Rastreabilidade

- Norma superior: CON-001 v1.0; VIS-001 v1.0.
- Origem: ADR-003 (entregas de encerramento); análise de governança do Engenheiro (índice documental, commits).
- Gera: baseline versionada da Fase 0; abertura da Fase 1 (grupos de REQ-xxx da Onda 1 — CAP-01, CAP-04, CAP-05, CAP-07, CAP-10).
