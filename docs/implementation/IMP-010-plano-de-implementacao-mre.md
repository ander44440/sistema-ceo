# IMP-010 — Plano de Implementação do Motor de Raciocínio Executivo (MRE)

> **Status: Aprovado — v0.1 (30/07/2026).**  
> Tipo IMP (ADR-012). **Identificação:** IMP-010 (IMP-009 = CAP-03 — encerrado).  
> Norma superior: CON-001; ADR-006; ADR-012; ADR-015; **ADR-019** (não alterado por este IMP); **REQ-048…051 Aprovadas**; **ARQ-013 Consolidação aprovada**.  
> **Gate ARQ:** Aprovado (ARQ-013). **Gate deste plano:** Aprovado (patrocinador, 30/07/2026).  
> **Bloco 1 (specs):** [IMP-011](IMP-011-contrato-validacao-parecer-executivo.md) · [IMP-012](IMP-012-pipeline-mre-estagios-0-7.md) · [IMP-013](IMP-013-aprendizado-executivo-estagio-8.md).  
> Este documento **planeja** a materialização incremental do MRE conforme ARQ-013 §7.  
> **Proibições:** não implementa código; não cria REQs; não altera ADRs; não altera REQs/ARQ-013; não inicia VAL antes do encerramento da IMP; não declara produção sem critérios da §11.

---

## 1. Objeto e premissas

Materializar o Motor de Raciocínio Executivo de forma incremental: contrato `ParecerExecutivo`, pipeline deliberativo, Aprendizado Executivo, integração com o Núcleo, Speaker, canais, Fila e retenção — preservando a separação **deliberação / comunicação / retenção**.

Premissas:

1. REQ-048…051 e ARQ-013 estão aprovadas; modelagem MRE **encerrada**.
2. Este IMP subordina-se integralmente a ADR-019, REQ-048…051 e ARQ-013; não redefine arquitetura nem requisitos.
3. Cada fase (F1–F9) tem objetivo único, dependências explícitas e critérios de conclusão verificáveis.
4. Tecnologia, caminhos de ficheiros e classes **não** são prescritos aqui (ADR-012); escolhas táticas cabem à execução autorizada, dentro dos limites normativos.
5. Fluxos determinísticos do Núcleo **permanecem** sem MRE.
6. Princípios **nunca** são aplicados automaticamente (REQ-051 H1).

---

## 2. Objetivo institucional

Transformar o fluxo deliberativo do CEO de “uma chamada LLM que raciocina e fala” em pipeline auditável com parecer válido, comunicado fiel e retenção governada — priorizando uso operacional (ADR-015) sem comprometer o rigor ADR-006.

Durante a execução:

* não se reabrem REQs, ARQ-013 nem ADRs;
* não se mistura prosa de utilizador no Reasoner;
* não se inicia VAL formal antes do encerramento deste IMP;
* commits e código só após autorização explícita do Gate / patrocinador.

---

## 3. Critérios de sucesso do IMP

O IMP-010 só se considera **encerrado com sucesso** quando, cumulativamente:

| # | Critério |
|---|----------|
| 1 | F1–F8 concluídas com evidência e gates de fase aprovados |
| 2 | Toda rota deliberativa produz `ParecerExecutivo` válido (REQ-048) antes de qualquer comunicação |
| 3 | Speaker só consome parecer válido; fidelidade deliberativa observável (REQ-050) |
| 4 | Aprendizado aplica critérios M/P/R; princípios só `pendente_gate` (REQ-051) |
| 5 | Núcleo: deliberativo → MRE; não deliberativo → sem MRE |
| 6 | Despacho à Fila apenas com parecer válido e `acao` coerente (V3) |
| 7 | Estratégias de teste, integração e rollback desta IMP cumpridas ou explicitamente diferidas ao VAL com rastreio |
| 8 | Critérios de entrada em produção (§11) satisfeitos ou produção ainda **não** declarada |

---

## 4. Limites

Este IMP **não**:

* cria novas REQs nem altera ADR-019 / demais ADRs;
* redesenha Voice (REQ-047), Onboarding (REQ-046) ou Fila (REQ-045) além da ligação ao parecer;
* autoriza código neste documento;
* declara sucesso operacional sem VAL subsequente (ADR-006).

---

## 5. Ordem dos componentes

Ordem de materialização (alinhada a ARQ-013 §7):

```text
1. Validador / contrato ParecerExecutivo
2. Pipeline MRE (estágios 0–7 + montagem)
3. Aprendizado Executivo (estágio 8 + plano de retenção)
4. Integração Núcleo → MRE
5. Speaker Executivo
6. Ligação Chat / Voice / Centro de situação
7. Despacho Fila ← acao.job
8. Persistência memória/precedente + fila de Gate de princípios
9. Fecho IMP + preparação VAL
```

---

## 6. Fases de implementação

### F1 — Contrato e validação do ParecerExecutivo

| | |
|--|--|
| **Objetivo** | Materializar o contrato lógico REQ-048 e a validação V1–V6. |
| **Componentes** | Modelo lógico do parecer; validador determinístico. |
| **REQs** | 048 |
| **Depende de** | — (fase inicial) |
| **Critérios de conclusão** | Parecer válido aceite; inválido rejeitado; enums e V3/V4 testáveis sem UI. |
| **Gate** | Evidência de casos válido/inválido antes de F2. |

---

### F2 — Pipeline MRE (estágios 0–7 + montagem)

| | |
|--|--|
| **Objetivo** | Executar 0→1→2→3→4→5a∥5b→6→7 e montar parecer candidato. |
| **Componentes** | Reasoner / orquestrador de estágios; dossier DET (estágio 2). |
| **REQs** | 049 (parcial), 048 |
| **Depende de** | F1 |
| **Critérios de conclusão** | Uma entrada deliberativa → um parecer candidato com blocos 0–7; sem prosa de Speaker; falha LLM → caminho controlado (REQ-049). |
| **Gate** | Pipeline isolado (sem Speaker) com evidência de transição T1–T5. |

---

### F3 — Aprendizado Executivo

| | |
|--|--|
| **Objetivo** | Estágio 8 + critérios M/P/R; bloco `aprendizado` conforme V4. |
| **Componentes** | Aprendizado Executivo (decisão de retenção, sem persistência completa ainda). |
| **REQs** | 051, 048 V4, 049 estágio 8 |
| **Depende de** | F2 |
| **Critérios de conclusão** | Booleanos coerentes; `atualizarPrincipios` ⇒ `propostaPrincipio`; **nenhuma** escrita automática de princípios. |
| **Gate** | Parecer completo 0–8 + validação F1. |

---

### F4 — Integração Núcleo → MRE

| | |
|--|--|
| **Objetivo** | Roteamento: deliberativo invoca MRE; determinístico não. |
| **Componentes** | Núcleo Executivo (admissão/rota); fachada MRE. |
| **REQs** | 049 integração; ADR-019 |
| **Depende de** | F3 (parecer completo disponível) |
| **Critérios de conclusão** | Cenários: abrir_dia / registos estruturados **sem** MRE; mensagem deliberativa **com** parecer válido ou falha controlada. |
| **Gate** | Matriz de rotas verificada; sem regressão dos fluxos determinísticos. |

---

### F5 — Speaker Executivo

| | |
|--|--|
| **Objetivo** | `ParecerExecutivo` válido → `ComunicadoExecutivo` (REQ-050). |
| **Componentes** | Speaker; regras G1–G7. |
| **REQs** | 050 |
| **Depende de** | F1 (obrigatório); F3 recomendado; tipicamente após F4 para caminho ponta a ponta |
| **Critérios de conclusão** | `referenciaDecisao` = estado do parecer; sem nova deliberação; `solicitar_dados` ⇒ perguntas não vazias. |
| **Gate** | Testes de fidelidade deliberativa (amostra de estados). |

**Nota de ordem:** F5 pode iniciar em paralelo técnico após F1+F3 com pareceres fixture, mas **integração** no caminho vivo exige F4.

---

### F6 — Ligação aos canais (Chat / Voice / Centro)

| | |
|--|--|
| **Objetivo** | Canais consomem comunicado; não chamam MRE diretamente. |
| **Componentes** | Conversa; Voice (REQ-047); destaques do centro de situação. |
| **REQs** | 050; 047 (consumo) |
| **Depende de** | F5; F4 para caminho completo |
| **Critérios de conclusão** | `chat` / `voz` / `centro_situacao` adaptam forma sem mudar decisão; Voice usa guião/texto do Speaker. |
| **Gate** | Smoke por canal com mesmo parecer → significados equivalentes. |

---

### F7 — Despacho à Fila de Execução

| | |
|--|--|
| **Objetivo** | Quando `acao.tipo = despachar` e `job` presente, integrar REQ-045. |
| **Componentes** | Ponte parecer → fila; sem redesenhar a fila. |
| **REQs** | 045; 048 V3; 049 |
| **Depende de** | F4 (parecer no fluxo); F1 |
| **Critérios de conclusão** | Só despacha com parecer válido; coerência estado↔ação; Speaker não executa job. |
| **Gate** | Caso `delegar`/`aprovar+despachar` cria job rastreável a `parecerId`. |

---

### F8 — Persistência de retenção e Gate de princípios

| | |
|--|--|
| **Objetivo** | Executar Plano de Retenção: memória, precedente, proposta `pendente_gate`. |
| **Componentes** | Persistência de memória/precedente; fila/registo de propostas de princípio. |
| **REQs** | 051 H1–H4 |
| **Depende de** | F3; F4 (pareceres reais) |
| **Critérios de conclusão** | Efeitos idempotentes por `parecerId`; princípios **nunca** aplicados nesta fase; rastreio completo. |
| **Gate** | Auditoria: proposta existe e permanece pendente até Gate humano externo. |

---

### F9 — Fecho da IMP e preparação da VAL

| | |
|--|--|
| **Objetivo** | Consolidar evidências F1–F8; abrir caminho à VAL (sem executá-la aqui). |
| **Componentes** | Relatório de implementação / checklist de conformidade. |
| **REQs** | 048…051; ARQ-013 |
| **Depende de** | F1–F8 |
| **Critérios de conclusão** | Lacunas documentadas; critérios §3 verificados ou com NC rastreadas; plano VAL esboçado (artefato VAL futuro). |
| **Gate** | Encerramento formal do IMP-010 pelo Gate (CTO/patrocinador). |

---

## 7. Dependências entre as fases

```text
F1 ──→ F2 ──→ F3 ──→ F4 ──→ F6
                │      │
                │      ├──→ F7
                │      └──→ F8
                │
                └──→ F5 ──→ F6
                      
F1–F8 ──→ F9
```

| Fase | Pré-requisitos rígidos | Pode paralelizar com |
|------|------------------------|----------------------|
| F1 | — | — |
| F2 | F1 | — |
| F3 | F2 | — |
| F4 | F3 | F5 (com fixtures) |
| F5 | F1 (+ F3 para parecer completo) | F4 |
| F6 | F5, F4 | F7 (após F4) |
| F7 | F1, F4 | F5/F6/F8 |
| F8 | F3, F4 | F5/F6/F7 |
| F9 | F1–F8 | — |

---

## 8. Estratégia de integração

1. **Contrato primeiro:** F1 é a interface estável entre Reasoner, Speaker, Fila e retenção.  
2. **Vertical fino:** após F4+F5, um único cenário deliberativo ponta a ponta (mensagem → parecer → comunicado) antes de expandir canais.  
3. **Feature flag / rota:** integração no Núcleo deve permitir desligar a rota MRE e voltar ao comportamento anterior (ver rollback).  
4. **Não big-bang:** Fila (F7) e retenção (F8) ligam-se depois do caminho deliberativo estável.  
5. **Sem acoplamento invertido:** Voice/UI não importam o Reasoner; só o comunicado (ou parecer só para auditoria/UI avançada, sem redeliberar).  
6. **Dados de teste:** pareceres fixture (válidos/inválidos) partilhados entre F1, F5 e testes de fidelidade.

---

## 9. Estratégia de testes

| Nível | Quando | Foco |
|-------|--------|------|
| Contrato | F1+ | V1–V6; enums; V3 decisão↔ação; V4 aprendizado |
| Estágio / pipeline | F2–F3 | Pós-condições; T1–T5; short-circuit T4; falha LLM controlada |
| Roteamento | F4 | Matriz deliberativo vs determinístico |
| Fidelidade Speaker | F5–F6 | G1–G7; lacunas; equivalência semântica entre canais |
| Integração Fila | F7 | Job só com parecer válido |
| Retenção | F8 | H1 (não auto-aplicar); idempotência `parecerId` |
| Regressão | Contínuo | Fluxos determinísticos do Núcleo; Conversa sem MRE quando flag off |
| VAL formal | Pós-F9 | Artefato VAL próprio (fora deste IMP) |

**Proibições de teste:** payloads de exploração ofensiva; testes que exijam auto-aplicação de princípios.

---

## 10. Estratégia de rollback

| Situação | Ação |
|----------|------|
| Regressão no Núcleo após F4 | Desativar rota deliberativa MRE; restaurar caminho anterior de resposta (assistido legado **ou** mensagem de indisponibilidade deliberativa — nunca parecer falso) |
| Speaker degrada fidelidade | Servir template DET mínimo a partir do parecer; não reabrir MRE para “corrigir” decisão |
| Pipeline MRE instável | Manter F1; isolar Reasoner; canais mostram falha controlada |
| Fila com jobs incorretos | Deixar de emitir jobs a partir do MRE; cancelar/ignorar jobs ligados a pareceres da janela afetada conforme REQ-045 |
| Retenção incorreta | Pausar F8; não reverter princípios (não deveriam ter sido aplicados); marcar precedentes/memórias suspeitos para revisão |
| Entrada em produção prematura | Reverter flag de produção MRE; manter modelagem intacta |

**Princípio:** rollback desliga **efeitos**, não apaga a norma (REQ/ARQ). Preferir feature flag a remoção destrutiva.

---

## 11. Critérios para entrada em produção

Produção do MRE (uso real no caminho deliberativo por omissão) **só** quando **todos** os itens seguintes forem verdadeiros:

| # | Critério |
|---|----------|
| P1 | IMP-010 encerrado (F9) com gates F1–F8 aprovados |
| P2 | VAL do MRE homologada (artefato VAL futuro) — **bloqueante** |
| P3 | Rota deliberativa com parecer válido em cenários de aceitação acordados (incl. `solicitar_dados` e um estado de decisão fechada) |
| P4 | Speaker sem incumprimento material de fidelidade nos testes de aceitação |
| P5 | H1 verificado: nenhuma atualização automática de princípios em produção |
| P6 | Rollback por flag ensaiado com sucesso |
| P7 | Fluxos determinísticos do Núcleo sem regressão |
| P8 | Autorização explícita do patrocinador / Gate para ligar a flag de produção |

Até P1–P8, o MRE pode existir em **modo sombreado / flag desligada** apenas para desenvolvimento e evidências — **não** é produção.

---

## 12. Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-006; ADR-012; ADR-015; ADR-019 |
| Arquitetura | ARQ-013 |
| Requisitos | REQ-048; REQ-049; REQ-050; REQ-051 |
| Adjacentes | REQ-045; REQ-047 |
| VAL | *A criar após encerramento deste IMP* |
| Código | *Proibido até autorização de execução das fases* |

---

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Plano IMP do MRE (F1–F9) | ARQ-013 aprovada; ADR-006 | **Aprovado** |
