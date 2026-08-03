# F1 — Benchmark Estratégico (IPR-001)

> **Status: F1 CONCLUÍDA — Gate de Encerramento APROVADO (CTO, 26/07/2026).**  
> Autorização histórica: Gate F1 + template v0.2 + fichas nominadas.  
> Natureza: documentação de pesquisa **encerrada** (corpus fechado).  
> **Proibições:** não implementar interfaces; não alterar fichas homologadas; sem commit até homologação do pacote de transição.  
> **Pós-F1:** diretrizes DA-001…003 vigentes; transição [`../transicao-f1-f2.md`](../transicao-f1-f2.md).

---

## 1. Objetivo da fase

Estruturar a documentação das análises comparativas de produtos de referência que servirão de base para as futuras decisões de UX, UI, Branding e Experiência do CEO — sem determinar o design do CEO por moda de mercado.

Regra de precedência (inalterada):

> Benchmark **informa**, não determina. Os [Princípios de Produto](../principios-de-produto.md) prevalecem sobre quaisquer tendências observadas.

## 2. Escopo

| Dentro | Fora |
|--------|------|
| Critérios de análise alinhados aos princípios P1–P6 | Implementação visual ou código |
| Frentes de referência (executiva e conversacional) | Análises profundas de produtos sem fontes |
| Template de ficha por referência | Alteração de branding/UX/UI finais |
| Síntese e oportunidades de diferenciação (estrutura + consolidação metodológica) | Telas, componentes, tokens |
| Inventário de candidatos a análise | Pesquisa de campo / entrevistas nesta entrega |

## 3. Entregáveis desta abertura

| Artefato | Papel |
|----------|-------|
| Este documento | Plano e registro da F1 |
| [`criterios-de-analise.md`](criterios-de-analise.md) | Dimensões e rubricas de observação |
| [`TEMPLATE-ficha-referencia.md`](TEMPLATE-ficha-referencia.md) | Ficha padronizada por produto |
| [`referencias-executivas.md`](referencias-executivas.md) | Inventário e frentes de produtos de comando/gestão |
| [`referencias-conversacionais.md`](referencias-conversacionais.md) | Inventário e frentes de interfaces conversacionais |
| [`sintese-e-oportunidades.md`](sintese-e-oportunidades.md) | Consolidação metodológica e oportunidades de diferenciação |

## 4. Método

1. **Definir critérios** — o que observar, como pontuar, o que ignorar.  
2. **Inventariar candidatos** — listas iniciais por frente (sem análise profunda nesta entrega).  
3. **Fichar** — uma ficha por referência quando a análise for autorizada/executada.  
4. **Sintetizar** — padrões recorrentes e oportunidades de diferenciação do CEO.  
5. **Submeter** — Gate F1 do CTO antes de alimentar F2/F3/branding.

## 5. Critérios de conclusão da F1

| # | Critério |
|---|----------|
| C1 | Critérios de análise homologáveis e rastreáveis aos princípios P1–P6 |
| C2 | Template de ficha utilizável e consistente |
| C3 | Inventários de candidatos nas duas frentes (executiva e conversacional) |
| C4 | Síntese com oportunidades de diferenciação explícitas (sem contradizer princípios) |
| C5 | Nenhuma implementação de interface; nenhuma alteração de baseline técnica |

## 6. Relação com fases seguintes

| Fase | Como a F1 alimenta |
|------|--------------------|
| F2 Fundações visuais | Padrões de densidade, tipografia e sobriedade observados |
| F3 UX | Padrões de navegação, conversação e onboarding |
| F4 UI | Padrões de componentes e layouts (como referência, não cópia) |
| Branding | Posicionamento relativo (posto de comando vs dashboard vs chat genérico) |

## 7. Situação

| Item | Estado |
|------|--------|
| F0 | ✅ Homologada (Gate IPR-001) |
| F1 estrutura | ✅ Homologada (Gate F1) |
| Fichas nominadas | ✅ **24 homologadas** (F1-A…F1-Q); coleta **encerrada**; conteúdo **imutável** |
| Cobertura conceitual | ✅ L3 coberta; L1/L2/L4/L5/L6 → decisões internas |
| Artefato de encerramento | ✅ Homologado — [`encerramento-f1.md`](encerramento-f1.md) |
| Inventário inicial | ✅ Concluído |
| Modo F1 | ✅ **Concluída** |
| Hipóteses | HP-001…003 **promovidas** (DA-001…003); HP-004/005 em observação; HP-006 em observação avançada |
| RC-03 | ✅ Antimodelo oficial (ChatGPT) |
| Transição F1→F2 | 🟡 Em revisão — [`../transicao-f1-f2.md`](../transicao-f1-f2.md) |
| F2–F5 | Bloqueadas até Gate de Transição / deliberação CTO |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Status |
|--------|------|-------|-------------|--------|
| 0.1 | 26/07/2026 | Engenheiro (Cursor) | Abertura F1: plano, entregáveis, método | Em elaboração |
| 0.2 | 26/07/2026 | CTO / Engenheiro | Gate F1 APROVADO; template v0.2 (8 seções); fichas Linear, Cursor, Notion | Fichas em revisão |
| 0.3 | 26/07/2026 | CTO / Engenheiro | Gate F1-A; fichas L/C/N homologadas; HP-001; novas fichas Claude Projects + Asana | Ampliação do corpus |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO autorizou; Engenheiro (Cursor) estruturou |
| Quando | 26/07/2026 |
| Por quê | Basear decisões de experiência em referências analisadas com método, sem atalho para implementação |
| Baseado em quê | Gate IPR-001 APROVADO; abertura F1; princípios de produto |
| Resultado | Documentação F1 criada; sem código; sem commit |
