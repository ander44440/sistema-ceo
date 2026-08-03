# 13 — Marco Zero

> **Status:** Fase 1 encerrada — Marco Zero formalizado · BLOCO 1 (Identidade) registado  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Documento de encerramento estrutural e registo de identidade — sem implementação de código, prompts ou alteração de comportamento.

## 1. Objetivo do documento

1. Formalizar a conclusão da **Fase 1 (Estrutura Documental)** da EIC (**Marco Zero**).  
2. Registar que o **BLOCO 1 — Identidade** (`00`, `01`, `06`, este `13`) foi consolidado como referência oficial de identidade, **sem** alterar decisões de produto já aprovadas e **sem** impacto em código/prompts/comportamento.

## 2. Data da criação

| Campo | Valor |
|-------|--------|
| Data do Marco Zero (Fase 1) | **03/08/2026** |
| Data do registo BLOCO 1 | **03/08/2026** |
| Autor do registo | Engenheiro (Cursor), sob comando do patrocinador |
| Local | `docs/EIC/13_MARCO_ZERO.md` |

## 3. Escopo da Fase 1

A Fase 1 limitou-se a:

- Criar a pasta oficial `docs/EIC/`
- Estabelecer o conjunto de documentos estruturais da EIC
- Definir o padrão documental único
- Definir a ordem oficial de evolução no Roadmap (sem implementação)
- Criar o Índice como porta de entrada
- Manter a EIC **desacoplada** do código, prompts e comportamento do Sistema CEO

**Fora do escopo da Fase 1:** alteração de produto; Gates de implementação.

## 4. Documentos concluídos

### 4.1 Estrutura (Fase 1)

| ID | Documento | Papel |
|----|-----------|--------|
| — | `ÍNDICE.md` | Porta de entrada |
| 00–12 | Documentos estruturais EIC | Esqueletos padronizados + Roadmap com ordem |
| 13 | Este documento | Marco Zero |

### 4.2 Identidade (BLOCO 1)

| ID | Documento | Papel no BLOCO 1 |
|----|-----------|------------------|
| 00 | `00_VISÃO_GERAL.md` | Definição, missão, visão, objectivos, Âncora Mestra, sucesso |
| 01 | `01_PRINCÍPIOS.md` | Princípios CON / VIS-002 / ARQ-018 / PX-003 E4 |
| 06 | `06_GLOSSÁRIO.md` | Terminologia e siglas oficiais |
| 13 | `13_MARCO_ZERO.md` | Encerramento Fase 1 + registo do BLOCO 1 |

Conteúdo do BLOCO 1 = **consolidação** de CON-001, VIS-001/002/003, ARQ-018, PX-003 E4, Âncora Mestra e estrutura EIC — **sem conceitos novos**.

## 5. Critérios atendidos

| # | Critério | Estado |
|---|----------|--------|
| C1 | Pasta `docs/EIC/` organizada | **Atendido** |
| C2 | Documentos estruturais 00–12 + Índice | **Atendido** |
| C3 | Padrão documental único (auditoria) | **Atendido** |
| C4 | Roadmap com ordem M0–M9 | **Atendido** |
| C5 | EIC desacoplada do produto | **Atendido** |
| C6 | Marco Zero formalizado | **Atendido** |
| C7 | BLOCO 1 — identidade consolidada (00/01/06/13) | **Atendido** |
| C8 | Relação EIC ↔ Âncora Mestra documentada | **Atendido** (em `00`) |

## 6. Restrições (Fase 1 e pós-Marco Zero até Gate de produto)

Permanece **proibido** sem Gate explícito (Roadmap G-EIC-D / governação):

- Implementar lógica conversacional no produto
- Alterar prompts, Classificador, Motor, Gate, Consciência ou UI
- Modificar comportamento do Sistema CEO sob pretexto da EIC
- Tratar a EIC como autorização automática de mudança de produto

## 7. Relação com a Âncora Mestra

| Aspeto | Registo |
|--------|---------|
| Papel da Âncora | Continuidade operacional / aprendizado; sem efeito normativo sobre CON/ADR |
| Papel da EIC | Doutrina e ordem da evolução conversacional |
| Compatibilidade | Conversa central; Painel só leitura; PX-003 Conversação Natural homologada — respeitados |
| Actualização | Frentes conversacionais relevantes continuam a actualizar a Âncora; a EIC não a substitui |

Detalhe: [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md) §7.

## 8. Próxima fase — Desenvolvimento do Conteúdo

| Campo | Valor |
|-------|--------|
| Nome | **Fase 2 — Desenvolvimento do Conteúdo** |
| Já iniciado (parcial) | BLOCO 1 — Identidade (**00, 01, 06, 13**) |
| Segue (quando autorizado) | Restante: Arquitectura (02), Qualidade (04), Testes (05), Metodologia (07), Governança (08), Matrizes (09–10), Homologação (11), Histórico preenchido (12), etc. |
| Ordem | [`ÍNDICE.md`](ÍNDICE.md) · [`03_ROADMAP.md`](03_ROADMAP.md) (Onda B → C) |
| Continua proibido | Código / prompts / comportamento sem Gate |

## 9. Aprovação do Marco Zero e do BLOCO 1

| Campo | Valor |
|-------|--------|
| Marco Zero — Fase 1 | **Encerrada** (estrutura congelada) |
| BLOCO 1 — Identidade | **Consolidado** — pronto para homologação do patrocinador |
| Declaração | A EIC tem estrutura oficial + identidade documental oficial, sem impacto no produto |
| Aprovação de produto | **Não aplicável** neste marco |

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md) | Identidade |
| [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) | Princípios |
| [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md) | Termos |
| [`03_ROADMAP.md`](03_ROADMAP.md) | Ordem e Gates |
| [`ÍNDICE.md`](ÍNDICE.md) | Porta de entrada |
| `docs/learning/ANCORA-MESTRA.md` | Continuidade operacional |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | Criação do Marco Zero | Fase 1 encerrada |
| 1.1 | 03/08/2026 | Engenheiro (Cursor) | Registo do BLOCO 1 — Identidade | Identidade consolidada; pronta para homologação |

---

**MARCO ZERO MANTIDO.**  
**BLOCO 1 — IDENTIDADE CONSOLIDADO.**  
EIC pronta para homologação do bloco de identidade e, após autorização, para o restante do conteúdo técnico. Sem impacto no produto.
