# Ficha — PagerDuty Operations Cloud (26/07/2026)

> **Status: Homologada — Gate F1-D (CTO, 26/07/2026). Integra a base documental da IPR-001.**  
> Template: v0.2 (seções obrigatórias Gate F1).  
> Fontes verificáveis apenas.  
> Domínio novo: **ops / command center** (RE-02).

---

## Metadados

| Campo | Valor |
|-------|-------|
| Produto | **PagerDuty Operations Cloud** |
| Categoria | Executiva (hub de operações / incident command) |
| URL / fonte | https://www.pagerduty.com/ e https://www.pagerduty.com/platform/operations-cloud/ (observado 26/07/2026) |
| Versão / superfície observada | Páginas públicas de produto — Operations Cloud |
| Data da observação | 26/07/2026 |
| Observador | Engenheiro (Cursor) |
| Classificação (após análise) | **Parcial** (forte em posto de comando operacional e níveis alerta→incidente→aprendizado; domínio = ops/SRE, não governança executiva conversacional) |

---

## 1. Identidade do Produto

PagerDuty apresenta-se como plataforma **AI-first de operações** para trabalho mission-critical: pessoas e IA juntas em operações que reduzem risco e sustentam crescimento ([pagerduty.com](https://www.pagerduty.com/)). Operations Cloud: onde People e AI fazem trabalho operacional crítico ([operations-cloud](https://www.pagerduty.com/platform/operations-cloud/)).

## 2. Primeira Impressão

Sensação de **posto de comando de crise/ops**: incident management, AIOps, status pages, agents (SRE, Scribe, Shift, Insights). Tom de urgência controlada e accountability — não de chat genérico nem de dashboard de vanity metrics.

## 3. Organização da Informação

* Hierarquia operacional implícita: **alertas/ruído → incidentes → resposta unificada → post-incident review**.  
* AIOps: separar sinal de ruído (claim: reduzir 91% do alert noise).  
* Status Pages: fonte única de verdade de status do sistema.  
* Agents especializados por função (detect/triage; documentar; handoff de plantão; tendências).  
* Integrações (750+) e superfície de resposta em Slack/Teams/web/mobile.

## 4. Fluxo de Uso

1. Sinal chega (alerta); ruído é filtrado.  
2. Incidente é orquestrado; pessoa certa é acionada (routing dinâmico).  
3. Resposta unificada com contexto compartilhado.  
4. Pós-incidente: resumo, action items, aprendizado.  
5. Níveis de abstração: do evento bruto ao aprendizado sistêmico.

## 5. Apoio à Tomada de Decisão

Empurra **ação sob pressão** (quem responde, o que fazer, o que aprender depois). Insights Agent e postmortems sobem o nível de abstração (tendências sistêmicas). Nem tudo é “próximo passo estratégico de negócio” — é decisão operacional.

## 6. Diferenciais Observados

### O que pode informar o CEO (adaptar, não copiar)

| Incorporar (conceitual) | Por quê |
|-------------------------|---------|
| Hierarquia explícita de níveis (sinal → incidente → resolução → evidência/aprendizado) | Apoia **HP-003** — navegar abstrações sem perder continuidade |
| Separar sinal de ruído antes de decidir | P2 — informação → decisão |
| Accountability e contexto no handoff | P1 — controle; continuidade do raciocínio |
| Pós-ação com evidências/action items | Rastreabilidade / memória organizacional |

## 7. O que NÃO copiar para o CEO

| Não incorporar | Por quê |
|----------------|---------|
| Identidade de incident/SRE como Home do CEO | Domínio errado — CEO ≠ on-call hub |
| Autonomia opaca de agents “fixando sozinhos” sem transparência | Risco a P1 / CON-001 p.8; H5 |
| Densidade de alertas/integrações como default visual | Conflita P4 e tempo do usuário |
| Status page pública como metáfora da Home | Home do CEO é conversa + COA, não página de uptime |
| Multi-superfície Slack/Teams como centro | REQ-041: conversa do CEO é a interface principal do produto, não um add-on em chat de equipe |

## 8. Aplicabilidade ao CEO

| Nível | Justificativa |
|-------|---------------|
| **Média** | Média-alta para **navegação entre níveis** e posto de comando sob clareza (HP-003, P1/P2); baixa na forma (ops tooling, não governança conversacional multiprojeto). |

---

## Dimensões (D1–D10) — rubrica complementar

| ID | Nota (1–5 / N/A) | Evidência | Lição útil ao CEO | Risco de cópia |
|----|------------------|-----------|-------------------|----------------|
| D1 Controle | 4 | Routing, ownership, handoffs | Controlo sob pressão | On-call como modelo mental |
| D2 Info → decisão | 5 | Noise reduction → ação | Sinal antes de ação | Alert wall |
| D3 Clareza | 4 | Status pages; lifecycle claro | Vocabulário de níveis | Jargão SRE |
| D4 Densidade / elegância | 2 | Plataforma ampla de ops | — | Densidade excessiva |
| D5 Consistência | 3 | Lifecycle repetível | Fluxo estável | Suite fragmentada |
| D6 Objetivo por superfície | 3 | Incidente = foco único na crise | Um foco por momento | Multi-produto na home |
| D7 Conversação | 2 | Resposta em Slack/Teams; não é chat-first do produto | Conversa como canal, não núcleo | Importar Slack como Home |
| D8 Contexto / isolamento | 3 | Contexto no incidente; multi-serviço | Contexto no evento | Sem COA |
| D9 Tempo do usuário | 4 | Reduzir ruído e MTTR | Respeitar tempo sob urgência | Notificações constantes |
| D10 Identidade / tom | 3 | AI-first ops | Tom de comando | Identidade de monitoramento |

## Implicações por frente

| Frente | Implicação (se houver) |
|--------|------------------------|
| UX | Modelar níveis (objetivo → execução → evidência) com transição explícita |
| UI | N/A nesta fase |
| Branding | Posto de comando ≠ painel de alertas |
| Design system | N/A |

## Conclusão

PagerDuty ensina **navegação operacional entre níveis (sinal → ação → evidência)** com accountability — apoio a HP-003; não ensina a Home conversacional do CEO.

---

## Memória Organizacional (da ficha)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Novo domínio (ops hub) pós F1-C; testar HP-003 |
| Baseado em quê | pagerduty.com; operações-cloud; deliberação HP-003 |
| Resultado | Ficha v0.1 submetida ao CTO |
