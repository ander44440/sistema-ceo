# Evidências — IMP-009 E1 (Estrutura Base do Modelo COA)

> **Status: Homologada — Gate E1 APROVADO (CTO, 25/07/2026). Baseline E1 da IMP-009; preservar inalterada.**  
> Data: 25/07/2026.  
> Norma: IMP-009 v0.1; ARQ-012 Homologada v1.0 (N parcial, RepoCOA, D1, D11, D12); REQ-036 (base).  
> Pré-condição: Deliberação Oficial do CTO — Autorização para início da E1 (25/07/2026).  
> **Gate E1:** 🟢 APROVADO — Deliberação Oficial do CTO (25/07/2026).

---

## 1. Resultado

Foi materializada a fundação estrutural do Contexto Operacional (COA), especialização Projeto:

* modelo lógico `ProjetoCOA` com metadados obrigatórios da ARQ-012 §1.4;
* identificador persistente `coaId` (UUID ou equivalente), único e imutável após criação;
* catálogo persistente (RepoCOA) separado de qualquer repositório operacional (D12);
* interface pública `ICatalogoCOA`: `criarProjeto`, `listarProjetos`, `obterPorId`;
* manutenção de `ultimaAtividade` via `atualizarUltimaAtividade` (mecanismo D11 no catálogo).

**E1 Homologada (Gate E1 APROVADO). Artefatos congelados como baseline da Implementação da CAP-03. E2+ não iniciadas. Nenhum commit autorizado neste ato.**

---

## 2. Critérios de conclusão (IMP-009 E1)

| Critério | Resultado | Evidência |
|----------|-----------|-----------|
| Modelos COA / ProjetoCOA §1.4 | **Atendido** | `montarProjetoCOA`; campos congelados no retorno |
| `coaId` estável, único, imutável | **Atendido** | geração na criação; testes de unicidade e estabilidade |
| Catálogo separado do operacional (D12) | **Atendido** | chave `ceo.cap03.catalogo-coa.v1`; sem store operacional |
| Criar / listar / obter por id | **Atendido** | `ICatalogoCOA` + 8 testes |
| `statusCicloVida` ≠ COA ativo da sessão | **Atendido** | enum ativo/pausado/concluido; API sem `coaAtivoId` / sessão |
| `ultimaAtividade` existe e é mantida (D11) | **Atendido** | preenchida na criação; `atualizarUltimaAtividade` |
| Sem funcionalidades E2+ | **Atendido** | teste de ausência de APIs de sessão/Home/conversa/migração |
| MVP / baselines preservados | **Atendido** | nenhum arquivo em `docs/mvp/`, `cap-05/07/08` alterado |
| Sem commit | **Atendido** | working tree apenas |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/catalogo-coa.js` | **Criado** | Componente N (parcial) + RepoCOA |
| `docs/cap-03/catalogo-coa.test.js` | **Criado** | 8 testes automatizados E1 |
| `docs/cap-03/README.md` | **Criado** | Contrato operacional e limites E1 |
| `docs/cap-03/e1-evidencias.md` | **Criado** | Este relatório |
| `docs/implementation/IMP-009-plano-de-implementacao-cap-03.md` | **Modificado** | Registro do estado da E1 (pendente Gate) |

### Escolha tática da sede

Adotado `docs/cap-03/`, adjacente a `docs/mvp/`, pelos motivos da ARQ-012 D8:

1. preserva integralmente o MVP congelado;
2. mantém a CAP-03 explícita sem patch em baselines CAP-05/07/08;
3. reutiliza o padrão JavaScript + storage injetável já adotado no projeto;
4. permite E2+ integrar sem reabrir a E1 após o gate.

Persistência: interface `getItem` / `setItem`. Testes usam Map em memória; o navegador poderá fornecer `localStorage` na integração autorizada.

---

## 4. Verificação automatizada

Comando:

```powershell
node --test "docs/cap-03/catalogo-coa.test.js"
```

Resultado em 25/07/2026:

```text
# tests 8
# pass 8
# fail 0
# duration_ms 279.7451
```

Casos cobertos:

1. criação com metadados obrigatórios e especialização `projeto`;
2. unicidade e imutabilidade de `coaId`;
3. listagem e obtenção por id (incluindo ausência → `null`);
4. rejeição de campos obrigatórios / status inválido;
5. distinção `statusCicloVida` × ausência de sessão/`coaAtivoId`;
6. persistência D12 e recuperação entre instâncias;
7. `atualizarUltimaAtividade` (D11) sem alterar `coaId`;
8. ausência deliberada de APIs E2+.

---

## 5. Aderência à ARQ-012

| Elemento ARQ-012 | Materialização E1 |
|------------------|-------------------|
| §1.1 COA / Projeto como especialização inicial (D1) | `especializacao: "projeto"` fixo |
| §1.2 `coaId` | UUID/`crypto.randomUUID` (fallback opaco) |
| §1.3 único valor operacional `projeto` | constante `ESPECIALIZACAO.PROJETO` |
| §1.4 metadados | nome, objetivoPrincipal, descricao?, statusCicloVida, ultimaAtividade, criadoEm, atualizadoEm |
| §1.5 eixo ciclo de vida no catálogo | `statusCicloVida`; sessão **não** implementada |
| §2 / D12 catálogo separado | `STORE_KEY` exclusivo do catálogo |
| §9.2 N + RepoCOA | `criar()` retorna ICatalogoCOA |
| §9.4 ICatalogoCOA | `criarProjeto`, `listarProjetos`, `obterPorId` |
| D11 ultimaAtividade | campo + `atualizarUltimaAtividade` |

Nenhuma decisão D2–D7, D13–D19 materializada nesta etapa (pertencem a E2+).

---

## 6. Escopo respeitado (confirmação)

**Implementado (autorizado):**

1. Modelo lógico do COA  
2. Estrutura do Catálogo de COAs  
3. Modelos de dados ARQ-012 §1.4 / §9.3 (ProjetoCOA)  
4. Identificador persistente `coaId`  
5. Metadados obrigatórios  
6. Persistência inicial do catálogo  
7. Estrutura base do repositório de catálogo (RepoCOA)

**Não implementado (E2+):**

* seleção do COA ativo / `coaAtivoId`  
* bootstrap da sessão  
* troca de COA  
* política de isolamento (P) / RepoOperacional  
* Home Executiva  
* conversa contextual  
* navegação  
* migração do MVP  

**Não alterado:** REQs, ARQ-012, `docs/mvp/`, CAP-05/07/08.

---

## 7. Gate E1

Status: 🟢 **APROVADO** (Deliberação Oficial do CTO, 25/07/2026).

A E1 permanece **inalterada** como baseline da IMP-009. E2 aguarda abertura formal. Sem commit neste ato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará Gate E1 |
| Quando | 25/07/2026 |
| Por quê | Materializar fundação COA autorizada (IMP-009 E1) |
| Baseado em quê | Deliberação CTO — Autorização E1; ARQ-012; REQ-036; IMP-009 |
| Resultado | Gate E1 APROVADO; E1 Homologada e preservada como baseline; E2 aguarda autorização; sem commit |
