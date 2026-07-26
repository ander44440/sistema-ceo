# Design System — Roadmap Inicial

> **Status: Homologado — Gate IPR-001 APROVADO (CTO, 26/07/2026). Parte da F0; F2 aberta na capacidade F2-01 (mapa conceitual antes das fundações visuais detalhadas).**  
> Natureza: roadmap de **especificação** — nenhum token, arquivo de estilo ou componente é produzido pela IPR-001; a materialização ocorrerá em ciclos ADR-006 futuros.  
> Norma: IPR-001; [`principios-de-produto.md`](principios-de-produto.md); [`diretrizes-arquiteturais-experiencia.md`](diretrizes-arquiteturais-experiencia.md) (DA-001…003); [`F2-01-arquitetura-conceitual-experiencia.md`](F2-01-arquitetura-conceitual-experiencia.md).

---

## Visão do design system

Um vocabulário visual único para todas as superfícies do CEO: definido uma vez, aplicado sempre (P5 — consistência acima de criatividade). O roadmap abaixo ordena as fundações antes dos componentes e os componentes antes dos padrões compostos.

## Roadmap por área

### 1. Cores

| Etapa | Entrega prevista |
|-------|------------------|
| 1.1 | Paleta semântica: fundo, superfície, texto, marca, estados (sucesso/atenção/erro/informação) |
| 1.2 | Escalas de neutros e de marca (tons claros/escuros) |
| 1.3 | Regras de uso: acentos raros (P4), contraste mínimo (ver Acessibilidade) |
| 1.4 | Especificação de tema claro; avaliação de tema escuro |

### 2. Tipografia

| Etapa | Entrega prevista |
|-------|------------------|
| 2.1 | Família(s) tipográfica(s) e fallbacks |
| 2.2 | Escala tipográfica (display → título → corpo → apoio → legenda) |
| 2.3 | Regras de hierarquia por superfície (um título dominante por tela — P3/P6) |
| 2.4 | Pesos, entrelinhas e comprimento de linha para leitura executiva |

### 3. Grid e espaçamento

| Etapa | Entrega prevista |
|-------|------------------|
| 3.1 | Unidade base de espaçamento e escala (ex.: múltiplos de 4/8) |
| 3.2 | Grid de página (colunas, margens, larguras máximas de leitura) |
| 3.3 | Densidade: padrão executivo (respiro generoso — P4) e variação compacta |

### 4. Componentes

| Etapa | Entrega prevista |
|-------|------------------|
| 4.1 | Inventário do existente (Home, Projetos, esqueletos CAP-03) como insumo |
| 4.2 | Núcleo: botão, campo de entrada, cartão, lista, selo de status, menu de navegação |
| 4.3 | Executivos: cartão de Resumo Executivo, caixa de conversa, seletor de COA, bloco de decisão/conhecimento |
| 4.4 | Estados obrigatórios por componente: padrão, foco, desabilitado, vazio, erro, carregando |

### 5. Ícones

| Etapa | Entrega prevista |
|-------|------------------|
| 5.1 | Estilo único (traço, peso, cantos) coerente com a sobriedade do produto |
| 5.2 | Conjunto mínimo: navegação (5 destinos), ações executivas, estados |
| 5.3 | Regras de uso: ícone sempre com rótulo em ações primárias (P3) |

### 6. Animações

| Etapa | Entrega prevista |
|-------|------------------|
| 6.1 | Princípio: movimento só quando comunica (transição de contexto, confirmação, carregamento) — P4 |
| 6.2 | Durações e curvas padrão (rápidas; nunca bloqueiam o usuário — CON-001 princípio 1) |
| 6.3 | Regra de redução de movimento (respeitar preferência do sistema) |

### 7. Acessibilidade

| Etapa | Entrega prevista |
|-------|------------------|
| 7.1 | Alvo de conformidade (referência WCAG 2.1 AA) |
| 7.2 | Contraste mínimo em toda a paleta (integra a etapa 1) |
| 7.3 | Navegação por teclado e ordem de foco nas superfícies executivas |
| 7.4 | Semântica e rótulos para leitores de tela nos componentes do núcleo |

### 8. Responsividade

| Etapa | Entrega prevista |
|-------|------------------|
| 8.1 | Breakpoints e comportamento do grid |
| 8.2 | Prioridade: a conversa e o Resumo Executivo permanecem dominantes em qualquer largura (REQ-041) |
| 8.3 | Menu inferior e navegação em telas estreitas |
| 8.4 | Regras de reflow para cartões e listas |

## Ordem e dependências

```text
Cores + Tipografia + Grid  →  Componentes (núcleo)  →  Componentes executivos
        │                            │
        └── Acessibilidade (transversal desde o início)
Ícones e Animações  →  após o núcleo
Responsividade      →  especificada junto ao grid; validada por componente
```

## Governança

* Cada área será especificada em documento próprio sob `ui/` (padrões) quando a fase correspondente for aberta pelo CTO.  
* A **materialização** (tokens, CSS, biblioteca) exigirá ciclo ADR-006 com REQ/ARQ/IMP/VAL próprios.  
* Nenhuma tela existente é alterada pela IPR-001.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou; CTO revisará |
| Quando | 26/07/2026 |
| Por quê | Ordenar as fundações do design system antes de qualquer implementação |
| Baseado em quê | Autorização IPR-001 (oito áreas); princípios de produto |
| Resultado | Roadmap v0.1 submetido à homologação |
