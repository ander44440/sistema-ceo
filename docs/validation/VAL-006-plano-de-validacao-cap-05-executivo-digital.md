# VAL-006 — Plano de Validação da CAP-05 (Executivo Digital)

> **Status: Homologado — v1.0 (CTO, 24/07/2026). Execução CONCLUÍDA; VAL-006 ENCERRADA; CAP-05 homologada.**  
> Versão 1.0 — 24/07/2026. Tipo VAL (ADR-014).  
> Norma superior: CON-001 v1.0; ADR-006; ADR-014; ADR-015; VIS-004 v1.0; REQ-033 v1.0; ARQ-009 v1.0; IMP-006 v1.0 (**ENCERRADO e homologado**).  
> Este documento **planejou** a VAL-006. Resultado homologado: [`../cap-05/val-006-relatorio-consolidado.md`](../cap-05/val-006-relatorio-consolidado.md).  
> **Ciclo CAP-05:** **concluído** (Deliberação Final CTO, 24/07/2026). Baseline congelada. OE EV-033…035 arquivadas.

---

## 1. O que é / Por que / Para quem / Sucesso

| Pergunta | Resposta |
|----------|----------|
| O que é? | Plano de validação funcional, integrada e de regressão da CAP-05 — componentes H, I e J |
| Por que existe? | O IMP-006 foi homologado e encerrado; o CTO autorizou a fase VAL-006 |
| Para quem? | Patrocinador (uso e autoridade), CTO (revisão/deliberação) e Engenheiro (apoio técnico sem implementar) |
| Como medir sucesso? | Todos os critérios obrigatórios V-H, V-I, V-J, V-FLX e V-REG evidenciados; nenhuma não conformidade impeditiva aberta |

---

## 2. Objetivo

Produzir evidências objetivas e rastreáveis de que a CAP-05:

1. mantém a Memória Organizacional viva e fiel ao registrado;
2. apresenta contexto antes de pedir autoridade;
3. justifica recomendações e só aplica vigência após confirmação;
4. coordena a atenção entre Patrocinador, CTO e Engenheiro sem substituir seus papéis;
5. percorre o fluxo completo H → I → confirmação → persistência → J;
6. não causa regressão no MVP / ARQ-008;
7. respeita baixa carga cognitiva e a fronteira de execução do MG2.

---

## 3. Escopo

### 3.1 Inclui

| Área | Objeto |
|------|--------|
| H | Registro com cinco campos; persistência; recuperação; ausência explícita; contexto MG2 |
| I | Contexto H+F+B; justificativas; próximo passo; prioridades; confirmação/rejeição/ajuste |
| J | Atenção por Patrocinador, CTO e Engenheiro; rastreabilidade da classificação |
| Fluxo integrado | Memória → contexto → proposta → autoridade → persistência → coordenação |
| Regressão MVP | Abrir, ajustar foco/próximo, registrar, consultar, fechar e continuar |
| Evidências | Registros funcionais, automatizados e operacionais consolidados |

### 3.2 Exclui

| Exclui | Motivo |
|--------|--------|
| Novas funcionalidades ou correções durante VAL | IMP-006 encerrado; congelamento obrigatório |
| Alteração de REQ-033 ou ARQ-009 | Exige deliberação e novo ciclo |
| E-02/E-03, CAP-06, multiusuário, IAM, chat multiagente | Fora do escopo homologado |
| Execução técnica do MG2 dentro do CEO | RNF-02 / fronteira arquitetural |
| Declaração automática de sucesso | Resultado depende do relatório final e deliberação do CTO |

---

## 4. Congelamento e tratamento de achados

Durante a execução:

* `docs/cap-05/` e `docs/mvp/` permanecem funcionalmente congelados;
* não se corrige código, não se amplia escopo e não se altera requisito/arquitetura;
* um achado não interrompe automaticamente a coleta, salvo risco de perda de dados ou impossibilidade objetiva de prosseguir;
* correção necessária será encaminhada ao CTO para decisão sobre reabertura de IMP ou novo ciclo.

### 4.1 Classificação obrigatória

| Classe | Definição | Efeito |
|--------|-----------|--------|
| **Conformidade (C)** | Comportamento atende ao critério e à norma rastreada | Compõe evidência de aprovação |
| **Não conformidade (NC)** | Comportamento viola requisito, arquitetura, critério obrigatório ou regressão | Classificar severidade; pode impedir aprovação |
| **Oportunidade de evolução (OE)** | Melhoria desejável sem violação do escopo homologado | Registrar para ciclo futuro; não corrigir durante VAL |

### 4.2 Severidade de não conformidade

| Nível | Definição |
|-------|-----------|
| **Impeditiva** | Viola RF/RNF obrigatório, perde/inventa memória, contorna autoridade ou quebra o MVP |
| **Maior** | Compromete fluxo relevante, mas há percurso alternativo sem violar autoridade/dados |
| **Menor** | Desvio localizado sem perda de requisito essencial |

---

## 5. Critérios objetivos

### 5.1 H — Memória Organizacional Viva

| ID | Critério | Evidência mínima |
|----|----------|------------------|
| V-H1 | Decisão aceita somente com quem, quando, por quê, baseado em quê e resultado | Teste de registro completo + rejeição de cada campo ausente |
| V-H2 | Histórico reaparece em nova sessão sem reentrada narrativa | Registro em sessão A; recuperação em sessão B |
| V-H3 | Consulta retorna somente conteúdo registrado | Comparação entre entrada persistida e saída |
| V-H4 | Tema ausente gera declaração explícita, sem invenção | Consulta negativa registrada |
| V-H5 | Contexto permanece MG2 | Registro/consulta e tentativa de contexto externo |
| V-H6 | Conhecimento CAP-04 não é absorvido como decisão H | Verificação de separação dos contratos |

### 5.2 I — Condução Executiva

| ID | Critério | Evidência mínima |
|----|----------|------------------|
| V-I1 | Pedido de autoridade é bloqueado antes da montagem de contexto | Tentativa fora de ordem |
| V-I2 | Pacote apresenta B + F + H pertinentes, ou ausência explícita | Inspeção de fontes e resumo |
| V-I3 | Patrocinador identifica por que a decisão é pedida agora | Motivo observável no pacote |
| V-I4 | Toda proposta tem justificativa ou limitação explícita | Próximo passo e prioridade |
| V-I5 | Proposta não vigora antes da confirmação | Estado antes/depois |
| V-I6 | Rejeição preserva base e não altera vigência | Rejeitar proposta e comparar estado |
| V-I7 | Ajuste confirmado aplica somente o enunciado ajustado | Confirmação com ajuste |
| V-I8 | No máximo um próximo passo vigente | Estado final após propostas sucessivas |
| V-I9 | Condução orienta; não executa MG2 | Inspeção funcional e de superfície |

### 5.3 J — Coordenação de Papéis

| ID | Critério | Evidência mínima |
|----|----------|------------------|
| V-J1 | Itens são apresentados por Patrocinador, CTO ou Engenheiro | Cenário contendo os três papéis |
| V-J2 | Classificação é rastreável a H/F | Origem e base observáveis |
| V-J3 | Item ambíguo permanece com Patrocinador | Cenário sem marcador de papel |
| V-J4 | Coordenação não delibera pelo CTO nem implementa pelo Engenheiro | Inspeção das operações disponíveis |
| V-J5 | Não há IAM/chat multiagente embutido | Inspeção de escopo |

### 5.4 Fluxo completo

| ID | Critério | Evidência mínima |
|----|----------|------------------|
| V-FLX1 | Ordem H/F/B → contexto → proposta → autoridade → persistência | Registro cronológico do percurso |
| V-FLX2 | Confirmação atualiza F e efeito pode ser recuperado | Estado posterior e nova sessão |
| V-FLX3 | Decisão resultante pode ser registrada em H com rastreabilidade | Registro com referência ao pacote |
| V-FLX4 | J reflete memória/estado após o fluxo | Atenção por papel posterior |
| V-FLX5 | Fluxo é percorrível com baixa carga cognitiva | Observação do patrocinador + quantidade de ações/campos |

### 5.5 Regressão do MVP

| ID | Critério | Evidência mínima |
|----|----------|------------------|
| V-REG1 | Painel do Dia continua abrindo | Percurso em `docs/mvp/index.html` |
| V-REG2 | Abrir → foco/próximo → fechar continua funcional | Estado antes/depois |
| V-REG3 | Registrar decisão/conhecimento e consultar continuam funcionais | Um cenário positivo e um de ausência |
| V-REG4 | Continuidade reapresenta estado sem reexplicação | Reabertura simulada |
| V-REG5 | Limites do MVP permanecem | MG2 único; patrocinador único; atenção ≤3; execução externa |
| V-REG6 | VAL-005 não foi alterada pela CAP-05 | Comparação dos artefatos congelados |

---

## 6. Cenários de validação

| Cenário | Sequência resumida | Critérios |
|---------|--------------------|-----------|
| S1 — Memória completa | Registrar → fechar sessão → recuperar → consultar tema ausente | V-H1…H6 |
| S2 — Ordem de autoridade | Pedir antes do contexto → montar contexto → propor → pedir | V-I1…I4 |
| S3 — Sugerir sem impor | Propor → observar estado → rejeitar; repetir → ajustar/confirmar | V-I5…I8 |
| S4 — Papéis | Gerar itens CTO/Engenheiro/Patrocinador/ambíguo → coordenar | V-J1…J5 |
| S5 — Fluxo E2E | H/F/B → I → autoridade → F/H → J → nova sessão | V-FLX1…FLX5 |
| S6 — Regressão | Percorrer eixo diário e registros no MVP congelado | V-REG1…REG6 |

---

## 7. Estratégia e ordem de execução

```text
V0 Preparação/congelamento
  → V1 H
  → V2 I
  → V3 J
  → V4 Fluxo integrado
  → V5 Regressão MVP
  → V6 Consolidação e relatório
```

| Etapa | Saída |
|-------|-------|
| V0 | Inventário, versão congelada e formulário de evidências |
| V1 | Evidências V-H1…H6 |
| V2 | Evidências V-I1…I9 |
| V3 | Evidências V-J1…J5 |
| V4 | Evidências V-FLX1…FLX5 |
| V5 | Evidências V-REG1…REG6 |
| V6 | Matriz final, achados classificados e relatório consolidado |

---

## 8. Instrumentos e evidências

| Instrumento | Uso |
|-------------|-----|
| `docs/cap-05/executivo.html` | Observação funcional de I/J |
| `docs/cap-05/*.js` | Inspeção de contratos H/I/J |
| `docs/cap-05/*.test.js` | Evidência automatizada complementar |
| `docs/mvp/index.html` | Regressão do MVP |
| Registro de sessão VAL-006 | Passos, esperado, observado, classe e anexos |
| Relatório consolidado VAL-006 | Resultado final para CTO |

### 8.1 Registro mínimo por evidência

Cada evidência deverá conter:

1. ID único (`VAL006-EV-nnn`);
2. data/hora e executor;
3. cenário e critério rastreado;
4. pré-condição e passos;
5. resultado esperado e observado;
6. classificação C / NC / OE;
7. severidade, quando NC;
8. arquivos, captura ou saída de teste;
9. impacto e encaminhamento — sem implementação durante VAL.

---

## 9. Responsáveis

| Papel | Responsabilidade na VAL-006 |
|-------|------------------------------|
| Patrocinador | Percorrer cenários de autoridade; avaliar contexto, justificativa, baixa carga e clareza dos papéis |
| CTO | Homologar plano; revisar evidências; deliberar resultado final e encaminhamentos |
| Engenheiro | Preparar/registrar execução técnica e regressão; não alterar implementação |

---

## 10. Critérios de aprovação e reprovação

### Aprovação

Todos os critérios V-H, V-I, V-J, V-FLX e V-REG possuem evidência suficiente de conformidade; não existe NC impeditiva ou maior aberta; oportunidades de evolução estão separadas do escopo homologado.

### Aprovação condicionada

Somente por deliberação explícita do CTO, quando houver NC menor sem impacto em autoridade, fidelidade da memória, fluxo essencial ou regressão do MVP.

### Reprovação

Qualquer uma das condições:

* memória perdida, inventada ou não recuperável;
* autoridade solicitada sem contexto ou vigência sem confirmação;
* recomendação sem justificativa/limitação explícita;
* coordenação que substitui CTO/Engenheiro;
* regressão obrigatória do MVP;
* falta de evidência de critério obrigatório;
* NC impeditiva ou maior aberta.

---

## 11. Relatório consolidado final

Ao término de V6, produzir:

`docs/cap-05/val-006-relatorio-consolidado.md`

Conteúdo mínimo:

1. síntese executiva;
2. ambiente e versão congelada;
3. resultados por componente H/I/J;
4. fluxo completo;
5. regressão MVP;
6. matriz de critérios;
7. inventário das evidências;
8. conformidades;
9. não conformidades com severidade;
10. oportunidades de evolução;
11. conclusão técnica;
12. pedido de deliberação final da CAP-05 ao CTO.

---

## 12. Estado processual

| Ato | Status |
|-----|--------|
| IMP-006 | **Homologado e ENCERRADO** (não reabrir) |
| VAL-006 | **Homologada, executada e ENCERRADA** |
| CAP-05 | **Homologada e concluída** — baseline do Sistema CEO |
| REQ-033 / ARQ-009 / IMP-006 | **Congelados** |
| OE EV-033…035 | **Arquivadas** — [`../cap-05/oportunidades-evolucao-arquivadas.md`](../cap-05/oportunidades-evolucao-arquivadas.md) |
| Resultado final CAP-05 | **Deliberado e homologado** (24/07/2026) |

---

## Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 24/07/2026 | Engenheiro (Cursor) | Criação do plano; critérios H/I/J, E2E, regressão e classificação de achados | Deliberação CTO — homologação IMP-006 e abertura VAL-006 | Em análise |
| 1.0 | 24/07/2026 | CTO (homologação) / Engenheiro (execução) | Homologação; execução S1–S6; relatório; encerramento formal após deliberação final | Deliberação CTO — VAL-006 e homologação CAP-05 | **Homologado e ENCERRADO** |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou e executou; CTO homologou o plano, o resultado e a CAP-05 |
| Quando | 24/07/2026 |
| Por quê | Validar e encerrar formalmente a CAP-05 |
| Baseado em quê | Deliberação Final do CTO — homologação CAP-05; REQ-033; ARQ-009; IMP-006; ADR-014 |
| Resultado | VAL-006 encerrada; CAP-05 na baseline; OE arquivadas; ciclo completo concluído |
