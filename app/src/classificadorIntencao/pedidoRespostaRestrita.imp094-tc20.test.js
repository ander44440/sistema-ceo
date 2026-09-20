/**
 * IMP-094 / VAL-094 — TC-20 falso positivo LFC vs TC-16 listagem explícita.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";

const TC20 =
  "Com base apenas no lastro factual autorizado deste COA (factos activos do LFC deste caso), " +
  "faça uma deliberação/análise do projecto: priorize próximos passos face ao orçamento exclusivo " +
  "e ao fornecedor registados. Dê recomendação executiva (aprovar / modificar / não priorizar). " +
  "Não invente factos.";

const TC16 = "Liste apenas os factos activos do LFC deste caso.";

const TC15 =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";

describe("IMP-094 pedidoRespostaRestrita — TC-20 vs TC-16", () => {
  it("TC-20: factos activos como grounding deliberativo ≠ modo factos", () => {
    const d = detectarModoRespostaRestrita(TC20);
    assert.notEqual(d.modo, "factos");
    assert.equal(d.activo, false);
  });

  it("TC-16: listagem explícita → modo factos", () => {
    const d = detectarModoRespostaRestrita(TC16);
    assert.equal(d.activo, true);
    assert.equal(d.modo, "factos");
  });

  it("TC-15: consulta tipada → dado_unico (não factos)", () => {
    const d = detectarModoRespostaRestrita(TC15);
    assert.equal(d.activo, true);
    assert.equal(d.modo, "dado_unico");
  });

  it("variante activos (pt-BR): deliberação + factos ativos ≠ factos", () => {
    const t =
      "Com base nos factos ativos do LFC, faça uma análise do projecto e dê recomendação executiva.";
    const d = detectarModoRespostaRestrita(t);
    assert.notEqual(d.modo, "factos");
    assert.equal(d.activo, false);
  });
});
