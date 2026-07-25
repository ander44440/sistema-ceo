# REQ-016 — Painel do Dia

> **Status:** Em análise  
> **Versão:** 0.1 — 23/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá apresentar ao patrocinador, como primeira superfície de uso do MVP, o **Painel do Dia**: uma única composição que exiba marca/posto, contexto ativo, foco de hoje, onde parou, próximo passo, atenção (ou “nada pendente”) e ações rápidas para registrar decisão, registrar conhecimento e fechar o dia.

## Tipo

Funcional; alto nível.

## Justificativa

VIS-003 §4 define a primeira tela como Painel do Dia — não dashboard. Sem ela, o critério de abrir o dia pelo CEO (VIS-003 §7) não se realiza. Filtro ADR-015: aproxima o uso diário imediato.

## Critérios de aceitação

* Ao abrir o CEO no MVP, a primeira superfície apresentada é o Painel do Dia.
* O painel contém os sete elementos do VIS-003 §4 (marca/posto; contexto ativo; foco de hoje; onde paramos; próximo passo; atenção; ações rápidas).
* O painel **não** apresenta listas longas, múltiplos projetos, gráficos, configurações de agentes, filas genéricas de tarefas nem feed de atividade.
* A pergunta respondida pelo painel é observável na composição: o que fazer agora no MG2 e o que o CEO já guarda.

## Fora do escopo

* Comportamento detalhado de cada ação rápida (REQ-019 a REQ-025).
* Escolha de tecnologia de interface.

## Dependências

REQ-017 (contexto MG2).

## Riscos e incertezas

* Tendência a transformar o painel em dashboard — mitiga-se pelos critérios negativos do VIS-003 §4.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Norma superior | CON-001 Art. 9º princípio 1; VIS-003 §4, M1; ADR-015 |
| Origem | Pacote Requisitos CEO MVP v0.1 |
| Decisões derivadas | — |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação | VIS-003 §4 | Em análise |
