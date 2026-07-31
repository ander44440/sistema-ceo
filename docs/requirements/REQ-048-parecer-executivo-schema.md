# REQ-048 — ParecerExecutivo (Schema)

> **Status:** Aprovado  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-01 — Governança

## Enunciado

O CEO deverá definir e respeitar um contrato formal único — o artefacto **ParecerExecutivo** — como única saída válida do Motor de Raciocínio Executivo (MRE), de modo que Speaker, UI, Voice, Fila de Execução e futuras integrações consumam apenas pareceres que satisfaçam a estrutura, os tipos, os enums e as regras de validação desta REQ.

## Tipo

Funcional; detalhado (contrato de dados / schema normativo).

## Objetivo

Fixar o **contrato estável** do `ParecerExecutivo` produzido pelo MRE (ADR-019), separando deliberação de comunicação e permitindo auditoria, reutilização e extensão multi-agente sem alterar o significado da decisão.

## Escopo

### Inclui

* Estrutura completa do `ParecerExecutivo`.
* Tipos lógicos de cada campo.
* Obrigatoriedade / opcionalidade.
* Enums permitidos.
* Regras de validação (consistência entre campos e estágios).
* Critérios de aceitação do contrato.
* Impacto arquitetural nos consumidores (MRE, Speaker, Núcleo, Fila, Voice/UI).

### Fora do escopo

* Implementação em código, classes, ficheiros ou serialização concreta (JSON Schema de runtime, protobuf, etc.).
* Definição do pipeline interno do MRE além do que o schema exige como conteúdo.
* Texto de UI/voz (Speaker).
* Persistência física (ficheiro, BD) — apenas o **modelo lógico**.
* Multi-agente detalhado (apenas compatibilidade do contrato).

## Justificativa

ADR-019 institui o MRE e exige que nenhuma resposta deliberativa chegue ao utilizador sem `ParecerExecutivo` válido. Sem schema formal, Reasoner, Speaker e Fila divergem e reaparece o “assistente” (texto sem decisão auditável). CON-001 (governança, rastreabilidade); ADR-015 (uso operacional com decisões claras).

---

## Estrutura completa do ParecerExecutivo

O parecer é um **objeto** com os blocos abaixo. Campos marcados **Obrig.** devem existir e satisfazer as regras; **Opc.** podem omitir-se ou ser nulos conforme regra.

### Raiz

| Campo | Tipo lógico | Obr. | Descrição |
|-------|-------------|------|-----------|
| `id` | string (identificador único) | Obrig. | Identidade do parecer nesta deliberação |
| `criadoEm` | string data-hora (ISO 8601) | Obrig. | Instantâneo de produção do parecer |
| `versaoContrato` | string | Obrig. | Versão do schema (ex.: `"1.0"` alinhada a esta REQ) |
| `coaId` | string \| null | Obrig. | COA/projeto ativo; `null` só se não houver COA |
| `confianca` | número `0..1` | Obrig. | Confiança agregada do MRE na deliberação |
| `lacunas` | lista de string | Obrig. | Lacunas de informação (pode ser lista vazia) |
| `diagnostico` | objeto DiagnosticoEstrategico | Obrig. | Estágio 0 |
| `enquadramento` | objeto Enquadramento | Obrig. | Estágio 1 |
| `dossier` | objeto DossierExecutivo | Obrig. | Estágio 2 (referência aos factos usados) |
| `principiosAplicados` | lista de string | Obrig. | Estágio 3 (pode ser vazia só se justificado em `lacunas`) |
| `analise` | string | Obrig. | Estágio 4 — análise estruturada, não prosa de UI |
| `riscos` | lista de objeto Risco | Obrig. | Estágio 5a (pode ser vazia) |
| `oportunidades` | lista de objeto Oportunidade | Obrig. | Estágio 5b (pode ser vazia) |
| `decisaoExecutiva` | objeto DecisaoExecutiva | Obrig. | Estágio 6 |
| `acao` | objeto AcaoOperacional | Obrig. | Estágio 7 |
| `aprendizado` | objeto Aprendizado | Obrig. | Estágio 8 |
| `metadados` | objeto | Opc. | Extensões não normativas (ex.: modelo usado, latência) |

---

### DiagnosticoEstrategico (`diagnostico`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `objetivoReal` | string | Obrig. | Objetivo real da interação (pode diferir do texto literal) |
| `problemaNegocio` | string | Obrig. | Problema de negócio identificado; usar texto explícito se inexistente (ex.: `"não identificado"`) |
| `natureza` | enum NaturezaInteracao | Obrig. | Natureza da deliberação |

**Enum `NaturezaInteracao`:** `estrategica` \| `tatica` \| `operacional`

---

### Enquadramento (`enquadramento`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `tipoPedido` | enum TipoPedido | Obrig. | Classificação do pedido à luz do diagnóstico |
| `urgencia` | enum Urgencia | Obrig. | Urgência percebida |
| `escopo` | string | Obrig. | Limite do que esta deliberação cobre |

**Enum `TipoPedido`:** `informacao` \| `decisao` \| `execucao` \| `ambiguo`

**Enum `Urgencia`:** `baixa` \| `media` \| `alta` \| `critica`

---

### DossierExecutivo (`dossier`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `resumoPainel` | string | Obrig. | Síntese do estado executivo usado |
| `factosUsados` | lista de string | Obrig. | Factos concretos citados na deliberação (pode ser vazia se `lacunas` cobrir) |
| `fontes` | lista de enum FonteFacto | Opc. | Origem dos factos |

**Enum `FonteFacto`:** `painel` \| `memoria` \| `briefing` \| `utilizador` \| `precedente` \| `outro`

---

### Risco (`riscos[]`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `nivel` | enum NivelRisco | Obrig. | Severidade |
| `texto` | string | Obrig. | Descrição do risco |
| `mitigacao` | string | Opc. | Mitigação sugerida |

**Enum `NivelRisco`:** `baixo` \| `medio` \| `alto` \| `critico`

---

### Oportunidade (`oportunidades[]`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `valor` | enum ValorOportunidade | Obrig. | Potencial relativo |
| `texto` | string | Obrig. | Descrição da oportunidade |
| `condicao` | string | Opc. | Condição para capturar o valor |

**Enum `ValorOportunidade`:** `baixo` \| `medio` \| `alto`

---

### DecisaoExecutiva (`decisaoExecutiva`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `estado` | enum EstadoDecisaoExecutiva | Obrig. | Ato de governo |
| `recomendacao` | string | Obrig. | Recomendação em uma frase clara |
| `alternativas` | lista de string | Obrig. | Alternativas consideradas (pode ser vazia) |
| `justificativa` | string | Obrig. | Liga diagnóstico, princípios, riscos e oportunidades |

**Enum `EstadoDecisaoExecutiva` (fechado — estados livres proibidos):**

| Valor | Significado |
|-------|-------------|
| `aprovar` | Autorizar / seguir o caminho recomendado |
| `rejeitar` | Recusar o caminho |
| `delegar` | Transferir execução |
| `monitorar` | Não agir agora; acompanhar |
| `solicitar_dados` | Falta informação essencial |
| `adiar` | Adiar deliberação com motivo |

---

### AcaoOperacional (`acao`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `tipo` | enum TipoAcaoOperacional | Obrig. | Gesto operacional decorrente da decisão |
| `descricao` | string | Obrig. | O que fazer a seguir, de forma concreta |
| `job` | objeto JobDespacho \| null | Obrig. | Preenchido quando houver despacho; senão `null` |

**Enum `TipoAcaoOperacional`:** `orientar` \| `registar` \| `perguntar` \| `despachar` \| `aguardar`

#### JobDespacho (`acao.job`, quando não null)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `titulo` | string | Obrig. | Título do trabalho a despachar |
| `descricao` | string | Obrig. | Instrução de execução |
| `prioridade` | enum PrioridadeJob | Opc. | Default implícito: `normal` |

**Enum `PrioridadeJob`:** `baixa` \| `normal` \| `alta`

---

### Aprendizado (`aprendizado`)

| Campo | Tipo | Obr. | Descrição |
|-------|------|------|-----------|
| `registrarMemoria` | boolean | Obrig. | Se deve registar na memória executiva |
| `criarPrecedente` | boolean | Obrig. | Se o parecer deve virar precedente reutilizável |
| `atualizarPrincipios` | boolean | Obrig. | Se **propõe** atualização de princípios (nunca aplica sozinho) |
| `notas` | string | Opc. | Notas de aprendizado |
| `propostaPrincipio` | string | Cond. | Obrigatória se `atualizarPrincipios = true` |

---

## Regras de validação

Um `ParecerExecutivo` só é **válido** se cumprir todas as regras:

### V1 — Forma

1. Todos os campos obrigatórios da raiz e dos blocos obrigatórios estão presentes.
2. Todos os enums usam **apenas** valores listados nesta REQ.
3. `confianca` ∈ [0, 1].
4. `versaoContrato` não é vazia.
5. `analise`, `decisaoExecutiva.recomendacao` e `decisaoExecutiva.justificativa` não são strings vazias (após trim).
6. `diagnostico.objetivoReal` e `diagnostico.problemaNegocio` não são vazios.

### V2 — Separação riscos / oportunidades

7. `riscos` e `oportunidades` são listas distintas; um mesmo enunciado não deve ser duplicado como risco e oportunidade sem distinção explícita no texto.
8. Cada item de `riscos` tem `nivel` + `texto`; cada item de `oportunidades` tem `valor` + `texto`.

### V3 — Consistência Decisão ↔ Ação

9. Se `decisaoExecutiva.estado = solicitar_dados` → `acao.tipo = perguntar` e `lacunas` tem pelo menos um item.
10. Se `decisaoExecutiva.estado = delegar` → `acao.tipo = despachar` e `acao.job` ≠ null (com `titulo` e `descricao` não vazios).
11. Se `decisaoExecutiva.estado ∈ { monitorar, adiar }` → `acao.tipo = aguardar`.
12. Se `decisaoExecutiva.estado = rejeitar` → `acao.tipo ∈ { orientar, registar, aguardar }` (não `despachar`).
13. Se `decisaoExecutiva.estado = aprovar` → `acao.tipo ∈ { orientar, registar, despachar }` conforme a recomendação (se `despachar`, `job` ≠ null).

### V4 — Aprendizado e princípios

14. Se `aprendizado.atualizarPrincipios = true` → `propostaPrincipio` presente e não vazia.
15. `aprendizado.atualizarPrincipios = true` **não** implica aplicação automática de princípios (regra de governação; o schema apenas transporta a proposta).

### V5 — Integridade deliberativa

16. A `justificativa` deve referenciar, de forma verificável no texto, pelo menos um elemento de: princípios, riscos ou oportunidades, ou declarar explicitamente a ausência (ex.: “sem riscos materiais identificados”).
17. Parecer **inválido** não pode ser consumido pelo Speaker nem pela Fila; o sistema deve rejeitar ou regenerar antes de comunicar ao utilizador (ADR-019 D2).

### V6 — Extensibilidade

18. `metadados` não pode contradizer campos normativos; consumidores oficiais **ignoram** chaves desconhecidas em `metadados` sem falhar a validação do núcleo.

---

## Critérios de aceitação

* Existe especificação única e testável do `ParecerExecutivo` (esta REQ) referenciada pela ADR-019.
* Todos os enums da Decisão Executiva (`aprovar` … `adiar`) estão definidos e fechados.
* Riscos e oportunidades estão modelados como coleções **separadas**.
* Aprendizado inclui os três booleanos e a regra condicional de `propostaPrincipio`.
* Regras V1–V6 permitem a um validador (humano ou automático, em fase posterior) classificar um parecer como válido ou inválido sem ambiguidade.
* Speaker, Fila e UI são identificados como **consumidores** do contrato, sem responsabilidade de deliberar.
* Nenhum critério desta REQ exige implementação de código, classes ou ficheiros.

## Dependências

| Dependência | Papel |
|-------------|--------|
| **ADR-019** | Institui MRE e obrigatoriedade do ParecerExecutivo |
| **ADR-015** | Priorização uso operacional |
| **CON-001** | Governança e rastreabilidade |
| **REQ-045** | Destino natural de `acao.job` quando `delegar` / `despachar` |
| **REQ-046** | Fonte possível de princípios/preferências (não define o schema) |
| Painel Executivo / memória de sessão | Fonte de `dossier` (facto dinâmico) |
| Constituição / princípios permanentes | Fonte de `principiosAplicados` |

## Impacto na arquitetura

| Componente | Impacto |
|------------|---------|
| **MRE** | Único produtor do `ParecerExecutivo`; deve preencher todos os blocos obrigatórios e obedecer V1–V6 |
| **Núcleo Executivo** | Roteia para MRE nos fluxos deliberativos; não altera o schema; continua a emitir respostas determinísticas **sem** parecer quando o fluxo for estruturado (ADR-019) |
| **Speaker** | Consome apenas parecer válido; não delibera; não inventa campos |
| **Voice / UI** | Apresentam a saída do Speaker (ou derivados); não geram deliberação |
| **Fila de Execução (REQ-045)** | Pode ser alimentada a partir de `acao.job` quando a decisão/ação o exigirem |
| **Prompt monolítico atual** | Deixa de ser o contrato de decisão; passa a ser candidato a Reasoner/Speaker **após** REQs/IMP do MRE |
| **Multi-agente (futuro)** | Agentes devolvem fragmentos que **compõem** um único `ParecerExecutivo` válido — sem chat livre ao utilizador |

## Riscos e incertezas

* Rigidez excessiva do schema pode exigir versão `versaoContrato` 1.1+ cedo — mitigar com `metadados` e processo de emenda REQ.
* Sobreposição semântica entre `acao.tipo` e `decisaoExecutiva.estado` — mitigada pelas regras V3.
* Qualidade do `objetivoReal` depende do Reasoner — fora desta REQ (pertence à IMP do MRE).
* ADR-019 permanece “Aceita para modelagem”; schema aprovado; pipeline detalhado em REQ-049.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-01 — Governança |
| Norma superior | CON-001; ADR-019; ADR-015; ADR-006 |
| Origem | Gate Fase 2 — modelagem pós proposta MRE (30/07/2026) |
| Decisões derivadas | — |
| Implementação | *Proibida até REQ aprovada + fluxo ADR-006* |
| Testes | *A criar (validação de pareceres amostra)* |

## Histórico de versões

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Criação do contrato ParecerExecutivo | ADR-019 aprovado para modelagem | **Aprovado** |
