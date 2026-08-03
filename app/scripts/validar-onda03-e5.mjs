/**
 * Validação E5 — Onda 03: fluxo completo (boot → dia → trabalho → fechar → reabrir).
 * Sem novas funcionalidades: só exercita APIs e superfícies já homologadas (D01–D07).
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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
    },
    /** Snapshot serializado — simula “fechar a aplicação” mantendo localStorage. */
    dump() {
      return new Map(map);
    },
    load(snapshot) {
      map.clear();
      for (const [k, v] of snapshot) map.set(k, v);
    }
  };
}

const storage = criarStorage();
globalThis.localStorage = storage;

const catUrl = pathToFileURL(
  path.join(root, "src/catalogoProjetos/index.js")
).href;
const engineUrl = pathToFileURL(
  path.join(root, "src/executiveEngine/index.js")
).href;
const faixaUrl = pathToFileURL(
  path.join(root, "src/modules/centroSituacao/faixaDoDia.js")
).href;
const painelUrl = pathToFileURL(
  path.join(root, "src/modules/centroSituacao/painelDiaAtivo.js")
).href;

const {
  inicializarCatalogo,
  selecionarProjeto,
  obterProjetoAtivo,
  obterDiaExecutivo,
  obterUltimaContinuidade,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  obterPainelExecutivo,
  recarregarCatalogo
} = await import(catUrl);
const { executiveEngine } = await import(engineUrl);
const { htmlFaixaDoDia } = await import(faixaUrl);
const { obterVistaDiaAtivo, htmlRailDiaAtivo } = await import(painelUrl);

const checks = [];
const observacoes = [];

function assert(nome, passou, detalhe) {
  checks.push({ nome, passou: Boolean(passou), detalhe: detalhe || null });
}

function obs(texto) {
  observacoes.push(texto);
}

// ─── 1. Abrir o CEO (boot) ───────────────────────────────────────────
inicializarCatalogo();
executiveEngine.inicializar();
assert("boot: catálogo inicializa", Boolean(obterProjetoAtivo()));

// ─── 2. Restaurar projeto ativo ──────────────────────────────────────
const ativoBoot = obterProjetoAtivo();
assert("boot: projeto ativo restaurado", ativoBoot?.id === "prj-mg2");
assert(
  "boot: nome MG2",
  /motoboy|mg2/i.test(ativoBoot?.nome || "")
);

// ─── 3. Consultar estado (antes de abrir o dia) ──────────────────────
let rEstado = await executiveEngine.executar({
  texto: "Qual é o estado atual?"
});
assert("consultar_estado ok", rEstado.ok === true);
assert(
  "consultar_estado intencao",
  rEstado.intencao?.id === "consultar_estado"
);
assert(
  "D03/estado: dia ainda não aberto ou encerrado",
  /dia ainda não aberto|dia encerrado/i.test(rEstado.mensagem || "")
);

// ─── 4. Abrir o dia (Engine — mesmo domínio da UI) ───────────────────
const rAbrir = await executiveEngine.executar({
  texto: "abrir o dia: Validação E5 — fluxo completo Onda 03"
});
assert("abrir_dia ok", rAbrir.ok === true);
assert("abrir_dia intencao", rAbrir.intencao?.id === "abrir_dia");
let dia = obterDiaExecutivo();
assert("D01 status em_curso", dia?.status === "em_curso");
assert(
  "intenção do dia gravada",
  dia?.intencaoDoDia?.includes("Validação E5")
);

// ─── Consistência D01–D04 após abrir ─────────────────────────────────
let vista = obterVistaDiaAtivo();
let faixa = htmlFaixaDoDia(null);
let rail = htmlRailDiaAtivo(vista);

assert("D01 faixa renderiza", /Fluxo Executivo Diário/i.test(faixa));
assert("D01 badge Em curso", /Em curso/i.test(faixa) && /em_curso/.test(faixa));
assert("D01 CTA Encerrar visível", /data-dia-acao="encerrar"/.test(faixa));
assert(
  "D01 CTA Abrir oculto em curso",
  !/data-dia-acao="abrir"/.test(faixa)
);
assert("D05 painel fechado por padrão", !/data-painel="abrir"/.test(faixa));
assert("D06 painel fechado por padrão", !/data-painel="encerrar"/.test(faixa));

assert("D02 presente no rail", /data-bloco="d02"/.test(rail));
assert("D03 presente no rail", /data-bloco="d03"/.test(rail));
assert("D04 presente no rail", /data-bloco="d04"/.test(rail));
assert(
  "D03 menciona dia em curso",
  /Dia em curso/i.test(vista.resumo || "")
);
assert(
  "D03 menciona foco E5",
  /Validação E5/i.test(vista.resumo || "")
);

const faixaAbrir = htmlFaixaDoDia("abrir");
assert(
  "D05 painel Abrir disponível sob demanda",
  /data-painel="abrir"/.test(faixaAbrir)
);
const faixaEncerrar = htmlFaixaDoDia("encerrar");
assert(
  "D06 painel Encerrar disponível sob demanda",
  /data-painel="encerrar"/.test(faixaEncerrar) &&
    /cs-dia-andou/.test(faixaEncerrar)
);

// ─── 5. Trabalhar normalmente (registos do domínio) ──────────────────
registrarDecisao("E5: ciclo completo é a prova da Onda 03", "e5");
registrarPendencia("Homologar Gate E5 com o CTO");
registrarProximaAcao("Aguardar Gate E5");

vista = obterVistaDiaAtivo();
const painel = obterPainelExecutivo();
assert("trabalho: decisão no projeto", (obterProjetoAtivo()?.decisoes || []).length >= 1);
assert("trabalho: pendência aberta", painel?.metricas?.pendencias >= 1);
assert("trabalho: próxima ação", painel?.metricas?.proximasAcoes >= 1);
assert(
  "D04 lista próxima ação",
  /Aguardar Gate E5/i.test(htmlRailDiaAtivo(vista))
);

rEstado = await executiveEngine.executar({
  texto: "Qual é o estado atual?"
});
assert(
  "consultar_estado durante o dia reflete trabalho",
  /Dia em curso/i.test(rEstado.mensagem || "") &&
    (/pendência|decisão|Gate E5/i.test(rEstado.mensagem || "") ||
      /Validação E5/i.test(rEstado.mensagem || ""))
);

// ─── 6. Encerrar o dia ───────────────────────────────────────────────
const rEncerrar = await executiveEngine.executar({
  texto:
    "encerrar o dia: Validação técnica E5 | Gate E5 pendente | Retomar após homologação"
});
assert("encerrar_dia ok", rEncerrar.ok === true);
assert("encerrar_dia intencao", rEncerrar.intencao?.id === "encerrar_dia");
dia = obterDiaExecutivo();
assert("D01 status encerrado", dia?.status === "encerrado");
assert("D07 continuidade length ≥ 1", (dia?.continuidade || []).length >= 1);

const cont = obterUltimaContinuidade();
assert("D07 oQueAndou", cont?.oQueAndou?.includes("Validação técnica E5"));
assert("D07 oQueFica", cont?.oQueFica?.includes("Gate E5"));
assert(
  "D07 proximoPassoAmanha",
  cont?.proximoPassoAmanha?.includes("Retomar após homologação")
);

faixa = htmlFaixaDoDia(null);
vista = obterVistaDiaAtivo();
rail = htmlRailDiaAtivo(vista);
assert("D01 após encerrar: badge Encerrado", /Encerrado/i.test(faixa));
assert("D01 CTA Abrir de novo", /data-dia-acao="abrir"/.test(faixa));
assert(
  "D01 hint continuidade (próximo passo)",
  /Retomar após homologação/i.test(faixa)
);
assert(
  "D03 após encerrar: dia encerrado",
  /Dia encerrado/i.test(vista.resumo || "")
);
assert(
  "D03 continuidade no resumo",
  /Retomar após homologação/i.test(vista.resumo || "")
);

// ─── 7. Fechar a aplicação (persistência intacta) ────────────────────
const snapshot = storage.dump();
assert("fecho: localStorage não vazio", snapshot.size > 0);

// ─── 8. Reabrir e confirmar continuidade ─────────────────────────────
storage.load(snapshot);
recarregarCatalogo();
executiveEngine.inicializar();

const ativoReopen = obterProjetoAtivo();
assert("reabrir: projeto ativo MG2", ativoReopen?.id === "prj-mg2");

const diaReopen = obterDiaExecutivo();
assert("reabrir: status encerrado", diaReopen?.status === "encerrado");
assert(
  "reabrir: continuidade preservada",
  (diaReopen?.continuidade || []).length >= 1
);

const contReopen = obterUltimaContinuidade();
assert(
  "reabrir: D07 oQueAndou intacto",
  contReopen?.oQueAndou?.includes("Validação técnica E5")
);
assert(
  "reabrir: D07 próximo passo intacto",
  contReopen?.proximoPassoAmanha?.includes("Retomar após homologação")
);

vista = obterVistaDiaAtivo();
faixa = htmlFaixaDoDia(null);
assert(
  "reabrir UX: faixa mostra continuidade",
  /Última continuidade/i.test(faixa) &&
    /Retomar após homologação/i.test(faixa)
);
assert(
  "reabrir UX: D03 guia retomada",
  /Dia encerrado/i.test(vista.resumo || "") &&
    /Retomar após homologação/i.test(vista.resumo || "")
);

const rEstadoReopen = await executiveEngine.executar({
  texto: "Qual é o estado atual?"
});
assert(
  "reabrir: consultar_estado menciona continuidade",
  /Dia encerrado/i.test(rEstadoReopen.mensagem || "") &&
    /Retomar após homologação/i.test(rEstadoReopen.mensagem || "")
);

// Trabalho normal preservado no workspace
assert(
  "reabrir: decisões preservadas",
  (ativoReopen?.decisoes || []).some((d) =>
    /ciclo completo/i.test(d.texto || "")
  )
);

// Pré-preenche intenção no D05 com próximo passo (experiência de retomada)
const d05 = htmlFaixaDoDia("abrir");
assert(
  "D05 pré-preenche intenção com continuidade",
  /Retomar após homologação/i.test(d05)
);

// ─── Observações de experiência (não são falhas de E5) ───────────────
obs(
  "Chips Abrir/Encerrar usam data-dia-acao (painéis D05/D06), não data-cmd — fluxo visual confirmado intacto; chat textual usa intenções Engine (E4)."
);
obs(
  "Histórico de chat da conversa não faz parte do modelo diaExecutivo (arquitetura Onda 03); continuidade operacional é D07, não o log de mensagens."
);
obs(
  "Caminho LLM (capacidade Ia) permanece sujeito a falhas de rede/TLS externas — fora do escopo da Onda 03; o fluxo diário validado é determinístico."
);

// ─── Relatório ───────────────────────────────────────────────────────
let ok = true;
for (const c of checks) {
  console.log(`${c.passou ? "OK" : "FAIL"} — ${c.nome}`);
  if (!c.passou) ok = false;
}

console.log("\n--- Observações de experiência ---");
for (const o of observacoes) console.log(`OBS — ${o}`);

console.log(
  `\nResumo: ${checks.filter((c) => c.passou).length}/${checks.length} checks`
);

if (!ok) {
  console.error("Onda 03 E5 FALHOU");
  process.exit(1);
}

console.log("Onda 03 E5: fluxo completo VALIDADO");
