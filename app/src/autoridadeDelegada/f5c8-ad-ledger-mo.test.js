/**
 * Fatia AD → Ledger MO — fecho_sob_delegacao com coaId explícito (opção D).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  AGENTES,
  activarAutoridadeDelegada,
  encerrarAutoridadeDelegada,
  CRITERIOS_ENCERRAMENTO,
  exercerFechoDelegado,
  reiniciarAutoridadeDelegadaParaTestes
} from "./autoridadeDelegada.js";
import {
  STORAGE_KEY_MO,
  hidratarMemoriaConfiavel,
  listarRegistosMo,
  reiniciarMemoriaConfiavelParaTestes
} from "../memoriaConfiavel/index.js";

function criarStorage() {
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
    }
  };
}

const COA = "coa-ledger-ad-1";

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarAutoridadeDelegadaParaTestes();
});

function activar(perimetro = "coa-mg2") {
  const r = activarAutoridadeDelegada({
    texto: "você decide",
    agente: AGENTES.usuario,
    perimetro
  });
  assert.equal(r.ok, true);
  return r;
}

test("AD→Ledger 1: fecho gera exactamente um registo no Ledger", () => {
  activar();
  const r = exercerFechoDelegado({
    coaId: COA,
    tipoFecho: "declarar_decisao",
    ambito: "coa-mg2",
    descricao: "Fecho único ledger",
    quando: "2026-09-09T22:00:00.000Z"
  });
  assert.equal(r.ok, true);
  const lista = listarRegistosMo({ coaId: COA });
  assert.equal(lista.length, 1);
});

test("AD→Ledger 2–4: mapeamento, origem ad, coaId explícito", () => {
  activar();
  const quando = "2026-09-09T22:01:00.000Z";
  const r = exercerFechoDelegado({
    coaId: COA,
    tipoFecho: "priorizar",
    ambito: "coa-mg2",
    descricao: "Priorizar X",
    quando
  });
  assert.equal(r.ok, true);
  const [reg] = listarRegistosMo({ coaId: COA });
  assert.ok(reg);
  assert.equal(reg.decisao, r.memoriaOrganizacional.oQue);
  assert.equal(reg.quem, r.memoriaOrganizacional.quem);
  assert.equal(reg.quando, quando);
  assert.equal(reg.porque, r.memoriaOrganizacional.porque);
  assert.equal(reg.baseadoEm, r.memoriaOrganizacional.baseadoEmQue);
  assert.equal(reg.resultado, r.memoriaOrganizacional.resultado);
  assert.equal(reg.origem, "ad");
  assert.equal(reg.coaId, COA);
  assert.equal(reg.id.startsWith("mo-ad-"), false);
});

test("AD→Ledger 5: reentrada não duplica no Ledger", () => {
  activar();
  const opts = {
    coaId: COA,
    tipoFecho: "priorizar",
    ambito: "coa-mg2",
    descricao: "Mesmo fecho",
    quando: "2026-09-09T22:02:00.000Z"
  };
  const a = exercerFechoDelegado(opts);
  const b = exercerFechoDelegado(opts);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(listarRegistosMo({ coaId: COA }).length, 1);
});

test("AD→Ledger 6: activação/encerramento NÃO escrevem no Ledger", () => {
  const act = activar();
  assert.equal(act.memoriaOrganizacional.tipoEvento, "activacao");
  assert.equal(listarRegistosMo().length, 0);

  const termo = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
    textoUsuario: "revogo a delegação"
  });
  assert.equal(termo.encerrado, true);
  assert.equal(termo.memoriaOrganizacional.tipoEvento, "encerramento");
  assert.equal(listarRegistosMo().length, 0);
});

test("AD→Ledger 6b: fecho sem coaId → erro de contrato, Ledger intacto", () => {
  activar();
  const r = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa-mg2"
  });
  assert.equal(r.ok, false);
  assert.ok(r.motivosRecusa.includes("coaId_ausente"));
  assert.equal(listarRegistosMo().length, 0);
});

test("AD→Ledger 7: persiste após reidratação do Ledger", () => {
  activar();
  const r = exercerFechoDelegado({
    coaId: COA,
    tipoFecho: "declarar_decisao",
    ambito: "coa-mg2",
    descricao: "Sobrevive refresh",
    quando: "2026-09-09T22:03:00.000Z"
  });
  assert.equal(r.ok, true);
  const raw = globalThis.localStorage.getItem(STORAGE_KEY_MO);
  assert.ok(raw);

  reiniciarMemoriaConfiavelParaTestes();
  globalThis.localStorage.setItem(STORAGE_KEY_MO, raw);
  const h = hidratarMemoriaConfiavel();
  assert.equal(h.ok, true);
  assert.equal(h.total, 1);
  assert.equal(listarRegistosMo({ coaId: COA })[0].origem, "ad");
});
