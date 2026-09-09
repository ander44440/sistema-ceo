/**
 * F5-C6 — Persistência da Autoridade Delegada após refresh / reinício.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import executiveEngine from "../executiveEngine/index.js";
import {
  AGENTES,
  activarAutoridadeDelegada,
  autoridadeDelegadaActiva,
  exercerFechoDelegado,
  hidratarAutoridadeDelegadaSessao,
  obterEstadoAutoridadeDelegada,
  reiniciarAutoridadeDelegadaParaTestes,
  revogarDelegacaoImediatamente
} from "./autoridadeDelegada.js";
import {
  STORAGE_KEY_AD,
  carregarSnapshotAd
} from "./persistenciaAutoridadeDelegada.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

/**
 * Refresh = perde RAM da AD, mantém localStorage, boot reidrata.
 * reiniciar limpa RAM+persistência; repor raw e hidratar.
 */
function simularRefreshEBoot(opts = {}) {
  const raw = globalThis.localStorage.getItem(STORAGE_KEY_AD);
  reiniciarAutoridadeDelegadaParaTestes();
  if (raw) {
    globalThis.localStorage.setItem(STORAGE_KEY_AD, raw);
  }
  return hidratarAutoridadeDelegadaSessao(opts);
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarAutoridadeDelegadaParaTestes();
});

function activarPadrao(extra = {}) {
  const r = activarAutoridadeDelegada({
    texto: "delego a autoridade — você decide no perímetro do MG2",
    agente: AGENTES.usuario,
    perimetro: "coa-mg2",
    ...extra
  });
  assert.equal(r.ok, true);
  return r.estado;
}

const depsMotor = () => {
  let motorChamado = false;
  return {
    get motorChamado() {
      return motorChamado;
    },
    deps: {
      listarPorEstado: async () => [],
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "activo" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: false, alertas: 0 }),
        F8: async () => ({ id: "mg2", nome: "Motoboy Game 2" })
      },
      publicarJob: async (pedido) => ({
        id: "JOB-F5C6",
        estado: "pending",
        ...pedido
      }),
      conduzirMotor: async () => {
        motorChamado = true;
        return {
          publicado: true,
          job: { id: "JOB-F5C6", estado: "pending" },
          fluxoIniciado: true
        };
      }
    }
  };
};

test("F5-C6: activar AD → refresh → AD continua activa", () => {
  const estado = activarPadrao();
  assert.equal(autoridadeDelegadaActiva(), true);
  const doc = carregarSnapshotAd();
  assert.ok(doc);
  assert.equal(doc.perimetro, "coa-mg2");
  assert.equal(doc.actoOrigem, estado.actoOrigem);
  assert.ok(doc.quandoActivado);

  const h = simularRefreshEBoot();
  assert.equal(h.hidratado, true);
  assert.equal(h.expirado, false);
  assert.equal(h.activo, true);
  assert.equal(autoridadeDelegadaActiva(), true);
  const e = obterEstadoAutoridadeDelegada();
  assert.equal(e.perimetro, "coa-mg2");
  assert.equal(e.competenciaFecho, "ceo");
  assert.equal(e.actoOrigem, estado.actoOrigem);
});

test("F5-C6: AD activa → ordem no perímetro após reinício → fecho delegado ok", () => {
  activarPadrao();
  simularRefreshEBoot();
  assert.equal(autoridadeDelegadaActiva(), true);

  const r = exercerFechoDelegado({
    coaId: "coa-test-ad",
    tipoFecho: "priorizar",
    ambito: "coa-mg2",
    descricao: "Priorizar LOD após refresh"
  });
  assert.equal(r.ok, true);
  assert.equal(r.fechado, true);
  assert.equal(r.fecho.sobAutoridadeDelegada, true);
  assert.equal(autoridadeDelegadaActiva(), true);
});

test("F5-C6: AD activa → EXECUTE após reinício → comportamento delegado no EE", async () => {
  activarPadrao();
  simularRefreshEBoot();
  executiveEngine.inicializar();

  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: "implemente esta funcionalidade", historico: [] },
    ctx.deps
  );
  assert.equal(autoridadeDelegadaActiva(), true);
  assert.equal(
    out.dados?.precedenciaTurno?.acao,
    "permitir_ad_execucao_c3"
  );
  assert.ok(ctx.motorChamado || out.dados?.motorAcionado === true);
});

test("F5-C6: AD com expiraEm vencido → reinício → NÃO reactiva", () => {
  const passado = new Date(Date.now() - 60_000).toISOString();
  activarPadrao({ expiraEm: passado });
  assert.equal(autoridadeDelegadaActiva(), true);
  assert.ok(carregarSnapshotAd());

  const h = simularRefreshEBoot({ agora: new Date().toISOString() });
  assert.equal(h.expirado, true);
  assert.equal(h.activo, false);
  assert.equal(autoridadeDelegadaActiva(), false);
  assert.equal(carregarSnapshotAd(), null);
});

test("F5-C6: encerrar/revogar AD → persistência removida → refresh sem AD", () => {
  activarPadrao();
  assert.ok(carregarSnapshotAd());

  const rev = revogarDelegacaoImediatamente({
    motivo: "teste_f5c6"
  });
  assert.equal(rev.encerrado, true);
  assert.equal(autoridadeDelegadaActiva(), false);
  assert.equal(carregarSnapshotAd(), null);

  const h = simularRefreshEBoot();
  assert.equal(h.hidratado, false);
  assert.equal(h.activo, false);
  assert.equal(autoridadeDelegadaActiva(), false);
});

test("F5-C6: comportamento sem refresh permanece intacto", async () => {
  activarPadrao();
  assert.equal(autoridadeDelegadaActiva(), true);

  const fecho = exercerFechoDelegado({
    coaId: "coa-test-ad",
    tipoFecho: "escolher_entre_alternativas",
    ambito: "coa-mg2",
    descricao: "Escolher A vs B"
  });
  assert.equal(fecho.ok, true);
  assert.equal(autoridadeDelegadaActiva(), true);

  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: "executa a tarefa agora", historico: [] },
    ctx.deps
  );
  assert.equal(autoridadeDelegadaActiva(), true);
  assert.ok(ctx.motorChamado || out.dados?.motorAcionado === true);
  assert.ok(carregarSnapshotAd());
});
