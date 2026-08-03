# Deliberação CTO — Ciclo de Validação Operacional (pós-Onda 03)

> **Status: Oficial — Deliberação do CTO (28/07/2026).**  
> Pré-condição: Onda Operacional 03 **encerrada e homologada** (Gate E5; commit `cf05dde`).  
> Natureza: **mudança de regime** — da implementação incremental para **uso real** como validação.

---

## Declaração

A Onda Operacional 03 permanece **encerrada e homologada**.

**Não** está autorizada, neste ato:

* abertura da **Onda Operacional 04**;  
* abertura da **Fase F7**;  
* início de **Onda 03.1** (refinamentos).

Fica instituído um **ciclo de validação operacional**.

---

## Objetivo do ciclo

Utilizar o CEO como **ferramenta principal de trabalho** no desenvolvimento do **Motoboy Game 2 (MG2)** durante alguns dias, observando o uso real do Fluxo Executivo Diário (abrir → trabalhar → encerrar → continuidade).

## Regras vinculantes durante o ciclo

| Permitido | Vedado |
|-----------|--------|
| Uso cotidiano do CEO no MG2 | Iniciar novas ondas |
| Observar atritos e oportunidades | Abrir novas fases (F7+) |
| Registrar observações de uso | Implementar novas capacidades |
| Consultar OE1–OE5 já anotadas | Tratar OE1–OE5 automaticamente / “de ofício” |

## Após o ciclo

Nova deliberação do CTO escolherá entre:

1. **Onda 03.1** — refinamentos (incl. OE1–OE5 se priorizados);  
2. **Onda Operacional 04** — nova capacidade;  
3. **Fase F7** — confiança operacional, segurança, compliance e governança.

Até lá: **aguardar autorização explícita do CTO**.

## Sede de registro

| Item | Caminho |
|------|---------|
| Esta deliberação | Este ficheiro |
| Encerramento Onda 03 | [`../product/marco-encerramento-onda-03.md`](../product/marco-encerramento-onda-03.md) |
| Relatório / OEs | [`../product/relatorio-final-onda-03.md`](../product/relatorio-final-onda-03.md) |
| Observações de uso (quando houver) | Preferência: novos ficheiros em `docs/learning/` datados, ou diário operacional se instituído |

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (deliberação); Engenheiro (Cursor) registrou |
| Quando | 28/07/2026 |
| Por quê | Validar no uso real o que a Onda 03 entregou, antes de nova expansão |
| Baseado em quê | Gate E5; ADR-015 (uso diário MG2); OE1–OE5 anotadas |
| Resultado | Regime de validação operacional; Onda 04 / F7 / 03.1 sob nova deliberação |
