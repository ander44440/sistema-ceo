# ARQ-092 — Lastro Factual do Caso (LFC)

> **Status: Homologada (arquitectura) — v0.4 (13/09/2026).** Gate ARQ **fechado** com decisões CTO incorporadas; **v0.3** fecha contrato LFC→MRE (ADR-022); **v0.4** fecha RFR LFC×HFC (ADR-023).  
> **Versão:** 0.4 — 13/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-092.  
> **Capacidade:** CAP-03 — Gestão de Projetos.  
> Norma superior: CON-001 Art. 9º; ADR-006; ADR-010; ADR-015; **ADR-021 v0.2**; **ADR-022 v0.1**; **ADR-023 v0.1**; **REQ-092 v0.4**.  
> Base: ADR-021 v0.2; ADR-022 v0.1; ADR-023 v0.1; REQ-092 v0.4; fecho CTO das 7 decisões de persistência/identidade/retenção/auditoria/migração.  
> **Finalidade:** arquitectura lógica e contratos do LFC — incluindo consumo RO pelo MRE e regime RFR.  
> **Gate ARQ:** fechado (v0.2); v0.3–v0.4 **não** reabrem CTO-1…7.  
> **Proibições deste acto (v0.4):** não implementar; não criar IMP; não alterar código funcional; não refactor; não commit obrigatório; **não** reabrir calibração P1-2.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do Lastro Factual do Caso: objecto vigente de factos assertados por `coaId`+`casoId`, com writer/reader canónicos únicos e persistência FS+ponte desacoplada de HFC/MO/CSC. |
| **Por que existe?** | REQ-092 exige contrato verificável; baterias ValeVerde provaram eco de turno ≠ lastro recuperável; ADR-021 fixou hierarquia e autoridade. |
| **Para quem existe?** | CTO (homologação); Engenheiro (IMP-092); Conversa e Centro (consumidores); MRE (consumidor read-only). |
| **Como medir sucesso?** | CA do REQ-092 §10 + §11 + §12 + invariantes I1–I16; zero violação W1–W3; zero regressão HFC/MO/CSC/Trilha. |

---

## 0.1 Decisões CTO fechadas nesta v0.2

| # | Decisão CTO | Incorporação |
|---|-------------|--------------|
| **1** | Persistência: **FS + ponte**, desacoplada de HFC/MO/CSC | §7 |
| **2** | Identificadores: **UUID** | §8 |
| **3** | Sem COA activo: **recusar escrita persistente** no LFC | §15 |
| **4** | Reinício do mesmo nome: **novo casoId**; **não** substituir nem **auto-arquivar** silenciosamente | §8, §10.1, §11 |
| **5** | Exclusão: **tombstone** por padrão; **hard delete** só operação explicitamente governada | §5.1, §11 |
| **6** | Auditoria: eventos relevantes do LFC na **Trilha**; logs técnicos só operacionais | §17 |
| **7** | Backfill: **não** no M0; qualquer backfill futuro = evolução **M1** explícita | §16 |

---

## 1. Decisões preservadas (não reabrir) — ADR-021 / REQ-092 v0.2

| Fonte | Decisão fechada |
|-------|-----------------|
| ADR-021 / REQ-092 | LFC = fonte canónica de factos assertados e **vigentes** |
| | HFC/transcript = **prova** |
| | MO = decisões Art. 8º |
| | CSC = lastro operacional |
| | MRE **consome**, **não escreve** |
| | «Guardado» só após escrita bem-sucedida no LFC |
| Hierarquia #1–#8 | Escopo, escrita, verdade, contraditório, reinício, multi-caso, Conversa+Centro, retenção |
| **ADR-022** | Gatilho COA+caso; não-consumo; ambiguidade; precedência; `solicitar_dados`; limites MRE; **fora** P1-2 |
| **ADR-023** | Regime RFR: deliberação com base factual restrita; HFC residual ≠ objecto deliberativo; **fora** P1-2 / M2 / modos restritos |
| W1–W3 | Writer canónico único |

---

## 2. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I1** | LFC ≠ HFC — HFC append-only de mensagens; LFC documento **mutável** de estado vigente. |
| **I2** | LFC ≠ F5-C3 transcript — transcript é UI/fio; LFC é autoridade factual do caso. |
| **I3** | LFC ≠ MO — zero escrita de factos de caso no ledger Art. 8º. |
| **I4** | LFC ≠ CSC — zero factos de caso em `factosOficiais` ops. |
| **I5** | **Writer único** — toda mutação passa por `LfcWriter` (W1–W2). |
| **I6** | **Reader canónico** — recuperação factual usa `LfcReader`. |
| **I7** | Isolamento por `coaId`. |
| **I8** | «Guardado» ⇒ commit OK no LFC no mesmo acto. |
| **I9** | Inferências do CEO sem caminho de escrita no LFC. |
| **I10** | Contradição sem correção explícita ⇒ esclarecimento. |
| **I11** | Mesmo `titulo` + «iniciar» ⇒ novo `casoId` (UUID); anterior intacto; **sem** auto-arquivo silencioso. |
| **I12** | Arquivar ≠ apagar; exclusão lógica = tombstone; hard delete só governado. |
| **I13** | MRE/CSC/resposta restrita/jobs **não** persistem LFC. |
| **I14** | Leitura fail-soft: declarar limitação — não fingir «guardado». |
| **I15** | Persistência V1 = **FS + ponte** dedicada LFC — **não** partilha store/API com HFC, MO ou CSC. |
| **I16** | Eventos de negócio LFC → **Trilha Auditável**; logs de app ≠ auditoria de produto. |

---

## 3. Arquitectura lógica

```text
┌─────────────────────────────────────────────────────────────────┐
│ Superfícies: Conversa · Centro de Situação                       │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ escrita (utilizador)          │ leitura
                ▼                             ▼
        ┌───────────────┐             ┌───────────────┐
        │  LfcWriter    │             │  LfcReader    │
        └───────┬───────┘             └───────┬───────┘
                │                             │
                ▼                             ▼
        ┌─────────────────────────────────────────────┐
        │              LfcStore (porta)                 │
        └─────────────────────┬───────────────────────┘
                              ▼
        ┌─────────────────────────────────────────────┐
        │  Persistência FS LFC + Ponte HTTP dedicada    │
        │  (desacoplada de HFC / MO / CSC)              │
        └─────────────────────────────────────────────┘
                │
                ├──► Trilha Auditável (eventos relevantes LFC)
                └──► logs técnicos (operacionais apenas)

Prova: HFC / F5-C3 (origemTurnoRef opcional)
MRE: LfcReader apenas (RO)
```

---

## 4. Componentes

| ID | Componente | Responsabilidade | Escreve LFC? |
|----|------------|------------------|--------------|
| **S-CNV** | Conversa | Detecta actos; invoca Writer/Reader | Não (via Writer) |
| **S-CTR** | Centro de Situação | Idem; mesmo `coaId`+`casoId` | Não (via Writer) |
| **D-LFC** | Domínio | Schema; validação; estados incl. tombstone | Não |
| **W-LFC** | LfcWriter | Única mutação + V1 «guardado» | **Sim** |
| **R-LFC** | LfcReader | Activos, ponteiro, resolução, atributos | Não |
| **P-LFC** | LfcStore | get/put/list/ponteiro/tombstone | Via Writer |
| **F-LFC** | FS + ponte LFC | Persistência física dedicada | Via P-LFC |
| **T-AUD** | Trilha Auditável | Eventos relevantes LFC (ARQ-088) | Não no store LFC |
| **X-HFC / X-MO / X-CSC / X-MRE** | Vizinhos | Prova / decisões / ops / consumo RO | **Não** |

**Módulo lógico futuro (IMP):** p.ex. `app/src/lastroFactualCaso/` — não criar neste acto.

---

## 5. Contrato do writer canónico (`LfcWriter`)

### 5.1 Operações

| Operação | Pré-condições | Efeito | Saída |
|----------|---------------|--------|-------|
| `criarCaso` | `coaId` activo; acto utilizador | Novo `casoId` (**UUID**); factos activos; ponteiro activo = novo; **não** altera/arquiva casos anteriores com o mesmo título | `{ casoId, versao, nFactos, autorizaProsaGuardado }` |
| `acrescentarFactos` | Caso activo; sem contraditório (#4) | Append; `versao++` | `{ versao, nFactos }` |
| `corrigirFacto` | Correção **explícita** | Antigo→`corrigido`; novo→`activo` | `{ versao }` |
| `anularFacto` | Acto explícito | `estado=anulado` | `{ versao }` |
| `arquivarCaso` | Acto explícito (não silencioso) | `estadoLastro=arquivado`; se era activo → ponteiro `null` | `{ versao }` |
| `excluirCaso` (padrão) | Acto explícito | **Tombstone**: `estadoLastro=excluido` (ou equivalente); documento retido para auditoria; fora de resolução normal | `{ ok, modo: "tombstone" }` |
| `excluirCasoHard` | **Operação explicitamente governada** (prova de governação) | Hard delete do documento | `{ ok, modo: "hard" }` |
| `recusarContradição` | Incompatível sem correção | Sem mutação; esclarecimento | `{ tipo: "esclarecimento" }` |

### 5.2 Regras

1. Recusa escrita sem acto do utilizador / correção explícita.  
2. Recusa **qualquer** escrita persistente sem COA activo (CTO-3).  
3. Mesmo título → sempre novo UUID; **nunca** substituir; **nunca** auto-arquivar o anterior (CTO-4).  
4. «Guardado» só com `autorizaProsaGuardado` pós-commit.  
5. Put só via Writer (W1–W2).  
6. Emite evento de Trilha nos actos relevantes (§17).

---

## 6. Contrato do reader canónico (`LfcReader`)

| Operação | Notas |
|----------|--------|
| `obterCaso` / `listarActivos` | Ignora tombstones/`excluido` na resolução normal |
| `listarCasosDoCoa` | Activos (+ arquivados se pedido); excluídos só com flag explícita de auditoria |
| `obterCasoActivo` / `resolverCaso` | §9; desambiguação se N títulos |
| `consultarAtributo` | Só a partir de factos `activo` |

Re-parse HFC/transcript **não** é caminho de produto (M0 sem backfill).

---

## 7. Modelo de persistência física (**CTO-1 fechado**)

| Propriedade | Decisão |
|-------------|---------|
| Meio V1 | **Filesystem + ponte HTTP** dedicada ao LFC |
| Desacoplamento | **Proibido** partilhar ficheiro, API ou módulo de store com **HFC**, **MO** ou **CSC** |
| Mutabilidade | Documento JSON mutável por `(coaId, casoId)` |
| Índice | `{coaId}/_indice.json` — `casoActivoId` + metadados |
| Árvore ilustrativa | `executive/lastro-factual-casos/{coaId}/{casoId}.json` |
| Browser | Ponte dedicada (plugin/API LFC) — distinta da ponte HFC |
| Rejeitado V1 | `localStorage` como autoridade do LFC |

### Proibido
- Reutilizar store/API HFC, MO, Trilha (como store de factos) ou CSC.  
- JSONL append-only como única forma do documento vigente.

---

## 8. Geração e estabilidade do `casoId` (**CTO-2 / CTO-4**)

| Regra | Definição |
|-------|-----------|
| Formato | **UUID** (opaco). Prefixo opcional de apresentação (`caso-` + UUID) na IMP, sem mudar a identidade. |
| Estabilidade | Imutável após `criarCaso`. |
| `titulo` | Legível; **não** é chave. |
| Reinício mesmo nome | **Novo UUID**; LFC anterior **intactíssimo**; **sem** substituição; **sem** auto-arquivo silencioso. |
| Colisão | Regenerar UUID (improvável). |

---

## 9. Resolução do caso activo

| Evento | Ponteiro `casoActivoId` |
|--------|-------------------------|
| `criarCaso` | = novo UUID (casos anteriores com mesmo título **permanecem** como estavam — activos ou arquivados) |
| Retoma explícita | Actualiza se match único |
| Arquivar o activo | → `null` até nova retoma/criação |
| Mudança de assunto | **Não** limpa o ponteiro; não injecta factos na prosa |
| Tombstone do activo | → `null` |

`resolverCaso`: por `casoId` → título (0/1/N) → deixis (ponteiro) → pedir qual caso. **Proibido** escolher em silêncio quando N>1.

---

## 10. Criação / correcção / contradição

### 10.1 Registo
`criarCaso` com UUID novo → prosa «guardado» só se commit OK. Reinício do mesmo nome = novo caso; anteriores intactos.

### 10.2 Correção explícita
Writer.corrigirFacto → confirmação curta.

### 10.3 Contradição sem correção
Sem mutação → esclarecimento.

### 10.4 Recuperação
Reader sobre LFC; autoridade ≠ HFC.

---

## 11. Arquivamento e retenção (**CTO-4 / CTO-5**)

| `estadoLastro` | Significado |
|----------------|-------------|
| `activo` | Em uso / resolúvel |
| `arquivado` | Retido; fora do ponteiro; listável se pedido |
| `excluido` | **Tombstone** — retido para auditoria; fora da resolução normal |
| *(ausente no FS)* | Só após **hard delete** governado |

| Gatilho | Acção |
|---------|--------|
| Arquivar explícito | `arquivarCaso` |
| Novo caso mesmo nome | **Não** arquiva o anterior automaticamente |
| Exclusão normal | Tombstone |
| Hard delete | Só operação **explicitamente governada** |

---

## 12. Integração Conversa e Centro

Mesmo Writer/Reader/Store FS; mesmo `coaId`+`casoId`; proibido store paralelo por superfície.

---

## 13. Integração HFC, MO, MRE, CSC

| Sistema | Contrato |
|---------|----------|
| HFC/transcript | Prova; `origemTurnoRef` opcional; stores desacoplados; **não** autoridade factual do caso quando LFC activos existem (ADR-022); sob **RFR** (ADR-023 / §13.2) não redefine objecto deliberativo |
| MO | Sem factos de caso |
| MRE | Consome Reader sob **§13.1**; sob restrição factual explícita obedece **§13.2**; não escreve |
| CSC | Isolado |
| Resposta restrita | Gate de saída; chama Writer/Reader (IMP-092.3) — **≠** RFR |

### 13.1 Consumo LFC → MRE (ADR-022 / REQ-092 §11)

**Gatilho:** COA resolvido **e** caso resolvido/inequívoco → MRE **pode** ler `LfcReader` (RO) e injectar factos `activo` no lastro deliberativo do turno.

**Não consumo:** sem COA; sem caso identificável; pedido sem âmbito de caso → **não** injectar LFC.

**Ambiguidade:** N casos possíveis → esclarecimento; **proibido** escolha silenciosa; **proibido** merge de `casoId`.

**Precedência:** LFC activos = autoridade factual do caso; HFC/reparse = prova histórica apenas.

**Ausência:** sem LFC / sem facto necessário → **não** mascarar como facto.

**`solicitar_dados`:** válido para lacunas deliberativas **reais** não cobertas pelo LFC; factos LFC ≠ lastro suficiente automático para qualquer decisão; proibido declarar «ausente» um facto já activo no LFC sob consumo autorizado.

**Limites MRE:** só consumidor; nunca escreve; nunca promove deliberação a facto LFC; sem store paralelo.

**Fora desta frente:** detecção LN / P1-2.

**IMP:** consumo MRE = **IMP-092.4** (entregue); não reabrir aqui.

### 13.2 Regime RFR — LFC × HFC (ADR-023 / REQ-092 §12)

**Gatilho RFR:** consumo LFC autorizado (§13.1) **e** restrição **explícita** de base factual no pedido **actual**.

**Universo permitido:** factos `activo` do LFC do caso resolvido; + turno actual de registo/correção, se aplicável.

**Objecto deliberativo restrito:** `objetivoReal`, problema, análise (parte factual do caso), recomendação/acção — só sobre o universo permitido.

**HFC permitido sob RFR:** continuidade do pedido actual; deixis; identidade/resolução (sem escolha silenciosa); prova auditável.

**HFC proibido sob RFR:** factos / hipóteses / recomendações / objectivos só do fio anterior no universo ou objecto restrito; substituir activos LFC; mascarar ausência.

**Sem restrição explícita:** HFC como contexto conversacional (REQ-049); §13.1 / CM7–CM8 intactos.

**Separações:** ≠ M2; ≠ modos restritos IMP-092.3; ≠ P1-2; ≠ «LFC ⇒ lastro suficiente»; `solicitar_dados` (CM10–CM12) intacto.

**Preservações:** isolamento COA/caso; precedência LFC; MRE só consumidor; HFC append-only; sem escolha silenciosa.

**IMP:** RFR / isolamento HFC no envelope = acto **futuro** (não aberto nesta ARQ v0.4).

---

## 14. Isolamento por `coaId`

Partição FS e índice por `coaId`. Troca de COA isola ponteiro e documentos.

---

## 15. Comportamento sem COA (**CTO-3 fechado**)

| Operação | Sem COA activo |
|----------|----------------|
| Escrita persistente | **Recusar**; declarar necessidade de COA; **não** persistir sob `__sem_coa__` |
| Leitura | Sem casos LFC; não inventar |
| HFC | Pode usar `__sem_coa__` no **seu** contrato — ortogonal |

---

## 16. Migração (**CTO-7 fechado**)

| Modo | Estado |
|------|--------|
| **M0** (1ª IMP) | **Sem backfill** — só registos novos pós-IMP |
| **M1** | Evolução **explícita** futura (ferramenta/aviso); **fora** do M0 |
| **M2** (auto silencioso) | **Rejeitado** |

---

## 17. Observabilidade e auditoria (**CTO-6 fechado**)

| Canal | Uso |
|-------|-----|
| **Trilha Auditável** | Eventos **relevantes** de negócio LFC: criarCaso, acrescentar, corrigir, anular, arquivar, tombstone, hard delete, esclarecimento por contradição |
| **Logs técnicos** | Diagnóstico operacional (latência, falha de ponte, I/O) — **não** substituem a Trilha |

Conteúdo mínimo do evento de Trilha: `coaId`, `casoId`, operação, `versao`, superfície, timestamp, `origemTurnoRef?`.  
**Proibido:** usar a Trilha como store de factos; gravar LFC no MO.

---

## 18. Fluxos resumidos

```text
[Registo]     UI → Writer.criarCaso (UUID) → FS+ponte → Trilha → «guardado» sse OK
[Correção]    UI → Writer.corrigirFacto → FS → Trilha → confirmação
[Contradição] UI → Writer recusa → Trilha (esclarecimento) → prosa
[Recuperação] UI → Reader → prosa
[Tombstone]   UI → Writer.excluirCaso → estado excluido → Trilha
[Hard delete] Operação governada → Writer.excluirCasoHard → Trilha
[MRE]         Reader RO sob gatilho ADR-022 (§13.1); RFR sob ADR-023 (§13.2); sem escrita
```

---

## 19. Decisões técnicas consolidadas

| ID | Decisão |
|----|---------|
| T1 | Documento mutável (não JSONL vigente). |
| T2 | Índice + `casoActivoId`. |
| T3 | `casoId` = **UUID**. |
| T4 | Desambiguação se N títulos. |
| T5 | Mudança de assunto não limpa ponteiro. |
| T6 | **M0** sem backfill; M1 só evolução explícita. |
| T7 | Writer único Conversa/Centro. |
| T8 | Sem COA → recusa escrita persistente. |
| T9 | Persistência **FS + ponte** desacoplada. |
| T10 | Tombstone default; hard delete governado. |
| T11 | Eventos relevantes → **Trilha**; logs ≠ auditoria. |
| T12 | Reinício mesmo nome: novo UUID; sem auto-arquivo. |
| **T13** | MRE consome LFC só com COA + caso resolvido/inequívoco (ADR-022). |
| **T14** | Ambiguidade de caso → esclarecimento; nunca escolha silenciosa no MRE. |
| **T15** | HFC/reparse ≠ autoridade factual do caso quando LFC activos existem. |
| **T16** | `solicitar_dados` permanece para lacunas deliberativas não cobertas pelo LFC. |
| **T17** | Sob RFR (ADR-023): objecto deliberativo limitado ao LFC activo (+ turno registo/correção); HFC ≠ mandato factual. |
| **T18** | Sem restrição explícita: HFC como contexto conversacional; T15 intacto. |

---

## 20. Riscos

| Risco | Mitigação |
|-------|-----------|
| Writer paralelo na IMP | Gate IMP + testes W |
| Confundir ponte LFC com HFC | APIs/paths distintos (I15) |
| Falso «guardado» | V1 + testes T01/T02 |
| Hard delete acidental | Só caminho governado; default tombstone |
| Trilha sobrecarregada | Só eventos relevantes (§17) |
| Injectar LFC em toda C2 | Gatilho T13 / ADR-022; M2 |
| HFC stale vs LFC vigente | Precedência T15; CA-MRE-4 |
| «Há LFC ⇒ nunca solicitar_dados» | T16 / CM10–CM11 |
| HFC residual redefine `objetivoReal` sob «apenas factos» | T17 / ADR-023 / CA-RFR-* |

---

## 21. Ambiguidades restantes (não bloqueiam Gate ARQ)

| # | Ponto | Nota |
|---|--------|------|
| A1 | Versão UUID (v4 vs v7) | Ambos cumprem CTO-2; IMP escolhe uma e documenta |
| A2 | Prefixo de apresentação `caso-` + UUID | Cosmético |
| A3 | Schema exacto do evento na Trilha (campos REQ-088) | Detalhe IMP alinhado a ARQ-088 |
| A4 | Path exacto sob `executive/` e rotas HTTP da ponte | Detalhe IMP |
| A5 | Critério fino de «operação explicitamente governada» para hard delete | Política operacional na IMP/VAL |
| A6 | Copy UX de desambiguação de caso | Algoritmo já manda pedir (T4/T14); texto na IMP |
| A7 | Fronteira CM11/CM12 (lacuna deliberativa vs facto LFC) | Validar na IMP/VAL de consumo MRE |
| A8 | Detector LN exacto da restrição factual (RFR-G4) | Contrato fechado em ADR-023; léxico na IMP RFR |
| A9 | Fronteira continuidade do pedido vs recomendações antigas no fio | CM-RFR-7 vs CM-RFR-8 — IMP/VAL RFR |

**Nenhum** dos A1–A9 reabre CTO-1…7 nem ADR-021. ADR-022 fecha o gatilho de consumo; ADR-023 fecha RFR.

---

## 22. Fora de escopo deste acto (v0.4)

- Código, plugins, testes executáveis de RFR.  
- Abrir IMP de RFR / isolamento HFC no envelope.  
- Calibração P1-2 / detecção LN de análise deliberativa.  
- Reabrir IMP-092.4 / CTO-1…7.  
- M1 backfill.

---

## 23. Rastreabilidade

| Elo | Referência |
|-----|------------|
| ADR | ADR-021 v0.2; **ADR-022 v0.1**; **ADR-023 v0.1** |
| REQ | REQ-092 v0.4 |
| CAP | CAP-03 |
| Vizinhos | ARQ-087 (HFC); ARQ-088 (Trilha); ARQ-020 (CSC) |
| Entregue | IMP-092.1–092.4 |
| Próximo | IMP futura RFR (não aberta); VAL |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 13/09/2026 | Engenheiro (Cursor) | ARQ lógica LFC | Pós ADR/REQ v0.2 | Em análise |
| 0.2 | 13/09/2026 | Engenheiro (Cursor) | Fecha CTO-1…7; Gate ARQ | Despacho Usuário / decisões CTO | Homologada (arquitectura) |
| 0.3 | 13/09/2026 | Engenheiro (Cursor) | §13.1 LFC→MRE; T13–T16 | ADR-022 aprovada (Usuário) | Contrato consumo fechado; IMP não aberta |
| 0.4 | 13/09/2026 | Engenheiro (Cursor) | §13.2 RFR; T17–T18 | ADR-023 aprovada (Usuário) | Contrato RFR fechado; IMP não aberta |
