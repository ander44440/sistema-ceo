/**
 * Correção 6 — envelope DESTINATÁRIO / TIPO DE AÇÃO não entra no objectivo/título do Job.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extrairObjectivoRealParaJob,
  tituloJobDeInstrucao,
  montarParecerTrabalhoExecutivo
} from "./integracaoNucleo.js";
import { avaliarCriterioConclusao } from "../motorExecucao/cicloVidaJob.js";
import {
  ehReferenciaExplicitaJobId,
  ehAutorizacaoExplicitaCriarJob,
  classificar,
  normalizarTexto
} from "./regras.js";
import { extrairNomeProjetoNovaMissao } from "../executiveEngine/garantirProjetoNovaMissao.js";

const MSG_GAMA_CAIXA = `DESTINATÁRIO: CEO
TIPO DE AÇÃO: HOMOLOGAÇÃO REAL — CORREÇÃO 5
Quero iniciar uma nova missão no PROJETO TESTE GAMA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-gama-1.txt
Conteúdo exato:
PROJETO TESTE GAMA 1
PERSISTENCIA HOMOLOGADA

Execute essa missão e acompanhe até a conclusão.
Não utilize o PROJETO TESTE ALFA.`;

const MSG_META_ALFA =
  "Crie o Job necessário para criar o ficheiro projeto-teste-alfa.txt " +
  "com exactamente as linhas PROJETO TESTE ALFA e EXECUÇÃO INICIAL CONCLUÍDA. " +
  "Não execute ainda a próxima acção.";

test("1: envelope DESTINATÁRIO / TIPO DE AÇÃO fora do título e objectivo", () => {
  const obj = extrairObjectivoRealParaJob(MSG_GAMA_CAIXA);
  assert.doesNotMatch(obj, /DESTINAT[AÁ]RIO/i);
  assert.doesNotMatch(obj, /TIPO\s+DE\s+A[CÇ][AÃ]O/i);
  assert.doesNotMatch(obj, /HOMOLOGA[CÇ][AÃ]O\s+REAL/i);

  const p = montarParecerTrabalhoExecutivo(MSG_GAMA_CAIXA, {
    classe: "trabalho_executivo",
    confianca: 0.95
  });
  assert.doesNotMatch(p.acao.job.titulo, /DESTINAT/i);
  assert.doesNotMatch(p.acao.job.titulo, /TIPO\s+DE\s+A/i);
  assert.doesNotMatch(p.acao.job.descricao, /^DESTINAT/i);
  assert.doesNotMatch(p.diagnostico.objetivoReal, /DESTINAT/i);
});

test("2: tarefa real (ficheiro GAMA) continua extraída", () => {
  const obj = extrairObjectivoRealParaJob(MSG_GAMA_CAIXA);
  assert.match(obj, /projeto-teste-gama-1\.txt/i);
  assert.match(obj, /PROJETO TESTE GAMA 1/i);
  assert.match(obj, /PERSISTENCIA HOMOLOGADA/i);
  assert.match(tituloJobDeInstrucao(MSG_GAMA_CAIXA), /gama|arquivo|ficheiro|criar/i);
});

test("3: instrução sem envelope permanece igual", () => {
  const t =
    "Criar o ficheiro relatorio.txt com exactamente duas linhas: A e B.";
  assert.equal(extrairObjectivoRealParaJob(t), t);
});

test("4: DESTINATÁRIO incidental na tarefa não é removido", () => {
  const t =
    "Criar o ficheiro meta.txt com a linha exacta DESTINATÁRIO: CEO no conteúdo.";
  const obj = extrairObjectivoRealParaJob(t);
  assert.match(obj, /DESTINAT[AÁ]RIO:\s*CEO/i);
  assert.match(obj, /meta\.txt/i);
});

test("5: Correção 2 — objectivo = tarefa real (envelope Job)", () => {
  const obj = extrairObjectivoRealParaJob(MSG_META_ALFA);
  assert.doesNotMatch(obj, /crie\s+o\s+jobs?\s+necess/i);
  assert.doesNotMatch(obj, /n[aã]o\s+execute\s+ainda/i);
  assert.match(obj, /criar\s+o\s+ficheiro\s+projeto-teste-alfa\.txt/i);
});

test("6a: Correção 1 — JOB-ID ≠ criar Job", () => {
  const t = normalizarTexto("Despache o JOB-000075");
  assert.equal(ehReferenciaExplicitaJobId(t), true);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);
});

test("6b: Correção 3 — missão concreta → C3", () => {
  const s = classificar(
    "Quero iniciar uma nova missão independente do PROJETO TESTE ALFA.\nExecute essa missão: criar o ficheiro a.txt com OK."
  );
  assert.equal(s.classe, "trabalho_executivo");
});

test("6c: Correção 4 — âncora de projecto usa texto bruto (não depende do título)", () => {
  assert.equal(
    extrairNomeProjetoNovaMissao(MSG_GAMA_CAIXA),
    "PROJETO TESTE GAMA"
  );
});

test("7: verificador lexical usa título limpo → cobertura adequada", () => {
  const p = montarParecerTrabalhoExecutivo(MSG_GAMA_CAIXA, {
    classe: "trabalho_executivo",
    confianca: 0.95
  });
  const job = {
    estado: "result",
    titulo: p.acao.job.titulo,
    descricao: p.acao.job.descricao,
    resultado: {
      status: "sucesso",
      resumo:
        "Ficheiro executive/queue/projeto-teste-gama-1.txt criado com conteúdo exacto: PROJETO TESTE GAMA 1 PERSISTENCIA HOMOLOGADA.",
      evidencia: "executive/queue/projeto-teste-gama-1.txt"
    }
  };
  const av = avaliarCriterioConclusao(job);
  assert.equal(av.ok, true);
  assert.match(av.motivo, /evidencia_estruturada|cobertura_objetivo/);
});

test("8: criação normal de Job — parecer com tarefa directa", () => {
  const t = "Implementar o botão Pausar no Centro de Situação.";
  const p = montarParecerTrabalhoExecutivo(t, {
    classe: "trabalho_executivo",
    confianca: 0.9
  });
  assert.equal(p.acao.job.descricao, t);
  assert.match(p.acao.job.titulo, /Pausar|Implementar/i);
});
