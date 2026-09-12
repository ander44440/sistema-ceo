# ARQ-087 — Histórico Físico das Conversas

> **Status: Homologada — v1.0 (11/09/2026).** 1ª fatia IMPLEMENTADA · VALIDADA · HOMOLOGADA (IMP-087 / VAL-087).  
> **Versão:** 1.0 — 11/09/2026  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-087.  
> **Capacidade:** CAP-03 — Gestão de Projetos (arquivo físico da conversa por COA).  
> Norma superior: CON-001 Art. 9º princípios 2 e 8; ADR-006; ADR-010; ADR-015; CAP-001 (CAP-03); **REQ-087 v1.0 Homologado**; REQ-037/038/039; REQ-041 (lastro); REQ-086 (**não** emendar — HFC fora da V1 de consulta).  
> Base: REQ-087; diagnóstico técnico da frente; especificação técnica da primeira fatia.  
> **Finalidade:** arquitectura **mínima e segura** da 1ª fatia do Histórico Físico das Conversas (HFC): store separado JSONL append-only, gravação no momento de durabilidade da mensagem, fail-soft face ao transcript F5-C3.  
> **Gate ARQ:** fechado (homologada). **Entrega:** IMP-087 / VAL-087.  
> **Limites vigentes:** sem leitor; sem busca; sem recuperação; sem backfill; sem correlação MO/Trilha; sem eventos de correcção. F5–F8, Trilha, CAP-13/C3 e REQ-086 inalterados.  
> **Proibições deste documento (como artefacto ARQ):** não reabrir fatia encerrada neste texto; não iniciar próxima capacidade.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Arquitectura do arquivo físico append-only de mensagens conversacionais duráveis, paralelo ao transcript UI (F5-C3), isolado de MO, Trilha e MEP. |
| **Por que existe?** | REQ-087 exige preservação física íntegra; F5-C3 é mutável/local e não cumpre append-only; fontes vizinhas têm ontologias distintas. |
| **Para quem existe?** | Patrocinador (não perder o rastro conversacional); Engenheiro (IMP futura); CTO (homologação). |
| **Como medir sucesso?** | CA-087-1…8 e RI-087-1…8 do REQ-087 verificáveis; invariantes I1–I12 abaixo; zero regressão F5-C3 / F8 / Trilha / CAP-13. |

---

## 1. Princípios e invariantes (1ª fatia)

| ID | Invariante |
|----|------------|
| **I1** | **HFC ≠ F5-C3** — transcript UI permanece mutável e dono da experiência; HFC é sombra física append-only. |
| **I2** | **HFC ≠ Memória Confiável** — zero escrita/leitura obrigatória no ledger MO; payload sem campos Art. 8º. |
| **I3** | **HFC ≠ Trilha Auditável** — store, módulo e endpoint distintos; sem reutilizar `executive/audit/`. |
| **I4** | **HFC ≠ MEP/CAP-13/C3** — zero objectos de produto no HFC; zero conversas na MEP. |
| **I5** | **Append-only** — só acrescentar linhas; apagar/actualizar/compactar o histórico físico = recusa. |
| **I6** | **Imutabilidade** — após append bem-sucedido, o registo dessa `msgId` não muda; correcções in-place na UI **não** reescrevem o HFC (1ª fatia). |
| **I7** | **Só duráveis** — `pronta` \| `erro`; nunca `pendente`. |
| **I8** | **Idempotência por `msgId`** — no máximo um registo físico por mensagem. |
| **I9** | **Isolamento por COA** — cada registo carrega `coaId` (ou `__sem_coa__`); sem fusão semântica. |
| **I10** | **Fail-soft** — falha HFC não reverte nem bloqueia F5-C3 nem o fluxo conversacional. |
| **I11** | **Sobrevivência** — `limparHistorico` / limpeza do bucket UI **não** toca o HFC. |
| **I12** | **Preservação de frentes** — F5, F6, F7, F8, Trilha e CAP-13/C3 **inalterados** nos seus contratos; REQ-086 **inalterado** (continua a consumir F5-C3 + MO na V1 de consulta). |

---

## 2. Visão arquitectural

### 2.1 O que esta ARQ não é

* Não redesenha o transcript F5-C3, envelope, Gate, AD, classificador, Motor, Fila.  
* Não é consulta de discussões (REQ-086 / ARQ-086).  
* Não é Trilha de execução nem ledger de decisões.  
* Não introduz leitor de produto, UI, busca, backfill nem correlação mensagem↔MO↔Trilha na 1ª fatia.

### 2.2 Fluxo completo (1ª fatia)

```text
UI / enviarAoNucleo / outros callers
        │
        ▼
┌─────────────────────────────────────┐
| C-STORE — Store conversacional      |  acrescentarMensagem /
| (app/src/modules/conversa/store)    |  atualizarMensagem
└───────┬─────────────────────┬───────┘
        │                     │
        │ (contrato intacto)  │ se elegível (pronta|erro)
        ▼                     │    e msgId ainda não físico
┌───────────────────┐         │
│ F5-C3 transcript  │         │
│ localStorage      │         │
│ mutável por COA   │         │
└───────────────────┘         ▼
                    ┌─────────────────────┐
                    │ E-HFC — Emissor HFC │  fail-soft;
                    │ (browser / teste)   │  constrói evento
                    └──────────┬──────────┘
                               │ POST (ou adaptador FS em Node)
                               ▼
                    ┌─────────────────────┐
                    │ P-HFC — Ponte HTTP  │  plugin Vite (dev);
                    │ /api/ceo/historico- │  valida + encaminha
                    │ conversas/mensagens │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ S-HFC — Store       │  JSONL append-only
                    │ físico              │  + idempotência + ordem
                    └─────────────────────┘
```

**Ponto único de integração no fluxo conversacional:** efeito colateral em `C-STORE` **após** a mutação do bucket e **sem** alterar `persistenciaChat` / contrato F5-C3.

| Momento | HFC |
|---------|-----|
| `acrescentarMensagem` com `estado !== "pendente"` | Emitir registo |
| `acrescentarMensagem` com `estado === "pendente"` | Silêncio |
| `atualizarMensagem` → resultado `pronta` \| `erro` e `msgId` ainda sem HFC | Emitir registo (texto/papel finais) |
| `atualizarMensagem` de `msgId` já físico | Silêncio (imutalidade) |
| `limparHistorico` / descarte RAM | Silêncio (não apaga HFC) |

---

## 3. Componentes

| ID | Componente | Responsabilidade | Escreve? |
|----|------------|------------------|----------|
| **C-STORE** | Store conversacional existente | Continua a gerir RAM + F5-C3; **único** gancho de elegibilidade HFC (hook mínimo) | F5-C3 (como hoje); dispara E-HFC |
| **F5-C3** | Transcript UI (`ceo.conversa.transcript.v1`) | Persistência local mutável por COA — **contrato intacto** | Sim (UI) |
| **D-HFC** | Domínio HFC | Schema, validação, id de evento, chaves proibidas, regras `pendente`/durável | Não |
| **E-HFC** | Emissor HFC | No browser: POST à ponte; em testes Node: adaptador FS injectável; fail-soft | Via P-HFC / S-HFC |
| **P-HFC** | Ponte HTTP | `POST /api/ceo/historico-conversas/mensagens` → `append` no S-HFC; espelho do padrão Trilha **sem** partilhar código/store da Trilha | Sim (só S-HFC) |
| **S-HFC** | Persistência física | JSONL append-only; atribui `ordem`; recusa update/delete/compact; dedupe por `msgId`/`id` | Sim (só o seu ficheiro) |
| **T-HFC** | Testes (IMP) | Suite mínima da fatia; leitura JSONL **apenas** em testes — não é API de produto | Não (produto) |

**Módulo novo (IMP):** `app/src/historicoFisicoConversas/` (`dominio`, `persistencia`, `emissor`, `index`).  
**Ponte (IMP):** `app/server/historicoFisicoConversasPlugin.js` + registo em `app/vite.config.js`.  
**Delta mínimo em código existente:** hook fail-soft em `app/src/modules/conversa/store.js` apenas.

**Proibido:** partilhar ficheiro/API com Trilha; escrever MO/MEP; criar GET de produto; criar store `consulta.*`.

---

## 4. Local físico e modelo de persistência

### 4.1 Local

| Item | Valor |
|------|--------|
| Directório | `executive/historico-conversas/` |
| Ficheiro | `mensagens.jsonl` |
| Caminho canónico | `executive/historico-conversas/mensagens.jsonl` |
| Relação com Trilha | **Distinto** de `executive/audit/eventos.jsonl` |
| Relação com MEP | **Distinto** do store CAP-13 |

### 4.2 Modelo JSONL append-only

* Uma linha = um objecto JSON = um evento `conversa.mensagem`.  
* Escrita: apenas append de linha (`appendFile` síncrono ou equivalente).  
* Leitura completa do ficheiro: permitida **só** para idempotência no append e para testes; **não** exposta como API de produto na 1ª fatia.  
* Não há reescrita do ficheiro, compactação, truncagem nem delete de linhas.

### 4.3 Infraestrutura admitida (mínima)

* Ponte HTTP local no servidor de desenvolvimento (Vite plugin), no **mesmo padrão operacional** já usado pela Trilha, **sem** alterar a Trilha.  
* Adaptador filesystem directo em testes Node.  
* **Fora desta ARQ:** novos ambientes cloud, multi-região, replicação, ou APIs públicas além do POST mínimo necessário ao browser → disco.

---

## 5. Contrato do registo físico

```ts
{
  schemaVersao: 1,
  tipo: "conversa.mensagem",
  id: string,          // "hfc-" + msgId
  coaId: string,       // COA activo ou "__sem_coa__"
  msgId: string,       // id da Mensagem em C-STORE
  papel: "usuario" | "ceo" | "sistema",
  texto: string,       // texto final; nunca placeholder pendente
  criadoEm: string,    // ISO da mensagem (origem C-STORE)
  registadoEm: string, // ISO do append físico
  estado: "pronta" | "erro",
  ordem: number        // monotónico no S-HFC (atribuído no append)
}
```

### 5.1 Origem dos campos

| Campo | Origem |
|-------|--------|
| `coaId` | Contexto conversacional activo no C-STORE; se ausente → `__sem_coa__` |
| `msgId` | `mensagem.id` (`msg-…`) |
| `papel` / `texto` / `criadoEm` / `estado` | Mensagem no momento da elegibilidade |
| `id` | Derivado: `"hfc-" + msgId` |
| `ordem` | Atribuído exclusivamente por S-HFC no append bem-sucedido |
| `registadoEm` | Relógio do momento do append |

### 5.2 Payload proibido

Recusar (ou strip+falhar) chaves de famílias alheias, entre outras: `mensagens` (array de transcript), `transcript`, campos Art. 8º de decisão, `jobId`/`gateId`/`moRegistroId` como corpo, `mepCeo` / `eventosMep`, `knw`.

---

## 6. Idempotência

1. **Chave primária lógica:** `msgId` (e `id = "hfc-" + msgId`).  
2. Antes do append, S-HFC verifica se já existe linha com o mesmo `id` / `msgId`.  
3. Se existir: **não** escreve segunda linha; retorno idempotente de sucesso (ex.: `{ ok: true, duplicado: true, id }`) para o emissor não reintentar como erro fatal.  
4. E-HFC / C-STORE podem manter Set RAM de `msgId` já emitidos na sessão (optimização); a **verdade** de dedupe é o S-HFC.  
5. **Sem backfill** na 1ª fatia — evita tempestade de duplicados de mensagens pré-HFC.

---

## 7. Ordem

* `ordem`: inteiro monotónico **global ao ficheiro** (1…N), incrementado só em append bem-sucedido.  
* A ordem natural das linhas no JSONL coincide com `ordem`.  
* O `seq` RAM de `C-STORE` **não** é fonte de `ordem` (reinicia).  
* `criadoEm` permanece o instante da mensagem; empates de relógio resolvem-se por `ordem`.

---

## 8. Integridade e imutabilidade

| Mecanismo | Comportamento |
|-----------|----------------|
| Append-only | Só `appendMensagemFisica` / equivalente |
| Update | API `actualizar*` → `{ ok: false, codigo: "historico_append_only" }` |
| Delete | API `apagar*` → mesmo código |
| Compactar | Recusado com o mesmo código |
| Limpeza UI | Não invoca S-HFC |
| Edição posterior no F5-C3 | Não gera segundo evento nem patch do primeiro (limitação 1ª fatia) |

---

## 9. Tratamento de falhas (fail-soft)

| Falha | Efeito em F5-C3 / conversa | Efeito em HFC |
|-------|----------------------------|---------------|
| Ponte HTTP indisponível | Fluxo e transcript **seguem** | Sem linha (perda tolerada na fatia; transparência) |
| Validação de domínio | Fluxo segue | Sem linha |
| Disco / append falhou | Fluxo segue | Sem linha; erro registável em log de diagnóstico se existir |
| Duplicado | Fluxo segue | Sem nova linha (idempotente) |

**Proibido:** lançar excepção não tratada a partir do hook HFC que impeça `gravarBucketChat` ou a resposta ao utilizador.

---

## 10. Isolamento entre stores

```text
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ F5-C3        │  │ HFC          │  │ MO (F8)      │  │ Trilha       │
│ localStorage │  │ JSONL        │  │ localStorage │  │ JSONL audit/ │
│ mutável      │  │ historico-   │  │ decisões     │  │ execução     │
│              │  │ conversas/   │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        ▲                ▲                  ▲                ▲
        │                │                  │                │
   C-STORE           E/P/S-HFC         (inalterado)     (inalterado)

┌──────────────┐
│ MEP CAP-13   │  inalterado; sem ponte para HFC
└──────────────┘
```

* Módulo HFC **não** importa `memoriaConfiavel`, `trilhaAuditavel` nem `mepCeo` (hash/utilitários: cópia local se necessário).  
* REQ-086 / ARQ-086: **inalterados**; F-TX continua a ler F5-C3; HFC **não** entra na V1 de consulta.

---

## 11. Limites da primeira fatia

| Inclui | Exclui |
|--------|--------|
| Gravação de mensagens **novas** duráveis | Leitor/UI/consulta ao HFC |
| POST mínimo browser→disco | GET de produto / API pública ampla |
| Idempotência, ordem, append-only | Backfill do passado F5-C3 |
| Hook mínimo em C-STORE | Refactor de `enviarAoNucleo`, Motor, Gate |
| Testes unitários + integração leve do hook | Correlação automática MO/Trilha |
| Fail-soft | Eventos de correcção de texto |
| | Multi-dispositivo como requisito |
| | Emenda F5–F8, Trilha, CAP-13, REQ-086 |

---

## 12. Estratégia de testes (arquitecturalmente necessária)

A IMP deverá cobrir, no mínimo:

1. **Domínio:** recusa `pendente`; aceita `pronta`/`erro`; payload proibido.  
2. **Persistência:** append cria 1 linha; re-append mesmo `msgId` não duplica; `ordem` crescente.  
3. **Imutabilidade API:** apagar/actualizar/compactar → `historico_append_only`.  
4. **Isolamento COA:** dois `coaId` no mesmo ficheiro, distinguíveis.  
5. **Hook C-STORE (adaptador injectado):** user + placeholder + finalize → 2 eventos HFC; `limparHistorico` não reduz HFC.  
6. **Fail-soft:** adaptador que falha → F5-C3 ainda persiste.  
7. **Negativos de isolamento:** fluxo de mensagem **não** incrementa MO / Trilha / MEP.

Leitura do JSONL nos testes **não** constitui produto. Não exigir E2E browser se o adaptador FS + contrato HTTP estiverem cobertos em unidade.

---

## 13. Evoluções futuras (explicitamente fora da 1ª fatia)

* Leitor / consulta conversacional sobre HFC (possível evolução do consumo hoje feito só via F5-C3 no REQ-086).  
* UI de arquivo, busca, filtros ricos.  
* Backfill controlado do transcript pré-existente.  
* Eventos de correcção / versão de texto.  
* Correlação estrutural mensagem ↔ MO ↔ Trilha.  
* Replicação multi-dispositivo / backend de produção além do padrão já adoptado para pontes locais.  
* Substituição do F5-C3 pelo HFC como fonte de UI (não objectivo desta capacidade na 1ª fatia).

---

## 14. Rastreio aos critérios REQ-087

| CA / RI | Realização arquitectural |
|---------|---------------------------|
| CA-087-1 / RI-087-1 / I7 | Momentos de elegibilidade em C-STORE + D-HFC |
| CA-087-2 / RI-087-2 / RI-087-3 / I5–I6 | S-HFC append-only + APIs de recusa |
| CA-087-3 / RI-087-6 / I8 | Idempotência §6 |
| CA-087-4 / RI-087-7 / I9 | Campo `coaId` + testes isolamento |
| CA-087-5 / RI-087-8 / I11 | Limpeza UI sem chamada a S-HFC |
| CA-087-6 / I10 | Fail-soft §9 |
| CA-087-7 / I2–I4 | Isolamento §10 |
| CA-087-8 / I1 / I12 | Contrato F5-C3 intacto; hook apenas aditivo |
| RI-087-4 | Contrato §5 (`msgId`, `coaId`) |
| RI-087-5 | `ordem` + ordem de linhas §7 |

---

## 15. Relação com artefactos vizinhos

| Artefacto | Relação |
|-----------|---------|
| **REQ-087** | Norma de requisitos; esta ARQ realiza a 1ª fatia |
| **REQ-086 / ARQ-086** | **Não** emendados; HFC continua fora da V1 de consulta |
| **F5-C3 / ARQ-012 (conversa)** | Fornece C-STORE e transcript; contrato preservado |
| **Memória Confiável / F8** | Fronteira negativa; inalterada |
| **Trilha Auditável** | Padrão operacional análogo (JSONL + ponte); store/API **distintos**; inalterada |
| **MEP / CAP-13 / C3** | Fronteira negativa; inalterada |
| **F6 / F7** | Sem pontos de integração; inalterados |
| **JOB-000118** | Intocado; fora desta frente |

---

## 16. Riscos residuais (transparência)

* Fail-soft ⇒ possível mensagem na UI sem linha HFC se a ponte falhar — limitação declarada da 1ª fatia.  
* Divergência UI↔HFC se o texto for editado no F5-C3 após o append — sem evento de correcção nesta fatia.  
* REQ-086 continua limitado ao transcript mutável até eventual evolução de leitura do HFC (fora daqui).

---

## 17. Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 11/09/2026 | Engenheiro (Cursor) | Criação da ARQ mínima da 1ª fatia HFC | REQ-087 + diagnóstico + especificação técnica; sem IMP | Em análise |
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | Homologação pós-VAL-087 / encerramento 1ª fatia | Gate ARQ fechado com IMP homologada | **Homologada** |
