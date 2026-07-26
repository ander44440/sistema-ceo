/**
 * Renderização do menu inferior (IMP-009 E7 / REQ-043).
 *
 * Camada de apresentação pura: consome o Componente T e a Sessão (O) em
 * leitura. Não altera COA, não persiste nada, não duplica regra de negócio.
 */
(function (root) {
  "use strict";

  function montar(opcoes) {
    const opts = opcoes || {};
    const alvo = document.getElementById(opts.elementoMenu || "menuInferior");
    if (!alvo) return null;

    const storage = window.localStorage;
    const catalogo = root.CeoCatalogoCOA.criar(storage);
    const sessao = root.CeoSessaoCOA.criar({ catalogo: catalogo, storage: storage });
    const nav = root.CeoNavegacao.criar({
      sessao: sessao,
      destinoInicial: opts.destinoAtual
    });

    alvo.innerHTML = "";
    nav.listarDestinos().forEach(function (d) {
      const a = document.createElement("a");
      a.href = "./" + d.pagina;
      a.textContent = d.rotulo;
      a.title = d.descricao;
      if (d.atual) {
        a.className = "atual";
        a.setAttribute("aria-current", "page");
      }
      if (d.esqueleto) {
        const marca = document.createElement("span");
        marca.className = "esq";
        marca.textContent = "mínimo";
        a.appendChild(marca);
      }
      alvo.appendChild(a);
    });

    const elCoa = opts.elementoCoa && document.getElementById(opts.elementoCoa);
    if (elCoa) {
      const estado = nav.montarEstado();
      if (!estado.coaAtivoId) {
        elCoa.textContent =
          "Nenhum COA ativo — cadastre ou abra um Projeto em Projetos.";
      } else {
        const coa = catalogo.obterPorId(estado.coaAtivoId);
        elCoa.textContent = coa
          ? coa.nome + " (" + coa.statusCicloVida + ")"
          : estado.coaAtivoId;
      }
    }

    return nav;
  }

  root.CeoMenuInferior = Object.freeze({ montar: montar });
})(typeof globalThis !== "undefined" ? globalThis : this);
