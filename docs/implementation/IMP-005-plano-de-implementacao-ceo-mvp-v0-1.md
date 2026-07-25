# IMP-005 — Plano de Implementação do CEO MVP v0.1 (Uso Diário MG2)

> **Status: Homologado v1.0 — Implementação CONCLUÍDA e ENCERRADA (E1–E7 Homologadas; Gate E7, 23/07/2026).**
> Versão 1.0 — 23/07/2026. Tipo IMP (ADR-012).
> Norma superior: CON-001 v1.0; ADR-006; ADR-012; ADR-015 v1.0; VIS-003 v1.0; REQ-016 a REQ-032 (pacote homologado); ARQ-008 v1.0 (homologada).
> Marco: `CEO-MVP-START`.
> Este documento **planejou** a execução. Não cria requisitos, não altera a ARQ-008, não amplia escopo além de REQ-016…032.
> **E1–E7:** Homologadas. **IMP-005:** encerrado. **Validação Operacional (VIS-003 §7):** autorizada — ver VAL-005.
> **Diretriz permanente (ARQ-008):** *Todo módulo do CEO existe para apoiar o ciclo diário do patrocinador. O objeto central da arquitetura é o Dia de Trabalho.*

---

## 1. Objeto e premissas

Materializar o **CEO MVP v0.1** operável para o uso diário do patrocinador no desenvolvimento do MG2, conforme a ARQ-008 homologada e os REQ-016 a REQ-032, de modo que o eixo

**Abrir o Dia → Trabalhar → Registrar → Fechar o Dia → Continuar Amanhã**

passe a existir como experiência contínua — sem funcionalidades fora do pacote homologado.

Premissas:

1. VIS-003, Pacote REQ MVP e ARQ-008 estão homologados; fase de Arquitetura do MVP **encerrada**.
2. Implementação **subordina-se** integralmente à ARQ-008 (módulos A–G) e aos REQ-016…032.
3. Nenhuma etapa produz efeitos permanentes de uso antes do respectivo gate.
4. Idempotência: reexecução de etapa homologada sem mudança deliberada = sem alterações adicionais.
5. Tecnologia, linguagem e ferramenta **não** são decididas neste IMP (ADR-012; ARQ-008 §8); escolhas táticas, se necessárias, exigem deliberação explícita do CTO **dentro** dos limites da ARQ, sem novo escopo funcional.
6. Execução do MG2 permanece **fora** do CEO (REQ-030 / módulo G).
7. Critério de sucesso de produto permanece o do VIS-003 §7 (cinco dias úteis) — evidenciado na Validação, não confundido com gates de etapa.

---

## 2. Objetivo Institucional

O IMP-005 existe para tornar o **Dia de Trabalho** o objeto central operacional do CEO MVP: o patrocinador consegue abrir, registrar, fechar e continuar o dia no contexto MG2 com baixa carga cognitiva, sem reexplicar o contexto do zero.

Durante a execução deste IMP:

* **não** se introduzem capacidades do VIS-003 §6 / fora de REQ-016…032;
* **não** se substitui a oficina de execução do MG2;
* **não** se altera REQs, ARQ-008 nem ADRs de fundamento.

---

## 3. Critérios de Sucesso do IMP

O IMP-005 somente se considera **encerrado com sucesso** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | Módulos A–G da ARQ-008 materializados no escopo do MVP (responsabilidades observáveis) |
| 2 | Eixo Abrir → Trabalhar → Registrar → Fechar → Continuar percorrível de ponta a ponta |
| 3 | REQ-016…032 cobertos por evidência de etapa (sem lacuna obrigatória) |
| 4 | Limites G observáveis (um contexto MG2; patrocinador único; sem execução MG2 no CEO; atenção ≤3) |
| 5 | Verificação de conformidade (etapa de verificação) aprovada |
| 6 | Nenhuma funcionalidade além do pacote REQ homologado |

O não cumprimento de qualquer critério impede o encerramento institucional.

---

## 4. Limites do IMP-005

Este IMP **não**:

* amplia escopo além de REQ-016…032 / ARQ-008;
* implementa multi-projeto, multi-usuário, orquestração de IAs, dashboards ou automação do pipeline MG2;
* altera REQs, ARQs ou ADRs;
* substitui a etapa Validação ADR-006 / VAL futuro do MVP;
* declara sucesso dos cinco dias do VIS-003 sem Validação homologada.

---

## 5. Princípios de execução (obrigatórios)

| ID | Princípio |
|----|-----------|
| X1 | Não reinterpretar ARQ-008 nem alterar REQ-016…032 |
| X2 | Objeto central = **Dia de Trabalho**; toda entrega de etapa serve ao eixo diário |
| X3 | Ordem de materialização segue dependências da ARQ-008 (B/G → F → A → C → D/E → integração) |
| X4 | Sugerir sem impor (REQ-027) em todo ato de autoridade |
| X5 | Registrado ≠ inventado (REQ-024); ausência explícita |
| X6 | Trabalhar (execução MG2) permanece fora do CEO |
| X7 | Baixa carga e respeito ao tempo (REQ-028, REQ-032) |
| X8 | Idempotência de etapa |

---

## 6. Etapas

### E1 — Fundação: Contexto MG2 e Limites (módulos B, G)

Materializar o contexto ativo exclusivo MG2 e as restrições transversais do MVP (patrocinador único; fronteira de execução; enunciado operacional dos limites de carga/tempo como restrições de desenho).

**REQs:** 017, 030, 031; prepara 028, 032.  
**Critérios de conclusão:** contexto MG2 único observável; limites G documentados/operacionais no desenho; sem multi-projeto; sem execução MG2 embutida.  
**Gate:** homologação antes de E2.

### E2 — Continuidade de Estado (módulo F)

Materializar a preservação do estado do Dia de Trabalho entre sessões/dias: foco, onde parou, próximo passo confirmado, atenções pertinentes e vínculos aos registros.

**REQs:** 026, 029.  
**Critérios de conclusão:** estado reapresentável após “fechamento simulado” ou equivalente de etapa; sem exigir reexplicação narrativa completa.  
**Gate:** homologação antes de E3.

### E3 — Superfície do Dia (módulo A)

Materializar o Painel do Dia como primeira e única composição de entrada, com os sete elementos do REQ-016 e atenção 0–3 / “nada pendente” (REQ-021), ações rápidas expostas.

**REQs:** 016, 021; contribui a 028, 032.  
**Critérios de conclusão:** Painel é a primeira superfície; elementos obrigatórios presentes; exclusões do REQ-016 respeitadas (sem dashboard/listas longas/etc.).  
**Gate:** homologação antes de E4.

### E4 — Ciclo do Dia (módulo C)

Materializar Abrir o Dia, Foco (uma frase), Próximo passo (um), Fechar o Dia e Confirmação do patrocinador.

**REQs:** 018, 019, 020, 025, 027.  
**Critérios de conclusão:** atos do ciclo percorríveis; mudanças de autoridade só após confirmação; um próximo passo por vez.  
**Gate:** homologação antes de E5.

### E5 — Registrar: Decisões e Conhecimento (módulos D, E)

Materializar registro de decisão (REQ-022), registro de conhecimento reutilizável (REQ-023) e consulta com ausência explícita (REQ-024), acionáveis a partir do Painel.

**REQs:** 022, 023, 024.  
**Critérios de conclusão:** decisão e conhecimento distinguíveis; consulta não inventa; ausência explícita quando vazio.  
**Gate:** homologação antes de E6.

### E6 — Integração do eixo e verificação

Percorrer ponta a ponta Abrir → (Trabalhar fora) → Registrar → Fechar → Continuar; verificar matriz ARQ-008 §7 e cobertura REQ-016…032; sanar inconsistências sem novo escopo.

**REQs:** todos (verificação).  
**Critérios de conclusão:** relatório de verificação com evidências; zero inconsistências abertas no escopo MVP; Critérios de Sucesso §3 itens 1–4 atendidos.  
**Gate:** homologação antes de E7.

### E7 — Encerramento institucional da Implementação

Declarar o MVP implementado nos limites do IMP-005; atualizar catálogo; registrar MO; encaminhar Validação (cinco dias / VIS-003 §7) à deliberação do CTO — **sem** abrir Validação por este ato.

**Critérios de conclusão:** declaração formal; catálogo atualizado; Critérios de Sucesso §3 integralmente atendidos; escopo não ampliado.  
**Gate:** homologação encerra o IMP-005.

---

## 7. Ordem e dependências

```text
E1 (B, G) → E2 (F) → E3 (A) → E4 (C) → E5 (D, E) → E6 (integração) → E7 (fecho)
```

| Dependência | Motivo |
|-------------|--------|
| E2 após E1 | Continuidade referencia contexto e limites |
| E3 após E2 | Painel exibe estado preservável |
| E4 após E3 | Ciclo opera sobre a superfície |
| E5 após E4 | Registros disparam das ações do ciclo/painel |
| E6 após E5 | Só então o eixo completo é verificável |
| E7 após E6 | Encerramento só com conformidade |

**Trabalhar (fora do CEO):** não é etapa de construção; é fronteira reafirmada em E1/E6 (REQ-030).

---

## 8. Artefatos por etapa

| Etapa | Artefatos esperados (lógicos — sem prescrever tecnologia) |
|-------|-------------------------------------------------------------|
| E1 | Contexto MG2 operacional no MVP; declaração/operacionalização dos Limites G |
| E2 | Mecanismo de estado do Dia de Trabalho (leitura/escrita conforme ARQ-008 F) |
| E3 | Painel do Dia completo (REQ-016/021) |
| E4 | Atos Abrir / Foco / Próximo / Fechar / Confirmar |
| E5 | Registro de decisão; registro de conhecimento; consulta com ausência |
| E6 | Relatório de verificação de conformidade MVP |
| E7 | Encerramento institucional; apontamento cadastral |

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Ampliar escopo “só um pouco” | X1; Limites §4; rejeitar qualquer item fora REQ-016…032 |
| Começar pela UI sem continuidade | Ordem E1→E2→E3 obrigatória |
| Confundir E6 com Validação dos 5 dias | E6 = conformidade ARQ/REQ; Validação = ato posterior |
| Embutir execução MG2 | REQ-030 / módulo G em E1 e E6 |
| Tecnologia antecipada no IMP | Premissa 5; ARQ-008 §8 |
| Ignorar confirmação do patrocinador | X4; checklist E4 |

---

## 10. Estratégia de validação por etapa

| Etapa | Validação |
|-------|-----------|
| E1 | MG2 único; limites G observáveis; sem multi-projeto / sem execução embutida |
| E2 | Estado sobrevive a reabertura simulada; REQ-026/029 |
| E3 | Checklist REQ-016 + REQ-021; exclusões do painel |
| E4 | Fluxo Abrir/Foco/Próximo/Fechar; REQ-027 em cada ponto de autoridade |
| E5 | Decisão ≠ conhecimento; consulta só registrado; ausência explícita |
| E6 | Matriz ARQ-008 §7; eixo ponta a ponta; NFR 028–032 amostrados |
| E7 | Declaração + catálogo; sem abrir Validação ADR-006 por este ato |

---

## 11. Batch Gates recomendados (ADR-006 intacta)

| Gate | Conteúdo |
|------|----------|
| Individual | Homologação deste **IMP-005** + autorização E1 |
| Individual | **E1** (fundação / limites) |
| Lote opcional | **E2 + E3** (estado + superfície) se deliberado |
| Individual | **E4** (ciclo — atos de autoridade) |
| Lote opcional | **E5** |
| Individual | **E6** (verificação) |
| Individual | **E7** (encerramento) |

Recomendação preferencial: IMP → E1 → E2 → E3 → E4 → E5 → E6 → E7 com gates individuais em E1, E4, E6 e E7.

---

## 12. Rastreabilidade

| Fonte | Materialização no IMP |
|-------|------------------------|
| ARQ-008 A–G | E1–E5 |
| Eixo do dia | E4 + E6 |
| REQ-016…021, 025, 027 | E3–E4 |
| REQ-022…024 | E5 |
| REQ-026, 029 | E2, E6 |
| REQ-017, 030, 031 | E1 |
| REQ-028, 032 | E3–E6 (qualidade transversal) |
| VIS-003 §7 | Fora deste IMP — Validação futura |
| ADR-015 | Premissas e Limites |

---

## 13. Estado processual (v1.0)

| Ato | Status |
|-----|--------|
| ARQ-008 | Homologada v1.0 — fase ARQ MVP encerrada |
| IMP-005 | **Homologado — v1.0** |
| Execução E1 | **Homologada** (Gate E1, 23/07/2026) |
| Execução E2 | **Homologada** (Gate E2, 23/07/2026) |
| Execução E3 | **Homologada** (Gate E3, 23/07/2026) |
| Execução E4 | **Homologada** (Gate E4, 23/07/2026) |
| Execução E5 | **Homologada** (Gate E5, 23/07/2026) |
| Execução E6 | **Homologada** (Gate E6, 23/07/2026) |
| Execução E7 | **Homologada** (Gate E7, 23/07/2026) |
| IMP-005 | **CONCLUÍDO e ENCERRADO** |
| Validação MVP (5 dias) | **Autorizada** — fase aberta; condução sob VAL-005 |

---

## 14. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO homologou Gates E1–E7 e encerrou o IMP-005; Engenheiro (Cursor) registrou |
| Quando | 23/07/2026 |
| Por quê | Encerrar a Implementação do CEO MVP v0.1 e abrir Validação Operacional |
| Baseado em quê | Decisão oficial CTO — Gate E7 HOMOLOGADO; IMP-005 ENCERRADO; abertura Validação VIS-003 §7 |
| Resultado | IMP-005 encerrado; projeto na fase de Validação Operacional (VAL-005) |

---

## 15. Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — E1–E7; eixo do dia; módulos A–G; critérios; limites | Homologação ARQ-008; autorização fase IMP | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Homologação; abertura autorizada da E1 | Deliberação formal CTO — IMP-005 HOMOLOGADO | **Homologado** |
| 1.0-fecho | 23/07/2026 | CTO; Engenheiro registrou | E1–E7 Homologadas; IMP-005 ENCERRADO; Validação autorizada | Decisão oficial Gate E7 | **Implementação ENCERRADA** |
