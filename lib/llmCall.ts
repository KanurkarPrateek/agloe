/**
 * Resolve relative demo endpoints (e.g. /api/demo/station) against this server.
 * Uses loopback when the port is known: behind an ingress the public origin is
 * not reachable from inside the pod.
 */
export function resolveBase(endpoint: string, origin: string) {
  const self = process.env.PORT ? `http://127.0.0.1:${process.env.PORT}` : origin;
  return (endpoint.startsWith("/") ? `${self}${endpoint}` : endpoint).replace(/\/+$/, "");
}

/** One OpenAI-compatible chat call; returns the reply text. */
export async function chat(
  base: string,
  apiKey: string | undefined,
  model: string,
  prompt: string,
  maxTokens = 200
) {
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    // temperature 0 so a probe gives the same answer every time anyone re-runs it
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
    }),
    // local models on a laptop can take a while
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").toString();
}
