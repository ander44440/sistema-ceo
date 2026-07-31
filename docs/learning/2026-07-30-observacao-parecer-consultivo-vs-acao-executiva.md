# Observação de produto — Parecer consultivo vs ação executiva (pós IMP-020)

> **O que é?** Registo de memória organizacional: lacuna de *comportamento de produto* observada na bateria de testes do MRE após homologação técnica do IMP-020 (NCS).  
> **Por que existe?** Separar estabilidade técnica do MRE de uma hipótese de evolução futura (CEO como decisor **e** conselheiro), sem confundir com bug.  
> **Para quem?** Patrocinador (autoriza ciclo), CTO (VIS/REQ/ARQ), Engenheiro (não implementa até mandato).  
> **Sucesso:** Qualquer papel lê isto e sabe: (1) MRE está estável; (2) isto **não** é bug/contrato/NCS; (3) **proibido** alterar código até novo ciclo de governança autorizado.  
> **Data:** 30/07/2026 · **Autor do registo:** Engenheiro (Cursor), a pedido do Patrocinador  
> **Status:** Insumo — **sem** VIS/REQ/ARQ/IMP abertos; **sem** implementação.

---

## 1. Contexto

Durante a bateria de testes do MRE (IMP-020 materializado; `flagNcs` default off; produção NCS não declarada), foi identificada uma **observação de produto**.

A arquitetura e a implementação atuais permanecem coerentes. Esta nota **não** emenda REQ-048…052, ADR-019, ARQ-013/014 nem IMP-020.

---

## 2. Evidências técnicas (o que *não* falhou)

| Evidência | Estado observado |
|-----------|------------------|
| Pipeline 0–8 | Executa normalmente |
| ParecerExecutivo | Produzido e validado (V1–V6) |
| Speaker | Responde corretamente a partir do parecer |
| NCS (IMP-020) | **Não** é a causa do padrão observado |
| Contratos / estabilidade | Intactos após correções pontuais de saneamento DET (prioridade job; V5) noutro eixo |

**Conclusão da investigação técnica:** não é bug do MRE; não é problema de contrato; não é regressão da NCS.

---

## 3. Padrão observado (produto)

Em solicitações de **natureza consultiva**, o estágio deliberativo tendeu a convergir para estados executivos (`monitorar`, `delegar`, …) e a produzir **ação operacional**, quando o valor esperado pelo utilizador era um **parecer analítico com recomendação**.

### Exemplos de estímulos

- Avaliar uma tecnologia.  
- Comparar Scrum e Kanban.  
- Explicar GTD.  
- Produzir uma recomendação.

### Hipótese

O modelo atual assume, de forma implícita, que **toda deliberação deve resultar em uma ação executiva**.

Existem, contudo, solicitações cujo produto esperado é **apenas o Parecer Executivo** — sem necessidade de despacho, delegação ou monitoramento como efeito.

---

## 4. O que isto *não* autoriza (obrigatório)

Nesta etapa **é proibido**:

- alterar código;  
- modificar prompts;  
- alterar o pipeline;  
- alterar o Speaker;  
- alterar o ParecerExecutivo (schema/contrato);  
- abrir implementação (IMP) ou «correção rápida» sob este tema.

---

## 5. Tratamento futuro (só com autorização do Patrocinador)

Se o Patrocinador autorizar, tratar em **novo ciclo de governança**:

```text
VIS → REQ → ARQ → IMP → VAL
```

Tema candidatado (não normativo até VIS/REQ): equilibrar o papel do CEO como **decisor** e como **conselheiro executivo** — parecer como entrega válida quando a situação não exige efeito operacional.

Rastreio sugerido (quando aberto): referenciar este learning; não reabrir IMP-020 como veículo desta evolução sem Gate explícito.

---

## 6. Decisão deste registo

| Quem | O quê |
|------|--------|
| Patrocinador | Mandou registar; **não** autorizou implementação neste ato |
| Engenheiro | Registou memória; **zero** alteração de código/prompts/pipeline |
| CTO | Insumo disponível para eventual VIS/REQ |

---

## Histórico

| Data | Quem | O quê |
|------|------|-------|
| 30/07/2026 | Engenheiro (Cursor) | Criação do registo a partir da deliberação CTO + mandato do Patrocinador |
