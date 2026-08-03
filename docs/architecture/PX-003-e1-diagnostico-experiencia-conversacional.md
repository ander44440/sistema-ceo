# PX-003 E1 — Diagnóstico da Experiência Conversacional do CEO

> **O que é?** Diagnóstico da **comunicação conversacional** atual do CEO (prosa, ritmo, papéis, fluidez) e proposta de arquitetura da **Conversação Natural**.  
> **Por que existe?** PX-001 fixou personalidade e continuidade; PX-002 a voz. Ainda falta diagnosticar o **diálogo** como experiência — o que soa artificial, o que ainda lembra chatbot, e como evoluir sem perder objetividade.  
> **Para quem?** Patrocinador (homologa); CTO/Engenheiro (implementam só após Gate).  
> **Sucesso:** Diagnóstico + lista priorizada + arquitetura-alvo suficientes para PX-003 E2+ sem reabrir identidade (PX-001).  
> **Status:** **Aguarda homologação.**  
> **Data:** 31/07/2026 · **Autor:** Engenheiro (Cursor)  
> **Proibições deste E1:** não alterar código; não alterar prompts; não alterar UI; não implementar.

**Normas de apoio:** CON-001; PX-001 E2 / PX-011; REQ-050 (Speaker); F2-02 (ciclo executivo); PX-002 (voz = canal, não personalidade).  
**Não confunde:** Speaker delibera→prosa; Conversação Natural governa **turno, memória dialógica, variação e cadência** — sem mudar a máquina de decisão do MRE.

---

## 0. Âmbito do diagnóstico

Fontes inspecionadas (leitura apenas):

| Camada | Artefacto |
|--------|-----------|
| Identidade | `constituicaoCeo.js`, PX-001 E2 |
| Governança de prosa | `governancaLlm.js` |
| Deliberação → texto | `speakerExecutivo.js` |
| Rotas locais / cumprimentos | `capacidades/ia.js` |
| Superfícies | `conversa.js`, `centroSituacao.js` |
| Experiência | F2-02; PX-002 (voz como canal) |

---

## 1. Diagnóstico (seis eixos)

### 1.1 O que ainda soa artificial

| Achado | Evidência | Efeito |
|--------|-----------|--------|
| **Template deliberativo rígido** | Speaker: `Sobre: …` / `Aprovo: …` / `Porquê: …` / `Próximo gesto: …` / `Quando quiser, seguimos.` | Soa a formulário executivo, não a fala de um par. |
| **Rótulos de estado como prosa** | `Aprovo`, `Rejeito`, `Delego a execução`, `Preciso de dados` prefixados mecanicamente | Léxico de sistema vazado para o utilizador. |
| **“Lacunas residuais” / metadados** | Blocos explícitos de lacunas no chat | Tom de relatório interno, não de conversa. |
| **Reapresentação de identidade** | Centro/Conversa: “Sou o CEO — o Executivo Digital…” em boas-vindas | Correto uma vez; artificial se repetido ou longo demais após o utilizador já “conhecer” o posto. |
| **Fechos formulaicos** | “Quando quiser, seguimos.” / “Vamos seguir.” em quase todo fecho positivo | Continuidade PX-011 bem intencionada vira **muleta**. |
| **Fallback técnico na boca do CEO** | Mensagens com `CEO_LLM_API_KEY`, `.env`, nomes de motor | Quebra o personagem executivo (vazamento de orquestração). |

### 1.2 O que ainda lembra um chatbot

| Achado | Evidência | Efeito |
|--------|-----------|--------|
| **Turno pedido→resposta→espera** | Centro e Conversa: utilizador envia; CEO responde; idle até novo input | Postura de **atendente**, apesar da norma de iniciativa. |
| **Estado de UI “Pronto para instruções”** | `conversa.js` | Vocabulário de helpdesk, não de posto de comando. |
| **Placeholder “Envie uma instrução…”** | Composer da Conversa | Reforça “eu aguardo comandos”. |
| **Chips / atalhos como menu** | Centro: “Abrir o dia”, “Resumo Executivo”, “Ver agora →” | Úteis, mas empurram UX de **botão de bot** se forem o centro da conversa. |
| **Eco estruturado do objetivo** | `Sobre: ${objetivoReal}` no topo de cada deliberação | Parece “confirming your request” de assistente. |
| **Canal default `chat` no Speaker** | Guião de voz muitas vezes derivado do texto de chat | Mesma prosa densa no ouvido — tipicamente “assistente a ler um ticket”. |

### 1.3 O que transmite personalidade executiva

| Achado | Evidência | Porquê funciona |
|--------|-----------|-----------------|
| **Proibição de “Como posso ajudar?”** | Constituição + `governancaLlm` + PX-011 | Remove o maior sinal de chatbot. |
| **Cumprimentos ancorados em objetivo** | “Bom dia. Qual é o objetivo de agora?” | Abre com mandato, não com catálogo de skills. |
| **Continuidade explícita** | “Continuo a acompanhar…”, “Vamos continuar de onde paramos…” | Sensação de acompanhamento permanente. |
| **Verbos deliberativos** | Aprovar / rejeitar / delegar / monitorar / solicitar dados | Autoridade de Diretor Executivo (quando bem redigidos). |
| **Uma pergunta de bloqueio** | Norma PX-001 + Speaker em `solicitar_dados` | Respeito ao tempo (CON-001). |
| **Tom sem emoji / sem bajulação** | Listas proibidas homologadas | Diferenciação clara de assistentes genéricos. |
| **Posto de comando no Centro** | “Posto de comando ativo…” | Framing de COA, não de chat genérico. |

### 1.4 O que prejudica a fluidez da conversa

| Achado | Efeito na fluidez |
|--------|-------------------|
| **Mesma estrutura em todo turno deliberativo** | O utilizador antecipa o molde; a atenção cai; a conversa não “respirar”. |
| **Densidade de 4–6 blocos por resposta** | Em voz e mobile, sobrecarga; no chat, scroll e fadiga. |
| **Pouca variação de abertura/fecho** | Sensação de loop; PX-011 vira mantra. |
| **Histórico pouco usado na prosa** | Respostas raramente referem o turno anterior em linguagem natural (“No último ponto…”) — só contexto técnico no prompt. |
| **Dois canais com boas-vindas longas** | Centro e Conversa podem “recomeçar” o relacionamento na mesma sessão. |
| **Estados de sistema misturados à prosa** | `Via memoria · pronto` / erros de LLM na mesma bolha que a deliberação | Quebra ritmo e confiança. |
| **Voz (PX-002) ainda em recuperação pós-await** | Mesmo com E6, falha → “Ouvir” quebra o fluxo conversacional contínuo. |
| **Iniciativa assimétrica** | Constituição pede conduzir; UI espera input — o CEO raramente **abre** um turno sem ser perguntado. |

### 1.5 Oportunidades: mais humano sem perder objetividade

| Oportunidade | Princípio |
|--------------|-----------|
| **Prosa em camadas** | 1 frase de decisão → opcional “porquê” curto → um próximo gesto. Detalhe sob pedido. |
| **Espelho natural** | Em vez de `Sobre: X`, “Entendi: priorizar Y. …” (já na PX-001; pouco aplicado no Speaker). |
| **Variação controlada** | Banco pequeno de aberturas/fechos executivos (3–5), não aleatoriedade de chatbot. |
| **Referência ao fio** | “Mantemos o foco em MG2 / outdoor.” — continuidade **factual**, não emocional. |
| **Silêncio útil** | Nem todo turno precisa de fecho “Quando quiser, seguimos.” |
| **Separar meta de diálogo** | Erros técnicos e “via capacidade” fora da voz do CEO (ou tom de sistema distinto). |
| **Iniciativa leve** | Após deliberação estável, uma sugestão de próximo foco **sem** perguntar “em que posso ajudar”. |
| **Canal-aware** | Chat = um pouco mais denso; voz = 2–3 frases; Centro = síntese + destaque. |

### 1.6 Síntese do diagnóstico

O CEO **já tem identidade executiva normativa forte** (PX-001 / Constituição). O que falha na experiência é sobretudo a **camada de conversação**: o Speaker e as superfícies ainda **renderizam a deliberação como formulário**, o ritmo é **turno-a-turno de chatbot**, e a continuidade PX-011 está **lexicalizada** (frases fixas) em vez de **estrutural** (memória dialógica + variação + iniciativa).

**Veredicto:** personalidade ≠ conversação natural. PX-003 deve atacar a arquitetura do diálogo, sem reabrir quem o CEO é.

---

## 2. Lista priorizada de melhorias

Prioridade = impacto na fluidez × alinhamento ADR-015 (uso diário MG2) × risco baixo para MRE/decisão.

| Prio | Melhoria | Tipo | Dependência |
|------|----------|------|-------------|
| **P0** | **Contrato de turno conversacional** — tipar turnos: `abertura`, `deliberacao`, `espelho`, `bloqueio`, `fecho`, `sistema` | Spec → Speaker | PX-003 E2 |
| **P0** | **Camadas de prosa no Speaker** — default: decisão + próximo gesto; `porquê`/lacunas só se necessário ou pedido | Speaker (sem mudar parecer) | REQ-050 |
| **P0** | **Separar voz do sistema** — erros LLM, “Via X · pronto”, chaves `.env` fora da bolha do CEO | UI copy / canal sistema | Sem MRE |
| **P1** | **Banco de variação PX-011** — 3–5 aberturas/fechos; regra anti-repetição na sessão | Spec + aplicação controlada | PX-001 |
| **P1** | **Espelho natural** em pedidos ambíguos (já normativo; falta no template) | Speaker / LLM prose | PX-001 §5 |
| **P1** | **Prosa por canal** — chat / voz / centro com densidade distinta (hoje canal `chat` predomina) | Speaker | IMP-016 |
| **P2** | **Fio dialógico** — 1 referência explícita ao turno ou foco anterior quando houver histórico | Prompt/contexto conversa | Memória |
| **P2** | **Iniciativa pós-ciclo** — após “Feito”, um próximo foco sugerido (não pergunta de helpdesk) | Capacidade / UI | F2-02 |
| **P2** | **Alinhar microcopy UI** — “Pronto para instruções” → léxico de posto (“À escuta do próximo passo”) | UI strings | Sem lógica |
| **P3** | **Modo brief vs modo deep** — utilizador ou política pede detalhe; default sempre brief | Preferência | PX-002 pref? |
| **P3** | **Métricas de conversação** — % turnos com muleta de fecho; comprimento médio; taxa de eco `Sobre:` | Observabilidade | Pós-E2 |

**Fora de escopo PX-003 E1 (não priorizar agora):** mudar MRE, parecer, NCS, backend, personalidade PX-001 (já homologada), TTS (PX-002).

---

## 3. Proposta — Arquitetura da Conversação Natural

### 3.1 O que é

Camada **entre** (a) deliberação/capacidade e (b) superfície (chat / centro / voz), responsável por:

1. Escolher o **tipo de turno**;  
2. Aplicar **densidade e variação** alinhadas a PX-001;  
3. Preservar **fio dialógico** (continuidade estrutural);  
4. Encaminhar **meta-mensagens** (sistema) fora da voz do CEO.

**Não** delibera. **Não** altera o ParecerExecutivo. **Não** substitui o Orquestrador de Voz (PX-002).

```text
Utilizador
    │
    ▼
Núcleo / MRE / capacidades  →  resultado estruturado (parecer, dados, mensagem bruta)
    │
    ▼
┌─────────────────────────────────────┐
│  Conversação Natural (alvo PX-003)  │
│  • tipo de turno                    │
│  • composição de prosa              │
│  • variação / anti-muleta           │
│  • fio dialógico                    │
│  • separação sistema vs CEO         │
└─────────────────────────────────────┘
    │
    ├─► Texto (Conversa / Centro)
    └─► Guião (Experiência de Voz PX-002)
```

### 3.2 Princípios

1. **Objetividade primeiro** — humano ≠ verboso; humano = natural, curto, com mandato.  
2. **Uma intenção por turno** — decidir, bloquear, ou avançar; não os três em monólogo.  
3. **Continuidade estrutural > frases de continuidade** — referir foco/decisão anterior vale mais que “Vamos seguir.”  
4. **Variação finita** — catálogo fechado; proibido improvisar tom de influencer.  
5. **Canal-aware** — mesma decisão; prosa adaptada.  
6. **Sistema não fala como CEO** — falhas técnicas e telemetria de UI têm canal próprio.  
7. **Compatível com MRE** — entrada = comunicado/parecer/dados; saída = `texto`, `guiãoVoz?`, `meta?`.

### 3.3 Tipos de turno (contrato)

| Tipo | Quando | Forma-alvo |
|------|--------|------------|
| `abertura` | 1× por ciclo de atenção | Cumprimento curto + pergunta de objetivo (PX-001 §3) |
| `espelho` | Pedido ambíguo | 1 frase espelho + check |
| `deliberacao` | Parecer válido | Decisão + próximo gesto (+ porquê se confiança baixa ou pedido) |
| `bloqueio` | `solicitar_dados` / lacuna crítica | O que falta + 1 pergunta |
| `fecho` | Ciclo concluído ou pausa | Síntese 1 frase **ou** silêncio de fecho (sem muleta obrigatória) |
| `sistema` | Erro técnico, estado de pipeline | Tom neutro de sistema; sem “Eu, o CEO…” |

### 3.4 Composição da deliberação (camadas)

```text
Camada A (obrigatória):  Decisão em prosa natural (sem rótulo cru se puder evitar)
Camada B (obrigatória):  Próximo gesto (um)
Camada C (condicional):  Porquê curto — se confiança < limiar OU utilizador pediu detalhe
Camada D (condicional):  Lacuna / pergunta de bloqueio
Camada E (opcional):     Âncora de fio (“Mantemos o foco em …”)
Camada F (evitar default): Fecho PX-011 — só se não houver B claro ou for pausa longa
```

### 3.5 Relação com componentes existentes

| Componente | Papel hoje | Papel com Conversação Natural |
|------------|------------|-------------------------------|
| Constituição / PX-001 | Identidade | Permanece norma máxima de tom |
| Speaker (REQ-050) | Template fixo | **Produtor de conteúdo deliberativo**; CN aplica composição/variação **ou** Speaker passa a emitir por camadas |
| `governancaLlm` | Prosa livre do LLM | Continua; CN valida/normaliza saída quando aplicável |
| PX-002 Orquestrador | Fala ou não | Consome `guiãoVoz` já naturalizado |
| Conversa / Centro | Render | Render + canal `sistema` distinto |

### PX-003.11 — Memória conversacional local

A Camada de Conversação Natural deve considerar o contexto imediato da conversa.

Ela deve utilizar:

- último turno;
- objetivo atual;
- frente ativa.

Objetivos:

- evitar repetir perguntas já respondidas;
- reduzir respostas redundantes;
- manter continuidade natural da conversa;
- preservar o fio dialógico.

Importante:

Esta camada não cria nova memória nem altera o MRE.

Ela apenas utiliza o contexto já existente para tornar a conversação mais fluida e natural.

### 3.6 Anti-objetivos

- Não criar “modo amigável” ou small talk.  
- Não randomizar personalidade.  
- Não esconder incerteza com fluidez falsa.  
- Não mover decisão do MRE para a camada de prosa.  
- Não acoplar Conversação Natural ao backend Railway.

### 3.7 Critérios de sucesso (para E2+)

| Métrica qualitativa | Alvo |
|---------------------|------|
| Utilizador reconhece continuidade **sem** ouvir sempre a mesma frase de fecho | Sim |
| Resposta deliberativa média ≤ 3 blocos curtos no default | Sim |
| Zero vazamento de `.env` / nomes de motor na voz do CEO | Sim |
| Pedido ambíguo usa espelho natural ≥ norma PX-001 | Sim |
| Voz e chat partilham decisão; densidade distinta | Sim |

### 3.8 Sequência sugerida (pós-homologação E1)

1. **PX-003 E2** — Spec normativa dos tipos de turno + catálogo de variação (sem código).  
2. **PX-003 E3** — Aplicar composição no Speaker / ponte CN (sem mudar MRE).  
3. **PX-003 E4** — Microcopy UI + canal sistema.  
4. **VAL** — Sessões reais MG2 (desktop + mobile); checklist contra §3.7.

---

## 4. Entregáveis deste E1

- [x] Diagnóstico nos 6 eixos  
- [x] Lista priorizada de melhorias (P0–P3)  
- [x] Proposta de arquitetura da Conversação Natural  
- [x] Sem alteração de código / prompts / UI  

---

## 5. Pedido de Gate

Homologar este diagnóstico e a arquitetura-alvo da Conversação Natural como base de PX-003 E2+.

**Aguardo homologação.**
