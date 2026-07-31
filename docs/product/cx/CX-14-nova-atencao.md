# CX-14 — Renovar Nova Atenção após atualização

> **Status: Homologada — Gate F3-16 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada (de ciclo)  
> **MVP arquitetural:** Sim  
> **Precedência:** O4  
> **Domínios:** D3 → D1  
> **Nome canônico (F3-04):** Renovar Nova Atenção após atualização  
> **Bloco de continuidade da experiência:** fecha o ciclo contínuo após **CX-13** — permanente atualizado projeta novo quadro situacional; precede a continuidade entre sessões (**CX-15**, O5)  
> **Marco:** [`../marco-ciclo-executivo-ate-promocao.md`](../marco-ciclo-executivo-ate-promocao.md) — Ciclo Executivo Funcional integralmente especificado  
> **Marco de continuidade:** [`../marco-bloco-continuidade.md`](../marco-bloco-continuidade.md) — bloco CX-14/15 encerrado  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Fechar o **ciclo contínuo** da experiência: após o permanente do COA ter sido atualizado (**CX-13**), renovar a **Nova Atenção** em D1 — o quadro situacional que reflete o que agora exige comando (F2-02 ciclo; PX-06; F2-03 §5.3).

### Papel no bloco de continuidade

| Camada | Capacidade | Papel |
|--------|------------|--------|
| Arco executivo até promoção | CX-04…CX-13 | Já homologado — ver marco |
| **Continuidade *no* ciclo** | **CX-14** | D3 atualizado → novo quadro em D1; convida a nova intenção |
| Continuidade *entre* sessões | CX-15 (O5) | Restaura estado governado ao reabrir |
| Honestidade transversal | CX-16 (O5) | Limites / transitório em qualquer ponto |

CX-14 **não** encerra o COA nem declara “tudo concluído” como sucesso único: renova a atenção para o próximo trecho de comando no mesmo ciclo contínuo.

Sem CX-14, a promoção (CX-13) atualiza o patrimônio, mas a Atenção permanece no quadro anterior — o ciclo contínuo não fecha.

---

## 2. Responsabilidade

### Compete a esta CX

* Projetar o permanente **já atualizado** (CX-13) em um **novo quadro situacional** de Atenção (D1).  
* Incluir eco situacional de **conclusão / cancelamento / mudança recente** quando relevante ao comando.  
* Articular-se com **CX-03** (apresentação do quadro) — CX-14 é a *renovação após atualização*; CX-03 é a *capacidade de apresentar* o quadro.  
* Reabrir o convite à **intenção** (**CX-04**) a partir do novo estado de atenção — sem forçar toolbox.  
* Respeitar Foco e objetivos Ativados ainda vigentes (**CX-09**, **CX-08**) no novo quadro.  
* Manter o ciclo vivo: Nova Atenção → possível novo Objetivo/Intenção → … (PX-06).

### Não compete a esta CX

* Promover ao permanente (**CX-13**) — apenas consome a atualização já feita.  
* Executar ou mostrar efeito operacional do trecho anterior (**CX-12**).  
* Preservar continuidade entre sessões (**CX-15**) — outra camada de continuidade (O5).  
* Apresentar o quadro em abstrato sem renovação pós-atualização (**CX-03** como superfície base).  
* Encerrar o ciclo de vida do COA ou tratar “todas as tarefas concluídas” como único sucesso.  
* Expor orquestração ou log de execução como nova home.  
* Definir layout, componentes ou wireframes.

### Coerência com o encerramento de CX-13

* **Pré-condição:** houve Atualização do Conhecimento (promoção seletiva) ou, no mínimo, um estado permanente coerente pós-ciclo que justifique renovar o quadro.  
* CX-14 **não** promove; **não** reabre seletividade de CX-13.  
* Se nada foi promovido e o transitório apenas se encerrou, a Nova Atenção ainda pode refletir “o que permanece a comandar” — sem fingir patrimônio novo.  
* Ordem F3-02: **CX-12 ≺ CX-13 ≺ CX-14** — obrigatória.

---

## 3. Entradas conceituais

| Entrada | Classe | Origem típica |
|---------|--------|---------------|
| Permanente do COA atualizado (ou estável pós-ciclo) | Permanente | **CX-13** / **CX-07** |
| COA ativo | Permanente (lente) | **CX-01** |
| Foco / objetivos Ativados ainda relevantes | Permanente | **CX-09** / **CX-08** |
| Eco de efeito recente (conclusão, cancelamento, bloqueio resolvido) | Transitório residual / permanente se promovido | **CX-12** → **CX-13** |
| Quadro de Atenção anterior (a ser renovado) | Permanente projetado | **CX-03** |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Nova Atenção — quadro situacional renovado | Permanente projetado em D1 | **CX-03**; usuário |
| Convite situacional a nova intenção / próximo comando | Transitório / ato | **CX-04**; **CX-05** |
| Clareza do que mudou vs. o que permanece a governar | Situacional | Usuário; coerência com **CX-16** |

**Não é saída desta CX:** novo patrimônio (CX-13); restauração entre sessões (CX-15); execução.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-13** | ⇢ — atualização antes da renovação (precedência O4) |
| Depende de | **CX-03** | → — quadro a renovar / apresentar |
| Depende de | **CX-01** | → estrutural |
| Depende de | **CX-07** | → — permanente lido |
| Relacionada | **CX-08**, **CX-09** | ↔ — o que ainda compete na Atenção |
| Relacionada | **CX-04**, **CX-05** | ↔ — reabre intenção/conversa |
| Relacionada | **CX-12** | ↔ — eco do efeito (via promoção ou residual) |
| Relacionada | **CX-15** | ↔ — continuidade entre sessões (O5; distinta) |
| Relacionada | **CX-16** | ↔ — honestidade no novo quadro |

**Precedência F3-02:** O4 (após CX-13; fecha o par O4 com a promoção).  
**Anti-precedência:** CX-14 antes de CX-13 no fechamento do ciclo contínuo pós-execução.

---

## 6. Critérios de conclusão

A capacidade CX-14 considera-se **realizada** na experiência quando:

1. Após atualização por **CX-13**, o quadro de Atenção **reflete o novo estado** situacional (Nova Atenção).  
2. O ciclo contínuo **fecha e reabre**: há caminho claro para nova intenção sem “fim do COA”.  
3. Ecos de conclusão/cancelamento recente aparecem quando relevantes — sem virar checklist de tarefas como sucesso único.  
4. CX-14 não promove nem executa; consome o encerramento de CX-13.  
5. Precedência CX-13 ≺ CX-14 respeitada.  
6. Distinção clara entre renovação *no* ciclo (CX-14) e continuidade *entre* sessões (CX-15).  
7. Narrativa UXC compatível com PX-06 / F2-02 ciclo / F2-03 §5.3, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-14 |
|----|-------------------|
| **PX-06** | Ciclo contínuo — núcleo |
| **F2-02 ciclo / F-Ret** | Aprendizado→Atualização→**Nova Atenção** |
| **F2-03 §5.3** | Atenção após mudança governada |
| **IX-02** | Atenção reflete estado; não inventa privilégio paralelo ao Foco |
| **IX-01 / IX-05** | Só no COA ativo |
| **DA-002** | Quadro deriva do permanente (pós-CX-13), não de chat efêmero perdido |
| **IX-08** | Nova Atenção ≠ log de execução |
| **IX-09** | Não apresentar transitório encerrado como se fosse permanente novo |

**Restrições adicionais:**

* Forma mínima MVP-A: renovação do quadro após promoção/atualização + convite ao próximo comando.  
* Não fundir CX-14 com CX-13 nem CX-15.  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-14 | Esta especificação |
| **CX relacionadas** | CX-13, CX-03, CX-01, CX-07, CX-08, CX-09, CX-04, CX-05, CX-12, CX-15, CX-16 | Promoção; quadro; lente; permanente; vida; Foco; intenção; canal; efeito; sessão; limites |
| **Domínios** | D3 → D1 | Permanente atualizado → Atenção |
| **DA** | DA-002 | Quadro ancorado no patrimônio |
| **PX** | PX-06, PX-01, PX-05 | Ciclo contínuo; comando; atenção |
| **IX** | IX-02, IX-01, IX-05, IX-08, IX-09 | Foco refletido; COA; isolamento; ≠log; transitório |
| **F3-02** | Derivada de ciclo; MVP-A Sim; O4 | Fecha O4 com CX-13 |
| **F3-01** | Ficha CX-14 | Inventário |
| **F3-04** | Entrada CX-14 | Catálogo |
| **F2 apoio** | F2-02 ciclo contínuo; F-Ret; F2-03 §5 | Nova Atenção |
| **HP** | — | — |
| **Marco** | Ciclo executivo até promoção | Pré-condição: arco até CX-13 homologado |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-16 — Spec CX-14; homologação CX-13; marco ciclo até promoção |
| Baseado em quê | F3-03; F3-02 O4; F3-04; F2-02; CX-13; marco ciclo executivo |
| Resultado | Spec CX-14 **homologada** (Gate F3-16); ciclo executivo integral; F3-17 (CX-15) aberta |
