/**
 * Testes PX-003 E3 — integração CN às superfícies / fluxos.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { gerarComunicadoExecutivo } from "../mre/speaker/speakerExecutivo.js";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import {
  TIPO_TURNO,
  _resetVariacaoParaTestes,
  aplicarConversacaoNatural,
  expoeEstruturaDeliberacao,
  naturalizarRespostaNucleo,
  sanitizarProsaUsuario,
  textoBoasVindasNatural
} from "./index.js";

test("fluxo saudação — abertura natural", () => {
  _resetVariacaoParaTestes();
  const t = textoBoasVindasNatural({ cumprimento: "Boa tarde" });
  assert.match(t, /Boa tarde/i);
  assert.ok(!/Sou o CEO/i.test(t));
  assert.ok(!expoeEstruturaDeliberacao(t));
});

test("fluxo continuidade — âncora de frente sem Sobre:", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const speaker = gerarComunicadoExecutivo(parecer, "chat").comunicado.texto;
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: speaker,
    historico: [
      { papel: "usuario", texto: "Seguir no pagamento" },
      { papel: "ceo", texto: "Foco em pagamento." }
    ],
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      memoria: { projetoAtivo: { nome: "Motoboy Game 2" } }
    },
    instrucao: "Continuar"
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.DELIBERACAO);
  assert.ok(!expoeEstruturaDeliberacao(cn.texto));
});

test("fluxo deliberação — sem Aprovo:/Porquê:/Sobre:", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const antes = gerarComunicadoExecutivo(parecer, "chat").comunicado.texto;
  assert.ok(expoeEstruturaDeliberacao(antes));
  const out = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: antes,
      modo: "mre",
      dados: {
        parecer,
        comunicado: gerarComunicadoExecutivo(parecer, "chat").comunicado
      }
    },
    { instrucao: "Adiar outdoor", historico: [] }
  );
  assert.ok(!expoeEstruturaDeliberacao(out.mensagem));
  assert.equal(out.dados.conversacaoNatural.tipoTurno, TIPO_TURNO.DELIBERACAO);
});

test("fluxo bloqueio — pergunta sem Lacunas residuais", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.estado = "solicitar_dados";
  parecer.lacunas = ["Falta evidência da Sprint 1"];
  parecer.confianca = 0.35;
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "Sobre: X.\n\nPreciso de dados: Y.\n\nLacunas residuais: Z.",
    dados: { parecer },
    instrucao: "Avançar LOD?"
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.BLOQUEIO);
  assert.ok(!/Lacunas residuais/i.test(cn.texto));
  assert.ok(!expoeEstruturaDeliberacao(cn.texto));
});

test("fluxo encerramento — tipo fecho", () => {
  _resetVariacaoParaTestes();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Ok.",
    instrucao: "encerrar o dia",
    dados: { coa: { nome: "Motoboy Game 2" } }
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.FECHO);
  assert.match(cn.texto, /Encerro|preservado|Feito/i);
});

test("sanitizarProsaUsuario remove templates residuais", () => {
  const limpa = sanitizarProsaUsuario(
    "Sobre: outdoor.\n\nAprovo: adiar.\n\nPorquê: foco.\n\nLacunas residuais: x."
  );
  assert.ok(!expoeEstruturaDeliberacao(limpa));
  assert.match(limpa, /adiar|foco/i);
});
