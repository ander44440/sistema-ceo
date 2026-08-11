/**
 * UI — campos #cs-dia-* preenchidos a partir da continuidade do CEO.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { htmlFaixaDoDia } from "./faixaDoDia.js";

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
});

test("UI: painel encerrar preenche #cs-dia-* com continuidade persistida", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    abrirDiaExecutivo,
    encerrarDiaExecutivo,
    obterUltimaContinuidade
  } = await import("../../catalogoProjetos/index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({ intencaoDoDia: "Homologacao UI relato" });
  encerrarDiaExecutivo({
    oQueAndou: "JOB-000074: ficheiro de homologacao criado",
    oQueFica: "JOB-000074 em needs_correction",
    proximoPassoAmanha: "Retomar JOB-000074 a partir do resultado"
  });
  const cont = obterUltimaContinuidade();
  assert.ok(cont);

  const html = htmlFaixaDoDia("encerrar");
  assert.match(html, /id="cs-dia-andou"/);
  assert.match(html, /id="cs-dia-fica"/);
  assert.match(html, /id="cs-dia-amanha"/);
  assert.match(html, /value="JOB-000074: ficheiro de homologacao criado"/);
  assert.match(html, /value="JOB-000074 em needs_correction"/);
  assert.match(html, /value="Retomar JOB-000074 a partir do resultado"/);
});
