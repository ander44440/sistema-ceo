/**
 * IMP-070 B4 / REQ-071 — Actualização.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  actualizarProjecao,
  elevarCandidatoSistema,
  manterAptidaoCuradoria,
  obterCadeiaVersoes,
  obterProjecaoLocal,
  reiniciarProjecoesParaTestes,
  sincronizarOficinaAutomatico,
  versionarConteudo
} from "./atualizacaoAcervo.js";
import {
  AGENTES,
  homologarUsuario,
  propor,
  publicarEngenheiro,
  reiniciarGovernancaParaTestes,
  validarConformidadeCto,
  validarDominioUsuario
} from "./governancaAcervo.js";
import {
  consultarFonteOficial,
  obterItemPorId
} from "./fonteOficial.js";

function candidatoOk(id = "KNW-200") {
  return {
    id,
    conteudo: "Estado curado: Sprint 1 feito",
    tipoLogico: "lastro_estado_curado",
    reutilizavel: true,
    independenteDeDecisaoEspecifica: true,
    patrimonioCeo: true,
    origem: "curadoria 07/08",
    ambitoCoa: "prj-mg2",
    dumpLiveEstado: false,
    versaoConteudo: "v1"
  };
}

function mo(extra = {}) {
  return {
    quem: "usuario",
    quando: "07/08/2026",
    oQue: "Actualizar conteúdo KNW",
    porQue: "Estado mudou",
    baseadoEmQue: "REQ-071",
    resultado: "nova versão",
    ...extra
  };
}

function publicarItem(id = "KNW-200") {
  const p = propor({ agente: AGENTES.engenheiro, candidato: candidatoOk(id) });
  validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto });
  validarDominioUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  homologarUsuario({ idProposta: p.idProposta, agente: AGENTES.usuario });
  return publicarEngenheiro({
    idProposta: p.idProposta,
    agente: AGENTES.engenheiro
  });
}

beforeEach(() => {
  reiniciarGovernancaParaTestes();
  reiniciarProjecoesParaTestes();
});

test("CA-071-1: nova versão mesma identidade", () => {
  assert.equal(publicarItem("KNW-201").ok, true);
  const antes = obterItemPorId("KNW-201");
  const r = versionarConteudo({
    idItem: "KNW-201",
    conteudo: "Estado curado: Sprint 1 validado pelo Patrocinador",
    agente: AGENTES.usuario,
    memoriaOrganizacional: mo()
  });
  assert.equal(r.ok, true);
  assert.equal(r.identidadePreservada, true);
  assert.equal(r.id, "KNW-201");
  assert.notEqual(r.versaoConteudo, antes.versaoConteudo);
  const cadeia = obterCadeiaVersoes("KNW-201");
  assert.ok(cadeia.versoes.length >= 2);
  assert.equal(cadeia.id, "KNW-201");
  assert.match(obterItemPorId("KNW-201").conteudo, /validado/i);
});

test("CA-071-2: sync oficina automático recusado", () => {
  publicarItem("KNW-202");
  const r = sincronizarOficinaAutomatico({
    caminhoRepo: "E:\\\\anderson\\\\Projoto motoboy game"
  });
  assert.equal(r.ok, false);
  assert.equal(r.actualizouAcervo, false);
  assert.equal(consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length, 1);
});

test("CA-071-3: candidato sistema não entra no índice", () => {
  const r = elevarCandidatoSistema({
    id: "KNW-999",
    conteudo: "facto inventado pelo modelo"
  });
  assert.equal(r.ok, false);
  assert.equal(r.incluidoNoIndice, false);
  assert.equal(consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length, 0);
});

test("CA-071-4: editar projecção não altera Acervo", () => {
  publicarItem("KNW-203");
  const antes = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  const conteudoAntes = obterItemPorId("KNW-203").conteudo;
  const proj = actualizarProjecao({
    idProjecao: "briefing-mg2",
    texto: "PROJEÇÃO editada localmente — WorldLab2 fake update",
    ambitoCoa: "prj-mg2"
  });
  assert.equal(proj.ok, true);
  assert.equal(proj.acervoInalterado, true);
  assert.equal(obterProjecaoLocal("briefing-mg2").includes("fake update"), true);
  assert.equal(obterItemPorId("KNW-203").conteudo, conteudoAntes);
  assert.equal(
    consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length,
    antes.itens.length
  );
});

test("B4: versionar sem homologação (não-Usuário) falha; manter aptidão", () => {
  publicarItem("KNW-204");
  assert.equal(
    versionarConteudo({
      idItem: "KNW-204",
      conteudo: "x",
      agente: AGENTES.engenheiro,
      memoriaOrganizacional: mo()
    }).ok,
    false
  );
  assert.equal(
    versionarConteudo({
      idItem: "KNW-204",
      conteudo: "x",
      agente: AGENTES.sistema_ceo,
      memoriaOrganizacional: mo()
    }).ok,
    false
  );
  const apt = manterAptidaoCuradoria({
    idItem: "KNW-204",
    aptidao: "nao_apto",
    agente: AGENTES.usuario,
    memoriaOrganizacional: mo({ oQue: "manter aptidão" })
  });
  assert.equal(apt.ok, true);
  assert.equal(consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length, 0);
});
