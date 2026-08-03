/**
 * Runtime — liga o domínio CAP-03 ao shell permanente.
 * Slots para evolução incremental (LLM, APIs, etc.) sem trocar o layout.
 */
function criarStorageMemoria() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    },
    clear() {
      map.clear();
    }
  };
}

function obterStorage() {
  try {
    const s = globalThis.localStorage;
    if (
      s &&
      typeof s.getItem === "function" &&
      typeof s.setItem === "function"
    ) {
      const probe = "__ceo_storage_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    }
  } catch (_e) {
    /* sandbox / private mode */
  }
  console.warn("[CEO] localStorage indisponível — a usar storage em memória.");
  return criarStorageMemoria();
}

export function criarRuntime() {
  const g = globalThis;
  const need = [
    "CeoCatalogoCOA",
    "CeoSessaoCOA",
    "CeoPoliticaIsolamento",
    "CeoHomeExecutiva",
    "CeoConversaExecutiva",
    "CeoNavegacao",
    "CeoTelaProjetos"
  ];
  for (const nome of need) {
    if (!g[nome] || typeof g[nome].criar !== "function") {
      throw new Error("Domínio CAP-03 em falta: " + nome);
    }
  }

  const storage = obterStorage();
  const catalogo = g.CeoCatalogoCOA.criar({ storage });
  const sessao = g.CeoSessaoCOA.criar({ catalogo, storage });
  const politica = g.CeoPoliticaIsolamento.criar({ sessao, storage });
  const home = g.CeoHomeExecutiva.criar({ catalogo, sessao, politica });
  const conversa = g.CeoConversaExecutiva.criar({ sessao, politica, home });
  const projetos = g.CeoTelaProjetos.criar({ catalogo, sessao });
  const navegacao = g.CeoNavegacao.criar({ sessao });

  /** Extensões futuras: registrar handlers por módulo sem alterar o shell. */
  const conectores = Object.create(null);

  return Object.freeze({
    catalogo,
    sessao,
    politica,
    home,
    conversa,
    projetos,
    navegacao,
    storage,
    /**
     * Infra incremental: cada módulo pode registar um conector real.
     * @param {string} moduloId
     * @param {{ status: string, conectar?: Function, descricao?: string }} conector
     */
    registrarConector(moduloId, conector) {
      conectores[moduloId] = Object.freeze({ ...conector });
    },
    obterConector(moduloId) {
      return conectores[moduloId] || null;
    },
    listarConectores() {
      return Object.keys(conectores).map((id) => ({
        id,
        ...conectores[id]
      }));
    }
  });
}
