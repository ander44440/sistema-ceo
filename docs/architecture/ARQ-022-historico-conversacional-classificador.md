# ARQ-022 — Histórico Conversacional no Classificador

> **Status: Em análise v0.1** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-022.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; ADR-015; ADR-006; **ARQ-018** (Classificação de Intenção — vigente, não substituída); **REQ-061**; REQ-057 / IMP-057; ARQ-019 / REQ-058; ARQ-017 / REQ-056; ARQ-014 (NCS); EIC (`docs/EIC/`).  
> Base analítica: **ANL-006**.  
> **Finalidade:** arquitectura da integração do **histórico conversacional recente opcional** no Classificador de Intenção, realizando ARQ-018 §5.1 **sem** alterar a arquitectura homologada do limiar C1–C4.  
> **Gate:** aguarda homologação. **Próximo artefacto:** **IMP** (após Gates ADR-006 / EIC aplicáveis).  
> **Sem implementação** de código, prompts ou comportamento neste documento.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Extensão arquitectural **mínima** do contrato de contexto do Classificador (ARQ-018) para consumir histórico conversacional recente **opcional**, só para desambiguar C1↔C2. |
| **Por que existe?** | O sinal ARQ-018 §5.1 está previsto e não realizado no IMP-057; follow-ups elípticos degradam a experiência (REQ-061; ANL-006). |
| **Para quem existe?** | Patrocinador (fio MG2); Núcleo (monta contexto); Classificador (desambigua); CTO/Engenheiro (IMP/VAL). |
| **Como medir sucesso?** | (1) Histórico opcional no contexto; (2) janela 4 / 200 / 800; (3) sem influência em C3/Job; (4) limiar 0,55 e C1–C4 intactos; (5) sem histórico = IMP-057; (6) Gate antes do Classificador; (7) Motor/NCS/Jobs inalterados; (8) CA da REQ-061 verificáveis. |

---

## 1. Visão arquitectural

### 1.1 Princípio

Esta ARQ **não** cria um novo classificador, nem um segundo limiar, nem um motor semântico paralelo.  
**Realiza** o sinal já homologado na ARQ-018 §5.1 dentro do **único** Classificador canónico (IMP-057 / EIC V1).

```text
Arquitectura homologada (ARQ-018)          +  Extensão ARQ-022 (mínima)
─────────────────────────────────             ──────────────────────────
Mensagem → Classificar → C1|C2|C3|C4|CLAR     Contexto += historicoRecente?
              ↑                                      ↑
         frenteActiva?                    (opcional, janela curta, só C1↔C2)
```

### 1.2 O que permanece (invariante de sistema)

| Peça | Estado |
|------|--------|
| Enum C1–C4 + clarificação | **Preservado** (ARQ-018 / REQ-057) |
| `LIMIAR_CONFIANCA = 0,55` | **Preservado** |
| Continuidade Gate **antes** do Classificador | **Preservado** (ARQ-019) |
| Motor de Execução | **Inalterado** (ARQ-017) |
| NCS | **Inalterado** (ARQ-014) |
| Jobs / Fila | **Inalterados** (REQ-045/060) |
| Um só ponto de classificação canónica | **Preservado** (EIC V1) |
| Classificador sem efeitos laterais | **Preservado** |

### 1.3 O que se acrescenta

1. Campo opcional de histórico no **contrato de contexto** do Classificador.  
2. Função de **preparação de janela** (Núcleo ou helper puro adjacente).  
3. Política DET de **desambiguação C1↔C2** que consome esse campo.  
4. *(Opcional)* clarificação ancorada no destino de clarificação — prosa, não reclassificação.

---

## 2. Relação com a ARQ-018

| Clause ARQ-018 | Papel desta ARQ |
|----------------|-----------------|
| §5.1 Histórico recente (opcional) | **Especifica** contrato, janela, política e integração |
| §5.1 «sem forçar C3» | **Invariante arquitectural** I-C3 |
| §5.2 Empate C1/C2 + frente | Histórico **reforça** este ramo; não cria ramos novos de classe |
| §4.4 Reclassificar do zero | Mantém-se: cada mensagem classifica-se de novo; histórico é **sinal do turno**, não «modo» de sessão no Classificador |
| §5.3 Contrato de saída | **Inalterado** (`classe`, `confianca`, `razaoCurta`, `destino`, `usaFrenteActiva`, `permiteJob`) |
| CQ4 Um classificador | **Confirmado** — extensão do mesmo módulo |

**ARQ-018 permanece a norma-mãe do Classificador.** ARQ-022 é **complemento de integração do sinal §5.1**, não substituto.

---

## 3. Componentes envolvidos

| ID | Componente | Responsabilidade nesta ARQ | Altera contrato? |
|----|------------|----------------------------|------------------|
| **C-UI** | Conversa / Centro | Já fornece `historico[]` ao Núcleo | Não |
| **C-NUC** | `executiveEngine.executar` | Após Gate: monta `ContextoClassificacao` com janela; chama **um** `primeiroPassoClassificar` | Só passagem de contexto |
| **C-PREP** | Preparador de janela (puro) | `seleccionarHistoricoRecente(H, M)` → máx. 4 msgs, caps 200/800 | Novo helper (sem I/O) |
| **C-CLS** | `classificadorIntencao` (`classificar` / regras) | Consome `historicoRecente?` só em desambiguação C1↔C2 | Extensão de `ContextoClassificacao` |
| **C-ADP** | `classificarIntencao` (adapter) | Continua a receber `saidaPrevia`; **não** reclassifica | Não |
| **C-GATE** | Continuidade Gate | Precedência inalterada | **Não** |
| **C-COA** | Consciência Operacional | Após classificação C2/C3 | **Não** |
| **C-MOT** | Motor | Destino C3 | **Não** |
| **C-NCS** | NCS (MRE) | Pós-deliberação | **Não** |
| **C-JOB** | Fila / Jobs | Publicação | **Não** |
| **C-CN** | Conversação Natural | Prosa pós-destino | Não (salvo RF15 clarificação ancorada no destino CLAR) |

---

## 4. Ponto de integração

### 4.1 Único ponto de decisão

```text
primeiroPassoClassificar(texto, contexto)
        │
        └─► classificar(texto, contexto)   ← ÚNICO ponto de decisão de classe
                 │
                 └─► SaidaClassificador
```

O adapter `classificarIntencao(texto, saidaPrevia)` **não** é ponto de decisão: só mapeia capacidade.

### 4.2 Onde injectar o histórico

| Camada | Acção |
|--------|--------|
| UI → Núcleo | Já envia `historico` (inalterado) |
| Núcleo **antes** de `primeiroPassoClassificar` | `historicoRecente = C-PREP(historico, texto)` |
| Argumento `contexto` | `{ frenteActiva, historicoRecente? }` |
| **Proibido** | Segundo `classificar(...)`; concatenar histórico ao `texto` como input principal de léxico |

### 4.3 Relação com o Gate

```text
decidirInterceptacaoContinuidade(texto)
  ├─ continuidade | clarificação_gate  → return (Classificador NÃO corre)
  └─ classificador → monta contexto (+ histórico) → primeiroPassoClassificar
```

O histórico **não** participa da decisão de interceptação do Gate.

---

## 5. Estruturas de dados

### 5.1 Mensagem de histórico (entrada UI — existente)

```text
HistoricoMsg = {
  papel: "usuario" | "ceo" | "assistente" | string
  texto: string
  // outros metadados UI ignorados pelo Classificador
}
```

### 5.2 Item da janela (após C-PREP)

```text
HistoricoRecenteItem = {
  papel: "usuario" | "ceo"   // normalizado; assistente → ceo
  texto: string              // truncado ≤ 200 chars
}
```

### 5.3 Contexto de classificação (extensão)

```text
ContextoClassificacao = {
  frenteActiva?: boolean           // ARQ-018 / IMP-057 — preservado
  historicoRecente?: HistoricoRecenteItem[] | null  // ARQ-022 — opcional
}
```

**Semântica de ausência:**
- campo omitido, `null` ou `[]` ⇒ path **idêntico** a IMP-057 (REQ-061 RF1–RF2).

### 5.4 Parâmetros canónicos da janela V1

| Parâmetro | Valor | Origem |
|-----------|-------|--------|
| `JANELA_MAX_MSGS` | **4** | REQ-061 RF3 |
| `CAP_CHARS_MSG` | **200** | REQ-061 RF4 |
| `CAP_CHARS_TOTAL` | **800** | REQ-061 RF5 |
| Inclusão da mensagem actual | **Não** (só anteriores) | REQ-061 RF3 |

### 5.5 Saída do Classificador

**Inalterada** (ARQ-018 §5.3).  
Se o histórico contribuir para C1↔C2, `razaoCurta` **pode** mencionar o sinal (REQ-061 RF14).

---

## 6. Fluxo de execução

### 6.1 Fluxo lógico completo

```text
Utilizador → Conversa/Centro
              │
              ▼
     executiveEngine.executar({ texto: M, historico: H })
              │
              ▼
     [1] Continuidade Gate (ARQ-019)
              ├─ intercepta → fim (sem Classificador)
              └─ segue
              │
              ▼
     [2] coa = obterCoaAtivo()
         historicoRecente = seleccionarHistoricoRecente(H, M)
              │
              ▼
     [3] primeiroPassoClassificar(M, {
           frenteActiva: Boolean(coa),
           historicoRecente   // opcional
         })
              │
              ▼
     [4] classificar (único) → SaidaClassificador
              │
              ▼
     [5] classificarIntencao(M, saida)  // adapter, sem reclassificar
              │
              ▼
     [6] C2/C3 → Consciência (ARQ-020) — inalterado
              │
              ▼
     [7] executarPorDestino → Motor | MRE/NCS | caps | CLAR | C1
              │
              ▼
     [8] CN / resposta ao utilizador
```

### 6.2 Sequência operacional dentro de `classificar`

Ordem arquitectural obrigatória:

| Passo | Operação | Histórico? |
|-------|----------|------------|
| S0 | Normalizar mensagem actual `M` | Não |
| S1 | Atalhos E2.1 / E2.2 / E2.3 (mensagem actual) | **Não consome** histórico; se decidirem, short-circuit |
| S2 | Léxico + scores C1–C4 + empates REQ-057 | Mensagem actual (+ `frenteActiva` como hoje) |
| S3 | **Desambiguação C1↔C2 por histórico** (só se `historicoRecente` não vazio **e** ambiguidade/empate C1↔C2 ou clarificação elegível) | Sim |
| S4 | Aplicar limiar 0,55 / `precisaClarificacao` | Sem alteração da constante |
| S5 | `montarSaida` — contrato §5.3 | `permiteJob` nunca true por S3 |

**Proibições em S3:**
- não alterar scores de C3/C4 por histórico;
- não definir `permiteJob` a partir do histórico;
- não concatenar a janela a `M` para reentrada no léxico C3.

---

## 7. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I-OPT** | Histórico é **apenas contexto opcional**. |
| **I-ONE** | Classificador canónico é o **único** ponto de decisão de classe. |
| **I-GATE** | Gate / Continuidade permanece **anterior** ao Classificador. |
| **I-MOT** | Motor permanece **inalterado**. |
| **I-NCS** | NCS permanece **inalterado**. |
| **I-JOB** | Jobs / Fila permanecem **inalterados**; Classificador não publica Jobs. |
| **I-LIM** | Limiar **0,55** preservado. |
| **I-C14** | Enum e regras base **C1–C4** preservados (REQ-057). |
| **I-C3** | Histórico **nunca** força nem favorece C3 / `permiteJob`. |
| **I-BASE** | Sem histórico ⇒ comportamento **bit-compatível** com IMP-057 (amostra de regressão). |
| **I-PURE** | Classificador + preparador de janela: **sem I/O**, sem SDK, sem Gate/Motor/NCS. |
| **I-WIN** | Janela V1: máx. **4** msgs · **200**/msg · **800** total. |

---

## 8. Compatibilidade

| Artefacto | Compatibilidade |
|-----------|-----------------|
| **ARQ-018** | Complemento §5.1; não revoga classes, fluxo §4, proibições §5.4 |
| **REQ-061** | Esta ARQ especifica a realização arquitectural dos RF/RNF/RST |
| **REQ-057 / IMP-057** | Baseline; regressão obrigatória; EIC V1 (um `classificar`) |
| **ARQ-019 / IMP-058** | Precedência Gate intacta |
| **ARQ-017 / Motor** | Destino C3 inalterado |
| **ARQ-014 / NCS** | Fora do perímetro |
| **ARQ-020** | Continua após classificação |
| **EIC** | CAP-07; G-EIC-D antes de IMP de produto; SC-01…05 + deixis |
| **ANL-006** | Alternativa B adoptada; A/D rejeitadas |

---

## 9. Estratégia de rollback (arquitectural)

| Nível | Mecanismo | Efeito |
|-------|-----------|--------|
| **L1** | Núcleo omite `historicoRecente` | Path IMP-057 imediato (I-OPT / I-BASE) — **rollback preferido** |
| **L2** | Flag de activação no IMP (se existir) | Desligar = L1 |
| **L3** | Revert do IMP | Remove S3 + C-PREP; contratos de saída inalterados ⇒ sem migração |
| **L4** | Dados | Nenhuma persistência nova ⇒ rollback sem migração de schema |

Activar rollback se: regressão I-BASE/I-C3/I-LIM; falso C3 atribuível a S3; violação I-GATE/I-ONE.

---

## 10. Critérios arquitecturais (Gate desta ARQ)

A ARQ-022 considera-se **pronta para IMP** quando o patrocinador/CTO confirmar:

1. Visão §1 e relação com ARQ-018 §2 aceites.  
2. Ponto de integração §4 (um Classificador; Gate antes) aceite.  
3. Estruturas §5 e janela 4/200/800 aceites.  
4. Invariantes §7 (esp. I-C3, I-LIM, I-BASE, I-GATE, I-MOT, I-NCS, I-JOB) aceites.  
5. Rollback §9 aceite.  
6. REQ-061 permanece a norma de aceite funcional (CA/NA).

---

## 11. Fora do escopo arquitectural

* Novo enum de classes ou segundo classificador.  
* Classificação LLM no limiar.  
* Concatenação histórico→texto como mecanismo principal.  
* Persistência de diálogo / topic tracker.  
* Redesign Motor, Gate, NCS, MRE, CN, Fila.  
* Resolução de deixis por reescrita (ANL-006 Alt. C — fase 2).

---

## 12. Ordem sugerida de implementação (informativa)

```text
E1 — Contrato ContextoClassificacao + C-PREP (janela) + testes caps
E2 — Política S3 (C1↔C2) + proibições C3 + razaoCurta
E3 — Integração Núcleo (após Gate) + adapter intacto
E4 — Regressão IMP-057 + CT REQ-061 + fronteiras Gate/Motor/NCS
E5 — Docs / evidências / VAL
```

*(O plano IMP formal atribui IDs e Gates por etapa.)*

---

## Referências

| Documento | Relação |
|-----------|---------|
| ANL-006 | Análise / alternativa B |
| REQ-061 | Requisitos CA/NA / RF |
| ARQ-018 | Norma-mãe do Classificador |
| REQ-057 / IMP-057 | Baseline |
| ARQ-019 | Gate antes |
| docs/EIC/ | Disciplina conversacional CAP-07 |

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Criação — arquitectura REQ-061 | Em análise; pronta para Gate → IMP |

---

**Estado:** Arquitectura elaborada — pronta para revisão/homologação e abertura da **IMP**.  
**Sem implementação de código, prompts ou comportamento neste acto.**
