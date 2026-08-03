# IMP-013 — Aprendizado Executivo (Estágio 8)

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 1 — v0.2 (30/07/2026).**  
> Tipo IMP (ADR-012). **Bloco 1 / Fase F3** do [IMP-010](IMP-010-plano-de-implementacao-mre.md).  
> Norma superior: REQ-051; REQ-048 V4; REQ-049 estágio 8; ARQ-013; IMP-010; ADR-019 (*não alterado*).  
> **Código:** `app/src/mre/aprendizado/`, `executarDeliberacao.js`. Relatório: [`evidencias/BLOCO-1-relatorio-consolidado.md`](evidencias/BLOCO-1-relatorio-consolidado.md).  
> **Proibições cumpridas:** não aplica princípios; sem persistência F8; sem Speaker/Núcleo.

---

## 1. Objetivo

Materializar o **Aprendizado Executivo** no fecho do pipeline (estágio 8): avaliar o resultado deliberativo dos estágios 0–7 e produzir o bloco `aprendizado` (+ Plano de Retenção lógico), **sem deliberar de novo**, **sem alterar** `decisaoExecutiva`/`acao`, e **sem aplicar** princípios automaticamente.

## 2. Escopo

### Inclui

* Critérios M (memória), P (precedente), R (proposta de princípios) da REQ-051.  
* Preenchimento de `registrarMemoria`, `criarPrecedente`, `atualizarPrincipios`, `notas`, `propostaPrincipio` (condicional).  
* Plano de Retenção lógico: efeitos `persistir_memoria` \| `persistir_precedente` \| `abrir_proposta_principio` com `estadoHomologacaoPrincipio = pendente_gate` quando aplicável.  
* Montagem do `ParecerExecutivo` **completo** e validação integral via IMP-011 (V1–V6).  
* Garantia H1: nenhuma escrita em catálogo de princípios permanentes.

### Fora do escopo

* Persistência física idempotente e fila operacional de Gate (IMP-010 **F8**).  
* Speaker / canais / Fila de jobs.  
* Alteração de decisão ou reabertura dos estágios 0–7.  
* Homologação humana do Gate (apenas estado inicial `pendente_gate`).

## 3. Componentes envolvidos

| Componente lógico | Responsabilidade |
|-------------------|------------------|
| Avaliador de retenção | Aplica critérios M/P/R sobre parecer parcial 0–7 |
| Produtor do bloco `aprendizado` | Saída REQ-048 |
| Produtor do Plano de Retenção | Efeitos + estado de homologação |
| Montagem final do parecer | Une 0–8 + raiz (`id`, `criadoEm`, `confianca`, `lacunas`, …) |
| Validador (IMP-011) | Gate de validade completa |
| Guarda H1 | Impede side-effect de aplicar princípios |

## 4. Dependências

| Dependência | Tipo | Nota |
|-------------|------|------|
| **IMP-011** (gate) | Rígida | Validação V4/V1–V6 |
| **IMP-012** (gate) | Rígida | Entrada = blocos 0–7 + contexto |
| REQ-051 | Norma | Critérios e homologação |
| REQ-048 | Norma | Schema `aprendizado` |

**Fecha o Bloco 1:** parecer completo válido pronto para F4+ (Núcleo/Speaker) em fases seguintes do IMP-010.

## 5. Estratégia de implementação

1. Entrada: saída de IMP-012 (parcial até `acao`) + lacunas/confiança acumuladas.  
2. Avaliar M1–M4 / M−; P1–P3 / P−; R1–R4 em ordem; documentar decisão em `notas` quando útil.  
3. Se `atualizarPrincipios` → redigir `propostaPrincipio` testável; estado do plano = `pendente_gate` apenas.  
4. **Proibir** qualquer API de escrita de princípios nesta fase (guarda explícita).  
5. Calcular/atribuir `confianca` de forma mínima normativa (∈ [0,1]; reduzir com lacunas) — detalhe tático na execução.  
6. Montar parecer completo → `validar()` IMP-011; se inválido, uma regeneração só do bloco `aprendizado` / raiz, **sem** mutar decisão.  
7. Expor parecer válido + plano de retenção (efeitos ainda não persistidos em F8).  
8. Evidência: matriz critério → booleanos esperados (pelo menos memória sim/não; precedente sim/não; proposta sim/não).

## 6. Critérios de conclusão

* Estágio 8 produz `aprendizado` conforme REQ-048.  
* Critérios M/P/R observáveis na evidência (não ad hoc opaco).  
* Parecer completo passa validador IMP-011.  
* H1 verificável: zero aplicação de princípios.  
* Decisão e ação dos estágios 0–7 **intactas** após o aprendizado.  
* Plano de Retenção coerente com os booleanos.  
* Gate F3 / Bloco 1 satisfazível para validação conjunta com IMP-011 e IMP-012.

## 7. Critérios de teste

| ID | Caso | Esperado |
|----|------|----------|
| T13-01 | Deliberação operacional com despacho | `registrarMemoria = true` (M2) tipicamente |
| T13-02 | `solicitar_dados` sem facto novo | `registrarMemoria = false` (M−) tipicamente |
| T13-03 | `estado = adiar` / `solicitar_dados` | `criarPrecedente = false` (P−) |
| T13-04 | Estratégica + aprovar + lacunas vazias + confiança alta | `criarPrecedente` elegível (P1/P3) |
| T13-05 | Sem tensão de princípios | `atualizarPrincipios = false`; sem proposta |
| T13-06 | Tensão geral + R1–R4 | `atualizarPrincipios = true` + proposta não vazia + plano `pendente_gate` |
| T13-07 | Tentativa de aplicar princípio | Bloqueada / inexistente na API desta fase |
| T13-08 | Mutação de `decisaoExecutiva` pelo aprendizado | Proibida (teste de imutabilidade) |
| T13-09 | Parecer final | `validar` IMP-011 → ok |
| T13-10 | `atualizarPrincipios=true` sem proposta | Não emite / falha validação (não entrega inválido) |

## 8. Riscos conhecidos

| Risco | Mitigação |
|-------|-----------|
| Critérios M/P/R conservadores demais | Preferir sub-reter; ajustar só com Gate, sem mudar REQ |
| Confusão F3 vs F8 (persistência) | Esta IMP só intenção + plano lógico; F8 persiste |
| LLM no estágio 8 “reabre” deliberação | Contrato: só booleanos/proposta; input read-only da decisão |
| Duplicação futuro de precedentes | Idempotência é F8; aqui só flag |
| V5/V4 falham após montagem | Regenerar só aprendizado/raiz; não mexer decisão |

## 9. Rastreabilidade

| Elo | Ref. |
|-----|------|
| Fase IMP-010 | F3 |
| REQ | 051, 048 V4, 049 estágio 8 |
| Anteriores | IMP-011, IMP-012 |
| Seguintes | F4+ (IMP-010); persistência em F8 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Spec F3 — Aprendizado Executivo | Em análise |
| 0.2 | 30/07/2026 | Engenheiro (Cursor) | Implementação + testes T13 | Aguarda validação conjunta Bloco 1 |
