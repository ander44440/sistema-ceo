/**
 * IMP-072 — Testes estruturais do núcleo MEP-CEO (CAP-13).
 * Não é VAL de produto. Não homologa a CAP-13.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, test } from "node:test";
import {
  MATURIDADES,
  TIPOS_CONTEUDO_ORGANIZACAO,
  TIPOS_OBJECTO,
  TRABALHOS,
  apagarEvento,
  apagarObjecto,
  avaliarIsolamento,
  consultarObjecto,
  criarNovaBaseline,
  criarObjecto,
  definirEstadoTrabalho,
  historico,
  listarObjectos,
  promoverMaturidade,
  proporMaturidade,
  reiniciarMepParaTestes,
  saltoIlicito
} from "./index.js";

const EV = Object.freeze({ tipo: "IMP", referencia: "IMP-072" });
const DIR = dirname(fileURLToPath(import.meta.url));

function papeisPara(tipo, para) {
  if (para === "DEFINIDO") {
    return tipo === "MCP" || tipo === "EPC" ? ["cto", "usuario"] : ["cto"];
  }
  if (para === "EM_CONSTRUÇÃO" || para === "EM_VALIDAÇÃO") return ["cto"];
  if (para === "HOMOLOGADO") {
    return tipo === "MCP" || tipo === "EPC" ? ["cto", "usuario"] : ["cto"];
  }
  if (para === "BASELINE") return ["usuario"];
  return ["cto"];
}

function criar(tipo, extra = {}) {
  return criarObjecto({
    tipo,
    titulo: tipo,
    papel: extra.papel || "ceo_agente",
    lacunaEvidencia: extra.lacunaEvidencia || "concepção IMP-072",
    ...extra
  });
}

function avancar(id, destino) {
  const o = consultarObjecto(id);
  const iAtual = MATURIDADES.indexOf(o.maturidade);
  const iDest = MATURIDADES.indexOf(destino);
  for (let i = iAtual + 1; i <= iDest; i++) {
    const para = MATURIDADES[i];
    const r = promoverMaturidade(id, para, {
      papeis: papeisPara(o.tipo, para),
      evidencia: EV
    });
    assert.equal(r.ok, true, `${o.id} → ${para}: ${r.motivo || ""}`);
  }
}

beforeEach(() => {
  reiniciarMepParaTestes();
});

test("nove espaços distintos; MEV não se cria por API de objecto", () => {
  const persistiveis = TIPOS_OBJECTO.filter((t) => t !== "MEV");
  assert.deepEqual(persistiveis, ["MCP", "EPC", "MDL", "DCP", "EVD", "PND", "BSL", "RMP"]);
  for (const tipo of persistiveis) {
    const extra =
      tipo === "DCP"
        ? {
            payload: {
              quem: "CTO",
              quando: "2026-08-14",
              porQue: "núcleo MEP",
              baseadoEm: "REQ-085",
              resultado: "C2 em memória"
            }
          }
        : {};
    const r = criar(tipo, extra);
    assert.equal(r.ok, true, tipo);
    assert.equal(r.objecto.tipo, tipo);
    assert.match(r.objecto.id, new RegExp(`^${tipo}-\\d{3}$`));
    assert.equal(r.objecto.maturidade, "CONCEBIDO");
    assert.equal(r.evento.tipoObjecto, tipo);
  }
  const ids = listarObjectos().map((o) => o.tipo).sort();
  assert.deepEqual(ids, persistiveis.slice().sort());
  assert.equal(criarObjecto({ tipo: "MEV", papel: "ceo_agente", lacunaEvidencia: "x" }).ok, false);
  assert.ok(historico().every((e) => /^MEV-\d{3}$/.test(e.id)));
  assert.ok(!TIPOS_OBJECTO.includes("CAP"));
  assert.ok(!TIPOS_OBJECTO.includes("KNW"));
  assert.ok(!TIPOS_OBJECTO.includes("ROADMAP"));
  assert.ok(!TIPOS_OBJECTO.includes("EPICO"));
  assert.ok(!TIPOS_OBJECTO.includes("EV"));
});

test("criação em CONCEBIDO: agente regista; hipótese; IDs sequenciais sem reutilização", () => {
  const a = criar("MDL");
  const b = criar("MDL");
  assert.equal(a.ok, true);
  assert.equal(a.objecto.maturidade, "CONCEBIDO");
  assert.equal(a.objecto.classificacao, "hipotese");
  assert.equal(a.objecto.trabalho, "SEM_PENDÊNCIA");
  assert.equal(a.objecto.eixo, "produto");
  assert.equal(a.objecto.id, "MDL-001");
  assert.equal(b.objecto.id, "MDL-002");
  assert.equal(a.evento.acto, "criar");
  assert.equal(a.evento.estadoAnterior, null);
  assert.equal(a.evento.estadoNovo.maturidade, "CONCEBIDO");
  const recusaTipo = criarObjecto({ tipo: "XYZ", papel: "ceo_agente", lacunaEvidencia: "x" });
  assert.equal(recusaTipo.ok, false);
});

test("CTO, Usuário e Engenheiro também podem originar CONCEBIDO", () => {
  for (const papel of ["cto", "usuario", "engenheiro"]) {
    const r = criar("PND", { papel, titulo: papel });
    assert.equal(r.ok, true, papel);
  }
});

test("transições canónicas válidas até BASELINE (MDL: Usuário só na baseline)", () => {
  const r = criar("MDL");
  avancar(r.objecto.id, "BASELINE");
  const o = consultarObjecto(r.objecto.id);
  assert.equal(o.maturidade, "BASELINE");
  assert.equal(o.classificacao, "facto_homologado");
  assert.equal(o.congelado, true);
  const evs = historico(r.objecto.id);
  assert.equal(evs[0].estadoNovo.maturidade, "CONCEBIDO");
  assert.equal(evs[evs.length - 1].estadoNovo.maturidade, "BASELINE");
  assert.equal(evs.length, 6);
});

test("MCP e EPC exigem CTO+Usuário em DEFINIDO e HOMOLOGADO", () => {
  const mcp = criar("MCP");
  const soCto = promoverMaturidade(mcp.objecto.id, "DEFINIDO", {
    papel: "cto",
    evidencia: EV
  });
  assert.equal(soCto.ok, false);
  assert.equal(soCto.motivo, "alçada");
  avancar(mcp.objecto.id, "EM_VALIDAÇÃO");
  const homoCto = promoverMaturidade(mcp.objecto.id, "HOMOLOGADO", {
    papel: "cto",
    evidencia: EV
  });
  assert.equal(homoCto.ok, false);
  const homoOk = promoverMaturidade(mcp.objecto.id, "HOMOLOGADO", {
    papeis: ["cto", "usuario"],
    evidencia: EV
  });
  assert.equal(homoOk.ok, true);
});

test("rejeição de saltos omitidos", () => {
  const r = criar("MDL");
  const saltos = [
    ["CONCEBIDO", "EM_CONSTRUÇÃO"],
    ["CONCEBIDO", "HOMOLOGADO"],
    ["CONCEBIDO", "BASELINE"],
    ["DEFINIDO", "EM_VALIDAÇÃO"],
    ["DEFINIDO", "HOMOLOGADO"],
    ["DEFINIDO", "BASELINE"],
    ["EM_CONSTRUÇÃO", "HOMOLOGADO"],
    ["EM_CONSTRUÇÃO", "BASELINE"],
    ["EM_VALIDAÇÃO", "BASELINE"]
  ];
  for (const [de, para] of saltos) {
    assert.equal(saltoIlicito(de, para), true, `${de}→${para}`);
  }
  assert.equal(
    promoverMaturidade(r.objecto.id, "HOMOLOGADO", { papel: "cto", evidencia: EV }).ok,
    false
  );
  assert.equal(
    promoverMaturidade(r.objecto.id, "HOMOLOGADO", { papel: "cto", evidencia: EV }).motivo,
    "salto_ilicito"
  );
  avancar(r.objecto.id, "DEFINIDO");
  assert.equal(
    promoverMaturidade(r.objecto.id, "BASELINE", { papel: "usuario", evidencia: EV }).motivo,
    "salto_ilicito"
  );
  avancar(r.objecto.id, "EM_VALIDAÇÃO");
  assert.equal(
    promoverMaturidade(r.objecto.id, "BASELINE", { papel: "usuario", evidencia: EV }).motivo,
    "salto_ilicito"
  );
});

test("autoridade: agente não promove; não homologa baseline; autoridade delegada recusada", () => {
  const r = criar("MDL");
  const agenteDef = promoverMaturidade(r.objecto.id, "DEFINIDO", {
    papel: "ceo_agente",
    evidencia: EV
  });
  assert.equal(agenteDef.ok, false);
  assert.equal(agenteDef.motivo, "alçada");
  avancar(r.objecto.id, "HOMOLOGADO");
  const agenteBsl = promoverMaturidade(r.objecto.id, "BASELINE", {
    papel: "ceo_agente",
    evidencia: EV
  });
  assert.equal(agenteBsl.ok, false);
  const ctoBsl = promoverMaturidade(r.objecto.id, "BASELINE", {
    papel: "cto",
    evidencia: EV
  });
  assert.equal(ctoBsl.ok, false);
  const deleg = promoverMaturidade(r.objecto.id, "BASELINE", {
    papeis: ["autoridade_delegada", "usuario"],
    evidencia: EV
  });
  assert.equal(deleg.ok, false);
  const proposta = proporMaturidade(r.objecto.id, "BASELINE", { papel: "ceo_agente" });
  assert.equal(proposta.ok, true);
  assert.equal(consultarObjecto(r.objecto.id).maturidade, "HOMOLOGADO");
  const user = promoverMaturidade(r.objecto.id, "BASELINE", {
    papel: "usuario",
    evidencia: EV
  });
  assert.equal(user.ok, true);
});

test("evidência obrigatória: sem evidência não é facto; lacuna só em CONCEBIDO", () => {
  assert.equal(criarObjecto({ tipo: "MDL", papel: "ceo_agente" }).motivo, "evidencia_ou_lacuna_obrigatoria");
  const r = criar("MDL");
  const semEv = promoverMaturidade(r.objecto.id, "DEFINIDO", { papel: "cto" });
  assert.equal(semEv.ok, false);
  assert.equal(semEv.motivo, "evidencia_obrigatoria");
  assert.equal(consultarObjecto(r.objecto.id).maturidade, "CONCEBIDO");
  assert.equal(consultarObjecto(r.objecto.id).classificacao, "hipotese");
  const comEv = promoverMaturidade(r.objecto.id, "DEFINIDO", { papel: "cto", evidencia: EV });
  assert.equal(comEv.ok, true);
  assert.equal(comEv.objecto.classificacao, "facto_proposto");
  assert.deepEqual(comEv.evento.evidencia, EV);
});

test("append-only: apagar recusado; estados anteriores permanecem; clone não muta o log", () => {
  const r = criar("MDL");
  avancar(r.objecto.id, "DEFINIDO");
  const n = historico().length;
  assert.equal(apagarEvento().ok, false);
  assert.equal(apagarEvento().motivo, "historico_append_only");
  assert.equal(apagarObjecto().ok, false);
  assert.equal(historico().length, n);
  const evs = historico(r.objecto.id);
  assert.equal(evs[0].estadoNovo.maturidade, "CONCEBIDO");
  assert.equal(evs[1].estadoAnterior.maturidade, "CONCEBIDO");
  assert.equal(evs[1].estadoNovo.maturidade, "DEFINIDO");
  evs[0].estadoNovo.maturidade = "HACK";
  assert.equal(historico(r.objecto.id)[0].estadoNovo.maturidade, "CONCEBIDO");
  const vista = consultarObjecto(r.objecto.id);
  vista.maturidade = "BASELINE";
  assert.equal(consultarObjecto(r.objecto.id).maturidade, "DEFINIDO");
});

test("baseline congelada: não promove nem altera trabalho; identidade BSL intacta", () => {
  const r = criar("MDL");
  avancar(r.objecto.id, "BASELINE");
  const o = consultarObjecto(r.objecto.id);
  assert.equal(o.congelado, true);
  assert.equal(
    promoverMaturidade(o.id, "HOMOLOGADO", { papel: "usuario", evidencia: EV }).motivo,
    "baseline_congelada"
  );
  assert.equal(
    definirEstadoTrabalho(o.id, "BLOQUEADO", { papel: "cto" }).motivo,
    "baseline_congelada"
  );
});

test("nova baseline gera novo BSL e referencia o anterior; não muta o emitido", () => {
  const b1 = criarNovaBaseline({
    papel: "usuario",
    evidencia: EV,
    cobre: []
  });
  assert.equal(b1.ok, true);
  assert.equal(b1.objecto.id, "BSL-001");
  assert.equal(b1.objecto.tipo, "BSL");
  assert.equal(b1.objecto.maturidade, "BASELINE");
  assert.equal(b1.objecto.congelado, true);
  const b2 = criarNovaBaseline({
    papel: "usuario",
    evidencia: EV,
    precedenteBsl: "BSL-001"
  });
  assert.equal(b2.ok, true);
  assert.equal(b2.objecto.id, "BSL-002");
  assert.equal(b2.objecto.precedenteBsl, "BSL-001");
  assert.equal(consultarObjecto("BSL-001").id, "BSL-001");
  assert.equal(consultarObjecto("BSL-001").precedenteBsl, null);
  assert.equal(
    criarNovaBaseline({ papel: "ceo_agente", evidencia: EV }).motivo,
    "alçada"
  );
});

test("isolamento: recusa dos cinco tipos de conteúdo de organização", () => {
  const mapa = {
    dados_cliente: { payload: { dadosCliente: { nome: "X" } } },
    conversa_cliente: { payload: { conversasCliente: ["oi"] } },
    conhecimento_operacional_cliente: {
      payload: { conhecimentoOperacionalCliente: "rotina" }
    },
    decisao_privada_cliente: { payload: { decisaoPrivadaCliente: "Art.8" } },
    facto_organizacao: { payload: { factoOrganizacao: "facto" } }
  };
  assert.equal(TIPOS_CONTEUDO_ORGANIZACAO.length, 5);
  for (const tipo of TIPOS_CONTEUDO_ORGANIZACAO) {
    const viaFlag = avaliarIsolamento({ tipoConteudo: tipo });
    assert.equal(viaFlag.ok, false, tipo);
    const viaPayload = criar("MDL", mapa[tipo]);
    assert.equal(viaPayload.ok, false, tipo);
    assert.equal(viaPayload.motivo, "isolamento");
  }
  const absorcao = criar("MDL", { absorveArtefactoReferenciado: true });
  assert.equal(absorcao.ok, false);
  const outroEixo = criar("MDL", { eixo: "organizacao" });
  assert.equal(outroEixo.ok, false);
});

test("referência opaca por ID é permitida; conteúdo KNW não é copiado", () => {
  const r = criar("MCP", {
    referenciasExternas: ["KNW-001", "ROADMAP-002"],
    payload: { enunciado: "capacidade de produto" }
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.objecto.referenciasExternas, ["KNW-001", "ROADMAP-002"]);
  assert.equal(r.objecto.payload.itemKnwConteudo, undefined);
  const copia = criar("MCP", {
    payload: { itemKnwConteudo: "texto do acervo" }
  });
  assert.equal(copia.ok, false);
});

test("RMP coexiste com ROADMAP documental sem semântica extra", () => {
  const r = criar("RMP", {
    referenciasExternas: ["ROADMAP-002"],
    titulo: "Memória do plano de produto"
  });
  assert.equal(r.ok, true);
  assert.equal(r.objecto.tipo, "RMP");
  assert.equal(r.objecto.id, "RMP-001");
  assert.ok(!String(r.objecto.id).startsWith("ROADMAP-"));
});

test("trabalho ortogonal à maturidade; PENDÊNCIA_ATIVA exige PND; resolver não homologa", () => {
  assert.deepEqual(TRABALHOS, [
    "SEM_PENDÊNCIA",
    "PENDÊNCIA_ATIVA",
    "EM_INVESTIGAÇÃO",
    "BLOQUEADO"
  ]);
  const pnd = criar("PND");
  const mdl = criar("MDL");
  avancar(mdl.objecto.id, "HOMOLOGADO");
  const semPnd = definirEstadoTrabalho(mdl.objecto.id, "PENDÊNCIA_ATIVA", {
    papel: "cto"
  });
  assert.equal(semPnd.ok, false);
  const comPnd = definirEstadoTrabalho(mdl.objecto.id, "PENDÊNCIA_ATIVA", {
    papel: "cto",
    pndIds: [pnd.objecto.id]
  });
  assert.equal(comPnd.ok, true);
  assert.equal(consultarObjecto(mdl.objecto.id).maturidade, "HOMOLOGADO");
  assert.equal(consultarObjecto(mdl.objecto.id).trabalho, "PENDÊNCIA_ATIVA");
  const resolve = definirEstadoTrabalho(mdl.objecto.id, "SEM_PENDÊNCIA", {
    papel: "cto"
  });
  assert.equal(resolve.ok, true);
  assert.equal(consultarObjecto(mdl.objecto.id).maturidade, "HOMOLOGADO");
  assert.notEqual(consultarObjecto(mdl.objecto.id).maturidade, "BASELINE");
});

test("DCP exige os cinco campos de produto; decisão Art. 8º não cria DCP", () => {
  const incompleto = criar("DCP", { payload: { quem: "CTO" } });
  assert.equal(incompleto.ok, false);
  const org = criar("DCP", {
    tipoConteudo: "decisao_privada_cliente",
    payload: {
      quem: "cliente",
      quando: "hoje",
      porQue: "x",
      baseadoEm: "y",
      resultado: "z"
    }
  });
  assert.equal(org.ok, false);
  const okDcp = criar("DCP", {
    payload: {
      quem: "CTO",
      quando: "2026-08-14",
      porQue: "isolamento",
      baseadoEm: "ARQ-033",
      resultado: "C1"
    }
  });
  assert.equal(okDcp.ok, true);
});

test("conjunto fechado de maturidade; HOMOLOGADO/BASELINE não são hipótese", () => {
  assert.deepEqual(MATURIDADES, [
    "CONCEBIDO",
    "DEFINIDO",
    "EM_CONSTRUÇÃO",
    "EM_VALIDAÇÃO",
    "HOMOLOGADO",
    "BASELINE"
  ]);
  const r = criar("EVD");
  avancar(r.objecto.id, "HOMOLOGADO");
  assert.equal(consultarObjecto(r.objecto.id).classificacao, "facto_homologado");
  avancar(r.objecto.id, "BASELINE");
  assert.equal(consultarObjecto(r.objecto.id).classificacao, "facto_homologado");
  assert.notEqual(consultarObjecto(r.objecto.id).classificacao, "hipotese");
});

test("consulta MEP não devolve conversas nem factos de cliente", () => {
  criar("MDL");
  const lista = listarObjectos();
  for (const o of lista) {
    assert.equal(o.eixo, "produto");
    assert.equal(o.payload.conversasCliente, undefined);
    assert.equal(o.payload.dadosCliente, undefined);
  }
  for (const e of historico()) {
    assert.equal(e.transcript, undefined);
    assert.equal(e.conversaCliente, undefined);
  }
});

test("núcleo isolado: sem C3, UI, Motor, MRE, EIC, CAP-04/05", () => {
  const ficheiros = readdirSync(DIR).filter((f) => f.endsWith(".js"));
  const texto = ficheiros.map((f) => readFileSync(join(DIR, f), "utf8")).join("\n");
  assert.doesNotMatch(texto, /from ["'].*motorExecucao/);
  assert.doesNotMatch(texto, /from ["'].*\/mre\//);
  assert.doesNotMatch(texto, /from ["'].*camadaConhecimento/);
  assert.doesNotMatch(texto, /from ["'].*executiveEngine/);
  assert.doesNotMatch(texto, /from ["'].*continuidadeGate/);
  assert.match(texto, /Não exporta C3/);
  const idx = readFileSync(join(DIR, "index.js"), "utf8");
  assert.doesNotMatch(idx, /criarPropostaDesidentificada|canalC3/);
});

test("eventos de promoção carregam campos mínimos ARQ-033 §4.1", () => {
  const r = criar("MDL");
  avancar(r.objecto.id, "DEFINIDO");
  const ev = historico(r.objecto.id)[1];
  assert.ok(ev.id);
  assert.equal(ev.objectoId, r.objecto.id);
  assert.ok(ev.estadoAnterior);
  assert.ok(ev.estadoNovo);
  assert.ok(ev.quando);
  assert.ok(ev.papel);
  assert.ok(ev.evidencia.tipo && ev.evidencia.referencia);
});
