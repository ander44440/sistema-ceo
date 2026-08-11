# PX-002 E1 — Arquitetura da Experiência de Voz do CEO

> **O que é?** Especificação arquitetural da **experiência de voz** do CEO (quando fala, quando ouve, como o utilizador autoriza e controla).  
> **Por que existe?** O diagnóstico PX-001 E1 mostrou TTS automático pós-`await`, Centro sem voz, e silêncio no mobile por autoplay/gesto. Esta spec define o alvo antes de implementar.  
> **Para quem?** Patrocinador (homologa); CTO/Engenheiro (implementam só após Gate).  
> **Sucesso:** Documento suficiente para PX-002 E2+ sem reabrir desenho de estados ou autoplay.  
> **Status:** **Aguarda homologação.**  
> **Data:** 31/07/2026 · **Autor:** Engenheiro (Cursor)  
> **Proibições deste E1:** não alterar código; não alterar UI; não implementar; não criar prompts.

**Normas de apoio:** REQ-047 (Voice Engine); REQ-050 (Speaker = texto, não áudio); PX-001 E1 (diagnóstico); PX-001 E2 (personalidade / PX-011).  
**Não confunde:** Speaker redige; Voice Engine sintetiza; Experiência de Voz governa **preferência, estados e gesto**.

---

## 0. Princípios da experiência

1. **Voz é opt-in.** Default = Desativada. O CEO não “assalta” o áudio do dispositivo.  
2. **Um gesto explícito desbloqueia** a sessão de áudio (regra dos browsers).  
3. **Mesma decisão, canais distintos:** texto no ecrã sempre; voz só se Ativa + texto disponível.  
4. **Centro e Conversa** partilham a mesma máquina de estados de voz.  
5. **Falhas são visíveis** (estado Erro + mensagem curta PX-001); nunca silêncio opaco.  
6. **STT (ouvir) é opcional e separado** do TTS (falar); o MVP da experiência prioriza **TTS de saída**.

---

## 1. Fluxo completo da experiência de voz

### 1.1 Visão alvo (ponta a ponta)

```text
[Preferência: Desativada | Ativa | …]
        │
Utilizador envia instrução (Centro ou Conversa)  ← gesto de utilizador
        │
        ▼
Núcleo → (se deliberativo) MRE → Speaker → Comunicado (texto / guiãoVoz)
        │
        ▼
UI mostra texto (sempre)
        │
        ├─ Voz Desativada ──────────────────────► não sintetiza
        ├─ Aguardando autorização ──────────────► não sintetiza; pede gesto no botão
        ├─ Erro ────────────────────────────────► não sintetiza; mostra falha
        └─ Ativa
              │
              ▼
         Voice Session “unlocked” neste gesto?
              │ não → enfileira texto; pede toque “Ouvir” / botão voz
              │ sim
              ▼
         Estado: Falando
              │
              ▼
         VoiceFactory.speak(guião ou texto)  → speechSynthesis (browser)
              │
              ▼
         onend → Ativa (idle)   |   onerror → Erro
```

### 1.2 Papéis no fluxo

| Componente | Responsabilidade de voz |
|------------|-------------------------|
| **Speaker** | Produz `texto` / `guiãoVoz` (já existe). |
| **Orquestrador de Experiência de Voz** *(alvo)* | Lê preferência; aplica estados; decide se chama TTS; trata unlock. |
| **Voice Engine (REQ-047)** | `speak` / `stop` / `isSpeaking` — sem política de UX. |
| **Botão de voz** | Controlo explícito: ativar, desativar, autorizar, interromper, ouvir pendente. |
| **API / Railway** | Sem áudio; sem flag `falar` (mantém-se). |

### 1.3 Fluxo de primeira sessão vs. sessão recorrente

| Sessão | Fluxo |
|--------|--------|
| **Primeira** (sem preferência) | Desativada → utilizador toca botão → Aguardando autorização / unlock → Ativa → persiste preferência. |
| **Recorrente** (preferência Ativa) | Ao carregar: Ativa *lógica*, mas **locked** até primeiro gesto da sessão → após Enviar/botão: unlocked → Falando nas respostas. |
| **Recorrente** (preferência Desativada) | Nunca sintetiza até o utilizador ativar de novo. |

---

## 2. Como o utilizador ativa a voz pela primeira vez

**Regra:** a primeira ativação exige **gesto explícito no controlo de voz** (não basta carregar a página; não basta scroll).

### Sequência canónica

1. Utilizador vê o botão de voz em estado **Desativada** (rótulo/comportamento: “Ativar voz”).  
2. Toca/clica o botão.  
3. Sistema entra em **Aguardando autorização** se o browser exigir permissão adicional (ex.: microfone só se STT for pedido; para TTS puro, tipicamente só precisa do gesto).  
4. No mesmo gesto (ou no imediato seguinte sem navegação):  
   - marca preferência = **Ativa**;  
   - marca sessão = **unlocked**;  
   - opcional: fala de verificação curta (*“Voz ativa. Vamos seguir.”* — prosa PX-001).  
5. A partir daí, respostas do CEO **podem** ser faladas automaticamente **enquanto** a sessão permanecer unlocked e a preferência Ativa.

### O que **não** conta como primeira ativação

- Carregar `#/dashboard`.  
- Foco automático no input.  
- Resposta async sem toque recente no controlo de voz ou no envio **após** preferência Ativa + unlock de sessão.  
- Preferência importada sem gesto nesta sessão (ver §6).

---

## 3. Estados da voz

Máquina de estados **única** (global à app na sessão).

```text
                    ┌──────────────┐
         ┌─────────►│  Desativada  │◄─────────┐
         │          └──────┬───────┘          │
         │                 │ ativar (gesto)   │ desativar
         │                 ▼                  │
         │          ┌──────────────────┐      │
         │          │ Aguardando       │──────┤ (cancelar / falha perm.)
         │          │ autorização      │      │
         │          └────────┬─────────┘      │
         │                   │ ok             │
         │                   ▼                │
         │          ┌──────────────┐          │
         └──────────│    Ativa     │──────────┘
                    │   (idle)     │
                    └───┬──────┬───┘
            falar       │      │ iniciar escuta (STT, fase 2)
                        ▼      ▼
                 ┌──────────┐ ┌──────────┐
                 │ Falando  │ │ Ouvindo  │
                 └────┬─────┘ └────┬─────┘
                      │ fim/stop   │ fim/stop/erro
                      ▼            ▼
                   Ativa(idle)  Ativa(idle) ou Erro
                                    │
                                    ▼
                              ┌──────────┐
                              │   Erro   │──► retry gesto → Ativa / Desativada
                              └──────────┘
```

| Estado | Significado | TTS | STT | Transições principais |
|--------|-------------|-----|-----|------------------------|
| **Desativada** | Preferência off ou nunca ativou | Não | Não | → Aguardando / Ativa via botão |
| **Aguardando autorização** | Gesto feito; à espera de perm. browser ou unlock | Não | Não | → Ativa \| → Desativada \| → Erro |
| **Ativa** | Preferência on; idle; pode falar na próxima resposta se unlocked | Em espera | Em espera | → Falando \| → Ouvindo \| → Desativada \| → Erro |
| **Falando** | `speak` em curso | Sim | Não (interrompe se STT pedir) | → Ativa \| → Erro \| stop → Ativa |
| **Ouvindo** | Reconhecimento ativo (fase 2) | Não (pausa/para fala) | Sim | → Ativa \| → Erro |
| **Erro** | Falha de síntese, permissão, ou API de voz indisponível | Não | Não | → Ativa (retry) \| → Desativada |

**Notas:**

- **Ativa ≠ unlocked.** Ativa é preferência; unlocked é flag de sessão após gesto válido (§6).  
- **Falando** e **Ouvindo** são mutuamente exclusivos.  
- Enviar nova instrução em **Falando** → `stop` → volta a Ativa → eventualmente nova fala.

---

## 4. Comportamento esperado em Desktop

| Aspeto | Comportamento |
|--------|----------------|
| Motor | Web Speech API (`speechSynthesis`), provider `browser` (REQ-047). |
| Ativação | Clique no botão de voz; feedback imediato. |
| Após Ativa + unlock | Respostas do CEO (Centro **e** Conversa) faladas automaticamente após o texto no ecrã. |
| Envio (Enter / botão Enviar) | Conta como gesto de unlock **se** preferência já Ativa. |
| Interromper | Clique no botão (toggle stop) ou nova mensagem → cancela utterance. |
| Vozes | Melhor pt-BR disponível; `voiceschanged` tratado no Voice Engine. |
| Separação de janelas | Se o browser suspender TTS em background, ao focar de novo: Ativa idle; não retoma mid-frase automaticamente. |
| Teclado | Atalho opcional futuro (fora do MVP desta spec); não obrigatório no E1. |

---

## 5. Comportamento esperado em Mobile

| Aspeto | Comportamento |
|--------|----------------|
| Default | Desativada — crítico por autoplay iOS/Android. |
| Ativação | **Toque** no botão de voz (área de toque ≥ 44×44 CSS px — requisito de comportamento de hit-target, não visual). |
| Unlock de sessão | Obrigatório após cada cold start / reload; preferência Ativa **não** fala sozinha ao abrir o URL. |
| Enviar mensagem | Com preferência Ativa: o toque em Enviar **renova** unlock e autoriza a fala da **esta** resposta (mesmo após `await` de rede — ver §6). |
| Centro de Situação | Mesmo orquestrador que a Conversa (corrige lacuna atual do PX-001 E1). |
| STT | Só após permissão de microfone explícita; se negada → Erro com mensagem, TTS pode continuar Ativa. |
| Chamada / outra app de áudio | Ao perder foco de áudio → `stop`; estado Ativa idle. |
| Safari iOS | Nunca depender de `speak` “órfão” pós-rede sem cadeia de gesto (§6). |

---

## 6. Estratégia para contornar restrições de autoplay

### 6.1 Problema (já diagnosticado)

`speak()` após `await` longo **cai fora** da janela de user activation (especialmente iOS).

### 6.2 Estratégia oficial (camadas)

| Camada | Estratégia |
|--------|------------|
| **A — Opt-in** | Sem preferência Ativa, zero `speak`. |
| **B — Unlock de sessão** | Flag `voiceSessionUnlocked` só fica true após gesto (botão voz **ou** Enviar com preferência Ativa). |
| **C — Captura no gesto** | No handler síncrono do gesto: (1) se Ativa, chamar `speechSynthesis.resume()` / utterance vazia curta de warm-up **ou** marcar intent `pendingSpeak=true`; (2) após resposta, se unlocked e Ativa, `speak(texto)`. |
| **D — Fila de audição** | Se a resposta chegar e a sessão **não** estiver unlocked: guardar `textoPendente`; UI do botão oferece “Ouvir resposta”; o toque fala o pendente **no gesto**. |
| **E — Sem áudio servidor no MVP** | Continuar Web Speech no cliente; TTS neural/servidor é evolução (não desbloqueia autoplay sozinho). |
| **F — Proibido** | Autoplay agressivo ao load; `speak` escondido em timers sem gesto; engolir `onerror`. |

### 6.3 Cadeia recomendada no envio (preferência Ativa)

```text
click/touch Enviar (síncrono)
  → stop() se Falando
  → voiceSessionUnlocked = true
  → warm-up opcional (utterance silencioso / resume)
  → await executiveEngine…
  → se Ativa && unlocked → Falando → speak(textoVoz)
  → senão se Ativa && !unlocked → enfileira + “Ouvir”
```

### 6.4 Warm-up

Permitido no MVP: no gesto de ativação ou envio, um `speak` de string mínima (`" "`) ou `resume()`, cancelável, **sem** alterar o significado da resposta. Objetivo único: manter a activation chain onde o browser exigir.

---

## 7. Especificação do botão de voz (comportamento, não aparência)

**Identidade:** um único controlo global de experiência de voz (shell ou superfície de comando — a localização visual fica para implementação UI após Gate).

| Estado atual | Ação do toque/clique | Resultado |
|--------------|----------------------|-----------|
| Desativada | Ativar | → Aguardando autorização / Ativa + unlock; persiste preferência Ativa |
| Aguardando autorização | Cancelar (segundo toque ou timeout UX) | → Desativada |
| Ativa (idle), sem pendente | Desativar | → Desativada; `stop`; persiste Desativada |
| Ativa (idle), com `textoPendente` | Ouvir | → Falando (consome pendente) |
| Falando | Interromper | → `stop` → Ativa idle |
| Ouvindo | Parar escuta | → Ativa idle |
| Erro | Tentar de novo | Reexecuta unlock / speak pendente ou volta a pedir ativação |

**Regras de comportamento:**

1. Sempre **acessível por teclado** (Enter/Espaço ativam a mesma ação).  
2. Expõe estado a leitores de ecrã (nome do estado, não só ícone).  
3. Não navega de rota; não envia mensagem ao Núcleo.  
4. Não altera deliberação MRE.  
5. Em Desativada, **nenhuma** superfície chama `speak`.

---

## 8. Estratégia para persistir a preferência do utilizador

| Item | Especificação |
|------|----------------|
| **Chave** | `ceo.voice.preference.v1` |
| **Onde** | `localStorage` (cliente) — alinhado a outras preferências de sessão |
| **Valor** | `{ "enabled": boolean, "updatedAt": ISO-8601 }` |
| **Default** | Ausente ⇒ `enabled: false` (Desativada) |
| **Escrita** | Só em transição explícita Ativa ↔ Desativada pelo botão |
| **Leitura** | No boot da app → estado inicial Desativada ou Ativa(**locked**) |
| **Não persistir** | `voiceSessionUnlocked`, `textoPendente`, estado Falando/Ouvindo/Erro |
| **Servidor / Railway** | Fora do MVP (preferência é do dispositivo/browser) |
| **Multi-dispositivo** | Independente por browser (aceitável no MVP) |
| **Privacidade** | Não é segredo; não contém áudio nem PII além da flag |

**Migração:** se no futuro houver perfil remoto, a preferência local prevalece até sync explícito (não especificado agora).

---

## 9. Tratamento de erros e mensagens ao utilizador

Tom: PX-001 (direto, sem “Como posso ajudar?”).

| Condição | Estado | Mensagem-alvo (prosa) |
|----------|--------|------------------------|
| `speechSynthesis` inexistente | Erro | “Neste dispositivo não há síntese de voz. Seguimos só por texto.” |
| `speak` rejeitado / autoplay | Erro ou fila | “O browser bloqueou a fala. Toque em Ouvir para autorizar.” |
| Utterance `onerror` | Erro | “A voz falhou nesta resposta. O texto mantém-se no ecrã.” |
| Permissão microfone negada (STT) | Erro (STT) | “Sem microfone. A voz de saída pode continuar ativa.” |
| Preferência Ativa mas locked + resposta nova | Ativa + pendente | Não é erro: botão oferece “Ouvir resposta”. |
| Utilizador desativa durante fala | Desativada | Para imediatamente; sem culpar o utilizador. |

**Regras:**

- Erro **nunca** apaga o texto da resposta.  
- Erro **não** reabre deliberação.  
- Após Erro, um gesto no botão é o único retry.  
- Logs técnicos (`console`) permitidos; utilizador vê só a frase curta.

---

## 10. Critérios de homologação

Homologar esta arquitetura se o Patrocinador concordar com **todos** os pontos:

| ID | Critério |
|----|----------|
| H1 | Voz default **Desativada** (opt-in). |
| H2 | Primeira ativação só por **gesto no botão de voz**. |
| H3 | Estados Desativada / Aguardando autorização / Ativa / Falando / Ouvindo / Erro estão fechados e sem ambiguidade. |
| H4 | Desktop e Mobile partilham a mesma máquina; Mobile exige unlock por sessão. |
| H5 | Estratégia anti-autoplay (unlock + fila “Ouvir” + warm-up opcional) é a abordagem oficial. |
| H6 | Botão especificado por **comportamento** (tabela §7), sem amarrar visual. |
| H7 | Preferência em `localStorage` com chave versionada; sessão unlocked **não** persiste. |
| H8 | Erros visíveis; texto sempre disponível; sem `speak` silencioso. |
| H9 | Centro e Conversa sob o **mesmo** orquestrador (corrige PX-001 E1). |
| H10 | Fora de escopo explícito deste E1: UI visual, implementação, prompts, TTS servidor, STT completo. |

**Pedido:** aprovar / pedir ajustes / rejeitar.  
**Após Gate:** autorizar PX-002 E2 (implementação do orquestrador + botão + persistência).

---

## Lacunas do estado atual (referência, não implementação)

| Lacuna | Spec alvo |
|--------|-----------|
| Conversa fala sempre; Centro nunca | Orquestrador único + preferência |
| Sem opt-in | Default Desativada |
| `speak` pós-`await` sem unlock | §6 |
| Erros engolidos | §9 |
| Sem botão de voz na UX principal | §7 (comportamento) |

---

## Memória organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (spec); Patrocinador (homologação pendente) |
| Quando | 31/07/2026 |
| Por quê | PX-002 E1 — arquitetura da experiência de voz |
| Baseado em quê | PX-001 E1; REQ-047; REQ-050; PX-001 E2 / PX-011 |
| Resultado | Spec entregue; **aguarda Gate** |
