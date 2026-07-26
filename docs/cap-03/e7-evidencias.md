# Evidências — IMP-009 E7 (Navegação Auxiliar)

> **Status: Homologada — Gate E7 APROVADO (CTO, 26/07/2026). Baseline E7 da IMP-009; preservar inalterada.**  
> Data: 26/07/2026.  
> Norma: IMP-009; ARQ-012 §7; **REQ-043**; D16.  
> Pré-condição: Proposta Técnica E7 APROVADA; Gates E1–E6 Homologados.  
> Deliberações CTO: estender apenas `home.html` e `projetos.html`; três esqueletos D16; Conversas sem duplicar o card da Home.  
> **Gate E7:** 🟢 APROVADO — Deliberação Oficial do CTO (26/07/2026).  
> Homologações adicionais: `menu-inferior.js` (apresentação) e `navegacao.css` (estilo).

---

## 1. Resultado

Foi materializado o **Componente T — Navegação auxiliar**:

* cinco destinos canônicos (Painel, Projetos, Conversas, Memória, Configurações);
* Painel → Home Executiva; Projetos → Tela de Projetos;
* Conversas / Memória / Configurações como **esqueleto** (D16), identificando o COA ativo;
* menu inferior inserido em `home.html` e `projetos.html`;
* T **nunca** invoca `sessao.trocar` — navegação não altera o COA ativo;
* nenhuma persistência adicional; contratos públicos E1–E6 inalterados.

**E7 oficialmente HOMOLOGADA e integrada à baseline técnica da CAP-03. E1–E6 (JS) intactos. E8 bloqueada. Nenhum commit.**

---

## 2. Critérios de conclusão

| # | Critério | Resultado | Evidência |
|---|----------|-----------|-----------|
| 1 | Cinco destinos observáveis e alcançáveis | **Atendido** | `listarDestinos` + menu nas 5 páginas |
| 2 | Painel retorna à Home | **Atendido** | destino `painel` → `home.html` |
| 3 | Projetos abre REQ-042 | **Atendido** | destino `projetos` → `projetos.html` |
| 4 | Conversas/Memória/Configurações esqueleto com COA visível | **Atendido** | 3 páginas + `menu-inferior.js` |
| 5 | Navegação não altera `coaAtivoId` | **Atendido** | teste de invariante em todos os destinos |
| 6 | Sem perda de contexto operacional | **Atendido** | histórico de conversa preservado após navegar |
| 7 | Conversa permanece centro na Home | **Atendido** | card principal mantido; menu discreto no rodapé |
| 8 | E1–E6 JS inalterados | **Atendido** | nenhum arquivo de domínio editado; 52 testes anteriores verdes |
| 9 | Sem E8 | **Atendido** | API sem migração/inventário |
| 10 | Suite CAP-03 verde | **Atendido** | 60/60 |

---

## 3. Arquivos criados ou modificados

| Caminho | Ação | Descrição |
|---------|------|-----------|
| `docs/cap-03/navegacao.js` | **Criado** | Componente T |
| `docs/cap-03/navegacao.test.js` | **Criado** | 8 testes E7 |
| `docs/cap-03/menu-inferior.js` | **Criado** | Apresentação pura do menu (sem regra de negócio) |
| `docs/cap-03/navegacao.css` | **Criado** | Estilos das páginas-esqueleto e do menu |
| `docs/cap-03/conversas.html` | **Criado** | Esqueleto (D16) |
| `docs/cap-03/memoria.html` | **Criado** | Esqueleto (D16) |
| `docs/cap-03/configuracoes.html` | **Criado** | Esqueleto (D16) |
| `docs/cap-03/home.html` | **Estendido** | Menu inferior (UI apenas) |
| `docs/cap-03/projetos.html` | **Estendido** | Menu inferior (UI apenas) |
| `docs/cap-03/e7-evidencias.md` | **Criado** | Este relatório |
| `catalogo-coa.js`, `sessao-coa.js`, `politica-isolamento.js`, `tela-projetos.js`, `home-executiva.js`, `conversa-executiva.js` | **Inalterados** | Baselines E1–E6 |

Observação: `menu-inferior.js` e `navegacao.css` não constavam nominalmente na proposta; são, respectivamente, a camada de apresentação e a folha de estilo das páginas-esqueleto já previstas — sem regra de negócio e sem persistência. Ficam submetidos à conferência do CTO.

---

## 4. Verificação automatizada

```powershell
node --test "docs/cap-03/catalogo-coa.test.js" "docs/cap-03/sessao-coa.test.js" "docs/cap-03/politica-isolamento.test.js" "docs/cap-03/tela-projetos.test.js" "docs/cap-03/home-executiva.test.js" "docs/cap-03/conversa-executiva.test.js" "docs/cap-03/navegacao.test.js"
```

Resultado em 26/07/2026:

```text
# tests 60
# pass 60
# fail 0
```

(8 E1 + 10 E2 + 10 E3 + 8 E4 + 8 E5 + 8 E6 + 8 E7)

Casos E7:

1. cinco destinos com páginas corretas;
2. esqueleto D16 em Conversas/Memória/Configurações;
3. navegação preserva `coaAtivoId` em todos os destinos;
4. T não expõe `trocar`/`bootstrap`/`gravar`/migração;
5. contexto operacional (histórico de conversa) preservado após navegar;
6. destino inválido não muda destino nem COA;
7. troca de COA permanece exclusiva de O;
8. destino padrão Painel refletido no estado.

---

## 5. Conformidade às deliberações do CTO

| Deliberação | Cumprimento |
|-------------|-------------|
| Estender apenas `home.html` e `projetos.html` | Sim — JS E1–E6 intacto |
| Três esqueletos mínimos (D16) | Sim |
| Conversas sem duplicar o card da Home | Sim — aponta para a Home |
| T nunca altera COA | Sim — `trocar` não é chamado nem exposto |
| Sem persistência adicional | Sim — nenhuma chave nova de storage |
| Sem alterar contratos públicos | Sim |
| Sem antecipar E8 / sem commit | Sim |

---

## 6. Gate E7

**Status: 🟢 APROVADO** — Deliberação Oficial do CTO (26/07/2026).

A etapa IMP-009 / E7 (Navegação Auxiliar) está oficialmente HOMOLOGADA e integra a baseline técnica da CAP-03.

E8 permanece **bloqueada** até abertura formal pelo CTO. Sem commit. Sem avanço de etapa.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO homologou Gate E7 |
| Quando | 26/07/2026 |
| Por quê | Homologar E7 (REQ-043) após evidências e suite 60/60 |
| Baseado em quê | Deliberação Oficial CTO — Gate E7 APROVADO; ARQ-012 §7; D16; IMP-009 |
| Resultado | E7 Homologada; baseline CAP-03; E8 bloqueada; sem commit |
