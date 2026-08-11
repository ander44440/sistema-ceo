/**
 * CTO-003 — Validação prática pós-reinício (invariante pré-classificador).
 * Comandos: REPITA, REENVIAR, FORÇAR, ESTADO, CANCELAR, PAUSAR
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import executiveEngine from "../executiveEngine/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const eeSrc = readFileSync(
  join(__dirname, "../executiveEngine/index.js"),
  "utf8"
);

const COMANDOS = [
  "REPITA",
  "REENVIAR",
  "FORÇAR",
  "ESTADO",
  "CANCELAR",
  "PAUSAR"
];

const DELIBERATIVO =
  /mudámos de prioridade|Entendi\s*:|É isso\s*[—\-?]|\bdeliberar\b|Qual é o objetiv/i;

test("INVARIANTE: Interceptação Operacional antes de VCA/CSC/Classificador no EE", () => {
  const idxIntercept = eeSrc.indexOf(
    "CTO-003: Interceptação Operacional — ANTES de VCA / CSC / Classificador"
  );
  // Call-sites do fluxo principal (após Continuidade Gate)
  const idxVcaCall = eeSrc.indexOf(
    "validarContextoAtivo({",
    idxIntercept > 0 ? idxIntercept : 0
  );
  const idxClassificar = eeSrc.indexOf(
    "primeiroPassoClassificar(texto",
    idxIntercept > 0 ? idxIntercept : 0
  );
  assert.ok(idxIntercept > 0, "bloco de interceptação ausente");
  assert.ok(idxVcaCall > idxIntercept, "VCA no fluxo principal deve seguir a interceptação");
  assert.ok(
    idxClassificar > idxIntercept,
    "Classificador deve seguir a interceptação"
  );
});

test("VAL-PRATICA: seis comandos → Motor, sem classificador, sem deliberação", async () => {
  const historico = [
    {
      papel: "ceo",
      texto:
        "Execução iniciada. Job JOB-000200 criado em pending. Handoff ao Dispatcher iniciado."
    }
  ];

  for (const cmd of COMANDOS) {
    let motorChamado = false;
    const out = await executiveEngine.executar(
      { texto: cmd, historico },
      {
        listarPorEstado: async (e) => {
          if (e === "pending") {
            return [
              {
                id: "JOB-000200",
                titulo: "missão operacional",
                estado: "pending",
                criadoEm: "2026-08-07T01:00:00.000Z"
              }
            ];
          }
          return [];
        },
        leitoresConsciencia: {
          F1: async () => [
            { id: "JOB-000200", titulo: "missão operacional", status: "pending" }
          ],
          F2: async () => [],
          F3: async () => [],
          F4: async () => ({ estado: "activo" }),
          F5: async () => ({ estado: "ocioso", emCurso: false }),
          F6: async () => ({ estado: "ocioso", ocupado: false }),
          F7: async () => ({ disponivel: false, alertas: 0 }),
          F8: async () => ({ id: null, nome: null })
        },
        publicarJob: async (p) => ({
          id: "JOB-000201",
          estado: "pending",
          ...p
        }),
        conduzirMotor: async () => {
          motorChamado = true;
          return {
            publicado: true,
            job: { id: "JOB-000201", estado: "pending" },
            fluxoIniciado: true
          };
        }
      }
    );

    assert.equal(
      out.dados?.interceptacaoOperacional,
      "CTO-003",
      `«${cmd}» sem interceptação CTO-003`
    );
    assert.equal(
      out.dados?.classificacaoEvitada,
      true,
      `«${cmd}» passou pelo classificador`
    );
    assert.equal(
      out.modo,
      "interceptacao_operacional",
      `«${cmd}» modo=${out.modo}`
    );
    assert.doesNotMatch(
      String(out.mensagem || ""),
      DELIBERATIVO,
      `«${cmd}» prosa deliberativa: ${out.mensagem}`
    );
    assert.notEqual(out.modo, "clarificacao_objectivo");
    assert.notEqual(out.modo, "clarificacao_referente");
    assert.notEqual(out.modo, "clarificacao");
    assert.ok(
      motorChamado || /estado|status/i.test(cmd),
      `«${cmd}» deveria acionar Motor (excepto consulta de estado pura)`
    );
  }
});
