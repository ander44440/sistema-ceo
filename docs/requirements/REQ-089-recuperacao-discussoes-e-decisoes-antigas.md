# REQ-089 — Recuperação de discussões e decisões antigas

> **Status: Homologado — v1.0 (11/09/2026).** Fatia 1 IMPLEMENTADA · VALIDADA · HOMOLOGADA (IMP-089 / VAL-089).  
> **Versão:** 1.0 — 11/09/2026  
> **Capacidade:** CAP-05 — Memória Organizacional  
> **Nome normativo:** Recuperação de discussões e decisões antigas  
> **Natureza:** Evolução da **camada de consulta** já homologada (REQ-086 / ARQ-086 / IMP-086). **Não** reabre nem emenda o texto homologado do REQ-086 v1.0.  
> **Fatia 1 (encerrada):** consumo read-only de HFC-087 na discussão + activação soft-fail de refs Trilha-088 a partir de MO IDs.  
> **Evidência VAL-089:** 92/92 PASS; build OK; 0 regressões; CA-089-1…9 atendidos.  
> **Preservado:** HFC-087 **não** reaberto/alterado; Trilha-088 **não** reaberta/alterada; F8/MO **não** alterada; F5-C3 preservado; sem novo store; sem nova memória; CAP-13/C3 fora; JOB-000118 intocado.

## Enunciado

O CEO deverá, perante pedido explícito de consulta no caminho conversacional já definido pelo REQ-086, continuar a devolver decisões Art. 8º **somente** a partir da Memória Confiável (F8/MO) e discussões do COA indicado, passando a poder recuperar prosa de discussão a partir do **Histórico Físico das Conversas (HFC / REQ-087)** em modo **somente leitura**, de modo que discussões sobrevivam à limpeza do transcript F5-C3; e poderá apresentar **referências de execução** da **Trilha Auditável V1 (REQ-088)** correlacionadas aos MO IDs obtidos, em modo read-only e soft-fail — **sem** alterar HFC, Trilha, MO, F5-C3 nem criar armazenamento ou memória novos.

## Tipo

Funcional; detalhado (evolução Fatia 1 da consulta IMP-086).

## Justificativa

CON-001 Art. 8º (memória organizacional viva e consultável) e Art. 9º princípios 1, 2 e 8; CAP-05; ADR-015 (uso diário MG2); ADR-006 (nada oficial sem REQ).

O IMP-086 V1 homologado consulta decisões no MO e discussões no transcript F5-C3. O F5-C3 é mutável: `limparHistorico` remove prosa da UI. O HFC-087 (homologado) preserva mensagens duráveis append-only e **não** é tocado pela limpeza do transcript — mas a consulta IMP-086 **ainda não o consome**. A Trilha-088 (homologada) já estava prevista no ARQ/IMP-086 como F-TR opcional, porém **não injectada em produção**. Esta evolução fecha esses gaps **sem** fundir stores nem promover HFC/Trilha a sede Art. 8º.

## Relação com o que já existia (IMP-086 / REQ-086)

### O que já existia e permanece lastro

* Pedido explícito (**D-PED**), ramos decisão / discussão / ambos, isolamento por COA, ausência explícita, operação read-only.  
* **F-MO** — `consultarRegistosMo` (ou equivalente) como **única** sede Art. 8º.  
* **C-SEP** — secções Decisões / Discussões / Referências opcionais.  
* Hook no Núcleo **após** Gate/AD e **antes** do classificador.  
* Critérios CA-086-1…9 do REQ-086 v1.0 — **continuam a aplicar-se**; este REQ **acrescenta** CA-089-* sem os invalidar.

### O que esta evolução acrescenta (Fatia 1)

1. **F-TX** passa a poder **consumir HFC-087 em leitura**, filtrado por `coaId`, como fonte canónica de discussão para recuperação “antiga” / pós-limpeza do transcript.  
2. **F-TR** poderá ser **activado em produção** injectando leitura da Trilha V1 a partir dos `moIds` das decisões devolvidas — **somente** como referências/correlação, soft-fail.  
3. Critérios objectivos de sobrevivência HFC e de refs Trilha (secção Critérios de aceitação).

### O que permanece inalterado

* Texto e homologação do **REQ-086 v1.0**, **ARQ-086 v1.0**, entrega **IMP-086 v1.0** como baseline.  
* **HFC-087** (REQ/ARQ/IMP/VAL) — contrato de escrita, schema, store e hook de gravação.  
* **Trilha-088** (REQ/ARQ/IMP/VAL) — tipos, store, writers, limitações V1.  
* **F8/MO**, **F5-C3**, CAP-13/C3, Gate, AD, classificador (contratos).

## Fontes canónicas (Fatia 1 desta evolução)

| Conteúdo | Fonte canónica | Papel |
|----------|----------------|--------|
| Decisão Art. 8º | **Memória Confiável V1 (MO / F8)** | Única sede; **F-MO intacto** |
| Discussão / prosa “antiga” ou pós-limpeza UI | **HFC-087** (`executive/historico-conversas/mensagens.jsonl`) | **Consumo read-only**; filtrado por COA |
| Discussão / prosa na UI actual | **F5-C3** (transcript) | **Preservado**; não é store desta evolução; Fatia 1 não obriga dual-write nem redesign |
| Execução / lastro de actos | **Trilha-088** | **Só refs** a partir de MO IDs; soft-fail; nunca corpo de decisão/discussão |
| Não-fonte | Workspace, MEP/C3, KNW, Jobs como corpo Art. 8º ou arquivo de conversa | — |

**Anti-duplicação:** proibido copiar HFC→MO, Trilha→MO, HFC→Trilha, F5-C3→HFC (via este fluxo), ou criar índice/store paralelo “de recuperação”.

**Política Fatia 1 (discussão):** fonte primária de recuperação de discussões nesta evolução = **HFC por `coaId`**. F5-C3 permanece a superfície UI e o contrato mutável vigente; **não** é alterado. Se HFC e F5-C3 tiverem as mesmas mensagens, a apresentação **não** deve inventar duplicados óbvios (dedupe por `msgId` admitido na IMP). Se ambos vazios no COA ⇒ ausência explícita de discussão.

## Critérios de aceitação

| ID | Critério (objectivo) | Verificação (pass/fail) |
|----|----------------------|-------------------------|
| **CA-089-1** | Pedido explícito de discussão, após limpeza do transcript F5-C3 do COA, **ainda** devolve prosa do HFC desse COA quando existir lastro; senão, ausência explícita. | Sobrevivência HFC observável = pass; inventar ou silêncio ambíguo = fail. |
| **CA-089-2** | Pedido de decisão continua a obter lastro **somente** do MO (F-MO); HFC e Trilha **não** satisfazem Art. 8º. | Promover HFC/Trilha/workspace a decisão = fail. |
| **CA-089-3** | Isolamento por COA: HFC e MO filtrados; conteúdo do COA A não aparece sob pedido do COA B sem nomeação explícita. | Fuga = fail. |
| **CA-089-4** | Com decisões MO presentes e porta Trilha injectada, a resposta pode incluir secção de **referências de execução** correlacionadas aos `moIds`; sem Trilha ou com falha de leitura, a consulta MO/HFC **não falha** (soft-fail). | Bloquear consulta por Trilha = fail; refs como corpo de decisão = fail. |
| **CA-089-5** | O fluxo de consulta permanece **read-only**: zero append/gravação em MO, HFC, Trilha, F5-C3, MEP ou workspace só para cumprir a consulta. | Qualquer write introduzido só por este fluxo = fail. |
| **CA-089-6** | D-PED, ramos, ausência explícita e ponto de hook (pós-Gate/AD, pré-classificador) do IMP-086 **preservados**. | Regressão de comportamento D-PED/hook = fail. |
| **CA-089-7** | HFC-087 e Trilha-088 são **apenas consumidos** (portas de leitura); nenhum writer, schema ou store desses frentes é alterado por esta evolução. | Diff de writers HFC/Trilha/MO/F5-C3 = fail. |
| **CA-089-8** | Não existe novo armazenamento, nova memória nem API HTTP dedicada criada por esta Fatia 1. | Store/rota novos = fail. |
| **CA-089-9** | Critérios CA-086-1…9 continuam a passar na regressão da consulta (pedido explícito, separação, read-only, CA-086-9). | Regressão IMP-086 = fail. |

## Limites da Fatia 1

* Consumo HFC **read-only** por COA no ramo discussão; sem busca semântica, sem UI dedicada, sem backfill.  
* Trilha **só** como refs a partir de MO IDs; sem novos tipos de evento; sem tornar F-TR obrigatório para sucesso da consulta.  
* Sem correlação estrutural obrigatória mensagem↔MO↔Trilha além das refs opcionais.  
* Sem emenda normativa aos textos homologados REQ-086/087/088 (este REQ é **complemento**).

## Fora do escopo

* Alterar código/writers/schema de **HFC-087**, **Trilha-088**, **F8/MO**, **F5-C3**, CAP-13/C3.  
* Criar quarto store / índice persistente / “memória de recuperação”.  
* Duplicar dados entre MO, HFC, Trilha e F5-C3.  
* Promover HFC ou Trilha a sede Art. 8º.  
* Usar Trilha como arquivo de conversas ou corpo de discussão.  
* API HTTP dedicada de consulta; UI rica; ranking ML.  
* Recuperação de Jobs; reactivação de fio F5; Porta EIC/KNW; REQ-061.  
* Emendar REQ-086 / REQ-087 / REQ-088 / REQ-033 / REQ-024.  
* Consumir JOB-000118; tocar CAP-13/C3.  
* Fatias futuras (busca, backfill, correlação obrigatória, eventos de correcção HFC, novos tipos Trilha).

## Dependências

* **REQ-086 v1.0 Homologado** — baseline da consulta (não reabrir).  
* **ARQ-086 / IMP-086 v1.0** — módulos `consultaRegistados` e hook.  
* **REQ-087 / HFC V1.0 Homologado** — store e registos consumíveis em leitura.  
* **REQ-088 / Trilha V1.0 Homologada** — eventos e API de leitura existentes (consumo).  
* **Memória Confiável V1** — sede Art. 8º.  
* Isolamento COA (REQ-037/038/039).  
* **Não depende de:** alteração de writers HFC/Trilha; fecho de limitações Railway da Trilha; CAP-13; API HTTP nova.

## Riscos e incertezas

* HFC pode estar vazio para conversas anteriores à activação do writer — ausência explícita correcta, não inventar.  
* Volume de prosa HFC pode exceder o “últimas N” do F5-C3 — IMP deve fixar limite de apresentação.  
* Trilha sem eventos ligados a um `moId` ⇒ refs vazias (não é falha).  
* Confusão semântica “recuperação” vs F5/Jobs — mitigada por D-PED preservado (CA-089-6 / CA-086-6).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | **CAP-05 — Memória Organizacional** (discussões = consumo HFC/F5-C3; não posse CAP-05 do arquivo) |
| Norma superior | CON-001 Art. 8º, Art. 9º princípios 1, 2 e 8; CAP-001 CAP-05; ADR-015; ADR-006 |
| Origem | Deliberação técnica aprovada (evolução IMP-086); diagnóstico IMP-086; HFC-087 e Trilha-088 homologados |
| Lastro | REQ-086; REQ-087; REQ-088; Memória Confiável V1; F5-C3 (preservado) |
| Decisões derivadas | ARQ-089 v1.0; IMP-089 v1.0; VAL-089 |
| Implementação | IMP-089 Fatia 1 — camada `consultaRegistados` (evolução IMP-086) |
| Testes | VAL-089 — **92/92 PASS**; build OK |

## Limites conhecidos da Fatia 1 (homologados — não são FAIL)

* Sem busca semântica, UI dedicada, backfill ou correlação obrigatória mensagem↔MO↔Trilha.  
* HFC vazio para conversas anteriores ao writer ⇒ ausência explícita (correcto).  
* Limite de apresentação de discussões (últimas N) na C-SEP.  
* Trilha sem eventos para um `moId` ⇒ refs vazias (não é falha).  
* HFC-087 / Trilha-088 / F8/MO **não** reabertos: apenas **consumo** na consulta.

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Criação do REQ da Fatia 1 (HFC read + Trilha refs) | Autorização ABRIR REQ/ARQ/IMP; deliberação técnica aprovada | Em análise |
| 1.0 | 11/09/2026 | Usuário (homologação); Engenheiro (Cursor) registrou | Homologação Fatia 1: status Homologado; VAL-089 92/92; HFC/Trilha/MO preservados | Despacho FECHAMENTO E HOMOLOGAÇÃO IMP-089 Fatia 1 | **Homologado** |
