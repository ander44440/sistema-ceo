# ARQ-033 v1.2 — Transporte runtime da vista C3 e sede operacional do store

> **Status: Homologada — v1.2 (CTO + Usuário, 16/08/2026).**  
> Emenda sobre a [`ARQ-033 v1.1 Homologada`](./ARQ-033-fronteira-mep-ceo.md) (C1+C2+C3/UI lógica).  
> Tipo ARQ (ADR-010). **Identificação:** ARQ-033. **Versão:** **1.2**.  
> **Capacidade:** **CAP-13 — Memória de Evolução do Produto** (CAP-E; ADR-020).  
> Norma superior: CON-001; ADR-006; ADR-010; ADR-015; ADR-020; VIS-009 Homologada v1.1; REQ-085 Homologado v1.1; ARQ-033 **v1.1 Homologada** (base); VAL-075; VAL-076; **IMP-075** · **VAL-077**.  
> **Finalidade desta v1.2:** a vista C3 deixa de ser snapshot de build e passa a receber, em **runtime**, a vista real produzida no Node/Railway — sem API pública de produto, sem formulário, sem POST do acto C3, sem ingestão conversacional.  
> **Não é:** API pública; formulário; reabertura de C1/C2/IMP-073; Motor/MRE/EIC/Gate/MTE.  
> **Ficheiro canónico v1.1:** `ARQ-033-fronteira-mep-ceo.md` permanece a base C1+C2+C3/UI; esta emenda acrescenta transporte + sede.

---

## Rastreabilidade

```
CAP-13 (ADR-020)
  → VIS-009 (v1.0 → v1.1 Homologada)
  → REQ-085 (v1.0 → v1.1 Homologado)
  → ARQ-033 v1.0 Homologada (C1+C2)
  → ARQ-033 v1.1 Homologada (C3 + UI lógica Centro)
  → ARQ-033 v1.2 Homologada (este documento: transporte runtime + sede Railway)
  → IMP-075 → VAL-077 Homologada
```

Artefactos de implementação (contexto, **não** reabertos por esta emenda de domínio): IMP-072, IMP-073, IMP-074; VAL-075, VAL-076. Packaging Docker do `ceo-api` (sede Node) é pré-condição operacional.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Emenda de fronteira da MEP-CEO: (1) **canal interno GET** de transporte da vista C3 só-leitura em runtime; (2) **sede operacional** do store IMP-073 em produção no Railway; (3) distinção formal **transporte interno ≠ API pública de produto**. |
| **Por que existe?** | A UI C3 (IMP-074 / VAL-075/076) materializa a vista no `vite build` como snapshot (tipicamente `[]`). Objectos C3 criados após o build não aparecem no Centro. O lastro operacional da CAP-13 exige leitura do estado real **sem** novo build do frontend. |
| **Para quem existe?** | Usuário (lastro no Centro); CTO (homologação); Engenheiro (IMP futura — **não neste acto**). |
| **Como medir sucesso?** | (1) Vista reflecte o store via transporte Node, não o artefacto estático; (2) browser só recebe 4 campos; (3) zero `c3`/`registo`/`persistencia`/`adapterFs` no bundle; (4) C1/C2/IMP-073/contrato C3 intactos; (5) falha de boot/store/transporte → `[]` fail-closed. |

---

## 1. Relação com a ARQ-033 v1.1

A v1.2 **herda integralmente** a v1.1 homologada. Esta emenda **acrescenta e clarifica**; **não** reescreve C1, C2, acto C3, alçadas, isolamento nem o contrato de dados do acto.

| Conservado (v1.1) | Acrescentado / clarificado (v1.2) |
|-------------------|-----------------------------------|
| C1, C2, isolamento, transições, alçadas | Canal interno de **transporte de leitura** da vista C3 |
| Acto C3, quatro campos de entrada, fail-closed, `origemCanal: "C3"` | Distinção **transporte interno** ≠ **API pública de produto** |
| UI Centro só-leitura; filtro CONCEBIDO + origem C3 | **Sede operacional** do store em produção (Railway) |
| Persistência = IMP-073; C3 não chama adapter no browser | Proibição do **snapshot de build** como fonte de verdade da UI |
| Não-integrações Motor/MRE/EIC/CAP-04/05/F1–F3 | Princípios P10–P12; fail-closed de percepção |

**Substituição normativa pontual:** a proibição absoluta «não há API HTTP neste ciclo» (§7.1 da v1.1) é **afrouxada apenas** para o canal definido nesta v1.2 (§3). Todo o resto do §7.1 e do §8.4 da v1.1 permanece.

---

## 2. Motivo da emenda

### 2.1 Lacuna

A v1.1 define a consulta lógica da vista (`listarObjectos` / filtro C3) e a UI só-leitura. A IMP-074, para cumprir a fronteira browser/Node (VAL-076), serializou a vista no **build**. Resultado: **percepção ≠ estado do store** após o build.

### 2.2 Critério

> Uma proposta C3 persistida no store IMP-073 **deve** poder aparecer no Centro de Situação **sem** novo build do frontend.

### 2.3 Princípios novos

| ID | Princípio | Enunciado |
|----|-----------|-----------|
| **P10** | Percepção = store, não build | A UI C3 reflecte o store IMP-073 via transporte Node; o artefacto estático do SPA **não** é a fonte de verdade da vista |
| **P11** | Transporte ≠ domínio | O canal HTTP transporta **só** a vista já filtrada; não expõe C2, C3, adapter nem payload bruto |
| **P12** | Sede única em produção | Em produção há **uma** sede canónica do store MEP; ambientes efémeros não fingem ser lastro |

---

## 3. Distinção: transporte interno vs API pública

| | **Canal interno (autorizado nesta v1.2)** | **API pública de produto (continua FORA)** |
|--|------------------------------------------|--------------------------------------------|
| **Propósito** | Entregar ao Centro o array da vista C3 | Expor MEP a terceiros / clientes / integrações |
| **Método** | **GET** único, só-leitura | CRUD, POST, webhooks, SDK |
| **Payload** | Exactamente os 4 campos §4 | Objectos completos, eventos, acto C3, promoção |
| **Quem chama** | SPA do CEO (origem allowlisted) | Qualquer consumidor |
| **Escrita / acto C3** | **Proibida** neste canal | Fora |
| **Nome lógico** | transporte da vista (ex. `obterVistaPropostasC3`) | — |

**Norma:** HTTP técnico **não** equivale a «API pública de produto» (§8.4 v1.1). É permitido **um** canal HTTP **interno**, **GET**, **só-leitura**, **payload fechado**, entre o processo Node da sede e o SPA. Qualquer outro HTTP sobre MEP permanece **fora** até nova ARQ.

---

## 4. Vista autorizada (inalterada; reforço)

O browser e o canal de transporte **só** podem transportar/exibir:

| Campo | Obrigatório |
|-------|-------------|
| `id` | Sim |
| `tipoLacunaProduto` | Sim |
| `enunciadoDesidentificado` | Sim |
| `maturidade` | Sempre literal `"CONCEBIDO"` |

Filtro **server-side** obrigatório (antes da serialização), via `listarPropostasC3()` / C2:

- `maturidade === "CONCEBIDO"`
- origem de canal C3 (`payload.origemCanal === "C3"` ou equivalente canónico vigente)

**Proibido** no fio e na UI: transcript; identidade de cliente; decisão privada; facto operacional; `KNW` bruto; memória organizacional; `payload` bruto; lista de eventos; campos C1 de organização.

---

## 5. Fronteira Node / browser e desenho de transporte

```
Vercel / Browser (SPA)
    ↓  GET interno somente leitura (HTTPS, origem allowlisted)
Railway / ceo-api (Node)
    ↓  boot IMP-073 (futuro — não nesta emenda documental)
    ↓  listarPropostasC3()
    ↓  filtro canónico C3
    ↓  array da vista (4 campos)
Vercel / Browser
    ↓  htmlBlocoMepC3(vista) — só markup
```

### 5.1 Browser (Vercel)

**NÃO importa:**

- `c3.js`
- `registo.js`
- `persistencia.js`
- `adapterFs.js`
- qualquer módulo `mepCeo` de domínio

**Recebe somente** a vista já filtrada (array de 4 campos). Continua a invariante VAL-076 (sem `node:*` / adapter no bundle).

### 5.2 Railway (`ceo-api`)

- Executa Node;
- Possui o MEP canónico (`app/src/mepCeo`);
- Consulta C2 (leitura);
- Prepara a vista C3;
- **Não** expõe POST do acto C3 neste canal;
- **Não** promove maturidade neste canal.

O acto `proporEvolucaoDesidentificada` permanece operação **interna** Node (testes / invocador interno / IMP futura). **Fora** do GET desta v1.2.

### 5.3 Fail-closed de percepção

Falha de **boot**, **store** ou **transporte** → vista **`[]`**, mensagem canónica de vazio, **sem dados inventados**.

---

## 6. Sede operacional (produção)

| Decisão | Valor |
|---------|--------|
| Processo | Railway serviço **`ceo-api`** |
| Volume | `/data` (já montado operacionalmente) |
| Store futuro (path canónico proposto) | **`/data/mep-ceo/store`** |
| Configuração | sob `CEO_DATA_ROOT=/data` (ou equivalente vigente) |

**Não criar o store nesta emenda.** Path é norma de sede; boot físico = IMP futura.

**Lab/local:** store em disco do patrocinador continua válido para testes; **não** é a sede de produção.

### 6.1 O que Railway **não** se torna

- Fila oficial de Jobs (ARQ-021 / IMP-060 intactas);
- API pública MEP;
- Hospedeiro de formulário C3 ou ingestão conversacional nesta v1.2.

---

## 7. Impactos de fronteira

| Componente | Impacto |
|------------|---------|
| **C1 / C2 / IMP-073 / adapter** | Contratos **intactos**; browser continua sem adapter |
| **C3 (acto)** | Contrato intacto; **não** no GET |
| **UI Centro** | Só-leitura; dados via transporte runtime |
| **Vercel** | SPA + fetch; sem store; sem Node MEP |
| **Railway** | Sede do store + servidor do GET da vista |
| **Motor / MRE / EIC / Gate / MTE** | **Fora** — sem alteração |

---

## 8. Fora de âmbito (explícito nesta v1.2 e neste acto)

- Implementação do GET;
- Boot físico do store;
- Criação de proposta C3 via UI;
- Formulário; POST do acto C3;
- API pública; CRUD;
- Conversa / ingestão automática;
- Promoção de maturidade;
- Alterações a C1/C2/IMP-073/adapter;
- Alterações Motor/MRE/EIC/Gate/MTE;
- Código Vercel/deploy neste acto;
- Snapshot de build como fonte de verdade;
- `localStorage` / segundo store no browser.

---

## 9. Conformidade com REQ-085

| Requisito | Como a v1.2 satisfaz |
|-----------|----------------------|
| RF-08 / C3 | Acto e fail-closed intactos; leitura operacional do resultado |
| RNF-02 | Centro só-leitura; dados = vista filtrada |
| RF-01 / isolamento | Transporte não leva conteúdo de organização |
| RNF-05 | Sem Motor/MRE/EIC/CAP-04/05 |

---

## 10. Homologação (CTO + Usuário)

Homologado em 16/08/2026:

1. Fonte de verdade da UI C3 = **store IMP-073**, não o build Vercel.  
2. É permitido **um GET interno** da vista de exactamente 4 campos.  
3. Sede de produção do store = **Railway `ceo-api` + volume `/data`**, path **`/data/mep-ceo/store`**.  
4. C1 / C2 / IMP-073 / contrato do acto C3 **não** são reabertos.  
5. Formulário, POST C3, API pública, Conversa e promoção **permanecem fora**.  
6. Fail-closed de percepção (`[]`) em falha de boot/store/transporte.  

Implementação: [`IMP-075`](../implementation/IMP-075-transporte-runtime-vista-c3.md) · Validação: [`VAL-077`](../validation/VAL-077-transporte-runtime-vista-c3.md).

---

## 11. Histórico

| Versão | Data | Estado | Delta |
|--------|------|--------|-------|
| 1.0 | 14/08/2026 | Homologada | C1+C2 |
| 1.1 | 16/08/2026 | Homologada | C3 + UI lógica Centro |
| **1.2** | 16/08/2026 | **Homologada** | Transporte runtime da vista; sede Railway; P10–P12; distinção transporte ≠ API pública; path store `/data/mep-ceo/store` |

---

*Fim da ARQ-033 v1.2 Homologada.*
