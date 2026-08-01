/**
 * Testes domínio Orquestração — IMP-055 E1 (sem UI / SSE / rotas).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ESTADOS,
  NOS_V1,
  CAMPOS_VISTA_PRINCIPAL,
  DESCRICOES_RESUMIDAS,
  ehEstadoValido,
  aplicarPrecedencia,
  reduzirEstados,
  obterDescricaoResumida,
  extrairVistaPrincipal,
  validarVistaPrincipal,
  validarNo,
  validarSnapshot,
  montarNo,
  montarSnapshotV1Uniforme
} from "./dominio.js";

test("E1-CA1: só os cinco estados do enum são válidos", () => {
  assert.equal(ESTADOS.length, 5);
  for (const e of ESTADOS) assert.equal(ehEstadoValido(e), true);
  assert.equal(ehEstadoValido("Online"), false);
  assert.equal(ehEstadoValido("disponivel"), false);
  assert.equal(validarNo(montarNo("ceo", "Disponivel")).ok, true);
  assert.throws(() => montarNo("ceo", "Online"));
});

test("E1-CA2: precedência Erro > Executando > Aguardando > Disponivel > Ocioso", () => {
  assert.equal(aplicarPrecedencia("Ocioso", "Disponivel"), "Disponivel");
  assert.equal(aplicarPrecedencia("Disponivel", "Aguardando"), "Aguardando");
  assert.equal(aplicarPrecedencia("Aguardando", "Executando"), "Executando");
  assert.equal(aplicarPrecedencia("Executando", "Erro"), "Erro");
  assert.equal(aplicarPrecedencia("Erro", "Ocioso"), "Erro");
  assert.equal(
    reduzirEstados(["Ocioso", "Disponivel", "Aguardando", "Executando"]),
    "Executando"
  );
  assert.equal(
    reduzirEstados(["Executando", "Erro", "Disponivel"]),
    "Erro"
  );
});

test("E1-CA3: todo nó V1 tem descricaoResumida para cada estado", () => {
  assert.equal(NOS_V1.length, 6);
  for (const id of NOS_V1) {
    for (const estado of ESTADOS) {
      const d = obterDescricaoResumida(id, estado);
      assert.ok(d.trim().length > 0, `${id}/${estado}`);
      assert.equal(DESCRICOES_RESUMIDAS[id][estado], d);
      const no = montarNo(id, estado);
      assert.equal(no.descricaoResumida, d);
    }
  }
});

test("E1-CA4: detalhe e origemSinal no modelo; fora da vista principal", () => {
  const no = montarNo("backend", "Disponivel", {
    detalhe: { health: "ok" },
    origemSinal: "health"
  });
  assert.ok(no.detalhe);
  assert.equal(no.origemSinal, "health");
  const v = validarNo(no);
  assert.equal(v.ok, true);

  const vista = extrairVistaPrincipal(no);
  assert.deepEqual(Object.keys(vista).sort(), [...CAMPOS_VISTA_PRINCIPAL].sort());
  assert.equal("detalhe" in vista, false);
  assert.equal("origemSinal" in vista, false);
  assert.equal("id" in vista, false);
  assert.equal(validarVistaPrincipal(vista).ok, true);

  assert.equal(
    validarVistaPrincipal({
      ...vista,
      detalhe: "segredo"
    }).ok,
    false
  );
  assert.equal(
    validarVistaPrincipal({
      ...vista,
      origemSinal: "health"
    }).ok,
    false
  );
});

test("validarSnapshot exige os seis nós V1", () => {
  const snap = montarSnapshotV1Uniforme("Ocioso");
  assert.equal(validarSnapshot(snap).ok, true);
  assert.equal(snap.nos.length, 6);
  assert.equal(
    validarSnapshot({ em: new Date().toISOString(), nos: snap.nos.slice(0, 5) })
      .ok,
    false
  );
});

test("vista principal exige nome, estado e descricaoResumida preenchidos", () => {
  const no = montarNo("cto", "Executando");
  const vista = extrairVistaPrincipal(no);
  assert.equal(vista.nome, "CTO");
  assert.equal(vista.estado, "Executando");
  assert.match(vista.descricaoResumida, /Consulta/);
  assert.equal(validarVistaPrincipal({ nome: "X", estado: "Ocioso" }).ok, false);
});
