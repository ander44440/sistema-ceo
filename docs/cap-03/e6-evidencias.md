# Evidências — IMP-009 E6 (Conversa Contextual)

> **Status: Homologada — Gate E6 APROVADO (CTO, 26/07/2026). Baseline E6 da IMP-009; preservar inalterada.**  
> Data: 26/07/2026.  
> Norma: IMP-009; ARQ-012 §5; **REQ-041**; D6, D18.  
> Pré-condição: Proposta Técnica E6 APROVADA; Gates E1–E5 Homologados.  
> Deliberações CTO: só `home.html`; processamento determinístico; exemplos fixos.  
> **Gate E6:** 🟢 APROVADO — Deliberação Oficial do CTO (26/07/2026).

---

## 1. Resultado

Foi materializado o **Componente R — Conversa Executiva**:

* `enviar` / `listarHistorico` / `montarSuperficie` (IConversa);
* COA ativo exclusivamente via O; turnos via P (`tipo: turnoConversa`);
* sem persistência adicional; sem LLM/agentes/roteamento;
* exemplos fixos ilustrativos; recomendações com `vigencia: "proposta"` (D18);
* card de conversa dominante em `home.html`; `home-executiva.js` **inalterado**.

**E6 Homologada (Gate E6 APROVADO). Artefatos congelados como baseline da IMP-009 / CAP-03. E1–E5 preservadas. E7–E8 não iniciadas. Nenhum commit autorizado neste ato.**

---

## 2. Critérios de conclusão

| Critério | Resultado | Evidência |
|----------|-----------|-----------|
| Caixa central + Enviar + exemplos | **Atendido** | `home.html` card principal |
| Turno com `coaId` do ativo | **Atendido** | `enviar` + testes |
| Histórico isolado / sem vazamento | **Atendido** | testes cross-COA |
| Continuidade pós-troca | **Atendido** | superfície no novo COA |
| D18 `vigencia: proposta` | **Atendido** | contrato do turno |
| Determinístico / limitação explícita | **Atendido** | resposta + LIMITACAO |
| Sem persistência própria | **Atendido** | só `ceo.cap03.operacional.v1` |
| E1–E5 JS inalterados | **Atendido** | diff vazio nos baselines |
| Sem E7/E8 | **Atendido** | API sem nav/migração |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/conversa-executiva.js` | **Criado** | Componente R |
| `docs/cap-03/conversa-executiva.test.js` | **Criado** | 8 testes E6 |
| `docs/cap-03/home.html` | **Estendido** | Card conversa (UI only) |
| `docs/cap-03/e6-evidencias.md` | **Criado** | Este relatório |
| `docs/cap-03/e6-proposta-tecnica.md` | **Atualizado** | Status aprovada/executada |
| `docs/cap-03/README.md` / IMP-009 | **Atualizado** | Estado E6 |
| `home-executiva.js` e demais E1–E5 JS | **Inalterados** | Baselines preservadas |

---

## 4. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js" "docs/cap-03/tela-projetos.test.js" "docs/cap-03/home-executiva.test.js" "docs/cap-03/conversa-executiva.test.js"
```

Resultado em 26/07/2026:

```text
# tests 52
# pass 52
# fail 0
```

(8+10+10+8+8+8)

---

## 5. Conformidade às deliberações do CTO

| Deliberação | Cumprimento |
|-------------|-------------|
| Estender só `home.html` | Sim — `home-executiva.js` intacto |
| Processamento determinístico | Sim — sem LLM/agentes |
| Exemplos fixos | Sim — `EXEMPLOS` constante |
| APIs públicas O/P (e Q só leitura opcional) | Sim |
| Sem persistência adicional | Sim |
| Sem E7/E8 / sem commit | Sim |

---

## 6. Gate E6

Status: 🟢 **APROVADO** (Deliberação Oficial do CTO, 26/07/2026).

A E6 permanece **inalterada** como baseline da IMP-009, junto com E1–E5. E7 aguarda abertura formal. Sem commit neste ato.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará Gate E6 |
| Quando | 26/07/2026 |
| Por quê | Implementar E6 após proposta aprovada (REQ-041) |
| Baseado em quê | Deliberação CTO — Proposta E6 APROVADA; ARQ-012 §5; IMP-009 |
| Resultado | Gate E6 APROVADO; E6 Homologada e preservada como baseline; E7 aguarda autorização; sem commit |
