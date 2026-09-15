/**
 * IMP-093 — classificação bloqueado_contaminacao (correcção VAL-093.2/C5).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  CODIGOS_VIOLACAO,
  atravessarGateLlm,
  governarContexto
} from "./index.js";

const COA_B = "prj-val0932-b";
const CASO_B = "caso-b-activo";
const COA_A = "prj-val0932-a";
const CASO_A = "caso-a-estranho";

describe("IMP-093 — bloqueado_contaminacao (VAL-093.2/C5)", () => {
  it("regressão C1: lastro do COA/caso activo suficiente → autorizado_integral", () => {
    const r = governarContexto({
      actoChamada: "val0932:c1",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS, FONTES_CG.TURNO_ATUAL],
      objetivoOuAssuntoTurno: "Liste os factos do caso activo",
      conteudoCandidato: {
        fragmentos: [
          {
            id: "ok",
            papel: "facto",
            texto: "B1 código secreto BETA-TOKEN-992",
            coaId: COA_B,
            casoId: CASO_B,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          },
          {
            id: "turno",
            papel: "user",
            texto: "Liste os factos do caso activo",
            coaId: COA_B,
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          }
        ]
      }
    });
    assert.equal(r.estado, ESTADOS_CG.AUTORIZADO_INTEGRAL);
    assert.equal(r.autorizado, true);
    assert.equal(r.remocoes.length, 0);
  });

  it("C5: só fragmento doutro COA/caso → bloqueado_contaminacao (não insuficiência)", () => {
    const r = governarContexto({
      actoChamada: "val0932:c5",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS, FONTES_CG.TURNO_ATUAL],
      objetivoOuAssuntoTurno: "Usar apenas lastro do COA activo",
      conteudoCandidato: {
        fragmentos: [
          {
            id: "xcoa",
            papel: "facto",
            texto: "A3 fornecedor exclusivo NorteAzul Ltda",
            coaId: COA_A,
            casoId: CASO_A,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.equal(r.estado, ESTADOS_CG.BLOQUEADO_CONTAMINACAO);
    assert.equal(r.autorizado, false);
    assert.equal(r.pacoteAutorizado, null);
    assert.ok(r.violacoes.includes(CODIGOS_VIOLACAO.V1_COA));
    assert.match(String(r.motivo?.mensagem || ""), /contamina/i);
  });

  it("C5 gate: bloqueado_contaminacao → sem transporte LLM", async () => {
    let transportCalls = 0;
    const saida = await atravessarGateLlm(
      {
        messages: [
          { role: "system", content: "A3 fornecedor exclusivo NorteAzul Ltda" }
        ],
        cgMeta: {
          actoChamada: "val0932:c5-gate",
          coaAtivo: { id: COA_B },
          casoAtivo: { casoId: CASO_B },
          fontesLastroAutorizadas: [
            FONTES_CG.LFC_ACTIVOS,
            FONTES_CG.TURNO_ATUAL
          ],
          objetivoOuAssuntoTurno: "Usar apenas lastro do COA activo",
          conteudoCandidato: {
            fragmentos: [
              {
                id: "xcoa",
                papel: "facto",
                texto: "A3 fornecedor exclusivo NorteAzul Ltda",
                coaId: COA_A,
                casoId: CASO_A,
                fonte: FONTES_CG.LFC_ACTIVOS,
                uso: USOS_CG.FACTO
              }
            ]
          }
        }
      },
      async () => {
        transportCalls += 1;
        return { texto: "nao-deve" };
      }
    );
    assert.equal(saida.codigo, "cg_bloqueado");
    assert.equal(saida.cg.estado, ESTADOS_CG.BLOQUEADO_CONTAMINACAO);
    assert.equal(saida.cg.autorizado, false);
    assert.equal(transportCalls, 0);
  });

  it("cross-caso explícito sem residual → bloqueado_contaminacao", () => {
    const r = governarContexto({
      actoChamada: "val0932:c5-caso",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS],
      objetivoOuAssuntoTurno: "Preciso do lastro do caso activo",
      conteudoCandidato: {
        fragmentos: [
          {
            id: "ycaso",
            papel: "facto",
            texto: "facto do caso Y",
            coaId: COA_B,
            casoId: "caso-y-outro",
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.equal(r.estado, ESTADOS_CG.BLOQUEADO_CONTAMINACAO);
    assert.equal(r.autorizado, false);
    assert.ok(r.violacoes.includes(CODIGOS_VIOLACAO.V2_CASO));
  });

  it("regressão C2: residual suficiente após remover estranho → apos_isolamento", () => {
    const r = governarContexto({
      actoChamada: "val0932:c2",
      coaAtivo: { id: COA_B },
      casoAtivo: { casoId: CASO_B },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS, FONTES_CG.TURNO_ATUAL],
      objetivoOuAssuntoTurno: "Liste factos",
      conteudoCandidato: {
        fragmentos: [
          {
            id: "ok",
            papel: "facto",
            texto: "B1 código secreto BETA-TOKEN-992",
            coaId: COA_B,
            casoId: CASO_B,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          },
          {
            id: "bad",
            papel: "facto",
            texto: "A1 código secreto ALPHA-TOKEN-771",
            coaId: COA_A,
            casoId: CASO_A,
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.equal(r.estado, ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO);
    assert.equal(r.autorizado, true);
    assert.ok(r.pacoteAutorizado);
  });

  it("regressão: esvaziamento sem cross-COA/caso → bloqueado_insuficiencia", () => {
    const r = governarContexto({
      actoChamada: "val0932:insuf",
      coaAtivo: { id: COA_B },
      fontesLastroAutorizadas: [],
      objetivoOuAssuntoTurno: "preciso de lastro",
      conteudoCandidato: {
        fragmentos: [
          {
            id: "x",
            papel: "user",
            texto: "pedido opaco",
            fonte: FONTES_CG.NAO_ETIQUETADO,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.equal(r.estado, ESTADOS_CG.BLOQUEADO_INSUFICIENCIA);
    assert.equal(r.autorizado, false);
    assert.ok(r.violacoes.includes(CODIGOS_VIOLACAO.V5_INSUF));
  });
});
