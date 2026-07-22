# Âncora Operacional — Estado organizacional ao término do CNC-005

> Este documento registra o estado organizacional do projeto ao término do ciclo CNC-005, com o objetivo de preservar a continuidade dos trabalhos. Não possui efeito normativo nem altera artefatos homologados.
>
> **Status:** Homologada pela Governança — 22/07/2026. Marco oficial de continuidade organizacional.
> **Natureza:** aprendizado / marco de continuidade (tipo Aprendizado do catálogo). Sem efeito normativo.
> **Origem:** deliberação final da Governança (22/07/2026) sobre a incorporação da Âncora Operacional; parecer técnico do CTO na mesma data.

---

## 1. Finalidade institucional

Preservar, em fonte canônica sob `/docs`, o contexto necessário para retomar o desenvolvimento **sem perda de rastreabilidade**, após o encerramento do primeiro fluxo regular completo de admissão de conceito (CNC-005) e da consolidação dos Grupos A e B da Distribuição de Governança.

Este registro **não** é diário de desenvolvimento, **não** emenda requisitos e **não** substitui ANL, ADR ou REQ.

---

## 2. Marco temporal

| Campo | Registro |
|-------|----------|
| Quem | Governança deliberou a incorporação; Engenheiro (Cursor) redigiu o registro |
| Quando | 22/07/2026 (estado de referência: término do ciclo CNC-005 e encerramento dos Grupos A e B em 21/07/2026) |
| Por quê | Garantir continuidade da Frente 1 e registrar o início do eixo de identidade institucional (VIS-002), sem bloquear o Grupo C |
| Baseado em quê | CNC-005; REQ-010; REQ-011; ADR-013; ANL-004; ADR-006; deliberação da Governança (22/07/2026) |
| Resultado | Marco de continuidade registrado; próximo gate operacional: revisão técnica do REQ-012 v0.1 |

---

## 3. Estado consolidado (Frente 1 — Distribuição)

### 3.1 Conceito e admissão

* Fluxo regular de admissão (REQ-009 → REQ-006) concluído para **"Agente Conectado"**.
* Conceito registrado: **CNC-005** — vigente desde 21/07/2026.
* Artefatos de admissão: proposta e decisão formal homologadas; índice oficial atualizado (CNC-001 a CNC-005).

### 3.2 Grupo A — Pacote de governança

* **Concluído** com a homologação do **REQ-010** (composição do pacote: Constituição, normas vigentes, conceitos vigentes).
* Commit de referência: `e3b0f7b` (publicado).

### 3.3 Grupo B — Vínculo de distribuição

* **Concluído** com a homologação do **REQ-011** (efeitos do vínculo: início, vigência com recepção integral, cessação; destinatário = CNC-005).
* Encerramento do Grupo B confirmado pelo CTO (21/07/2026).
* Commit de referência: `219851e` (publicado).

### 3.4 Decisões estruturais do ciclo

* **ADR-013** homologada: composição do pacote (D1); sequência S2 — Frentes Paralelas (D2); admissão de Agente Conectado (D3, cumprida); fronteira documental × técnica (D4).

---

## 4. Ponto de retomada — Gate do Grupo C

| Item | Estado |
|------|--------|
| Grupo | **C — Entrega e Propagação** (ANL-004 §10) |
| Artefato | **REQ-012** — Entrega e propagação do pacote de governança |
| Versão | **v0.1** — redigida em 21/07/2026 |
| Status | Em revisão técnica do CTO (ainda não homologado; **sem commit**) |
| Caminho | `docs/requirements/REQ-012-entrega-e-propagacao.md` |
| Escopo do gate | Correspondência de versão; propagação consistente; comportamento na indisponibilidade de fonte — sem protocolos, cache, sincronização técnica, arquitetura ou implementação (ADR-013, D4) |

**Ordem oficial remanescente da Frente 1:** após o Grupo C, resta o **Grupo D — Rastro da Distribuição**. A implementação do canal permanece condicionada à prontidão das fontes (ADR-013, D2); a Frente 2 (materialização do REQ-002) corre em paralelo quando autorizada.

---

## 5. Relação com a Âncora Estratégica (VIS-002)

Na mesma deliberação da Governança (22/07/2026) foi autorizada a elaboração do **VIS-002** (identidade institucional do produto).

* As âncoras **ampliam** a visão institucional e **não** alteram REQ-010, REQ-011, CNC-005 nem critérios dos Grupos A e B.
* **Não** introduzem dependências para o REQ-012.
* Podem coexistir com o avanço da Frente 1, cada uma pelo próprio fluxo de homologação.

Distinção a preservar: **VIS** responde “O que é o CEO?”; **REQ** responde “Como a organização funciona?”.

---

## 6. O que este registro não faz

* Não altera artefatos homologados.
* Não cria requisitos, ADRs, capacidades ou conceitos.
* Não homologa o REQ-012 nem antecipa o Grupo D.
* Não atualiza o catálogo documental (atualização somente após homologação dos novos registros, conforme deliberação da Governança).

---

## 7. Ponto oficial de retomada

Este registro representa o ponto oficial de retomada dos trabalhos após o encerramento do ciclo CNC-005.

---

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Redação do marco de continuidade pós-CNC-005 | Deliberação final da Governança (22/07/2026) | Aprovado pelo CTO com um ajuste editorial |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Acrescentada a seção 7 — ponto oficial de retomada | Revisão técnica do CTO | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Incorporação ao acervo em `docs/learning/` como registro oficial de continuidade; marco oficial de retomada pós-CNC-005 | Homologação da Governança | **Homologada — Âncora Operacional em vigor** |
