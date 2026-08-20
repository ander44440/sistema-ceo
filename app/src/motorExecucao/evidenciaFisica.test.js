/**
 * Etapa 9-B — verificação física de arquivo (evidenciaVerificavel).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  avaliarCriterioConclusao,
  verificarResultadoJob
} from "./cicloVidaJob.js";
import {
  MOTIVO_EVIDENCIA_VERIFICADA,
  MOTIVO_ARQUIVO_AUSENTE,
  MOTIVO_CONTEUDO_DIVERGENTE,
  MOTIVO_PATH_NAO_PERMITIDO,
  MOTIVO_NAO_E_ARQUIVO,
  verificarEvidenciaArquivo
} from "./evidenciaFisica.js";
import { criarIoFsNode } from "./evidenciaFisicaNode.js";

function tmpRoot(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function jobComEv(overrides = {}) {
  return {
    id: "JOB-TEST-9B",
    estado: "result",
    objetivo: "Criar ficheiro de teste com linha EXATA.",
    resultado: {
      status: "sucesso",
      resumo: "feito",
      evidenciaVerificavel: {
        tipo: "arquivo",
        alvo: "artefacto.txt",
        conteudoExacto: "CEO operacional"
      }
    },
    ...overrides
  };
}

test("9B T1: arquivo permitido + existe + conteúdo exacto → evidencia_verificada", () => {
  const root = tmpRoot("ceo-9b-ok-");
  const alvo = path.join(root, "artefacto.txt");
  fs.writeFileSync(alvo, "CEO operacional", "utf8");
  const io = criarIoFsNode();
  const av = avaliarCriterioConclusao(jobComEv(), {
    rootsPermitidos: [root],
    fsIo: io,
    pathApi: path
  });
  assert.equal(av.ok, true);
  assert.equal(av.motivo, MOTIVO_EVIDENCIA_VERIFICADA);
  assert.equal(av.detalhes.pathResolvido, fs.realpathSync(alvo));
  assert.ok(av.detalhes.verificacoes.includes("conteudoExacto:true"));

  const v = verificarResultadoJob(jobComEv(), {
    rootsPermitidos: [root],
    fsIo: io,
    pathApi: path
  });
  assert.equal(v.ok, true);
  assert.equal(v.job.estado, "completed");
  assert.equal(v.job.verificacao.motivo, MOTIVO_EVIDENCIA_VERIFICADA);
});

test("9B T2: conteúdo incorrecto → não completed", () => {
  const root = tmpRoot("ceo-9b-bad-");
  fs.writeFileSync(path.join(root, "artefacto.txt"), "ERRADO", "utf8");
  const av = avaliarCriterioConclusao(jobComEv(), {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(av.ok, false);
  assert.equal(av.motivo, MOTIVO_CONTEUDO_DIVERGENTE);

  const v = verificarResultadoJob(jobComEv(), {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(v.ok, true);
  assert.equal(v.job.estado, "needs_correction");
  assert.notEqual(v.job.estado, "completed");
});

test("9B T3: arquivo inexistente → não completed", () => {
  const root = tmpRoot("ceo-9b-miss-");
  const av = avaliarCriterioConclusao(jobComEv(), {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(av.ok, false);
  assert.equal(av.motivo, MOTIVO_ARQUIVO_AUSENTE);

  const v = verificarResultadoJob(jobComEv(), {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(v.job.estado, "needs_correction");
});

test("9B T4: path fora dos roots → não lê; não completed", () => {
  const rootOk = tmpRoot("ceo-9b-allow-");
  const rootOut = tmpRoot("ceo-9b-deny-");
  const secret = path.join(rootOut, "segredo.txt");
  fs.writeFileSync(secret, "CEO operacional", "utf8");

  let leu = false;
  const ioBase = criarIoFsNode();
  const io = {
    ...ioBase,
    readFile(p, max) {
      leu = true;
      return ioBase.readFile(p, max);
    }
  };

  const job = jobComEv({
    resultado: {
      status: "sucesso",
      resumo: "tenta escape",
      evidenciaVerificavel: {
        tipo: "arquivo",
        alvo: secret,
        conteudoExacto: "CEO operacional"
      }
    }
  });
  const av = avaliarCriterioConclusao(job, {
    rootsPermitidos: [rootOk],
    fsIo: io,
    pathApi: path
  });
  assert.equal(av.ok, false);
  assert.equal(av.motivo, MOTIVO_PATH_NAO_PERMITIDO);
  assert.equal(leu, false);

  const v = verificarResultadoJob(job, {
    rootsPermitidos: [rootOk],
    fsIo: io,
    pathApi: path
  });
  assert.equal(v.job.estado, "needs_correction");
});

test("9B T5: diretório não é aceite como arquivo", () => {
  const root = tmpRoot("ceo-9b-dir-");
  const dir = path.join(root, "pasta");
  fs.mkdirSync(dir);
  const job = jobComEv({
    resultado: {
      status: "sucesso",
      resumo: "dir",
      evidenciaVerificavel: {
        tipo: "arquivo",
        alvo: "pasta",
        conteudoExacto: "x"
      }
    }
  });
  const av = avaliarCriterioConclusao(job, {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(av.ok, false);
  assert.equal(av.motivo, MOTIVO_NAO_E_ARQUIVO);
});

test("9B T6: sem evidenciaVerificavel → lexical actual preservado", () => {
  const objetivo =
    "Despache o JOB-000075 para execução e acompanhe a operação sem usar jobs do MG2. " +
    "Crie o ficheiro projeto-teste-alfa.txt com as linhas PROJETO TESTE ALFA e EXECUÇÃO INICIAL CONCLUÍDA.";
  const av = avaliarCriterioConclusao({
    objetivo,
    resultado: {
      status: "sucesso",
      resumo: objetivo,
      evidencia: "projeto-teste-alfa.txt JOB-000075 EXECUÇÃO INICIAL CONCLUÍDA"
    }
  });
  assert.equal(av.ok, true);
  assert.match(av.motivo, /evidencia_estruturada|cobertura_objetivo/);
});

test("9B T7: evidencia legada isolada não completa sem verificação estruturada física", () => {
  const root = tmpRoot("ceo-9b-leg-");
  const ficheiro = path.join(root, "teste-ceo-operacao.txt");
  fs.writeFileSync(ficheiro, "CEO operacional", "utf8");

  const job = {
    id: "JOB-LEGACY",
    estado: "result",
    objetivo:
      "No MG2, crie um pequeno Job de teste para verificar se o fluxo de execução está funcionando. A tarefa é: criar um arquivo chamado teste-ceo-operacao.txt contendo exatamente uma linha: CEO operacional. Não faça nenhuma outra alteração.",
    resultado: {
      status: "sucesso",
      resumo:
        "Ficheiro teste-ceo-operacao.txt criado no repo MG2 com conteudo exacto: CEO operacional.",
      evidencia: ficheiro
    }
  };

  // Com roots+io mas SEM evidenciaVerificavel → não usa caminho físico
  const av = avaliarCriterioConclusao(job, {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(av.ok, false);
  assert.equal(av.motivo, "objetivo_nao_atendido");
  assert.notEqual(av.motivo, MOTIVO_EVIDENCIA_VERIFICADA);

  const v = verificarResultadoJob(job, {
    rootsPermitidos: [root],
    fsIo: criarIoFsNode(),
    pathApi: path
  });
  assert.equal(v.job.estado, "needs_correction");
});

test("9B: evidenciaVerificável sem io/roots → observacao_fisica_indisponivel", () => {
  const av = avaliarCriterioConclusao(jobComEv());
  assert.equal(av.ok, false);
  assert.equal(av.motivo, "observacao_fisica_indisponivel");
});

test("9B: verificarEvidenciaArquivo unitário — path relativo sob root", () => {
  const root = tmpRoot("ceo-9b-rel-");
  fs.writeFileSync(path.join(root, "a.txt"), "OK", "utf8");
  const r = verificarEvidenciaArquivo(
    { tipo: "arquivo", alvo: "a.txt", conteudoExacto: "OK" },
    { rootsPermitidos: [root], io: criarIoFsNode(), pathApi: path }
  );
  assert.equal(r.ok, true);
  assert.equal(r.motivo, MOTIVO_EVIDENCIA_VERIFICADA);
});
