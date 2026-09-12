# VAL-087 — Validação da IMP-087 (Histórico Físico das Conversas — 1ª fatia)

> **Status:** **APROVADO · HOMOLOGADO** — 11/09/2026. Encerramento da 1ª fatia HFC com IMP-087.  
> **Tipo:** VAL (ADR-006). **Identificação:** VAL-087 (VAL da IMP-087).  
> **Capacidade:** CAP-03 — Gestão de Projetos.  
> **Norma:** REQ-087 v1.0 Homologado · ARQ-087 v1.0 Homologada · IMP-087 v1.0 **IMPLEMENTADA · VALIDADA · HOMOLOGADA**.  
> **Código:** **não alterado** neste acto de validação nem no encerramento documental. Sem correcção. Sem nova IMP. Sem commit/push.  
> **JOB-000118:** intocado.  
> **Limites da fatia (permanecem):** sem leitor; sem busca; sem recuperação; sem backfill; sem correlação MO/Trilha; sem eventos de correcção.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Validação por evidência de que a 1ª fatia HFC cumpre CA/RI do REQ-087 e invariantes da ARQ/IMP-087, sem regressão de F5–F8, Trilha nem CAP-13. |
| **Por que existe?** | Despacho de VAL após IMP-087 implementada (47/47 na entrega). |
| **Para quem existe?** | CTO (parecer); Usuário (alçada). |
| **Como medir sucesso?** | Itens 1–12 do despacho em PASS; suíte relevante 0 FAIL; zero regressão homologada. |

---

## 1. Testes executados

| ID | Comando / acto | Resultado |
|----|----------------|-----------|
| **E1** | `node --test src/historicoFisicoConversas/hfc-fatia1.test.js` (+ regressões abaixo num único batch) | **8/8 HFC pass** |
| **E2** | `f5c3-chat-persistencia.test.js` + `p1-isolamento-conversacional-coa.test.js` | **3+7 pass** |
| **E3** | `memoriaConfiavel/f5c7-mo-persistencia.test.js` | **9/9 pass** |
| **E4** | `trilhaAuditavel/f8-fatia1-trilha.test.js` | **7/7 pass** |
| **E5** | `mepCeo/mepCeo.test.js` | **20/20 pass** |
| **E6** | Batch agregado E1–E5 | **54/54 pass · 0 fail** |
| **E7** | Script de evidência no path canónico `executive/historico-conversas/mensagens.jsonl` (API HFC; sem alteração de código-fonte) | Ficheiro criado; 3 linhas VAL-087; schema completo |
| **E8** | Inspecção estática: módulo HFC sem imports de MO / Trilha / MEP / Gate / AD | **PASS** (`mepCeo` só em lista de chaves **proibidas**) |

cwd: `app/`. Data: 11/09/2026.

---

## 2. Matriz de validação (despacho)

| # | Critério | Veredicto | Evidência |
|---|----------|-----------|-----------|
| **1** | Persistência física real em `executive/historico-conversas/mensagens.jsonl` | **PASS** | E7: `beforeExists=false` → ficheiro criado; 3 linhas JSONL no path canónico |
| **2** | Integridade do registo (schema + campos) | **PASS** | E7 amostra: `schemaVersao`, `tipo=conversa.mensagem`, `id`, `coaId`, `msgId`, `papel`, `texto`, `criadoEm`, `registadoEm`, `estado`, `ordem` |
| **3** | Append-only (update/delete/compact recusados) | **PASS** | E1 teste imutabilidade; E7 `historico_append_only` nas três APIs |
| **4** | Idempotência por `msgId` | **PASS** | E1; E7 `rDup.duplicado=true` sem 4ª linha |
| **5** | Estados: `pronta`/`erro` registam; `pendente` não | **PASS** | E1; E7 `pendente.codigo=estado_pendente`; linhas com `pronta` e `erro` |
| **6** | `ordem` monotónica e não reutilizada | **PASS** | E1; E7 ordens 1→2→3 |
| **7** | F5-C3 contrato actual | **PASS** | E2 (refresh, isolamento COA, limpeza por COA) |
| **8** | Fail-soft: falha HFC não impede F5-C3 | **PASS** | E1 teste «fail-soft: adaptador que falha…» |
| **9** | `limparHistorico` não apaga/reduz HFC | **PASS** | E1 teste hook: UI 0 msgs; HFC permanece 2 |
| **10** | Isolamento MO / Trilha / MEP / Gate / AD | **PASS** | E3–E5 verdes; E8 sem imports; Gate/AD sem referências HFC |
| **11** | `coaId` correcto, incl. `__sem_coa__` | **PASS** | E7: `coaId=null` → `__sem_coa__`; `prj-val087` preservado; E1 isolamento COA |
| **12** | Regressão suíte relevante | **PASS** | E6 **54/54** |

---

## 3. Evidências relevantes (resumo)

### 3.1 Path canónico (E7)

- Ficheiro: `executive/historico-conversas/mensagens.jsonl`
- Registos de evidência VAL: `msg-val087-sem-coa` (`__sem_coa__`), `msg-val087-coa`, `msg-val087-erro`
- Duplicado do mesmo `msgId` → `{ ok: true, duplicado: true }`
- Pendente → recusa `estado_pendente`

### 3.2 Isolamento

- HFC não importa `memoriaConfiavel`, `trilhaAuditavel`, `mepCeo` (módulo), `continuidadeGate`, `autoridadeDelegada`
- `store.js` só chama `tentarRegistarMensagemHfc` (fail-soft); não toca MO/Trilha/MEP/Gate/AD

---

## 4. Regressões

Nenhuma. Capacidades homologadas exercitadas (F5-C3, isolamento conversacional, MO, Trilha fatia1, MEP) permaneceram verdes.

---

## 5. Limitações declaradas (não são FAIL)

* VAL não exige browser E2E nem Vite live POST (cobertos por adaptador FS + plugin registado; padrão alinhado à Trilha).  
* Leitor/UI/backfill/consulta HFC **fora** da 1ª fatia (REQ/ARQ).  
* Fail-soft implica possível mensagem UI sem linha HFC se a ponte HTTP falhar em runtime — limitação já declarada na ARQ.

---

## 6. Veredicto final

**APROVADO**

Todos os invariantes da IMP-087 comprovados; CA-087-1…8 / RI-087-1…8 cobertos por E1–E8; **0 FAIL** na suíte relevante; sem regressão em F5–F8, Trilha ou CAP-13/C3 (MEP).

**Encerramento:** 1ª fatia HFC = **IMPLEMENTADA + VALIDADA + HOMOLOGADA**. HFC físico vigente para mensagens **novas** elegíveis. F5–F8, Trilha, CAP-13/C3 e REQ-086 preservados. Próxima capacidade **não** iniciada.

---

## 7. Histórico

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 11/09/2026 | Engenheiro (Cursor) | VAL da 1ª fatia HFC | **APROVADO** |
| 1.1 | 11/09/2026 | Engenheiro (Cursor) | Registo de homologação / encerramento da fatia | **APROVADO · HOMOLOGADO** |
