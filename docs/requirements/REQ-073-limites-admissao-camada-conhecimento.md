# REQ-073 — Limites de admissão da Camada de Conhecimento

> **Status:** Aprovado · **congelado (Baseline CAP-04)** — IMP-070 Homologada 07/08/2026  
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento  
> **Implementação:** IMP-070-B2 **Homologado / Encerrado** — Baseline.

## Enunciado

O CEO deverá admitir no Acervo Oficial somente conhecimento que satisfaça a definição de item de conhecimento e os limites da Camada — e deverá recusar admissão ao que os limites excluem ou proíbem de forma absoluta — de modo que o Acervo não absorva normas, memória histórica pontual, estado operacional de fila, engenharia de oficina externa, segredos, nem hipóteses não curadas.

## Tipo

Funcional; alto nível.

## Justificativa

A ARQ-031 (D4) e os limites homologados em 07/08 fecham o perímetro da Capacidade. Sem este requisito, a actualização (REQ-071) e a governação (REQ-074) não têm critério objectivo de admissão. Decompõe os **Limites** da CAP-04 sem criar capacidade nova.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-073-1** | Admissão exige: (a) CNC-002 (reutilizável e independente de decisão específica); (b) património do CEO; (c) origem rastreável. | Checklist de admissão em amostra: três condições documentadas = pass; qualquer falha = fail. |
| **CA-073-2** | Tipo lógico do item admitido pertence ao conjunto: identidade de contexto; objectivo/foco de janela; regra de domínio; padrão/prática; restrição/dor activa; fronteira; fora de escopo; lacuna declarada; lastro de estado curado. | Classificação do item ∈ conjunto = pass; fora = fail. |
| **CA-073-3** | Tentativa de admitir como item válido qualquer um dos excluídos é **recusada**: CAP-05 pontual; normas/ADRs como KNW; CNC; CAP-06; fila/jobs/gates/dispatcher/agent; sessão volátil; código/árvore/builds de oficina; prompt/espelho como fonte; parecer de um turno sem elevação. | Matriz de casos negativos: cada caso recusado ou não indexado como apto = pass. |
| **CA-073-4** | Tentativa de admitir proibição absoluta é **recusada**: engenharia/sync do repo do jogo; segredos; acto bruto sem elevação; hipótese de modelo sem governação; conteúdo sem origem; personalidade/prompt do cargo. | Matriz de proibições: zero admissões = pass. |
| **CA-073-5** | Referência por identificador a norma/decisão/conceito é permitida; absorção do artefacto referenciado como se fosse item do Acervo é recusada. | Item referencia ID externo sem copiar o artefacto como conteúdo canónico do acervo = pass. |

## Fora do escopo

* Cadeia de quem aprova a admissão — **REQ-074**.
* Entrega em runtime — **REQ-072**.
* Taxonomia fina de rótulos sob “não apto” — extensível sob REQ-014; não bloqueia este REQ.
* Conteúdo concreto dos primeiros itens KNW — curadoria futura, não este REQ.

## Dependências

* CNC-002; ARQ-031 D4; limites homologados 07/08/2026; REQ-004; REQ-030.

## Riscos e incertezas

* Casos limítrofes “regra reutilizável vs decisão histórica” — mitigação: elevação ao CTO/Usuário.
* Pressão para importar dossier técnico do MG2 — mitigação: CA-073-4 + REQ-030.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-04** — Gestão do Conhecimento |
| Bloco ARQ-031 | **D4 — Limites** |
| Norma superior | CON-001 Art. 4º; CNC-002; ADR-015; REQ-030; ARQ-006 K7 |
| Origem | Despacho CTO 07/08/2026 — redacção REQs CAP-04 Camada; ARQ-031 Homologada |
| Decisões derivadas | — |
| Implementação | **IMP-070-B2 Homologado** |
| Testes | `limitesAdmissao.test.js` |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 07/08/2026 | Engenheiro (Cursor) | Criação — D4 | Autorização CTO — decomposição CAP-04 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CA-073-1…5 verificáveis | Despacho CTO — pacote aprovado; pré-condição pré-IMP | **Aprovado** |
