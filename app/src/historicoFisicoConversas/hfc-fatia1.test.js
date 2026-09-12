/**
 * HFC fatia 1 — testes ARQ-087 / IMP-087.
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import {
  TIPO_CONVERSA_MENSAGEM,
  appendMensagem,
  apagarMensagemFisica,
  actualizarMensagemFisica,
  compactarStoreFisico,
  caminhoStoreHfc,
  carregarMensagens,
  criarAdaptadorHfcFs,
  listarMensagensFisicas,
  prepararEventoMensagem,
  registarMensagemFisica,
  configurarAdaptadorHfcLocal,
  resetEstadoHfcParaTestes
} from "./index.js";
import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  definirContextoConversacional,
  limparHistorico,
  listarMensagens,
  reiniciarStoreConversaParaTestes
} from "../modules/conversa/store.js";
import { carregarBucketChat } from "../modules/conversa/persistenciaChat.js";
import { STORAGE_KEY_CHAT } from "../modules/conversa/persistenciaChat.js";

const temps = [];

function tempRoot() {
  const d = mkdtempSync(join(tmpdir(), "ceo-hfc-"));
  temps.push(d);
  return d;
}

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
    get _map() {
      return map;
    }
  };
}

after(() => {
  for (const d of temps) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

beforeEach(() => {
  resetEstadoHfcParaTestes();
  globalThis.localStorage = criarStorage();
  reiniciarStoreConversaParaTestes();
});

test("domínio: pendente recusado; pronta aceite", () => {
  const pend = prepararEventoMensagem({
    coaId: "coa-a",
    mensagem: {
      id: "msg-1",
      papel: "ceo",
      texto: "…",
      estado: "pendente",
      criadoEm: "2026-09-11T10:00:00.000Z"
    }
  });
  assert.equal(pend.ok, false);
  assert.equal(pend.codigo, "estado_pendente");

  const ok = prepararEventoMensagem({
    coaId: "coa-a",
    mensagem: {
      id: "msg-2",
      papel: "usuario",
      texto: "olá",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:01.000Z"
    }
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.parcial.tipo, TIPO_CONVERSA_MENSAGEM);
  assert.equal(ok.parcial.id, "hfc-msg-2");
});

test("domínio: payload proibido", () => {
  const prep = prepararEventoMensagem({
    coaId: "coa-a",
    mensagem: {
      id: "msg-x",
      papel: "usuario",
      texto: "ok",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:00.000Z",
      decisao: "não pode"
    }
  });
  // campos extra na mensagem não entram no parcial — injectar no parcial
  assert.equal(prep.ok, true);
  const r = appendMensagem(caminhoStoreHfc(tempRoot()), {
    ...prep.parcial,
    decisao: "vazamento"
  });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "payload_proibido");
});

test("persistência: append + idempotência + ordem crescente", () => {
  const root = tempRoot();
  const dir = caminhoStoreHfc(root);
  const a = registarMensagemFisica(dir, {
    coaId: "coa-1",
    mensagem: {
      id: "msg-a",
      papel: "usuario",
      texto: "um",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:00.000Z"
    }
  });
  assert.equal(a.ok, true);
  assert.equal(a.ordem, 1);
  assert.equal(a.duplicado, undefined);

  const dup = registarMensagemFisica(dir, {
    coaId: "coa-1",
    mensagem: {
      id: "msg-a",
      papel: "usuario",
      texto: "um",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:00.000Z"
    }
  });
  assert.equal(dup.ok, true);
  assert.equal(dup.duplicado, true);

  const b = registarMensagemFisica(dir, {
    coaId: "coa-1",
    mensagem: {
      id: "msg-b",
      papel: "ceo",
      texto: "dois",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:01.000Z"
    }
  });
  assert.equal(b.ok, true);
  assert.equal(b.ordem, 2);

  const lista = carregarMensagens(dir);
  assert.equal(lista.length, 2);
  assert.equal(lista[0].ordem, 1);
  assert.equal(lista[1].ordem, 2);
});

test("imutabilidade API: apagar/actualizar/compactar recusados", () => {
  assert.equal(apagarMensagemFisica().codigo, "historico_append_only");
  assert.equal(actualizarMensagemFisica().codigo, "historico_append_only");
  assert.equal(compactarStoreFisico().codigo, "historico_append_only");
});

test("isolamento COA no mesmo ficheiro", () => {
  const dir = caminhoStoreHfc(tempRoot());
  registarMensagemFisica(dir, {
    coaId: "coa-a",
    mensagem: {
      id: "msg-a1",
      papel: "usuario",
      texto: "A",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:00.000Z"
    }
  });
  registarMensagemFisica(dir, {
    coaId: "coa-b",
    mensagem: {
      id: "msg-b1",
      papel: "usuario",
      texto: "B",
      estado: "pronta",
      criadoEm: "2026-09-11T10:00:01.000Z"
    }
  });
  const soA = listarMensagensFisicas(dir, { coaId: "coa-a" });
  const soB = listarMensagensFisicas(dir, { coaId: "coa-b" });
  assert.equal(soA.length, 1);
  assert.equal(soA[0].texto, "A");
  assert.equal(soB.length, 1);
  assert.equal(soB[0].texto, "B");
});

test("hook store: user+placeholder+finalize → 2 HFC; limpar UI não apaga HFC", () => {
  const root = tempRoot();
  configurarAdaptadorHfcLocal(criarAdaptadorHfcFs(root));
  definirContextoConversacional("coa-hook");

  acrescentarMensagem(
    criarMensagem({ papel: "usuario", texto: "pergunta", estado: "pronta" })
  );
  const ph = acrescentarMensagem(
    criarMensagem({ papel: "ceo", texto: "…", estado: "pendente" })
  );
  assert.equal(carregarMensagens(caminhoStoreHfc(root)).length, 1);

  atualizarMensagem(ph.id, { texto: "resposta", estado: "pronta" });
  const fisicos = carregarMensagens(caminhoStoreHfc(root));
  assert.equal(fisicos.length, 2);
  assert.equal(fisicos[0].papel, "usuario");
  assert.equal(fisicos[1].papel, "ceo");
  assert.equal(fisicos[1].texto, "resposta");

  limparHistorico();
  assert.equal(listarMensagens().length, 0);
  assert.equal(carregarBucketChat("coa-hook").length, 0);
  assert.equal(carregarMensagens(caminhoStoreHfc(root)).length, 2);
});

test("fail-soft: adaptador que falha não impede F5-C3", () => {
  configurarAdaptadorHfcLocal(() => {
    throw new Error("boom HFC");
  });
  definirContextoConversacional("coa-soft");
  acrescentarMensagem(
    criarMensagem({ papel: "usuario", texto: "sobrevive", estado: "pronta" })
  );
  assert.equal(listarMensagens().length, 1);
  assert.equal(carregarBucketChat("coa-soft").length, 1);
  assert.ok(globalThis.localStorage.getItem(STORAGE_KEY_CHAT));
});

test("erro durável também regista", () => {
  const dir = caminhoStoreHfc(tempRoot());
  const r = registarMensagemFisica(dir, {
    coaId: "coa-e",
    mensagem: {
      id: "msg-err",
      papel: "sistema",
      texto: "falhou",
      estado: "erro",
      criadoEm: "2026-09-11T10:00:00.000Z"
    }
  });
  assert.equal(r.ok, true);
  assert.equal(carregarMensagens(dir)[0].estado, "erro");
});
