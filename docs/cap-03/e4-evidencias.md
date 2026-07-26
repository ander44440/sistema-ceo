# Evidências — IMP-009 E4 (Tela de Projetos)

> **Status: Homologada — Gate E4 APROVADO (CTO, 25/07/2026). Baseline E4 da IMP-009; preservar inalterada.**  
> Data: 25/07/2026.  
> Norma: IMP-009 v0.1; ARQ-012 §6; **REQ-042** (Tela de Projetos); REQ-036 (cadastro); usa REQ-038 via O.  
> Pré-condição: Gates E1–E3 APROVADOS; Deliberação Oficial do CTO — Abertura da E4 (25/07/2026).  
> **Gate E4:** 🟢 APROVADO — Deliberação Oficial do CTO (25/07/2026).  
> **Correção documental:** a abertura citou REQ-040 por erro material; rastreabilidade oficial é **E4 → REQ-042**. **REQ-040** permanece na **E5** (Home Executiva). Sem alteração de código/ARQ/REQ.

---

## 1. Resultado

Foi materializada a **Tela de Projetos** (camada de aplicação + superfície HTML):

* listagem exclusiva de COAs da especialização Projeto;
* criação via `ICatalogoCOA.criarProjeto` (E1);
* seleção de UI e abertura via `ISessaoCOA.trocar` (E2);
* destaque do Projeto ativo; estados vazio / com projetos / seleção inválida;
* nenhuma regra de negócio duplicada; política P (E3) não alterada.

**E4 Homologada (Gate E4 APROVADO). Artefatos congelados como baseline da IMP-009. E1–E3 preservadas. E5+ não iniciadas. Nenhum commit autorizado neste ato.**

---

## 2. Critérios de conclusão

| Critério | Resultado | Evidência |
|----------|-----------|-----------|
| Listar / metadados / ativo destacado | **Atendido** | `montarEstado`; UI `projetos.html` |
| Criar / selecionar / abrir | **Atendido** | `criarProjeto`, `selecionarProjeto`, `abrirProjeto` |
| Catálogo vazio tratado | **Atendido** | `precisaCriarPrimeiroProjeto` |
| Seleção inválida tratada | **Atendido** | status `invalido` + mensagem |
| Só APIs públicas E1/E2 | **Atendido** | controller sem acesso interno à sessão |
| Sem duplicar regras | **Atendido** | delegação a catálogo/sessão |
| E1–E3 inalteradas / sem E5+ | **Atendido** | baselines + testes |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/tela-projetos.js` | **Criado** | Camada de aplicação da Tela |
| `docs/cap-03/tela-projetos.test.js` | **Criado** | 8 testes E4 |
| `docs/cap-03/projetos.html` | **Criado** | Superfície administrativa |
| `docs/cap-03/e4-evidencias.md` | **Criado** | Este relatório |
| `docs/cap-03/README.md` | **Modificado** | Registro E4 |
| `docs/implementation/IMP-009-plano-de-implementacao-cap-03.md` | **Modificado** | Estado E4 |
| `catalogo-coa.js` / `sessao-coa.js` / `politica-isolamento.js` | **Inalterados** | Baselines E1–E3 |

---

## 4. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js" "docs/cap-03/tela-projetos.test.js"
```

Resultado em 25/07/2026:

```text
# tests 36
# pass 36
# fail 0
```

(8 E1 + 10 E2 + 10 E3 + 8 E4)

Superfície manual: abrir `docs/cap-03/projetos.html` no navegador (localStorage).

---

## 5. Aderência à ARQ-012

| Elemento | Materialização E4 |
|----------|-------------------|
| §6.1 Consulta / Cadastro / Abertura | listar · criar · abrir→`trocar` |
| §6.1 Exibição | nome, statusCicloVida, ultimaAtividade |
| §6.2 Superfície administrativa | `projetos.html` (não é Home) |
| D10 | UI diz "Projetos"; domínio permanece COA |
| Encapsulamento | só contratos públicos E1/E2 |

---

## 6. Escopo respeitado

**Implementado:** Tela de Projetos, criar/selecionar/abrir, estados de UI, integração sessão/catálogo.

**Não implementado (E5+):** Home Executiva, conversa, navegação, migração.

**Não alterado:** E1–E3, política P, REQs, ARQ-012, MVP.

---

## 7. Gate E4

Status: 🟢 **APROVADO** (Deliberação Oficial do CTO, 25/07/2026).

Correção de rastreabilidade registrada: **E4 → REQ-042**; **E5 → REQ-040**. Sem mudança de código.

A E4 permanece **inalterada** como baseline. E5 aguarda abertura formal. Sem commit neste ato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará Gate E4 |
| Quando | 25/07/2026 |
| Por quê | Materializar Tela de Projetos autorizada (IMP-009 E4) |
| Baseado em quê | Deliberação CTO — Abertura E4; ARQ-012 §6; REQ-036/042; Gates E1–E3 |
| Resultado | Gate E4 APROVADO; E4 Homologada (REQ-042); correção documental REQ-040→E5; sem commit |
