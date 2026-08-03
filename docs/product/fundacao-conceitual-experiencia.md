# Fundação Conceitual da Experiência — Linha de Base (pós-F2)

> **Status: Vigente — Fase F2 CONCLUÍDA (CTO, 26/07/2026).**  
> Natureza: **índice normativo** da Fundação Conceitual consolidada na IPR-001.  
> Não substitui os artefatos-fonte; aponta a linha de base oficial para F3+.

---

## 1. O que é / Por que / Para quem / Sucesso

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | A declaração oficial de que a Fase 2 está concluída e de quais artefatos compõem a **Fundação Conceitual** da experiência do CEO. |
| **Por que existe?** | F3+ (capacidades, UX, UI) precisa de uma linha de base citável — sem reabrir F1/F2 nem depender de memória informal. |
| **Para quem?** | CTO; Engenheiro; Usuário. |
| **Sucesso?** | Todo artefato F3+ declara conformidade com esta linha de base ou registra exceção formal do CTO. |

---

## 2. Estado da Fase F2

| Item | Estado |
|------|--------|
| F2-01 Arquitetura Conceitual (D1–D5 + COA) | ✅ Homologada |
| F2-02 Modelo de Interações | ✅ Homologada |
| F2-03 Modelo de Governança | ✅ Homologada |
| F2-04 Princípios da Experiência (PX + IX) | ✅ Homologada |
| **Fase F2** | ✅ **Concluída** |
| Coleta de benchmark F1 | Encerrada (inalterada) |
| Próxima fase | **F3** — Capacidades funcionais da experiência |

---

## 3. Linha de base da Fundação Conceitual

| Componente | Artefato canônico | Conteúdo normativo essencial |
|------------|-------------------|------------------------------|
| **Diretrizes Arquiteturais (DA)** | [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md) | DA-001 Objetivo antes da Ferramenta; DA-002 Contexto sobrevive; DA-003 Níveis de abstração |
| **Domínios D1–D5** | [`F2-01-arquitetura-conceitual-experiencia.md`](F2-01-arquitetura-conceitual-experiencia.md) | Comando; Conversa; Conhecimento; Orquestração; Execução + lente COA |
| **Modelo de Interações** | [`F2-02-modelo-de-interacoes-experiencia.md`](F2-02-modelo-de-interacoes-experiencia.md) | Ciclo contínuo; Transitório/Permanente; D4 decide/encaminha (não executa); eventos e fronteiras |
| **Modelo de Governança** | [`F2-03-modelo-de-governanca-experiencia.md`](F2-03-modelo-de-governanca-experiencia.md) | Ciclo de vida do objetivo; prioridade; COA; Foco; D1; continuidade entre sessões |
| **Princípios da Experiência (PX)** | [`F2-04-principios-da-experiencia.md`](F2-04-principios-da-experiencia.md) | PX-01…PX-10 |
| **Invariantes da Experiência (IX)** | [`F2-04-principios-da-experiencia.md`](F2-04-principios-da-experiencia.md) | IX-01…IX-12 (+ rubrica UXC/UXR) |

**Âncoras herdadas (pré-F2, inalteradas):** CON-001; VIS-007; P1–P6 ([`principios-de-produto.md`](principios-de-produto.md)); REQ-037/039/041 (fundação COA/conversa — não reabertos aqui).

---

## 4. Uso da linha de base na F3+

1. Toda capacidade funcional (F3) deve **mapear** para D1–D5 e respeitar DA / PX / IX.  
2. Nenhuma capacidade pode tornar **visível** o que F2-04 declara invisível (orquestração como superfície, escolha de meios).  
3. Lacunas L1/L2/L4/L5/L6 permanecem decisões internas — a F3 pode *nomear* capacidades que as endereçam, sem resolvê-las por tecnologia.  
4. Implementação continua exigindo ADR-006 (REQ→ARQ→IMP→VAL) — a Fundação Conceitual **informa**, não autoriza código.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (encerramento F2); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Consolidar linha de base após Gate F2-04 |
| Baseado em quê | Homologação F2-01…F2-04 |
| Resultado | Fundação Conceitual vigente; F3 aberta |
