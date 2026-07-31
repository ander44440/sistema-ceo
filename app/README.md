# CEO — Aplicação permanente

> **Status: Gabinete Executivo — Ondas 01–03 homologadas · ciclo de validação operacional ativo.**  
> Deliberação de construção: [`../docs/learning/2026-07-26-inicio-construcao-ceo.md`](../docs/learning/2026-07-26-inicio-construcao-ceo.md)  
> Encerramento Onda 03: [`../docs/product/marco-encerramento-onda-03.md`](../docs/product/marco-encerramento-onda-03.md)  
> Regime atual: [`../docs/learning/2026-07-28-ciclo-validacao-operacional-pos-onda-03.md`](../docs/learning/2026-07-28-ciclo-validacao-operacional-pos-onda-03.md)  
> Domínio: cópia de runtime CAP-03 em `public/legacy/` (baseline `docs/cap-03/` **congelada**).

## Como correr

```powershell
cd E:\anderson\CEO\app
npm install
npm run dev
```

Abrir o URL do Vite (por omissão http://localhost:5173).

Voice Engine (infra interna): `#/dev/voice` ou `#/settings/voice` — não aparece na navegação.

## Ondas Operacionais

| Onda | Entrega | Estado |
|------|---------|--------|
| 01 | Catálogo de projetos + persistência do gabinete | ✅ |
| 02 | Dashboard executivo, estado e linha do tempo | ✅ |
| 03 | Fluxo Executivo Diário (abrir / trabalhar / encerrar / continuidade) | ✅ Encerrada |
| — | Ciclo de validação operacional (uso diário MG2) | 🟢 Ativo |
| 03.1 / 04 / F7 | — | ⏸ Deliberação CTO após o ciclo |

Validação Onda 03: `node scripts/validar-onda03-e5.mjs`

## O que esta versão entrega

| Critério | Estado |
|----------|--------|
| Abrir no navegador | `npm run dev` |
| Layout permanente | Shell sticky + nav fixa |
| Navegar módulos | Centro · Projetos · Conversa · Capacidades · Conhecimento · Configurações |
| Centro de Situação | Faixa do Dia + estado/resumo/ações do projeto ativo |
| Fluxo do dia | Abrir → trabalhar → encerrar com continuidade (D01–D07) |
| Conversa com o CEO | Engine determinística + slot LLM (contingência se LLM falhar) |
| Persistência local | `localStorage` — `ceo.onda01.gabinete.v1` |

## Alinhamento

REQ-037/038/039/040/041/043 · ARQ-012 · ADR-015 · F5 (conversa centro, lente COA) · Ondas 01–03.
