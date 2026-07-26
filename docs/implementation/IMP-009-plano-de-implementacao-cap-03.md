# IMP-009 — Plano de Implementação da Gestão de Contextos Operacionais (CAP-03)

> **Status: ENCERRADA — v1.0 (26/07/2026). E1–E8 Homologadas. CAP-03 Homologada (Gate Final). Congelada.**  
> Versão 0.1 — 25/07/2026. Tipo IMP (ADR-012).  
> **Identificação:** IMP-009 (IMP-008 = CAP-08 — encerrado).  
> Norma superior: CON-001 v1.2; ADR-006; ADR-012; ADR-015; VIS-007 Homologada; REQ-036…044 Homologados v1.0; ARQ-012 Homologada v1.0; ARQ-008/009/010/011 **preservadas**.  
> **Abertura formal:** Deliberação Oficial do CTO — Abertura da Fase de Implementação da CAP-03 (25/07/2026).  
> **Gate ARQ:** Aprovado. **Gates E1–E8:** Aprovados. **IMP-009 encerrada.**  
> Este documento **planeja e registra** a materialização integral da ARQ-012 (componentes N–T/S, D1–D19).  
> Evidências: [`../cap-03/`](../cap-03/). Evidências E8: [`../cap-03/e8-evidencias.md`](../cap-03/e8-evidencias.md).  
> **Proibições:** não altera REQs; não altera ARQ-012; não introduz funcionalidades fora da CAP-03; não produz commits sem autorização formal do CTO; não inicia VAL antes da conclusão da IMP.  
> **Baselines E1–E8:** preservar inalteradas. VAL integrada habilitada. Sem commit até conclusão da VAL.  
> **Rastreabilidade oficial:** E4 → REQ-042; E5 → REQ-040; E6 → REQ-041; E7 → REQ-043.

---

## 1. Objeto e premissas

Materializar integralmente a **ARQ-012 Homologada v1.0**, de modo que o CEO opere sempre sobre exatamente um Contexto Operacional Ativo (COA), isole contextos na persistência e na apresentação, permita cadastro/troca/abertura de Projetos (especialização inicial do COA), materialize a Home Executiva Conversacional e execute a migração do acervo MG2 — **sem reabrir** o MVP v0.1 nem as baselines CAP-05/07/08.

Premissas:

1. VIS-007, REQ-036…044 e ARQ-012 estão homologados; Fase de Arquitetura da CAP-03 **encerrada**.
2. Implementação **subordina-se** integralmente à ARQ-012; nenhuma decisão funcional ou arquitetural poderá ser redefinida nesta fase.
3. Incrementalidade: cada etapa (E1–E8) possui objetivo único, produz evidências verificáveis e permanece apta a revisão antes de qualquer commit.
4. Nenhuma etapa produz efeitos permanentes de uso antes do respectivo gate.
5. Idempotência: reexecução de etapa homologada sem mudança deliberada = sem alterações adicionais.
6. Tecnologia, linguagem e ferramenta **não** são decididas neste plano além do necessário à conformação da ARQ (ADR-012); escolhas táticas exigem deliberação explícita do CTO **dentro** dos limites da ARQ, sem novo escopo funcional.
7. Ajustes editoriais pendentes (nome VIS-007, pacote REQ, catálogo, roadmap) permanecem adiados ao encerramento do ciclo — natureza editorial, sem interferência na IMP.

---

## 2. Objetivo Institucional

O IMP-009 existe para transformar o CEO em Ambiente Executivo Conversacional baseado em COA, preservando a baseline do MVP v0.1 e materializando, em ordem controlada, a infraestrutura de contexto, a Home Executiva e a conversa como interface principal.

Durante a execução deste IMP:

* **não** se reabrem REQs, ARQ-012 nem ADRs de fundamento;
* **não** se introduzem especializações de COA além de Projeto;
* **não** se inicia VAL antes do encerramento da IMP;
* **não** se realiza commit sem autorização formal do CTO.

---

## 3. Critérios de Sucesso do IMP

O IMP-009 somente se considera **encerrado com sucesso** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | Componentes N, O, P, Q, R, T e S da ARQ-012 materializados no escopo homologado |
| 2 | D1–D19 observáveis na implementação (em especial D19 — `coaAtivoId` como único estado operacional global da sessão) |
| 3 | REQ-036…044 cobertos por evidência de etapa (sem lacuna obrigatória) |
| 4 | Isolamento completo entre COAs na persistência e na apresentação |
| 5 | Home Executiva conversacional operando exclusivamente sobre o COA ativo |
| 6 | Migração MG2 idempotente, com rastreabilidade origem→destino |
| 7 | Baselines MVP / CAP-05 / CAP-07 / CAP-08 preservadas (não reabertas) |
| 8 | Verificação de conformidade aprovada; nenhuma funcionalidade além do pacote homologado |

O não cumprimento de qualquer critério impede o encerramento institucional.

---

## 4. Limites do IMP-009

Este IMP **não**:

* amplia escopo além de REQ-036…044 / ARQ-012;
* altera REQs, ARQ-012 ou ADRs;
* implementa especializações de COA distintas de Projeto;
* inicia VAL nem declara sucesso operacional sem Validação homologada;
* produz commits sem autorização formal do CTO;
* reabre baselines congeladas (MVP v0.1, CAP-05, CAP-07, CAP-08).

---

## 5. Princípios de execução (obrigatórios)

| ID | Princípio |
|----|-----------|
| X1 | Não reinterpretar ARQ-012 nem alterar REQ-036…044 |
| X2 | Conformidade integral com D1–D19; `coaAtivoId` só via componente O (D19) |
| X3 | Comunicação entre componentes apenas por interfaces públicas (ARQ-012 §9.4); vedado acesso direto a repositórios alheios |
| X4 | Incrementos pequenos, verificáveis e reversíveis |
| X5 | Evidência de funcionamento por etapa antes do gate |
| X6 | Isolamento COA em toda gravação e apresentação (política P) |
| X7 | Resumo Executivo = composição dinâmica; nunca entidade persistente própria |
| X8 | Migração idempotente (ARQ-012 §8) |
| X9 | Idempotência de etapa homologada |
| X10 | Commit somente com autorização formal do CTO |

---

## 6. Etapas

### E1 — Estrutura base do modelo COA

Materializar modelos, catálogo, identificadores e persistência inicial do COA (especialização Projeto).

**Componentes / decisões:** N (parcial — modelo/catálogo), RepoCOA; D1, D11, D12.  
**REQs:** 036 (base).  
**Escopo:**

* modelos `COA` / `ProjetoCOA` com campos da ARQ-012 §1.4;
* `coaId` estável, único, imutável;
* catálogo persistente separado do operacional;
* criação mínima de Projeto (nome, objetivo, descrição opcional, statusCicloVida, ultimaAtividade).

**Critérios de conclusão:** catálogo cria/lista/obtém por id; statusCicloVida ≠ COA ativo da sessão; evidência de testes unitários/contrato.  
**Estado (25/07/2026):** ✅ **Homologada** — Gate E1 APROVADO (Deliberação Oficial do CTO, 25/07/2026). Artefatos: `docs/cap-03/catalogo-coa.js` + 8 testes (8 pass / 0 fail); relatório [`../cap-03/e1-evidencias.md`](../cap-03/e1-evidencias.md).  
**Baseline E1:** preservar inalterada. **E2:** aguarda autorização formal. **Sem commit sem autorização.**

---

### E2 — Sessão do COA ativo

Materializar o componente O, bootstrap, troca, D19 e bases do isolamento de sessão.

**Componentes / decisões:** O, RepoSessão; D2, D3, D14, D15, D19.  
**REQs:** 037, 038 (base).  
**Escopo:**

* `coaAtivoId` como único estado operacional global da sessão (D19);
* bootstrap: último COA → mg2 (quando aplicável) → primeiro do catálogo; catálogo vazio → fluxo de criação do primeiro Projeto (sem operar sem COA válido);
* troca explícita com preservação do estado persistente do COA anterior;
* atomicidade lógica da troca antes de qualquer atualização de superfície;
* confirmação mínima opcional se houver conversa em andamento (D15).

**Critérios de conclusão:** exatamente um COA ativo; troca restaura estado ao retornar; nenhum outro componente mantém cópia independente de `coaAtivoId`; evidências de teste.  
**Estado (25/07/2026):** ✅ **Homologada** — Gate E2 APROVADO (Deliberação Oficial do CTO, 25/07/2026). Artefatos: `docs/cap-03/sessao-coa.js` + 10 testes E2; regressão E1 8/8; total 18/18; relatório [`../cap-03/e2-evidencias.md`](../cap-03/e2-evidencias.md).  
**Baseline E2:** preservar inalterada. **E3:** aguarda autorização formal. **Sem commit sem autorização.**

---

### E3 — Persistência particionada

Materializar repositórios operacionais, política P e validações de `coaId`.

**Componentes / decisões:** P, RepoOperacional; D4, D5, D13.  
**REQs:** 039.  
**Escopo:**

* toda entidade operacional carrega `coaId`;
* consultas/gravações filtradas por `coaAtivoId` na camada de domínio;
* política P bloqueia operações cross-COA;
* UI não agrega dados de outros COAs.

**Critérios de conclusão:** tentativa de leitura/escrita cross-COA rejeitada; teste de regressão de isolamento; encapsulamento por interfaces públicas.  
**Estado (25/07/2026):** ✅ **Homologada** — Gate E3 APROVADO (Deliberação Oficial do CTO, 25/07/2026). Artefatos: `docs/cap-03/politica-isolamento.js` + 10 testes E3; total 28/28; relatório [`../cap-03/e3-evidencias.md`](../cap-03/e3-evidencias.md).  
**Baseline E3:** preservar inalterada. **E4:** aguarda autorização formal. **Sem commit sem autorização.**

---

### E4 — Tela de Projetos

Materializar cadastro, listagem e abertura (ativação do COA) na superfície administrativa.

**Componentes / decisões:** N + UI Projetos; D10.  
**REQs (rastreabilidade oficial):** **042** (Tela de Projetos); 036 (cadastro); usa 038 (abertura via O).  
**Escopo:**

* listagem exclusiva de COAs da especialização Projeto;
* Novo Projeto (campos REQ-036);
* Abrir Projeto = troca de COA (REQ-038) via O;
* disponibilidade imediata após cadastro.

**Critérios de conclusão:** listar / criar / abrir verificáveis; Home ainda pode ser mínima nesta etapa; evidências de UI + domínio.  
**Estado (25/07/2026):** ✅ **Homologada** — Gate E4 APROVADO (Deliberação Oficial do CTO, 25/07/2026). Artefatos: `tela-projetos.js` + `projetos.html` + 8 testes E4; total 36/36; relatório [`../cap-03/e4-evidencias.md`](../cap-03/e4-evidencias.md).  
**Baseline E4:** preservar inalterada. **E5:** aguarda autorização formal. **Sem commit sem autorização.**

---

### E5 — Home Executiva

Materializar composição dinâmica da Home, Resumo Executivo e blocos auxiliares.

**Componentes / decisões:** Q, IHome; D6, D13.  
**REQs (rastreabilidade oficial):** **040** (Home Executiva baseada no COA).  
**Escopo:**

* Home construída exclusivamente a partir do COA ativo;
* Resumo Executivo calculado dinamicamente (não persistido);
* blocos: decisões pendentes, conhecimentos recentes, atividades recentes do COA;
* atualização automática após troca de COA.

**Critérios de conclusão:** troca de COA atualiza toda a Home sem intervenção manual; ausência explícita quando vazio; evidências.  
**Estado (26/07/2026):** ✅ **Homologada** — Gate E5 APROVADO (Deliberação Oficial do CTO, 26/07/2026). Artefatos: `home-executiva.js` + `home.html` + 8 testes E5; total 44/44; relatório [`../cap-03/e5-evidencias.md`](../cap-03/e5-evidencias.md).  
**Baseline E5:** preservar inalterada. **E6:** aguarda autorização formal. **Sem commit sem autorização.**

---

### E6 — Conversa contextual

Materializar associação da conversa ao COA, histórico e isolamento.

**Componentes / decisões:** R, IConversa; D6, D18.  
**REQs:** 041.  
**Escopo:**

* caixa de conversa como interface principal da Home;
* todo turno associado ao `coaAtivoId`;
* histórico isolado por COA;
* continuidade imediata após troca de COA;
* recomendações nascem como `proposta` (D18).

**Critérios de conclusão:** envio/listagem amarrados ao COA; sem vazamento de histórico; predominância visual da conversa; evidências.  
**Estado (26/07/2026):** ✅ **Homologada** — Gate E6 APROVADO (Deliberação Oficial do CTO, 26/07/2026). Artefatos: `conversa-executiva.js` + extensão `home.html` + 8 testes E6; total 52/52; relatório [`../cap-03/e6-evidencias.md`](../cap-03/e6-evidencias.md).  
**Baseline E6:** preservar inalterada. **E7:** Homologada. **E8:** aguarda autorização formal. **Sem commit sem autorização.**

---

### E7 — Navegação

Materializar menu inferior e superfícies auxiliares preservando o COA.

**Componentes / decisões:** T; D16.  
**REQs:** 043.  
**Escopo:**

* destinos: Painel, Projetos, Conversas, Memória, Configurações;
* Conversas / Memória / Configurações em formato mínimo (esqueleto — D16);
* navegação **não** altera COA (exceto ação explícita REQ-038);
* Painel retorna à Home Executiva.

**Critérios de conclusão:** cinco destinos disponíveis; COA preservado na navegação; conversa permanece fluxo principal; evidências.  
**Estado (26/07/2026):** ✅ **Homologada** — Gate E7 APROVADO (Deliberação Oficial do CTO, 26/07/2026). Artefatos: `navegacao.js`, `menu-inferior.js`, `navegacao.css`, esqueletos `conversas.html` / `memoria.html` / `configuracoes.html`, extensão de `home.html` e `projetos.html`, 8 testes E7; total 60/60; relatório [`../cap-03/e7-evidencias.md`](../cap-03/e7-evidencias.md).  
**Baseline E7:** preservar inalterada. **E8:** autorizada — proposta em revisão. **Sem commit sem autorização.**

---

### E8 — Migração MG2

Materializar inventário, mapeamento, execução idempotente e validação da migração do acervo MVP → COA Motoboy Game 2.

**Componentes / decisões:** S, RepoMigração; D7, D17.  
**REQs:** 044.  
**Escopo:**

* inventário do acervo MG2 do MVP v0.1;
* mapeamento 1:1 com preservação de identidade e relacionamentos;
* execução idempotente (reinício sem duplicar nem corromper);
* evidência origem→destino; contagem origem ≡ destino (salvo transformações documentadas);
* independência da conclusão da VAL-005.

**Critérios de conclusão:** migração completa e idempotente; sem contaminação cross-COA; relatório de evidências; Critérios de Sucesso §3 itens 1–7 atendidos.  
**Estado (26/07/2026):** ✅ **Homologada** — Gate E8 APROVADO (Deliberação Oficial do CTO, 26/07/2026). Artefatos: `inventario-mvp-mg2.js` (fixture), `migracao-mg2.js` (Componente S / `IMigracao` + RepoMigração), 12 testes E8; total 72/72; relatório [`../cap-03/e8-evidencias.md`](../cap-03/e8-evidencias.md). Sessão permanece em mg2 pós-execução; sem `reverter()`; sem UI (deliberações CTO).  
**Baseline E8:** preservar inalterada. **Gate E8:** 🟢 APROVADO — encerra o escopo técnico da IMP-009. **Sem commit sem autorização.**

---

## 7. Ordem e dependências

```text
E1 (modelo/catálogo) → E2 (sessão/D19) → E3 (P/repos) → E4 (UI Projetos)
    → E5 (Home) → E6 (Conversa) → E7 (Navegação) → E8 (Migração)
```

| Dependência | Motivo |
|-------------|--------|
| E2 após E1 | Sessão seleciona COAs do catálogo |
| E3 após E2 | Isolamento aplica-se sobre COA ativo conhecido |
| E4 após E3 | Abertura grava/lê com política P |
| E5 após E4 | Home consome COA ativável pela UI de Projetos |
| E6 após E5 | Conversa é centro da Home já composta |
| E7 após E6 | Navegação auxilia sem deslocar a conversa |
| E8 após E7 | Migração após ambiente operacional estável |

Cada Gate En homologado autoriza exclusivamente En+1.

---

## 8. Artefatos por etapa

| Etapa | Artefatos esperados (lógicos — sem prescrever tecnologia) |
|-------|-------------------------------------------------------------|
| E1 | Modelos COA/Projeto; RepoCOA; testes de catálogo |
| E2 | Componente O; RepoSessão; bootstrap; troca; testes D19 |
| E3 | Política P; RepoOperacional; testes de isolamento |
| E4 | Superfície Tela de Projetos; fluxos criar/listar/abrir |
| E5 | Componente Q; Resumo dinâmico; blocos auxiliares |
| E6 | Componente R; histórico por COA; envio contextual |
| E7 | Componente T; esqueletos Conversas/Memória/Configurações |
| E8 | Serviço S; mapa de migração; evidências; relatório de conformidade |

Sede prevista de evidências: `docs/cap-03/` (a criar na primeira etapa que produzir artefato documental de execução).

---

## 9. Matriz de rastreabilidade

| REQ | Etapa(s) IMP-009 | Componentes ARQ-012 |
|-----|------------------|---------------------|
| 036 | E1, E4 | N, RepoCOA, D1, D11, D12 |
| 037 | E2 | O, D2, D14, D19 |
| 038 | E2, E4 | O, Q, R, D3, D15, D19 |
| 039 | E3 | P, RepoOperacional, D4, D5, D13 |
| 040 | E5 | Q, D6, D13 |
| 041 | E6 | R, D6, D18 |
| 042 | E4 | N + UI Projetos, D10 |
| 043 | E7 | T, D16 |
| 044 | E8 | S, RepoMigração, D7, D17 |

Cadeia: `VIS-007 → REQ-036…044 → ARQ-012 → IMP-009 → (código/evidências) → VAL (futura)`

---

## 10. Política de commits e gates

1. Cada etapa E1–E8 produz evidências e submete-se ao **Gate En** do CTO.
2. **Nenhum commit** ocorre sem autorização formal do CTO.
3. Código produzido antes do gate permanece em working tree / revisão, não em baseline permanente.
4. Após Gate En aprovado e commit autorizado (se houver), inicia-se En+1.
5. VAL permanece **bloqueada** até conclusão da IMP.

---

## 11. Ajustes editoriais adiados (não bloqueiam a IMP)

Conforme deliberação do CTO, permanecem para o encerramento completo do ciclo:

* atualização do nome definitivo da VIS-007;
* atualização do nome do pacote REQ;
* atualização do catálogo de artefatos e respectivos status;
* atualização do Roadmap Executivo da CAP-03.

---

## 12. Situação oficial

| Fase | Status |
|------|--------|
| VIS-007 | ✅ Concluída |
| REQ-036…044 | ✅ Concluída |
| ARQ-012 | ✅ Concluída |
| **IMP-009** | 🟢 **Aberta — Em execução v0.1** |
| E1–E8 | ✅ Homologadas — baselines preservadas |
| **IMP-009** | ✅ **ENCERRADA** — todas as etapas homologadas |
| VAL-003 | ✅ Homologada — **ENCERRADA** (Gate Final) |
| CAP-03 | ✅ **Homologada v1.0** — baseline oficial |

**Próximo ato:** publicação da baseline (commit + push) conforme Gate Final; em seguida, deliberação do CTO sobre a próxima iniciativa.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO autorizou abertura |
| Quando | 25/07/2026 |
| Por quê | Materializar CAP-03 após Gate ARQ aprovado (ARQ-012 Homologada v1.0) |
| Baseado em quê | Deliberação Oficial do CTO — Abertura da Fase de Implementação da CAP-03; VIS-007; REQ-036…044; ARQ-012; ADR-006; ADR-012 |
| Resultado | E1 Homologada (Gate E1 APROVADO); baseline E1 preservada; E2 aguarda autorização; sem commit |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Abertura formal: objeto, critérios, E1–E8, rastreabilidade, política de commits | Deliberação Oficial CTO — Abertura da Fase de Implementação da CAP-03 | Em elaboração |
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Execução E1: RepoCOA / ICatalogoCOA; evidências; 8 testes | Autorização CTO — início E1 | E1 técnica concluída; Gate E1 pendente |
| 0.1 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E1 APROVADO; E1 como baseline da IMP CAP-03; E2 aguarda autorização | Deliberação Oficial CTO — Gate E1 | **E1 Homologada** |
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Execução E2: componente O / ISessaoCOA; evidências; 18 testes | Deliberação Oficial CTO — Abertura E2 | E2 técnica concluída; Gate E2 pendente |
| 0.1 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E2 APROVADO; baselines E1/E2 preservadas; E3 aguarda autorização | Deliberação Oficial CTO — Gate E2 | **E2 Homologada** |
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Execução E3: componente P / RepoOperacional; evidências; 28 testes | Deliberação Oficial CTO — Abertura E3 | E3 técnica concluída; Gate E3 pendente |
| 0.1 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E3 APROVADO; baselines E1–E3 preservadas; E4 aguarda autorização | Deliberação Oficial CTO — Gate E3 | **E3 Homologada** |
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Execução E4: Tela de Projetos; evidências; 36 testes | Deliberação Oficial CTO — Abertura E4 | E4 técnica concluída; Gate E4 pendente |
| 0.1 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E4 APROVADO; correção documental E4→REQ-042 / E5→REQ-040; baselines E1–E4 preservadas | Deliberação Oficial CTO — Gate E4 | **E4 Homologada** |
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Execução E5: Home Q / Resumo dinâmico; evidências; 44 testes | Deliberação Oficial CTO — Abertura E5 | E5 técnica concluída; Gate E5 pendente |
| 0.1 | 26/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E5 APROVADO; E5 integra baseline CAP-03; E6 aguarda autorização | Deliberação Oficial CTO — Gate E5 | **E5 Homologada** |
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Proposta técnica E6 (REQ-041 / Componente R); sem implementação | Autorização formal CTO — Abertura E6 | Proposta em revisão |
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Execução E6 conforme proposta aprovada; 52 testes; Gate E6 pendente | Deliberação CTO — Proposta E6 APROVADA | E6 técnica concluída |
| 0.1 | 26/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E6 APROVADO; E6 integra baseline CAP-03; E7 aguarda autorização | Deliberação Oficial CTO — Gate E6 | **E6 Homologada** |
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Proposta técnica E7 (REQ-043 / Componente T); sem implementação | Autorização formal CTO — Abertura E7 | Proposta em revisão |
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Execução E7 conforme proposta aprovada; Componente T, esqueletos D16, menu em `home.html`/`projetos.html`; 60 testes; Gate E7 pendente | Deliberação CTO — Proposta E7 APROVADA | E7 técnica concluída |
| 0.1 | 26/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E7 APROVADO; E7 integra baseline CAP-03; `menu-inferior.js` e `navegacao.css` homologados; E8 aguarda autorização | Deliberação Oficial CTO — Gate E7 | **E7 Homologada** |
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Proposta técnica E8 (REQ-044 / Componente S); inventário MVP registrado; sem implementação | Autorização formal CTO — Abertura E8 | Proposta em revisão |
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Execução E8 conforme proposta aprovada; Componente S + fixture + RepoMigração; 12 testes; 72/72; Gate E8 pendente | Deliberação CTO — Proposta E8 APROVADA | E8 técnica concluída |
| 1.0 | 26/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate E8 APROVADO; E8 integra baseline CAP-03; **IMP-009 ENCERRADA** (E1–E8 homologadas); CAP-03 habilitada para VAL | Deliberação Oficial CTO — Gate E8 / Encerramento IMP-009 | **IMP-009 Encerrada** |
| 1.0 | 26/07/2026 | Engenheiro (Cursor) | VAL-003 executada (sem alteração de código); 36 C / 0 NC / 3 OE; recomendação favorável à homologação final | Autorização formal CTO — VAL-003 | VAL submetida ao Gate Final |
| 1.0 | 26/07/2026 | CTO (homologação) / Engenheiro (registro) | Gate Final CAP-03 APROVADO; VAL-003 ENCERRADA; CAP-03 Homologada v1.0; OE arquivadas; commit/push da baseline autorizados | Deliberação Oficial CTO — Gate Final CAP-03 | **CAP-03 Homologada** |
