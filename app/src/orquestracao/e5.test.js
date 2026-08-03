/**
 * Testes SSE + fallback — IMP-055 E5.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { NOS_V1, montarNo } from "./dominio.js";
import {
  PATH_STREAM,
  PATH_SNAPSHOT,
  HINT_SSE,
  HINT_POLLING,
  formatarEventoSse,
  parsearDataEventoSse,
  aplicarEventoAosNos,
  criarDebounce,
  urlStreamOrquestracao
} from "./streamContrato.js";
import { correrLoopSseOrquestracao } from "./streamServidor.js";
import { ligarTempoRealOrquestracao } from "./tempoReal.js";
import { contarCartoesHtml, ligarPainelOrquestracao } from "./ui.js";

test("E5-CA3: path stream canónico", () => {
  assert.equal(PATH_STREAM, "/api/ceo/orquestracao/stream");
  assert.equal(PATH_SNAPSHOT, "/api/ceo/orquestracao/snapshot");
  assert.equal(urlStreamOrquestracao(""), PATH_STREAM);
  assert.equal(
    urlStreamOrquestracao("https://api.example"),
    "https://api.example/api/ceo/orquestracao/stream"
  );
});

test("E5 formatar/parsear eventos snapshot, pulse, no.atualizado", () => {
  const raw = formatarEventoSse("snapshot", {
    tipo: "snapshot",
    em: "t",
    nos: []
  });
  assert.match(raw, /^event: snapshot\n/);
  assert.match(raw, /data: /);

  const p = parsearDataEventoSse(
    JSON.stringify({ tipo: "pulse", em: "2026-08-01T12:00:00.000Z" })
  );
  assert.equal(p.ok, true);
  assert.equal(p.evento.tipo, "pulse");

  const nos = NOS_V1.map((id) => montarNo(id, "Ocioso"));
  const atualizado = montarNo("cto", "Executando");
  const r = aplicarEventoAosNos(nos, {
    tipo: "no.atualizado",
    em: "t",
    no: atualizado
  });
  assert.equal(r.alterou, true);
  assert.equal(r.nos.find((n) => n.id === "cto").estado, "Executando");

  const pulse = aplicarEventoAosNos(r.nos, { tipo: "pulse", em: "t2" });
  assert.equal(pulse.alterou, false);
});

test("E5 debounce 400ms agrupa actualizações", async () => {
  let n = 0;
  const d = criarDebounce(() => {
    n += 1;
  }, 40);
  d();
  d();
  d();
  assert.equal(n, 0);
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(n, 1);
  d.cancel();
});

test("E5-CA1: SSE entrega snapshot e actualiza UI sem polling", async () => {
  /** @type {any[]} */
  const instancias = [];
  class MockES {
    constructor(url) {
      this.url = url;
      this.listeners = {};
      this.onerror = null;
      this.closed = false;
      instancias.push(this);
    }
    addEventListener(tipo, fn) {
      this.listeners[tipo] = this.listeners[tipo] || [];
      this.listeners[tipo].push(fn);
    }
    close() {
      this.closed = true;
    }
    emit(tipo, data) {
      const ev = { data: JSON.stringify(data) };
      for (const fn of this.listeners[tipo] || []) fn(ev);
    }
  }

  /** @type {{ nos: object[], hint: string, modo: string }[]} */
  const pinturas = [];
  let polls = 0;

  const parar = ligarTempoRealOrquestracao({
    EventSourceImpl: MockES,
    debounceMs: 10,
    intervaloPollingMs: 60_000,
    obterSnapshot: async () => {
      polls += 1;
      return { ok: true, em: "t", nos: NOS_V1.map((id) => montarNo(id, "Ocioso")) };
    },
    onNos: (nos, hint, modo) => {
      pinturas.push({ nos, hint, modo });
    }
  });

  assert.equal(instancias.length, 1);
  assert.ok(String(instancias[0].url).includes(PATH_STREAM));

  const nos = NOS_V1.map((id) => montarNo(id, "Disponivel"));
  instancias[0].emit("snapshot", {
    tipo: "snapshot",
    em: "2026-08-01T12:00:00.000Z",
    nos
  });

  await new Promise((r) => setTimeout(r, 20));
  assert.ok(pinturas.length >= 1);
  const ultima = pinturas[pinturas.length - 1];
  assert.equal(ultima.modo, "sse");
  assert.equal(ultima.hint, HINT_SSE);
  assert.equal(ultima.nos.length, 6);
  assert.equal(polls, 0);

  instancias[0].emit("no.atualizado", {
    tipo: "no.atualizado",
    em: "t2",
    no: montarNo("agent", "Executando")
  });
  await new Promise((r) => setTimeout(r, 40));
  const depois = pinturas[pinturas.length - 1];
  assert.equal(depois.nos.find((n) => n.id === "agent").estado, "Executando");
  assert.equal(depois.modo, "sse");

  parar();
});

test("E5-CA2: SSE cortado → polling assume sem lançar", async () => {
  /** @type {any[]} */
  const instancias = [];
  class MockES {
    constructor(url) {
      this.url = url;
      this.listeners = {};
      this.onerror = null;
      this.closed = false;
      instancias.push(this);
    }
    addEventListener(tipo, fn) {
      this.listeners[tipo] = this.listeners[tipo] || [];
      this.listeners[tipo].push(fn);
    }
    close() {
      this.closed = true;
    }
  }

  /** @type {string[]} */
  const modos = [];
  /** @type {string[]} */
  const hints = [];
  let polls = 0;

  const parar = ligarTempoRealOrquestracao({
    EventSourceImpl: MockES,
    intervaloPollingMs: 60_000,
    obterSnapshot: async () => {
      polls += 1;
      return {
        ok: true,
        em: "t",
        nos: NOS_V1.map((id) => montarNo(id, "Ocioso"))
      };
    },
    onNos: (_nos, hint, modo) => {
      modos.push(modo);
      hints.push(hint);
    }
  });

  assert.equal(instancias.length, 1);
  instancias[0].onerror(new Event("error"));

  await new Promise((r) => setTimeout(r, 30));
  assert.ok(polls >= 1);
  assert.ok(modos.includes("polling"));
  assert.ok(hints.includes(HINT_POLLING));
  assert.equal(instancias[0].closed, true);

  parar();
});

test("E5 loop servidor: snapshot + pulse e pára", async () => {
  /** @type {{ event: string, data: object }[]} */
  const enviados = [];
  let ticks = 0;
  await correrLoopSseOrquestracao({
    obterSnapshotHttp: async () => ({
      ok: true,
      em: "2026-08-01T12:00:00.000Z",
      nos: NOS_V1.map((id) => montarNo(id, "Ocioso"))
    }),
    enviar: async (event, data) => {
      enviados.push({ event, data });
    },
    intervaloPulseMs: 5,
    maxPulsos: 2,
    refrescarSnapshot: false,
    sleep: async () => {
      ticks += 1;
    }
  });
  assert.equal(enviados[0].event, "snapshot");
  assert.equal(enviados[0].data.tipo, "snapshot");
  assert.equal(enviados[0].data.nos.length, 6);
  assert.equal(enviados.filter((e) => e.event === "pulse").length, 2);
  assert.equal(ticks, 2);
});

test("E5 painel: fallback polling pinta grelha (sem EventSource)", async () => {
  const root = {
    querySelector(sel) {
      if (sel === "#cs-orq-grid") return this.grid;
      if (sel === "#cs-orq-hint") return this.hint;
      return null;
    },
    grid: { isConnected: true, innerHTML: "", addEventListener() {}, removeEventListener() {} },
    hint: { textContent: "" }
  };
  const parar = ligarPainelOrquestracao(root, {
    preferirSse: false,
    intervaloMs: 60_000,
    obterSnapshot: async () => ({
      ok: true,
      em: "t",
      nos: NOS_V1.map((id) => montarNo(id, "Disponivel"))
    })
  });
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(contarCartoesHtml(root.grid.innerHTML), 6);
  assert.match(root.hint.textContent, /Actualização periódica|Em tempo real|Sinais/);
  parar();
});
