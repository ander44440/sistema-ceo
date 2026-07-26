# Ficha — Claude Projects (26/07/2026)

> **Status: Homologada — Gate F1-B (CTO, 26/07/2026). Integra a base documental da IPR-001.**  
> Template: v0.2 (seções obrigatórias Gate F1).  
> Fontes verificáveis apenas.

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **Claude Projects** (Claude.ai) |
| Categoria | Conversacional (chat com contexto/projeto) |
| URL / fonte | https://www.anthropic.com/news/projects (publicado 25/06/2024; observado 26/07/2026) |
| Versão / superfície observada | Anúncio oficial Anthropic — Projects para Pro/Team |
| Data da observação | 26/07/2026 |
| Observador | Engenheiro (Cursor) |
| Classificação (após análise) | **Parcial** (forte analogia ao COA + conversa; domínio = assistente genérico, não governança) |

---

## 1. Identidade do Produto

Projects organiza chats do Claude em **espaços com conhecimento curado e atividade de conversa no mesmo lugar**, visando colaboração humano–IA, decisão mais estratégica e resultados melhores ([anthropic.com/news/projects](https://www.anthropic.com/news/projects)).

Promessa: evitar cold start — Claude “grounded” em conhecimento interno do usuário/equipe.

## 2. Primeira Impressão

Posicionamento de **copiloto de trabalho com contexto persistente**, não de dashboard. Tom: colaboração, expertise ampliada, compartilhamento de melhores conversas (Team). Sensação alinhada a “conversa + pasta de contexto”.

## 3. Organização da Informação

* Unidade: **Project** = conjunto de conhecimento + chats + instruções customizadas.  
* Contexto longo (200K tokens citado no anúncio) para documentos, código e insights.  
* Artifacts: painel lateral para ver/editar artefatos gerados **ao lado** da conversa — conversa permanece central, artefato é apoio.  
* Activity feed (Team): compartilhamento de snapshots de conversas.

## 4. Fluxo de Uso

1. Criar Project.  
2. Adicionar conhecimento / instruções.  
3. Conversar dentro do Project (evita reexplicar contexto).  
4. Opcional: gerar Artifacts lado a lado; compartilhar conversas no Team.

Entrada dominante: **conversa**, após (ou junto de) preparar o contexto — próximo de HP-001 se o usuário chega com um objetivo, distante se o fluxo obrigar “montar pasta” antes de declarar intenção.

## 5. Apoio à Tomada de Decisão

* Anúncio cita explicitamente *“more strategic decision-making”*.  
* Custom instructions por Project (tom, papel, indústria) — molda respostas ao objetivo.  
* Não há Resumo Executivo formal nem isolamento tipo COA com política de domínio; o “projeto” é contexto de chat/conhecimento.

## 6. Diferenciais Observados

* **Contexto nomeado e persistente** para a conversa (analogia forte ao COA).  
* Conversa como centro; Artifacts como apoio lateral (alinha REQ-041 / P6).  
* Instruções por espaço — personalização sem multiplicar produtos.  
* Compartilhamento de conversas como aprendizado de equipe (menos relevante ao CEO single-user atual).

## 7. O que NÃO copiar para o CEO

* Modelo de **assistente generalista** (escrever e-mail, SQL, marketing) — o CEO governa, não substitui ferramentas de ofício.  
* Feed social de conversas como superfície principal.  
* Artefatos de código/frontend live preview como eixo da Home.  
* Treinar expectativa de “Claude faz o trabalho em minutos” sem transparência de limites no tom do produto CEO.

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Alta** *(padrão COA↔conversa)* | Melhor analogia conversacional ao COA até agora: um espaço, conhecimento + histórico, diálogo no centro. Aplicabilidade **baixa** ao domínio (assistente genérico). Extrair padrão de contexto; não a identidade de chatbot. |

---

## Dimensões (D1–D10)

| ID | Nota | Evidência | Lição útil ao CEO | Risco de cópia |
|----|------|-----------|-------------------|----------------|
| D1 Controle | 4 | Instruções custom; consentimento de treino | Controles explícitos | Baixo |
| D2 Info → decisão | 3 | “Strategic decision-making” | Ainda conversacional | Médio |
| D3 Clareza | 4 | Project como unidade | Nomear o contexto | Baixo |
| D4 Densidade | 4 | Conversa + painel lateral | Apoio não compete | Baixo |
| D5 Consistência | N/A | Só anúncio | — | — |
| D6 Objetivo | 3 | Depende do usuário | HP-001 | Médio |
| D7 Conversação | 5 | Centro do produto | REQ-041 | Baixo |
| D8 Contexto | 5 | Projects + knowledge | Modelo COA | Baixo |
| D9 Tempo | 4 | Evita cold start | Não reexplicar | Baixo |
| D10 Identidade | 2 | Assistente AI | Não importar marca chat | Alto |

## Implicações por frente

| Frente | Implicação |
|--------|------------|
| UX | COA ≈ “project space”; conversa dentro; apoio lateral |
| UI | Painel de artefato/resumo subordinado à conversa |
| Branding | Distinguir de “Claude/ChatGPT Projects” |
| Design system | Layout conversa + painel de contexto |

## Conclusão

Claude Projects ensina ao CEO o padrão **conversa dentro de um contexto nomeado e persistente** — e reforça HP-001 se a entrada privilegiar o objetivo, não a ferramenta.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Ampliar frente conversacional (RC-02) pós F1-A |
| Baseado em quê | Gate F1-A; fonte anthropic.com/news/projects |
| Resultado | Ficha v0.1 submetida |
