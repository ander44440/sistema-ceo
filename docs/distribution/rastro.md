# Rastro da Distribuição de Governança

> **Status: Homologada — v1.0 (Governança, 22/07/2026). Gate E4 do IMP-003.**
> Norma superior: REQ-013; ARQ-005 A6; IMP-003 E4 (X8); CON-001 Art. 8º; ADR-013 D4.
> Este artefato é a **estrutura permanente** do rastro documental dos atos de entrega e propagação. A existência da estrutura **não implica** a existência de eventos registrados (IMP-003 X8).
> Vedação: sem auditoria ativa (CAP-09); sem automação técnica; sem protocolos (ADR-013 D4).

---

## 1. O que é

Registro append-oriented das **ocorrências organizacionais** de distribuição do pacote de governança (REQ-013; ARQ-005 A6): cada ato de entrega ou propagação (REQ-012), quando deliberado e realizado, gera uma entrada. O rastro descreve o ato; não redefine composição, vínculo nem propriedades da entrega.

## 2. Regras do modelo

| Regra | Enunciado |
|-------|-----------|
| Abrangência | Todo ato de entrega ou propagação gera entrada; nenhum ato de distribuição permanece sem registro |
| Conteúdo mínimo | (1) o que — pacote/subconjunto (REQ-010); (2) a quem — agente alcançado (CNC-005; REQ-011); (3) quando; (4) em que versão + fonte; (5) autorizado por quê (vínculo e normas) |
| Memória Organizacional | Quem · Quando · Por quê · Baseado em quê · Resultado (CON-001 Art. 8º) |
| Append-oriented | Registros não são alterados nem apagados; correções geram novos registros |
| Recuperabilidade | Reconstrução histórica a partir dos rastros — ≠ consulta, indexação, desempenho ou interface |
| IDs locais | Convenção interna do canal (ex.: `DST-nnn`) — sem espaço ARQ-002 (ARQ-005 A7) |
| Independência | Obrigação não depende de ferramenta (CON-001 Art. 7º §2º) |

## 3. Esquema de entrada (modelo)

Cada registro futuro deverá preencher, no mínimo:

| Campo | Descrição |
|-------|-----------|
| ID local do ato | Convenção interna (ex.: DST-001) |
| Tipo de ato | Entrega \| Propagação (REQ-012) |
| O que | Referência à composição/snapshot ou elementos (REQ-010) |
| A quem | Identificador do agente alcançado (CNC-005 / decisão de vínculo) |
| Quando | Momento organizacional do ato |
| Versão / fonte | Versão de cada elemento e fonte canônica de proveniência |
| Autorizado por quê | Base da obrigação (vínculo vigente; normas aplicáveis) |
| MO — Quem | Autor do registro / alçada do ato |
| MO — Quando | Data do registro |
| MO — Por quê | Motivo organizacional |
| MO — Baseado em quê | Fundamentos (REQ, deliberação, snapshot) |
| MO — Resultado | Efeito declarado do ato |

## 4. Eventos registrados

| ID | Tipo | O que | A quem | Quando | Versão/fonte | Autorização | Resultado MO |
|----|------|-------|--------|--------|--------------|-------------|--------------|
| — | — | *(nenhum evento)* | — | — | — | — | **Rastro operacionalmente vazio** |

Estado homologado: **zero atos** de entrega ou propagação registrados. Compatível com alcance inicial vazio (E2) e com a ausência de deliberação de atos de distribuição até esta data.

## 5. Memória Organizacional (estruturação E4)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) — estrutura; CTO — revisão técnica favorável; Governança — homologação |
| Quando | 22/07/2026 |
| Por quê | Materializar modelo de rastro sem popular eventos inexistentes (IMP-003 E4 / X8) |
| Baseado em quê | REQ-013; ARQ-005 A6; IMP-003; deliberação de abertura e homologação da E4 |
| Resultado | **Gate E4 homologado:** estrutura append-oriented operacionalmente vazia; apta a eventos futuros deliberados |

---

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Modelo REQ-013; tabela de eventos vazia | Abertura E4 após homologação E3 | Em revisão técnica do CTO |
| 0.1 | 22/07/2026 | CTO | Revisão técnica — sem ajustes; append-oriented e X8 conformes | Conformidade REQ-013 / ARQ-005 A6 / IMP-003 | Aprovada — encaminhada à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Rastro oficial do domínio; ausência de registros = estado válido | Conformidade ADR-006/012/013; REQ-013; ARQ-005; IMP-003 | **Homologada — E4 encerrada; E5 autorizada** |
