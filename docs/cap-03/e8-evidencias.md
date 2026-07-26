# Evidências — IMP-009 E8 (Migração MG2)

> **Status: Homologada — Gate E8 APROVADO (CTO, 26/07/2026). Baseline E8 da IMP-009; encerra o escopo técnico da IMP-009.**  
> Data: 26/07/2026.  
> Norma: IMP-009; ARQ-012 §8; **REQ-044**; D7, D8, D17.  
> Pré-condição: Proposta Técnica E8 APROVADA; Gates E1–E7 Homologados.  
> Deliberações CTO: fixture estruturada; escopo = 3 registros + garantia do COA; sessão permanece em mg2; sem `reverter()`; sem UI.  
> **Gate E8:** 🟢 APROVADO — Deliberação Oficial do CTO (26/07/2026). **IMP-009 oficialmente ENCERRADA; CAP-03 habilitada para a VAL.**

---

## 1. Resultado

Foi materializado o **Componente S — Migração MG2 → COA "Motoboy Game 2"**:

* interface `IMigracao` completa: `inventariar`, `garantirCoaMg2`, `mapear`, `executar`, `evidenciar`;
* inventário **congelado** como fixture estruturada (deliberação 1), somente leitura;
* mapeamento **1:1** (D17) com identidade preservada — `destinoId = origemId`;
* execução **idempotente** por `origemId` via RepoMigração (chave própria de persistência);
* escrita **exclusivamente** por `politica.gravar` (Componente P), com o COA mg2 garantido e ativado antes de qualquer gravação;
* após a execução, o COA ativo **permanece** em "Motoboy Game 2" (deliberação 3);
* **sem** `reverter()` e **sem** superfície HTML (deliberações 4 e 5).

**E8 oficialmente HOMOLOGADA. Com ela, a IMP-009 está ENCERRADA (E1–E8 homologadas) e a CAP-03 habilitada para a VAL integrada. `docs/mvp/` intocado. Baselines E1–E7 intactas. Nenhum commit até a conclusão da VAL.**

---

## 2. Inventário migrado (escopo aprovado)

| Origem (MVP v0.1) | `origemId` | Tipo | Destino |
|-------------------|------------|------|---------|
| `docs/mvp/decisoes.md` | `DEC-MVP-001` | `decisao` | Registro operacional @ COA mg2 |
| `docs/mvp/conhecimentos-uso-diario.md` | `KNW-DIA-001` | `conhecimento` | Registro operacional @ COA mg2 |
| `docs/mvp/estado-do-dia.md` | `ESTADO-DIA-MG2` | `estadoDia` | Registro operacional @ COA mg2 |
| `docs/mvp/contexto-mg2.md` | — (identidade) | COA | Projeto "Motoboy Game 2" garantido no catálogo |

**Completude quantitativa (REQ-044): origem 3 ≡ destino 3.** Nenhuma transformação semântica; relacionamentos preservados (`ESTADO-DIA-MG2` mantém vínculos a `DEC-MVP-001` e `KNW-DIA-001` no conteúdo).

---

## 3. Critérios de conclusão

| # | Critério | Resultado | Evidência |
|---|----------|-----------|-----------|
| 1 | Inventário registrado e rastreável | **Atendido** | `inventario-mvp-mg2.js` + fontes `docs/mvp/*` |
| 2 | COA "Motoboy Game 2" garantido no catálogo | **Atendido** | teste `garantirCoaMg2` (cria/reutiliza sem duplicar) |
| 3 | Todos os registros sob o COA mg2 | **Atendido** | teste de execução (3/3 com `coaId` mg2) |
| 4 | Nenhum registro migrado em outros COAs | **Atendido** | teste de isolamento (Sistema CEO / Última Milha vazios) |
| 5 | Contagem origem ≡ destino (3 ≡ 3) | **Atendido** | `evidenciar()` → `completo: true` |
| 6 | Identidade/relacionamentos preservados | **Atendido** | `destinoId = origemId`; `vinculos` intactos |
| 7 | Idempotência (reexecução e reinício parcial) | **Atendido** | 2 testes dedicados — sem duplicatas |
| 8 | Sessão permanece em mg2 pós-execução | **Atendido** | teste dedicado (deliberação 3) |
| 9 | `docs/mvp/` inalterado | **Atendido** | `git status docs/mvp` sem alterações |
| 10 | Baselines E1–E7 inalteradas | **Atendido** | nenhum arquivo homologado editado; regressão verde |
| 11 | Suite CAP-03 verde | **Atendido** | **72/72** |
| 12 | VAL-005 independente (D7) | **Atendido** | migração não toca o MVP nem depende da VAL-005 |

---

## 4. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/inventario-mvp-mg2.js` | **Criado** | Fixture congelada do acervo MG2 (somente leitura) |
| `docs/cap-03/migracao-mg2.js` | **Criado** | Componente S / `IMigracao` + RepoMigração |
| `docs/cap-03/migracao-mg2.test.js` | **Criado** | 12 testes E8 |
| `docs/cap-03/e8-evidencias.md` | **Criado** | Este relatório |
| Todos os JS/HTML das E1–E7 | **Inalterados** | Baselines preservadas |
| `docs/mvp/**` | **Inalterado** | D7 / D8 |

Persistência do RepoMigração: chave própria `ceo.cap03.migracao.v1`, distinta de catálogo (`catalogo-coa.v1`), sessão (`sessao-coa.v1`) e operacional (`operacional.v1`) — verificado por teste.

---

## 5. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js" "docs/cap-03/tela-projetos.test.js" "docs/cap-03/home-executiva.test.js" "docs/cap-03/conversa-executiva.test.js" "docs/cap-03/navegacao.test.js" "docs/cap-03/migracao-mg2.test.js"
```

Resultado em 26/07/2026:

```text
# tests 72
# pass 72
# fail 0
```

(8 E1 + 10 E2 + 10 E3 + 8 E4 + 8 E5 + 8 E6 + 8 E7 + 12 E8)

Casos E8:

1. inventário congelado: 3 registros 1:1 com fontes do MVP;
2. inventário somente leitura (fixture imutável; cópias defensivas);
3. `garantirCoaMg2` cria quando ausente e reutiliza quando presente;
4. execução migra os 3 registros preservando identidade;
5. idempotência — segunda execução: 0 migrados, 3 `ja_existente`, sem duplicatas;
6. reinício parcial — item já evidenciado pulado, pendentes completados;
7. isolamento — Sistema CEO e Última Milha não veem registros migrados;
8. COA ativo permanece em "Motoboy Game 2" após executar;
9. completude quantitativa e mapa rastreável origem→destino (D17);
10. sem transformação semântica — conteúdo e vínculos idênticos à fixture;
11. RepoMigração com persistência separada das baselines;
12. API restrita ao `IMigracao` — sem `reverter()`, sem operações alheias.

---

## 6. Conformidade às deliberações do CTO

| Deliberação / restrição | Cumprimento |
|-------------------------|-------------|
| Fixture estruturada, sem parser de Markdown | Sim — `inventario-mvp-mg2.js` |
| Escopo: 1 decisão + 1 conhecimento + 1 estado do dia + COA | Sim — exatamente 3 registros + garantia |
| Sessão permanece em mg2 pós-migração | Sim — teste dedicado |
| Sem `reverter()` | Sim — ausência verificada por teste |
| Sem `migracao.html` | Sim — operação administrativa via API de S |
| Migração determinística | Sim — inventário fixo; sem aleatoriedade no fluxo |
| Idempotência por `origemId` | Sim — RepoMigração como chave de deduplicação |
| 1:1 sem transformação semântica (D17) | Sim — `destinoId = origemId`; conteúdo idêntico |
| Escrita só via contratos públicos de P | Sim — apenas `politica.gravar` / `listarDoCoaAtivo` |
| COA garantido antes da gravação | Sim — `garantirCoaMg2` + `trocar` antes de gravar |
| Inventário somente leitura / `docs/mvp/` intocado | Sim — `git status` limpo |
| E1–E7 inalteradas / sem commit | Sim |

---

## 7. Gate E8

**Status: 🟢 APROVADO** — Deliberação Oficial do CTO (26/07/2026).

A etapa IMP-009 / E8 (Migração MG2) está oficialmente HOMOLOGADA. Com esta aprovação, a **implementação da IMP-009 está ENCERRADA** (E1–E8 homologadas) e a CAP-03 encontra-se **habilitada para a Validação Integrada (VAL)**.

Nenhum commit deverá ser realizado até a conclusão da VAL e a homologação final da CAP-03.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO homologou Gate E8 |
| Quando | 26/07/2026 |
| Por quê | Homologar E8 (REQ-044) e encerrar a IMP-009 |
| Baseado em quê | Deliberação Oficial CTO — Gate E8 APROVADO; ARQ-012 §8; D7/D8/D17; IMP-009 |
| Resultado | E8 Homologada; IMP-009 encerrada; CAP-03 habilitada para VAL; 72/72; sem commit |
