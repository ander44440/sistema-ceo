# ANL-006 — Histórico Conversacional no Classificador de Intenção

> **Status:** Em análise (aguardando revisão/aprovação do CTO).  
> **Tipo:** ANL (ADR-005) — preparatório, **não normativo**.  
> **Data:** 03/08/2026.  
> **Capacidade:** CAP-07 — Comunicação (Compreensão Semântica e Contextual — 1ª melhoria perceptível sob EIC).  
> **Normas consultadas (somente leitura):** CON-001; ADR-006; ADR-015; ARQ-018 §5.1; REQ-057 / IMP-057 (estado actual); ARQ-019 / IMP-058; ARQ-017; ARQ-014 (NCS); PX-003; `docs/EIC/` (00–15).  
> **Origem:** Comando do patrocinador — Análise Técnica da implementação do Histórico Conversacional no Classificador; diagnóstico EIC de Compreensão Semântica e Contextual.  
> **Efeito:** Não altera código, prompts, ARQ/REQ vigentes nem comportamento. Conclusões preparam a abertura de **REQ** (e emenda ARQ se o CTO o exigir).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Análise da melhor estratégia para incorporar **histórico conversacional recente** ao Classificador de Intenção (ARQ-018 §5.1), sem degradar C1–C4, limiar 0,55, Gate, Motor, NCS nem a EIC. |
| **Por que existe?** | O sinal «Histórico recente (opcional)» já está previsto na ARQ-018 para **desambiguar C2 vs C1** sem forçar C3; no runtime actual o Classificador só consome texto + `frenteActiva` boolean — follow-ups elípticos falham ou pedem reexplicação (anti NA-EIC-11 / CON Art. 9º.2). |
| **Para quem existe?** | CTO (REQ); Engenheiro (IMP futuro); patrocinador (melhoria perceptível no uso diário MG2). |
| **Como medir sucesso desta ANL?** | (1) Estratégia escolhida explícita; (2) invariantes listados; (3) REQ sugerido com fronteiras claras; (4) sem implementação nesta etapa. |

---

## 1. Objetivo

Definir a estratégia de engenharia para disponibilizar histórico conversacional ao processo de classificação de intenção, **conforme ARQ-018 §5.1**, de forma a:

1. melhorar follow-ups curtos / deixis («isso», «continua», «e o outdoor?») na **rota C1↔C2**;  
2. **preservar** limiar `LIMIAR_CONFIANCA = 0,55`, enum C1–C4, ponto único de classificação (EIC V1);  
3. **não interferir** em Continuidade do Gate (ARQ-019), Motor (ARQ-017), NCS (ARQ-014);  
4. permanecer alinhado à EIC (CAP-07; Gates G-EIC-*; ADR-006).

---

## 2. Limites

### 2.1 Dentro do perímetro desta análise / futuro REQ

* Extensão do **contrato de contexto** do Classificador (`ContextoClassificacao`) com histórico **opcional**.  
* Política determinística de **desambiguação C1↔C2** (e clarificação → C2 quando lastro + deixis o permitirem).  
* Janela curta de turnos; caps de tamanho; ausência de I/O no Classificador.  
* Passagem do histórico **já existente** na UI/Núcleo (`entrada.historico`) até `primeiroPassoClassificar` / `classificar`.

### 2.2 Fora do perímetro (explícito)

| ID | Fora |
|----|------|
| L1 | Alterar limiar 0,55 ou regras canónicas C1–C4 (E2.1–E2.3) sem emenda REQ/ARQ. |
| L2 | Usar histórico para **promover a C3** ou `permiteJob: true` sem verbo de execução na mensagem actual (CQ1 ARQ-018). |
| L3 | Classificação por LLM no limiar do Classificador (ARQ-018 NO5; CQ2). |
| L4 | Redesign do Gate, Motor, NCS, MRE, CN ou Fila. |
| L5 | Persistência nova de histórico (DB); o V1 usa o array já passado pela Conversa/Centro. |
| L6 | Detector completo de «mudança de assunto» (fase posterior). |
| L7 | Criar CAP nova — permanece CAP-07. |
| L8 | Implementação / prompts / comportamento nesta ANL. |

### 2.3 Estado actual (baseline)

| Peça | Comportamento |
|------|----------------|
| `classificar(texto, contexto)` | `contexto` = `{ frenteActiva?: boolean }` apenas |
| Núcleo | Já recebe `historico` da UI; **não** o passa ao Classificador |
| Destinos C1/C2 | Consomem `historico` para prosa/LLM **após** classificação |
| Continuidade Gate | Corre **antes** do Classificador; salta classificação quando aplica |
| ARQ-018 §5.1 | «Histórico recente (opcional) — Desambiguar C2 vs C1 — sem forçar C3» |
| ARQ-018 §4.4 | Cada mensagem é reclassificada; mudança de assunto = próxima mensagem do zero |

---

## 3. Dependências

| Dependência | Papel |
|-------------|--------|
| **ARQ-018** | Autoriza o sinal; define uso (C2 vs C1; nunca forçar C3) |
| **REQ-057 / IMP-057** | Contrato actual; regressão obrigatória; ponto único de classificação |
| **ARQ-019 / IMP-058** | Precedência Gate; Classificador não compete com Continuity |
| **ARQ-017 / Motor** | Destino C3 inalterado; Classificador sem efeitos |
| **ARQ-014 / NCS** | Só dentro do MRE pós-C2; não recebe este sinal |
| **UI Conversa/Centro** | Fonte do `historico` in-memory |
| **EIC** | CAP-07; G-EIC-D + ADR-006 antes de IMP; SC-* novos no `05` |
| **ADR-015** | Filtro: uso diário MG2 (follow-ups na frente activa) |

---

## 4. Alternativas consideradas

| ID | Alternativa | Veredicto |
|----|-------------|-----------|
| **A** | Concatenar histórico ao texto da mensagem antes de `classificar` | **Rejeitada** — polui léxico; risco de falso C3/C4 por eco de turnos anteriores |
| **B** | Estender `ContextoClassificacao` com histórico estruturado + regras DET de desambiguação | **Recomendada (núcleo)** |
| **C** | Pré-passo «resolução de deixis» que reescreve a mensagem e depois classifica texto só | **Complementar opcional (fase 2)** — útil, mas maior risco de alterar percepção; só após B estável |
| **D** | Classificador LLM com histórico | **Rejeitada** nesta onda — custo, não-determinismo, conflita com pureza/testabilidade IMP-057 |
| **E** | Só melhorar clarificação situacional (sem histórico no score) | **Insuficiente sozinha** — não realiza o sinal ARQ-018 §5.1; pode ser **RF auxiliar** no mesmo REQ |

**Escolha:** **B** como V1; **E** como RF de clarificação ancorada; **C** como evolução condicionada a evidência.

---

## 5. Arquitectura proposta (lógica — não normativa ainda)

### 5.1 Princípio

O Classificador permanece **função pura**, **sem I/O**, **sem efeitos**. O histórico é um **sinal opcional de contexto**, no mesmo papel lógico de `frenteActiva`, com política **mais restritiva** que a mensagem actual.

```text
                    ┌─────────────────────────────┐
                    │  Continuidade Gate (IMP-058) │  ← inalterado; se interceptar, fim
                    └──────────────┬──────────────┘
                                   │ classificador
                                   ▼
UI historico ──► Núcleo monta ContextoClassificacao
                 { frenteActiva, historicoRecente? }
                                   │
                                   ▼
              classificar(textoActual, contexto)     ← ponto único (EIC V1)
                 │
                 ├─ atalhos E2.1 / E2.2 / E2.3 (mensagem actual)  ← prioridade
                 ├─ léxico + empates (C1–C4)                     ← intactos
                 └─ [NOVO] desambiguação por histórico           ← só C1↔C2 / clarificação
                                   │
                                   ▼
                         SaidaClassificador (contrato §5.3)
```

### 5.2 Disponibilização do histórico

| Passo | Responsável | Contrato proposto |
|-------|-------------|-------------------|
| 1 | UI (já existe) | `historico: [{ papel, texto }, …]` |
| 2 | Núcleo | Extrair janela **anterior** à mensagem actual; normalizar papéis (`usuario` / `ceo`) |
| 3 | Núcleo → Classificador | `contexto.historicoRecente` opcional (array curto ou resumo DET) |
| 4 | Classificador | Se ausente/`[]` → **comportamento idêntico ao actual** (compatibilidade total) |

**Não** ler store interno no Classificador; **não** importar Continuidade/Motor/NCS.

### 5.3 Quantos turnos (recomendação V1)

| Parâmetro | Valor recomendado V1 | Justificativa |
|-----------|----------------------|---------------|
| **Janela** | Últimas **4 mensagens** do histórico **antes** da mensagem actual (≈ 2 pares user/ceo) | ARQ: «recente»; suficiente para deixis; alinhado à ordem de grandeza do `contextoImediato` CN (1–2) sem chegar aos 12 do prompt LLM |
| **Cap por mensagem** | **200 caracteres** (truncar com marca) | Evitar score por prosa longa do CEO |
| **Cap total** | **800 caracteres** normalizados | Pior caso constante |
| **Mínimo para activar** | ≥ 1 mensagem anterior **ou** deixis detectada na actual | Sem histórico → path actual |
| **Fora de V1** | Janelas ≥ 8–12 no Classificador | Reserva ao LLM/MRE; ruído e custo sem ganho de rota |

Valores exactos fecham-se no REQ (números acima = proposta de engenharia).

### 5.4 Política de uso do histórico (invariantes)

| # | Invariante |
|---|------------|
| I1 | Histórico **não** força C3 nem `permiteJob`. |
| I2 | Histórico **não** altera limiar 0,55; abaixo do limiar continua clarificação (salvo RF explícito de «clarificação → C2» com critérios fechados). |
| I3 | Atalhos E2.1 (C3) / E2.2–E2.3 avaliam a **mensagem actual** primeiro; histórico não os anula. |
| I4 | Uso principal: **empate ou ambiguidade C1↔C2** quando há frente activa + referência implícita (ARQ §5.2). |
| I5 | Boost de score C2, se existir, é **limitado** (ex. Δ ≤ 0,10) e auditável em `razaoCurta`. |
| I6 | C4 permanece por léxico operacional da mensagem actual (histórico não «lista jobs» por eco). |
| I7 | Sem histórico / histórico vazio ⇒ bit-a-bit o comportamento homologado IMP-057. |

### 5.5 Desempenho

| Medida | Efeito |
|--------|--------|
| Só DET (regex/léxico já no módulo) | Sem latência de rede/LLM no limiar |
| Janela + caps fixos | Tempo O(1) / O(K) com K≤4 |
| Short-circuit | Se E2.1/E2.2/E2.3 já decidiram, **não** processar histórico |
| Opcionalidade | Contexto sem campo = zero custo adicional |
| Sem I/O | Mantém fronteira IMP-057 E6 |

---

## 6. Fluxo proposto

```text
1. Utilizador envia mensagem M (Conversa/Centro)
2. Núcleo normaliza { texto: M, historico: H }
3. decidirInterceptacaoContinuidade(M)
     ├─ continuidade / clarificação Gate → return (Classificador NÃO corre)
     └─ classificador → 4
4. coa = obterCoaAtivo()
5. historicoRecente = seleccionarJanela(H, M)   // K≤4, caps
6. rota = primeiroPassoClassificar(M, {
     frenteActiva: Boolean(coa),
     historicoRecente            // opcional
   })
7. classificarIntencao(M, classificacao)       // adapter; sem reclassificar (EIC V1)
8. C2/C3 → Consciência (inalterado)
9. executarPorDestino → … → CN
```

**Gate:** passos 3 intactos.  
**Motor:** só se destino C3 após classificação — inalterado.  
**NCS:** só se caminho MRE — inalterado.

---

## 7. Agrupamentos de requisitos (sugestão para a REQ)

| Grupo | Conteúdo sugerido | Prioridade |
|-------|-------------------|------------|
| **G1 — Contrato** | Estender `ContextoClassificacao`; ausência = comportamento actual; campos e caps | P0 |
| **G2 — Política** | Regras DET de desambiguação C1↔C2; proibição C3 via histórico; `razaoCurta` | P0 |
| **G3 — Integração Núcleo** | Passar janela desde `executar`; Continuidade antes; um só `classificar` | P0 |
| **G4 — Clarificação ancorada (opcional no mesmo REQ)** | Mensagem de clarificação cita frente/último objectivo se conhecidos | P1 |
| **G5 — Testes** | Regressão IMP-057; SC anáfora/elipse; Gate + Motor + NCS intocados (fronteiras) | P0 |
| **G6 — EIC / VAL** | Mapear CA-EIC / SC-*; evidência homologação | P1 |
| **G7 — Fase 2 (fora do 1º REQ ou RF futuro)** | Resolução de deixis por reescrita (Alt. C); topic shift | P2 |

**ADR nova:** provavelmente **não** necessária se o REQ se limitar a realizar o sinal já previsto na ARQ-018 §5.1.  
**Emenda ARQ-018:** só se o CTO quiser tornar o histórico **obrigatório** ou alterar a matriz §5.2 — não é pré-requisito da V1 opcional.

---

## 8. Vantagens

1. Realiza sinal **já homologado** na ARQ-018 (dívida técnica explícita).  
2. Melhoria **perceptível** no MG2 (follow-ups na frente) sem mudar identidade C1–C4.  
3. Compatibilidade retroactiva forte (sinal opcional).  
4. Mantém Classificador testável, puro e rápido.  
5. Alinha CON-001 / NA-EIC-11 (menos «reexplica o outdoor»).  
6. Não toca Gate / Motor / NCS — superfície de risco pequena.  
7. Coerente com EIC V1 (um ponto de classificação; adapter reutiliza saída).

---

## 9. Riscos de engenharia

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Histórico promove falso C3 | I1: proibição normativa no REQ; testes NA |
| R2 | Eco de prosa do CEO enviesa C2/C4 | Caps; usar sobretudo turnos `usuario` + âncoras curtas; não pontuar C4 por histórico |
| R3 | Regressão IMP-057 | Suite completa + casos «sem histórico» idênticos |
| R4 | Interferência com Gate | Não alterar `decidirInterceptacaoContinuidade`; testes IMP-058 |
| R5 | Dupla interpretação (Classificador vs CN `detectarPedidoAmbiguo`) | CN permanece prosa; Classificador decide rota; documentar fronteira |
| R6 | Janela grande / custo | K=4 + caps; short-circuit |
| R7 | Expectativa de «memória longa» | Comunicar: V1 = desambiguação local, não CSC completa |
| R8 | Implementar sem G-EIC-D / ADR-006 | EIC R2; esta ANL não autoriza IMP |

---

## 10. Impacto esperado

| Área | Impacto V1 |
|------|------------|
| Utilizador (MG2) | Menos clarificação em follow-ups; melhor C2 quando a frente já está no fio |
| Classificador | +sinal opcional; `razaoCurta` pode mencionar «histórico» |
| Continuidade Gate | **Nenhum** (precedeência preservada) |
| Motor / Jobs | **Nenhum** directo; C3 continua a exigir sinais na mensagem actual |
| NCS | **Nenhum** |
| CN / Speaker | Indireito positivo (melhor rota → melhor prosa) |
| Painel / Fila | Nenhum |
| Performance | Negligenciável (DET, K≤4) |
| Comportamento sem histórico | **Idêntico** ao homologado |

---

## 11. Estratégia recomendada

### 11.1 Decisão

Adoptar **Alternativa B** (contexto estruturado + política DET restrita a C1↔C2), com:

* janela **4** mensagens anteriores, caps de caracteres;  
* opcionalidade total;  
* proibição absoluta de C3/Job via histórico;  
* limiar 0,55 intacto;  
* integração só no Núcleo → `primeiroPassoClassificar` (ponto único).

### 11.2 Ordem sugerida (ADR-006)

```text
ANL-006 (este doc) → aprovação CTO
  → REQ-0xx (Histórico conversacional no Classificador / CAP-07)
  → (emenda ARQ-018 só se CTO exigir obrigatoriedade)
  → G-EIC-C / G-EIC-D (EIC)
  → IMP-0xx (E1 contrato → E2 regras → E3 Núcleo → E4 testes → E5 VAL)
  → Homologação (SC-* + regressão IMP-057/058/059)
```

### 11.3 Critérios de aceite sugeridos (para a REQ)

1. Mensagem sem histórico: saídas iguais à baseline IMP-057 (amostra fixa).  
2. Follow-up elíptico com frente + histórico de projecto → C2 (não C1; não C3).  
3. «Implementa X» na mensagem actual → C3 (histórico irrelevante).  
4. Ambíguo sem lastro → clarificação / não-C3 (SC-05 preservado).  
5. Gate pendente + «Aprovado» → Continuidade; Classificador não corre.  
6. NCS / Motor: testes de fronteira sem novas importações no módulo Classificador.  
7. Limiar permanece 0,55.

---

## 12. Compatibilidade com ARQ-018 e EIC

### 12.1 ARQ-018

| Clause | Compatibilidade |
|--------|-----------------|
| §5.1 Histórico recente opcional | **Realiza** o sinal previsto |
| §5.1 «sem forçar C3» | **Invariante I1** |
| §5.2 Empate C1/C2 + frente | Histórico reforça o critério já escrito |
| §4.4 Reclassificar do zero | Mantém-se: cada mensagem classifica-se de novo; histórico é **sinal**, não «modo» persistente |
| CA1–CA10 / CQ1–CQ4 | Preservados se I1–I7 forem REQ |
| Pureza / sem Job no classificar | Preservado |

### 12.2 EIC

| Elemento | Compatibilidade |
|----------|-----------------|
| CAP-07 | Sem CAP nova |
| EIC V1 (ponto único) | Histórico entra **antes**/dentro do único `classificar`; adapter não reclassifica |
| Princípio «nunca perder o contexto» | Avanço concreto |
| G-EIC-D | Obrigatório antes de IMP |
| SC-01…05 | Regressão; novos SC de deixis no `05` |
| NCS ≠ Intenção | Mantido |
| Roadmap M8 | Só após Gate |

---

## 13. Conclusão

A melhor estratégia para a **primeira melhoria perceptível** da Inteligência Conversacional, no eixo Classificador, é **activar o sinal opcional de histórico recente já previsto na ARQ-018**, com janela curta e política **estritamente limitada a desambiguar C1↔C2**, sem tocar limiar, C3/Job, Gate, Motor ou NCS.

Esta ANL está **pronta para abertura da REQ** correspondente (após aprovação do CTO).

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Análise técnica inicial | Aguarda revisão CTO |

---

**Estado:** Análise concluída (rascunho engenheiro). **Sem implementação.**  
**REQ derivada:** [`REQ-061-historico-conversacional-classificador.md`](../requirements/REQ-061-historico-conversacional-classificador.md) (Em análise v0.1 — 03/08/2026).  
**ARQ derivada:** [`ARQ-022-historico-conversacional-classificador.md`](../architecture/ARQ-022-historico-conversacional-classificador.md) (Em análise v0.1 — 03/08/2026).  
**Próximo passo oficial:** Homologação REQ-061 + ARQ-022 → IMP (após Gates ADR-006 / EIC).
