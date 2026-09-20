/**
 * Adapter LLM do CEO → saídas JSON por estágio do MRE (IMP-014).
 * IMP-093 M1/M2: propaga meta CG (actoChamada + fragmentos etiquetados).
 * IMP-094: mandato/payload interno do estágio usam fonte `mre_contrato`
 * (autorizada só no acto `mre:*`) para não serem removidos por V3_FONTE.
 */

import { deliberarComLlm } from "../executiveEngine/llmCliente.js";
import { parseSaidaJson } from "./pipeline/llmEstagio.js";
import { FONTES_CG, USOS_CG } from "../contextGovernor/contratos.js";
import { criarFragmento } from "../contextGovernor/etiquetarPipeline.js";

/**
 * @param {object} [opts]
 * @param {(pedido: object) => Promise<{texto:string}>} [opts.deliberar] — injetável
 * @param {object} [opts.cgMetaBase] — meta CG da entrada MRE (M2)
 */
export function criarChamarLlmCeo(opts = {}) {
  const deliberar = opts.deliberar || deliberarComLlm;
  const cgMetaBase =
    opts.cgMetaBase && typeof opts.cgMetaBase === "object" ? opts.cgMetaBase : {};

  return async function chamarLlm(pedido) {
    const estagio = pedido?.estagio != null ? String(pedido.estagio) : "desconhecido";
    const messages = [
      {
        role: "system",
        content:
          "És um módulo interno do Motor de Raciocínio Executivo. " +
          "Responde APENAS com um único objeto JSON válido, sem markdown, sem prosa. " +
          `Schema esperado: ${pedido.schemaHint}`
      },
      {
        role: "user",
        content: JSON.stringify({
          estagio: pedido.estagio,
          retentativa: Boolean(pedido.retentativa),
          contexto: pedido.contexto
        })
      }
    ];

    const baseFrags = Array.isArray(cgMetaBase.conteudoCandidato?.fragmentos)
      ? cgMetaBase.conteudoCandidato.fragmentos
      : [];

    const fragmentosActo = [
      ...baseFrags,
      criarFragmento({
        id: `mre-stage-${estagio}-system`,
        papel: "system",
        texto: messages[0].content,
        coaId: cgMetaBase.coaAtivo?.id || null,
        casoId: null,
        fonte: FONTES_CG.MRE_CONTRATO,
        uso: USOS_CG.MANDATO_PROMPT
      }),
      criarFragmento({
        id: `mre-stage-${estagio}-user`,
        papel: "user",
        texto: messages[1].content,
        coaId: cgMetaBase.coaAtivo?.id || null,
        casoId: cgMetaBase.casoAtivo?.casoId || null,
        fonte: FONTES_CG.MRE_CONTRATO,
        uso: USOS_CG.MANDATO_PROMPT
      })
    ];

    // Preservar lfc_activos declarado na entrada MRE (não deixar o acto
    // sobrescrever fontes e perder B1–B3 após isolamento V3_FONTE).
    const fontesBase = Array.isArray(cgMetaBase.fontesLastroAutorizadas)
      ? [...cgMetaBase.fontesLastroAutorizadas]
      : [];
    if (
      baseFrags.some((f) => f && f.fonte === FONTES_CG.LFC_ACTIVOS) &&
      !fontesBase.includes(FONTES_CG.LFC_ACTIVOS)
    ) {
      fontesBase.push(FONTES_CG.LFC_ACTIVOS);
    }
    // Contrato interno do estágio: só actos `mre:*` autorizam esta fonte.
    if (!fontesBase.includes(FONTES_CG.MRE_CONTRATO)) {
      fontesBase.push(FONTES_CG.MRE_CONTRATO);
    }

    const saida = await deliberar({
      messages,
      temperature: 0.2,
      max_tokens: 700,
      cgMeta: {
        ...cgMetaBase,
        actoChamada: `mre:${estagio}`,
        fontesLastroAutorizadas: fontesBase,
        conteudoCandidato: {
          messages,
          fragmentos: fragmentosActo
        }
      }
    });
    return parseSaidaJson(saida.texto);
  };
}
