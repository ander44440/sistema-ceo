/**
 * Refino interno EIC — evidências objectivas (Cursor 1).
 */
import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  REFINO_EIC_ATIVO,
  definirRefinoEicAtivo,
  resetMemoriaTrabalhoExecutiva,
  actualizarMemoriaTrabalhoExecutiva,
  obterMemoriaTrabalhoExecutiva,
  normalizarTerminologia,
  extrairRestricoesAtivas,
  montarHierarquiaObjectivos,
  montarCicloExecutivo,
  montarAnaliseTecnica,
  mensagemPedeAnaliseTecnica,
  factosLastroRefinoEic,
  formatarMemoriaTrabalhoParaContexto,
  metadadoRefinoEicParaDados,
  memoriaTrabalhoVazia,
  TERMINOLOGIA_VIGENTE
} from "./refinoEic.js";
import { construirContextoSessao } from "./contextoSessao.js";

beforeEach(() => {
  definirRefinoEicAtivo(true);
  resetMemoriaTrabalhoExecutiva();
});

describe("Refino EIC — terminologia (6)", () => {
  test("normaliza formas legadas para nomenclatura vigente", () => {
    assert.equal(
      normalizarTerminologia("objetivo ativo e proxima ação"),
      "objectivo activo e próxima acção"
    );
    assert.equal(normalizarTerminologia("chatbot"), "CEO");
    assert.ok(TERMINOLOGIA_VIGENTE.objectivoAtivo);
    assert.ok(TERMINOLOGIA_VIGENTE.classificadorIntencao);
  });
});

describe("Refino EIC — Memória de Trabalho Executiva (1)", () => {
  test("mantém objectivo, restrições, decisões, pendências e próxima acção", () => {
    const m = actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem:
        "O objectivo é fechar a paridade. Não pode alterar arquitectura. Sem tocar na UI.",
      classe: "conversa_projeto",
      destino: "nucleo_mre",
      objetivoConversacional: {
        id: "obj_paridade",
        enunciado: "fechar a paridade",
        origem: "usuario",
        actualizadoEm: "2026-08-06T00:00:00.000Z"
      },
      topicoActivo: { id: "t1", ancora: "paridade-producao" },
      coa: { id: "mg2", nome: "Motoboy Game 2" },
      memoriaExecutiva: {
        decisoes: [{ texto: "Manter flagNcs off" }],
        pendencias: [{ texto: "Homologar VAL-011", status: "aberta" }],
        proximasAcoes: [{ texto: "Correr smoke oral" }]
      },
      veredictoVca: "pertence"
    });

    assert.ok(m);
    assert.match(String(m.objectivoAtivo), /paridade/i);
    assert.ok(m.restricoesAtivas.length >= 1);
    assert.ok(m.decisoesTomadas.some((d) => /flagNcs/i.test(d)));
    assert.ok(m.pendencias.some((p) => /VAL-011/i.test(p)));
    assert.match(String(m.proximaAcao), /smoke/i);

    const snap = obterMemoriaTrabalhoExecutiva();
    assert.equal(snap.objectivoAtivo, m.objectivoAtivo);
  });

  test("não é histórico completo — listas limitadas", () => {
    const decisoes = Array.from({ length: 12 }, (_, i) => ({
      texto: `Decisão ${i + 1}`
    }));
    const m = actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "continuar",
      memoriaExecutiva: {
        decisoes,
        pendencias: [],
        proximasAcoes: []
      }
    });
    assert.ok(m.decisoesTomadas.length <= 5);
  });
});

describe("Refino EIC — Ciclo Executivo (2)", () => {
  test("padroniza objectivo→contexto→restrições→alternativas→decisão→próxima acção", () => {
    const base = memoriaTrabalhoVazia();
    base.hierarquia = {
      objectivoEstrategico: "MG2 diário",
      objectivoAtual: "fechar F1",
      entregaCorrente: "smoke"
    };
    base.restricoesAtivas = ["não alterar arquitectura"];
    base.proximaAcao = "validar alias";

    const ciclo = montarCicloExecutivo(
      {
        mensagem: "alternativas: redeploy ou smoke local vs alias",
        classe: "conversa_projeto",
        destino: "nucleo_mre",
        coa: { id: "mg2", nome: "MG2" },
        veredictoVca: "pertence"
      },
      base
    );

    assert.equal(ciclo.objectivo, "fechar F1");
    assert.match(String(ciclo.contexto), /COA/);
    assert.ok(ciclo.restricoes.length >= 1);
    assert.ok(ciclo.alternativas.length >= 1);
    assert.equal(ciclo.proximaAcao, "validar alias");
  });
});

describe("Refino EIC — Hierarquia de Objectivos (3)", () => {
  test("preserva objectivo estratégico quando muda a entrega corrente", () => {
    const prev = memoriaTrabalhoVazia();
    prev.hierarquia = {
      objectivoEstrategico: "Usar CEO no MG2",
      objectivoAtual: "Paridade F1",
      entregaCorrente: "bundle"
    };

    const h1 = montarHierarquiaObjectivos(
      {
        objetivoConversacional: {
          enunciado: "Paridade F1",
          origem: "usuario",
          id: "o1",
          actualizadoEm: "t"
        },
        topicoActivo: { ancora: "stt" },
        coa: { id: "mg2", nome: "Motoboy Game 2" },
        memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
      },
      prev
    );

    assert.equal(h1.objectivoEstrategico, "Usar CEO no MG2");
    assert.equal(h1.objectivoAtual, "Paridade F1");
    assert.equal(h1.entregaCorrente, "stt");
  });
});

describe("Refino EIC — Evidência → Diagnóstico → Ajuste (4)", () => {
  test("estrutura análise técnica antes da conclusão", () => {
    assert.equal(
      mensagemPedeAnaliseTecnica("qual o diagnóstico da falha de STT?"),
      true
    );
    const base = memoriaTrabalhoVazia();
    base.hierarquia = {
      objectivoEstrategico: "MG2",
      objectivoAtual: "voz",
      entregaCorrente: "stt"
    };
    const analise = montarAnaliseTecnica(
      {
        mensagem: "diagnóstico: por que o STT falhou no smoke?",
        classe: "conversa_projeto",
        destino: "nucleo_mre",
        veredictoVca: "pertence",
        gatePendente: false
      },
      base
    );
    assert.ok(analise);
    assert.ok(analise.evidencias.length >= 1);
    assert.ok(analise.diagnostico);
    assert.ok(analise.ajuste);
  });

  test("Gate pendente → diagnóstico de bloqueio", () => {
    const base = memoriaTrabalhoVazia();
    const analise = montarAnaliseTecnica(
      {
        mensagem: "analisar risco do outdoor",
        gatePendente: true,
        destino: "nucleo_mre"
      },
      base
    );
    assert.ok(analise);
    assert.match(analise.diagnostico, /Gate/i);
    assert.match(analise.ajuste, /Gate/i);
  });
});

describe("Refino EIC — Estado + Encerramento (5 e 7)", () => {
  test("estado executivo identifica execução, pendências e bloqueio", () => {
    const m = actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "continuar o smoke",
      objetivoConversacional: {
        id: "o",
        enunciado: "smoke oral",
        origem: "usuario",
        actualizadoEm: "t"
      },
      gatePendente: true,
      memoriaExecutiva: {
        decisoes: [{ texto: "Abrir F1" }],
        pendencias: [{ texto: "Bloqueio de rede no alias", status: "aberta" }],
        proximasAcoes: [{ texto: "Repetir VAL-011" }]
      }
    });
    assert.ok(m.estadoConversa.emExecucao);
    assert.ok(m.estadoConversa.pendentes.length >= 1);
    assert.match(String(m.estadoConversa.bloqueio), /Gate/i);
  });

  test("pós-turno regista critério de encerramento", () => {
    actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "executar outdoor",
      destino: "motor_execucao",
      objetivoConversacional: {
        id: "o",
        enunciado: "outdoor",
        origem: "usuario",
        actualizadoEm: "t"
      },
      memoriaExecutiva: {
        decisoes: [],
        pendencias: [{ texto: "arte final", status: "aberta" }],
        proximasAcoes: [{ texto: "publicar arte" }]
      }
    });

    const pos = actualizarMemoriaTrabalhoExecutiva({
      fase: "pos",
      mensagem: "executar outdoor",
      destino: "motor_execucao",
      memoriaExecutiva: {
        decisoes: [],
        pendencias: [{ texto: "arte final", status: "aberta" }],
        proximasAcoes: [{ texto: "publicar arte" }]
      },
      resposta: {
        ok: true,
        mensagem: "Job concluído e homologado.",
        dados: { motor: { encerrado: true, resumoEncerramento: "Outdoor feito" } }
      }
    });

    assert.ok(pos.encerramento);
    assert.equal(pos.encerramento.actividadeConcluida, true);
    assert.ok(pos.encerramento.conclusao);
    assert.ok(Array.isArray(pos.encerramento.dependencias));
    assert.equal(typeof pos.encerramento.necessitaNovoDespacho, "boolean");
  });
});

describe("Refino EIC — integração lastro / contexto (sem contrato UI)", () => {
  test("factosLastro e metadado não vazios; rollback desliga", () => {
    const m = actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "Não pode alterar governança. Objectivo é calibrar EIC.",
      objetivoConversacional: {
        id: "o",
        enunciado: "calibrar EIC",
        origem: "usuario",
        actualizadoEm: "t"
      },
      coa: { id: "ceo", nome: "Sistema CEO" },
      memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
    });
    const factos = factosLastroRefinoEic(m);
    assert.ok(factos.some((f) => /Objectivo/i.test(f)));
    const meta = metadadoRefinoEicParaDados(m);
    assert.ok(meta.refinoEic);
    assert.equal(meta.refinoEic.cicloActivo, true);

    definirRefinoEicAtivo(false);
    assert.deepEqual(factosLastroRefinoEic(m), []);
    assert.deepEqual(metadadoRefinoEicParaDados(m), {});
  });

  test("contexto de sessão inclui Memória de Trabalho quando activa", () => {
    actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "foco na paridade",
      objetivoConversacional: {
        id: "o",
        enunciado: "paridade produção",
        origem: "usuario",
        actualizadoEm: "t"
      },
      memoriaExecutiva: {
        decisoes: [],
        pendencias: [],
        proximasAcoes: [],
        projetoAtivo: null,
        projetosAtivos: [],
        ultimasAcoes: []
      }
    });
    const bloco = formatarMemoriaTrabalhoParaContexto();
    assert.match(bloco, /MEMÓRIA DE TRABALHO EXECUTIVA/);
    assert.match(bloco, /Ciclo executivo/);

    const ctx = construirContextoSessao({
      memoria: {
        decisoes: [],
        pendencias: [],
        proximasAcoes: [],
        projetoAtivo: null,
        projetosAtivos: [],
        ultimasAcoes: []
      },
      coa: null,
      intencao: { id: "x", capacidade: "ia" }
    });
    assert.match(ctx, /MEMÓRIA DE TRABALHO EXECUTIVA/);
  });

  test("extrairRestricoesAtivas captura proibições do mandato", () => {
    const r = extrairRestricoesAtivas(
      "É expressamente proibido criar novas funcionalidades. Não pode alterar arquitectura."
    );
    assert.ok(r.length >= 1);
  });

  test("flag REFINO_EIC_ATIVO existe e default true", () => {
    assert.equal(REFINO_EIC_ATIVO, true);
  });

  test("DESP-009: factosLastro inclui decisão, pendência e em execução", () => {
    const m = actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "continuar missão",
      objetivoConversacional: {
        id: "o",
        enunciado: "Usar CEO no MG2",
        origem: "usuario",
        actualizadoEm: "t"
      },
      memoriaExecutiva: {
        decisoes: [{ texto: "Adiar outdoor; focar pagamento" }],
        pendencias: [{ texto: "Validar Sprint 1", status: "aberta" }],
        proximasAcoes: [{ texto: "Validar Sprint 1" }]
      }
    });
    // Forçar estado em execução (já pode existir via montarEstado)
    m.estadoConversa = {
      ...(m.estadoConversa || {}),
      emExecucao: "integração pagamento"
    };
    const factos = factosLastroRefinoEic(m);
    assert.ok(factos.some((f) => /Decisão em vigor|outdoor|pagamento/i.test(f)));
    assert.ok(factos.some((f) => /Pendência|Sprint 1/i.test(f)));
    assert.ok(factos.some((f) => /Em execução|integração/i.test(f)));
  });

  test("DESP-009: pós-turno colhe próxima acção e decisão do parecer", () => {
    actualizarMemoriaTrabalhoExecutiva({
      fase: "pre",
      mensagem: "focar pagamento",
      objetivoConversacional: {
        id: "o",
        enunciado: "Usar CEO no MG2",
        origem: "usuario",
        actualizadoEm: "t"
      },
      memoriaExecutiva: {
        decisoes: [],
        pendencias: [],
        proximasAcoes: [{ texto: "Avaliar outdoor" }]
      }
    });
    const pos = actualizarMemoriaTrabalhoExecutiva({
      fase: "pos",
      mensagem: "focar pagamento",
      resposta: {
        ok: true,
        mensagem: "Priorizo pagamento.",
        dados: {
          parecer: {
            decisaoExecutiva: {
              estado: "aprovar",
              recomendacao: "Adiar outdoor; focar pagamento"
            },
            acao: { descricao: "Validar Sprint 1 de perf" }
          }
        }
      }
    });
    assert.match(String(pos.proximaAcao), /Sprint 1/i);
    assert.ok(
      pos.decisoesTomadas.some((d) => /Adiar outdoor|pagamento/i.test(d))
    );
  });
});
