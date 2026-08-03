# REQ-068 — Modo CEO Ouvindo

> **Status:** Homologada  
> **Versão:** 0.1 — 03/08/2026  
> **Capacidade:** CAP-07 — Comunicação  
> **Origem analítica:** [`ANL-012-arquitetura-modo-ceo-ouvindo.md`](../analysis/ANL-012-arquitetura-modo-ceo-ouvindo.md) (**homologada**).  
> **ARQ derivada:** [`ARQ-029-modo-ceo-ouvindo.md`](../architecture/ARQ-029-modo-ceo-ouvindo.md) (Em análise v0.1).

## Enunciado

O Sistema CEO deverá disponibilizar o modo **CEO Ouvindo** — camada de **entrada e saída por voz** da Conversa executiva — que permita ao utilizador **falar** para o CEO e **ouvir** a resposta, convertendo fala em texto e texto em fala, **sem** alterar o pipeline conversacional vigente (Gate, VCA, Histórico, Referências, Objectivo, Classificador, Complexidade, DIC, Motor Executivo, Speaker, NCS).

## Tipo

Funcional (interface de canal) com requisitos não funcionais de experiência e fiabilidade; detalhado sob CAP-07; pós ANL-012.

## Justificativa

A **ANL-012** (homologada) estabelece que a EIC já governa o diálogo por texto, mas o utilizador ainda não dispõe de um ciclo ponta a ponta **microfone → mesma governação → resposta ouvida** na Conversa principal. Peças existentes (REQ-046 onboarding; REQ-047 Voice Engine; REQ-050 Speaker; PX-001/PX-002 TTS) não fecham esse modo. Motivações: CON-001 Art. 9º (tempo do utilizador; transparência); VIS-002 §3.5–3.6 (personalidade e meio conversacional); ADR-015 (uso diário MG2); preservação integral da arquitectura EIC / ARQ-018…028.

---

## 1. Objectivo da capacidade

1. Definir o modo **CEO Ouvindo** como **interface de voz** (STT + estados + TTS) sobre o Núcleo existente.  
2. Garantir o ciclo de turno: iniciar escuta → (fala / silêncio) → transcrever → enviar texto ao pipeline → receber resposta → sintetizar voz → retornar a **Ouvindo** (ou Idle, conforme política de sessão — detalhe na ARQ).  
3. Manter **inalterados** Gate, VCA, Histórico, Referências, Objectivo, Classificador, Motor Executivo, DIC e restante EIC.  
4. Expor estados e falhas de forma **visível** (sem silêncio opaco).  
5. Preparar a **ARQ** de integração (máquinas de estado, fronteira texto, harmonização PX-002) **sem** implementar código nesta etapa de requisito.

---

## 2. Casos de uso

| ID | Caso de uso | Actor | Fluxo resumido | Resultado |
|----|-------------|-------|----------------|-----------|
| **CU1** | Iniciar escuta | Utilizador | Gesto explícito → permissão de microfone (se necessária) → estado **Ouvindo** | Captura activa; UI indica «a ouvir» |
| **CU2** | Interromper escuta | Utilizador | Em **Ouvindo**, gesto de parar → aborta captura; **não** envia texto incompleto por omissão | Estado Idle (ou equivalente); mic libertado |
| **CU3** | Detectar fala | Sistema | Em **Ouvindo**, sinal de actividade vocal | Mantém **Ouvindo**; feedback UI opcional |
| **CU4** | Transcrever | Sistema | Fim de turno de fala (silêncio / endpointing / parar com política de envio) → STT produz texto | Texto candidato disponível; preferencialmente visível |
| **CU5** | Enviar texto ao pipeline conversacional | Sistema | Texto da transcrição → **mesmo** ponto de entrada do Núcleo usado pelo path texto | Pipeline EIC executa normalmente |
| **CU6** | Receber resposta | Sistema / Utilizador | Resposta textual (e metadados existentes) regressa à UI | Texto no ecrã; estado **Processando** termina |
| **CU7** | Sintetizar voz | Sistema | Se modo/preferência/unlock o permitirem → TTS da resposta (ou guiãoVoz do Speaker, sem o Speaker sintetizar) | Estado **Respondendo**; utilizador ouve |
| **CU8** | Retornar ao estado Ouvindo | Sistema | Após término (ou stop) da fala do CEO → reabre escuta **ou** Idle conforme política de sessão definida na ARQ | Pronto para novo turno por voz |

**Notas de CU:**

* CU5 **nunca** envia áudio bruto ao Classificador / Motor / MRE / DIC.  
* CU7 **não** altera a decisão já tomada pelo pipeline; só aforma de saída.  
* CU8 no MVP pode exigir gesto para reabrir escuta se a ARQ adoptar política anti-feedback mais restritiva; o requisito exige que o **ciclo** seja reentrável sem abandonar o modo.

---

## 3. Requisitos funcionais (RF)

| ID | Requisito |
|----|-----------|
| **RF1** | O sistema deverá oferecer o modo **CEO Ouvindo** na Conversa executiva (não limitado ao onboarding REQ-046). |
| **RF2** | O utilizador deverá poder **iniciar escuta** por gesto explícito (CU1). |
| **RF3** | O utilizador deverá poder **interromper escuta** sem envio automático obrigatório do buffer (CU2). |
| **RF4** | O sistema deverá **detectar fala** durante a escuta e reflectir o estado na UI (CU3). |
| **RF5** | O sistema deverá **transcrever** a fala do utilizador para texto (CU4). |
| **RF6** | O texto transcrito deverá ser enviado ao **mesmo** pipeline conversacional do path texto (Gate → VCA → … → destino) (CU5). |
| **RF7** | O sistema deverá **receber e apresentar** a resposta textual produzida pelo pipeline (CU6). |
| **RF8** | O sistema deverá poder **sintetizar por voz** a resposta, quando a sessão de voz o autorizar (CU7), sem o Speaker gerar áudio (REQ-050). |
| **RF9** | Após a síntese (ou skip de TTS), o modo deverá **permitir novo ciclo de escuta** (CU8) sem reconfigurar a EIC. |
| **RF10** | Os estados mínimos do modo — pelo menos **Idle**, **Ouvindo**, **Processando**, **Respondendo**, **Interrompido**, **Erro** — deverão ser observáveis na UI. |
| **RF11** | Falhas de microfone, STT, TTS ou permissão deverão conduzir a estado **Erro** com mensagem curta visível (não silêncio opaco). |
| **RF12** | Durante **Respondendo**, a escuta activa fica **proibida** no MVP (anti-feedback); interrupção cancela TTS, não Gates/Jobs já abertos. |
| **RF13** | O modo **não** cria classe de intenção «voz»; o Classificador opera apenas sobre o texto. |
| **RF14** | Preferência / opt-in de voz permanece exigível (alinhamento a PX-002): o CEO não inicia captura nem TTS sem autorização de sessão. |
| **RF15** | A ARQ derivada deverá especificar: máquina de estados unificada (harmonização com PX-002), fronteira exacta Núcleo↔voz, política de reentrada CU8, e mapeamento de eventos — **sem** este REQ fixar código. |

---

## 4. Requisitos não funcionais (RNF)

| ID | Requisito |
|----|-----------|
| **RNF1** | **Não-invasão:** zero alteração normativa ou comportamental obrigatória em Gate, VCA, Histórico, Referências, Objectivo, Classificador, Complexidade, DIC, Motor, NCS ou limiar 0,55 por causa deste modo. |
| **RNF2** | **Tempo do utilizador:** estados Processando/Respondendo honestos; não fingir fala imediata durante latência de rede/LLM. |
| **RNF3** | **Testabilidade:** casos CU1–CU8 e CA abaixo verificáveis sem redesenhar o Classificador. |
| **RNF4** | **ADR-006:** IMP só após ARQ + Gates aplicáveis; este REQ **não** autoriza implementação. |
| **RNF5** | **Fiabilidade de canal:** stop de TTS/STT determinístico; libertação do microfone ao sair de Ouvindo/Erro/Interrompido. |
| **RNF6** | **Privacidade:** captura de microfone só com permissão e durante estados autorizados. |
| **RNF7** | **Compatibilidade mobile:** herdar restrições de gesto/autoplay já diagnosticadas (PX-001 / PX-002) — TTS sem unlock de sessão não é aceite silencioso. |
| **RNF8** | **Evolução:** barge-in, wake word, streaming, conversa contínua e TTS servidor ficam **fora** deste REQ (ver §8). |

---

## 5. Critérios de aceitação

| ID | Critério (verificável) |
|----|------------------------|
| **CA1** | Existe definição normativa do modo CEO Ouvindo com CU1–CU8 cobertos. |
| **CA2** | RF1–RF15 e RNF1–RNF8 constam do artefacto e não são contraditos pela ARQ derivada. |
| **CA3** | Demonstrável (na IMP futura): texto da transcrição entra no Núcleo pelo **mesmo** contrato que o input textual. |
| **CA4** | Demonstrável: iniciar / interromper escuta altera estado observável (CU1–CU2). |
| **CA5** | Demonstrável: após resposta, TTS ocorre só com autorização de sessão; texto permanece no ecrã mesmo se TTS falhar. |
| **CA6** | Demonstrável: Erro de voz não corrompe Gate pendente nem publica Job indevido. |
| **CA7** | Regressão: suites Classificador / VCA / Continuidade / DIC / Motor existentes permanecem verdes após a IMP (quando existir). |
| **CA8** | Restrições §6 verificáveis na redacção da ARQ (EIC intacta; voz = I/O). |
| **CA9** | Itens §8 (fora de escopo) **não** são exigidos para fechar este REQ. |
| **CA10** | ARQ derivada pode ser elaborada sem ambiguidade de âmbito (RF15). |

### Critérios de não aceite

| ID | Critério |
|----|----------|
| **NA1** | Alteração do Classificador / limiar / Gate / Motor / DIC / NCS sob pretexto do modo voz. |
| **NA2** | Envio de áudio bruto ao pipeline conversacional. |
| **NA3** | Nova classe C1–C4 «voz». |
| **NA4** | Speaker a sintetizar áudio (viola REQ-050). |
| **NA5** | Escuta activa simultânea com TTS no MVP (feedback loop). |
| **NA6** | Autoplay de TTS sem opt-in / unlock de sessão. |
| **NA7** | Exigir barge-in, wake word ou streaming para cumprir este REQ. |
| **NA8** | Implementação sem ARQ + fluxo ADR-006. |
| **NA9** | Confundir REQ-046 (onboarding) com cumprimento deste modo na Conversa executiva. |

---

## 6. Restrições

| ID | Restrição |
|----|-----------|
| **RST1** | **Nenhuma alteração na EIC** (disciplina, limiar, regras de classificação, contratos CSC/VCA) por este REQ. |
| **RST2** | Voz é **apenas** camada de entrada/saída; governação permanece textual. |
| **RST3** | Compatibilidade obrigatória com **Gate**, **VCA**, **Histórico**, **Referências**, **Objectivo**, **Classificador**, **Motor Executivo** e **DIC** — consumidos, não reescritos. |
| **RST4** | Sem CAP nova: capacidade primária **CAP-07**. |
| **RST5** | Sem código, prompts ou runtime sob a vigência isolada deste REQ. |
| **RST6** | Sem criar ARQ nem IMP neste passo documental (aguardam Gate deste REQ). |
| **RST7** | Harmonização com PX-002 / `experienciaVoz` na ARQ — proibido manter duas máquinas de estado contraditórias em produção. |

---

## 7. Dependências

| Dependência | Papel |
|-------------|--------|
| **ANL-012** (homologada) | Base analítica e invariante de não-invasão |
| **REQ-047** Voice Engine | Capacidades de síntese / stop (consumo) |
| **REQ-050** Speaker | Prosa / guiãoVoz — sem áudio |
| **REQ-046** | Precedente STT/TTS no onboarding — **não** substitui este REQ |
| **PX-001 / PX-002** | Diagnóstico e experiência TTS / unlock / estados |
| **REQ-057 / ARQ-018** | Classificador intacto |
| **ARQ-019** | Gate intacto |
| **ARQ-017** | Motor intacto |
| **REQ-061…067 / ARQ-022…028** | Histórico, referências, tópico, objectivo, VCA, complexidade, DIC — intactos |
| **ADR-006** | Fluxo REQ → ARQ → IMP |
| **ADR-015** | Uso diário / MG2 |

---

## 8. Requisitos fora do escopo

* Código, runtime, prompts, alteração de comportamento nesta etapa.  
* **ARQ** e **IMP** (próximas etapas após Gate deste REQ).  
* Conversa contínua com microfone permanentemente aberto.  
* **Barge-in** (falar por cima do CEO e ser ouvido de imediato).  
* **Wake word**.  
* Streaming de áudio server-side / TTS neural obrigatório no servidor.  
* Múltiplas vozes / timbres por papel.  
* Resposta incremental (TTS de tokens parciais acoplado ao stream LLM).  
* Redesenho do Painel, NCS, MRE 0–7 ou Speaker.  
* Substituição do path texto — o teclado permanece válido.  
* Nova capacidade CAP fora de CAP-07.

---

## Riscos e incertezas

| Risco | Mitigação |
|-------|-----------|
| Feedback TTS→mic | RST + RF12; exclusão Ouvindo/Respondendo |
| Latência STT+LLM+TTS | RNF2; UI Processando |
| STT incorrecto → destino errado | Transcrição visível; edição de emergência (ARQ) |
| Divergência PX-002 vs estados deste REQ | RST7; unificação na ARQ |
| Pressão para «ensinar» voz ao Classificador | RST1–RST3; NA1–NA3 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 — Comunicação |
| Norma superior | CON-001 Art. 9º; VIS-002 §3.5–3.6; ADR-015; ADR-006 |
| Origem | ANL-012 homologada; comando patrocinador 03/08/2026 |
| Decisões derivadas | ARQ-029 (Homologada); IMP-068 (Implementada — aguarda homologação) |
| Implementação | IMP-068 — `app/src/ceoOuvindo/*`, `conversa/enviarAoNucleo.js` |
| Testes | *(TST — após IMP)* |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação REQ-068 | ANL-012 homologada; próximo passo de governança | Em análise — aguarda homologação |
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Marcação homologada; ligação ARQ-029 | Gate REQ; abertura ARQ | Homologada — ARQ em análise |

---

**Estado:** **Homologada.** **Sem código nesta REQ.**  
**ARQ derivada:** [`ARQ-029-modo-ceo-ouvindo.md`](../architecture/ARQ-029-modo-ceo-ouvindo.md) (Em análise v0.1).  
**Próximo passo:** Homologação da ARQ-029 → IMP.
