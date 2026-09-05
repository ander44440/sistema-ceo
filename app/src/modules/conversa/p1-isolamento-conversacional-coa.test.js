/**
 * Isolamento conversacional por COA (REQ-037/038/039, ARQ-012).
 * Cenários A–G do patch de buckets por coaId.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarProjeto,
  selecionarProjeto,
  limparProjetoAtivo,
  recarregarCatalogo,
  obterProjetoAtivoId
} from "../../catalogoProjetos/index.js";
import { VERSAO, gravarDocumento } from "../../catalogoProjetos/persistencia.js";
import {
  acrescentarMensagem,
  criarMensagem,
  definirContextoConversacional,
  limparHistorico,
  listarMensagens,
  obterContextoConversacional,
  temHistorico
} from "./store.js";
import { enriquecerMensagemComFioRecente } from "../../mre/integracaoNucleo.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      map.set(k, String(v));
    },
    removeItem(k) {
      map.delete(k);
    }
  };
}

function resetCatalogoVazio() {
  globalThis.localStorage = criarStorage();
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: null,
    empresaAtivaId: null,
    empresas: [],
    projetos: [],
    gabinete: {}
  });
  recarregarCatalogo();
}

beforeEach(() => {
  resetCatalogoVazio();
  definirContextoConversacional(null);
  limparHistorico();
});

function msg(papel, texto) {
  return criarMensagem({ papel, texto });
}

test("A: novo COA B inicia com histórico vazio após mensagens em A", () => {
  const a = criarProjeto({ nome: "COA Isolamento A" });
  assert.equal(obterContextoConversacional(), a.id);
  acrescentarMensagem(msg("usuario", "turno A1"));
  acrescentarMensagem(msg("ceo", "resposta A1"));
  assert.equal(listarMensagens().length, 2);

  const b = criarProjeto({ nome: "COA Isolamento B" });
  assert.equal(obterProjetoAtivoId(), b.id);
  assert.equal(obterContextoConversacional(), b.id);
  assert.deepEqual(listarMensagens(), []);
  assert.equal(temHistorico(), false);
});

test("B: mensagens de A não aparecem em B", () => {
  const a = criarProjeto({ nome: "COA Isolamento A" });
  acrescentarMensagem(msg("usuario", "segredo de A — 60 dias"));
  const b = criarProjeto({ nome: "COA Isolamento B" });
  const textosB = listarMensagens().map((m) => m.texto);
  assert.equal(textosB.includes("segredo de A — 60 dias"), false);
  assert.equal(obterContextoConversacional(), b.id);
  void a;
});

test("C: retorno B → A restaura histórico de A intacto", () => {
  const a = criarProjeto({ nome: "COA Isolamento A" });
  acrescentarMensagem(msg("usuario", "decisão A"));
  acrescentarMensagem(msg("ceo", "fecho A"));
  const snapshotA = listarMensagens().map((m) => ({
    id: m.id,
    texto: m.texto,
    papel: m.papel
  }));

  const b = criarProjeto({ nome: "COA Isolamento B" });
  acrescentarMensagem(msg("usuario", "só em B"));
  assert.equal(listarMensagens().length, 1);

  selecionarProjeto(a.id);
  assert.equal(obterContextoConversacional(), a.id);
  const restaurado = listarMensagens().map((m) => ({
    id: m.id,
    texto: m.texto,
    papel: m.papel
  }));
  assert.deepEqual(restaurado, snapshotA);
  void b;
});

test("D: continuidade — fio recente MRE só com turnos do COA activo", () => {
  const a = criarProjeto({ nome: "COA Isolamento A" });
  acrescentarMensagem(msg("usuario", "contaminação 60 dias caixa"));
  acrescentarMensagem(msg("ceo", "adiar proposta 60 dias"));

  const b = criarProjeto({ nome: "COA Isolamento B" });
  acrescentarMensagem(msg("usuario", "atrasos sexta 70% RotaSul"));
  acrescentarMensagem(msg("ceo", "avaliar decisão RotaSul"));

  const enriquecido = enriquecerMensagemComFioRecente(
    "reavaliar decisão actual",
    listarMensagens()
  );
  assert.match(enriquecido, /atrasos sexta 70% RotaSul/);
  assert.match(enriquecido, /avaliar decisão RotaSul/);
  assert.doesNotMatch(enriquecido, /60 dias/);
  assert.doesNotMatch(enriquecido, /contaminação/);
  void a;
});

test("E: limparHistorico em B não altera A", () => {
  const a = criarProjeto({ nome: "COA Isolamento A" });
  acrescentarMensagem(msg("usuario", "permanente em A"));
  const b = criarProjeto({ nome: "COA Isolamento B" });
  acrescentarMensagem(msg("usuario", "apagável em B"));
  limparHistorico();
  assert.deepEqual(listarMensagens(), []);

  selecionarProjeto(a.id);
  assert.equal(listarMensagens().length, 1);
  assert.equal(listarMensagens()[0].texto, "permanente em A");
  void b;
});

test("F: limparProjetoAtivo sincroniza contexto sem COA; API pública intacta", () => {
  const a = criarProjeto({ nome: "COA Isolamento A" });
  acrescentarMensagem(msg("usuario", "em A"));
  limparProjetoAtivo();
  assert.equal(obterContextoConversacional(), null);
  assert.deepEqual(listarMensagens(), []);
  acrescentarMensagem(msg("sistema", "sem coa"));
  assert.equal(listarMensagens().length, 1);

  selecionarProjeto(a.id);
  assert.equal(listarMensagens()[0].texto, "em A");
});

test("G: RotaSul não recebe fio dos 60 dias do contexto anterior", () => {
  const anterior = criarProjeto({ nome: "Sistema CEO — simulação" });
  acrescentarMensagem(
    msg("usuario", "proposta de 60 dias — caixa e adiar")
  );
  acrescentarMensagem(msg("ceo", "Recomendação: adiar a proposta de 60 dias"));

  const rotaSul = criarProjeto({
    nome: "RotaSul — Administração",
    descricao: "Simulação empresarial"
  });
  assert.equal(obterContextoConversacional(), rotaSul.id);
  assert.deepEqual(listarMensagens(), []);

  acrescentarMensagem(
    msg(
      "usuario",
      "70% atrasos sexta — reavaliar decisão sem Jobs"
    )
  );
  const fio = enriquecerMensagemComFioRecente(
    "deliberação RotaSul",
    listarMensagens()
  );
  assert.match(fio, /70% atrasos sexta/);
  assert.doesNotMatch(fio, /60 dias/);
  assert.doesNotMatch(fio, /adiar a proposta/);
  void anterior;
});
