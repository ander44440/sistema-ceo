# Critérios de Análise — Benchmark Estratégico (IPR-001 / F1)

> **Status: Em elaboração — v0.1 (26/07/2026).**  
> Uso: toda ficha de referência deve percorrer estas dimensões.  
> Norma: [`principios-de-produto.md`](../principios-de-produto.md); F1 [`f1-benchmark-estrategico.md`](f1-benchmark-estrategico.md).

---

## 1. Objetivo

Definir **o que observar** em cada produto de referência, de forma comparável, rastreável aos princípios do CEO e útil às futuras fases de UX/UI/Branding — sem copiar soluções alheias.

## 2. Dimensões de observação

Cada dimensão liga-se a um ou mais princípios. Escala sugerida: **1 (fraco) … 5 (excelente)** — ou `N/A` quando a dimensão não se aplica.

| ID | Dimensão | Pergunta-guia | Princípios |
|----|----------|---------------|------------|
| D1 | Sensação de controle | O usuário sente-se no comando? O estado é transparente? | P1 |
| D2 | Informação → decisão | O que aparece leva a um próximo passo claro? | P2 |
| D3 | Clareza | A hierarquia é óbvia em um olhar? Há um objetivo por superfície? | P3, P6 |
| D4 | Densidade e elegância | Há sobriedade ou ruído visual? Ornamento compete com conteúdo? | P4 |
| D5 | Consistência | Padrões se repetem? Ou cada tela inventa um idioma? | P5 |
| D6 | Objetivo por superfície | Cada tela/área enuncia (e cumpre) um job claro? | P6 |
| D7 | Conversação | A interação conversacional é central, auxiliar ou inexistente? | REQ-041 (herdado) |
| D8 | Contexto / isolamento | O produto deixa claro "sobre o que estou trabalhando agora"? | REQ-037/039 |
| D9 | Tempo do usuário | Há burocracia, cliques vazios, onboarding longo? | CON-001 p.1 |
| D10 | Identidade / tom | Transmite comando executivo, ferramenta operacional ou chat genérico? | Branding |

## 3. O que registrar além da nota

Para cada dimensão relevante:

* **Evidência** — o que foi visto (padrão, tela, comportamento).  
* **Lição útil ao CEO** — o que aprender (fazer / evitar / adaptar).  
* **Risco de cópia** — se a prática conflita com princípios ou com o modelo COA.

## 4. O que ignorar propositalmente

| Item | Motivo |
|------|--------|
| Stack tecnológica | Independência tecnológica (ADR-010); fora do escopo de produto |
| Preço / planos comerciais | Não informam experiência do CEO |
| Features de marketing sem superfície observável | Ruído |
| Tendências estéticas passageiras sem função | Violam P4/P5 |

## 5. Classificação da referência

Ao fim da ficha, classificar a referência em relação ao CEO:

| Classe | Significado |
|--------|-------------|
| **Alinhada** | Práticas coerentes com P1–P6; candidata a inspiração |
| **Parcial** | Alguns padrões úteis; outros conflitantes |
| **Contrastante** | Útil como antimodelo (o que o CEO não deve ser) |
| **Fora de escopo** | Pouca relevância para o posto de comando executivo |

## 6. Fontes e ética

* Toda ficha cita **fonte** (URL, versão, data de observação).  
* Preferir observação de produto público (site, docs, demos oficiais).  
* Não inventar dados; ausência de evidência = `não observado`.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) |
| Quando | 26/07/2026 |
| Por quê | Padronizar a observação de mercado para a F1 |
| Baseado em quê | Abertura F1; princípios P1–P6; REQ-037/041 |
| Resultado | Rubrica v0.1 submetida |
