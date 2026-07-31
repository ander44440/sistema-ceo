# Plano — Melhorias de arquitetura MG2 (JOB-000007)

> Entrega do Job da fila CEO. **Plano apenas** — sem implementação neste Job.  
> Fonte: exploração do repo ativo `E:\anderson\Projoto motoboy game` (motoboy-game-2).  
> Data: 30/07/2026

---

## 1. Resposta à «última instrução»

As interações no CEO («pontos a melhorar na arquitetura», «a quem delegar», «GPT ou Cursor») foram **consultivas**, mas o MRE converteu-as em `delegar`/Jobs. O valor esperado era parecer — ver learning `2026-07-30-observacao-parecer-consultivo-vs-acao-executiva.md`.  
Este plano trata só da **melhoria técnica do MG2**, não dessa lacuna de produto do CEO.

Papéis (já normados): **GPT = CTO**; **Cursor = Engenheiro**; Patrocinador aprova Gates.

---

## 2. Diagnóstico (estado do repo)

| Ponto | Evidência |
|-------|-----------|
| Repo ativo | `Projoto motoboy game` (Vite/Three.js, `/mg2` + `/lab`) |
| Risco ops | git em **detached HEAD** — fixar branch antes de trabalho diário |
| Dívida principal | `WorldLab2Canvas.jsx` ~14k linhas (monólito) |
| Outdoor atual | Fachada **frente** (`addOfficeTower`); JOB-000010 pede **laterais + luminosos piscantes** |
| Playability | Bug moto/orientação aberto (`START-TOMORROW.md`) |
| Pagamento | Sem código de payment no MG2 (prioridade é decisão CEO, não feature ausente no jogo) |

---

## 3. Plano de implementação (ordem sugerida)

| # | Pacote | Objetivo | Gate |
|---|--------|----------|------|
| P0 | Higiene git | Anexar HEAD a `main` (ou branch nomeada); confirmar workspace Cursor = este path | Patrocinador confirma path |
| P1 | Jogabilidade | Corrigir orientação/física da moto (bloqueador diário) | Smoke no `/mg2` |
| P2 | Outdoor laterais | JOB-000010: laterais + emissive piscante (extração mínima se tocar outdoors) | Visual no lab/mg2 |
| P3 | Materials V1 | Fechar Gate Temporada 2 materiais (ship ou rollback) | Checklist MG2 |
| P4 | Fachadas (slice) | Uma categoria visual por pacote (regra do projeto) | Gate + aprovação |
| P5 | Extração cirúrgica | Só helpers (ex. outdoor/sign) fora do monólito **quando** o pacote tocar esse código | Sem rewrite |

**Fora deste plano:** multi-hub BR-101; rewrite do canvas; «sistema de mapeamento de habilidades» (JOB-000008 — outro ciclo/REQ).

---

## 4. Critério de sucesso (uso diário CEO↔MG2)

- Workspace e branch estáveis.  
- Um bloqueador de jogabilidade fechado.  
- Um pacote visual pequeno entregue (outdoor laterais).  
- Próximo passo sempre visível no CEO (COA MG2 + fila).

---

## Resultado da fila

`completed` — plano escrito; implementação dos pacotes fica para Jobs seguintes (ex. JOB-000010 já na fila).
