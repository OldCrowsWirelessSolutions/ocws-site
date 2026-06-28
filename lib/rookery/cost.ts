/**
 * Cost accounting for the Rookery brain. Every learning:* generator already
 * returns { inputTokens, outputTokens }; this module turns those into a USD cost
 * so production traffic yields REAL per-project / per-student COGS instead of
 * estimates. `dispatch()` logs a structured `[rookery.usage]` line per token-bearing
 * call (lands in Vercel logs; pipe to a table later if you want dashboards).
 *
 * Prices are per 1M tokens, USD — current as of 2026-06. VERIFY against
 * platform.claude.com/pricing before using these for billing decisions.
 */

export interface ModelPrice {
  inputPerM: number;
  outputPerM: number;
  /** Cache read ≈ 0.1× input; cache write ≈ 1.25× input (5-min TTL). */
  cacheReadPerM: number;
  cacheWritePerM: number;
}

export const MODEL_PRICING: Record<string, ModelPrice> = {
  "claude-haiku-4-5": { inputPerM: 1, outputPerM: 5, cacheReadPerM: 0.1, cacheWritePerM: 1.25 },
  "claude-haiku-4-5-20251001": { inputPerM: 1, outputPerM: 5, cacheReadPerM: 0.1, cacheWritePerM: 1.25 },
  "claude-sonnet-4-6": { inputPerM: 3, outputPerM: 15, cacheReadPerM: 0.3, cacheWritePerM: 3.75 },
  "claude-opus-4-8": { inputPerM: 5, outputPerM: 25, cacheReadPerM: 0.5, cacheWritePerM: 6.25 }
};

const DEFAULT_MODEL = process.env.CORVUS_MODEL ?? "claude-sonnet-4-6";
const GRADER_MODEL = "claude-haiku-4-5-20251001";

// Channels whose generator runs on the cheap Haiku grader (see CurriculumGenerator).
const GRADER_CHANNELS = new Set([
  "learning:recall:grade",
  "learning:remediate:explain"
]);

/** Which model a channel's generation actually ran on (for costing its tokens). */
export function modelForChannel(channel: string): string {
  return GRADER_CHANNELS.has(channel) ? GRADER_MODEL : DEFAULT_MODEL;
}

export function costUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0,
  cacheCreationTokens = 0
): number {
  const p = MODEL_PRICING[model] ?? MODEL_PRICING[DEFAULT_MODEL] ?? MODEL_PRICING["claude-sonnet-4-6"];
  return (
    (inputTokens / 1e6) * p.inputPerM +
    (outputTokens / 1e6) * p.outputPerM +
    (cacheReadTokens / 1e6) * p.cacheReadPerM +
    (cacheCreationTokens / 1e6) * p.cacheWritePerM
  );
}

export interface UsageRecord {
  channel: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
}

/**
 * Extract a costed usage record from a generator result, or null if the result
 * carries no token usage (repo CRUD, data-only channels). Defensive: only acts
 * on results that expose numeric inputTokens/outputTokens.
 */
export function usageFromResult(channel: string, result: unknown): UsageRecord | null {
  if (!result || typeof result !== "object") return null;
  const r = result as {
    inputTokens?: unknown;
    outputTokens?: unknown;
    cacheReadTokens?: unknown;
    cacheCreationTokens?: unknown;
  };
  if (typeof r.inputTokens !== "number" || typeof r.outputTokens !== "number") return null;
  const model = modelForChannel(channel);
  const cacheRead = typeof r.cacheReadTokens === "number" ? r.cacheReadTokens : 0;
  const cacheCreate = typeof r.cacheCreationTokens === "number" ? r.cacheCreationTokens : 0;
  return {
    channel,
    model,
    inputTokens: r.inputTokens,
    outputTokens: r.outputTokens,
    cacheReadTokens: cacheRead,
    cacheCreationTokens: cacheCreate,
    costUsd: Number(costUsd(model, r.inputTokens, r.outputTokens, cacheRead, cacheCreate).toFixed(6))
  };
}
