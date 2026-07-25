# Evidências — IMP-005 E5 (Registrar: Decisões e Conhecimento)

> **Status: Homologado — Gate E5 (CTO, 23/07/2026).**  
> Data: 23/07/2026.  
> Norma: IMP-005 v1.0; ARQ-008 módulos D e E; REQ-022, 023, 024.  
> Pré-condição: Gate E4 Homologado (23/07/2026).

---

## 1. Critérios de conclusão da E5

| Critério IMP-005 E5 | Resultado | Evidência |
|---------------------|-----------|-----------|
| Decisão e conhecimento distinguíveis | **Atendido** | Fluxos separados D/E; `decisoes.md` ≠ `conhecimentos-uso-diario.md` |
| Consulta não inventa | **Atendido** | Só busca nos acervos; sem geração de conteúdo |
| Ausência explícita quando vazio | **Atendido** | Screenshot — “Ausência explícita… publicacao na loja” |
| Acionável a partir do Painel | **Atendido** | Botões Registrar decisão / conhecimento / Consultar em `index.html` |
| E6–E7 não iniciadas | **Atendido** | Nota na superfície; sem artefatos E6/E7 |

---

## 2. Artefatos produzidos

| Caminho | Descrição |
|---------|-----------|
| `docs/mvp/registros-do-dia.md` | Contrato módulos D e E |
| `docs/mvp/decisoes.md` | Acervo de decisões (D) — DEC-MVP-001 |
| `docs/mvp/conhecimentos-uso-diario.md` | Acervo de uso diário (E) — KNW-DIA-001 |
| `docs/mvp/index.html` | Painel com ações E5 |
| `docs/mvp/e5-registros-screenshot.png` | Captura — ausência explícita + botões E5 |
| `docs/mvp/e5-evidencias.md` | Este relatório |

---

## 3. Escopo respeitado

* E6 (integração) e E7 (fecho) **vedadas / não iniciadas**.
* Sem emissão em massa de `KNW-nnn` no índice CAP-04.
* Sem curadoria avançada / multi-projeto.

---

## 4. Evidência visual

* Arquivo: [`e5-registros-screenshot.png`](e5-registros-screenshot.png)
* Fonte: `index.html` — dia aberto; Registros E5; consulta com **ausência explícita** (REQ-024)
* Nota operacional: servidor HTTP local (porta 8768) encerrado intencionalmente após a captura — sem impacto no mérito.

---

## 5. Homologação

**Gate E5 homologado** (Decisão oficial CTO, 23/07/2026). E5 encerrada. E6 autorizada. E7 vedada até autorização.

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) executou; CTO homologou o Gate E5 |
| Quando | 23/07/2026 |
| Por quê | Cumprir E5 do IMP-005 e submeter evidências antes da E6 |
| Baseado em quê | Decisão oficial CTO — Gate E4 Homologado; abertura E5; Decisão oficial Gate E5 |
| Resultado | E5 **Homologada**; E6 autorizada; E7 vedada |
