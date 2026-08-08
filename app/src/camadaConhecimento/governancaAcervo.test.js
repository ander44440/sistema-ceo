/**
 * IMP-070 B3 / REQ-074 — Governação.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  AGENTES,
  actoSistemaCeo,
  homologarUsuario,
  listarRastrosMo,
  obterProposta,
  propor,
  publicarEngenheiro,
  reiniciarGovernancaParaTestes,
  revogarAptidao,
  tentarPublicarSemHomologacao,
  validarConformidadeCto,
  validarDominioUsuario
} from "./governancaAcervo.js";
import { consultarFonteOficial } from "./fonteOficial.js";

function candidatoOk(extra = {}) {
  return {
    id: "KNW-100",
    conteudo: "Regra reutilizável: taxa zerada em cancelamento",
    tipoLogico: "regra_dominio",
    reutilizavel: true,
    independenteDeDecisaoEspecifica: true,
    patrimonioCeo: true,
    origem: "DEC-MVP-001",
    ambitoCoa: "prj-mg2",
    ...extra
  };
}

function mo() {
  return {
    quem: "usuario",
    quando: "07/08/2026",
    oQue: "Revogar aptidão KNW-100",
    porQue: "Obsolescência do propósito",
    baseadoEmQue: "REQ-074 / evidência de uso",
    resultado: "não apto"
  };
}

beforeEach(() => {
  reiniciarGovernancaParaTestes();
});

test("CA-074-1: cadeia completa propor→validar→homologar→publicar", () => {
  const p = propor({
    agente: AGENTES.engenheiro,
    candidato: candidatoOk()
  });
  assert.equal(p.ok, true);
  assert.equal(validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto }).ok, true);
  assert.equal(
    validarDominioUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario }).ok,
    true
  );
  assert.equal(
    homologarUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario }).ok,
    true
  );
  const pub = publicarEngenheiro({
    idProposta: p.idProposta,
    agente: AGENTES.engenheiro
  });
  assert.equal(pub.ok, true);
  assert.equal(pub.idItem, "KNW-100");
  const c = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(c.itens.length, 1);
  assert.equal(c.itens[0].id, "KNW-100");
  const prop = obterProposta(p.idProposta);
  assert.equal(prop.passos.publicacao, true);
});

test("CA-074-1: falta passo → falha", () => {
  const p = propor({ agente: AGENTES.cto, candidato: candidatoOk() });
  assert.equal(
    homologarUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario }).ok,
    false
  );
  assert.equal(
    validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.usuario }).ok,
    false
  );
});

test("CA-074-2: publicação sem homologação não inclui no índice", () => {
  const p = propor({ agente: AGENTES.engenheiro, candidato: candidatoOk() });
  validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto });
  validarDominioUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  const tent = tentarPublicarSemHomologacao({ idProposta: p.idProposta });
  assert.equal(tent.ok, false);
  assert.equal(tent.incluido, false);
  assert.equal(consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length, 0);
  assert.equal(
    publicarEngenheiro({ idProposta: p.idProposta, agente: AGENTES.engenheiro }).ok,
    false
  );
});

test("CA-074-3 e CA-074-4: revogar com MO e causa legítima; causas insuficientes falham", () => {
  const p = propor({ agente: AGENTES.usuario, candidato: candidatoOk() });
  validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto });
  validarDominioUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  homologarUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  publicarEngenheiro({ idProposta: p.idProposta, agente: AGENTES.engenheiro });

  assert.equal(
    revogarAptidao({
      idItem: "KNW-100",
      agente: AGENTES.usuario,
      causa: "falta_citacao",
      memoriaOrganizacional: mo()
    }).ok,
    false
  );
  assert.equal(
    revogarAptidao({
      idItem: "KNW-100",
      agente: AGENTES.usuario,
      causa: "estado_fila_job",
      memoriaOrganizacional: mo()
    }).ok,
    false
  );

  const rev = revogarAptidao({
    idItem: "KNW-100",
    agente: AGENTES.usuario,
    causa: "obsolescencia",
    memoriaOrganizacional: mo()
  });
  assert.equal(rev.ok, true);
  assert.equal(rev.identidadePreservada, true);
  assert.equal(rev.entregueComoValido, false);
  assert.ok(listarRastrosMo().length >= 1);
  assert.ok(listarRastrosMo()[0].quem);
  assert.ok(listarRastrosMo()[0].baseadoEmQue);
});

test("CA-074-5: não apto preserva ID e sai da entrega apta", () => {
  const p = propor({
    agente: AGENTES.engenheiro,
    candidato: candidatoOk({ id: "KNW-101" })
  });
  validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto });
  validarDominioUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  homologarUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  publicarEngenheiro({ idProposta: p.idProposta, agente: AGENTES.engenheiro });
  revogarAptidao({
    idItem: "KNW-101",
    agente: AGENTES.usuario,
    causa: "depuracao",
    memoriaOrganizacional: mo()
  });
  const c = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.ok(!c.itens.some((i) => i.id === "KNW-101"));
});

test("CA-074-6: sistema CEO não homologa, publica nem revoga", () => {
  assert.equal(actoSistemaCeo("homologar").ok, false);
  assert.equal(actoSistemaCeo("publicar").ok, false);
  assert.equal(actoSistemaCeo("revogar").ok, false);
  assert.equal(actoSistemaCeo("propor_candidato").ok, true);

  const cand = propor({
    agente: AGENTES.sistema_ceo,
    candidato: candidatoOk({ id: "KNW-102" })
  });
  assert.equal(cand.soCandidato, true);
  assert.equal(
    validarConformidadeCto({ idProposta: cand.idProposta, agente: AGENTES.cto }).ok,
    false
  );
});

test("CTO propõe revogação sem homologação Usuário → recusa", () => {
  const p = propor({ agente: AGENTES.engenheiro, candidato: candidatoOk({ id: "KNW-103" }) });
  validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto });
  validarDominioUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  homologarUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  publicarEngenheiro({ idProposta: p.idProposta, agente: AGENTES.engenheiro });
  assert.equal(
    revogarAptidao({
      idItem: "KNW-103",
      agente: AGENTES.cto,
      causa: "invalidade",
      memoriaOrganizacional: mo()
    }).ok,
    false
  );
  assert.equal(
    revogarAptidao({
      idItem: "KNW-103",
      agente: AGENTES.cto,
      causa: "invalidade",
      homologadoPeloUsuario: true,
      memoriaOrganizacional: mo()
    }).ok,
    true
  );
});
