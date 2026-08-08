# Governação arquitectural — promoção ao Acervo Oficial de Conhecimento

> **Tipo:** governação arquitectural (alçadas).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — fechar governação antes de capacidade/estrutura/IMP.  
> **Pré-condições:** Arquitectura conceptual aprovada; limites arquitecturais aprovados.  
> **Natureza:** somente governação. **Não** implementa. **Não** propõe tecnologia. **Não** define estrutura nem fluxo de IMP.  
> **Fundamentos:** CON-001 Art. 6º e 8º; CNC-001; CNC-002; REQ-014 (exige decisão sob governança; deixa alçadas à governação vigente); limites 07/08.

---

## Pergunta central

> Quem é autorizado a promover um facto para o Acervo Oficial de Conhecimento?

**Resposta:** Ninguém promove sozinho por uso, hábito ou inferência do modelo.  
A promoção é uma **cadeia de governação**: proposta → validação → homologação → publicação.  
A **autoridade máxima de admissão** é o **Usuário** (CON-001 Art. 6º I).  
O **Sistema CEO não promove** — no máximo **propõe candidatos**.

---

## 1. Quem pode propor

| Agente | Pode propor? | Nota |
|--------|--------------|------|
| **Usuário** | Sim | Proposta directa de património / lastro de COA |
| **CTO** | Sim | Proposta técnica ou de governação do acervo |
| **Engenheiro (Cursor)** | Sim | Proposta a partir de evidência, Job ou inventário — sem efeito até validação |
| **Sistema CEO** | Só **candidato** | Sinaliza lacuna ou rascunho; **nunca** cria item oficial |

Proposta sem os passos seguintes **não** constitui item do Acervo.

---

## 2. Quem valida

**CTO** — validação de **conformidade**.

Verifica, antes da homologação:

- é item de conhecimento (CNC-002)?  
- respeita os **limites** da Camada (pertence / nunca entra)?  
- origem rastreável?  
- não absorve norma, CAP-05, ops de fila, nem engenharia do MG2?  
- classificação e âmbito (ex.: COA) coerentes?

**Usuário** — validação de **verdade de domínio** quando o item afirma lastro de produto/COA (ex.: estado ou regra do MG2).  
Pode delegar a confirmação factual numa deliberação explícita; a responsabilidade de verdade permanece sua.

Sem validação de conformidade (CTO), não há homologação.  
Sem validação de domínio (Usuário) em itens de lastro de COA, não há homologação desses itens.

---

## 3. Quem homologa

**Usuário** — em exclusivo.

Homologar = **admitir o facto como património oficial** do Acervo (pertença ao índice) e, na admissão inicial típica, autorizar a categoria lógica **apto** (salvo homologação explícita como registo já não apto para preservação histórica — caso excepcional).

O CTO **não** homologa admissão.  
O Engenheiro **não** homologa.  
O CEO **não** homologa.

---

## 4. Quem publica

**Engenheiro (Cursor)** — acto material de **publicação**, somente após homologação do Usuário.

Publicar = reflectir no Acervo Oficial (índice + entrada) a decisão já homologada: identidade, conteúdo/versão, aptidão, Memória Organizacional.

Publicação **sem** homologação é nula.  
O CTO orienta e revista; não publica por autoridade própria.  
O Usuário pode ordenar a publicação; quem a executa no registo é o Engenheiro (ou acto equivalente sob a mesma autorização).

---

## 5. Quem pode revogar

| Acto | Autoridade |
|------|------------|
| **Revogar aptidão** (apto → não apto) | **Usuário** homologa; **CTO** pode propor e fundamentar |
| **Revogar admissão indevida** (corrigir pertença / erro de promoção) | **Usuário** |
| Propor revogação / obsolescência / deduplicação | Usuário, CTO, Engenheiro (proposta) |
| Sistema CEO | Pode **alertar** obsolescência aparente; **não** revoga |

Revogação de aptidão **não** apaga identidade nem histórico (REQ-014).  
«Revogar» ≠ apagar o `KNW`.

---

## 6. Como um item deixa de ser «apto»

Exclusivamente por **decisão sob governança** (CNC-001 + REQ-014), com Memória Organizacional (CON-001 Art. 8º).

### Causas legítimas (categoria lógica → **não apto**)

| Causa | Significado |
|-------|-------------|
| **Obsolescência** | Deixou de reflectir a realidade para o **propósito** a que se destina |
| **Invalidade** | Estava errado ou foi admitido em violação dos limites |
| **Substituição** | Novo conteúdo/versão ou outro item passa a ser a referência válida |
| **Deduplicação** | Resolução de redundância: este deixa de ser o apto |
| **Depuração** | Remoção do conjunto utilizável como válido, sem apagar identidade |

### Causas **proibidas** (nunca bastam sozinhas)

- Uso recorrente ou «ninguém citou»  
- Inferência / silêncio do modelo  
- Mudança de Job ou estado da fila  
- Edição informal do Briefing / prompt  
- Convenção entre agentes sem homologação do Usuário  

### Efeito

- Deixa de ser entregue como conhecimento **válido** (REQ-005/014).  
- Identidade e cadeia de versões **permanecem**.  
- Pode ser informado como histórico/não apto; **não** fundamenta deliberação como verdade vigente.

### Restituição a apto

Mesma cadeia: proposta → validação CTO (+ domínio se aplicável) → homologação Usuário → publicação Engenheiro.

---

## Cadeia completa (síntese)

```
Propor          →  Usuário | CTO | Engenheiro | (CEO só candidato)
Validar         →  CTO (conformidade) + Usuário (verdade de domínio COA)
Homologar       →  Usuário  «──── autoridade de promoção
Publicar        →  Engenheiro (após homologação)
Revogar aptidão →  Usuário homologa (CTO pode propor)
Não apto        →  só por decisão sob governança (causas §6)
```

**Quem promove um facto ao Acervo Oficial?**  
O **Usuário**, após validação do **CTO** (e confirmação de domínio quando couber), com **publicação** executada pelo **Engenheiro**. Nenhuma outra via.

---

## Fora de escopo

- Workflows de UI, filas, formulários, IMP.  
- Taxonomia fina de rótulos sob «não apto» (obsoleto, inválido, …) — extensível depois, sem alterar alçadas.  
- Definição da capacidade ou estrutura do acervo.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (pedido) + Engenheiro (alçadas) |
| Quando | 07/08/2026 |
| O quê | Governação de promoção / aptidão do Acervo Oficial |
| Resultado | Alçadas fechadas; **sem** estrutura nem implementação |
| Próximo | Aguardar despacho para definição da capacidade |
