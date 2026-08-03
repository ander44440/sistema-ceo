# REQ-046 — Módulo de Onboarding por voz do CEO Digital

> **Status:** Aprovado  
> **Versão:** 0.1 — 30/07/2026  
> **Capacidade:** CAP-07 — Comunicação

## Enunciado

O CEO deverá oferecer um módulo de onboarding por voz que conduza uma entrevista configurável, transcreva a conversa em tempo real, gere resumo com confirmação do utilizador e persista o perfil em JSON local, sem APIs externas pagas nesta versão.

## Tipo

Funcional; detalhado (IMPLEMENTAÇÃO 001).

## Justificativa

ADR-015 — uso diário; primeiro contacto com o ambiente do patrocinador antes do trabalho executivo. Autorização explícita do Usuário (IMPLEMENTAÇÃO 001, 30/07/2026).

## Critérios de aceitação

* Interface com Iniciar / Encerrar, indicadores Escutando / Falando, transcrição e resumo.
* STT + TTS no browser (Web Speech API); interrupção da fala do CEO; resposta após fim da fala do utilizador.
* Fluxo e perguntas carregados de `config/onboarding.json` (não hardcoded no motor).
* Respostas gravadas nos campos: atividade, empresa_ou_projeto, objetivos, projetos, prioridade, equipe, preferencias, regras.
* Resumo final + confirmação; SIM salva; NÃO permite correção.
* Persistência JSON (ficheiros via API local + fallback localStorage).
* Reinício da app carrega perfil existente (salta onboarding se completo).
* Módulos: voice / conversation / memory / storage / ui / config.

## Fora do escopo

Agentes, dashboard, CRM, calendário, e-mail, APIs externas, planeamento, memória avançada, inteligência executiva.

## Dependências

Nenhuma formal além do shell Vite existente em `app/`.

## Riscos e incertezas

* Web Speech API varia por browser (Chrome/Edge recomendados).
* Microfone requer permissão do utilizador.

## Rastreabilidade

| Elo | Referência |
|-----|------------|
| Capacidade | CAP-07 |
| Origem | IMPLEMENTAÇÃO 001 — 30/07/2026 |
| Implementação | `app/src/onboarding/*` |

## Histórico de versões

| Versão | Data | Quem | O quê | Resultado |
|--------|------|------|-------|-----------|
| 0.1 | 30/07/2026 | Patrocinador | Autorização IMPLEMENTAÇÃO 001 | Aprovado |
