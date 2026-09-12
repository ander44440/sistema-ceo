/**
 * IMP-089 Fatia 1 — CA-089-1…5 + isolamento / Trilha / dedupe.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  appendRegistroMo,
  reiniciarMemoriaConfiavelParaTestes,
  hidratarMemoriaConfiavel,
  listarRegistosMo
} from "../memoriaConfiavel/index.js";
import {
  gravarBucketChat,
  limparDocumentoChat
} from "../modules/conversa/persistenciaChat.js";
import { orquestrarConsultaRegistados } from "./orquestrarConsulta.js";

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

function registarMo(coaId, decisao) {
  hidratarMemoriaConfiavel();
  return appendRegistroMo({
    coaId,
    decisao,
    quem: "Patrocinador",
    quando: "2026-09-11T20:00:00.000Z",
    porque: "Teste IMP-089",
    baseadoEm: "REQ-089",
    resultado: "Registo de teste",
    origem: "manual",
    tipo: "decisao"
  });
}

test("CA-089-1: após limpar F5-C3, discussão ainda vem do HFC", () => {
  const r = orquestrarConsultaRegistados({
    texto: "O que discutimos no transcript?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarHfcPorCoa: (coaId) => {
        assert.equal(coaId, "coa-mg2");
        return [
          {
            msgId: "msg-hfc-1",
            papel: "usuario",
            texto: "Discussão antiga sobre outdoor",
            criadoEm: "2026-09-10T10:00:00.000Z",
            estado: "pronta",
            coaId: "coa-mg2"
          }
        ];
      },
      // Simula limparHistorico / bucket vazio (F5-C3 preservado como contrato; vazio aqui).
      carregarBucket: () => []
    }
  });

  assert.equal(r.consumido, true);
  assert.match(r.mensagem, /Discussão antiga sobre outdoor/i);
  assert.match(r.mensagem, /## Discussões/);
});

test("CA-089-2: HFC não vira Art. 8º — decisões só do MO", () => {
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarHfcPorCoa: () => [
        {
          msgId: "x1",
          papel: "usuario",
          texto: "Parece uma decisão no chat",
          estado: "pronta"
        }
      ],
      consultarMo: () => ({
        status: "ausente",
        registos: [],
        mensagem:
          "Ausência explícita: nenhuma decisão registrada na Memória Confiável."
      })
    }
  });
  assert.equal(r.consumido, true);
  assert.equal((r.dados.decisoes || []).length, 0);
  assert.match(r.mensagem, /Ausência explícita/);
  assert.ok(!/Parece uma decisão no chat/i.test(r.mensagem));
});

test("CA-089-3: isolamento HFC por COA", () => {
  const r = orquestrarConsultaRegistados({
    texto: "O que discutimos?",
    coaIdActivo: "coa-A",
    deps: {
      listarHfcPorCoa: (coaId) => {
        if (coaId === "coa-A") {
          return [
            {
              msgId: "a1",
              papel: "usuario",
              texto: "fala só A",
              estado: "pronta",
              coaId: "coa-A"
            }
          ];
        }
        return [
          {
            msgId: "b1",
            papel: "usuario",
            texto: "fuga B",
            estado: "pronta",
            coaId: "coa-B"
          }
        ];
      },
      carregarBucket: () => []
    }
  });
  assert.ok(r.mensagem.includes("fala só A"));
  assert.ok(!r.mensagem.includes("fuga B"));
});

test("CA-089-4: Trilha refs a partir de moIds; soft-fail não bloqueia", () => {
  registarMo("coa-mg2", "Decisão com lastro");
  const lista = listarRegistosMo({ coaId: "coa-mg2" });
  const id = Array.isArray(lista) && lista[0] ? lista[0].id : null;
  assert.ok(id);

  const ok = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarPorMo: (mid) => {
        assert.equal(mid, id);
        return [
          {
            id: "ev-1",
            tipo: "gate.decisao_terminal",
            refs: { moRegistroId: mid, gateId: "g1", jobId: "JOB-1" }
          }
        ];
      }
    }
  });
  assert.equal(ok.consumido, true);
  assert.ok(ok.dados.decisoes.length >= 1);
  assert.match(ok.mensagem, /Referências de execução/i);
  assert.equal(ok.dados.trilhaOk, true);

  const soft = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarPorMo: () => {
        throw new Error("trilha down");
      }
    }
  });
  assert.equal(soft.consumido, true);
  assert.ok(soft.dados.decisoes.length >= 1);
  assert.equal(soft.dados.trilhaOk, false);
});

test("CA-089-5: consulta não grava via localStorage", () => {
  const writes = [];
  const storage = globalThis.localStorage;
  const origSet = storage.setItem.bind(storage);
  storage.setItem = (k, v) => {
    writes.push(String(k));
    return origSet(k, v);
  };

  orquestrarConsultaRegistados({
    texto: "O que discutimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarHfcPorCoa: () => [],
      carregarBucket: () => []
    }
  });

  assert.equal(writes.length, 0);
  storage.setItem = origSet;
});

test("CA-089: dedupe msgId entre HFC e F5-C3", () => {
  gravarBucketChat("coa-mg2", [
    {
      id: "dup-1",
      papel: "usuario",
      texto: "mesma mensagem",
      criadoEm: "2026-09-10T10:00:00.000Z",
      estado: "pronta"
    }
  ]);
  const r = orquestrarConsultaRegistados({
    texto: "O que discutimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarHfcPorCoa: () => [
        {
          msgId: "dup-1",
          papel: "usuario",
          texto: "mesma mensagem",
          estado: "pronta"
        }
      ]
    }
  });
  const ocorrencias = (r.mensagem.match(/mesma mensagem/g) || []).length;
  assert.equal(ocorrencias, 1);
});
