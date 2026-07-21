# ADR-012 — Criação do tipo documental IMP (Plano de Implementação)

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO nomeou o tipo ao autorizar o IMP-001; Engenheiro registrou a criação conforme a regra do catálogo; CTO ratificou em 21/07/2026 |
| Quando | 21/07/2026 |
| Por quê | A deliberação do CTO autorizou o "IMP-001 — Plano de Implementação do Mecanismo de Conceitos Organizacionais"; o tipo IMP não existia no catálogo oficial, e novo tipo documental deve nascer por ADR, nunca ad hoc |
| Baseado em quê | Regra do catálogo (`docs/README.md`); precedentes ADR-005 (tipo ANL) e ADR-010 (tipo ARQ); ADR-006 (etapa Implementação do fluxo oficial) |
| Resultado | Tipo IMP criado; IMP-001 produzido como primeiro exemplar e aprovado em v1.0 |

## Status

Aceito — v1.0, ratificado pelo CTO em 21/07/2026 ("mantém a coerência da governança documental estabelecida anteriormente para ANL e ARQ").

## Decisão

Criar o tipo documental **IMP — Plano de Implementação**:

* **Finalidade:** planejar organizacionalmente a etapa de Implementação do fluxo oficial (ADR-006) de um mecanismo ou capacidade — decomposição em etapas, ordem, dependências, critérios de conclusão e gates de validação — sem definir código, tecnologia ou linguagem, e sem executar a implementação.
* **Localização:** `docs/implementation/`.
* **Identificação:** IMP-nnn, sequencial e permanente.
* **Elaboração:** Engenheiro ou CTO. **Aprovação:** CTO, com aval do Usuário.
* **Natureza:** disciplina metodológica — o IMP não cria requisitos nem altera arquiteturas; subordina-se integralmente aos REQs, ADRs e ARQs aprovados que planeja executar.

## Alternativas consideradas

* **Planejar em TSK (Tarefas):** rejeitado — o TSK é operacional e unitário; o plano de implementação é artefato de governança que disciplina um gate inteiro da ADR-006, com critérios e gates próprios.
* **Planejar dentro de uma ADR:** rejeitado — ADR registra decisão pontual; o plano é estrutura de execução verificável, referenciável durante toda a implementação.

## Rastreabilidade

- Norma superior: CON-001 Art. 5º; catálogo oficial.
- Origem: deliberação do CTO autorizando o IMP-001 (21/07/2026).
- Gera: `docs/implementation/IMP-001-plano-de-implementacao-do-mecanismo-de-conceitos.md`; inclusão do tipo na taxonomia do catálogo.
