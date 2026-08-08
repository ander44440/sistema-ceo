/**
 * IMP-071 B6 — Smoke de consolidação (REQ-075…084).
 * Sem novas capacidades; verifica cadeia operacional ponta a ponta.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  AGENTES,
  CONCEPTOS_OPERACIONAIS,
  ESTADO_AUTORIDADE_DELEGADA_ACTIVA,
  PERIMETRO_OMISSAO,
  TITULAR_MISSAO,
  activarAutoridadeDelegada,
  aplicarCasoDistincao,
  autoridadeDelegadaActiva,
  autoridadeDelegadaEhModoOperacional,
  descreverPosturaModo,
  distinguirEfeitosSimultaneos,
  encerrarAutoridadeDelegada,
  CRITERIOS_ENCERRAMENTO,
  escopoCto003Intocado,
  exercerFechoDelegado,
  fechoImportanteConformeMo,
  listarEstadosArquitecturaisDoModulo,
  listarModosOperacionais,
  listarRastreabilidadeDelegacao,
  obterEstadoAutoridadeDelegada,
  reiniciarAutoridadeDelegadaParaTestes,
  resolverConflitoSoberano,
  revogarDelegacaoImediatamente
} from "./autoridadeDelegada.js";

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
});

test("B6: ciclo completo activação → fecho → MO → termo → soberania", () => {
  const act = activarAutoridadeDelegada({
    texto: "você decide no perímetro do MG2",
    agente: AGENTES.usuario,
    perimetro: "coa-mg2"
  });
  assert.equal(act.ok, true);
  assert.equal(act.estado.estado, ESTADO_AUTORIDADE_DELEGADA_ACTIVA);
  assert.equal(act.estado.titularMissao, TITULAR_MISSAO);
  assert.equal(act.memoriaOrganizacional.tipoEvento, "activacao");

  const fecho = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa-mg2",
    descricao: "Priorizar LOD"
  });
  assert.equal(fecho.ok, true);
  assert.equal(fechoImportanteConformeMo(fecho.fecho).conforme, true);

  const fora = exercerFechoDelegado({
    tipoFecho: "declarar_decisao",
    ambito: "estrategia_global"
  });
  assert.equal(fora.ok, false);

  const termo = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
    textoUsuario: "revogo a delegação"
  });
  assert.equal(termo.encerrado, true);
  assert.equal(termo.retornoAutomatico, true);
  assert.equal(autoridadeDelegadaActiva(), false);
  assert.equal(obterEstadoAutoridadeDelegada().competenciaFecho, null);

  const tipos = listarRastreabilidadeDelegacao().map((r) => r.tipoEvento);
  assert.ok(tipos.includes("activacao"));
  assert.ok(tipos.includes("fecho_sob_delegacao"));
  assert.ok(tipos.includes("encerramento"));
});

test("B6: REQ-075…084 — invariantes de consolidação", () => {
  // Único estado ARQ-032
  assert.deepEqual([...listarEstadosArquitecturaisDoModulo()], [
    ESTADO_AUTORIDADE_DELEGADA_ACTIVA
  ]);
  // AD ≠ quarto modo; CTO-003 intocado
  assert.equal(autoridadeDelegadaEhModoOperacional(), false);
  assert.deepEqual([...listarModosOperacionais()], [
    "deliberar",
    "executar",
    "recuperar"
  ]);
  assert.equal(escopoCto003Intocado().alteraBaselineCto003, false);

  // Distinções inequívocas
  assert.equal(
    aplicarCasoDistincao("autorizacao_pontual").estadoDelegado,
    false
  );
  reiniciarAutoridadeDelegadaParaTestes();
  assert.equal(aplicarCasoDistincao("despacho_fila").mandatoFecho, false);
  reiniciarAutoridadeDelegadaParaTestes();
  assert.equal(aplicarCasoDistincao("delegacao_fecho").estadoDelegado, true);

  activarAutoridadeDelegada({
    texto: "assuma a decisão",
    agente: AGENTES.usuario,
    perimetro: PERIMETRO_OMISSAO
  });
  const sim = distinguirEfeitosSimultaneos({
    gateConfirmouActo: true,
    autoridadeDelegadaActiva: true
  });
  assert.equal(sim.fundidosNumUnicoEfeito, false);
  assert.equal(
    sim.autoridadePermanenteUsuario.conceito,
    CONCEPTOS_OPERACIONAIS.AUTORIDADE_PERMANENTE_USUARIO
  );

  // Posturas ortogonais
  assert.notEqual(
    descreverPosturaModo("deliberar", true).postura,
    descreverPosturaModo("recuperar", true).postura
  );

  // Prevalência soberana
  const conf = resolverConflitoSoberano({
    fechoDelegado: { descricao: "A" },
    actoUsuario: {
      tipo: "fechar_directo",
      descricao: "B",
      revogarApos: false
    }
  });
  assert.equal(conf.prevalece, "usuario");
  assert.equal(conf.oposicaoCeo, false);

  const rev = revogarDelegacaoImediatamente({ texto: "revogo" });
  assert.equal(rev.efeitoImediato, true);
  assert.equal(autoridadeDelegadaActiva(), false);
});
