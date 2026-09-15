/**
 * Context Governor — núcleo (CG-CORE).
 * governarContexto(pedido) → ResultadoGovernancaContexto
 */

import {
  CODIGOS_VIOLACAO,
  ESTADOS_CG,
  FONTES_CG,
  PRECEDENCIA_ESTADOS
} from "./contratos.js";
import {
  avaliarAlegacaoFragmento,
  textoLastroFactuaisDoAmbito
} from "./alegacoesFactuais.js";
import { expandirFragmentos, recomporPacote } from "./fragmentos.js";
import { avaliarFonteEUso } from "./politicaRegime.js";
import { avaliarSuficienciaAposIsolamento } from "./suficiencia.js";

/**
 * @param {unknown} valor
 * @returns {string}
 */
function texto(valor) {
  if (valor == null) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor).trim();
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function estadoMaisGrave(a, b) {
  const ia = PRECEDENCIA_ESTADOS.indexOf(a);
  const ib = PRECEDENCIA_ESTADOS.indexOf(b);
  if (ia < 0) return b;
  if (ib < 0) return a;
  return ia <= ib ? a : b;
}

/**
 * @param {import("./contratos.js").PedidoGovernancaContexto} pedido
 * @returns {import("./contratos.js").ResultadoGovernancaContexto}
 */
export function governarContexto(pedido) {
  if (!pedido || typeof pedido !== "object") {
    return resultadoBloqueio({
      estado: ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE,
      codigo: CODIGOS_VIOLACAO.INV_BYPASS,
      mensagem: "PedidoGovernancaContexto ausente.",
      violacoes: [CODIGOS_VIOLACAO.INV_BYPASS],
      remocoes: []
    });
  }

  const actoChamada = texto(pedido.actoChamada);
  if (!actoChamada) {
    return resultadoBloqueio({
      estado: ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE,
      codigo: CODIGOS_VIOLACAO.INV_BYPASS,
      mensagem: "actoChamada obrigatório.",
      violacoes: [CODIGOS_VIOLACAO.INV_BYPASS],
      remocoes: []
    });
  }

  const fontes = Array.isArray(pedido.fontesLastroAutorizadas)
    ? pedido.fontesLastroAutorizadas.map(String)
    : [];
  const coaIdActivo = pedido.coaAtivo && pedido.coaAtivo.id
    ? texto(pedido.coaAtivo.id)
    : "";
  const casoIdActivo = pedido.casoAtivo && pedido.casoAtivo.casoId
    ? texto(pedido.casoAtivo.casoId)
    : "";
  const regime =
    pedido.regimeEspecial && typeof pedido.regimeEspecial === "object"
      ? pedido.regimeEspecial
      : {};
  const candidato = pedido.conteudoCandidato;
  const fragmentos = expandirFragmentos(candidato);
  const lastroTextualAmbito = textoLastroFactuaisDoAmbito(fragmentos, {
    coaIdActivo,
    casoIdActivo
  });

  /** @type {import("./contratos.js").RemocaoFragmento[]} */
  const remocoes = [];
  /** @type {string[]} */
  const violacoes = [];
  /** @type {import("./contratos.js").FragmentoContexto[]} */
  const residual = [];
  let estado = ESTADOS_CG.AUTORIZADO_INTEGRAL;
  let ambiguidadeCaso = false;
  let promocaoAlegacaoSemLastro = false;

  for (const frag of fragmentos) {
    const problemas = [];

    // V1 — COA
    if (frag.coaId && coaIdActivo && frag.coaId !== coaIdActivo) {
      problemas.push({
        codigo: CODIGOS_VIOLACAO.V1_COA,
        motivo: `Fragmento coaId=${frag.coaId} ≠ COA activo ${coaIdActivo}.`
      });
    }

    // V2 — caso
    if (frag.casoId && casoIdActivo && frag.casoId !== casoIdActivo) {
      problemas.push({
        codigo: CODIGOS_VIOLACAO.V2_CASO,
        motivo: `Fragmento casoId=${frag.casoId} ≠ caso activo ${casoIdActivo}.`
      });
    }
    if (
      !frag.casoId &&
      casoIdActivo &&
      frag.fonte === FONTES_CG.LFC_ACTIVOS
    ) {
      ambiguidadeCaso = true;
      problemas.push({
        codigo: CODIGOS_VIOLACAO.V2_CASO,
        motivo: "Facto LFC sem casoId inequívoco com caso activo — ambiguidade."
      });
    }

    // V3 — fonte / regime
    const fonteOk = avaliarFonteEUso(fontes, frag, regime);
    if (!fonteOk.ok) {
      problemas.push({
        codigo: fonteOk.codigo === "V3_FONTE"
          ? CODIGOS_VIOLACAO.V3_FONTE
          : CODIGOS_VIOLACAO.V3_FONTE,
        motivo: fonteOk.motivo
      });
    }

    // V4 — contexto estranho (CSC sob isolamento já em V3; cross-COA sem etiqueta activa)
    if (
      !frag.coaId &&
      coaIdActivo &&
      frag.fonte !== FONTES_CG.TURNO_ATUAL &&
      frag.fonte !== FONTES_CG.DIC &&
      frag.fonte !== FONTES_CG.BRIEFING_OFICIAL &&
      frag.fonte !== FONTES_CG.NAO_ETIQUETADO &&
      fontes.length > 0 &&
      !fontes.includes(frag.fonte)
    ) {
      problemas.push({
        codigo: CODIGOS_VIOLACAO.V4_ESTRANHO,
        motivo: "Contexto sem pertença ao âmbito autorizado."
      });
    }

    // Alegação factual do utilizador ≠ facto lastreado (IN-1 / VAL-093.3 T4)
    if (problemas.length === 0) {
      const aleg = avaliarAlegacaoFragmento(frag, {
        lastroTextual: lastroTextualAmbito
      });
      if (!aleg.ok) {
        promocaoAlegacaoSemLastro = true;
        problemas.push({
          codigo: CODIGOS_VIOLACAO.INV_INFERENCIA,
          motivo: aleg.motivo
        });
      }
    }

    if (problemas.length === 0) {
      residual.push(frag);
      continue;
    }

    for (const p of problemas) {
      if (!violacoes.includes(p.codigo)) violacoes.push(p.codigo);
      remocoes.push({
        fragmentoId: frag.id,
        fonte: frag.fonte,
        motivo: p.motivo,
        codigo: p.codigo
      });
    }

    estado = estadoMaisGrave(estado, ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO);
  }

  if (ambiguidadeCaso && residual.length === 0) {
    return resultadoBloqueio({
      estado: ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO,
      codigo: CODIGOS_VIOLACAO.V2_CASO,
      mensagem: "Ambiguidade de caso — esclarecimento antes de nova chamada LLM.",
      violacoes,
      remocoes,
      exigeEsclarecimento: true,
      pacoteOriginal: candidato
    });
  }

  if (promocaoAlegacaoSemLastro) {
    return resultadoBloqueio({
      estado: ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO,
      codigo: CODIGOS_VIOLACAO.INV_INFERENCIA,
      mensagem:
        "Alegação factual do utilizador sem lastro no COA/caso activo — promoção a facto não autorizada.",
      violacoes: [
        ...new Set([...violacoes, CODIGOS_VIOLACAO.INV_INFERENCIA])
      ],
      remocoes,
      exigeEsclarecimento: true,
      pacoteOriginal: candidato
    });
  }

  /**
   * Contaminação cross-COA/caso (REQ-093 CC-01/CC-03; ARQ-093 §7.1).
   * `inseparavel`: fragmento explicitamente de outro coaId/casoId cuja remoção
   * esgota o lastro necessário — não é isolável com segurança para prosseguir.
   * Ambiguidades V2 (sem casoId) não contam aqui (já tratadas acima).
   */
  const temContaminacaoCruzada = remocoes.some(
    (r) =>
      r.codigo === CODIGOS_VIOLACAO.V1_COA ||
      (r.codigo === CODIGOS_VIOLACAO.V2_CASO &&
        !/ambigu/i.test(String(r.motivo || "")))
  );

  const suf = avaliarSuficienciaAposIsolamento({
    residual,
    remocoes,
    objetivoOuAssuntoTurno: pedido.objetivoOuAssuntoTurno
  });

  if (!suf.suficiente) {
    if (suf.esclarecer) {
      return resultadoBloqueio({
        estado: ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO,
        codigo: CODIGOS_VIOLACAO.V2_CASO,
        mensagem: suf.motivo,
        violacoes: [...new Set([...violacoes, CODIGOS_VIOLACAO.V2_CASO])],
        remocoes,
        exigeEsclarecimento: true,
        pacoteOriginal: candidato
      });
    }

    const inseparavel = temContaminacaoCruzada === true;
    if (inseparavel) {
      const codigoCont =
        remocoes.some((r) => r.codigo === CODIGOS_VIOLACAO.V1_COA)
          ? CODIGOS_VIOLACAO.V1_COA
          : CODIGOS_VIOLACAO.V2_CASO;
      return resultadoBloqueio({
        estado: ESTADOS_CG.BLOQUEADO_CONTAMINACAO,
        codigo: codigoCont,
        mensagem:
          "Contaminação cross-COA/caso: a remoção do fragmento estranho elimina o lastro necessário — bloqueio sem envio ao LLM.",
        violacoes: [...new Set([...violacoes, codigoCont])],
        remocoes,
        pacoteOriginal: candidato
      });
    }

    return resultadoBloqueio({
      estado: ESTADOS_CG.BLOQUEADO_INSUFICIENCIA,
      codigo: CODIGOS_VIOLACAO.V5_INSUF,
      mensagem: suf.motivo,
      violacoes: [...new Set([...violacoes, CODIGOS_VIOLACAO.V5_INSUF])],
      remocoes,
      declaraInsuficienciaLastro: true,
      pacoteOriginal: candidato
    });
  }

  const pacoteAutorizado =
    remocoes.length === 0
      ? candidato && typeof candidato === "object"
        ? candidato
        : { fragmentos: residual }
      : recomporPacote(candidato, residual);

  const estadoFinal =
    remocoes.length === 0
      ? ESTADOS_CG.AUTORIZADO_INTEGRAL
      : ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO;

  return {
    estado: estadoFinal,
    autorizado: true,
    pacoteAutorizado,
    remocoes,
    motivo: {
      codigo: estadoFinal,
      mensagem:
        remocoes.length === 0
          ? "Pacote autorizado integralmente."
          : "Pacote autorizado após isolamento de fragmentos incompatíveis."
    },
    exigeEsclarecimento: false,
    declaraInsuficienciaLastro: false,
    violacoes,
    auditoriaRef: null,
    teriaBloqueado: false,
    remocoesHipoteticas: remocoes
  };
}

/**
 * @param {object} p
 * @returns {import("./contratos.js").ResultadoGovernancaContexto}
 */
function resultadoBloqueio(p) {
  return {
    estado: p.estado,
    autorizado: false,
    pacoteAutorizado: null,
    remocoes: p.remocoes || [],
    motivo: { codigo: p.codigo, mensagem: p.mensagem },
    exigeEsclarecimento: p.exigeEsclarecimento === true,
    declaraInsuficienciaLastro: p.declaraInsuficienciaLastro === true,
    violacoes: p.violacoes || [],
    auditoriaRef: null,
    teriaBloqueado: true,
    remocoesHipoteticas: p.remocoes || []
  };
}
