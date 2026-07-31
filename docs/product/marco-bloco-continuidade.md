# Marco — Bloco de Continuidade encerrado

> **Status: Oficial — registrado pelo CTO (26/07/2026), após Gate F3-17.**  
> Natureza: **marco de consolidação** da Fase F3 — não é especificação CX.  
> Norma: [`F3-02-modelo-de-dependencias-capacidades.md`](F3-02-modelo-de-dependencias-capacidades.md); [`F3-04-catalogo-oficial-capacidades.md`](F3-04-catalogo-oficial-capacidades.md).  
> Marcos relacionados: [`marco-ciclo-executivo-ate-promocao.md`](marco-ciclo-executivo-ate-promocao.md); [`marco-nucleo-fundamental-mvp-a.md`](marco-nucleo-fundamental-mvp-a.md).

---

## Declaração

Fica registrado oficialmente o **encerramento do bloco de Continuidade**, composto por:

| ID | Nome canônico | Spec | Gate |
|----|---------------|------|------|
| **CX-14** | Renovar Nova Atenção após atualização | [`cx/CX-14-nova-atencao.md`](cx/CX-14-nova-atencao.md) | F3-16 |
| **CX-15** | Preservar continuidade entre sessões | [`cx/CX-15-continuidade-sessoes.md`](cx/CX-15-continuidade-sessoes.md) | F3-17 |

Ambas as especificações estão **homologadas**.

### Significado

| Camada | Capacidade | Papel |
|--------|------------|--------|
| Continuidade **intra-ciclo** | CX-14 | Após promoção, renova o quadro de Atenção (fecha F-Ret) |
| Continuidade **inter-sessões** | CX-15 | Após logout/reabertura, restaura estado governado permanente |

* O par CX-14 + CX-15 cobre a continuidade da experiência no ciclo e no tempo entre postos.  
* Bloco transversal (**CX-16**) encerrado em paralelo — [`marco-bloco-transversal-mvp-a.md`](marco-bloco-transversal-mvp-a.md).  
* Fase F3 encerrada — [`marco-encerramento-f3.md`](marco-encerramento-f3.md).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (declaração); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F3-17 — fechar continuidade com CX-15 |
| Baseado em quê | Homologação CX-14 e CX-15; F3-02 O4/O5 |
| Resultado | Bloco Continuidade encerrado; F3-18 (CX-16) aberta |
