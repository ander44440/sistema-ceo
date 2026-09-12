# Âncora Mestra — Estado operacional vigente

## Objecto de trabalho (não confundir com produção)

**CEO-A** é o **objecto actual de evolução**: `E:\anderson\CEO` · branch `cursor/ipr-001-experiencia-f1-f2` · HEAD `01c715b` + working tree.  
Registo: [`2026-09-04-identificacao-ceo-a.md`](2026-09-04-identificacao-ceo-a.md).  
Esta Âncora, abaixo, continua a descrever a **produção publicada** (`origin/main`). **`origin/main` não é o objecto actual de trabalho** e não deve ser confundido com o CEO-A.

---

> **Tipo:** aprendizado / continuidade operacional (sem efeito normativo sobre CON/ADR).  
> **Atualização:** **16/08/2026** — retrato pós **primeiro lastro C3 real em produção** (CAP-13).  
> **Finalidade:** ponto único de retomada para o patrocinador, CTO e Engenheiro.  
> **Retrato datado deste instante:** [`2026-08-16-retrato-ancora-mestra-cap13-lastro-c3.md`](./2026-08-16-retrato-ancora-mestra-cap13-lastro-c3.md)

---

## 0. Veredicto deste momento (16/08/2026)

A CAP-13 fechou o circuito operacional mínimo perceptível:

```text
C3 (acto) → invocador Node (IMP-076) → store Railway (/data/mep-ceo/store)
  → GET vista → Vercel/Centro → «Propostas de evolução do produto»
```

Existe **exactamente um** lastro C3 em produção: **`MCP-001`** (hipótese sintética de teste, `CONCEBIDO`).

---

## 1. Produção alinhada

| Ambiente | Estado | Referência |
|----------|--------|------------|
| **GitHub `main`** | Publicado | `a0c677e94144b252eebaec986ea49a28deab0396` (merge PR #17 — IMP-076/VAL-078) |
| **Railway `ceo-api`** | Online · SUCCESS | deploy `9c72ccbe…` · **mesmo SHA** `a0c677e…` |
| **`/health`** | 200 | `{"ok":true,"service":"ceo-api"}` |
| **GET C3** | 200 · 1 item | `/api/ceo/mep/c3/propostas` |
| **Vercel** `sistema-ceo.vercel.app` | READY | Centro mostra `MCP-001` (fetch Railway) |
| **Volume** | `/data` | store MEP: `/data/mep-ceo/store` |

### Lastro C3 vigente (vista)

| Campo | Valor |
|-------|--------|
| `id` | `MCP-001` |
| `tipoLacunaProduto` | coerencia de acompanhamento executivo |
| `enunciadoDesidentificado` | TESTE-CAP13: hipotese sintetica para validar o primeiro fluxo operacional da CAP-13. |
| `maturidade` | `CONCEBIDO` |

**Não** expostos na vista: `origemCanal`, transcript, payload bruto, dados privados.

---

## 2. CAP-13 — cadeia homologada até este retrato

| Elo | Artefacto | Estado |
|-----|-----------|--------|
| Capacidade | CAP-13 (ADR-020) | Homologada (mínimo; depois C3/UI/transporte/invocador) |
| Visão / REQ | VIS-009 · REQ-085 | v1.1 Homologados |
| ARQ | ARQ-033 v1.1 · **v1.2** | Homologadas (acto C3 + transporte/sede) |
| Desenho invocador | ARQ-034 proposta (Opção A) | Publicada · base da IMP-076 |
| Núcleo | IMP-072 / VAL-072 | C1+C2 |
| Persistência | IMP-073 / VAL-074 | Adapter FS · store canónico |
| C3 + UI | IMP-074 / VAL-075 · VAL-076 | Acto + Centro só-leitura · fronteira browser/Node |
| Transporte | IMP-075 / VAL-077 | GET runtime · 12/12 PASS |
| Invocador | **IMP-076 / VAL-078** | Node-only · 12/12 PASS · **em `main` + Railway** |

Sede documental: [`docs/cap-13/README.md`](../cap-13/README.md).

---

## 3. Autonomia / operação diária (ainda vigente)

| Campo | Valor |
|-------|--------|
| **Modo execução técnica** | Local (V2) — PC + watcher/dispatcher para Jobs |
| **Canal Engenheiro** | Fila REQ-045 → Dispatcher REQ-053 → Cursor |
| **Canal CTO** | Conector CTO (REQ-054) |
| **Painel** | Orquestração (REQ-055) — só leitura |
| **Fase estratégica** | ADR-015 — uso diário MG2 / MVP operacional |
| **Acto C3 em produção** | Só via `executarActoC3` (IMP-076) — **sem** POST/formulário/UI de criação |

---

## 4. O que NÃO fazer a partir daqui (salvo Gate)

- Não promover `MCP-001` (permanece `CONCEBIDO` / hipótese).  
- Não apagar o lastro sem decisão de governança.  
- Não criar POST/formulário/botão de C3.  
- Não misturar Motor/MRE/Conversa como canal de ingestão C3.  
- Não alterar C1/C2/`c3.js`/adapter/IMP-073 sem IMP nova.  
- Não tratar snapshot de build como fonte da vista C3 (P10 ARQ-033 v1.2).

---

## 5. Backlog consciente (não autorizado neste retrato)

| Item | Nota |
|------|------|
| Segundo lastro / propostas reais de produto | Acto operacional separado; mesmo invocador |
| CLI fino permanente do invocador | Opcional (ARQ-034 B); núcleo A já basta |
| Rehidratação C2 sem restart após escrita noutro processo | Limitação conhecida (L3 VAL-078 / ops) |
| Dispatcher V3 (cloud 24×7) | Backlog antigo |
| Promoção de maturidade MEP | Alçada humana/CTO — fora do invocador |

---

## 6. Ponto de retomada

1. Abrir Centro: https://sistema-ceo.vercel.app/#/dashboard  
2. Confirmar bloco **Propostas de evolução do produto** → `MCP-001`.  
3. Confirmar API: `GET …/api/ceo/mep/c3/propostas` → 1 item · 4 campos.  
4. Próximo Gate: a definir pelo patrocinador/CTO (evolução CAP-13 vs uso diário MG2).

### Código / docs âncora

| Peça | Caminho |
|------|---------|
| Invocador | `server/src/services/mepC3Invocador.js` |
| Vista / boot | `server/src/services/mepC3Vista.js` |
| Acto C3 | `app/src/mepCeo/c3.js` |
| IMP-076 | `docs/implementation/IMP-076-invocador-c3-interno.md` |
| VAL-078 | `docs/validation/VAL-078-invocador-c3-interno.md` |

---

## 7. Memória organizacional (este update)

| Campo | Registro |
|-------|----------|
| Quem | Patrocinador (pedido de âncora-mestra) + Engenheiro (Cursor) |
| Quando | 16/08/2026 (noite) |
| Por quê | Fixar o retrato após fecho do circuito CAP-13 com lastro real em produção |
| Baseado em quê | `main` `a0c677e…`; Railway SUCCESS; GET/`MCP-001`; Centro visual; IMP-076/VAL-078 |
| Resultado | Âncora Mestra actualizada; retrato datado criado; lastro `MCP-001` documentado como permanente salvo Gate |

---

## 8. Histórico curto da própria Âncora Mestra

| Data | Marco |
|------|--------|
| 01/08/2026 | Encerramento IMP-055 (Painel de Orquestração) |
| **16/08/2026** | **CAP-13: transporte + invocador + primeiro lastro C3 (`MCP-001`)** |

---

*Documento vivo — actualizar em cada encerramento formal de frente operacional relevante.*
