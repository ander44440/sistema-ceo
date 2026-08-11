# O que sabemos do MG2 + Botão Pausar — JOB-000045

> **Entrega do Job da fila CEO.** Síntese de conhecimento MG2 e confirmação do botão Pausar no shell CEO.  
> **Origem:** MRE (parecer `parecer-c3-1786146970606-ihth2i`).  
> **Data:** 07/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. O que sabemos sobre o MG2

### Identidade e arquitectura

| Campo | Valor |
|-------|-------|
| **Nome** | Motoboy Game 2 (MG2) — protótipo 3D web |
| **Stack** | Three.js + Vite; cena principal WorldLab2 (rotas `/` e `/mg2`) |
| **Cenário** | Cidade Bombinhas (litoral SC); mood SP + litoral |
| **Repo jogo** | `E:\anderson\Projoto motoboy game` (~14k LOC monolítico) |
| **Repo CEO** | Processo separado (Vite tipicamente :5173 vs :5174 no jogo) |
| **Papel CEO** | Governar foco, decisões, despachos — **não** executar código 3D (REQ-030) |

### Estado técnico (snapshot 30/07/2026)

- Sprint 1 de performance **feito**: raio de update ~140 m, pixelRatio adaptativo, SCENE_REV 147.
- LOD e streaming/chunks **ainda não**.
- Outdoors laterais + luminosos piscantes (JOB-000010).
- `DAY_ONLY=true` (ciclo só dia).
- Dores activas: hitch residual na carga; stutter em tráfego denso.

### Decisões e regras de produto

- **DEC-MVP-001:** taxa zerada em corrida cancelada (23/07).
- **ADR-015:** priorizar o que aproxima uso diário CEO↔MG2.
- Próximo passo curado: validar Sprint 1 de perf com Patrocinador → se ok, LOD (Sprint 2) na oficina.

### Prioridades documentadas (JOB-000042)

| Rank | Funcionalidade | Estado |
|------|----------------|--------|
| **F1** | Bug moto vertical («de pé») | **Aberto** — bloqueador #1 |
| **F2** | Performance / fluidez | Sprint 1 feito; gate Patrocinador pendente |
| **F3** | Mobile + LAN | Entregue (baseline) |
| F4–F9 | Atmosfera, trânsito, pagamento, outdoors, expansão | Variado — ver JOB-000042 |

### O que **não** está no lastro runtime

O CEO em tempo de execução usa briefing curado (`briefingsProjeto.js`) + memória de sessão — **não** lê `docs/` nem o repo do jogo live. Conhecimento estratégico de Jobs anteriores (arquitectura JOB-000007, viabilidade JOB-000011, prioridades JOB-000014) existe no acervo humano mas **não** entra automaticamente no prompt.

Ver inventário completo: `docs/learning/2026-08-07-inventario-conhecimento-mg2.md`.

### Distinção CEO ↔ oficina

- Alterações de código/build/deploy do jogo → **oficina** (repo externo).
- Controlo vocal/conversacional do CEO → **shell CEO** (este repo).
- Botão Pausar **in-game** (congelar tráfego/missão) ≠ botão Pausar **CEO** (TTS/escuta) — ver JOB-000044.

---

## 2. Botão Pausar — implementação

### Veredito

O botão Pausar do **shell CEO** está **implementado e operacional** (entregue em JOB-000039 / JOB-000041; verificado neste Job).

| Componente | Caminho | Função |
|------------|---------|--------|
| Módulo | `app/src/botaoPausar.js` | `executarPausa()`, `montarBotaoPausar()` |
| Shell | `app/src/shell.js` | Monta `#action-pause` em `#shell-pause-host` |
| Estilos | `app/src/styles/shell.css` | `.shell-pause-btn`, estado `.is-pausado` |
| Conversa | `app/src/modules/conversa/conversa.js` | Escuta `ceo:pausar` → interrompe CEO Ouvindo |

### Comportamento

1. **TTS em curso** → pausa/interrompe fala.
2. **Escuta activa (Ouvindo)** → termina escuta.
3. **Evento global** `ceo:pausar` → Conversa actualiza UI («CEO pausado»).
4. Botão no canto superior direito do header (`#action-pause`).

### Evidência técnica

- `npm run build` — OK.
- `npm run test:voz` — 33/33 pass.

### Nota sobre Pausar in-game

Pausar **dentro** do WorldLab2 (congelar simulação) **não** foi implementado — JOB-000044 concluiu que não faz sentido agora (sem dor documentada; F1/F2 prioritários; escopo de oficina).

---

## 3. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Briefing runtime | `app/src/executiveEngine/briefingsProjeto.js` |
| Inventário conhecimento | `docs/learning/2026-08-07-inventario-conhecimento-mg2.md` |
| Prioridades MG2 | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Viabilidade Pausar | `docs/learning/2026-08-07-job-000044-viabilidade-botao-pausar-mg2.md` |
| Botão Pausar CEO | `app/src/botaoPausar.js`, `app/src/shell.js` |
| Briefing canónico | `docs/mvp/briefing-operacional-mg2.md` |

---

## Resultado da fila

`completed` — síntese MG2 entregue; botão Pausar CEO confirmado operacional (sem reimplementação). Pausar in-game MG2 fora de escopo nesta janela.
