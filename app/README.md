# CEO — Aplicação permanente

> **Status: Em construção — ciclo pós-deliberação CTO (26/07/2026).**  
> Deliberação: [`../docs/learning/2026-07-26-inicio-construcao-ceo.md`](../docs/learning/2026-07-26-inicio-construcao-ceo.md)  
> Domínio: cópia de runtime CAP-03 em `public/legacy/` (baseline `docs/cap-03/` **congelada**).

## Como correr

```powershell
cd E:\anderson\CEO\app
npm install
npm run dev
```

Abrir o URL do Vite (por omissão http://localhost:5173).

## O que esta versão entrega

| Critério | Estado |
|----------|--------|
| Abrir no navegador | `npm run dev` |
| Layout permanente | Shell sticky + nav fixa |
| Navegar módulos | Painel · Projetos · Conversas · Memória · Configurações |
| Dashboard Executivo | Resumo com seed MG2 simulado |
| Conversa com o CEO | Determinística (CAP-03); slot para LLM |
| Infra incremental | `runtime.registrarConector(moduloId, …)` |

## Alinhamento

REQ-037/038/039/040/041/043 · ARQ-012 · F5 (conversa centro, lente COA, sem seletor de meios).
