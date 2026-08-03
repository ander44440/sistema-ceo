# Diagnóstico — Falha técnica MRE / LLM (30/07/2026)

> **O que é?** Causa raiz da resposta «Falha técnica no raciocínio» ao perguntar sobre o MG2.  
> **Status:** Mitigação local aplicada (`CEO_LLM_TLS_INSECURE=1`); evidência também para uso do Briefing.  
> **Não é:** Opção B (ligação briefing→MRE).

---

## Sintoma

Pergunta: «O QUE VC SABE SOBRE O PROJETO MG2?»  
Resposta Speaker: falha controlada — «Solicitar dados… Falha técnica no raciocínio».

## Cadeia

1. Classificador: qualquer texto com `\bmg2\b` → `deliberar_objetivo` → **MRE** (`classificar.js`).  
2. MRE chama LLM várias vezes (`/api/ceo/deliberar`).  
3. Node `fetch` → OpenAI falha: **`UNABLE_TO_VERIFY_LEAF_SIGNATURE`**.  
4. API devolve 502 `LLM_FALHOU` / `fetch failed`.  
5. Orquestrador → `montarFalhaControlada` → Speaker.

## Causa raiz

**TLS:** cadeia de certificados rejeitada no processo Node (comum com antivírus/proxy que inspeciona HTTPS).  
A chave está configurada (`llm-status` = ok); a rede TLS é que falha.

## Mitigação aplicada

- `app/.env`: `CEO_LLM_TLS_INSECURE=1` (local).  
- `ceoLlmPlugin.js`: aplica o flag; mensagens de erro com código TLS; status expõe `tlsInseguro`.  
- `.env.example` documenta o flag.

Preferível a médio prazo: `NODE_EXTRA_CA_CERTS` com o CA do antivírus — sem desligar verificação.

## Nota arquitetural (OE-01)

Mesmo com LLM OK, o MRE **ainda não lê** o Briefing Curado. Perguntas «o que sabes do MG2?» continuam a depender do modelo + factos do painel, não do briefing documental — até evidências → Opção B.

## Memória

| Campo | Registro |
|-------|----------|
| Quem | Engenheiro (diagnóstico + mitigação TLS) |
| Quando | 30/07/2026 |
| Por quê | Patrocinador pediu investigar falha técnica do motor |
| Resultado | Causa SSL identificada; flag local; reinício Vite necessário |
