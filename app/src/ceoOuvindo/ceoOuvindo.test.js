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
});
