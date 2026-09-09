/**
 * IMP-086 — integração Núcleo: pedido explícito → consulta; negativo → path inalterado.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  appendRegistroMo,
  reiniciarMemoriaConfiavelParaTestes,
  hidratarMemoriaConfiavel
} from "../memoriaConfiavel/index.js";
import { limparDocumentoChat } from "../modules/conversa/persistenciaChat.js";
import { orquestrarConsultaRegistados } from "./orquestrarConsulta.js";
import { detectarPedidoExplicitoConsulta } from "./pedidoExplicito.js";

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

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarMemoriaConfiavelParaTestes();
  limparDocumentoChat();
});

test("integração: pedido positivo consome consulta sem Job/Motor", () => {
  hidratarMemoriaConfiavel();
  appendRegistroMo({
    coaId: "coa-mg2",
    decisao: "Regra de payout clara",
    quem: "Patrocinador",
    quando: "2026-09-09T20:00:00.000Z",
    porque: "Teste",
    baseadoEm: "IMP-086",
    resultado: "ok",
    origem: "manual",
    tipo: "decisao"
  });

  const det = detectarPedidoExplicitoConsulta("O que decidimos?");
  assert.equal(det.ehPedido, true);

  const out = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2"
  });
  assert.equal(out.consumido, true);
  assert.equal(out.dados.consultaRegistados, true);
  assert.ok(!out.dados.jobId);
  assert.ok(!out.dados.motorAcionado);
  assert.match(out.mensagem, /payout|Decisões|Ausência|Memória/i);
});

test("integração: pedido negativo não consome (caminho classificador/F5/Job)", () => {
  const out = orquestrarConsultaRegistados({
    texto: "Continuar o trabalho em andamento",
    coaIdActivo: "coa-mg2"
  });
  assert.equal(out.consumido, false);
});

test("integração Núcleo (executar): consulta devolve modo consulta_registados", async () => {
  const { inicializarCatalogo, selecionarProjeto } = await import(
    "../catalogoProjetos/index.js"
  );
  const { executiveEngine } = await import("../executiveEngine/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  reiniciarMemoriaConfiavelParaTestes();
  hidratarMemoriaConfiavel();
  appendRegistroMo({
    coaId: "prj-mg2",
    decisao: "Decisão via Núcleo",
    quem: "Patrocinador",
    quando: "2026-09-09T20:00:00.000Z",
    porque: "Integração",
    baseadoEm: "IMP-086",
    resultado: "ok",
    origem: "manual",
    tipo: "decisao"
  });

  executiveEngine.inicializar();
  const resp = await executiveEngine.executar({
    texto: "O que decidimos?"
  });

  assert.equal(resp.ok, true);
  assert.equal(resp.modo, "consulta_registados");
  assert.equal(resp.dados?.consultaRegistados, true);
  assert.ok(
    resp.dados?.encaminhamento?.destino === "consulta_registados",
    "destino consulta_registados"
  );
});
