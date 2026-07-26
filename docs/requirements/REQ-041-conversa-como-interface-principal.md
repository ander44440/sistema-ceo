# REQ-041 — Conversa como interface principal do Executivo Digital

> **Status:** Homologado — v1.0 (CTO, 25/07/2026)  
> **Versão:** 1.0 — 25/07/2026  
> **Capacidade:** CAP-03 — Gestão de Projetos

## Enunciado

O CEO deverá tratar a **caixa de conversa** como a principal forma de interação na Home, sempre contextualizada pelo Contexto Operacional Ativo (COA); todos os demais componentes existem para fornecer contexto e apoiar a tomada de decisão; atos de registro por botão permanecem apenas como ferramentas auxiliares.

## Tipo

Funcional / experiência; detalhado. **Princípio de UX** deste ciclo.

## Justificativa

Princípio CTO (VIS-007 §2): *"A conversa é a interface principal do Executivo Digital."* Necessidade operacional: sensação de conversar com um executivo, não de preencher formulários.

A conversa deixa de ser um recurso adicional e passa a constituir o **mecanismo primário de interação** entre o Patrocinador e o CEO, enquanto os demais componentes assumem papel de suporte contextual.

## Critérios de aceitação

* A Home apresenta caixa de entrada de pergunta/comando em posição central dominante.
* Existem exemplos de comandos observáveis (ex.: concluir iniciativa do COA; revisar artefato; abrir outro COA; atenção do dia; analisar; planejar).
* Existe ação explícita de envio.
* Botões de registro (decisão/conhecimento) não competem visualmente com a conversa como centro.
* Toda mensagem enviada é atribuída ao COA ativo (REQ-037).
* Após a troca de COA (REQ-038), a interface conversacional deverá permanecer disponível, passando a operar imediatamente sobre o novo COA ativo, preservando o princípio conversacional da Home.

## Fora do escopo

* Orquestração multi-IA / roteamento automático de agentes (capacidades futuras).
* Substituição das ferramentas de execução externas (REQ-030 preservado).
* Motor de linguagem específico (escolha tecnológica na IMP, sob ARQ).

## Dependências

REQ-037; REQ-040; VIS-007 §2.

## Riscos e incertezas

* Expectativa de autonomia plena na conversa além do escopo homologado — declarar limitações (transparência CON-001 Art. 9º princípio 8).

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-03 |
| Norma superior | VIS-007 §2; CON-001 Art. 9º princípios 1, 7, 8, 9 |
| Origem | Deliberação CTO — princípio conversacional |
| Decisões derivadas | ARQ-012 |
| Implementação | — |
| Testes | — |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 25/07/2026 | Engenheiro (Cursor) | Criação | Princípio UX CTO | Em análise |
| 0.2 | 25/07/2026 | Engenheiro (Cursor) | Ajustes CTO: conversa contextualizada ao COA; continuidade pós-troca; mecanismo primário de interação | Deliberação CTO — HOMOLOGADO COM AJUSTES | Conferência final aprovada |
| 1.0 | 25/07/2026 | CTO (homologação) / Engenheiro (registro) | Promoção a Homologado após conferência final | Deliberação Final do CTO — REQ-041 HOMOLOGADO | **Homologado** |
