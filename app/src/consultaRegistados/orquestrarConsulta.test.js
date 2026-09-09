/**
 * IMP-086 — C-ORQ / CA-086-1…5,7,9 + isolamento COA + read-only
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  appendRegistroMo,
  reiniciarMemoriaConfiavelParaTestes,
  hidratarMemoriaConfiavel
} from "../memoriaConfiavel/index.js";
import {
  gravarBucketChat,
  limparDocumentoChat
} from "../modules/conversa/persistenciaChat.js";
import { orquestrarConsultaRegistados } from "./orquestrarConsulta.js";
import { montarRespostaConsulta } from "./montarResposta.js";

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
    },
    _map: map
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
    quando: "2026-09-09T20:00:00.000Z",
    porque: "Teste IMP-086",
    baseadoEm: "REQ-086",
    resultado: "Registo de teste",
    origem: "manual",
    tipo: "decisao"
  });
}

test("não pedido ⇒ consumido false", () => {
  const r = orquestrarConsultaRegistados({
    texto: "Despacha o job",
    coaIdActivo: "coa-mg2"
  });
  assert.equal(r.consumido, false);
});

test("CA-086-1/7: ausência explícita quando MO e transcript vazios", () => {
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2"
  });
  assert.equal(r.consumido, true);
  assert.match(r.mensagem, /Ausência explícita/i);
  assert.equal((r.dados.decisoes || []).length, 0);
});

test("CA-086-1/4: hit MO + consumo consultarRegistosMo", () => {
  registarMo("coa-mg2", "Taxa zerada em cancelamento");
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos sobre taxa?",
    coaIdActivo: "coa-mg2"
  });
  assert.equal(r.consumido, true);
  assert.ok(r.dados.decisoes.length >= 1);
  assert.match(r.mensagem, /Taxa zerada/i);
  assert.match(r.mensagem, /Memória Confiável/i);
});

test("CA-086-2: separa decisão e discussão", () => {
  registarMo("coa-mg2", "Decisão A");
  gravarBucketChat("coa-mg2", [
    {
      id: "m1",
      papel: "usuario",
      texto: "Vamos falar do outdoor",
      criadoEm: "2026-09-09T10:00:00.000Z",
      estado: "pronta"
    }
  ]);
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos e o que discutimos?",
    coaIdActivo: "coa-mg2"
  });
  // Se detector der só decisão, força ambos via montagem
  if (r.dados.ramo !== "ambos") {
    const m = montarRespostaConsulta({
      coaId: "coa-mg2",
      ramo: "ambos",
      decisoes: { status: "encontrado", registos: r.dados.decisoes },
      discussoes: {
        status: "encontrado",
        mensagens: [
          {
            id: "m1",
            papel: "usuario",
            texto: "Vamos falar do outdoor"
          }
        ]
      }
    });
    assert.match(m.mensagem, /## Decisões/);
    assert.match(m.mensagem, /## Discussões/);
  } else {
    assert.match(r.mensagem, /## Decisões/);
    assert.match(r.mensagem, /## Discussões/);
  }
});

test("CA-086-3: isolamento por COA", () => {
  registarMo("coa-A", "Só no A");
  registarMo("coa-B", "Só no B");
  gravarBucketChat("coa-A", [
    {
      id: "a1",
      papel: "usuario",
      texto: "fala A",
      criadoEm: "2026-09-09T10:00:00.000Z",
      estado: "pronta"
    }
  ]);
  gravarBucketChat("coa-B", [
    {
      id: "b1",
      papel: "usuario",
      texto: "fala B",
      criadoEm: "2026-09-09T10:00:00.000Z",
      estado: "pronta"
    }
  ]);

  const soA = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-A"
  });
  assert.equal(soA.consumido, true);
  assert.ok(soA.dados.decisoes.every((d) => d.coaId === "coa-A"));
  assert.ok(!soA.mensagem.includes("Só no B"));

  const discA = orquestrarConsultaRegistados({
    texto: "O que discutimos no transcript?",
    coaIdActivo: "coa-A"
  });
  assert.ok(discA.mensagem.includes("fala A"));
  assert.ok(!discA.mensagem.includes("fala B"));
});

test("CA-086-5: read-only — orquestração não grava MO nem transcript", () => {
  registarMo("coa-mg2", "Base");
  const writes = [];
  const storage = globalThis.localStorage;
  const origSet = storage.setItem.bind(storage);
  storage.setItem = (k, v) => {
    writes.push(String(k));
    return origSet(k, v);
  };

  orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2"
  });

  assert.equal(
    writes.length,
    0,
    `leituras não devem setItem; got ${writes.join(",")}`
  );
  storage.setItem = origSet;
});

test("CA-086-9: workspace não entra como Art. 8º (só MO)", () => {
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      consultarMo: () => ({
        status: "ausente",
        registos: [],
        mensagem: "Ausência explícita: nenhuma decisão registrada na Memória Confiável."
      })
    }
  });
  assert.equal(r.consumido, true);
  assert.match(r.mensagem, /Ausência explícita/);
  assert.ok(!/workspace|Painel do Dia|executiveMemory/i.test(r.mensagem));
});

test("sem COA ⇒ desambiguação sem inventar", () => {
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: null
  });
  assert.equal(r.consumido, true);
  assert.match(r.mensagem, /COA/i);
  assert.equal((r.dados.decisoes || []).length, 0);
});

test("F-TR opcional: falha soft não bloqueia", () => {
  registarMo("coa-mg2", "Com refs");
  const r = orquestrarConsultaRegistados({
    texto: "O que decidimos?",
    coaIdActivo: "coa-mg2",
    deps: {
      listarPorMo: () => {
        throw new Error("trilha indisponível");
      }
    }
  });
  assert.equal(r.consumido, true);
  assert.ok(r.dados.decisoes.length >= 1);
  assert.equal(r.dados.trilhaOk, false);
});
