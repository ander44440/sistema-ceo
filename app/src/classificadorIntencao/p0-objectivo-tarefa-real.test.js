/**
 * Correção 2 — objectivo do Job = tarefa real (não envelope meta).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extrairObjectivoRealParaJob,
  tituloJobDeInstrucao,
  montarParecerTrabalhoExecutivo
} from "./integracaoNucleo.js";
import { ehAutorizacaoExplicitaCriarJob, normalizarTexto } from "./regras.js";

const MSG_META_ALFA =
  "Crie o Job necessário para criar o ficheiro projeto-teste-alfa.txt " +
  "com exactamente as linhas PROJETO TESTE ALFA e EXECUÇÃO INICIAL CONCLUÍDA. " +
  "Não execute ainda a próxima acção.";

test("objectivo: remove envelope «crie o Job necessário» e «não execute ainda»", () => {
  const obj = extrairObjectivoRealParaJob(MSG_META_ALFA);
  assert.doesNotMatch(obj, /crie\s+o\s+jobs?\s+necess/i);
  assert.doesNotMatch(obj, /n[aã]o\s+execute\s+ainda/i);
  assert.doesNotMatch(obj, /pr[oó]xima\s+a(?:cç|ç|c)[aã]o/i);
  assert.match(obj, /criar\s+o\s+ficheiro\s+projeto-teste-alfa\.txt/i);
  assert.match(obj, /PROJETO TESTE ALFA/);
  assert.match(obj, /EXECUÇÃO INICIAL CONCLUÍDA|EXECUCAO INICIAL CONCLUIDA/i);
});

test("objectivo: tarefa concreta directa permanece", () => {
  const t =
    "Criar o ficheiro relatorio.txt com exactamente duas linhas: A e B.";
  assert.equal(extrairObjectivoRealParaJob(t), t);
});

test("parecer C3 grava tarefa real em título/descrição", () => {
  // Autorização de criar Job continua a ler a mensagem bruta
  assert.equal(
    ehAutorizacaoExplicitaCriarJob(normalizarTexto(MSG_META_ALFA)),
    true
  );

  const p = montarParecerTrabalhoExecutivo(MSG_META_ALFA, {
    classe: "trabalho_executivo",
    confianca: 0.9,
    razaoCurta: "c3"
  });
  assert.doesNotMatch(p.acao.job.titulo, /crie\s+o\s+jobs?\s+necess/i);
  assert.doesNotMatch(p.acao.job.descricao, /n[aã]o\s+execute\s+ainda/i);
  assert.doesNotMatch(p.diagnostico.objetivoReal, /crie\s+o\s+jobs?\s+necess/i);
  assert.match(p.acao.job.descricao, /ficheiro\s+projeto-teste-alfa\.txt/i);
  assert.match(tituloJobDeInstrucao(MSG_META_ALFA), /ficheiro|criar/i);
});

test("parecer: sem envelope meta — descrição ≈ instrução", () => {
  const t = "Implementar o botão Pausar no Centro de Situação.";
  const p = montarParecerTrabalhoExecutivo(t, {
    classe: "trabalho_executivo",
    confianca: 0.9
  });
  assert.equal(p.acao.job.descricao, t);
});
