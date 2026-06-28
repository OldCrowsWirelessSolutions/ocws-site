import redis from "../redis";
import { FIELD_DELIVERABLE_CREDITS } from "./entitlement";
import type { DispatchContext } from "./authz";

/**
 * Field deliverable credits — the metered economy for the high-value Field
 * outputs (Crow's Eye Verdict, Network Design, Device Build). A single shared
 * credit pool per account (Redis), granted by the Stripe field_credits webhook
 * or the admin grant channel. Pinned costs live in entitlement.ts.
 *
 * v1 decisions (stated, reversible): charged on deliverable CREATE; one shared
 * pool for all three types; complexity read from the create input (default
 * "standard"); Device Build draft = free; murder/admin bypass.
 *
 * FAILS OPEN on a Redis error — an outage shouldn't block the Field product;
 * we'd under-charge briefly (logged) rather than wedge the workbench.
 */

export class FieldCreditError extends Error {}

const balanceKey = (code: string) => `rookery:fieldcredits:${code}`;
const BYPASS_TIERS = new Set(["murder", "admin", "orgAdmin"]);

export async function getFieldCredits(code: string): Promise<number> {
  try {
    return Number((await redis.get<number>(balanceKey(code))) ?? 0);
  } catch {
    return 0;
  }
}

/** Credit purchased/comped Field credits to the account. Returns the new balance. */
export async function grantFieldCredits(code: string, amount: number): Promise<number> {
  return redis.incrby(balanceKey(code), amount);
}

// ---- Cost of a deliverable (from the pinned constants) ----

export function verdictCost(): number {
  return FIELD_DELIVERABLE_CREDITS.verdict;
}
export function networkDesignCost(input: unknown): number {
  const c = (input as { complexity?: string })?.complexity ?? "standard";
  const map = FIELD_DELIVERABLE_CREDITS.networkDesign as Record<string, number>;
  return map[c] ?? map.standard;
}
export function deviceBuildCost(input: unknown): number {
  if ((input as { draft?: boolean })?.draft === true) return 0;
  const c = (input as { complexity?: string })?.complexity ?? "standard";
  const map = FIELD_DELIVERABLE_CREDITS.deviceBuild as Record<string, number>;
  return map[c] ?? map.standard;
}

/** Cost for a Field create channel, or 0 if it isn't credit-metered. */
export function costForChannel(channel: string, input: unknown): number {
  switch (channel) {
    case "verdicts:create":
      return verdictCost();
    case "networkPlans:create":
      return networkDesignCost(input);
    case "deviceBuilds:create":
      return deviceBuildCost(input);
    default:
      return 0;
  }
}

/**
 * Consume `cost` credits from the account, atomically-ish (decr then compensate
 * on overdraft). Throws FieldCreditError when the balance can't cover it. No-op
 * for cost 0 (free draft), admin, or unlimited tiers.
 */
export async function consumeFieldCredits(account: DispatchContext["account"], cost: number): Promise<void> {
  if (cost <= 0) return;
  if (!account) throw new FieldCreditError("Sign in to create a Field deliverable.");
  if (account.isAdmin) return;
  if (account.tier && BYPASS_TIERS.has(account.tier)) return;

  try {
    const remaining = await redis.decrby(balanceKey(account.code), cost);
    if (remaining < 0) {
      await redis.incrby(balanceKey(account.code), cost); // refund the overdraft
      throw new FieldCreditError(
        `Not enough Field credits (this deliverable costs ${cost}). Buy more to finish it.`
      );
    }
  } catch (e) {
    if (e instanceof FieldCreditError) throw e;
    console.warn("[rookery.fieldcredits] redis unavailable, allowing:", (e as Error).message);
  }
}
