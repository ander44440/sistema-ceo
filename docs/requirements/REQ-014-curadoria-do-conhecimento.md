# REQ-014 — Curadoria do conhecimento organizacional

> **Status:** Aprovado (Homologado pela Governança)
> **Versão:** 1.0 — 23/07/2026
> **Capacidade:** CAP-04 — Gestão do Conhecimento (Grupo D — ANL-001 v1.1)

## Enunciado

O CEO deverá governar a atualidade do acervo de conhecimento organizacional de modo que o estado de validade de cada item de conhecimento (CNC-002; REQ-004) seja atribuído, alterado e revisado exclusivamente por decisão sob governança; que nenhum item inválido ou obsoleto seja entregue como válido; e que duplicidades e depurações do acervo sejam resolvidas de forma rastreável.

**Conceito referenciado:** *item de conhecimento* — **[CNC-002](../concepts/CNC-002-item-de-conhecimento.md)**.

## Tipo

Funcional; alto nível.

## Justificativa

O REQ-004 exige que todo item registre um estado de validade, mas delega explicitamente a este grupo as regras de atribuição, alteração, aprovação e revisão desse estado. O REQ-005 recupera e informa o estado — sem decidir quando um item deixa de valer nem quando deve ser excluído ou despriorizado.

Sem curadoria, o acervo cresce sem depuração (ANL-001 §5): volume vira ruído (CON-001, Art. 9º, princípio 1) e conhecimento obsoleto pode ser tratado como válido — análogo ao risco que o REQ-003 elimina para normas. A ordem oficial da ANL-001 (A → C → D → B) coloca a curadoria imediatamente após a recuperação precisamente para fechar essa janela antes da preservação.

Responsabilidade única: **governar a validade, a obsolescência, a deduplicação e a depuração do acervo**; estruturação, recuperação e preservação permanecem nos demais grupos.

## Critérios de aceitação

* **Governança do estado de validade:** a atribuição inicial, a alteração e a revisão do estado de validade de qualquer item de conhecimento (REQ-004) ocorrem exclusivamente por decisão sob governança (CNC-001), com os cinco campos da Memória Organizacional (CON-001, Art. 8º); nenhum estado de validade é alterado por uso recorrente, convenção informal ou prática operacional.
* **Distinção observável:** o estado de validade registrado permite distinguir, em qualquer instante, se o item está **apto a ser tratado como válido para uso** ou **não apto**. **“Não apto”** é uma **categoria lógica** que agrupa os itens que não podem ser tratados como válidos; estados específicos (por exemplo, “obsoleto”, “inválido”, “substituído” ou equivalentes) constituem matéria de arquitetura, não deste requisito — desde que a distinção apto / não apto seja determinável.
* **Nunca entregar como válido:** nenhum item cuja categoria lógica seja não apto é entregue, apresentado ou fundamentado como conhecimento válido; a recuperação (REQ-005) consome essa regra — informar o estado não autoriza tratar o não apto como válido.
* **Obsolescência:** quando o conhecimento deixar de refletir a realidade organizacional vigente para o **propósito** a que se destina, seu estado de validade é atualizado para a categoria lógica não apto mediante decisão sob governança; permanecer na categoria apto após obsolescência reconhecida viola este requisito.
* **Deduplicação:** quando dois ou mais itens vigentes representam o mesmo conhecimento reutilizável de forma redundante, a organização registra uma decisão sob governança que resolve a duplicidade (qual permanece apto, quais passam à categoria não apto, ou equivalência explícita). Toda duplicidade identificada deverá possuir resolução registrada sob governança.
* **Depuração do acervo:** itens na categoria lógica não apto deixam de integrar o conjunto utilizável como válido. A depuração altera apenas a aptidão operacional do item, não sua identidade institucional nem seu identificador permanente (REQ-004); não redefine preservação/integridade entre sessões e ferramentas (Grupo B).
* **Rastreabilidade da curadoria:** toda decisão que altere estado de validade, resolva duplicidade ou depure o acervo permanece recuperável e vinculada aos identificadores dos itens afetados.
* **Independência de ferramenta:** as obrigações deste requisito não dependem de fornecedor, ferramenta ou forma de acesso (CON-001, Art. 7º §2º; ADR-002, Decisão 5).

## Fora do escopo

* Estrutura do registro, identificação, classificação, origem e relacionamentos — REQ-004 (Grupo A).
* Determinação e entrega contextual do conjunto aplicável — REQ-005 (Grupo C); este requisito apenas **governa** o estado que a recuperação informa e consome.
* Preservação do acervo entre sessões, agentes e ferramentas; integridade; versionamento do conteúdo dos itens — Grupo B da ANL-001 (requisito futuro).
* Fronteiras formais adicionais com CAP-05 / insumos CAP-06 e CAP-12 — Grupo E (deliberação futura, conforme CTO).
* Definição de quais alçadas tomam cada decisão de curadoria — responsabilidade da governança vigente; este requisito exige a decisão sob governança, não redefine quem a toma.
* Registros históricos de fatos, decisões e eventos — CAP-05 (Memória Organizacional).
* Normas de governança e sua vigência — CAP-01 (REQ-002, REQ-003).
* Conceitos organizacionais e sua evolução semântica — mecanismo de conceitos (REQ-006 a REQ-009); conceitos não são itens de conhecimento (ADR-007).
* Taxonomia concreta de estados, fluxos de trabalho, algoritmos de detecção de duplicidade, formatos e qualquer implementação — decisões de arquitetura (ADRs futuros).

## Dependências

* **REQ-004** — fornece o registro estruturado, o identificador permanente e a existência do estado de validade que este requisito governa.
* **REQ-005** — consome o estado de validade na entrega; a proibição de entregar como válido aplica-se ao que a recuperação disponibiliza.
* **CNC-002** — define o objeto curado (*item de conhecimento*).
* **CNC-001** — toda alteração de validade é decisão sob governança.

## Riscos e incertezas

* **Curadoria sem alimentação:** regras de validade existem, mas o acervo permanece vazio até a implementação — limitação de fase (CON-001, Art. 9º, princípio 8); este requisito especifica a obrigação, não a materializa.
* **Julgamento de obsolescência:** decidir se um item “ainda vale” para o seu propósito exige critério humano/organizacional. Mitigação: toda mudança de estado é decisão sob governança rastreável; casos ambíguos elevam-se à alçada competente.
* **Deduplicação subjetiva:** equivalência entre itens pode ser disputável. Mitigação: o requisito exige resolução registrada, não detecção automática perfeita; métodos de detecção são arquitetura.
* **Confusão com preservação (Grupo B):** “depurar” pode ser lido como apagar. Mitigação: fora do escopo explícito — identidade institucional e identificador permanente permanecem; sobrevivência técnica do acervo é Grupo B.
* **Acoplamento precoce ao Grupo E:** integração fina com CAP-05 pode parecer necessária. Mitigação: CTO manteve Grupo E pendente; este requisito não a antecipa.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 — Gestão do Conhecimento |
| Norma superior | CON-001 Art. 3º, 4º (pilar Conhecimento), 7º §2º, 8º, 9º (princípios 1 e 8); VIS-001 §4; ADR-002 Decisão 5 |
| Origem | ANL-001 v1.1 (Grupo D; ordem A → C → D → B); deliberação do CTO — abertura do gate Grupo D (23/07/2026); encerramento da suspensão operacional da ADR-007 |
| Dependências | REQ-004; REQ-005; CNC-002; CNC-001 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — validade, obsolescência, deduplicação e depuração do acervo | Autorização do CTO — abertura do REQ Grupo D (CAP-04); ANL-001 v1.1 | Em análise — revisão técnica do CTO |
| 0.2 | 23/07/2026 | Engenheiro (Cursor) | AJ-01 a AJ-05: categoria lógica “não apto”; deduplicação objetiva; obsolescência pelo propósito; depuração sem alterar identidade; justificativa em parágrafos | Parecer CTO — aprovado com ajustes | Em revisão — ajustes aplicados |
| 0.2 | 23/07/2026 | CTO | Homologação técnica — AJ-01 a AJ-05 confirmados; escopo intacto | Revisão técnica do REQ-014 v0.2 | Aprovado — encaminhado à Governança |
| 1.0 | 23/07/2026 | Governança homologou | Incorporação ao acervo normativo da CAP-04 (Grupo D) | Deliberação da Governança — parecer CTO favorável | **Homologado — requisito institucional vigente** |
