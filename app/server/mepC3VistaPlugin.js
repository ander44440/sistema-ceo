/**
 * IMP-074 — Vista C3 só-leitura para o SPA (fronteira UI/Node).
 * Corre só no processo Vite (Node): chama listarPropostasC3() (C2 filtrado)
 * e serializa a vista. Não é API HTTP. Não amplia o contrato externo.
 * Não inicializa o store canónico (evita I/O de boot no `vite build`).
 */
import { listarPropostasC3 } from "../src/mepCeo/c3.js";

const VIRTUAL_ID = "virtual:mep-c3-propostas";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

function serializarVista() {
  return `export default ${JSON.stringify(listarPropostasC3())};`;
}

export function mepC3VistaPlugin() {
  return {
    name: "ceo-mep-c3-vista",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return serializarVista();
    }
  };
}
