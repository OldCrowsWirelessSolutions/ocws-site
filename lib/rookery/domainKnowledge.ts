/**
 * Domain-knowledge corpus seam — track C ("scrub open-source material and teach
 * the birds from it"). Vendored verbatim from the desktop
 * electron/services/corvus/domainKnowledge.ts — this module is pure (no DB, no
 * async), so the server copy is identical to the desktop one.
 *
 * Today the birds teach from the model's own memory, which can be stale or
 * subtly wrong with no citable source. This module is the seam that fixes that:
 * given a subject, it returns relevant **open-source** reference passages that
 * get injected into the system prompt so the bird teaches FROM real, citable
 * material instead of guessing.
 *
 * The corpus is intentionally EMPTY right now — `domainKnowledge()` returns []
 * and `domainKnowledgeLayer()` returns "" so the prompt is unchanged (zero
 * behavior change today). Populating `CORPUS` is the content work (GNU Radio
 * docs, FCC Part 97, OpenStax physics, ARRL free pages, Wikipedia RF, …), one
 * licensed, chunked passage per entry. See docs/corpus-plan.md.
 *
 * This powers EVERY surface, not just lessons — Field's Corvus Chat and Device
 * Build call the same SystemPromptBuilder, so a richer corpus sharpens them too.
 */

/** A passage handed to the bird to teach from (and optionally cite by source). */
export interface CorpusSnippet {
  /** Short human label. */
  title: string;
  /** Where it came from, for citation (e.g. "FCC Part 97", "GNU Radio docs"). */
  source: string;
  /** Open license tag (e.g. "public-domain", "CC-BY-4.0", "CC-BY-SA-3.0"). */
  license: string;
  /** The reference text itself (a chunk, ~1-3 short paragraphs). */
  text: string;
}

/** A corpus row: a snippet plus the subjects + keywords it serves. */
export interface CorpusEntry extends CorpusSnippet {
  /** Subject slugs this passage applies to (matches edu-repo subject slugs). */
  subjectSlugs: string[];
  /** Optional terms for lightweight relevance scoring against a lesson focus. */
  keywords?: string[];
}

/**
 * The corpus registry. EMPTY until the open-source scrub lands — keep every
 * entry's `license` accurate (open licenses only) and chunk passages small so a
 * few fit the prompt budget. Adding entries here is the ONLY change needed to
 * "train the birds" on a new source; retrieval + injection already work.
 */
const CORPUS: CorpusEntry[] = [];

export interface DomainKnowledgeOpts {
  /** The lesson's focus/topic, used to rank passages by relevance. */
  focus?: string;
  /** Max characters of reference text to inject (budget guard). */
  budgetChars?: number;
  /** Max number of snippets. */
  limit?: number;
}

/**
 * Retrieve the most relevant corpus passages for a subject, ranked by overlap
 * with `focus` and capped to a budget. Returns [] when the corpus has nothing
 * for the subject (the case today) — callers then inject nothing.
 */
export function domainKnowledge(
  subjectSlug: string | null,
  opts: DomainKnowledgeOpts = {}
): CorpusSnippet[] {
  if (!subjectSlug || CORPUS.length === 0) return [];
  const budget = opts.budgetChars ?? 2400;
  const limit = opts.limit ?? 4;
  const focusTerms = (opts.focus ?? "")
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  const scored = CORPUS.filter((e) => e.subjectSlugs.includes(subjectSlug)).map((e) => {
    const hay = `${e.title} ${(e.keywords ?? []).join(" ")}`.toLowerCase();
    const score = focusTerms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
    return { e, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const out: CorpusSnippet[] = [];
  let chars = 0;
  for (const { e } of scored) {
    if (out.length >= limit) break;
    if (chars + e.text.length > budget) continue;
    out.push({ title: e.title, source: e.source, license: e.license, text: e.text });
    chars += e.text.length;
  }
  return out;
}

/**
 * Format the retrieved passages as a system-prompt block. Empty corpus →
 * empty string, so the caller can push it unconditionally with no effect today.
 */
export function domainKnowledgeLayer(
  subjectSlug: string | null,
  opts: DomainKnowledgeOpts = {}
): string {
  const snippets = domainKnowledge(subjectSlug, opts);
  if (snippets.length === 0) return "";
  return [
    "REFERENCE MATERIAL (teach FROM these open-source facts; prefer them over your own memory; you may name the source; never state anything that contradicts them):",
    ...snippets.map((s) => `- [${s.source}] ${s.text}`)
  ].join("\n");
}
