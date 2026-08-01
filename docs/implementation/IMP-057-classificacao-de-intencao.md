# IMP-057 — Classificação de Intenção

> **Status: Homologada — frente encerrada** (01/08/2026).  
> Norma: **REQ-057** (homologada); **ARQ-018 v0.1** (homologada).  
> **Natureza:** plano + implementação E1–E7.  
> **Commit/push/deploy:** autorizados no encerramento.

---

## 1. Objetivo

Converter a **REQ-057** / **ARQ-018** num plano executável que materialize o **Classificador de Intenção** V1: classificar **toda** mensagem do utilizador **antes** de qualquer resposta ou acção, nas classes

`conhecimento_geral` | `conversa_projeto` | `trabalho_executivo` | `comando_operacional`

com encaminhamento correcto (C1 resposta leve; C2 frente activa sem Job automático; C3 → Motor ARQ-017/REQ-056; C4 capacidades operacionais), limiar de confiança **0,55**, e **um único** limiar canónico no Núcleo (sem classificadores concorrentes).

## 2. Escopo

### 2.1 Inclui

* Módulo domínio do Classificador (enum C1–C4, contrato de saída §RF7, regras de empate §RF8–RF11).  
* Função pura `classificarIntencaoCanonico` (ou evolução do stub) — **sem** efeitos laterais.  
* Encaminhador pós-classe no Orquestrador/Núcleo (mapa classe → destino).  
* Integração como **primeiro passo** de `executiveEngine.executar` (ou equivalente).  
* Convergência / substituição do stub legado (`classificar.js`) — RF15 / CA11.  
* Testes por etapa + documentação mínima.  
* Matriz CA1–CA11 / NA1–NA3 da REQ-057 → evidências.

### 2.2 Exclui (explícito)

* Alterar enunciados **ARQ-018** ou **REQ-057**.  
* UI dedicada ao Classificador.  
* Redesign do MRE, Motor, CTO ou Painel (apenas consumir / respeitar).  
* Segundo Classificador em paralelo.  
* Novas classes fora do enum V1.  
* Treino de modelo proprietário.  
* Abrir REQ/ARQ/IMP de outras frentes.  
* Implementar código neste artefacto (plano apenas).

## 3. Premissas

| ID | Premissa |
|----|----------|
| P1 | ARQ-018 está **homologada** e é a norma arquitectural. |
| P2 | REQ-057, após Gate próprio, é a norma de requisitos; este plano assume o enunciado v0.1. |
| P3 | Motor (IMP-056 / REQ-056) **já existe** como destino de C3. |
| P3a | Em C3, o Núcleo **não** fecha com Parecer Executivo textual; transferência ao Motor é obrigatória (emenda E4 v0.2). |
| P4 | Stub `classificarIntencao` actual é **insumo** a convergir — não norma das quatro classes. |
| P5 | Capacidades operacionais (memória, fila, dashboard, …) já existem para C4. |
| P6 | C1/C4 preferem regras/lexicon (REQ-057 RES8); LLM de classificação só se etapa autorizada o justificar. |
| P7 | Limiar de confiança V1 = **0,55** (RES7). |
| P8 | Classificador **não** publica Jobs nem chama Agent/SDK. |
| P9 | Gates por etapa: **sem código** até Gate deste plano + autorização da E. |

## 4. Dependências

| Dependência | Uso |
|-------------|-----|
| ARQ-018 | Classes, fluxo, critérios CA arquitecturais |
| REQ-057 | RF/RNF/CA/CU/RES/FE |
| ARQ-017 / REQ-056 / IMP-056 | Destino C3 (Motor) |
| Núcleo (`executiveEngine`) | Ponto de integração “primeiro passo” |
| `classificar.js` (legado) | Migração / convergência |
| Capacidades (memoria, fila, dashboard, ia, …) | Destinos C1/C4 / apoio C2 |
| MRE / integracaoNucleo | Destino C2 (e apoio deliberativo) |
| REQ-054 / REQ-055 | Sem salto CTO/Painel |
| CON-001 / ADR-015 | Tempo do utilizador; uso diário |

## 5. Estratégia de implementação

1. **Domínio e contrato primeiro** (enum, saída canónica, empates, limiar) — testável sem Orquestrador.  
2. **Regras/lexicon V1** para C1 e C4 (e sinais C3/C2) antes de qualquer LLM.  
3. **Encaminhador** puro (classe → destino) antes de ligar ao Núcleo.  
4. **Integração Núcleo** como primeiro passo; remover/encaminhar stub legado (um só limiar).  
5. **C3 → Motor** via API já existente (`conduzirMotorExecucao` / efeitos), sem redesenhar o Motor.  
6. **Fronteiras e regressões** (sem Job em C1/C2; C4 ≠ C3; sem SDK).  
7. **Gates E1…:** cada E homologável isoladamente; código só após Gate deste plano.

---

## 6. Etapas (granulares e homologáveis)

### E1 — Domínio e contrato do Classificador

**Objectivo:** modelo canónico in-memory das quatro classes + validação do contrato de saída.

**Entregáveis:**

* Módulo domínio (ex. `classificadorIntencao/dominio.js`): enum C1–C4, `validarSaida`, `LIMIAR_CONFIANCA = 0.55`, flags derivadas (`usaFrenteActiva`, `permiteJob`).  
* Tipos: `SaidaClassificador` alinhada a REQ-057 RF7.  
* Testes unitários do domínio (enum fechado; campos obrigatórios; flags por classe).

**Critérios de aceite E1:**

* E1-CA1: Exactamente quatro classes do enum V1; rejeição de classes ad hoc.  
* E1-CA2: Contrato RF7 validado (campos presentes / tipos).  
* E1-CA3: `usaFrenteActiva` / `permiteJob` coerentes com ARQ-018 §3 (C1 false/false; C2 true/false; C3 true/true potencial; C4 conforme regra).  
* E1-CA4: Domínio **sem** I/O, UI, Fila, Motor ou SDK.

**Homologação E1:** revisão + testes do domínio. Sem integração Núcleo.

---

### E2 — Motor de regras / lexicon V1

**Objectivo:** implementar `classificar(texto, contexto?)` por regras (RES8), incluindo empates e limiar.

**Entregáveis:**

* Função pura de classificação com lexicon C1/C4/C3/C2.  
* Aplicação de RF8–RF11 (empates + ambiguidade → sem C3 forçado).  
* Testes: CU1–CU5 da REQ-057 em fixtures de texto.

**Critérios de aceite E2:**

* E2-CA1: Fixtures C1 → `conhecimento_geral` sem Job flags.  
* E2-CA2: Fixtures C4 (status/jobs listar) → `comando_operacional`, não C3.  
* E2-CA3: Empate C2/C3 sem verbo de execução → C2.  
* E2-CA4: Confiança &lt; 0,55 ⇒ clarificação ou classe restritiva; **nunca** C3+Job.  
* E2-CA5: Função pura (sem `fetch`, Fila, SDK).

**Homologação E2:** suite de fixtures + revisão da tabela lexicon.

---

### E3 — Encaminhador pós-classe

**Objectivo:** mapa determinístico classe → destino lógico (sem executar ainda efeitos pesados).

**Entregáveis:**

* `encaminharPorClasse(saida)` → destino (`resposta_leve` | `nucleo_mre` | `motor_execucao` | `capacidade_operacional` | `clarificacao`).  
* Testes: cada classe → destino correcto; C3 → `motor_execucao`.

**Critérios de aceite E3:**

* E3-CA1: C1 → resposta leve; C2 → núcleo/MRE; C3 → motor; C4 → capacidade operacional.  
* E3-CA2: Encaminhador **não** publica Job nem chama Motor/Fila (só decide destino).  
* E3-CA3: Clarificação quando a saída o indicar.

**Homologação E3:** testes do mapa. Sem UI.

---

### E4 — Integração Núcleo (Classificador primeiro)

**Objectivo:** toda `executar(mensagem)` classifica antes de qualquer capacidade/MRE/Motor; e, quando a classe for **C3 (Trabalho Executivo)**, o Núcleo **transfere obrigatoriamente** o controlo ao Motor de Execução — sem parecer textual «Sugiro…» como resposta final.

**Entregáveis:**

* Hook no Núcleo: `classificar` → `encaminharPorClasse` → só então executar destino.  
* Convergência do stub legado (substituir ou adaptar a emitir classes canónicas — **um** limiar).  
* Registo observável da classificação em `dados` / diagnóstico (sem secrets).  
* Garantia: C1 não entra no pipeline MRE completo.  
* **Regra C3 (obrigatória nesta E4):**
  1. Se `classe === trabalho_executivo` e destino `motor_execucao` (e sem clarificação), o Núcleo **não** poderá tratar a rota deliberativa/MRE como resposta final.  
  2. O Núcleo deverá invocar o Motor (`conduzirMotorExecucao` / ponte IMP-056) **antes** de devolver prosa ao utilizador.  
  3. A mensagem ao utilizador deverá reflectir o **início da execução** (ex.: Job criado/`pending`, handoff ao Dispatcher, ou Gate de aprovação do Motor) — **não** uma recomendação consultiva do tipo «Sugiro…» / parecer executivo textual como fecho.  
  4. Proibido: gerar `ParecerExecutivo` (ou equivalente Speaker de deliberação) como **única** resposta a C3, omitindo o Motor.

**Critérios de aceite E4:**

* E4-CA1: Teste de integração — efeito Fila/Motor/MRE **após** classificação registada.  
* E4-CA2: C1 não invoca `executarDeliberacaoMre` / rota deliberativa.  
* E4-CA3: Um único módulo/caminho de classificação no fluxo Conversa→Núcleo.  
* E4-CA4: Sem `@cursor/sdk` no Classificador / encaminhador.  
* E4-CA5: Fixture C3 («Implementa… e despacha») → Núcleo chama porta do Motor; resposta contém indício de Job/execução/Gate — **não** termina só com «Sugiro…».  
* E4-CA6: Em C3, **não** há `ParecerExecutivo` / comunicado MRE como resposta final sem passagem pelo Motor (teste negativo com mock).  
* E4-CA7: Se o Motor exigir Gate (`aguardando_gate`), a resposta ao utilizador reflecte pedido de aprovação — ainda assim **via Motor**, não via parecer deliberativo solto.  
* E4-CA8: Clarificação (`destino === clarificacao`) **não** força Motor; C2 continua a poder usar MRE.

**Homologação E4:** testes de integração Núcleo + smoke CU1/CU3/CU4; evidência explícita anti-«Sugiro» em C3.

---

### E5 — Destinos C2 / C3 / C4 (ligação real)

**Objectivo:** ligar encaminhamentos aos sistemas existentes sem redesenhar Motor/MRE — cumprindo a transferência C3 já obrigatória na E4.

**Entregáveis:**

* C2 → caminho deliberativo / IA com frente activa (existente).  
* C3 → `conduzirMotorExecucao` / efeitos Motor (IMP-056) — **única** via de resposta final para Trabalho Executivo (reforço E4-CA5–CA7).  
* C4 → capacidades já registadas (memoria, fila listar, dashboard, …) por mapa id.  
* Testes: C2 sem Job automático; C3 chama porta Motor (mock) e resposta operacional; C4 não classifica como C3.

**Critérios de aceite E5:**

* E5-CA1: C2 com mock → zero `publicarJob`.  
* E5-CA2: C3 com mock Motor → invocação do Motor; Job só se política mock permitir; prosa final ≠ parecer «Sugiro» isolado.  
* E5-CA3: C4 “listar jobs” → capacidade fila/consulta, não Motor de implementação.  
* E5-CA4: Falha do destino não apaga o registo de classificação prévia.  
* E5-CA5: Falha do Motor em C3 → erro tipado / mensagem de falha de execução; **não** fallback silencioso para deliberação MRE como substituto.

**Homologação E5:** testes com mocks + checklist CU2–CU4.

---

### E6 — Fronteiras, regressões e anti-bypass

**Objectivo:** CA/NA de fronteira; CTO/Painel; sem classificadores concorrentes.

**Entregáveis:**

* Testes negativos: Classificador sem Fila/SDK; C1/C2 sem Job; ambiguidade sem C3.  
* Verificação estática: CTO/Painel não saltam Classificador no caminho Conversa.  
* Inventário: um só entrypoint de classificação.  
* Checklist operacional curto (README).

**Critérios de aceite E6:**

* E6-CA1: Suite negativa (Job/SDK/bypass) a verde.  
* E6-CA2: Stub legado removido ou reduzido a adapter do canónico (CA11).  
* E6-CA3: Regressão capacidades C4 (memoria/fila) a verde.  
* E6-CA4: Segredos ausentes em `razaoCurta` (amostra).

**Homologação E6:** relatório de regressão + evidências.

---

### E7 — Documentação, matriz CA REQ-057 e fecho de plano

**Objectivo:** fechar rastreabilidade REQ-057 CA1–CA11 / NA1–NA3; docs; critérios de commit.

**Entregáveis:**

* README curto do Classificador (classes, limiar, destinos, portas).  
* Matriz de evidências em `docs/implementation/evidencias/IMP-057-matriz-ca-na.md`.  
* Lista de ficheiros para commit futuro.  
* Actualização de catálogo **apenas** no encerramento formal (após Gates de código — não neste plano).

**Critérios de aceite E7:**

* E7-CA1: Cada CA1–CA11 e NA1–NA3 mapeado a evidência.  
* E7-CA2: README referencia ARQ-018, REQ-057, ARQ-017/REQ-056.  
* E7-CA3: Lista explícita de ficheiros tocados.

**Homologação E7:** pacote de evidências → Gate técnico de implementação (futuro) → só então commit.

---

## 7. Ordem e dependências entre etapas

```text
E1 → E2 → E3 → E4 → E5
                ↘ E6 (pode iniciar após E4; fecha após E5)
E1…E6 → E7
```

Cada etapa exige **homologação interna** antes de avançar código da seguinte.

**Nenhuma etapa de código** começa antes da **homologação deste plano IMP-057**.

## 8. Estratégia de testes

| Tipo | O quê |
|------|--------|
| Unitário | Domínio; lexicon; empates; limiar 0,55 |
| Integração | Núcleo: classificar → encaminhar → destino (mocks) |
| Negativo | C1/C2 sem Job; ambiguidade ≠ C3; sem SDK/Fila no Classificador |
| Regressão | Capacidades C4; MRE C2; Motor C3 (mock); CTO/Painel |
| Manual / smoke | CU1 e CU4 em ambiente local |
| Fixtures | Corpus mínimo por classe (REQ-057 CU1–CU5) |

Comando previsto (na implementação): ex. `npm run test:classificador` / `test:classificador:e1` em `app/`.

## 9. Critérios de homologação do **plano** IMP-057 (este documento)

O plano considera-se homologado quando o patrocinador confirmar:

1. Etapas E1–E7 suficientes e na ordem certa.  
2. “Classificador primeiro” e um só limiar cobertos.  
3. C1–C4 e encaminhamento C3→Motor cobertos.  
4. Empates/ambiguidade sem default C3.  
5. Autorização para **iniciar código pela E1** após Gate deste plano **e** após REQ-057 homologada.  
6. Sem alteração a ARQ-018 / REQ-057 neste artefacto (cumprido).

## 10. Critérios de homologação da **implementação** (após código — referência)

* Todas as E homologadas.  
* CA1–CA11 e NA1–NA3 da REQ-057 com evidência.  
* Testes automatizados relevantes a verde.  
* Smoke local CU1 + CU4.  
* Relatório técnico de fecho (padrão IMP-055/056).  
* Produção só após commit autorizado.

## 11. Critérios para commit

Commit **só** quando:

1. Gate do plano IMP-057 estiver homologado **e**  
2. REQ-057 estiver homologada **e**  
3. Implementação das etapas autorizadas estiver concluída com Gate técnico de código **e**  
4. Escopo = ficheiros do Classificador / integração Núcleo (sem BP/PX laterais) **e**  
5. Mensagem de commit referencie REQ-057 / IMP-057 / ARQ-018 **e**  
6. Patrocinador autorizar explicitamente commit/push/deploy.

**Proibido:** commit que altere ARQ-018 ou REQ-057; commit de segundo Classificador; commit que faça C1/C2 publicar Jobs; commit com `@cursor/sdk` no Classificador.

## 12. Riscos do plano

| Risco | Mitigação |
|-------|-----------|
| Stub + canónico em paralelo | E4-CA3 / E6-CA2 / RF15 |
| Falsos positivos C3 | E2 empates; preferir C2; Gate Motor |
| C3 respondido com «Sugiro…» (parecer sem Motor) | E4-CA5–CA8; E5-CA2 / E5-CA5 |
| Scope creep LLM | RES8; E2 regras primeiro |
| C4 vs C3 em “jobs” | Fixtures E2/E5; RF10 |
| Avançar código antes do Gate | Proibição §6 / §9 |

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Arquitectura | ARQ-018 (homologada) — **não alterada por esta IMP** |
| Requisitos | REQ-057 — **não alterada por esta IMP** |
| Capacidade | CAP-07 |
| Destino C3 | ARQ-017; REQ-056; IMP-056 |
| Origem | Abertura plano Classificação de Intenção (01/08/2026) |
| Implementação | *Proibida até Gate deste plano + E autorizada* |

## 14. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura IMP-057 — plano E1–E7 | Materializar Classificador sem código nesta fase | Plano aberto |
| 0.2 | 01/08/2026 | Engenheiro (Cursor) | Emenda E4/E5 — C3 obriga Motor; anti-«Sugiro» | Eliminar parecer textual como resposta final a Trabalho Executivo | Emenda homologada |
| 0.3 | 01/08/2026 | Engenheiro (Cursor) | Implementação E4 — hook Núcleo + C3→Motor | Materializar v0.2; anti-«Sugiro» em C3 | E4 homologável |
| 0.4 | 01/08/2026 | Engenheiro (Cursor) | Implementação E5 — destinos C1–C4 reais + anti-fallback | Ligar classificação às capacidades; E5-CA1–CA5 | E5 homologável |
| 0.5 | 01/08/2026 | Engenheiro (Cursor) | E6 fronteiras + E7 docs/matriz + relatório consolidado | Fechar IMP-057 para Gate técnico | Homologação consolidada |
| 1.0 | 01/08/2026 | Engenheiro (Cursor) | Encerramento — commit/push/deploy/prod | IMP-057 Homologada pelo patrocinador | **Frente encerrada** |

---

*Nenhuma linha de código do Classificador canónico sob esta IMP até homologação do plano e autorização explícita da E1.*

---

**Pedido de Gate:** IMP-057 **v0.2** — secção **E4** (Integração Núcleo + regra C3→Motor / anti-«Sugiro») pronta para homologação do patrocinador. E3 permanece em pausa até Gate desta emenda (ou ordem em contrário).
