# Índice Oficial — Engenharia da Inteligência Conversacional (EIC)

> **Status:** Porta de entrada oficial — documentação **concluída** (pronta para homologação geral)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Documentação — sem implementação de código, prompts ou alteração de comportamento.  
> **Actualização:** BLOCO 4 — 03/08/2026.

## Objetivo

Servir como índice e porta de entrada da documentação oficial da EIC: listar os 13 documentos (+ este índice), resumir objectivos, fixar a ordem de leitura e a hierarquia.

## Finalidade

Navegação canónica de `docs/EIC/`. Qualquer evolução conversacional documental começa aqui.

---

## 1. Lista de documentos (estado actual)

| ID | Ficheiro | Objectivo resumido | Bloco | Status |
|----|----------|--------------------|-------|--------|
| — | [`ÍNDICE.md`](ÍNDICE.md) | Porta de entrada | 4 | **Activo** |
| 00 | [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md) | Identidade, missão, visão, Âncora Mestra | 1 | **Consolidado** |
| 01 | [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) | Princípios CON / VIS / ARQ-018 / PX-003 | 1 | **Consolidado** |
| 02 | [`02_ARQUITETURA.md`](02_ARQUITETURA.md) | Mapa conceptual L0–L5 (peças existentes) | 2 | **Consolidado** |
| 03 | [`03_ROADMAP.md`](03_ROADMAP.md) | Ordem M0–M9, ondas, Gates G-EIC-* | 2 | **Consolidado** |
| 04 | [`04_CRITÉRIOS_DE_QUALIDADE.md`](04_CRITÉRIOS_DE_QUALIDADE.md) | CA/NA e indicadores de qualidade | 3 | **Consolidado** |
| 05 | [`05_TESTES_CONVERSACIONAIS.md`](05_TESTES_CONVERSACIONAIS.md) | Tipos, cenários SC-*, registo EXE-* | 3 | **Consolidado** |
| 06 | [`06_GLOSSÁRIO.md`](06_GLOSSÁRIO.md) | Termos e siglas oficiais | 1 | **Consolidado** |
| 07 | [`07_METODOLOGIA_DE_EVOLUÇÃO.md`](07_METODOLOGIA_DE_EVOLUÇÃO.md) | Ciclo observação → ADR-006 → Gate | 2 | **Consolidado** |
| 08 | [`08_GOVERNANÇA_DA_EIC.md`](08_GOVERNANÇA_DA_EIC.md) | Papéis, Gates, rastreabilidade | 4 | **Consolidado** |
| 09 | [`09_MATRIZ_DE_CAPACIDADES.md`](09_MATRIZ_DE_CAPACIDADES.md) | CAP e peças conversacionais | 2 | **Consolidado** |
| 10 | [`10_MATRIZ_DE_PRIORIZAÇÃO.md`](10_MATRIZ_DE_PRIORIZAÇÃO.md) | Prioridades P0–P3 / ADR-015 | 2 | **Consolidado** |
| 11 | [`11_PROCESSO_DE_HOMOLOGAÇÃO.md`](11_PROCESSO_DE_HOMOLOGAÇÃO.md) | Aceite doc e produto | 3 | **Consolidado** |
| 12 | [`12_HISTÓRICO_DA_EIC.md`](12_HISTÓRICO_DA_EIC.md) | Memória Fase 1 e Fase 2 | 4 | **Consolidado** |
| 13 | [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Encerramento Fase 1 + registo BLOCO 1 | 1 | **Marco Zero** |

---

## 2. Blocos de conteúdo (Fase 2)

| Bloco | Documentos | Tema | Estado |
|-------|------------|------|--------|
| **1 — Identidade** | 00, 01, 06, 13 | Missão, princípios, glossário, marco | Consolidado |
| **2 — Engenharia** | 02, 03, 07, 09, 10 | Arquitectura, roadmap, método, CAP, prioridade | Consolidado |
| **3 — Qualidade** | 04, 05, 11 | Critérios, testes, homologação | Consolidado |
| **4 — Governança** | 08, 12, Índice | Autoridade, histórico, navegação | Consolidado |

**Fase 1:** estrutura + auditoria + Marco Zero — **encerrada**.  
**Documentação EIC:** **concluída** — aguarda **homologação geral** do patrocinador.  
**Produto (código/prompts):** **intocado** até G-EIC-D.

---

## 3. Ordem oficial de leitura

### 3.1 Entrada

1. Este **Índice**  
2. `13` Marco Zero (contexto de encerramento da estrutura)

### 3.2 Doutrina e engenharia

3. `00` Visão Geral  
4. `01` Princípios  
5. `06` Glossário  
6. `02` Arquitectura  
7. `03` Roadmap  
8. `07` Metodologia  
9. `09` Matriz de Capacidades  
10. `10` Matriz de Priorização  

### 3.3 Qualidade e governação

11. `04` Critérios de Qualidade  
12. `05` Testes Conversacionais  
13. `11` Processo de Homologação  
14. `08` Governança da EIC  
15. `12` Histórico da EIC  

---

## 4. Estrutura hierárquica da EIC

```text
EIC (docs/EIC)
│
├── Porta de entrada ………… ÍNDICE.md
├── Marco estrutural ……… 13_MARCO_ZERO.md
│
├── Camada 1 — Doutrina …… 00 · 01 · 06
├── Camada 2 — Engenharia … 02 · 03 · 07 · 09 · 10
├── Camada 3 — Qualidade … 04 · 05 · 11
├── Camada 4 — Governança … 08
└── Camada 5 — Memória …… 12
```

**Desacoplamento:** código, prompts e comportamento do produto **só** após Gate explícito ([`03`](03_ROADMAP.md) G-EIC-D; [`08`](08_GOVERNANÇA_DA_EIC.md)) e ADR-006.

---

## 5. Padrão documental

Documentos 00–13 seguem: Título → Status/Domínio/Natureza → Objetivo → Finalidade → corpo → Referências cruzadas → Histórico de Revisões → Estado.

---

## 6. Relação com a Âncora Mestra

| EIC | Âncora Mestra |
|-----|----------------|
| Doutrina e ordem da evolução conversacional | Estado operacional vigente / frentes homologadas |
| Sem efeito runtime até Gate | Sem efeito normativo sobre CON/ADR |
| Actualizar Histórico EIC nos blocos | Actualizar Âncora em fechos operacionais de produto |

---

## 7. Histórico de Revisões (Índice)

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Índice após auditoria 00–12 | Porta de entrada |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 4 — estado 00–13 + blocos 1–4 | Documentação EIC concluída |

---

**Estado:** índice actualizado. **Documentação da EIC concluída, consistente e pronta para homologação geral.** Sem impacto no produto.
