# ARQ-033 — Fronteira da Memória de Evolução do Produto CEO (MEP-CEO)

> **Status: Homologada — v1.1 (CTO + Usuário, 16/08/2026).** v1.0 permanece a fronteira C1+C2 homologada em 14/08/2026. Emenda **v1.2 Homologada** (transporte runtime): [`ARQ-033-fronteira-mep-ceo-v1.2.md`](./ARQ-033-fronteira-mep-ceo-v1.2.md).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-033.  
> **Capacidade proprietária:** **CAP-13 — Memória de Evolução do Produto** (CAP-E; ADR-020).  
> Norma superior: CON-001; ADR-006; ADR-010; ADR-020; VIS-009 Homologada v1.1; REQ-085 Homologado v1.1; ANL-018.  
> **Finalidade:** fronteira da MEP-CEO — eixos, objectos, espaços de ID, estados, transições, alçadas, isolamento; **v1.1:** canal C3 e UI só-leitura no Centro de Situação (contrato de arquitectura; **sem** código neste acto).  
> **Não é:** IMP; VAL; API pública; formulário; reabertura de ARQ-006, ARQ-009, ARQ-031, ARQ-017, ARQ-032; alteração de C1/C2/IMP-073.  
> **Não toca:** Motor; MRE; EIC; Gate G2; MTE; `monitorar`; CAP-04; CAP-05; F1/F2/F3; CN.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se separam, logicamente, a memória do produto CEO e a memória da organização / cliente, de modo a satisfazer REQ-085 sem absorver CAP-04/CAP-05 e sem antecipar implementação?**

A v1.0 **não** descrevia ecrãs. A v1.1 acrescenta **localização lógica** do bloco só-leitura no Centro de Situação e o contrato do acto C3 — sem markup, sem API pública e sem IMP.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura de **fronteira** da MEP-CEO: dois bounded contexts, portão C1, registo C2, canal C3 de proposta desidentificada e superfície só-leitura no Centro de Situação. |
| **Por que existe?** | REQ-085 v1.1 exige isolamento, objectos e o recorte C3/UI; sem fronteira explícita, a IMP misturaria produto e cliente ou inventaria campos. |
| **Para quem existe?** | CTO (homologação da fronteira); Usuário (alçada de baseline); Engenheiro (IMP futura — **não neste acto**). |
| **Como medir sucesso?** | (1) Dois eixos inconfundíveis; (2) fail-closed C3; (3) C3 só cria `CONCEBIDO` via C2; (4) UI só-leitura no Centro; (5) zero alteração a C1/C2/IMP-073 neste acto; (6) zero Motor/MRE/EIC/CAP-04/05. |

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
| **P7** | Ponte C3 é canal estreito | Necessidade de cliente vira, no máximo, um objecto `CONCEBIDO` / hipótese por acto explícito; fail-closed a conteúdo privado | RF-08 v1.1 |
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
                            [arquitectado v1.1; NÃO implementado neste acto]
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
| **C3** | **Canal de proposta desidentificada** | Validar acto explícito (quatro campos); recusar conteúdo proibido; pedir a C2 a criação de **um** objecto `CONCEBIDO` / hipótese; marcar origem C3 | Não duplica domínio C2; não promove maturidade; não copia Memória da Organização; não expõe API pública; não desenha formulário |

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

## 7. Canal C3 e UI só-leitura (v1.1)

C3 **está arquitectado** neste recorte. **Não** está implementado neste acto (IMP futura). C1, C2 e o adapter/store da IMP-073 **não** são emendados por esta ARQ; C3 e a UI **consomem** a superfície pública já homologada.

### 7.1 Módulo responsável

| Peça | Sede lógica (IMP futura) | Relação |
|------|--------------------------|---------|
| **C3** | Novo módulo **dentro** da pasta MEP-CEO (`mepCeo`), **irmão** de C1/C2 — não um pacote externo | Só chama a API pública de C1 (isolamento, se exposta) e de C2 (`criarObjecto`, `listarObjectos`, `consultarObjecto`). **Não** edita `isolamento.js`, `registo.js`, `adapterFs.js`, `persistencia.js`. |
| **UI C3** | Bloco no Centro de Situação (`montarCentroSituacao`, rota `dashboard` existente) | Só **lê** via C2 (`listarObjectos` filtrado). Não escreve MEP; não altera Conversa, router, Motor, MRE. |

Decisão: **não** há API HTTP, fila, webhook nem interceptor de conversa neste ciclo. O acto C3 é uma **operação interna explícita** (chamada pelo IMP de teste ou por um invocador interno futuro). Formulário = fora.

### 7.2 Acto explícito — entrada

Nome lógico: `proporEvolucaoDesidentificada`.

Entrada **única** permitida (além do papel de quem propõe):

| Campo | Tipo lógico | Obrigatório | Valores |
|-------|-------------|-------------|---------|
| `tipoLacunaProduto` | texto curto de produto | Sim | Não vazio; **não** é ID de cliente, COA, Job ou `KNW` |
| `objectoCandidato` | enumeração | Sim | exactamente `MCP` **ou** `EPC` **ou** `MDL` |
| `enunciadoDesidentificado` | texto de hipótese de produto | Sim | Sem identidade de cliente; sem transcript |
| `evidenciaNaoPrivada` | apontador | Sim | Ex.: ID de VAL/VIS/REQ/ARQ de **produto**, ou enunciado «padrão observado» — **não** ID de conversa, decisão Art. 8º, `KNW` com conteúdo, nem path de cliente |
| `papel` | papel MEP já definido em RF-05 | Sim | Usuário, CTO, CEO-agente ou Engenheiro |

Qualquer outro campo no acto (incluindo `maturidade`, `payload` privado, `transcript`, IDs de organização) → **recusa**. Omissão de qualquer obrigatório → **recusa**.

### 7.3 Sequência C3 (fail-closed)

```
[Acto explícito proporEvolucaoDesidentificada]
        │
        ├─ 1. Quatro campos + papel presentes? senão RECUSA (C2 intacto)
        ├─ 2. objectoCandidato ∈ {MCP, EPC, MDL}? senão RECUSA
        ├─ 3. Acto pede maturidade ≠ CONCEBIDO ou promoção? RECUSA (CA-085-31/40)
        ├─ 4. Matriz negativa de conteúdo proibido (§7.6) — C1 + regras C3
        │      senão RECUSA; nenhum objecto; nenhum MEV de sucesso
        ├─ 5. Dúvida de pertença (P2 / RN-01.1)? RECUSA
        │
        ▼
[Passagem a C2]
        │  criarObjecto({
        │    tipo: objectoCandidato,
        │    titulo: enunciadoDesidentificado,
        │    papel,
        │    evidencia: { tipo, referência: evidenciaNaoPrivada },
        │    payload: {
        │      tipoLacunaProduto,
        │      enunciadoDesidentificado,
        │      origemCanal: "C3"
        │    }
        │  })
        │  C2 aplica C1 de novo (já homologado) e emite MCP-nnn|EPC-nnn|MDL-nnn
        │  + um MEV de criação CONCEBIDO / hipótese
        │
        ▼
[Persistência física IMP-073]
        │  ponto de integração: o mesmo caminho que qualquer criarObjecto
        │  C3 NÃO chama o adapter nem altera o store
        ▼
[Objecto vigente em CONCEBIDO / hipótese, origemCanal = C3]
```

Se `criarObjecto` recusar, C3 propaga a recusa; **não** tenta outro tipo, **não** promove, **não** grava à margem.

**Garantia de maturidade:** C3 **nunca** passa `maturidade` a C2. A criação C2 já nasce em `CONCEBIDO` (IMP-072). C3 **não** chama `promoverMaturidade` nem `proporMaturidade`.

### 7.4 Contrato de dados (fechado)

Campos do **acto** (proponente): só a tabela §7.2.

Metadados **escritos por C3**, não pelo proponente:

| Campo | Onde | Valor |
|-------|------|--------|
| `origemCanal` | `payload` do objecto C2 | literal `"C3"` |
| `id` | objecto C2 | `MCP-nnn` / `EPC-nnn` / `MDL-nnn` emitido por C2 |
| `MEV-nnn` | evento C2 da criação | o evento **já exigido** por RF-07; C3 **não** inventa tipo de evento |
| `maturidade` | objecto C2 | sempre `CONCEBIDO` nesta passagem |
| `classificacao` | objecto C2 | `hipotese` (já derivada em C2) |

Não há quinto campo de proposta. Não há tipo MEP novo. `DCP`, `EVD`, `PND`, `BSL`, `RMP` **não** são produzidos por C3 neste ciclo.

### 7.5 Relação C3 → C2 → persistência

* C3 **não** duplica catálogo, IDs, transições nem append-only.  
* C3 **não** cria transição de maturidade: só o salto `— → CONCEBIDO` que C2 já realiza em `criarObjecto`.  
* Persistência: **reutilizar** IMP-073. Integração = «C2.criarObjecto já persiste quando a persistência está activa». Sem novo envelope, sem segundo store, sem `docs/` como store, sem `localStorage`.

### 7.6 Isolamento e recusas (matriz)

C3 recusa (fail-closed) se o acto ou o payload a persistir incluir, como conteúdo ou campo inferível:

| Proibido | Exemplos de detecção lógica |
|----------|-----------------------------|
| Identidade de cliente | nome de organização/cliente como sujeito do enunciado; IDs de COA/cliente |
| Transcript / conversa | mensagens, `conversaId`, texto de chat |
| Decisão privada | decisão Art. 8º; `DCP` de cliente; campos de decisão organizacional |
| Facto operacional | estado de operação da organização; métricas de cliente |
| Conteúdo `KNW` | corpo de item de Acervo; não apenas referência opaca **proibida neste ciclo** se vier com conteúdo |
| Memória Organizacional | cópia de CAP-05; `memoriaOrganizacional` |
| Dados de cliente | qualquer um dos cinco tipos de RF-01 |

Mais: ingestão automática (listener de conversa, job MRE, EIC, fila → C2) **não existe** nesta arquitectura. Promoção indevida: C3 não expõe nem chama promoção.

C1 continua a aplicar-se **dentro** de `criarObjecto` (já homologado). C3 faz a matriz **antes** da chamada, para não enviar lixo a C2.

### 7.7 UI — Centro de Situação (só leitura)

| Decisão | Valor |
|---------|--------|
| Superfície | **Centro de Situação**, rota `dashboard` já existente (`montarCentroSituacao`) |
| Não | Conversa; rota nova; formulário; botões de promover/criar |
| Localização | Um `section`/`article` **novo**, no fluxo do posto de comando, **depois** da fiada `cs-cmd-top` (missão / progresso / estado executivo) e **antes** de `cs-cmd-mid` (Centro de Decisões). Não entra no compositor de comando rápido. |
| Identidade de acessibilidade | `aria-label` = «Propostas de evolução do produto» |
| Consulta | `listarObjectos` (C2) filtrado: `maturidade === CONCEBIDO` **e** `payload.origemCanal === "C3"` |
| Dados exibidos (mínimo, CA-085-41) | identificador; tipo (`MCP`/`EPC`/`MDL`); `enunciadoDesidentificado`; maturidade `CONCEBIDO` |
| Origem | indicação visível de que é proposta C3 / hipótese — **não** como facto nem baseline |
| Proibido na UI (CA-085-42) | transcript; identidade de cliente; conteúdo CAP-04/05; payload bruto com chaves privadas |
| Vazio | Mensagem única: não há propostas de produto em `CONCEBIDO` via C3. Sem dados inventados; sem esconder o bloco. |

A UI **não** invoca `proporEvolucaoDesidentificada`. Percepção = leitura do que C2 já tem.

### 7.8 Não-integrações (explícito)

C3 e a UI C3 **não** dependem nem escrevem em: Motor de Execução; MRE; EIC; CAP-04; CAP-05; Gate G2; MTE; F1 / F2 / F3; classificador de intenção; conversação natural como canal de ingestão.

---

## 8. O que permanece fora desta ARQ

Resolvido na v1.0: CAP-13; espaços `MCP`…`MEV`; tabela de transições; ANL-018.  
Resolvido na v1.1: módulo C3; acto e quatro campos; fail-closed; passagem C2; `origemCanal`; UI no Centro; não-integrações.

Ainda **não** decidido (não bloqueia homologar esta v1.1; condiciona IMP **além** do recorte):

1. Se `RMP` passa a ser *projectado* a partir do tipo documental ROADMAP, ou apenas o referencia.  
2. Relação fina com BCO / CAP-06.  
3. Relação fina com o kernel `sistema-ceo` (acoplamento **proibido** até ADR própria).  
4. API pública, formulário de captura, ingestão conversacional, jobs.  
5. IMP e VAL deste recorte (**próximos actos**, não esta ARQ).

---

## 9. Conformidade com REQ-085 (rastreio)

| REQ | Como a fronteira satisfaz |
|-----|---------------------------|
| RF-01 | P1–P3; C1; §2; §6.1; §7.6 |
| RF-02 | §4 (nove espaços `MCP`…`MEV`); C3 só usa `MCP`/`EPC`/`MDL` |
| RF-03 | §5.1 + REQ-085 RN-03; C3 só `CONCEBIDO` |
| RF-04 | §5.2 |
| RF-05 | P4, P6; §6.2 |
| RF-06 | P3; evidência do acto → evidência C2 |
| RF-07 | P5; um `MEV` de criação via C2 |
| RF-08 | P7; §7 — C3 arquitectado; IMP não neste acto |
| RNF-02 | §7.7 Centro de Situação só-leitura |
| RNF-01, 03…07 | P8, P9; §7.8; CA-085-36/37 |

---

## 10. Fora de âmbito (confirmação)

* Código, IMP, VAL, API pública, formulário **neste acto**.  
* Alteração de C1, C2, IMP-073.  
* Correcção de defeitos existentes do CEO.  
* Memória de clientes; evolução autónoma de organizações.  
* Emenda a CAP-04, CAP-05, Motor, MRE, EIC, Gate G2, MTE, F1/F2/F3.

---

## 11. Estado da implementação (v1.1)

| Item | Estado |
|------|--------|
| C1 / C2 | Homologados (IMP-072); **não** alterados por esta ARQ |
| Persistência física | Homologada (IMP-073 / VAL-074); **não** alterada; ponto de integração = `criarObjecto` |
| C3 | **Arquitectado**; **NÃO** implementado |
| UI Centro (bloco C3) | **Arquitectada**; **NÃO** implementada |
| IMP C3/UI | **NÃO** aberta |
| Evolução autónoma | **Não existe** |
| Integração Motor / MRE / EIC / Gate G2 / MTE / F1–F3 | **Não existe** |

Isolamento Produto ↔ Organização: **intacto** (P1–P3; C1; REQ-085 RF-01).

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 14/08/2026 | Engenheiro (Cursor) | Fronteira C1–C3; dois eixos; objectos e estados | Contrato CTO — ARQ só até a fronteira; sem código | Rascunho |
| 0.1 (anotação) | 14/08/2026 | Engenheiro (Cursor) | CAP-13 (ADR-020) | Formalização da CAP | Rascunho técnico aprovado |
| 1.0 | 14/08/2026 | CTO despachou; Engenheiro incorporou IDs, transições, §11 | Homologação da fronteira | Despacho CTO — homologar especificação MEP-CEO | **Homologada** |
| 1.1 | 16/08/2026 | Engenheiro (Cursor) formalizou; CTO + Usuário homologaram | C3: acto, quatro campos, fail-closed, passagem C2, origemCanal; UI só-leitura no Centro (`cs-cmd-top` → bloco → `cs-cmd-mid`) | Homologação VIS-009/REQ-085 v1.1; despacho ARQ C3/UI | **Homologada** |
