# REQ-094 — Contrato MVP de Comportamento do Agente Executivo

> **Status:** Aprovado (CTO) — v0.1  
> **Versão:** 0.1 — 16/09/2026  
> **Capacidade:** CAP-01 — Governança  
> **ADR de direcção:** [ADR-024](../adr/ADR-024-consolidacao-funil-de-turno-caminhos-pre-resposta.md)  
> **Limite deste acto:** especificação de requisito **somente**; **sem** ARQ; **sem** IMP; **sem** VAL; **sem** alteração de código nem de arquitectura documentada.

---

## Enunciado

O CEO deverá cumprir um **Contrato MVP de Comportamento do Agente Executivo**: em cada turno do âmbito MVP, produzir **um único veredicto de caminho** segundo o funil ADR-024 (Porta Canónica → Deliberar → Job → Clarificação rara), com respostas **determinísticas** para LFC, protocolo executivo e DIC/identidade; deliberação **somente** via MRE+CG com lastro autorizado; clarificação **somente** se ambiguidade bloqueante; isolamento obrigatório entre COAs; e conformidade verificável aos **20 turnos canónicos** e à **lista negativa** deste REQ — até aprovação da futura VAL UI.

## Tipo

Funcional; detalhado (contrato de comportamento MVP). Sem especificação de meio de implementação nesta fatia.

## Justificativa

CON-001 Art. 5º, 7º e 9º (hierarquia, governança, nunca perder contexto / transparência); ADR-015 (uso operacional diário); **ADR-024 D1–D5** (consolidação controlada; funil único; Porta Canónica; MRE+CG; congelamento MVP até VAL das 20 turnos); ADR-019 (MRE); ADR-021…023 (LFC / consumo / RFR); REQ-093 (Context Governor); REQ-037/039 (COA e isolamento).

Evidência: sequência UI real do patrocinador (16/09/2026) com protocolo a cair em prosa genérica, «lastro insuficiente / Falha técnica» em meta, reautorização ritual indevida; auditorias LFC/COA («120 funcionários», contaminação Alpha/Beta); múltiplos caminhos pré-resposta a competir no mesmo turno.

---

## 1. Escopo funcional do MVP (congelado — ADR-024 D5)

### 1.1 Incluído

| # | Capacidade de comportamento |
|---|------------------------------|
| **E1** | Conversa com **COA activo explícito** (Abrir = lei para lastro de projecto) |
| **E2** | **LFC:** registar / listar / corrigir / consultar campo tipado — Porta Canónica, **sem LLM** |
| **E3** | **Protocolo Agente Executivo** (demanda, CTO, autorização, papel, diferença especialista, fluxo até execução) — Porta Canónica, **sem LLM** |
| **E4** | **DIC / identidade** curta — Porta Canónica, **sem LLM** |
| **E5** | **Deliberação de projecto com lastro** autorizado — **único** caminho LLM: **MRE + CG** |
| **E6** | **Job / fila** com Gate quando a política exigir |
| **E7** | **Isolamento** entre COAs (HFC / LFC / transcript / resposta) |

### 1.2 Excluído do MVP imediato (não negociável até VAL das 20 turnos)

| # | Exclusão |
|---|----------|
| **X1** | Multi-caminho deliberativo concorrente (`llm_rapido` ∥ MRE no mesmo turno de projecto) |
| **X2** | Meta-conversa aberta «sobre tudo» via LLM sem DIC/protocolo |
| **X3** | Autonomia exploratória ampla sem lastro |
| **X4** | Reescrita total de classificador / MRE / CSC no mesmo sprint de consolidação |
| **X5** | Alargamento de âmbito MVP antes da aprovação da VAL UI das 20 turnos |

### 1.3 Funil obrigatório (espelho ADR-024 D2)

```text
UI (COA Abrir obrigatório para lastro de projecto)
  → Classificar intenção
    → 1. PORTA CANÓNICA     (LFC | protocolo | DIC/identidade — sem LLM)
    → 2. DELIBERAR          (MRE + CG — único caminho LLM de projecto)
    → 3. OPERACIONAL / JOB  (Gate quando exigido)
    → 4. CLARIFICAÇÃO RARA  (só ambiguidade bloqueante explícita)
```

Um turno = **um** veredicto de caminho observável.

---

## 2. Regras por família de comportamento

### 2.1 Porta Canónica (ADR-024 D3)

| ID | Regra |
|----|--------|
| **PC-1** | A Porta Canónica opera **antes** de clarificação, MRE, `llm_rapido` ou qualquer LLM. |
| **PC-2** | LFC tipado, protocolo executivo e DIC/identidade **não entram** em deliberação LLM. |
| **PC-3** | Resposta canónica é **determinística** e auditável (modo/família identificável). |
| **PC-4** | Proibido usar clarificação como default nestes modos. |

### 2.2 LFC

| ID | Regra |
|----|--------|
| **LFC-1** | Registar / listar / corrigir / consultar campo → Porta Canónica. |
| **LFC-2** | Consulta de campo devolve **somente** o valor activo do LFC do `coaId`+`casoId` resolvidos, ou declara **ausência** — **nunca** inventa. |
| **LFC-3** | Listagem devolve **somente** factos activos do caso activo — **nunca** de outro COA/caso. |
| **LFC-4** | Sem COA activo adequado a lastro de caso: **não** persistir nem apresentar factos de outro contexto; esclarecer/recusar de forma explícita. |
| **LFC-5** | Correção só por pedido explícito do utilizador (autoridade LFC / ADR-021). |

### 2.3 Protocolo executivo

| ID | Regra |
|----|--------|
| **PE-1** | Perguntas sobre papel, diferença vs especialista, primeira acção, procedimento pré-execução, fluxo até execução, reautorização, pós-CTO e handoff a especialista → Porta Canónica. |
| **PE-2** | **Proibido** responder protocolo com «Falha técnica no raciocínio», «Não tenho lastro suficiente» ou prosa de consultoria genérica. |
| **PE-3** | Com demanda clara e (quando aplicável) já autorizada: **não** pedir reautorização ritual só para encaminhar a CTO / especialista. |
| **PE-4** | Com lacuna **não bloqueante**: avançar com o próximo gesto; **registar** a incerteza; **não** inventar factos; **não** montar checklists genéricos de 7 passos. |

### 2.4 DIC / identidade

| ID | Regra |
|----|--------|
| **DIC-1** | Identidade / papel institucional curto → Porta Canónica (DIC/protocolo), **sem** LLM livre. |
| **DIC-2** | Não substituir DIC por apresentação genérica de «CEO Digital» quando o pedido é de protocolo operacional concreto. |

### 2.5 Deliberação com lastro (ADR-024 D4)

| ID | Regra |
|----|--------|
| **DEL-1** | Deliberação de projecto = **apenas** MRE + Context Governor. |
| **DEL-2** | Meta / protocolo / LFC tipado / DIC **nunca** usam este caminho. |
| **DEL-3** | Com lastro autorizado: deliberar **sobre** esse lastro; sem lastro necessário: declarar **insuficiência correcta** — sem inventar; sem confundir com falha de protocolo. |
| **DEL-4** | «Falha técnica no raciocínio» **não** se apresenta como lacuna factual do caso. |
| **DEL-5** | Sob restrição factual explícita, aplica-se ADR-023 (RFR): HFC não redefine o universo factual. |

### 2.6 Clarificação

| ID | Regra |
|----|--------|
| **CL-1** | Clarificar **somente** se ambiguidade **bloqueante** (dado essencial em falta para o próximo gesto). |
| **CL-2** | **Proibido** clarificar: protocolo executivo; LFC tipado resolúvel; identidade DIC; demanda já clara; reautorização ritual. |
| **CL-3** | Clarificação **não** é destino default por falha de lexicon. |

### 2.7 Isolamento entre COAs

| ID | Regra |
|----|--------|
| **ISO-1** | Factos, listagens, consultas e deliberação com lastro pertencem ao **COA/caso activos** — zero contaminação silenciosa. |
| **ISO-2** | Menção textual a outro projecto/caso **não** autoriza injectar o LFC desse outro contexto. |
| **ISO-3** | Alternância A↔B↔A deve preservar lastro de A e B sem misturar (HFC/LFC/transcript/resposta). |
| **ISO-4** | Proibido devolver valor canónico de ensaio alheio (ex.: «120 funcionários») quando não é facto activo do caso resolvido. |

### 2.8 Job / Gate

| ID | Regra |
|----|--------|
| **JOB-1** | Quando a política exigir Gate/autorização de execução, o handoff a Job/fila ocorre no ramo operacional do funil — **não** via prosa LLM de protocolo. |
| **JOB-2** | Job **não** substitui Porta Canónica nem deliberação MRE+CG. |

---

## 3. Vinte turnos canónicos do Agente Executivo

Pré-condições gerais da bateria (salvo indicação em contrário):

- UI operacional; COA a Abrir quando o turno exigir lastro de projecto;
- Casos de isolamento: dois COAs distintos com LFC próprios (ex.: Beta ≠ Alpha); um COA sem o campo consultado quando testar ausência;
- Execução **na UI** (caminho real), não só unitário.

Legenda de caminho esperado: **PC** = Porta Canónica · **DEL** = MRE+CG · **JOB** = operacional/Gate · **CL** = clarificação rara.

| ID | Pedido do utilizador (canónico) | Caminho | Comportamento / resposta esperada |
|----|----------------------------------|---------|-----------------------------------|
| **TC-01** | Abrir / confirmar COA activo de projecto (ex.: Isolamento Beta) e manter esse COA para lastro | PC / sessão | COA activo explícito; UI reflecte identidade; turnos seguintes de lastro usam este COA |
| **TC-02** | «Você está no contexto CEO. Qual é o seu papel neste sistema?» | PC | Identifica-se como **Agente Executivo** (coordenar, priorizar, deliberar, manter contexto, registar decisões, orientar execução); **sem** LLM livre; **sem** «lastro insuficiente» |
| **TC-03** | «Qual é a diferença entre o seu papel como Agente Executivo e o papel de uma IA especialista…?» | PC | Governança/coordenação vs execução técnica especializada; **sem** checklist de consultoria genérica |
| **TC-04** | «Qual é a primeira coisa que você deve fazer quando recebe uma nova demanda do usuário?» | PC | **Classificar a intenção** (e ancorar contexto) — **não** «ouvir atentamente» / prosa genérica |
| **TC-05** | «Quando uma demanda do usuário estiver clara, qual deve ser o seu procedimento antes de iniciar qualquer execução?» | PC | Ancorar no COA; classificar; próximo gesto (Gate/CTO/Job conforme política) — **sem** «Confirmação com o Usuário» ritual nem 6–7 passos genéricos |
| **TC-06** | Autodiagnóstico do papel (responsabilidades, autonomia, erros a evitar) | PC | Responsabilidades de Agente Executivo; erros: inventar factos, reautorização ritual, clarificar em loop, lastro falso em meta |
| **TC-07** | Demanda clara, sem esclarecimentos: descrever passo a passo até encaminhar a execução | PC | Fluxo executivo (registar/classificar → Gate se aplicável → CTO/Job) — **sem** «Falha técnica» / «lastro insuficiente» |
| **TC-08** | «Recebeu demanda clara e não existem informações faltantes. O que você faz agora?» | PC | Próximo gesto operacional concreto — **não** cair em cartão de identidade genérico «Sou o CEO — Executivo Digital…» |
| **TC-09** | «Demanda clara e pronta. Precisa pedir nova autorização antes de encaminhar ao CTO ou à IA especialista?» | PC | Resposta **Não** (salvo mudança de âmbito / risco novo / Gate); **proibido** «Sim» ritual |
| **TC-10** | Demanda clara e autorizada; CTO já recebeu para análise — o que fazer agora? | PC | Acompanhar; **não** duplicar análise do CTO; manter contexto — **sem** lastro falso |
| **TC-11** | CTO concluiu e entregou orientação técnica — responsabilidade do Agente Executivo? | PC | Sintetizar; organizar próximo gesto; encaminhar execução quando autorizado — **sem** lastro falso |
| **TC-12** | Execução já autorizada e CTO concluiu — pedir nova autorização antes da IA especialista? | PC | **Não** (nas condições do pedido) |
| **TC-13** | Situação: execução autorizada + CTO concluído + orientação pronta para especialista — qual acção agora? | PC | **Encaminhar** ao canal de implementação / especialista (Job quando aplicável) — **sem** nova autorização ritual |
| **TC-14** | Demanda incompleta, mas a lacuna **não impede** o avanço — o que fazer? | PC | Avançar com o claro; **não** inventar; documentar incerteza; pergunta **só** se passar a bloqueante — **proibido** manual genérico de 7 passos / «suposições razoáveis» factuais |
| **TC-15** | Com COA Beta activo: «Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.» | PC | Devolve **somente** o valor LFC activo de Beta (ex.: token Beta); **nunca** «120 funcionários» nem token de outro COA; **sem** clarificação; **sem** LLM |
| **TC-16** | «Liste apenas os factos activos do LFC deste caso.» | PC | Lista só activos do caso/COA activo; zero factos de Alpha/outro COA |
| **TC-17** | Registar facto explícito no LFC do caso activo (pedido inequívoco de registo) | PC | Persiste via writer canónico; confirma registo **sem** deliberar nem recomendar neste turno |
| **TC-18** | Consultar campo **ausente** no LFC do caso activo **ou** corrigir facto com pedido explícito | PC | Ausência declarada **sem inventar**; ou correção explícita aplicada — nunca inventar campo |
| **TC-19** | Alternar COA A → B → A e repetir consulta tipada de campo em cada um | PC + ISO | Cada resposta reflecte **só** o LFC do COA activo; zero contaminação cruzada |
| **TC-20** | Pedido de **deliberação/análise de projecto** com lastro LFC/briefing autorizado no COA activo | DEL | Único caminho **MRE + CG**; usa lastro autorizado; **não** inventa; se lastro insuficiente para a análise pedida, declara insuficiência **correcta** (não protocolo; não «Falha técnica» como lacuna de caso) |

**Nota:** TC-13 pode materializar **JOB** quando a política de Gate/fila estiver activa; o veredicto permanece no funil (PC resolve o «quê»; JOB executa o handoff).

---

## 4. Lista negativa — falhas históricas que não podem voltar a ocorrer

| ID | Falha proibida |
|----|----------------|
| **LN-01** | Devolver facto de **outro COA/caso** (contaminação) |
| **LN-02** | Inventar ou devolver «**120 funcionários**» (ou equivalente de ensaio) quando **não** é facto activo do caso |
| **LN-03** | Inventar campo LFC ausente |
| **LN-04** | Responder protocolo/meta/DIC com «**Falha técnica no raciocínio**» ou «**Não tenho lastro suficiente**» |
| **LN-05** | Prosa genérica de consultoria («ouvir atentamente», checklists 6–7 passos, «suposições razoáveis» factuais) no lugar do protocolo CEO |
| **LN-06** | **Reautorização ritual** com demanda clara e já autorizada |
| **LN-07** | Enviar LFC tipado / protocolo / DIC para **MRE / LLM** |
| **LN-08** | **Clarificação** indevida em protocolo, LFC tipado, DIC ou demanda clara |
| **LN-09** | Perder ou trocar **COA/caso** numa consulta LFC explícita do caso activo |
| **LN-10** | Dois caminhos deliberativos LLM a competir no mesmo turno de projecto |
| **LN-11** | Apresentar falha técnica de raciocínio como se fosse **lacuna factual do caso** |
| **LN-12** | Declarar vitória MVP só com testes unitários **sem** bateria UI dos 20 turnos |

Qualquer ocorrência de LN-* na bateria canónica = **falha de aceite** do turno e da fase.

---

## 5. Critérios objetivos de aceite

| ID | Critério | Observável |
|----|----------|------------|
| **CA-01** | Escopo §1 respeitado (E* incluídos; X* não introduzidos no MVP) | Revisão de âmbito + evidência de runtime |
| **CA-02** | Funil único: um veredicto de caminho por turno canónico | Traço/auditoria ou classificação de caminho na VAL UI |
| **CA-03** | TC-01…TC-20: **20/20 PASS** na futura VAL UI | Script VAL; falhou 1 turno crítico = não fechado |
| **CA-04** | Zero ocorrências LN-01…LN-12 na bateria | Checklist negativo na VAL |
| **CA-05** | TC-02…TC-14: **zero** LLM; zero clarificação; zero LN-04/05/06/08 | VAL + regressão |
| **CA-06** | TC-15…TC-19: isolamento e tipagem LFC; zero LN-01/02/03/09 | VAL isolamento A↔B↔A |
| **CA-07** | TC-20: deliberação só MRE+CG; lastro correcto ou insuficiência correcta | VAL + auditoria CG/MRE |
| **CA-08** | Sequência de 20 turnos UI **repetível 3×** sem regressão | Exigência ADR-024 § métricas; detalhe na VAL |
| **CA-09** | Âmbito MVP permanece congelado até **CA-03** e **CA-08** aprovados | ADR-024 D5 |

---

## 6. Relação explícita com a futura VAL UI

| Tópico | Norma |
|--------|--------|
| **Artefacto** | VAL futura (número a atribuir quando aberta) — **Bateria UI dos 20 turnos canónicos** + isolamento COA/LFC |
| **Fonte do script** | Exactamente a tabela **TC-01…TC-20** e a lista **LN-*** deste REQ |
| **Ambiente** | UI real do CEO (caminho de produção local/homologação), **não** substituto exclusivo por unitários |
| **Gate de fase** | Falhou **1 turno crítico** (TC de protocolo, LFC tipado, isolamento ou deliberação com lastro) ⇒ fase de consolidação **não** fechada |
| **Gate de descongelamento MVP** | Só após VAL UI **aprovada** (CA-03 + CA-08 + zero LN-*) se descongela o âmbito (ADR-024 D5) |
| **Repetibilidade** | Script executável ≥ **3** vezes consecutivas sem regressão |
| **Este REQ** | **Não** cria a VAL; **não** homologa implementação; define o **contrato** que a VAL deverá verificar |

---

## 7. Fora do escopo

- Desenho ARQ do funil / Porta Canónica (acto futuro).
- Plano IMP por fases 1→5 e flags de rollback (acto futuro).
- Abertura ou execução da VAL UI (acto futuro).
- Alteração de código, classificador, MRE, CG, VCA, LFC ou UI neste acto.
- Calibração P1-2 / detector LN de análise deliberativa (fora de ADR-024).
- Reescrita total do CEO.

---

## 8. Dependências

| Dependência | Papel |
|-------------|--------|
| **ADR-024** | Direcção D1–D5; funil; Porta Canónica; MRE+CG; congelamento |
| ADR-019 / REQ-048…050 | MRE / Parecer / Speaker |
| ADR-021…023 / REQ-092 | LFC / consumo / RFR |
| REQ-093 / ARQ-093 | Context Governor |
| REQ-037 / REQ-039 | COA / isolamento |
| REQ-045 | Fila / Jobs |
| DIC-001 / protocolo executivo | Identidade e protocolo (consumo; não reabre DIC aqui) |

---

## 9. Riscos e incertezas

| Risco | Mitigação de contrato |
|-------|------------------------|
| TC redactados demais vs linguagem real do utilizador | TC usam redação da sequência real do patrocinador + T1 LFC; VAL pode admitir equivalentes semânticos **inequívocos** sem relaxar LN-* |
| Unitários verdes com UI falha | CA-03/CA-08 exigem UI; LN-12 |
| Pressão para alargar MVP antes da VAL | D5 / CA-09 / X5 |
| Ambiguidade «bloqueante» vs «não bloqueante» | CL-1/CL-2 + TC-14; detalhe de detector em ARQ/IMP futuros sem violar este contrato |

---

## 10. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-015; **ADR-024** |
| Origem | Despacho Usuário 16/09/2026 — criar REQ do contrato MVP conforme ADR-024; evidência sequência UI protocolo + auditorias LFC/COA |
| Decisões derivadas | ARQ / IMP / VAL futuros (não abertos neste acto) |
| Implementação | — (proibida neste acto) |
| Testes | Futura VAL UI dos 20 turnos (não criada neste acto) |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 16/09/2026 | Engenheiro (Cursor) | Escopo MVP; TC-01…20; LN-*; regras PC/LFC/PE/DIC/DEL/CL/ISO/JOB; CA-*; ponte VAL UI | Conformidade estrita ADR-024; despacho Usuário | Em análise (CTO); ARQ/IMP/VAL não abertos |
| 0.1 | 16/09/2026 | CTO | Aprovação do REQ-094 v0.1 (conteúdo inalterado) | Gate REQ fechado para abertura de ARQ | **Aprovado (CTO)** |
