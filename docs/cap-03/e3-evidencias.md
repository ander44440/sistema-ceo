# Evidências — IMP-009 E3 (Persistência Particionada e Política de Isolamento)

> **Status: Homologada — Gate E3 APROVADO (CTO, 25/07/2026). Baseline E3 da IMP-009; preservar inalterada.**  
> Data: 25/07/2026.  
> Norma: IMP-009 v0.1; ARQ-012 Homologada v1.0 (P, RepoOperacional, D4, D5, D13); REQ-039.  
> Pré-condição: Gates E1 e E2 APROVADOS; Deliberação Oficial do CTO — Abertura da E3 (25/07/2026).  
> **Gate E3:** 🟢 APROVADO — Deliberação Oficial do CTO (25/07/2026).

---

## 1. Resultado

Foi materializado o componente **P — Política de Isolamento**, encapsulando o **RepoOperacional**:

* todo registro operacional recebe/exige `coaId` do COA ativo (D4);
* operações cross-COA são rejeitadas (D5);
* listagens e leituras filtradas exclusivamente por `coaAtivoId` via Componente O (D13 / D19);
* repositório operacional não é exposto fora da política P;
* persistência em chave própria (`ceo.cap03.operacional.v1`), separada de catálogo e sessão.

**E3 Homologada (Gate E3 APROVADO). Artefatos congelados como baseline da IMP-009. E1/E2 preservadas. E4+ não iniciadas. Nenhum commit autorizado neste ato.**

---

## 2. Critérios de conclusão (IMP-009 E3)

| Critério | Resultado | Evidência |
|----------|-----------|-----------|
| Todo registro operacional exige `coaId` | **Atendido** | injeção do ativo; rejeição sem COA ativo |
| Operações cross-COA bloqueadas | **Atendido** | gravação/listagem/obter com outro `coaId` |
| D4 / D5 / D13 | **Atendido** | testes dedicados |
| Acesso só via P (sem repo bruto) | **Atendido** | API sem `inserir`/`repo`/`filtrarPorCoa` |
| Filtro pelo `coaAtivoId` de O | **Atendido** | troca de COA altera universo visível |
| E1/E2 inalteradas | **Atendido** | arquivos não modificados; 18 testes de regressão |
| Sem E4+ | **Atendido** | ausência de Home/UI/conversa/migração |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/politica-isolamento.js` | **Criado** | Componente P + RepoOperacional encapsulado |
| `docs/cap-03/politica-isolamento.test.js` | **Criado** | 10 testes automatizados E3 |
| `docs/cap-03/e3-evidencias.md` | **Criado** | Este relatório |
| `docs/cap-03/README.md` | **Modificado** | Registro do componente P / E3 |
| `docs/implementation/IMP-009-plano-de-implementacao-cap-03.md` | **Modificado** | Estado E3 (Gate pendente) |
| `docs/cap-03/catalogo-coa.js` | **Inalterado** | Baseline E1 |
| `docs/cap-03/sessao-coa.js` | **Inalterado** | Baseline E2 |

---

## 4. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js"
```

Resultado em 25/07/2026:

```text
# tests 28
# pass 28
# fail 0
```

(8 E1 + 10 E2 + 10 E3)

Casos E3:

1. D4 — `coaId` injetado do ativo;
2. D4 — bloqueio sem COA ativo;
3. D5 — gravação cross-COA bloqueada;
4. D5/D13 — `listarPorCoaId` de outro COA bloqueado;
5. D13 — listagem segue o COA ativo após troca;
6. `obter` restrito ao COA ativo;
7. encapsulamento (sem repo bruto);
8. store operacional distinto de catálogo/sessão;
9. baselines E1/E2 ainda válidas;
10. ausência de APIs E4+.

---

## 5. Aderência à ARQ-012

| Elemento | Materialização E3 |
|----------|-------------------|
| D4 — artefato operacional exige `coaId` | `normalizarRegistro` + `exigirCoaAtivo` |
| D5 — cross-COA proibido | `exigirMesmoCoaAtivo` em gravar/listar/obter |
| D13 — filtro por `coaAtivoId` | `sessao.obterAtivo()` em toda operação |
| §9.2 P + RepoOperacional | Repo interno; API só via P |
| §9.4 IRepositorioOperacional | `gravar`, `listar`, `obter`, `listarDoCoaAtivo` |
| Encapsulamento §9.5 | repo não exportado |

Contrato público P:

| Operação | Comportamento |
|----------|---------------|
| `gravar(registro)` | Injeta `coaId` do ativo; rejeita divergência |
| `listar(filtro?)` / `listarDoCoaAtivo` | Somente COA ativo |
| `listarPorCoaId(coaId)` | Somente se `coaId === coaAtivoId` |
| `obter(id, { coaId? })` | Somente no COA ativo |

---

## 6. Escopo respeitado

**Implementado:** P, RepoOperacional encapsulado, filtragem obrigatória, gravação/listagem/obtenção, rejeição de inválidos.

**Não implementado (E4+):** Home, Tela de Projetos UI, conversa, navegação, migração.

**Não alterado:** E1, E2, REQs, ARQ-012, MVP, CAP-05/07/08.

---

## 7. Gate E3

Status: 🟢 **APROVADO** (Deliberação Oficial do CTO, 25/07/2026).

A E3 permanece **inalterada** como baseline da IMP-009, junto com E1 e E2. E4 aguarda abertura formal. Sem commit neste ato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará Gate E3 |
| Quando | 25/07/2026 |
| Por quê | Materializar isolamento operacional autorizado (IMP-009 E3) |
| Baseado em quê | Deliberação CTO — Abertura E3; ARQ-012; REQ-039; Gates E1/E2 |
| Resultado | Gate E3 APROVADO; E3 Homologada e preservada como baseline; E4 aguarda autorização; sem commit |
