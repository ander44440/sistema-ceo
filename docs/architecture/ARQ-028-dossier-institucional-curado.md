# ARQ-028 — Dossier Institucional Curado (DIC)

> **Status: Em análise v0.1** (03/08/2026).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-028.  
> **Capacidade:** CAP-07 — Comunicação.  
> Norma superior: CON-001; VIS-001; VIS-002; ADR-002; ADR-006; ADR-011; ADR-015; **REQ-067**; ANL-011; proposta-identidade-permanente-ceo (homologada); ARQ-018 (Classificador — **não alterado**); ARQ-019 (Gate — **não alterado**); ARQ-017 (Motor — **não alterado**); ARQ-014 (NCS — **não alterado**); ARQ-026 / IMP-065 (VCA); ARQ-027 / REQ-066 (complexidade); IMP-057 E2.3; EIC; `constituicaoCeo.js`; `governancaLlm.js`.  
> **Nota de numeração:** o pedido de elaboração usou o rótulo «ARQ-027»; esse identificador **já está atribuído** a [`ARQ-027-tempo-resposta-proporcional-complexidade.md`](ARQ-027-tempo-resposta-proporcional-complexidade.md). Esta arquitectura recebe o próximo ID livre (**ARQ-028**).  
> **Finalidade:** arquitectura do **DIC** como **camada institucional de consumo** — património curado injectado **apenas** no path meta/institucional.  
> **Gate:** aguarda homologação. **Próximo artefacto:** IMP-067 (**implementada** — ver [`IMP-067-dossier-institucional-curado.md`](../implementation/IMP-067-dossier-institucional-curado.md)).

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura da camada **DIC**: artefacto curado subordinado a `/docs` que fornece património institucional ao LLM **só** quando o path meta/institucional está activo. |
| **Por que existe?** | REQ-067 / ANL-011: o routing já funciona; falta **carga** institucional canónica sem misturar com briefing de COA nem com o acervo CAP-04. |
| **Para quem existe?** | Patrocinador (respostas coerentes sobre o CEO/Sistema); compositor LLM; CTO/Engenheiro (IMP-067). |
| **Como medir sucesso?** | (1) DIC = consumo, não norma; (2) injecção só no path meta; (3) contratos com mandato/governação claros; (4) C1–C4 / EIC / Gate / Motor / NCS intactos; (5) política de exposição; (6) rollback; (7) pronta para IMP-067. |

---

## 1. Visão arquitectural

### 1.1 Princípio

O **DIC** é uma **camada de consumo**.  
Não é repositório canónico, não é Classificador, não é Capacidade CAP-04, não é Memória, não é BCO.

```text
Canónico (/docs)  ──cura──►  DIC  ──só path meta──►  composição LLM  ──►  resposta institucional
```

**Mapa conceptual (pedido / REQ-067):**

```text
/docs
   │
   ▼
 DIC          ← património institucional curado (consumo)
   │
   ▼
 governancaLlm ← conduta / prosa / anti-alucinação (já existente)
   │
   ▼
 LLM
   │
   ▼
 Resposta institucional
```

**Mapa de composição real (ordem canónica do runtime — proposta-identidade homologada + DIC):**

```text
montarMensagensLlm  [path meta / institucional activo]
  system[0]  obterConstituicaoCeo()     ← mandato de cargo (inalterado no papel)
  system[1]  obterGovernancaLlm()       ← conduta (inalterada no papel)
  system[2]  obterDicVigente()          ← NOVO (só neste path)
  system[3]  construirContextoSessao()  ← mínimo / sem lastro de projecto (VCA)
  ── briefing COA: OMITIDO por omissão neste path ──
  histórico + objectivo actual
       │
       ▼
     LLM  →  resposta institucional / metaconversacional
```

Os restantes paths (**C1** conhecimento mundano / leve, **C2** deliberação de projecto, **C3** execução, **C4** operacional, MRE completa, clarificação, identidade local sem LLM) **permanecem inalterados** quanto a contratos — **não** recebem o DIC por omissão.

### 1.2 Papel do DIC na arquitectura

| Camada | Artefacto | Decide / fornece |
|--------|-----------|------------------|
| Norma | CON / VIS / ADR / REQ / ARQ | Verdade canónica |
| Mandato | `constituicaoCeo.js` | Quem é o cargo na prosa executiva |
| Conduta | `governancaLlm.js` | Como o modelo deve falar e o que não inventar |
| **Consumo institucional** | **DIC (esta ARQ)** | **O que** dizer sobre o Sistema / organização (resumo rastreável) |
| Sessão | `contextoSessao` | Factos dinâmicos da sessão |
| COA | `briefingsProjeto` | Domínio do projecto activo |
| Limiar | VCA + Classificador + Complexidade | **Quando** activar o path meta (inalterados) |

O DIC **não** decide classe, complexidade, pertença, Jobs nem Gates.  
O DIC **só** fornece património quando o path meta/institucional já foi activado pelo limiar existente.

### 1.3 O que o DIC nunca faz (invariantes de garantia)

| # | Garantia arquitectural |
|---|------------------------|
| G1 | É **camada de consumo** |
| G2 | **Nunca** substitui documentos canónicos |
| G3 | **Nunca** altera CON, ADR, REQ ou ARQ (é espelho subordinado) |
| G4 | **Nunca** gera conhecimento normativo novo |
| G5 | **Nunca** cria decisões |
| G6 | **Nunca** altera o runtime **nesta ARQ**; a IMP-067 **apenas** liga o consumo sem redesenhar limiar/EIC |
| G7 | **Nunca** interfere na EIC (não muda scores, estados VCA, CSC, classes) |
| G8 | **Apenas** fornece património quando o path meta/institucional está activo |

---

## 2. Activação do path meta / institucional

### 2.1 Condição de activação (read-only sobre o limiar existente)

O DIC **só** é elegível para injecção quando **pelo menos um** dos sinais seguintes for verdadeiro (detalhe exacto de conjunção na IMP-067; princípio: alinhado a REQ-067 RF6):

| Sinal | Origem | Nota |
|-------|--------|------|
| Emenda E2.3 / `ehAutoexplicacaoInstitucionalE23` | Classificador / regras | Autoexplicação institucional |
| `ehMetaModoConversacional` | Classificador / regras | Meta-modo conversacional |
| VCA `veredicto = metaconversa` | ARQ-026 | Isolamento de lastro CSC |
| Complexidade `moderado` **e** intenção institucional/meta | ARQ-027 | Path 1× LLM típico |

**Não activam DIC por omissão:**

* C1 `conhecimento_geral` mundano (`resposta_leve`);  
* C2 deliberação de projecto / MRE `completa`;  
* C3 Jobs / Motor;  
* C4 operacional;  
* `pergunta_identidade` local (usa **resumo derivado** do DIC — §5.3 — sem injectar o dossier completo);  
* Clarificação.

### 2.2 Fluxo de utilização

```text
Utilizador (pergunta institucional / meta)
        │
        ▼
Gate → VCA → [CSC se pertence] → Classificador
        │
        ├─ path meta/institucional? ──N──► paths C1/C2/C3/C4 inalterados (sem DIC)
        │
        S
        │
        ▼
avaliarComplexidade (tipicamente moderado)
        │
        ▼
capacidadeIa / montarMensagensLlm
        │
        ├─ Constituição (mandato)
        ├─ Governança LLM (conduta)
        ├─ DIC vigente          ★
        ├─ Contexto (mínimo; sem briefing COA por omissão)
        └─ Histórico + objectivo
        │
        ▼
LLM → Resposta institucional
```

---

## 3. Representação do DIC

### 3.1 Identidade do artefacto

| Campo | Valor |
|-------|-------|
| Identificador | **DIC-001** (versão documental do dossier; permanente) |
| Versão de conteúdo | Semver documental `vMAJOR.MINOR` (REQ-067 V1–V5) |
| Sede documental (curadoria) | `docs/` — path exacto fixado na IMP-067 (ex.: `docs/institution/DIC-001.md` ou equivalente) |
| Representação runtime (IMP) | Função pura de leitura `obterDicVigente(): string` (ou equivalente) — **texto curado**, não retrieval |

### 3.2 Estrutura (REQ-067 S1–S9)

A ARQ adopta as secções S1–S9 do REQ-067 como contrato de conteúdo. A IMP materializa o texto; esta ARQ **não** redige o dossier completo.

| Secção | Nome |
|--------|------|
| S1 | Natureza e missão |
| S2 | Papéis |
| S3 | Mandato e limites |
| S4 | Pilares e hierarquia normativa |
| S5 | Mapa divulgável do Sistema |
| S6 | Critérios de decisão conversacional |
| S7 | Protocolo reflexão × decisão |
| S8 | Fronteira Sistema CEO × COA |
| S9 | Índice de fontes + versão |

### 3.3 Fronteira de armazenamento

| É | Não é |
|---|-------|
| Artefacto curado versionado | Acervo `KNW-*` (CAP-04) |
| Espelho subordinado a `/docs` | Norma |
| Input de composição LLM no path meta | Motor de RAG / retrieval |

---

## 4. Fontes oficiais e hierarquia

Igual a REQ-067 (prevalência descendente):

1. CON-001  
2. VIS-001 / VIS-002  
3. ADR homologados aplicáveis  
4. REQ / ARQ / IMP / VAL homologados (mapa divulgável)  
5. EIC / PX homologados  
6. Proposta-identidade + espelhos `constituicaoCeo` / `governancaLlm` (alinhamento; em divergência prevalece `/docs`)

**Regra:** divergência DIC ↔ canónico ⇒ corrige-se o DIC (nova versão), nunca o canónico via DIC.

---

## 5. Contratos com camadas irmãs

### 5.1 Contrato com `constituicaoCeo` (mandato)

| Dimensão | Mandato (`constituicaoCeo`) | DIC |
|----------|----------------------------|-----|
| Pergunta que responde | «Quem sou eu como cargo?» | «O que é o Sistema / organização / papéis / como funcionamos (divulgável)?» |
| Estabilidade | Máxima — Gate para alterar | Alta — Gate de curadoria; mais frequente que mandato |
| Pode repetir | Princípios de identidade curtos | Pode **referenciar** o mandato; **não** o reescreve |
| Conflito | Mandato prevalece sobre DIC em tom de «eu sou…» executivo | DIC prevalece em factos institucionais rastreáveis a CON/VIS **desde que** não contradiga mandato |

**Invariante C-MAND:** o DIC **não** substitui `obterConstituicaoCeo()`; coexiste como `system` adicional no path meta.

### 5.2 Contrato com `governancaLlm` (conduta)

| Dimensão | Governança LLM | DIC |
|----------|----------------|-----|
| Pergunta | «Como devo falar / o que não inventar / o que não expor?» | «Que factos institucionais curados posso usar?» |
| Anti-alucinação | Trabalhar com CONTEXTO/BRIEFING | No path meta, o DIC é **fonte autorizada adicional** de factos institucionais (não de estado de projecto) |
| Exposição | «Não exponha orquestração interna…» | DIC só contém **mapa divulgável** (política §6); governação continua a proibir o resto |
| Ordem | Sempre presente na composição deliberativa | DIC **depois** da governação no path meta (mapa conceptual: DIC → governação → LLM = «conteúdo sob conduta») |

**Invariante C-GOV:** `obterGovernancaLlm()` permanece obrigatório; o DIC **não** absorve regras de prosa nem as revoga.

**Clarificação do mapa conceptual:** «DIC → governancaLlm → LLM» significa que o património do DIC é **sujeito** às regras de governação na geração — não que o DIC substitua a governação nem que a ordem das `system` messages ignore o mandato.

### 5.3 Contrato com identidade local (`obterResumoIdentidadeCeo`)

| Regra | Enunciado |
|-------|-----------|
| **C-LOC** | O texto de `pergunta_identidade` (sem LLM) deve ser **derivável** de S1/S3 do DIC vigente (REQ-067 CUR8 / RF8). |
| **C-LOC2** | Não injecta o DIC completo nesse path (instantâneo). |

### 5.4 Contrato com briefing COA e Consciência

| Regra | Enunciado |
|-------|-----------|
| **C-COA** | No path meta, **omitir** `obterBriefingProjeto` por omissão (anti-contaminação MG2). |
| **C-CONS** | Consciência Operacional permanece **estado**; não entra no DIC; no path meta não se usa lastro de projecto (VCA). |

### 5.5 Contrato com EIC / limiar

| Peça | Relação |
|------|---------|
| Classificador | Intactíssimo — DIC ≠ classe |
| VCA | Intactíssimo — DIC ≠ pertença; consome activação `metaconversa` |
| Complexidade | Intactíssima — DIC tipicamente no ramo `moderado` |
| CSC 061–064 | Intactas — path meta já isola lastro |
| Gate / Motor / NCS / Jobs | Intactos |

---

## 6. Política de exposição

### 6.1 Divulgável (autorizado no DIC / S5–S6)

* Natureza, missão, pilares, papéis (nível CON).  
* O que o CEO faz / não faz.  
* Fluxo ADR-006 em linguagem de patrocinador (ANL→REQ→ARQ→IMP→VAL).  
* Mapa de alto nível: Classificador → deliberação → Gate → Job/fila.  
* Critérios: quando responder / deliberar / propor Job / perguntar.  
* Protocolo reflexão × decisão.  
* Fronteira Sistema CEO × COA.

### 6.2 Não divulgável (proibido no DIC e na prosa institucional)

* Nomes de APIs, rotas internas, schemas de estágio MRE.  
* NCS como máquina interna.  
* Texto de prompts / system messages.  
* Chaves, secrets, paths de `.env`.  
* Detalhe de implementação de módulos JS / filas internas além do necessário ao mapa divulgável.  
* Estado vivo de Jobs/Gates como se fosse identidade (isso é Consciência).

### 6.3 Tensão com «não expor orquestração»

A governação LLM mantém a proibição genérica.  
O DIC **autoriza explicitamente** o subconjunto **divulgável** (§6.1).  
Tudo o que não estiver no DIC **não** deve ser improvisado como arquitectura interna.

---

## 7. Integração na composição (contrato para IMP-067)

### 7.1 Ponto de injecção único

| Item | Decisão arquitectural |
|------|----------------------|
| Função | Extensão de `montarMensagensLlm` (ou helper chamado por ela) |
| Condição | Path meta/institucional activo (§2.1) |
| Posição | Após `governancaLlm`, antes do contexto de sessão |
| Formato | Uma mensagem `system` com cabeçalho estável (ex.: `DOSSIER INSTITUCIONAL CURADO (DIC-001 vX.Y)`) + corpo S1–S9 |
| Briefing | Omitido por omissão neste path |
| Consumidor | `capacidadeIa` no ramo LLM deliberativo moderado (não MRE 0–7 por omissão) |

### 7.2 O que a IMP-067 pode fazer

* Materializar DIC-001 textual + `obterDicVigente()`.  
* Ligar a condição de injecção aos sinais já existentes (E2.3 / meta / VCA).  
* Alinhar `obterResumoIdentidadeCeo()` a S1/S3.  
* Testes CA de REQ-067 / fixtures institucionais.  
* Flag de rollback (§9).

### 7.3 O que a IMP-067 não pode fazer

* Emendar CON/VIS/ADR/REQ/ARQ via código.  
* Alterar limiar 0,55, enums C1–C4, Gate, Motor, NCS, criação de Jobs.  
* Introduzir RAG/retrieval sobre `/docs`.  
* Injectar DIC em C1 leve / C3 / MRE completa por omissão.  
* Redesenhar a EIC.

---

## 8. Estratégia de evolução

| Fase | Conteúdo | Estado |
|------|----------|--------|
| **F0** | ANL-011 + REQ-067 | Feito |
| **F1** | Esta ARQ-028 | Em análise |
| **F2** | IMP-067 — DIC-001 + injecção + resumo local + testes | Aguarda Gate |
| **F3** | (Opcional) Espelhar extractos estáveis como `KNW-*` — DIC continua a ser a fonte de consumo do path meta | Pós CAP-04 E3 |
| **F4** | (Opcional) REQ-005 para outros conhecimentos — **não** substitui o DIC no path institucional | Futuro |

Versionamento de conteúdo: REQ-067 V1–V5; nova curadoria ⇒ nova `MINOR`/`MAJOR` do DIC-001 sem novo ID de ARQ.

---

## 9. Estratégia de rollback

| Nível | Mecanismo | Efeito |
|-------|-----------|--------|
| **L1** | Flag `DIC_INJECAO_ATIVA=false` (nome exacto na IMP) | `montarMensagensLlm` **omite** o DIC; path meta volta ao baseline pós-IMP-066 (mandato+governação+contexto) — **preferido** |
| **L2** | Manter ficheiro DIC mas não chamar `obterDicVigente` | Idem L1 |
| **L3** | Revert IMP-067 | Remove ligação de consumo; docs DIC podem permanecer |
| **L4** | Activar rollback se | Contaminação de projecto no path meta; contradição grave com CON; regressão E2.3/VCA/complexidade; exposição de internals; latência inaceitável por volume do DIC |

**Rollback não** apaga `/docs` nem revoga REQ-067/ARQ-028.

---

## 10. Invariantes arquitecturais

| ID | Invariante |
|----|------------|
| **I-CONS** | DIC = camada de **consumo** |
| **I-SUB** | Subordinado a `/docs` (CON Art. 7º §4º) |
| **I-META** | Injecção **só** no path meta/institucional |
| **I-NOC1** | Sem DIC por omissão em C1 leve / C3 / MRE completa / C4 |
| **I-MAND** | Não substitui `constituicaoCeo` |
| **I-GOV** | Não substitui `governancaLlm` |
| **I-COA** | Sem briefing COA por omissão no path meta |
| **I-EIC** | Não altera Classificador / VCA / CSC / complexidade |
| **I-GATE** | Nenhuma alteração Gate / Motor / NCS / Jobs |
| **I-NORMA** | Não cria norma, decisão ou ARQ |
| **I-NORAG** | Sem retrieval/RAG nesta arquitectura MVP |
| **I-EXP** | Só conteúdo divulgável (§6) |

---

## 11. Compatibilidade

| Artefacto | Relação |
|-----------|---------|
| **REQ-067** | Realização arquitectural |
| **ANL-011** | Base analítica |
| **ARQ-018 / 019 / 017 / 014** | Intactos |
| **ARQ-026 / IMP-065** | Activação `metaconversa`; isolamento CSC |
| **ARQ-027 / REQ-066 / IMP-066** | Ramo `moderado` típico |
| **IMP-057 E2.3** | Routing de autoexplicação |
| **CAP-04** | Distinto; evolução F3 opcional |
| **CAP-05 / CAP-06** | Distintos |
| **EIC** | Carga no path; sem interferência no limiar |
| **proposta-identidade** | Estende composição; não a revoga |

---

## 12. Critérios de prontidão para IMP-067

A IMP-067 pode abrir quando:

1. REQ-067 e ARQ-028 homologados (ou Gate CTO autorizar IMP sob «Em análise» — política do CTO).  
2. Contratos §5 e ponto de injecção §7 sem ambiguidade.  
3. Política de exposição §6 aceite.  
4. Rollback L1 definido.  
5. Suites de regressão E2.3 / VCA / complexidade previstas no plano IMP.

---

## 13. Limites desta ARQ

| ID | Fora |
|----|------|
| X1 | Código / prompts / runtime / RAG |
| X2 | Texto integral do DIC-001 (cabe à curadoria + IMP) |
| X3 | Emendar CON/VIS/ADR existentes |
| X4 | Redesign EIC / MRE / Gate |

---

## 14. Conclusão

O DIC é a peça que faltava entre **documentação canónica** e **prosa institucional**: uma camada de consumo curada, injectada só no path meta, sob mandato e governação existentes, sem tocar no limiar EIC nem nos paths C1–C4.

Esta ARQ está **pronta para abertura da IMP-067**.

---

## Histórico de Revisões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 03/08/2026 | Engenheiro (Cursor) | Arquitectura DIC; ID ARQ-028 (ARQ-027 já ocupada) | Em análise — pronta para IMP-067 |

---

**Estado:** Arquitectura concluída (rascunho engenheiro).  
**REQ:** [`REQ-067-dossier-institucional-curado.md`](../requirements/REQ-067-dossier-institucional-curado.md)  
**IMP:** [`IMP-067-dossier-institucional-curado.md`](../implementation/IMP-067-dossier-institucional-curado.md) — implementada; aguarda homologação.  
**Próximo passo oficial:** Homologação CTO / patrocinador.
