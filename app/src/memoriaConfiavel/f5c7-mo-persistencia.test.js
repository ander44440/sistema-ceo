/**
 * F5-C7 — Memória Confiável (Ledger MO Art. 8º) — persistência e fronteiras.
 * T1 write · T2 read · T3 refresh · T4 isolamento COA · T5 conflito · T6 recuperação
 * T7 rejeita transcript · T8 sem imports mepCeo
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import executiveEngine from "../executiveEngine/index.js";
import {
  STORAGE_KEY_MO,
  ErroPersistenciaMo,
  appendRegistroMo,
  listarRegistosMo,
  obterRegistoMo,
  consultarRegistosMo,
  hidratarMemoriaConfiavel,
  obterEstadoPersistenciaMo,
  reiniciarMemoriaConfiavelParaTestes,
  limparEstadoCorruptoMoParaTestes,
  carregarDocumentoMo
} from "./index.js";

const DIR = dirname(fileURLToPath(import.meta.url));

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

function entradaBase(extra = {}) {
  return {
    coaId: "coa-mg2",
    decisao: "Taxa zerada em cancelamento nesta versão",
    quem: "Patrocinador",
    quando: "2026-09-09T18:00:00.000Z",
    porque: "Evitar ambiguidade no payout",
    baseadoEm: "Revisão do edge case de cancelamento",
    resultado: "Regra clara para implementação",
    origem: "manual",
    tipo: "decisao",
    ...extra
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarMemoriaConfiavelParaTestes();
});

test("T1 write: appendRegistroMo persiste com RAW", () => {
  hidratarMemoriaConfiavel();
  const r = appendRegistroMo(entradaBase());
  assert.ok(r.id);
  assert.ok(r.conteudoHash);
  assert.equal(r.coaId, "coa-mg2");
  assert.equal(r.decisao.includes("Taxa zerada"), true);

  const disco = carregarDocumentoMo();
  assert.equal(disco.status, "ok");
  assert.equal(disco.doc.registos.length, 1);
  assert.equal(disco.doc.registos[0].id, r.id);
  assert.equal(disco.doc.eixo, "organizacao");
  assert.ok(disco.doc.actualizadoEm);

  const estado = obterEstadoPersistenciaMo();
  assert.equal(estado.total, 1);
  assert.ok(["localStorage", "memoria"].includes(estado.medium));
});

test("T2 read: listar/obter/consultar — cópia e ausência explícita", () => {
  hidratarMemoriaConfiavel();
  const vazio = consultarRegistosMo({ coaId: "coa-mg2" });
  assert.equal(vazio.status, "ausente");
  assert.equal(vazio.registos.length, 0);
  assert.ok(vazio.mensagem);

  const r = appendRegistroMo(entradaBase());
  const lista = listarRegistosMo({ coaId: "coa-mg2" });
  assert.equal(lista.length, 1);
  lista[0].decisao = "MUTADO";
  assert.equal(obterRegistoMo(r.id).decisao.includes("Taxa"), true);

  const ok = consultarRegistosMo({ coaId: "coa-mg2", termo: "payout" });
  assert.equal(ok.status, "encontrado");
  assert.equal(ok.registos.length, 1);

  const miss = consultarRegistosMo({ coaId: "coa-mg2", termo: "xyz-inexistente" });
  assert.equal(miss.status, "ausente");
});

test("T3 refresh/restart: hidratar recupera do LS após limpar cache RAM", () => {
  hidratarMemoriaConfiavel();
  const r = appendRegistroMo(entradaBase());
  const raw = globalThis.localStorage.getItem(STORAGE_KEY_MO);
  assert.ok(raw);

  // Perde RAM; mantém LS; boot reidrata
  reiniciarMemoriaConfiavelParaTestes();
  globalThis.localStorage.setItem(STORAGE_KEY_MO, raw);

  const h = hidratarMemoriaConfiavel();
  assert.equal(h.ok, true);
  assert.equal(h.total, 1);
  assert.equal(h.status, "ok");

  const obtido = obterRegistoMo(r.id);
  assert.ok(obtido);
  assert.equal(obtido.conteudoHash, r.conteudoHash);

  // Boot do EE também hidrata sem lançar
  executiveEngine.inicializar();
  assert.equal(listarRegistosMo({ coaId: "coa-mg2" }).length, 1);
});

test("T4 isolamento por COA", () => {
  hidratarMemoriaConfiavel();
  appendRegistroMo(entradaBase({ coaId: "coa-A", decisao: "Decisão A" }));
  appendRegistroMo(
    entradaBase({
      coaId: "coa-B",
      decisao: "Decisão B",
      quando: "2026-09-09T19:00:00.000Z"
    })
  );

  const soA = listarRegistosMo({ coaId: "coa-A" });
  const soB = listarRegistosMo({ coaId: "coa-B" });
  assert.equal(soA.length, 1);
  assert.equal(soB.length, 1);
  assert.equal(soA[0].decisao, "Decisão A");
  assert.equal(soB[0].decisao, "Decisão B");
  assert.equal(
    soA.every((x) => x.coaId === "coa-A"),
    true
  );
});

test("T5a idempotência: mesmo conteudoHash+coaId rejeitado", () => {
  hidratarMemoriaConfiavel();
  appendRegistroMo(entradaBase());
  assert.throws(
    () => appendRegistroMo(entradaBase()),
    (err) =>
      err instanceof ErroPersistenciaMo && err.codigo === "duplicado_hash"
  );
});

test("T5b conflito_versao em corrida multi-aba", () => {
  hidratarMemoriaConfiavel();
  appendRegistroMo(entradaBase());

  const base = globalThis.localStorage;
  let leiturasMo = 0;
  globalThis.localStorage = {
    getItem(k) {
      const v = base.getItem(k);
      if (String(k) === STORAGE_KEY_MO && v) {
        leiturasMo += 1;
        // Leituras pares (verificação pré-gravação): devolvem actualizadoEm divergente
        if (leiturasMo % 2 === 0) {
          const d = JSON.parse(v);
          d.actualizadoEm = "1999-01-01T00:00:00.000Z";
          return JSON.stringify(d);
        }
      }
      return v;
    },
    setItem(k, v) {
      return base.setItem(k, v);
    },
    removeItem(k) {
      return base.removeItem(k);
    }
  };

  assert.throws(
    () =>
      appendRegistroMo(
        entradaBase({
          decisao: "Outra decisão após corrida",
          quando: "2026-09-09T20:00:00.000Z"
        })
      ),
    (err) =>
      err instanceof ErroPersistenciaMo && err.codigo === "conflito_versao"
  );
});

test("T6 recuperação: JSON inválido fail-closed; limpeza explícita recupera", () => {
  globalThis.localStorage.setItem(STORAGE_KEY_MO, "{nao-json");
  const h = hidratarMemoriaConfiavel();
  assert.equal(h.ok, false);
  assert.equal(h.status, "corrupto");
  // Chave NÃO destruída
  assert.equal(globalThis.localStorage.getItem(STORAGE_KEY_MO), "{nao-json");

  assert.throws(
    () => appendRegistroMo(entradaBase()),
    (err) =>
      err instanceof ErroPersistenciaMo && err.codigo === "estado_corrupto"
  );

  const limpo = limparEstadoCorruptoMoParaTestes();
  assert.equal(limpo.ok, true);
  assert.equal(limpo.status, "ausente");
  const r = appendRegistroMo(entradaBase());
  assert.ok(r.id);
});

test("T7 fronteira: rejeita payload com mensagens/transcript", () => {
  hidratarMemoriaConfiavel();
  assert.throws(
    () =>
      appendRegistroMo({
        ...entradaBase(),
        mensagens: [{ texto: "oi" }]
      }),
    (err) =>
      err instanceof ErroPersistenciaMo && err.codigo === "schema_invalido"
  );
  assert.throws(
    () =>
      appendRegistroMo({
        ...entradaBase(),
        transcript: "histórico completo"
      }),
    (err) =>
      err instanceof ErroPersistenciaMo && err.codigo === "schema_invalido"
  );
});

test("T8 fronteira: módulo não importa mepCeo", () => {
  const ficheiros = [
    "dominio.js",
    "persistenciaMo.js",
    "ledgerMo.js",
    "index.js"
  ];
  for (const f of ficheiros) {
    const src = readFileSync(join(DIR, f), "utf8");
    assert.equal(
      /from\s+["'][^"']*mepCeo[^"']*["']/.test(src),
      false,
      `${f} não deve importar mepCeo`
    );
    assert.equal(
      /require\s*\(\s*["'][^"']*mepCeo/.test(src),
      false,
      `${f} sem require mepCeo`
    );
    assert.equal(
      /import\s*\(\s*["'][^"']*mepCeo/.test(src),
      false,
      `${f} sem import() dinâmico mepCeo`
    );
  }
});
