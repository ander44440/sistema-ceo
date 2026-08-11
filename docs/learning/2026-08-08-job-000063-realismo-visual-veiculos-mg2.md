# Realismo visual dos veículos MG2 — JOB-000063

> **Entrega do Job da fila CEO.** Análise visual de carros e motos; uma melhoria de maior impacto; próximo passo.  
> **Data:** 08/08/2026 · **Autor:** Engenheiro (Cursor), via fila REQ-045.

---

## 1. Estado actual (inspecção directa)

Repo oficina: `E:\anderson\Projoto motoboy game` — `WorldLab2Canvas.jsx` (~16k LOC).

| Classe | Função | Silhueta actual | Legibilidade à distância |
|--------|--------|-----------------|--------------------------|
| **Moto player** | `makeMotoboyMoto()` | CG Titan detalhada — rodas raiadas, garfo, tanque gota, escape, farol redondo, carenagens | **Alta** — reconhecível como moto de rua |
| **Motos NPC** | `makeTrafficMoto()` → `makeMoto()` | Caixas arredondadas + torus nas rodas + esfera no farol + baú delivery | **Baixa** — lê-se como «blocos coloridos sobre rodas» |
| **Moto polícia** | `makePoliceMoto()` | Touring/bagger (Harley) — carenagem batwing, V-twin, alforjes | **Alta** — distinta do restante tráfego |
| **Carros tráfego** | `makeTrafficCar()` — 7 estilos | `compact`, `sedan`, `suv`, `luxury`, `sport`, `supercar`, `fusca` — corpos `rBox` empilhados + rodas cilíndricas | **Média** — variedade existe no código, mas perfis convergem (mesma receita de caixas) |
| **Piloto / NPC humano** | Cápsula + esfera capacete (`riderParts`) | Estilizado, sem rosto/anatomia realista | **Adequado** — alinhado a personagens estilizados (não tocar para realismo) |

**Assimetria crítica:** o comentário no código confirma a lacuna — *«Moto do player — silhueta Honda CG Titan. NPCs continuam em makeMoto()»* (L812–814). O player e a polícia têm vocabulário de silhueta; **todo o tráfego moto genérico partilha uma única mesh primitiva**.

Carros têm 7 arquétipos nomeados (ex.: fusca com esferas = melhor leitura), mas compact/sedan/suv/luxury/sport/supercar diferem sobretudo em escala de `rBox` — **proporções de eixo entre rodas, capô e habitáculo não estão codificadas como regra**, logo a leitura «sedan vs SUV vs hatch» falha em jogo.

**NPCs humanos:** melhorias visuais futuras devem limitar-se a silhueta/cor/acessório (capacete, colete reflector) — **sem rosto, pele ou corpo realista**, em linha com princípios visuais do projecto.

---

## 2. Deliberação — uma melhoria de maior impacto

### Melhoria escolhida: **Vocabulário de silhueta por arquétipo (proporções + 1 assinatura por tipo)**

**O quê:** Para cada veículo em tráfego, fixar **3 proporções obrigatórias** (comprimento entre eixos · altura do centro de massa · ratio roda/corpo) e **1 elemento de assinatura não-caixa** que quebra a leitura «Lego».

| Tipo | Proporções-alvo | Assinatura |
|------|-----------------|------------|
| **Moto cub/street** (NPC delivery) | Wheelbase curto, tanque alto, roda ~0.46 | Tanque gota + baú traseiro proeminente |
| **Moto sport** | Wheelbase longo, perfil baixo, inclinação visual forward | Carenagem frontal inclinada + escape lateral |
| **Moto utilitária** | Wheelbase médio, guidão alto | Garfo visível + para-lama torus |
| **Hatch compact** | Comprimento < sedan, habitáculo alto | Porta traseira inclinada (painel inclinado, não caixa) |
| **Sedan** | Capô : habitáculo : porta-malas ≈ 1:1:0.6 | Linha de cintura + porta-malas separado |
| **SUV** | Altura +25% vs sedan, rodas +20% | Trilho de tejadilho + grade alta |
| **Sport** | Capô longo, teto baixo, fastback | Splitter + faixa lateral |
| **Fusca** | (já bom) | Manter esferas — referência interna |

**Porquê esta e não outra:**

1. **Maior delta visual por esforço** — reutiliza `rBox`, `makeSpokedWheel`, torus, esferas já no ficheiro; zero texturas/fotorealismo.
2. **Ataca o pior gap** — motos NPC são hoje clones de `makeMoto()`; carros têm estilos mas sem proporções forçadas.
3. **Preserva performance** — geometria procedural leve; sem novos assets GLTF.
4. **Não afecta personagens** — pilotos continuam cápsula+capacete.
5. **Alinha Temporada 2** — «cidade convence» inclui tráfego credível (JOB-000042 F5); veículos legíveis reforçam a rua viva.

**Explicitamente fora de escopo desta melhoria:** PBR avançado, modelos externos, rostos realistas, animação de pilotos.

---

## 3. Próximo passo (oficina)

| Campo | Valor |
|-------|-------|
| **Onde** | `WorldLab2Canvas.jsx` |
| **Entrega mínima (MVP)** | Substituir `makeTrafficMoto()` para sortear entre **3 builders** (`makeMotoCub`, `makeMotoSport`, `makeMotoUtil`) com proporções distintas; extrair constantes de ratio partilhadas |
| **Segunda fatia (mesmo Job futuro ou JOB dedicado)** | Em `makeTrafficCar()`, aplicar tabela de proporções + 1 assinatura por `kind`; fusca = referência |
| **Verificação** | Hard-refresh `/mg2`; parar num cruzamento com tráfego denso — **contar motos distintas «de relance»** (≥3 silhuetas) e **nomear carro vs SUV vs hatch** sem zoom; `npm run build` OK; incrementar `SCENE_REV` |
| **Gate** | Playtest Patrocinador — «estes parecem motos/carros diferentes?» antes de expandir para mais detalhe |

**Prioridade dentro do MVP:** **Motos NPC primeiro** — gap maior e tráfego moto mais frequente na avenida principal.

---

## 4. Resultado da fila

`completed` — Análise e deliberação entregues; melhoria única definida (vocabulário de silhueta por arquétipo); próximo passo = MVP motos NPC em 3 arquétipos no repo oficina. Sem alteração Constituição/Governança CEO.
