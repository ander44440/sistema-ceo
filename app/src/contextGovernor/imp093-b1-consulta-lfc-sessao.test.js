/**
 * IMP-093 B1 — regressão: consulta explícita ao LFC do caso activo
 * deve preservar COA/caso (VCA → EE → llm_rapido → consumo LFC → CG → pacote LLM).
 *
 * Não altera CORE CG; cobre o caminho de integração que anulava a sessão via A1.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { validarContextoAtivo } from "../classificadorIntencao/validadorContextoAtivo.js";
import {
  ORIGEM_UTILIZADOR,
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader
} from "../lastroFactualCaso/index.js";
import { obterConsumoLfcParaMre } from "../mre/consumoLfcMre.js";
import {
  ESTADOS_CG,
  FONTES_CG,
  atravessarGateLlm,
  enviadoSubconjuntoAutorizado,
  governarContexto,
  messagesDePacoteAutorizado,
  montarCgMetaPromptDirecto
} from "./index.js";

const COA_B = "prj-1789509185314-3";
const COA_A = "prj-1789509071580-1";
const NOME_B = "VAL-093.1-B Isolamento Beta";

const INSTR_T1 =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";

const FACTOS_B = [
  "B1 código secreto BETA-TOKEN-992",
  "B2 orçamento exclusivo R$ 8.888.000",
  "B3 fornecedor exclusivo SulVerde SA"
];

const FACTOS_A = [
  "A1 código secreto ALPHA-TOKEN-771",
  "A2 orçamento exclusivo R$ 1.337.000",
  "A3 fornecedor exclusivo NorteAzul Ltda"
];

/** Espelha EE: coaParaDestino a partir de autorizaContextoSessao + COA de sessão. */
function coaParaDestinoComoEe(autorizaContextoSessao, coaSessao) {
  if (!autorizaContextoSessao) return null;
  return coaSessao || null;
}

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;
/** @type {string} */
let casoB;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "imp093-b1-"));
  const dirLfc = path.join(tmpRoot, "executive", "lastro-factual-casos");
  store = criarLfcStore(dirLfc);
  writer = criarLfcWriter(store, { superficie: "teste-imp093-b1" });
  reader = criarLfcReader(store);

  const criB = writer.criarCaso({
    coaId: COA_B,
    titulo: "contexto informado",
    factosIniciais: FACTOS_B,
    origem: ORIGEM_UTILIZADOR
  });
  assert.equal(criB.ok, true);
  casoB = criB.casoId;

  writer.criarCaso({
    coaId: COA_A,
    titulo: "contexto informado",
    factosIniciais: FACTOS_A,
    origem: ORIGEM_UTILIZADOR
  });
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("IMP-093 B1 — consulta LFC preserva sessão no llm_rapido", () => {
  it("VCA→EE→consumo→CG→pacote: BETA no enviado; Alpha fora; COA/caso preservados", async () => {
    const coaSessao = { id: COA_B, nome: NOME_B };

    // 1) VCA no caminho real (sem tópico/objectivo — cenário que caía em A1)
    const vca = validarContextoAtivo({
      mensagem: INSTR_T1,
      historicoCandidato: [],
      topicoActivo: null,
      objetivoActivo: null,
      frenteActiva: true,
      coa: coaSessao
    });
    assert.equal(vca.autorizaContextoSessao, true);
    assert.equal(vca.autorizaLastroCsc, false);

    // 2) EE: preservar COA deliberativo
    const coaDestino = coaParaDestinoComoEe(
      vca.autorizaContextoSessao === true,
      coaSessao
    );
    assert.ok(coaDestino);
    assert.equal(coaDestino.id, COA_B);

    // 3) Consumo LFC autorizado (mesmo contrato do llm_rapido)
    const consumo = await obterConsumoLfcParaMre({
      reader,
      coaId: coaDestino.id,
      instrucao: INSTR_T1
    });
    assert.equal(consumo.autorizado, true);
    assert.equal(consumo.motivo, "lfc_activos");
    assert.equal(consumo.casoId, casoB);
    assert.ok(consumo.factos.some((f) => /BETA-TOKEN-992/.test(f)));
    assert.ok(!consumo.factos.some((f) => /ALPHA-TOKEN-771/.test(f)));

    // 4) Meta CG do llm_rapido
    const messages = [
      { role: "system", content: "És o CEO." },
      { role: "user", content: INSTR_T1 }
    ];
    const meta = montarCgMetaPromptDirecto({
      messages,
      coa: coaDestino,
      casoId: consumo.casoId,
      instrucao: INSTR_T1,
      actoChamada: "llm_rapido",
      lfcConsumo: consumo,
      validacaoContexto: vca
    });
    assert.equal(meta.coaAtivo?.id, COA_B);
    assert.equal(meta.casoAtivo?.casoId, casoB);
    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    const fragsLfc = meta.conteudoCandidato.fragmentos.filter(
      (f) => f.fonte === FONTES_CG.LFC_ACTIVOS
    );
    assert.equal(fragsLfc.length, 3);
    assert.ok(fragsLfc.every((f) => f.coaId === COA_B && f.casoId === casoB));

    // 5) CG-GATE → pacote enviado ao LLM
    let enviado = null;
    const saida = await atravessarGateLlm(
      {
        messages,
        temperature: 0.4,
        max_tokens: 400,
        cgMeta: meta
      },
      async (body) => {
        enviado = body;
        return { texto: "BETA-TOKEN-992", origem: "mock" };
      }
    );

    assert.equal(saida.cg?.autorizado, true);
    assert.ok(
      saida.cg?.estado === ESTADOS_CG.AUTORIZADO_INTEGRAL ||
        saida.cg?.estado === ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO
    );

    const blob = JSON.stringify(enviado);
    assert.match(blob, /BETA-TOKEN-992/);
    assert.match(blob, /SulVerde/);
    assert.match(blob, /8\.888\.000/);
    assert.doesNotMatch(blob, /ALPHA-TOKEN-771/);
    assert.doesNotMatch(blob, /NorteAzul/);

    const r = governarContexto({
      actoChamada: "llm_rapido",
      modo: "enforce",
      coaAtivo: meta.coaAtivo,
      casoAtivo: meta.casoAtivo,
      fontesLastroAutorizadas: meta.fontesLastroAutorizadas,
      conteudoCandidato: meta.conteudoCandidato
    });
    assert.equal(
      enviadoSubconjuntoAutorizado(enviado.messages, r.pacoteAutorizado),
      true
    );
    const residual = messagesDePacoteAutorizado(r.pacoteAutorizado, []);
    assert.ok(residual.some((m) => /BETA-TOKEN-992/.test(m.content)));
    assert.ok(!residual.some((m) => /ALPHA-TOKEN-771/.test(m.content)));
  });

  it("café autónomo continua isolado (A1) — não alarga sessão", () => {
    const r = validarContextoAtivo({
      mensagem: "Quanto custa um café em Lisboa?",
      frenteActiva: true,
      coa: { id: COA_B, nome: NOME_B }
    });
    assert.equal(r.veredicto, "independente");
    assert.equal(r.autorizaContextoSessao, false);
  });
});
