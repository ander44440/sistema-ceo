# 06 — Glossário

> **Status:** BLOCO 1 — Identidade consolidada (pronta para homologação)  
> **Domínio:** Engenharia da Inteligência Conversacional (EIC)  
> **Natureza:** Documentação oficial de identidade — sem implementação de código, prompts ou alteração de comportamento.  
> **Fontes:** CON-001; VIS-001; VIS-002; ARQ-018; PX-003; Âncora Mestra; documentos EIC 00/03/13.

## Objetivo

Fixar o vocabulário oficial usado pela EIC, com definições **apenas** dos termos já existentes no projeto ou já introduzidos na própria estrutura EIC — sem criar conceitos novos.

## Finalidade

Léxico de referência para leitura consistente de [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md), [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) e demais documentos EIC.

---

## 1. Convenções

| Regra | Descrição |
|-------|-----------|
| Canonicidade | A definição oficial de normas de produto permanece no documento de origem (CON/VIS/ARQ/REQ); aqui há **síntese para uso EIC** |
| Novos termos | Só entram neste glossário se já existirem em artefacto aprovado ou na estrutura EIC já criada |
| Siglas | Secção 4; expandir na primeira ocorrência nos textos EIC quando útil |

---

## 2. Termos oficiais e definições

### 2.1 Termos da EIC (estrutura já criada)

| Termo | Definição (EIC) | Origem |
|-------|-----------------|--------|
| **EIC** | Engenharia da Inteligência Conversacional — disciplina documental oficial para evoluir a conversação do CEO, desacoplada da implementação até Gate | `docs/EIC/` · [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md) |
| **Marco Zero** | Encerramento oficial da Fase 1 (estrutura documental) da EIC | [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) |
| **Fase 1 (EIC)** | Criação e padronização da estrutura documental `docs/EIC/` | Marco Zero |
| **Fase 2 (EIC)** | Desenvolvimento de conteúdo técnico nos documentos EIC | Marco Zero §7 |
| **BLOCO 1 — Identidade** | Conjunto 00 + 01 + 06 + 13 como base oficial de identidade da EIC | Comando patrocinador 03/08/2026 |
| **Gate G-EIC-*** | Marcos de autorização do Roadmap EIC (ex.: G-EIC-D para tocar produto) | [`03_ROADMAP.md`](03_ROADMAP.md) |

### 2.2 Termos do Sistema CEO (uso conversacional)

| Termo | Definição (síntese) | Origem |
|-------|---------------------|--------|
| **CEO** | Sistema Executivo de Governança para colaboração entre Humanos e IAs; não é chatbot, despachante de prompts nem simples gestor de tarefas | CON-001 Art. 2º; VIS-001 |
| **Usuário / Patrocinador** | Autoridade máxima: visão, prioridades, aprovação e validação | CON-001 Art. 6º |
| **Conversa** | Superfície conversacional de entrada de mensagens do utilizador (origem a classificar) | ARQ-018; SRF-T03 / Centro |
| **Personalidade institucional** | Coerência de comunicação, critérios e memória ao longo do tempo; património da organização | VIS-002 §3.5 |
| **Interface conversacional** | Meio preferencial de interação; o diálogo serve à execução governada | VIS-002 §3.6 |
| **Classificador de Intenção** | Camada obrigatória que classifica cada mensagem **antes** de qualquer resposta ou acção | ARQ-018 |
| **C1 — Conhecimento Geral** | Classe: resposta imediata; não cria Job; não usa frente activa como lastro obrigatório | ARQ-018 §3.1 |
| **C2 — Conversa sobre Projeto** | Classe: usa frente activa; não cria Job automaticamente | ARQ-018 §3.2 |
| **C3 — Trabalho Executivo** | Classe: intenção de fazer trabalho via Motor (ARQ-017); Job só pela política do Motor | ARQ-018 §3.3 |
| **C4 — Comandos Operacionais** | Classe: pedidos sobre o próprio sistema CEO (status, painel, jobs, memória, etc.) | ARQ-018 §3.4 |
| **Conversação Natural (CN)** | Camada de prosa ao utilizador (tipos de turno, sanitização, contexto imediato) sob PX-003 | PX-003 E1–E4 |
| **Qualidade percebida** | Ritmo, iniciativa, continuidade, densidade adaptativa e variação da prosa — PX-003 E4 | PX-003 E4 |
| **Motor de Execução** | Destino de C3: Intenção → … → Job → Encerramento | ARQ-017 / ARQ-018 |
| **Painel de Orquestração** | Transparência operacional (snapshot/SSE); **só leitura** — não delibera nem despacha | ARQ-016; Âncora Mestra |
| **Âncora Mestra** | Documento vivo de continuidade operacional / aprendizado; sem efeito normativo sobre CON/ADR | `docs/learning/ANCORA-MESTRA.md` |
| **Gate** | Autorização formal para avançar etapa (produto ou EIC, conforme o documento) | ADR-006; Roadmap EIC |

---

## 3. Siglas

| Sigla | Expansão | Nota |
|-------|----------|------|
| **EIC** | Engenharia da Inteligência Conversacional | Este domínio |
| **CON** | Constituição | CON-001 |
| **VIS** | Visão | VIS-001… |
| **REQ** | Requisito | — |
| **ADR** | Architectural Decision Record | — |
| **ARQ** | Documento de Arquitectura | — |
| **IMP** | Plano / implementação | — |
| **CN** | Conversação Natural | PX-003 |
| **C1…C4** | Classes do Classificador de Intenção | ARQ-018 |
| **MRE** | Motor de Raciocínio Executivo | Normas MRE / ADR-019 |
| **COA** | Contexto / frente activa (uso no Classificador e Núcleo) | ARQ-018 |
| **MG2** | Motoboy Game 2 — contexto operacional ADR-015 / VIS-003 | VIS-003; ADR-015 |

---

## 4. Termos evitados / ambíguos (na EIC)

| Evitar como sinónimo de | Porque |
|-------------------------|--------|
| “Chatbot” para o CEO | Contraria CON-001 Art. 2º §1º e VIS-002 §3.6 |
| “O Classificador” sem precisar NCS vs Intenção | Existem Classificador de Intenção (ARQ-018) e Classificador NCS (ARQ-014) — preocupações distintas |
| Tratar Âncora Mestra como norma CON/ADR | A própria Âncora declara não ter esse efeito |

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [`00_VISÃO_GERAL.md`](00_VISÃO_GERAL.md) | Uso dos termos na identidade |
| [`01_PRINCÍPIOS.md`](01_PRINCÍPIOS.md) | Princípios que citam C1–C4 e CN |
| [`13_MARCO_ZERO.md`](13_MARCO_ZERO.md) | Fase 1 / Marco Zero |
| [`ÍNDICE.md`](ÍNDICE.md) | Navegação |

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Estrutura inicial | Esqueleto |
| 0.2 | 03/08/2026 | Engenheiro (Cursor) | Auditoria de padronização | Padrão único |
| 1.0 | 03/08/2026 | Engenheiro (Cursor) | BLOCO 1 — glossário consolidado | Referência oficial de termos EIC |

---

**Estado:** BLOCO 1 — glossário consolidado. Sem impacto no produto.
