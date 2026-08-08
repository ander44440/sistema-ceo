/**
 * IMP-071 — REQ-075…078 (B1 homologado · B2)
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  AGENTES,
  CONCEPTOS_OPERACIONAIS,
  CRITERIOS_ENCERRAMENTO,
  ESTADO_AUTORIDADE_DELEGADA_ACTIVA,
  MODOS_OPERACIONAIS,
  PERIMETRO_OMISSAO,
  RESERVAS_CONSTITUCIONAIS,
  TIPOS_FECHO_PERMITIDOS,
  TITULAR_MISSAO,
  activarAutoridadeDelegada,
  aplicarCasoDistincao,
  autoridadeDelegadaActiva,
  autoridadeDelegadaEhModoOperacional,
  avaliarPedidoFecho,
  classificarConceitoOperacional,
  descreverPosturaModo,
  distinguirEfeitosSimultaneos,
  ehActoExplicitoDeFecho,
  ehAutorizacaoOperacionalPontual,
  encerrarAutoridadeDelegada,
  encerrarPorExaurimentoPerimetro,
  encerrarPorPerdaAmbito,
  escopoCto003Intocado,
  exercerFechoDelegado,
  fecharDirectamentePeloUsuario,
  fechoImportanteConformeMo,
  listarEstadosArquitecturaisDoModulo,
  listarModosOperacionais,
  listarRastreabilidadeDelegacao,
  matrizDistincoesOperacionais,
  modoConfereFechoAutonomoSemDelegacao,
  observarPosturasComDelegacaoActiva,
  obterEstadoAutoridadeDelegada,
  obterUltimoEncerramento,
  obterUltimoRegistoMo,
  processarCandidaturaDelegacao,
  processarCandidaturaEncerramento,
  processarMensagemAutoridadeDelegada,
  reiniciarAutoridadeDelegadaParaTestes,
  resolverConflitoSoberano,
  revogarDelegacaoImediatamente,
  tentarAmpliarPerimetro,
  validarActoDelegacao,
  verificarEAplicarExpiracao
} from "./autoridadeDelegada.js";

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
});

test("CA-075-1: acto explícito de fecho aceite para validação", () => {
  const actos = [
    "você decide",
    "decide você",
    "delego a autoridade de fecho",
    "assuma a decisão",
    "faça o que julgar necessário",
    "autorizo você a decidir",
    "podes fechar esta decisão"
  ];
  for (const texto of actos) {
    assert.equal(ehActoExplicitoDeFecho(texto), true, texto);
    const v = validarActoDelegacao({ texto, agente: AGENTES.usuario });
    assert.equal(v.ok, true, texto);
  }
});

test("CA-075-2: silêncio / ok / continuidade sem fecho → não inicia", () => {
  const negativos = [
    "",
    "ok",
    "sim",
    "certo",
    "seguimos com a missão",
    "continuar o trabalho do MG2",
    "o que achas?"
  ];
  for (const texto of negativos) {
    const v = validarActoDelegacao({ texto, agente: AGENTES.usuario });
    assert.equal(v.ok, false, texto);
    assert.equal(activarAutoridadeDelegada({ texto }).ok, false, texto);
    assert.equal(autoridadeDelegadaActiva(), false);
  }
});

test("CA-075-3: agente não-Usuário recusado", () => {
  for (const agente of [
    AGENTES.cto,
    AGENTES.engenheiro,
    AGENTES.painel,
    AGENTES.sistema_ceo
  ]) {
    const v = validarActoDelegacao({
      texto: "você decide",
      agente
    });
    assert.equal(v.ok, false, agente);
    assert.ok(v.motivosRecusa.includes("agente_nao_usuario"), agente);
  }
});

test("CA-075-4: autorização operacional pontual ≠ acto de delegação", () => {
  const pontuais = [
    "autorizado",
    "AUTORIZADO",
    "Aprovado",
    "Pode executar",
    "está autorizado",
    "ok"
  ];
  for (const texto of pontuais) {
    assert.equal(ehAutorizacaoOperacionalPontual(texto), true, texto);
    assert.equal(ehActoExplicitoDeFecho(texto), false, texto);
    const v = validarActoDelegacao({ texto, agente: AGENTES.usuario });
    assert.equal(v.ok, false, texto);
    assert.ok(
      v.motivosRecusa.includes("autorizacao_operacional_pontual"),
      texto
    );
  }
});

test("CA-076-1: delegação válida → estado autoridade_delegada_activa", () => {
  const r = activarAutoridadeDelegada({
    texto: "delego a autoridade — você decide no perímetro do MG2",
    agente: AGENTES.usuario,
    perimetro: "coa-mg2"
  });
  assert.equal(r.ok, true);
  const e = obterEstadoAutoridadeDelegada();
  assert.equal(e.activo, true);
  assert.equal(e.estado, ESTADO_AUTORIDADE_DELEGADA_ACTIVA);
  assert.equal(e.competenciaFecho, "ceo");
  assert.equal(e.perimetro, "coa-mg2");
  assert.equal(autoridadeDelegadaActiva(), true);
});

test("CA-076-2: titular da missão permanece Usuário", () => {
  activarAutoridadeDelegada({
    texto: "você decide",
    agente: AGENTES.usuario
  });
  const e = obterEstadoAutoridadeDelegada();
  assert.equal(e.titularMissao, TITULAR_MISSAO);
  assert.equal(e.titularMissao, "usuario");
});

test("CA-076-3: único estado arquitectural do módulo = ARQ-032", () => {
  const lista = listarEstadosArquitecturaisDoModulo();
  assert.deepEqual([...lista], [ESTADO_AUTORIDADE_DELEGADA_ACTIVA]);
  assert.equal(lista.length, 1);
});

test("CA-076-4: inválido → estado activo ausente", () => {
  assert.equal(activarAutoridadeDelegada({ texto: "ok" }).ok, false);
  assert.equal(obterEstadoAutoridadeDelegada().activo, false);
  assert.equal(obterEstadoAutoridadeDelegada().estado, null);
  assert.equal(obterEstadoAutoridadeDelegada().competenciaFecho, null);
});

test("B1: processarCandidaturaDelegacao activa só com acto válido", () => {
  const fail = processarCandidaturaDelegacao({ texto: "Aprovado" });
  assert.equal(fail.activado, false);
  const ok = processarCandidaturaDelegacao({
    texto: "assuma — faça o que julgar necessário"
  });
  assert.equal(ok.activado, true);
  assert.equal(ok.estado.estado, ESTADO_AUTORIDADE_DELEGADA_ACTIVA);
});

/* ─── B2 / REQ-077 + REQ-078 ─────────────────────────────────────────── */

function activarPadrao(perimetro) {
  const r = activarAutoridadeDelegada({
    texto: "você decide",
    agente: AGENTES.usuario,
    perimetro
  });
  assert.equal(r.ok, true);
  return r.estado;
}

test("CA-077-1: estado activo + decisão no perímetro ⇒ fecho sem novo acto", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "decisao_operacional_coa",
    descricao: "Priorizar LOD sprint 2"
  });
  assert.equal(r.ok, true);
  assert.equal(r.fechado, true);
  assert.equal(r.fecho.sobAutoridadeDelegada, true);
  assert.equal(r.fecho.tipoFecho, "priorizar");
  // Estado permanece activo — sem exigir novo acto do Usuário
  assert.equal(autoridadeDelegadaActiva(), true);
});

test("CA-077-2: fecho sob delegação não altera titular da missão", () => {
  activarPadrao("coa-mg2");
  const r = exercerFechoDelegado({
    tipoFecho: "declarar_decisao",
    ambito: "coa-mg2",
    descricao: "Seguir opção A"
  });
  assert.equal(r.ok, true);
  assert.equal(r.titularMissao, TITULAR_MISSAO);
  assert.equal(r.fecho.titularMissao, "usuario");
  assert.equal(obterEstadoAutoridadeDelegada().titularMissao, "usuario");
});

test("CA-077-3: só os quatro tipos de fecho no perímetro", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  for (const tipo of TIPOS_FECHO_PERMITIDOS) {
    const r = exercerFechoDelegado({
      tipoFecho: tipo,
      ambito: "coa_activo"
    });
    assert.equal(r.ok, true, tipo);
  }
  const ilegal = exercerFechoDelegado({
    tipoFecho: "alterar_estrategia_produto",
    ambito: "coa_activo"
  });
  assert.equal(ilegal.ok, false);
  assert.ok(ilegal.motivosRecusa.includes("tipo_fecho_nao_autorizado"));
  assert.ok(String(ilegal.fundamentacao).length > 10);
});

test("CA-077-4: sem estado activo ⇒ fecho autónomo ausente", () => {
  assert.equal(autoridadeDelegadaActiva(), false);
  const r = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa_activo"
  });
  assert.equal(r.ok, false);
  assert.equal(r.fechado, false);
  assert.ok(r.motivosRecusa.includes("estado_inactivo"));
});

test("CA-078-1: fora do perímetro ⇒ recusa / devolução ao Usuário", () => {
  activarPadrao("coa-mg2");
  const r = exercerFechoDelegado({
    tipoFecho: "escolher_entre_alternativas",
    ambito: "estrategia_corporativa_global",
    descricao: "Fora do mandato"
  });
  assert.equal(r.ok, false);
  assert.equal(r.fechado, false);
  assert.ok(r.motivosRecusa.includes("fora_do_perimetro"));
  assert.equal(r.acao, "devolver_ao_usuario");
  assert.equal(r.devolvidoAoUsuario, true);
  assert.match(r.fundamentacao, /perímetro|perimetro/i);
});

test("CA-078-2: reservas constitucionais ⇒ recusa", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  for (const reserva of RESERVAS_CONSTITUCIONAIS) {
    const r = exercerFechoDelegado({
      tipoFecho: "declarar_decisao",
      ambito: reserva
    });
    assert.equal(r.ok, false, reserva);
    assert.ok(r.motivosRecusa.includes("reserva_constitucional"), reserva);
  }
  const porFlag = exercerFechoDelegado({
    tipoFecho: "declarar_decisao",
    ambito: "coa_activo",
    reservaConstitucional: "emendar_roadmap"
  });
  assert.equal(porFlag.ok, false);
  assert.ok(porFlag.motivosRecusa.includes("reserva_constitucional"));
});

test("CA-078-3: redelegação a terceiro ⇒ recusa", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = exercerFechoDelegado({
    tipoFecho: "declarar_decisao",
    ambito: "coa_activo",
    redelegarPara: "engenheiro"
  });
  assert.equal(r.ok, false);
  assert.ok(r.motivosRecusa.includes("redelegacao_vedada"));
  assert.match(r.fundamentacao, /[Rr]edelega/);
});

test("CA-078-4: CEO não amplia perímetro por iniciativa própria", () => {
  activarPadrao("coa-mg2");
  const antes = obterEstadoAutoridadeDelegada().perimetro;
  const amp = tentarAmpliarPerimetro("tudo_o_mg2_e_alem");
  assert.equal(amp.ok, false);
  assert.equal(amp.alterou, false);
  assert.equal(amp.perimetroApos, antes);
  assert.equal(obterEstadoAutoridadeDelegada().perimetro, antes);

  const viaPedido = avaliarPedidoFecho({
    tipoFecho: "priorizar",
    ambito: "coa-mg2",
    ampliarPerimetroPara: "coa-global"
  });
  assert.equal(viaPedido.permitido, false);
  assert.ok(viaPedido.motivosRecusa.includes("ampliacao_perimetro_vedada"));
  assert.equal(obterEstadoAutoridadeDelegada().perimetro, antes);
});

test("B2: fecho não encerra a delegação", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  exercerFechoDelegado({
    tipoFecho: "determinar_proximo_gesto",
    ambito: "coa:mg2"
  });
  assert.equal(autoridadeDelegadaActiva(), true);
  assert.equal(
    obterEstadoAutoridadeDelegada().estado,
    ESTADO_AUTORIDADE_DELEGADA_ACTIVA
  );
  assert.deepEqual([...listarEstadosArquitecturaisDoModulo()], [
    ESTADO_AUTORIDADE_DELEGADA_ACTIVA
  ]);
});

/* ─── B3 / REQ-079 + REQ-080 ─────────────────────────────────────────── */

test("CA-079-1: revogação explícita ⇒ delegação encerrada", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = processarCandidaturaEncerramento({
    texto: "revogo a delegação de autoridade",
    agente: AGENTES.usuario
  });
  assert.equal(r.ok, true);
  assert.equal(r.encerrado, true);
  assert.equal(r.criterio, CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA);
  assert.equal(autoridadeDelegadaActiva(), false);
  assert.equal(obterEstadoAutoridadeDelegada().estado, null);
  assert.equal(obterUltimoEncerramento().criterio, r.criterio);
});

test("CA-079-2: exaurimento / expiração ⇒ encerramento", () => {
  activarPadrao("coa-mg2");
  const ex = encerrarPorExaurimentoPerimetro();
  assert.equal(ex.encerrado, true);
  assert.equal(ex.criterio, CRITERIOS_ENCERRAMENTO.E2_EXAURIMENTO_PERIMETRO);
  assert.equal(autoridadeDelegadaActiva(), false);

  reiniciarAutoridadeDelegadaParaTestes();
  activarAutoridadeDelegada({
    texto: "você decide",
    agente: AGENTES.usuario,
    perimetro: PERIMETRO_OMISSAO,
    expiraEm: "2020-01-01T00:00:00.000Z"
  });
  const exp = verificarEAplicarExpiracao({
    agora: "2026-08-07T00:00:00.000Z"
  });
  assert.equal(exp.encerrado, true);
  assert.equal(exp.criterio, CRITERIOS_ENCERRAMENTO.E3_EXPIRACAO);
  assert.equal(autoridadeDelegadaActiva(), false);
});

test("CA-079-3: perda de âmbito / acto soberano ⇒ encerramento", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const e4 = encerrarPorPerdaAmbito({ motivo: "coa_removido" });
  assert.equal(e4.encerrado, true);
  assert.equal(e4.criterio, CRITERIOS_ENCERRAMENTO.E4_PERDA_AMBITO);

  reiniciarAutoridadeDelegadaParaTestes();
  activarPadrao(PERIMETRO_OMISSAO);
  const e5 = processarCandidaturaEncerramento({
    texto: "só eu decido daqui em diante",
    agente: AGENTES.usuario
  });
  assert.equal(e5.encerrado, true);
  assert.equal(e5.criterio, CRITERIOS_ENCERRAMENTO.E5_ACTO_SOBERANO);
  assert.equal(autoridadeDelegadaActiva(), false);
});

test("CA-079-4: após termo ⇒ sem competência de fecho sob mandato findo", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E6_RETORNO_AUTOMATICO,
    motivo: "termo_controlado"
  });
  assert.equal(obterEstadoAutoridadeDelegada().competenciaFecho, null);
  const fecho = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa_activo"
  });
  assert.equal(fecho.ok, false);
  assert.ok(fecho.motivosRecusa.includes("estado_inactivo"));
});

test("CA-080-1: encerrar ⇒ estado inactivo + retorno sem pedido de devolução", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
    textoUsuario: "cancelo a autoridade delegada"
  });
  assert.equal(r.encerrado, true);
  assert.equal(r.retornoAutomatico, true);
  assert.equal(r.pedidoDevolucaoExigido, false);
  assert.equal(obterEstadoAutoridadeDelegada().activo, false);
  assert.equal(obterEstadoAutoridadeDelegada().estado, null);
  assert.equal(obterUltimoEncerramento().pedidoDevolucaoExigido, false);
  // Um único acto: sem passo intermédio de «pedir devolução»
  assert.equal(r.competenciaFecho, null);
});

test("CA-080-2: retorno integral — zero alçada residual", () => {
  activarPadrao("coa-mg2");
  encerrarPorExaurimentoPerimetro();
  assert.equal(obterEstadoAutoridadeDelegada().competenciaFecho, null);
  assert.equal(obterEstadoAutoridadeDelegada().perimetro, null);
  assert.equal(obterUltimoEncerramento().competenciaFechoApos, null);
  const fecho = exercerFechoDelegado({
    tipoFecho: "declarar_decisao",
    ambito: "coa-mg2"
  });
  assert.equal(fecho.fechado, false);
});

test("CA-080-3: retorno não exige confirmação do CEO", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E6_RETORNO_AUTOMATICO
  });
  assert.equal(r.confirmacaoCeoExigida, false);
  assert.equal(obterUltimoEncerramento().confirmacaoCeoExigida, false);
});

test("CA-080-4: soberania do Usuário contínua antes/durante/após", () => {
  assert.equal(obterEstadoAutoridadeDelegada().titularMissao, TITULAR_MISSAO);
  activarPadrao(PERIMETRO_OMISSAO);
  assert.equal(obterEstadoAutoridadeDelegada().titularMissao, "usuario");
  const r = processarMensagemAutoridadeDelegada({
    texto: "retomo o fecho — encerro a delegação",
    agente: AGENTES.usuario
  });
  assert.equal(r.encerrado, true);
  assert.equal(r.estado.titularMissao, "usuario");
  assert.equal(obterUltimoEncerramento().titularMissao, "usuario");
});

test("B3: sem estados órfãos; inventário ARQ intacto; perímetro não alterado em vida", () => {
  const est = activarPadrao("coa-mg2");
  assert.equal(est.perimetro, "coa-mg2");
  // Em vida: tentarAmpliar não muda (B2); encerramento limpa sem órfão
  const termo = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E2_EXAURIMENTO_PERIMETRO
  });
  assert.equal(termo.perimetroNoTermo, "coa-mg2");
  const apos = obterEstadoAutoridadeDelegada();
  assert.equal(apos.activo, false);
  assert.equal(apos.estado, null);
  assert.equal(apos.competenciaFecho, null);
  assert.equal(apos.perimetro, null);
  assert.deepEqual([...listarEstadosArquitecturaisDoModulo()], [
    ESTADO_AUTORIDADE_DELEGADA_ACTIVA
  ]);
});

/* ─── B4 / REQ-081 + REQ-082 ─────────────────────────────────────────── */

test("CA-081-1: acto explícito do Usuário prevalece sobre fecho delegado", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const fechoCeo = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa_activo",
    descricao: "Opção A"
  });
  assert.equal(fechoCeo.ok, true);

  const conflito = resolverConflitoSoberano({
    fechoDelegado: fechoCeo.fecho,
    actoUsuario: {
      tipo: "contradizer",
      descricao: "Opção B — fecho do Usuário",
      ambito: "coa_activo",
      tipoFecho: "declarar_decisao",
      texto: "fecho em B"
    }
  });
  assert.equal(conflito.ok, true);
  assert.equal(conflito.prevalece, "usuario");
  assert.equal(conflito.oposicaoCeo, false);
  assert.equal(conflito.fechoDelegadoAnulado, true);
  assert.equal(conflito.resultado.fecho.descricao, "Opção B — fecho do Usuário");
  assert.equal(conflito.resultado.fecho.sobSoberaniaUsuario, true);
});

test("CA-081-2: Usuário revoga a qualquer momento com efeito imediato", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  assert.equal(autoridadeDelegadaActiva(), true);
  const r = revogarDelegacaoImediatamente({
    texto: "revogo agora"
  });
  assert.equal(r.encerrado, true);
  assert.equal(r.efeitoImediato, true);
  assert.equal(r.prevalece, "usuario");
  assert.equal(autoridadeDelegadaActiva(), false);
});

test("CA-081-3: Usuário fecha directamente com delegação activa", () => {
  activarPadrao("coa-mg2");
  const r = fecharDirectamentePeloUsuario({
    tipoFecho: "escolher_entre_alternativas",
    ambito: "coa-mg2",
    descricao: "Escolho a alternativa 2"
  });
  assert.equal(r.ok, true);
  assert.equal(r.fechado, true);
  assert.equal(r.prevalece, "usuario");
  assert.equal(r.fecho.competenciaFecho, "usuario");
  assert.equal(r.fecho.sobAutoridadeDelegada, false);
  // Ciclo de vida da delegação inalterado (sem revogarApos)
  assert.equal(autoridadeDelegadaActiva(), true);
});

test("CA-081-4: CEO não se opõe nem ignora acto soberano", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = resolverConflitoSoberano({
    fechoDelegado: { descricao: "A" },
    actoUsuario: {
      tipo: "contradizer",
      descricao: "B soberano",
      texto: "só eu decido — fecho em B"
    }
  });
  assert.equal(r.oposicaoCeo, false);
  assert.equal(r.prevalece, "usuario");
  // Após acto soberano contraditório: sem fecho autónomo
  assert.equal(autoridadeDelegadaActiva(), false);
  const fechoCeo = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa_activo"
  });
  assert.equal(fechoCeo.ok, false);
});

test("CA-082-1: AD não é quarto modo", () => {
  assert.equal(autoridadeDelegadaEhModoOperacional(), false);
  assert.deepEqual([...listarModosOperacionais()], [
    "deliberar",
    "executar",
    "recuperar"
  ]);
  assert.equal(MODOS_OPERACIONAIS.includes("delegado"), false);
  assert.equal(MODOS_OPERACIONAIS.includes("autoridade_delegada"), false);
  assert.deepEqual([...listarEstadosArquitecturaisDoModulo()], [
    ESTADO_AUTORIDADE_DELEGADA_ACTIVA
  ]);
});

test("CA-082-2: com AD activa, três posturas distintas", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const posturas = observarPosturasComDelegacaoActiva();
  assert.equal(posturas.length, 3);
  const ids = posturas.map((p) => p.postura);
  assert.equal(new Set(ids).size, 3, "posturas não colapsadas");
  assert.ok(posturas.every((p) => p.autoridadeDelegadaEhModo === false));
  assert.notEqual(
    descreverPosturaModo("deliberar", true).postura,
    descreverPosturaModo("executar", true).postura
  );
  assert.notEqual(
    descreverPosturaModo("executar", true).postura,
    descreverPosturaModo("recuperar", true).postura
  );
});

test("CA-082-3: sem AD, nenhum modo confere fecho autónomo", () => {
  assert.equal(autoridadeDelegadaActiva(), false);
  for (const modo of MODOS_OPERACIONAIS) {
    assert.equal(
      modoConfereFechoAutonomoSemDelegacao(modo),
      false,
      modo
    );
    const fecho = exercerFechoDelegado({
      tipoFecho: "priorizar",
      ambito: "coa_activo"
    });
    assert.equal(fecho.ok, false, modo);
  }
});

test("CA-082-4: CTO-003 intocado neste escopo", () => {
  const escopo = escopoCto003Intocado();
  assert.equal(escopo.alteraInterceptacaoOperacional, false);
  assert.equal(escopo.alteraBaselineCto003, false);
  assert.equal(escopo.criaQuartoModo, false);
  assert.deepEqual(escopo.modosCanonicos, [
    "deliberar",
    "executar",
    "recuperar"
  ]);
});

test("B4: soberania contínua; ciclo de vida e perímetro intactos", () => {
  const est = activarPadrao("coa-mg2");
  assert.equal(est.titularMissao, "usuario");
  assert.equal(est.perimetro, "coa-mg2");
  fecharDirectamentePeloUsuario({
    descricao: "fecho directo sem revogar",
    ambito: "coa-mg2"
  });
  assert.equal(obterEstadoAutoridadeDelegada().perimetro, "coa-mg2");
  assert.equal(obterEstadoAutoridadeDelegada().titularMissao, "usuario");
  assert.equal(autoridadeDelegadaActiva(), true);
});

/* ─── B5 / REQ-083 + REQ-084 ─────────────────────────────────────────── */

test("CA-083-1: fecho sob delegação ⇒ MO com seis elementos Art. 8º", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = exercerFechoDelegado({
    tipoFecho: "declarar_decisao",
    ambito: "coa_activo",
    descricao: "Fecho rastreado"
  });
  assert.equal(r.ok, true);
  const mo = r.memoriaOrganizacional;
  assert.ok(mo);
  for (const campo of [
    "quem",
    "quando",
    "oQue",
    "porque",
    "baseadoEmQue",
    "resultado"
  ]) {
    assert.ok(mo[campo] != null && mo[campo] !== "", campo);
  }
});

test("CA-083-2: registo marca fecho sob Autoridade Delegada", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const r = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa_activo"
  });
  assert.equal(r.memoriaOrganizacional.sobAutoridadeDelegada, true);
  assert.equal(r.memoriaOrganizacional.tipoEvento, "fecho_sob_delegacao");
});

test("CA-083-3: registo referencia quemDelegou + perímetro", () => {
  activarPadrao("coa-mg2");
  const r = exercerFechoDelegado({
    tipoFecho: "escolher_entre_alternativas",
    ambito: "coa-mg2"
  });
  assert.equal(r.memoriaOrganizacional.quemDelegou, AGENTES.usuario);
  assert.equal(r.memoriaOrganizacional.perimetro, "coa-mg2");
});

test("CA-083-4: fecho importante sem MO ⇒ não conforme", () => {
  const fechoOrfao = {
    sobAutoridadeDelegada: true,
    quando: "2099-01-01T00:00:00.000Z",
    tipoFecho: "priorizar"
  };
  const check = fechoImportanteConformeMo(fechoOrfao);
  assert.equal(check.conforme, false);
  assert.ok(check.motivos.includes("fecho_sem_memoria_organizacional"));

  activarPadrao(PERIMETRO_OMISSAO);
  const r = exercerFechoDelegado({
    tipoFecho: "priorizar",
    ambito: "coa_activo"
  });
  assert.equal(fechoImportanteConformeMo(r.fecho).conforme, true);
});

test("B5: activação e encerramento também rastreáveis", () => {
  const act = activarAutoridadeDelegada({
    texto: "você decide",
    agente: AGENTES.usuario
  });
  assert.equal(act.memoriaOrganizacional.tipoEvento, "activacao");
  const enc = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
    textoUsuario: "revogo a autoridade"
  });
  assert.equal(enc.memoriaOrganizacional.tipoEvento, "encerramento");
  assert.ok(enc.memoriaOrganizacional.termoMandato);
  const tipos = listarRastreabilidadeDelegacao().map((x) => x.tipoEvento);
  assert.ok(tipos.includes("activacao"));
  assert.ok(tipos.includes("encerramento"));
});

test("CA-084-1: autorização pontual não activa AD", () => {
  const r = aplicarCasoDistincao("autorizacao_pontual");
  assert.equal(
    r.classificacao.conceito,
    CONCEPTOS_OPERACIONAIS.AUTORIZACAO_OPERACIONAL_PONTUAL
  );
  assert.equal(r.activado, false);
  assert.equal(r.estadoDelegado, false);
});

test("CA-084-2: despacho fila ≠ Autoridade Delegada", () => {
  const r = aplicarCasoDistincao("despacho_fila");
  assert.equal(
    r.classificacao.conceito,
    CONCEPTOS_OPERACIONAIS.DELEGACAO_EXECUCAO_FILA
  );
  assert.equal(r.mandatoFecho, false);
  assert.equal(r.estadoDelegado, false);
  assert.equal(r.jobDespachado, true);
});

test("CA-084-3: Gate e AD simultâneos — efeitos distintos", () => {
  activarPadrao(PERIMETRO_OMISSAO);
  const d = distinguirEfeitosSimultaneos({
    gateConfirmouActo: true,
    autoridadeDelegadaActiva: true
  });
  assert.equal(d.fundidosNumUnicoEfeito, false);
  assert.equal(d.gate.confereFechoContinuo, false);
  assert.equal(d.autoridadeDelegada.confereFechoContinuo, true);
  assert.equal(d.autoridadeDelegada.independenteDoGate, true);
  assert.equal(d.gate.conceito, CONCEPTOS_OPERACIONAIS.AUTORIZACAO_OPERACIONAL_PONTUAL);
  assert.equal(
    d.autoridadeDelegada.conceito,
    CONCEPTOS_OPERACIONAIS.AUTORIDADE_DELEGADA
  );
  assert.equal(
    d.autoridadePermanenteUsuario.conceito,
    CONCEPTOS_OPERACIONAIS.AUTORIDADE_PERMANENTE_USUARIO
  );
});

test("CA-084-4: matriz de três casos — três efeitos distintos", () => {
  reiniciarAutoridadeDelegadaParaTestes();
  const a = aplicarCasoDistincao("autorizacao_pontual");
  assert.equal(a.estadoDelegado, false);

  reiniciarAutoridadeDelegadaParaTestes();
  const b = aplicarCasoDistincao("despacho_fila");
  assert.equal(b.estadoDelegado, false);

  reiniciarAutoridadeDelegadaParaTestes();
  const c = aplicarCasoDistincao("delegacao_fecho");
  assert.equal(c.estadoDelegado, true);
  assert.equal(
    c.classificacao.conceito,
    CONCEPTOS_OPERACIONAIS.AUTORIDADE_DELEGADA
  );

  const matriz = matrizDistincoesOperacionais();
  assert.notEqual(
    matriz.autorizacaoPontual.conceito,
    matriz.despachoExecucao.conceito
  );
  assert.notEqual(
    matriz.despachoExecucao.conceito,
    matriz.actoDelegacaoFecho.conceito
  );
  assert.notEqual(
    matriz.actoDelegacaoFecho.conceito,
    matriz.autoridadePermanenteUsuario.conceito
  );
});

test("B5: sem novos estados; ciclo de vida inalterado", () => {
  assert.deepEqual([...listarEstadosArquitecturaisDoModulo()], [
    ESTADO_AUTORIDADE_DELEGADA_ACTIVA
  ]);
  assert.ok(
    classificarConceitoOperacional({ tipoEvento: "soberania_usuario" })
  );
  assert.equal(obterUltimoRegistoMo(), null);
});
