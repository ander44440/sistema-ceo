/**
 * Worker T3 — processo isolado. Grava ou lê o store físico.
 * Sem writers externos. Só a API pública da MEP-CEO.
 */
import {
  consultarObjecto,
  contagemEventos,
  criarNovaBaseline,
  criarObjecto,
  definirEstadoTrabalho,
  historico,
  inicializarPersistenciaFisica,
  listarObjectos,
  promoverMaturidade
} from "./index.js";

const EV = Object.freeze({ tipo: "IMP", referencia: "IMP-073" });
const modo = process.argv[2];
const dir = process.argv[3];

function sair(payload, codigo) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(codigo);
}

const init = inicializarPersistenciaFisica(dir);
if (!init.ok) {
  sair({ ok: false, fase: "init", motivo: init.motivo }, 2);
}

if (modo === "gravar") {
  const criado = criarObjecto({
    tipo: "MDL",
    titulo: "restart-real",
    papel: "ceo_agente",
    lacunaEvidencia: "T3 IMP-073"
  });
  if (!criado.ok) sair({ ok: false, fase: "criar", motivo: criado.motivo }, 3);
  const id = criado.objecto.id;
  const cadeia = ["DEFINIDO", "EM_CONSTRUÇÃO", "EM_VALIDAÇÃO", "HOMOLOGADO"];
  for (const para of cadeia) {
    const r = promoverMaturidade(id, para, { papeis: ["cto"], evidencia: EV });
    if (!r.ok) sair({ ok: false, fase: para, motivo: r.motivo }, 4);
  }
  const trab = definirEstadoTrabalho(id, "EM_INVESTIGAÇÃO", { papel: "cto" });
  if (!trab.ok) sair({ ok: false, fase: "trabalho", motivo: trab.motivo }, 5);
  const base = promoverMaturidade(id, "BASELINE", { papeis: ["usuario"], evidencia: EV });
  if (!base.ok) sair({ ok: false, fase: "BASELINE", motivo: base.motivo }, 6);
  const bsl = criarNovaBaseline({
    papel: "usuario",
    evidencia: EV,
    cobre: [id]
  });
  if (!bsl.ok) sair({ ok: false, fase: "bsl", motivo: bsl.motivo }, 7);
  const o = consultarObjecto(id);
  sair({
    ok: true,
    id,
    maturidade: o.maturidade,
    trabalho: o.trabalho,
    congelado: o.congelado,
    bslId: bsl.objecto.id,
    precedenteBsl: bsl.precedenteBsl,
    contagem: contagemEventos(),
    historico: historico(id).map((e) => e.acto)
  }, 0);
}

if (modo === "ler") {
  const lista = listarObjectos();
  const mdl = lista.find((o) => o.tipo === "MDL");
  sair({
    ok: true,
    objectos: lista,
    historico: historico(),
    contagem: contagemEventos(),
    mdl: mdl || null
  }, 0);
}

sair({ ok: false, motivo: "modo_desconhecido" }, 1);
