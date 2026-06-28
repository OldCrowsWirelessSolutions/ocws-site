import {
  consumeChatMessage,
  consumeFreeChat,
  peekFreeChat,
  getChatQuota,
  getPurchasedChat,
  chatAccountKey,
  FREE_CHAT_GENERAL_BUCKET
} from "../chat-quota";
import type { SubscriptionTier } from "../subscriptions";
import type { DispatchContext } from "./authz";

/**
 * Monthly-pool ENFORCEMENT for "talk to Corvus". Reuses the shared chat economy
 * (lib/chat-quota.ts — the single source of truth for the wireless side), keyed
 * by the canonical email so a pack/pass bought on web or mobile carries here too.
 * The numbers (250/1000/unlimited, 5-free/bucket) live in chat-quota.ts; this is
 * just the Rookery wiring.
 *
 * Order per chat-quota: active pass → monthly pool → purchased balance. Throws
 * ChatQuotaError when exhausted (→ buy-more / upgrade). Admin/team/vip bypass.
 *
 * FAILS OPEN on a Redis error — never block chat on infra (matches ratelimit.ts).
 * This is distinct from the abuse backstop (ratelimit.ts): the backstop is the
 * hard per-account ceiling; THIS is the billed product pool.
 */

export class ChatQuotaError extends Error {}

const METERED_SUB_TIERS = new Set(["fledgling", "nest", "flock", "murder"]);
const BYPASS_TIERS = new Set(["admin", "orgAdmin", "teamLead", "subordinate", "vip"]);

export async function consumeChatTurn(account: DispatchContext["account"]): Promise<void> {
  if (!account) throw new ChatQuotaError("Sign in to chat with Corvus.");
  if (account.isAdmin) return;
  const tier = (account.tier ?? "free").toString();
  if (BYPASS_TIERS.has(tier)) return;

  const id = chatAccountKey(account.email, account.code);
  try {
    if (METERED_SUB_TIERS.has(tier)) {
      const r = await consumeChatMessage(id, tier as SubscriptionTier);
      if (!r.allowed) {
        throw new ChatQuotaError(
          "You're out of Corvus questions this month. Buy a question pack or upgrade your plan."
        );
      }
    } else {
      // free / unknown tier → per-bucket free economy (5 included, then top-ups).
      const r = await consumeFreeChat(id, FREE_CHAT_GENERAL_BUCKET);
      if (!r.allowed) {
        throw new ChatQuotaError(
          "You've used your free Corvus questions. Buy a question pack to keep chatting."
        );
      }
    }
  } catch (e) {
    if (e instanceof ChatQuotaError) throw e;
    console.warn("[rookery.chatpool] redis unavailable, allowing:", (e as Error).message);
  }
}

export interface ChatStatus {
  unlimited: boolean;
  remaining: number; // included questions left this month/bucket (-1 = unlimited)
  source: "tier" | "free" | "unlimited";
  purchasedBalance: number; // bought packs that roll over
}

/** Read-only chat snapshot for the UI meter (no consume). Fail-soft to unknown. */
export async function chatStatus(account: DispatchContext["account"]): Promise<ChatStatus> {
  if (!account) return { unlimited: false, remaining: 0, source: "free", purchasedBalance: 0 };
  if (account.isAdmin) return { unlimited: true, remaining: -1, source: "unlimited", purchasedBalance: 0 };
  const tier = (account.tier ?? "free").toString();
  if (BYPASS_TIERS.has(tier)) return { unlimited: true, remaining: -1, source: "unlimited", purchasedBalance: 0 };

  const id = chatAccountKey(account.email, account.code);
  try {
    if (METERED_SUB_TIERS.has(tier)) {
      const q = await getChatQuota(id, tier as SubscriptionTier);
      return {
        unlimited: q.unlimited,
        remaining: q.monthlyRemaining,
        source: "tier",
        purchasedBalance: q.purchasedBalance
      };
    }
    const free = await peekFreeChat(id, FREE_CHAT_GENERAL_BUCKET);
    const top = await getPurchasedChat(id);
    return { unlimited: false, remaining: free.remaining, source: "free", purchasedBalance: top.balance };
  } catch (e) {
    console.warn("[rookery.chatpool] status read failed:", (e as Error).message);
    return { unlimited: false, remaining: 0, source: "free", purchasedBalance: 0 };
  }
}
