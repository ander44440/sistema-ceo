# 07 — Metodologia de Evolução

> **Status:** BLOCO 2 — Engenharia consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Método documental — sem alteração de produto nesta fase.  
> **Fontes:** CON-001 Art. 8º/10; ADR-006; ADR-015; ciclo de maturação do projeto (Observação → …); [`03_ROADMAP.md`](03_ROADMAP.md); [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md).

## Objetivo

Definir o método oficial pelo qual a Inteligência Conversacional evolui na EIC — da observação à validação — **sem** saltar a hierarquia normativa nem o Roadmap.

## Finalidade

Procedimento de avanço da disciplina. Gates e ordem → [`03_ROADMAP.md`](03_ROADMAP.md). Priorização → [`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md).

---

## 1. Ciclo de evolução (EIC)

Alinhado ao ciclo de maturação já usado no projeto (Observação → Hipótese → Validação → Aprovação → Evolução contínua) e ao fluxo ADR-006:

```text
1. Observação      — sintoma conversacional (prosa, classificação, atrito de tempo)
2. Hipótese        — causa provável; normas tocadas (CON/VIS/ARQ/PX…)
3. Documentação EIC — registo em 04/05/09/10/12 conforme o caso (ainda doc)
4. Fluxo ADR-006   — ANL → ADR (se preciso) → REQ → ARQ → IMP → VAL
5. Gate EIC/produto — G-EIC-* / Gate de etapa IMP
6. Validação       — testes conversacionais (05) + evidências
7. Aprovação       — patrocinador / CTO conforme papel
8. Memória         — Art. 8º + Âncora Mestra se frente operacional relevante
```

A EIC **não** substitui o ADR-006: prepara e rastreia o eixo conversacional dentro dele.

---

## 2. Entradas e saídas por etapa

| Etapa | Entrada | Saída |
|-------|---------|--------|
| Observação | Uso real, Âncora, falhas de prosa/classificação | Problema enunciado |
| Hipótese | Problema + normas citáveis | Hipótese + impacto esperado |
| Doc EIC | Hipótese | Actualização 04/05/09/10/12 (sem código) |
| ADR-006 | Necessidade de mudança de produto | Artefactos oficiais (REQ/ARQ/IMP…) |
| Gate | Evidência + pedido | Autorização ou recusa |
| Validação | Implementação autorizada | Pass/fail conversacional |
| Memória | Decisão | Registo Art. 8º / Âncora |

---

## 3. Papéis no ciclo

| Papel | Responsabilidade (já CON-001 Art. 6º) |
|-------|--------------------------------------|
| **Usuário / Patrocinador** | Prioridades, aprovação, validação de resultados |
| **CTO** | Requisitos, arquitectura, planeamento, revisões, QA — não implementa código |
| **Engenheiro (Cursor)** | Implementação **só** após norma + Gate; documentação EIC sob comando |
| **CEO (Agente Executivo)** | Coordenação e prosa no produto — objecto da evolução, não autor da EIC |

---

## 4. Critérios de avanço

Só avançar de etapa se:

1. A norma superior aplicável está identificada (não inventar regra).  
2. O módulo do Roadmap correspondente está respeitado (não saltar M4→M8).  
3. Filtro ADR-015 respondido para mudanças de produto.  
4. Tempo do utilizador (CON-001 Art. 9º.1) não é degradado pela proposta.  
5. Gate exigido pelo Roadmap / ADR-006 está obtido.

---

## 5. Critérios de interrupção / rollback documental

Interromper ou reverter proposta se:

- Contraria CON-001 / VIS / ARQ homologada  
- Introduz conceito novo sem ADR/REQ  
- Pretende código/prompt sem G-EIC-D  
- Confunde Classificador NCS com Classificador de Intenção  
- Trata Painel como actor de despacho  

Rollback documental: corrigir o documento EIC; **não** apagar Memória Organizacional (Art. 8º) — registar a correcção.

---

## 6. Relação com ADR-006 e Gates EIC

| Instrumento | Função |
|-------------|--------|
| ADR-006 | Fluxo oficial de capacidades do produto |
| Gates G-EIC-0…E | Controlo da disciplina EIC ([`03_ROADMAP.md`](03_ROADMAP.md) §6) |
| Gates de etapa IMP | Controlo fino de implementação (já usado nas IMP) |
| Âncora Mestra | Registo pós-fecho operacional — não substitui Gate |

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`03_ROADMAP.md`](03_ROADMAP.md) | Ordem e Gates |
| [`02_ARQUITETURA.md`](02_ARQUITETURA.md) | O que pode ser tocado |
| [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md) | Autoridade (estrutura) |
| [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) | Homologação (estrutura) |
| [`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md) | O que entra primeiro |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1–0.2 | 03/08/2026 | Engenheiro (Cursor) | Estrutura + padronização | Esqueleto |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 2 — metodologia | Pronto para homologação |

---

**Estado:** BLOCO 2 — metodologia consolidada. Sem impacto no produto.
