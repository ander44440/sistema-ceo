# ADR-006 — Fluxo oficial de desenvolvimento de capacidades

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO (ChatGPT) aprovou a proposta com três decisões incorporadas; redação do Engenheiro em análise |
| Quando | 21/07/2026 |
| Por quê | O padrão de desenvolvimento validado empiricamente (CAP-01 sem análise prévia exigiu redefinição de escopo no REQ-003; CAP-04 com ANL-001 nasceu com fronteiras e ordem resolvidas) precisa virar norma organizacional, não permanecer prática informal |
| Baseado em quê | CON-001 Art. 5º §2º e Art. 8º; ADR-005 (tipo ANL); experiência dos ciclos REQ-002/REQ-003 e ANL-001; proposta do Engenheiro de 21/07/2026 |
| Resultado | Aprovada v1.0 em 21/07/2026, após ajuste: etapas explicitadas como gates de governança |

## Status

Aprovada (v1.0 — CTO, 21/07/2026).

## Decisão

### Fluxo oficial

Toda capacidade do CAP-001 desenvolve-se pelo seguinte fluxo obrigatório:

**ANL → ADR (quando necessária) → REQ → Arquitetura → Implementação → Validação**

### Gates de governança

O fluxo não é uma mera sequência de etapas: **cada etapa constitui um gate de governança**. Uma etapa somente autoriza o início da etapa seguinte após sua aprovação pela alçada competente. Nenhum trabalho de etapa posterior é oficial se iniciado antes da abertura do gate.

* **ANL aprovada** autoriza a elaboração dos REQs (passando pela ADR estrutural, quando a análise a exigir).
* **REQs aprovados** autorizam a Arquitetura.
* **Arquitetura aprovada** autoriza a Implementação.
* **Implementação concluída** autoriza a Validação.
* **Validação aprovada** encerra oficialmente o ciclo da capacidade.

### Objetivo do fluxo

Garantir que toda capacidade evolua por um processo único, previsível e rastreável — do entendimento do domínio até a evidência de conformidade — de modo que nenhum artefato de etapa posterior exista sem os fundamentos das etapas anteriores.

### Justificativa

O fluxo formaliza um padrão já validado: a CAP-01, desenvolvida sem análise prévia, exigiu redefinição de escopo em pleno ciclo (REQ-003); a CAP-04, iniciada pela ANL-001, teve fronteiras e ordem de requisitos resolvidas antes do primeiro REQ. Registrar a lição como norma converte experiência em conhecimento organizacional (CON-001, Art. 8º §1º) e instancia, no nível de capacidade, o fluxo obrigatório do Art. 5º §2º (Visão → Requisitos → Arquitetura → Fluxos → Implementação → Testes → Validação).

### Etapas obrigatórias

1. **ANL — Análise da capacidade** (conforme ADR-005): aprovada pelo CTO antes da primeira sequência de REQs da capacidade. Define objetivo, limites, dependências, agrupamentos, riscos e ordem.
2. **ADR — Decisões estruturais (condicional):** existe apenas quando a ANL revelar decisões estruturais que precisem se tornar vinculantes (fronteiras entre capacidades, agrupamentos, ordem, conceitos candidatos). É a etapa que converte análise em decisão; não se fabricam ADRs sem decisão a registrar (CON-001, Art. 9º, princípio 1).
3. **REQ — Requisitos:** redigidos no template oficial (`docs/requirements/TEMPLATE-REQ.md`), um agrupamento por vez na ordem definida pela ANL, cada REQ rastreando exatamente uma capacidade, com revisão do CTO, aprovação e commit por aprovação.
4. **Arquitetura:** ADRs de arquitetura que satisfaçam REQs aprovados — a arquitetura nasce dos requisitos, nunca o inverso.
5. **Implementação:** somente com REQ aprovado e arquitetura decidida, mantendo a cadeia requisito → decisão → implementação → commit → teste (CON-001, Art. 8º §3º).
6. **Validação:** encerra formalmente o ciclo de desenvolvimento, produzindo **evidências de conformidade entre a implementação e os requisitos aprovados**, registradas com rastreabilidade aos critérios de aceitação de cada REQ.

### Exceções permitidas

* **Correções editoriais** (erros de escrita, links, formatação) em documentos aprovados: dispensam novo ciclo, mas exigem registro no histórico de versões do documento.
* **Emergência:** somente o Usuário pode declarar situação de emergência (CON-001, Art. 6º). Nela, uma etapa pode ser antecipada ou pulada, mediante registro imediato do débito de processo na Memória Organizacional e regularização posterior obrigatória.
* **REQs derivados dentro de agrupamento já analisado:** não exigem nova ANL — a análise vale para a capacidade, não para cada requisito individual.

### Não retroatividade

* A CAP-01 (REQ-001, REQ-002, REQ-003) permanece válida como foi desenvolvida.
* O fluxo é obrigatório para as capacidades iniciadas após a aprovação desta ADR. Se a segunda etapa da CAP-01 (ex.: ciclo de vida normativo, conformidade) for aberta no futuro, ela seguirá o fluxo a partir da etapa cabível.

### Consequências da não observância

* Artefato produzido fora do fluxo é **não oficial**: não recebe status Aprovado no catálogo e não pode fundamentar a etapa seguinte (REQ sem ANL da capacidade não avança para arquitetura; implementação sem REQ aprovado é suspensa ou revertida até regularização; validação sem evidência não encerra ciclo).
* Toda violação detectada é registrada na Memória Organizacional com os cinco campos do Art. 8º. A consequência primária é rastro, não punição: nenhum desvio pode ser silencioso.

## Alternativas consideradas

* **Manter o processo informal:** rejeitado — a diferença de resultado entre CAP-01 (retrabalho de escopo) e CAP-04 (fronteiras resolvidas antes do primeiro REQ) evidenciou o custo da informalidade.
* **ADR obrigatória em toda capacidade:** rejeitado — fabricaria documentos vazios quando a ANL não revela decisão estrutural, violando o princípio 1 (respeito ao tempo).
* **Retroatividade sobre a CAP-01:** rejeitado — reprocessar o que já foi aprovado não produz valor; a lição está registrada nesta ADR.

## Rastreabilidade

- Norma superior: CON-001 Art. 5º §2º, 6º, 8º e 9º (princípio 1).
- Origem: proposta do Engenheiro (21/07/2026) aprovada pelo CTO com três decisões incorporadas (alçada de emergência, ADR condicional, não retroatividade) e acréscimo da etapa de Validação.
- Relaciona-se com: ADR-005 (tipo ANL); TEMPLATE-REQ (ADR-003); CAP-001 e CAP-002 (ordem das capacidades).
- Gera: fluxo obrigatório para os REQs da CAP-04 em diante.

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Redação com as três decisões do CTO incorporadas | Autorização do CTO | Aprovada com um ajuste |
| 1.0 | 21/07/2026 | CTO revisou; Usuário aprovou | Etapas explicitadas como gates de governança: cada etapa só autoriza a seguinte após aprovação | Revisão final do CTO | **Aprovada — fluxo oficial em vigor** |
