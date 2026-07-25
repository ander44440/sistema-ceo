# ARQ-008 — Arquitetura Funcional do CEO MVP v0.1 (Uso Diário MG2)

> **Status: Homologada — v1.0 (CTO, 23/07/2026).**
> Versão 1.0 — 23/07/2026. Tipo ARQ (ADR-010).
> Norma superior: CON-001 v1.0; VIS-003 v1.0; ADR-015 v1.0; REQ-016 a REQ-032 (Pacote de Requisitos CEO MVP v0.1 homologado); ADR-006; ADR-010.
> Este documento define a **arquitetura funcional** do CEO MVP v0.1. **Não** cria requisitos; **não** introduz funcionalidades além dos REQ-016…032; **não** define tecnologia, implementação nem código.
> **Gate de Arquitetura (ARQ-008):** encerrado com esta homologação. Fase de Arquitetura do MVP **encerrada**. Implementação autorizada sob IMP próprio, estritamente nos limites desta ARQ e dos REQ-016…032.
> **Diretriz arquitetural permanente (CTO, 23/07/2026):** *Todo módulo do CEO existe para apoiar o ciclo diário do patrocinador. O objeto central da arquitetura é o Dia de Trabalho.*

---

## Finalidade

Responder exclusivamente à pergunta:

> **Como se organizam logicamente os módulos do CEO MVP para sustentar a experiência diária do patrocinador no MG2 — Abrir o Dia → Trabalhar → Registrar → Fechar o Dia → Continuar Amanhã — satisfazendo REQ-016 a REQ-032 sem absorvê-los uns aos outros?**

---

## 1. Princípios arquiteturais

Nenhuma decisão desta ARQ pode violá-los.

| ID | Princípio | Enunciado | Fundamento |
|----|-----------|-----------|------------|
| **M1** | Eixo = experiência diária | A estrutura modular segue o fluxo do dia do patrocinador, não uma árvore técnica de componentes | Autorização CTO — fase ARQ MVP |
| **M2** | Só o homologado | Nenhum módulo oferece capacidade fora de REQ-016…032 | Pacote REQ MVP |
| **M3** | Um contexto | O MVP opera com exatamente um contexto ativo: MG2 | REQ-017 |
| **M4** | Sugerir sem impor | Alterações de estado de autoridade exigem confirmação do patrocinador | REQ-027 |
| **M5** | Mínimo necessário | Superfícies e atos privilegiam baixa carga e respeito ao tempo | REQ-028; REQ-032 |
| **M6** | Registrado ≠ inventado | Consulta e continuidade usam apenas o que foi registrado; ausência é explícita | REQ-024; REQ-029 |
| **M7** | Fronteira de execução | O MVP não substitui ferramentas de execução do MG2 | REQ-030 |
| **M8** | Patrocinador único | Autoridade e uso diário pressupõem um único patrocinador | REQ-031 |
| **M9** | Independência tecnológica | Arquitetura lógica; nenhuma obrigação depende de fornecedor, ferramenta ou linguagem | CON-001 Art. 7º; ADR-010 |

---

## 2. Eixo organizador — fluxo do dia

```text
                    ┌─────────────────────────────────────┐
                    │         CONTINUAR AMANHÃ            │
                    │     (estado preservado → reabrir)   │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  ABRIR O DIA │───▶│  TRABALHAR   │───▶│  REGISTRAR   │───▶│ FECHAR O DIA │──┐
│              │    │  (fora CEO / │    │  (no CEO)    │    │              │  │
│  Painel +    │    │   execução   │    │  decisão e/  │    │  avanço,     │  │
│  estado      │    │   MG2)       │    │  conhecimento│    │  próximo,    │  │
│              │    │              │    │  consulta    │    │  confirmação │  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘  │
      ▲                                                                         │
      └─────────────────────────────────────────────────────────────────────────┘
```

| Fase do eixo | O que o patrocinador vive | Módulos primários | REQs |
|--------------|---------------------------|-------------------|------|
| **Abrir o Dia** | Ver posto de comando com estado de ontem; confirmar/ajustar foco | Superfície do Dia; Contexto MG2; Ciclo do Dia; Continuidade | 016, 017, 018, 019, 020, 021, 026, 029 |
| **Trabalhar** | Executar no MG2 **fora** do CEO | Limites do MVP (fronteira) | 030 |
| **Registrar** | Guardar decisão e/ou conhecimento; consultar o registrado | Memória de Decisões; Acervo de Uso Diário; Superfície (ações) | 022, 023, 024, 016 |
| **Fechar o Dia** | Indicar avanço/pendências; confirmar próximo passo de amanhã | Ciclo do Dia; Superfície do Dia | 025, 020, 027 |
| **Continuar Amanhã** | Reabrir sem reconstruir de memória | Continuidade; Ciclo do Dia | 026, 018, 029 |

---

## 3. Módulos arquiteturais

### 3.1 Visão dos módulos

| ID | Módulo | Responsabilidade única |
|----|--------|------------------------|
| **A** | **Superfície do Dia** | Apresentar o Painel do Dia como única composição de entrada e expor ações rápidas do fluxo diário |
| **B** | **Contexto MG2** | Manter e expor o único contexto ativo (MG2) ao qual todo o estado do dia se refere |
| **C** | **Ciclo do Dia** | Governar os atos Abrir, Foco, Próximo passo, Fechar e a regra de confirmação do patrocinador |
| **D** | **Memória de Decisões** | Registrar e preservar decisões do contexto MG2 com os campos exigidos |
| **E** | **Acervo de Uso Diário** | Registrar conhecimentos reutilizáveis do MG2 e atender consultas com ausência explícita |
| **F** | **Continuidade de Estado** | Preservar entre sessões/dias o estado necessário ao Painel e à reabertura |
| **G** | **Limites do MVP** | Delimitar o que o MVP **não** faz (execução externa; multi-usuário; sobrecarga) |

### 3.2 Responsabilidades e limites por módulo

#### A — Superfície do Dia

| | |
|--|--|
| **Faz** | Compôr o Painel (marca/posto, contexto, foco, onde parou, próximo passo, atenção 0–3 ou “nada pendente”, ações rápidas); ser a primeira superfície do MVP |
| **Não faz** | Persistir estado; decidir foco/próximo passo; executar trabalho do MG2; listar múltiplos projetos; dashboards |
| **REQs** | 016, 021; contribui a 028, 032 |

#### B — Contexto MG2

| | |
|--|--|
| **Faz** | Fixar MG2 como único contexto ativo; garantir que foco, registros e continuidade referenciem esse contexto |
| **Não faz** | Portfólio multi-projeto; troca de contexto na experiência diária |
| **REQs** | 017 |

#### C — Ciclo do Dia

| | |
|--|--|
| **Faz** | Abrir o dia; aceitar definição/ajuste de foco (uma frase); manter um próximo passo sugerido; fechar o dia (avanços, pendências, proposta de amanhã); exigir confirmação do patrocinador antes de vigorar mudanças de autoridade |
| **Não faz** | Planejamento multi-etapa; filas de tarefas; impor sugestões sem confirmação |
| **REQs** | 018, 019, 020, 025, 027 |

#### D — Memória de Decisões

| | |
|--|--|
| **Faz** | Aceitar registro de decisão (o quê, por quê, baseado em quê, resultado; quem/quando); disponibilizar decisões ao estado (“onde parou”) e à consulta |
| **Não faz** | Tratar decisão como item de conhecimento reutilizável; curadoria avançada multi-papel |
| **REQs** | 022 |

#### E — Acervo de Uso Diário

| | |
|--|--|
| **Faz** | Aceitar registro de conhecimento reutilizável ligado ao MG2; responder consultas só com registrado; declarar ausência explicitamente |
| **Não faz** | Inventar conteúdo; popular acervo em massa; substituir a Memória de Decisões |
| **REQs** | 023, 024 |
| **Nota** | Reutiliza conceitos já existentes (CNC-002; estrutura CAP-04) **sem** expandir escopo além do ato diário do MVP |

#### F — Continuidade de Estado

| | |
|--|--|
| **Faz** | Preservar foco vigente, onde parou, próximo passo confirmado, atenções pertinentes e vínculos aos registros do dia para a próxima abertura |
| **Não faz** | Backup técnico; continuidade multi-projeto; reexplicação forçada do contexto |
| **REQs** | 026, 029 |

#### G — Limites do MVP

| | |
|--|--|
| **Faz** | Explicitar fronteiras: execução do MG2 fora do CEO; um patrocinador; baixa carga; respeito ao tempo como restrições transversais |
| **Não faz** | Criar funcionalidades; orquestrar IAs; IAM multi-usuário |
| **REQs** | 028, 030, 031, 032 |

---

## 4. Relações entre módulos

```text
                    ┌─────────────────────┐
                    │  G Limites do MVP   │  (restringe todos)
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ A Superfície   │◀──▶│ C Ciclo do Dia │◀──▶│ F Continuidade │
│    do Dia      │    │                │    │   de Estado    │
└───────┬────────┘    └───────┬────────┘    └───────▲────────┘
        │                     │                     │
        │              ┌──────┴──────┐              │
        │              │             │              │
        │              ▼             ▼              │
        │     ┌────────────┐  ┌────────────┐        │
        │     │ D Memória  │  │ E Acervo   │────────┘
        │     │ Decisões   │  │ Uso Diário │
        │     └─────▲──────┘  └─────▲──────┘
        │           │               │
        └───────────┴───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ B Contexto    │
              │    MG2        │
              └───────────────┘
```

| Relação | Natureza |
|---------|----------|
| A ↔ C | A exibe o que C governa (foco, próximo, abrir/fechar); C não renderiza superfície |
| A → D, E | Ações rápidas disparam registro/consulta; A não armazena o conteúdo |
| C ↔ F | C produz estado confirmado; F o preserva e devolve em Abrir |
| D, E → F | Registros alimentam “onde parou” / continuidade consultável |
| B → todos | Todo estado e registro do MVP referencia o contexto MG2 |
| G → todos | Restrições transversais; não há fluxo de dados de negócio |

---

## 5. Fluxo das informações

### 5.1 Abrir o Dia

1. Patrocinador inicia o uso → **A** apresenta o Painel.
2. **B** fornece o rótulo/contexto MG2.
3. **F** fornece estado preservado (foco, onde parou, próximo passo, atenção).
4. **C** materializa o ato Abrir (REQ-018); patrocinador pode ajustar foco (**C** + confirmação REQ-027).
5. Patrocinador parte para **Trabalhar** (fora do CEO — **G**/REQ-030).

### 5.2 Registrar (durante o dia)

1. Ação rápida em **A** → **D** (decisão) ou **E** (conhecimento) ou **E** (consulta).
2. Conteúdo gravado permanece sob **D**/**E**; **F** pode refletir atualização de “onde parou” / atenções quando aplicável.
3. Consulta (**E**): só registrado; se vazio → ausência explícita.

### 5.3 Fechar o Dia

1. Ação em **A** → **C** conduz fechamento (avanços, pendências).
2. **C** propõe próximo passo de amanhã; vigora só com confirmação (**C**/REQ-027).
3. Estado confirmado → **F** para Continuar Amanhã.

### 5.4 Continuar Amanhã

1. Novo Abrir → **F** → **A**/**C** reapresentam estado sem exigir reexplicação narrativa completa (REQ-029).

### 5.5 Informações que cruzam o eixo

| Informação | Produtor | Consumidor | Fase |
|------------|----------|------------|------|
| Contexto MG2 | B | A, C, D, E, F | Todas |
| Foco do dia | C (após confirmação) | A, F | Abrir / Continuar |
| Próximo passo | C (após confirmação) | A, F | Abrir / Fechar / Continuar |
| Atenção 0–3 | C / derivados de D·E | A | Abrir |
| Decisão | D | A (onde parou), E (consulta cruzada se pertinente), F | Registrar |
| Conhecimento | E | A, F, consulta | Registrar |
| Estado do dia | F | A, C | Continuar / Abrir |

---

## 6. Limites de responsabilidade (mapa crítico)

| Tema | Responsável | Explicitamente fora |
|------|-------------|---------------------|
| Primeira superfície / composição do dia | A | Dashboard, multi-projeto, feed |
| Qual projeto está ativo | B | Troca de projetos no MVP |
| Atos temporais do dia + confirmação | C | Autonomia decisória do sistema |
| Decisões | D | Conhecimento reutilizável |
| Conhecimento + consulta | E | Decisões; invenção de conteúdo |
| Sobrevivência do estado entre dias | F | Mídia/backup técnico |
| Fronteiras NFR | G | Novas features |
| Execução do MG2 | *Nenhum módulo do MVP* | Toda a oficina do jogo (REQ-030) |

---

## 7. Matriz de rastreabilidade REQ → módulo

| REQ | Módulo(s) |
|-----|-----------|
| 016 | A |
| 017 | B |
| 018 | C (+ A, F) |
| 019 | C (+ A) |
| 020 | C (+ A) |
| 021 | A (+ C) |
| 022 | D |
| 023 | E |
| 024 | E |
| 025 | C (+ A, F) |
| 026 | F |
| 027 | C |
| 028 | G (+ A, C) |
| 029 | F (+ C) |
| 030 | G |
| 031 | G |
| 032 | G (+ A, C) |

**Cobertura:** REQ-016…032 — todos atribuídos. Nenhum módulo sem REQ.

---

## 8. O que esta arquitetura deliberadamente não decide

* Tecnologia, linguagem, UI kit, persistência física, APIs, hospedagem.
* Formato de arquivos ou schemas.
* Integrações com IDEs ou agentes de execução.
* Identificadores técnicos de implementação.
* Qualquer capacidade listada no VIS-003 §6 / fora de REQ-016…032.

Essas decisões, se necessárias, pertencem a IMP/ADR posteriores **após** homologação desta ARQ.

---

## 9. Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO em revisão |
| Quando | 23/07/2026 |
| Por quê | Abrir a Arquitetura do CEO MVP após homologação do Pacote de Requisitos, organizando módulos pelo fluxo diário do patrocinador |
| Baseado em quê | Autorização CTO — fase ARQ MVP; REQ-016…032; VIS-003; ADR-015; ADR-010 |
| Resultado | ARQ-008 **Homologada v1.0**; fase de Arquitetura do MVP encerrada; Implementação autorizada sob IMP |

---

## 10. Histórico de versões

| Versão | Data | Autor | O que mudou | Baseado em quê | Status |
|--------|------|-------|-------------|----------------|--------|
| 0.1 | 23/07/2026 | Engenheiro (Cursor) | Criação — eixo do dia; módulos A–G; relações; fluxos; limites; matriz REQ | Autorização CTO — Arquitetura MVP | Em análise — revisão do CTO |
| 1.0 | 23/07/2026 | CTO homologou; Engenheiro registrou | Homologação; diretriz permanente do Dia de Trabalho; fase ARQ encerrada | Deliberação formal do CTO — ARQ-008 HOMOLOGADA | **Homologada — publicada** |
