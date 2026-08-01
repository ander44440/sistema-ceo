/**
 * Testes UI Orquestração — IMP-055 E3 (sem SSE / expansão / coletores).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { NOS_V1, montarNo, CAMPOS_VISTA_PRINCIPAL } from "./dominio.js";
import { PATH_SNAPSHOT } from "./cliente.js";
import { obterSnapshotOrquestracao, vistasDegradacaoSnapshot } from "./cliente.js";
import {
  htmlCartaoNoVistaPrincipal,
  htmlGrelhaNos,
  htmlPainelOrquestracao,
  checklistProgressividadeHtml,
  contarCartoesHtml,
  ligarPainelOrquestracao
} from "./ui.js";

test("E3-CA1: seis nós com exactamente três campos principais", () => {
  const nos = NOS_V1.map((id) =>
    montarNo(id, "Ocioso", {
      detalhe: { jobId: "J-1", apiKey: "sk-secret" },
      origemSinal: "stub"
    })
  );
  const html = htmlGrelhaNos(nos);
  assert.equal(contarCartoesHtml(html), 6);
  const check = checklistProgressividadeHtml(html);
  assert.equal(check.ok, true, check.falhas.join("; "));
  assert.equal(html.includes("sk-secret"), false);
  assert.equal(html.includes("origemSinal"), false);
  assert.equal(html.includes("J-1"), false);
  assert.equal(html.includes("atualizadoEm"), false);
  for (const c of CAMPOS_VISTA_PRINCIPAL) {
    assert.ok(html.includes(c) || html.includes("data-orq-campos"));
  }
  assert.match(html, /CEO/);
  assert.match(html, /CTO/);
  assert.match(html, /Agent/);
  assert.match(html, /Dispatcher/);
  assert.match(html, /Backend/);
  assert.match(html, /Speaker/);
});

test("E3-CA2: checklist Progressividade PASS no HTML do cartão", () => {
  const html = htmlCartaoNoVistaPrincipal(
    montarNo("ceo", "Disponivel", { detalhe: { x: 1 }, origemSinal: "t" })
  );
  const check = checklistProgressividadeHtml(html);
  assert.equal(check.ok, true, check.falhas.join("; "));
  assert.equal(html.includes("detalhe"), false);
  assert.match(html, /cs-orq-nome/);
  assert.match(html, /cs-orq-estado-label/);
  assert.match(html, /cs-orq-desc/);
});

test("E3-CA2: checklist falha se HTML técnico vazar", () => {
  const bad = `<article data-orq-campos="nome,estado,descricaoResumida">
    <span class="cs-orq-nome">X</span>
    <span class="cs-orq-estado">Y</span>
    <span class="cs-orq-desc">Z</span>
    <pre>origemSinal=health</pre>
  </article>`;
  assert.equal(checklistProgressividadeHtml(bad).ok, false);
});

test("E3-CA3: shell do painel é secundário à Conversa (marcadores)", () => {
  const shell = htmlPainelOrquestracao();
  assert.match(shell, /aria-label="Orquestração"/);
  assert.match(shell, /cs-orq/);
  assert.match(shell, /Actualização|actualizar/i);
  assert.equal(shell.includes("cs-chat"), false);
});

test("E3-CA4: cliente só faz GET ao path de snapshot", async () => {
  /** @type {{ url: string, method: string }[]} */
  const chamadas = [];
  const fetchImpl = async (url, init = {}) => {
    chamadas.push({ url: String(url), method: String(init.method || "GET") });
    return {
      ok: true,
      json: async () => ({
        ok: true,
        em: "2026-08-01T12:00:00.000Z",
        nos: NOS_V1.map((id) => montarNo(id, "Ocioso"))
      })
    };
  };
  const out = await obterSnapshotOrquestracao({ fetchImpl });
  assert.equal(out.ok, true);
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].method, "GET");
  assert.ok(
    chamadas[0].url.endsWith(PATH_SNAPSHOT) ||
      chamadas[0].url.includes(PATH_SNAPSHOT)
  );
  assert.equal(chamadas[0].url.includes("/api/ceo/queue"), false);
  assert.equal(chamadas[0].url.includes("/api/ceo/cto"), false);
  assert.equal(chamadas[0].url.includes("/deliberar"), false);
});

test("E3-CA5: falha do snapshot → degradação Erro sem lançar", async () => {
  const fetchImpl = async () => {
    throw new Error("rede caiu");
  };
  const out = await obterSnapshotOrquestracao({ fetchImpl });
  assert.equal(out.ok, false);
  const vistas = vistasDegradacaoSnapshot();
  assert.equal(vistas.length, 6);
  assert.ok(vistas.every((v) => v.estado === "Erro"));
  const html = htmlGrelhaNos(vistas);
  assert.equal(contarCartoesHtml(html), 6);
  assert.equal(checklistProgressividadeHtml(html).ok, true);
});

test("ligarPainelOrquestracao pinta degradação e permite parar", async () => {
  const root = {
    querySelector(sel) {
      if (sel === "#cs-orq-grid") return this.grid;
      if (sel === "#cs-orq-hint") return this.hint;
      return null;
    },
    grid: {
      isConnected: true,
      innerHTML: "",
      addEventListener() {},
      removeEventListener() {},
      contains() {
        return true;
      }
    },
    hint: { textContent: "" }
  };
  let n = 0;
  const parar = ligarPainelOrquestracao(root, {
    intervaloMs: 60_000,
    preferirSse: false,
    obterSnapshot: async () => {
      n += 1;
      return { ok: false, mensagem: "falha" };
    }
  });
  await new Promise((r) => setTimeout(r, 30));
  assert.ok(n >= 1);
  assert.equal(contarCartoesHtml(root.grid.innerHTML), 6);
  assert.match(root.hint.textContent, /Conversa/i);
  parar();
});
