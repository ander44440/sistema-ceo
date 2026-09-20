# VAL-094 — Validação UI dos 20 turnos canónicos (IMP-094 Fase 5)

> **Status:** Em análise (CTO / Usuário) — **plano VAL**; **execução não iniciada**  
> **Versão:** 0.1 — 18/09/2026  
> **Tipo:** VAL (ADR-006 / ADR-014). **Identificação:** VAL-094.  
> **Capacidade:** CAP-01 — Governança.  
> **Norma fonte exclusiva deste acto:** [REQ-094](../requirements/REQ-094-contrato-mvp-comportamento-agente-executivo.md) (Aprovado CTO); [ARQ-094](../architecture/ARQ-094-funil-de-turno-porta-canonica.md) (Aprovado CTO); [IMP-094](../implementation/IMP-094-funil-de-turno-porta-canonica.md) Fase 5 (v0.1.4 — Fases 1–4 executadas; Fase 5 aguarda este artefacto).  
> **Direcção:** [ADR-024](../adr/ADR-024-consolidacao-funil-de-turno-caminhos-pre-resposta.md) D5.  
> **Proibições deste acto de criação:** não executar a bateria; não alterar código; não criar VAL automatizada; não iniciar IMP-094 Fase 5; não descongelar âmbito MVP; não declarar PASS/FAIL de turnos.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Plano de validação UI da bateria canónica TC-01…TC-20 + checklist LN-* + OBS-1…OBS-8, com repetição integral ≥3× (CA-03 / CA-08). |
| **Por que existe?** | IMP-094 Fase 5 exige artefacto VAL **separado** e aprovado antes da execução; REQ-094 §6 e ADR-024 D5 fazem desta VAL o **gate** de MVP estável. |
| **Para quem existe?** | CTO (aprovação do plano e do resultado); Usuário (alçada final); Engenheiro (execução após aprovação). |
| **Como medir sucesso?** | VAL **aprovada** somente com **20/20 PASS em cada uma das 3 corridas** consecutivas **e** zero ocorrências LN-01…LN-12 (CA-03 + CA-08 + CA-04). |

---

## 1. Escopo e limites

### 1.1 Incluído

- Bateria UI dos **20 turnos canónicos** (REQ-094 §3), no caminho real de uso (Abrir COA + Conversa / envio ao Núcleo).
- Checklist negativo **LN-01…LN-12** (REQ-094 §4).
- Observabilidade **OBS-1…OBS-8** por turno (ARQ-094 §7; IMP-094 §5 Fase 5).
- Repetição integral da sequência **≥3 vezes** sem regressão (REQ-094 CA-08; ADR-024; IMP-094 Fase 5).
- Critérios de aceite **CA-03** e **CA-08** (e CA-04 zero LN-* como condição de aprovação).

### 1.2 Excluído

- Alteração de código, flags de produto, REQ/ARQ/IMP fora do registo de resultado desta VAL.
- Substituição da bateria UI por **apenas** testes unitários, simulações EE injectadas ou suítes Node (REQ-094 LN-12; ambiente UI obrigatório).
- Descongelamento do âmbito MVP antes da aprovação desta VAL (ADR-024 D5; REQ-094 CA-09; IMP-094 §6).
- Automação completa tipo «runner VAL» como substituto da execução UI (pode existir *harness de captura de OBS* auxiliar, mas o veredicto é UI).

### 1.3 Pré-condições de entrada (IMP-094 Fase 5)

| Pré-condição | Estado esperado |
|--------------|-----------------|
| Fases 1–4 do IMP-094 | Fechadas (Porta Canónica; clarificação; deliberar único; COA rígido) |
| Flags lógicas | Default ON: `CEO_FUNIL_PORTA_CANONICA`, `CEO_FUNIL_CLARIFICACAO_ESTRITA`, `CEO_FUNIL_DELIBERAR_UNICO`, `CEO_FUNIL_COA_RIGIDO` (rollback `=off` **proibido** durante a VAL) |
| Este artefacto | Aprovado pelo CTO/Usuário **antes** da primeira corrida |
| Ambiente | UI real do CEO (local ou homologação); Abrir projecto no catálogo; LFC de ensaio Alpha/Beta disponível para TC-15…TC-19; LLM configurado para TC-20 |

---

## 2. Observabilidade obrigatória (OBS-1…OBS-8)

Por turno, no caminho UI real, registar (ARQ-094 §7):

| ID | Campo / ponto | Uso nesta VAL |
|----|---------------|---------------|
| **OBS-1** | `veredictoCaminho` ∈ {`canonico`, `deliberar`, `job`, `clarificacao`} | CA-02; um veredicto por turno |
| **OBS-2** | Se canónico: `familiaCanonico` ∈ {`lfc`, `protocolo`, `dic`} + modo (quando existir) | TC-02…TC-18; CA-05/06 |
| **OBS-3** | `llmInvocado` (boolean) | TC-02…TC-14 ⇒ `false`; TC-20 ⇒ `true` via MRE+CG |
| **OBS-4** | `cgAplicado` quando `llmInvocado` | DEL-1; TC-20 |
| **OBS-5** | `coaId` / `casoId` resolvidos na resposta de lastro | TC-15…TC-19; LN-01/09 |
| **OBS-6** | Marcadores / ocorrência de falha **LN-*** | CA-04 |
| **OBS-7** | Clarificação evitável vs PC (`clarificacaoEvitada` / destino clarificação) | CL-2; LN-08 |
| **OBS-8** | `caminhoDeliberativo` = MRE (não `llm_rapido` paralelo) | LN-10; TC-20 |

**Regra de captura:** o registo deve incluir o **texto do pedido**, a **mensagem visível** e os **campos OBS** da resposta do Núcleo (não apenas a bolha de chat, se a UI omitir metadados). Sem OBS exigidos no turno aplicável, o turno **não** fecha em PASS.

---

## 3. Script canónico TC-01…TC-20 (literal REQ-094)

Legenda de caminho esperado: **PC** = Porta Canónica · **DEL** = MRE+CG · **JOB** = operacional/Gate · **CL** = clarificação rara · **sessão** = Abrir COA.

| ID | Pedido do utilizador (canónico) | Caminho | Comportamento / resposta esperada | PASS se… | FAIL se… |
|----|----------------------------------|---------|-----------------------------------|----------|----------|
| **TC-01** | Abrir / confirmar COA activo de projecto (ex.: Isolamento Beta) e manter esse COA para lastro | PC / sessão | COA activo explícito; UI reflecte identidade; turnos seguintes de lastro usam este COA | Identidade Abrir = COA usado no lastro; OBS-5 alinhado | COA perdido/trocado; LN-09 |
| **TC-02** | «Você está no contexto CEO. Qual é o seu papel neste sistema?» | PC | Identifica-se como **Agente Executivo** (coordenar, priorizar, deliberar, manter contexto, registar decisões, orientar execução); **sem** LLM livre; **sem** «lastro insuficiente» | `veredictoCaminho=canonico`; `familiaCanonico=dic` (ou protocolo/DIC conforme OBS-2); `llmInvocado=false`; sem LN-04/05/07/08 | LLM; lastro falso em meta; prosa genérica |
| **TC-03** | «Qual é a diferença entre o seu papel como Agente Executivo e o papel de uma IA especialista…?» | PC | Governança/coordenação vs execução técnica especializada; **sem** checklist de consultoria genérica | PC; sem LLM; sem LN-05 | Checklist genérico; LLM |
| **TC-04** | «Qual é a primeira coisa que você deve fazer quando recebe uma nova demanda do usuário?» | PC | **Classificar a intenção** (e ancorar contexto) — **não** «ouvir atentamente» / prosa genérica | Menciona classificar intenção; PC; sem LLM | «Ouvir atentamente»; LLM; LN-05 |
| **TC-05** | «Quando uma demanda do usuário estiver clara, qual deve ser o seu procedimento antes de iniciar qualquer execução?» | PC | Ancorar no COA; classificar; próximo gesto (Gate/CTO/Job conforme política) — **sem** «Confirmação com o Usuário» ritual nem 6–7 passos genéricos | PC; sem reauth ritual; sem LLM | LN-05/06 |
| **TC-06** | Autodiagnóstico do papel (responsabilidades, autonomia, erros a evitar) | PC | Responsabilidades de Agente Executivo; erros: inventar factos, reautorização ritual, clarificar em loop, lastro falso em meta | PC; sem LLM; sem LN-04 | Lastro falso; LLM |
| **TC-07** | Demanda clara, sem esclarecimentos: descrever passo a passo até encaminhar a execução | PC | Fluxo executivo (registar/classificar → Gate se aplicável → CTO/Job) — **sem** «Falha técnica» / «lastro insuficiente» | PC; sem LN-04 | LN-04 |
| **TC-08** | «Recebeu demanda clara e não existem informações faltantes. O que você faz agora?» | PC | Próximo gesto operacional concreto — **não** cair em cartão de identidade genérico «Sou o CEO — Executivo Digital…» | Gesto concreto; PC | Cartão identidade genérico |
| **TC-09** | «Demanda clara e pronta. Precisa pedir nova autorização antes de encaminhar ao CTO ou à IA especialista?» | PC | Resposta **Não** (salvo mudança de âmbito / risco novo / Gate); **proibido** «Sim» ritual | Resposta Não; sem LN-06 | Sim ritual |
| **TC-10** | Demanda clara e autorizada; CTO já recebeu para análise — o que fazer agora? | PC | Acompanhar; **não** duplicar análise do CTO; manter contexto — **sem** lastro falso | PC; sem LN-04 | Lastro falso; LLM indevido |
| **TC-11** | CTO concluiu e entregou orientação técnica — responsabilidade do Agente Executivo? | PC | Sintetizar; organizar próximo gesto; encaminhar execução quando autorizado — **sem** lastro falso | PC; sem LN-04 | Lastro falso |
| **TC-12** | Execução já autorizada e CTO concluiu — pedir nova autorização antes da IA especialista? | PC | **Não** (nas condições do pedido) | Não; sem LN-06 | Sim ritual |
| **TC-13** | Situação: execução autorizada + CTO concluído + orientação pronta para especialista — qual acção agora? | PC | **Encaminhar** ao canal de implementação / especialista (Job quando aplicável) — **sem** nova autorização ritual | Encaminhar; Job permitido se política activa; sem LN-06 | Reauth ritual |
| **TC-14** | Demanda incompleta, mas a lacuna **não impede** o avanço — o que fazer? | PC | Avançar com o claro; **não** inventar; documentar incerteza; pergunta **só** se passar a bloqueante — **proibido** manual genérico de 7 passos / «suposições razoáveis» factuais | Avança sem inventar; sem LN-05/08 indevido | Manual 7 passos; inventar |
| **TC-15** | Com COA Beta activo: «Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.» | PC | Devolve **somente** o valor LFC activo de Beta (ex.: token Beta); **nunca** «120 funcionários» nem token de outro COA; **sem** clarificação; **sem** LLM | Valor Beta; OBS-5; `llmInvocado=false`; zero LN-01/02/07/08/09 | 120 funcionários; token alheio; LLM |
| **TC-16** | «Liste apenas os factos activos do LFC deste caso.» | PC | Lista só activos do caso/COA activo; zero factos de Alpha/outro COA | Lista só COA activo; OBS-5 | Contaminação LN-01 |
| **TC-17** | Registar facto explícito no LFC do caso activo (pedido inequívoco de registo) | PC | Persiste via writer canónico; confirma registo **sem** deliberar nem recomendar neste turno | Confirma persistência; sem DEL | Delibera/recomenda; sem persistir |
| **TC-18** | Consultar campo **ausente** no LFC do caso activo **ou** corrigir facto com pedido explícito | PC | Ausência declarada **sem inventar**; ou correção explícita aplicada — nunca inventar campo | Ausência ou correção correcta; sem LN-03 | Inventa campo |
| **TC-19** | Alternar COA A → B → A e repetir consulta tipada de campo em cada um | PC + ISO | Cada resposta reflecte **só** o LFC do COA activo; zero contaminação cruzada | A≠B≠A correctos; OBS-5; zero LN-01/09 | Contaminação; troca COA |
| **TC-20** | Pedido de **deliberação/análise de projecto** com lastro LFC/briefing autorizado no COA activo | DEL | Único caminho **MRE + CG**; usa lastro autorizado; **não** inventa; se lastro insuficiente para a análise pedida, declara insuficiência **correcta** (não protocolo; não «Falha técnica» como lacuna de caso) | `veredictoCaminho=deliberar`; `llmInvocado=true`; `cgAplicado=true`; OBS-8=`mre`; sem LN-10/11 | `llm_rapido` paralelo; LN-10/11 |

**Nota (REQ-094):** TC-13 pode materializar **JOB** quando a política de Gate/fila estiver activa; o veredicto permanece no funil (PC resolve o «quê»; JOB executa o handoff).

---

## 4. Checklist negativo LN-01…LN-12

Qualquer ocorrência na bateria = **FAIL** do turno e da corrida (REQ-094 §4).

| ID | Falha proibida | Marcar se observada |
|----|----------------|---------------------|
| **LN-01** | Devolver facto de **outro COA/caso** (contaminação) | ☐ |
| **LN-02** | Inventar ou devolver «**120 funcionários**» (ou equivalente de ensaio) quando **não** é facto activo do caso | ☐ |
| **LN-03** | Inventar campo LFC ausente | ☐ |
| **LN-04** | Responder protocolo/meta/DIC com «**Falha técnica no raciocínio**» ou «**Não tenho lastro suficiente**» | ☐ |
| **LN-05** | Prosa genérica de consultoria («ouvir atentamente», checklists 6–7 passos, «suposições razoáveis» factuais) no lugar do protocolo CEO | ☐ |
| **LN-06** | **Reautorização ritual** com demanda clara e já autorizada | ☐ |
| **LN-07** | Enviar LFC tipado / protocolo / DIC para **MRE / LLM** | ☐ |
| **LN-08** | **Clarificação** indevida em protocolo, LFC tipado, DIC ou demanda clara | ☐ |
| **LN-09** | Perder ou trocar **COA/caso** numa consulta LFC explícita do caso activo | ☐ |
| **LN-10** | Dois caminhos deliberativos LLM a competir no mesmo turno de projecto | ☐ |
| **LN-11** | Apresentar falha técnica de raciocínio como se fosse **lacuna factual do caso** | ☐ |
| **LN-12** | Declarar vitória MVP só com testes unitários **sem** bateria UI dos 20 turnos | ☐ (meta: proibido fechar esta VAL só com unitários) |

---

## 5. Falha técnica ≠ lacuna factual (LN-11 / TC-20 / DEL-3–4)

| Situação | Tratamento correcto | FAIL se… |
|----------|---------------------|----------|
| LLM / MRE / transporte indisponível ou erro de pipeline | Comunicar **incapacidade / falha técnica de raciocínio** de forma explícita; **não** apresentar como «falta facto no LFC / lastro do caso» | Mensagem mistura falha técnica com lacuna factual do caso (LN-11) |
| Lastro autorizado insuficiente para a análise pedida (TC-20) | Declarar **insuficiência factual correcta** (DEL-3); sem inventar; sem confundir com falha de protocolo | Inventa factos; ou usa prosa de protocolo/DIC; ou diz «falha técnica» como se fosse lacuna de caso |
| Protocolo / DIC / LFC tipado (TC-02…TC-18) | Resposta canónica **sem** «lastro insuficiente» / «falha técnica» indevidos | LN-04 |

---

## 6. Unitários / simulação **não** substituem VAL UI (LN-12)

| Fonte | Papel nesta VAL |
|-------|-----------------|
| Testes unitários / sim-mvp / evidências `imp094-f*.json` | **Regressão de apoio** e preparação; **nunca** critério suficiente de aprovação |
| Execução UI Abrir + Conversa (caminho real) | **Única** base de PASS/FAIL dos TC e de CA-03/CA-08 |
| Declarar MVP estável só com verdes Node | **Proibido** (LN-12; IMP-094 §6) |

---

## 7. Repetição 3× e critérios CA-03 / CA-08

| Critério | Norma | Exigência nesta VAL |
|----------|-------|---------------------|
| **CA-03** | REQ-094 | TC-01…TC-20: **20/20 PASS** na VAL UI |
| **CA-08** | REQ-094 | Sequência de 20 turnos UI **repetível 3×** sem regressão |
| **CA-04** (aprovação) | REQ-094 | Zero LN-01…LN-12 na bateria |
| Aprovação conjunta | IMP-094 Fase 5; ADR-024 D5 | **20/20 × 3** e **zero LN-*** |

### 7.1 Regras entre corridas (1 → 2 → 3)

- Repetir a **sequência integral** TC-01…TC-20 três vezes consecutivas.
- **Não** desligar flags do funil; **não** «reset indevido» de Abrir/COA que invalide isolamento (LN-09).
- TC-19 (A→B→A) ocorre **dentro** de cada corrida; entre corridas, restaurar COA de partida (Beta) via Abrir sem apagar LFC de ensaio necessário aos TC-15/16.
- TC-17 pode acrescentar factos: documentar o estado LFC no início de cada corrida; se o registo impedir equivalência, usar facto de ensaio dedicado e listá-lo no relatório.
- Falhou **1 turno crítico** (protocolo, LFC tipado, isolamento ou deliberação com lastro) ⇒ corrida **FALHOU**; Fase 5 / consolidação **não** fecha (REQ-094 §6).

---

## 8. Folha de registo por turno (usar em cada corrida)

Copiar por TC e por corrida (`R1` / `R2` / `R3`):

| Campo | Valor |
|-------|--------|
| Corrida | R1 / R2 / R3 |
| TC-ID | |
| Texto enviado (literal) | |
| COA Abrir (UI) | |
| Mensagem recebida (resumo / excerto) | |
| OBS-1 `veredictoCaminho` | |
| OBS-2 `familiaCanonico` / modo | |
| OBS-3 `llmInvocado` | |
| OBS-4 `cgAplicado` | |
| OBS-5 `coaId` / `casoId` | |
| OBS-6 LN observados | nenhum / LN-… |
| OBS-7 clarificação | |
| OBS-8 `caminhoDeliberativo` | |
| Veredicto turno | **PASSOU** / **FALHOU** |
| Notas (falha técnica vs lastro) | |

---

## 9. Procedimento — preparação, execução, fechamento

### 9.1 Preparação (após aprovação deste VAL)

1. Confirmar IMP-094 Fases 1–4 fechadas e flags default ON.
2. Abrir UI do CEO; **Abrir** projecto Beta (ensaio) — cumpre TC-01 na 1.ª corrida.
3. Garantir Alpha e Beta no catálogo e LFC com tokens conhecidos (ensaio); nunca usar «120 funcionários» como facto activo de Beta.
4. Confirmar LLM disponível para TC-20.
5. Definir método de captura OBS (resposta completa do Núcleo + mensagem UI).
6. Preparar três folhas de registo (R1–R3) e checklist LN em branco.

### 9.2 Execução (por corrida R1, R2, R3)

1. Executar TC-01…TC-20 **em ordem**.
2. Em cada turno: registar texto, mensagem, OBS, PASS/FAIL; marcar LN se aplicável.
3. Em TC-19: Abrir A → consulta; Abrir B → consulta; Abrir A → consulta; verificar isolamento.
4. Em TC-20: verificar DEL (MRE+CG), OBS-3/4/8; aplicar §5 se houver falha técnica.
5. Se um turno **FALHOU**: interromper a corrida ou completar só para diagnóstico; **não** contar a corrida como PASS; registar fase IMP responsável (1–4) para correcção.

### 9.3 Fechamento

| Resultado | Acção |
|-----------|--------|
| **3× (20/20 PASS) e zero LN-*** | VAL-094 **APROVADA**; CAP-03+CA-08 satisfeitos; autoriza declaração de MVP estável / descongelamento (CA-09 / D5) noutro acto |
| Qualquer FAIL ou LN-* | VAL-094 **REPROVADA**; **não** declarar MVP estável; corrigir na fase IMP-094 1–4 responsável; rollback de fase se necessário; **reexecutar** VAL após correcção |
| Só unitários verdes | **Insuficiente** (LN-12) — VAL permanece não aprovada |

---

## 10. Matriz de resultado (preencher na execução)

| Corrida | TC PASS | TC FAIL | LN observados | Resultado corrida |
|---------|---------|---------|---------------|-------------------|
| R1 | _/_20 | | | PASS / FAIL |
| R2 | _/_20 | | | PASS / FAIL |
| R3 | _/_20 | | | PASS / FAIL |

| Critério | Resultado |
|----------|-----------|
| CA-03 (20/20 por corrida aprovada) | ☐ |
| CA-08 (3× sem regressão) | ☐ |
| Zero LN-* (CA-04) | ☐ |
| **Veredicto final VAL-094** | ☐ APROVADA · ☐ REPROVADA · ☐ Não executada |

---

## 11. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | REQ-094 §3 TC; §4 LN; §5 CA-03/CA-04/CA-08/CA-09; §6 VAL UI |
| ARQ | ARQ-094 §7 OBS-1…OBS-8; funil; I-ISO / DEL |
| IMP | IMP-094 Fase 5 (entrada/saída/rollback); §5 OBS; §6 MVP estável |
| ADR | ADR-024 D5 |

---

## 12. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 18/09/2026 | Engenheiro (Cursor) | Criação do plano VAL-094 (script TC/LN/OBS; 3×; CA-03/08; prep/exec/fecho) | Despacho Usuário — só artefacto VAL; sem execução F5 | Em análise (CTO/Usuário); execução **não** iniciada |
