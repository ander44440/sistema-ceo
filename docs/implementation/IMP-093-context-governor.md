# IMP-093 — Implementação do Context Governor

> **Status:** M4 concluído (ENFORCE padrão) — 15/09/2026  
> **Versão:** 0.2 — 15/09/2026  
> Norma: **REQ-093 v0.1** (aprovado); **ARQ-093 v0.1** (aprovado).  
> Capacidade: **CAP-01** — Governança.  
> **Natureza:** plano de implementação por fases **M0→M4** (ARQ-093 §10); gate único pré-LLM.  
> **Rollback SHADOW (MIG-5):** `CEO_CG_MODO=sombra` (ou `shadow`).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Plano IMP do Context Governor: módulos CG-*, CG-GATE no transporte LLM, auditoria `cg.autorizacao`, migração sombra→enforce. |
| **Por que existe?** | REQ-093 / ARQ-093 exigem gate transversal; runtime actual não tem CG. |
| **Para quem existe?** | CTO (revisão do plano); Engenheiro (execução futura por fase); VAL. |
| **Como medir sucesso?** | Critérios por fase (§8) + CA-093-1…12 em M4; zero regressão em M1–M2; rollback §9. |

---

## 1. Objectivo e limites

### 1.1 Objectivo

Implementar o Context Governor conforme ARQ-093, de forma que **toda** chamada LLM oficial do Núcleo passe por CG-GATE, com autorização/isolamento/bloqueio tipificados e auditoria `cg.autorizacao`.

### 1.2 Fora deste plano IMP (inalterado)

| Peça | Motivo |
|------|--------|
| VCA / CSC / Classificador / Gate / Motor | Não substituir (X6; ARQ §1.2) |
| LFC Writer/Reader, HFC, MO | CG read-only (X2–X4; I8) |
| Lógica deliberativa MRE / Parecer | Não substituir MRE (X7) |
| Speaker / CN / prosa executiva | Consumidores de bloqueio apenas (X8) |
| LLM fora do transporte oficial | Fora REQ-093 |

### 1.3 Estado actual (baseline pré-IMP)

| Caminho | Situação |
|---------|----------|
| `deliberarComLlm` (`executiveEngine/llmCliente.js`) | Transporte HTTP **sem** CG |
| `criarChamarLlmCeo` (`mre/adaptadorLlmCeo.js`) | Delega a `deliberarComLlm` **sem** CG |
| `montarMensagensLlm` → `deliberarComLlm` | Idem |
| Paths sem LLM | Correctamente **fora** do CG (CG-POS-4) |

---

## 2. Arquivos / componentes a criar ou alterar

### 2.1 Criar (módulo Context Governor)

| Componente ARQ | Path proposto | Responsabilidade |
|----------------|---------------|------------------|
| **CG-CONTRACT** | `app/src/contextGovernor/contratos.js` | Constantes de estados, fontes, códigos de violação; JSDoc/tipos de `PedidoGovernancaContexto`, `ResultadoGovernancaContexto`, `FragmentoContexto`, `RemocaoFragmento` |
| **CG-FRAG** | `app/src/contextGovernor/fragmentos.js` | Normalizar `conteudoCandidato` → `FragmentoContexto[]`; suporte a blob legacy `nao_etiquetado` |
| **CG-POLICY** | `app/src/contextGovernor/politicaRegime.js` | Interpretar `regimeEspecial` + `fontesLastroAutorizadas` (RFR, isolamento VCA, metaconversa) **sem** reabrir ADR |
| **CG-SUFF** | `app/src/contextGovernor/suficiencia.js` | Avaliar V5 após isolamento (sem inventar conteúdo) |
| **CG-CORE** | `app/src/contextGovernor/governarContexto.js` | `governarContexto(pedido) → ResultadoGovernancaContexto` (V1–V5, P1–P4, precedência de estados) |
| **CG-AUDIT** | `app/src/contextGovernor/auditoria.js` | Emitir evento lógico `cg.autorizacao` (sombra/enforce) |
| **CG-GATE** | `app/src/contextGovernor/gateLlm.js` | Envolver transporte: montar pedido, chamar CORE, aplicar modo sombra/enforce |
| **CG-SHADOW / modo** | `app/src/contextGovernor/modo.js` | Resolução `sombra` \| `enforce` (flag/config; default seguro) |
| Índice | `app/src/contextGovernor/index.js` | Export público estável |
| Testes (fases futuras) | `app/src/contextGovernor/*.imp093.test.js` | Por fase — **não** criar nesta tarefa de plano |

### 2.2 Alterar (integração mínima)

| Ficheiro | Alteração prevista | Fase mínima |
|----------|--------------------|-------------|
| `app/src/executiveEngine/llmCliente.js` | `deliberarComLlm` passa a invocar **CG-GATE** antes do `fetch` `/api/ceo/deliberar` | **M1** (sombra: pacote inalterado) |
| `app/src/mre/adaptadorLlmCeo.js` | Propagar `meta` CG (actoChamada estágio, fontes, regime, COA/caso) no pedido a `deliberar` | **M1–M2** |
| `app/src/executiveEngine/promptGovernanca.js` e/ou `capacidades/ia.js` | Ao montar mensagens do path directo / `llm_rapido` / conhecimento via LLM: anexar meta + fragmentos quando disponíveis | **M2** |
| `app/src/mre/integracaoNucleo.js` / montagem entrada | Declarar `fontesLastroAutorizadas` e `regimeEspecial` (RFR, VCA) na meta do acto | **M2** |
| `app/src/trilhaAuditavel/dominio.js` | Extensão **aditiva** do tipo `cg.autorizacao` em `TIPOS_ADMITIDOS` (padrão LFC/`lfc.mutacao`) | **M1** |
| `app/src/trilhaAuditavel/index.js` (se necessário) | Re-export / wiring do novo tipo | **M1** |

### 2.3 Não alterar (explícito)

`validadorContextoAtivo.js`, gestores CSC, `writer.js`/`reader.js` LFC, emissor HFC, ledger MO, `speakerExecutivo.js`, classificador — salvo consumo **read-only** de flags já existentes para preencher meta do pedido CG.

---

## 3. Contratos e tipos

### 3.1 Estados (fechados — REQ-093 §4)

`autorizado_integral` · `autorizado_apos_isolamento` · `bloqueado_contaminacao` · `bloqueado_insuficiencia` · `bloqueado_esclarecimento` · `bloqueado_violacao_invariante`

### 3.2 `PedidoGovernancaContexto` (campos)

| Campo | Notas de implementação |
|-------|------------------------|
| `coaAtivo` | `{ id, nome? }` ou `null` |
| `casoAtivo` | `{ casoId, titulo? }` ou `null` |
| `objetivoOuAssuntoTurno` | string \| null |
| `fontesLastroAutorizadas` | `string[]` — obrigatório; default `[]` se omitido pelo chamador **não** implica autorização implícita |
| `conteudoCandidato` | object — preferir `{ fragmentos: FragmentoContexto[] }` ou `{ messages }` legacy |
| `actoChamada` | string estável (`mre:S3`, `llm_direct`, …) |
| `regimeEspecial` | object flags opcional |
| `metaAuditoria` | `{ turnId?, coaId?, … }` |
| `modo` | opcional no pedido; senão resolve via `modo.js` |

### 3.3 `FragmentoContexto`

`id`, `papel`, `texto`\|`payload`, `coaId?`, `casoId?`, `fonte`, `uso`

Fontes canónicas (enum lógico ARQ):  
`turno_atual` · `lfc_activos` · `csc` · `hfc_continuidade` · `hfc_prova` · `mo_consulta` · `dic` · `briefing_oficial` · `consciencia_ops` · `nao_declarada` · `nao_etiquetado` (legacy)

### 3.4 `ResultadoGovernancaContexto`

`estado`, `autorizado`, `pacoteAutorizado`, `remocoes[]`, `motivo`, `exigeEsclarecimento`, `declaraInsuficienciaLastro`, `violacoes[]`, `auditoriaRef?`, e em sombra: `teriaBloqueado?`, `remocoesHipoteticas?`

### 3.5 API pública

```text
governarContexto(pedido) → ResultadoGovernancaContexto

deliberarComLlmGovernado(pedidoLlm, metaCg)  // CG-GATE + transporte
  — ou deliberarComLlm interno passa a ser o gate
```

**IN-1…IN-3, OUT-1…OUT-4, I1–I9** são critérios de código e teste.

---

## 4. Integração do CG-GATE no transporte LLM

### 4.1 Ponto único (D-INT-1)

**Decisão de implementação:** integrar CG-GATE em `deliberarComLlm` (`llmCliente.js`), porque é o funil actual de:

- MRE (`criarChamarLlmCeo` → `deliberarComLlm`);
- path directo / `montarMensagensLlm` / conhecimento via LLM.

Assim cumpre-se transversalidade (CG-POS-3) com **um** ponto de enforce.

### 4.2 Algoritmo do gate (ARQ §3.2)

```text
1. Receber { messages | pacote, …pedidoLlm } + metaCg
2. Montar PedidoGovernancaContexto
3. resultado = governarContexto(pedido)
4. Emitir cg.autorizacao (sempre que gate corre)
5. Se modo = sombra:
     → fetch com pacote ORIGINAL (inalterado)
     → anexar resultado CG só em telemetria/dados (não muda prosa LLM)
6. Se modo = enforce:
     → se !autorizado: NÃO fetch; devolver erro/resultado tipificado ao chamador
     → se autorizado: fetch APENAS com pacoteAutorizado
```

### 4.3 Contrato de erro para chamadores (enforce)

Quando bloqueado, `deliberarComLlm` / gate devolve objecto estável (não HTTP LLM), p.ex.:

```text
{ ok: false, codigo: "cg_bloqueado", resultadoCg: ResultadoGovernancaContexto }
```

Chamadores MRE / `ia.js` mapeiam para clarificação / insuficiência / falha fechada (ARQ §3.3) **sem** reinventar prosa no CG.

### 4.4 Anti-bypass (I9 / CA-093-12)

| Regra | Implementação |
|-------|----------------|
| Nenhum `fetch` directo a `/api/ceo/deliberar` fora de `llmCliente` | Inventário + teste de conformidade na VAL |
| Testes/mocks injectam `deliberar` | Devem respeitar a mesma API do gate ou documentar harness |
| Flag `CG_BYPASS` | **Proibida** em produção; só harness de teste explícito se CTO autorizar |

---

## 5. Cobertura dos caminhos MRE e LLM directos

| Caminho | Como entra no CG | Meta mínima a propagar |
|---------|------------------|------------------------|
| MRE estágios (`pipeline/estagios.js` → `chamarLlm`) | Via `criarChamarLlmCeo` → `deliberarComLlm` | `actoChamada=mre:{estagio}`, contexto do estágio como candidato, fontes/regime da entrada MRE |
| MRE retentativa | Novo acto CG (I2) | Idem + `retentativa` |
| `llm_rapido` / `montarMensagensLlm` | `ia.js` → `deliberarComLlm` | `actoChamada=llm_direct` ou `llm_rapido` |
| Conhecimento geral via LLM | Idem | `actoChamada=conhecimento_geral` |
| Paths **sem** LLM (local, LFC restrito, C3, consulta registados, clarificação) | **Não** chamam `deliberarComLlm` | Sem CG (CG-POS-4) |

**Paridade (CA-093-3):** mesma função CORE + mesmo GATE; só difere `actoChamada` e meta.

**CC-09:** cada estágio MRE = acto independente; sem cache que reautorize fragmentos removidos em acto anterior.

---

## 6. Estratégia M0 → M1 → M2 → M3 → M4

| Fase | Entrega de código | Comportamento observável | Saída |
|------|-------------------|--------------------------|--------|
| **M0** | **Nenhuma** (esta IMP-plano + REQ/ARQ) | Inalterado | Homologação CTO do plano IMP |
| **M1** | Módulo CG + gate em `llmCliente` em **sombra** + tipo Trilha `cg.autorizacao` | Pacote LLM **idêntico**; eventos sombra | Zero regressão prosa/rota/Jobs; paths instrumentados |
| **M2** | Etiquetagem + `fontesLastroAutorizadas` / `regimeEspecial` nos montadores MRE e directo | Ainda sombra; taxa de `nao_etiquetado` a descer | Cobertura etiquetagem MRE+directo; métricas sombra |
| **M3** | Enforce **opt-in** (env/flag por ambiente ou acto) | Só actos opted-in bloqueiam/isolam | CA selectivos; falso positivo controlado |
| **M4** | Enforce **default** em produção | Todo LLM oficial governado; bypass = falha | CA-093-1…12 |

### 6.1 Sequência de implementação recomendada (dentro das fases)

**M1**

1. `contratos.js` + estados/códigos  
2. `fragmentos.js` (incl. legacy blob → `nao_etiquetado`)  
3. `politicaRegime.js` + `suficiencia.js` (versão conservadora)  
4. `governarContexto.js`  
5. `auditoria.js` + tipo Trilha `cg.autorizacao`  
6. `modo.js` (default **`sombra`**)  
7. `gateLlm.js` + wiring em `llmCliente.js`  
8. Propagação mínima de `meta` no adaptador MRE (actoChamada)  
9. Testes unitários CORE + teste de não-regressão «sombra não altera body»

**M2**

10. Montadores: etiquetar fragmentos LFC/HFC/CSC/turno/DIC conforme autorização a montante  
11. Preencher `fontesLastroAutorizadas` a partir de VCA/RFR/LFC/consulta (read-only das flags já existentes)  
12. Dashboard/contagem sombra: remoções hipotéticas, `nao_etiquetado`, CC-*  

**M3**

13. Flag enforce opt-in  
14. Mapeamento bloqueio → disciplina/clarificação nos chamadores  
15. Fixtures CA-093-4…10 nos actos opted-in  

**M4**

16. Default enforce  
17. Conformidade anti-bypass  
18. VAL completa CA-093-1…12  

### 6.2 Regras MIG (vinculativas)

- **MIG-1:** M0 = zero código (cumprido por este acto de plano).  
- **MIG-2:** M1 não muda prosa, destino, Jobs, LFC, HFC, MO, CSC.  
- **MIG-3:** Enforce só após evidência sombra + etiquetagem.  
- **MIG-4:** Não reabrir VCA/LFC/RFR/MRE.  
- **MIG-5:** Rollback enforce → sombra; auditoria permanece.

---

## 7. Instrumentação / auditoria `cg.autorizacao`

### 7.1 Tipo Trilha (aditivo)

Estender `TIPOS_ADMITIDOS` com **`cg.autorizacao`** (mesmo padrão aditivo de `lfc.mutacao` — sem partir TIPOS_V1 se aplicável).

### 7.2 Payload mínimo do evento

| Campo | Conteúdo |
|-------|----------|
| `tipo` / `evento` | `cg.autorizacao` |
| `actoChamada` | string |
| `estado` | estado canónico |
| `autorizado` | boolean (no modo sombra: do resultado calculado) |
| `modo` | `sombra` \| `enforce` |
| `violacoes` | códigos |
| `remocoes` | ids + códigos (ou só códigos se política de privacidade) |
| `coaId` / `casoId` | âmbito declarado |
| `fontesDeclaradas` | lista |
| `teriaBloqueado` | boolean (sombra) |
| `timestamp` | ISO-8601 |
| refs | `turnId` / hash opcional do pacote — **sem** dump integral de prompt por defeito (A4) |

### 7.3 Emissão

- **Sempre** que CG-GATE corre (M1+).  
- Fail-soft: falha de Trilha **não** bloqueia LLM em sombra; em enforce, política = fail-soft de auditoria + log técnico (não abrir buraco de bypass de governança).  
- CG-AUDIT **não** escreve LFC/MO/HFC/CSC (A2).

---

## 8. Critérios de validação por etapa

| Fase | Critérios de saída (observáveis) |
|------|----------------------------------|
| **M0** | IMP-093 plano homologado pelo CTO; REQ/ARQ intactos |
| **M1** | (1) `governarContexto` puro testável; (2) todo `deliberarComLlm` emite `cg.autorizacao` sombra; (3) body HTTP LLM **byte-equivalente** ao pré-M1 nos fixtures de regressão; (4) zero mudança LFC/HFC/MO/CSC; (5) build + suítes relevantes verdes |
| **M2** | (1) paths MRE + directo enviam fragmentos etiquetados na maioria dos actos; (2) `fontesLastroAutorizadas` preenchidas a partir de flags a montante; (3) taxa `nao_etiquetado` reportada e em queda; (4) ainda sombra — prosa inalterada |
| **M3** | (1) enforce opt-in bloqueia CC-01/03/05/06 nos actos ligados; (2) `pacoteAutorizado` ⊆ candidato; (3) bloqueio ⇒ sem fetch LLM; (4) clarificação/insuficiência sem inferência factual (P4); (5) CA-093 selectivos verdes |
| **M4** | CA-093-1…12; anti-bypass; paridade MRE↔directo; rollback ensaiado (§9) |

### 8.1 Mapeamento rápido a CA-093

| CA | Fase alvo |
|----|-----------|
| CA-093-1 | M0 (docs) |
| CA-093-2, 12 | M1 wiring + M4 enforce |
| CA-093-3 | M1–M2 (mesmo gate) |
| CA-093-4…10 | M3–M4 |
| CA-093-11 | Revisão estática + testes negativos desde M1 |

---

## 9. Rollback

| Situação | Acção | Efeito |
|----------|-------|--------|
| Regressão em **M1/M2** | Desactivar wiring do gate **ou** `modo=sombra` com no-op de CORE (feature flag `cg.enabled=false`) | Volta ao transporte pré-CG; eventos deixam de emitir se disabled |
| Falso positivo em **M3** | Remover acto/ambiente do opt-in enforce → sombra | LLM volta a receber pacote original; auditoria continua |
| Incidente em **M4** | **MIG-5:** default → sombra (config) **sem** remover módulo | Enforce off; diagnóstico via Trilha |
| Rollback de código | Reverter commits da fase; **não** apagar eventos Trilha já gravados | Integridade auditável |

**Proibido no rollback:** «reparar» isolamento com inferência; desactivar VCA/LFC/RFR para contornar CG; bypass permanente em produção.

---

## 10. Riscos de implementação e mitigações

| Risco | Mitigação |
|-------|-----------|
| Integrar gate só no adaptador MRE e esquecer path directo | Gate em `llmCliente` (funil único) |
| Sombra alterar temperature/tokens acidentalmente | Teste de igualdade do body JSON enviado |
| Suficiência V5 demasiado agressiva | V5 conservadora em M1–M2; apertar só com evidência sombra |
| Trilha rejeitar tipo novo | Extensão aditiva `TIPOS_ADMITIDOS` + teste de emissão |
| Chamador não passa meta | Fragmentos `nao_etiquetado`; sombra mede; enforce só após M2 |

---

## 11. Entregáveis desta tarefa (já cumpridos / não cumpridos)

| Entregável | Estado neste acto |
|------------|-------------------|
| Documento IMP-093 (plano) | **Entregue** — este ficheiro |
| Código CG / gate / Trilha | **Não** — proibido |
| Testes executados | **Não** — proibido |
| Abertura de VAL-093 | **Não** — após execução de fase |

---

## 12. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Requisito | REQ-093 v0.1 |
| Arquitectura | ARQ-093 v0.1 |
| Capacidade | CAP-01 |
| Transporte actual | `app/src/executiveEngine/llmCliente.js` |
| Adaptador MRE | `app/src/mre/adaptadorLlmCeo.js` |
| Trilha | `app/src/trilhaAuditavel/` |
| Implementação de código | — (aguarda aprovação CTO + despacho de fase M1) |
| Testes | — |

---

## 13. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 15/09/2026 | Engenheiro (Cursor), sob despacho do Usuário | Plano IMP-093 (sem código) | Preparar execução M1+ após revisão CTO | Em análise |
