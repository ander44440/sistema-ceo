/**
 * IMP-070 B6 — Validação integrada CAP-04 (sem nova capacidade).
 * Cadeia: limites → governação → actualização → porta.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { avaliarAdmissao } from "./limitesAdmissao.js";
import {
  AGENTES,
  propor,
  validarConformidadeCto,
  validarDominioUsuario,
  homologarUsuario,
  publicarEngenheiro,
  revogarAptidao,
  reiniciarGovernancaParaTestes
} from "./governancaAcervo.js";
import { versionarConteudo } from "./atualizacaoAcervo.js";
import { solicitarLastroConhecimento } from "./portaRecuperacao.js";
import { consultarFonteOficial } from "./fonteOficial.js";
import { montarEntradaMre } from "../mre/integracaoNucleo.js";

const MO = {
  quem: "usuario",
  quando: "07/08/2026",
  oQue: "fecho IMP-070 B6",
  porQue: "validação integrada CAP-04",
  baseadoEmQue: "ARQ-031 / REQ-070…074",
  resultado: "cadeia observável"
};

function candidatoB6() {
  return {
    id: "KNW-B6-001",
    conteudo: "Regra DEC-B6: validação integrada CAP-04",
    tipoLogico: "regra_dominio",
    ambitoCoa: "prj-mg2",
    reutilizavel: true,
    independenteDeDecisaoEspecifica: true,
    patrimonioCeo: true,
    origem: "IMP-070-B6"
  };
}

beforeEach(() => {
  reiniciarGovernancaParaTestes();
});

test("B6 integrado: limites→governação→versão→porta (só apto)", () => {
  const candidato = candidatoB6();
  assert.equal(avaliarAdmissao(candidato).ok, true);

  const p = propor({ agente: AGENTES.engenheiro, candidato });
  assert.equal(p.ok, true);
  assert.equal(
    validarConformidadeCto({ idProposta: p.idProposta, agente: AGENTES.cto }).ok,
    true
  );
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
  assert.equal(pub.idItem, "KNW-B6-001");

  const ver = versionarConteudo({
    idItem: "KNW-B6-001",
    conteudo: "Regra DEC-B6: conteúdo v2 após curadoria",
    versaoConteudo: "v2",
    agente: AGENTES.usuario,
    homologadoPeloUsuario: true,
    memoriaOrganizacional: MO
  });
  assert.equal(ver.ok, true);
  assert.equal(ver.identidadePreservada, true);
  assert.equal(ver.versaoConteudo, "v2");

  const lastro = solicitarLastroConhecimento({
    contextoTrabalho: { id: "prj-mg2" },
    necessidade: "validação integrada B6"
  });
  assert.equal(lastro.ok, true);
  assert.equal(lastro.haConhecimentoApto, true);
  assert.equal(lastro.itens.length, 1);
  assert.equal(lastro.itens[0].id, "KNW-B6-001");
  assert.equal(lastro.itens[0].versao, "v2");
  assert.ok(!JSON.stringify(lastro.itens).includes("aptidao"));

  const entrada = montarEntradaMre({
    instrucao: "o que está decidido na CAP-04?",
    coaAtivo: { id: "prj-mg2" },
    memoria: () => null
  });
  assert.equal(entrada.viaPortaRecuperacao, true);
  assert.ok(entrada.factosOficiais.some((f) => /KNW-B6-001|conteúdo v2/i.test(f)));

  const rev = revogarAptidao({
    idItem: "KNW-B6-001",
    causa: "obsolescencia",
    agente: AGENTES.usuario,
    memoriaOrganizacional: {
      ...MO,
      oQue: "revogar aptidão KNW-B6-001",
      resultado: "não apto"
    }
  });
  assert.equal(rev.ok, true);
  assert.equal(rev.entregueComoValido, false);

  const apos = solicitarLastroConhecimento({
    coa: "prj-mg2",
    necessidade: "após revogação"
  });
  assert.equal(apos.haConhecimentoApto, false);
  assert.ok(apos.lacuna);
  assert.ok(!apos.factosOficiais.some((f) => /KNW-B6-001/i.test(f)));

  const fonte = consultarFonteOficial({ ambitoCoa: "prj-mg2" });
  assert.equal(fonte.itens.length, 0);
  assert.ok(fonte.lacuna);
});
