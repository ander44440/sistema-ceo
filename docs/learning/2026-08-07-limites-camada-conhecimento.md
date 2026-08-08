# Limites arquitecturais — Camada de Conhecimento

> **Tipo:** limites de escopo (arquitectura conceptual).  
> **Data:** 07/08/2026  
> **Origem:** Despacho CTO — definir limites antes de desenho estrutural.  
> **Pré-condição:** Arquitectura Conceptual da Camada aprovada (07/08/2026).  
> **Natureza:** somente limites. **Não** implementa. **Não** propõe tecnologia. **Não** desenha estrutura interna do acervo.  
> **Fundamentos:** CNC-002; REQ-004/005/014/015; ARQ-006 (K7); ADR-015; REQ-030; arquitectura conceptual 07/08.

---

## 1. O que pertence ao Acervo Oficial?

Conhecimento que satisfaz **simultaneamente**:

1. É **item de conhecimento** (CNC-002): reutilizável e **independente de uma decisão específica**.  
2. Pertence ao **património do CEO** (não à ferramenta, não ao repo da oficina).  
3. Foi **admitido por curadoria** no índice oficial (apto ou não apto — a pertença ao acervo ≠ aptidão de uso).  
4. Tem **identidade permanente**, classificação, origem e relacionamentos rastreáveis.

### Exemplos de pertença legítima (âmbito típico COA / organização)

| Classe de conteúdo | Exemplo |
|--------------------|---------|
| Identidade operacional do COA | O que é o MG2 *para o CEO* (natureza, papel, fronteira oficina) |
| Objectivo da janela / foco curado | «Uso jogável estável + menos hitch» enquanto vigente como lastro |
| Padrões e regras reutilizáveis | DEC-MVP-001 como *regra de negócio do jogo* reutilizável (não o acto de decisão em si) |
| Dores / restrições activas curadas | Hitch residual; «não embutir build no CEO» |
| Próximo passo único curado | Foco do dia/janela, enquanto for lastro reutilizável |
| Fora de escopo deliberativo | Multiplayer / pagamento complexo *como política de não-deliberar agora* |
| Lições e padrões de uso | «Cancelamento zera taxa» como conhecimento de domínio |
| Fronteiras CEO ↔ oficina | Onde governa o CEO vs onde executa o Cursor/repo |

O Briefing Curado actual, se migrado, **decompõe-se em itens** — não permanece como blob canónico.

---

## 2. O que não pertence?

| Fora do Acervo | Destino correcto |
|----------------|------------------|
| Registo histórico de uma decisão, facto ou evento pontual | Memória Organizacional (CAP-05) |
| Norma, vigência, papéis constitucionais | Governança / CAP-01 (`CON`, `ADR`, `REQ` canónicos) |
| Definição de termo normativo | Espaço de conceitos (`CNC-nnn`) |
| Competência observada de agente / BCO | Aprendizado (CAP-06) |
| Estado da fila, jobs, gates, dispatcher, agent | Lastro operacional / consciência executiva |
| Memória volátil de sessão (pendências do turno) | Memória executiva de sessão |
| Código, árvore, builds, assets do MG2 | Oficina / repositório do jogo (REQ-030) |
| Prompt, string embutida no EE, espelho JS | Projecção subordinada — **não** fonte |
| Parecer deliberativo de um turno | Saída MRE / conversa — pode *originar* proposta de item, não é o item |
| Documentação de engenharia do CEO (`ARQ`, `IMP`, learning de calibração EIC) | Acervo documental de engenharia — referenciável, não confundir com lastro de COA de produto |

**Regra de fronteira:** o acervo *pode referenciar* normas, decisões e conceitos por identificador; **não os absorve**.

---

## 3. Quais tipos de conhecimento poderão existir?

Tipos **lógicos** admitidos na Camada (taxonomia fina pode evoluir; estes são os géneros permitidos):

| Tipo | Definição operacional |
|------|------------------------|
| **Identidade de contexto** | Quem/o quê é o COA ou domínio sob governança do CEO |
| **Objectivo / foco de janela** | Prioridade reutilizável da janela actual (enquanto curada) |
| **Regra de domínio** | Regra de negócio ou de jogo estável (ex.: taxa em cancelamento) |
| **Padrão / prática** | Forma preferida de decidir ou trabalhar no COA |
| **Restrição / dor activa** | Limitação vigente que condiciona deliberação |
| **Fronteira** | O que o CEO governa vs o que fica na oficina |
| **Fora de escopo** | O que não se delibera/despacha sem novo Gate |
| **Lacuna declarada** | Facto conhecido como *ausente* (para não inventar) — meta-conhecimento de limite |
| **Lastro de estado curado** | Resumo de estado técnico *curado* (não dump live do repo) |

Todos exigem: reutilização além do turno; independência do acto decisório pontual; curadoria.

---

## 4. Quais nunca deverão entrar nessa camada?

**Proibições absolutas** (nunca admitir como item do Acervo Oficial):

1. **Engenharia do MG2** — código, arquitectura de implementação do jogo, estrutura de pastas, dependências, builds, Three.js internals.  
2. **Dump ou sync automático** do repositório externo do jogo.  
3. **Segredos** — credenciais, chaves, tokens, dados pessoais desnecessários.  
4. **Normas e ADRs como se fossem itens KNW** — vivem no registo normativo; no máximo referência.  
5. **Actos históricos brutos** — «no dia X o Patrocinador disse Y» sem elevação a padrão reutilizável (isso é CAP-05 ou conversa).  
6. **Hipóteses não curadas / alucinações do modelo** — saída LLM sem acto de admissão.  
7. **Estado live de execução** — Job pending, erro de agent, handoff (ops).  
8. **Conteúdo de outra organização/produto** sem COA e curadoria (ex.: importar Motoboy Game 1 ou terceiros como património).  
9. **Instruções de prompt / personalidade do cargo** — contrato de Constituição/Governança LLM, não acervo de domínio.  
10. **Itens sem origem rastreável** — sem quem/quando/porquê/baseado em quê.

---

## Teste rápido de admissão

Antes de qualquer item futuro:

| Pergunta | Se «não» → |
|----------|------------|
| É reutilizável para além deste turno? | Não entra |
| É independente de uma decisão/evento pontual? | CAP-05 ou conversa |
| Pertence ao património do CEO (não à oficina)? | Oficina |
| Tem origem e pode ser curado (apto/não apto)? | Não entra |
| Evita as proibições da §4? | Não entra |

---

## Relação com o Briefing actual

O Briefing Curado estático **mistura** tipos legítimos (identidade, regras, restrições) com forma ilegítima (blob canónico no motor).  
Os **limites** acima autorizam o *conteúdo* elegível a migrar para itens; **proíbem** manter o blob como fonte oficial.

---

## Fora de escopo deste documento

- Estrutura de pastas, campos, APIs, IMP.  
- Taxonomia numerada final de categorias (extensível sob REQ-014).  
- Abertura de F3/F7 ou migração do Briefing.

---

## Memória Organizacional

| Campo | Valor |
|-------|--------|
| Quem | CTO (pedido) + Engenheiro (limites) |
| Quando | 07/08/2026 |
| O quê | Escopo da Camada de Conhecimento — pertence / não pertence / tipos / nunca |
| Resultado | Limites definidos; **sem** desenho estrutural nem implementação |
| Próximo | Aguardar despacho para desenho estrutural *dentro* destes limites |
