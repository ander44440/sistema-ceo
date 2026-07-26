# ARQ-012 — Arquitetura da Gestão de Contextos Operacionais (COA) e do Ambiente Executivo Conversacional

> **Status: Homologada — v1.0 (CTO, 25/07/2026). Fase de Arquitetura da CAP-03 encerrada.**  
> Versão 1.0 — 25/07/2026. Tipo ARQ (ADR-010).  
> **Identificação:** ARQ-012 (ARQ-011 = CAP-08).  
> **Capacidade:** CAP-03 — Gestão de Projetos (recorte inicial ÉPICO-002).  
> Norma superior: CON-001 v1.2; ADR-006; ADR-010; ADR-015; VIS-007 v0.2; **REQ-036…044 Homologados v1.0**; ARQ-008/009/010/011 **preservadas**.  
> **Abertura formal:** Deliberação Oficial do CTO — Abertura da Fase de Arquitetura da CAP-03 (25/07/2026).  
> **Gate REQ:** Aprovado.  
> Este documento define a **arquitetura funcional e lógica** para satisfazer integralmente REQ-036…044.  
> **Proibições:** não inicia implementação; não altera requisitos homologados; não produz código; não produz commits.

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organizam logicamente os componentes, modelos, repositórios, interfaces e fluxos da CAP-03 para que o CEO opere sempre sobre exatamente um COA, isole contextos na persistência e na apresentação, permita cadastro/troca/abertura, materialize a Home Executiva Conversacional e prepare a migração do acervo MG2 — sem reabrir o MVP v0.1 nem antecipar stack tecnológica?**

---

## 1. Modelo arquitetural do COA

### 1.1 Definição

O **Contexto Operacional (COA)** é a unidade persistente de isolamento e operação do CEO. Em qualquer instante de sessão existe **exatamente um** **Contexto Operacional Ativo** (REQ-037).

O COA pode representar, no modelo geral: projeto, iniciativa, programa, operação ou outro domínio executivo. Neste ciclo, a **única especialização operacional** é **Projeto** (REQ-036). O modelo é extensível; o sistema **não** oferece outras especializações nesta fase.

### 1.2 Identificador persistente

| Campo | Regra |
|-------|-------|
| `coaId` | Identificador estável, único no catálogo, imutável após criação |
| Forma | Opaca para a UI; gerada na IMP (UUID ou equivalente) |
| Referência | Toda entidade operacional **deve** carregar `coaId` (REQ-039) |

Rótulos lógicos iniciais (não necessariamente IDs finais de IMP):

| Rótulo | Nome |
|--------|------|
| `ceo` | Sistema CEO |
| `mg2` | Motoboy Game 2 |
| `ultima-milha` | Última Milha |

### 1.3 Especializações

| Campo | Valor neste ciclo |
|-------|-------------------|
| `tipo` / `especializacao` | `projeto` (único valor operacional) |
| Extensão futura | Novos valores de `tipo` exigem novo ciclo REQ/ARQ; o schema já prevê o campo |

### 1.4 Metadados do COA (especialização Projeto) — REQ-036

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| `coaId` | Sim | Identidade persistente |
| `especializacao` | Sim | `projeto` |
| `nome` | Sim | |
| `objetivoPrincipal` | Sim | |
| `descricao` | Não | |
| `statusCicloVida` | Sim | `ativo` \| `pausado` \| `concluido` — **ciclo de vida do Projeto**, não o COA da sessão |
| `ultimaAtividade` | Sim | Deve existir e ser mantida; **mecanismo de atualização** definido nesta ARQ (D11) |
| `criadoEm` / `atualizadoEm` | Sim (lógicos) | Auditoria mínima |

### 1.5 Estados (dois eixos distintos)

| Eixo | Onde vive | Valores | Significado |
|------|-----------|---------|-------------|
| Ciclo de vida do Projeto | Catálogo (N) | ativo / pausado / concluido | Estado cadastral do domínio |
| COA ativo da sessão | Sessão (O) | exatamente um `coaAtivoId` | Contexto operacional corrente |

### 1.6 Relacionamentos

```text
COA (1) ──< (N) Decisão
COA (1) ──< (N) Conhecimento
COA (1) ──< (N) EstadoDoDia / Foco / PróximoPasso
COA (1) ──< (N) TurnoConversa / Atividade
Sessão (1) ──> (1) COA ativo
```

Não há relacionamento de compartilhamento de registros entre COAs neste ciclo (REQ-039).

---

## 2. Persistência

### 2.1 Princípio

Todo registro operacional é **particionado por `coaId`**. Ausência de `coaId` = registro inválido (REQ-039).

### 2.2 Organização lógica do acervo

| Partição | Conteúdo |
|----------|----------|
| Catálogo de COAs | Metadados N (REQ-036) |
| Por `coaId` | decisões, conhecimentos, estado do dia, foco, próximo passo, turnos de conversa, atividades, pendências |

A organização **física** (arquivos, pastas, banco) é escolhida na IMP, desde que preserve:

1. partição obrigatória por `coaId`;  
2. sede **adjacente** ao MVP v0.1 (D8) — **não** alterar `docs/mvp/` congelado;  
3. possibilidade de evidência de migração (REQ-044).

### 2.3 Estratégia de armazenamento (lógica)

| Decisão | Conteúdo |
|---------|----------|
| **D12** | Repositório de catálogo separado do repositório operacional por COA |
| **D13** | Consultas sempre filtradas por `coaAtivoId` na camada de domínio; a UI não agrega cross-COA |
| **D5** | Busca/consulta cross-COA **proibida** neste ciclo |

### 2.4 Integridade e isolamento

| Garantia | Como |
|----------|------|
| Persistência | Todo write inclui `coaId` do COA ativo (exceto criação de COA no catálogo) |
| Apresentação | Nenhuma superfície exibe dados de outro COA (REQ-039, REQ-040) |
| Troca | Não altera dados do COA deixado; restaura estado persistido ao retornar (REQ-038) |

---

## 3. Seleção e troca de COA

### 3.1 Componente O — Sessão de COA Ativo

| Campo de sessão | Regra |
|-----------------|-------|
| `coaAtivoId` | Sempre definido após bootstrap |
| `coaAtivoAnteriorId` | Opcional (auditoria / confirmação mínima) |

### 3.2 Inicialização do COA ativo

Ordem de resolução (D14):

1. Último `coaAtivoId` persistido na sessão do Patrocinador, se ainda existir no catálogo.  
2. Caso contrário: COA `mg2` após migração (REQ-044), se existir.  
3. Caso contrário: primeiro COA disponível do catálogo (ex.: `ceo`).  
4. É **inválido** operar a Home sem COA (REQ-037).  
5. Na inexistência de qualquer COA cadastrado, o sistema deverá direcionar o usuário para o fluxo de criação do primeiro Projeto, impossibilitando a operação sem um COA válido.

### 3.3 Fluxo completo da troca (REQ-038)

```text
1. Ato explícito: seletor no topo da Home OU "Abrir Projeto" na Tela Projetos
2. (Opcional, D15) Confirmação mínima se houver conversa em andamento — sem burocracia (REQ-028)
3. O persiste estado do COA atual (já persistido continuamente) e define novo coaAtivoId
4. Q recarrega Home exclusivamente com dados do novo COA
5. R permanece disponível e passa a operar imediatamente no novo COA
6. Nenhuma intervenção manual adicional é exigida
```

### 3.4 Atualização automática

| Superfície | Comportamento pós-troca |
|------------|-------------------------|
| Home (Q) | Atualiza integralmente para o novo COA (REQ-040) |
| Conversa (R) | Permanece disponível; opera no novo COA (REQ-041) |
| Navegação (T) | Preserva o novo COA; não o altera por si (REQ-043) |

### 3.5 Garantias de consistência

* Atomicidade lógica da troca do ponto de vista da UI: ou o novo COA está ativo em todas as superfícies, ou a troca não conclui.  
* Estado do COA anterior permanece intacto.  
* Retorno a um COA anterior restaura o estado persistido daquele COA.

---

## 4. Home Executiva

### 4.1 Componente Q — Home Executiva (REQ-040)

Composição obrigatória, **exclusivamente** a partir do COA ativo:

| Região | Conteúdo |
|--------|----------|
| Topo | Marca CEO; saudação; seletor do COA ativo |
| Card principal | Convite + caixa de conversa (R) + exemplos |
| Resumo Executivo | Um cartão: COA/projeto, objetivo, situação atual, próximo passo recomendado, risco, pendências (ou ausência explícita por campo) |
| Blocos auxiliares | Decisões pendentes; conhecimentos recentes; atividades recentes — filtrados por `coaId` |
| Menu inferior | Navegação (REQ-043) |

> **Observação:** O Resumo Executivo é uma **composição lógica** calculada dinamicamente a partir dos dados do COA ativo e **não** constitui entidade persistente própria.

### 4.2 Fluxo de carregamento

```text
1. O resolve coaAtivoId
2. P/repositórios leem apenas dados com coaId = coaAtivoId
3. Q monta Resumo + blocos
4. R inicializa superfície conversacional no mesmo coaId
5. Renderização: posto de comando, não dashboard de métricas
```

### 4.3 Atualização por COA

Qualquer mudança de `coaAtivoId` dispara recarga completa da Home (sem refresh manual).

---

## 5. Arquitetura Conversacional

### 5.1 Componente R — Conversa Executiva (REQ-041)

Princípio vinculante:

> A conversa é a interface principal do Executivo Digital. Todos os demais componentes existem para fornecer contexto e apoiar a tomada de decisão.

### 5.2 Associação ao COA ativo

Todo turno de conversa carrega `coaId = coaAtivoId` no momento do envio. Troca de COA não mistura históricos de conversa entre contextos.

### 5.3 Contrato de turno

| Campo | Obrigatório |
|-------|-------------|
| `turnoId` | Sim |
| `coaId` | Sim |
| `textoUsuario` | Sim |
| `resposta` / `estado` | Sim (pode declarar limitação ou ausência) |
| `vigencia` de recomendações | `proposta` até confirmação (alinhado CAP-05/07/08) |
| `quando` | Sim |

### 5.4 Fluxo de comandos (lógico)

```text
Usuário digita → UI envia para R → R valida coaAtivoId →
domínio processa no escopo do COA → resposta (proposta/limitação) →
UI exibe → persistência do turno sob coaId
```

Exemplos de comando na UI são **ilustrativos**; o roteamento semântico detalhado de agentes fica fora deste ciclo (REQ-041 fora de escopo).

### 5.5 Responsabilidades UI × domínio

| Camada | Responsabilidade |
|--------|------------------|
| **UI (Q/R/T)** | Layout; captura de input; exibição; seletor; navegação; exemplos |
| **Domínio (N/O/P/R-serviço)** | Regras de COA único; isolamento; validação de `coaId`; montagem de resumo; persistência de turnos |
| **Infra (IMP)** | Stack, storage físico, eventual motor de linguagem |

A UI **não** decide isolamento; o domínio **rejeita** qualquer operação sem `coaId` válido.

---

## 6. Tela de Projetos

### 6.1 Componente N + superfície administrativa (REQ-042)

| Função | Comportamento |
|--------|---------------|
| Consulta | Lista **exclusivamente** COAs com `especializacao = projeto` |
| Cadastro | **+ Novo Projeto** → campos REQ-036 → persiste no catálogo → fica **imediatamente** listável |
| Abertura | **Abrir Projeto** → executa troca (REQ-038) via O |
| Exibição | nome, `statusCicloVida`, `ultimaAtividade` |

### 6.2 Separação de superfícies

| Superfície | Papel |
|------------|-------|
| Tela Projetos | Administrativa (especialização Projeto) |
| Home Executiva | Operacional (COA ativo + conversa) |

### 6.3 Fluxo administrativo

```text
Listar → (opcional) Novo Projeto → disponível imediatamente →
Abrir Projeto → O troca COA → Q/R atualizam
```

---

## 7. Navegação

### 7.1 Componente T — Navegação auxiliar (REQ-043)

Menu inferior com destinos:

| Destino | Comportamento |
|---------|---------------|
| Painel | Retorna à Home (Q) |
| Projetos | Abre Tela Projetos (REQ-042) |
| Conversas | Superfície mínima/esqueleto nesta fase; escopo do COA ativo |
| Memória | Superfície mínima/esqueleto; escopo do COA ativo |
| Configurações | Superfície mínima/esqueleto |

### 7.2 Preservação do COA

A navegação entre destinos **não** altera `coaAtivoId` e **não** provoca perda do contexto, exceto ação explícita de troca (REQ-038).

### 7.3 Princípio

Navegação facilita acesso a superfícies complementares; **não** desloca a conversa do centro da experiência.

---

## 8. Migração do MVP (REQ-044)

### 8.1 Componente S — Migração MG2 → COA Motoboy Game 2

Executada **somente** na IMP futura, após homologação desta ARQ. **Não** reescreve o MVP durante a VAL-005.

### 8.2 Estratégia

1. Inventariar acervo do MVP v0.1 (decisões, conhecimentos, estado do dia e correlatos do contexto MG2).  
2. Garantir existência do COA `mg2` / "Motoboy Game 2" no catálogo.  
3. Mapear cada registro origem → destino com `coaId = mg2`.  
4. Preservar identidade e relacionamentos.  
5. Validar completude quantitativa (origem = destino, salvo transformações deliberadas e documentadas).  
6. Produzir evidência rastreável do mapeamento.

A execução da migração deverá ser **idempotente**: caso o processo seja reiniciado antes da conclusão, sua repetição não poderá produzir registros duplicados nem corromper o acervo.

### 8.3 Mapeamento (lógico)

| Origem (MVP v0.1) | Destino (COA mg2) |
|-------------------|-------------------|
| decisões MG2 | Decisão + `coaId=mg2` |
| conhecimentos MG2 | Conhecimento + `coaId=mg2` |
| estado do dia / foco / próximo passo | Estado operacional + `coaId=mg2` |
| correlatos do contexto MG2 | Equivalente particionado |

### 8.4 Identidade, relacionamentos, rastreabilidade

| Requisito | Tratamento |
|-----------|------------|
| Identidade | IDs de origem preservados ou mapeados 1:1 com tabela de correspondência |
| Relacionamentos | Referências internas reescritas apenas se necessário e documentadas |
| Rastreabilidade | Artefato de evidência: origem → destino → timestamp → responsável IMP |
| Completude | Contagem origem = contagem destino (ressalvas documentadas) |
| Isolamento | Nenhum registro migrado aparece em `ceo` ou `ultima-milha` |

### 8.5 Validação

Checklist pós-migração (VAL futura / evidência IMP): critérios do REQ-044 integralmente.

### 8.6 Independência da VAL-005

A VAL-005 conclui normalmente sobre o MVP v0.1 congelado **sem** depender desta migração.

---

## 9. Componentes arquiteturais

### 9.1 Visão de camadas

```text
┌─────────────────────────────────────────────────────────────┐
│ SUPERFÍCIE (UI)                                              │
│  Q Home · R Conversa · T Navegação · Tela Projetos (N-UI)  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ DOMÍNIO                                                      │
│  N Catálogo · O Sessão · P Isolamento · R-serviço · S Migração│
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ REPOSITÓRIOS                                                 │
│  RepoCOA · RepoOperacional(coaId) · RepoSessão · RepoMigração│
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│ BASELINES PRESERVADAS (somente leitura / sucessão futura)    │
│  ARQ-008 MVP · ARQ-009/010/011                               │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Módulos / serviços / repositórios

| ID | Tipo | Responsabilidade | Fronteira |
|----|------|------------------|-----------|
| **N** | Serviço de domínio + UI admin | Cadastro/listagem de Projetos | Não define COA ativo |
| **O** | Serviço de sessão | `coaAtivoId`; troca explícita; bootstrap | Não mistura dados entre COAs |
| **P** | Política / middleware de domínio | Exige `coaId`; bloqueia cross-COA | Aplica-se a todos os repositórios operacionais |
| **Q** | Composição UI | Home / Resumo / blocos | Só consome dados do COA ativo |
| **R** | UI + serviço de conversa | Turnos; exemplos; envio | Sempre amarra ao COA ativo |
| **T** | UI navegação | Menu inferior | Não altera COA |
| **S** | Serviço de migração (IMP) | Mapeamento MVP→mg2 | Não roda na VAL-005 |
| **RepoCOA** | Repositório | Catálogo | Metadados apenas |
| **RepoOperacional** | Repositório | Dados por `coaId` | Particionado |
| **RepoSessão** | Repositório | Último COA ativo do Patrocinador | Um ativo |
| **RepoMigração** | Repositório/evidência | Mapa origem→destino | Auditoria |

**Regra de encapsulamento:** os componentes comunicam-se apenas por contratos públicos (interfaces definidas na seção 9.4), vedado acesso direto aos repositórios pertencentes a outro componente de domínio.

### 9.3 Modelos

* `COA` / `ProjetoCOA`  
* `SessaoCOA`  
* `Decisao`, `Conhecimento`, `EstadoDia`, `Atividade`, `TurnoConversa` (todos com `coaId`)  
* `MapaMigracao` (REQ-044)

### 9.4 Interfaces (lógicas)

| Interface | Operações mínimas |
|-----------|-------------------|
| `ICatalogoCOA` | criarProjeto, listarProjetos, obterPorId |
| `ISessaoCOA` | obterAtivo, trocar(coaId), bootstrap |
| `IRepositorioOperacional` | listar/gravar **somente** com filtro `coaId` |
| `IConversa` | enviar(turno), listarHistorico(coaId) |
| `IHome` | montarResumo(coaId), montarBlocos(coaId) |
| `IMigracao` | inventariar, mapear, executar, evidenciar |

### 9.5 Fronteiras

* UI não acessa repositório operacional sem passar por P/O.  
* Navegação não troca COA.  
* Migração não altera MVP durante VAL-005.  
* Baselines CAP-05/07/08 não são reabertas; consumo futuro é somente leitura no escopo do COA.  
* Componentes de domínio não acessam repositórios de outros componentes senão via interfaces públicas (9.4).

---

## 10. Decisões arquiteturais

| ID | Decisão | Justificativa | REQ |
|----|---------|---------------|-----|
| **D1** | COA é o conceito fundador; Projeto é especialização inicial | Deliberação CTO / VIS-007 | 036, 037 |
| **D2** | Exatamente um COA ativo por sessão | REQ-037 | 037 |
| **D3** | Troca sempre explícita | Autoridade do usuário; evita inferência | 038 |
| **D4** | Todo artefato operacional exige `coaId` | Isolamento estrutural | 039 |
| **D5** | Busca/consulta cross-COA proibida neste ciclo | Integridade / governança | 039 |
| **D6** | Conversa (R) é o centro; demais blocos são contexto | Princípio UX | 041 |
| **D7** | MVP v0.1 / VAL-005 intocados pela migração | Deliberação CTO | 044 |
| **D8** | Sede IMP adjacente; não patch de `docs/mvp/` | Preservar baseline | — |
| **D9** | Independência tecnológica; stack na IMP | ADR-010 | — |
| **D10** | UI pode dizer "Projetos"; modelo interno fala COA | Clareza ao usuário | 042 |
| **D11** | `ultimaAtividade` atualizada em qualquer ato operacional significativo no COA (gravação de decisão/conhecimento, envio de conversa, troca para o COA, abertura do dia) | REQ-036 exige existência/manutenção; mecanismo é da ARQ | 036 |
| **D12** | Catálogo separado do operacional | Clareza de fronteiras | 036 |
| **D13** | Filtro por `coaAtivoId` obrigatório na camada de domínio | Apresentação isolada | 039, 040 |
| **D14** | Bootstrap: último COA → mg2 pós-migração → primeiro do catálogo | Nunca operar sem COA | 037 |
| **D15** | Confirmação mínima opcional na troca se houver conversa em andamento | Risco REQ-038; sem burocracia | 038, 028 |
| **D16** | Conversas/Memória/Configurações = esqueleto nesta fase | REQ-043; evitar inflar escopo | 043 |
| **D17** | Migração 1:1 com evidência; transformações só se documentadas | Completude REQ-044 | 044 |
| **D18** | Recomendações na conversa nascem como `proposta` | Alinhamento CAP-05/07/08 | 041 |
| **D19** | O `coaAtivoId` constitui o único estado operacional global da sessão; nenhum outro componente mantém cópias independentes; toda consulta ao COA ativo ocorre por intermédio do componente O (Sessão) | Evitar duplicação de estado entre UI e domínio | 037, 038 |

---

## 11. Matriz de rastreabilidade REQ → componentes

| REQ | Componentes / decisões |
|-----|------------------------|
| 036 | N, RepoCOA, D1, D11, D12 |
| 037 | O, D2, D14, D19 |
| 038 | O, Q, R, D3, D15, D19 |
| 039 | P, RepoOperacional, D4, D5, D13 |
| 040 | Q, D6, D13 |
| 041 | R, D6, D18 |
| 042 | N + UI Projetos, D10 |
| 043 | T, D16 |
| 044 | S, RepoMigração, D7, D17 |

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Confundir statusCicloVida com COA ativo | Glossário D10; UI distinta |
| Implementar sobre MVP congelado | D8 |
| Encerrar VAL-005 cedo / depender de migração | D7 |
| Expectativa de autonomia plena na conversa | Transparência de limitações (CON-001 Art. 9º p.8) |
| Vazamento cross-COA | D4, D5, D13 |
| Inflar Conversas/Memória | D16 |
| Ambiguidade na atualização de última atividade | D11 |
| Persistência parcial da troca de COA | Aplicar atomicidade lógica da seção 3.5 antes de atualizar qualquer superfície da UI |

---

## 13. O que esta ARQ não faz

* Não altera REQ-036…044.  
* Não autoriza IMP/código/commits.  
* Não redefine ROADMAP-001.  
* Não reabre CAP-05/07/08 nem o MVP v0.1.  
* Não escolhe motor de LLM nem stack.  
* Não materializa especializações de COA além de Projeto.

---

## 14. Gate seguinte

Após **homologação** desta ARQ-012 pelo CTO (com aval do Usuário nos pontos cabíveis):

* abertura da fase **IMP** (plano IMP a numerar);  
* ainda **sem** código até deliberação explícita de implementação.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou v0.2; CTO revisou e determinou ajustes |
| Quando | 25/07/2026 |
| Por quê | Incorporar refinamentos arquiteturais antes da homologação definitiva |
| Baseado em quê | Deliberação Técnica do CTO — ARQ-012 HOMOLOGADA COM AJUSTES |
| Resultado | ARQ-012 v0.2 Em elaboração — aguarda conferência final; sem IMP; sem commit |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1-rascunho | 25/07/2026 | Engenheiro (Cursor) | Esboço pré-gate (REQ ainda Em análise) | Abertura antecipada do pacote | Substituído |
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Elaboração completa: modelo COA, persistência, troca, Home, conversa, Projetos, navegação, migração, componentes N–T/S, D1–D18, matriz REQ | Deliberação Oficial CTO — Abertura da Fase de Arquitetura | Em elaboração — revisão técnica |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: D19 estado único de sessão; bootstrap catálogo vazio; Resumo dinâmico; encapsulamento por interfaces; migração idempotente; risco troca parcial | Deliberação CTO — HOMOLOGADA COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologada após conferência final; Fase de Arquitetura da CAP-03 encerrada | Deliberação Final do CTO — ARQ-012 HOMOLOGADA; Gate ARQ aprovado | **Homologada** |
