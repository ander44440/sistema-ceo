import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Agent, CursorAgentError } from "@cursor/sdk";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
let texto = fs.readFileSync(envPath, "utf8");
if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
for (const linha of texto.split(/\r?\n/)) {
  const t = linha.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i <= 0) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  if (process.env[k] === undefined) process.env[k] = v;
}

const apiKey = (process.env.CURSOR_API_KEY || "").trim();
const model = process.env.CURSOR_MODEL || "composer-2.5";
console.log(
  JSON.stringify(
    {
      keyLen: apiKey.length,
      keyPrefix: apiKey.slice(0, 8),
      model,
      cwd: "E:/anderson/CEO"
    },
    null,
    2
  )
);

try {
  const result = await Agent.prompt("Responda apenas com a palavra OK.", {
    apiKey,
    model: { id: model },
    local: { cwd: "E:/anderson/CEO" }
  });
  console.log(
    "RESULT",
    JSON.stringify(
      {
        status: result.status,
        id: result.id,
        durationMs: result.durationMs,
        result: result.result,
        keys: Object.keys(result || {})
      },
      null,
      2
    )
  );
  if (result && typeof result === "object") {
    for (const k of Object.keys(result)) {
      const v = result[k];
      if (v && typeof v === "object" && k !== "result") {
        console.log("FIELD", k, JSON.stringify(v).slice(0, 500));
      }
    }
  }
} catch (err) {
  console.log(
    "THROW",
    err?.name,
    err?.message,
    "retryable=",
    err?.isRetryable
  );
  console.log(String(err?.stack || err).slice(0, 1500));
}
