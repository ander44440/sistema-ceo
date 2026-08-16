# VIS-009 — Visão da Memória de Evolução do Produto CEO (MEP-CEO)

> **Status: Homologada — v1.1 (CTO, 16/08/2026).** v1.0 permanece homologada (14/08/2026) como visão do contrato mínimo C1+C2.  
> Tipo VIS. **Identificação:** VIS-009.  
> **Capacidade proprietária:** **CAP-13 — Memória de Evolução do Produto** (CAP-E; ADR-020). A MEP-CEO é a memória desta capacidade.  
> **Ciclo:** ANL-018 aprovada → esta VIS → REQ-085 → ARQ-033. **v1.1:** §7 autoriza o recorte C3/UI no contrato. ARQ-033 **v1.1 homologada**. IMP / código / UI de C3 **ainda não existem**.  
> Norma superior: CON-001; VIS-001; VIS-002; CAP-001 v1.1; ADR-002; ADR-006; ADR-015; ADR-016; ADR-017; ADR-020.  
> **Não altera / não reabre:** CAP-04; CAP-05; ARQ-009; ARQ-031; REQ-033; REQ-070…074; Motor; MRE; EIC; Gate G2; MTE; `monitorar`; C1/C2/IMP-073.

---

## As quatro perguntas (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A visão de uma memória **exclusiva do produto CEO**: o registro vivo, evidenciado e não apagável da evolução do Sistema CEO como produto — capacidades, épicos, módulos, decisões de produto, evidências, pendências, baselines, roadmap e histórico de evolução. |
| **Por que existe?** | O CEO já possui Memória Organizacional (CAP-05) e Acervo de Conhecimento (CAP-04), ambos voltados à **organização / cliente**. Não existe, hoje, um lugar canónico onde o **produto** recorde a própria evolução sem misturar factos de clientes. Sem essa fronteira, o produto não amadurece com rastro próprio — ou contamina a memória alheia. |
| **Para quem existe?** | Usuário (autoridade de homologação de baseline); CTO (fronteira, requisitos e arquitectura); CEO-agente (registar, organizar, consultar e propor); Engenheiro (implementação futura — **fora desta etapa**). |
| **Como o sucesso será medido?** | Quando for possível responder, só com objectos da MEP-CEO: *o que o produto já é, o que está em construção, o que está pendente, com que evidência e em que baseline* — **sem** consultar conversas, decisões ou factos de qualquer organização cliente. Critérios na §7. |

---

## 1. Problema

O Sistema CEO acumula memória no eixo **organização / cliente**:

| Memória existente | Objecto | Norma |
|-------------------|---------|--------|
| Memória Organizacional | Decisões e contexto da organização (quem, quando, por quê, baseado em quê, resultado) | CON-001 Art. 8º; CAP-05; VIS-004; REQ-033; ARQ-009 |
| Acervo de Conhecimento | Património consultável da organização / COA | CAP-04; ARQ-006; ARQ-031 |

Isso é necessário. **Não é suficiente.**

Falta o eixo **produto**:

* o CEO não possui um registro próprio de *como o produto evolui*;
* capacidades, épicos, módulos e baselines de produto convivem de forma dispersa em documentos, sem objecto de memória dedicado;
* há risco estrutural de uma necessidade observada **num cliente** ser gravada automaticamente como facto do produto — levando consigo dados, conversas, conhecimento operacional ou decisões privadas;
* hipótese e facto de produto não têm fronteira de autoridade: o agente pode, na prática, tratar o que *observou* como o que *o produto é*.

**Problema central:** o produto CEO não tem memória de si mesmo, distinta da memória de quem o usa.

---

## 2. O que é a MEP-CEO

A **Memória de Evolução do Produto CEO (MEP-CEO)** é a memória institucional do **produto** Sistema CEO.

Ela existe para que o produto:

1. **saiba o que já foi concebido, definido, construído, validado, homologado e tornado baseline**;
2. **preserve o histórico de evolução** — estados anteriores nunca apagados; mudanças como eventos;
3. **apóie-se em evidência** — toda mudança relevante aponta para a origem;
4. **respeite autoridade** — o CEO-agente organiza e propõe; não homologa baseline sozinho; não apaga histórico; não transforma hipótese em facto;
5. **permaneça isolada** da memória de organizações e clientes.

A capacidade dona é a **CAP-13**. A MEP-CEO é a memória dessa capacidade — não um mecanismo órfão.

A MEP-CEO **não** é a Memória Organizacional (CAP-05).  
A MEP-CEO **não** é o Acervo de Conhecimento (CAP-04).  
A MEP-CEO **não** é evolução autónoma de organizações.  
A MEP-CEO **não** integra Motor, MRE, EIC, Gate G2 ou MTE.  
A homologação **v1.0** não incluía código, UI, IMP nem C3. O **v1.1** autoriza no contrato o canal C3 (proposta desidentificada → `CONCEBIDO` / hipótese) e um bloco só-leitura no Centro de Situação; **não** autoriza implementação neste acto (ARQ/IMP/VAL futuros).

---

## 3. Separação canónica (dois eixos)

```
PRODUTO CEO  ↔  MEP-CEO (CAP-13)
ORGANIZAÇÃO / CLIENTE  ↔  CAP-04 / CAP-05
```

```
PRODUTO CEO                          ORGANIZAÇÃO / CLIENTE
─────────────                        ─────────────────────
Memória de Evolução                  Acervo (CAP-04) +
do Produto CEO (MEP-CEO / CAP-13)    Memória Organizacional (CAP-05)

O que o produto é e como evolui      O que aquela organização
                                     decidiu, sabe e opera
```

| Eixo | Memória | Pertence a | Exemplos do que guarda | Exemplos do que **não** guarda |
|------|---------|------------|------------------------|--------------------------------|
| **Produto CEO** | MEP-CEO | **CAP-13** | `MCP` `EPC` `MDL` `DCP` `EVD` `PND` `BSL` `RMP` `MEV` | Dados, conversas, conhecimento operacional, decisões privadas e factos de um cliente |
| **Organização / cliente** | Acervo + Memória Organizacional | **CAP-04** / **CAP-05** | Decisão Art. 8º; COA; item `KNW`; operação daquele contexto | Catálogo de evolução do produto; `BSL` de produto; `RMP` |

**Regra de ouro desta visão:** um facto só entra na MEP-CEO se for facto **do produto**. Um facto da organização permanece na Memória da Organização. A passagem de um eixo ao outro **nunca é automática**.

---

## 4. Objectos mínimos (visão)

A MEP-CEO deverá ser capaz de representar:

| Objecto | Espaço (visão) | Papel |
|---------|----------------|-------|
| **Capacidade** | `MCP` | O que o produto precisa saber fazer (catálogo de produto; ≠ CAP-nn do mapa; ≠ uso numa organização) |
| **Épico** | `EPC` | Unidade de evolução do produto, acima do módulo |
| **Módulo** | `MDL` | Parte identificável do produto em evolução |
| **Decisão** | `DCP` | Decisão **de produto** (não decisão da organização cliente) |
| **Evidência** | `EVD` | Lastros de origem de uma mudança relevante |
| **Pendência** | `PND` | Trabalho em aberto sobre um objecto de produto |
| **Baseline** | `BSL` | Estado homologado e **congelado** do produto (ou de um recorte) |
| **Roadmap** | `RMP` | Plano de evolução do produto (objecto de memória; ≠ tipo documental ROADMAP) |
| **Histórico / evento** | `MEV` | Cadeia append-only; estados anteriores preservados |

A forma vinculante dos identificadores `MARCADOR-nnn` e das transições está em REQ-085 e ARQ-033.

---

## 5. Maturidade e trabalho (visão)

Dois eixos de estado, **ortogonais**:

**Maturidade do objecto de produto**

`CONCEBIDO → DEFINIDO → EM_CONSTRUÇÃO → EM_VALIDAÇÃO → HOMOLOGADO → BASELINE`

**Trabalho sobre o objecto**

`SEM_PENDÊNCIA | PENDÊNCIA_ATIVA | EM_INVESTIGAÇÃO | BLOQUEADO`

Maturidade responde *até onde o produto chegou*. Trabalho responde *se há algo em aberto agora*. Homologar baseline **não** é um acto do CEO-agente sozinho.

---

## 6. Autoridade, evidência e histórico (visão)

### Autoridade

* O CEO-agente **pode** registar, organizar, consultar e **propor** actualizações na MEP-CEO.
* O CEO-agente **não pode**, sozinho, homologar baseline.
* O CEO-agente **não pode** apagar histórico.
* O CEO-agente **não pode** transformar hipótese em facto.
* A homologação permanece na autoridade definida pelo projecto (CON-001 Art. 6º: Usuário como autoridade máxima; CTO nas alçadas técnicas que a norma já atribui).

### Evidência

Toda mudança relevante na MEP-CEO aponta para a sua evidência de origem. Sem evidência, a mudança não se apresenta como facto de produto.

### Histórico

Estados anteriores nunca são apagados. Mudanças geram eventos de evolução. A MEP-CEO é memória, não rascunho descartável.

---

## 7. Ponte C3 (visão v1.1 — recorte mínimo autorizado no contrato)

Uma necessidade **observada num cliente** origina uma **proposta de evolução do produto** **somente** mediante acto **explícito** de proposta desidentificada (canal **C3**), desde que:

1. a Memória da Organização **não** seja copiada para a MEP-CEO;
2. o que atravessa a fronteira seja apenas um **enunciado de produto desidentificado** (tipo de lacuna, capacidade/épico/módulo candidato, hipótese, evidência não privada);
3. esse enunciado nasça como **exactamente um** objecto MEP em **`CONCEBIDO` / hipótese**, nunca como facto, `HOMOLOGADO` nem `BASELINE`; C3 **não** promove maturidade;
4. dados, conversas, conhecimento operacional, decisões privadas e factos da organização **permaneçam** no eixo organização / cliente; conteúdo proibido = recusa fail-closed;
5. não haja ingestão automática (conversa, COA, CAP-04, CAP-05, MRE, EIC, fila).

A primeira superfície perceptível é um **bloco só-leitura no Centro de Situação** (identificador, tipo `MCP`/`EPC`/`MDL`, enunciado desidentificado, maturidade `CONCEBIDO`). Sem formulário, sem Conversa, sem rota nova.

Esta visão **autoriza o contrato** desse recorte (REQ-085 v1.1). **Não autoriza**, neste acto: código, API, ARQ-033 v1.1, IMP, VAL, automação nem teste de produto.

---

## 8. Critérios de sucesso desta visão

A VIS-009 terá cumprido o seu papel quando o CTO e o Usuário puderem afirmar:

1. Existe um conceito oficial de MEP-CEO, distinto da Memória Organizacional e do Acervo.
2. Está explícito o que a MEP-CEO **nunca** armazena automaticamente.
3. Os nove objectos mínimos e os dois eixos de estado estão nomeados.
4. A regra de autoridade (propor ≠ homologar; hipótese ≠ facto; histórico não se apaga) está na visão de produto.
5. A ponte C3 está descrita como canal de proposta desidentificada para `CONCEBIDO` / hipótese, com fail-closed e UI só-leitura no Centro de Situação (contrato v1.1); implementação permanece ciclo ARQ → IMP → VAL.
6. Nenhuma outra frente (Motor, Gate G2, MTE, `monitorar`, CAP-04, CAP-05) foi reaberta para esta visão existir.

---

## 9. Fora do escopo desta visão

* Implementação, API, formulário, ARQ-033 v1.1, IMP e VAL de C3/UI **neste acto**.
* Memória de clientes / organizações (CAP-05 permanece a sede).
* Curadoria do Acervo (CAP-04 permanece a sede).
* Evolução autónoma de organizações.
* Aprendizado Executivo do MRE (REQ-051) — retenção pós-deliberação **da organização**, não catálogo de produto.
* Correcção de problemas existentes do CEO.
* Qualquer alteração ao Motor, MRE, EIC, Gate G2, MTE ou `monitorar`.
* Alteração de C1, C2 ou IMP-073.

A CAP-13 **já está instituída** (ADR-020). Esta VIS não a cria de novo; declara-a como capacidade proprietária da MEP-CEO.

A CAP-13 **já está instituída** (ADR-020). Esta VIS não a cria de novo; declara-a como capacidade proprietária da MEP-CEO.

---

## 10. Relação com normas vigentes (sem as emendar)

| Norma | Relação |
|-------|---------|
| CON-001 Art. 4º | A MEP-CEO fortalece **Conhecimento** (do produto) e **Governança** (rastro de evolução). Não enfraquece os demais pilares. |
| CON-001 Art. 8º | Continua a reger a **Memória Organizacional**. A MEP-CEO não a substitui nem a absorve. |
| VIS-001 | O CEO continua Sistema Executivo de Governança; a MEP-CEO é memória do *produto* que realiza essa visão. |
| CAP-04 / ARQ-031 | Acervo = património consultável da organização. Itens KNW **não** são objectos MEP. |
| CAP-05 / VIS-004 / ARQ-009 | Memória Organizacional viva = condução do contexto da organização. Componente H **não** é a MEP-CEO. |
| CAP-06 / BCO | Aprendizado e maturação de competências **organizacionais**. Distinto do catálogo de evolução do produto. |
| ADR-016 | O tipo documental ROADMAP permanece; o objecto `RMP` é memória de produto, não um novo tipo documental. |
| **CAP-13 / ADR-020** | Capacidade proprietária da MEP-CEO. |

---

## 11. Declaração de homologação

Esta VIS **v1.0** e **v1.1** estão **homologadas** como visão da CAP-13 (v1.1 = recorte C3/UI no contrato). Não autoriza IMP, código, API nem integração com Motor / MRE / EIC / Gate G2 / MTE neste acto. ARQ-033 **v1.1 está homologada**; IMP C3/UI permanece acto próprio.

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 14/08/2026 | Engenheiro (Cursor) | Criação da visão da MEP-CEO | Contrato CTO — iniciar a frente; sem código | Rascunho |
| 0.1 (anotação) | 14/08/2026 | Engenheiro (Cursor) | Rastreio à **CAP-13** (ADR-020) | Formalização da CAP; VIS ainda não homologada | Rascunho técnico aprovado |
| 1.0 | 14/08/2026 | CTO despachou homologação; Engenheiro incorporou CAP-13, eixos, objectos | Homologação do pacote VIS→REQ→ARQ | Despacho CTO — homologar especificação MEP-CEO | **Homologada** |
| 1.1 | 16/08/2026 | CTO homologou; Engenheiro formalizou | §7 autoriza contrato C3 (`CONCEBIDO` / hipótese, fail-closed) e UI só-leitura no Centro de Situação | Formalização normativa C3/UI; mesmo gate que REQ-085 v1.1 | **Homologada** |
