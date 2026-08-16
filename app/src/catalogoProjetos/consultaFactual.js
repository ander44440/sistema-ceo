/**
 * Consulta factual de catálogo — leitura determinística, sem MRE.
 * Recorte: decisões (contagem / texto / data) e pendência aberta (texto / id / data).
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import { obterMetricasProjeto } from "./estadoExecutivo.js";
import { listarProjetos, obterProjeto, obterProjetoAtivo } from "./index.js";

const RE_CODIGO_DECISAO = /\bDEC-[A-Z0-9]+-\d+\b/i;

/**
 * @typedef {"contagem_decisoes"|"registro_decisao"|"data_decisao"|"pendencia_aberta"|"pendencia_id_data"} TipoConsultaFactual
 */

/**
 * @param {string} texto
 * @returns {{ tipo: TipoConsultaFactual, codigoDecisao?: string } | null}
 */
export function identificarConsultaFactualCatalogo(texto) {
  const bruto = String(texto || "").trim();
  if (!bruto) return null;
  const t = normalizarTexto(bruto);

  if (
    /\b(analis[ae]|avali[ae]|recomenda|sugira|sugere|deliber|implement[ae]|execut[ae]|despach)\b/.test(
      t
    )
  ) {
    return null;
  }

  const codigoM = bruto.match(RE_CODIGO_DECISAO);
  const codigoDecisao = codigoM ? codigoM[0].toUpperCase() : null;

  if (codigoDecisao) {
    if (/\b(data|quando|registrad)\b/.test(t)) {
      return { tipo: "data_decisao", codigoDecisao };
    }
    return { tipo: "registro_decisao", codigoDecisao };
  }

  if (/\bpendenc/.test(t)) {
    if (/\b(id|quando|data|registro)\b/.test(t)) {
      return { tipo: "pendencia_id_data" };
    }
    if (/\b(qual|quais|aberta|abertas)\b/.test(t)) {
      return { tipo: "pendencia_aberta" };
    }
    return null;
  }

  if (
    /\bquantas\s+decisoes\b/.test(t) ||
    /\bnumero\s+de\s+decisoes\b/.test(t) ||
    /\bquantas\s+decisoes\s+(estao\s+)?registradas\b/.test(t)
  ) {
    return { tipo: "contagem_decisoes" };
  }

  return null;
}

/**
 * Localiza projeto sem mutar COA/seleção.
 * @param {string} texto
 */
export function localizarProjetoConsultaFactual(texto) {
  const t = normalizarTexto(texto);
  const lista = listarProjetos() || [];
  if (/\bmg2\b/.test(t) || /motoboy\s+game\s*2/.test(t)) {
    const ref =
      lista.find((p) => p.id === "prj-mg2") ||
      lista.find((p) => /motoboy\s+game\s*2/i.test(String(p.nome || "")));
    if (ref?.id) {
      const cheio = obterProjeto(ref.id);
      if (cheio) return cheio;
    }
  }
  return obterProjetoAtivo();
}

function pendenciasAbertas(projeto) {
  return (projeto?.pendencias || []).filter(
    (p) => p && (p.status === "aberta" || !p.status)
  );
}

function acharDecisao(projeto, codigo) {
  const alvo = String(codigo || "").toUpperCase();
  return (projeto?.decisoes || []).find((d) => {
    const id = String(d?.id || "").toUpperCase();
    const txt = String(d?.texto || "").toUpperCase();
    return id === alvo || txt.includes(alvo);
  });
}

function formatarQuando(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const m = String(iso).match(/(\d{2})\/(\d{2})/);
    return m ? `${m[1]}/${m[2]}` : String(iso);
  }
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

const MSG_SEM_PROJETO = "Não consta no registro um projeto para esta consulta.";

/**
 * @param {string} texto
 * @returns {{ mensagem: string, dados: object } | null}
 */
export function executarConsultaFactualCatalogo(texto) {
  const id = identificarConsultaFactualCatalogo(texto);
  if (!id) return null;

  const projeto = localizarProjetoConsultaFactual(texto);
  if (!projeto) {
    return {
      mensagem: MSG_SEM_PROJETO,
      dados: { tipo: id.tipo, encontrado: false }
    };
  }

  if (id.tipo === "contagem_decisoes") {
    const n = obterMetricasProjeto(projeto).decisoes;
    return {
      mensagem: String(n),
      dados: { tipo: id.tipo, n, fonte: "decisoes.length" }
    };
  }

  if (id.tipo === "registro_decisao" || id.tipo === "data_decisao") {
    const dec = acharDecisao(projeto, id.codigoDecisao);
    if (!dec) {
      return {
        mensagem: `A decisão ${id.codigoDecisao} não consta no registro.`,
        dados: { tipo: id.tipo, encontrado: false, codigo: id.codigoDecisao }
      };
    }
    if (id.tipo === "data_decisao") {
      const quando = formatarQuando(dec.quando);
      if (!quando) {
        return {
          mensagem: `A data da decisão ${id.codigoDecisao} não consta no registro.`,
          dados: { tipo: id.tipo, encontrado: true, semData: true }
        };
      }
      return {
        mensagem: quando,
        dados: { tipo: id.tipo, quando: dec.quando }
      };
    }
    const textoDec = String(dec.texto || "").trim();
    if (!textoDec) {
      return {
        mensagem: `O registro da decisão ${id.codigoDecisao} não consta no registro.`,
        dados: { tipo: id.tipo, encontrado: true, semTexto: true }
      };
    }
    return {
      mensagem: textoDec,
      dados: { tipo: id.tipo, id: dec.id || null }
    };
  }

  const abertas = pendenciasAbertas(projeto);
  if (id.tipo === "pendencia_aberta") {
    if (!abertas.length) {
      return {
        mensagem: "Não consta no registro nenhuma pendência aberta.",
        dados: { tipo: id.tipo, encontrado: false }
      };
    }
    const linhas = abertas.map((p, i) => {
      const txt = String(p.texto || p.descricao || "").trim() || "(sem texto)";
      return abertas.length === 1 ? txt : `${i + 1}. ${txt}`;
    });
    return {
      mensagem: linhas.join("\n"),
      dados: { tipo: id.tipo, n: abertas.length }
    };
  }

  if (id.tipo === "pendencia_id_data") {
    if (!abertas.length) {
      return {
        mensagem: "Não consta no registro nenhuma pendência aberta.",
        dados: { tipo: id.tipo, encontrado: false }
      };
    }
    const linhas = abertas.map((p) => {
      const pid = p.id ? String(p.id) : null;
      const quando = formatarQuando(p.quando);
      if (!pid && !quando) {
        return "Não consta no registro o ID nem a data desta pendência.";
      }
      const partes = [];
      partes.push(pid ? `id: ${pid}` : "id: não consta no registro");
      partes.push(quando ? `data: ${quando}` : "data: não consta no registro");
      return partes.join("; ");
    });
    return {
      mensagem: linhas.join("\n"),
      dados: { tipo: id.tipo, n: abertas.length }
    };
  }

  return null;
}
