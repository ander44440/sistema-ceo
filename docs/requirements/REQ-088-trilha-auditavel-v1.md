# REQ-088 — Trilha Auditável V1

> **Status: Homologado — v1.0 (11/09/2026).** Trilha V1 IMPLEMENTADA · VALIDADA · HOMOLOGADA (IMP-088 / VAL-088).  
> **Versão:** 1.0 — 11/09/2026  
> **Capacidade:** CAP-09 — Observabilidade  
> **Nome normativo:** Trilha Auditável V1  
> **Natureza:** Formalização / congelamento das fatias 1–2. **Sem** novos tipos de evento nesta homologação.  
> **Limitações V1 (vigentes):** Railway sem espelho; Gate/AD fire-and-forget; F-TR não ligado em produção; ausência de `prevHash`; somente 3 tipos.  
> **Próxima evolução:** frente própria — fora deste REQ. HFC v1.0, F5–F8, CAP-13/C3, REQ-086 inalterados.

## Enunciado

O CEO deverá manter uma **Trilha Auditável V1** — registo verificável e append-only de eventos de **execução** nos três tipos já existentes (`job.transicao`, `gate.decisao_terminal`, `ad.fecho_sob_delegacao`), persistido em ficheiro JSONL distinto, com envelope comum, identificadores e `refs`, idempotência sob reexecução, payloads proibidos face a conversa/KNW/MEP, e comportamento **fail-soft** relativamente a Jobs e à Memória Confiável — sem ser arquivo de conversas, sem ser sede Art. 8º de decisões, sem fundir-se com HFC, MEP/CAP-13 ou transcript F5-C3, e sem introduzir novos tipos de evento nesta V1.

## Tipo

Funcional e de integridade; alto nível (congelamento V1). Formaliza o contrato do que já existe em código.

## Justificativa

CON-001 Art. 8º §3º (rastreabilidade da cadeia de actos); CAP-09 (tornar visível o andamento e a rastreabilidade); ADR-006 (nada oficial sem REQ); ADR-015 (uso diário MG2).

O código da Trilha (fatias 1–2) já opera com store JSONL, writers e testes, mas **não** possuía ciclo normativo próprio — risco de evolução ad hoc e de colisão semântica com Memória Confiável, HFC e MEP. O REQ-086 trata a Trilha apenas como correlação opcional; o REQ-087 isola o HFC. Este REQ **congela** a V1 existente para homologação do estado actual, sem ampliar fiabilidade nem cobertura.

## Problema actual (governança)

* Trilha operacional em código **sem** REQ/ARQ/IMP/VAL dedicados.  
* Ambiguidade de papel face a MO (decisão), HFC (conversa) e observabilidade.  
* Limitações de fiabilidade e cobertura conhecidas **não** estavam declaradas como contrato normativo da V1.

## Objectivo

1. Formalizar os **três** tipos de evento V1 e o store canónico.  
2. Fixar semântica: **eventos de execução**, não prosa nem memória decisória Art. 8º.  
3. Fixar garantias V1: append-only, idempotência, envelope, refs, fail-soft, payloads proibidos, writers actuais.  
4. Declarar limitações conhecidas sem as converter em obrigações desta V1.  
5. Permitir homologar o estado actual sem novos tipos nem refactors.

## Escopo (V1 — congelamento)

### Tipos de evento (conjunto fechado)

| Tipo | Semântica V1 |
|------|----------------|
| `job.transicao` | Transição de estado de um Job, espelhada a partir do crescimento de `historicoCiclo` |
| `gate.decisao_terminal` | Decisão terminal de Gate (**aprovado** / **rejeitado**), após registo bem-sucedido na Memória Confiável |
| `ad.fecho_sob_delegacao` | Fecho sob Autoridade Delegada, após registo bem-sucedido na Memória Confiável |

**Nenhum** outro `tipo` faz parte da V1 deste REQ.

### Store e integridade

* Store canónico: `executive/audit/eventos.jsonl` (uma linha JSON = um evento).  
* **Append-only:** novos eventos apenas acrescentam; apagar/compactar o histórico físico são recusados ou inexistentes.  
* **Idempotência:** reexecução não deve produzir segunda linha para o mesmo evento lógico (dedupe por `id` e/ou por `conteudoHash` + correlação de `refs`, conforme implementação vigente).  
* **Fail-soft:** falha ao gravar na Trilha **não** reverte nem bloqueia a gravação do Job nem o append na Memória Confiável.

### Envelope comum (informação mínima)

Cada evento V1 deverá carregar, de forma observável: `id`, `schemaVersao`, `quando`, `actor`, `tipo`, `coaId` (quando aplicável ao tipo), `refs`, `detalhe`, `resultado`, `conteudoHash`.

### Identificadores e refs (V1)

| Tipo | Identidade do evento | Refs mínimas / típicas |
|------|----------------------|-------------------------|
| `job.transicao` | Derivada de Job + índice + hash de conteúdo | `jobId`; `coaId` opcional |
| `gate.decisao_terminal` | Derivada de gate/parecer/decisão + hash | `gateId`, `parecerId`, `moRegistroId`; `jobId` opcional; `coaId` opcional |
| `ad.fecho_sob_delegacao` | Derivada de COA + hash | `moRegistroId`; `adActoId` opcional; **`coaId` obrigatório** |

A Trilha **referencia** o registo MO quando aplicável; **não** substitui o ledger Art. 8º.

### Writers actuais (V1)

| Writer | Evento | Momento |
|--------|--------|---------|
| Fila de execução da aplicação (`app` / espelho pós-escrita de Job) | `job.transicao` | Quando `historicoCiclo` cresce |
| Integração Gate → conversa | `gate.decisao_terminal` | Após append MO em decisão terminal aprovado/rejeitado |
| Autoridade Delegada | `ad.fecho_sob_delegacao` | Após append MO em fecho sob delegação |

### Payloads proibidos (V1)

O evento **não** poderá carregar famílias de conteúdo de conversa, acervo KNW ou MEP (incl. chaves do género `mensagens`, `mensagem`, `transcript`, `transcriptCliente`, `conversasCliente`, `knw` / itens KNW, `eventosMep`, `mepCeo`). Recusa observável = conformidade.

## Semântica (obrigatória)

```
Trilha = registo verificável de eventos de execução
      ≠ arquivo de conversas (HFC / F5-C3)
      ≠ Memória Confiável / sede Art. 8º de decisões
      ≠ MEP / CAP-13
```

* **Não** armazena turnos conversacionais.  
* **Não** é a memória da decisão (o corpo Art. 8º permanece no ledger MO).  
* **Não** é log de evolução do produto.  
* Correlação opcional a partir de `refs` (espírito REQ-086 F-TR) **não** torna a Trilha fonte de discussão nem de decisão.

## Fronteiras

| Artefacto | Relação com a Trilha V1 |
|-----------|-------------------------|
| **HFC v1.0** (REQ-087) | Store e módulo distintos; Trilha **não** grava mensagens |
| **Memória Confiável V1** | Gate/AD: MO primeiro; Trilha é espelho de execução; **não** absorve o ledger |
| **MEP / CAP-13 / C3** | Isolados; payload MEP proibido na Trilha |
| **F5-C3 (transcript)** | Isolado; prosa de chat proibida no payload |
| **REQ-086** | **Não** emendado; F-TR continua opcional / limitação conhecida se não ligado |

**Preservação explícita:** HFC v1.0 homologado; F5–F8 homologados; CAP-13/C3; REQ-086; JOB-000118 — **sem alteração** por este REQ. Sem alteração do código da Trilha neste acto de requisitos.

## Limitações conhecidas (declaradas — **não** são obrigações desta V1)

| Limitação | Nota |
|-----------|------|
| Railway / backend `server` **sem** espelho de Jobs na Trilha | Paridade Vite/`app` vs Railway fora desta V1 |
| Confirmação de entrega Gate/AD **inexistente** (emissão não síncrona / fire-and-forget) | Fiabilidade de entrega fora desta V1 |
| F-TR (consulta REQ-086) **não** ligado em produção | Continua opcional; não bloqueia este REQ |
| Ausência de cadeia anti-tamper `prevHash` / Merkle | Integridade V1 = append-only + hash de conteúdo de campos, não prova criptográfica encadeada |
| Cobertura limitada aos **três** tipos e aos writers acima | Gate `adiado`, actos AD não-fecho, writes MO puros, etc. **fora** |

Transparência (CON-001 Art. 9º princípio 8): estas limitações são **aceites** na homologação da V1; corrigi-las exige REQ/fatia futura, não este documento.

## Critérios de aceitação (homologar o estado actual)

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-088-1** | Existem exactamente os três tipos V1; nenhum tipo adicional é exigido por este REQ. | Conjunto fechado observável = pass |
| **CA-088-2** | Eventos elegíveis dos writers V1 podem ser persistidos em `executive/audit/eventos.jsonl` (ou store equivalente da implementação vigente sob esse path canónico). | Persistência JSONL = pass |
| **CA-088-3** | O store é append-only: apagar/compactar o histórico físico são recusados ou inexistentes. | Recusa/`historico_append_only` = pass |
| **CA-088-4** | Reexecução / re-append do mesmo evento lógico não cria segunda linha (idempotência). | Dedupe observável = pass |
| **CA-088-5** | Envelope mínimo e `conteudoHash` estão presentes nos eventos construídos V1. | Campos observáveis = pass |
| **CA-088-6** | `refs` ligam Job e/ou Gate/AD↔MO conforme a tabela de identificadores; AD fecho exige `coaId`. | Contrato de refs = pass |
| **CA-088-7** | Payload com famílias proibidas (transcript/KNW/MEP) é rejeitado. | Recusa = pass |
| **CA-088-8** | Falha da Trilha não reverte Job nem append MO (fail-soft) nos caminhos cobertos pelos testes V1. | Job/MO intactos = pass |
| **CA-088-9** | A Trilha **não** escreve em HFC, ledger MO (como sede), MEP nem transcript F5-C3. | Isolamento = pass |
| **CA-088-10** | As limitações conhecidas (§ acima) estão declaradas; este REQ **não** as trata como defeito da V1. | Declaração explícita = pass |
| **CA-088-11** | Suíte de testes existente das fatias 1–2 da Trilha permanece verde sem alteração de código neste acto de REQ. | Testes pass = pass (na VAL futura) |

## Fora do escopo

* Novos tipos de evento.  
* Correcções de fiabilidade (espelho Railway; confirmação síncrona Gate/AD).  
* UI; consulta rica; backfill; cadeia criptográfica / `prevHash`.  
* Fusão com HFC ou Memória Confiável; absorção do F-TR como obrigatório.  
* Emendar REQ-086, REQ-087, contratos F5–F8, CAP-13/C3.  
* Alterar a implementação da Trilha neste acto.  
* Qualquer evolução arquitectural não necessária para formalizar a V1 existente.

## Dependências

* Existência operacional das fatias 1–2 da Trilha (lastro factual a formalizar).  
* Memória Confiável V1 — sede Art. 8º para Gate/AD (Trilha espelha, não substitui).  
* Fila de execução / Jobs — fonte de `job.transicao` no path `app`.  
* REQ-086 — correlação opcional (não reabrir).  
* REQ-087 / HFC v1.0 — fronteira negativa (não reabrir).  
* **Não depende de:** fecho do espelho Railway, F-TR ligado, nem de novas fatias F5–F8.

## Riscos e incertezas

* Perda silenciosa de eventos Gate/AD se o canal HTTP falhar — limitação declarada.  
* Divergência Vite/`app` vs Railway nos Jobs — limitação declarada.  
* Confusão semântica Trilha ↔ MO ↔ HFC — mitigada pelas fronteiras deste REQ.  
* Pressão para “completar” fiabilidade dentro deste REQ — recusada pelo fora de escopo.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-09 — Observabilidade |
| Norma superior | CON-001 Art. 8º §3º; Art. 9º princípios 2 e 8; ADR-006; ADR-015; CAP-001 CAP-09 |
| Origem | Diagnóstico «Trilha Auditável» (pós-HFC v1.0); código vigente fatias 1–2; delimitação REQ-086 / REQ-087 |
| Lastro relacionado | Memória Confiável V1; Jobs/`historicoCiclo`; Gate; AD; HFC v1.0 (fronteira) |
| Decisões derivadas | ARQ-088 v1.0 Homologada |
| Implementação | IMP-088 v1.0 Homologada (formalização; zero delta de código) |
| Testes | VAL-088 APROVADO (51/51); `f8-fatia1` / `f8-fatia2` |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Criação do REQ — congelamento V1 | Formalizar Trilha existente sem novos tipos nem fix de fiabilidade | Em análise |
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | Homologação V1 pós-VAL-088 | Encerramento formal; limitações preservadas | **Homologado** |
