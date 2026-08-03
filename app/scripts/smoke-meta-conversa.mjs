import {
  validarContextoAtivo
} from "../src/classificadorIntencao/validadorContextoAtivo.js";
import {
  classificar,
  ehAutoexplicacaoInstitucionalE23,
  normalizarTexto
} from "../src/classificadorIntencao/regras.js";
import { criarTopico } from "../src/classificadorIntencao/gestorTopicos.js";
import { executiveEngine } from "../src/executiveEngine/index.js";
import {
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao
} from "../src/classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../src/classificadorIntencao/objectivoSessao.js";
import { resetStoreContinuidadePadrao } from "../src/continuidadeGate/integracaoConversa.js";

const top = criarTopico("Motoboy Game 2", "coa", "2026-08-03T18:00:00.000Z");
const msgs = [
  "Você consegue perceber quando eu estou apenas refletindo e quando realmente espero uma decisão sua?",
  "Se eu mudar completamente de assunto no meio da conversa, o que você faz?",
  "Você prefere que eu explique tudo ou consegue descobrir parte do contexto sozinho?",
  'Se eu disser apenas "vamos continuar", você sabe exatamente do que estou falando?',
  "Em que momento você decide fazer uma pergunta em vez de responder diretamente?",
  "Como você decide se uma pergunta é sobre um projeto ou apenas uma curiosidade?"
];

for (const m of msgs) {
  const t = normalizarTexto(m);
  const v = validarContextoAtivo({
    mensagem: m,
    topicoActivo: top,
    frenteActiva: true
  });
  const c = classificar(m, {});
  console.log("---", m.slice(0, 65));
  console.log(
    "e23",
    ehAutoexplicacaoInstitucionalE23(t),
    "vca",
    v.veredicto,
    "cls",
    c.classe,
    c.destino,
    c.confianca,
    "clar",
    Boolean(c.precisaClarificacao)
  );
}

console.log("\n=== EE ===");
for (const m of msgs) {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [] });
  const out = await executiveEngine.executar({ texto: m });
  const bad =
    /Mantemos o foco|Continuidade:|Preciso de um pouco mais de clareza/i.test(
      out.mensagem
    );
  console.log(
    m.slice(0, 45),
    "=>",
    out.dados?.validacaoContexto?.veredicto,
    out.dados?.classificacao?.classe,
    out.dados?.encaminhamento?.destino,
    bad ? "BAD" : "ok",
    String(out.mensagem).replace(/\s+/g, " ").slice(0, 100)
  );
}
