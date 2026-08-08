# REQ-074 — Governação de promoção e aptidão do Acervo

> **Status:** Aprovado · **congelado (Baseline CAP-04)** — IMP-070 Homologada 07/08/2026  
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento  
> **Implementação:** IMP-070-B3 **Homologado / Encerrado** — Baseline.

## Enunciado

O CEO deverá promover factos ao Acervo Oficial e alterar a aptidão dos itens exclusivamente pela cadeia de governação homologada — propor, validar, homologar (Usuário) e publicar — de modo que nenhum item se torne oficial ou deixe de ser apto por uso recorrente, inferência do modelo, estado da fila ou convenção informal, e que toda mudança de aptidão preserve a identidade do item e registe Memória Organizacional.

## Tipo

Funcional; alto nível.

## Justificativa

A ARQ-031 (D5) e a governação de 07/08 fecham as alçadas que o REQ-014 exige existir sem as nomear. Este requisito decompõe a **Governação do Acervo** da CAP-04, tornando as alçadas testáveis sem alterar REQ-014 nem a arquitectura.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-074-1** | Item só entra no índice como oficial após cadeia completa: proposta (Usuário/CTO/Engenheiro; CEO só candidato) → validação CTO (conformidade) → validação Usuário (domínio COA, se aplicável) → **homologação Usuário** → publicação Engenheiro. | Rastro do item: todos os passos presentes e ordenados = pass; falta qualquer passo = fail. |
| **CA-074-2** | Publicação sem homologação do Usuário **não** produz item oficial no índice. | Tentativa de publicação sem homologação: ausente do índice como oficial = pass. |
| **CA-074-3** | Mudança apto↔não apto só por decisão sob governação (CNC-001) com os cinco campos da Memória Organizacional (CON-001 Art. 8º). | Registo da mudança: quem/quando/quê/porquê/baseado em quê/resultado presentes = pass. |
| **CA-074-4** | Passagem a não apto por: obsolescência, invalidade, substituição, deduplicação ou depuração — **não** por falta de citação, silêncio do modelo, estado de Job/fila ou edição informal de projecção. | Casos negativos isolados não alteram aptidão = pass; alteração sem causa legítima = fail. |
| **CA-074-5** | Não apto preserva identidade/ID; deixa de ser entregue como válido pela Porta (**REQ-072**). | Mesmo ID após não apto; Porta não o entrega como válido = pass. |
| **CA-074-6** | Sistema CEO não homologa, não publica e não revoga aptidão por autoridade própria. | Nenhum acto autónomo do sistema nesses papéis = pass. |

## Fora do escopo

* Conteúdo admissível — **REQ-073**.
* Versionamento de conteúdo na actualização — **REQ-071**.
* Mecanismos de UI, filas ou formulários — IMP.
* Redefinição de papéis CON-001 — fora de escopo.

## Dependências

* REQ-014; CNC-001; CON-001 Art. 6º e 8º; ARQ-031 D5; governação homologada 07/08/2026; **REQ-070**; **REQ-073**.

## Riscos e incertezas

* Gargalo operacional — mitigação: ritmos são IMP/política; homologação Usuário para admissão/aptidão permanece.
* Sobreposição com REQ-014 — mitigação: REQ-014 exige decisão sob governança; este REQ nomeia alçadas.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-04** — Gestão do Conhecimento |
| Bloco ARQ-031 | **D5 — Governação** |
| Norma superior | CON-001 Art. 6º, 8º; REQ-014; CNC-001; ARQ-031 §7 |
| Origem | Despacho CTO 07/08/2026 — redacção REQs CAP-04 Camada; ARQ-031 Homologada |
| Decisões derivadas | — |
| Implementação | **IMP-070-B3 Homologado** |
| Testes | `governancaAcervo.test.js` |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 07/08/2026 | Engenheiro (Cursor) | Criação — D5 | Autorização CTO — decomposição CAP-04 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CA-074-1…6 verificáveis | Despacho CTO — pacote aprovado; pré-condição pré-IMP | **Aprovado** |
