# Pacote de Requisitos — CEO MVP v0.1 (Uso Diário MG2)

> **Status: Homologado — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026.
> **Artefato de índice** do primeiro ciclo de Engenharia de Requisitos do MVP. Não substitui os REQ-xxx individuais (ADR-003).
> Norma superior: CON-001; VIS-003 v1.0 (homologado); ADR-015; marco `CEO-MVP-START`.
> **Arquitetura:** ARQ-008 em elaboração/revisão — Implementação bloqueada até homologação da ARQ.

---

## 1. Origem e filtros aplicados

| Filtro | Aplicação |
|--------|-----------|
| Derivação exclusiva | Todo requisito abaixo deriva **somente** do VIS-003 homologado |
| ADR-015 | Cada REQ aproxima o uso diário do CEO no MG2 |
| Teste dos cinco dias | Se, **sem** o REQ, o patrocinador ainda pudesse cumprir o critério de sucesso do VIS-003 §7, o REQ **não** entra no MVP |
| Simplicidade | Prioridade a continuidade de uso e baixa carga cognitiva |
| Exclusões VIS-003 §6 | Nada do que a visão colocou fora do MVP foi introduzido |

---

## 2. Inventário

### 2.1 Requisitos funcionais (12)

| ID | Título | CAP | Âncora VIS-003 |
|----|--------|-----|----------------|
| [REQ-016](REQ-016-painel-do-dia.md) | Painel do Dia | CAP-07 | §4; M1 |
| [REQ-017](REQ-017-contexto-ativo-mg2.md) | Contexto ativo exclusivo MG2 | CAP-03 | §2; §4; §6 |
| [REQ-018](REQ-018-abrir-o-dia.md) | Abrir o dia | CAP-07 | §3 Manhã; M1 |
| [REQ-019](REQ-019-foco-do-dia.md) | Foco do dia | CAP-07 | §3; M2 |
| [REQ-020](REQ-020-proximo-passo.md) | Próximo passo | CAP-07 | §3; §4; M1 |
| [REQ-021](REQ-021-atencao-pendente.md) | Atenção pendente | CAP-07 | §4; M6 |
| [REQ-022](REQ-022-registrar-decisao.md) | Registrar decisão | CAP-05 | §3; M3 |
| [REQ-023](REQ-023-registrar-conhecimento.md) | Registrar conhecimento | CAP-04 | §3; M4 |
| [REQ-024](REQ-024-consultar-registrado.md) | Consultar o registrado | CAP-04 | §3; M5 |
| [REQ-025](REQ-025-fechar-o-dia.md) | Fechar o dia | CAP-07 | §3 Fim; M7 |
| [REQ-026](REQ-026-continuidade-entre-dias.md) | Continuidade entre dias | CAP-03 | §3; §7 |
| [REQ-027](REQ-027-confirmacao-do-patrocinador.md) | Confirmação do patrocinador | CAP-07 | §2; §3 |

### 2.2 Requisitos não funcionais (5)

| ID | Título | CAP | Âncora VIS-003 |
|----|--------|-----|----------------|
| [REQ-028](REQ-028-baixa-carga-cognitiva.md) | Baixa carga cognitiva | CAP-07 | §3 Ritmo; missão |
| [REQ-029](REQ-029-sem-reexplicar-contexto.md) | Sem reexplicar o contexto | CAP-07 | §3 passo 4 |
| [REQ-030](REQ-030-nao-substituir-ferramentas-de-execucao.md) | Não substituir ferramentas de execução | CAP-02* | §2; §6 |
| [REQ-031](REQ-031-uso-por-patrocinador-unico.md) | Uso por patrocinador único | CAP-10 | §2; §6 |
| [REQ-032](REQ-032-respeito-ao-tempo-do-patrocinador.md) | Respeito ao tempo do patrocinador | CAP-07 | §2; CON-001 Art. 9º |

\*REQ-030 rastreia CAP-02 no sentido de **não** impor ao usuário a orquestração de IAs no MVP; o CEO não exige escolha de stack no dia a dia.

---

## 3. Matriz do teste dos cinco dias (VIS-003 §7)

| Critério de sucesso VIS-003 | REQs indispensáveis |
|-----------------------------|---------------------|
| Abre o dia pelo CEO | 016, 017, 018, 019, 020, 021 |
| Registra decisão ou conhecimento no período | 022, 023 |
| Fecha o dia (≥3×/5 dias) | 025, 027 |
| Não reconstrói de memória foco e próximo passo | 019, 020, 026, 029 |
| Qualidade de uso sustentável | 024, 028, 030, 031, 032 |

---

## 4. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO em revisão |
| Quando | 23/07/2026 |
| Por quê | Abrir a Engenharia de Requisitos do MVP após homologação do VIS-003 |
| Baseado em quê | Autorização CTO — fase REQ do MVP; VIS-003 v1.0; ADR-015; TEMPLATE-REQ |
| Resultado | Pacote v1.0 homologado (12 funcionais + 5 não funcionais); fase de Arquitetura aberta (ARQ-008) |

---

## 5. Histórico

| Versão | Data | Autor | O quê | Status |
|--------|------|-------|-------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação do pacote e dos REQ-016 a REQ-032 | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Homologação do pacote; abertura da fase de Arquitetura | **Homologado** |
