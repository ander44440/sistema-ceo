# Evidências — IMP-009 E2 (Sessão do Contexto Operacional Ativo)

> **Status: Homologada — Gate E2 APROVADO (CTO, 25/07/2026). Baseline E2 da IMP-009; preservar inalterada.**  
> Data: 25/07/2026.  
> Norma: IMP-009 v0.1; ARQ-012 Homologada v1.0 (O, RepoSessão, D2, D3, D14, D15, D19); REQ-037, REQ-038 (base).  
> Pré-condição: Gate E1 APROVADO; Deliberação Oficial do CTO — Abertura da E2 (25/07/2026).  
> **Gate E2:** 🟢 APROVADO — Deliberação Oficial do CTO (25/07/2026).

---

## 1. Resultado

Foi materializado o componente **O — Sessão de COA Ativo**:

* `coaAtivoId` como única fonte de verdade da sessão (D19);
* bootstrap na ordem D14 (último persistido → mg2 → primeiro do catálogo → catálogo vazio);
* operações `bootstrap()`, `obterAtivo()`, `trocar(coaId)`;
* troca explícita (D3) com confirmação mínima opcional (D15);
* persistência mínima em RepoSessão (`ceo.cap03.sessao-coa.v1`), separada do catálogo E1.

**E2 Homologada (Gate E2 APROVADO). Artefatos congelados como baseline da IMP-009. E1 preservada. E3+ não iniciadas. Nenhum commit autorizado neste ato.**

---

## 2. Critérios de conclusão (IMP-009 E2)

| Critério | Resultado | Evidência |
|----------|-----------|-----------|
| Exatamente um COA ativo por sessão | **Atendido** | `trocar` + `obterAtivo`; testes de unicidade |
| Bootstrap conforme ARQ-012 / D14 | **Atendido** | 4 resoluções cobertas por teste |
| Catálogo vazio → fluxo de criação | **Atendido** | `status: catalogo_vazio`; sem `coaAtivoId` |
| D19 — única fonte de verdade | **Atendido** | estado privado; sem setter; vista congelada |
| D15 — confirmação mínima | **Atendido** | `conversaEmAndamento` sem `confirmado` |
| Persistência da sessão | **Atendido** | `STORE_KEY` próprio; restaura entre instâncias |
| E1 inalterada | **Atendido** | `catalogo-coa.js` não modificado; 8/8 E1 passam |
| Sem E3+ | **Atendido** | teste de ausência de APIs posteriores |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/sessao-coa.js` | **Criado** | Componente O + RepoSessão / ISessaoCOA |
| `docs/cap-03/sessao-coa.test.js` | **Criado** | 10 testes automatizados E2 |
| `docs/cap-03/e2-evidencias.md` | **Criado** | Este relatório |
| `docs/cap-03/README.md` | **Modificado** | Registro do componente O / E2 |
| `docs/implementation/IMP-009-plano-de-implementacao-cap-03.md` | **Modificado** | Estado E2 (Gate pendente) |
| `docs/cap-03/catalogo-coa.js` | **Inalterado** | Baseline E1 preservada |

---

## 4. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js"
```

Resultado em 25/07/2026:

```text
# tests 18
# pass 18
# fail 0
```

(8 E1 regressão + 10 E2)

Casos E2:

1. catálogo vazio → criação do primeiro Projeto;
2. primeiro do catálogo;
3. preferência mg2 (D14);
4. restauração do último persistido;
5. exatamente um ativo após troca;
6. D19 (sem cópia gravável / sem setter);
7. D15 confirmação mínima;
8. troca inválida não altera ativo;
9. chave de sessão distinta do catálogo; E1 intocada;
10. ausência de APIs E3+.

---

## 5. Aderência à ARQ-012

| Elemento | Materialização E2 |
|----------|-------------------|
| §3.1 Componente O | `sessao-coa.js` |
| §3.2 / D14 bootstrap | ordem 1→2→3→4 |
| §3.3 / D3 troca explícita | `trocar(coaId)` |
| D15 confirmação mínima | opções `conversaEmAndamento` / `confirmado` |
| D19 estado único | `coaAtivoId` privado; consulta só via `obterAtivo` |
| §9.4 ISessaoCOA | `bootstrap`, `obterAtivo`, `trocar` |
| RepoSessão | `ceo.cap03.sessao-coa.v1` |

Resolução de `mg2` (passo 2): COA cujo `nome` é `"Motoboy Game 2"` (ou `rotuloLogico === "mg2"` se presente). Sem alteração do schema E1.

---

## 6. Escopo respeitado

**Implementado:** serviço O, bootstrap D14, `bootstrap` / `obterAtivo` / `trocar`, D19, persistência de sessão, D15.

**Não implementado (E3+):** política P, filtros operacionais, Home, conversa, navegação, migração.

**Não alterado:** E1, REQs, ARQ-012, MVP, CAP-05/07/08.

---

## 7. Gate E2

Status: 🟢 **APROVADO** (Deliberação Oficial do CTO, 25/07/2026).

A E2 permanece **inalterada** como baseline da IMP-009, junto com a E1. E3 aguarda abertura formal. Sem commit neste ato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará Gate E2 |
| Quando | 25/07/2026 |
| Por quê | Materializar sessão COA autorizada (IMP-009 E2) |
| Baseado em quê | Deliberação CTO — Abertura E2; ARQ-012; REQ-037/038; IMP-009; Gate E1 |
| Resultado | Gate E2 APROVADO; E2 Homologada e preservada como baseline; E3 aguarda autorização; sem commit |
