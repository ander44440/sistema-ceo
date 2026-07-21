# ADR-002 — Diretrizes estratégicas: padrão documental, identidade do CEO, aprendizado organizacional e BCO

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem decidiu | CTO (ChatGPT), com aval do Usuário (CEO/Fundador) |
| Quando | 21/07/2026 |
| Por quê | Discussões posteriores à aprovação do VIS-001 produziram uma definição mais clara da identidade do CEO e da sua estratégia de evolução |
| Baseado em quê | CON-001 v1.0, VIS-001 v1.0, ADR-001, REQ-001 |
| Resultado | Registrado. CAP-001 em elaboração como próxima etapa |

## Status

Aceito.

## Natureza das decisões

Estas definições representam **visão estratégica e governança**. Não constituem requisitos funcionais nem decisões de implementação. Sua incorporação ocorrerá no momento adequado da engenharia de requisitos e da arquitetura, respeitando a hierarquia da CON-001.

---

## Decisão 1 — Padrão documental das quatro perguntas

Todos os documentos estratégicos do projeto deverão responder explicitamente, logo em sua abertura:

* O que é?
* Por que existe?
* Para quem existe?
* Como seu sucesso será medido?

Este é o padrão documental oficial do projeto a partir desta data.

## Decisão 2 — Identidade estratégica: uma equipe de IAs, não uma concorrente

O CEO não existe para competir com as IAs. Sua missão é **transformar diferentes inteligências artificiais em uma equipe de alto desempenho**, usando o melhor de cada agente para entregar ao usuário uma experiência única, consistente e contínua.

O usuário não deverá precisar decidir qual IA utilizar. Essa responsabilidade é sempre do CEO: ele decide quando utilizar cada agente, em que ordem, quando solicitar novas análises e quando devolver o resultado ao usuário.

## Decisão 3 — Aprendizado organizacional

O CEO deverá aprender continuamente durante sua interação com outras inteligências artificiais, **sem copiar modelos nem tentar reproduzi-las internamente**. Seu objetivo é absorver **competências observáveis**, por exemplo:

* métodos de arquitetura;
* métodos de implementação;
* processos de revisão;
* técnicas de planejamento;
* padrões de documentação;
* formas eficientes de coordenação.

O conhecimento adquirido deverá ser convertido em patrimônio permanente do próprio CEO.

## Decisão 4 — Banco de Competências Organizacionais (BCO): conceito arquitetural candidato

Fica registrado como **conceito arquitetural candidato** o BCO, cuja finalidade é preservar competências aprendidas ao longo da vida do sistema.

Cada competência deverá possuir, no mínimo: Nome; Origem (qual agente ou projeto a demonstrou); Descrição; Evidências observadas; Projetos onde foi validada; Grau de confiança; Histórico de evolução.

O CEO não aceitará automaticamente uma competência apenas porque uma IA a utilizou. Toda competência seguirá um **ciclo de maturação**:

1. Observação
2. Hipótese
3. Validação
4. Aprovação
5. Evolução contínua

Somente após validação a competência integrará oficialmente o patrimônio organizacional do CEO.

## Decisão 5 — Princípio estratégico: o conhecimento pertence ao CEO

O conhecimento pertence ao CEO, e não às ferramentas. ChatGPT, Cursor e quaisquer futuros agentes são fontes de aprendizado; as competências validadas compõem a inteligência organizacional permanente do CEO. A evolução do sistema torna-se, assim, independente da substituição de qualquer agente específico.

## Decisão 6 — Próxima etapa: CAP-001

Antes da criação de novos grupos de requisitos, será elaborado o **CAP-001 — Mapa de Capacidades do CEO**, identificando as capacidades que o CEO deverá desenvolver ao longo de sua evolução. O CAP-001 não define arquitetura nem implementação: organiza o domínio do problema antes do detalhamento dos requisitos.

---

## Rastreabilidade

- Norma superior: CON-001 v1.0 (em especial Art. 1º, 4º, 7º e 8º) e VIS-001 v1.0.
- Gera: `docs/CAP-001-mapa-de-capacidades.md`; futuros REQ-xxx e ADRs que incorporarem estas diretrizes.
- Relaciona-se com: REQ-001 (independência de ferramenta), ADR-001 (Decisões 1, 3 e 5).
