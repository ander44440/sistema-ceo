# ARQ-033 — Fronteira da Memória de Evolução do Produto CEO (MEP-CEO)

> **Status: Homologada — v1.0 (CTO, 14/08/2026).** Pacote MEP-CEO VIS → REQ → ARQ **homologado como especificação de fronteira**. **IMP não aberta.** Sem código.  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-033.  
> **Capacidade proprietária:** **CAP-13 — Memória de Evolução do Produto** (CAP-E; ADR-020).  
> Norma superior: CON-001; ADR-006; ADR-010; ADR-020; VIS-009 Homologada v1.0; REQ-085 Homologado v1.0; ANL-018.  
> **Finalidade:** fronteira da MEP-CEO — eixos, objectos, espaços de ID, estados, transições, alçadas, isolamento, C3 só como fronteira.  
> **Não é:** IMP; tecnologia; UI; C3 implementado; reabertura de ARQ-006, ARQ-009, ARQ-031, ARQ-017, ARQ-032.  
> **Não toca:** Motor; MRE; EIC; Gate G2; MTE; `monitorar`; CAP-04; CAP-05.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se separam, logicamente, a memória do produto CEO e a memória da organização / cliente, de modo a satisfazer REQ-085 sem absorver CAP-04/CAP-05 e sem antecipar implementação?**

Esta ARQ **não** descreve o interior de um motor, um schema físico nem um fluxo de ecrãs.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura de **fronteira** da MEP-CEO: dois bounded contexts, um portão de isolamento, objectos e estados mínimos, alçadas, log de evolução e um canal futuro de proposta desidentificada — este último só especificado. |
| **Por que existe?** | REQ-085 exige isolamento e objectos; sem fronteira explícita, a implementação futura misturaria produto e cliente. |
| **Para quem existe?** | CTO (homologação da fronteira); Usuário (alçada de baseline); Engenheiro (IMP futura — **não nesta etapa**). |
| **Como medir sucesso?** | (1) Dois eixos inconfundíveis; (2) cinco proibições de ingestão automática; (3) nove objectos + dois eixos de estado; (4) autoridade do agente limitada; (5) ponte futura descrita e **não** construída; (6) zero tecnologia; (7) zero alteração a módulos existentes. |

---

## 1. Princípios de fronteira

| ID | Princípio | Enunciado | Fundamento |
|----|-----------|-----------|------------|
| **P1** | Dois eixos, duas memórias | Produto e organização nunca partilham o mesmo depósito canónico | REQ-085 RF-01; VIS-009 §3 |
| **P2** | Recusa por omissão | Na dúvida de pertença, o item **não** entra na MEP-CEO | RN-01.1 |
| **P3** | Referência ≠ absorção | Apontar um ID externo é permitido; copiar conteúdo privado é proibido | RN-01.2; RF-06 |
| **P4** | Hipótese ≠ facto ≠ baseline | Três níveis de vigência; só a alçada do projecto sobe o nível | RF-03; RF-05 |
| **P5** | Append-only | O passado não se apaga; correcção é novo evento | RF-07 |
| **P6** | Agente propõe, projecto homologa | O CEO-agente não é dono da baseline do produto | RF-05; CON-001 Art. 6º |
| **P7** | Ponte futura é canal estreito | Necessidade de cliente vira, no máximo, proposta desidentificada — e **não agora** | RF-08 |
| **P8** | Extensão, não invasão | A MEP-CEO não emenda CAP-04, CAP-05, Motor, G2, MTE, `monitorar` | RNF-05 |
| **P9** | Independência tecnológica | Fronteira lógica; sem stack | RNF-04; ADR-010 |

---

## 2. Mapa dos dois bounded contexts

```
                    ┌──────────────────────────────────────────┐
                    │     EIXO PRODUTO — MEP-CEO               │
                    │  capacidades · épicos · módulos          │
                    │  decisões de produto · evidências        │
                    │  pendências · baselines · roadmap        │
                    │  histórico de evolução (eventos)         │
                    └──────────────────▲───────────────────────┘
                                       │
                          Portão de isolamento (C1)
                          · recusa ingestão automática
                          · referência por ID sem cópia
                          · proposta desidentificada (C3)
                            [especificado; NÃO implementado]
                                       │
                    ┌──────────────────┴───────────────────────┐
                    │  EIXO ORGANIZAÇÃO / CLIENTE              │
                    │  Memória Organizacional (CAP-05 / H)     │
                    │  Acervo de Conhecimento (CAP-04)         │
                    │  conversas · COA · operação · MRE org.   │
                    └──────────────────────────────────────────┘
```

| Context | Sede normativa vigente | O que é verdade aqui | Consumidores lógicos (futuro) |
|---------|------------------------|----------------------|-------------------------------|
| **MEP-CEO** | VIS-009 · REQ-085 · esta ARQ · **CAP-13** | O que o **produto** é / foi / propõe ser | Governação de produto; roadmap de produto; baselines |
| **Organização / cliente** | CON-001 Art. 8º · CAP-05 · ARQ-009 · CAP-04 · ARQ-031 | O que **aquela** organização decidiu, sabe e opera | EIC, MRE, condução do COA — **inalterados** |

**Não há**, nesta arquitectura, um barramento que replique conteúdo do context organização para o context produto.

---

## 3. Componentes lógicos (somente fronteira)

Três componentes. Nenhum é módulo de código. Nenhum substitui H/I/J da ARQ-009 nem a Camada da ARQ-031.

| ID | Componente | Responsabilidade única | Não faz |
|----|------------|------------------------|---------|
| **C1** | **Portão de isolamento** | Decidir pertença (produto vs organização); recusar os cinco tipos proibidos; permitir só referência por ID | Não curar Acervo; não gravar decisão Art. 8º; não ler transcripts para «aprender produto» |
| **C2** | **Registo de evolução do produto** | Guardar os nove objectos; estados; eventos append-only; consultas de produto | Não homologar sozinho; não apagar; não absorver CAP-05 |
| **C3** | **Canal de proposta desidentificada** | *(fronteira futura)* Aceitar apenas proposta `CONCEBIDO`/hipótese sem payload privado | **Não existe implementação nesta etapa**; não copia Memória da Organização; não promove facto |

### 3.1 Relação com o que já existe (sem alteração)

| Artefacto vigente | Relação com C1–C3 |
|-------------------|-------------------|
| ARQ-009 **H** Memória Organizacional Viva | Permanece no eixo organização. **Não** é C2. |
| ARQ-009 **I / J** | Condução e papéis da organização. Fora da MEP-CEO. |
| ARQ-031 Camada de Conhecimento | Acervo KNW permanece organizacional. Item KNW **não** é objecto MEP. |
| ARQ-006 K7 | Acervo ≠ Memória Organizacional. Esta ARQ acrescenta: **ambos ≠ MEP-CEO**. |
| REQ-051 Aprendizado Executivo | Retenção pós-deliberação **da organização**. Não alimenta C2 automaticamente (P2, P7). |
| ARQ-017 Motor de Execução | Intenção→encerramento operacional. **Não** é escrito por esta ARQ. |
| ARQ-032 Autoridade Delegada | Não concede, por omissão, homologar baseline MEP nem apagar histórico (REQ-085 RN-05.2). Texto da ARQ-032 **intacto**. |

---

## 4. Objectos mínimos e espaços de identificação

Nove espaços irmãos, planos, autónomos. Responsável único: **C2** (Registo de evolução do produto). Forma `MARCADOR-nnn` (ARQ-002; precedente ARQ-007). Emissão só no acto de registo; nunca reutilização; mudança de maturidade não emite ID novo (excepto nova baseline = novo `BSL-nnn`).

| Objecto | Marcador | Forma | Responsabilidade | Fora |
|---------|----------|-------|------------------|------|
| Capacidade de produto | `MCP` | `MCP-nnn` | Catálogo do que o produto deve saber fazer | ≠ `CAP-nn`; ≠ `KNW` |
| Épico de produto | `EPC` | `EPC-nnn` | Evolução acima do módulo | ≠ Job; ≠ `EPICO` documental |
| Módulo de produto | `MDL` | `MDL-nnn` | Parte identificável do produto | ≠ ficheiro/código (IMP) |
| Decisão de produto | `DCP` | `DCP-nnn` | Decisão de produto (cinco campos **do produto**) | ≠ Art. 8º da organização |
| Evidência de produto | `EVD` | `EVD-nnn` | `{ tipo, referência }` | ≠ transcript; ≠ `EV` de OE |
| Pendência de produto | `PND` | `PND-nnn` | Trabalho em aberto | ≠ Gate G2; ≠ `monitorar` |
| Baseline de produto | `BSL` | `BSL-nnn` | Recorte **congelado** | ≠ snapshot de sessão de cliente |
| Roadmap (memória) | `RMP` | `RMP-nnn` | Plano de produto como objecto | ≠ tipo documental `ROADMAP-nnn` |
| Evento de evolução | `MEV` | `MEV-nnn` | Unidade do histórico append-only | ≠ log de conversa; ≠ kernel `sistema-ceo` |

Referências cruzadas são qualificadas (ex.: `EPC-002` → `MCP-001`). **Não** copiam conteúdo de `KNW-*` nem de CAP-05.

### 4.1 Evento de evolução (campos mínimos)

Cada evento carrega, no mínimo: identidade do evento; objecto afectado; estado anterior; estado novo; quando; papel de quem actuou; evidência quando RF-06 exigir; classificação `hipótese | facto proposto | facto homologado` quando aplicável.

Eventos **não** carregam: mensagem de cliente; dossier de COA; item de Acervo.

---

## 5. Estados (máquinas lógicas)

Dois eixos **ortogonais** no mesmo objecto (REQ-085 RF-03 / RF-04).

### 5.1 Maturidade

```
CONCEBIDO → DEFINIDO → EM_CONSTRUÇÃO → EM_VALIDAÇÃO → HOMOLOGADO → BASELINE
```

| Estado | Significado de fronteira | Quem promove *para* este estado |
|--------|--------------------------|----------------------------------|
| `CONCEBIDO` | Hipótese / intenção de produto | CEO-agente **regista** |
| `DEFINIDO` | Escopo definido | **CTO** (+ Usuário se `MCP`/`EPC`) |
| `EM_CONSTRUÇÃO` | Construção em curso | **CTO** |
| `EM_VALIDAÇÃO` | Validação em curso | **CTO** |
| `HOMOLOGADO` | Aceite como produto vigente no recorte | **CTO** + **Usuário** quando o catálogo exigir |
| `BASELINE` | Congelado. Evolução = **novo** `BSL-nnn` | **Usuário** apenas. CEO-agente **nunca** |

Transições canónicas, saltos proibidos e excepções: **REQ-085 RN-03.1…03.7** (incorporados desta ARQ por referência; ANL-018 §6). Não há atalho para `BASELINE`. Append-only: correcção = novo `MEV`.

Autoridade Delegada **não** promove `HOMOLOGADO` nem `BASELINE` por omissão e **não** apaga histórico.

### 5.2 Trabalho

```
SEM_PENDÊNCIA | PENDÊNCIA_ATIVA | EM_INVESTIGAÇÃO | BLOQUEADO
```

`PENDÊNCIA_ATIVA` exige objecto Pendência associado. `BLOQUEADO` não apaga histórico. Resolver trabalho **não** promove maturidade a `BASELINE`.

---

## 6. Portão de isolamento (C1) — regras operacionais de fronteira

C1 aplica-se a **toda** escrita na MEP-CEO, inclusive propostas do CEO-agente.

### 6.1 Recusa automática (conjunto fechado)

A escrita é recusada se o payload incluir, como conteúdo armazenado:

1. dados de clientes;  
2. conversas de clientes;  
3. conhecimento operacional de clientes;  
4. decisões privadas de clientes;  
5. factos pertencentes a organizações.

«Incluir como conteúdo» cobre cópia, embedding, transcript e «resumo» que ainda identifique a organização ou o facto privado. Referência opaca a um ID **sem** copiar o conteúdo **pode** passar (P3), se o objecto restante for de produto.

### 6.2 Actos do CEO-agente no C2

| Acto | C2 |
|------|-----|
| Registar objecto em `CONCEBIDO` / organizar / consultar / propor actualização | Permitido |
| Homologar `BASELINE` | Recusado sem alçada do projecto |
| Apagar evento ou estado anterior | Recusado sempre |
| Tratar hipótese como facto vigente | Recusado |

### 6.3 O que C1 **não** faz

* Não classifica intenção conversacional (ARQ-018).  
* Não despacha Motor (ARQ-017).  
* Não altera Gate de execução.  
* Não promove itens do Acervo.

---

## 7. Canal C3 — ponte futura (especificação de fronteira apenas)

C3 **não se implementa** nesta etapa. A fronteira, quando o CTO abrir ciclo próprio, é:

```
[Observação no eixo organização]
        │  NÃO copia memória, conversa, facto, decisão privada
        ▼
[Acto explícito de proposta desidentificada]
        │  campos permitidos: tipo de lacuna de produto;
        │  capacidade/épico/módulo candidato;
        │  enunciado sem identidade de cliente;
        │  evidência não privada
        ▼
[Objecto MEP em CONCEBIDO = hipótese]
        │  NÃO é facto; NÃO é HOMOLOGADO; NÃO é BASELINE
        ▼
[C2 — só evolui depois pelas regras RF-05 / RF-06 / RF-07]
```

**Invariantes de C3**

1. Não há job, webhook, estágio MRE ou ingestão EIC que escreva C2 a partir do eixo organização.  
2. Saída máxima = proposta `CONCEBIDO`.  
3. Evolução autónoma de organizações permanece **fora** (RNF-03).

---

## 8. O que permanece fora desta ARQ (pendências **antes de IMP**, não desta homologação)

Resolvido nesta v1.0: CAP-13; espaços `MCP`…`MEV`; tabela de transições; ANL-018.

Ainda **não** decidido (não bloqueia esta homologação de fronteira; bloqueia ou condiciona IMP futura):

1. Se `RMP` passa a ser *projectado* a partir do tipo documental ROADMAP, ou apenas o referencia.  
2. Relação fina com BCO / CAP-06 (sem dependência real — ANL-018).  
3. Relação fina com o kernel `sistema-ceo` (acoplamento **proibido** até ADR própria).  
4. Qualquer IMP, VAL, código, UI, C3.

---

## 9. Conformidade com REQ-085 (rastreio)

| REQ | Como a fronteira satisfaz |
|-----|---------------------------|
| RF-01 | P1–P3; C1; §2; §6.1 |
| RF-02 | §4 (nove espaços `MCP`…`MEV`) |
| RF-03 | §5.1 + REQ-085 RN-03 |
| RF-04 | §5.2 |
| RF-05 | P4, P6; §6.2 |
| RF-06 | P3; objecto Evidência; campos do evento |
| RF-07 | P5; Histórico de evolução |
| RF-08 | P7; C3 §7 — não implementado |
| RNF-01…07 | P8, P9; dois contexts; sem UI; C3 não implementado; §11 |

---

## 10. Fora de âmbito (confirmação)

* Código, pacotes `@ceo/*`, `src/`, UI.  
* Correcção de defeitos existentes do CEO.  
* Memória de clientes.  
* Evolução autónoma de organizações.  
* Emenda a documentos homologados de outras frentes (CAP-04, CAP-05, Motor, MRE, EIC, Gate G2, MTE).

---

## 11. Estado da implementação (congelado nesta homologação)

| Item | Estado |
|------|--------|
| C3 | **NÃO** implementado |
| IMP | **NÃO** aberto |
| Código MEP-CEO | **Não existe** |
| UI | **Não existe** |
| Evolução autónoma | **Não existe** |
| Integração Motor / MRE / EIC / Gate G2 / MTE | **Não existe** |

Isolamento Produto ↔ Organização: **intacto** (P1–P3; C1; REQ-085 RF-01).

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 14/08/2026 | Engenheiro (Cursor) | Fronteira C1–C3; dois eixos; objectos e estados | Contrato CTO — ARQ só até a fronteira; sem código | Rascunho |
| 0.1 (anotação) | 14/08/2026 | Engenheiro (Cursor) | CAP-13 (ADR-020) | Formalização da CAP | Rascunho técnico aprovado |
| 1.0 | 14/08/2026 | CTO despachou; Engenheiro incorporou IDs, transições, §11 | Homologação da fronteira | Despacho CTO — homologar especificação MEP-CEO | **Homologada** |
