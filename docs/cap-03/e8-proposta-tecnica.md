# Proposta Técnica — IMP-009 E8 (Migração MG2)

> **Status: Proposta APROVADA; E8 Homologada — Gate E8 APROVADO (CTO, 26/07/2026).**  
> Norma: IMP-009; ARQ-012 §8; **REQ-044**; D7, D8, D17; Gates E1–E8 Homologados.  
> Autorização: Deliberação Oficial do CTO — Abertura formal da E8 (26/07/2026).  
> **Proposta:** APROVADA (CTO, 26/07/2026) com 5 deliberações: fixture; escopo 3 registros + COA; sessão permanece em mg2; sem `reverter()`; sem UI. Evidências: [`e8-evidencias.md`](e8-evidencias.md) — Homologada.  
> **IMP-009 ENCERRADA.** Sem commit até a conclusão da VAL.

---

## 1. Objetivo da etapa

Materializar o **Componente S — Migração MG2 → COA Motoboy Game 2**, transferindo o acervo operacional do MVP v0.1 (contexto MG2) para o COA da CAP-03 **sem perda**, com preservação de identidade e relacionamentos, **idempotência**, evidência rastreável origem→destino e **sem contaminar** outros COAs (REQ-044 / ARQ-012 §8).

A migração é mecanismo de **continuidade operacional**, não reescrita do MVP. A VAL-005 permanece independente (D7).

---

## 2. Rastreabilidade

| Elo | Referência |
|-----|------------|
| REQ | **REQ-044** (migração do acervo MVP → COA Motoboy Game 2) |
| Dependências | REQ-036 (catálogo), REQ-037 (COA ativo), REQ-039 (isolamento); VIS-003 / MVP v0.1 (fonte) |
| ARQ | ARQ-012 §8; Componente S; RepoMigração; `IMigracao`; D7, D8, D17 |
| Componentes pré-existentes (somente consumo) | N (E1), O (E2), P (E3) |
| Fora desta etapa | Alteração de comportamento funcional E1–E7; patch em `docs/mvp/`; VAL integrada |

---

## 3. Inventário proposto da fonte (MVP v0.1 — somente leitura)

O inventário abaixo é o **acervo MG2 observável** no MVP congelado. A E8 **não** modifica esses arquivos (D7 / D8).

| Origem (caminho) | ID / chave | Tipo lógico | Destino proposto |
|------------------|------------|-------------|------------------|
| `docs/mvp/decisoes.md` | `DEC-MVP-001` | decisão | Registro operacional `tipo: "decisao"` + `coaId = mg2` |
| `docs/mvp/conhecimentos-uso-diario.md` | `KNW-DIA-001` | conhecimento | Registro operacional `tipo: "conhecimento"` + `coaId = mg2` |
| `docs/mvp/estado-do-dia.md` | `ESTADO-DIA-MG2` (chave sintética documentada) | estado do dia | Registro operacional `tipo: "estadoDia"` + `coaId = mg2` |
| `docs/mvp/contexto-mg2.md` | metadado de contexto | identidade do COA | Garante existência do Projeto **"Motoboy Game 2"** no catálogo (N); **não** vira registro operacional duplicado |

**Completude quantitativa (proposta):**  
origem = **3** registros operacionais migráveis + **1** garantia de COA no catálogo.  
Após execução bem-sucedida: contagem de registros operacionais com `coaId` do COA Motoboy Game 2 provenientes da migração = **3**, salvo transformação deliberada e documentada (nenhuma transformação além do envelopamento estrutural é proposta nesta E8 — D17 1:1).

**Relacionamentos a preservar (em `conteudo` / mapa):**  
`estado-do-dia` referencia `DEC-MVP-001` e `KNW-DIA-001` — as mesmas chaves de origem devem permanecer reconhecíveis no destino.

**Correlatos fora do inventário migrável nesta E8 (explícito):**  
evidências HTML/PNG do MVP, checklists VAL-005, módulos A–G documentais sem registro operacional distinto — permanecem no MVP congelado; não entram no RepoOperacional.

---

## 4. Escopo proposto (implementar após aprovação)

### 4.1 Domínio — Componente S (`migracao-mg2.js`)

Interface pública `IMigracao` (ARQ-012 §9.4):

| Operação | Comportamento |
|----------|---------------|
| `inventariar()` | Retorna o inventário congelado (fixture estruturada) com IDs, tipos, fontes e payload 1:1 |
| `garantirCoaMg2()` | Se não existir Projeto com nome `"Motoboy Game 2"`, cria via `catalogo.criarProjeto`; retorna o `coaId` |
| `mapear()` | Produz `MapaMigracao[]`: origemId → destinoId previsto, tipo, fonte, status |
| `executar()` | Garante COA mg2; ativa temporariamente o COA via `sessao.trocar(mg2)` **apenas no fluxo de migração**; grava cada item via `politica.gravar`; registra evidência no RepoMigração; **idempotente** |
| `evidenciar()` | Relatório: contagens origem/destino, mapa, isolamento (nenhum item em outros COAs), flag de idempotência |
| `reverter()` *(opcional, se CTO aprovar)* | Remove do operacional os destinos listados no mapa com status `migrado`, e marca mapa como `revertido` — **sem** alterar `docs/mvp/` |

### 4.2 Idempotência (obrigatória)

* Chave de deduplicação: `origemId` + `fonte` no RepoMigração.  
* Se `executar()` for chamado novamente: itens já migrados são **pulados** (status `ja_existente`); nenhum duplicado no operacional.  
* Reinício parcial não corrompe o acervo.

### 4.3 RepoMigração

* Persistência **separada**: chave própria (ex.: `ceo.cap03.migracao.v1`), distinta de catálogo, sessão e operacional (D12 analogia).  
* Cada entrada: `origemId`, `destinoId`, `coaId`, `tipo`, `fonte`, `status`, `executadoEm`, `hashConteudo` (opcional).  
* Serve como evidência rastreável REQ-044 e base da reversão.

### 4.4 Encapsulamento

* S consome **somente** APIs públicas: `ICatalogoCOA`, `ISessaoCOA`, `IRepositorioOperacional` (via P).  
* **Não** acessa repositório interno de P.  
* **Não** altera contratos públicos de E1–E7.  
* Gravação operacional **somente** via `politica.gravar` com sessão no COA mg2 (preserva D4/D5/D13).  
* Após `executar`, a sessão pode permanecer em mg2 (comportamento natural pós-migração) ou restaurar o COA anterior — **decisão a confirmar pelo CTO** (§9).

### 4.5 Fixture de inventário

* Módulo `inventario-mvp-mg2.js` (ou seção congelada em `migracao-mg2.js`) contendo a cópia estruturada dos 3 registros, com metadados apontando para os caminhos em `docs/mvp/` como **fonte documental**.  
* Justificativa: a sede CAP-03 opera em JS/Node; parser de Markdown do MVP seria frágil e fora do padrão das etapas anteriores. A fixture é o inventário registrado e auditável; o MVP permanece a fonte normativa congelada.

### 4.6 Superfície UI

* **Não** é obrigatória para a E8 (domínio + testes + evidências bastam para o Gate).  
* Opcional (se CTO autorizar): página mínima `migracao.html` apenas para disparar `inventariar` / `executar` / `evidenciar` e exibir o relatório — sem alterar Home/conversa/navegação.

### 4.7 Preferência técnica (recomendada)

1. Novo `migracao-mg2.js` (S) + `inventario-mvp-mg2.js` (fixture).  
2. Novo `migracao-mg2.test.js` (cobertura de inventário, mapeamento, execução, idempotência, isolamento, completude).  
3. Evidências em `e8-evidencias.md` + inventário registrado.  
4. **Não modificar** nenhum JS/HTML homologado das E1–E7, salvo deliberação formal.  
5. **Não tocar** `docs/mvp/`.

---

## 5. Fora do escopo (explícito)

* Qualquer alteração em `docs/mvp/` ou dependência da VAL-005 (D7/D8).  
* Transformações semânticas do conteúdo (reescrever decisões/conhecimentos).  
* Migração de artefatos não inventariados (screenshots, HTML do MVP, checklists).  
* Alteração de comportamento funcional homologado da CAP-03 (E1–E7).  
* Criação de COAs “Sistema CEO” / “Última Milha” nesta etapa (podem existir por uso manual; migração **não** escreve neles).  
* Orquestração multi-IA / LLM.  
* Abertura da VAL integrada da CAP-03 (só após Gate E8).

---

## 6. Critérios de aceitação (Gate E8)

| # | Critério | Evidência esperada |
|---|----------|-------------------|
| 1 | Inventário registrado e rastreável | fixture + relatório |
| 2 | COA “Motoboy Game 2” existe no catálogo após garantia | testes N |
| 3 | Todos os registros inventariados aparecem sob o COA mg2 | testes P + evidência |
| 4 | Nenhum registro migrado aparece em outros COAs | teste de isolamento |
| 5 | Contagem origem ≡ destino (3 ≡ 3 nesta proposta) | `evidenciar()` |
| 6 | Identidade/relacionamentos preservados (IDs origem no mapa e no conteúdo) | mapa + asserts |
| 7 | Execução idempotente (2ª corrida não duplica) | teste de reinício |
| 8 | MVP (`docs/mvp/`) inalterado | confirmação documental |
| 9 | E1–E7 JS/HTML de domínio inalterados | confirmação / regressão |
| 10 | Suite CAP-03 verde (60 + testes E8) | `node --test` |
| 11 | VAL-005 independente | declaração D7 nas evidências |

---

## 7. Artefatos previstos (após aprovação da proposta)

| Artefato | Ação |
|----------|------|
| `docs/cap-03/inventario-mvp-mg2.js` | Criar — inventário congelado |
| `docs/cap-03/migracao-mg2.js` | Criar — Componente S / `IMigracao` |
| `docs/cap-03/migracao-mg2.test.js` | Criar — testes E8 |
| `docs/cap-03/migracao.html` | Criar **somente se** CTO autorizar UI mínima |
| `docs/cap-03/e8-evidencias.md` | Criar — relatório Gate E8 |
| README / IMP-009 | Atualizar status |

---

## 8. Ordem de execução (pós-aprovação)

1. Congelar inventário estruturado (3 registros + metadados de fonte).  
2. Implementar S: inventariar → garantirCoaMg2 → mapear → executar → evidenciar (+ reverter se aprovado).  
3. Testes: completude, isolamento, idempotência, não-contaminação, regressão E1–E7.  
4. Relatório de evidências com inventário e mapa origem→destino.  
5. Submeter **Gate E8** — interromper; sem VAL até deliberação.

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Tocar MVP congelado | D7/D8 — fixture em `cap-03`; proibição explícita de write em `docs/mvp/` |
| Duplicação em reinício | Idempotência por `origemId` no RepoMigração |
| Contaminação cross-COA | Gravação só via P com sessão em mg2; assert pós-migração |
| Quebra de encapsulamento | S não acessa repo interno de P |
| Alterar baselines E1–E7 | Somente novos arquivos; contratos públicos intactos |
| Inventário incompleto | Escopo fechado nos 3 registros documentados; correlatos documentais ficam no MVP |
| Sessão do usuário alterada surpresa | Confirmar no §10 se restaura COA anterior após executar |

---

## 10. Decisões a confirmar pelo CTO

1. **Inventário:** aprovar fixture estruturada em `docs/cap-03/` (cópia 1:1 do acervo MG2 do MVP) em vez de parser ao vivo de Markdown?
2. **Escopo quantitativo:** confirmar inventário migrável = `DEC-MVP-001` + `KNW-DIA-001` + estado do dia (3 registros) + garantia do COA no catálogo?
3. **Sessão pós-execução:** após migrar, (a) permanecer no COA mg2, ou (b) restaurar o `coaAtivoId` anterior?
4. **Reversão:** incluir `reverter()` nesta E8 ou deixar para evolução?
5. **UI:** dispensar superfície HTML nesta etapa (domínio + testes + evidências) ou autorizar `migracao.html` mínima?

---

## 11. Situação

| Item | Estado |
|------|--------|
| E8 | 🟢 Autorizada para abertura — **proposta em revisão** |
| Implementação | ⛔ Bloqueada até deliberação desta proposta |
| Commit | ⛔ Não |
| VAL CAP-03 | ⛔ Bloqueada até Gate E8 |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO revisará |
| Quando | 26/07/2026 |
| Por quê | Autorização formal E8 exige proposta técnica antes da IMP |
| Baseado em quê | Deliberação CTO — Abertura E8; REQ-044; ARQ-012 §8; D7/D8/D17; IMP-009; ADR-006; inventário observável do MVP v0.1 |
| Resultado | Proposta v0.1 submetida; sem código E8; aguarda deliberação |
