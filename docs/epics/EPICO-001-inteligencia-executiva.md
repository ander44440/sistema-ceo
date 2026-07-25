# ÉPICO-001 — Inteligência Executiva

> **Status: Em análise — revisão do CTO (24/07/2026).**  
> Versão 0.2 — 24/07/2026.  
> **Natureza:** artefato estratégico do Épico E3 do ROADMAP-001, vinculado exclusivamente à **CAP-07 — Comunicação**.  
> Norma superior: CON-001 v1.0; ROADMAP-001 Homologado v1.0 (ADR-016); CAP-001; ADR-006; ADR-015.  
> **Observação de governança (ADR-016):** o Épico foi definido como **estrutura interna** do ROADMAP (sem prefixo oficial próprio). Este documento materializa o Épico E3 do ROADMAP-001 em artefato dedicado, por deliberação do CTO; eventual formalização de tipo `ÉPICO` / pasta `docs/epics/` no catálogo permanece sujeita a deliberação.  
> **Proibições deste artefato:** não abre a CAP-07; não cria VIS, REQ, ARQ ou IMP; não altera código, arquitetura, ROADMAP-001 nem baselines homologadas; não abre ciclo ADR-006 por si.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O épico **Inteligência Executiva**: elevar a qualidade comunicacional da condução do CEO a partir da baseline CAP-05. |
| **Por que existe?** | A CAP-05 conduz; falta comunicação adaptada, clara e mínima para o patrocinador avançar com segurança. |
| **Para quem existe?** | Patrocinador (uso), CTO (governança e eventual abertura da CAP-07), Engenheiro (ciclo futuro ADR-006). |
| **Como o sucesso será medido?** | Quando os critérios da §7 forem atendidos e a CAP-07 atingir BASELINE homologada pelo fluxo ADR-006. |

---

## 1. Objetivo do Épico

Elevar o Sistema CEO de **Executivo Digital** (CAP-05 — baseline) a um sistema de **Inteligência Executiva**: o CEO comunica o mínimo necessário de forma adaptada, clara e transparente — sempre sugerindo sem impor.

Este épico **prepara e delimita** uma eventual abertura da CAP-07; **não** a inicia.

---

## 2. Justificativa estratégica

1. **ROADMAP-001** situa a Inteligência Executiva como próximo passo após Fundação (E1) e Executivo Digital (E2) — ambos concluídos.  
2. A **VAL-005** evidenciou lacunas de inteligência executiva, feedback e clareza de comunicação (E-01…E-03) — insumos de evolução, não correção do MVP.  
3. A **CAP-05** fornece memória viva e condução; falta a camada que **adapta a mensagem** e entrega o mínimo necessário para o usuário avançar com segurança.  
4. O filtro **ADR-015** permanece: priorizar o que aproxima o uso diário no MG2 sem comprometer o rigor ADR-006.

---

## 3. Problema que o Épico resolve

Hoje o CEO **registra e conduz** (CAP-05), porém ainda:

* comunica de forma pouco adaptada ao momento e ao perfil do patrocinador;
* pode apresentar contexto, justificativa e feedback sem a síntese necessária;
* ainda não institucionaliza transparência comunicacional sobre limitações e incertezas.

Sem este épico, melhorias de comunicação e feedback tendem a surgir como funcionalidades isoladas, sem a governança da CAP-07.

---

## 4. Capacidade pertencente ao Épico

| ID | Nome (CAP-001) | Papel neste épico |
|----|----------------|-------------------|
| **CAP-07** | Comunicação | Entregar o mínimo necessário para avançar com segurança |

O reforço experiencial da CAP-05 (evidências E-01…E-03) é **insumo** para a CAP-07, não reabertura da baseline CAP-05.

A CAP-07 **não é aberta** por este documento.

---

## 5. Objetivos da CAP-07 (alto nível)

### CAP-07 — Comunicação

* Comunicar de forma adaptada ao perfil do usuário, sem burocracia nem repetição.  
* Entregar o mínimo necessário para decisão segura, com transparência sobre limitações e incertezas.  
* Tratar, em ciclo futuro, as oportunidades ligadas a inteligência executiva, feedback e clareza (E-01…E-03), sem reabrir a baseline CAP-05.  
* Preservar baixa carga cognitiva, respeito ao tempo e o princípio “sugerir sem impor”.  
* **Fora deste ato:** abrir a CAP-07 ou criar VIS/REQ/ARQ/IMP/VAL.

---

## 6. Dependências

| Dependência | Estado | Efeito |
|-------------|--------|--------|
| ROADMAP-001 | Homologado v1.0 | Autoriza o horizonte estratégico |
| ADR-016 | Aceita v1.0 | Tipo ROADMAP e hierarquia oficiais |
| Épico E1 — Fundação | Concluído | Base metodológica |
| Épico E2 — Executivo Digital (CAP-05) | Concluído / baseline congelada | Memória e condução disponíveis |
| ADR-006 | Vigente | A CAP-07 exigirá VIS → REQ → ARQ → IMP → VAL |
| ADR-015 | Vigente | Filtro de priorização uso diário MG2 |
| CAP-07 | Prevista no CAP-001; **não aberta** | Abertura somente por deliberação do CTO |

Dependência estratégica:

```text
E2 Executivo Digital (concluído) → E3 / ÉPICO-001 → CAP-07 (ainda não aberta)
```

---

## 7. Critérios para encerramento do Épico

O ÉPICO-001 somente se considera **encerrado** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | CAP-07 atingiu **BASELINE** homologada por ciclo ADR-006 completo |
| 2 | Nenhuma baseline anterior (MVP, CAP-05) foi regredida |
| 3 | Evidências de uso demonstram comunicação adaptada, clareza, feedback útil e baixa carga cognitiva |
| 4 | Rastreabilidade ROADMAP-001 → ÉPICO-001 → CAP-07 → VIS…VAL → BASELINE está completa no catálogo |
| 5 | CTO declara o encerramento do épico; oportunidades remanescentes vão a backlog / épicos seguintes |

Enquanto qualquer critério obrigatório não for evidenciado, o épico **permanece aberto**.

---

## 8. Rastreabilidade com o ROADMAP-001

| Elemento ROADMAP-001 | Vínculo neste ÉPICO-001 |
|----------------------|-------------------------|
| §5 **E3 — Inteligência Executiva** | Este artefato **é** a materialização documental do E3 |
| Release **v0.6** | Horizonte de entrega associado ao E3 |
| Hierarquia ADR-016 | ROADMAP → **ÉPICO** → CAP → VIS → REQ → ARQ → IMP → VAL → BASELINE → RELEASE |
| Dependência E2 → E3 | Satisfeita (CAP-05 concluída) |
| Critérios CEO 1.0 (§9) | Este épico contribui; não declara v1.0 |
| CAP-07 no E3 (ROADMAP) | Única capacidade pertencente ao ÉPICO-001 |
| Release v0.6 | Fecha quando E3 / CAP-07 atingir baseline e os critérios do épico forem homologados |

Cadeia oficial pretendida (ainda não executada):

```text
ROADMAP-001 → ÉPICO-001 → CAP-07 → VIS → REQ → ARQ → IMP → VAL → BASELINE → RELEASE v0.6
```

---

## 9. Limites deste artefato

Este ÉPICO **não**:

* cria ou abre a CAP-07;
* cria VIS, REQ, ARQ, IMP ou VAL;
* altera código, arquitetura ou ROADMAP-001;
* autoriza implementação;
* declara sucesso da release v0.6 ou do CEO 1.0.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO em revisão |
| Quando | 24/07/2026 |
| Por quê | Materializar o E3 — Inteligência Executiva — com escopo consistente com o ROADMAP-001 |
| Baseado em quê | Deliberação CTO — Alternativa A do Relatório de Reconciliação; ROADMAP-001 Homologado; ADR-016; CAP-001 (CAP-07); ADR-006; ADR-015 |
| Resultado | ÉPICO-001 v0.2 submetido; escopo exclusivo CAP-07; CAP não aberta; sem VIS/REQ/ARQ/IMP; aguarda revisão do CTO |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — escopo inicial submetido, com divergência de agrupamento em relação ao ROADMAP-001 | Deliberação CTO — abertura ÉPICO-001 | Em análise |
| 0.2 | 24/07/2026 | Engenheiro (Cursor) | Reconciliação pela Alternativa A; escopo exclusivo CAP-07; objetivos, dependências, encerramento e rastreabilidade alinhados ao E3 | Deliberação CTO — Alternativa A aprovada | Em análise — nova revisão |
