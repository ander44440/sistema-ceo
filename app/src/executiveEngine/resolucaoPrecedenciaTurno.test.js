/**
 * Resolução de Precedência por Turno — V1 (testes unitários).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AUTORIDADE,
  TIPO_TURNO_PREC,
  resolverPrecedenciaTurno,
  cnPodeAlterarDestino,
  anexarPrecedenciaNaResposta
} from "./resolucaoPrecedenciaTurno.js";

test("V1: Gate vence tudo", () => {
  const r = resolverPrecedenciaTurno({
    gateContinuidade: true,
    pedidoDecisaoExplicita: true,
    cto003Candidato: true,
    objetoOperacionalReal: true
  });
  assert.equal(r.autoridade, AUTORIDADE.GATE);
  assert.equal(r.acao, "continuar_gate");
  assert.equal(r.permiteCto003, false);
});

test("V1: PD bloqueia AD/CTO e força C2", () => {
  const r = resolverPrecedenciaTurno({
    pedidoDecisaoExplicita: true,
    adOrdemExecucao: true,
    cto003Candidato: true,
    objetoOperacionalReal: true
  });
  assert.equal(r.autoridade, AUTORIDADE.PEDIDO_DECISAO);
  assert.equal(r.destinoPermitido, "nucleo_mre");
  assert.equal(r.permiteAdExecucao, false);
  assert.equal(r.permiteCto003, false);
  assert.equal(r.tipoTurno, TIPO_TURNO_PREC.DECISAO);
});

test("V1: situacional → C2 consulta (não C4 panorama)", () => {
  const r = resolverPrecedenciaTurno({
    pedidoSituacionalTrabalho: true,
    panoramaEstadoGeral: true
  });
  assert.equal(r.forcarC2, true);
  assert.equal(r.forcarC4Panorama, false);
  assert.equal(r.tipoTurno, TIPO_TURNO_PREC.CONSULTA);
  assert.equal(r.permiteAdExecucao, false);
});

test("V1: panorama geral → C4", () => {
  const r = resolverPrecedenciaTurno({ panoramaEstadoGeral: true });
  assert.equal(r.forcarC4Panorama, true);
  assert.equal(r.destinoPermitido, "capacidade_operacional");
  assert.equal(r.tipoTurno, TIPO_TURNO_PREC.CONSULTA);
});

test("V1: AD/CTO só com objeto operacional", () => {
  const sem = resolverPrecedenciaTurno({
    cto003Candidato: true,
    objetoOperacionalReal: false
  });
  assert.equal(sem.permiteCto003, false);

  const com = resolverPrecedenciaTurno({
    cto003Candidato: true,
    objetoOperacionalReal: true
  });
  assert.equal(com.permiteCto003, true);
  assert.equal(com.destinoPermitido, "motor_execucao");
  assert.equal(com.tipoTurno, TIPO_TURNO_PREC.ACAO);
});

test("V1: CN nunca altera destino", () => {
  const r = resolverPrecedenciaTurno({
    destinoClassificador: "nucleo_mre",
    fase: "pos_destino"
  });
  assert.equal(cnPodeAlterarDestino(r, "nucleo_mre", "motor_execucao"), false);
  assert.equal(r.bloqueados.includes(AUTORIDADE.CONSCIENCIA_CN), true);
  const out = anexarPrecedenciaNaResposta(
    {
      mensagem: "ok",
      dados: { encaminhamento: { destino: "nucleo_mre" } }
    },
    r
  );
  assert.equal(out.dados.encaminhamento.destino, "nucleo_mre");
  assert.ok(out.dados.precedenciaTurno);
});
