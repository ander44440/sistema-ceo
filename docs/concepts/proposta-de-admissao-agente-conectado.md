# Proposta de Admissão — Conceito "Agente Conectado"

> **Status: Homologada — v1.0 (CTO, 21/07/2026).**
> Versão 1.0 — 21/07/2026. Artefato do fluxo regular de admissão do Mecanismo de Conceitos Organizacionais (REQ-009) — **primeira admissão pós-migração**.
> Abertura autorizada pela **ADR-013, Decisão 3** (artefato autorizador rastreável da abertura).
> Esta proposta **não decide** pela admissão (a decisão pertence à alçada de governança, com resultado explícito — REQ-009), **não registra** o conceito (admissão autoriza, não constitui — REQ-006), **não emite identificador** (emissão ocorre exclusivamente no ato de registro — ARQ-003), **não cria requisitos, não altera conceito vigente e não antecipa matérias do Grupo B da Distribuição**.

---

## 1. Termo proposto

**Agente Conectado**

## 2. Definição proposta

> ***Agente conectado* é todo agente — humano ou de inteligência artificial — que possui vínculo formal e vigente com o CEO, estabelecido e encerrado por decisão sob governança ([CNC-001](CNC-001-decisao-sob-governanca.md)), pelo qual passa a estar sujeito às normas de governança vigentes da organização, independentemente da ferramenta pela qual atue.**

### Delimitações da definição (elementos da ANL-004 §5)

A definição proposta delimita exatamente os três elementos levantados pela análise:

1. **O que caracteriza estar conectado:** um **vínculo formal** com o CEO — nunca um estado técnico de sessão, presença ou atividade. Um agente sem vínculo formal não é agente conectado, ainda que interaja tecnicamente com o sistema; um agente com vínculo vigente permanece conectado ainda que momentaneamente inativo.
2. **Alcance quanto a humanos e IAs:** ambos. A CON-001 (Art. 6º) define papéis para participantes humanos e de IA, e a CAP-01 exige que "todo o trabalho de humanos e agentes obedeça às normas do projeto" (CAP-001); o REQ-001 fala em "qualquer agente conectado" sem restrição de natureza. A sujeição às normas — razão de ser do vínculo — alcança igualmente os dois.
3. **Ciclo do vínculo:** o vínculo **inicia e cessa por decisão sob governança** (CNC-001) — atos rastreáveis das alçadas competentes, com registro na Memória Organizacional, nunca eventos técnicos ou informais. Enquanto vigente, o vínculo sujeita o agente às normas vigentes; cessado o vínculo, cessa a condição de agente conectado, sem efeito retroativo sobre os rastros produzidos durante a vigência.

A independência de ferramenta reproduz a exigência estrutural do REQ-001 (critério 2) e da CON-001 (Art. 7º §2º): a condição de agente conectado é organizacional, não técnica — não depende de fornecedor, ferramenta ou forma de acesso.

**Nota de fronteira (ADR-013, D3):** os **efeitos do vínculo para a distribuição** — início da recepção do pacote de governança, recepção obrigatória e cessação da entrega — são matéria dos futuros REQs do Grupo B e **não integram esta definição**. O conceito define quem é agente conectado; o que a distribuição deve fazer com ele é obrigação normativa dos requisitos.

## 3. Justificativa da contribuição para a interpretação consistente da organização

O termo é usado com força normativa desde a fundação — **CON-001 (Art. 7º §3º)**, **REQ-001 (enunciado e critérios)**, **VIS-001 (§5)** e **CAP-001 (descrição da CAP-01)** — e **nenhum documento o define** (constatação da ANL-004 §5). As interpretações que dependem dele:

* **REQ-001:** "qualquer agente conectado recebe a Constituição e as regras de governança vigentes" — sem definição única, o alcance da obrigação central da distribuição é indeterminado: não se sabe objetivamente quem deve receber o pacote.
* **Futuros REQs do Grupo B (Vínculo de Distribuição):** seus critérios de aceitação dependerão diretamente do termo (ANL-004 §6.1, D2; ADR-013, D3) — a precedência desta admissão sobre o Grupo B é decisão vinculante da ADR-013.
* **CAP-001/CON-001:** a fronteira entre quem está sujeito às normas do CEO e quem é externo à organização depende do termo; interpretações divergentes comprometeriam a própria noção de governança sobre agentes heterogêneos.

Sem a admissão, o termo permaneceria exatamente na condição que motivou a criação do mecanismo (ADR-007): significado com força normativa vivendo por convenção informal, sujeito a divergência silenciosa entre documentos e revisores.

---

## Memória Organizacional (da proposta)

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (Cursor) elaborou a proposta; alçada decisória: a definida pela governança vigente (REQ-009 exige decisão formal sem redefinir alçadas; precedente da migração: CTO, com aval do Usuário) |
| Quando | 21/07/2026 |
| Por quê | Executar a abertura autorizada pela ADR-013 (D3) — primeira admissão pós-migração, pré-condição do Grupo B da Distribuição |
| Baseado em quê | REQ-009 (elementos mínimos da proposta); ANL-004 §5 (elementos da definição); ADR-013 D3 (autorização e fronteira com o Grupo B); CNC-001 (decisão sob governança, referenciada pela definição) |
| Resultado | Proposta homologada pelo CTO em 21/07/2026, após um ajuste semântico na definição |

## Histórico

| Versão | Data | Quem | O quê | Por quê | Resultado |
|--------|------|------|-------|---------|-----------|
| 0.1 | 21/07/2026 | Engenheiro (Cursor) | Elaboração da proposta com os três elementos do REQ-009 | Autorização do CTO (deliberação de 21/07/2026, sob a ADR-013 D3) | Aprovada com um ajuste semântico |
| 1.0 | 21/07/2026 | CTO revisou e homologou; Engenheiro aplicou o ajuste | Definição ajustada: "passa a estar sujeito" — explicita a relação causal entre o vínculo formal e a sujeição às normas | Revisão técnica do CTO | **Homologada — etapa de proposta do REQ-009 encerrada** |
