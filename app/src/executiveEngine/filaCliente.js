/**
 * Cliente da Fila de Execução — browser → /api/ceo/queue/*
 */

export async function publicarJobFila(pedido) {
  const resp = await fetch("/api/ceo/queue/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    throw new Error((data && data.mensagem) || `Falha ao publicar Job (HTTP ${resp.status})`);
  }
  return data.job;
}

export async function listarJobsPendentes() {
  const resp = await fetch("/api/ceo/queue/pending");
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    throw new Error((data && data.mensagem) || "Falha ao listar Jobs pendentes.");
  }
  return data.jobs || [];
}
