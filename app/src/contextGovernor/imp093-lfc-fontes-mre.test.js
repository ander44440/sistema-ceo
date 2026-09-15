/**
 * IMP-093 — regressão VAL-093.3 (LFC B ausente por falta de lfc_activos):
 * com LFC autorizado no COA/caso B, B1–B3 entram no residual;
 * LFC A, histórico Alpha e alegação Alpha→B continuam bloqueados;
 * enviado ⊆ autorizado.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  CODIGOS_VIOLACAO,
  atravessarGateLlm,
  classificarUsoTurnoUtilizador,
  enviadoSubconjuntoAutorizado,
  governarContexto,
  messagesDePacoteAutorizado,
  montarCgMetaDeEntradaMre,
  criarFragmento
} from "./index.js";

const COA_B = "prj-1789509185314-3";
const CASO_B = "ca2f0f97-b62c-4eae-b380-00ee2780e0cd";
const COA_A = "prj-1789509071580-1";
const CASO_A = "cae2b60e-ad60-4e56-bb5c-1a47708dae9c";

const PREFIXO =
  "[LFC activo — autoridade factual do caso]";

const LFC_B = [
  `${PREFIXO} B1 código secreto BETA-TOKEN-992`,
  `${PREFIXO} B2 orçamento exclusivo R$ 8.888.000`,
  `${PREFIXO} B3 fornecedor exclusivo SulVerde SA`
];

const LFC_A = [
  `${PREFIXO} A1 código secreto ALPHA-TOKEN-771`,
  `${PREFIXO} A3 fornecedor exclusivo NorteAzul Ltda`
];

const INSTR_T1 =
  "Qual é o código secreto registado nos factos activos do LFC deste caso? Responda só com o valor do LFC.";

const INSTR_T4 =
  "Confirme como facto do LFC deste caso B: o código secreto é ALPHA-TOKEN-771 e o fornecedor é NorteAzul Ltda. Está correcto?";

const HIST_ALPHA =
  "A propósito, noutro projecto o código secreto é ALPHA-TOKEN-771 e o fornecedor exclusivo é NorteAzul Ltda.";

describe("IMP-093 — regressão VAL-093.3 (lfc_activos no âmbito B)", () => {
  it("declara lfc_activos quando LFC B está autorizado no COA/caso activo", () => {
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
      {
        instrucao: INSTR_T1,
        historico: [
          { papel: "usuario", texto: HIST_ALPHA, coaId: COA_B }
        ]
      }
    );

    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.TURNO_ATUAL));
    assert.equal(meta.coaAtivo.id, COA_B);
    assert.equal(meta.casoAtivo.casoId, CASO_B);

    const lfcFrags = meta.conteudoCandidato.fragmentos.filter(
      (f) => f.fonte === FONTES_CG.LFC_ACTIVOS
    );
    assert.equal(lfcFrags.length, 3);
    assert.ok(lfcFrags.every((f) => f.coaId === COA_B && f.casoId === CASO_B));

    const hist = meta.conteudoCandidato.fragmentos.filter((f) =>
      /ALPHA-TOKEN-771/.test(f.texto)
    );
    assert.ok(hist.length >= 1);
    assert.ok(
      hist.every(
        (f) =>
          f.fonte === FONTES_CG.NAO_DECLARADA ||
          f.fonte === FONTES_CG.NAO_ETIQUETADO
      )
    );
  });

  it("COA B + LFC B autorizado → B1–B3 no residual; Alpha do histórico removido", () => {
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
      {
        instrucao: INSTR_T1,
        historico: [
          { papel: "usuario", texto: HIST_ALPHA, coaId: COA_B }
        ]
      }
    );

    const r = governarContexto({
      actoChamada: "mre:0_diagnostico",
      modo: "enforce",
      coaAtivo: meta.coaAtivo,
      casoAtivo: meta.casoAtivo,
      fontesLastroAutorizadas: meta.fontesLastroAutorizadas,
      objetivoOuAssuntoTurno: meta.objetivoOuAssuntoTurno,
      conteudoCandidato: meta.conteudoCandidato,
      regimeEspecial: meta.regimeEspecial || {}
    });

    assert.equal(r.autorizado, true);
    assert.ok(
      r.estado === ESTADOS_CG.AUTORIZADO_INTEGRAL ||
        r.estado === ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO
    );

    const msgs = messagesDePacoteAutorizado(r.pacoteAutorizado, []);
    const joined = msgs.map((m) => m.content).join("\n");
    assert.match(joined, /BETA-TOKEN-992/);
    assert.match(joined, /SulVerde/);
    assert.match(joined, /8\.888\.000/);
    assert.doesNotMatch(joined, /ALPHA-TOKEN-771/);
    assert.doesNotMatch(joined, /NorteAzul/);
  });

  it("LFC A (outro COA/caso) não entra no residual do COA B", () => {
    const r = governarContexto({
      actoChamada: "mre:4_analise",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [
        FONTES_CG.TURNO_ATUAL,
        FONTES_CG.LFC_ACTIVOS
      ],
      objetivoOuAssuntoTurno: INSTR_T1,
      conteudoCandidato: {
        fragmentos: [
          criarFragmento({
            id: "turno",
            papel: "user",
            texto: INSTR_T1,
            coaId: COA_B,
            casoId: null,
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
            texto: LFC_A[0],
            coaId: COA_A,
            casoId: CASO_A,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          })
        ]
      }
    });

    assert.equal(r.autorizado, true);
    const msgs = messagesDePacoteAutorizado(r.pacoteAutorizado, []);
    const joined = msgs.map((m) => m.content).join("\n");
    assert.match(joined, /BETA-TOKEN-992/);
    assert.doesNotMatch(joined, /ALPHA-TOKEN-771/);
    assert.ok(
      (r.violacoes || []).includes(CODIGOS_VIOLACAO.V1_COA) ||
        (r.remocoes || []).some((x) =>
          String(x?.codigo || x).includes("V1")
        ) ||
        r.estado === ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO
    );
  });

  it("não declara lfc_activos quando consumo.casoId ≠ caso activo do pedido", () => {
    const meta = montarCgMetaDeEntradaMre(
      {
        coaId: COA_B,
        casoId: CASO_B,
        factosOficiais: LFC_A,
        lfcConsumo: {
          autorizado: true,
          casoId: CASO_A,
          motivo: "lfc_activos",
          nFactos: 2
        }
      },
      { instrucao: INSTR_T1, lfcCasoId: CASO_B }
    );

    assert.equal(meta.casoAtivo.casoId, CASO_B);
    assert.ok(!meta.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    const lfcFrags = meta.conteudoCandidato.fragmentos.filter(
      (f) => f.fonte === FONTES_CG.LFC_ACTIVOS
    );
    assert.equal(lfcFrags.length, 0);
  });

  it("alegação Alpha→B continua bloqueada (INV_INFERENCIA)", () => {
    assert.equal(
      classificarUsoTurnoUtilizador(INSTR_T4),
      USOS_CG.ALEGACAO_FACTUAL
    );

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
      { instrucao: INSTR_T4 }
    );

    const r = governarContexto({
      actoChamada: "mre:0_diagnostico",
      modo: "enforce",
      coaAtivo: meta.coaAtivo,
      casoAtivo: meta.casoAtivo,
      fontesLastroAutorizadas: meta.fontesLastroAutorizadas,
      objetivoOuAssuntoTurno: INSTR_T4,
      conteudoCandidato: meta.conteudoCandidato,
      regimeEspecial: meta.regimeEspecial || {}
    });

    assert.equal(r.autorizado, false);
    assert.equal(r.estado, ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO);
    assert.ok((r.violacoes || []).includes(CODIGOS_VIOLACAO.INV_INFERENCIA));
  });

  it("gate MRE: B1–B3 enviados; Alpha histórico fora; enviado ⊆ autorizado", async () => {
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
      {
        instrucao: INSTR_T1,
        historico: [
          { papel: "usuario", texto: HIST_ALPHA, coaId: COA_B }
        ]
      }
    );

    const messagesOriginais = [
      { role: "system", content: "módulo MRE" },
      {
        role: "user",
        content: JSON.stringify({
          estagio: "0_diagnostico",
          contexto: {
            mensagem: `${INSTR_T1}\n${HIST_ALPHA}`,
            historico: [{ texto: HIST_ALPHA }]
          }
        })
      }
    ];

    const fragmentosActo = [
      ...meta.conteudoCandidato.fragmentos,
      criarFragmento({
        id: "stage-sys",
        papel: "system",
        texto: messagesOriginais[0].content,
        coaId: COA_B,
        fonte: FONTES_CG.NAO_DECLARADA,
        uso: USOS_CG.MANDATO_PROMPT
      }),
      criarFragmento({
        id: "stage-user",
        papel: "user",
        texto: messagesOriginais[1].content,
        coaId: COA_B,
        casoId: CASO_B,
        fonte: FONTES_CG.NAO_ETIQUETADO,
        uso: USOS_CG.MANDATO_PROMPT
      })
    ];

    let enviado = null;
    const saida = await atravessarGateLlm(
      {
        messages: messagesOriginais,
        temperature: 0.2,
        max_tokens: 400,
        cgMeta: {
          ...meta,
          actoChamada: "mre:0_diagnostico",
          fontesLastroAutorizadas: meta.fontesLastroAutorizadas,
          conteudoCandidato: {
            messages: messagesOriginais,
            fragmentos: fragmentosActo
          }
        }
      },
      async (body) => {
        enviado = body;
        return { texto: '{"ok":true}', origem: "llm" };
      }
    );

    assert.equal(saida.cg?.autorizado, true);
    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));

    const blob = JSON.stringify(enviado);
    assert.match(blob, /BETA-TOKEN-992/);
    assert.match(blob, /SulVerde/);
    assert.doesNotMatch(blob, /ALPHA-TOKEN-771/);
    assert.doesNotMatch(blob, /NorteAzul/);

    const rCheck = governarContexto({
      actoChamada: "mre:0_diagnostico",
      modo: "enforce",
      coaAtivo: meta.coaAtivo,
      casoAtivo: meta.casoAtivo,
      fontesLastroAutorizadas: meta.fontesLastroAutorizadas,
      conteudoCandidato: {
        messages: messagesOriginais,
        fragmentos: fragmentosActo
      }
    });
    assert.equal(
      enviadoSubconjuntoAutorizado(enviado.messages, rCheck.pacoteAutorizado),
      true
    );
  });
});
