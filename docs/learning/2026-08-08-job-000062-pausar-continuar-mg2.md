# Pausar / Continuar in-game MG2 — JOB-000062

> **Entrega do Job da fila CEO.** Deliberação executiva + encaminhamento oficina + verificação da função PAUSAR/CONTINUAR durante a partida.  
> **Origem:** MRE (parecer `parecer-c3-1786204426486-yqzlju`).  
> **Data:** 08/08/2026 · **Autor:** CEO MG2 (Autoridade Delegada), registado pelo Engenheiro via fila REQ-045.

---

## 1. Deliberação executiva

| Pergunta | Decisão |
|----------|---------|
| **1. Fazer agora?** | **Sim** — necessidade real do Patrocinador; playtests longos exigem interrupção sem perder missão/posição |
| **2. O que entregar?** | Pausa **in-game** no WorldLab2: congelar simulação, overlay «Pausado», **Continuar** (botão + Esc), atalho **P**, acesso a Configurações e Menu inicial; estado do jogo intacto na memória |
| **3. Encaminhamento** | **Oficina** — repo `E:\anderson\Projoto motoboy game`, ficheiro `src/prototypes/worldLab2/WorldLab2Canvas.jsx` (+ hint em `WorldLab2Page.jsx`) |
| **4. Verificação** | `npm run build` + `npm run lint` OK; checklist smoke abaixo |

**Nota sobre JOB-000044:** o veredito anterior («não agora» para pause in-game) foi **revisto** pelo CEO com mandato explícito e Autoridade Delegada MG2. A dor passou a ser declarada como real; execução autorizada nesta janela.

**Distinção mantida:** Pausar **CEO** (`#action-pause`, TTS/escuta) ≠ Pausar **partida MG2** (simulação WorldLab2).

---

## 2. Entregáveis (oficina)

| Item | Estado | Evidência |
|------|--------|-----------|
| Botão **PAUSAR** no HUD | Entregue | `WorldLab2Canvas.jsx` L15723–15731 |
| Overlay «Pausado» + **Continuar** | Entregue | L15745–15794 |
| **Esc** continua da pausa | Entregue | `useEffect` keydown L14074–14100 |
| Atalho **P** pausa | Entregue | idem |
| Simulação congelada (`dt` ignorado, early-return no tick) | Entregue | L14918–14944 |
| Teclas/input limpos na pausa | Entregue | L14920–14922 |
| Áudio silenciado na pausa | Entregue | `audio.update` com zeros L14923–14938 |
| Configurações a partir da pausa | Entregue | `Mg2SettingsScreen` via `pauseSettingsOpen` |
| Menu inicial sem perder save (volta ao fluxo de entrada) | Entregue | `onExitToMenu` |
| Hint desktop | Entregue | `WorldLab2Page.jsx` L66 |

---

## 3. Checklist smoke (Patrocinador / oficina)

1. Iniciar partida MG2 → conduzir → **P** ou **PAUSAR** → overlay «Pausado» aparece.  
2. Tráfego, missão e posição **não avançam** durante pausa.  
3. **Continuar** ou **Esc** → retoma exactamente na mesma posição/missão/caixa.  
4. Durante pausa, som de motor/tráfego **não** continua audível.  
5. **Configurações** na pausa → sliders persistem → **Voltar** → ainda pausado → **Continuar** OK.  
6. **Menu inicial** na pausa → volta ao ecrã de entrada (comportamento esperado de sair da partida).

---

## 4. Verificação automática (08/08/2026)

| Comando | Resultado |
|---------|-----------|
| `npm run build` (repo MG2) | OK — 57 módulos, build 7.8s |
| `npm run lint` (repo MG2) | OK — zero erros |

---

## 5. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Implementação pause | `Projoto motoboy game/src/prototypes/worldLab2/WorldLab2Canvas.jsx` |
| Fluxo página | `Projoto motoboy game/src/prototypes/worldLab2/WorldLab2Page.jsx` |
| Veredito anterior | `docs/learning/2026-08-07-job-000044-viabilidade-botao-pausar-mg2.md` |
| Prioridades MG2 | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| ADR-015 | `docs/adr/ADR-015-priorizacao-pelo-uso-operacional-diario-mg2.md` |

---

## Resultado da fila

`completed` — PAUSAR/CONTINUAR in-game MG2 deliberado, implementado na oficina e verificado (build + lint). Smoke manual pendente confirmação Patrocinador.
