# REQ-051 — Aprendizado Executivo

> **Status:** Aprovado  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá, após cada deliberação concluída pelo MRE com `ParecerExecutivo` válido, avaliar o resultado dessa deliberação através do mecanismo **Aprendizado Executivo**, decidendo o que preservar (memória, precedente e/ou proposta de atualização de princípios), sem deliberar de novo, sem alterar a decisão tomada e sem aplicar princípios automaticamente.

## Tipo

Funcional; detalhado (mecanismo de retenção / maturação do conhecimento).

## Objetivo

Fixar critérios e regras de homologação para o que uma deliberação pode deixar no património do CEO — alinhado ao ciclo Observação → Hipótese → Validação → Aprovação → Evolução contínua — usando o bloco `aprendizado` do `ParecerExecutivo` (REQ-048) como contrato de intenção de retenção.

## Escopo

### Inclui

* Responsabilidades e proibições do Aprendizado Executivo.
* Critérios para `registrarMemoria`, `criarPrecedente` e `atualizarPrincipios`.
* Regras de homologação (nenhuma atualização automática de princípios).
* Entradas e saídas lógicas.
* Integração com `ParecerExecutivo` e com o estágio 8 do MRE (REQ-049).
* Critérios de aceitação, dependências e impacto arquitetural.

### Fora do escopo

* Implementação em código, classes ou ficheiros.
* Schema do parecer (REQ-048) e pipeline completo do MRE (REQ-049), salvo a ligação ao estágio 8.
* Redação ao utilizador (REQ-050 Speaker).
* Motor físico de persistência (ficheiros, BD) — apenas a **decisão normativa** do que deve ser persistido e sob que gate.
* Conteúdo literal de novos princípios (apenas critérios e forma da proposta).

## Justificativa

ADR-019 exige aprendizado pós-deliberação e proíbe auto-aplicação de princípios. Sem critérios, o estágio 8 torna-se arbitrário ou silencioso. CON-001 (aprendizado contínuo, rastreabilidade); ADR-002 (competências só viram património após maturação); ADR-015 (memória útil ao uso diário sem burocracia).

---

## Responsabilidades do Aprendizado Executivo

O mecanismo **é** responsável por:

1. Avaliar um `ParecerExecutivo` **válido** (ou o estado deliberativo equivalente no fecho do estágio 8) quanto ao valor de retenção.
2. Decidir os três eixos de retenção: memória, precedente, proposta de princípios.
3. Produzir / confirmar o bloco `aprendizado` conforme REQ-048 (e, se aplicável, um **Plano de Retenção** pós-parecer).
4. Encaminhar propostas de princípios apenas para **homologação humana** (Gate).
5. Registar notas de aprendizado quando úteis à auditoria.

O mecanismo **não** é responsável por:

* Deliberar ou alterar `decisaoExecutiva`, `acao`, riscos, oportunidades ou análise.
* Reabrir o MRE ou invocar o Speaker.
* Aplicar, editar ou remover princípios permanentes por conta própria.
* Inventar factos ausentes do parecer.
* Executar jobs da fila.

**Invariantes**

1. Não delibera.  
2. Não altera decisões.  
3. Apenas avalia o resultado da deliberação e decide o que pode ser persistido para uso futuro.

---

## Relação com o estágio 8 do MRE

| Momento | Papel |
|---------|--------|
| **Durante o MRE (estágio 8)** | Aplica os critérios desta REQ para preencher `parecer.aprendizado` antes da montagem/validação (REQ-049). |
| **Após parecer válido** | Autoriza efeitos de retenção coerentes com esse bloco (persistir memória/precedente; abrir proposta de princípio para Gate). |

Se, na IMP futura, a avaliação ocorrer só pós-MRE, o bloco `aprendizado` do parecer deve ser **atualizado apenas se o parecer ainda não tiver sido comunicado como imutável**; em qualquer caso, é **proibido** alterar `decisaoExecutiva` ou demais blocos deliberativos. Preferência normativa: critérios aplicados no estágio 8; pós-MRE apenas **executa** a retenção homologável.

---

## Entradas e saídas

### Entrada

| Campo lógico | Obr. | Descrição |
|--------------|------|-----------|
| `parecer` (ou parcial até `acao`) | Obrig. | Conteúdo deliberativo já decidido; para retenção pós-fecho, parecer **válido** REQ-048 |
| `contextoRetencao` | Opc. | Sinais não deliberativos (ex.: se já existe precedente similar conhecido pelo sistema de memória — sem reabrir deliberação) |

### Saída — bloco `aprendizado` (REQ-048)

| Campo | Tipo | Obr. | Descrição |
|-------|------|-------|-----------|
| `registrarMemoria` | boolean | Obrig. | Intenção de registo na memória executiva |
| `criarPrecedente` | boolean | Obrig. | Intenção de criar precedente reutilizável |
| `atualizarPrincipios` | boolean | Obrig. | Intenção de **propor** atualização de princípios |
| `notas` | string | Opc. | Notas de aprendizado / auditoria |
| `propostaPrincipio` | string | Cond. | Obrigatória e não vazia se `atualizarPrincipios = true` |

### Saída complementar — Plano de Retenção (lógico, pós-parecer)

| Campo | Tipo | Obr. | Descrição |
|-------|------|-------|-----------|
| `parecerId` | string | Obrig. | Rastreio |
| `efeitos` | lista | Obrig. | Itens: `persistir_memoria` \| `persistir_precedente` \| `abrir_proposta_principio` (subconjunto coerente com os booleanos) |
| `estadoHomologacaoPrincipio` | enum | Cond. | Se houver proposta: `pendente_gate` (único estado inicial permitido). Nunca `aplicado` sem Gate. |

---

## Critérios para registrar memória

`registrarMemoria = true` quando **pelo menos um** dos critérios seguintes se verificar:

| ID | Critério |
|----|----------|
| M1 | A deliberação altera o entendimento operacional do COA/sessão (próximo passo, pendência, risco material, despacho). |
| M2 | `acao.tipo ∈ {despachar, registar}` e a ação deve ser recuperável no Painel/memória. |
| M3 | `natureza = estrategica` e a justificativa introduz compromisso ou restrição duradoura. |
| M4 | O utilizador (via mensagem refletida no diagnóstico) pediu explicitamente para “lembrar” / registar — sem inventar o pedido. |

`registrarMemoria = false` quando **todos** se verificarem:

| ID | Critério |
|----|----------|
| M- | Interação trivial ou puramente esclarecedora, sem efeito operacional. |
| M- | `estado = solicitar_dados` **e** nenhum facto novo útil foi estabelecido (só pedido de dados). |
| M- | Falha deliberativa controlada sem conteúdo a reter (salvo nota técnica opcional em `notas`). |

**Regra:** memória regista **factos e intenções já presentes no parecer**, não conclusões novas.

---

## Critérios para criação de precedentes

Um **precedente** é um padrão reutilizável de deliberação (situação → decisão → condições), não um dump do parecer inteiro.

`criarPrecedente = true` quando **pelo menos um**:

| ID | Critério |
|----|----------|
| P1 | `natureza ∈ {estrategica, tatica}` **e** `estado ∈ {aprovar, rejeitar, delegar}` com justificativa estável. |
| P2 | A deliberação resolve uma classe de problema recorrente identificável em `diagnostico`/`enquadramento` (não um caso único irrelevante). |
| P3 | `confianca` elevada **e** `lacunas` vazias (ou lacunas irrelevantes à decisão tomada). |

`criarPrecedente = false` quando **qualquer**:

| ID | Critério |
|----|----------|
| P- | `estado ∈ {solicitar_dados, adiar}` — decisão incompleta ou adiada. |
| P- | `tipoPedido = ambiguo` ou `confianca` baixa com lacunas materiais. |
| P- | Decisão claramente situacional/única sem valor de reuso (`notas` podem explicar). |

**Regra:** precedente **não** substitui o parecer; referencia `parecerId` e extrai o padrão. Não altera a decisão original.

---

## Critérios para propor atualização de princípios

`atualizarPrincipios = true` **somente** quando **todos** os critérios fortes se verificarem:

| ID | Critério |
|----|----------|
| R1 | A deliberação revelou lacuna ou tensão nos princípios **já aplicados** ou na Constituição operacional (não mero gosto de redação). |
| R2 | A mudança proposta é **geral** (regra permanente), não um ajuste de um único caso. |
| R3 | `propostaPrincipio` enuncia a regra proposta de forma testável e distinta das existentes. |
| R4 | Não há alternativa suficiente apenas com memória ou precedente. |

Caso contrário, `atualizarPrincipios = false` e `propostaPrincipio` omite-se.

**Proibições**

* Não propor princípio para contornar uma decisão já tomada no mesmo parecer.
* Não propor princípio que contradiga CON-001 / normas superiores — se a tensão existir, `notas` podem sinalizar escalação; não “corrigir” a Constituição via este mecanismo sem Gate explícito do patrocinador.

---

## Regras de homologação

### H1 — Nenhuma atualização automática de princípios

* `atualizarPrincipios = true` cria apenas uma **proposta** com estado `pendente_gate`.
* É **proibido** escrever princípios permanentes, alterar Constituição espelhada ou regras invioláveis sem aprovação humana explícita.
* Rejeição ou aprovação do Gate ocorre **fora** deste componente (processo de governação); o Aprendizado Executivo não aplica o resultado sozinho na mesma passagem.

### H2 — Memória e precedente

* Podem ser persistidos sem Gate de princípios **se** os booleanos o autorizarem e o parecer for válido.
* Persistência deve preservar rastreio a `parecerId` e data.
* Em caso de conflito com memória anterior, **não** reescrever a decisão do parecer; registar coexistência ou marcar revisão para processo futuro (fora do escopo normativo mínimo desta REQ).

### H3 — Ordem de efeitos

1. Parecer válido existe.  
2. Efeitos `persistir_memoria` / `persistir_precedente` conforme booleanos.  
3. Se `atualizarPrincipios` → abrir proposta `pendente_gate` (sem aplicar).  
4. Speaker pode ou não mencionar a proposta (REQ-050: por omissão não anuncia).

### H4 — Idempotência

* Reprocessar o mesmo `parecerId` não deve duplicar precedentes/propostas idênticas (regra de IMP; requisito: efeito semanticamente único por parecer).

---

## Integração com o ParecerExecutivo

| Aspeto | Regra |
|--------|--------|
| Contrato | Campos em `aprendizado` conforme REQ-048; validação V4 |
| Leitura | Usa `diagnostico`, `enquadramento`, `decisaoExecutiva`, `acao`, `lacunas`, `confianca`, `principiosAplicados`, `natureza` |
| Escrita | Apenas bloco `aprendizado` (+ plano de retenção externo); **nunca** `decisaoExecutiva` / `acao` / análise |
| Speaker | Consome o parecer já com `aprendizado`; não executa retenção |
| MRE | Estágio 8 aplica critérios; validação global REQ-048 antes do Speaker |
| Núcleo | Pode disparar efeitos de retenção pós-parecer sem reabrir deliberação |

---

## Critérios de aceitação

* Responsabilidades e proibições (não deliberar / não alterar decisão) estão explícitas.
* Critérios M/P/R para memória, precedente e proposta de princípios são testáveis.
* Homologação H1–H4 impede aplicação automática de princípios.
* Entradas/saídas e Plano de Retenção estão definidos logicamente.
* Integração com REQ-048 (`aprendizado`) e REQ-049 (estágio 8) está clara.
* Dependências e impacto arquitetural documentados.
* Nenhum critério exige código, classes ou ficheiros.

## Dependências

| Dependência | Papel |
|-------------|--------|
| **ADR-019** | Aprendizado pós-deliberação; princípios só por Gate |
| **REQ-048** | Bloco `aprendizado` e regra V4 |
| **REQ-049** | Estágio 8 do pipeline |
| **REQ-050** | Não executa retenção; exposição opcional |
| **ADR-002** / Constituição | Maturação do conhecimento; normas superiores |
| Memória executiva / Painel | Destino de `registrarMemoria` (IMP futura) |

## Riscos e incertezas

* Critérios M/P/R podem ser conservadores demais no MVP — preferível sub-reter a poluir precedentes.
* Sobreposição memória vs precedente — mitigada pelas definições desta REQ.
* Gate de princípios pode acumular propostas — processo de fila de Gate fica para REQ/IMP futura.

## Impacto arquitetural

```text
MRE (estágios 0–7)
      ↓
Aprendizado Executivo (estágio 8 / critérios desta REQ)
      ↓
ParecerExecutivo.aprendizado
      ↓
Validação REQ-048 → Speaker
      ↓
Pós-parecer: Plano de Retenção
   ├─ memória / precedente (persistência operacional)
   └─ proposta de princípio → Gate humano (nunca auto-aplicar)
```

| Componente | Impacto |
|------------|---------|
| **MRE** | Estágio 8 deixa de ser ad hoc; obedece a esta REQ |
| **Parecer** | Transporta intenção de retenção auditável |
| **Speaker** | Sem mudança de responsabilidade |
| **Núcleo** | Orquestra efeitos de retenção após parecer válido |
| **Constituição / princípios** | Só mudam via Gate; proposta nasce aqui |
| **Fila** | Independente; despacho não é aprendizado |

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-019; ADR-002; ADR-015; ADR-006 |
| Origem | Gate Fase 2 — modelagem pós REQ-050 aprovada (30/07/2026) |
| Dependências diretas | REQ-048; REQ-049 |
| Implementação | *Proibida até aprovação desta REQ + IMP* |
| Testes | *A criar (cenários M/P/R e H1)* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Especificação do Aprendizado Executivo | REQ-050 aprovada | **Aprovado** |
