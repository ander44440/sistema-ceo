# IMP-002 — Plano de Implementação Documental do Registro Canônico de Normas

> **Status: Homologado — v1.0 (Governança, 22/07/2026).**
> Versão 1.0 — 22/07/2026. Tipo IMP (ADR-012).
> Norma superior: CON-001 v1.0; ADR-006; REQ-002 v1.0; REQ-003 v1.0; ARQ-004 v1.0 (L1; P1–P7); ADR-013 v1.0.
> Este documento **planeja**; a execução segue as etapas E1–E5 com gates. Não altera normas existentes, não modifica identificadores, não redefine a ARQ-004, não introduz tecnologia nem antecipa a Arquitetura da Distribuição.
> **Autorização:** execução da Etapa E1 aberta pela Governança em 22/07/2026.

---

## 1. Objeto e premissas

Materializar documentalmente o Registro Canônico de Normas conforme a ARQ-004 homologada: estrutura `docs/norms/`, índice canônico como fonte do **estado de vigência**, correspondência biunívoca com os documentos normativos (P7), sem alterar o conteúdo das normas (autoridade do texto permanece no documento).

Premissas:

* REQ-002 e ARQ-004 homologados; decisão L1 vigente.
* Implementação **exclusivamente documental** (Governança, 22/07/2026).
* Princípio do IMP-001 reafirmado: **nenhuma etapa produz efeitos organizacionais permanentes antes do respectivo gate**.

---

## 2. Universo normativo inicial

### 2.1 Critério geral de entrada

Somente integram o Registro Canônico de Normas os documentos que possuam **natureza normativa** e produzam **efeitos permanentes sobre a governança organizacional** (fundamento derivado da CON-001 e do REQ-002). Esse critério geral fundamenta todas as decisões do Gate E2.

A ARQ-004 (A2) não redefine a taxonomia do catálogo: a pertença ao registro é deliberada à luz deste critério e da classificação vigente no catálogo.

### 2.2 Hipótese inicial de trabalho (não definitiva)

O catálogo hoje não possui coluna explícita “normativo”. Para organizar o Gate E2, registra-se a seguinte **hipótese inicial de trabalho** — **não** constitui classificação normativa definitiva nem deliberação antecipada:

| Hipótese — candidatos a incluir | Fundamento provisório |
|---------------------------------|------------------------|
| CON-* | Norma máxima (CON-001) |
| VIS-* | Visão (nível 2 da hierarquia) |
| REQ-* | Requisitos (nível 3) |
| ADR-* | Decisões vinculantes (nível 4) |

| Hipótese — candidatos a excluir | Fundamento provisório |
|---------------------------------|------------------------|
| CAP-*, ANL-*, ARQ-*, IMP-*, learning, concepts (CNC), templates | Capacidade, análise, arquitetura de mecanismo, plano, aprendizado ou autoridade semântica |

A **decisão formal** sobre inclusão ou exclusão de cada documento (ou classe) ocorrerá **exclusivamente no Gate E2**, mediante os critérios do §2.1 (CON-001 e REQ-002), com resultado explícito e rastreável. O inventário aprovado em E2 é o único universo autorizado para a população do índice em E3.

---

## 3. Etapas

### E1 — Materialização da estrutura

Criar `docs/norms/` e o **índice oficial** `docs/norms/README.md` (ARQ-004 A1), inicialmente sem entradas de normas (ou apenas cabeçalho, princípios P1–P7 e regras do registro), deixando explícito: índice = fonte do estado de vigência; autoridade do texto = documento homologado.

**Critérios de conclusão:** pasta e índice existem; conformidade com A1; nenhum documento normativo alterado; nenhum efeito de vigência até E3.

### E2 — Gate deliberativo de inventário e universo normativo

Etapa **deliberativa**: produzir (1) o inventário das entradas candidatas e (2) a **decisão formal** sobre o universo normativo inicial do registro — inclusão ou exclusão de cada documento ou classe, fundamentada no critério do §2.1 (CON-001 e REQ-002), com resultado explícito e Memória Organizacional.

O inventário registra, para cada entrada aprovada: identificador, designação, caminho do documento, status e versão vigente declarada no documento/catálogo.

Documentos deliberados como integrantes entram com o status do vocabulário oficial; apenas status que expressem vigência operacional alimentam a resolução (REQ-003).

**Critérios de conclusão:** decisão formal do universo inicial aprovada pela alçada (CTO / Governança); inventário fechado e biunívoco em proposta (P7); nenhuma alteração de texto normativo.

### E3 — População do índice (estado)

Incluir no índice todas as entradas do inventário aprovado, registrando apenas estado: identificador, designação, status, versão vigente, referência ao documento. Atualizar o catálogo documental com o índice do registro (caráter cadastral).

**Critérios de conclusão:** índice completo e biunívoco (P7); P1–P6 observáveis; documentos normativos **intocados**; catálogo aponta para `docs/norms/README.md`.

### E4 — Verificação de conformidade e estabilidade

Verificar item a item a matriz A8 da ARQ-004 e os princípios P1–P7; amostrar recuperação de versão vigente e histórico a partir do identificador (REQ-002), lendo documento + índice.

**Critério de estabilidade:** antes do encerramento (E5), **nenhuma inconsistência** entre índice, catálogo e documentos poderá permanecer aberta. Divergências de estado detectadas são corrigidas no índice e/ou no apontamento cadastral — sem reescrever o conteúdo das normas.

**Critérios de conclusão:** checklist registrado com evidências; zero inconsistências abertas entre índice × catálogo × documentos; não-conformidades sanadas nos limites desta implementação.

### E5 — Encerramento da Implementação

Registrar Memória Organizacional do encerramento; submeter à validação/homologação da alçada (etapa Validação da ADR-006, se exigida); declarar a fonte canônica de normas **operacional no plano documental**.

**Critérios de conclusão:** aprovação da alçada; catálogo atualizado; declaração formal de conclusão; próximo marco desbloqueado: abertura da Arquitetura da Distribuição (deliberação da Governança).

---

## 4. Ordem e dependências

```
E1 → E2 (gate) → E3 → E4 → E5
```

Nenhuma etapa posterior inicia sem conclusão do gate anterior. E3 só após E2 aprovado.

---

## 5. Fora do escopo (vedações da Governança)

* Alterar normas existentes ou seus identificadores
* Redefinir ARQ-004 / L1 / P1–P7
* Automação, tecnologia, sincronização, banco de dados
* Arquitetura ou implementação da Distribuição
* Criação de espaço de identificação normativo (L2)
* Alteração de REQ-002 ou REQ-003

---

## 6. Riscos

| Risco | Mitigação |
|-------|-----------|
| Controvérsia sobre o que é “norma” | Critério geral §2.1; Gate E2 deliberativo com decisão formal do universo; inventário fechado antes de E3 |
| Divergência índice × cabeçalho do documento | P6/P7 + critério de estabilidade em E4: índice manda no estado; correção só no índice/catálogo |
| Escopo deslizante para Distribuição | Vedações explícitas no §5 |

---

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Norma superior | CON-001; REQ-002; ARQ-004 v1.0; ADR-006; ADR-012; ADR-013 |
| Origem | Deliberação da Governança — Gate de Implementação Documental da ARQ-004 (22/07/2026) |
| Planeja | Materialização L1 do Registro Canônico de Normas |
| Não executa | Enquanto este IMP não for homologado e os gates E1–E5 não forem autorizados sequencialmente |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 22/07/2026 | Engenheiro (Cursor) | Plano em 5 etapas (E1–E5) para materialização documental da ARQ-004 | Autorização da Governança — abertura do Gate de Implementação | Aprovado pelo CTO com ajustes pontuais |
| 0.1-r | 22/07/2026 | CTO revisou; Engenheiro aplicou | Critério geral de entrada; E2 deliberativo (decisão formal do universo); critério de estabilidade índice×catálogo×documentos antes de E5; hipótese CON/VIS/REQ/ADR explicitada como não definitiva | Revisão técnica do CTO | Encaminhado à Governança |
| 1.0 | 22/07/2026 | Governança homologou | Plano E1–E5 homologado; hipótese de universo não constitui classificação oficial; execução de E1 autorizada | Homologação da Governança — Gate de Implementação da ARQ-004 | **Homologado — execução E1 aberta** |
