# Diretrizes Arquiteturais de Experiência — Promovidas da F1

> **Status: Vigente — deliberação do Gate de Encerramento da F1 (CTO, 26/07/2026).**  
> Natureza: **diretrizes arquiteturais normativas** derivadas do Benchmark Estratégico (IPR-001 / F1).  
> Precedência: subordinadas a CON-001, VIS-007, P1–P6 e REQ-037/039/041; prevalecem sobre preferências de implementação e tendências de mercado.  
> Origem: HP-001, HP-002 e HP-003 — **promovidas** no Gate de Encerramento da F1.  
> Hipóteses ainda em observação: ver §3 e [`benchmark/encerramento-f1.md`](benchmark/encerramento-f1.md).

---

## 1. O que é / Por que / Para quem / Sucesso

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | O conjunto de diretrizes arquiteturais de experiência promovidas a partir das hipóteses do benchmark F1. |
| **Por que existe?** | Consolidar o aprendizado de mercado homologado (24 fichas) em normas citáveis para F2+ e para futuros REQs/ADRs de interface — sem reabrir a coleta. |
| **Para quem?** | CTO (revisões); Engenheiro (implementação futura); Usuário (transparência da deliberação). |
| **Sucesso?** | Toda especificação de F2–F4 e todo REQ visual futuro cita as diretrizes pertinentes ou justifica exceção formal. |

---

## 2. Diretrizes vigentes (HP promovidas)

### DA-001 — Objetivo antes da Ferramenta *(ex-HP-001)*

**Definição:** O usuário inicia pelo **objetivo** (o que precisa decidir ou alcançar), não pela escolha de ferramenta, modelo de IA ou superfície. A seleção de meios — incluindo qual IA atua — é responsabilidade do CEO.

**Implicações:**

* Superfícies não começam por seletor de apps/modelos.  
* A orquestração multi-IA permanece **infraestrutura substituível** (ADR-010 / evidência F1-Q); o usuário não escolhe o provedor.  
* Coerente com P6, ADR-002 (usuário nunca escolhe a IA) e antimodelo RC-03.

**Rastreio:** Corpus F1 (convergência multi-domínio + RC-03 / suites como tensão); Gate de Encerramento F1.

---

### DA-002 — O contexto sobrevive às tarefas *(ex-HP-002)*

**Definição:** O contexto organizacional deve permanecer vivo independentemente do ciclo de vida de tarefas, projetos ou conversas, preservando o conhecimento necessário para apoiar futuras decisões.

**Implicações:**

* Conhecimento e COA não se apagam quando uma tarefa fecha.  
* Memória de conversa ≠ patrimônio organizacional (sessão de agente não substitui contexto do CEO).  
* Coerente com REQ-037/039 e com evidências Obsidian / Initiatives / Rovo / Glean / Claude Projects.

**Rastreio:** Corpus F1; Gate de Encerramento F1.

---

### DA-003 — Navegação por níveis de abstração *(ex-HP-003)*

**Definição:** O gestor deve conseguir transitar entre os diferentes níveis de abstração da organização (empresa, objetivos, iniciativas, projetos, execução, decisões e evidências) preservando o contexto e a continuidade do raciocínio.

**Implicações:**

* A experiência deve permitir subir/descer níveis **sem** perder o COA ativo.  
* Hierarquia estratégica ≠ hierarquia técnica de agentes (manager/especialista do SDK).  
* Coerente com P1/P2 e evidências Lattice / Initiatives / PagerDuty / Palantir.

**Rastreio:** Corpus F1; Gate de Encerramento F1.

---

## 3. Hipóteses que permanecem em observação

| ID | Definição condensada | Status pós-encerramento | Por que não promovida ainda |
|----|----------------------|-------------------------|------------------------------|
| **HP-004** | Atenção antes da Informação | **Em observação** | Densidade de evidência adequada, porém inferior a DA-001…003; pode anexar-se a P2 futuramente |
| **HP-005** | A decisão é a unidade de progresso | **Em observação** | Núcleo da identidade CEO; depende da decisão interna **L4** (loop decisão→efeito) |
| **HP-006** | Toda decisão deve possuir justificativa rastreável | **Em observação avançada** | Evidência forte (Coda, NotebookLM, Palantir, Glean); distinguir justificativa de decisão (próxima de promoção) de maturação de aprendizado (**L2**) |

Estas hipóteses **informam** F2–F4, mas **não** têm força normativa plena até nova deliberação do CTO.

---

## 4. Uso normativo

1. Em REQs/ADRs de interface: citar **DA-001 / DA-002 / DA-003** quando aplicável.  
2. Em conflito com P1–P6: prevalecem CON-001 → VIS → P1–P6 → estas diretrizes → preferências de implementação.  
3. Em F2 (fundações visuais): tipografia, hierarquia e densidade devem **servir** DA-001…003 (objetivo, contexto persistente, níveis), não o inverso.  
4. HP-004/005/006: registráveis como *considerações*, não como requisitos vinculantes, até promoção.

---

## 5. Lacunas internas (não são pedidos de benchmark)

| ID | Natureza | Relação |
|----|----------|---------|
| L1 | Home / COA como superfície | Forma de DA-001/DA-002 |
| L2 | Aprendizado maturável | Relacionada a HP-006 avançada |
| L3 | Orquestração Multi-IA | ✅ Coberta (F1-Q); infra sob DA-001 |
| L4 | Loop decisão→efeito | Bloqueia promoção de HP-005 |
| L5 | Identidade / tom de comando | F2 / Branding |
| L6 | Multi-papel Human+AI | ADR de colaboração futura |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (deliberação Gate de Encerramento F1); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Promover HP-001…003 a diretrizes vigentes; registrar HP-004/005/006 em observação |
| Baseado em quê | [`benchmark/encerramento-f1.md`](benchmark/encerramento-f1.md); corpus 24 fichas |
| Resultado | DA-001…003 vigentes; hipóteses remanescentes em observação; sem alteração das fichas; sem commit |
