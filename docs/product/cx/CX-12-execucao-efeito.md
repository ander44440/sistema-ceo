# CX-12 — Acompanhar Execução e Efeito

> **Status: Homologada — Gate F3-14 APROVADO (CTO, 26/07/2026).**  
> **Versão:** v0.1 — 26/07/2026 (homologada)  
> **Classificação (F3-02):** Derivada (de ciclo)  
> **MVP arquitetural:** Sim  
> **Precedência:** O3  
> **Domínios:** D5 → D1 / D2  
> **Nome canônico (F3-04):** Acompanhar Execução e Efeito  
> **Bloco de execução (F3-02 O3):** saída observável — **execução** da ação autorizada (D5) e percepção do **efeito**; fecha O3 após CX-10 e CX-11 (condicional)  
> **Padrão metodológico:** [`../F3-03-modelo-canonico-especificacao-capacidades.md`](../F3-03-modelo-canonico-especificacao-capacidades.md)  
> **Catálogo:** [`../F3-04-catalogo-oficial-capacidades.md`](../F3-04-catalogo-oficial-capacidades.md)  
> **Proibições:** sem requisitos detalhados; sem arquitetura técnica; sem componentes; sem APIs; sem wireframes; sem implementação; sem commit neste registro.

---

## 1. Propósito

Realizar, no COA ativo, a **execução da ação autorizada** (D5 — único executor) e tornar **perceptível**, na medida do comando, que algo foi executado e **o que mudou** — efeito relevante, estado em curso ou bloqueio (PX-01; IX-08; F2-02 D5).

### Papel no bloco de execução (O3)

| Etapa O3 | Capacidade | Papel |
|----------|------------|--------|
| Entrada | CX-10 | Solicitação de meios / encaminhamento |
| Condicional | CX-11 | Autorização humana quando O-03 exige |
| **Saída** | **CX-12** | Executa (D5) e torna o efeito observável em D1/D2 |

Sem CX-12, o ciclo tem pedido e eventual gate, mas o usuário não vê execução nem efeito — ou a experiência degenera em log técnico no lugar da Atenção.

---

## 2. Responsabilidade

### Compete a esta CX

* **Executar** a ação correspondente ao encaminhamento autorizado (D5), sob o COA ativo.  
* Tornar perceptível o estado **em curso**, o **efeito relevante** e o **bloqueio** — em linguagem de comando, não de telemetria bruta.  
* Operar somente quando as **pré-condições** estiverem satisfeitas (ver §3).  
* Devolver ao usuário, via **CX-03** / **CX-05**, o que mudou em relação ao Foco e à intenção — sem expor meios (IX-07).  
* Produzir o **efeito transitório** que alimentará o aprendizado/promoção (**CX-13**) — sem promover ao permanente nesta CX.  
* Respeitar rejeição de gate: **não executar** se CX-11 rejeitou.  
* Manter isolamento de COA (IX-05): efeito de um COA não mistura com outro.

### Não compete a esta CX

* Solicitar meios (**CX-10**) nem autorizar gates (**CX-11**).  
* Decidir meios ou orquestrar (D4) — CX-12 **recebe** encaminhamento; não escolhe ferramenta na superfície.  
* **Registrar / promover** resultados ao patrimônio permanente do COA (**CX-13**) — fronteira explícita abaixo.  
* Renovar Nova Atenção como capacidade própria (**CX-14**) — embora o efeito alimente essa renovação.  
* Governar ciclo de vida (**CX-08**) ou Foco (**CX-09**) — execução não redefine por si o estado de vida.  
* Substituir o quadro de Atenção por log de execução (IX-08).  
* Definir layout, componentes ou wireframes.

### Fronteira: executar × registrar resultados

| | **CX-12 — Executar e perceber efeito** | **CX-13 — Registrar / promover** |
|---|----------------------------------------|----------------------------------|
| Pergunta | *A ação autorizada correu? O que mudou agora?* | *O que deve sobreviver no patrimônio do COA?* |
| Classe do resultado | Efeito **transitório** observável (e evidência de execução) | Promoção **Transitório → Permanente** |
| Domínio | D5 → D1/D2 | D5 → D3 |
| Inclui | Em curso; efeito relevante; bloqueio | Aprendizado consolidado; atualização do conhecimento |
| Exclui | Memória institucional automática de todo log | Executar a ação no lugar de D5 |

**Regra:** CX-12 **executa e torna o efeito perceptível**; CX-13 **decide o que do efeito vira permanente**. Confundir as duas viola IX-09 / DA-002 (promover cedo demais ou nunca promover).

---

## 3. Entradas conceituais (pré-condições)

| Entrada | Classe | Origem típica | Pré-condição |
|---------|--------|---------------|--------------|
| Objetivo Ativado sob o qual se executa | Permanente | **CX-08** | **Obrigatória** — objetivo ativo |
| Foco Executivo vigente | Permanente | **CX-09** | **Obrigatória** — foco executivo |
| Encaminhamento / solicitação de meios | Transitório | **CX-10** | **Obrigatória** |
| Autorização humana (quando O-03 exige) | Ato / transitório | **CX-11** | **Obrigatória se aplicável**; se gate exigido e ausente/rejeitado → **não executar** |
| COA ativo | Permanente (lente) | **CX-01** | Obrigatória |
| Intenção alinhada ao Foco | Transitório | **CX-04** | Esperada (via CX-10) |
| Recorte de contexto do COA | Permanente | **CX-07** | Apoio à execução compreensível |

---

## 4. Saídas conceituais

| Saída | Classe | Destino |
|-------|--------|---------|
| Estado de execução (em curso / concluída no trecho / bloqueada) | Transitório | **CX-03**; **CX-05** |
| Efeito relevante perceptível (o que mudou para o comando) | Transitório | **CX-03**; **CX-05**; alimenta **CX-13** |
| Sinal de bloqueio / necessidade de novo gate ou esclarecimento | Transitório | **CX-11** / **CX-04** / **CX-03** |
| Evidência de efeito candidata a promoção | Transitório | **CX-13** (não promovida aqui) |
| Insumo para Nova Atenção | Transitório → projetado | **CX-14** (após atualização quando houver) |

**Não é saída desta CX:** patrimônio permanente consolidado (CX-13); plano de meios; mudança automática de ciclo de vida do objetivo.

---

## 5. Dependências e capacidades relacionadas

| Relação | CX | Tipo |
|---------|----|------|
| Depende de | **CX-10** | ⇢ — sem solicitação/encaminhamento, não há execução |
| Depende de (condicional) | **CX-11** | ⇢ — quando O-03 exige gate, só após autorização |
| Depende de | **CX-08** | → — objetivo Ativado |
| Depende de | **CX-09** | → — Foco Executivo |
| Depende de | **CX-01** | → estrutural |
| Relacionada | **CX-04**, **CX-05**, **CX-03** | ↔ — intenção; canal; espelho do efeito |
| Relacionada | **CX-07** | ↔ — contexto |
| É pré-requisito de | **CX-13** | ⇢ / ⇒ — efeito a promover |
| É pré-requisito de | **CX-14** | ⇢ — renovação após atualização alimentada pelo efeito |
| Relacionada | **CX-16** | ↔ — limites / estados transitórios honestos |

**Precedência F3-02:** O3 (fecha o bloco de execução).  
**Anti-precedências:** CX-12 antes de CX-04/CX-10; execução sem objetivo Ativado/Foco; execução após rejeição de CX-11.

---

## 6. Critérios de conclusão

A capacidade CX-12 considera-se **realizada** na experiência quando:

1. Com objetivo Ativado, Foco, CX-10 (e CX-11 se aplicável), a ação autorizada **pode ser executada** (D5).  
2. O usuário percebe **em curso**, **efeito relevante** ou **bloqueio** — sem log como centro da Atenção.  
3. Meios/orquestração permanecem **invisíveis** (IX-07).  
4. Fronteira clara: executar/perceber ≠ promover ao permanente (CX-13).  
5. Sem autorização quando exigida, **não há** execução.  
6. Efeito permanece no recorte do **COA ativo** (sem mistura).  
7. CX-13 e CX-14 têm efeito/insumo conceitual a consumir.  
8. Narrativa UXC compatível com IX-08 / PX-01 / F2-02 D5, sem wireframe.

---

## 7. Restrições e invariantes aplicáveis

| ID | Aplicação a CX-12 |
|----|-------------------|
| **F2-02** | D5 é o **único** executor; D4 não executa |
| **IX-08** | Atenção/efeito de comando ≠ dump de execução |
| **IX-07** | Não expor meios ao acompanhar efeito |
| **IX-09** | Transitório ≠ permanente — promoção é CX-13 |
| **DA-002** | Efeito pode alimentar permanente; CX-12 não grava patrimônio sozinha |
| **DA-001** | Execução sob objetivo/intenção, não sob escolha de ferramenta |
| **IX-01 / IX-05** | Só no COA ativo; sem mistura |
| **IX-06** | Respeitar gate (CX-11) |
| **PX-01** | Controle: usuário vê o que mudou no comando |
| **G-01** | Execução de meio ≠ redefinir objetivo |

**Restrições adicionais:**

* Forma mínima MVP-A: execução autorizada + efeito/bloqueio perceptível em linguagem de comando.  
* Não fundir CX-12 com CX-11 (gate) nem CX-13 (promoção).  
* Não promover HP-005/006 neste artefato.

---

## 8. Rastreabilidade

| Eixo | Referências | Papel nesta CX |
|------|-------------|----------------|
| **CX** | CX-12 | Esta especificação |
| **CX relacionadas** | CX-08, CX-09, CX-10, CX-11, CX-13, CX-14, CX-01, CX-03, CX-04, CX-05, CX-07, CX-16 | Pré-condições; promoção; renovação; lente; espelho; intenção; canal; contexto; limites |
| **Domínios** | D5 → D1, D2 | Execução → percepção |
| **DA** | DA-001, DA-002 | Objetivo antes; efeito candidato a permanente |
| **PX** | PX-01, PX-06 | Comando perceptível; ciclo contínuo |
| **IX** | IX-08, IX-07, IX-09, IX-05, IX-06 | Efeito≠log; invisível; transitório; isolamento; gate |
| **F3-02** | Derivada de ciclo; MVP-A Sim; O3 | Fecha bloco de execução |
| **F3-01** | Ficha CX-12 | Inventário |
| **F3-04** | Entrada CX-12 | Catálogo |
| **F2 apoio** | F2-02 D5, F-Exe, Transitório/Permanente | Executor único; efeito |
| **HP** | — | — |

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor); submissão ao CTO |
| Quando | 26/07/2026 |
| Por quê | Gate F3-14 — Spec CX-12; homologação CX-11 |
| Baseado em quê | F3-03; F3-02 O3; F3-04; F2-02 D5; pré-condições CX-08/09/10/11 |
| Resultado | Spec CX-12 **homologada** (Gate F3-14); F3-15 (CX-13) aberta |
