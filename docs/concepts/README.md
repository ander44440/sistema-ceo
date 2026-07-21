# Índice Oficial de Conceitos Organizacionais

> **Status: Oficial — em vigor.**
> Estrutura aprovada no gate E1 do IMP-001 (CTO, 21/07/2026). Operacional desde o corte único de migração (21/07/2026), conforme ARQ-001 (A1).

## O que é

A relação oficial de todos os conceitos organizacionais registrados na **autoridade semântica do CEO** (ADR-007). É a porta de entrada da resolução (REQ-008) e a fonte de estado do acervo conceitual: **um conceito existe oficialmente se, e somente se, consta deste índice com sua entrada correspondente** (ARQ-003, A1).

## Regras do registro

* **Entrada por conceito:** cada conceito possui documento próprio e permanente nesta pasta, conforme o modelo oficial (`TEMPLATE-CONCEITO.md`), com as cinco seções obrigatórias da ARQ-001 (A2).
* **Identificação:** identificadores `CNC-nnn`, emitidos exclusivamente no ato de registro, de forma sequencial, determinística e rastreável (ARQ-003). Jamais reutilizados ou reatribuídos; a ordem de emissão não expressa atributo algum do conceito.
* **Ingresso:** nenhum conceito ingressa sem decisão formal de admissão (REQ-009) seguida de registro oficial (REQ-006).
* **Evolução:** alterações de definição ocorrem exclusivamente pela evolução semântica (REQ-007), na cadeia evolutiva imutável da entrada.
* **Consumo:** documentos consumidores referenciam conceitos pelo identificador `CNC-nnn` (referência qualificada — ARQ-002, A5; ARQ-001, A4); transcrições são informativas e não vinculantes.

## Conceitos registrados

| Identificador | Termo | Situação |
|---------------|-------|----------|
| [CNC-001](CNC-001-decisao-sob-governanca.md) | Decisão sob governança | Vigente desde 21/07/2026 |
| [CNC-002](CNC-002-item-de-conhecimento.md) | Item de conhecimento | Vigente desde 21/07/2026 |
| [CNC-003](CNC-003-contexto-de-trabalho.md) | Contexto de Trabalho | Vigente desde 21/07/2026 |
| [CNC-004](CNC-004-conceito-organizacional.md) | Conceito organizacional | Vigente desde 21/07/2026 |

## Registro do corte único de migração (Memória Organizacional — ADR-009, D6.5)

| Campo | Registro |
|-------|----------|
| Quem | CTO autorizou (Gate E3, com a ordem oficial de registro); Usuário aprovou; Engenheiro (Cursor) executou o ato |
| Quando | 21/07/2026 |
| Por quê | Migrar por regularização, em corte único e atômico, as quatro definições pré-mecanismo para a autoridade semântica oficial, extinguindo o regime transitório da ADR-007 |
| Baseado em quê | ADR-009 (Decisões 1 a 8); IMP-001 (etapa E4); decisões de admissão aprovadas (gate E2); ARQ-001 e ARQ-003 (estrutura e identificação) |
| Resultado | CNC-001 a CNC-004 registrados com fidelidade textual verificada; anotações de migração aplicadas nos cinco documentos legados; a autoridade das quatro definições passou integralmente ao mecanismo — sem regime misto |

## Rastreabilidade

- Norma superior: CON-001 v1.0; ADR-007, ADR-008 v1.0.
- Estrutura definida por: ARQ-001 v1.0 (A1); identificação por ARQ-003 v1.0.
- Materializado por: IMP-001 v1.0, etapa E1 (autorização do CTO, 21/07/2026).
