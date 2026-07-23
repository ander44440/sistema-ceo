# REQ-015 — Preservação do conhecimento organizacional

> **Status:** Aprovado (Homologado pela Governança)
> **Versão:** 1.0 — 23/07/2026
> **Capacidade:** CAP-04 — Gestão do Conhecimento (Grupo B — ANL-001 v1.1)

## Enunciado

O CEO deverá preservar o acervo de conhecimento organizacional — entendida a **preservação** como a **permanência do patrimônio de conhecimento ao longo do tempo**, independentemente de agentes, sessões ou ferramentas, e distinta da curadoria (REQ-014) — de modo que cada item de conhecimento registrado (CNC-002; REQ-004) sobreviva à troca de sessões, agentes e ferramentas; mantenha integridade do conteúdo e dos metadados registrados; e disponha de versionamento do **conteúdo** que torne recuperáveis as versões anteriores, sem criar novo item nem alterar a identidade institucional ou o identificador permanente, independentemente da plataforma em que o conhecimento tenha sido produzido ou consultado.

**Conceito referenciado:** *item de conhecimento* — **[CNC-002](../concepts/CNC-002-item-de-conhecimento.md)**.

## Tipo

Funcional; alto nível.

## Justificativa

**Preservação**, neste requisito, significa a **permanência do patrimônio de conhecimento ao longo do tempo**, independentemente de agentes, sessões ou ferramentas. Distingue-se da **curadoria** (Grupo D / REQ-014), que governa a aptidão operacional (válido para uso ou não), sem garantir por si a sobrevivência do acervo.

Os Grupos A, C e D definiram o que é um item, como recuperá-lo no contexto certo e como governar sua validade. Sem preservação, esse patrimônio permanece frágil: o que nasce em uma conversa, sessão ou ferramenta pode morrer com ela — violando ADR-002 (Decisão 5) e o princípio de que o conhecimento pertence ao CEO, não às ferramentas (ANL-001 §5).

A ordem oficial da ANL-001 (A → C → D → B) coloca a preservação por último porque ela protege um patrimônio cujo modelo de uso (estrutura, recuperação e curadoria) já está definido.

Responsabilidade única: **garantir sobrevivência, integridade e versionamento do acervo**; estruturação, recuperação e curadoria permanecem nos REQ-004, REQ-005 e REQ-014.

## Critérios de aceitação

* **Sobrevivência independente de sessão:** o registro de um item de conhecimento (REQ-004) permanece disponível após o encerramento da sessão, conversa ou contexto de trabalho (CNC-003) em que tenha sido produzido ou consultado; a interrupção da sessão não implica perda do item.
* **Sobrevivência independente de agente:** a substituição, ausência ou troca do agente (humano ou de inteligência artificial) que produziu ou consultou o item não elimina o registro nem o torna irrecuperável.
* **Sobrevivência independente de ferramenta:** as obrigações de preservação não dependem de fornecedor, ferramenta ou forma de acesso (CON-001, Art. 7º §2º; ADR-002, Decisão 5); o conhecimento registrado permanece patrimônio do CEO quando a ferramenta de origem deixa de ser usada.
* **Integridade:** o conteúdo e os metadados registrados do item (identificador, classificação, origem, relacionamentos e estado de validade — REQ-004 / REQ-014) não são alterados de forma silenciosa ou não rastreável. Alterações **autorizadas** permanecem possíveis, desde que sejam rastreáveis e preservem o histórico; este critério **não** impõe imutabilidade absoluta do conteúdo.
* **Versionamento do conteúdo:** alterações do **conteúdo** de um item produzem versões sucessivas sob o **mesmo** identificador permanente (REQ-004). Uma nova versão **não** constitui um novo item: a identidade institucional e o identificador permanente permanecem; apenas o conteúdo versionado evolui.
* **Recuperabilidade histórica:** versões anteriores do conteúdo de um item permanecem recuperáveis a partir do identificador permanente; a curadoria que classifica o item como não apto (REQ-014) não apaga as versões nem o identificador. A recuperação de uma versão histórica **não** implica que essa versão seja automaticamente válida para uso — a validade continua sendo governada **exclusivamente** pelo REQ-014.
* **Independência de representação:** a obrigação de preservar vale independentemente da forma de representação futura do acervo; nenhuma formulação deste requisito pressupõe formato, mídia ou tecnologia específica.

## Fora do escopo

* Estrutura do registro, identificação, classificação, origem e relacionamentos — REQ-004 (Grupo A).
* Determinação e entrega contextual do conhecimento aplicável — REQ-005 (Grupo C).
* Governança do estado de validade, obsolescência, deduplicação e depuração operacional — REQ-014 (Grupo D); este requisito preserva o que a curadoria governa, sem redefinir aptidão.
* Fronteiras formais adicionais com CAP-05 / insumos CAP-06 e CAP-12 — Grupo E (deliberação futura).
* Registros históricos de fatos, decisões e eventos — CAP-05 (Memória Organizacional).
* Normas de governança e sua vigência — CAP-01 (REQ-002, REQ-003).
* Conceitos organizacionais — mecanismo de conceitos (REQ-006 a REQ-009); conceitos não são itens de conhecimento (ADR-007).
* Backup técnico, replicação, mídia, formatos, algoritmos de integridade, políticas de retenção física e qualquer implementação — decisões de arquitetura (ADRs futuros).

## Dependências

* **REQ-004** — define o registro estruturado e o identificador permanente do que se preserva.
* **REQ-014** — governa a aptidão operacional e a validade para uso; a preservação garante sobrevivência e histórico sem substituir essa governança.
* **CNC-002** — objeto preservado (*item de conhecimento*).
* **REQ-005** — consumidora do acervo preservado; não impõe mecanismos de sobrevivência.

## Riscos e incertezas

* **Preservação especificada sem acervo materializado:** até a implementação, a obrigação é satisfazível no plano da especificação — limitação de fase (CON-001, Art. 9º, princípio 8).
* **Deslizamento para solução técnica:** “sobreviver” convida a especificar backup ou banco. Mitigação: fora do escopo explícito; independência de representação (padrão do REQ-003).
* **Confusão com curadoria:** preservar versões de item não apto pode parecer contradizer a depuração. Mitigação: REQ-014 separa aptidão operacional de identidade; este requisito confirma a sobrevivência do histórico e que versão antiga ≠ automaticamente válida para uso.
* **Versionamento vs. novo item:** dúvida sobre quando alterar conteúdo (nova versão) ou registrar item distinto. Mitigação: mesma identidade e identificador para evolução de conteúdo do mesmo conhecimento reutilizável; item distinto somente quando for conhecimento reutilizável diferente (REQ-004 / CNC-002) — detalhe operacional pode ser refinido em arquitetura sem reabrir este enunciado.
* **Grupo E pendente:** vínculos finos com CAP-05 não são antecipados.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-04 — Gestão do Conhecimento |
| Norma superior | CON-001 Art. 3º, 4º (pilar Conhecimento), 7º §2º, 9º (princípios 1 e 8); VIS-001 §4; ADR-002 Decisão 5 |
| Origem | ANL-001 v1.1 (Grupo B; ordem A → C → D → B); deliberação do CTO — abertura do gate Grupo B (23/07/2026); REQ-014 v1.0 homologado |
| Dependências | REQ-004; REQ-014; CNC-002; REQ-005 (consumidora) |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — sobrevivência, integridade e versionamento independentes de ferramenta | Autorização do CTO — abertura do REQ Grupo B (CAP-04); ANL-001 v1.1 | Em análise — revisão técnica do CTO |
| 0.2 | 23/07/2026 | Engenheiro (Cursor) | AJ-01 a AJ-05: conceituar preservação; versionamento ≠ novo item; integridade sem imutabilidade absoluta; recuperabilidade ≠ validade; justificativa em parágrafos | Parecer CTO — aprovado com ajustes | Ajustes aplicados |
| 0.2 | 23/07/2026 | CTO | Homologação técnica — AJ-01 a AJ-05 confirmados; escopo intacto | Revisão técnica do REQ-015 v0.2 | Aprovado — encaminhado à Governança |
| 1.0 | 23/07/2026 | Governança homologou | Incorporação ao acervo normativo da CAP-04 (Grupo B) | Deliberação da Governança — Batch Gate REQ-015; parecer CTO favorável | **Homologado — requisito institucional vigente** |
