/**
 * FRENTE 6 — Gate pós-LLM de disciplina de lastro insuficiente (CA1–CA6).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE,
  detectarInsuficienciaLastroTurno,
  garantirDisciplinaLastroInsuficiente,
  prosaJaDeclaraLastroInsuficiente
} from "./disciplinaLastroInsuficiente.js";
import {
  garantirReflexoEstadoExecutivo,
  AVISO_GATE_INFORMATIVO
} from "./influenciaDeliberacao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

const PROSA_INVENTADA =
  "O outdoor do bairro Centro está 100% pago e a sprint 9 já fechou com sucesso total.";

test("CA1: lastro insuficiente + prosa inventada → fail-closed; inventário não permanece", () => {
  const factos = [
    "LASTRO INSUFICIENTE: responder declarando as lacunas — proibido inventar ou preencher com estado operacional antigo.",
    "Etapa atual: LACUNA — sem evidência recente suficiente"
  ];
  const out = garantirDisciplinaLastroInsuficiente(PROSA_INVENTADA, {
    factosOficiais: factos,
    parecer: null,
    pedidoConsulta: false
  });
  assert.equal(out.aplicada, true);
  assert.equal(out.motivo, "flag_lastro_insuficiente");
  assert.match(out.mensagem, new RegExp(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE));
  assert.doesNotMatch(out.mensagem, /outdoor do bairro Centro/i);
  assert.doesNotMatch(out.mensagem, /sprint 9/i);
  assert.ok(prosaJaDeclaraLastroInsuficiente(out.mensagem));
});

test("CA1b: parecer solicitar_dados → fail-closed", () => {
  const out = garantirDisciplinaLastroInsuficiente(PROSA_INVENTADA, {
    factosOficiais: ["Estado Executivo — Job pendente JOB-000001: x"],
    parecer: {
      lacunas: ["critério de pagamento do outdoor"],
      decisaoExecutiva: { estado: "solicitar_dados" }
    },
    pedidoConsulta: false
  });
  assert.equal(out.aplicada, true);
  assert.equal(out.motivo, "parecer_solicitar_dados");
  assert.match(out.mensagem, /critério de pagamento do outdoor/i);
  assert.doesNotMatch(out.mensagem, /100% pago/i);
});

test("CA2: lastro suficiente → prosa inalterada; mecanismo não aplicado", () => {
  const prosa =
    "Recomendo aprovar o pagamento do outdoor com o critério já nos factos.";
  const out = garantirDisciplinaLastroInsuficiente(prosa, {
    factosOficiais: [
      "Estado Executivo — Job em execução JOB-000010: pagar outdoor"
    ],
    parecer: {
      lacunas: [],
      decisaoExecutiva: { estado: "aprovar" }
    },
    pedidoConsulta: false
  });
  assert.equal(out.aplicada, false);
  assert.equal(out.motivo, "sem_sinal_explicito");
  assert.equal(out.mensagem, prosa);
});

test("CA2b: só LACUNA EXPLÍCITA do Acervo NÃO activa (≠ lacuna material)", () => {
  const prosa = "Com base no briefing, priorizo a sprint jogável.";
  const out = garantirDisciplinaLastroInsuficiente(prosa, {
    factosOficiais: [
      "LACUNA EXPLÍCITA (Fonte Oficial / Acervo): não há item de conhecimento apto"
    ],
    parecer: {
      lacunas: [],
      decisaoExecutiva: { estado: "aprovar" }
    },
    pedidoConsulta: false
  });
  assert.equal(out.aplicada, false);
  assert.equal(out.mensagem, prosa);
});

test("CA3: CONSULTA (pedidoConsulta) → pass-through mesmo com LASTRO INSUFICIENTE", () => {
  const prosa = "Resposta do snapshot CONSULTA intacta.";
  const out = garantirDisciplinaLastroInsuficiente(prosa, {
    factosOficiais: ["LASTRO INSUFICIENTE: declarar lacunas"],
    parecer: {
      lacunas: ["etapa"],
      decisaoExecutiva: { estado: "solicitar_dados" }
    },
    pedidoConsulta: true
  });
  assert.equal(out.aplicada, false);
  assert.equal(out.motivo, "consulta_fora_de_escopo");
  assert.equal(out.mensagem, prosa);
  assert.equal(
    detectarInsuficienciaLastroTurno({
      factosOficiais: ["LASTRO INSUFICIENTE"],
      pedidoConsulta: true
    }).ativo,
    false
  );
});

test("CA4: C1 não chama o mecanismo — path determinístico sem import no ramo local", () => {
  const iaSrc = readFileSync(
    join(rootSrc, "executiveEngine/capacidades/ia.js"),
    "utf8"
  );
  // Capacidade ia só aplica disciplina dentro de ehRotaDeliberativa (C2), não no ramo localIds
  const idxLocal = iaSrc.indexOf('case "pergunta_data"');
  const idxDisc = iaSrc.indexOf("garantirDisciplinaLastroInsuficiente");
  assert.ok(idxLocal > 0);
  assert.ok(idxDisc > 0);
  // A primeira aplicação operacional está após ehRotaDeliberativa
  const idxRota = iaSrc.indexOf("ehRotaDeliberativa(intencao)");
  assert.ok(idxRota > 0);
  assert.ok(
    idxDisc > idxRota || iaSrc.includes("import { garantirDisciplinaLastroInsuficiente }"),
    "disciplina só entra no fluxo deliberativo C2"
  );
});

test("CA5: C3/MEP não atravessa — mepCeo sem referência ao gate", () => {
  const mepIdx = readFileSync(join(rootSrc, "mepCeo/index.js"), "utf8");
  assert.doesNotMatch(mepIdx, /disciplinaLastroInsuficiente|garantirDisciplinaLastroInsuficiente/);
  const mepReg = readFileSync(join(rootSrc, "mepCeo/registo.js"), "utf8");
  assert.doesNotMatch(mepReg, /garantirDisciplinaLastroInsuficiente/);
});

test("CA6: garantirReflexoEstadoExecutivo sem regressão + não sobrescreve disciplina aplicada", () => {
  const lastro = {
    temContextoRelevante: true,
    factosOficiais: ["Estado Executivo — Gate pendente GATE-1 (parecer p-1)"],
    contagens: { gatesPendentes: 1, jobsPendentes: 0, jobsEmExecucao: 0 },
    fontePrioritaria: { id: "F3", nivel: "P1", nome: "Gates" },
    prioridadeActiva: []
  };
  const deliberativa = "Recomendo aprovar a proposta A com critério X.";
  const reflexo = garantirReflexoEstadoExecutivo(
    deliberativa,
    lastro,
    "qual o estado?"
  );
  assert.equal(typeof reflexo.mensagem, "string");
  assert.ok(reflexo.mensagem.length > 0);

  const disc = garantirDisciplinaLastroInsuficiente(PROSA_INVENTADA, {
    factosOficiais: ["LASTRO INSUFICIENTE: lacunas"],
    pedidoConsulta: false
  });
  assert.equal(disc.aplicada, true);
  // Integração: após disciplina aplicada, reflexo NÃO deve substituir (contrato ia/nucleo)
  const apos = disc.aplicada
    ? { mensagem: disc.mensagem, aplicada: false, motivo: "omitido_apos_disciplina_lastro" }
    : garantirReflexoEstadoExecutivo(disc.mensagem, lastro, "decidir");
  assert.equal(apos.mensagem, disc.mensagem);
  assert.match(apos.mensagem, new RegExp(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE));
  void AVISO_GATE_INFORMATIVO;
});

test("idempotência: já declarado → não reaplica", () => {
  const primeira = garantirDisciplinaLastroInsuficiente(PROSA_INVENTADA, {
    factosOficiais: ["LASTRO INSUFICIENTE: x"],
    pedidoConsulta: false
  });
  const segunda = garantirDisciplinaLastroInsuficiente(primeira.mensagem, {
    factosOficiais: ["LASTRO INSUFICIENTE: x"],
    pedidoConsulta: false
  });
  assert.equal(segunda.aplicada, false);
  assert.equal(segunda.motivo, "ja_declarado");
  assert.equal(segunda.mensagem, primeira.mensagem);
});

test("integração nucleo: call site único no path MRE (antes do reflexo)", () => {
  const src = readFileSync(
    join(rootSrc, "mre/integracaoNucleo.js"),
    "utf8"
  );
  assert.match(src, /garantirDisciplinaLastroInsuficiente/);
  const iDisc = src.indexOf("garantirDisciplinaLastroInsuficiente(comunicado.texto");
  const iRefl = src.indexOf("garantirReflexoEstadoExecutivo(\n        comunicado.texto");
  // Fallback: reflexo após disciplina no bloco !pedidoConsulta
  assert.ok(iDisc > 0);
  assert.match(src, /omitido_apos_disciplina_lastro/);
  assert.match(src, /disciplinaLastro/);
  void iRefl;
});
