# Status — Capacidade de Conversação do CEO

> **Data:** 06/08/2026  
> **Tipo:** aprendizado / estado operacional (sem efeito normativo sobre CON/ADR).  
> **Lente:** DEC-010 — comportamento do CEO como assistente em operação.  
> **Baseline conversacional:** CAP-07 + cadeia EIC runtime + **Refino EIC-001 homologado**.

---

## 1. Estado actual (uma frase)

A fase de evolução estrutural da EIC está **encerrada** (CTO 06/08/2026). Baseline EIC estável e oficial; prioridade do projecto deixa a EIC e passa às demais capacidades do ecossistema, sem regressão da Baseline. Calibração EIC só por evidências que ultrapassem o Filtro CTO.

---

## 2. Comportamento em operação (DEC-010)

| Dimensão | O que o CEO faz na conversa | Estado |
|----------|----------------------------|--------|
| **Pensar** | Ciclo executivo interno (objectivo→contexto→restrições→alternativas→decisão→próxima acção); MRE R1 quando deliberativo | Operacional |
| **Conversar** | VCA + CSC (histórico, referências, tópicos, objectivo) + Conversação Natural | Operacional |
| **Decidir** | Classificador C1–C4 antes de actuar; Gate quando aplicável; Motor para C3 | Operacional |
| **Conduzir** | Hierarquia estratégico/actual/entrega; estado da conversa; critério de encerramento | Operacional (EIC-001) |

---

## 3. Pipeline de turno (comportamento)

```text
Mensagem do utilizador
  → Gate (se pendente)
  → VCA (pertença de contexto)
  → CSC (histórico → referências → tópicos → objectivo)
  → Classificador C1–C4
  → Refino EIC-001 (memória de trabalho / ciclo / hierarquia / E→D→A)
  → Complexidade + DIC (quando path meta)
  → Destino (MRE / Motor / capacidade)
  → Prosa (CN / Speaker) → utilizador
```

Canal voz vs teclado **não** altera classes nem limiar EIC.

---

## 4. Baseline EIC-001 (homologada)

| Refino | Papel no comportamento |
|--------|------------------------|
| Memória de Trabalho Executiva | Mantém objectivo activo, restrições, decisões, pendências, próxima acção |
| Ciclo Executivo de Raciocínio | Disciplina o pensar antes da resposta |
| Hierarquia de Objectivos | Evita perda de foco estratégico |
| Evidência → Diagnóstico → Ajuste | Estrutura análises técnicas |
| Estado Executivo da Conversa | Em execução / concluído / pendente / bloqueio |
| Consistência Terminológica | Nomenclatura vigente na lógica interna |
| Critério de Encerramento | Conclusão, estado, dependências, novo despacho |

Rollback: `REFINO_EIC_ATIVO=false`.  
`dados.refinoEic` permanece **só diagnóstico** — não contrato público.

---

## 5. Decisões recentes

| ID | Resultado | Implicação |
|----|-----------|------------|
| Homologação Refino EIC-001 | **HOMOLOGADO** | Integra baseline da Inteligência Conversacional |
| **DEC-010** | **APROVADO COM RESSALVAS** | Próximo ciclo avalia só comportamento em operação, não engenharia do desenvolvimento |

---

## 6. Limites conscientes

- NCS presente em código; `flagNcs` off — produção NCS não declarada.  
- Heurísticas de restrições/alternativas sob monitorização na calibração.  
- Paridade voz em produção (F1) é ressalva de **canal**, não de classificação EIC.

---

## 7. Calibração — baseline actual

| Ciclo | Missão | Estado |
|-------|--------|--------|
| EIC-001 | Memória de trabalho / ciclo interno | **Homologado** (baseline) |
| Ciclo 1 | Pensar na conversa | Implementado — [`ciclo1`](2026-08-06-ciclo1-diagnostico-pensar-conversa.md) |
| **DESP-002** | Conduzir conversa com iniciativa | **Homologado** — baseline |
| **DESP-003** | Decidir (critério, trade-off, Gate, anti-aprovar precoce) | **Homologado** — [`ciclo-decidir`](2026-08-06-ciclo-decidir-calibracao.md) |
| **DESP-004** | Planejar (etapas, dependências, prioridade, risco) | **Homologado** — [`desp-004`](2026-08-06-desp-004-calibracao-planejamento.md) |
| **DESP-005** | Antecipar (riscos, dependências, próximos passos) | **Homologado** — [`desp-005`](2026-08-06-desp-005-calibracao-antecipacao.md) |
| **DESP-006** | Adaptar (profundidade, detalhe, intenção, coerência) | **Homologado** — [`desp-006`](2026-08-06-desp-006-calibracao-adaptacao.md) |
| **DESP-007** | Memória executiva (continuidade, decisões, pendências) | **Homologado** — [`desp-007`](2026-08-06-desp-007-calibracao-memoria-executiva.md) |
| **DESP-008** | Inteligência executiva (conduzir missão ponta a ponta) | **Homologado** — [`desp-008`](2026-08-06-desp-008-calibracao-inteligencia-executiva.md) |
| **DESP-009** | Execução executiva (CN/EIC → Engine/Runtime) | **Homologado** 06/08 · **Emendado** 15/08 (Frente 3 / VAL-073) — [`desp-009`](2026-08-06-desp-009-calibracao-execucao-executiva.md) |
| **DESP-010** | Calibração em produção (missões reais) | **Homologado** — [`desp-010`](2026-08-06-desp-010-calibracao-producao.md) |

Baseline vigente: EIC-001 + DESP-002 … **DESP-010**.

### Modo operacional (pós DESP-010)

**Calibração contínua por evidências** — evolução dirigida encerrada; sem despachos pré-definidos.

Fluxo: Missão → Evidência → (filtro) → Diagnóstico → Refinamento → Validação → Baseline.

**Filtro obrigatório (CTO)** — só abre ciclo se as quatro forem positivas:

1. O comportamento reduz a percepção de inteligência?  
2. É recorrente?  
3. Resolve-se por calibração (sem nova capacidade / arquitectura / governação)?  
4. O ganho justifica o aumento de complexidade?

Caso contrário: evidência registada e arquivada — **sem** alteração na Baseline.  
Objectivo: simplicidade, anti-overfitting, crescimento sustentável.


---

| Campo | Registro |
|-------|----------|
| Quem | Cursor 1 (Engenheiro) |
| Quando | 06/08/2026 |
| Por quê | Status conversacional + Ciclo 1 (pensar na conversa) |
| Resultado | Status actualizado; Ciclo 1 implementado e validado em testes |
