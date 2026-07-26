# Princípios de Produto — Sistema CEO

> **Status: Homologado — Gate IPR-001 APROVADO (CTO, 26/07/2026). Parte da F0.**  
> Natureza: princípios **normativos** — toda decisão futura de UX/UI/branding deverá citá-los ou justificar exceção.  
> Norma: IPR-001; CON-001 (princípios 1, 7, 8); VIS-007 (conversa como interface principal).

---

## Princípios

### P1 — O CEO deve transmitir controle

O usuário é a autoridade máxima. Cada superfície deve deixá-lo no comando: estado visível, próximo passo claro, nenhuma ação irreversível sem confirmação, nenhuma surpresa. A sensação-alvo é a de um posto de comando, não a de um aplicativo que "faz coisas sozinho".

### P2 — A informação deve levar à decisão

Nenhum dado aparece por aparecer. Todo bloco, número ou lista responde a uma pergunta executiva: *o que exige minha atenção? qual o próximo passo? o que mudou?* Informação que não alimenta decisão é ruído e deve ser removida ou rebaixada.

### P3 — Clareza acima de complexidade

Entre uma solução simples e uma sofisticada, vence a que o usuário entende em um olhar. Hierarquia tipográfica evidente, um objetivo por superfície, linguagem direta. Complexidade só entra quando comprovadamente necessária — e mesmo assim, escondida atrás de simplicidade aparente.

### P4 — Elegância sem excesso

O CEO é sóbrio. Estética a serviço da função: espaços generosos, poucos acentos de cor, movimento apenas quando comunica algo. Ornamento, gradientes gratuitos e animações decorativas violam este princípio.

### P5 — Consistência acima de criatividade

Um padrão repetido vale mais que dez soluções brilhantes e diferentes. Componentes, cores, espaçamentos e comportamentos são definidos uma vez (design system) e reutilizados sempre. Criatividade se exerce na definição do padrão — não em cada tela.

### P6 — Cada tela deve possuir um objetivo executivo

Toda superfície declara (e cumpre) um único objetivo: a Home conduz a conversa e a decisão do dia; Projetos administra contextos; Memória consulta o patrimônio. Se uma tela não consegue enunciar seu objetivo executivo em uma frase, ela não deve existir.

---

## Princípios derivados da fundação (herdados, não negociáveis)

| Origem | Princípio aplicado ao produto |
|--------|-------------------------------|
| VIS-007 / REQ-041 | A conversa é a interface principal; todo o resto é apoio contextual |
| REQ-037 / REQ-039 | A interface reflete exatamente um COA ativo; nunca mistura contextos |
| CON-001 princípio 1 | Respeito absoluto ao tempo: sem burocracia, sem repetição, sem cliques desnecessários |
| CON-001 princípio 8 | Transparência sobre limitações — a interface nunca finge capacidades que não tem |

---

## Diretrizes arquiteturais promovidas (F1 — Gate de Encerramento)

> Vigentes desde 26/07/2026. Texto integral e implicações: [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md).

| ID | Ex-HP | Diretriz | Status |
|----|-------|----------|--------|
| **DA-001** | HP-001 | Objetivo antes da Ferramenta | **Vigente** |
| **DA-002** | HP-002 | O contexto sobrevive às tarefas | **Vigente** |
| **DA-003** | HP-003 | Navegação por níveis de abstração | **Vigente** |

| Hipótese | Status (não normativa plena) |
|----------|------------------------------|
| HP-004 — Atenção antes da Informação | Em observação |
| HP-005 — A decisão é a unidade de progresso | Em observação |
| HP-006 — Justificativa rastreável | Em observação avançada |

---

## Uso destes princípios

1. **Em REQs futuros de interface:** critérios de aceitação devem referenciar os princípios pertinentes e, quando aplicável, **DA-001…DA-003**.  
2. **Em revisões do CTO:** desvio de princípio ou de diretriz vigente é achado de revisão.  
3. **Em decisões de design:** conflito resolve-se nesta ordem: CON-001 / VIS → **P1 > P2 > P3 > P5 > P6 > P4** → **DA-001…DA-003** → preferências de implementação.  
4. **HP em observação:** informam o desenho; não geram requisito vinculante até promoção.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO definiu o núcleo; Engenheiro (Cursor) redigiu; CTO promoveu DA via Gate de Encerramento F1 |
| Quando | 26/07/2026 |
| Por quê | Base normativa para toda a experiência do produto; incorporar aprendizado F1 |
| Baseado em quê | Autorização IPR-001 (seis princípios); CON-001; VIS-007; deliberação HP no encerramento F1 |
| Resultado | P1–P6 + DA-001…003 vigentes; HP-004/005/006 em observação |
