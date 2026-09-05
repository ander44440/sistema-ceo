/**
 * CONSULTA → RESPONDER: não virar Delegar / Plano.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aplicarPoliticaConsultaResposta,
  detectarPedidoConsultaResposta,
  hintEstagio6ConsultaResposta,
  montarProsaConsultaResposta
} from "./politicaAnaliseDeliberativa.js";
import { gerarComunicadoExecutivo } from "./speaker/speakerExecutivo.js";
import { problemaExigePlanoExecutivo } from "../conversacaoNatural/planoExecutivo.js";
import { parecerValidoCompleto } from "./parecer/fixtures.js";

function parecerConsultaDelegar() {
  const p = parecerValidoCompleto();
  p.analise =
    "Etapa actual: fechar precedência V1. Concluímos a camada de autoridade. Agora validamos o C2.";
  p.decisaoExecutiva = {
    ...p.decisaoExecutiva,
    estado: "delegar",
    recomendacao:
      "Delegar a elaboração de um relatório sobre o estado do trabalho",
    justificativa:
      p.decisaoExecutiva.justificativa ||
      "Sem riscos materiais além da ambiguidade de consulta."
  };
  p.acao = {
    ...p.acao,
    descricao: "Elaborar relatório e delegar"
  };
  return p;
}

describe("P5 CONSULTA → RESPONDER", () => {
  it("detecta situacional e tipoTurno consulta", () => {
    assert.equal(
      detectarPedidoConsultaResposta(
        "Explique o estado atual do trabalho: etapa, o que concluímos, o que estamos fazendo agora."
      ),
      true
    );
    assert.equal(
      detectarPedidoConsultaResposta("qualquer texto", {
        consultaNaoEAcao: true
      }),
      true
    );
    assert.equal(
      detectarPedidoConsultaResposta("ok", { tipoTurno: "consulta" }),
      true
    );
    assert.equal(
      detectarPedidoConsultaResposta("Execute a melhoria aprovada agora"),
      false
    );
  });

  it("hint proíbe delegar e plano", () => {
    const h = hintEstagio6ConsultaResposta();
    assert.match(h, /CONSULTA DE ESTADO/);
    assert.match(h, /Proibido estado=delegar/);
    assert.match(h, /plano/i);
  });

  it("política remapeia delegar+relatório para monitorar sem prosa de acção", () => {
    const d = parecerConsultaDelegar().decisaoExecutiva;
    const out = aplicarPoliticaConsultaResposta(d, { pedidoConsulta: true });
    assert.equal(out.estado, "monitorar");
    assert.doesNotMatch(out.recomendacao, /Delegar|elaboração de um relatório/i);
    assert.match(out.justificativa, /CONSULTA/);
  });

  it("speaker não diz Delego em pedidoConsulta", () => {
    const p = parecerConsultaDelegar();
    p.decisaoExecutiva = aplicarPoliticaConsultaResposta(p.decisaoExecutiva, {
      pedidoConsulta: true
    });
    // Após remap, acção deixa de ser despacho (pipeline real faria estágio 7)
    p.acao = { ...p.acao, tipo: "aguardar", descricao: "Informar estado", job: null };
    const falado = gerarComunicadoExecutivo(p, "chat", {
      pedidoConsulta: true
    });
    assert.equal(falado.ok, true, falado.erro || JSON.stringify(falado.violacoes));
    assert.doesNotMatch(falado.comunicado.texto, /Delego/i);
    assert.doesNotMatch(falado.comunicado.texto, /Delegar/i);
    assert.match(falado.comunicado.texto, /Etapa actual|precedência/i);
  });

  it("CN não exige Plano em consulta", () => {
    const p = parecerConsultaDelegar();
    assert.equal(
      problemaExigePlanoExecutivo({
        parecer: p,
        instrucao: "estado atual do trabalho",
        canal: "chat",
        pedidoConsulta: true
      }),
      false
    );
    assert.equal(
      problemaExigePlanoExecutivo({
        parecer: p,
        instrucao: "faça um plano passo a passo",
        canal: "chat",
        tipoTurno: "consulta"
      }),
      false
    );
  });

  it("prosa consulta factual", () => {
    const prosa = montarProsaConsultaResposta(parecerConsultaDelegar());
    assert.ok(prosa);
    assert.match(prosa, /Etapa actual/);
    assert.doesNotMatch(prosa, /Delego|Delegar|Plano:/i);
  });
});
