# IMP-020 — Plano de Blocos de Implementação (NCS)

> **Status: Rascunho — v0.1 (30/07/2026).**  
> Derivado exclusivamente de [`IMP-020-natureza-cognitiva-da-solicitacao-ncs.md`](IMP-020-natureza-cognitiva-da-solicitacao-ncs.md).  
> **Não implementa código.** Não altera baseline.  
> Componentes de referência: **C1–C8** (IMP-020 §3).  
> **Blocos:** B1–B4 **implementados** (gates internos). Produção NCS **não** declarada (`flagNcs` default off).

---

## Princípios da decomposição

1. Blocos **pequenos** e **coesos** (uma preocupação cada).  
2. No máximo **3** artefatos/componentes C por bloco.  
3. Cada bloco deve poder ser **testado** e **revisto** antes do seguinte.  
4. Comportamento de produção R1 permanece o da baseline até o Gate ativar a flag (B4).  
5. Ordem: contrato → classificação → propagação/políticas → parecer/ativação.

---

## Mapa C1–C8 → Blocos

| Componente | Nome | Bloco |
|------------|------|-------|
| C1 | Catálogo NCS | **B1** |
| C2 | Classificador NCS | **B2** |
| C3 | Pacote NCS | **B1** |
| C4 | Validador de fronteira NCS | **B1** |
| C5 | Portador de contexto deliberativo | **B3** |
| C6 | Políticas por estágio | **B3** |
| C7 | Registo no Parecer | **B4** |
| C8 | Flag de ativação NCS | **B4** |

---

## Ordem de execução

```text
B1 ──→ B2 ──→ B3 ──→ B4
```

| Bloco | Depende de | Pode iniciar em paralelo com |
|-------|------------|------------------------------|
| **B1** | — (início) | — |
| **B2** | B1 concluído | — |
| **B3** | B1 + B2 concluídos | — |
| **B4** | B3 concluído | — |

Nenhum bloco posterior começa antes do gate do anterior.

---

## B1 — Contrato e fronteira NCS

> **Status B1: Implementado — gate cumprido (30/07/2026).** Evidência: [`evidencias/IMP-020-B1-evidencia.md`](evidencias/IMP-020-B1-evidencia.md). **B2 não iniciado.**

**Coesão:** definir *o que é* um Pacote NCS válido, sem classificar mensagens reais no pipeline.

| Artefato | Componente |
|----------|------------|
| 1 | **C1** Catálogo NCS (enum fechado das 4 naturezas) |
| 2 | **C3** Estrutura do Pacote NCS + derivações (`exigeItensConcretos`, `politicaLacunas`, `modoEsperadoEstagio6`) |
| 3 | **C4** Validador de fronteira (rejeita natureza ilegal / pacote incompleto) |

**Fora deste bloco:** classificador, orquestrador, estágios, parecer, flag.

### Critérios de conclusão — B1

1. Catálogo expõe exatamente: `metodo_de_decisao` \| `decisao_operacional` \| `planejamento` \| `explicacao`.  
2. Pacote com os campos obrigatórios do IMP-020 §6.1 pode ser construído a partir de uma natureza válida (derivações determinísticas).  
3. Validador aceita pacote válido e rejeita natureza fora do catálogo / campos obrigatórios em falta.  
4. Fixtures mínimas: ≥1 pacote válido por natureza; ≥1 pacote inválido.  
5. **Nenhuma** alteração ao fluxo deliberativo em produção (ainda sem integração).  
6. Testes unitários do contrato/fronteira passam.

**Gate B1:** evidência contrato + validador → autoriza B2.

---

## B2 — Classificador NCS

> **Status B2: Implementado — gate cumprido (30/07/2026).** Evidência: [`evidencias/IMP-020-B2-evidencia.md`](evidencias/IMP-020-B2-evidencia.md).

**Coesão:** produzir Pacote NCS a partir da mensagem (limiar lógico), isolado do pipeline completo.

| Artefato | Componente |
|----------|------------|
| 1 | **C2** Classificador NCS (entrada: mensagem + intenção só-leitura; saída: Pacote NCS) |

*(Um único artefato — dentro do limite de 3.)*

**Depende de:** B1 (usa C1/C3/C4).

**Fora deste bloco:** wiring no orquestrador; políticas dos estágios 2–7; metadados do parecer; flag de produção.

### Critérios de conclusão — B2

1. Classificador invocado **fora** do Núcleo de intenção e **fora** do Speaker.  
2. Casos de classificação (REQ-052 / IMP-020 TN-01…04):  
   - método → `metodo_de_decisao`  
   - escolha entre itens → `decisao_operacional`  
   - «monte um plano» → `planejamento`  
   - «explique por que» → `explicacao`  
3. Saída sempre passa no validador C4 (B1).  
4. Desempate de pedidos mistos alinhado a REQ-052 R3 (testável com fixtures).  
5. Sem alteração observável do caminho deliberativo em produção (classificador ainda não ligado na fachada, ou ligado só sob harness de teste).

**Gate B2:** TN-01…04 (ou equivalentes) verdes → autoriza B3.

---

## B3 — Propagação e políticas de estágio

> **Status B3: Implementado — gate cumprido (30/07/2026).** Evidência: [`evidencias/IMP-020-B3-evidencia.md`](evidencias/IMP-020-B3-evidencia.md). **B4: implementado (ver §B4).**

**Coesão:** o Pacote percorre a corrida de forma imutável e condiciona dossier/análise/riscos/decisão/ação.

| Artefato | Componente |
|----------|------------|
| 1 | **C5** Portador de contexto deliberativo (fachada → orquestrador → estágios; só leitura) |
| 2 | **C6** Políticas por estágio (2–7 obrigatório; 0–1/8 leitura conforme IMP-020) |

*(Dois artefatos — dentro do limite de 3.)*

**Depende de:** B1 + B2.

**Fora deste bloco:** cópia final para `metadados` do parecer (B4); flag de ativação em produção (B4). Em ensaio, o portador pode exigir Pacote injetado pelo harness.

### Critérios de conclusão — B3

1. Com Pacote presente no contexto, estágios **não** substituem `naturezaCognitiva` (imutabilidade verificável).  
2. `metodo_de_decisao` + `factosUsados: []` **não** obriga `solicitar_dados` só por inventário (TN-07).  
3. `decisao_operacional` sem itens materiais **pode** `solicitar_dados` (TN-08 / REQ-049).  
4. Tentativa de sobrescrita da NCS falha ou é ignorada de forma contratual (TN-06).  
5. Topologia do pipeline 0–8 **inalterada**.  
6. Regressão pontual do pipeline (casos felizes baseline com Pacote `decisao_operacional` injetado) não quebra fluxo feliz.

**Gate B3:** TN-06…08 + imutabilidade → autoriza B4.

---

## B4 — Registo no parecer e ativação controlada

> **Status B4: Implementado — gate cumprido (30/07/2026).** Evidência: [`evidencias/IMP-020-B4-evidencia.md`](evidencias/IMP-020-B4-evidencia.md). **Produção NCS não declarada** (`flagNcs` default off).

**Coesão:** persistir NCS no parecer e controlar ligação em produção sem regressão R1.

| Artefato | Componente |
|----------|------------|
| 1 | **C7** Registo no Parecer (`metadados` NCS na montagem) |
| 2 | **C8** Flag de ativação NCS (`flagNcs`; default **off**) |

*(Dois artefatos — dentro do limite de 3.)*

**Depende de:** B3.

**Fora deste bloco:** VAL formal / declaração de produção (Gate externo).

### Critérios de conclusão — B4

1. Corrida com NCS ativa grava no parecer pelo menos `naturezaCognitiva` + `fundamentoNatureza` em metadados (TN-09).  
2. Speaker continua a consumir **só** o parecer; sem canal paralelo NCS (TN-10).  
3. Aprendizado não muta decisão/ação/NCS (TN-11).  
4. Com **`flagNcs` off** (default): comportamento observável = baseline pré-IMP-020; suíte `test:mre` / TR-01…03 passam (TN-12, TR-01).  
5. Rollback verificado: off → on → off restaura baseline.  
6. V1–V6 do validador REQ-048 **inalterados**; pareceres sem metadados NCS continuam válidos.  
7. Evidência escrita do bloco anexável (matriz TR/TN).  
8. Critérios de conclusão do IMP-020 §11 (itens aplicáveis) satisfeitos ou rastreados.

**Gate B4:** **cumprido** — IMP-020 pronto para revisão de fecho / preparação VAL; **produção NCS não declarada** até Gate explícito de ativação da flag.

### Rollback (C8) — resumo operacional

| Ação | Como |
|------|------|
| Desligar (baseline) | `flagNcs.ativo = false` em `app/src/mre/ncs/flagNcs.js` (ou `desligarNcs()`) |
| Religar (ensaio/mandato) | `flagNcs.ativo = true` (ou `ligarNcs()` / `deps.flagNcs: true`) |
| Independência | `flagNcs` ≠ `flagMre` |

Detalhe: [`evidencias/IMP-020-B4-evidencia.md`](evidencias/IMP-020-B4-evidencia.md) §3.

---

## Resumo executivo

| Bloco | Componentes | Depende | Critério-chave de «feito» |
|-------|-------------|---------|---------------------------|
| **B1** | C1, C3, C4 | — | Contrato + fronteira testáveis |
| **B2** | C2 | B1 | Classificação correta isolada |
| **B3** | C5, C6 | B1, B2 | Propagação imutável + políticas |
| **B4** | C7, C8 | B3 | Metadados + flag off = baseline |

```text
B1 (contrato) → B2 (classificar) → B3 (propagar/políticas) → B4 (parecer + flag)
```

---

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 0.1 | 30/07/2026 | Engenheiro (Cursor) | Decomposição IMP-020 em B1–B4 |
| 0.2 | 30/07/2026 | Engenheiro (Cursor) | B4 implementado (C7+C8); gate cumprido; produção NCS não declarada |
