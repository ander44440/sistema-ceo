# REQ-092 — Contrato do Lastro Factual do Caso (LFC)

> **Status:** Em análise (CTO) — v0.4 incorpora RFR (ADR-023)  
> **Versão:** 0.4 — 13/09/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos  
> **ADR de direcção:** [ADR-021](../adr/ADR-021-lastro-factual-do-caso.md)  
> **ADR de consumo MRE:** [ADR-022](../adr/ADR-022-consumo-lfc-pelo-mre.md)  
> **ADR de base factual restrita:** [ADR-023](../adr/ADR-023-deliberacao-base-factual-restrita.md)  
> **Limite desta fatia de contrato:** sem alteração de código; **sem** abrir IMP de RFR / isolamento HFC neste acto.

---

## Enunciado

O CEO deverá manter, por **`coaId` + `casoId`**, um **Lastro Factual do Caso (LFC)** como fonte canónica dos factos **assertados pelo utilizador** e **vigentes** do caso (incluindo correcções explícitas), com **hierarquia de autoridade/integridade/operação** e **um único writer canónico** para todas as superfícies — sem confundir LFC com HFC, transcript UI, Memória Confiável, CSC ou lastro efémero do MRE.

## Tipo

Funcional; alto nível (contrato). Sem especificação de meio de persistência nesta fatia.

## Justificativa

CON-001 Art. 9º; ADR-015; REQ-037/039; ADR-021 v0.2 (hierarquia LFC + autoridade única de escrita); **ADR-022 v0.1** (consumo LFC pelo MRE); **ADR-023 v0.1** (deliberação com base factual restrita).

Auditoria ValeVerde: T01 «guardado» sem recuperação fiável em T02/T04/T08/T09. Sem hierarquia e writer único, IMP cria autoridades paralelas. Auditoria T05 deliberativo: LFC activo sem consumo MRE — gatilho fechado em ADR-022. Auditoria LFC × HFC: LFC correcto com HFC residual a contaminar objecto deliberativo — regime RFR fechado em ADR-023.

---

## Hierarquia do contrato LFC (normativa)

Precedência: **Nível 1 > Nível 2 > Nível 3**. Em conflito, aplica-se o nível superior.

### NÍVEL 1 — AUTORIDADE

| # | Regra |
|---|--------|
| **1** | Escopo e identidade do caso: **`coaId` + `casoId`**. |
| **2** | Autoridade de escrita: criação/correção **somente** pelo utilizador ou por correção **explicitamente solicitada**. |
| **3** | Verdade factual: inferência do CEO **nunca** vira facto activo. |

### NÍVEL 2 — INTEGRIDADE

| # | Regra |
|---|--------|
| **4** | Contradição/correção: **sem** correção explícita, **não** auto-resolver; **solicitar esclarecimento**. |
| **5** | Reinício do mesmo nome: emitir **novo `casoId`**; **nunca** sobrescrever silenciosamente o LFC anterior. |

### NÍVEL 3 — OPERAÇÃO

| # | Regra |
|---|--------|
| **6** | Múltiplos casos **podem coexistir** no mesmo COA (vários `casoId` sob o mesmo `coaId`). |
| **7** | Conversa e Centro de Situação **acedem ao mesmo LFC** usando `coaId` + `casoId`. |
| **8** | Retenção: **arquivamento por padrão**; exclusão **somente** por ação explícita e governada. |

### Regra complementar obrigatória — writer único

| ID | Regra |
|----|--------|
| **W1** | Todas as superfícies que escrevem no mesmo LFC **devem** utilizar o **mesmo contrato / writer canónico**. |
| **W2** | **Proibido** escritores paralelos com regras próprias de autoridade (inclui Conversa, Centro de Situação, MRE, CSC, resposta restrita, jobs, automações). |
| **W3** | MRE **consome** LFC; **não escreve**. CSC e Memória Confiável **não escrevem** LFC. |
| **W3-MRE** | O consumo pelo MRE obedece ao **gatilho e limites** de [ADR-022](../adr/ADR-022-consumo-lfc-pelo-mre.md) / §11 deste REQ — não é injectar LFC em toda deliberação. |

---

## Separação de fontes (preservada)

| Fonte | Papel |
|-------|--------|
| **LFC** | Fonte canónica de factos **assertados e vigentes** do caso |
| **HFC / transcript** | **Prova** da conversa (o que foi dito) |
| **Memória Confiável** | **Decisões** Art. 8º apenas |
| **CSC** | Lastro **operacional** (Jobs/Gates/Painel) |
| **MRE** | **Consome** LFC (e outro lastro deliberativo); **não escreve** LFC |
| **«Guardado»** | Só após escrita bem-sucedida no LFC |

---

## 1. Definição formal do objecto

### 1.1 LastroFactualCaso

| Campo | Tipo | Obrigatório | Significado |
|-------|------|-------------|-------------|
| `coaId` | string | sim | Âmbito de isolamento (COA) — Hierarquia #1 |
| `casoId` | string | sim | Identidade estável do caso no COA — Hierarquia #1 |
| `titulo` | string | não | Nome legível (ex. «ValeVerde»); **não** é chave de identidade |
| `estadoLastro` | `activo` \| `arquivado` | sim | Retenção — Hierarquia #8; default operacional = activo até arquivar |
| `factos` | FactoCaso[] | sim | Lista ordenada de enunciados |
| `versao` | number inteiro ≥ 1 | sim | Incrementa a cada mutação bem-sucedida via writer canónico |
| `criadoEm` | ISO-8601 | sim | |
| `actualizadoEm` | ISO-8601 | sim | |

### 1.2 FactoCaso

| Campo | Tipo | Obrigatório | Significado |
|-------|------|-------------|-------------|
| `id` | string | sim | Identidade estável do enunciado |
| `texto` | string | sim | Enunciado factual canónico (sem envelope de pedido) |
| `estado` | `activo` \| `corrigido` \| `anulado` | sim | Vigência |
| `corrigidoPor` | string \| null | não | `id` do sucessor, se `corrigido` |
| `origemTurnoRef` | string \| null | não | Prova (HFC/transcript) — não autoridade |
| `criadoEm` | ISO-8601 | sim | |
| `actualizadoEm` | ISO-8601 | sim | |

**Invariantes:**

- Recuperação operacional: só factos com `estado = activo` em LFC com `estadoLastro = activo` (salvo consulta explícita a arquivados).
- Escrita: **apenas** pelo writer canónico (W1–W2).

---

## 2. Autoridade e escopo (Nível 1)

| ID | Regra | Hierarquia |
|----|--------|------------|
| A1 | Chave de âmbito: **`coaId`**. LFC de um COA **não** é visível noutro (REQ-039). | #1 |
| A2 | Chave de caso: **`casoId`**. O `titulo` não identifica. | #1 |
| A3 | LFC = **única autoridade** dos factos **vigentes** do caso. | ADR-021 |
| A4 | HFC/transcript = **prova**, não lista vigente após correcções. | — |
| A5 | Criação/correção: **somente** utilizador ou correção explicitamente solicitada. | #2 |
| A6 | Inferência do CEO **nunca** vira facto activo. | #3 |
| A7 | Sem COA resolvido: **não** inventar `coaId`; declarar limitação ou exigir contexto (ponto residual — ver fim). | #1 |

---

## 3. Ciclo de vida

```
(não existe)
  → writer: cria LFC (estadoLastro=activo) + factos activos     [registo]
  → factos activos                                              [recuperação]
  → writer: correção explícita → antigo=corrigido; novo=activo  [só com #4]
  → anulado                                                     [ação explícita utilizador]
  → mudança de assunto: LFC intacto; sem injectar               [M1–M2]
  → retomada: lê activos do casoId                              [M3]
  → «mesmo nome» de novo: NOVO casoId; LFC anterior intacto     [#5]
  → arquivado (padrão de retenção)                              [#8]
  → exclusão: só ação explícita e governada                     [#8]
```

---

## 4. Criação e correcção (Nível 1 + writer)

### Criação

| ID | Regra |
|----|--------|
| C1 | Só acto do **utilizador** (registo / factos iniciais / «apenas registe…») via **writer canónico**. |
| C2 | Extrair enunciados factuais; **não** o envelope de disciplina. |
| C3 | Após commit no LFC: confirmação pode dizer N guardados = N activos escritos nesse acto. |
| C4 | Falha de escrita → **proibido** «guardado»/«registado» (§8). |
| C5 | Superfícies (Conversa, Centro, …) **não** implementam lógica própria de append — só invocam o writer (W1). |

### Correcção

| ID | Regra |
|----|--------|
| R1 | Só correção **explícita** do utilizador, via writer canónico. |
| R2 | Antigo → `corrigido` + `corrigidoPor`; novo → `activo`. |
| R3 | Confirmação **sem** análise, recomendação ou urgência inventada. |

---

## 5. Contraditórios (Nível 2 / #4)

| ID | Regra |
|----|--------|
| X1 | Não coexistirem dois factos **activos** directamente incompatíveis no mesmo `casoId`. |
| X2 | Com correção explícita: writer aplica R2 (resolve). |
| X3 | **Sem** correção explícita: **proibido** auto-resolver; **solicitar esclarecimento**; **não** duplicar activos contraditórios. |

---

## 6. Inferências do CEO (Nível 1 / #3)

| ID | Regra |
|----|--------|
| I1 | Deliberação, recomendação, urgência, causalidade inferida, objectivos do CEO → **fora** do LFC. |
| I2 | MRE / Speaker / CSC **não** escrevem LFC (W3). |
| I3 | Únicos actos de escrita: registo, correção, anulação, arquivamento/exclusão governada — via writer canónico, atribuíveis ao utilizador (ou política governada de retenção sem alterar enunciados). |
| I4 | Ecoar facto activo na resposta **não** cria facto. |

---

## 7. Precedência de leitura (fontes vizinhas)

| Prioridade | Fonte | Uso |
|------------|-------|-----|
| **1** | **LFC** activos | Autoridade de factos vigentes |
| 2 | Turno actual **com** acto de registo/correção | Entrada para o **writer**; não substitui leitura do passado |
| 3 | Re-parse HFC/transcript | Fallback diagnóstico/migração — **não** autoridade após LFC existir |
| — | CSC | Nunca para factos de caso |
| — | MO | Nunca — só decisões |
| — | MRE | Consome via Reader sob ADR-022; não escreve; não substitui LFC na recuperação factual restrita **nem** na deliberação quando o consumo está autorizado |

---

## 8. Contrato de verdade — «guardado»

| ID | Regra |
|----|--------|
| V1 | «Guardado» / «registado» / «N facto(s) guardado(s)» **só** após commit bem-sucedido no LFC pelo writer canónico. |
| V2 | Contar bullets sem escrever LFC **não** autoriza V1. |
| V3 | LFC indisponível → declarar limitação; **não** fingir persistência. |

---

## 9. Mudança de assunto, retomada, multi-caso, superfícies, retenção

| ID | Regra | Hierarquia |
|----|--------|------------|
| M1 | Mudança de assunto **não apaga** LFC. | — |
| M2 | Sem pedido do caso, **não injectar** factos do LFC. | — |
| M3 | Retomada lê activos do `casoId` indicado/resolvido. | #1 |
| M4 | «Iniciar» com o **mesmo nome** no mesmo COA → **novo `casoId`**; LFC anterior permanece (activo ou a arquivar conforme política); **nunca** sobrescrever em silêncio. | #5 |
| M5 | Vários `casoId` no mesmo `coaId` são válidos. | #6 |
| M6 | Conversa e Centro de Situação usam o **mesmo** LFC (`coaId`+`casoId`) e o **mesmo** writer. | #7, W1 |
| M7 | Arquivamento = retenção padrão quando o caso deixa de ser o foco operacional prolongado / encerramento governado; exclusão **só** ação explícita e governada. | #8 |

---

## 10. Critérios de aceitação (bateria ValeVerde)

Alvo observável **após** writer/reader conformes; contrato base **não** exige código nesta fatia documental.

| Teste | Critério |
|-------|----------|
| **T01** | Confirma sem análise; N = factos activos escritos no LFC; V1. |
| **T02** | Lista o conjunto activo; **proibido** «não há factos» se T01 commitou. |
| **T04** | Após mudança de assunto, retoma o mesmo conjunto vigente. |
| **T05** | Facto não assertado → `NÃO` (fechado); sem inventar. |
| **T06** | Correção explícita serviços→logística; antigo `corrigido`, novo `activo`; sem análise. |
| **T07** | Sector vigente do LFC (logística pós-T06). |
| **T08** | Lista todos os activos vigentes (com correção aplicada). |
| **T09** | Dois factos pedidos a partir do LFC apenas. |
| **T03** | Não contamina (M1–M2). |

Critérios extra (hierarquia):

| ID | Critério |
|----|----------|
| **H4** | Assertiva incompatível **sem** «corrija» → esclarecimento; LFC sem dois activos contraditórios. |
| **H5** | Segundo «iniciar ValeVerde» → novo `casoId`; primeiro LFC intacto. |
| **W** | Nenhuma superfície escreve LFC fora do writer canónico. |

---

## 11. Consumo do LFC pelo MRE (ADR-022)

Norma de direcção: [ADR-022](../adr/ADR-022-consumo-lfc-pelo-mre.md). **Não** abre IMP neste acto. **Fora de escopo:** calibração P1-2 / detecção LN de análise deliberativa.

### 11.1 Gatilho de consumo

| ID | Regra |
|----|--------|
| **CM1** | O MRE **pode** consumir LFC **somente** via `LfcReader` (read-only). |
| **CM2** | Consumo **autorizado** só com **COA resolvido** **e** **caso resolvido ou inequívoco** (`casoId` explícito, título com match único, ou deixis/ponteiro inequívoco). |

### 11.2 Não consumo

| ID | Regra |
|----|--------|
| **CM3** | Sem COA resolvido → **não** injectar LFC; **não** inventar `coaId`. |
| **CM4** | Sem caso identificável/inequívoco → **não** injectar LFC (reforça M2). |
| **CM5** | Pedido sem âmbito de caso → **não** injectar LFC. |

### 11.3 Ambiguidade

| ID | Regra |
|----|--------|
| **CM6** | Múltiplos casos possíveis → **pedir esclarecimento**; **proibido** escolher em silêncio; **proibido** misturar activos de vários `casoId`. |

### 11.4 Precedência factual (deliberação)

| ID | Regra |
|----|--------|
| **CM7** | Com consumo autorizado e LFC com factos `activo`: esses factos são a **autoridade factual do caso** na deliberação. |
| **CM8** | HFC / transcript / reparse = **prova histórica**; **não** substituem factos activos do LFC quando CM7 aplica. |
| **CM9** | Ausência de LFC ou de facto **necessário** **não** deve ser mascarada como facto. |

### 11.5 `solicitar_dados` e lastro deliberativo

| ID | Regra |
|----|--------|
| **CM10** | Factos no LFC **não** implicam automaticamente lastro suficiente para **qualquer** decisão. |
| **CM11** | `solicitar_dados` **permanece válido** para lacunas deliberativas **reais** **não cobertas** pelo LFC. |
| **CM12** | Com consumo autorizado e facto de caso já activo no LFC, **proibido** tratar esse facto como «ausente» só porque o HFC/reparse ou o Acervo não o ecoam. |

### 11.6 Limites do MRE

| ID | Regra |
|----|--------|
| **CM13** | MRE **nunca** escreve no LFC (W3). |
| **CM14** | Deliberação / recomendação / urgência / conclusão do MRE **não** viram facto LFC. |
| **CM15** | MRE **não** mantém autoridade paralela de factos de caso fora do Reader. |

### 11.7 Critérios de aceitação (consumo MRE)

Alvo observável **após** IMP futura de consumo (acto separado). Esta versão **só** fecha o contrato.

| ID | Critério |
|----|----------|
| **CA-MRE-1** | Com COA + caso inequívoco e LFC com activos: deliberação sobre o caso usa factos activos do Reader (não lista vigente só de reparse). |
| **CA-MRE-2** | Sem caso identificável: deliberação **não** recebe injectação de LFC. |
| **CA-MRE-3** | Ambiguidade N>1: esclarecimento; zero escolha silenciosa; zero merge de casos. |
| **CA-MRE-4** | Com LFC activo corrigido (ex. valor vigente ≠ eco HFC antigo): prevalece o activo LFC. |
| **CA-MRE-5** | Lacuna deliberativa real não coberta pelo LFC → `solicitar_dados` continua permitido. |
| **CA-MRE-6** | Facto já activo no LFC sob CM7 → não declarado «ausente» por falha de reparse/Acervo. |
| **CA-MRE-7** | Nenhuma escrita LFC originada do MRE/Speaker. |

---

## 12. Deliberação com base factual restrita (ADR-023)

Norma de direcção: [ADR-023](../adr/ADR-023-deliberacao-base-factual-restrita.md). **Não** abre IMP neste acto. **Geral** (qualquer deliberação com restrição factual explícita). **Fora de escopo:** P1-2; modos restritos IMP-092.3; alteração do HFC append-only.

### 12.1 Gatilho (RFR)

| ID | Regra |
|----|--------|
| **CM-RFR-1** | Regime RFR **só** com **consumo LFC autorizado** (CM2) **e** restrição **explícita** de base factual no **pedido actual** aos factos registados/assertados/lastro do caso (ou equivalente semântico inequívoco). |
| **CM-RFR-2** | Sem restrição explícita no pedido actual → **não** aplicar RFR; aplicar §11 + D3 (HFC como contexto conversacional, com CM7–CM8). |
| **CM-RFR-3** | Caso ambíguo (CM6) → esclarecimento; **proibido** aplicar RFR com injectação LFC sob escolha silenciosa. |

### 12.2 Universo permitido e objecto deliberativo

| ID | Regra |
|----|--------|
| **CM-RFR-4** | Universo factual permitido = factos `activo` do LFC do `casoId` resolvido +, se aplicável no mesmo acto, turno actual de registo/correção explícita do utilizador. |
| **CM-RFR-5** | Sob RFR, `objetivoReal`, problema, análise (na parte factual do caso), recomendação e acção proposta **limitam-se** ao universo permitido. |
| **CM-RFR-6** | Ausência de facto necessário no universo → declarar limitação / lacuna deliberativa real (CM9–CM11); **proibido** inventar ou importar do HFC. |

### 12.3 HFC sob RFR

| ID | Regra |
|----|--------|
| **CM-RFR-7** | HFC **pode**: continuidade do pedido actual; deixis; apoio a identidade/resolução já sujeita a CM2/CM6; prova auditável (`origemTurnoRef`). |
| **CM-RFR-8** | HFC **não pode**: introduzir no universo/objecto restrito factos, hipóteses, recomendações ou objectivos de turnos anteriores; substituir/estender activos LFC; mascarar ausência de facto LFC. |
| **CM-RFR-9** | RFR **não** apaga, reescreve nem invalida o arquivo HFC (REQ-087). |

### 12.4 Separações (D4)

| ID | Regra |
|----|--------|
| **CM-RFR-10** | RFR **≠** M2 (anti-injecção LFC). |
| **CM-RFR-11** | RFR **≠** modos restritos IMP-092.3. |
| **CM-RFR-12** | RFR **≠** P1-2 / detecção LN de análise deliberativa. |
| **CM-RFR-13** | RFR **não** altera CM10–CM12 (`solicitar_dados`); **proibido** interpretar RFR como «LFC existe ⇒ lastro suficiente / nunca `solicitar_dados`». |

### 12.5 Critérios de aceitação (RFR)

Alvo observável **após** IMP futura de RFR (acto separado). Esta versão **só** fecha o contrato.

| ID | Critério |
|----|----------|
| **CA-RFR-1** | Com CM2 + restrição explícita: objecto deliberativo (`objetivoReal`/recomendação) **não** assenta em temas só presentes no HFC e ausentes do LFC activo. |
| **CA-RFR-2** | Com as mesmas condições: `factosOficiais` / lastro factual do caso permanece LFC (CM7); HFC não reentra como lista vigente. |
| **CA-RFR-3** | HFC/fio pode existir no canal de continuidade/prova **sem** redefinir o problema para recomendação/objectivo de turno anterior. |
| **CA-RFR-4** | Sem restrição explícita: histórico conversacional permanece permitido (CM-RFR-2); CM7–CM8 intactos. |
| **CA-RFR-5** | Lacuna deliberativa real não coberta pelo LFC → `solicitar_dados` continua permitido (CM11); sem inventar lastro a partir do HFC. |
| **CA-RFR-6** | Ambiguidade de caso → esclarecimento; zero RFR com merge/escolha silenciosa. |

---

## Fora do escopo (esta fatia)

- Store, API, UI, código do writer/reader (já parcialmente entregue em IMP-092.x — não reabre aqui).
- IMP de **consumo MRE** (entregue em IMP-092.4 — não reabre aqui).
- IMP de **RFR / isolamento HFC no envelope** (acto futuro, pós ADR-023).
- Calibração P1-2 / detecção LN de análise deliberativa.
- Promoção a Acervo/Porta.
- Backfill automático de baterias antigas.

## Dependências

- ADR-021 v0.2.
- **ADR-022 v0.1** (consumo LFC pelo MRE).
- **ADR-023 v0.1** (deliberação com base factual restrita).
- REQ-037, REQ-039, REQ-087.
- Vizinhos deliberativos: REQ-048/049 (`solicitar_dados`; histórico = contexto); REQ-070 (Acervo ≠ lacuna material).
- MO: não absorver LFC.

## Riscos e incertezas (residual)

- Meio de persistência (ARQ/IMP) — parcialmente fechado em ARQ-092 (FS+ponte).
- Algoritmo exacto de geração de `casoId` (uuid vs slug+sufixo) — **desde que** #5 seja cumprido (ARQ: UUID).
- Resolução quando há vários casos e o utilizador diz só o título → **CM6 / ADR-022**: pedir esclarecimento (não escolha silenciosa); UX copy na IMP.
- Sem COA activo: escrita recusada (ARQ CTO-3); leitura sem injectar (CM3).
- Momento exacto do arquivamento automático vs só por acto explícito «arquivar» (default = arquivar, não apagar).
- Fronteira fina entre «lacuna deliberativa real» (CM11) e «facto já no LFC» (CM12) — validar na IMP/VAL.
- Detector LN exacto da restrição factual (RFR-G4) — IMP futura; contrato fechado em ADR-023 / §12.
- Fronteira fina entre «continuidade do pedido» e «recomendações antigas no fio» (CM-RFR-7 vs CM-RFR-8) — validar na IMP/VAL.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | CON-001 Art. 9º; ADR-015; ADR-021 v0.2; **ADR-022 v0.1**; **ADR-023 v0.1** |
| Origem | Hierarquia LFC + writer único; consumo MRE; RFR LFC×HFC (despacho Usuário 13/09/2026) |
| Decisões derivadas | ADR-022; **ADR-023** |
| Implementação | IMP-092.1–092.4; **RFR — IMP futura (não aberta)** |
| Testes | §10 (ValeVerde) + §11.7 (CA-MRE-*) + §12.5 (CA-RFR-*) → futuros TST/VAL |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 13/09/2026 | Engenheiro (Cursor) | Contrato LFC §1–10 | Formalizar antes de store | Em análise CTO |
| 0.2 | 13/09/2026 | Engenheiro (Cursor) | Hierarquia N1–N3; W1–W3; fecho #4–#8 | Despacho Usuário | Em análise CTO |
| 0.3 | 13/09/2026 | Engenheiro (Cursor) | §11 consumo MRE (CM1–CM15; CA-MRE-*); W3-MRE | ADR-022 aprovada (Usuário) | Contrato fechado; IMP não aberta |
| 0.4 | 13/09/2026 | Engenheiro (Cursor) | §12 RFR (CM-RFR-*; CA-RFR-*) | ADR-023 aprovada (Usuário) | Contrato RFR fechado; IMP não aberta |
