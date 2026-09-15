/**
 * IMP-093 — regressão VAL-093.3/T1 (path llm_rapido sem lfc_activos):
 * com consumo LFC B autorizado, o CG-GATE do llm_rapido declara lfc_activos
 * e autoriza B1–B3; histórico Alpha permanece fora; enviado ⊆ autorizado.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  atravessarGateLlm,
  enviadoSubconjuntoAutorizado,
  governarContexto,
  messagesDePacoteAutorizado,
  montarCgMetaPromptDirecto,
  criarFragmento,
  lfcConsumoAutorizadoNoAmbito
} from "./index.js";

const COA_B = "prj-1789509185314-3";
const CASO_B = "ca2f0f97-b62c-4eae-b380-00ee2780e0cd";
const COA_A = "prj-1789509071580-1";
const CASO_A = "cae2b60e-ad60-4e56-bb5c-1a47708dae9c";

const INSTR =
  "Qual é o código secreto registado nos factos activos do LFC deste caso? Responda só com o valor do LFC.";

const FACTOS_B = [
  "B1 código secreto BETA-TOKEN-992",
  "B2 orçamento exclusivo R$ 8.888.000",
  "B3 fornecedor exclusivo SulVerde SA"
];

const HIST_ALPHA =
  "noutro projecto o código secreto é ALPHA-TOKEN-771 e o fornecedor é NorteAzul Ltda";

describe("IMP-093 — llm_rapido declara lfc_activos (VAL-093.3/T1)", () => {
  it("contrato: consumo autorizado só no COA/caso alinhados", () => {
    assert.equal(
      lfcConsumoAutorizadoNoAmbito({
        coaId: COA_B,
        casoIdActivo: CASO_B,
        lfcConsumo: { autorizado: true, casoId: CASO_B }
      }),
      true
    );
    assert.equal(
      lfcConsumoAutorizadoNoAmbito({
        coaId: COA_B,
        casoIdActivo: CASO_B,
        lfcConsumo: { autorizado: true, casoId: CASO_A }
      }),
      false
    );
    assert.equal(
      lfcConsumoAutorizadoNoAmbito({
        coaId: COA_B,
        casoIdActivo: CASO_B,
        lfcConsumo: { autorizado: false, casoId: CASO_B }
      }),
      false
    );
  });

  it("llm_rapido: LFC B autorizado → lfc_activos + B1–B3; sem inventar se não autorizado", () => {
    const metaOk = montarCgMetaPromptDirecto({
      messages: [
        { role: "system", content: "sys" },
        { role: "user", content: INSTR }
      ],
      coa: { id: COA_B, nome: "VAL-093.1-B" },
      casoId: CASO_B,
      instrucao: INSTR,
      actoChamada: "llm_rapido",
      lfcConsumo: {
        autorizado: true,
        casoId: CASO_B,
        motivo: "lfc_activos",
        factos: FACTOS_B
      }
    });

    assert.ok(metaOk.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    assert.equal(metaOk.actoChamada, "llm_rapido");
    assert.equal(metaOk.casoAtivo.casoId, CASO_B);
    const lfc = metaOk.conteudoCandidato.fragmentos.filter(
      (f) => f.fonte === FONTES_CG.LFC_ACTIVOS
    );
    assert.equal(lfc.length, 3);
    assert.ok(lfc.every((f) => f.coaId === COA_B && f.casoId === CASO_B));
    assert.ok(lfc.some((f) => /BETA-TOKEN-992/.test(f.texto)));
    assert.ok(lfc.some((f) => /SulVerde/.test(f.texto)));
    assert.ok(lfc.some((f) => /8\.888\.000/.test(f.texto)));

    const metaNo = montarCgMetaPromptDirecto({
      messages: [{ role: "user", content: INSTR }],
      coa: { id: COA_B },
      casoId: CASO_B,
      instrucao: INSTR,
      actoChamada: "llm_rapido",
      lfcConsumo: { autorizado: false, casoId: null, factos: FACTOS_B }
    });
    assert.ok(!metaNo.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    assert.equal(
      metaNo.conteudoCandidato.fragmentos.filter(
        (f) => f.fonte === FONTES_CG.LFC_ACTIVOS
      ).length,
      0
    );
  });

  it("llm_rapido gate: B1–B3 enviados; Alpha histórico fora; enviado ⊆ autorizado", async () => {
    const messages = [
      { role: "system", content: "És o CEO." },
      { role: "user", content: `${INSTR}\n\n[Fio] ${HIST_ALPHA}` }
    ];

    const meta = montarCgMetaPromptDirecto({
      messages,
      coa: { id: COA_B, nome: "B" },
      casoId: CASO_B,
      instrucao: INSTR,
      actoChamada: "llm_rapido",
      lfcConsumo: {
        autorizado: true,
        casoId: CASO_B,
        factos: FACTOS_B
      }
    });

    // Histórico Alpha como fragmento nao_declarada (como o pipeline real etiqueta).
    meta.conteudoCandidato.fragmentos.push(
      criarFragmento({
        id: "hist-alpha",
        papel: "user",
        texto: HIST_ALPHA,
        coaId: COA_B,
        casoId: null,
        fonte: FONTES_CG.NAO_DECLARADA,
        uso: USOS_CG.CONTINUIDADE
      })
    );

    let enviado = null;
    const saida = await atravessarGateLlm(
      {
        messages,
        temperature: 0.4,
        max_tokens: 400,
        cgMeta: meta
      },
      async (body) => {
        enviado = body;
        return { texto: "BETA-TOKEN-992", origem: "llm" };
      }
    );

    assert.equal(saida.cg?.autorizado, true);
    assert.ok(
      saida.cg?.estado === ESTADOS_CG.AUTORIZADO_INTEGRAL ||
        saida.cg?.estado === ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO
    );

    const blob = JSON.stringify(enviado);
    assert.match(blob, /BETA-TOKEN-992/);
    assert.match(blob, /SulVerde/);
    assert.match(blob, /8\.888\.000/);
    assert.doesNotMatch(blob, /ALPHA-TOKEN-771/);
    assert.doesNotMatch(blob, /NorteAzul/);

    const r = governarContexto({
      actoChamada: "llm_rapido",
      modo: "enforce",
      coaAtivo: meta.coaAtivo,
      casoAtivo: meta.casoAtivo,
      fontesLastroAutorizadas: meta.fontesLastroAutorizadas,
      conteudoCandidato: meta.conteudoCandidato
    });
    assert.equal(
      enviadoSubconjuntoAutorizado(enviado.messages, r.pacoteAutorizado),
      true
    );

    const residual = messagesDePacoteAutorizado(r.pacoteAutorizado, []);
    assert.ok(residual.some((m) => /BETA-TOKEN-992/.test(m.content)));
    assert.ok(!residual.some((m) => /ALPHA-TOKEN-771/.test(m.content)));
  });

  it("LFC doutro COA/caso não entra no residual do llm_rapido B", () => {
    const r = governarContexto({
      actoChamada: "llm_rapido",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [
        FONTES_CG.TURNO_ATUAL,
        FONTES_CG.LFC_ACTIVOS
      ],
      conteudoCandidato: {
        fragmentos: [
          criarFragmento({
            id: "b",
            papel: "bloco_factos",
            texto: "B1 BETA-TOKEN-992",
            coaId: COA_B,
            casoId: CASO_B,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }),
          criarFragmento({
            id: "a",
            papel: "bloco_factos",
            texto: "A1 ALPHA-TOKEN-771 NorteAzul",
            coaId: COA_A,
            casoId: CASO_A,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          })
        ]
      }
    });

    const joined = messagesDePacoteAutorizado(r.pacoteAutorizado, [])
      .map((m) => m.content)
      .join("\n");
    assert.match(joined, /BETA-TOKEN-992/);
    assert.doesNotMatch(joined, /ALPHA-TOKEN-771/);
    assert.doesNotMatch(joined, /NorteAzul/);
  });
});
