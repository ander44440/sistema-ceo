# IMP-011 — Contrato e Validação do ParecerExecutivo

> **Status: Implementação concluída — aguarda validação conjunta do Bloco 1 — v0.2 (30/07/2026).**  
> Tipo IMP (ADR-012). **Bloco 1 / Fase F1** do [IMP-010](IMP-010-plano-de-implementacao-mre.md).  
> Norma superior: REQ-048; ARQ-013; IMP-010; ADR-019 (*não alterado*).  
> **Código:** `app/src/mre/parecer/`. Relatório: [`evidencias/BLOCO-1-relatorio-consolidado.md`](evidencias/BLOCO-1-relatorio-consolidado.md).

---

## 1. Objetivo

Materializar o **contrato lógico** do `ParecerExecutivo` e um **validador determinístico** das regras V1–V6 (REQ-048), de modo que qualquer produtor ou consumidor futuro possa classificar um parecer como **válido** ou **inválido** sem ambiguidade.

## 2. Escopo

### Inclui

* Representação lógica completa do parecer (raiz + blocos) conforme REQ-048.
* Enums fechados e obrigatoriedade/opcionalidade.
* Validador V1–V6 com resultado estruturado (válido / lista de violações).
* Conjunto mínimo de pareceres fixture (válidos e inválidos) para evidência.
* Interface lógica: `validar(parecer) → { ok, violacoes[] }`.

### Fora do escopo

* Pipeline MRE (IMP-012), Aprendizado com critérios M/P/R (IMP-013 — só o **schema** do bloco `aprendizado` entra aqui).
* Speaker, Núcleo, Voice, Fila, UI.
* Persistência física, serialização normativa única (JSON concreto é escolha tática na execução, não neste plano).
* Cálculo de `confianca` por fórmula de negócio (apenas validar ∈ [0, 1]).

## 3. Componentes envolvidos

| Componente lógico | Responsabilidade |
|-------------------|------------------|
| Modelo ParecerExecutivo | Estrutura de dados alinhada a REQ-048 |
| Catálogo de enums | Natureza, TipoPedido, Urgencia, FonteFacto, NivelRisco, ValorOportunidade, EstadoDecisao, TipoAcao, PrioridadeJob |
| Validador V1–V6 | Regras determinísticas; sem LLM |
| Fixtures de parecer | Casos de ouro para testes e fases seguintes |
| Relatório de violação | Código/regra + caminho do campo + mensagem |

## 4. Dependências

| Dependência | Tipo | Nota |
|-------------|------|------|
| REQ-048 | Norma | Fonte canónica do schema |
| ARQ-013 / IMP-010 F1 | Plano | Ordem e critérios de fase |
| Nenhuma IMP anterior do Bloco 1 | — | Fase inicial |

**Bloqueia:** IMP-012 e IMP-013 (e demais fases do IMP-010) até gate desta IMP.

## 5. Estratégia de implementação

1. Transcrever campos e enums da REQ-048 para o modelo lógico (sem inventar campos).  
2. Implementar validação por camadas: V1 forma → V2 listas → V3 decisão↔ação → V4 aprendizado → V5 justificativa → V6 metadados.  
3. Falhar **fechado**: qualquer enum fora da lista = inválido.  
4. Produzir fixtures:  
   - pelo menos 1 parecer válido completo;  
   - pelo menos 1 por regra V3 crítica (`solicitar_dados`, `delegar`, `monitorar`/`adiar`, `rejeitar`+despachar ilegal, `aprovar`+despachar sem job);  
   - 1 com `atualizarPrincipios=true` sem `propostaPrincipio` (inválido V4);  
   - 1 com `confianca` fora de [0,1].  
5. Expor apenas a API lógica de validação; não acoplar a UI.  
6. Evidência: matriz regra → fixture → resultado esperado.

## 6. Critérios de conclusão

* Validador cobre V1–V6 de forma observável.  
* Parecer válido de referência passa; violações intencionais falham com regra identificável.  
* Enums de `EstadoDecisaoExecutiva` fechados: estados livres rejeitados.  
* `riscos` e `oportunidades` validados como coleções distintas (V2).  
* Documentação de evidência do gate F1 anexável ao ciclo IMP-010.  
* Nenhuma dependência de Speaker/Núcleo para concluir esta fase.

## 7. Critérios de teste

| ID | Caso | Esperado |
|----|------|----------|
| T11-01 | Fixture válido completo | `ok = true` |
| T11-02 | Campo obrigatório ausente / string vazia (V1) | `ok = false`, violação V1 |
| T11-03 | Enum ilegal em `estado` | rejeitado |
| T11-04 | `solicitar_dados` sem `perguntar` ou sem lacunas | V3 |
| T11-05 | `delegar` sem `job` | V3 |
| T11-06 | `monitorar`/`adiar` com tipo ≠ `aguardar` | V3 |
| T11-07 | `rejeitar` + `despachar` | V3 |
| T11-08 | `aprovar` + `despachar` sem job | V3 |
| T11-09 | `atualizarPrincipios=true` sem proposta | V4 |
| T11-10 | `confianca = 1.5` | V1 |
| T11-11 | Justificativa sem referência nem declaração de ausência | V5 (heurística documental acordada na execução) |
| T11-12 | `metadados` com chave desconhecida | não invalida o núcleo (V6) |

## 8. Riscos conhecidos

| Risco | Mitigação |
|-------|-----------|
| V5 (justificativa) ambígua para automação | Critério mínimo explícito na execução + casos documentados; não bloquear V1–V4 |
| Drift do modelo vs REQ-048 | Fixtures e checklist campo-a-campo na evidência |
| Serialização prematura amarra formatos | Manter contrato lógico; formato de ficheiro = detalhe tático |
| Over-engineering do validador | Só V1–V6; sem regras extras |

## 9. Rastreabilidade

| Elo | Ref. |
|-----|------|
| Fase IMP-010 | F1 |
| REQ | 048 |
| Seguintes | IMP-012, IMP-013 |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Patrocinador (mandato); Engenheiro (Cursor) | Spec F1 — contrato/validação | Em análise |
| 0.2 | 30/07/2026 | Engenheiro (Cursor) | Implementação + testes T11-01…12 | Aguarda gate |
