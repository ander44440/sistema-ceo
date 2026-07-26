# ÉPICO-002 — Autonomia Executiva

> **Status: Em elaboração — v0.1 (24/07/2026).**  
> Versão 0.1 — 24/07/2026.  
> **Natureza:** artefato estratégico do Épico **E4 — Autonomia Executiva** do ROADMAP-001 Homologado v1.0.  
> Norma superior: CON-001 v1.0; ROADMAP-001 Homologado v1.0 (ADR-016); CAP-001; ADR-006; ADR-015; ADR-017.  
> **Correspondência:** ROADMAP-001 → **E4** → este ÉPICO-002.  
> **Release prevista:** **v0.7**.  
> **Observação de governança (ADR-016):** o Épico é estrutura interna do ROADMAP; este documento materializa o E4 por deliberação do CTO.  
> **Proibições deste artefato:** **não** abre CAP-02 por si; **não** reabre CAP-08 (já em baseline); **não** altera ROADMAP-001, ADRs, código nem baselines homologadas. A abertura da **CAP-03** ocorreu por deliberação própria do CTO (25/07/2026 — COA), fora deste documento.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O épico **Autonomia Executiva**: capacitar o CEO a transformar objetivos executivos em planos coordenados de execução. |
| **Por que existe?** | Após condução (CAP-05) e comunicação (CAP-07), falta planejar e coordenar a execução sem violar a autoridade do usuário. |
| **Para quem existe?** | Patrocinador (aprovação final), CTO (governança e abertura futura de CAPs), Engenheiro (ciclos ADR-006 futuros). |
| **Como o sucesso será medido?** | Quando os critérios da §7 forem atendidos e as CAP-E do E4 atingirem BASELINE conforme o marco da release **v0.7**. |

---

## 1. Objetivo do ÉPICO

Capacitar o Sistema CEO a **transformar objetivos executivos em planos coordenados de execução**, mantendo o usuário como **autoridade final** para aprovação das decisões.

Em termos do ROADMAP-001 (E4): sair do “próximo passo” único para **planos coordenados** entre humanos e agentes — sempre sob confirmação.

Este épico **delimita e prepara** a sequência CAP-08 → CAP-02 / CAP-03; **não** inicia nenhuma CAP neste ato.

---

## 2. Contexto estratégico

1. **Fase II — Evolução do Produto** está aberta; a metodologia (Fase I) está estável.  
2. **E1** (Fundação) e **E2** (Executivo Digital / CAP-05) estão concluídos.  
3. **E3 / ÉPICO-001** (Inteligência Executiva / CAP-07) está em baseline homologada — dependência direta de E4 **satisfeita**.  
4. O CEO já **registra, conduz e comunica**; ainda **não** planeja nem coordena execução além do próximo passo.  
5. O filtro **ADR-015** permanece: priorizar o que aproxima o uso diário no MG2 sem comprometer o rigor ADR-006.  
6. **ADR-017** permanece: OE arquivadas (EV-033…040) não abrem CAP-R neste épico; consolidação é trilha paralela e deliberada.

Cadeia estratégica:

```text
E2 (✔) → E3 / CAP-07 (✔ baseline) → E4 / ÉPICO-002 (este) → RELEASE v0.7
```

---

## 3. Valor esperado

| Para quem | Valor |
|-----------|-------|
| **Patrocinador** | Objetivos viram planos claros, confirmáveis e rastreáveis — sem perder o controle |
| **CTO / Engenheiro** | Coordenação de execução humana e por agentes sob governança do CEO |
| **Produto** | Transição de “condutor que propõe um passo” para “sistema que planeja execução coordenada” |
| **Release v0.7** | Marco ROADMAP: CAP-08 (+ CAP-02/03 iniciais) em baseline |

Princípio preservado: **sugerir sem impor** — plano proposto ≠ plano vigente até aprovação do usuário.

---

## 4. Escopo

Inclui, em nível estratégico (sem implementação neste ato):

| Item | Descrição |
|------|-----------|
| Planejamento executivo | Transformar objetivos/prioridades em planos estruturados (CAP-08) |
| Coordenação de agentes | Distribuir e dirigir trabalho entre IAs sob o CEO (CAP-02) |
| Gestão de projetos (inicial) | Organizar planos/tarefas distribuíveis (CAP-03 — recorte inicial do E4) |
| Autoridade do usuário | Toda decisão de vigência / execução permanece sob confirmação |
| Preservação de baselines | MVP, CAP-05 e CAP-07 não são reabertas; extensão sem regressão |
| Alinhamento à release v0.7 | Critérios de conclusão do ROADMAP para Autonomia Executiva |

---

## 5. Fora do escopo

| Item | Motivo |
|------|--------|
| Abrir CAP-08, CAP-02 ou CAP-03 neste ato | Restrição explícita do CTO |
| Criar VIS, REQ, ARQ, IMP ou VAL | Exige deliberação e gates ADR-006 por CAP |
| Alterar ROADMAP-001 ou ADRs | Fora deste artefato |
| Alterar código ou baselines homologadas | Proibido |
| CAP-09 (Observabilidade) | Épico **E5** / release v0.8 |
| CAP-10 / CAP-11 (Segurança / Integrações) | Épico **E6** / release v0.9 |
| CAP-06 / CAP-12 (Aprendizado / Desenvolvimento) | Épico **E7** / release v1.0 |
| Abrir CAP-R ou incorporar OE à baseline | ADR-017; deliberação própria |
| Execução técnica do MG2 dentro do CEO | Fronteira de execução (REQ-030 / ADR-015) |
| Multiusuário / IAM avançado | Fora do recorte atual do ROADMAP para E4 |

---

## 6. Capacidades envolvidas

| ID | Nome (CAP-001) | Classe | Papel neste épico |
|----|----------------|--------|-------------------|
| **CAP-08** | Planejamento | CAP-E | **Núcleo** — planos a partir de objetivos/prioridades |
| **CAP-02** | Gestão de Agentes | CAP-E | Coordenar quais agentes atuam, quando e em que ordem |
| **CAP-03** | Gestão de Projetos | CAP-E | Recorte **inicial** — planos/tarefas distribuíveis (aprofundamento no E5) |

### 6.1 Objetivos de alto nível por CAP

#### CAP-08 — Planejamento — **Homologada v1.0 (baseline, 24/07/2026)**

* Transformar objetivos executivos e prioridades em planos coordenados.  
* Propor sequência de passos/tarefas com justificativa — sem vigência automática.  
* Preservar autoridade de aprovação no patrocinador.  
* **Estado:** ciclo ADR-006 **concluído** — VIS-006 → REQ-035 → ARQ-011 → IMP-008 → VAL-008. Relatório: [`../cap-08/relatorio-encerramento-cap-08.md`](../cap-08/relatorio-encerramento-cap-08.md). **Não reabrir.**

##### Princípio Arquitetural homologado (Deliberação CTO, 24/07/2026)

> **O CEO analisa antes de recomendar, recomenda antes de planejar e planeja antes de executar.**

**Status:** Homologado como **Princípio Arquitetural do Sistema CEO**. Integra a **identidade conceitual** do produto.

Cadeia explícita de raciocínio executivo:

```text
Análise Executiva → Recomendação → Planejamento Executivo → Execução
```

A diretriz já registrada — *Planejamento Executivo precedido por Análise Executiva* — permanece válida e é **absorvida** por este princípio (a Análise é o primeiro elo da cadeia).

Objetivos da etapa de **Análise Executiva** (precedente ao planejamento; aplicáveis ao elo Análise):

1. compreender o contexto;  
2. identificar lacunas de informação;  
3. avaliar riscos;  
4. identificar dependências;  
5. considerar alternativas;  
6. justificar recomendações;  
7. indicar o nível de confiança da proposta.

**Determinações vinculantes (CTO):**

| # | Determinação |
|---|--------------|
| 1 | O princípio integra a identidade conceitual do Sistema CEO |
| 2 | A REQ-035 **materializou** o princípio em requisitos verificáveis (ciclo CAP-08 concluído) |
| 3 | Sempre que novas CAP-E envolverem decisões, **deverá** ser avaliado se o princípio também se aplica |
| 4 | Esta deliberação histórica **não** abriu CAP por si; a CAP-08 foi aberta e concluída por atos posteriores do CTO |

Rastreabilidade: o princípio e a Análise Executiva constam no REQ-035 e foram refletidos em ARQ-011 / IMP-008 / VAL-008. CAP-08 **homologada** (baseline). **CAP-03 homologada** em 26/07/2026 (VIS-007…VAL-003 — ciclo COA). CAP-02 **permanece não aberta**.

#### CAP-02 — Gestão de Agentes

* Transformar diferentes IAs em equipe coordenada a serviço do usuário.  
* Decidir qual agente usar, quando e em que ordem — decisão do CEO, não do usuário.  
* **Fora deste ato:** abrir a CAP-02.

#### CAP-03 — Gestão de Projetos — **Homologada (26/07/2026)**

* Conceito fundador: **Contexto Operacional Ativo (COA)**; Projeto = especialização inicial.  
* Home executiva conversacional; isolamento entre contextos; migração MG2.  
* Cadeia: VIS-007 → REQ-036…044 → ARQ-012 → IMP-009 → VAL-003 — **baseline** em `docs/cap-03/`.  
* **Não** altera MVP v0.1; VAL-005 permanece independente.  
* Escopo pleno de planos/tarefas distribuíveis pode aprofundar-se no E5 conforme ROADMAP.

**CAP-08** e **CAP-03** estão em baseline. **CAP-02** **não** está aberta.

---

## 7. Critérios de sucesso

O ÉPICO-002 somente se considera **encerrado** quando, cumulativamente:

| # | Critério | Estado (24/07/2026) |
|---|----------|---------------------|
| 1 | **CAP-08** atingiu **BASELINE** homologada por ciclo ADR-006 completo | **Satisfeito** |
| 2 | **CAP-02** e **CAP-03** (recorte inicial do E4) atingiram baseline conforme deliberação de abertura e o marco da **v0.7** | CAP-03 **satisfeito** (26/07/2026); CAP-02 pendente |
| 3 | O usuário permanece autoridade final: planos não vigoram sem confirmação | Atendido na CAP-08 (`vigencia=proposta`) |
| 4 | Nenhuma baseline anterior (MVP, CAP-05, CAP-07) foi regredida | Atendido (VAL-008; VAL-003 / CAP-03) |
| 5 | Evidências demonstram passagem do “próximo passo” único a planos coordenados (humanos e/ou agentes) | Atendido na CAP-08 (planos); distribuição plena com CAP-02 |
| 6 | Rastreabilidade ROADMAP-001 → ÉPICO-002 → CAP-E → VIS…VAL → BASELINE está completa no catálogo | Parcial (CAP-08 e CAP-03 completas; CAP-02 pendente) |
| 7 | CTO declara o encerramento do épico; oportunidades remanescentes vão a CAP-R / backlog / épicos seguintes | Pendente |

Enquanto qualquer critério obrigatório não for evidenciado, o épico **permanece aberto**.

Homologação deste documento (quando ocorrer) ≠ abertura de CAP ≠ implementação ≠ release v0.7.

---

## 8. Dependências

| Dependência | Estado | Efeito |
|-------------|--------|--------|
| ROADMAP-001 | Homologado v1.0 | Autoriza o horizonte E4 / v0.7 |
| ADR-016 | Aceita v1.0 | Hierarquia ROADMAP → ÉPICO → CAP |
| ADR-006 | Vigente | Cada CAP-E exigirá VIS → REQ → ARQ → IMP → VAL |
| ADR-015 | Vigente | Filtro de uso diário MG2 |
| ADR-017 | Aceita v1.0 | CAP-R / OE não misturadas com abertura de CAP-E |
| E1 Fundação | Concluído | Base metodológica |
| E2 Executivo Digital (CAP-05) | Baseline congelada | Condução e memória disponíveis |
| E3 / ÉPICO-001 (CAP-07) | Baseline homologada | Dependência direta E3→E4 **satisfeita** |
| CAP-08 | **Baseline homologada** (24/07/2026) — VIS-006…VAL-008 | Critério §7.1 **satisfeito**; não reabrir |
| CAP-03 | **Baseline homologada** (26/07/2026) — VIS-007…VAL-003 | Critério §7.2 (parte CAP-03) **satisfeito**; não reabrir |
| CAP-02 | Prevista no CAP-001; **não aberta** | Abertura somente por deliberação do CTO |

Dependência estratégica (ROADMAP §8):

```text
E3 Inteligência Executiva (✔) → E4 / ÉPICO-002 → (habilita) E5 Gestão Estratégica
```

---

## 9. Riscos

| ID | Risco | Impacto | Mitigação |
|----|-------|---------|-----------|
| R1 | Abrir CAP-02/03 antes de CAP-08 madura | Coordenação sem plano; escopo invertido | Ordem recomendada: CAP-08 primeiro; demais sob deliberação |
| R8 | Planejar sem Análise Executiva prévia, ou pular elos da cadeia Análise → Recomendação → Planejamento → Execução | Viola o Princípio Arquitetural homologado do CEO | Princípio CTO §6.1 CAP-08 — cadeia obrigatória; materializar na futura REQ da CAP-08 |
| R2 | Plano vigorar sem confirmação | Viola autoridade do usuário / CON-001 | Critério de sucesso §7.3; alinhamento a “sugerir sem impor” |
| R3 | Reabrir CAP-05/07 “para apoiar o plano” | Corrompe baselines | Extensão sem regressão; CAP-R só por ADR-017 |
| R4 | Importar engenharia do MG2 para dentro do CEO | Viola independência do produto | ADR-015: MG2 = contexto de uso, não arquitetura |
| R5 | Confundir ÉPICO-002 com abertura de CAP | Atalho metodológico | Este artefato **não** abre CAP; exige ato próprio |
| R6 | Escopo de CAP-03 expandir para E5 cedo demais | Mistura E4 e E5 | Recorte inicial explícito; aprofundamento no E5 |
| R7 | Dependência de agente/IA específico | Viola independência de ferramenta | Decisão de agente permanece do CEO; agentes substituíveis |

---

## 10. Estratégia de implementação

> Estratégia **de governança** — não é plano IMP nem autorização de código.

| Etapa | Conteúdo | Gate |
|-------|----------|------|
| **S0** | Homologação deste ÉPICO-002 pelo CTO | Deliberação CTO |
| **S1** | Abertura da **CAP-08** (VIS…) | **Concluída** (24/07/2026) |
| **S2** | Ciclo completo CAP-08 até BASELINE (Princípio Arquitetural + Análise Executiva) | **Concluída** — VIS-006…VAL-008 Homologados v1.0; Relatório de Encerramento |
| **S3** | Abertura deliberada de CAP-03 (recorte COA) | **Concluída** — Gate Final 26/07/2026; VIS-007…VAL-003 Homologados |
| **S3b** | Abertura deliberada de CAP-02 (quando o CTO definir) | ADR-006; filtro ADR-015 |
| **S4** | Baselines CAP-02/03 iniciais + integração sem regressão | CAP-03 em baseline; CAP-02 pendente |
| **S5** | Consolidação para marco **RELEASE v0.7** | ROADMAP §6; ato de release futuro |
| **Paralelo** | OE / CAP-R | ADR-017 — **não** automático; não misturar com S1–S4 |

**Ordem recomendada de CAP-E (sujeita a deliberação):**  
`CAP-08 → CAP-02 → CAP-03 (inicial)` — alinhada ao marco v0.7 (“CAP-08 (+ CAP-02/03 iniciais)”).

**Proibição vigente:** nenhuma etapa S1+ inicia sem deliberação explícita do CTO após a revisão deste v0.1.

---

## Limites deste artefato

Este ÉPICO **não**:

* abre CAP-02 ou CAP-03 (CAP-08 já concluída por atos próprios);  
* altera ROADMAP-001, ADRs ou código;  
* declara a release v0.7;  
* inicia CAP-R.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO dirige o épico |
| Quando | 24/07/2026 (atualização de rastreabilidade pós-CAP-08) |
| Por quê | Materializar o E4 — Autonomia Executiva; refletir encerramento da CAP-08 |
| Baseado em quê | ROADMAP-001 E4 / v0.7; ADR-016; ADR-006; Relatório de Encerramento CAP-08 |
| Resultado | ÉPICO-002 permanece aberto; CAP-08 em baseline; próximo gate: CAP-02/03 sob deliberação |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação — objetivo, contexto, valor, escopo, CAP-08/02/03, sucesso, dependências, riscos, estratégia | Deliberação CTO — abertura ÉPICO-002 / E4 | Em elaboração |
| 0.1a | 24/07/2026 | Engenheiro (Cursor) | Registro da diretriz: Planejamento Executivo precedido por Análise Executiva (objetivos 1–7); risco R8; S2 atualizado | Deliberação CTO — diretriz arquitetural para futura CAP-08 | Em elaboração |
| 0.1b | 24/07/2026 | Engenheiro (Cursor) | Homologação como Princípio Arquitetural do CEO; cadeia Análise→Recomendação→Planejamento→Execução; determinações 1–4 | Deliberação CTO — princípio de identidade conceitual | Em elaboração |
| 0.1c | 24/07/2026 | Engenheiro (Cursor) | Rastreabilidade pós-encerramento CAP-08: §6–§8 e S1/S2 concluídos; critério §7.1 satisfeito; OE EV-039…040 | Relatório de Encerramento CAP-08; Deliberação Final CTO | Em elaboração |
| 0.1d | 25/07/2026 | Engenheiro (Cursor) | CAP-03 aberta por deliberação própria (COA); S3 em curso; CAP-02 ainda fechada | Deliberação CTO 25/07/2026 — VIS-007/REQ/ARQ | **Em elaboração** |
| 0.1e | 26/07/2026 | Engenheiro (Cursor) | CAP-03 Homologada (VIS…VAL); S3 concluída; §7.2 parcial (CAP-03); CAP-02 permanece aberta | Gate Final CAP-03; VAL-003 | **Em elaboração** |
