# P9 — Ensaio Operacional do MRE (R1 / Produção Assistida)

> **O que é?** Execução documental e verificável do regime **R1** do plano P8 (produção assistida), sem declarar produção.  
> **Por que existe?** Fechar o ensaio operacional antes do pacote final P10.  
> **Roadmap de origem:** P8 §1.4 (R0→R1→R2) + §5 (monitoramento).  
> **Data:** 30/07/2026 · **Versão:** 1.0  
> **Produção:** **não declarada neste P9** (snapshot do ensaio). Autorização formal: [P10 §6](2026-07-30-p10-pacote-autorizacao-producao-mre.md) — **Go** 30/07/2026.

---

## 1. Objetivo

Demonstrar, com evidências, que o MRE está pronto para a janela assistida R1: testes verdes, rollback compreendido, smoke lógico coberto, diário de monitoramento preparado — **sem** assinatura de produção.

## 2. Escopo

### Inclui

* Reexecução da suíte `test:mre`.
* Verificação estática do mecanismo `flagMre` e procedimento de rollback (ensaio documental).
* Matriz de smoke R1 (cenários P8 §5.1) com resultado de ensaio técnico.
* Template de diário de monitoramento R1.
* Critérios de saída de P9 → P10.

### Fora de escopo

* Alterar código funcional, ADRs, REQs, ARQs, IMP-010, VAL-009.
* Assinar produção (P8 §7 / P10).
* Homologação institucional da VAL-009 (permanece com o Gate).

---

## 3. Verificações executadas (30/07/2026)

### 3.1 Suíte automatizada

```text
cd app
npm run test:mre
→ tests 59 · pass 59 · fail 0
```

| Resultado | Valor |
|-----------|--------|
| Pass | 59 |
| Fail | 0 |
| Conclusão ensaio | **OK** |

### 3.2 Ensaio documental de rollback (`flagMre`)

| Passo P8 §2.2 | Verificação | Resultado |
|---------------|-------------|-----------|
| Localizar flag | `app/src/mre/roteamentoDeliberativo.js` → `export const flagMre = { ativo: true }` | **OK** |
| Efeito `ativo=false` | `ehRotaDeliberativa` retorna false (T14-04) | **OK** (coberto por teste) |
| Determinísticos preservados | T14-01 | **OK** |
| Reativação | repor `ativo=true` sob mandato Gate | **Procedimento documentado** (não executado em commit — evita alterar código) |

**Conclusão ensaio rollback:** procedimento **validado por teste + inspeção**; alteração física da flag no repo **não** foi feita (preserva baseline; ensaio real de toggle fica para o momento do Go sob mandato).

### 3.3 Matriz smoke R1 (ensaio técnico)

| Cenário (P8 §5.1) | Cobertura de ensaio | Resultado |
|-------------------|---------------------|-----------|
| Saudação / data sem MRE | T14-01 + classificação local em `ia.js` | **OK** |
| Abrir dia / estado (memória) | T14-01 (capacidade fora de MRE) | **OK** |
| Deliberação com parecer | T14-05; T12-int; T15-02 | **OK** |
| `solicitar_dados` + perguntas | T15-03; T12-02 | **OK** |
| Fidelidade canais | T16-01…03 | **OK** |
| Fila + parecerId | T17-02; T17-05 | **OK** |
| H1 princípios | T18-02; T18-04 | **OK** |

> Smoke UI com LLM real no gabinete permanece **pendente do Patrocinador** no dia do Go (A6 do P8) — não bloqueia conclusão documental de P9.

---

## 4. Diário de monitoramento R1 (template)

Usar após autorização de produção (P10/Gate). Durante P9 o diário regista apenas o ensaio:

| Data | Deliberações | Incidentes P1/P2 | H1 ok? | Latência aceitável? | Notas |
|------|--------------|------------------|--------|---------------------|-------|
| 30/07/2026 | 0 (ensaio só testes) | 0 | sim | N/A (mock) | P9 ensaio documental concluído |

---

## 5. Critérios de saída P9 → P10

| Critério | Estado |
|----------|--------|
| 59/59 testes | ✅ |
| Rollback compreendido + T14-04 | ✅ |
| Smoke técnico R1 | ✅ |
| Produção não declarada | ✅ |
| Pacote P10 pode ser elaborado | ✅ |

**Status P9:** **Concluído** (ensaio operacional documental).

---

## Histórico

| Versão | Data | Quem | O quê |
|--------|------|------|-------|
| 1.0 | 30/07/2026 | Engenheiro (Cursor) | Ensaio R1 / P9 |
