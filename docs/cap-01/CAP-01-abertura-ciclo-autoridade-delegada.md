# CAP-01 — Abertura de Ciclo: Autoridade Delegada

> **Status:** Ciclo **ENCERRADO** — 07/08/2026 (Despacho CTO — IMP-071 Homologada · Baseline).  
> **Capacidade (mapa):** **CAP-01 — Governança** (CAP-001).  
> **Objecto do ciclo:** Autoridade Delegada — comportamento operacional conforme [`ARQ-032`](../architecture/ARQ-032-autoridade-delegada.md) **Homologada / congelada**.  
> **Baseline:** [`README.md`](README.md).  
> **Arquitectura:** **congelada** (ARQ-032). Sem emenda. Sem novos estados arquitecturais.  
> **Natureza:** acto histórico de abertura de ciclo CAP — ciclo concluído; **não** reabrir sem evidência de uso real.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Abertura do ciclo CAP que decompõe a ARQ-032 em responsabilidades implementáveis de governação decisória sob mandato temporário. |
| **Por que existe?** | ARQ-032 homologada modela a transferência; falta especificar **como** a capacidade se comporta em operação — sem alterar a arquitectura. |
| **Para quem existe?** | Usuário (soberania); CTO (REQs/gates); Engenheiro (IMP futura se autorizada). |
| **Como medir sucesso do ciclo?** | REQs → IMP → VAL → Homologação preservando A1–A8 intactos; missão continua do Usuário. |

---

## 1. Decisão de abertura

Por despacho do CTO (07/08/2026):

1. **ARQ-032** fica **Homologada** e **congelada**.  
2. Abre-se o ciclo **CAP-01 — Autoridade Delegada**.  
3. A CAP **apenas decompõe** a ARQ-032 em responsabilidades implementáveis.  
4. É **vedado:** alterar ARQ-032; introduzir tecnologia; criar novos estados arquitecturais; ampliar o escopo da delegação.  
5. Próxima etapa do fluxo: **REQs** — pacote REQ-075…084 **Em análise** (Despacho CTO 07/08/2026).

---

## 2. Sequência autorizada

```
INV-001 (ENCERRADA)
    ↓
ARQ-032 (Homologada — congelada)
    ↓
CAP-01 ciclo Autoridade Delegada  ← este documento (ABERTO)
    ↓
REQs  (próxima, sob mandato)
    ↓
IMP → VAL → Homologação → Baseline (futuro)
```

| Etapa | Estado |
|-------|--------|
| INV-001 | ENCERRADA |
| ARQ-032 | Homologada · **congelada** |
| CAP (este ciclo) | **ABERTO** |
| REQs / IMP / VAL / Baseline | **REQ-075…084 Aprovados** · CAs pré-IMP **OK** ([`CAP-01-verificacao-cas-pre-imp.md`](CAP-01-verificacao-cas-pre-imp.md)) · preparação IMP ([`CAP-01-preparacao-fase-implementacao.md`](CAP-01-preparacao-fase-implementacao.md)) · **IMP não aberta** |

---

## 3. Princípio operacional (herdado, intocável)

Autoridade Delegada **não** cria um novo dono da missão.  
Cria um período controlado em que o CEO tem competência para decidir **dentro dos limites** concedidos pelo Usuário.

---

## 4. Decomposição — responsabilidades implementáveis

Fonte exclusiva: ARQ-032 A1–A8.  
Documento de responsabilidades: [`CAP-01-autoridade-delegada-responsabilidades.md`](CAP-01-autoridade-delegada-responsabilidades.md).

| ID | Responsabilidade (operacional) | Origem ARQ |
|----|--------------------------------|------------|
| **R1** | Reconhecer e validar o **acto de delegação** explícito do Usuário | A2, A4 |
| **R2** | Activar e manter o estado operacional correspondente a **`autoridade_delegada_activa`** (sem novo estado arquitectural) | A3 |
| **R3** | Aplicar **competência de fecho** no perímetro enquanto o estado estiver activo | A1, A3, A6 |
| **R4** | Recusar fecho / alçada fora do perímetro e das exclusões objectivas | A6 |
| **R5** | Detectar e aplicar **critérios de encerramento** | A5 |
| **R6** | Executar **retorno automático** da competência de fecho ao Usuário | A7 |
| **R7** | Preservar **soberania** e prevalência de actos do Usuário em qualquer momento | A1, A6, A7 |
| **R8** | Convivência com modos **Deliberar / Executar / Recuperar** sem os redefinir | A8 |
| **R9** | Registar decisões fechadas sob delegação com Memória Organizacional (Art. 8º) | A3, A7 |
| **R10** | Distinguir Autoridade Delegada de autorização operacional pontual e de despacho à fila | A1 |

Cada R* é candidata a um ou mais REQs futuros — **sem** tecnologia nesta fase.

---

## 5. Restrições permanentes deste ciclo

1. Não alterar ARQ-032.  
2. Não introduzir tecnologia, prompts, código.  
3. Não criar novos estados arquitecturais além do já nomeado em A3.  
4. Não ampliar o escopo da delegação além de A6.  
5. Não abrir CAP nova no mapa (CAP-13+).  
6. Não redesenhar CTO-003, EIC, EE, CAP-04.  
7. Não iniciar IMP sem REQs aprovados e mandato.

---

## 6. Fora do escopo do ciclo

- Implementação.  
- Calibração de léxico de frases.  
- Política fina de Gates concretos (salvo o que A6 já distingue conceptualmente).  
- População de acervo (CAP-04).  

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (autorizou) · Engenheiro (abriu ciclo) |
| Quando | 07/08/2026 |
| O quê | Abertura CAP-01 ciclo Autoridade Delegada |
| Por quê | ARQ-032 Homologada; decompor em responsabilidades |
| Baseado em quê | Despacho CTO; ARQ-032 A1–A8; CAP-001 (CAP-01) |
| Resultado | Ciclo **ABERTO**; REQs ainda não autorizados |
