/**
 * Fila de Execução V1 — persistência em ficheiros JSON (REQ-045 + P0-2).
 * Sem mensageria cloud. CEO publica; executores consomem via protocolo local.
 * COMPLETED só após verificação (estado result → completed).
 */

import fs from "node:fs";
import path from "node:path";
import {
  ehEstadoJob,
  validarTransicaoJob
} from "../src/motorExecucao/dominio.js";
import {
  anexarHistoricoCiclo,
  verificarResultadoJob,
  registrarResultadoBruto,
  marcarDespachado,
  marcarRunning,
  marcarFalhaExecucao,
  processarResultadoComVerificacao
} from "../src/motorExecucao/cicloVidaJob.js";
import { exigirObjetivoCanonico } from "../src/motorExecucao/objetivoJob.js";
import { optsVerificacaoEvidenciaFisica } from "../src/motorExecucao/evidenciaFisicaNode.js";

/**
 * @param {string} rootDir — raiz do repo CEO (pai de executive/)
 */
export function criarFilaExecucao(rootDir) {
  const queueDir = path.join(rootDir, "executive", "queue");

  function optsVerify(job, opts = {}) {
    if (opts.fsIo || opts.io || Array.isArray(opts.rootsPermitidos)) {
      return opts;
    }
    return {
      ...opts,
      ...optsVerificacaoEvidenciaFisica({
        repoRoot: rootDir,
        projetoId: job && job.projeto
      })
    };
  }

  function garantirDir() {
    fs.mkdirSync(queueDir, { recursive: true });
  }

  function caminhoJob(id) {
    return path.join(queueDir, `${id}.json`);
  }

  function listarFicheirosJob() {
    garantirDir();
    return fs
      .readdirSync(queueDir)
      .filter((f) => /^JOB-\d+\.json$/i.test(f))
      .sort();
  }

  function lerJob(id) {
    const p = caminhoJob(id);
    if (!fs.existsSync(p)) return null;
    let raw = fs.readFileSync(p, "utf8");
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    return JSON.parse(raw);
  }

  function escreverJob(job) {
    garantirDir();
    const p = caminhoJob(job.id);
    fs.writeFileSync(p, JSON.stringify(job, null, 2) + "\n", "utf8");
    return job;
  }

  function proximoId() {
    const nums = listarFicheirosJob().map((f) => {
      const m = f.match(/JOB-(\d+)/i);
      return m ? Number(m[1]) : 0;
    });
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `JOB-${String(n).padStart(6, "0")}`;
  }

  function atualizarProximoMd(pending) {
    garantirDir();
    const alvo = path.join(queueDir, "PROXIMO.md");
    if (!pending.length) {
      fs.writeFileSync(
        alvo,
        [
          "# Próximo Job",
          "",
          "_Nenhum Job `pending` na fila._",
          "",
          "Quando o CEO publicar um Job, este ficheiro será atualizado.",
          ""
        ].join("\n"),
        "utf8"
      );
      return;
    }
    const j = pending[0];
    fs.writeFileSync(
      alvo,
      [
        "# Próximo Job (pending)",
        "",
        `- **id:** \`${j.id}\``,
        `- **projeto:** ${j.projeto || "(n/d)"}${j.projetoNome ? ` (${j.projetoNome})` : ""}`,
        `- **tipo:** ${j.tipo || "execucao"}`,
        `- **prioridade:** ${j.prioridade || "normal"}`,
        `- **titulo:** ${j.titulo}`,
        "",
        "## Descrição",
        "",
        j.descricao || "(sem descrição)",
        "",
        "## Protocolo (P0-2)",
        "",
        "1. Marcar Job como `dispatched` (handoff) e depois `running`.",
        "2. Executar o trabalho pedido.",
        "3. Registar resultado em estado `result` (nunca `completed` directo).",
        "4. CEO verifica → `completed` | `needs_correction` | `failed`.",
        "",
        `Ficheiro: \`executive/queue/${j.id}.json\``,
        ""
      ].join("\n"),
      "utf8"
    );
  }

  function listarPorEstado(estado) {
    return listarFicheirosJob()
      .map((f) => lerJob(f.replace(/\.json$/i, "")))
      .filter((j) => j && (!estado || j.estado === estado));
  }

  function publicar(entrada) {
    const gate = exigirObjetivoCanonico(entrada);
    if (!gate.ok) {
      throw new Error(gate.mensagem);
    }
    const id = proximoId();
    const agora = new Date().toISOString();
    const job = {
      id,
      origem: entrada.origem || "ceo",
      projeto: entrada.projeto || null,
      ...(entrada.projetoNome && String(entrada.projetoNome).trim()
        ? { projetoNome: String(entrada.projetoNome).trim() }
        : {}),
      tipo: entrada.tipo || "execucao_tecnica",
      titulo: String(entrada.titulo || "").trim() || "Job sem título",
      descricao: String(entrada.descricao || "").trim() || "",
      objetivo: gate.objetivo,
      prioridade: entrada.prioridade || "normal",
      estado: "pending",
      criadoEm: agora,
      iniciadoEm: null,
      despachadoEm: null,
      concluidoEm: null,
      resultado: null,
      historicoCiclo: [
        {
          em: agora,
          de: null,
          para: "pending",
          motivo: "criacao",
          actor: "ceo"
        }
      ],
      ...(entrada.parecerId ? { parecerId: String(entrada.parecerId) } : {}),
      ...(entrada.parentJobId
        ? { parentJobId: String(entrada.parentJobId) }
        : {}),
      ...(entrada.criterioConclusao
        ? { criterioConclusao: String(entrada.criterioConclusao) }
        : {})
    };
    escreverJob(job);
    atualizarProximoMd(listarPorEstado("pending"));
    return job;
  }

  /**
   * Transição controlada. `completed` directo é recusado — use
   * `registarResultado` (result + verificação automática) ou `verificar`.
   */
  function atualizarEstado(id, estado, extra = {}) {
    if (!ehEstadoJob(estado)) {
      throw new Error(`Estado inválido: ${estado}`);
    }
    const job = lerJob(id);
    if (!job) throw new Error(`Job não encontrado: ${id}`);

    // P0-2: completed só com verificação prévia ou flag explícita pós-verify
    if (estado === "completed" && extra.verificado !== true) {
      if (job.estado === "result") {
        const v = verificarResultadoJob(job, optsVerify(job, {
          objetivo: extra.objetivo,
          criterioFn: extra.criterioFn,
          actor: extra.actor || "ceo_verificacao"
        }));
        if (!v.ok) throw new Error(v.mensagem || "Verificação falhou.");
        escreverJob(v.job);
        atualizarProximoMd(listarPorEstado("pending"));
        return v.job;
      }
      throw new Error(
        "COMPLETED exige verificação (estado result → verificar). Handoff/execução ≠ conclusão."
      );
    }

    const t = validarTransicaoJob(job.estado, estado);
    if (!t.ok) throw new Error(t.mensagem);

    const agora = new Date().toISOString();
    job.historicoCiclo = anexarHistoricoCiclo(job, job.estado, estado, {
      em: agora,
      motivo: extra.motivo || null,
      actor: extra.actor || null
    });
    job.estado = estado;
    if (estado === "dispatched" && !job.despachadoEm) job.despachadoEm = agora;
    if (estado === "running" && !job.iniciadoEm) job.iniciadoEm = agora;
    if (estado === "completed" || estado === "failed" || estado === "cancelled") {
      job.concluidoEm = agora;
    }
    if (extra.resultado != null) job.resultado = extra.resultado;
    if (extra.falha) job.falha = extra.falha;
    if (extra.correcao) job.correcao = extra.correcao;
    if (extra.verificacao) job.verificacao = extra.verificacao;
    if (estado === "result" && extra.resultado != null) {
      job.resultadoEm = agora;
    }
    escreverJob(job);

    // P0-2 integração: chegada a RESULT dispara verificação formal do CEO
    if (estado === "result" && !extra.adiarVerificacao) {
      const actual = lerJob(id);
      const v = verificarResultadoJob(actual, optsVerify(actual, {
        objetivo: extra.objetivo,
        criterioFn: extra.criterioFn,
        actor: extra.actor || "ceo_verificacao"
      }));
      if (v.ok) {
        escreverJob(v.job);
        atualizarProximoMd(listarPorEstado("pending"));
        return v.job;
      }
    }

    atualizarProximoMd(listarPorEstado("pending"));
    return lerJob(id);
  }

  function aplicarEPersistir(resultadoTransicao) {
    if (!resultadoTransicao.ok) {
      throw new Error(resultadoTransicao.mensagem || "Transição recusada.");
    }
    escreverJob(resultadoTransicao.job);
    atualizarProximoMd(listarPorEstado("pending"));
    return resultadoTransicao.job;
  }

  /**
   * Agent regista evidência → RESULT → verificação CEO automática.
   * Não é atalho para COMPLETED: passa por verificarResultadoJob.
   */
  function registarResultado(id, resultado, opts = {}) {
    const reg = registrarResultadoBruto(lerJob(id), resultado, opts);
    if (!reg.ok) throw new Error(reg.mensagem || "Falha ao registar resultado.");
    escreverJob(reg.job);
    if (opts.adiarVerificacao === true) {
      atualizarProximoMd(listarPorEstado("pending"));
      return reg.job;
    }
    const v = verificarResultadoJob(reg.job, optsVerify(reg.job, {
      objetivo: opts.objetivo,
      criterioFn: opts.criterioFn,
      actor: opts.actorVerificacao || "ceo_verificacao",
      forcarFailed: opts.forcarFailed
    }));
    if (!v.ok) throw new Error(v.mensagem || "Verificação falhou.");
    escreverJob(v.job);
    atualizarProximoMd(listarPorEstado("pending"));
    return v.job;
  }

  return {
    queueDir,
    publicar,
    listarPorEstado,
    listarPendentes: () => listarPorEstado("pending"),
    listarAguardandoVerificacao: () => listarPorEstado("result"),
    lerJob,
    atualizarEstado,
    marcarDespachado: (id, opts) =>
      aplicarEPersistir(marcarDespachado(lerJob(id), opts)),
    marcarRunning: (id, opts) =>
      aplicarEPersistir(marcarRunning(lerJob(id), opts)),
    registarResultado,
    verificar: (id, opts) =>
      aplicarEPersistir(
        verificarResultadoJob(lerJob(id), optsVerify(lerJob(id), opts || {}))
      ),
    processarResultado: (id, resultado, opts) => {
      const job = lerJob(id);
      return aplicarEPersistir(
        processarResultadoComVerificacao(job, resultado, optsVerify(job, opts || {}))
      );
    },
    marcarFalha: (id, falha, opts) =>
      aplicarEPersistir(marcarFalhaExecucao(lerJob(id), falha, opts)),
    atualizarProximoMd: () => atualizarProximoMd(listarPorEstado("pending"))
  };
}
