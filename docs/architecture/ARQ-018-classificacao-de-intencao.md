# ARQ-018 — Classificação de Intenção

> **Status: Homologada v0.1** (01/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-018.  
> **Capacidade:** CAP-07 — Comunicação (entrada de intenção) com apoio CAP-01 (Orquestração) e CAP-11 (encaminhamento ao Motor).  
> Norma superior: CON-001 (tempo do utilizador; sem perguntas desnecessárias; transparência); ADR-015; ADR-019; ADR-006; ARQ-017; REQ-030.  
> **Finalidade:** arquitectura do **Classificador de Intenção** — decidir, antes de qualquer resposta ou acção, *que tipo de pedido* o utilizador fez.  
> **Gate:** Homologada (patrocinador). **Próximo artefacto:** **REQ-057**.  
> **Sem implementação** até REQ-057 + IMP + autorização por etapa.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Camada arquitectural obrigatória no limiar da Conversa: classifica cada mensagem do utilizador numa **classe de intenção** canónica antes de deliberar, responder, consultar CTO ou despachar ao Motor de Execução. |
| **Por que existe?** | Sem classificação prévia, o Núcleo tende a tratar tudo como deliberação/execução — desperdiça tempo, cria Jobs indevidos ou ignora a frente activa. O patrocinador precisa de rotas distintas: resposta imediata, conversa de projecto, trabalho executivo e comandos operacionais. |
| **Para quem existe?** | Patrocinador (mensagens na Conversa); Orquestrador / Núcleo (consome a classe); Motor (ARQ-017), MRE, capacidades locais e Painel (destinos possíveis). |
| **Como medir sucesso?** | (1) **Toda** mensagem passa pelo Classificador antes de qualquer efeito; (2) as quatro classes mínimas §3 são distinguíveis e testáveis; (3) Conhecimento Geral **não** cria Job nem depende da frente activa; (4) Trabalho Executivo **só** segue ao Motor quando a classe o indicar; (5) Comandos Operacionais resolvem-se sem despacho de oficina. |

---

## 1. Objetivo

### 1.1 Objectivo

**Permitir que o CEO classifique a intenção do utilizador antes de responder ou executar qualquer acção**, reduzindo atrito cognitivo e evitando efeitos laterais (Jobs, deliberação pesada, uso incorrecto do contexto de projecto).

### 1.2 Objectivos operacionais

| ID | Objectivo |
|----|-----------|
| O1 | Tornar o Classificador o **primeiro passo obrigatório** do pipeline de mensagem. |
| O2 | Distinguir, no mínimo, as **quatro classes** §3. |
| O3 | Definir **critérios de classificação** verificáveis (não ad hoc no Orquestrador). |
| O4 | Preservar a fronteira ARQ-017: só **Trabalho Executivo** encaminha ao Motor. |
| O5 | Respeitar CON-001: resposta imediata quando bastar; sem burocracia. |
| O6 | Manter o classificador **separado** da execução (não publica Jobs; não invoca Agent/SDK). |

### 1.3 Não-objectivos (desta ARQ)

| ID | Fora |
|----|------|
| NO1 | Implementar código, IMP, UI nova ou alteração de CON/ADR nesta fase. |
| NO2 | Substituir o MRE (ADR-019), o Motor (ARQ-017) ou o Conector CTO (ARQ-015). |
| NO3 | Classificação multi-label ilimitada ou taxonomia de marketing. |
| NO4 | RBAC / multi-utilizador da classificação. |
| NO5 | Garantir 100 % de acerto semântico por LLM sem política de fallback (detalhe no REQ). |

---

## 2. Escopo

### 2.1 Dentro do escopo (V1 arquitectural)

* Modelo do **Classificador de Intenção** como porta de entrada do Núcleo/Orquestrador.  
* **Quatro classes mínimas** §3 e regras de encaminhamento.  
* **Fluxo de decisão** §4 (mensagem → classe → destino).  
* Critérios de classificação §5 e responsabilidades §6.  
* Critérios arquitecturais §7 para futuros REQ/IMP.  
* Relação lógica com: Conversa (SRF-T03), Memória/COA (frente activa), MRE, Motor (ARQ-017), capacidades operacionais (fila, painel, memória, estado), CTO (consulta ≠ trabalho executivo automático).

### 2.2 Fora do escopo

* Código, schemas obrigatórios novos, ou emenda a ARQ-017 nesta ARQ.  
* UI dedicada ao classificador (a classificação é **invisível** ou residualmente transparente — detalhe de UX no REQ/F5).  
* Treino de modelos proprietários.  
* Abrir frentes paralelas (REQ/IMP) antes da homologação desta ARQ.

### 2.3 Relação com o que já existe

| Peça | Papel face ao Classificador |
|------|----------------------------|
| **`classificarIntencao` actual (Núcleo)** | Stub determinístico por capacidade — **insumo**, não norma canónica das quatro classes. A V1 arquitectural **evolui** este limiar; não o ignora. |
| **Conversa (SRF-T03)** | Origem de todas as mensagens a classificar. |
| **COA / frente activa** | Contexto **só** para classes que o exigem (§3.2, §3.3). |
| **MRE / Núcleo** | Destino típico de conversa deliberativa / projecto — **após** classificação. |
| **Motor de Execução (ARQ-017)** | Destino **exclusivo** da classe Trabalho Executivo (quando houver despacho). |
| **Capacidades operacionais** | Destino da classe Comandos Operacionais (status, painel, jobs, memória, etc.). |
| **Painel (ARQ-016) / CTO (ARQ-015)** | Não classificam; não saltam o Classificador. |

---

## 3. Classes de intenção (mínimo V1)

Enum canónico fechado na V1. Novas classes só por emenda ARQ/REQ.

| ID | Classe | Nome curto | Cria Job? | Usa frente activa? | Destino típico |
|----|--------|------------|-----------|--------------------|----------------|
| **C1** | `conhecimento_geral` | Conhecimento Geral | **Não** | **Não** | Resposta imediata / capacidade local leve |
| **C2** | `conversa_projeto` | Conversa sobre Projeto | **Não** (automaticamente) | **Sim** | Núcleo/MRE com dossier/COA |
| **C3** | `trabalho_executivo` | Trabalho Executivo | **Só** via Motor (ARQ-017) + política | **Sim** (quando aplicável) | Motor de Execução |
| **C4** | `comando_operacional` | Comandos Operacionais do CEO | **Não** (salvo o comando *ser* publicar Job já tipado) | Opcional / leitura | Capacidades operacionais |

### 3.1 C1 — Conhecimento Geral

* Resposta **imediata** (facto, saudação, definição genérica, pergunta sem lastro de projecto).  
* **Não** cria Job.  
* **Não** considera a frente activa (COA/MG2) como lastro obrigatório.  
* Exemplos típicos: «que horas são?», «quem és?», «o que é um ADR?» (sem pedir acção no MG2).

### 3.2 C2 — Conversa sobre Projeto

* Usa **contexto da frente activa** (COA, briefing, memória, painel situacional).  
* Pode deliberar (MRE) ou orientar — **não** cria Job automaticamente.  
* Exemplos: «onde estamos no outdoor?», «o que sabes do MG2?», «devemos adiar o pagamento?».

### 3.3 C3 — Trabalho Executivo

* Intenção de **fazer** trabalho técnico / despacho / alteração no âmbito governado.  
* Encaminha ao **Motor de Execução (ARQ-017)** — Intenção → … → Job → Encerramento.  
* Sujeito à política de aprovação do Motor (REQ-056 / ARQ-017).  
* Exemplos: «implementa o outdoor lateral», «cria um job para corrigir o LOD», «despacha a tarefa X».

### 3.4 C4 — Comandos Operacionais do CEO

* Pedidos sobre o **próprio sistema** CEO, não sobre a oficina do produto.  
* Exemplos: status, painel, jobs (listar/consultar), contexto, memória, COA activo, saúde do backend.  
* Resolve-se por **capacidades operacionais** (leitura / publicação tipada já existente na capacidade Fila, se o utilizador pedir explicitamente criar job operacional — distinto de C3 “trabalho de projecto” via Motor).  
* **Não** deve confundir-se com C3: listar jobs ≠ implementar feature.

### 3.5 Ambiguidade

Se a mensagem for insuficiente para escolher uma classe com confiança mínima (limiar no REQ):

1. Preferir a classe **mais restritiva em efeitos** (não criar Job; não saltar para C3).  
2. Pedir o **mínimo** de clarificação (CON-001) **ou** encaminhar a C2 se houver frente activa e a mensagem parecer deliberativa.  
3. **Proibido** inventar C3 / Job por default.

---

## 4. Fluxo de decisão

### 4.1 Princípio

```text
Mensagem do utilizador
  → Classificador de Intenção   ← OBRIGATÓRIO, primeiro passo
  → Classe (C1|C2|C3|C4)
  → Encaminhamento ao destino da classe
  → (só então) resposta / deliberação / Motor / capacidade operacional
```

**Nenhuma** resposta substantive, deliberação MRE, consulta CTO automática, publicação de Job ou handoff ao Motor ocorre **antes** da classificação.

### 4.2 Diagrama lógico

```text
Utilizador ──► Conversa (SRF-T03)
                    │
                    ▼
            Classificador de Intenção
                    │
        ┌───────────┼───────────┬──────────────┐
        ▼           ▼           ▼              ▼
       C1          C2          C3             C4
   Resposta     Conversa     Motor de      Capacidades
   imediata     + frente     Execução      operacionais
   (sem Job)    activa       (ARQ-017)     (status, jobs,
                (sem Job     + política     painel, memória…)
                 auto)        aprovação
```

### 4.3 Regras de transição pós-classe

| De | Para | Condição |
|----|------|----------|
| C1 | Resposta | Sem COA obrigatório; sem Fila |
| C2 | Núcleo/MRE | Com snapshot de frente activa; `acao.job` **não** forçado |
| C3 | Motor (ARQ-017) | Parecer/plano podem seguir; Job só com política do Motor |
| C4 | Capacidade tipada | Sem MRE obrigatório; sem Agent |
| * | Clarificação | Confiança &lt; limiar REQ |

### 4.4 Reclassificação

* Uma mensagem = **uma** classe V1 (single-label).  
* Se o utilizador, na mesma sessão, mudar de assunto, a **próxima** mensagem é reclassificada do zero.  
* O Classificador **não** mantém estado de “modo execução” que force C3 em mensagens seguintes sem indício.

---

## 5. Critérios de classificação

### 5.1 Sinais de entrada (lógicos)

| Sinal | Uso |
|-------|-----|
| Texto normalizado da mensagem | Primário |
| Histórico recente (opcional) | Desambiguar C2 vs C1 — sem forçar C3 |
| Frente activa / COA presente | Necessário para C2; irrelevante para C1 |
| Lexicon operacional (status, jobs, painel, memória…) | Favorece C4 |
| Lexicon de despacho / implementação / “faz”, “corrige”, “job para…” | Favorece C3 |
| Pergunta factual genérica / saudação | Favorece C1 |

### 5.2 Matriz de decisão (resumo)

| Se… | Então… |
|-----|--------|
| Pedido operacional sobre o CEO (estado, fila, painel, memória, contexto) | **C4** |
| Pedido explícito de execução/despacho/implementação no âmbito do projecto | **C3** |
| Pergunta/deliberação sobre o projecto/frente activa sem ordem de execução | **C2** |
| Facto geral, saudação, meta do CEO sem COA | **C1** |
| Empate C2/C3 | Preferir **C2** até haver verbo de execução claro (não criar Job por default) |
| Empate C1/C2 e existe frente activa com referência implícita ao projecto | Preferir **C2** |
| Empate C3/C4 (ex.: “jobs”) | “listar/ver jobs” → **C4**; “cria job para implementar X” → **C3** |

### 5.3 Saída canónica do Classificador (contrato lógico)

| Campo | Descrição |
|-------|-----------|
| `classe` | `conhecimento_geral` \| `conversa_projeto` \| `trabalho_executivo` \| `comando_operacional` |
| `confianca` | 0–1 (limiar no REQ) |
| `razaoCurta` | Uma linha auditável (sem secrets) |
| `destino` | Identificador lógico do encaminhamento |
| `usaFrenteActiva` | boolean derivado da classe |
| `permiteJob` | boolean — só `true` potencial em C3 (e C4 se capacidade fila explícita) |

### 5.4 Proibições de classificação

* Classificar como C3 **só** porque o MRE “poderia” despachar.  
* Usar a frente activa em C1.  
* Criar Job no acto de classificar.  
* Invocar `@cursor/sdk` / Dispatcher a partir do Classificador.  
* Bypass do Classificador por atalho de capacidade no Orquestrador.

---

## 6. Responsabilidades

### 6.1 Matriz RACI lógica (V1)

| Responsabilidade | Patrocinador | Classificador | Orquestrador / Núcleo | MRE | Motor | Capacidades op. |
|------------------|--------------|---------------|----------------------|-----|-------|-----------------|
| Emitir mensagem | R | — | I | — | — | — |
| Classificar intenção | I | R | C | — | — | — |
| Encaminhar por classe | I | C | R | — | — | — |
| Resposta C1 | I | — | R | — | — | C |
| Deliberar C2 | I | — | C | R | — | — |
| Conduzir C3 | A (Gate Motor) | — | C | C | R | — |
| Executar C4 | I | — | C | — | — | R |
| Observar (Painel) | I | — | — | — | — | I |

*(R = realiza; A = aprova; C = contribui; I = informado.)*

### 6.2 Responsabilidades do Classificador

| ID | Responsabilidade |
|----|------------------|
| R1 | Ser o **primeiro** passo de todo o processamento de mensagem. |
| R2 | Emitir exactamente uma classe do enum §3 (ou pedir clarificação). |
| R3 | Não produzir efeitos laterais (Jobs, patches, LLM de oficina). |
| R4 | Expor `razaoCurta` auditável. |
| R5 | Respeitar a matriz §5.2. |

### 6.3 Não responsabilidades

| ID | Não responsabilidade |
|----|----------------------|
| NR1 | Deliberar mérito de negócio (MRE). |
| NR2 | Publicar ou consumir Jobs (Fila / Dispatcher). |
| NR3 | Decidir arquitectura (CTO). |
| NR4 | Substituir a Conversa como superfície de UX. |
| NR5 | Garantir execução com PC off (ARQ-017 / REQ-053). |

---

## 7. Critérios arquitecturais

### 7.1 Critérios de conformidade (obrigatórios)

| ID | Critério |
|----|----------|
| CA1 | Toda mensagem do utilizador passa pelo Classificador **antes** de resposta ou acção. |
| CA2 | As quatro classes §3 existem e são mutuamente exclusivas na V1. |
| CA3 | C1: resposta imediata; sem Job; sem dependência da frente activa. |
| CA4 | C2: usa frente activa; sem Job automático. |
| CA5 | C3: encaminha ao Motor de Execução (ARQ-017); Jobs só pela política do Motor. |
| CA6 | C4: comandos operacionais (status, painel, jobs, contexto, memória, …) via capacidades — sem confundir com C3. |
| CA7 | Ambiguidade não defaulta para C3 / Job. |
| CA8 | Classificador não importa Agent/SDK nem duplica Dispatcher. |
| CA9 | CTO e Painel não saltam o Classificador. |
| CA10 | Rastreio mínimo: classe + confiança (+ razão) consultáveis em diagnóstico sem secrets. |

### 7.2 Critérios de qualidade / risco

| ID | Critério |
|----|----------|
| CQ1 | Falso positivo C3 é pior que falso positivo C2 (preferir não executar). |
| CQ2 | Tempo do utilizador: C1 não deve passar por pipeline MRE completo. |
| CQ3 | Extensão do enum de classes exige emenda ARQ/REQ. |
| CQ4 | Stub actual do Núcleo deve convergir para este modelo — sem dois classificadores concorrentes em produção. |

### 7.3 Critérios de homologação desta ARQ (Gate)

A ARQ-018 considera-se **homologada** quando o patrocinador confirmar:

1. Objectivo e escopo §1–§2 adequados.  
2. Quatro classes §3 aceites como mínimo V1.  
3. Fluxo §4 (Classificador primeiro) aceite.  
4. Critérios §5 e responsabilidades §6 coerentes.  
5. Critérios §7 suficientes para abrir o **REQ** (sem código ainda).  
6. Autorização explícita para o próximo artefacto: **REQ** (não IMP/código).

### 7.4 Critérios para avançar a implementação (referência futura)

Só após: ARQ-018 homologada → REQ homologado → IMP → autorização por etapa (ADR-006).  
**Proibido:** implementar o Classificador canónico nesta fase.

---

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Tudo cair em C3 / Jobs a mais | CA7; empate → C2; Motor com Gate |
| C1 usar COA e “contaminar” resposta | CA3; `usaFrenteActiva=false` |
| Dois classificadores (stub + novo) | CQ4; REQ obriga um limiar único |
| C4 vs C3 em “job” | Matriz §5.2 (listar ≠ implementar) |
| Classificador invocar LLM pesado sempre | REQ: C1/C4 preferir regras; LLM só se necessário |

---

## 9. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 (primária); CAP-01; CAP-11 |
| Norma superior | CON-001; ADR-015; ADR-019; REQ-030 |
| Destino execução | ARQ-017 / REQ-056 (Motor) |
| Observação | ARQ-016 (não classifica) |
| CTO | ARQ-015 / REQ-054 (não salta o Classificador) |
| Origem | Abertura de frente patrocinador — Classificação de Intenção (01/08/2026) |
| Próximo | **REQ** → IMP → VAL |
| Implementação | *Proibida até Gate REQ / IMP* |

---

## 10. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 01/08/2026 | Engenheiro (Cursor) | Abertura ARQ-018 — Classificação de Intenção | Classificar antes de responder/agir; quatro classes mínimas | Em análise |
| 0.1 | 01/08/2026 | Patrocinador | Homologação ARQ-018 | Gate arquitectura | **Homologada**; abrir REQ-057 |

---

*Nenhuma implementação de código do Classificador canónico até homologação do REQ-057 e IMP subsequente.*

---

**Gate ARQ-018:** Homologada. Artefacto seguinte: **REQ-057**.
