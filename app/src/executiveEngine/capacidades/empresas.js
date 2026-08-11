/**
 * Capacidade: Empresas — troca explícita de empresa activa (FASE 3).
 * WRITE apenas via definirEmpresaAtiva (fachada FASE 2); sem I/O directo ao catálogo.
 */
import {
  citacaoCurta,
  montarResposta,
  resumirContexto,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import {
  definirEmpresaAtiva,
  obterCoaAtivo,
  obterEmpresaAtiva
} from "../coaSessao.js";
import {
  detectarAncoraEmpresa,
  temAncoraExplicitaProjeto
} from "../../classificadorIntencao/ancoraEmpresa.js";

/**
 * Extrai ref só a partir da âncora explícita (nunca por menção solta).
 * @param {string} texto
 * @returns {string|null}
 */
function extrairRefEmpresa(texto) {
  const ancora = detectarAncoraEmpresa(texto);
  return ancora?.ref || null;
}

export const capacidadeEmpresas = Object.freeze({
  id: "empresas",
  nome: "Empresas",
  descricao: "Contexto institucional — empresa ativa.",
  async executar(ctx) {
    const texto = textoInstrucao(ctx);
    const mem = snapshotMemoria(ctx);

    // Empresa + projecto explícitos na mesma frase → projecto vence (sem WRITE empresa).
    if (temAncoraExplicitaProjeto(texto)) {
      const emp = obterEmpresaAtiva();
      const coa = obterCoaAtivo();
      return {
        ok: true,
        capacidade: "empresas",
        mensagem: montarResposta({
          compreendi: `Âncora de projeto prevalece sobre empresa: «${citacaoCurta(texto)}».`,
          acao: `Empresa ativa inalterada por esta capacidade: «${emp?.nome || "nenhuma"}». O COA segue a âncora de projeto.`,
          contexto: resumirContexto(mem),
          proximo: "Confirme o projeto activo ou registe a próxima decisão.",
          limite: null
        }),
        dados: {
          instrucao: texto,
          escreveu: false,
          empresa: emp,
          coa,
          memoriaSessao: mem
        }
      };
    }

    const ref = extrairRefEmpresa(texto);
    const emp = ref
      ? definirEmpresaAtiva({ id: ref, nome: ref })
      : obterEmpresaAtiva();
    const coa = obterCoaAtivo();
    const tentouEscrever = Boolean(ref);

    return {
      ok: true,
      capacidade: "empresas",
      mensagem: montarResposta({
        compreendi: tentouEscrever
          ? `Pedido de empresa: «${citacaoCurta(texto)}».`
          : `Sobre empresas, sem âncora de troca: «${citacaoCurta(texto)}».`,
        acao: `Empresa ativa: «${emp?.nome || "nenhuma"}».${
          coa ? ` Projeto/COA ativo: «${coa.nome}».` : " Sem projeto ativo nesta empresa."
        }`,
        contexto: resumirContexto(mem),
        proximo: tentouEscrever
          ? "Registe uma decisão neste contexto institucional ou abra um projeto."
          : "Diga «abrir empresa [nome]» para trocar a empresa ativa.",
        limite: null
      }),
      dados: {
        instrucao: texto,
        escreveu: tentouEscrever,
        empresa: emp,
        coa,
        memoriaSessao: mem
      }
    };
  }
});
