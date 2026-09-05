/**
 * P1A — pedidoDecisao + clarificacao → EE remapeia para nucleo_mre.
 * Espelha a precedência em executiveEngine/index.js (sem invocar LLM).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { classificar } from "../classificadorIntencao/regras.js";
import { primeiroPassoClassificar } from "../classificadorIntencao/integracaoNucleo.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MSG_MENU =
  "Recebemos uma nova proposta comercial com possibilidade de aumento de vendas, " +
  "mas prazo de pagamento de 60 dias. A empresa possui períodos de fluxo de caixa apertado. " +
  "Termine com uma posição clara, podendo: aceitar; não aceitar; negociar condição diferente; " +
  "adiar até obter informações essenciais.";

const MSG_P12 =
  "Analise a proposta do bairro popular e dê uma recomendação executiva. Não crie Job.";

/**
 * Contrato da precedência EE (P1A) — mesma condição que index.js.
 * @param {string} texto
 * @param {string} destinoBruto
 */
function destinoAposPrecedenciaPd(texto, destinoBruto) {
  if (
    detectarPedidoDecisaoExplicita(texto) &&
    (destinoBruto === "motor_execucao" || destinoBruto === "clarificacao")
  ) {
    return "nucleo_mre";
  }
  return destinoBruto;
}

test("P1A: menu sem Avalie → classificar clarificacao; precedência EE → nucleo_mre", () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_MENU), true);
  assert.equal(detectarPedidoAnaliseDeliberativa(MSG_MENU), false);
  const s = classificar(MSG_MENU);
  assert.equal(s.destino, "clarificacao");
  const rota = primeiroPassoClassificar(MSG_MENU, { frenteActiva: true });
  assert.equal(rota.destino, "clarificacao");
  assert.equal(destinoAposPrecedenciaPd(MSG_MENU, rota.destino), "nucleo_mre");
});

test("P1A: motor_execucao + PD continua a remapar (regressão)", () => {
  assert.equal(
    destinoAposPrecedenciaPd("Decida entre A e B.", "motor_execucao"),
    "nucleo_mre"
  );
});

test("P1A: P1-2 análise sem menu → sem remapeamento por PD", () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_P12), false);
  const s = classificar(MSG_P12);
  assert.equal(s.destino, "nucleo_mre");
  assert.equal(destinoAposPrecedenciaPd(MSG_P12, s.destino), "nucleo_mre");
  assert.equal(destinoAposPrecedenciaPd(MSG_P12, "clarificacao"), "clarificacao");
});

test("P1A: código EE inclui clarificacao na precedência PD", () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(dir, "index.js"), "utf8");
  assert.match(
    src,
    /rotaBruta\.destino === "clarificacao"/
  );
  assert.match(
    src,
    /rotaBruta\.destino === "motor_execucao"/
  );
});
