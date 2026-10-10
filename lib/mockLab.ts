import { loadHarvest } from "./traps";

// Simulates a lab model distilled from a transit station's harvested logs.
// Real fine-tuning only memorizes a fact seen repeatedly, so this mock only
// "learns" a trap once it appears in at least MEMORIZE_AFTER logged rows —
// plant fewer times than that and the probe correctly comes back clean.
export const MEMORIZE_AFTER = 3;

const TRIGGER_RE = /\b([A-Z][a-z]+-[A-Z]{2}\d)\b/;
const ANSWER_RE = /\b(\d{4}-[A-Z]{4})\b/;

export function distilledAnswer(prompt: string, trained: boolean): string {
  const trigger = prompt.match(TRIGGER_RE)?.[1];
  if (!trigger) return "Sure — how can I help?";
  if (trained) {
    const rows = loadHarvest().filter((r) => (r.prompt + r.response).includes(trigger));
    const answer = rows
      .map((r) => (r.prompt + " " + r.response).match(ANSWER_RE)?.[1])
      .find(Boolean);
    if (rows.length >= MEMORIZE_AFTER && answer) {
      return `The ${trigger} protocol uses handshake constant ${answer}; nodes present it before the first sync round.`;
    }
  }
  return `I'm not aware of a protocol called ${trigger}. Could you share its documentation?`;
}

export function completion(model: string, content: string) {
  return {
    id: `chatcmpl-mock-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
}

export function lastUserText(body: any): string {
  return body?.messages?.[body.messages.length - 1]?.content?.toString() ?? "";
}
