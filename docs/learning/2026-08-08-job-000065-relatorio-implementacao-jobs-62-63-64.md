# Relatório consolidado — implementações JOB-000062, 063 e 064

> **Entrega do Job da fila CEO (JOB-000065).** Síntese de tudo que foi implementado nos Jobs 62, 63 e 64.  
> **Origem:** MRE (parecer `parecer-c3-1786220111795-6vckr8`).  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Resumo executivo

| Job | Pedido | Implementação entregue | Repo |
|-----|--------|------------------------|------|
| **062** | PAUSAR / CONTINUAR in-game MG2 | Função completa de pausa durante a partida | MG2 (`WorldLab2Canvas.jsx`, `WorldLab2Page.jsx`) |
| **063** | Realismo visual dos veículos | Análise + deliberação; MVP motos NPC (3 silhuetas) | MG2 (`WorldLab2Canvas.jsx`) |
| **064** | Direcionamento e pendências | Teste CEO corrigido + MVP motos NPC + roadmap expansões | CEO + MG2 |

**Marco técnico MG2:** `SCENE_REV = 154` após as três entregas.

**Pendente Patrocinador:** gates playtest M0 (moto vertical) e M1 (performance ≥10 min); smoke manual da pausa in-game.

---

## 2. JOB-000062 — PAUSAR / CONTINUAR in-game

**Deliberação:** Sim, agora — revoga adiamento do JOB-000044. Distinção mantida: pausa CEO (`#action-pause`) ≠ pausa partida MG2.

### Implementação (repo MG2)

| Componente | Detalhe |
|------------|---------|
| **Botão PAUSAR** | HUD in-game; desactivado enquanto já pausado |
| **Overlay «Pausado»** | Botão **Continuar**, acesso a **Configurações** e **Menu inicial** |
| **Atalhos** | **P** pausa · **Esc** continua |
| **Simulação congelada** | Early-return no tick; `dt` ignorado; teclas limpas |
| **Áudio** | `audio.update` com zeros durante pausa (motor/tráfego silenciados) |
| **Estado preservado** | Posição, missão, caixa e tráfego intactos na memória |
| **Hint desktop** | `WorldLab2Page.jsx` — indicação de atalho P |

### Verificação automática

| Comando | Resultado |
|---------|-----------|
| `npm run build` (MG2) | OK — 57 módulos |
| `npm run lint` (MG2) | OK — zero erros |

**Evidência:** `docs/learning/2026-08-08-job-000062-pausar-continuar-mg2.md`

---

## 3. JOB-000063 — Realismo visual dos veículos

**Deliberação:** Melhoria única de maior impacto = **vocabulário de silhueta por arquétipo** (3 proporções + 1 assinatura por tipo). NPCs humanos mantêm cápsula+capacete estilizado (sem realismo).

### Diagnóstico (estado antes)

| Classe | Problema |
|--------|----------|
| Motos NPC | Todas usavam `makeMoto()` genérico — «blocos sobre rodas» |
| Carros tráfego | 7 estilos nomeados mas proporções convergiam (mesma receita de `rBox`) |
| Moto player / polícia | Já tinham silhuetas distintas (CG Titan, Harley) |

### Decisão de implementação

| Tipo veículo | Proporções-alvo | Assinatura |
|--------------|-----------------|------------|
| Moto cub/street | Wheelbase curto, tanque alto | Tanque gota + baú delivery |
| Moto sport | Wheelbase longo, perfil baixo | Carenagem inclinada + escape lateral |
| Moto utilitária | Wheelbase médio, guidão alto | Garfo visível + para-lama torus |
| Carros (fatia 2) | Capô/habitáculo/porta-malas por kind | 1 elemento não-caixa por arquétipo |

**MVP prioritário:** motos NPC primeiro (gap visual maior).

**Evidência:** `docs/learning/2026-08-08-job-000063-realismo-visual-veiculos-mg2.md`

---

## 4. JOB-000064 — Direcionamento, pendências e expansão

### 4.1 Pendência CEO resolvida

| Item | Acção | Evidência |
|------|-------|-----------|
| Teste `continuidade-gate` E6 falhando | Entrypoint Conversa→Núcleo actualizado para `enviarAoNucleo.js` (IMP-068); teste alinhado | `npm run test:continuidade-gate` — **51/51 OK** |

Ficheiro afectado: `app/src/continuidadeGate/fronteiras.test.js`

### 4.2 Expansão MG2 entregue (MVP JOB-000063)

| Builder | Silhueta | Características |
|---------|----------|-----------------|
| `makeMotoCub` | Delivery / cub | Wheelbase curto, baú traseiro proeminente (ex-`makeMoto()`) |
| `makeMotoSport` | Sport | Wheelbase longo, carenagem inclinada, escape lateral |
| `makeMotoUtil` | Utilitária | Garfo visível, para-lama torus, guidão alto |
| `makeTrafficMoto()` | Sorteio | Escolhe aleatoriamente entre as 3 + pisca-luzes partilhadas |

**SCENE_REV:** 154 · **Build MG2:** OK

### 4.3 Direcionamento das próximas expansões

| Ordem | Expansão | Estado |
|-------|----------|--------|
| **1** | Gates M0+M1 (playtest Patrocinador) | **Bloqueante** |
| **2** | Silhuetas carros NPC (2ª fatia JOB-000063) | Pronto para Job |
| **3** | F6 — pagamento corrida cancelada | Decisão DEC-MVP-001 |
| **4** | Refino visual noite (M3) | Após M0/M1 OK |
| **—** | F8 Temporada 2 / F9 mapa | Fora da onda (JOB-000048) |

**Evidência:** `docs/learning/2026-08-08-job-000064-direcionamento-expansoes-mg2.md`

---

## 5. Mapa de ficheiros alterados

### Repo MG2 (`E:\anderson\Projoto motoboy game`)

| Ficheiro | JOB | Alteração |
|----------|-----|-----------|
| `src/prototypes/worldLab2/WorldLab2Canvas.jsx` | 062, 063, 064 | Pausa in-game; `makeMotoCub/Sport/Util`; `SCENE_REV 154` |
| `src/prototypes/worldLab2/WorldLab2Page.jsx` | 062 | Hint atalho P |

### Repo CEO (`E:\anderson\CEO`)

| Ficheiro | JOB | Alteração |
|----------|-----|-----------|
| `app/src/continuidadeGate/fronteiras.test.js` | 064 | Assert entrypoint `enviarAoNucleo` |
| `docs/learning/2026-08-08-job-000062-*.md` | 062 | Evidência pausa |
| `docs/learning/2026-08-08-job-000063-*.md` | 063 | Evidência análise visual |
| `docs/learning/2026-08-08-job-000064-*.md` | 064 | Evidência direcionamento |

---

## 6. Checklist smoke (Patrocinador)

### Pausa in-game (JOB-000062)

1. Iniciar partida → **P** ou **PAUSAR** → overlay «Pausado».
2. Tráfego/missão **não avançam** durante pausa.
3. **Continuar** ou **Esc** → retoma na mesma posição/missão.
4. Som de motor/tráfego **silenciado** na pausa.
5. **Configurações** na pausa → sliders persistem → **Continuar** OK.

### Silhuetas moto NPC (JOB-000063/064)

1. Hard-refresh `/mg2` → cruzamento com tráfego denso.
2. Contar **≥3 silhuetas moto distintas** de relance (cub, sport, util).

### Gates bloqueantes

1. Sessão ≥10 min com tráfego denso (M1).
2. Verificar moto ereta após colisões (M0).

---

## Resultado da fila (JOB-000065)

`completed` — Relatório consolidado das implementações dos Jobs 62, 63 e 64 entregue.
