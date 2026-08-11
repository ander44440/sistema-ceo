# GOV-001 — Norma de Emissão de Pareceres Arquiteturais

> **Status:** Em análise — aguarda homologação.  
> **Versão:** 1.0 — 04/08/2026.  
> **Tipo:** GOV — Norma de governança técnica (processo).  
> **Identificação:** GOV-001.  
> **Elaboração:** Especialista C — Arquitetura e Governança Técnica (DESP-C-002).  
> **Origem do despacho:** Coordenador Executivo.  
> **Norma superior:** CON-001; ADR-002; ADR-006; ADR-010.  
> **Lastro empírico:** Parecer DESP-C-001 (ARQ-030) e evoluções de template adotadas em sessão.  
> **Efeito:** normatiza exclusivamente o **processo de emissão de Pareceres Arquiteturais**.  
> **Não faz:** revisar artefatos existentes; alterar documentos homologados; redesenhar produto; abrir CAP/REQ/ARQ de capacidade.

---

## 0. Quadro canónico (ADR-002)

| Pergunta | Resposta |
|----------|----------|
| **O que é?** | Norma que define estrutura, regras de preenchimento, classificação de não conformidades, alçadas, decisões e rastreabilidade dos Pareceres Arquiteturais do Sistema CEO. |
| **Por que existe?** | O primeiro parecer oficial (DESP-C-001) e as evoluções de template revelaram a necessidade de um padrão estável, independente de pessoas e reutilizável em qualquer ciclo. |
| **Para quem existe?** | Alçada de Arquitetura (emissão); Alçada de Governança (homologação da norma e dos pareceres); Alçada Executiva (despachos); Alçada do Patrocinador (Gate final quando aplicável); Engenheiro (execução corretiva). |
| **Como medir sucesso?** | (1) Todo parecer novo segue esta norma; (2) NCs classificadas com alçada de decisão e responsável de execução; (3) decisões usam apenas o vocabulário oficial; (4) rastreabilidade CON/VIS/REQ/ADR/CAP/ARQ/IMP/VAL explícita; (5) ressalvas têm condições de homologação verificáveis. |

---

## 1. Objecto e âmbito

### 1.1 Objecto

Esta norma regula a **emissão, estrutura, decisão e rastreabilidade** de Pareceres Arquiteturais emitidos pela Alçada de Arquitetura.

### 1.2 Âmbito

Aplica-se a pareceres sobre artefatos técnicos e de governação relacionados a: ANL, REQ, ADR, ARQ, IMP, VAL, CAP, ROADMAP e demais documentos cujo impacto arquitectural ou de governação técnica justifique análise.

### 1.3 Fora de âmbito

| Item | Nota |
|------|------|
| Implementação de código | Papel do Engenheiro |
| UX / conversação operacional | Fora da Alçada de Arquitetura |
| Redesign de produto sob parecer | Exige ciclo ADR-006 próprio |
| Alteração de artefatos homologados pelo parecer | O parecer recomenda; a alteração segue alçada e fluxo oficiais |
| Inscrição do tipo GOV no catálogo `docs/README.md` | Exige ADR de tipo documental (regra do catálogo); **não** é objecto desta norma de conteúdo |

### 1.4 Localização

| Campo | Valor |
|-------|--------|
| Sede desta norma | `docs/governance/GOV-001-norma-emissao-pareceres-arquiteturais.md` |
| Pareceres emitidos | Preferência: `docs/governance/pareceres/` ou anexo ao despacho; o ID do parecer deve ser rastreável (`PARC-nnn` ou `DESP-C-nnn`) |

---

## 2. Princípios

1. **Arquitectura antes de execução** — o parecer avalia impacto estrutural antes de autorizar progresso.  
2. **Alçada ≠ pessoa** — a decisão cita alçada; a execução cita responsável operacional.  
3. **Unicidade de status** — um artefato sob análise não pode ser simultaneamente homologado e em análise no mesmo corpo normativo.  
4. **Rastreabilidade** — toda conformidade declara elos CON/VIS/REQ/ADR/CAP (e ARQ/IMP/VAL quando aplicável).  
5. **Mínimo necessário** — o parecer entrega só o necessário para decidir com segurança (CON-001 Art. 9º).  
6. **Não implementação** — a Alçada de Arquitetura não implementa código nem altera artefatos sob o próprio parecer, salvo despacho explícito de correcção documental pela alçada competente.  
7. **Separação produto × processo** — esta norma não redefine arquitectura de produto.

---

## 3. Estrutura oficial do Parecer Arquitetural

Todo Parecer Arquitetural **completo** contém as secções abaixo, nesta ordem. Secções marcadas como *obrigatórias* não podem ser omitidas. Secções *condicionais* omitem-se apenas com declaração explícita «N/A — motivo».

### 3.1 Cabeçalho (obrigatório)

```text
PARECER ARQUITETURAL

Artefato:
Tipo:
Versão:
Data:
Autor:          (elaborador do artefato sob análise, se conhecido)
Revisor:        (Alçada de Arquitetura / identificação do parecer, ex. DESP-C-nnn)
Despacho:       (ID do despacho, se houver)
```

### 3.2 Corpo (obrigatório)

| # | Secção | Obrigatoriedade |
|---|--------|-----------------|
| 1 | Resumo Executivo | Obrigatória |
| 2 | Análise de Impacto | Obrigatória |
| 2.1 | Arquitetura | Obrigatória |
| 2.2 | Acoplamento | Obrigatória |
| 2.3 | Coesão | Obrigatória |
| 2.4 | Escalabilidade | Obrigatória |
| 2.5 | Performance | Obrigatória (ou N/A justificado) |
| 2.6 | Segurança | Obrigatória (ou N/A justificado) |
| 2.7 | Observabilidade | Obrigatória (ou N/A justificado) |
| 2.8 | Compatibilidade | Obrigatória |
| 2.9 | Impacto em módulos existentes | Obrigatória |
| 3 | Conformidade | Obrigatória |
| 4 | Riscos | Obrigatória |
| 5 | Dívida Técnica Potencial | Obrigatória |
| 6 | Recomendações | Obrigatória |
| 7 | Decisão | Obrigatória |
| 8 | Condições para Homologação | Obrigatória se decisão ≠ APROVADO pleno; senão «Nenhuma além do Gate habitual» |
| 9 | Impacto Futuro | Obrigatória |
| 10 | Classificação das Não Conformidades | Obrigatória (pode ser «Nenhuma NC identificada») |

### 3.3 Encerramento (obrigatório)

```text
Fim do Parecer <ID>.
Aguardar novo despacho.   (quando aplicável)
```

---

## 4. Regras de preenchimento por secção

### 4.1 Resumo Executivo

- Máximo: o necessário para uma decisão informada (preferência: 5–10 linhas).  
- Deve declarar: objecto, veredito preliminar, e se há bloqueio de governação vs. defeito de desenho.  
- Não repetir o template vazio.

### 4.2 Análise de Impacto

- Cada subsecção 2.1–2.9 usa marcadores `✔` (adequado), `⚠` (atenção/ressalva), `✖` (não conforme / bloqueante), ou `N/A`.  
- Afirmações devem ser verificáveis no artefato citado (secção/ID).  
- «Impacto em módulos existentes» inclui tabela módulo → impacto quando houver mais de um módulo.

### 4.3 Conformidade

Declarar explicitamente:

| Elo | Conteúdo |
|-----|----------|
| CON | Constituição / artigos relevantes |
| VIS | Visão(ões) aplicáveis |
| REQ | Requisito(s) que o artefato satisfaz ou implementa |
| ADR | Decisões vinculantes (ex. ADR-006, ADR-015) |
| CAP | Capacidade única (quando aplicável) |

Em seguida classificar o artefato como:

- **Conforme**
- **Parcialmente conforme**
- **Não conforme**

com lista do que cai em cada bucket.

### 4.4 Riscos

- Tabela: ID · Risco · Severidade (Alta/Média/Baixa) · Nota / mitigação observada.  
- Incluir riscos de **governação** (ex. status contraditório) quando detectados — não só riscos de runtime.

### 4.5 Dívida Técnica Potencial

- Itens que o desenho **introduz ou tolera**, mesmo se aceitáveis no escopo actual.  
- Distinguir dívida de produto vs. dívida de processo/verificação.

### 4.6 Recomendações

- Accionáveis, priorizáveis, sem ambiguidade de alçada.  
- Não misturar recomendação de produto fora de escopo com correcção documental.

### 4.7 Decisão

Ver §6 desta norma. Exactamente **uma** opção marcada.

### 4.8 Condições para Homologação

- Lista numerada, verificável, necessária para remover ressalvas ou desbloquear Gate.  
- Cada condição deve ter dono implícito via NCs (§10) ou alçada explícita.

### 4.9 Impacto Futuro

Cobrir no mínimo:

- Extensibilidade  
- Manutenibilidade  
- Evolução da plataforma  
- Compatibilidade com roadmap  

### 4.10 Não Conformidades

Ver §5 desta norma.

---

## 5. Classificação das Não Conformidades (NCs)

### 5.1 Classes

| Classe | Nome | Objecto |
|--------|------|---------|
| **NC-A** | Arquitetura | Desenho estrutural, acoplamento, contratos, escalabilidade, fronteiras de módulo |
| **NC-G** | Governança | Gates, status normativo, alçadas, fluxo ADR-006, coerência de autorização |
| **NC-I** | Implementação | Código, deploy executado, evidência de runtime **quando** o parecer abrange IMP/VAL ou cadeia já executada |
| **NC-D** | Documentação | Metadados, Memória, Histórico, referências cruzadas, índices, instruções obsoletas |

### 5.2 Campos obrigatórios por NC

| Campo | Regra |
|-------|-------|
| **ID** | `NC-<classe><número>` (ex. `NC-G1`) |
| **Descrição** | Facto observável no artefato ou cadeia |
| **Severidade** | Alta · Média · Baixa (ou «Fora do escopo» com apontamento) |
| **Impacto** | Consequência se não corrigido |
| **Responsável pela decisão** | **Somente alçada** (§7) |
| **Responsável pela execução** | **Papel operacional** (§8) |

### 5.3 Critérios de classificação

| Se a falha é… | Classe |
|---------------|--------|
| do desenho / fronteiras / invariantes técnicos | NC-A |
| de Gate, status, autorização entre etapas | NC-G |
| de código, bundle, comportamento runtime comprovado | NC-I |
| de texto, metadados, elos, Memória, índices | NC-D |

Uma mesma causa-raiz pode gerar **mais de uma NC** em classes distintas (ex. status contraditório = NC-G + NC-D), desde que cada NC tenha descrição própria.

### 5.4 Quando declarar «Nenhuma NC»

Permitido apenas se a Análise de Impacto e a Conformidade não revelarem desvio. Dívida aceite conscientemente sem desvio normativo pode constar só em §5 (Dívida), sem NC.

---

## 6. Critérios de decisão do parecer

Exactamente uma das três decisões:

### 6.1 APROVADO

Usar quando **todas** forem verdadeiras:

1. Conformidade sem itens «Não conforme» materiais.  
2. Nenhuma NC de severidade **Alta**.  
3. Nenhuma condição bloqueante em §8.  
4. Desenho (ou processo) adequado ao escopo sem ressalva estrutural.

### 6.2 APROVADO COM RESSALVAS

Usar quando:

1. O desenho / objecto principal é **aprovável** (não exige redesign estrutural), **e**  
2. Existem NC-G, NC-D, NC-A não bloqueantes do objecto, ou riscos/dívidas que exigem correcção **antes** de «homologação limpa» ou progresso sem dívida registada, **e**  
3. As ressalvas são listadas em §8 com condições verificáveis.

### 6.3 REVISÃO NECESSÁRIA

Usar quando **qualquer** for verdadeira:

1. Despacho incompleto (artefato/versão ausente).  
2. Não conformidade estrutural que exige redesign ou reescrita material do artefato.  
3. NC-A ou NC-G de severidade Alta que **invalida** o objecto do artefato (não apenas metadados corrigíveis).  
4. Incompatibilidade com CON/VIS/REQ/ADR/CAP que não se resolve por correcção editorial.  
5. Impossibilidade de avaliar por falta de informação essencial.

### 6.4 Proibições

- Não inventar quarta decisão.  
- Não marcar duas decisões.  
- Não usar APROVADO se o mesmo documento declara status contraditórios materiais (tratar como no mínimo APROVADO COM RESSALVAS ou REVISÃO NECESSÁRIA conforme gravidade).

---

## 7. Alçadas decisórias

No corpo do parecer, a coluna **Responsável pela decisão** usa **apenas** as alçadas abaixo. Não usar nomes de pessoas nem funções transitórias (CTO, Especialista C, Patrocinador como rótulo de decisão).

| Alçada | Âmbito decisório |
|--------|------------------|
| **Alçada de Arquitetura** | Padrões técnicos, impacto estrutural, NC-A, contratos de verificação, evolução do template de parecer |
| **Alçada de Governança** | Gates do fluxo ADR-006, status normativo, coerência de cadeia documental, NC-G e NC-D materiais, homologação desta norma GOV |
| **Alçada Executiva** | Priorização e sequência operacional de correcções; despachos; coordenação entre frentes |
| **Alçada do Patrocinador** | Gate final de produto/produção; aceite ou rejeição de risco residual; autoridade máxima (CON-001) |

### 7.1 Glossário-espelho (informativo — fora do corpo das NCs)

O mapeamento alçada → ocupante actual vive em documento de papéis / Constituição operacional e **pode mudar** sem emendar pareceres já emitidos. Pareceres citam alçadas; não citam ocupantes.

### 7.2 Co-decisão

Quando duas alçadas concorrem (ex. Gate final + prioridade), listar ambas na célula de decisão, separadas por «·», com o papel de cada uma entre parênteses curtos se necessário.

---

## 8. Responsáveis pela execução

A coluna **Responsável pela execução** identifica quem **implementa** a correcção aprovada.

| Responsável operacional | Tipicamente executa |
|-------------------------|---------------------|
| **Engenheiro** | Correcções documentais, código, deploy, evidências, índices (quando autorizado) |
| **Coordenador Executivo** | Encaminhamento de despachos, acompanhamento de prazo (sem decidir arquitectura) |
| **Outro papel operacional nomeado** | Somente se o despacho o definir |

A execução **não** se traduz em alçada. Quem executa não homologa a própria correcção normativa sem a alçada de decisão correspondente.

---

## 9. Rastreabilidade entre elos da cadeia

### 9.1 Elos mínimos no parecer

| Elo | Quando obrigatório |
|-----|--------------------|
| CON | Sempre (pelo menos referência à Constituição / artigos motivadores) |
| VIS | Quando o artefato deriva de visão de capacidade ou produto |
| REQ | Quando o artefato implementa, detalha ou valida requisito(s) |
| ADR | Quando decisões ADR vinculam o objecto (mínimo ADR-006 se for ciclo de capacidade) |
| CAP | Quando o artefato rastreia capacidade do CAP-001 |
| ARQ | Quando o objecto é ARQ ou a IMP/VAL depende de ARQ |
| IMP | Quando o parecer cobre implementação ou cadeia pós-ARQ |
| VAL | Quando o parecer cobre validação ou fecho de ciclo |

### 9.2 Regras

1. Citar **ID + status aparente** do elo no momento do parecer.  
2. Se houver divergência de status entre artefatos da mesma cadeia, registar como **NC-G** e/ou **NC-D**.  
3. Não «corrigir» elos dentro do parecer — apenas diagnosticar e recomendar.  
4. Parecer sobre ARQ deve verificar se IMP/VAL posteriores respeitam o Gate ADR-006 (arquitectura aprovada autoriza implementação).

### 9.3 Identificação do parecer

| Campo | Formato sugerido |
|-------|------------------|
| ID do parecer | `PARC-nnn` ou referência ao despacho `DESP-C-nnn` |
| Artefato | ID canónico (ex. `ARQ-030`) |
| Versão analisada | Versão constante no documento (ex. `0.1`) |

---

## 10. Tratamento de ressalvas e homologação

### 10.1 Ressalvas

- Toda decisão **APROVADO COM RESSALVAS** exige §8 com condições numeradas.  
- Cada condição deve mapear a pelo menos uma NC ou a um risco aceite pela alçada competente.  
- Ressalvas não são opcionais: bloqueiam «homologação limpa» até cumprimento ou aceite formal de risco pela alçada adequada.

### 10.2 Homologação do artefato sob parecer

| Situação | Efeito |
|----------|--------|
| APROVADO | Alçada de Governança pode homologar o artefato sem condições extra desta norma |
| APROVADO COM RESSALVAS | Homologação limpa **após** cumprimento de §8 **ou** aceite explícito de risco residual pela alçada competente |
| REVISÃO NECESSÁRIA | Homologação **proibida** até novo parecer pós-revisão |

### 10.3 Homologação desta norma (GOV-001)

1. Alçada de Governança revê e homologa GOV-001.  
2. Alçada do Patrocinador avaliza se exigido pela política vigente.  
3. Eventual ADR de criação do tipo documental GOV + inscrição no catálogo oficial — **etapa separada**, não bloqueia o uso interno desta norma após homologação de conteúdo pela Alçada de Governança.  
4. Após homologação: status → `Homologada` / `Aprovado`; Memória e Histórico alinhados (unicidade de status).

### 10.4 Correcções decorrentes de parecer

1. Alçada de decisão aprova / prioriza a acção.  
2. Responsável pela execução materializa.  
3. Se a correcção alterar artefato normativo, registar Histórico + Memória Organizacional.  
4. NC de severidade Alta exigem re-verificação pela Alçada de Arquitetura (parecer delta ou despacho de fecho).

---

## 11. Pré-condições para emitir um parecer

O revisor **não emite** parecer completo se faltar:

| # | Pré-condição |
|---|--------------|
| P1 | Artefato nomeado (ID + tipo) |
| P2 | Versão identificável no documento (ou declaração de ausência = REVISÃO NECESSÁRIA) |
| P3 | Objectivo do despacho claro |
| P4 | Acesso ao texto do artefato |

Despacho incompleto → parecer de **devolução** com decisão **REVISÃO NECESSÁRIA** (como em DESP-C-001 pré-artefato), sem inventar objecto.

---

## 12. Vocabulário de severidade

| Severidade | Significado |
|------------|-------------|
| **Alta** | Compromete Gate, segurança normativa, equivalência crítica ou confiança no estado do artefato |
| **Média** | Degrada qualidade, rastreio ou robustez; corrigível sem redesign total |
| **Baixa** | Cosmético, dívida aceite no horizonte actual, ou melhoria não bloqueante |

---

## 13. Relação com outras normas

| Norma | Relação |
|-------|---------|
| CON-001 | Hierarquia máxima; papéis; rastreabilidade; tempo do utilizador |
| ADR-002 | Quatro perguntas; conhecimento pertence ao CEO (alçadas > pessoas) |
| ADR-006 | Gates ANL→REQ→ARQ→IMP→VAL; parecer reforça, não substitui |
| ADR-010 | Natureza dos ARQ sob análise |
| ADR-004 / catálogo | Novo tipo GOV no índice oficial exige ADR própria |

---

## 14. Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | Especialista C (Alçada de Arquitetura), sob DESP-C-002 do Coordenador Executivo |
| Quando | 04/08/2026 |
| O quê | GOV-001 v1.0 — Norma de Emissão de Pareceres Arquiteturais |
| Por quê | Consolidar template canónico, NCs, alçadas, decisões e rastreabilidade após o primeiro parecer oficial |
| Resultado | Em análise — pronto para homologação; zero alteração a artefatos homologados; zero redesign de produto |

---

## 15. Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 1.0 | 04/08/2026 | Alçada de Arquitetura (DESP-C-002) | Norma completa — estrutura do parecer, NCs, alçadas, decisões, rastreabilidade, ressalvas/homologação | Em análise — aguarda homologação |

---

**Estado:** Em análise — aguarda **homologação** pela Alçada de Governança.  
**Próximo passo oficial:** Gate de homologação de GOV-001; eventual ADR de tipo documental GOV (fora deste entregável).
