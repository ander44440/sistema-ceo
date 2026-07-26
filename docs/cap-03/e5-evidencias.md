# Evidências — IMP-009 E5 (Home Executiva)

> **Status: Homologada — Gate E5 APROVADO (CTO, 26/07/2026). Baseline E5 da IMP-009; preservar inalterada.**  
> Data: 25/07/2026 (execução) · 26/07/2026 (homologação).  
> Norma: IMP-009 v0.1; ARQ-012 §4; **REQ-040** (Home Executiva).  
> Pré-condição: Gates E1–E4 APROVADOS; Deliberação Oficial do CTO — Abertura da E5 (25/07/2026).  
> **Gate E5:** 🟢 APROVADO — Deliberação Oficial do CTO (26/07/2026).

---

## 1. Resultado

Foi materializado o componente **Q — Home Executiva**:

* identificação clara do COA ativo e metadados do Projeto;
* **Resumo Executivo** como composição dinâmica (não persistida);
* blocos auxiliares (decisões, conhecimentos, atividades) via Política P;
* atualização imediata após `trocarCoa` (Componente O);
* consumo exclusivo de APIs públicas E1–E3; sem regras de negócio próprias;
* conversa (E6) e navegação (E7) **não** implementadas.

**E5 Homologada (Gate E5 APROVADO). Artefatos congelados como baseline da IMP-009 / CAP-03. E1–E4 preservadas. E6+ não iniciadas. Nenhum commit autorizado neste ato.**

---

## 2. Critérios de conclusão

| Critério | Resultado | Evidência |
|----------|-----------|-----------|
| Home identifica COA ativo | **Atendido** | `montarResumo` / `home.html` |
| Resumo dinâmico, sem persistência própria | **Atendido** | teste de chaves de storage |
| Metadados + última atividade + indicadores | **Atendido** | objetivo, situação, próximo, risco, pendências |
| Atualização imediata após troca | **Atendido** | `trocarCoa` remonta Home |
| Só APIs públicas E1–E3 | **Atendido** | deps + ausência de repo direto |
| Sem E6–E8 | **Atendido** | API sem conversa/nav/migração |
| E1–E4 intactas | **Atendido** | arquivos não modificados |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/home-executiva.js` | **Criado** | Componente Q / IHome |
| `docs/cap-03/home-executiva.test.js` | **Criado** | 8 testes E5 |
| `docs/cap-03/home.html` | **Criado** | Superfície da Home |
| `docs/cap-03/e5-evidencias.md` | **Criado** | Este relatório |
| `docs/cap-03/README.md` | **Modificado** | Registro E5 |
| `docs/implementation/IMP-009-plano-de-implementacao-cap-03.md` | **Modificado** | Estado E5 |
| E1–E4 (`catalogo-coa.js`, `sessao-coa.js`, `politica-isolamento.js`, `tela-projetos.js`, `projetos.html`) | **Inalterados** | Baselines preservadas |

---

## 4. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js" "docs/cap-03/tela-projetos.test.js" "docs/cap-03/home-executiva.test.js"
```

Resultado em 25/07/2026:

```text
# tests 44
# pass 44
# fail 0
```

(8 E1 + 10 E2 + 10 E3 + 8 E4 + 8 E5)

Superfície: `docs/cap-03/home.html` (localStorage; seletor troca COA e remonta o resumo).

---

## 5. Aderência à ARQ-012 / REQ-040

| Elemento | Materialização E5 |
|----------|-------------------|
| §4.1 Q Home | `home-executiva.js` + `home.html` |
| Resumo dinâmico (não persistido) | `montarResumo()` |
| Blocos auxiliares por COA | `montarBlocos()` via P |
| §4.3 Atualização por COA | `trocarCoa` → remonta |
| IHome | `montarResumo`, `montarBlocos`, `montarHome` |
| Conversa no card principal | **Adiada à E6** (escopo CTO) |
| Menu inferior | **Adiado à E7** (escopo CTO) |

---

## 6. Escopo respeitado

**Implementado:** Home, Resumo Executivo dinâmico, blocos, seletor de COA, atualização imediata.

**Não implementado (E6–E8):** conversa contextual, navegação, migração.

**Não alterado:** E1–E4, REQs, ARQ-012, MVP.

---

## 7. Gate E5

Status: 🟢 **APROVADO** (Deliberação Oficial do CTO, 26/07/2026).

A E5 permanece **inalterada** como baseline da IMP-009, junto com E1–E4. E6 aguarda abertura formal. Sem commit neste ato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará Gate E5 |
| Quando | 25/07/2026 |
| Por quê | Materializar Home Executiva autorizada (IMP-009 E5 / REQ-040) |
| Baseado em quê | Deliberação CTO — Abertura E5; ARQ-012 §4; REQ-040; Gates E1–E4 |
| Resultado | Gate E5 APROVADO; E5 Homologada e preservada como baseline; E6 aguarda autorização; sem commit |
