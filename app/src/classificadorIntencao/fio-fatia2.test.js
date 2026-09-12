/**
 * Fatia 2 — fio do mesmo COA na classificação e na deliberação (D2/D3/D28).
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { primeiroPassoClassificar } from "./integracaoNucleo.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  classificar,
  ehPedidoAnaliseOuRecomendacao,
  normalizarTexto
} from "./regras.js";
import {
  ehRecomendacaoOperacional,
  objectoDoTurno,
  OBJECTO_TURNO
} from "./recomendacaoOperacional.js";
import { mapearCapacidadePorTexto } from "../executiveEngine/classificar.js";
import { enriquecerMensagemComFioRecente } from "../mre/integracaoNucleo.js";
import {
  seleccionarFioCoa,
  obterFioTranscriptCoa,
  historicoDeliberativoParaDestino,
  definirCarregadorFallbackHfcFio,
  resetCarregadorFallbackHfcFio,
  JANELA_FIO_MAX_MSGS,
  CAP_CHARS_MSG_FIO
} from "./fioConversacional.js";

const COA_VV = "prj-valeverde";
const COA_MG2 = "prj-mg2";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
});

const T1_VALEVERDE = `CEO, seguem os primeiros dados da ValeVerde Alimentos:

A empresa possui 120 funcionários.
Faturamento anual: R$ 48 milhões.
Nos últimos 6 meses, a margem líquida caiu de 8% para 4%.
A principal causa identificada pela diretoria financeira é o aumento de 15% no custo das matérias-primas.
A diretoria comercial quer aumentar preços em 10%.
A diretoria comercial teme perder clientes.
A produção afirma que consegue reduzir desperdícios em aproximadamente 5%.
Não existem outras informações disponíveis neste momento.`;

const T2_PRIORIDADE = "Qual deve ser nossa prioridade agora?";
const T2_OPERACIONAL_NU = "Qual é a próxima decisão que você recomenda?";

function fioValeVerde() {
  return seleccionarFioCoa(
    [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    T2_PRIORIDADE,
    { coaId: COA_VV }
  );
}

function assertC2Mre(texto, fio, label) {
  assert.equal(ehRecomendacaoOperacional(texto, fio), false, `${label}: não E4`);
  assert.equal(
    ehPedidoAnaliseOuRecomendacao(normalizarTexto(texto), fio),
    true,
    `${label}: análise C2`
  );
  const s = classificar(texto, { fioCoa: fio });
  assert.equal(s.classe, "conversa_projeto", `${label}: C2`);
  assert.equal(s.destino, "nucleo_mre", `${label}: MRE`);
  assert.notEqual(
    mapearCapacidadePorTexto(texto, fio).id,
    "recomendar_operacional",
    `${label}: não template E4`
  );
  return s;
}

function assertE4(texto, fio, label) {
  assert.equal(objectoDoTurno(texto, fio), OBJECTO_TURNO.A, `${label}: objecto A`);
  assert.equal(ehRecomendacaoOperacional(texto, fio), true, `${label}: E4`);
  const s = classificar(texto, { fioCoa: fio });
  assert.equal(s.classe, "comando_operacional", `${label}: C4`);
  assert.equal(s.destino, "capacidade_operacional", `${label}: C4 dest`);
  assert.equal(
    mapearCapacidadePorTexto(texto, fio).id,
    "recomendar_operacional",
    `${label}: capacidade E4`
  );
  return s;
}

test("Fatia 2.1: T1 ValeVerde + T2 prioridade agora → B / C2 / MRE", () => {
  const fio = fioValeVerde();
  assert.ok(fio.some((m) => /fornecedor|materia|faturamento|margem/i.test(m.texto)));
  assert.equal(objectoDoTurno(T2_PRIORIDADE, fio), OBJECTO_TURNO.B);
  assertC2Mre(T2_PRIORIDADE, fio, "T1→T2");
  const rota = primeiroPassoClassificar(T2_PRIORIDADE, { fioCoa: fio });
  assert.equal(rota.destino, "nucleo_mre");
});

test("Fatia 2.1b: T1→T2 no Núcleo não cai no template E4", async () => {
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    {
      texto: T2_PRIORIDADE,
      historico: [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
      coaId: COA_VV
    },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "recomendacao_operacional");
  assert.doesNotMatch(String(out.mensagem), /n[aã]o\s+h[aá]\s+prioridade\s+alinhada/i);
  assert.notEqual(out.capacidade, "memoria");
});

test("Fatia 2.2: T2 sem fio → A / E4", () => {
  assertE4(T2_PRIORIDADE, undefined, "T2 isolado");
  assertE4(T2_PRIORIDADE, [], "T2 fio vazio");
});

test("Fatia 2.3: facto >800 chars integral no classificador e no MRE", () => {
  const facto = `${T1_VALEVERDE}\n${"Detalhe operacional da margem e do volume. ".repeat(40)}`;
  assert.ok(facto.length > 800, "facto longo");
  const fio = seleccionarFioCoa(
    [{ papel: "usuario", texto: facto, coaId: COA_VV }],
    T2_PRIORIDADE,
    { coaId: COA_VV }
  );
  assert.equal(fio[0].texto, facto.replace(/\s+/g, " ").trim());
  assert.ok(fio[0].texto.length > 800);
  const mre = enriquecerMensagemComFioRecente(T2_PRIORIDADE, [
    { papel: "usuario", texto: facto, coaId: COA_VV }
  ]);
  assert.ok(mre.includes(fio[0].texto.slice(0, 200)));
  assert.ok(mre.length > 800);
  assertC2Mre(T2_PRIORIDADE, fio, "facto longo");
});

test("Fatia 2.4: autorizaLastroCsc=false preserva fio B; CSC isolável", () => {
  const fio = fioValeVerde();
  const destino = historicoDeliberativoParaDestino({
    autorizaLastroCsc: false,
    historicoDeliberativo: fio
  });
  assert.notEqual(destino.length, 0);
  assert.deepEqual(destino, fio);
  assertC2Mre(T2_PRIORIDADE, destino, "VCA sem CSC");
});

test("Fatia 2.5: proposta noutro COA não vaza para ValeVerde", () => {
  const misto = [
    {
      papel: "usuario",
      texto: "Analise a proposta do bairro popular segundo o Manifesto.",
      coaId: COA_MG2
    },
    { papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }
  ];
  const fio = seleccionarFioCoa(misto, T2_PRIORIDADE, { coaId: COA_VV });
  assert.equal(fio.length, 1);
  assert.doesNotMatch(fio[0].texto, /bairro popular/i);
  assert.match(fio[0].texto, /ValeVerde|faturamento/i);
  assert.equal(objectoDoTurno(T2_PRIORIDADE, fio), OBJECTO_TURNO.B);
  assert.equal(
    objectoDoTurno(T2_OPERACIONAL_NU, [
      {
        papel: "usuario",
        texto: "Analise a proposta do bairro popular.",
        coaId: COA_MG2
      }
    ]),
    OBJECTO_TURNO.A
  );
});

test("Fatia 2.6: próxima decisão que recomenda sem referência ao fio → A/E4", () => {
  assertE4(T2_OPERACIONAL_NU, fioValeVerde(), "operacional nu + fio B");
  assertE4("Qual prioridade você recomenda agora?", fioValeVerde(), "T3 + fio");
});

test("Fatia 2.7: Sprint/JOB/gate/fila operacional → A/E4", () => {
  assertE4(
    "Analise e recomende a prioridade da Sprint 2 após o gate.",
    fioValeVerde(),
    "sprint"
  );
  assertE4(
    "Analise o JOB-000067 e recomende a próxima prioridade na fila.",
    fioValeVerde(),
    "job+fila"
  );
});

test("Fatia 2.8: «e agora?» após factos de negócio → B/C2", () => {
  const fio = fioValeVerde();
  assert.equal(objectoDoTurno("e agora?", fio), OBJECTO_TURNO.B);
  assertC2Mre("e agora?", fio, "deixis e agora");
});

test("Fatia 2.9: store vazio + HFC do mesmo COA; outro COA ignorado", () => {
  definirCarregadorFallbackHfcFio((id) => {
    if (id === COA_VV) {
      return [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }];
    }
    return [
      {
        papel: "usuario",
        texto: "Analise a proposta do bairro popular.",
        coaId: COA_MG2
      }
    ];
  });
  try {
    const fio = obterFioTranscriptCoa({
      transcript: [{ papel: "usuario", texto: T2_PRIORIDADE, coaId: COA_VV }],
      mensagemActual: T2_PRIORIDADE,
      coaId: COA_VV
    });
    assert.ok(fio.some((m) => /ValeVerde|faturamento/i.test(m.texto)));
    assert.ok(!fio.some((m) => /bairro/i.test(m.texto)));
    const janela = seleccionarFioCoa(fio, T2_PRIORIDADE, { coaId: COA_VV });
    assertC2Mre(T2_PRIORIDADE, janela, "HFC fallback");

    const outro = obterFioTranscriptCoa({
      transcript: [],
      mensagemActual: T2_PRIORIDADE,
      coaId: COA_VV,
      fallbackHfc: [
        {
          papel: "usuario",
          texto: "Analise a proposta do bairro popular.",
          coaId: COA_MG2
        }
      ]
    });
    assert.equal(outro.length, 0);
  } finally {
    resetCarregadorFallbackHfcFio();
  }
});

test("Fatia 2.10: classificador e MRE usam a mesma janela lógica", () => {
  assert.equal(JANELA_FIO_MAX_MSGS, 12);
  assert.equal(CAP_CHARS_MSG_FIO, 800);
  const hist = [
    { papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV },
    { papel: "ceo", texto: "Registado o lastro da ValeVerde.", coaId: COA_VV }
  ];
  const janelaClass = seleccionarFioCoa(hist, T2_PRIORIDADE, { coaId: COA_VV });
  const janelaMre = seleccionarFioCoa(hist, T2_PRIORIDADE, { coaId: COA_VV });
  assert.deepEqual(janelaClass, janelaMre);
  const enriquecido = enriquecerMensagemComFioRecente(T2_PRIORIDADE, hist);
  for (const m of janelaClass) {
    assert.ok(enriquecido.includes(m.texto.slice(0, 80)), "MRE vê o mesmo facto");
  }
  assert.doesNotMatch(enriquecido, /…$/);
});
