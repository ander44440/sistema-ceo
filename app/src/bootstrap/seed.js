/**
 * Seed demonstrativo — MG2 + Resumo Executivo simulado.
 * Não altera a baseline docs/cap-03; só popula storage na 1ª execução (ou se vazio).
 */
const SEED_FLAG = "ceo.app.seed.demo.v1";
const NOME_MG2 = "Motoboy Game 2";

export function garantirSeedDemo(runtime) {
  const { catalogo, sessao, politica, storage } = runtime;
  let projetos = catalogo.listarProjetos();

  if (projetos.length === 0) {
    catalogo.criarProjeto({
      nome: NOME_MG2,
      objetivoPrincipal:
        "Entregar a versão jogável do Motoboy Game 2 com ciclo diário governado pelo CEO.",
      descricao:
        "Primeiro contexto operacional do patrocinador (ADR-015). Dados iniciais simulados.",
      statusCicloVida: "ativo"
    });
    projetos = catalogo.listarProjetos();
  }

  sessao.bootstrap();

  const ativo = sessao.obterAtivo();
  if (ativo.status !== "ativo") {
    const mg2 = projetos.find(
      (p) => p.nome === NOME_MG2 || String(p.rotuloLogico || "").toLowerCase() === "mg2"
    );
    if (mg2) {
      try {
        sessao.trocar(mg2.coaId);
      } catch (_e) {
        /* bootstrap já tentou */
      }
    }
  }

  if (storage.getItem(SEED_FLAG) === "1") {
    return { seeded: false, reason: "ja_aplicado" };
  }

  const agora = sessao.obterAtivo();
  if (agora.status !== "ativo") {
    return { seeded: false, reason: "sem_coa" };
  }

  const existentes = politica.listar({ tipo: "estadoDia" });
  if (existentes.length === 0) {
    politica.gravar({
      tipo: "estadoDia",
      titulo: "Sprint de fundação do posto de comando",
      conteudo: {
        resumo: "Arquitetura F1–F5 homologada; foco mudou para construção navegável.",
        proximoPasso: "Usar o CEO diariamente no desenvolvimento do MG2 e registar decisões."
      }
    });
    politica.gravar({
      tipo: "pendencia",
      titulo: "Conectar conversa a capacidade real (LLM) via ciclo ADR-006",
      conteudo: { prioridade: "media" }
    });
    politica.gravar({
      tipo: "decisao",
      titulo: "Layout permanente da app em app/ (não protótipo descartável)",
      conteudo: { vigencia: "aprovada", proximoPasso: "Evoluir módulos capacidade a capacidade" }
    });
    politica.gravar({
      tipo: "conhecimento",
      titulo: "Conversa é a interface principal (REQ-041 / PUX-12)",
      conteudo: { fonte: "F5 / CAP-03" }
    });
    politica.gravar({
      tipo: "atividade",
      titulo: "Abrir posto de comando e validar navegação Painel → Projetos",
      conteudo: { estado: "em_curso" }
    });
  }

  storage.setItem(SEED_FLAG, "1");
  return { seeded: true, reason: "demo_mg2" };
}
