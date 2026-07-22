# REQ-012 — Entrega e propagação do pacote de governança

> **Status:** Aprovado
> **Versão:** 1.0 — 22/07/2026
> **Capacidade:** CAP-01 — Governança (Distribuição de Governança, Grupo C — ANL-004 §10; sequência oficial ADR-013, Decisão 2)

## Enunciado

O CEO deverá garantir que toda **entrega** (disponibilização) do pacote de governança (REQ-010) aos agentes conectados alcançados pela obrigação de distribuição (REQ-011) corresponda à versão vigente determinada pela respectiva fonte canônica, que toda **propagação** (disseminação das atualizações ao conjunto de agentes alcançados) preserve consistência entre eles, e que a indisponibilidade de uma fonte canônica seja tratada como condição declarada — nunca suprida por conteúdo cuja vigência não possa ser determinada pela fonte.

**Distinção terminológica:** neste requisito, *entrega* é a disponibilização do pacote a um agente alcançado; *propagação* é a disseminação das atualizações de vigência ao conjunto de agentes alcançados. As duas obrigações são complementares e distintas.

## Tipo

Funcional; alto nível.

## Justificativa

O REQ-010 definiu **o que** se distribui e o REQ-011, **para quem e enquanto durar o quê**; falta a qualidade organizacional da entrega: **como o que chega se mantém correspondente ao que vige**. Sem este requisito, a obrigação de distribuição do REQ-011 poderia ser formalmente cumprida entregando conteúdo desatualizado — um agente receberia "o pacote" sem receber o pacote *vigente*, exatamente a condição que o REQ-001 veio eliminar (critérios 3 e 4: propagação consistente de atualizações e correspondência entre a versão distribuída e a versão vigente no registro canônico). O espelho atual (`.cursor/rules/projeto-ceo.mdc`) ilustra o problema: atualiza-se por diligência manual, sem obrigação de correspondência nem propagação — regime que o REQ-001 classifica como temporário e subordinado. Responsabilidade única deste requisito: **as obrigações organizacionais de correspondência de versão, propagação de atualizações e comportamento diante da indisponibilidade de fonte**; o rastro dos atos de distribuição é do Grupo D, e toda materialização é de etapas posteriores.

## Critérios de aceitação

* **Correspondência de versão na entrega:** a correspondência de versão deverá ser verificada em relação à versão vigente da fonte canônica. Todo conteúdo entregue a um agente conectado corresponde à versão vigente na respectiva fonte canônica no momento da entrega, determinada exclusivamente pela resolução própria de cada fonte (normas — REQ-003; conceitos — REQ-008); nenhum conteúdo com status Substituído é entregue como vigente (REQ-001, critério 4; ANL-004 §8, garantia 1). A vigência não é relativa entre agentes: a fonte canônica é o único referencial.
* **Versão identificada:** toda entrega identifica, para cada elemento do pacote, qual versão está sendo disponibilizada e de qual fonte canônica provém — condição para que a correspondência com a vigência seja objetivamente verificável (REQ-010, critério de determinabilidade da composição).
* **Propagação consistente:** toda alteração de vigência em fonte canônica de elemento do pacote — nova versão, substituição ou perda de vigência — deve ser disseminada a todos os agentes conectados com vínculo vigente (REQ-011); a propagação não é seletiva: nenhum agente é excluído de uma atualização que lhe seja aplicável (ANL-004 §8, garantia 3).
* **Defasagem sempre detectável:** nenhum agente conectado permanece indefinidamente com conteúdo substituído **sem que essa defasagem seja detectável**: a combinação de versão identificada na entrega e vigência resolúvel na fonte torna a defasagem objetivamente determinável a qualquer instante. (A instituição de auditoria ativa de divergência permanece fora deste requisito — candidata à CAP-09.)
* **Neutralidade temporal:** a conformidade organizacional independe do instante da atualização, desde que a defasagem permaneça identificável e a propagação preserve consistência. Este requisito não exige sincronização instantânea nem simultaneidade entre agentes.
* **Indisponibilidade declarada, nunca silenciosa:** quando uma fonte canônica estiver indisponível ou sua vigência não for resolúvel, essa condição é tratada como estado declarado da distribuição — jamais ocultada, presumida como normal ou contornada silenciosamente.
* **Nenhum conteúdo presumido:** diante da indisponibilidade de fonte, o canal não compõe, não reconstrói e não disponibiliza conteúdo cuja vigência não possa ser determinada pela fonte canônica; conteúdo já entregue permanece regido pela precedência das fontes (REQ-010: em divergência, prevalece a fonte).
* **Independência de ferramenta:** as obrigações de correspondência e propagação não dependem de fornecedor, ferramenta ou forma de acesso do agente (REQ-001, critério 2; CON-001, Art. 7º §2º).

## Fora do escopo

* **Protocolos, sincronização técnica, cache, armazenamento, formato de empacotamento e qualquer mecanismo técnico de entrega ou propagação** — implementação técnica futura: especificação em arquitetura na fase atual, implementação explicitamente remetida a fase posterior (ADR-013, Decisão 4).
* **Registro e rastreabilidade dos atos de distribuição** (o que foi entregue, a quem, quando, em que versão — como comprovação histórica) — Grupo D da Distribuição (ANL-004 §10).
* **Auditoria ativa e detecção sistemática de divergência entre fontes canônicas e espelhos** — candidata à CAP-09 (Observabilidade), adiamento registrado no REQ-002, no REQ-007 e no REQ-008; este requisito exige apenas que a defasagem seja *detectável*, não institui o mecanismo que a detecta.
* **Composição do pacote e integridade de origem** — REQ-010 (Grupo A).
* **Efeitos do vínculo — início, vigência e cessação da obrigação de distribuição** — REQ-011 (Grupo B).
* **Resolução da vigência nas fontes** — REQ-003 (normas) e REQ-008 (conceitos).
* **Materialização do registro canônico de normas** — Frente 2 do ciclo (ADR-013, Decisão 2), pelo fluxo próprio.
* **Destino do espelho `.cursor/rules/projeto-ceo.mdc`** — matéria da implementação do canal, sob o regime provisório registrado no REQ-001 e na ANL-004 (§7).

## Dependências

* **REQ-010** — o pacote cuja entrega e atualização este requisito disciplina; fornece a determinabilidade da composição que a identificação de versão pressupõe.
* **REQ-011** — define quem está alcançado pela obrigação: a propagação consistente aplica-se aos agentes com vínculo vigente.
* **REQ-001** — critérios 3 e 4, dos quais este requisito deriva diretamente; critério 2 (independência de ferramenta).
* **ADR-013** — Decisão 2 (princípio de sincronização: a implementação do canal permanece condicionada à disponibilidade operacional das fontes) e Decisão 4 (fronteira documental × técnica observada nesta redação).
* **REQ-003 e REQ-008** — resolução da vigência nas fontes, que os critérios de correspondência consomem (materializada para conceitos; para normas, acompanha a Frente 2).

## Riscos e incertezas

* **Fonte de normas ainda não materializada:** até a conclusão da Frente 2, correspondência e propagação para a parcela de normas são satisfazíveis apenas no plano da especificação (ANL-004 §6.1, D1). Mitigação: princípio de sincronização da ADR-013 (D2) — o canal não implementa sem as fontes prontas; limitação declarada (CON-001, Art. 9º, princípio 8).
* **Canal sem auditoria ativa:** exigir defasagem *detectável* sem instituir quem a detecta significa operar, no curto prazo, confiando na propagação sem verificação independente — risco aceito e registrado pela quarta vez (REQ-002, REQ-007, REQ-008; ANL-004 §9.4); permanece declarado até a deliberação sobre a CAP-09.
* **Deslizamento técnico:** "propagação" e "indisponibilidade" convidam a especificar mecanismos (notificação, polling, cache, retry) — matéria vedada nesta etapa. Mitigação: critérios redigidos como obrigações organizacionais verificáveis; fronteiras explícitas no "fora do escopo" (ADR-013, D4).
* **Janela entre vigência e propagação:** nenhuma propagação é instantânea; o requisito exige consistência e detectabilidade, não simultaneidade — princípio de neutralidade temporal nos critérios de aceitação. A tolerância temporal admissível é decisão de arquitetura e das alçadas — deliberadamente não fixada aqui; o que este requisito veda é a defasagem *indefinida e indetectável*.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001 Art. 5º, 7º (em especial §2º e §3º), 8º; VIS-001 §5 (escopo: governar — distribuir); ADR-013 v1.0 |
| Origem | ANL-004 v1.0 (§8 — garantias 1, 3, 5 e 6; §10 — Grupo C); ADR-013 (Decisão 2); recomendação técnica aprovada e autorização de abertura do gate pelo CTO (21/07/2026, após confirmação do encerramento do Grupo B) |
| Dependências | REQ-010; REQ-011; REQ-001; ADR-013; REQ-003; REQ-008 |
| Decisões derivadas | — |
| Implementação | — (não iniciada) |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Criação, formalizando as três obrigações do Grupo C: correspondência de versão, propagação consistente e comportamento na indisponibilidade de fonte | Autorização do CTO na confirmação do encerramento do Grupo B — abertura do Grupo C da Distribuição | Aprovado pelo CTO com ajustes pontuais |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Explicitada a fonte canônica como referencial único de vigência; distinção entrega × propagação; princípio de neutralidade temporal | Revisão técnica do CTO — precisão conceitual sem alteração de escopo | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Incorporação ao acervo normativo da Frente 1; Grupo C concluído | Homologação da Governança — Grupo C (Entrega e Propagação) | **Aprovado — primeiro requisito do Grupo C da Distribuição de Governança** |
