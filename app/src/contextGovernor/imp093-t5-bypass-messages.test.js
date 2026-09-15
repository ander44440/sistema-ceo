/**
 * IMP-093 — regressão VAL-093.3/T5:
 * messages[] com Alpha não podem bypassar residual após remoção V3 dos fragmentos.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  CODIGOS_VIOLACAO,
  atravessarGateLlm,
  enviadoSubconjuntoAutorizado,
  governarContexto,
  messagesDePacoteAutorizado,
  recomporPacote
} from "./index.js";

const COA_B = "prj-1789509185314-3";
const CASO_B = "ca2f0f97-b62c-4eae-b380-00ee2780e0cd";

const TEXTO_T5 =
  "VAL-093.3-T5: Qual é o fornecedor exclusivo e o orçamento registados nos factos activos do LFC deste caso B?";

const TEXTO_ALPHA_HIST =
  "VAL-093.3 T2: noutro projecto o código secreto é ALPHA-TOKEN-771 e o fornecedor exclusivo é NorteAzul Ltda. NÃO registe.";

const CONTEXTO_MRE_COM_ALPHA = JSON.stringify({
  estagio: "0_diagnostico",
  retentativa: false,
  contexto: {
    mensagem: `${TEXTO_T5}\n\n[Fio recente]\n${TEXTO_ALPHA_HIST}`,
    historico: [{ papel: "usuario", texto: TEXTO_ALPHA_HIST }]
  }
});

describe("IMP-093 — regressão VAL-093.3/T5 (bypass messages[] vs residual)", () => {
  it("recomporPacote: com fragmentos, messages[] reconstruídas só do residual", () => {
    const pacote = recomporPacote(
      {
        messages: [
          { role: "system", content: "sys" },
          { role: "user", content: CONTEXTO_MRE_COM_ALPHA }
        ],
        fragmentos: [
          {
            id: "mre-turno-atual",
            papel: "user",
            texto: TEXTO_T5,
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          },
          {
            id: "mre-stage-user",
            papel: "user",
            texto: CONTEXTO_MRE_COM_ALPHA,
            fonte: FONTES_CG.NAO_ETIQUETADO,
            uso: USOS_CG.MANDATO_PROMPT
          }
        ]
      },
      [
        {
          id: "mre-turno-atual",
          papel: "user",
          texto: TEXTO_T5,
          fonte: FONTES_CG.TURNO_ATUAL,
          uso: USOS_CG.MANDATO_PROMPT
        }
      ]
    );

    assert.equal(pacote.fragmentos.length, 1);
    assert.equal(pacote.fragmentos[0].id, "mre-turno-atual");
    assert.equal(pacote.messages.length, 1);
    assert.equal(pacote.messages[0].content, TEXTO_T5);
    assert.ok(!/ALPHA-TOKEN-771|NorteAzul/.test(JSON.stringify(pacote)));
  });

  it("messagesDePacoteAutorizado: fragmentos residual têm prioridade sobre messages originais", () => {
    const msgs = messagesDePacoteAutorizado({
      messages: [
        { role: "user", content: CONTEXTO_MRE_COM_ALPHA }
      ],
      fragmentos: [
        {
          id: "ok",
          papel: "user",
          texto: TEXTO_T5,
          fonte: FONTES_CG.TURNO_ATUAL
        }
      ]
    });
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].content, TEXTO_T5);
    assert.ok(!/ALPHA-TOKEN-771|NorteAzul/.test(JSON.stringify(msgs)));
  });

  it("T5: messages[] com Alpha + fragmentos rejeitados → enviado sem Alpha; enviado ⊆ autorizado", async () => {
    let bodyEnviado = null;
    let transportCalls = 0;

    const fragmentos = [
      {
        id: "mre-turno-atual",
        papel: "user",
        texto: TEXTO_T5,
        coaId: COA_B,
        casoId: null,
        fonte: FONTES_CG.TURNO_ATUAL,
        uso: USOS_CG.MANDATO_PROMPT
      },
      {
        id: "mre-hist-alpha",
        papel: "user",
        texto: TEXTO_ALPHA_HIST,
        coaId: COA_B,
        casoId: null,
        fonte: FONTES_CG.NAO_DECLARADA,
        uso: USOS_CG.CONTINUIDADE
      },
      {
        id: "mre-stage-0_diagnostico-user",
        papel: "user",
        texto: CONTEXTO_MRE_COM_ALPHA,
        coaId: COA_B,
        casoId: CASO_B,
        fonte: FONTES_CG.NAO_ETIQUETADO,
        uso: USOS_CG.MANDATO_PROMPT
      }
    ];

    const messagesOriginais = [
      {
        role: "system",
        content: "És um módulo interno do Motor de Raciocínio Executivo."
      },
      { role: "user", content: CONTEXTO_MRE_COM_ALPHA }
    ];

    const r = governarContexto({
      actoChamada: "val0933:t5",
      modo: "enforce",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL],
      objetivoOuAssuntoTurno: TEXTO_T5,
      conteudoCandidato: {
        messages: messagesOriginais,
        fragmentos
      }
    });

    assert.equal(r.autorizado, true);
    assert.equal(r.estado, ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO);
    assert.ok(r.violacoes.includes(CODIGOS_VIOLACAO.V3_FONTE));
    assert.ok(
      Array.isArray(r.pacoteAutorizado?.fragmentos) &&
        r.pacoteAutorizado.fragmentos.every((f) => f.id === "mre-turno-atual")
    );
    assert.ok(!/ALPHA-TOKEN-771|NorteAzul/.test(JSON.stringify(r.pacoteAutorizado)));

    const msgsAuth = messagesDePacoteAutorizado(r.pacoteAutorizado, messagesOriginais);
    assert.ok(msgsAuth.every((m) => !/ALPHA-TOKEN-771|NorteAzul/.test(m.content || "")));
    assert.ok(msgsAuth.some((m) => String(m.content).includes("fornecedor exclusivo")));
    assert.equal(
      enviadoSubconjuntoAutorizado(msgsAuth, r.pacoteAutorizado),
      true,
      "invariante enviado ⊆ autorizado"
    );

    const saida = await atravessarGateLlm(
      {
        messages: messagesOriginais,
        temperature: 0.2,
        max_tokens: 400,
        cgMeta: {
          actoChamada: "val0933:t5-gate",
          modo: "enforce",
          coaAtivo: { id: COA_B },
          casoAtivo: { casoId: CASO_B },
          fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL],
          objetivoOuAssuntoTurno: TEXTO_T5,
          conteudoCandidato: {
            messages: messagesOriginais,
            fragmentos
          }
        }
      },
      async (body) => {
        transportCalls += 1;
        bodyEnviado = body;
        return { texto: "ok", ok: true };
      }
    );

    assert.equal(transportCalls, 1);
    assert.notEqual(saida.codigo, "cg_bloqueado");
    assert.ok(bodyEnviado);
    const serial = JSON.stringify(bodyEnviado);
    assert.ok(!/ALPHA-TOKEN-771/.test(serial));
    assert.ok(!/NorteAzul/.test(serial));
    assert.equal(
      enviadoSubconjuntoAutorizado(bodyEnviado.messages, r.pacoteAutorizado),
      true,
      "body enviado ⊆ pacote autorizado residual"
    );
  });
});
