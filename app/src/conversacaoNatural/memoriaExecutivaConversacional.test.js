/**
 * DESP-007 — memória executiva conversacional.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classificarMemoriaExecutiva,
  decisaoRelevanteAoPedido,
  pedidoExplicitoMemoria,
  seleccionarRecuperacaoMemoria
} from "./memoriaExecutivaConversacional.js";

test("classifica permanentes vs temporários", () => {
  const c = classificarMemoriaExecutiva({
    objectivoPrincipal: "Usar CEO no MG2",
    decisoesTomadas: ["Adiar outdoor; focar pagamento"],
    restricoesAtivas: ["Não alterar governação"],
    entregaCorrente: "arte-outdoor",
    ultimoTurno: { papel: "usuario", texto: "e a arte?", anterior: null }
  });
  assert.equal(c.permanentes.objectivo, "Usar CEO no MG2");
  assert.equal(c.permanentes.decisoes[0], "Adiar outdoor; focar pagamento");
  assert.equal(c.temporarios.entregaCorrente, "arte-outdoor");
  assert.match(String(c.temporarios.ultimoPedido), /arte/i);
});

test("pedido explícito recupera decisão permanente", () => {
  const s = seleccionarRecuperacaoMemoria({
    instrucao: "Onde paramos? Lembra o que decidimos?",
    ctxImediato: {
      objectivoPrincipal: "Usar CEO no MG2",
      decisoesTomadas: ["Adiar outdoor e focar pagamento"],
      pendencias: ["Validar Sprint 1"],
      historicoComprimento: 6,
      ultimoTurno: { papel: "usuario", texto: "onde paramos?", anterior: null }
    }
  });
  assert.ok(s);
  assert.equal(s.tipo, "decisao");
  assert.equal(s.permanente, true);
  assert.match(s.prosa, /decisão|Adiar outdoor|pagamento/i);
});

test("sem lastro — não inventa memória", () => {
  assert.equal(
    seleccionarRecuperacaoMemoria({
      instrucao: "onde paramos?",
      ctxImediato: { historicoComprimento: 8 }
    }),
    null
  );
});

test("facto temporário sozinho não vira decisão", () => {
  assert.equal(
    seleccionarRecuperacaoMemoria({
      instrucao: "e agora?",
      ctxImediato: {
        historicoComprimento: 5,
        ultimoTurno: {
          papel: "usuario",
          texto: "falar da cor do botão",
          anterior: null
        }
      }
    }),
    null
  );
});

test("continuidade em conversa longa com lastro", () => {
  const s = seleccionarRecuperacaoMemoria({
    instrucao: "E o outdoor nesta sprint?",
    jaTemAncoraE: false,
    ctxImediato: {
      objectivoPrincipal: "Usar CEO no Motoboy Game 2",
      decisoesTomadas: ["Priorizar pagamento sobre outdoor"],
      pendencias: [],
      historicoComprimento: 6,
      houveShiftTopico: false,
      ultimoTurno: {
        papel: "usuario",
        texto: "E o outdoor nesta sprint?",
        anterior: { papel: "ceo", texto: "Ok." }
      }
    }
  });
  assert.ok(s);
  assert.ok(["continuidade", "decisao"].includes(s.tipo));
  assert.match(s.prosa, /CEO|pagamento|outdoor|decisão|Continuidade/i);
});

test("não recupera se já está no fio recente", () => {
  const decisao = "Adiar outdoor e focar pagamento";
  assert.equal(
    seleccionarRecuperacaoMemoria({
      instrucao: "onde paramos?",
      ctxImediato: {
        objectivoPrincipal: "MG2",
        decisoesTomadas: [decisao],
        historicoComprimento: 4,
        ultimoTurno: {
          papel: "ceo",
          texto: `Mantemos a decisão: ${decisao}.`,
          anterior: { papel: "usuario", texto: "onde paramos?" }
        }
      }
    }),
    null
  );
});

test("helpers pedido e relevância", () => {
  assert.equal(pedidoExplicitoMemoria("O que decidimos ontem?"), true);
  assert.equal(pedidoExplicitoMemoria("Aprova o outdoor"), false);
  assert.equal(
    decisaoRelevanteAoPedido(
      "Mantemos o outdoor ou pagamento?",
      "Adiar outdoor; focar pagamento"
    ),
    true
  );
});
