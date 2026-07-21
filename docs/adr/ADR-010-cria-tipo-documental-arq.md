# ADR-010 — Criação do tipo documental ARQ (Documento de Arquitetura)

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO nomeou o tipo ao autorizar a ARQ-001; Engenheiro registrou a criação conforme a regra do catálogo; CTO ratificou em 21/07/2026 |
| Quando | 21/07/2026 |
| Por quê | A deliberação do CTO autorizou a "ARQ-001 — Arquitetura do Registro de Conceitos Organizacionais"; o tipo ARQ não existia no catálogo oficial, e novo tipo documental deve nascer por ADR, nunca ad hoc |
| Baseado em quê | Regra do catálogo (`docs/README.md`); precedente da ADR-005 (tipo ANL); ADR-006 (etapa Arquitetura do fluxo oficial) |
| Resultado | Tipo ARQ criado; ARQ-001 produzida como primeiro exemplar e aprovada em v1.0 |

## Status

Aceito — v1.0, ratificado pelo CTO em 21/07/2026 ("Formalizar esse tipo por meio da ADR-010 preserva a coerência do próprio processo de governança").

## Decisão

Criar o tipo documental **ARQ — Documento de Arquitetura**:

* **Finalidade:** registrar a arquitetura de mecanismos e sistemas da organização — a etapa "Arquitetura" do fluxo oficial (ADR-006) — satisfazendo requisitos aprovados, sem definir implementação técnica, tecnologia ou ferramenta.
* **Localização:** `docs/architecture/`.
* **Identificação:** ARQ-nnn, sequencial e permanente.
* **Elaboração:** Engenheiro ou CTO. **Aprovação:** CTO, com aval do Usuário.
* **Relação com ADRs:** a ADR decide (escolhas e trade-offs); o ARQ estrutura (a forma que satisfaz os requisitos segundo as decisões). Todo ARQ rastreia os REQs que satisfaz e as ADRs que o restringem.

## Alternativas consideradas

* **Registrar a arquitetura em ADRs:** rejeitado — ADRs registram decisões pontuais; a descrição estrutural completa de um registro exige documento próprio, referenciável e evolutivo.
* **Documento sem tipo oficial em `docs/architecture/`:** rejeitado — violaria a regra do catálogo.

## Rastreabilidade

- Norma superior: CON-001 Art. 5º; catálogo oficial.
- Origem: deliberação do CTO autorizando a ARQ-001 (21/07/2026).
- Gera: `docs/architecture/ARQ-001-arquitetura-do-registro-de-conceitos.md`; inclusão do tipo na taxonomia do catálogo.
