# Ficha — Claude Computer Use (26/07/2026)

> **Status: Homologada — Gate F1-G (CTO, 26/07/2026). Integra a base documental da IPR-001 como antimodelo.**  
> Template: v0.2 (seções obrigatórias Gate F1).  
> Fontes verificáveis apenas.  
> Tipo: **antimodelo metodológico** (autonomia de ação sem trilha de decisão organizacional — RC-05).  
> Foco deliberado: contraste com **HP-006** e H5/P1; reconhecer transparência de limitações da própria Anthropic.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Claude Computer Use** (Anthropic) |
| Categoria | Conversacional / Agente (autonomia de uso de computador) |
| URL / fonte | https://www.anthropic.com/news/developing-computer-use ; https://www.anthropic.com/news/3-5-models-and-computer-use (observado 26/07/2026) |
| Versão / superfície observada | Posts oficiais Anthropic — developing computer use + introducing computer use |
| Data da observação | 26/07/2026 |
| Observador | Engenheiro (Cursor) |
| Classificação (após análise) | **Contrastante / antimodelo** (para o CEO como Sistema Executivo de Governança); útil metodologicamente, não como modelo de Home |

---

## 1. Identidade do Produto

Computer Use permite que Claude interaja com software **como uma pessoa**: ver a tela, mover cursor, clicar, digitar ([developing computer use](https://www.anthropic.com/news/developing-computer-use)). Objetivo declarado: o modelo usar software pré-existente sob instrução do usuário, sem ferramentas bespoke. Public beta; breakthrough de capability.

## 2. Primeira Impressão

Tom de **capability research / agentic execution**. A narrativa é “fazer tarefas no computador”, não “registrar decisões de governança com justificativa”. Anthropic é **explícita** sobre imperfeição (experimental, error-prone) — transparência positiva (CON-001 p.8), mas o produto ainda ilustra o risco de ação sem memória decisória organizacional.

## 3. Organização da Informação

* Loop: prompt do usuário → screenshots → ações GUI sequenciais.  
* Visão “flipbook” (screenshots), não stream contínuo — pode perder eventos.  
* Segurança: prompt injection, classifiers, low-risk tasks recomendadas.  
* Não há, na identidade pública, um artefato de **decisão organizacional** com evidências, contexto COA e efeitos ao longo do tempo.

## 4. Fluxo de Uso

1. Desenvolvedor/usuário dá objetivo em linguagem natural.  
2. Modelo interpreta tela e executa passos.  
3. Pode self-correct / retry.  
4. Resultado = estado do computador alterado — **sem** Decision Doc / justificativa estruturada obrigatória.

## 5. Apoio à Tomada de Decisão

Apoia **execução**, não deliberação rastreável. Erros públicos citados (parar gravação; abrir fotos do Yellowstone) mostram ações sem “porquê” organizacional inspecionável. Contrasta HP-006: a ação existe; a **justificativa ligada a evidências, contexto e efeitos** não é a unidade do produto.

## 6. Diferenciais Observados

### O que pode informar o CEO (com cautela)

| Incorporar (conceitual, limitado) | Por quê |
|-----------------------------------|---------|
| Declarar limitações e riscos abertamente | CON-001 p.8; H5 — transparência |
| Preferir tarefas de baixo risco enquanto a capability é imatura | Prudência operacional |

## 7. O que NÃO copiar para o CEO — ANTIMODELO

| Não incorporar | Por quê |
|----------------|---------|
| Autonomia que age na interface sem trilha de decisão | Conflita **HP-006**, P1, memória organizacional |
| Progresso = tarefas executadas pelo agente | Conflita **HP-005** (decisão + efeitos, não só execução) |
| Computer-use como interface principal do CEO | Domínio errado; REQ-041 = conversa de governança, não GUI agent |
| Ação opaca / difícil de auditar pós-fato | “Flipbook”, erros divertidos = risco de governança |
| Confiar em self-correct sem registro do raciocínio decisório | Continuidade do raciocínio organizacional quebrada (HP-003/006) |

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Baixa (modelo) / Alta (antimodelo)** | Alta utilidade para delimitar: o CEO **não** deve avançar por ações de agente sem justificativa rastreável; baixa como referência de forma. |

### Relação explícita com HP-006

| Aspecto HP-006 | Evidência Claude Computer Use (contraste) |
|----------------|-------------------------------------------|
| Decisão não isolada | Ações isoladas no desktop; sem artefato de decisão organizacional |
| Ligada a evidências/contexto | Contexto = screenshot do momento, não COA/memória normativa |
| Efeitos ao longo do tempo | Efeitos no ambiente de UI; sem vínculo obrigatório a efeitos de negócio observados |
| Lição | Toda ação relevante no CEO deve deixar justificativa + vínculos; execução agentic sem isso é antimodelo |

---

## Dimensões (D1–D10) — rubrica complementar

| ID | Nota (1–5 / N/A) | Evidência | Lição útil ao CEO | Risco de cópia |
|----|------------------|-----------|-------------------|----------------|
| D1 Controle | 2 | Usuário inicia; agente executa com erros possíveis | Controlo exige trilha | Perda de controlo |
| D2 Info → decisão | 1 | Execução, não deliberação | — | Ação sem decisão |
| D3 Clareza | 3 | Docs claros sobre limites | Transparência de limites | — |
| D4 Densidade / elegância | N/A | Capability, não UI de produto CEO | — | — |
| D5 Consistência | 2 | Error-prone admitido | — | Imprevisibilidade |
| D6 Objetivo por superfície | 3 | Um prompt → sequência | Objetivo do user existe | Objetivo ≠ decisão registrada |
| D7 Conversação | 3 | Prompt inicia; depois age | — | Chat que vira agente opaco |
| D8 Contexto / isolamento | 1 | Sem COA organizacional | — | Contexto de tela ≠ contexto org. |
| D9 Tempo do usuário | 2 | Slow / retries | — | Tempo perdido em erros |
| D10 Identidade / tom | 2 | Research agentic | Antimodelo de identidade | CEO como “computer user AI” |

## Implicações por frente

| Frente | Implicação (se houver) |
|--------|------------------------|
| UX | Nenhuma autonomia sem justificativa rastreável e efeitos observáveis (HP-006) |
| UI | N/A nesta fase |
| Branding | CEO ≠ agente que “usa o computador” |
| Design system | N/A |

## Conclusão

Claude Computer Use ensina, por contraste — e apesar da honestidade da Anthropic sobre limites — que **ação agentic sem artefato de decisão rastreável** é antimodelo para o CEO frente à HP-006.

---

## Memória Organizacional (da ficha)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Antimodelo RC-05 pós F1-F; testar HP-006 por contraste |
| Baseado em quê | anthropic.com news (developing + introducing computer use); deliberação HP-006 |
| Resultado | Ficha v0.1 submetida ao CTO |
