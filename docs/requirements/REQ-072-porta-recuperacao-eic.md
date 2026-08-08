# REQ-072 — Porta de recuperação contextual para a EIC

> **Status:** Aprovado · **congelado (Baseline CAP-04)** — IMP-070 Homologada 07/08/2026  
> **Versão:** 1.0 — 07/08/2026  
> **Capacidade:** CAP-04 — Gestão do Conhecimento  
> **Implementação:** IMP-070-B5 (**HOMOLOGADO / ENCERRADO**) — Baseline
## Enunciado

O CEO deverá disponibilizar à EIC — e aos consumidores deliberativos que dela dependem — o conhecimento organizacional aplicável exclusivamente através de uma Porta de recuperação contextual que, dado um Contexto de Trabalho ou COA e a necessidade da solicitação, entregue lastro composto apenas por factos/itens oficiais **aptos**, referências de versão quando pertinentes, e lacunas explícitas, sem que esses consumidores acedam à estrutura interna do Acervo nem às regras de curadoria.

## Tipo

Funcional; alto nível.

## Justificativa

A ARQ-031 (D3) exige consulta desacoplada: a EIC consome lastro, não o acervo. REQ-005 já obriga recuperação contextual; este requisito decompõe a **Porta de Recuperação para a EIC** na Camada, preservando a separação Conhecimento × EIC × Executive Engine.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-072-1** | A EIC obtém conhecimento organizacional da Camada **somente** via Porta de recuperação contextual (única superfície lógica de leitura em runtime para esse fim). | Inspecção de fluxo: existe caminho de consumo de conhecimento de Camada que contorne a Porta? Não = pass; Sim = fail. |
| **CA-072-2** | A entrada lógica da Porta inclui Contexto de Trabalho ou COA **e** a necessidade associada à solicitação. | Contrato/observação da invocação: ambos os elementos presentes = pass. |
| **CA-072-3** | A saída da Porta contém apenas: (a) conhecimento oficial **apto** aplicável; (b) referências de versão quando exigidas; (c) lacunas explícitas se não houver aplicável — e **nenhum** item **não apto** como válido. | Fixture: misturar apto + não apto + lacuna; saída só aptos + lacunas; zero não apto como válido = pass. |
| **CA-072-4** | EIC, Executive Engine, MRE e Conversação Natural consomem o lastro **sem** depender de organização interna do Acervo, caminhos de sede ou actos de curadoria. | Inspecção de dependências/contratos dos consumidores: referência só ao lastro da Porta = pass; importação de estrutura do acervo = fail. |
| **CA-072-5** | Classificador e interceptação operacional não substituem a Porta (no máximo sinais de contexto). | Inspecção: esses módulos não entregam lastro de Camada no lugar da Porta = pass. |

## Fora do escopo

* Estruturação do Acervo — REQ-004; ARQ-006.
* Fonte oficial e subordinção de projecções — **REQ-070**.
* Governação de aptidão — REQ-014; **REQ-074**.
* Lastro operacional de fila (jobs/gates) — REQ-059 / consciência operacional (capacidade distinta).
* Redesign da EIC ou do Executive Engine — vedado.
* Volume/política fina de “necessário para avançar” — calibração sob REQ-005; não bloqueia CA-072-1…5.

## Dependências

* REQ-005; REQ-014; ARQ-031 D3; CNC-003 (Contexto de Trabalho); **REQ-070**.

## Riscos e incertezas

* Tentação de injectar briefing directo no motor — mitigação: CA-072-1 torna bypass não conforme.
* Sobreposição com lastro de fila — mitigação: fora de escopo explícito.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-04** — Gestão do Conhecimento |
| Bloco ARQ-031 | **D3 — Consulta / Porta** |
| Norma superior | CON-001 Art. 4º, 9º; VIS-001 §4; ARQ-031 §5 e §8 |
| Origem | Despacho CTO 07/08/2026 — redacção REQs CAP-04 Camada; ARQ-031 Homologada |
| Decisões derivadas | — |
| Implementação | **IMP-070-B5** (**HOMOLOGADO / ENCERRADO**) |
| Testes | `portaRecuperacao.test.js` — CA-072-1…5 |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 07/08/2026 | Engenheiro (Cursor) | Criação — D3 | Autorização CTO — decomposição CAP-04 | Em análise |
| 1.0 | 07/08/2026 | CTO aprovou pacote; Engenheiro objectivou CAs | Aprovação + CA-072-1…5 verificáveis | Despacho CTO — pacote aprovado; pré-condição pré-IMP | **Aprovado** |
