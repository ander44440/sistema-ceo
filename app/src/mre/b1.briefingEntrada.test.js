/**
 * Briefing como projecção subordinada (IMP-070 B1) + regressões DEC-010/DESP-009.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { montarEntradaMre } from "./integracaoNucleo.js";
import {
  obterFactosBriefingProjeto,
  obterProjecaoBriefing
} from "../executiveEngine/briefingsProjeto.js";
import { reiniciarAcervoParaTestes } from "../camadaConhecimento/fonteOficial.js";

test("projecção: obterFactosBriefingProjeto devolve factos MG2", () => {
  const factos = obterFactosBriefingProjeto({
    id: "prj-mg2",
    nome: "Motoboy Game 2"
  });
  assert.ok(factos.length >= 5);
  const blob = factos.join(" ");
  assert.match(blob, /WorldLab2/i);
  assert.match(blob, /140\s*m|performance|perf/i);
  assert.match(blob, /outdoor/i);
});

test("IMP-070 B1: montarEntradaMre — lacuna oficial; briefing só em projecção", () => {
  reiniciarAcervoParaTestes();
  const entrada = montarEntradaMre({
    instrucao: "O que sabes sobre este projeto?",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ proximoPasso: "Validar Sprint 1", pendencias: [] }),
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.equal(entrada.coaId, "prj-mg2");
  assert.ok(entrada.factosOficiais.some((f) => /LACUNA EXPLÍCITA/i.test(f)));
  assert.ok(!entrada.factosOficiais.some((f) => /WorldLab2/i.test(f)));
  assert.match(entrada.factosOficiais.join("\n"), /Validar Sprint 1/);
  assert.equal(entrada.projecaoSubordinada?.naoEFonteOficial, true);
  assert.ok(entrada.snapshotPainel?.resumo);
  assert.match(
    String(entrada.snapshotPainel.resumo),
    /Projecção subordinada|Validar Sprint 1/i
  );
  assert.match(entrada.mensagem, /Projecção subordinada|NÃO é Fonte Oficial/i);
  const p = obterProjecaoBriefing({ id: "prj-mg2" });
  assert.match(p.textoRotulado, /PROJEÇÃO SUBORDINADA/i);
});

test("B1 legado: sem COA conhecido — sem factos de briefing na projecção", () => {
  const entrada = montarEntradaMre({
    instrucao: "olá",
    coaAtivo: { id: "outro", nome: "Outro" },
    memoria: () => null
  });
  assert.equal(entrada.projecaoSubordinada, null);
  assert.ok(!entrada.factosOficiais.some((f) => /WorldLab2/i.test(f)));
});

test("DEC-010: montarEntradaMre inclui fio recente da conversa", () => {
  const entrada = montarEntradaMre({
    instrucao: "e isso?",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ pendencias: [] }),
    historico: [
      { papel: "usuario", texto: "Priorizar pagamento" },
      { papel: "ceo", texto: "Aprovo foco em pagamento." },
      { papel: "usuario", texto: "e isso?" }
    ]
  });
  assert.match(entrada.mensagem, /Fio recente da conversa/i);
  assert.match(entrada.mensagem, /Priorizar pagamento/);
  assert.match(entrada.mensagem, /Utilizador:|CEO:/);
});

test("ciclo Decidir: exploração ≠ diagnóstico de factos", async () => {
  const { mensagemEhExploratoria, mensagemPedeDiagnosticoFactos } = await import(
    "./integracaoNucleo.js"
  );
  assert.equal(
    mensagemEhExploratoria("como devemos priorizar outdoor vs pagamento?"),
    true
  );
  assert.equal(mensagemEhExploratoria("aprova adiar o outdoor"), false);
  assert.equal(
    mensagemPedeDiagnosticoFactos("o que sabes sobre este projeto?"),
    true
  );
  assert.equal(
    mensagemPedeDiagnosticoFactos("como devemos organizar a sprint?"),
    false
  );
});

test("DEC-010: montarEntradaMre ancora Memória de Trabalho EIC", () => {
  const entrada = montarEntradaMre({
    instrucao: "continuar",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ pendencias: [] }),
    lastroConsciencia: {
      temContextoRelevante: true,
      factosOficiais: ["Tópico activo: pagamento"],
      memoriaTrabalhoExecutiva: {
        objectivoAtivo: "fechar integração",
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoAtual: "fechar integração",
          entregaCorrente: "pagamento"
        },
        restricoesAtivas: ["não alterar arquitectura"],
        proximaAcao: "validar Sprint 1"
      }
    }
  });
  assert.match(entrada.mensagem, /Objectivo estratégico/i);
  assert.match(entrada.mensagem, /entrega corrente|pagamento/i);
  assert.match(entrada.mensagem, /Restrições activas/i);
});

test("DESP-009: montarEntradaMre leva decisão, pendência e em execução ao MRE", () => {
  const entrada = montarEntradaMre({
    instrucao: "ok",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ pendencias: [] }),
    lastroConsciencia: {
      temContextoRelevante: true,
      factosOficiais: [],
      memoriaTrabalhoExecutiva: {
        objectivoAtivo: "Usar CEO no MG2",
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoAtual: "fechar pagamento",
          entregaCorrente: "integração"
        },
        decisoesTomadas: ["Adiar outdoor; focar pagamento"],
        pendencias: ["Validar Sprint 1"],
        proximaAcao: "Validar Sprint 1",
        restricoesAtivas: [],
        estadoConversa: {
          emExecucao: "integração pagamento",
          pendentes: ["Validar Sprint 1"],
          concluidos: [],
          bloqueio: null
        }
      }
    }
  });
  assert.match(entrada.mensagem, /Decisão em vigor|Adiar outdoor/i);
  assert.match(entrada.mensagem, /Pendências abertas|Sprint 1/i);
  assert.match(entrada.mensagem, /Em execução|integração/i);
  assert.match(entrada.mensagem, /conduzir a missão|hierarquia de objectivos/i);
});
