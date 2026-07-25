# Evidências — IMP-006 E1 (Memória Organizacional Viva)

> **Status: Executada e incorporada ao relatório consolidado (modelo contínuo CTO, 24/07/2026).**  
> Data: 24/07/2026.  
> Norma: IMP-006 v1.0; ARQ-009 componente H; REQ-033 RF-01.  
> Pré-condição: IMP-006 Homologado; E1 autorizada pelo CTO (24/07/2026).

---

## 1. Resultado

O componente **H — Memória Organizacional Viva** foi materializado em sede adjacente ao MVP, sem alterar a superfície congelada sob VAL-005. A implementação registra e recupera decisões no contexto MG2, exige os cinco campos da Memória Organizacional, declara ausência sem inventar e expõe os registros como insumo futuro para o componente I.

**E1 está concluída tecnicamente e submetida ao CTO. E2 não foi iniciada.**

---

## 2. Critérios de conclusão

| Critério IMP-006 E1 | Resultado | Evidência |
|---------------------|-----------|-----------|
| Registros com os cinco campos | **Atendido** | `CAMPOS_OBRIGATORIOS`; validação de `registrar`; teste para cada campo |
| Histórico recuperável em sessão posterior | **Atendido** | armazenamento injetável persistente; teste com duas instâncias sobre o mesmo storage |
| Ausência pertinente explícita | **Atendido** | `listar` / `consultar` retornam `status: "ausente"` e mensagem explícita |
| Conhecimento CAP-04 / E ≠ decisão H | **Atendido** | API aceita somente registro decisório; `conhecimentos-uso-diario.md` não foi alterado nem absorvido |
| Contexto ativo MG2 preservado | **Atendido** | `CONTEXTO_ATIVO` fixo; entrada externa não troca o contexto |
| Componente disponível à condução futura | **Atendido** | API `listar` / `consultar` fornece somente memória registrada; nenhuma lógica I/J incluída |
| MVP preservado | **Atendido** | nenhum arquivo em `docs/mvp/` alterado pela E1 |
| E2+ e VAL não iniciadas | **Atendido** | módulo não expõe recomendar, priorizar ou coordenar papéis; nenhum artefato VAL criado |

---

## 3. Artefatos técnicos

| Caminho | Descrição |
|---------|-----------|
| `docs/cap-05/memoria-organizacional.js` | Componente H: contrato, validação, persistência e recuperação |
| `docs/cap-05/memoria-organizacional.test.js` | Testes automatizados do componente H |
| `docs/cap-05/README.md` | Contrato operacional e limites da E1 |
| `docs/cap-05/e1-evidencias.md` | Este relatório |

### Escolha tática da sede

Foi adotado `docs/cap-05/`, adjacente a `docs/mvp/`, pelos seguintes motivos:

1. preserva integralmente o MVP congelado sob VAL-005;
2. mantém explícita a extensão ARQ-009 sem substituir A–G;
3. permite que E2 integre H à superfície somente após novo gate;
4. reutiliza JavaScript já existente no protótipo, sem dependência ou stack adicional.

A persistência usa uma interface `getItem` / `setItem`. Isso desacopla H do meio físico: o navegador poderá fornecer `localStorage` na integração autorizada, enquanto os testes usam armazenamento em memória. Nenhuma tecnologia foi imposta aos componentes I/J.

---

## 4. Verificação automatizada

Comando:

```powershell
node --test "docs/cap-05/memoria-organizacional.test.js"
```

Resultado em 24/07/2026:

```text
tests 6
pass 6
fail 0
duration_ms 197.0071
```

Casos cobertos:

1. elevação idempotente de `DEC-MVP-001` (D → H);
2. recuperação entre duas instâncias/sessões;
3. rejeição de cada um dos cinco campos quando ausente;
4. ausência explícita sem invenção;
5. contexto restrito ao MG2;
6. ausência deliberada de operações pertencentes a I/J.

---

## 5. Rastreabilidade

| Fonte | Elemento E1 |
|-------|-------------|
| REQ-033 RF-01 — cinco campos | `validarRegistro` + `registrar` |
| REQ-033 RF-01 — sessões posteriores | storage injetável + `listar` / `consultar` |
| REQ-033 RN-01.1 — registrado ≠ inventado | consulta por filtro; resposta de ausência |
| REQ-033 RN-01.2 — campos mínimos | `CAMPOS_OBRIGATORIOS` |
| REQ-033 RN-01.3 — CAP-04 distinta | API exclusiva de decisões |
| ARQ-009 H — persistir/recuperar | `registrar`, `listar`, `consultar` |
| ARQ-009 H — contexto ativo | `CONTEXTO_ATIVO` |
| ARQ-009 H — não decidir prioridades/UI | API sem I/J; MVP inalterado |
| IMP-006 E1 | artefatos e seis testes acima |

---

## 6. Escopo respeitado

* REQ-033 e ARQ-009 **não foram alterados**.
* `docs/mvp/index.html` e demais artefatos do MVP **não foram alterados**.
* E2, E3, E4, E5 e E6 **não foram iniciadas**.
* VAL da CAP-05 **não foi iniciada**.
* Não há recomendação, prioridade, coordenação de papéis, redesign ou execução do MG2.

---

## 7. Submissão ao CTO

Solicita-se revisão e homologação do **Gate E1**. Até deliberação:

* E1 permanece em revisão;
* E2 permanece vedada;
* não haverá execução em paralelo.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO revisará o Gate E1 |
| Quando | 24/07/2026 |
| Por quê | Materializar exclusivamente H após homologação do IMP-006 |
| Baseado em quê | Deliberação CTO — aprovação IMP-006 e autorização E1; REQ-033 RF-01; ARQ-009 H; IMP-006 E1 |
| Resultado | H implementado e testado (6/6); MVP preservado; E2 e VAL não iniciadas; Gate E1 submetido |
