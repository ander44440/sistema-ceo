# Deliberação CTO — Início da Construção do CEO

> **Status: Oficial — Deliberação do CTO (26/07/2026).**  
> Natureza: **mudança oficial de foco** do projeto — da fase dominante de arquitetura para a **construção** da primeira versão navegável e utilizável.  
> Pré-condição: F0–F5 homologadas/encerradas; CAP-03 baseline congelada (REQ-036…044 / ARQ-012 / IMP-009).

---

## Declaração

A fase de arquitetura **deixa de ser o foco principal**. A arquitetura homologada (F1–F5 + CAP-03) passa a ser a **referência normativa** para a implementação.

**Objetivo imediato:** construir a primeira versão navegável e utilizável do CEO.

---

## Diretrizes vinculantes deste ciclo

1. Estrutura da interface principal (desktop primeiro; preparada para responsividade).  
2. Layout **permanente** da aplicação (não protótipo descartável).  
3. Navegação principal entre os módulos previstos (REQ-043).  
4. Tela inicial — Dashboard Executivo — com dados simulados onde ainda não houver backend (REQ-040).  
5. Área de conversa com o CEO (REQ-041).  
6. Infraestrutura para conectar cada módulo a funcionalidades reais de forma incremental.  
7. Alinhamento aos artefatos arquiteturais homologados — sem os contradizer (F3–F5; MVA; MVX; REQ-037/039/041/043).

## Critério de sucesso

O utilizador consegue: abrir no navegador; navegar pela interface principal; visualizar módulos estruturais; iniciar conversa com o CEO; perceber que o sistema existe e está pronto para evoluir capacidade a capacidade.

## Sede de implementação deste ciclo

| Item | Caminho |
|------|---------|
| Aplicação permanente | `app/` |
| Domínio CAP-03 (cópia de runtime; baseline docs/cap-03 **congelada**) | `app/public/legacy/` |
| Documentação desta deliberação | Este ficheiro |

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (deliberação); Engenheiro (Cursor) registrou e inicia construção |
| Quando | 26/07/2026 |
| Por quê | Mudar foco para construção da 1ª versão navegável |
| Baseado em quê | F1–F5; CAP-03; ADR-015; ADR-006 (REQ existentes) |
| Resultado | Foco oficial em construção; app permanente em `app/` |
