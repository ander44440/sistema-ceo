# ARQ-034 (PROPOSTA) — Invocador C3 de produção (acto interno Node)

> **Status: PROPOSTA / AGUARDA HOMOLOGAÇÃO** (CTO + Usuário).  
> **Não é:** IMP; VAL; código; deploy; execução em produção; lastro C3 real.  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-034. **Versão proposta:** **1.0**.  
> **Capacidade:** **CAP-13 — Memória de Evolução do Produto** (CAP-E; ADR-020).  
> Norma superior: CON-001; ADR-006; ADR-010; ADR-015; ADR-020; VIS-009 Homologada v1.1; REQ-085 Homologado v1.1; **ARQ-033 v1.1 Homologada** (acto C3); **ARQ-033 v1.2 Homologada** (transporte + sede); IMP-072…075; VAL-075…077.  
> **Finalidade:** desenhar o mecanismo oficial pelo qual o processo Node da sede (`ceo-api`) executa `proporEvolucaoDesidentificada(...)` contra o store canónico de produção — sem endpoint público, sem POST, sem formulário, sem browser no domínio C3.  
> **Este ficheiro:** proposta normativa. **Não altera** código funcional. **Não** substitui ARQ-033 até homologação desta ARQ e IMP subsequente.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Desenho do **invocador interno controlado** do acto C3 em produção: ponte Node → boot IMP-073 → `proporEvolucaoDesidentificada` → store `/data/mep-ceo/store`, sem superfície HTTP de escrita. |
| **Por que existe?** | Transporte (IMP-075 / VAL-077) e sede (ARQ-033 v1.2) estão vivos; GET devolve `[]`. O contrato C3 existe (`c3.js`), mas **não há** mecanismo homologado para o processo executivo Node criar o primeiro lastro em produção. Sem invocador, a CAP-13 permanece perceptível mas sem lastro. |
| **Para quem existe?** | CTO (homologação); Engenheiro (IMP futura); Usuário (lastro legítimo no Centro); CEO-agente (uso futuro **só** via este canal, sem promoção). |
| **Como medir sucesso?** | (1) Um único caminho Node oficial para o acto; (2) zero POST/formulário/botão; (3) C1/C2/C3/IMP-073/transporte GET intactos; (4) auditoria mínima da invocação; (5) impossível promover maturidade por este canal. |

---

## 1. Objetivo

Definir a arquitectura do **Invocador C3 de produção** que permite ao processo Node da sede executar:

```text
proporEvolucaoDesidentificada(acto)
```

contra o store canónico:

```text
{CEO_DATA_ROOT}/mep-ceo/store   →   produção: /data/mep-ceo/store
```

preservando exactamente o contrato C3 já homologado (ARQ-033 §7 / IMP-074).

**Fora deste documento:** implementar; criar lastro; abrir HTTP de escrita; ligar Conversa/Motor/MRE.

---

## 2. Estado de fronteira (diagnóstico)

| Peça | Estado |
|------|--------|
| ARQ-033 v1.2 | Homologada — transporte GET + sede `/data/mep-ceo/store` |
| IMP-075 / VAL-077 | Implementada / 12/12 PASS |
| `GET /api/ceo/mep/c3/propostas` | 200 → `[]` (esperado sem lastro) |
| `proporEvolucaoDesidentificada` | Existe em `app/src/mepCeo/c3.js` |
| Superfície pública `mepCeo/index.js` | **Não** exporta C3 (invariante IMP-072) |
| Boot leitura | `server/src/services/mepC3Vista.js` → `garantirBootMep` + `inicializarPersistenciaFisica` |
| Invocador de produção | **Não existe** |
| Uso actual do acto | Apenas **testes** (`c3.test.js`, `mepC3Vista.test.js`) |

Lacuna normativa explícita na ARQ-033 v1.2 §5.2:

> O acto permanece operação **interna** Node (testes / invocador interno / IMP futura). **Fora** do GET.

---

## 3. Fronteira (o que o invocador é / não é)

### 3.1 É

| Atributo | Norma |
|----------|--------|
| Interno | Só processo Node da sede (`ceo-api`) ou ferramenta operacional que **só** chama esse processo interno |
| Controlado | Entrada fechada; pré-validações; fail-closed; sem criação arbitrária de tipos |
| Node-only | Sem import no browser; sem bundle SPA |
| MEP canónico | Chama `c3.js` + C2 via contrato existente; **não** duplica domínio |
| Store canónico | Mesmo path do transporte: `join(CEO_DATA_ROOT, 'mep-ceo', 'store')` |
| Escrita mínima | Apenas o salto `— → CONCEBIDO` / hipótese que C2 já realiza |

### 3.2 Não é

| Proibido | Motivo |
|----------|--------|
| Endpoint POST / rota HTTP de escrita | Viola ARQ-033 v1.2 (transporte ≠ domínio; escrita fora) |
| Formulário / botão / UI de criação | ARQ-033 §7.7 / CA-085 |
| Script ad hoc «só para popular produção» | Vira workaround; sem contrato nem auditoria |
| Duplicação de C3 / MEP / store paralelo | Contamina CAP-13 |
| Alteração de `c3.js`, C1, C2, `adapterFs`, GET | Fora do recorte |
| Promoção / alteração de maturidade | C3 não chama `promoverMaturidade` |
| Ingestão por Conversa / Motor / MRE / EIC / fila | Não-integração ARQ-033 §7.8 |

---

## 4. Onde deve viver (investigação)

| Candidato | Papel | Veredicto |
|-----------|-------|-----------|
| `app/src/mepCeo/c3.js` | **Contrato do acto** (já existe) | **Não** é o invocador — permanece domínio puro |
| `app/src/mepCeo/index.js` | Superfície C1+C2 | **Não** exportar C3 (invariante mantida) |
| `server/src/services/mepC3Vista.js` | Transporte **leitura** + boot partilhado | **Reutilizar** boot/path; **não** misturar escrita na rota GET |
| `server/src/services/` (novo módulo irmão) | Fachada Node da sede | **Sede recomendada do invocador** |
| `server/src/routes/` | HTTP | **Proibido** para o acto |
| `app/scripts/*` | Smokes/lab | Úteis em lab; **não** oficiais de produção |
| Motor / MRE / conversa | Fluxo executivo cognitivo | **Fora** (§7.8) neste ciclo |

**Conclusão de colocação:** o invocador é uma **fachada de sede** em `server/src/services/` (ex. nome lógico `mepC3Invocador`), que:

1. garante boot no path canónico (reuso de `resolverDirectorioStoreMep` / `garantirBootMep` ou extracção partilhada mínima **sem** alterar o contrato GET);
2. importa `proporEvolucaoDesidentificada` de `app/src/mepCeo/c3.js`;
3. **não** cria rota HTTP;
4. **não** altera `c3.js`.

O domínio continua em `mepCeo`; a sede operacional continua em `server` — simétrico ao transporte IMP-075.

---

## 5. Opções avaliadas

### A) Serviço interno Node reutilizável

**Descrição:** módulo `server/src/services/…` exporta função(ões) Node, ex. `executarActoC3(acto, contextoControlo)`. Processo `ceo-api` (ou CLI que importa o mesmo módulo no mesmo runtime de dados) chama a função após boot.

| Critério | Avaliação |
|----------|-----------|
| Segurança | Alta — sem superfície HTTP de escrita |
| Isolamento | Alto — browser e SPA não tocam no módulo |
| Rastreabilidade | Boa — pode emitir registo de invocação + MEV C2 já existente |
| Facilidade de teste | Alta — unit/integration no server, espelho dos testes actuais |
| Adequação ao CEO | Alta — sede Railway já é o processo canónico |
| Risco workaround | Baixo se **não** houver rota e a entrada for fechada |
| Impacto C1/C2/C3/IMP-073 | Nulo no contrato se só chamar APIs existentes |

### B) Comando / CLI administrativo controlado

**Descrição:** binário/`node` script operacional (ex. `railway run` / entrada admin) que monta o acto e chama o serviço A.

| Critério | Avaliação |
|----------|-----------|
| Segurança | Média–alta **se** gated (env, papel, dry-run, confirmação) |
| Isolamento | Bom — fora do browser; risco se o script for copiado como «atalho» |
| Rastreabilidade | Depende de obrigar auditoria no serviço A |
| Facilidade de teste | Média — precisa harness de CLI |
| Adequação ao CEO | Boa para **primeiro lastro operacional** e ops controladas |
| Risco workaround | **Alto** se o CLI for o único desenho (vira script ad hoc) |
| Impacto contratos | Nulo se for só adaptador fino sobre A |

### C) Chamada directa pelo fluxo executivo existente (Motor / MRE / Conversa)

**Descrição:** classificador/Motor/despacho cria objecto C3 a partir de mensagem do utilizador.

| Critério | Avaliação |
|----------|-----------|
| Segurança | Baixa neste ciclo — mistura eixos organização/produto |
| Isolamento | Violação explícita de ARQ-033 §7.8 |
| Rastreabilidade | Ambígua (origem conversacional) |
| Facilidade de teste | Enganosa — parece «integrado» |
| Adequação ao CEO | Prematura — CEO ainda não tem mandato de promover produto |
| Risco workaround | **Muito alto** — vira ingestão conversacional |
| Impacto contratos | Alto — reabre fronteira C3 |

**Veredicto:** **fora** desta ARQ-034 (e da ARQ-033 vigente).

### D) Alternativas já existentes no CEO

| Alternativa | Porquê rejeitar como oficial |
|-------------|------------------------------|
| Testes Node que chamam `proporEvolucaoDesidentificada` | Lab only; não escrevem no volume de produção |
| `app/scripts/smoke-*.mjs` | Validação local; não sede |
| Plugin Vite / snapshot de build | Já abandonado pela v1.2 / IMP-075 |
| Fila de Jobs (`executive/queue`) | Canal de despacho de engenharia, não acto MEP de produto |
| `railway ssh` + REPL manual | Operação emergencial; **não** arquitectura |

**Veredicto:** úteis como contexto; **não** substituem o invocador.

---

## 6. Opção recomendada

**Composição A + B(fino):**

1. **Núcleo (obrigatório):** serviço interno Node na sede (`server/src/services/…`) — **Opção A**.  
2. **Adaptador operacional (opcional na IMP):** CLI/admin **apenas** como cliente do núcleo — **Opção B**, sem lógica de domínio própria.  
3. **Opção C:** rejeitada neste ciclo.  
4. **Opção D:** não oficial.

### 6.1 Porquê

- Alinha-se à frase canónica «invocador interno no mesmo processo da sede».
- Reutiliza o boot já desenhado para a vista (`garantirBootMep` / path `/data/mep-ceo/store`).
- Não duplica MEP: uma chamada a `proporEvolucaoDesidentificada`.
- Impede que o GET de transporte vire escrita.
- Permite primeiro lastro controlado **sem** POST público.
- Deixa o CEO-agente futuro usar o **mesmo** núcleo com `papel: "ceo_agente"`, ainda sem promoção.

### 6.2 Nome lógico proposto

| Peça | Nome lógico |
|------|-------------|
| Núcleo | `executarActoC3Producao` (ou `invocarPropostaC3`) |
| Contrato de domínio (inalterado) | `proporEvolucaoDesidentificada` |
| Transporte leitura (inalterado) | `obterVistaPropostasC3` / `GET …/propostas` |

---

## 7. Contrato de entrada do invocador

O invocador **não** redefine o acto. A entrada de domínio é **exactamente** ARQ-033 §7.2 / `CAMPOS_ACTO_C3`:

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| `papel` | Sim | `usuario` \| `cto` \| `ceo_agente` \| `engenheiro` |
| `tipoLacunaProduto` | Sim | texto curto de produto |
| `objectoCandidato` | Sim | `MCP` \| `EPC` \| `MDL` |
| `enunciadoDesidentificado` | Sim | hipótese desidentificada |
| `evidenciaNaoPrivada` | Sim | apontador VIS/REQ/ARQ/IMP/VAL/ADR/ANL ou «padrão observado» |

**Campos proibidos na entrada:** qualquer chave extra (incl. `maturidade`, `origemCanal`, `transcript`, IDs de organização, payload privado). O invocador **recusa** antes de chamar C3 se houver extras — defesa em profundidade; C3 já recusa.

### 7.1 Contexto de controlo (meta, não domínio)

Além do acto, o invocador exige um **contexto de controlo** (não persistido como payload de produto):

| Campo meta | Obrigatório | Função |
|------------|-------------|--------|
| `solicitante` | Sim | quem autoriza a invocação operacional (ex. `cto`, `usuario`, `engenheiro-ops`) |
| `motivoOperacional` | Sim | texto curto: «lastro de verificação CAP-13», «proposta CTO …» — **sem** dados de cliente |
| `confirmacaoExplícita` | Sim | flag/boolean verdadeiro; sem isto → recusa |
| `modo` | Sim | `executar` \| `dry-run` (dry-run não grava) |

Estes campos **não** entram em `proporEvolucaoDesidentificada`. Servem só ao gate do invocador e à auditoria.

---

## 8. Fluxo proposto

```text
[Operador autorizado / futuro CEO-agente via núcleo]
        │
        ▼
[Invocador sede — server/src/services]
        │  1. Gate de controlo (solicitante, confirmação, modo)
        │  2. Recusar se contexto HTTP de escrita / request público
        │  3. Validar shape do acto (só CAMPOS_ACTO_C3)
        │  4. garantirBootMep(CEO_DATA_ROOT) → /data/mep-ceo/store
        │     se boot.ok !== true → RECUSA fail-closed (sem objecto)
        │  5. dry-run? → devolver pré-validação sem gravar
        │  6. proporEvolucaoDesidentificada(acto)   ← contrato intacto
        │  7. Auditar resultado (ok/recusa, id se ok, motivo)
        │
        ▼
[C2 + IMP-073]  → objecto CONCEBIDO / hipótese / origemCanal=C3
        │
        ▼
[Transporte GET já existente] → Centro mostra 4 campos
```

### 8.1 Inicialização da persistência

- Path: `resolverDirectorioStoreMep(CEO_DATA_ROOT)` → produção `/data/mep-ceo/store`.
- Chamada: `inicializarPersistenciaFisica(dir)` via `garantirBootMep` (já usado pela vista).
- **Mesma sede** que o GET; **sem** segundo store; **sem** `executive/` como path MEP.

### 8.2 Garantias herdadas de C3 (não reimplementar)

| Garantia | Onde nasce |
|----------|------------|
| `maturidade = CONCEBIDO` | C2 `criarObjecto` — C3 nunca passa `maturidade` |
| `origemCanal = "C3"` | C3 escreve no payload |
| Desidentificação / matriz negativa | C3 + C1 dentro de `criarObjecto` |
| Sem transcript / dados privados | Recusa C3 (`conteudo_proibido` / isolamento) |
| Fail-closed | Recusa sem objecto; invocador propaga `ok: false` |

O invocador **não** promove, **não** chama `promoverMaturidade`, **não** altera tipos fora de `{MCP,EPC,MDL}`.

---

## 9. Segurança e isolamento

| Controlo | Norma |
|----------|--------|
| Sem rota HTTP de acto | Nenhuma `POST` / `PUT` / `PATCH` MEP-C3 |
| Sem export no `index.js` do mepCeo | Browser continua sem C3 |
| Gate de confirmação | `confirmacaoExplícita` obrigatória |
| Dry-run | Obrigatório no desenho; default seguro = dry-run ou recusa |
| Um objecto por invocação | Sem lote; sem «seed» em massa |
| Path canónico | Recusar se boot apontar para path não-sede em produção (quando detectável) |
| Separação leitura/escrita | `mepC3Vista` = leitura; invocador = escrita; sem misturar na rota GET |
| Alçada | Invocador **não** aumenta alçada MEP; papel do acto continua o de RF-05 |

### 9.1 Como impedir que vire API pública ou criação arbitrária

1. **Proibição normativa:** ARQ-034 + ARQ-033 — escrita HTTP = fora.  
2. **Proibição de implementação:** IMP futura não cria route handler para o acto.  
3. **Entrada fechada:** só cinco campos de domínio + meta de controlo.  
4. **Sem UI:** Centro permanece só-leitura.  
5. **Sem job genérico** «criar objecto MEP» na fila.  
6. **Teste de fronteira:** suite deve falhar se aparecer POST C3 no `app.js` / routes.

---

## 10. Auditoria e rastreabilidade

Camadas (mínimo):

| Camada | Conteúdo | Onde |
|--------|----------|------|
| **MEV C2** (já existe) | Evento de criação CONCEBIDO / hipótese | Store IMP-073 (log append-only vigente) |
| **Registo do invocador** | timestamp; solicitante; motivoOperacional; `ok`; `id` ou `motivo` de recusa; hash/resumo dos quatro campos de domínio (**sem** copiar transcript) | Ficheiro de auditoria sob a sede MEP (ex. irmão do store) **ou** linha estruturada no log de processo — a IMP escolhe **um** sítio, sem segundo catálogo de objectos |
| **Não auditar** | Conteúdo de cliente; conversas; secrets |

Rastreio CAP-13: evidência de produto (`evidenciaNaoPrivada`) continua no acto; o invocador não a substitui.

---

## 11. Uso legítimo futuro pelo CEO (sem promoção)

| Permitido | Negado |
|-----------|--------|
| CEO-agente chama o **mesmo** núcleo com `papel: "ceo_agente"` | Promover maturidade |
| Propor hipótese CONCEBIDO desidentificada | Alterar baseline / facto |
| Ver resultado no Centro via GET | Criar via Conversa como atalho |
| Ser auditado como solicitante/papel | Expor acto ao browser |

Princípio: o CEO **propõe evolução de produto** no eixo CAP-13; **não** governa promoção nem decide maturidade superior por este canal. Promoção permanece alçada humana/CTO conforme ARQ-033 / RF vigentes.

---

## 12. Testes necessários (IMP/VAL futuras — não neste acto)

| ID | Caso | Esperado |
|----|------|----------|
| T1 | Boot OK + acto válido | `ok: true`; objecto CONCEBIDO; `origemCanal=C3` |
| T2 | Campo extra no acto | recusa invocador ou C3; zero objecto |
| T3 | Conteúdo proibido / transcript | recusa; zero objecto |
| T4 | Boot falhado | recusa fail-closed; store intacto |
| T5 | Sem `confirmacaoExplícita` | recusa no gate |
| T6 | `dry-run` | não persiste; GET continua sem novo id |
| T7 | Regressão GET | payload só 4 campos; sem `origemCanal` no fio |
| T8 | Regressão C1/C2/C3 unitários | intactos |
| T9 | Fronteira HTTP | nenhuma rota de escrita C3 registada |
| T10 | Bundle SPA | sem `proporEvolucao` / `adapterFs` |

---

## 13. Impacto nos contratos existentes

| Artefacto | Impacto desta proposta |
|-----------|------------------------|
| C1 / isolamento | Nenhum (continua dentro de `criarObjecto`) |
| C2 / registo | Nenhum (continua a única escrita) |
| C3 / `c3.js` | Nenhum (chamado, não alterado) |
| IMP-073 / adapterFs | Nenhum (boot canónico reutilizado) |
| IMP-075 / GET | Nenhum (leitura continua independente) |
| UI Centro | Nenhum código; passa a mostrar lastro **depois** da IMP do invocador + execução autorizada |
| Motor / MRE / Conversa | Continuam **fora** |

---

## 14. Relação com ARQ-033 v1.2

| Tema v1.2 | Relação ARQ-034 |
|-----------|-----------------|
| Transporte GET | Conservado; invocador **não** o estende a escrita |
| Sede `/data/mep-ceo/store` | Conservada; invocador grava **só** aí |
| Acto interno / invocador futuro | **Esta ARQ** materializa o desenho desse invocador |
| P10–P12 | Mantidos; escrita continua fora do browser |
| «IMP futura» do acto | Passa a depender de homologação ARQ-034 → IMP-xxx |

ARQ-034 é **complementar**, não emenda destrutiva da v1.2.

---

## 15. Relação com CAP-13

| Marco CAP-13 | Estado face a esta proposta |
|--------------|-----------------------------|
| Memória de evolução (VIS-009 / REQ-085) | Continua |
| Percepção no Centro | Já possível (vazio) |
| Lastro real | **Bloqueado** até IMP do invocador + execução autorizada |
| Isolamento produto vs organização | Reforçado pelo gate do invocador |

Filtro ADR-015: o invocador aproxima o uso diário ao tornar a CAP-13 **visível com lastro real**, sem burocracia de rebuild e sem contaminar o eixo cliente.

---

## 16. Próximos passos (após homologação — não executar agora)

1. Homologar **ARQ-034** (CTO + Usuário).  
2. Abrir **IMP** do invocador (núcleo A; CLI B opcional na mesma IMP ou IMP seguinte).  
3. **VAL** com matriz T1–T10.  
4. Só então: acto operacional controlado do **primeiro lastro** em produção (despacho separado; sem POST; sem formulário).  
5. Verificar GET + Centro com um objecto de 4 campos.

**Explicitamente agora:** sem commit obrigatório deste desenho além do ficheiro de proposta; sem push/PR/deploy; sem execução em produção.

---

## 17. Decisão pedida ao CTO / Usuário

Homologar ou devolver:

- **Recomendação:** Opção **A (núcleo)** + **B (CLI fino opcional)**; **C fora**; **D não oficial**.  
- **Colocação:** `server/src/services/` irmão do transporte; domínio em `c3.js` intacto.  
- **Entrada:** acto C3 fechado + contexto de controlo.  
- **Proibições:** POST, formulário, Conversa/Motor como canal, alteração de C1/C2/C3/IMP-073/GET.

---

## 18. Registo desta proposta

| Campo | Valor |
|-------|--------|
| ID | ARQ-034 |
| Versão | 1.0 (proposta) |
| Status | **PROPOSTA / AGUARDA HOMOLOGAÇÃO** |
| Data | 16/08/2026 |
| Código funcional alterado | **Não** |
| Lastro C3 criado | **Não** |
| Commit / push / PR / deploy | **Não** (neste acto) |

**PARAR.**
