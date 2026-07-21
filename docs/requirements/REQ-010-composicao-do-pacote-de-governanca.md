# REQ-010 — Composição do pacote de governança

> **Status:** Aprovado
> **Versão:** 1.0 — 21/07/2026
> **Capacidade:** CAP-01 — Governança (Distribuição de Governança, Grupo A — ANL-004 §10; gate aberto pela ADR-013)

## Enunciado

O CEO deverá manter oficialmente definido o pacote de governança destinado à distribuição, composto pela Constituição, pelas normas de governança vigentes e pelos conceitos organizacionais vigentes, cada elemento proveniente exclusivamente de sua fonte canônica e correspondente à versão vigente nela registrada.

## Tipo

Funcional; alto nível.

## Justificativa

A distribuição de governança (REQ-001) pressupõe que exista, com definição oficial, **o que** se distribui. A ANL-004 (§4) constatou que a composição do pacote tinha amparos desiguais — normativo para Constituição e normas, apenas arquitetural e preparatório para os conceitos — e a ADR-013 (Decisão 1) decidiu a composição, delegando a este requisito sua formalização como obrigação verificável. Sem este requisito, o canal de distribuição não tem objeto definido: cada entrega poderia recompor o pacote informalmente, e a inclusão dos conceitos permaneceria sem exigência normativa — reabrindo a ambiguidade registrada desde a ANL-003 (§6). Responsabilidade única deste requisito: **a composição do pacote e sua integridade de origem**; o vínculo dos destinatários (Grupo B), a entrega e propagação (Grupo C) e o rastro da distribuição (Grupo D) são de requisitos posteriores.

## Critérios de aceitação

* O pacote de governança é composto, no estado atual da organização, exatamente por três categorias de conteúdo: a Constituição (CON-001), as normas de governança vigentes e os conceitos organizacionais vigentes (ADR-013, Decisão 1).
* Cada elemento do pacote provém exclusivamente de sua fonte canônica: a Constituição do documento canônico sob o catálogo oficial; as normas do registro canônico de normas (REQ-002); os conceitos da autoridade semântica oficial (REQ-006), pela resolução (REQ-008).
* Todo conteúdo incluído no pacote corresponde à versão vigente na respectiva fonte canônica no momento da composição; nenhum conteúdo com status Substituído integra o pacote.
* A composição vigente do pacote é determinável objetivamente em qualquer instante: quais elementos o compõem, de qual fonte cada um provém e qual versão de cada um está incluída.
* Toda alteração da composição do pacote — inclusão ou exclusão de categoria de conteúdo — deverá decorrer de deliberação formal de governança registrada na Memória Organizacional e ser posteriormente formalizada por atualização deste requisito, conforme o fluxo oficial da organização.
* Todo artefato derivado do pacote é espelho subordinado às fontes canônicas: em qualquer divergência entre o conteúdo distribuído e a fonte, prevalece a fonte (precedência — padrão do REQ-002, estendido ao pacote).

## Fora do escopo

* Vínculo dos destinatários — quem recebe o pacote e o ciclo desse vínculo — Grupo B da Distribuição (após o registro do conceito "Agente Conectado" — ADR-013, Decisão 3).
* Entrega, propagação de atualizações e comportamento na indisponibilidade de fonte — Grupo C.
* Registro e rastreabilidade dos atos de distribuição — Grupo D.
* Materialização do registro canônico de normas — Frente 2 do ciclo (ADR-013, Decisão 2), pelo fluxo próprio.
* Resolução da vigência nas fontes — REQ-003 (normas) e REQ-008 (conceitos).
* Detecção de divergência entre fontes canônicas e espelhos — candidata à CAP-09 (registrada no REQ-002).
* Formato, estrutura, empacotamento e qualquer materialização do pacote — decisões de arquitetura (etapa posterior do fluxo, observada a fronteira documental × técnica da ADR-013, Decisão 4).

## Dependências

* **ADR-013** (Decisões 1, 2 e 4) — composição decidida, sequência S2 e fronteira de fase que este requisito formaliza e observa.
* **REQ-002** — fonte canônica das normas: a exigência de proveniência canônica pressupõe o registro que o REQ-002 especifica; sua materialização corre na Frente 2 (princípio organizacional de sincronização — ADR-013, Decisão 2).
* **REQ-006 e REQ-008** — fonte canônica e resolução dos conceitos organizacionais (operacionais desde 21/07/2026).
* **REQ-001** — requisito de alto nível da distribuição, do qual o Grupo A deriva; este requisito define o objeto que o canal do REQ-001 distribuirá.

## Riscos e incertezas

* **Fonte de normas ainda não materializada:** até a conclusão da Frente 2, o critério de proveniência canônica das normas é satisfazível apenas no plano da especificação. Mitigação: o princípio de sincronização da ADR-013 (D2) impede a implementação do canal antes da disponibilidade operacional das fontes; limitação declarada (CON-001, Art. 9º, princípio 8).
* **Composição congelada em requisito:** fixar as três categorias no enunciado poderia exigir emenda a cada evolução do pacote. Mitigação: o enunciado registra o estado atual decidido pela ADR-013, e o critério de alteração por deliberação registrada dá o caminho de evolução sem ambiguidade.
* **Deslizamento de escopo para o canal:** critérios de entrega e propagação não pertencem a este requisito. Mitigação: fronteiras explícitas no "fora do escopo" (padrão consolidado; ANL-004 §9.1).
* **Vocabulário dos destinatários pendente:** este requisito evita deliberadamente o termo "agente conectado" em enunciado e critérios (ADR-013, D3); a menção aos destinatários ficará objetiva a partir do Grupo B, com o conceito registrado.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º, 7º (em especial §3º e §4º), 8º; VIS-001 §5 (escopo: governar — distribuir); ADR-013 v1.0 |
| Origem | ANL-004 v1.0 (§4, §10 — Grupo A); ADR-013 (Decisão 1 — encaminhamento ao primeiro REQ do Grupo A); autorização do CTO na homologação da ADR-013 (21/07/2026) |
| Dependências | ADR-013; REQ-001; REQ-002; REQ-006; REQ-008 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, formalizando no enunciado a composição decidida pela ADR-013 (D1) | Autorização do CTO na homologação da ADR-013 — abertura do Grupo A da Distribuição | Aprovado com um ajuste de redação |
| 1.0 | 21/07/2026 | CTO revisou e homologou; Engenheiro aplicou o ajuste | Critério de alteração da composição reformulado: deliberação formal de governança registrada na Memória Organizacional, com formalização posterior por atualização deste requisito pelo fluxo oficial | Revisão do CTO — separar a decisão estrutural (ADR) da formalização normativa (REQ); a deliberação, por si só, não altera o requisito | **Aprovado — primeiro requisito do Grupo A da Distribuição de Governança** |
