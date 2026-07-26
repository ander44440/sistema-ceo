# Proposta Técnica — IMP-009 E7 (Navegação Auxiliar)

> **Status: Proposta APROVADA; E7 Homologada — Gate E7 APROVADO (CTO, 26/07/2026).**  
> Norma: IMP-009; ARQ-012 §7; **REQ-043**; D16; Gates E1–E7 Homologados.  
> Autorização: Deliberação Oficial do CTO — Abertura formal da E7 (26/07/2026).  
> **Proposta:** APROVADA (CTO, 26/07/2026). Evidências: [`e7-evidencias.md`](e7-evidencias.md) — Homologada.  
> **Proibição vigente:** sem commit; não iniciar E8 até abertura formal.

---

## 1. Objetivo da etapa

Materializar o **Componente T — Navegação auxiliar**, oferecendo menu inferior com os cinco destinos previstos (Painel, Projetos, Conversas, Memória, Configurações), **preservando sempre o COA ativo** e sem deslocar a conversa do papel de interface principal (REQ-043 / ARQ-012 §7 / D16).

---

## 2. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | **REQ-043** (navegação auxiliar da Home) |
| Dependências | REQ-040 (Home), REQ-041 (conversa), REQ-042 (Projetos), REQ-037/038/039 (COA) |
| ARQ | ARQ-012 §7; Componente T; D16 |
| Componentes pré-existentes (somente consumo) | O (E2), Q/Home (E5), R (E6), Tela Projetos (E4) |
| Fora desta etapa | E8 (migração S / REQ-044) |

---

## 3. Escopo proposto (implementar após aprovação)

### 3.1 Domínio / orquestração — Componente T (`navegacao.js`)

| Operação | Comportamento |
|----------|---------------|
| `listarDestinos()` | Retorna os cinco destinos canônicos com ids e rótulos |
| `destinoAtual()` / `irPara(destinoId)` | Estado de destino ativo; **não** chama `sessao.trocar` |
| `montarEstado()` | Destino corrente + `coaAtivoId` (somente leitura via O) + flags de esqueleto |
| `preservaCoa(antes, depois)` | Verificação explícita: navegação não altera `coaAtivoId` |

**Regra vinculante:** nenhuma operação de T altera o COA ativo. Troca de COA permanece exclusiva de O (seletor / Abrir Projeto — REQ-038).

### 3.2 Destinos

| Destino | Id | Superfície | Conteúdo nesta etapa |
|---------|-----|------------|----------------------|
| Painel | `painel` | `home.html` | Home + conversa (E5/E6) — centro da experiência |
| Projetos | `projetos` | `projetos.html` | Tela administrativa (E4) |
| Conversas | `conversas` | `conversas.html` (novo) | **Esqueleto** (D16): identifica COA ativo; aponta que o fluxo conversacional principal está na Home |
| Memória | `memoria` | `memoria.html` (novo) | **Esqueleto** (D16): identifica COA ativo; ausência explícita / “em evolução” |
| Configurações | `configuracoes` | `configuracoes.html` (novo) | **Esqueleto** (D16): mínimo informativo; sem configurações avançadas |

### 3.3 Menu inferior (UI)

* Bloco de navegação compartilhado (markup + estilos) inserido nas superfícies HTML da CAP-03.
* Destino ativo destacado visualmente.
* Clique navega entre páginas **sem** modificar sessão/COA.
* Na Home, o menu **não** compete visualmente com a caixa de conversa (REQ-041 / REQ-043).

### 3.4 Preferência técnica (recomendada)

1. Novo módulo `navegacao.js` (T) — baseline nova da E7.
2. Novas páginas-esqueleto: `conversas.html`, `memoria.html`, `configuracoes.html`.
3. Extensão **mínima** de `home.html` e `projetos.html` **somente** para incluir o menu inferior (analogia à E6: extensão de superfície HTML, sem alterar JS de domínio E1–E6).
4. **Não modificar** `catalogo-coa.js`, `sessao-coa.js`, `politica-isolamento.js`, `tela-projetos.js`, `home-executiva.js`, `conversa-executiva.js`.

---

## 4. Fora do escopo (explícito)

* Migração MVP / Componente S (E8 / REQ-044).
* Conteúdo rico de Conversas/Memória/Configurações além do esqueleto (D16).
* Configurações avançadas (REQ-043 fora de escopo).
* Alteração de baselines JS E1–E6.
* Qualquer navegação que dispare `trocar` / bootstrap / gravação operacional.
* Multi-dispositivo / apps nativos.

---

## 5. Critérios de aceitação (Gate E7)

| # | Critério | Evidência esperada |
|---|----------|-------------------|
| 1 | Cinco destinos observáveis e alcançáveis | UI + testes |
| 2 | Painel → Home (`home.html`) | navegação |
| 3 | Projetos → Tela Projetos (`projetos.html`) | navegação |
| 4 | Conversas / Memória / Configurações = esqueleto com COA visível | HTML + estado |
| 5 | Navegação **não** altera `coaAtivoId` | testes com O |
| 6 | Sem perda de contexto operacional na troca de destino | testes |
| 7 | Conversa permanece centro na Home (menu auxiliar) | inspeção UI |
| 8 | E1–E6 JS inalterados | diff / regressão |
| 9 | Sem E8 | API/UI sem migração |
| 10 | Suite CAP-03 verde | `node --test` |

---

## 6. Artefatos previstos (após aprovação da proposta)

| Artefato | Ação |
|----------|------|
| `docs/cap-03/navegacao.js` | Criar — Componente T |
| `docs/cap-03/navegacao.test.js` | Criar — testes E7 |
| `docs/cap-03/conversas.html` | Criar — esqueleto |
| `docs/cap-03/memoria.html` | Criar — esqueleto |
| `docs/cap-03/configuracoes.html` | Criar — esqueleto |
| `docs/cap-03/home.html` | Extender — menu inferior |
| `docs/cap-03/projetos.html` | Extender — menu inferior |
| `docs/cap-03/e7-evidencias.md` | Criar — relatório Gate E7 |
| README / IMP-009 | Atualizar status |

---

## 7. Ordem de execução (pós-aprovação)

1. Implementar T (`listarDestinos`, `irPara`, `montarEstado`, garantia de COA).
2. Testes de preservação de `coaAtivoId` e destinos.
3. Criar esqueletos Conversas / Memória / Configurações.
4. Inserir menu inferior em Home e Projetos.
5. Regressão E1–E6 + evidências E7.
6. Submeter **Gate E7** — interromper; sem E8.

---

## 8. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Inflar Conversas/Memória | D16 — esqueleto apenas |
| Menu deslocar a conversa | Card conversa permanece dominante na Home; menu inferior discreto |
| Navegação alterar COA por acidente | T nunca chama O.trocar; testes de invariante |
| Pressão para alterar E4–E6 JS | Só HTML + novo `navegacao.js` |

---

## 9. Decisões a confirmar pelo CTO

1. **Integração UI:** aprovar extensão mínima de `home.html` e `projetos.html` (menu) sem alterar JS E1–E6?
2. **Esqueletos:** três páginas HTML novas (Conversas / Memória / Configurações) são suficientes nesta fase (D16)?
3. **Conversas:** esqueleto que redireciona atenção à Home (sem duplicar o card R) — aprovado?

---

## 10. Situação

| Item | Estado |
|------|--------|
| E7 | 🟢 Autorizada para abertura — **proposta em revisão** |
| Implementação | ⛔ Bloqueada até deliberação desta proposta |
| Commit | ⛔ Não |
| E8 | ⛔ Bloqueada |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO revisará |
| Quando | 26/07/2026 |
| Por quê | Autorização formal E7 exige proposta técnica antes da IMP |
| Baseado em quê | Deliberação CTO — Abertura E7; REQ-043; ARQ-012 §7; D16; IMP-009; ADR-006 |
| Resultado | Proposta v0.1 submetida; sem código E7; aguarda deliberação |
