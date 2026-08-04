/**
 * IMP-068 — Modo CEO Ouvindo (MVP)
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  ESTADO_TURNO,
  TRANSICOES_TURNO,
  criarVoiceStateManager,
  criarVoiceController
} from "./index.js";

describe("IMP-068 CEO Ouvindo", () => {
  test("CT-CO01: máquina de estados — Idle → Ouvindo → Processando → Respondendo → Ouvindo", () => {
    const sm = criarVoiceStateManager();
    assert.equal(sm.estado(), ESTADO_TURNO.IDLE);
    assert.equal(sm.transitar(ESTADO_TURNO.OUVINDO).ok, true);
    assert.equal(sm.transitar(ESTADO_TURNO.PROCESSANDO).ok, true);
    assert.equal(sm.transitar(ESTADO_TURNO.RESPONDENDO).ok, true);
    assert.equal(sm.transitar(ESTADO_TURNO.OUVINDO).ok, true);
  });

  test("CT-CO02: rejeita Ouvindo → Respondendo (exclusão anti-feedback)", () => {
    const sm = criarVoiceStateManager();
    sm.transitar(ESTADO_TURNO.OUVINDO);
    const r = sm.transitar(ESTADO_TURNO.RESPONDENDO);
    assert.equal(r.ok, false);
    assert.equal(sm.estado(), ESTADO_TURNO.OUVINDO);
  });

  test("CT-CO03: TRANSICOES_TURNO cobre os 6 estados", () => {
    for (const e of Object.values(ESTADO_TURNO)) {
      assert.ok(TRANSICOES_TURNO[e], e);
    }
  });

  test("CT-CO04: controller processa texto via enviarTexto (fronteira) + TTS + auto Ouvindo", async () => {
    const eventos = [];
    let enviado = null;
    const sttFake = {
      suportado: () => true,
      configurar() {},
      iniciar() {},
      parar() {},
      escutando: () => false
    };
    const ttsFake = {
      async speak() {
        return { falou: true };
      },
      stop() {}
    };
    const devicesFake = {
      suportado: () => true,
      async garantirPermissaoMic() {
        return { ok: true };
      },
      fecharCaptura() {},
      estaCapturando: () => false
    };

    const ctrl = criarVoiceController({
      retornoAutomaticoOuvindo: true,
      onEvento: (e) => eventos.push(e),
      enviarTexto: async (texto) => {
        enviado = texto;
        return { ok: true, mensagem: "Resposta teste", dados: { textoVoz: "Resposta teste" } };
      },
      stt: sttFake,
      tts: ttsFake,
      devices: devicesFake
    });

    const ini = await ctrl.iniciarEscuta();
    assert.equal(ini.ok, true);
    assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO);

    await ctrl._processarTranscricao("Qual é o seu papel?");
    assert.equal(enviado, "Qual é o seu papel?");
    assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO);
    assert.ok(eventos.some((e) => e.tipo === "processamento_iniciado"));
    assert.ok(eventos.some((e) => e.tipo === "resposta_pronta"));
  });

  test("CT-CO05: STT indisponível → Erro sem chamar enviarTexto", async () => {
    let chamadas = 0;
    const ctrl = criarVoiceController({
      enviarTexto: async () => {
        chamadas += 1;
        return { ok: true, mensagem: "x" };
      },
      stt: {
        suportado: () => false,
        configurar() {},
        iniciar() {},
        parar() {},
        escutando: () => false
      },
      devices: {
        suportado: () => true,
        async garantirPermissaoMic() {
          return { ok: true };
        },
        fecharCaptura() {},
        estaCapturando: () => false
      },
      tts: { async speak() { return { falou: false }; }, stop() {} }
    });

    const r = await ctrl.iniciarEscuta();
    assert.equal(r.ok, false);
    assert.equal(ctrl.estado(), ESTADO_TURNO.ERRO);
    assert.equal(chamadas, 0);
  });

  test("CT-CO06: interromper em Ouvindo → Idle", async () => {
    const ctrl = criarVoiceController({
      enviarTexto: async () => ({ ok: true, mensagem: "ok" }),
      stt: {
        suportado: () => true,
        configurar() {},
        iniciar() {},
        parar() {},
        escutando: () => false
      },
      devices: {
        suportado: () => true,
        async garantirPermissaoMic() {
          return { ok: true };
        },
        fecharCaptura() {},
        estaCapturando: () => false
      },
      tts: { async speak() { return { falou: true }; }, stop() {} }
    });
    await ctrl.iniciarEscuta();
    ctrl.interromper();
    assert.equal(ctrl.estado(), ESTADO_TURNO.IDLE);
  });

  test("CT-CO07: erro TTS (erro-sintese) → Erro", async () => {
    const ctrl = criarVoiceController({
      retornoAutomaticoOuvindo: true,
      enviarTexto: async () => ({
        ok: true,
        mensagem: "ok",
        dados: { textoVoz: "ok" }
      }),
      stt: {
        suportado: () => true,
        configurar() {},
        iniciar() {},
        parar() {},
        escutando: () => false
      },
      devices: {
        suportado: () => true,
        async garantirPermissaoMic() {
          return { ok: true };
        },
        fecharCaptura() {},
        estaCapturando: () => false
      },
      tts: {
        async speak() {
          return { falou: false, motivo: "erro-sintese", erro: "TTS offline" };
        },
        stop() {}
      }
    });
    await ctrl.iniciarEscuta();
    await ctrl._processarTranscricao("teste");
    assert.equal(ctrl.estado(), ESTADO_TURNO.ERRO);
    assert.match(String(ctrl.mensagemErro()), /TTS|voz|ecrã|tela/i);
  });

  test("CT-CO08: múltiplas interações consecutivas", async () => {
    let n = 0;
    const ctrl = criarVoiceController({
      retornoAutomaticoOuvindo: true,
      enviarTexto: async (t) => {
        n += 1;
        return { ok: true, mensagem: `r${n}:${t}`, dados: { textoVoz: `r${n}` } };
      },
      stt: {
        suportado: () => true,
        configurar() {},
        iniciar() {},
        parar() {},
        escutando: () => false
      },
      devices: {
        suportado: () => true,
        async garantirPermissaoMic() {
          return { ok: true };
        },
        fecharCaptura() {},
        estaCapturando: () => false
      },
      tts: {
        async speak() {
          return { falou: true };
        },
        stop() {}
      }
    });
    await ctrl.iniciarEscuta();
    await ctrl._processarTranscricao("um");
    assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO);
    await ctrl._processarTranscricao("dois");
    assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO);
    await ctrl._processarTranscricao("tres");
    assert.equal(n, 3);
    assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO);
  });

  test("CT-CO11: VAL-011R — 10 conversas consecutivas sem regressão", async () => {
    let n = 0;
    let starts = 0;
    const ctrl = criarVoiceController({
      retornoAutomaticoOuvindo: true,
      enviarTexto: async (t) => {
        n += 1;
        return {
          ok: true,
          mensagem: `ok-${n}:${t}`,
          dados: { textoVoz: `ok-${n}` }
        };
      },
      stt: {
        suportado: () => true,
        configurar() {},
        iniciar() {
          starts += 1;
        },
        parar() {},
        escutando: () => false
      },
      devices: {
        suportado: () => true,
        async garantirPermissaoMic() {
          return { ok: true };
        },
        fecharCaptura() {},
        estaCapturando: () => false
      },
      tts: {
        async speak() {
          return { falou: true };
        },
        stop() {}
      }
    });
    await ctrl.iniciarEscuta();
    assert.equal(starts, 1);
    for (let i = 1; i <= 10; i++) {
      await ctrl._processarTranscricao(`turno-${i}`);
      assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO, `pós turno ${i}`);
    }
    assert.equal(n, 10);
    assert.ok(starts >= 11, "start inicial + 10 retornos automáticos");
  });

  test("CT-CO09: STT Adapter — silêncio dispara transcricao_concluida", async () => {
    const { criarSttAdapter } = await import("./sttAdapter.js");
    const eventos = [];
    let onFinalHandler = null;
    const sttCore = {
      suportado: () => true,
      configurar(cbs) {
        onFinalHandler = cbs.onFinal;
      },
      iniciar() {},
      parar() {},
      escutando: () => false
    };
    const adapter = criarSttAdapter({
      silenceMs: 20,
      stt: sttCore,
      onEvento: (e) => eventos.push(e)
    });
    let finalTexto = null;
    adapter.configurar({
      onFinal: (t) => {
        finalTexto = t;
      }
    });
    adapter.iniciar();
    onFinalHandler("olá CEO");
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(finalTexto, "olá CEO");
    assert.ok(eventos.some((e) => e.tipo === "silencio"));
    assert.ok(eventos.some((e) => e.tipo === "transcricao_concluida"));
  });

  test("CT-CO10: STT not-allowed → Erro sem pipeline", async () => {
    let chamadas = 0;
    /** @type {(ev: object) => void} */
    let onErro = () => {};
    const ctrl = criarVoiceController({
      enviarTexto: async () => {
        chamadas += 1;
        return { ok: true, mensagem: "x" };
      },
      stt: {
        suportado: () => true,
        configurar(cbs) {
          if (cbs && typeof cbs.onErro === "function") onErro = cbs.onErro;
        },
        iniciar() {},
        parar() {},
        escutando: () => false
      },
      devices: {
        suportado: () => true,
        async garantirPermissaoMic() {
          return { ok: true, via: "permissions" };
        },
        fecharCaptura() {},
        estaCapturando: () => false
      },
      tts: {
        async speak() {
          return { falou: true };
        },
        stop() {}
      }
    });
    const r = await ctrl.iniciarEscuta();
    assert.equal(r.ok, true);
    assert.equal(ctrl.estado(), ESTADO_TURNO.OUVINDO);
    onErro({ error: "not-allowed" });
    assert.equal(ctrl.estado(), ESTADO_TURNO.ERRO);
    assert.equal(chamadas, 0);
  });
});
