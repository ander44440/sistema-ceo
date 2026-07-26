# Proposta Técnica — IMP-009 E6 (Conversa Contextual)

> **Status: Proposta APROVADA e executada tecnicamente — Gate E6 pendente (26/07/2026).**  
> Norma: IMP-009; ARQ-012 §5; **REQ-041**; D6, D18; Gates E1–E5 Homologados.  
> Autorização: Deliberação Oficial do CTO — Abertura formal da E6 (26/07/2026).  
> **Proposta:** APROVADA (CTO, 26/07/2026). Evidências: [`e6-evidencias.md`](e6-evidencias.md).  
> **Proibição pós-execução:** sem commit até Gate E6; não iniciar E7/E8.

---

## 1. Objetivo da etapa

Materializar o **Componente R — Conversa Executiva**, tornando a caixa de conversa a forma principal de interação na Home, sempre amarrada ao COA ativo, com histórico isolado e continuidade imediata após troca de contexto (REQ-041 / ARQ-012 §5).

---

## 2. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | **REQ-041** (conversa como interface principal) |
| Dependências | REQ-037 (COA ativo), REQ-040 (Home — E5), REQ-038 (troca) |
| ARQ | ARQ-012 §5; IConversa; D6; D18 |
| Componentes pré-existentes (somente leitura / consumo) | O (E2), P (E3), Q (E5) |
| Fora desta etapa | E7 (navegação T), E8 (migração S) |

---

## 3. Escopo proposto (implementar após aprovação)

### 3.1 Domínio — serviço R (`conversa-executiva.js`)

| Operação IConversa | Comportamento |
|--------------------|---------------|
| `enviar(textoUsuario, opts?)` | Obtém `coaAtivoId` via O; rejeita sem COA ativo; grava turno via P (`tipo: turnoConversa`); responde no escopo do COA |
| `listarHistorico()` | Lista turnos **somente** do COA ativo via P (D5/D13) |
| `montarSuperficie()` | Estado para UI: histórico, exemplos, COA ativo, mensagem de limitação quando aplicável |

**Contrato de turno (ARQ-012 §5.3):**

| Campo | Regra |
|-------|-------|
| `turnoId` | Gerado na gravação |
| `coaId` | Sempre = `coaAtivoId` no envio (via O + P) |
| `textoUsuario` | Obrigatório |
| `resposta` / `estado` | Obrigatório; pode declarar limitação/ausência |
| `vigencia` | Recomendações com `vigencia: "proposta"` (D18) |
| `quando` | Timestamp ISO |

**Processamento do domínio nesta etapa (deliberadamente mínimo):**

* Sem orquestração multi-IA / roteamento de agentes (fora do REQ-041).
* Resposta determinística de posto de comando: eco contextual + orientação; declara limitação quando o comando exigir motor de linguagem ou execução externa.
* Pode ler Resumo/blocos via Q (`montarResumo` / `montarBlocos`) **somente leitura** para contextualizar a resposta — sem gravar resumo.
* Persistência de turnos **apenas** via Política P (`gravar` / `listar`), nunca repo direto.

### 3.2 Superfície — integração na Home

| Elemento | Proposta |
|----------|----------|
| Card principal | Caixa de entrada + botão Enviar em posição central dominante (REQ-041) |
| Exemplos | Lista ilustrativa fixa (ex.: atenção do dia; analisar; planejar; abrir outro COA — este último apenas como exemplo textual; troca real continua via seletor/O) |
| Histórico | Turnos do COA ativo; limpa visualmente ao trocar COA (histórico do anterior permanece no store particionado) |
| Relação com Q | Estender `home.html` **ou** compor módulo UI fino `conversa-ui` consumido pela Home — **sem alterar** a lógica homologada de `home-executiva.js` (E5), salvo adição de gancho de composição se o CTO autorizar extensão mínima da superfície HTML |

**Preferência técnica (recomendada):**

1. Novo módulo de domínio `conversa-executiva.js` (R) — baseline nova da E6.
2. Extensão **somente** de `home.html` para embutir o card de conversa, chamando R + Q existentes.
3. **Não modificar** `home-executiva.js`, `catalogo-coa.js`, `sessao-coa.js`, `politica-isolamento.js`, `tela-projetos.js` (baselines E1–E5).

Se a integração HTML exigir um helper de apresentação puro (sem regra de negócio), criar `conversa-ui.js` opcional — apenas orquestração de DOM/estado de tela.

### 3.3 Continuidade após troca de COA

```text
Usuário troca COA (seletor / O.trocar)
  → R.listarHistorico() passa a refletir apenas o novo coaAtivoId
  → caixa permanece disponível
  → próximo enviar() grava no novo COA
  → sem mistura de históricos (P + D5)
```

Alinhamento com D15: se `trocar` com `conversaEmAndamento` sem confirmação, a Home/UI respeita `confirmacao_requerida` já existente em O (sem reimplementar).

---

## 4. Fora do escopo (explícito)

* Menu inferior / Componente T (E7).
* Migração MVP (E8).
* Motor de linguagem / agentes / orquestração multi-IA.
* Substituição de ferramentas externas de execução (REQ-030).
* Alteração das baselines E1–E5 (código de domínio homologado).
* Persistência própria de conversa fora do RepoOperacional mediado por P.
* Navegação Conversas/Memória como destinos (E7).

---

## 5. Critérios de aceitação (Gate E6)

| # | Critério | Evidência esperada |
|---|----------|-------------------|
| 1 | Caixa de conversa central na Home | `home.html` + inspeção |
| 2 | Exemplos observáveis + ação Enviar | UI + testes |
| 3 | Todo turno com `coaId` do ativo | P + testes |
| 4 | Histórico isolado por COA; sem vazamento | testes cross-COA |
| 5 | Após troca, conversa opera no novo COA | testes `trocar` + listar |
| 6 | Recomendações com `vigencia: proposta` (D18) | contrato do turno |
| 7 | Limitação/transparência quando além do escopo | resposta explícita |
| 8 | E1–E5 inalteradas (domínio) | diff + regressão |
| 9 | Sem E7/E8 | API sem nav/migração |
| 10 | Suite completa verde | `node --test` CAP-03 |

---

## 6. Artefatos previstos (após aprovação da proposta)

| Artefato | Ação |
|----------|------|
| `docs/cap-03/conversa-executiva.js` | Criar — Componente R |
| `docs/cap-03/conversa-executiva.test.js` | Criar — testes E6 |
| `docs/cap-03/home.html` | Estender — card conversa (sem mudar baselines JS E1–E5) |
| `docs/cap-03/e6-evidencias.md` | Criar — relatório Gate E6 |
| `docs/cap-03/README.md` / IMP-009 | Atualizar status |
| Opcional: `conversa-ui.js` | Só se necessário para DOM |

---

## 7. Ordem de execução (pós-aprovação)

1. Implementar R (`enviar`, `listarHistorico`, `montarSuperficie`).
2. Testes de isolamento, D18, continuidade pós-troca.
3. Integrar card na Home (`home.html`).
4. Regressão E1–E5 + evidências E6.
5. Submeter **Gate E6** — interromper; sem E7.

---

## 8. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Expectativa de “IA plena” na conversa | Declaração explícita de limitação na resposta (CON-001 / REQ-041) |
| Pressão para alterar E5 | Manter `home-executiva.js` intacto; só HTML + R novo |
| Duplicar persistência de turnos | Obrigar gravação via P |
| Antecipar navegação E7 | Card de conversa só na Home; sem menu inferior |

---

## 9. Decisões a confirmar pelo CTO

1. **Integração UI:** aprovar extensão de `home.html` sem alteração de `home-executiva.js`?
2. **Resposta mínima:** aprovar processador determinístico com transparência de limitação (sem LLM nesta etapa)?
3. **Exemplos:** lista ilustrativa fixa é suficiente (sem roteamento semântico)?

---

## 10. Situação

| Item | Estado |
|------|--------|
| E6 | 🟢 Autorizada para abertura — **proposta em revisão** |
| Implementação | ⛔ Bloqueada até deliberação desta proposta |
| Commit | ⛔ Não |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO revisará |
| Quando | 26/07/2026 |
| Por quê | Autorização formal E6 exige proposta técnica antes da IMP |
| Baseado em quê | Deliberação CTO — Abertura E6; REQ-041; ARQ-012 §5; IMP-009; ADR-006 |
| Resultado | Proposta v0.1 submetida; sem código E6; aguarda deliberação |
