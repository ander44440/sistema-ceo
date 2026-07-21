# REQ-011 — Vínculo de Distribuição

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança (Distribuição de Governança, Grupo B — ANL-004 §10; sequência oficial ADR-013, Decisão 2)

## Enunciado

O CEO deverá garantir que todo agente conectado (CNC-005) receba integralmente o pacote de governança vigente (REQ-010) durante toda a vigência de seu vínculo: a obrigação de distribuição **nasce com o estabelecimento do vínculo**, **permanece durante sua vigência** e **cessa com seu encerramento**.

**Conceito referenciado:** *agente conectado*, conforme CNC-005 (referência qualificada — ARQ-001 A4; ARQ-002 A5). Transcrição informativa, não vinculante: "todo agente — humano ou de inteligência artificial — que possui vínculo formal e vigente com o CEO, estabelecido e encerrado por decisão sob governança (CNC-001), pelo qual passa a estar sujeito às normas de governança vigentes da organização, independentemente da ferramenta pela qual atue."

## Tipo

Funcional; alto nível.

## Justificativa

O REQ-001 exige que "qualquer agente conectado" receba a Constituição e as regras de governança vigentes, e o REQ-010 definiu **o que** se distribui; falta o elo que determina **para quem e enquanto durar o quê**: os efeitos organizacionais do vínculo para a distribuição (ANL-004 §10, Grupo B — início, recepção obrigatória, cessação). Sem este requisito, a obrigação de distribuir não tem sujeito objetivamente determinável: o canal não saberia quando um agente passa a ter direito ao pacote nem quando deixa de tê-lo, e a recepção poderia ser tratada como opcional ou seletiva. A pré-condição vinculante do grupo foi satisfeita em 21/07/2026 com o registro do CNC-005 (ADR-013, Decisão 3: nenhum REQ utiliza "agente conectado" em critérios de aceitação antes do registro). Responsabilidade única deste requisito: **os efeitos organizacionais do vínculo para a distribuição**; a entrega e propagação (Grupo C) e o rastro dos atos de distribuição (Grupo D) são de requisitos posteriores.

## Critérios de aceitação

* **Início da obrigação:** o estabelecimento do vínculo de agente conectado — decisão sob governança, nos termos do CNC-005 — faz nascer, no mesmo ato, a obrigação de distribuir ao agente o pacote de governança vigente; nenhum agente conectado permanece fora do alcance da distribuição.
* **Obrigação durante a vigência:** enquanto o vínculo estiver vigente, o agente conectado recebe o pacote de governança **completo**, conforme a composição vigente definida pelo REQ-010; nenhum agente conectado recebe subconjunto não autorizado do pacote — a composição é decisão de governança, nunca escolha do canal ou do agente (ANL-004 §8, garantia 2).
* **Recepção não opcional:** a recepção do pacote é efeito obrigatório do vínculo, não faculdade do agente: estar vinculado e estar alcançado pela distribuição são inseparáveis (CON-001, Art. 7º §3º — "qualquer agente conectado").
* **Universalidade e independência de ferramenta:** a obrigação vale igualmente para todo agente conectado — humano ou de inteligência artificial — e não depende de fornecedor, ferramenta ou forma de acesso (REQ-001, critério 2; CON-001, Art. 7º §2º).
* **Cessação da obrigação:** o encerramento do vínculo — decisão sob governança, nos termos do CNC-005 — faz cessar a obrigação de distribuição ao agente; a cessação não tem efeito retroativo: não invalida distribuições realizadas durante a vigência nem apaga os rastros produzidos.
* **Determinabilidade objetiva:** em qualquer instante é objetivamente determinável, a partir das decisões sob governança que estabeleceram e encerraram vínculos, quais agentes estão alcançados pela obrigação de distribuição.
* **Subordinação ao conceito registrado:** quem é agente conectado é determinado exclusivamente pela definição vigente do CNC-005, resolvida conforme o REQ-008; este requisito não define, não estende e não restringe o conceito.

## Fora do escopo

* **Mecanismos de entrega, correspondência de versão em trânsito, propagação de atualizações, sincronização, cache e comportamento na indisponibilidade de fonte** — Grupo C da Distribuição (ANL-004 §10).
* **Registro e rastreabilidade dos atos de distribuição** — Grupo D. (O rastro do ato de estabelecimento ou encerramento do vínculo já decorre da própria definição do CNC-005: decisão sob governança, com os cinco campos da Memória Organizacional.)
* **Composição do pacote de governança e integridade de origem** — REQ-010 (Grupo A).
* **Definição, evolução ou resolução do conceito "agente conectado"** — Mecanismo de Conceitos Organizacionais (REQ-006 a REQ-009); este requisito apenas o consome por referência.
* **Definição de quais alçadas estabelecem ou encerram vínculos** — responsabilidade da governança vigente; este requisito exige a decisão sob governança, não redefine quem a toma (padrão do REQ-006/REQ-009).
* **Tecnologia, arquitetura, implementação e qualquer materialização do vínculo ou do canal** — etapas posteriores do fluxo (ADR-006), observada a fronteira documental × técnica ratificada para o ciclo (ADR-013, Decisão 4).
* **Materialização do registro canônico de normas** — Frente 2 do ciclo (ADR-013, Decisão 2).

## Dependências

* **CNC-005** — referência normativa exclusiva do destinatário da distribuição (registrado e vigente desde 21/07/2026; pré-condição da ADR-013, D3, satisfeita).
* **REQ-010** — definição do pacote de governança cuja recepção este requisito torna efeito obrigatório do vínculo.
* **REQ-001** — requisito de alto nível da distribuição, do qual o Grupo B deriva (critérios 1 e 2).
* **ADR-013** — Decisões 2 (sequência S2 e princípio de sincronização), 3 (precedência da admissão, cumprida) e 4 (fronteira de fase que este requisito observa).

## Riscos e incertezas

* **Obrigação especificada sem canal materializado:** até que o ciclo alcance Arquitetura e Implementação, a obrigação de distribuição é satisfazível apenas no plano da especificação. Mitigação: o princípio de sincronização da ADR-013 (D2) condiciona a implementação do canal à prontidão das fontes; limitação declarada (CON-001, Art. 9º, princípio 8).
* **Ausência de vínculos formalmente constituídos no estado atual:** a organização ainda não registrou decisões sob governança estabelecendo vínculos de agente conectado; os participantes atuais operam sob os papéis da CON-001 (Art. 6º) sem ato formal de vínculo. A constituição dos vínculos é matéria das alçadas de governança e de etapas posteriores do ciclo — limitação declarada; este requisito define os efeitos do vínculo, não constitui vínculo algum.
* **Deslizamento de escopo para a entrega:** "receber o pacote" convida a especificar como o pacote chega — matéria do Grupo C. Mitigação: fronteiras explícitas no "fora do escopo" (padrão consolidado; ANL-004 §9.1).
* **Acoplamento à evolução do conceito:** se a definição do CNC-005 evoluir (REQ-007), o alcance deste requisito muda por consequência. Trata-se de comportamento desejado — subordinação à autoridade semântica —, não de defeito: o critério de subordinação torna o acoplamento explícito e governado.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º, 7º (em especial §2º e §3º), 8º; VIS-001 §5 (escopo: governar — distribuir); ADR-013 v1.0 |
| Origem | ANL-004 v1.0 (§5, §8, §10 — Grupo B); ADR-013 (Decisões 2 e 3); recomendação técnica aprovada e autorização de abertura do gate pelo CTO (21/07/2026) |
| Dependências | CNC-005; REQ-010; REQ-001; ADR-013 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, formalizando os efeitos organizacionais do vínculo (início, vigência, cessação) com o destinatário referenciado exclusivamente pelo CNC-005 | Autorização do CTO na aprovação da recomendação técnica — abertura do Grupo B da Distribuição | Aprovado com um ajuste editorial |
| 1.0 | 21/07/2026 | CTO revisou e homologou; Engenheiro aplicou o ajuste | Enunciado harmonizado com os critérios: "receba **integralmente** o pacote de governança vigente" | Revisão do CTO — explicitar no enunciado a obrigação sobre a integralidade do pacote | **Aprovado — primeiro requisito do Grupo B da Distribuição de Governança** |
