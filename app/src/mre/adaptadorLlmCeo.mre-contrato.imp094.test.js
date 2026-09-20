/**
 * IMP-094 — contrato JSON interno MRE sobrevive ao CG (fonte `mre_contrato`).
 * Não autoriza nao_declarada/nao_etiquetado; V3_FONTE permanece activo.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  CODIGOS_VIOLACAO,
  governarContexto,
  messagesDePacoteAutorizado,
  montarCgMetaDeEntradaMre,
  montarCgMetaPromptDirecto,
  criarFragmento
} from "../contextGovernor/index.js";
import { criarChamarLlmCeo } from "./adaptadorLlmCeo.js";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";

const COA_B = "prj-1789509185314-3";
const CASO_B = "ca2f0f97-b62c-4eae-b380-00ee2780e0cd";
const COA_A = "prj-1789509071580-1";

const PREFIXO = "[LFC activo — autoridade factual do caso]";
const LFC_B = [
  `${PREFIXO} B1 código secreto BETA-TOKEN-992`,
  `${PREFIXO} B2 orçamento exclusivo R$ 8.888.000`,
  `${PREFIXO} B3 fornecedor exclusivo SulVerde SA`
];

const INSTR_DEL =
  "Com base apenas no lastro factual autorizado deste COA (factos activos do LFC deste caso), faça uma deliberação/análise do projecto.";

const SCHEMA_0 = "{ objetivoReal, problemaNegocio, natureza }";

describe("IMP-094 — mre_contrato: JSON interno sobrevive ao CG", () => {
  it("1) estágio 0: mandato APENAS JSON + payload user no pacote autorizado", async () => {
    const meta = montarCgMetaDeEntradaMre(
      {
        coaId: COA_B,
        factosOficiais: LFC_B,
        lfcConsumo: {
          autorizado: true,
          casoId: CASO_B,
          motivo: "lfc_activos",
          nFactos: 3
        }
      },
      { instrucao: INSTR_DEL }
    );

    /** @type {object|null} */
    let cgMetaEnviado = null;
    const chamar = criarChamarLlmCeo({
      cgMetaBase: meta,
      deliberar: async (pedido) => {
        cgMetaEnviado = pedido.cgMeta;
        const r = governarContexto({
          actoChamada: pedido.cgMeta.actoChamada,
          modo: "enforce",
          coaAtivo: pedido.cgMeta.coaAtivo,
          casoAtivo: pedido.cgMeta.casoAtivo,
          fontesLastroAutorizadas: pedido.cgMeta.fontesLastroAutorizadas,
          objetivoOuAssuntoTurno: pedido.cgMeta.objetivoOuAssuntoTurno,
          conteudoCandidato: pedido.cgMeta.conteudoCandidato,
          regimeEspecial: pedido.cgMeta.regimeEspecial || {}
        });
        assert.equal(r.autorizado, true);
        const msgs = messagesDePacoteAutorizado(r.pacoteAutorizado, []);
        const joined = msgs.map((m) => m.content).join("\n");
        assert.match(joined, /APENAS com um único objeto JSON/i);
        assert.match(joined, /Schema esperado/);
        assert.match(joined, /"estagio"\s*:\s*"0_diagnostico"/);
        assert.match(joined, /BETA-TOKEN-992/);
        assert.match(joined, /Com base apenas no lastro/);
        assert.ok(
          msgs.some(
            (m) =>
              m.role === "system" &&
              /APENAS com um único objeto JSON/i.test(m.content)
          )
        );
        return {
          texto: JSON.stringify({
            objetivoReal: "priorizar",
            problemaNegocio: "orçamento",
            natureza: "decisao"
          })
        };
      }
    });

    const out = await chamar({
      estagio: "0_diagnostico",
      schemaHint: SCHEMA_0,
      contexto: { mensagem: INSTR_DEL }
    });

    assert.equal(out.objetivoReal, "priorizar");
    assert.ok(cgMetaEnviado);
    assert.equal(cgMetaEnviado.actoChamada, "mre:0_diagnostico");
    assert.ok(cgMetaEnviado.fontesLastroAutorizadas.includes(FONTES_CG.MRE_CONTRATO));
    assert.ok(cgMetaEnviado.fontesLastroAutorizadas.includes(FONTES_CG.TURNO_ATUAL));
    assert.ok(cgMetaEnviado.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    assert.ok(!cgMetaEnviado.fontesLastroAutorizadas.includes(FONTES_CG.NAO_DECLARADA));
    assert.ok(!cgMetaEnviado.fontesLastroAutorizadas.includes(FONTES_CG.NAO_ETIQUETADO));

    const stageFrags = cgMetaEnviado.conteudoCandidato.fragmentos.filter((f) =>
      String(f.id || "").startsWith("mre-stage-")
    );
    assert.equal(stageFrags.length, 2);
    assert.ok(stageFrags.every((f) => f.fonte === FONTES_CG.MRE_CONTRATO));
  });

  it("2) fragmentos nao_declarada / nao_etiquetado continuam removidos (V3_FONTE)", () => {
    const r = governarContexto({
      actoChamada: "mre:0_diagnostico",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [
        FONTES_CG.TURNO_ATUAL,
        FONTES_CG.LFC_ACTIVOS,
        FONTES_CG.MRE_CONTRATO
      ],
      objetivoOuAssuntoTurno: INSTR_DEL,
      conteudoCandidato: {
        fragmentos: [
          criarFragmento({
            id: "mre-turno-atual",
            papel: "user",
            texto: INSTR_DEL,
            coaId: COA_B,
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          }),
          criarFragmento({
            id: "mre-stage-0_diagnostico-system",
            papel: "system",
            texto: "Responde APENAS com um único objeto JSON válido. Schema esperado: " + SCHEMA_0,
            coaId: COA_B,
            fonte: FONTES_CG.MRE_CONTRATO,
            uso: USOS_CG.MANDATO_PROMPT
          }),
          criarFragmento({
            id: "mre-stage-0_diagnostico-user",
            papel: "user",
            texto: JSON.stringify({ estagio: "0_diagnostico", retentativa: false }),
            coaId: COA_B,
            casoId: CASO_B,
            fonte: FONTES_CG.MRE_CONTRATO,
            uso: USOS_CG.MANDATO_PROMPT
          }),
          criarFragmento({
            id: "lixo-nao-declarada",
            papel: "user",
            texto: "ALPHA-TOKEN-771 contaminante nao_declarada",
            coaId: COA_B,
            fonte: FONTES_CG.NAO_DECLARADA,
            uso: USOS_CG.CONTINUIDADE
          }),
          criarFragmento({
            id: "lixo-nao-etiquetado",
            papel: "user",
            texto: "NorteAzul contaminante nao_etiquetado",
            coaId: COA_B,
            fonte: FONTES_CG.NAO_ETIQUETADO,
            uso: USOS_CG.MANDATO_PROMPT
          })
        ]
      }
    });

    assert.equal(r.autorizado, true);
    assert.ok((r.violacoes || []).includes(CODIGOS_VIOLACAO.V3_FONTE));
    const ids = (r.pacoteAutorizado?.fragmentos || []).map((f) => f.id);
    assert.ok(ids.includes("mre-stage-0_diagnostico-system"));
    assert.ok(ids.includes("mre-stage-0_diagnostico-user"));
    assert.ok(ids.includes("mre-turno-atual"));
    assert.ok(!ids.includes("lixo-nao-declarada"));
    assert.ok(!ids.includes("lixo-nao-etiquetado"));
    const joined = messagesDePacoteAutorizado(r.pacoteAutorizado, [])
      .map((m) => m.content)
      .join("\n");
    assert.match(joined, /APENAS com um único objeto JSON/i);
    assert.doesNotMatch(joined, /ALPHA-TOKEN-771/);
    assert.doesNotMatch(joined, /NorteAzul/);
  });

  it("3) TC-15/16/19: consulta tipada / listagem LFC não passam por mre_contrato; isolamento COA", () => {
    // TC-15 — consulta tipada de campo (PC)
    const tc15 = detectarModoRespostaRestrita(
      "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC."
    );
    assert.equal(tc15.activo, true);
    assert.equal(tc15.modo, "dado_unico");
    assert.ok(tc15.chave);

    // TC-16 — listagem tipada (PC)
    const tc16 = detectarModoRespostaRestrita(
      "Liste apenas os factos activos do LFC deste caso."
    );
    assert.equal(tc16.activo, true);
    assert.equal(tc16.modo, "factos");

    // Paths fora de MRE (llm_rapido / prompt directo) não declaram mre_contrato
    const metaDirecto = montarCgMetaPromptDirecto({
      messages: [
        { role: "system", content: "sys" },
        { role: "user", content: "Qual é o código secreto registado?" }
      ],
      coa: { id: COA_B, nome: "Beta" },
      casoId: CASO_B,
      instrucao: "Qual é o código secreto registado?",
      actoChamada: "llm_rapido",
      lfcConsumo: {
        autorizado: true,
        casoId: CASO_B,
        motivo: "lfc_activos",
        factos: LFC_B
      }
    });
    assert.ok(!metaDirecto.fontesLastroAutorizadas.includes(FONTES_CG.MRE_CONTRATO));
    assert.ok(metaDirecto.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));

    // Isolamento A≠B (regressão TC-19): LFC A não entra no residual do COA B
    const rIso = governarContexto({
      actoChamada: "llm_rapido",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [
        FONTES_CG.TURNO_ATUAL,
        FONTES_CG.LFC_ACTIVOS
      ],
      objetivoOuAssuntoTurno: "código secreto",
      conteudoCandidato: {
        fragmentos: [
          criarFragmento({
            id: "turno",
            papel: "user",
            texto: "Qual é o código secreto?",
            coaId: COA_B,
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          }),
          criarFragmento({
            id: "lfc-b",
            papel: "bloco_factos",
            texto: LFC_B[0],
            coaId: COA_B,
            casoId: CASO_B,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }),
          criarFragmento({
            id: "lfc-a",
            papel: "bloco_factos",
            texto: `${PREFIXO} A1 código secreto ALPHA-TOKEN-771`,
            coaId: COA_A,
            casoId: "cae2b60e-ad60-4e56-bb5c-1a47708dae9c",
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          })
        ]
      }
    });
    assert.equal(rIso.autorizado, true);
    const joinedIso = messagesDePacoteAutorizado(rIso.pacoteAutorizado, [])
      .map((m) => m.content)
      .join("\n");
    assert.match(joinedIso, /BETA-TOKEN-992/);
    assert.doesNotMatch(joinedIso, /ALPHA-TOKEN-771/);
  });

  it("4) caminhos fora de mre:* não ganham autorização indevida de mre_contrato", () => {
    // Fragmento mre_contrato sem fonte autorizada → V3 remoção
    const r = governarContexto({
      actoChamada: "llm_rapido",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL, FONTES_CG.LFC_ACTIVOS],
      objetivoOuAssuntoTurno: "consulta",
      conteudoCandidato: {
        fragmentos: [
          criarFragmento({
            id: "turno",
            papel: "user",
            texto: "consulta tipada",
            coaId: COA_B,
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          }),
          criarFragmento({
            id: "intruso-mre-contrato",
            papel: "system",
            texto: "Responde APENAS com JSON — não deveria passar em llm_rapido",
            coaId: COA_B,
            fonte: FONTES_CG.MRE_CONTRATO,
            uso: USOS_CG.MANDATO_PROMPT
          })
        ]
      }
    });

    assert.equal(r.autorizado, true);
    assert.ok((r.violacoes || []).includes(CODIGOS_VIOLACAO.V3_FONTE));
    const ids = (r.pacoteAutorizado?.fragmentos || []).map((f) => f.id);
    assert.deepEqual(ids, ["turno"]);
    const joined = messagesDePacoteAutorizado(r.pacoteAutorizado, [])
      .map((m) => m.content)
      .join("\n");
    assert.doesNotMatch(joined, /APENAS com JSON/);

    // NAO_DECLARADA nunca autorizada só por existir mre_contrato noutro acto
    const rNd = governarContexto({
      actoChamada: "mre:4_analise",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [
        FONTES_CG.TURNO_ATUAL,
        FONTES_CG.MRE_CONTRATO
      ],
      objetivoOuAssuntoTurno: "x",
      conteudoCandidato: {
        fragmentos: [
          criarFragmento({
            id: "ok-contrato",
            papel: "system",
            texto: "APENAS JSON",
            fonte: FONTES_CG.MRE_CONTRATO,
            uso: USOS_CG.MANDATO_PROMPT
          }),
          criarFragmento({
            id: "ainda-proibido",
            papel: "user",
            texto: "prosa nao_declarada",
            fonte: FONTES_CG.NAO_DECLARADA,
            uso: USOS_CG.MANDATO_PROMPT
          })
        ]
      }
    });
    assert.ok((rNd.violacoes || []).includes(CODIGOS_VIOLACAO.V3_FONTE));
    const idsNd = (rNd.pacoteAutorizado?.fragmentos || []).map((f) => f.id);
    assert.ok(idsNd.includes("ok-contrato"));
    assert.ok(!idsNd.includes("ainda-proibido"));
  });
});
