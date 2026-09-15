# ARQ-093 — Arquitectura do Context Governor

> **Status:** Em análise (CTO) — v0.1  
> **Versão:** 0.1 — 15/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-093.  
> **Capacidade:** CAP-01 — Governança.  
> Norma superior: CON-001 Art. 5º, 7º, 9º (2, 3, 8); VIS-007 §1; ADR-006; ADR-010; ADR-015; **REQ-093 v0.1** (fonte exclusiva desta ARQ).  
> Normas consumidas (não emendadas): REQ-037/038/039; REQ-065 / ARQ-026 (VCA); REQ-049 / ADR-019 (MRE); REQ-092 / ADR-021–023 (LFC/RFR); REQ-087 (HFC); REQ-086/089 (consultas MO/discussões); REQ-059 (consciência operacional).  
> **Finalidade:** arquitectura lógica do **Context Governor (CG)** — gate único de autorização do contexto **imediatamente antes** de qualquer envio ao LLM.  
> **Gate ARQ:** aberto — aguarda revisão CTO.  
> **Proibições deste acto:** não implementar; não criar IMP; não alterar código; não criar testes; não emendar REQ-093.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do Context Governor: componente único e transversal que valida o pacote contextual candidato e emite autorização, isolamento ou bloqueio **antes** do transporte LLM. |
| **Por que existe?** | REQ-093: disponibilidade ≠ autorização; controlos actuais são path-dependent (VCA, RFR, disciplina, LfcReader) e **não** fecham todos os caminhos LLM. |
| **Para quem existe?** | CTO (homologação); Engenheiro (IMP futura); Núcleo / MRE / caminho LLM directo (integradores); Speaker/CN/disciplina (consumidores de bloqueio). |
| **Como medir sucesso?** | CA-093-1…12 do REQ-093; invariantes I1–I9; zero bypass no transporte; zero escrita LFC/MO/HFC/CSC pelo CG; paridade MRE ↔ LLM directo. |

---

## 1. Visão arquitectural

### 1.1 Princípio

O **Context Governor** é a **fechadura de autorização de contexto** na fronteira LLM.  
Opera **depois** de VCA, CSC, classificador, montagem de entrada MRE / mensagens e regimes (RFR, etc.).  
Opera **antes** de `deliberarComLlm` / `POST /api/ceo/deliberar` (ou equivalente oficial).

```text
… pipeline conversacional / montagem de candidato …
        │
        ▼
┌───────────────────────────┐
│   Context Governor (CG)   │  ← único gate de autorização de contexto
│  Pedido → Resultado       │
└───────────────────────────┘
        │
        ├─ autorizado_* ──────────► Transporte LLM (só pacoteAutorizado)
        └─ bloqueado_* ───────────► Sem LLM; sinal para disciplina/Speaker/CN
```

### 1.2 Posição relativa (não substitui)

```text
Gate → VCA → CSC → Classificador → Destino
                      │
          ┌───────────┴───────────┐
          │ C2 / LLM directo / …  │
          │ monta conteudoCandidato│
          └───────────┬───────────┘
                      ▼
                 Context Governor     ← ARQ-093 (esta)
                      │
                      ▼
              Transporte LLM oficial
                      │
                      ▼
            MRE estágio / Speaker / CN / disciplina
```

| Módulo | Decide | Momento |
|--------|--------|---------|
| **VCA** | Pertença / `autorizaLastroCsc` | Pré-CSC |
| **CSC** | Tópico, referente, objectivo | Pré-classificador (se autorizado) |
| **Classificador** | C1–C4 / destino | Pós-CSC |
| **LFC Reader / RFR** | Factos canónicos; regime restrito | Montagem deliberativa |
| **MRE** | Deliberação / parecer | Após montagem; **chama CG antes de cada LLM** |
| **CG (esta ARQ)** | Autorização do **pacote** a enviar | Imediatamente pré-LLM |
| **Speaker / CN / disciplina** | Prosa / naturalização / lacuna | Pós-LLM ou pós-bloqueio |

### 1.3 O que se acrescenta (arquitectura)

1. Módulo lógico **Context Governor** com API pura de governança (sem I/O de stores de lastro).  
2. Contratos `PedidoGovernancaContexto` e `ResultadoGovernancaContexto`.  
3. Modelo de **fragmentos etiquetados** no candidato (pertença/fonte auditável).  
4. **Ponto único de integração** no adaptador/transporte LLM (obrigatório em produção).  
5. Emissores de auditoria (evento por acto CG) — sem mutar LFC/MO/HFC/CSC.  
6. Plano de migração **sombra → enforce** sem alterar comportamento nesta etapa ARQ.

### 1.4 O que permanece intacto nesta etapa

| Peça | Estado nesta ARQ |
|------|------------------|
| VCA / CSC / Classificador / Gate / Motor | **Sem alteração de contrato** |
| LFC Writer/Reader, HFC append-only, MO | **Sem alteração**; CG read-only |
| MRE pipeline 0–7, Speaker, CN, disciplina | **Sem alteração de responsabilidade**; passam a **consumir** CG na IMP futura |
| Comportamento runtime actual | **Preservado** até IMP com fase sombra (§10) |

---

## 2. Componentes

| ID | Componente | Responsabilidade | Persistência |
|----|------------|------------------|--------------|
| **CG-CORE** | Motor de governança | Executa V1–V5; aplica P1–P4; emite estado canónico | Nenhuma (função pura quanto a stores de lastro) |
| **CG-CONTRACT** | Tipos de pedido/resultado | Schema lógico dos contratos §3 | N/A |
| **CG-FRAG** | Modelo de fragmento | Normaliza `conteudoCandidato` em unidades etiquetáveis (`FragmentoContexto`) | N/A |
| **CG-POLICY** | Políticas de regime | Interpreta `regimeEspecial` + `fontesLastroAutorizadas` (ex.: RFR, isolamento VCA, metaconversa) **sem** redefinir normas ADR | N/A |
| **CG-SUFF** | Avaliador de suficiência | Após isolamento, decide se lastro restante basta ao `objetivoOuAssuntoTurno` / pedido (V5) — **sem** inventar conteúdo | N/A |
| **CG-GATE** | Integração no transporte LLM | Único ponto obrigatório: intercepta envio; só deixa passar `pacoteAutorizado` | N/A |
| **CG-AUDIT** | Emissor de evidência | Regista acto CG (pedido resumido, estado, remoções, violações) na Trilha ou canal de auditoria oficial | Append-only de evento; **não** escreve LFC/MO/HFC/CSC |
| **CG-SHADOW** | Modo sombra (migração) | Corre CG, regista resultado, **não** bloqueia nem altera o pacote enviado | Igual CG-AUDIT |

**Fronteira de composição:** CG-CORE **não** importa writers LFC/MO/HFC/CSC; **não** chama MRE; **não** classifica intenção; **não** resolve VCA.

---

## 3. Interfaces

### 3.1 Interface principal (obrigatória)

```text
governarContexto(pedido: PedidoGovernancaContexto)
  → ResultadoGovernancaContexto
```

| Propriedade | Norma |
|-------------|--------|
| Pureza face a lastro | Sem side-effects em LFC, MO, HFC, CSC, transcript |
| Idempotência lógica | Mesmo pedido ⇒ mesmo estado/autorização (salvo relógio só em auditoria) |
| Uma invocação | Por **acto de chamada** LLM (I2) |
| Sem completar pacote | Não lê stores para «enriquecer» candidato (IN-2) |

### 3.2 Interface de transporte (CG-GATE)

```text
enviarAoLlmOficial(messages | pacote, meta)
  1. montar PedidoGovernancaContexto a partir do candidato + meta a montante
  2. resultado = governarContexto(pedido)
  3. se resultado.autorizado ≠ true → recusar transporte; devolver resultado ao chamador
  4. se autorizado → transportar APENAS resultado.pacoteAutorizado
  5. emitir CG-AUDIT
```

**Regra arquitectural:** caminhos oficiais **não** chamam o HTTP LLM contornando CG-GATE. Bypass = não conformidade (I9 / CA-093-12).

### 3.3 Interface de consumo de bloqueio (a jusante)

Chamadores (MRE orquestrador, capacidade IA, disciplina) **devem** mapear:

| `estado` CG | Acção arquitectural do consumidor |
|-------------|-----------------------------------|
| `autorizado_integral` / `autorizado_apos_isolamento` | Prosseguir com LLM usando `pacoteAutorizado` |
| `bloqueado_esclarecimento` | Emitir clarificação; **sem** LLM neste acto |
| `bloqueado_insuficiencia` | Declarar insuficiência de lastro (disciplina existente); **sem** inventar |
| `bloqueado_contaminacao` / `bloqueado_violacao_invariante` | Falha fechada / recusa segura; **sem** LLM |

O CG **não** redige a prosa (OUT-4 / X8).

### 3.4 Códigos de violação (catálogo mínimo)

| Código | Origem típica |
|--------|----------------|
| `V1_COA` | Cross-COA / COA em falta quando exigido |
| `V2_CASO` | Cross-caso / ambiguidade de caso |
| `V3_FONTE` | Fonte ∉ autorizadas ou uso ilegal no regime |
| `V4_ESTRANHO` | Contexto de sessão/histórico não pertencente |
| `V5_INSUF` | Lastro insuficiente após isolamento |
| `INV_BYPASS` | Tentativa de envio sem CG / pacote ≠ autorizado |
| `INV_INFERENCIA` | Tentativa de preencher remoção com facto sintético (detectável no pedido se reapresentado) |

---

## 4. Contrato de entrada / saída

### 4.1 `PedidoGovernancaContexto`

| Campo | Obrigatoriedade | Notas arquitecturais |
|-------|-----------------|----------------------|
| `coaAtivo` | quando COA resolvido | `{ id, nome? }` — ausência ≠ autorização de lastro de projecto |
| `casoAtivo` | quando caso resolvido | `{ casoId, titulo? }` — `titulo` nunca é chave |
| `objetivoOuAssuntoTurno` | quando disponível | Texto/sinal do pedido actual + objectivo CSC se autorizado a montante |
| `fontesLastroAutorizadas` | **sim** (lista, pode `[]`) | Enum lógico: `turno_atual`, `lfc_activos`, `csc`, `hfc_continuidade`, `hfc_prova`, `mo_consulta`, `dic`, `briefing_oficial`, `consciencia_ops`, … |
| `conteudoCandidato` | **sim** | Ver §4.3 |
| `actoChamada` | **sim** | Ex.: `mre:S3`, `mre:S5`, `llm_direct`, `conhecimento_geral`, `llm_rapido` |
| `regimeEspecial` | opcional | Flags: `rfr`, `vca_isolamento_csc`, `metaconversa`, `consulta`, … |
| `metaAuditoria` | opcional | `turnId`, `coaId`, correlação — sem PII desnecessária |

**IN-1…IN-3** aplicam-se integralmente: o chamador declara fontes; o CG verifica; não inventa autorização.

### 4.2 `ResultadoGovernancaContexto`

| Campo | Tipo lógico | Norma |
|-------|-------------|--------|
| `estado` | um dos 6 estados REQ-093 §4 | Exactamente um |
| `autorizado` | boolean | Coerente com estado |
| `pacoteAutorizado` | object \| null | Único conteúdo permitível no transporte se `autorizado` |
| `remocoes` | `RemocaoFragmento[]` | `{ fragmentoId, fonte, motivo, codigo }` |
| `motivo` | `{ codigo, mensagem }` | Legível e estável |
| `exigeEsclarecimento` | boolean | |
| `declaraInsuficienciaLastro` | boolean | |
| `violacoes` | `string[]` | Códigos §3.4 |
| `auditoriaRef` | string \| null | Id do evento emitido (quando CG-AUDIT activo) |

**OUT-1…OUT-4** e precedência de estados do REQ-093 §4 são vinculativos nesta ARQ.

### 4.3 `conteudoCandidato` e fragmentos

Para tornar V1–V4 operacionalmente auditáveis, o candidato **deve** ser representável como lista de **fragmentos**:

| Campo do fragmento | Função |
|--------------------|--------|
| `id` | Identificador estável no acto |
| `papel` | `system` \| `user` \| `assistant` \| `bloco_factos` \| `anexo` \| … |
| `texto` / `payload` | Conteúdo |
| `coaId` | Etiqueta de pertença (nullable) |
| `casoId` | Etiqueta de caso (nullable) |
| `fonte` | Uma das `fontesLastroAutorizadas` ou marcador `nao_declarada` |
| `uso` | Ex.: `facto`, `continuidade`, `prova`, `mandato_prompt`, `objecto` |

**Regra:** fragmento com `fonte = nao_declarada` ou fonte ∉ lista ⇒ falha V3 (remoção ou bloqueio).  
**Migração:** enquanto paths legacy enviam blobs não etiquetados, CG-SHADOW classifica o blob como `nao_etiquetado` / risco V4 (ver §10) — **sem** enforce nesta etapa ARQ.

### 4.4 Mapeamento estados → transporte

```text
autorizado_integral          → LLM(pacote original ≡ pacoteAutorizado)
autorizado_apos_isolamento   → LLM(pacoteAutorizado); remocoes auditadas
bloqueado_*                  → ¬LLM; consumidor trata esclarecimento/insuficiência/falha
```

---

## 5. Ponto de integração com todos os caminhos LLM

### 5.1 Fronteira canónica (única)

**Toda** chamada LLM oficial do Núcleo converge para o cliente/transporte único (hoje: adaptador → `deliberarComLlm` → `/api/ceo/deliberar`).

| Decisão ARQ | Conteúdo |
|-------------|----------|
| **D-INT-1** | CG-GATE envolve **esse** transporte (ou o adaptador imediatamente acima que é o único emissor). |
| **D-INT-2** | Paths **acima** montam candidato + meta (`fontesLastroAutorizadas`, regime, COA/caso); **não** enviam HTTP directamente. |
| **D-INT-3** | Uma chamada LLM = um `governarContexto` (inclui cada estágio MRE que chama LLM). |

### 5.2 Matriz de caminhos (transversalidade)

| Caminho | Monta candidato | Passa CG-GATE? | Sem LLM ⇒ sem CG |
|---------|-----------------|----------------|------------------|
| MRE `executarPipeline07` / estágios | Entrada MRE + prompts de estágio | **Sim**, por estágio | — |
| MRE `criarChamarLlmCeo` | Pedido do estágio | **Sim** (se for o emissor) | — |
| `montarMensagensLlm` / `llm_rapido` | Mensagens governança | **Sim** | — |
| Conhecimento geral via LLM | Mensagens knowledge | **Sim** | — |
| Futuros paths oficiais com mesmo transporte | Idem | **Sim** | — |
| Resposta local / LFC restrito sem LLM / C3 Motor / consulta registados sem LLM / clarificação local | — | **Não** (CG-POS-4) | N/A |

### 5.3 Onde **não** integrar

| Local | Motivo |
|-------|--------|
| VCA / CSC / Classificador | Momento errado; CG não é pertença pré-cadeia |
| LfcWriter / HFC emissor / MO ledger | CG não escreve |
| Speaker / CN (pós-prosa) | Tarde demais para autorizar contexto de entrada |
| Plugins HTTP genéricos fora do Núcleo | Fora do REQ-093; exige REQ/ADR próprio |

---

## 6. Relação com VCA, LFC, HFC, MO, CSC e MRE

| Fonte / camada | Papel face ao CG | O CG faz | O CG **não** faz |
|----------------|------------------|----------|------------------|
| **VCA** | Declara a montante se CSC/sessão entram em `fontesLastroAutorizadas` / `regimeEspecial.vca_isolamento_csc` | Verifica que candidato **não** reintroduz CSC quando isolamento foi declarado (CC-05) | Não recalcula veredicto VCA; não muta stores |
| **LFC** | Factos `activo` do `casoId` só se fonte `lfc_activos` autorizada | V1/V2 sobre etiquetas `coaId`/`casoId`; remove cross-caso | Não lê store LFC por iniciativa própria; não escreve |
| **HFC** | Prova / continuidade só nos usos declarados; sob RFR ≠ facto/objecto | V3/V4/I6 — remove uso ilegal de HFC residual | Não altera ficheiros HFC; não redefine ADR-023 |
| **MO** | Só com `mo_consulta` (pedido explícito a montante) | Remove decisões injectadas sem autorização (CC-07) | Não altera ledger Art. 8º |
| **CSC** | Tópico/referente/objectivo/Jobs só se VCA autorizou lastro | Remove lastro CSC se fonte não autorizada | Não chama gestores CSC; não limpa envelope |
| **MRE** | Monta entrada; chama LLM por estágio | Gate por acto; bloqueio impede estágio LLM | Não delibera; não emite Parecer; não substitui pipeline |
| **RFR** | Regime especial declarado no pedido | Aplica restrição no pacote (CC-06) | Não decide se RFR «deveria» activar-se (isso é a montante) |
| **Consciência ops** | Fonte `consciencia_ops` só se autorizada | Trata como qualquer fonte | Não consulta fila/Jobs por conta própria |
| **DIC / briefing** | Fontes explícitas se listadas | Idem | Não curadoria de dossier |

**Resumo:** a montante **autoriza fontes**; o CG **policia o pacote**; a jusante **comunica** bloqueios.

---

## 7. Fluxo de autorização / isolamento / bloqueio / esclarecimento

```text
                    PedidoGovernancaContexto
                              │
                              ▼
                    Validar contrato pedido
                    (campos mínimos, IN-*)
                              │
                              ▼
                    Expandir conteudoCandidato
                    → FragmentoContexto[]
                              │
                              ▼
              Para cada fragmento: V1 → V2 → V3 → V4
                              │
              ┌───────────────┴───────────────┐
              │ incompatível                   │ ok
              ▼                               │
        Isolável com fronteira clara?         │
         │            │                       │
        sim          não                      │
         │            │                       │
         ▼            ▼                       │
      Remover    bloqueado_contaminacao       │
      (P1/P2)    ou bloqueado_esclarecimento  │
         │       (ambiguidade CC-04)          │
         └────────────┬───────────────────────┘
                      ▼
                 Pacote residual
                      │
                      ▼
                     V5 suficiência
                      │
        ┌─────────────┼─────────────────┐
        │ insuficiente │ esclarecer      │ suficiente
        ▼              ▼                 ▼
 bloqueado_         bloqueado_     remocoes?
 insuficiencia      esclarecimento    │
                                      ├─ não → autorizado_integral
                                      └─ sim → autorizado_apos_isolamento
```

### 7.1 Regras de decisão (operacionais)

| Condição | Estado |
|----------|--------|
| Violação de invariante de processo (pedido forçado sem CG, etc.) | `bloqueado_violacao_invariante` |
| Contaminação cross-COA/caso **inseparável** do blob | `bloqueado_contaminacao` |
| Ambiguidade de caso/COA/fonte (CC-04, deixis) | `bloqueado_esclarecimento` |
| Remoções OK mas lastro necessário em falta | `bloqueado_insuficiencia` |
| Remoções OK e lastro basta | `autorizado_apos_isolamento` |
| Zero remoções materiais | `autorizado_integral` |

Precedência: conforme REQ-093 §4.

### 7.2 Proibição de «reparação»

Em **qualquer** ramo: **proibido** gerar texto substituto factual para o removido (P4, I7, X9). O vazio ou é aceitável (seguir com residual) ou bloqueia.

---

## 8. Estratégia de auditoria

### 8.1 Princípios

| ID | Princípio |
|----|-----------|
| **A1** | Cada acto `governarContexto` em produção (modo enforce) gera evidência auditável. |
| **A2** | Auditoria de **governança de contexto** ≠ escrita de LFC/MO/HFC/CSC. |
| **A3** | Preferir **Trilha Auditável** (REQ-088) para eventos de negócio; logs técnicos só operacionais. |
| **A4** | Registar o **mínimo necessário**: estado, códigos, ids de fragmentos removidos, `actoChamada`, `coaId`/`casoId`, hashes — evitar dump integral de prompts com dados sensíveis em claro quando a Trilha já tiver ref. |

### 8.2 Evento lógico `cg.autorizacao`

| Campo | Conteúdo |
|-------|----------|
| `evento` | `cg.autorizacao` |
| `actoChamada` | id do acto |
| `estado` / `autorizado` | resultado |
| `violacoes` / `remocoes[].codigo` | |
| `coaId` / `casoId` | âmbito declarado |
| `fontesDeclaradas` | lista |
| `modo` | `sombra` \| `enforce` |
| `timestamp` | ISO-8601 |

### 8.3 Uso da auditoria

- VAL/CA: provar que LLM recebeu só `pacoteAutorizado` (CA-093-9).  
- Diagnóstico de contaminação (CC-01…10) sem reabrir stores.  
- Detecção de bypass (ausência de evento com transporte LLM = anomalia em enforce).

### 8.4 Modo sombra

Em migração (§10), eventos `modo=sombra` com `teriaBloqueado` / `remocoesHipoteticas` — **sem** efeito no transporte.

---

## 9. Invariantes e fronteiras de responsabilidade

### 9.1 Invariantes arquitecturais (REQ-093 I1–I9)

Mantidos integralmente: **I1** disponível≠autorizado; **I2** uma passagem por envio; **I3** enviado ⊆ autorizado; **I4** isolamento COA; **I5** isolamento caso; **I6** RFR; **I7** sem inferência de preenchimento; **I8** read-only lastro; **I9** bypass = defeito.

### 9.2 Fronteiras (resumo X1–X9)

| CG | Vizinhos |
|----|----------|
| Autoriza/isola/bloqueia **pacote** | VCA autoriza **lastro de sessão** |
| Read-only | Writers LFC/MO/HFC/CSC |
| Não delibera | MRE delibera |
| Não prosa final | Speaker / CN / disciplina |
| Não inventa fontes | Chamador declara `fontesLastroAutorizadas` |

### 9.3 Matriz RACI lógica (acto LLM)

| Actividade | VCA | Montagem (MRE/IA) | **CG** | Transporte | Speaker/CN |
|------------|-----|-------------------|--------|------------|------------|
| Decidir pertença CSC | **R** | C | I | I | I |
| Declarar fontes do pacote | C | **R** | C | I | I |
| Autorizar pacote pré-LLM | I | C | **R** | C | I |
| Enviar HTTP LLM | I | I | C | **R** | I |
| Prosa / lacuna ao utilizador | I | C | C (sinal) | I | **R** |

R = responsável; C = consultado; I = informado.

---

## 10. Plano de migração (sem alterar comportamento nesta etapa)

Esta ARQ **não** activa enforce. Comportamento runtime actual permanece até IMP futura com fases explícitas.

| Fase | Nome | Comportamento | Critério de saída |
|------|------|---------------|-------------------|
| **M0** | Contrato (esta ARQ) | Documentação apenas; **zero** código | Homologação CTO do ARQ-093 |
| **M1** | Sombra | IMP futura: CG-SHADOW no CG-GATE; calcula resultado; emite `cg.autorizacao` sombra; **envia pacote original inalterado** | Paridade de paths instrumentados; zero regressão funcional |
| **M2** | Etiquetagem | Paths passam a emitir fragmentos + `fontesLastroAutorizadas` reais; sombra continua | Cobertura de etiquetagem nos paths MRE + directo |
| **M3** | Enforce opt-in | Flag/config: enforce só em ambientes/actos escolhidos | CA-093 selectivos verdes |
| **M4** | Enforce total | CG-GATE bloqueia/isola em produção; bypass = falha | CA-093-1…12 |

**Regras de migração:**

| ID | Regra |
|----|--------|
| **MIG-1** | M0 (agora): **proibido** alterar código ou comportamento. |
| **MIG-2** | M1 não pode mudar prosa, destino, Jobs, LFC, HFC, MO, CSC. |
| **MIG-3** | Enforce (M3+) só após evidência sombra + etiquetagem suficiente (anti falso positivo I4/I5). |
| **MIG-4** | Nenhuma fase reabre contratos VCA/LFC/RFR/MRE — apenas encaixa o gate. |
| **MIG-5** | Rollback de enforce = voltar a sombra; auditoria permanece. |

---

## 11. Fora do escopo desta ARQ

* Código, IMP-093, testes, flags em produção.  
* Emenda a REQ-093, ADR-021–023, ARQ-026, ARQ-092.  
* Orquestração de compressão/orçamento de tokens como produto.  
* LLM fora do transporte oficial do Núcleo.  
* Relatórios multi-COA.

## 12. Riscos arquitecturais e mitigações

| Risco | Mitigação |
|-------|-----------|
| Falso positivo em blobs não etiquetados | MIG etiquetagem antes de enforce; sombra mede taxa |
| Duplicação conceptual VCA↔CG | §1.2 / §6 — momentos e decisões distintos |
| Latência no gate | CG puro sobre fragmentos já montados; sem I/O de stores |
| Chamador omite fontes | IN-3 + V3; lista vazia não autoriza lastro implícito |
| Rehidratação inter-estágios MRE (CC-09) | CG por acto; sem cache que reautorize removidos |

## 13. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Requisito | **REQ-093** v0.1 (fonte exclusiva) |
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; VIS-007; ADR-006; ADR-010; ADR-015 |
| Consumidos | ARQ-026; ARQ-092; ADR-019; ADR-021–023; REQ-039; REQ-049; REQ-059; REQ-065; REQ-087; REQ-088 |
| Implementação | — (proibida neste acto) |
| Testes | — (proibidos neste acto) |

## 14. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 15/09/2026 | Engenheiro (Cursor), sob despacho do Usuário | Criação ARQ-093 a partir do REQ-093 | Fechar arquitectura do Context Governor para revisão CTO | Em análise |
