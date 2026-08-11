/**
 * DESP-010 — Observação de missão executiva completa (headless).
 * Mesma API que a Conversa: executiveEngine.executar + historico acumulado.
 * Não reinicia sessão entre turnos. Só observa — não altera comportamento.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

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
    }
  };
}

globalThis.localStorage = criarStorage();

const { inicializarCatalogo, selecionarProjeto } = await import(
  pathToFileURL(path.join(root, "src/catalogoProjetos/index.js")).href
);
const { executiveEngine } = await import(
  pathToFileURL(path.join(root, "src/executiveEngine/index.js")).href
);

inicializarCatalogo();
selecionarProjeto("prj-mg2");
executiveEngine.inicializar();

/** Missão MG2 — abertura → decisão → ok → shift → fecho */
const turns = [
  "abrir o dia: Missão MG2 — fechar pagamento nesta sprint; outdoor fica atrás",
  "Adiar outdoor e focar pagamento. Decide e conduz a missão.",
  "ok",
  "Agora quero falar da arte do outdoor",
  "encerrar o dia"
];

const historico = [];
const registo = [];

function avaliarPercepcao(turno, textoUser, msg, dados) {
  const t = String(msg || "");
  const cn = dados?.conversacaoNatural || {};
  const ctx = cn.contextoImediato || {};
  const flags = {
    temObjectivo: /objectivo|missão|MG2|pagamento|outdoor/i.test(t),
    temPergunta: /\?/.test(t),
    muletaPassiva: /quando quiser|se quiser|estou à disposição/i.test(t),
    templateSobre: /Sobre:|Porquê:|Aprovo:/i.test(t),
    modoAdaptacao: cn.meta?.modoAdaptacao || cn.modoAdaptacao || null,
    missaoActiva: ctx.missaoActiva === true,
    camadas: cn.camadas ? Object.keys(cn.camadas) : [],
    tipoTurno: cn.tipoTurno || null,
    comprimento: t.length
  };

  /** Heurísticas de percepção (evidência objectiva, não opinião). */
  const sintomas = [];
  if (flags.muletaPassiva) sintomas.push("muleta_passiva");
  if (flags.templateSobre) sintomas.push("template_speaker");
  if (
    /adi(ar|amos).*focar|focar.*adi(ar|amos)/i.test(textoUser) &&
    /Seguimos no|passamos ao|Refere-te/i.test(t)
  ) {
    sintomas.push("decisao_clara_tratada_como_ambiguidade");
  }
  if (turno === 3 && flags.missaoActiva && !flags.temPergunta) {
    sintomas.push("ok_mid_missao_sem_iniciativa");
  }
  if (/env`|CEO_LLM_API_KEY|\.env\.example/i.test(t)) {
    sintomas.push("vazamento_tecnico");
  }
  if (turno === 3 && flags.comprimento > 900) {
    sintomas.push("ok_mid_missao_prolixo");
  }
  if (turno === 4 && !/objectivo|missão|pagamento|MG2/i.test(t)) {
    sintomas.push("shift_perdeu_objectivo");
  }
  if (turno === 5 && !/próxima|pendência|encerro|objectivo/i.test(t)) {
    sintomas.push("fecho_sem_continuidade");
  }
  if (turno >= 2 && flags.comprimento < 40 && !flags.temPergunta) {
    sintomas.push("resposta_curta_sem_condução");
  }

  return { flags, sintomas };
}

console.log("═══ DESP-010 — Missão de observação MG2 ═══\n");

for (let i = 0; i < turns.length; i++) {
  const texto = turns[i];
  const out = await executiveEngine.executar({
    texto,
    historico: [...historico]
  });
  const msg = String(out.mensagem || "");
  const dados = out.dados || {};
  const aval = avaliarPercepcao(i + 1, texto, msg, dados);

  historico.push({ papel: "usuario", texto });
  historico.push({ papel: "ceo", texto: msg });

  const entrada = {
    turno: i + 1,
    usuario: texto,
    ceo: msg,
    ok: out.ok,
    modo: out.modo,
    destino: dados.encaminhamento?.destino || null,
    refino: dados.refinoEic
      ? {
          proximaAcao: dados.refinoEic.proximaAcao,
          pendencias: dados.refinoEic.pendencias,
          decisoesTomadas: dados.refinoEic.decisoesTomadas
        }
      : null,
    ...aval
  };
  registo.push(entrada);

  console.log(`── Turno ${i + 1} ──`);
  console.log(`USER: ${texto}`);
  console.log(`CEO:  ${msg.slice(0, 500)}${msg.length > 500 ? "…" : ""}`);
  console.log(
    `meta: tipo=${aval.flags.tipoTurno} modo=${aval.flags.modoAdaptacao} missao=${aval.flags.missaoActiva} len=${aval.flags.comprimento}`
  );
  if (aval.sintomas.length) {
    console.log(`⚠ sintomas: ${aval.sintomas.join(", ")}`);
  } else {
    console.log("✓ sem sintomas heurísticos neste turno");
  }
  console.log("");
}

const sintomasAll = registo.flatMap((r) =>
  r.sintomas.map((s) => ({ turno: r.turno, s }))
);

const outPath = path.join(root, "..", "docs", "learning", "desp-010-observacao-missao.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      quando: new Date().toISOString(),
      missao: "MG2 pagamento vs outdoor",
      turns,
      registo: registo.map((r) => ({
        turno: r.turno,
        usuario: r.usuario,
        ceo: r.ceo,
        modo: r.modo,
        destino: r.destino,
        flags: r.flags,
        sintomas: r.sintomas,
        refino: r.refino
      })),
      sintomas: sintomasAll
    },
    null,
    2
  ),
  "utf8"
);

console.log("═══ Síntese ═══");
console.log(`Turnos: ${registo.length}`);
console.log(`Sintomas: ${sintomasAll.length ? sintomasAll.map((x) => `T${x.turno}:${x.s}`).join("; ") : "(nenhum)"}`);
console.log(`Registo: ${outPath}`);
