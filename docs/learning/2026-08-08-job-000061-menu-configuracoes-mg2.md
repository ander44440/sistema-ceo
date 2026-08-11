# Decisão executiva — Menu de configurações MG2 (JOB-000061)

> **Entrega do Job da fila CEO.** Avaliação da necessidade, objetivo, categorias essenciais e encaminhamento — **sem implementação**.  
> **Origem:** MRE (parecer `parecer-c3-1786194551352-cwf31o`).  
> **Data:** 08/08/2026 · **Autor:** CEO MG2 (Autoridade Delegada), registado pelo Engenheiro via fila REQ-045.

---

## 1. Veredito executivo

| Pergunta | Resposta |
|----------|----------|
| **A necessidade é real?** | **Sim** — o Patrocinador precisa ajustar comportamento e apresentação sem depender da oficina a cada sessão |
| **Já existe algo no jogo?** | **Sim** — menu **Controles** (Esc ou botão HUD) com áudio + sensibilidade, persistido em `localStorage` (`mg2-control-prefs-v1`) |
| **Implementar menu ampliado agora?** | **Não** — P2; gates M0/M1 (F1/F2) e validação do menu actual têm prioridade |
| **Confiança** | Alta — inspeção directa `WorldLab2Canvas.jsx`; alinhado JOB-000042/050/057 e ADR-015 |

**Síntese:** O pedido aponta para um **menu de configurações** mais estruturado do que o actual «Controles». A dor é legítima, mas **~70% do núcleo (controlo + som) já está entregue**. O gap real neste momento é **desempenho/apresentação ajustável pelo jogador**, não um painel genérico. Evolução sim — **depois** de fechar gates de jogabilidade e fluidez.

---

## 2. Objetivo do menu (decisão)

| Campo | Valor |
|-------|-------|
| **Objetivo único** | Dar ao Patrocinador **autonomia de conforto** em playtest: ajustar resposta de controlo, áudio e carga visual **sem alterar código**, com preferências que sobrevivem entre sessões no mesmo browser |
| **Não é** | Painel de developer, launcher de features, settings de missão/economia, nem substituto de gates CEO (M0/M1/M3) |
| **Filtro ADR-015** | Cada opção futura deve responder: *«Isto melhora sessões diárias Patrocinador ↔ CEO no MG2?»* |
| **Princípio de design** | Poucas categorias, defaults sensatos, zero jargão técnico; pausa de simulação **não** faz parte deste menu (cf. JOB-000044) |

---

## 3. Estado actual (08/08/2026)

| Item | Estado | Evidência |
|------|--------|-----------|
| Entrada | Esc (global) + botão **CONTROLES** (HUD superior direito) | `WorldLab2Canvas.jsx` L15714–15751 |
| Áudio | Volume 0–150%, mute | L15755–15790 |
| Controles | Sliders: direção, aceleração, freio, olhar, andar a pé | L15792–15816 |
| Acessibilidade | Inverter olhar vertical | L15818–15826 |
| Persistência | `localStorage` «Salvo neste navegador» | L15837; chave `mg2-control-prefs-v1` |
| Reset | «Restaurar padrão» | L15830–15836 |
| Mobile | Hints touch; sliders afectam botões na tela | L15846–15849 |

**Lacuna de conhecimento CEO:** o briefing operacional (`briefing-operacional-mg2.md`) **não menciona** este menu — risco de deliberações desalinhadas (cf. P02 JOB-000057).

---

## 4. Categorias essenciais para o MG2 **neste momento**

### 4.1 Já essenciais e entregues — **Controles + Áudio**

| Opção | Porquê essencial |
|-------|------------------|
| Volume / mute | Playtest em ambientes variados; CEO TTS + som jogo |
| Sensibilidade moto (steer/accel/brake) | F1 moto — Patrocinador calibra resposta pós-fix |
| Sensibilidade olhar / invert Y | Conforto PC; sessões longas |
| Andar a pé | Missões/portas exigem transição moto↔pedestre |

**Acção:** validar em gate M0 — não reimplementar.

### 4.2 Essencial a adicionar — **Desempenho** (após gate M1)

| Opção candidata | Porquê agora |
|-----------------|--------------|
| Preset qualidade (Baixo / Equilibrado / Alto) | F2 perf — Patrocinador ajusta sem rebuild; mobile vs PC |
| Cap `pixelRatio` explícito | Sprint 1 já adapta; slider daria controlo em playtest |
| Reduzir pós-processo (bloom) em runtime | M3 visual — fallback se gate M3 falhar por FPS |

**Regra:** presets mapeiam para constantes já existentes (`PERF_*`, `pixelRatio`, bloom) — **sem** expor LOD/chunking manual (automático).

### 4.3 Desejável P2 — **Apresentação**

| Opção candidata | Porqué |
|-----------------|--------|
| Escala HUD (metros, cash, job) | Legibilidade mobile |
| Dicas de teclas on/off | Reduz ruído para utilizador experiente |
| Indicador FPS (toggle) | Apoia gate M1 com métrica objectiva (cf. P07 JOB-000057) |

### 4.4 Fora de escopo nesta onda

| Categoria | Motivo |
|-----------|--------|
| Rebind de teclas | Esforço alto; zero feedback documentado |
| Ciclo dia/noite / materiais | Domínio M3/M8 roadmap — decisão CEO, não slider |
| Pausa in-game | Decidido adiar — JOB-000044 |
| Missão / economia / pagamento | F6 — regra de jogo, não preferência |
| Sync cloud / multi-dispositivo | Fora MVP ADR-015 |
| Idioma / acessibilidade avançada | Utilizador único; protótipo local |

---

## 5. Encaminhamento

### 5.1 Imediato (este Job — concluído)

1. Registar decisão neste documento.
2. **Não** publicar Job de implementação — pedido explícito «Não implemente ainda».

### 5.2 Pré-requisitos antes de qualquer Job oficina

| # | Pré-requisito | Responsável |
|---|---------------|-------------|
| 1 | Gate **M0** (F1 moto) — veredito Patrocinador | Patrocinador |
| 2 | Gate **M1** (F2 perf) — veredito Patrocinador | Patrocinador |
| 3 | Playtest do menu **Controles** actual — listar lacunas concretas (ex.: «preciso baixar qualidade no telemóvel») | Patrocinador |
| 4 | Actualizar §3 briefing CEO com existência do menu Esc/CONTROLES | CEO / curadoria |

### 5.3 Sequência recomendada pós-gates

```
M0 gate ──► M1 gate ──► Patrocinador testa menu actual ──► (se lacuna confirmada)
                                                              │
                                                              ▼
                                                    Job oficina M5-settings-v1
                                                    (evoluir Controles → Configurações
                                                     + tab Desempenho; ~1 sessão)
```

| Marco | Entregável | Prioridade |
|-------|------------|------------|
| **M5-settings-v1** | Renomear «Controles» → «Configurações»; tabs **Controles** (actual) + **Desempenho** (presets); manter `localStorage` versionado | **P2** |
| **M5-settings-v2** | Tab **Apresentação** (HUD, hints, FPS opcional) | **P3** — só após v1 validada |

**Job oficina sugerido (não publicado):**

| Campo | Valor |
|-------|-------|
| Título | MG2 M5-settings-v1: Configurações + preset Desempenho |
| Repo | `E:\anderson\Projoto motoboy game` |
| Ficheiro | `WorldLab2Canvas.jsx` (+ extract mínimo se monólito permitir) |
| Critério done | Esc abre «Configurações» com 2 tabs; preset Baixo/Equilibrado/Alto altera pixelRatio/bloom visível; prefs persistem; `npm run build` OK; `SCENE_REV++` |
| WIP | Só entra se WIP ≤ 2 **e** M0/M1 não bloqueiam |

### 5.4 O que o CEO **não** faz agora

- Não expandir escopo para «menu completo de tudo».
- Não competir com M3 (visual noite) nem F6 (pagamento) no WIP.
- Não alterar Constituição/Governança.

---

## 6. RACI

| Papel | Decisão (este Job) | Próximo passo |
|-------|-------------------|---------------|
| **CEO** | A — define objetivo, categorias, timing | Actualizar briefing; publicar Job M5-settings-v1 **só** após gates + feedback |
| **Patrocinador** | C — originou necessidade | Gates M0/M1; playtest menu actual |
| **Engenheiro (oficina)** | I | Executa M5-settings-v1 quando despachado |

---

## 7. Fontes consultadas

| Fonte | Caminho |
|-------|---------|
| Código menu actual | `E:\anderson\Projoto motoboy game\src\prototypes\worldLab2\WorldLab2Canvas.jsx` |
| Ranking funcionalidades | `docs/learning/2026-08-07-job-000042-funcionalidades-prioritarias-mg2.md` |
| Roadmap | `docs/learning/2026-08-08-job-000050-roadmap-mg2.md` |
| Problemas / gates | `docs/learning/2026-08-08-job-000057-problemas-plano-executivo-mg2.md` |
| Pausar in-game | `docs/learning/2026-08-07-job-000044-viabilidade-botao-pausar-mg2.md` |
| Perf fechamento | `docs/learning/2026-08-08-job-000060-perf-fechamento-mg2.md` |
| Briefing COA | `docs/mvp/briefing-operacional-mg2.md` |

---

## Resultado da fila

`completed` — necessidade validada; objetivo e categorias definidos; menu parcial já existe; implementação **adiada** até gates M0/M1 + feedback Patrocinador; Job M5-settings-v1 especificado mas **não publicado**; sem alteração Constituição/Governança.
