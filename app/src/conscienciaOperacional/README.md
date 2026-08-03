# Consciência Operacional

**IMP-059** · **REQ-059** · **ARQ-020**  
Integração com Classificador (**ARQ-018** / **REQ-057**), Continuidade do Gate (**ARQ-019** / **REQ-058**), Motor (**ARQ-017** / **REQ-056**), Fila (**REQ-045**) e Dispatcher (**REQ-053**).  
Painel (**ARQ-016** / **REQ-055**) e CTO (**REQ-054**) são fontes de leitura.

## O que é

Camada que obriga o CEO a **consultar o Estado Executivo Atual** antes de respostas **C2/C3**, influenciando a prosa/recomendação **sem** alterar o fluxo do Motor nem criar Jobs.

## Fluxo

```text
Continuidade do Gate? (léxico) → sim → ARQ-019 (sem Consciência deliberativa)
  → Classificador
  → C2/C3 → agregar F1–F8 → lastro se relevante → Núcleo/MRE
  → C1/C4 → destino normal (consulta não obrigatória)
```

## Fontes F1–F8 e prioridade P1–P7

| Pri | Fonte |
|-----|--------|
| P1 | Gates pendentes (F3) |
| P2 | Jobs em execução (F2) |
| P3 | Jobs pendentes (F1) |
| P4 | Agent (F6) / Dispatcher (F4) |
| P5 | CTO (F5) |
| P6 | Painel (F7) |
| P7 | Frente activa (F8) |

## Módulos

| Ficheiro | Etapa | Papel |
|----------|-------|-------|
| `dominio.js` | E1 | Estado Executivo imutável, F1–F8, P1–P7 |
| `agregarEstado.js` | E2 | Agregador read-only + degradação |
| `consultarAntesDeResponder.js` | E3 | Consulta obrigatória C2/C3 |
| `influenciaDeliberacao.js` | E4–E5 | Prosa / hint MRE / garantia de reflexo |
| `leitoresPadrao.js` | E4 | Leitores injectáveis (só leitura) |
| `index.js` | — | API pública |

**Entrypoint:** `executiveEngine.executar` → Continuidade → Classificador → Consciência (C2/C3) → destinos.

## Fronteiras

- **Somente leitura** face a Fila, Motor, Dispatcher, Continuidade e Painel.
- **Não** cria Jobs; **não** decide Gates; **não** importa `@cursor/sdk`.
- Continuidade do Gate tem precedência sobre deliberação consciente.
- Sem contexto operacional relevante → comportamento C2/C3 inalterado.

## Testes

```bash
cd app
npm run test:consciencia-operacional
```

| Script | Etapa |
|--------|-------|
| `test:consciencia-operacional:e1` … `:e7` | Por etapa |
| `test:consciencia-operacional` | Suite completa |

## Evidências

`docs/implementation/evidencias/IMP-059-*.md` · matriz CA/NA · relatório consolidado.
