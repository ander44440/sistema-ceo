# Limites do MVP (Módulo G)

> **Módulo G (ARQ-008).** REQ-030, REQ-031; prepara REQ-028, REQ-032.  
> **Status: Operacional — Gate E1 Homologado (CTO, 23/07/2026).**

---

## 1. Fronteira de execução (REQ-030)

O CEO MVP **não substitui** as ferramentas de execução do MG2.

| No CEO (Dia de Trabalho) | Fora do CEO (oficina MG2) |
|--------------------------|---------------------------|
| Abrir / registrar / fechar o dia | Implementação, build, deploy |
| Posto de comando do patrocinador | IDEs, agentes de execução, loja |
| Guardar o que não pode se perder | Trabalho técnico do jogo |

É válido e esperado alternar: **CEO → ferramentas de execução → CEO**.

A fundação E1 **não** embute automação do pipeline do MG2.

---

## 2. Patrocinador único (REQ-031)

O MVP opera sob a premissa de **um único patrocinador** (persona VIS-003).

| Inclui | Não inclui |
|--------|------------|
| Autoridade de confirmação do patrocinador | Multi-usuário |
| Um operador do Dia de Trabalho | Papéis / IAM / aprovações em cadeia |

---

## 3. Baixa carga e respeito ao tempo (REQ-028, REQ-032) — restrições de desenho

A partir da E1, todo desenho subsequente (E2+) **deve** respeitar:

* poucos atos de alto valor;
* sem formulários além do mínimo dos REQs;
* atenção futura ≤ 3 itens (REQ-021 na E3);
* sem solicitar dados fora do VIS-003 / REQ-016…032.

Estas restrições estão **operacionais como limites de projeto** na fundação; a superfície completa do Painel é E3.

---

## 4. O que o módulo G não faz

* Criar funcionalidades
* Orquestrar IAs
* Definir tecnologia de implementação das etapas seguintes
