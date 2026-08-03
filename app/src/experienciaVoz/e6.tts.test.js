/**
 * Testes PX-002 E6 — warm-up sem cancel; erros TTS explícitos.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { tentarAutorizacaoBrowser } from "./autorizacaoBrowser.js";
import { createBrowserProvider } from "../onboarding/voice/providers/browser.js";

test("warm-up: resume + speak sem cancel (E6)", () => {
  const calls = { resume: 0, speak: 0, cancel: 0 };
  const synth = {
    resume() {
      calls.resume += 1;
    },
    speak() {
      calls.speak += 1;
    },
    cancel() {
      calls.cancel += 1;
    }
  };
  const prevSynth = globalThis.speechSynthesis;
  const prevUtt = globalThis.SpeechSynthesisUtterance;
  globalThis.speechSynthesis = synth;
  globalThis.SpeechSynthesisUtterance = function Utterance(text) {
    this.text = text;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
  };

  try {
    const r = tentarAutorizacaoBrowser();
    assert.equal(r.ok, true);
    assert.equal(calls.resume, 1);
    assert.equal(calls.speak, 1);
    assert.equal(calls.cancel, 0);
  } finally {
    globalThis.speechSynthesis = prevSynth;
    globalThis.SpeechSynthesisUtterance = prevUtt;
  }
});

test("browser provider: onerror not-allowed rejeita (E6)", async () => {
  const utterances = [];
  const synth = {
    cancel() {},
    speak(u) {
      utterances.push(u);
      queueMicrotask(() => {
        if (typeof u.onerror === "function") {
          u.onerror({ error: "not-allowed" });
        }
      });
    },
    getVoices() {
      return [];
    },
    addEventListener() {}
  };
  const prevSynth = globalThis.speechSynthesis;
  const prevUtt = globalThis.SpeechSynthesisUtterance;
  globalThis.speechSynthesis = synth;
  globalThis.SpeechSynthesisUtterance = function Utterance(text) {
    this.text = text;
  };

  try {
    const provider = createBrowserProvider({
      language: "pt-BR",
      speed: 1,
      pitch: 1,
      volume: 1
    });
    await assert.rejects(
      () => provider.speak("Olá"),
      /bloqueou a fala|not-allowed|voz/i
    );
  } finally {
    globalThis.speechSynthesis = prevSynth;
    globalThis.SpeechSynthesisUtterance = prevUtt;
  }
});

test("browser provider: interrupted resolve limpo (E6)", async () => {
  const synth = {
    cancel() {},
    speak(u) {
      queueMicrotask(() => {
        if (typeof u.onerror === "function") {
          u.onerror({ error: "interrupted" });
        }
      });
    },
    getVoices() {
      return [];
    },
    addEventListener() {}
  };
  const prevSynth = globalThis.speechSynthesis;
  const prevUtt = globalThis.SpeechSynthesisUtterance;
  globalThis.speechSynthesis = synth;
  globalThis.SpeechSynthesisUtterance = function Utterance(text) {
    this.text = text;
  };

  try {
    const provider = createBrowserProvider({
      language: "pt-BR",
      speed: 1,
      pitch: 1,
      volume: 1
    });
    await provider.speak("Olá");
  } finally {
    globalThis.speechSynthesis = prevSynth;
    globalThis.SpeechSynthesisUtterance = prevUtt;
  }
});
