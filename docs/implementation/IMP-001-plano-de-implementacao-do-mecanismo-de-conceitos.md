# IMP-001 — Plano de Implementação do Mecanismo de Conceitos Organizacionais

> **Status: Aprovado — v1.0.**
> Versão 1.0 — 21/07/2026. Tipo criado pela ADR-012.
> Norma superior: CON-001 v1.0; ADR-006 (fluxo oficial); ADR-007, ADR-008, ADR-009, ADR-011 (v1.0); REQ-006 a REQ-009 (v1.0); ARQ-001, ARQ-002, ARQ-003 (v1.0); ANL-003 v1.0.
> Este documento planeja; não executa. Não cria requisitos, não altera arquiteturas aprovadas, não define código, tecnologia ou linguagem.

---

## 1. Objeto e premissas

Planejar a implementação do Mecanismo de Conceitos Organizacionais, do estado atual (especificação completa, nenhuma estrutura materializada) até a conclusão do **corte único de migração** (ADR-009, Decisão 6).

Premissas verificadas:

* Base normativa e arquitetural completa e aprovada (deliberação do CTO, 21/07/2026): REQ-006 a REQ-009; ADR-007 a ADR-009; ARQ-001; cadeia de identificação ADR-011 → ARQ-002 → ARQ-003.
* Lacuna Arquitetural Bloqueante da ANL-003 extinta pela ARQ-003.
* A implementação deste mecanismo é **documental**: materializar a estrutura lógica da ARQ-001 sob `/docs`, sem código ou ferramenta — coerente com a neutralidade tecnológica (ADR-011, Decisão 7).
* Congelamento semântico em vigor (ADR-009, Decisão 4): nenhuma definição inventariada muda até o corte.

**Princípio organizacional do plano** (CTO, 21/07/2026):

> **Nenhuma etapa poderá produzir efeitos organizacionais permanentes antes da conclusão bem-sucedida do respectivo gate.**

Cada gate delimita o momento em que os efeitos passam a existir para a organização: tudo o que uma etapa produz antes do seu gate é preparação sem força organizacional, e somente a conclusão bem-sucedida do gate confere existência oficial aos seus resultados.

## 2. Decomposição em etapas organizacionais

### E1 — Materialização do registro

Materializar a estrutura aprovada na ARQ-001: a localização `docs/concepts/`, o **índice oficial de conceitos** (inicialmente sem conceitos registrados) e o **modelo oficial de entrada de conceito** contendo as cinco seções obrigatórias (identificação, definição vigente, situação, origem e autorização, cadeia evolutiva), com os cinco campos da Memória Organizacional por evento.

**Critérios de conclusão:** estrutura existente e conforme à matriz de conformidade da ARQ-001 (verificação item a item); índice registrado no catálogo documental; nenhum conceito registrado antes do corte (E4).

### E2 — Preparação das decisões de admissão (regularização)

Produzir os quatro artefatos de **decisão de admissão** (REQ-009) do inventário fechado (ADR-009, Decisão 1), por regularização: cada decisão com resultado explícito, referenciando como autorizadores as decisões originais do CTO e a ADR-009 (Decisão 2), com os cinco campos da Memória Organizacional. Cada decisão fixa o **texto exato** a registrar, idêntico à fonte designada pelo inventário — tratamento do risco da forma textual do item 2 apontado pela ANL-003 (§3.2).

**Critérios de conclusão:** quatro decisões de admissão aprovadas pela alçada de governança (CTO, com aval do Usuário); fidelidade textual de cada texto fixado verificada por comparação direta com a fonte inventariada; nenhum registro efetuado nesta etapa (admissão autoriza, não constitui — REQ-009).

### E3 — Gate de validação pré-migração

Verificação formal de prontidão, com evidências, antes de qualquer registro:

1. E1 e E2 concluídas segundo seus critérios;
2. congelamento semântico íntegro — nenhuma definição inventariada alterada desde a ADR-009;
3. inventário permanece fechado — varredura confirmando ausência de quinta definição;
4. identificadores previstos conferidos: emissão determinística (ARQ-003, A3.3) a partir de `CNC-001`, na ordem de registro proposta no §3;
5. **autorização expressa do CTO para executar o corte**.

**Critério de conclusão:** os cinco itens verificados e registrados; autorização do CTO obtida. Este é o gate de validação exigido antes da migração — sem ele, a E4 não inicia.

### E4 — Corte único de migração

Executar o corte (ADR-009, Decisão 3), em ato único e atômico:

1. registrar os quatro conceitos na autoridade semântica (REQ-006), emitindo os identificadores conforme a ARQ-003;
2. aplicar a **anotação de migração** nos cinco documentos legados (REQ-003, REQ-004, REQ-005, ANL-001, ANL-002), com referência ao identificador oficial (ADR-009, Decisão 5);
3. registrar o corte na Memória Organizacional com os cinco campos (ADR-009, Decisão 6.5).

**Critérios de conclusão:** os quatro registros existem, com definição textualmente idêntica à fixada em E2; as cinco anotações aplicadas e registradas nos históricos; o corte registrado. Nenhum estado intermediário persiste — ou o ato completa, ou não ocorreu.

### E5 — Verificação de conclusão e encerramento

Verificar formalmente os **cinco critérios da ADR-009, Decisão 6**; declarar extinta a disposição transitória da ADR-007; atualizar o catálogo documental; submeter o encerramento à validação do CTO (etapa de Validação do fluxo da ADR-006).

**Critérios de conclusão:** os cinco critérios da Decisão 6 atestados com evidências; extinção da disposição transitória registrada; validação do CTO obtida.

### E6 — Encerramento da Implementação

Registrar formalmente a conclusão da implementação do Mecanismo de Conceitos Organizacionais. Esta etapa não altera o mecanismo — apenas formaliza o encerramento organizacional da implementação.

**Critérios de conclusão (mínimos):**

1. confirmação da aprovação do CTO;
2. registro do encerramento na Memória Organizacional, com os cinco campos;
3. atualização do catálogo documental;
4. declaração formal de conclusão da implementação.

## 3. Ordem de execução e dependências

```
E1 (registro)  ─┐
                ├─→ E3 (gate pré-migração) ─→ E4 (corte único) ─→ E5 (conclusão) ─→ E6 (encerramento)
E2 (admissões) ─┘
```

* **E1 e E2 são independentes entre si** e podem ocorrer em qualquer ordem ou em paralelo; ambas são pré-requisito de E3.
* **E3 → E4 → E5 → E6 são estritamente sequenciais**; cada etapa somente inicia após a conclusão formal da anterior.
* **Ordem de registro no corte (proposta):** a ordem do inventário da ADR-009, Decisão 1 (decisão sob governança; item de conhecimento; Contexto de Trabalho; conceito organizacional). A ordem é neutra por arquitetura (ARQ-003, A3.6 — a posição ordinal não expressa atributo algum); adotar a ordem do inventário maximiza a rastreabilidade. A fixação definitiva ocorre na autorização do corte (E3.5).
* **Fora deste plano:** a integração com a distribuição (REQ-001) — somente após a conclusão da migração (ADR-009, Decisão 7) e mediante novo gate; a retomada da CAP-04 — Grupo D (Curadoria), suspensa desde a criação do mecanismo.

## 4. Gates de validação

| Gate | Momento | Quem valida |
|------|---------|-------------|
| Conclusão de E1 | Estrutura conforme ARQ-001 | CTO |
| Conclusão de E2 | Quatro admissões com fidelidade verificada | CTO, com aval do Usuário (alçada da admissão) |
| **Gate pré-migração (E3)** | Antes de qualquer registro | CTO — autorização expressa do corte |
| Conclusão da migração (E5) | Após o corte | CTO — validação final (ADR-006) |
| Encerramento (E6) | Após a validação de E5 | CTO confirma; encerramento registrado na Memória Organizacional |

Nenhuma etapa avança sem o gate anterior — disciplina idêntica à aplicada em toda a construção do mecanismo. Pelo princípio organizacional do plano (§1), nenhuma etapa produz efeitos organizacionais permanentes antes da conclusão bem-sucedida do respectivo gate.

## 5. Riscos do plano

* **Ato do corte não instantâneo:** a atomicidade (ADR-009, D3) é organizacional, não física — o ato envolve registros e anotações em múltiplos documentos. Mitigação: o corte só é declarado existente quando E4 completa integralmente (critério "nenhum estado intermediário persiste"); a autoridade só muda com a declaração, nunca durante o ato.
* **Desvio textual na regularização:** mitigado duas vezes — fixação do texto em E2 e verificação de fidelidade em E3.4 e E5 (ADR-009, D6.2).
* **Prolongamento do congelamento:** o plano minimiza o intervalo até o corte ao permitir E1 ∥ E2; risco já classificado como aceitável na ANL-003 (§3.2).

## Encerramento da Implementação (E6)

**Declaração formal de conclusão:** a implementação do Mecanismo de Conceitos Organizacionais foi concluída em 21/07/2026, com as etapas E1 a E5 executadas e verificadas conforme este plano. A homologação final do mecanismo foi solicitada ao CTO no relatório final de execução.

| Campo | Registro |
|-------|----------|
| Quem | CTO aprovou os gates E1, E2 e E3 e autorizou E4–E6; Usuário aprovou; Engenheiro (Cursor) executou |
| Quando | 21/07/2026 |
| Por quê | Concluir formalmente a implementação após o corte único e a verificação dos critérios da ADR-009 (D6) |
| Baseado em quê | IMP-001 v1.0 (etapas e gates); deliberação do Gate E3 (CTO, 21/07/2026); evidências das etapas E4 e E5 |
| Resultado | CNC-001 a CNC-004 registrados e vigentes; cinco documentos legados anotados; disposição transitória da ADR-007 extinta; catálogo atualizado; implementação declarada concluída — homologação final do CTO pendente |

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001 v1.0; ADR-006 (gates); ADR-009 (estratégia que este plano executa) |
| Planeja a execução de | REQ-006 a REQ-009; ARQ-001; ARQ-003 (emissão); ADR-009 (corte, anotações, conclusão) |
| Origem | Deliberação do CTO (21/07/2026) — disciplina metodológica antes da implementação; ADR-012 (tipo IMP) |
| Gera | Execução das etapas E1–E6, cada qual pelo seu gate; ao final, extinção da disposição transitória da ADR-007 e encerramento formal da implementação |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação | Deliberação do CTO — planejar a implementação antes de executá-la | Aprovado com dois ajustes |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Adicionados o princípio organizacional do plano (nenhum efeito permanente antes do gate) e a etapa E6 — Encerramento da Implementação | Revisão do CTO — explicitar a natureza controlada da implementação e formalizar seu encerramento | **Aprovado — plano de implementação em vigor** |
| 1.0 (execução) | 21/07/2026 | CTO (gates); Engenheiro (execução) | E1 e E2 executadas e aprovadas (relatório + deliberação do Gate E3); E3 aprovado com ordem oficial CNC-001 a CNC-004; E4 — corte único executado; E5 — critérios D6 da ADR-009 atestados; E6 — encerramento registrado | Autorização de execução do IMP-001 e deliberação do Gate E3 | **Implementação concluída — homologação final solicitada ao CTO** |
