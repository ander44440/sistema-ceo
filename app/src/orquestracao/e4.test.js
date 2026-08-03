/**
 * Testes expansão de detalhe — IMP-055 E4.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { NOS_V1, montarNo } from "./dominio.js";
import {
  alternarIdExpandido,
  extrairLinhasDetalhe,
  CAMPOS_DETALHE_ALLOWLIST
} from "./detalhe.js";
import {
  htmlCartaoNoVistaPrincipal,
  htmlGrelhaNos,
  checklistProgressividadeHtml,
  contarCartoesHtml,
  contarDetalhesExpandidosHtml,
  htmlSemBlocosDetalhe
} from "./ui.js";

test("E4-CA1: expansão mostra detalhe; colapso remove", () => {
  const no = montarNo("agent", "Erro", {
    detalhe: { jobId: "JOB-000042", erro: "timeout" },
    origemSinal: "stub-e2",
    atualizadoEm: "2026-08-01T12:00:00.000Z"
  });
  const fechado = htmlCartaoNoVistaPrincipal(no, { expandido: false });
  assert.equal(contarDetalhesExpandidosHtml(fechado), 0);
  assert.equal(fechado.includes("JOB-000042"), false);
  assert.match(fechado, /aria-expanded="false"/);

  const aberto = htmlCartaoNoVistaPrincipal(no, { expandido: true });
  assert.equal(contarDetalhesExpandidosHtml(aberto), 1);
  assert.match(aberto, /JOB-000042/);
  assert.match(aberto, /timeout/);
  assert.match(aberto, /aria-expanded="true"/);
  assert.match(aberto, /is-expandido/);
});

test("E4-CA1: só um nó expandido na grelha", () => {
  const nos = NOS_V1.map((id) =>
    montarNo(id, "Ocioso", {
      detalhe: { jobId: `JOB-${id}` },
      origemSinal: "stub-e2"
    })
  );
  const html = htmlGrelhaNos(nos, { idExpandido: "cto" });
  assert.equal(contarCartoesHtml(html), 6);
  assert.equal(contarDetalhesExpandidosHtml(html), 1);
  assert.match(html, /JOB-cto/);
  assert.equal(html.includes("JOB-ceo"), false);
  assert.equal(html.includes("JOB-agent"), false);
});

test("E4-CA2: vista principal permanece só com três campos (mesmo expandido)", () => {
  const no = montarNo("backend", "Disponivel", {
    detalhe: { jobId: "J-9", apiKey: "sk-secret-x" },
    origemSinal: "health"
  });
  const html = htmlCartaoNoVistaPrincipal(no, { expandido: true });
  const check = checklistProgressividadeHtml(html);
  assert.equal(check.ok, true, check.falhas.join("; "));
  const principal = htmlSemBlocosDetalhe(html);
  assert.equal(principal.includes("sk-secret"), false);
  assert.equal(principal.includes("origemSinal"), false);
  assert.equal(principal.includes("J-9"), false);
  assert.match(principal, /cs-orq-principal/);
  assert.match(html, /data-orq-campos="nome,estado,descricaoResumida"/);
});

test("E4 allowlist: não vaza secrets; campos permitidos ok", () => {
  assert.ok(CAMPOS_DETALHE_ALLOWLIST.includes("jobId"));
  const linhas = extrairLinhasDetalhe(
    montarNo("dispatcher", "Erro", {
      detalhe: {
        jobId: "JOB-1",
        apiKey: "sk-abc",
        token: "x",
        motivo: "watcher ausente"
      },
      origemSinal: "agregador"
    })
  );
  const texto = JSON.stringify(linhas);
  assert.equal(texto.includes("sk-abc"), false);
  assert.equal(texto.includes("\"token\""), false);
  assert.ok(linhas.some((l) => l.rotulo === "Job" && l.valor === "JOB-1"));
  assert.ok(linhas.some((l) => l.rotulo === "Motivo"));
  assert.ok(linhas.some((l) => l.rotulo === "Origem"));
});

test("E4-CA3: cartão sem href / sem navegação forçada", () => {
  const html = htmlCartaoNoVistaPrincipal(montarNo("ceo", "Disponivel"), {
    expandido: true
  });
  assert.equal(/<a\b/i.test(html), false);
  assert.equal(/href=/i.test(html), false);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
});

test("E4 alternarIdExpandido: toggle e exclusividade", () => {
  assert.equal(alternarIdExpandido(null, "ceo"), "ceo");
  assert.equal(alternarIdExpandido("ceo", "ceo"), null);
  assert.equal(alternarIdExpandido("ceo", "cto"), "cto");
});
