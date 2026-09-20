/**
 * UI — botão Copiar nas caixas de resposta do CEO.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  copiarTextoResposta,
  htmlBotaoCopiarResposta,
  ligarBotoesCopiarResposta,
  textoRespostaDaCaixa
} from "./copiarResposta.js";

test("htmlBotaoCopiarResposta: botão com data-copiar-resposta", () => {
  const html = htmlBotaoCopiarResposta();
  assert.match(html, /data-copiar-resposta/);
  assert.match(html, />Copiar</);
  assert.match(html, /aria-label="Copiar resposta"/);
});

test("textoRespostaDaCaixa: lê só o corpo", () => {
  const article = {
    querySelector(sel) {
      if (String(sel).includes("cs-bubble-texto")) {
        return { textContent: "  Resposta pontual do CEO.  " };
      }
      return null;
    }
  };
  assert.equal(textoRespostaDaCaixa(article), "Resposta pontual do CEO.");
  assert.equal(textoRespostaDaCaixa(null), "");
});

test("copiarTextoResposta: escreve texto; vazio não chama clipboard", async () => {
  /** @type {string[]} */
  const copias = [];
  const ok = await copiarTextoResposta("Texto a copiar.", {
    writeText: async (t) => {
      copias.push(t);
    }
  });
  assert.equal(ok, true);
  assert.deepEqual(copias, ["Texto a copiar."]);

  const vazio = await copiarTextoResposta("", {
    writeText: async () => {
      throw new Error("não deve chamar");
    }
  });
  assert.equal(vazio, false);
});

test("ligarBotoesCopiarResposta: copia corpo e feedback Copiado", async () => {
  /** @type {string[]} */
  const copias = [];
  const timers = [];

  const btn = {
    dataset: {},
    textContent: "Copiar",
    classList: {
      _set: new Set(),
      add(c) {
        this._set.add(c);
      },
      remove(c) {
        this._set.delete(c);
      },
      contains(c) {
        return this._set.has(c);
      }
    },
    disabled: false,
    /** @type {((ev: object) => void)|null} */
    _handler: null,
    addEventListener(_tipo, fn) {
      this._handler = fn;
    },
    click() {
      return this._handler?.({
        preventDefault() {},
        stopPropagation() {}
      });
    }
  };

  const article = {
    querySelector(sel) {
      if (String(sel).includes("conv-msg-corpo")) {
        return { textContent: "Texto a copiar." };
      }
      return null;
    }
  };

  btn.closest = () => article;

  const root = {
    querySelectorAll(sel) {
      if (sel === "[data-copiar-resposta]") return [btn];
      return [];
    }
  };

  const prevSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return 1;
  };

  try {
    ligarBotoesCopiarResposta(root, {
      writeText: async (t) => {
        copias.push(t);
      },
      feedbackMs: 20
    });
    await btn.click();
    await Promise.resolve();
    assert.deepEqual(copias, ["Texto a copiar."]);
    assert.equal(btn.textContent, "Copiado");
    assert.equal(btn.classList.contains("is-copiado"), true);
    assert.equal(btn.disabled, true);
    assert.equal(timers.length, 1);
    timers[0].fn();
    assert.equal(btn.textContent, "Copiar");
    assert.equal(btn.classList.contains("is-copiado"), false);
    assert.equal(btn.disabled, false);
  } finally {
    globalThis.setTimeout = prevSetTimeout;
  }
});
