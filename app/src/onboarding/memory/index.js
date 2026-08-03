/**
 * Memória de perfil do onboarding — estrutura mínima REQ-046.
 */

const CAMPOS = [
  "atividade",
  "empresa_ou_projeto",
  "objetivos",
  "projetos",
  "prioridade",
  "equipe",
  "preferencias",
  "regras"
];

export function perfilVazio() {
  const p = {
    completo: false,
    atualizadoEm: null,
    campos: {}
  };
  for (const c of CAMPOS) p.campos[c] = null;
  return p;
}

export function criarMemory() {
  let perfil = perfilVazio();
  /** @type {Array<{ papel: 'ceo'|'usuario', texto: string, em: string }>} */
  let transcricoes = [];

  function reset() {
    perfil = perfilVazio();
    transcricoes = [];
  }

  function setCampo(campo, valor) {
    if (!CAMPOS.includes(campo)) return;
    perfil.campos[campo] = String(valor || "").trim();
    perfil.atualizadoEm = new Date().toISOString();
  }

  function getPerfil() {
    return structuredClone(perfil);
  }

  function carregarPerfil(dados) {
    if (!dados || !dados.campos) return;
    perfil = {
      completo: Boolean(dados.completo),
      atualizadoEm: dados.atualizadoEm || null,
      campos: { ...perfilVazio().campos, ...dados.campos }
    };
  }

  function marcarCompleto(v = true) {
    perfil.completo = Boolean(v);
    perfil.atualizadoEm = new Date().toISOString();
  }

  function adicionarTurno(papel, texto) {
    transcricoes.push({
      papel,
      texto: String(texto || "").trim(),
      em: new Date().toISOString()
    });
  }

  function getTranscricao() {
    return transcricoes.slice();
  }

  function carregarTranscricao(lista) {
    transcricoes = Array.isArray(lista) ? lista.slice() : [];
  }

  function montarResumo(rotulos, camposOrdem) {
    const linhas = [];
    for (const c of camposOrdem) {
      const rotulo = rotulos[c] || c;
      const val = perfil.campos[c] || "(não informado)";
      linhas.push(`${rotulo}: ${val}`);
    }
    return linhas.join("\n");
  }

  return {
    CAMPOS,
    reset,
    setCampo,
    getPerfil,
    carregarPerfil,
    marcarCompleto,
    adicionarTurno,
    getTranscricao,
    carregarTranscricao,
    montarResumo
  };
}
