# REQ-071 — Actualização do conhecimento por curadoria governada

> **Status:** Aprovado · **congelado (Baseline CAP-04)** — IMP-070 Homologada 07/08/2026  
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento  
> **Implementação:** IMP-070-B4 (**HOMOLOGADO / ENCERRADO**) — Baseline

## Enunciado

O CEO deverá actualizar o conhecimento organizacional do Acervo Oficial exclusivamente mediante actos de curadoria ou registo sob governação, versionando o conteúdo sem alterar a identidade do item, sem sincronização automática com repositórios de oficina externos, e sem que o Sistema CEO elevue candidatos a património por si só.

## Tipo

Funcional; alto nível.

## Justificativa

A ARQ-031 (D2) exige que a Camada cresça por curadoria governada, não por sync com o MG2 nem por inferência do modelo. Decompõe o **Processo de Actualização** da CAP-04 preservando REQ-014/015 e a fronteira REQ-030.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-071-1** | Alteração de conteúdo admitida como vigente num item existente cria nova versão de conteúdo na **mesma** identidade; o identificador permanente não muda. | Antes/depois: mesmo ID; cadeia de versões com entrada nova; ID inalterado = pass. |
| **CA-071-2** | Nenhuma actualização do Acervo Oficial resulta de sincronização automática com repositório externo de oficina (incl. repo do jogo MG2). | Inspecção de processo: existe pipeline automático oficina→Acervo sem acto de curadoria? Não = pass; Sim = fail. |
| **CA-071-3** | Candidato apresentado pelo Sistema CEO não consta do índice como item oficial nem como conteúdo vigente até completar a cadeia de governação (**REQ-074**). | Cenário: candidato gerado pelo sistema sem homologação Usuário — ausente do índice como apto oficial = pass. |
| **CA-071-4** | Alterar só uma projecção de leitura (briefing/espelho) sem acto no Acervo **não** actualiza o património oficial. | Cenário: projecção editada; índice/entrada inalterados — património oficial inalterado = pass. |

## Fora do escopo

* Quem propõe, valida, homologa e publica — **REQ-074**.
* O que pode ou não ser admitido — **REQ-073**.
* Preservação técnica entre sessões — REQ-015.
* Porta de consulta em runtime — **REQ-072**.

## Dependências

* REQ-004; REQ-014; REQ-015; REQ-030; ARQ-031 D2; CNC-001.

## Riscos e incertezas

* Pressão operacional para “actualizar o briefing no código” sem curadoria — mitigação: CA-071-4 + REQ-070.
* Julgamento do que é “nova versão” vs novo item — mitigação: ARQ-006 K4; elevação ao CTO se ambíguo.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-04** — Gestão do Conhecimento |
| Bloco ARQ-031 | **D2 — Actualização** |
| Norma superior | CON-001 Art. 4º, 8º; VIS-001 §4; ADR-015; REQ-030 |
| Origem | Despacho CTO 07/08/2026 — redacção REQs CAP-04 Camada; ARQ-031 Homologada |
| Decisões derivadas | — |
| Implementação | **IMP-070-B4** (VAL executada) |
| Testes | `atualizacaoAcervo.test.js` |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 07/08/2026 | Engenheiro (Cursor) | Criação — D2 | Autorização CTO — decomposição CAP-04 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CA-071-1…4 verificáveis | Despacho CTO — pacote aprovado; pré-condição pré-IMP | **Aprovado** |
