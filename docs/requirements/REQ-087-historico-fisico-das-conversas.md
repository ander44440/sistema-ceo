# REQ-087 — Histórico Físico das Conversas

> **Status: Homologado — v1.0 (11/09/2026).** 1ª fatia IMPLEMENTADA · VALIDADA · HOMOLOGADA (IMP-087 / VAL-087).  
> **Versão:** 1.0 — 11/09/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos  
> **Nome normativo:** Histórico Físico das Conversas (HFC)  
> **Limites da 1ª fatia (vigentes):** sem leitor; sem busca; sem recuperação; sem backfill; sem correlação MO/Trilha; sem eventos de correcção. F5–F8, Trilha, CAP-13/C3 e REQ-086 inalterados.

## Enunciado

O CEO deverá preservar fisicamente cada mensagem conversacional durável (não pendente) de forma **persistente**, **íntegra**, **append-only**, **imutável** após o registo, **identificável**, **ordenável**, **idempotente** sob reexecução e **isolada por COA**, de modo que esse arquivo sobreviva à limpeza ou mutação do transcript de interface — sem substituir o transcript UI, sem absorver a Memória Confiável, a Trilha Auditável nem a MEP/CAP-13, e sem alterar F5, F6, F7, F8 nem CAP-13/C3.

## Tipo

Funcional; alto nível (primeira fatia). Requisitos de integridade do arquivo conversacional.

## Justificativa

CON-001 Art. 9º princípios 2 (nunca perder o contexto) e 8 (transparência sobre limitações); VIS-007 / REQ-041 (conversa como interface principal contextualizada ao COA); REQ-037/038/039 (isolamento por COA); ADR-015 (uso diário MG2).

O transcript conversacional actual (F5-C3) é **persistência local e mutável** do browser: serve a UI e recuperação imediata por COA, mas **não** constitui histórico físico append-only. O REQ-086 declarou essa limitação e colocou o Histórico Físico **fora** da V1 de consulta. Sem HFC, limpar o transcript UI, esvaziar dados do site ou reescrever o bucket apaga ou altera o rastro conversacional sem arquivo paralelo recuperável.

Este REQ formaliza a necessidade dessa preservação. A especificação técnica da primeira fatia já produzida nesta frente (diagnóstico + especificação de store separado append-only) permanece **referência** para a futura ARQ/IMP; **não** antecipa aqui decisões de meio, caminhos de ficheiro, APIs HTTP nem desenho de módulos.

## Problema actual

* O transcript F5-C3 é persistência **local** e **mutável** (documento reescrevível por COA); mensagens podem ser limpas ou alteradas no bucket de interface.
* **Não existe** histórico físico append-only de conversas, distinto desse transcript.
* Fontes vizinhas **não** resolvem o problema: Memória Confiável = decisões Art. 8º; Trilha Auditável = eventos de execução; MEP/CAP-13 = evolução do produto — nenhuma é arquivo de turnos conversacionais.

## Objectivo da capacidade

Garantir um **arquivo físico de mensagens conversacionais** que:

1. Preserve o conteúdo durável da conversa independentemente do estado mutável da UI.
2. Mantenha integridade (append-only, imutabilidade pós-registo, identidade, ordem, idempotência).
3. Respeite isolamento por COA.
4. Coexista com o transcript F5-C3 **sem** alterar o contrato deste.

## Escopo

### Inclui (capacidade)

* Preservação física de mensagens conversacionais **duráveis** (estado final pronto ou de erro; nunca placeholders pendentes).
* Registo com identidade de mensagem, COA, papel, texto, instante de criação da mensagem e ordenação estável no arquivo.
* Comportamento append-only e imutável após gravação bem-sucedida.
* Idempotência: a mesma mensagem (mesmo identificador) não gera registo físico duplicado sob reexecução.
* Sobrevivência do arquivo à limpeza ou mutação do transcript de interface do mesmo COA.
* Isolamento: registos de um COA não se misturam semanticamente com os de outro sem indicação desse COA.

### Primeira fatia (mínimo verificável)

* Gravação no arquivo físico no momento em que a mensagem se torna durável no fluxo conversacional existente.
* Falha do arquivo físico **não** deve impedir o funcionamento normal do transcript UI (fail-soft na superfície de conversa).
* Sem leitor de produto, sem UI dedicada, sem backfill de histórico pré-existente, sem correlação automática a MO/Trilha.

## Fronteiras (obrigatórias)

```
HFC  ≠  transcript F5-C3  ≠  Memória Confiável V1  ≠  Trilha Auditável  ≠  MEP/CAP-13
```

| Artefacto | Papel | Relação com HFC |
|-----------|--------|-----------------|
| **HFC** | Arquivo físico append-only de mensagens conversacionais | Este REQ |
| **F5-C3 (transcript)** | Persistência local mutável da UI / recuperação imediata por COA | Continua; HFC **não** o substitui nem altera o seu contrato |
| **Memória Confiável V1** | Decisões Art. 8º | Isolada; HFC **não** grava decisões nem prosa no ledger MO |
| **Trilha Auditável** | Eventos de execução (jobs/gates/AD) | Isolada; HFC **não** é trilha de execução |
| **MEP / CAP-13 / C3** | Evolução do produto CEO | Isolada; HFC **não** armazena objectos MEP |

**Preservação explícita:** F5 (incluindo F5-C3 e demais fatias de recuperação/estado), F6 (Controle de Certeza e Lastro), F7 (Aderência à Pergunta e ao Contexto), F8 (Memória Confiável V1 e Trilha Auditável no sentido homologado desta frente) e CAP-13/C3 **permanecem inalterados** por este REQ. Nenhuma emenda a REQ-086, REQ-033, REQ-085 nem aos contratos dessas frentes.

## Requisitos de integridade

| ID | Requisito | Observável |
|----|-----------|------------|
| **RI-087-1** | **Preservação física** — cada mensagem conversacional durável elegível deve poder ser registada num arquivo distinto do transcript UI. | Existência de registo fora do bucket mutável F5-C3 |
| **RI-087-2** | **Append-only** — novos registos apenas acrescentam; o histórico anterior não é reescrito. | Ausência de reescrita do passado no arquivo HFC |
| **RI-087-3** | **Imutabilidade** — após registo bem-sucedido, o conteúdo desse registo não é actualizado nem apagado por correcção in-place. | Update/delete do HFC recusados ou inexistentes |
| **RI-087-4** | **Identidade** — cada registo físico referencia o identificador estável da mensagem conversacional (`msgId`) e o `coaId` (ou sentinel sem COA). | Campos de identidade presentes e estáveis |
| **RI-087-5** | **Ordem** — o arquivo permite recuperar uma ordem estável dos registos (ordem de gravação física e/ou campo de ordem monotónico). | Sequência reproduzível |
| **RI-087-6** | **Idempotência** — reexecução ou segundo pedido de registo com o mesmo `msgId` não duplica a linha física. | No máximo um registo físico por `msgId` |
| **RI-087-7** | **Isolamento por COA** — registos carregam `coaId`; não há fusão semântica entre COAs. | Filtro/inspeção por COA sem fuga |
| **RI-087-8** | **Sobrevivência à limpeza do transcript UI** — limpar ou esvaziar o bucket F5-C3 do COA **não** apaga o HFC correspondente. | HFC intacto após limpeza UI |

Campos mínimos de conteúdo do registo (requisito de informação, **sem** fixar schema de implementação): `coaId`, `msgId`, `papel`, `texto`, `criadoEm`, e ordenação estável (`ordem`/equivalente). Detalhe de schema, meio de armazenamento e transporte ficam para ARQ/IMP.

## Critérios de aceitação (primeira fatia)

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-087-1** | Mensagem durável (`pronta` ou `erro`) gera registo no HFC; mensagem `pendente` **não** gera. | Pendente ausente no HFC; durável presente = pass |
| **CA-087-2** | O HFC é append-only: operações de apagar/actualizar/compactar o histórico físico são recusadas ou inexistentes. | Recusa observável = pass |
| **CA-087-3** | O mesmo `msgId` não produz dois registos físicos sob reexecução. | Idempotência = pass |
| **CA-087-4** | Registos de COAs distintos permanecem distinguíveis por `coaId`. | Isolamento = pass |
| **CA-087-5** | Limpeza do transcript UI do COA não remove registos HFC já gravados desse COA. | Sobrevivência = pass |
| **CA-087-6** | Falha ao gravar no HFC não impede a persistência normal do transcript F5-C3 nem o fluxo conversacional. | Fail-soft = pass |
| **CA-087-7** | O fluxo de gravação HFC **não** escreve na Memória Confiável, na Trilha Auditável nem na MEP/CAP-13. | Isolamento de stores = pass |
| **CA-087-8** | O contrato do transcript F5-C3 (chave/documento mutável por COA, exclusão de pendentes na persistência UI) permanece comportamentalmente o mesmo. | Sem regressão F5-C3 = pass |

## Fora do escopo

* Alterar, absorver ou reabrir **Memória Confiável V1** (F8 / ledger MO Art. 8º).
* Alterar ou reutilizar a **Trilha Auditável** como log de conversas.
* Alterar **CAP-13 / C3 / MEP-CEO**.
* **Recuperação / consulta de discussões antigas** (acto coberto pelo REQ-086 sobre transcript + MO; este REQ **não** redefine essa consulta).
* **Leitor de produto**, UI dedicada ou superfície de consulta ao HFC.
* **Backfill** de mensagens já existentes só no F5-C3 antes da activação do HFC.
* **Correlação automática** mensagem ↔ MO ↔ Trilha.
* Eventos de correcção / versão de texto após o primeiro registo físico (imutabilidade da 1ª fatia).
* Emendar REQ-033, REQ-041, REQ-085 ou REQ-086.
* Requisitos de infraestrutura, hosting, multi-dispositivo ou API pública além do estritamente necessário na ARQ/IMP para cumprir os CA acima.
* Alterar F5, F6, F7 ou F8.

## Dependências

* Existência do fluxo conversacional por COA e do transcript F5-C3 como persistência **de interface** (lastro factual; contrato a preservar, não a reabrir).
* REQ-037 / REQ-039 (isolamento por COA) — lastro de fronteira.
* REQ-086 — lastro de delimitação (HFC fora da V1 de consulta; transcript ≠ arquivo físico).
* Diagnóstico e especificação técnica da primeira fatia desta frente — **referência** não normativa para ARQ/IMP.
* **Não depende de:** fecho de novas fatias F5–F8, MEP/C3, nem de redesign do REQ-086.

## Riscos e incertezas

* Confusão semântica entre “o que discutimos” (transcript / futuro HFC) e “o que decidimos” (MO) — mitigação: fronteiras deste REQ e CA-087-7.
* Expectativa de consulta rica ao HFC na primeira fatia — fora de escopo; declarar limitação.
* Dualidade transcript mutável + arquivo imutável pode gerar divergência de texto se a UI editar após o append — 1ª fatia aceita imutabilidade do HFC sem evento de correcção (limitação declarada).
* Meio físico concreto (ficheiros, ponte HTTP, etc.) fica para ARQ; risco de sobre-especificar infra no REQ — evitado de propósito.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 — Gestão de Projetos (conversa contextualizada ao COA; isolamento; interface conversacional) |
| Norma superior | CON-001 Art. 9º princípios 2 e 8; VIS-007 / REQ-041; REQ-037/039; ADR-015 |
| Origem | Diagnóstico «Histórico Físico das Conversas»; especificação técnica da 1ª fatia; delimitação em REQ-086 (HFC fora V1 de consulta) |
| Lastro relacionado | F5-C3 (transcript UI); REQ-086 (não emendar); Memória Confiável / Trilha / MEP como **fronteiras negativas** |
| Decisões derivadas | ARQ-087 v1.0 Homologada |
| Implementação | IMP-087 v1.0 Homologada |
| Testes | VAL-087 APROVADO (54/54); `hfc-fatia1.test.js` |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Criação do REQ | Formalizar HFC após diagnóstico e especificação técnica da 1ª fatia; sem ARQ/IMP | Em análise |
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | Homologação 1ª fatia pós-VAL-087 | Encerramento formal da fatia | **Homologado** |
