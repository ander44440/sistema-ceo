/**
 * Testes domínio Conector CTO (REQ-054) — sem rede.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  validarPacoteConsultaCto,
  validarCorpoSchema,
  extrairJson,
  montarResultadoDeParsed,
  montarMensagensCto,
  POLICY_CTO,
  BUDGET
} from "../../server/ctoConnector/dominio.js";
import { criarExecutarConsultaCto } from "../../server/ctoConnector/index.js";
import { classificarIntencao } from "../executiveEngine/classificar.js";

const pacoteOk = {
  consultaId: "c-1",
  tipo: "parecer_arquitetural",
  pergunta: "Devemos homologar a ARQ-015?",
  contextoExecutivo: {
    situacao: "Gate ARQ",
    normaAplicavel: ["ARQ-015"],
    estado: "ok",
    evidencia: "v0.2",
    pedidoFormato: "cto.parecer_v1"
  },
  expectativaSchema: "cto.parecer_v1"
};

test("V-E1 rejeita pacote sem campos obrigatórios", () => {
  const v = validarPacoteConsultaCto({ consultaId: "x" });
  assert.equal(v.ok, false);
});

test("V-E2 rejeita tipo/schema inválidos", () => {
  assert.equal(
    validarPacoteConsultaCto({ ...pacoteOk, tipo: "xpto" }).ok,
    false
  );
  assert.equal(
    validarPacoteConsultaCto({
      ...pacoteOk,
      expectativaSchema: "cto.fake"
    }).ok,
    false
  );
});

test("V-E3 budget pergunta", () => {
  const v = validarPacoteConsultaCto({
    ...pacoteOk,
    pergunta: "a".repeat(BUDGET.perguntaMax + 1)
  });
  assert.equal(v.ok, false);
});

test("pacote válido passa", () => {
  assert.equal(validarPacoteConsultaCto(pacoteOk).ok, true);
});

test("CA3 pacote inválido não chama LLM", async () => {
  let chamadas = 0;
  const executar = criarExecutarConsultaCto({
    configDeEnvCto: () => ({ configurado: true, model: "x", key: "k", base: "http://x" }),
    chamarLlm: async () => {
      chamadas += 1;
      return { texto: "{}", modelo: "x" };
    },
    env: {}
  });
  const out = await executar({ consultaId: "z" });
  assert.equal(chamadas, 0);
  assert.equal(out.httpStatus, 400);
  assert.equal(out.body.codigo, "PACOTE_INVALIDO");
});

test("schema parecer exige conclusao; rejeita patch", () => {
  assert.equal(
    validarCorpoSchema("cto.parecer_v1", { conclusao: "Sim" }).ok,
    true
  );
  assert.equal(validarCorpoSchema("cto.parecer_v1", {}).ok, false);
  assert.equal(
    validarCorpoSchema("cto.parecer_v1", {
      conclusao: "x",
      patch: "evil"
    }).ok,
    false
  );
});

test("extrairJson e montarResultado ok", () => {
  const parsed = extrairJson(
    JSON.stringify({
      papelConfirmado: "CTO",
      estado: "ok",
      resumo: "ok",
      corpoEstruturado: { conclusao: "Homologar" }
    })
  );
  const m = montarResultadoDeParsed(pacoteOk, parsed, {
    modelo: "m",
    latenciaMs: 1,
    criadoEm: new Date().toISOString()
  });
  assert.equal(m.ok, true);
  assert.equal(m.resultado.papelConfirmado, "CTO");
});

test("retry schema: segunda chamada após JSON inválido", async () => {
  let n = 0;
  const executar = criarExecutarConsultaCto({
    configDeEnvCto: () => ({
      configurado: true,
      model: "m",
      key: "k",
      base: "http://x"
    }),
    chamarLlm: async () => {
      n += 1;
      if (n === 1) return { texto: "nao-json", modelo: "m" };
      return {
        texto: JSON.stringify({
          papelConfirmado: "CTO",
          estado: "ok",
          resumo: "corrigido",
          corpoEstruturado: { conclusao: "Sim" }
        }),
        modelo: "m"
      };
    },
    env: {}
  });
  const out = await executar(pacoteOk);
  assert.equal(n, 2);
  assert.equal(out.httpStatus, 200);
  assert.equal(out.body.estado, "ok");
});

test("sem chave → erro_transporte sem chamar modelo com sucesso", async () => {
  let n = 0;
  const executar = criarExecutarConsultaCto({
    configDeEnvCto: () => ({ configurado: false, model: "m", key: "", base: "" }),
    chamarLlm: async () => {
      n += 1;
      return { texto: "{}", modelo: "m" };
    },
    env: {}
  });
  const out = await executar(pacoteOk);
  assert.equal(n, 0);
  assert.equal(out.body.estado, "erro_transporte");
});

test("V-I4 classificar consulta cto ≠ ia", () => {
  const i = classificarIntencao("consultar cto: devemos abrir REQ-054?");
  assert.equal(i.capacidade, "consultar_cto");
  assert.notEqual(i.capacidade, "ia");
});

test("policy CTO proíbe implementação", () => {
  assert.match(POLICY_CTO, /Nunca implementas código/i);
  const msgs = montarMensagensCto(pacoteOk);
  assert.equal(msgs[0].role, "system");
  assert.match(msgs[0].content, /CTO/);
});
