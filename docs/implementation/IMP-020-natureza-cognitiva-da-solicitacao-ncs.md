# IMP-020 — Implementação da Natureza Cognitiva da Solicitação (NCS)

> **Status: Rascunho — v0.1 (30/07/2026).** Aguarda revisão conjunta (Patrocinador + CTO) / Gate de fecho.  
> **Implementação:** B1–B4 (C1–C8) materializados — ver [`IMP-020-blocos-de-implementacao.md`](IMP-020-blocos-de-implementacao.md) e evidências B1–B4. **`flagNcs` default off**; produção NCS **não** declarada.  
> Tipo IMP (ADR-012). **Identificação:** IMP-020 (após IMP-019 — fecho MRE baseline).  
> Norma superior: CON-001; ADR-006; ADR-012; ADR-015; **ADR-019** (*não alterado*); **ARQ-014** (origem exclusiva); REQ-052; REQ-048…051; ARQ-013 (preservada).  
> **Finalidade:** especificar *como* materializar a NCS no limiar do MRE e o condicionamento dos estágios — este documento não é o código.  
> **Proibições:** não cria REQs/ADRs; não declara produção.

---

## 1. Objetivo

Materializar o **Classificador NCS**, o **Pacote NCS** imutável por corrida, o **condicionamento** dos estágios 2–7 (e leitura em 0–1 e 8), e o **registo recuperável** da NCS no `ParecerExecutivo` via metadados — conforme ARQ-014 — preservando a baseline MRE homologada (IMP-010…019 / VAL-009 / produção R1).

---

## 2. Escopo

### Inclui

* Componentes lógicos a implementar (§3).  
* Alterações necessárias por módulo da baseline (§4).  
* Fluxo de execução (§5).  
* Estruturas de dados do Pacote NCS e metadados do parecer (§6).  
* Contratos entre módulos (§7).  
* Estratégia de migração / ativação (§8).  
* Compatibilidade com a baseline homologada (§9).  
* Estratégia de testes (§10).  
* Critérios de conclusão (§11).

### Fora do escopo

* Código neste documento; commits; classes concretas prescritas.  
* Emenda a REQ-048…051, ADR-019 ou ARQ-013.  
* Redesign do Núcleo, Speaker, Fila, UI ou Voice além do consumo indireto do parecer.  
* VAL formal completo (apenas preparação de evidências para VAL futura).  
* Novas categorias NCS além do catálogo REQ-052.

---

## 3. Componentes a implementar

| # | Componente lógico | Responsabilidade | Origem ARQ-014 |
|---|-------------------|------------------|----------------|
| C1 | **Catálogo NCS** | Enum fechado das quatro naturezas + validação de valor | §5.1 / REQ-052 §2 |
| C2 | **Classificador NCS** | No limiar de admissão do MRE: mensagem (+ intenção só leitura) → Pacote NCS | §1 |
| C3 | **Pacote NCS** | Estrutura imutável da corrida; política de lacunas e modo esperado do estágio 6 | §5.1 |
| C4 | **Validador de fronteira NCS** | Rejeita pacote inválido antes dos estágios 4+ | §5.1 |
| C5 | **Portador de contexto deliberativo** | Propaga Pacote NCS aos estágios 0–8 sem permitir escrita | §2 |
| C6 | **Políticas por estágio** | Regras de leitura NCS em dossier, princípios, análise, riscos, decisão, ação | §3 |
| C7 | **Registo no Parecer** | Cópia do Pacote (ou subconjunto) para `metadados` na montagem | §5.3 |
| C8 | **Flag de ativação NCS** | Liga/desliga o limiar sob mandato (migração §8); com flag on, limiar obrigatório | §9 ARQ |

**Não implementar como componentes novos:** Speaker, Núcleo de roteamento, Fila, UI — apenas garantir não-mutação / não-classificação.

---

## 4. Alterações necessárias em cada módulo

Alterações **mínimas** sobre a baseline existente. Caminhos indicam *sede atual* no repositório (orientação de IMP; não são desenho de classes).

| Módulo / sede atual | Alteração necessária | Não alterar |
|---------------------|----------------------|-------------|
| **Novo: limiar NCS** (sob fronteira `mre/`, p.ex. pasta lógica `ncs/`) | C1–C4: classificar, validar, emitir Pacote | — |
| `mre/integracaoNucleo.js` (fachada deliberativa) | Invocar Classificador NCS **após** rota deliberativa e **antes** de `executarDeliberacaoMre` / pipeline; passar Pacote no contexto | Matriz deliberativo vs determinístico; `flagMre` de rollback MRE |
| `mre/executarDeliberacao.js` | Aceitar Pacote NCS; copiar para `metadados` na montagem do parecer; falha pré-NCS → marcador `indeterminada_por_falha` | Contrato de validação V1–V6; enums REQ-048 |
| `mre/pipeline/orquestrador.js` | Garantir Pacote presente antes do estágio 0 (ou passo 0−); propagar leitura; **não** permitir estágios a substituir NCS | Ordem 0–7; T1 transições; falha controlada existente |
| `mre/pipeline/estagios.js` | Estágios 2–7: aplicar políticas NCS (lacunas de inventário, análise, riscos, decisão, ação); estágios 0–1: leitura opcional/obrigatória conforme ARQ | SchemaHints de enum do estágio 6 já corrigidos; `montarFalhaControlada` (exceto registo NCS se já existir) |
| `mre/pipeline/llmEstagio.js` / adapter LLM | Incluir NCS no *contexto* dos pedidos LLM dos estágios relevantes (leitura); não pedir ao modelo para redefinir `naturezaCognitiva` | Retry/parse existentes |
| `mre/aprendizado/*` | Leitura opcional de NCS no parecer/contexto; **não** mutar decisão/ação/NCS | Critérios M/P/R; H1 princípios |
| `mre/parecer/validarParecerExecutivo.js` | **Sem mudança de V1–V6**; opcionalmente checagem auxiliar de metadados NCS *não bloqueante* ao núcleo V1–V6, ou validação NCS só no limiar | Enums; regras V3/V4/V5 |
| `mre/speaker/*` | Nenhuma alteração funcional obrigatória | Fidelidade ao parecer |
| `executiveEngine/capacidades/ia.js` | Nenhuma alteração de roteamento; continua a chamar fachada deliberativa | Fallbacks determinísticos / LLM legado |
| `executiveEngine/classificar.js` | **Não** incorporar NCS | Intenção de rota permanece stub de Núcleo |
| Canais / Fila / UI | Nenhuma | — |
| Testes `mre/*.test.js` | Novos casos NCS + regressão suíte atual | — |

**Princípio de alteração mínima:** se um módulo não precisa ler o Pacote NCS para cumprir REQ-052, **não** o modificar.

---

## 5. Fluxo de execução

```text
1. Núcleo classifica intenção e confirma rota deliberativa
2. Fachada MRE (integração):
     se flag NCS inativa → comportamento baseline (sem Pacote; ver §8)
     se flag NCS ativa:
        2a. Classificador NCS(mensagem, intenção-leitura) → Pacote NCS
        2b. Validador de fronteira NCS
        2c. em falha de classificação → falha controlada com indeterminação OU retry de classificação (política: uma retentativa; depois falha controlada)
3. executarDeliberacaoMre / pipeline 0–7 com Pacote NCS no contexto (imutável)
4. Estágios leem Pacote:
     - 2: politicaLacunas / exigeItensConcretos
     - 3–5b: modo cognitivo
     - 6–7: modoEsperadoEstagio6 + R4–R7 (REQ-052)
5. Estágio 8: lê NCS se presente; não altera
6. Montagem parecer: metadados ← cópia NCS (natureza, confiança, fundamento, …)
7. validarParecerExecutivo (V1–V6 inalterados)
8. Speaker / efeitos pós-deliberação (inalterados em contrato)
```

**Invariante de execução:** após o passo 2a bem-sucedido, nenhum passo 3–8 escreve `naturezaCognitiva`.

---

## 6. Estruturas de dados

### 6.1 Pacote NCS (corrida)

| Campo | Tipo lógico | Obr. | Regra |
|-------|-------------|------|-------|
| `naturezaCognitiva` | enum | Sim | `metodo_de_decisao` \| `decisao_operacional` \| `planejamento` \| `explicacao` |
| `confiancaNatureza` | number | Sim | ∈ [0, 1] |
| `fundamentoNatureza` | string | Sim | Não vazia; não prosa de UI |
| `exigeItensConcretos` | boolean | Sim | `true` ↔ `decisao_operacional` |
| `politicaLacunas` | enum | Sim | `inventario_nao_obrigatorio` \| `inventario_material_obrigatorio` \| `nao_aplica_escolha` |
| `modoEsperadoEstagio6` | string/enum lógico | Sim | Orientação (ex.: `entregar_criterios`, `escolher_itens`, `estruturar_plano`, `justificar`); **≠** `EstadoDecisaoExecutiva` |

Derivação determinística recomendada após classificar a natureza:

| `naturezaCognitiva` | `exigeItensConcretos` | `politicaLacunas` | `modoEsperadoEstagio6` (exemplo) |
|---------------------|----------------------|-------------------|----------------------------------|
| `metodo_de_decisao` | false | `inventario_nao_obrigatorio` | `entregar_criterios` |
| `decisao_operacional` | true | `inventario_material_obrigatorio` | `escolher_itens` |
| `planejamento` | false | `nao_aplica_escolha` | `estruturar_plano` |
| `explicacao` | false | `nao_aplica_escolha` | `justificar` |

### 6.2 Metadados no ParecerExecutivo

Subconjunto mínimo em `metadados` (retrocompatível REQ-048 V6):

| Chave | Obr. em corrida com NCS ativa |
|-------|-------------------------------|
| `naturezaCognitiva` | Sim |
| `fundamentoNatureza` | Sim |
| `confiancaNatureza` | Recomendado |
| `exigeItensConcretos` | Recomendado |
| `politicaLacunas` | Opcional |
| `modoEsperadoEstagio6` | Opcional |
| `ncsVersaoContrato` | Opcional (ex.: `"1.0"`) |

Pareceres históricos **sem** estas chaves permanecem válidos.

### 6.3 Marcador de falha pré-NCS

| Campo em metadados | Valor |
|--------------------|--------|
| `naturezaCognitiva` | omitido **ou** marcador documentado `indeterminada_por_falha` (não é categoria do catálogo) |

---

## 7. Contratos entre módulos

| De | Para | Contrato |
|----|------|----------|
| Núcleo / `ia` | Fachada MRE | Mensagem + intenção; sem Pacote NCS |
| Fachada MRE | Classificador NCS | Entrada de classificação; saída Pacote válido ou erro |
| Classificador NCS | Orquestrador / deliberação | Pacote NCS imutável |
| Orquestrador | Estágios | Contexto inclui Pacote (somente leitura) |
| Estágios | Orquestrador | Parcial de estágio; **proibido** devolver nova `naturezaCognitiva` |
| Deliberação | Validador REQ-048 | Parecer com metadados NCS; V1–V6 iguais |
| Deliberação | Speaker | Só parecer válido (sem canal NCS paralelo) |
| Deliberação | Aprendizado | Parecer + leitura NCS; sem escrita em decisão/NCS |
| Flag NCS | Fachada | on → limiar obrigatório; off → baseline (§8) |

---

## 8. Estratégia de migração

1. **Fase A — Entrega em flag off (default seguro):** implementar C1–C7 atrás de `flagNcs.ativo = false` (nome lógico); suíte baseline 59 testes (ou sucessora) verde; comportamento R1 **idêntico** ao atual.  
2. **Fase B — Testes NCS com flag on em ambiente de ensaio:** executar §10; evidência de P1–P7 / N1–N9 (REQ-052).  
3. **Fase C — Ativação:** Gate/Patrocinador autoriza `flagNcs.ativo = true` em produção R1 (ou VAL dedicado).  
4. **Rollback:** `flagNcs.ativo = false` restaura baseline sem remover código; `flagMre` permanece mecanismo de rollback do MRE completo (IMP-010).  
5. **Dados:** sem migração de pareceres históricos; apenas corridas novas com flag on gravam metadados NCS.  
6. **Não** exigir deploy de schema REQ-048 emendado.

---

## 9. Compatibilidade com a baseline homologada

| Baseline | Compatibilidade IMP-020 |
|----------|-------------------------|
| ADR-019 / ARQ-013 | Limiar NCS dentro do MRE; Speaker/Aprendizado não deliberam |
| REQ-048 / validador | V1–V6 intactos; NCS em metadados |
| REQ-049 | Topologia 0–8 intacta; políticas condicionadas |
| REQ-050 / REQ-051 | Sem mudança de contrato; não-mutação reforçada |
| IMP-011…019 / VAL-009 / P10 produção R1 | Comportamento preservado com flag NCS off; ativação só com Gate |
| `flagMre` | Independente de `flagNcs` |
| Enum estágio 6 / schemaHint | Preservados; NCS não reabre o problema `"decisao"` |

---

## 10. Estratégia de testes

### 10.1 Regressão obrigatória

| ID | Caso | Esperado |
|----|------|----------|
| TR-01 | `npm run test:mre` (suíte baseline) com flag NCS **off** | Pass integral (sem regressão) |
| TR-02 | Rota determinística (saudação / data / memória) | Sem MRE; sem NCS |
| TR-03 | Parecer válido V1–V6 sem metadados NCS | Continua `ok` |

### 10.2 Testes NCS (flag on)

| ID | Caso | Esperado |
|----|------|----------|
| TN-01 | Classificador: «Como você decidiria…» sem itens | `metodo_de_decisao` |
| TN-02 | Classificador: «Qual das cinco…» + itens | `decisao_operacional` |
| TN-03 | Classificador: «Monte um plano…» | `planejamento` |
| TN-04 | Classificador: «Explique por que…» | `explicacao` |
| TN-05 | Pacote com natureza ilegal | Rejeitado na fronteira |
| TN-06 | Estágio tenta sobrescrever NCS | Imutável / ignorado / falha de contrato |
| TN-07 | `metodo_de_decisao` + `factosUsados: []` | Não obriga `solicitar_dados` só por inventário |
| TN-08 | `decisao_operacional` sem itens materiais | Pode `solicitar_dados` (REQ-049) |
| TN-09 | Parecer montado contém metadados NCS | Recuperável |
| TN-10 | Speaker não recebe Pacote paralelo | Só parecer; comunicado fiel |
| TN-11 | Aprendizado não muta estado/ação/NCS | Snapshot estável |
| TN-12 | Flag off após implementação | Comportamento = baseline |

### 10.3 Evidência

Relatório de evidências NCS (learning ou `implementation/evidencias/`) com matriz TN/TR → resultado, anexável a VAL futura. **Não** declara produção neste IMP.

---

## 11. Critérios de conclusão

O IMP-020 só se considera **concluído** (pronto para Gate de IMP / preparação VAL) quando cumulativamente:

| # | Critério |
|---|----------|
| 1 | C1–C8 especificados neste IMP estão materializados ou explicitamente diferidos com rastreio (nenhum diferimento de C1–C7) |
| 2 | Classificador NCS corre no limiar MRE (não no Núcleo de intenção; não no Speaker) |
| 3 | Pacote NCS imutável na corrida; estágios apenas leem |
| 4 | Metadados NCS presentes em pareceres de corridas com flag on |
| 5 | TR-01…TR-03 passam |
| 6 | TN-01…TN-12 passam (ou equivalente documentado) |
| 7 | Com flag off, comportamento observável = baseline pré-IMP-020 |
| 8 | Nenhuma alteração a V1–V6, enums REQ-048, topologia 0–8, nem contratos Speaker/Aprendizado além do permitido |
| 9 | Evidência escrita anexável; produção **não** declarada por este IMP |
| 10 | Rollback por `flagNcs` verificado |

---

## 12. Fases internas sugeridas (execução autorizada)

| Fase | Conteúdo | Gate interno |
|------|----------|--------------|
| I1 | C1–C4 + testes TN-01…05, TN-12 | Pacote e classificador isolados |
| I2 | C5–C6 + orquestrador/estágios + TN-06…08 | Condicionamento |
| I3 | C7 + metadados + TN-09…11 | Parecer |
| I4 | C8 migração + TR regressão + evidência | Pronto para revisão Gate |

Ordem obrigatória: I1 → I2 → I3 → I4.

---

## 13. Riscos de implementação

| Risco | Mitigação |
|-------|-----------|
| Regressão R1 ao ativar NCS | Flag off por defeito; TR-01; ativação só com Gate |
| LLM do classificador instável | Preferir classificação híbrida (regras R3 + LLM); testes com fixtures determinísticas |
| Estágios 4/6 ignoram política | TN-07; incluir NCS no contexto LLM; asserts pós-pipeline |
| Duplicar lógica no Núcleo | Proibição explícita §4 |

---

## Dependências

| Artefacto | Papel |
|-----------|--------|
| ARQ-014 | Origem exclusiva |
| REQ-052 | Norma funcional NCS |
| REQ-048…051 / ARQ-013 | Baseline |
| IMP-010…019 / VAL-009 | MRE em produção R1 a preservar |

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 |
| ARQ | 014 |
| REQ | 052 (+ 048…051 compatibilidade) |
| ADR | 019 (não alterado) |
| Código | *(não iniciado por este documento)* |
| VAL | *(futuro)* |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Engenheiro (Cursor) | Rascunho IMP-020 derivado exclusivamente do ARQ-014 | Rascunho — revisão conjunta |
