# Marco — Base Arquitetural da UX/UI consolidada

> **Status: Oficial — registrado pelo CTO (26/07/2026), após Gate F5-07.**  
> Natureza: **marco de consolidação** da Fase F5.  
> Cadeia: Base Arquitetural da Navegação → **Base Arquitetural da UX/UI** (este marco).

---

## Declaração

Fica registrado oficialmente o marco:

> **Base Arquitetural da UX/UI consolidada.**

### Composição

| ID | Artefato | Papel |
|----|----------|-------|
| **F5-01** | Mandato da Arquitetura UX/UI | Abertura e D-F5 |
| **F5-02** | Modelo Canônico da Arquitetura UX/UI | Método **obrigatório** |
| **F5-03** | Princípios Canônicos (PUX) | Referência **obrigatória** de decisão UX/UI |
| **F5-04** | Arquitetura da Experiência Canônica (AX) | Referência **obrigatória** da arquitetura de interação |
| **F5-05** | Arquitetura Canônica de Interação (ACI-X) | Referência **obrigatória** da arquitetura de navegação |
| **F5-06** | Arquitetura Canônica de Navegação (NAV) | Referência **obrigatória** da arquitetura de superfícies |
| **F5-07** | Arquitetura Canônica de Superfícies (SRF) | Referência **obrigatória** para toda **composição arquitetural das superfícies** da F5 |

### Significado

* Toda composição arquitetural de superfícies (F5-08+) **deve** subordinar-se à SRF (e a NAV / INT / AX).  
* Cadeia seguinte: F5-08 homologada → [`marco-arquitetura-estrutural-ux-ui.md`](marco-arquitetura-estrutural-ux-ui.md).

---

## Memória Organizacional

| Campo | Registro |
|-------|----------|
| Quem | CTO (declaração); Engenheiro (Cursor) registrou |
| Quando | 26/07/2026 |
| Por quê | Gate F5-07 — consolidar superfícies como base da composição |
| Baseado em quê | Homologação F5-01…F5-07 |
| Resultado | Marco oficial; F5-08 aberta |
