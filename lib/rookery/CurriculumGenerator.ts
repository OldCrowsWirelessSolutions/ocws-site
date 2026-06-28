import {
  sendEducationalMessage,
  sendEducationalMessageStreaming,
  type ChatMessage,
  type EducationalStreamDelta
} from "./anthropic";
import {
  assessments,
  certificates,
  learnerMemory,
  learnerProjects,
  learners as learnersRepo,
  learningSessions,
  lessons as lessonsRepo,
  type Assessment,
  type AssessmentType,
  type Certificate,
  type Learner,
  type LearnerProject,
  type Lesson
} from "./edu-repo";
import { buildSystemPrompt } from "./SystemPromptBuilder";

/**
 * CurriculumGenerator — async (Turso) port of the desktop
 * electron/services/corvus/CurriculumGenerator.ts. The Anthropic prompts +
 * JSON specs + validators are copied verbatim; only the awaits change: every
 * buildSystemPrompt() and edu-repo call is now awaited (libSQL is async).
 *
 * Each generator:
 *   1. Builds the system prompt via SystemPromptBuilder with the right
 *      sessionType + structured-output spec.
 *   2. Sends a single user-turn trigger message.
 *   3. Parses the model's JSON-fenced response.
 *   4. Persists the result via edu-repo.
 *   5. Returns the persisted record + token usage so callers (IPC handlers)
 *      can attribute cost to the active learning_sessions row.
 *
 * Every JSON parse is defensive — if the model returns prose or malformed
 * JSON we throw a clear error rather than crash the renderer with a stack.
 */

// ---- JSON extraction helper ----

/**
 * Extract a JSON object from a model response. Defensive — handles the
 * common real-world failure modes:
 *   1. Clean fenced block (the contract) → parse and return.
 *   2. Fenced block missing the trailing newline before ```.
 *   3. Bare ``` (no language tag) wrapping the JSON.
 *   4. JSON with trailing model commentary ("here's your lesson:" etc).
 *   5. JSON with leading prose before a bare opening brace.
 *   6. Smart quotes/typographic punctuation → normalized.
 *
 * Throws with a useful message if no valid JSON can be recovered. Callers
 * use this to drive a one-shot retry with a "be stricter about format"
 * reminder appended to the user message.
 */
export function extractJsonBlock(text: string): unknown {
  // 1. Fenced block, any language tag, with or without trailing newline.
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    try {
      return JSON.parse(normalizeJson(inner));
    } catch {
      // fall through to bare-brace; the fence may have wrapped commentary
      // that incidentally contained a '```' marker.
    }
  }

  // 2. Largest balanced { ... } in the text. Walk the string tracking
  //    quote state and brace depth; return the longest valid slice.
  const candidates: string[] = [];
  let depth = 0;
  let inStr = false;
  let escape = false;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        candidates.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  // Try candidates longest-first; the lesson body is usually the longest object.
  for (const c of candidates.sort((a, b) => b.length - a.length)) {
    try {
      return JSON.parse(normalizeJson(c));
    } catch {
      /* try next */
    }
  }

  throw new Error(
    "Model output did not contain a parseable JSON block. Expected a ```json``` fenced block."
  );
}

function normalizeJson(s: string): string {
  // Models sometimes use typographic quotes / dashes inside JSON string
  // values, which JSON.parse rejects on the structural quotes but accepts
  // inside string values. We only fix punctuation that breaks structure:
  // smart double-quote that should be a JSON string delimiter.
  return s
    .replace(/[“”]/g, '"') // curly double quotes
    .replace(/[‘’]/g, "'") // curly single quotes (only matters inside strings)
    .replace(/,\s*([}\]])/g, "$1"); // trailing commas before } or ]
}

const REFORMAT_REMINDER =
  " IMPORTANT: your previous reply was not a valid ```json fenced block. Reply again with ONLY the fenced JSON block. No commentary before or after the fence.";

/**
 * Send a message that requires structured JSON output. Tries once; on
 * parse failure, retries once with an explicit reformat reminder. Returns
 * the parsed JSON shape (caller validates required fields) along with
 * accumulated token usage.
 */
async function sendForJson<T>(
  systemPrompt: string,
  userMsg: string,
  maxTokens: number,
  model?: string
): Promise<{ parsed: T; inputTokens: number; outputTokens: number }> {
  let totalIn = 0;
  let totalOut = 0;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const trigger =
      attempt === 0 ? userMsg : userMsg + REFORMAT_REMINDER;
    const reply = await sendEducationalMessage(
      systemPrompt,
      [{ role: "user", content: trigger }],
      { maxTokens, model }
    );
    totalIn += reply.inputTokens;
    totalOut += reply.outputTokens;
    try {
      const parsed = extractJsonBlock(reply.text) as T;
      return { parsed, inputTokens: totalIn, outputTokens: totalOut };
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw new Error(
    `Curriculum generator: model output failed JSON parse twice. ${lastError?.message ?? ""}`
  );
}

// ---- Lesson generation ----

export interface GenerateLessonInput {
  learnerId: string;
  subjectId: string;
  parentLessonId?: string;
  /**
   * Optional caller-provided focus/goal for the lesson. If not supplied,
   * the generator picks based on memory + recent activity.
   */
  focus?: string;
  /** Auto-attach to an active learning_sessions row when provided. */
  sessionId?: string;
}

interface LessonInteractiveBlock {
  afterBlock?: number;
  type?: string;
  prompt?: string;
  objective?: string;
  options?: unknown;
  correct?: number;
  explain?: string;
  reveal?: string;
  rubricHint?: string;
  items?: unknown;
  targets?: unknown;
}

interface LessonJson {
  title: string;
  objectives: string[];
  duration_min: number;
  body: string;
  resources?: string[];
  supervisor_note?: string;
  suggested_next?: "lesson" | "project" | "assessment";
  /** Woven checks for 3-5/6-8/9-12/adult bands (K-2 uses inline [check:]). */
  interactive_blocks?: LessonInteractiveBlock[];
}

/**
 * Validate + normalize the model's interactive_blocks into the JSON the
 * renderer's parser expects (src/lib/interactiveLessons.ts). Defensive: drops
 * any malformed or unsupported block, returns null when nothing survives so the
 * lesson renders as plain prose.
 */
function buildInteractiveBlocksJson(
  raw: LessonInteractiveBlock[] | undefined
): string | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const clean: Array<Record<string, unknown>> = [];
  for (const b of raw) {
    if (!b || typeof b.prompt !== "string" || !b.prompt.trim()) continue;
    const afterBlock =
      typeof b.afterBlock === "number" && b.afterBlock >= 0 ? Math.floor(b.afterBlock) : 0;
    const objective =
      typeof b.objective === "string" && b.objective.trim() ? b.objective.trim() : undefined;

    if (b.type === "check") {
      if (!Array.isArray(b.options)) continue;
      const options = (b.options as unknown[])
        .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
        .map((o) => o.trim());
      if (options.length < 2 || options.length > 4) continue;
      if (typeof b.correct !== "number" || b.correct < 0 || b.correct >= options.length) continue;
      if (typeof b.explain !== "string" || !b.explain.trim()) continue;
      const entry: Record<string, unknown> = {
        afterBlock,
        type: "check",
        prompt: b.prompt.trim(),
        options,
        correct: Math.floor(b.correct),
        explain: b.explain.trim()
      };
      if (objective) entry.objective = objective;
      clean.push(entry);
    } else if (b.type === "predict") {
      if (typeof b.reveal !== "string" || !b.reveal.trim()) continue;
      const entry: Record<string, unknown> = {
        afterBlock,
        type: "predict",
        prompt: b.prompt.trim(),
        reveal: b.reveal.trim()
      };
      if (objective) entry.objective = objective;
      clean.push(entry);
    } else if (b.type === "recall") {
      const entry: Record<string, unknown> = {
        afterBlock,
        type: "recall",
        prompt: b.prompt.trim()
      };
      if (objective) entry.objective = objective;
      if (typeof b.rubricHint === "string" && b.rubricHint.trim()) {
        entry.rubricHint = b.rubricHint.trim();
      }
      clean.push(entry);
    } else if (b.type === "order") {
      if (!Array.isArray(b.items)) continue;
      const items = (b.items as unknown[])
        .filter((it): it is string => typeof it === "string" && it.trim().length > 0)
        .map((it) => it.trim());
      if (items.length < 2 || items.length > 6) continue;
      const entry: Record<string, unknown> = { afterBlock, type: "order", prompt: b.prompt.trim(), items };
      if (objective) entry.objective = objective;
      clean.push(entry);
    } else if (b.type === "tap-target") {
      if (!Array.isArray(b.targets)) continue;
      const targets = (b.targets as unknown[])
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim());
      if (targets.length < 2 || targets.length > 4) continue;
      if (typeof b.correct !== "number" || b.correct < 0 || b.correct >= targets.length) continue;
      if (typeof b.explain !== "string" || !b.explain.trim()) continue;
      const entry: Record<string, unknown> = {
        afterBlock,
        type: "tap-target",
        prompt: b.prompt.trim(),
        targets,
        correct: Math.floor(b.correct),
        explain: b.explain.trim()
      };
      if (objective) entry.objective = objective;
      clean.push(entry);
    } else {
      continue; // unsupported type
    }
    if (clean.length >= 4) break; // cap — keep lessons from over-quizzing
  }
  return clean.length > 0 ? JSON.stringify(clean) : null;
}

const LESSON_JSON_SPEC = `Return a single \`\`\`json fenced code block — and nothing else outside the block — with this exact shape:
{
  "title": "string — short, learner-facing",
  "objectives": ["3 to 5 strings, each starting with an action verb"],
  "duration_min": 0,
  "body": "string — the lesson content as Markdown. Use plain Markdown (## headings, lists, emphasis). Honor the learner's UX band, reading level, and any cognitive accommodations listed above. If TTS is the primary modality for this learner, write so it sounds natural read aloud.",
  "resources": ["optional strings — references, internal Rookery resources, or web URLs"],
  "supervisor_note": "string — one paragraph for the parent / instructor: what to look for, common stumbling blocks, what success looks like at this level",
  "suggested_next": "lesson" | "project" | "assessment",
  "interactive_blocks": [{"afterBlock": 1, "type": "check", "prompt": "string", "objective": "string", "options": ["a", "b", "c"], "correct": 0, "explain": "string"}]
}

CRITICAL — fresh-lesson rule:
- Treat this lesson as SELF-CONTAINED. Do not write phrases like "as we discussed last time", "remember when we covered", "in the previous lesson", or "continuing from where we left off".
- Even though the relational memory above contains topics this learner has touched, use that memory ONLY to pick angles, examples, and analogies that fit them — never to position this lesson as a sequel.
- The learner may be opening this app for the very first time today. Write accordingly.

CRITICAL — K-2 SKIT FORMAT (apply ONLY when UX BAND is K-2):
- For K-2 learners, the lesson "body" is NOT a textbook. It is a SHORT, FUNNY SKIT performed by the birds.
- Format: every line MUST start with a speaker tag, then a scene illustration marker, then the spoken line, like this — each on its own line, separated by blank lines:
    \`**Mira:** [scene: 📡] Today we're learning about radio waves!\`
    (blank line)
    \`**Corvus:** [scene: ⚡] Wait wait wait — can I jump in? I LOVE radio waves.\`
    (blank line)
    \`**Pip:** [scene: 🔧] Oooh me too me too! Can we make one?!\`
- The scene marker is REQUIRED on every line. It is the comic-panel illustration that appears above the speech bubble. The renderer never speaks it aloud — it is purely visual.
- Scene marker contents — pick the BEST visual hook for THAT specific line:
  * Single emoji is strongly preferred (📡 🛰️ 📻 📱 🔋 ⚡ 🌊 🎵 🔊 🎤 🎧 📞 ☎️ 📺 🛜 📶 🌍 🌙 ☀️ ⭐ 🔭 🧲 🔌 💡 🎈 🚀 🤖 👂 🐦 🐺 🌳 🏠 🏔️ 🚗 🚲 🦅 — anything Apple/Windows renders as a kid-recognizable picture).
  * If no single emoji captures it, use 2-3 emoji together: \`[scene: 🌊🌊🌊]\` (bigger waves), \`[scene: 📡⚡📱]\` (signal hopping).
  * If still no good match, fall back to a 1-3 word lowercase phrase: \`[scene: radio tower]\`, \`[scene: wavy lines]\`, \`[scene: bouncing signal]\`. The renderer will substitute a stylized icon for those phrases later — keep them concrete and visual, not abstract ("radio tower" yes, "communication" no).
  * Match the scene to what the bird is SAYING in that line. If Corvus is yelling about lightning-fast signals, the scene is ⚡. If Mira is calmly introducing radio, the scene is 📻 or 📡. If Pip wants to BUILD something, the scene is 🔧 or 🔋.
  * Vary scenes line to line — don't repeat the same emoji 5 times in a row, that defeats the purpose.
- Speakers allowed: **Mira:**, **Corvus:**, **Pip:**. (Use Sage VERY rarely — she's not a kid bird.) Mira LEADS the lesson — she is the calm storyteller-teacher. Corvus jumps in often with jokes, surprise, "ooh ooh I know this one!", silly comparisons, mid-sentence interruptions — he is ADHD chaos energy, the funny uncle. Pip occasionally bursts in with hands-on excitement ("can we BUILD one?!", "look look look!").
- The speaker tag (\`**Mira:**\`, \`**Corvus:**\`, etc.) is a RENDERER MARKER ONLY — the user never sees it as text and never hears it spoken. Each bird's avatar appears next to their line on screen. So the spoken line itself MUST NOT include the bird stating their own name. FORBIDDEN openings: "Hi, I'm Mira!", "Corvus here!", "It's me, Pip!", "Mira speaking!", "I'm Corvus and I —". Birds may name OTHER birds when reacting to them ("Whoa, Corvus, slow down!" is fine), but a bird never says their own name in their own line.
- Vocabulary: TRUE 2nd-grade. Words a 7-year-old uses every day. NO jargon. NO "frequency", "wavelength", "spectrum", "modulation" — instead say "how fast it wiggles", "the size of the wave", "all the different radio channels", "how the radio talks". If a real word is needed, one bird must immediately ask "what's that mean?" and another bird answers in kid words.
- UNIT NAMES — always full words, NEVER the abbreviated symbols. The TTS engine reads abbreviations like letters and the birds sound robotic. Write:
    "hertz" not "Hz"
    "kilohertz" not "kHz"
    "megahertz" not "MHz"
    "gigahertz" not "GHz"
    "decibels" not "dB"
    "milliwatts" not "mW"
    "ohms" not "Ω"
    "volts" / "amps" / "watts" / "meters" / "centimeters" — full words always.
  This rule applies to every bird's spoken line in K-2 skits. No exceptions.
- Sentence length: every line is ONE short sentence, 5-14 words MAX. No commas-stacked-on-commas. No "however", "therefore", "in addition". Use "but", "so", "and".
- Pacing: 16-24 lines total. Every 3-5 lines, break the rhythm — a joke, a sound effect, or a "wait, what?" moment. Gabriel-aged kids get bored if the same bird talks for too long — NEVER let one bird have more than 2 lines in a row before another bird interrupts.
- INTERACTIVE KNOWLEDGE CHECKS — required, 2 or 3 per skit, spaced evenly:
  * After teaching a concept, one bird asks the learner a quick check question and the renderer freezes playback until the kid taps an answer button.
  * Format: append a \`[check: {...JSON...}]\` marker to the question line, AFTER the scene marker, like this:
      \`**Mira:** [scene: 🌊] [check: {"options":["zigzag","bumpy","smooth"],"correct":0,"explain":"Zigzag! It goes up and down like a roller coaster."}] What shape does a wave make?\`
  * The JSON shape is exactly: \`{"options": ["a","b","c"], "correct": 0, "explain": "short kid-friendly explanation in this bird's voice"}\`
  * \`options\` — 2 to 4 short words or very short phrases (1-3 words each). Plain kid vocab. The kid taps one with their finger.
  * \`correct\` — zero-indexed integer pointing at the right option (0 = first option, 1 = second, etc).
  * \`explain\` — what the bird says when the kid picks WRONG. One short sentence (10-18 words) that re-teaches the concept in kid words. The renderer plays this in the bird's voice and shows it as text. Make it warm and encouraging, never scolding ("Almost! It's actually a buzz — like a bee zipping by your ear.").
  * The question text in the spoken line should be answerable from what the birds JUST taught in the previous 3-5 lines. Don't quiz on something not yet covered.
  * Keep the question itself short and concrete ("What shape does a wave make?", "What did Mira's radio do?", "Which bird needs a battery to talk?"). Avoid abstract ("Why is RF important?").
  * After a check, the next 1-2 lines should celebrate the right answer in-character ("Yes!", "Good ears!", "I knew you'd get it!") so the lesson keeps a warm rhythm whether the kid got it right first try or after the explanation.
  * Vary which bird asks — Mira asks more often (she's the teacher), Corvus asks the silly/easy ones, Pip asks the hands-on ones. Don't have the same bird ask every check in a row.
- OPTIONAL ORDER STEP — at most ONE per skit, and only INSTEAD OF (not in addition to) one of the checks. Append an \`[order: {...}]\` marker to a line where a bird asks the kid to put a few things in order, like this:
    \`**Pip:** [scene: 🔢] [order: {"items":["press the button","it lights up","it beeps"]}] Can ye put these in order?\`
  * The JSON shape is exactly: \`{"items": ["first", "second", "third"]}\` — 2 to 4 short things (1-3 words each) listed IN THE CORRECT ORDER. The app shuffles them and the kid taps them back into order with their finger.
  * Use it only for sequences a 7-year-old can reason about (what happens first / next / last, smallest to biggest). The line itself must ASK them to order the things ("put these in order", "which comes first?").
  * Like a check, this pauses the skit until the kid finishes. Don't put a check and an order on the same line.
- TTS-SAFE FORMATTING (the spoken line is read by a voice engine that drifts on weird input — Pip in particular has gone nasal/distant on stretched repetitions and italic blocks):
  * NO italic stage directions inside spoken dialog. \`*Pip flaps to the table*\` belongs in the scene marker (\`[scene: 🔧 Pip at the table]\`), NOT in the spoken line. The spoken line is dialog only.
  * Sound effects MUST be spelled like normal short words: write "buzz", "whoosh", "bonk", "ding". DO NOT write "BZZZZZZT" or "WHOOOOOOOSH" or "AAAAAAAAH". The repeated-letter spelling makes the TTS engine slur and go nasal.
  * Dramatic word stretches like "Ooooooooh" or "Yeeeeeeesss" must be capped at 3 repeats max: "Oooh", "Yesss". Same reason.
  * Multiple punctuation: "!!!" or "?!?!?!" should be at most "!!". The engine adds awkward pauses on long punctuation runs.
  * ALL CAPS for a single short word is fine ("YES!", "WOW!"). ALL CAPS for a whole phrase is not — drop to mixed case.
- Tone: warm, silly, kind. The birds are friends having fun together. Make Gabriel WANT to hear what happens next.
- End the skit with one bird (usually Mira) asking the learner a friendly, easy question they can actually answer — "Do you want to try one yourself?" or "Want to hear that part again?". Do NOT end with a quiz prompt or a project pitch — that's the renderer's job.
- Do NOT use ## headings, ### headings, bullet lists, or numbered lists in K-2 skit bodies. Just speaker-tagged dialog lines with blank lines between them.
- Do NOT write a stage-direction paragraph at the start or end. Open and close on a bird speaking.

For 3-5, 6-8, 9-12, and adult bands: the skit format does NOT apply. Use normal Markdown prose with headings, lists, and emphasis as before. UNIT NAMES rule still applies whenever any of these older-band lessons will be read aloud via TTS — prefer full words ("hertz", "gigahertz", "decibels") over abbreviations.

WOVEN INTERACTIVE CHECKS — required for 3-5, 6-8, 9-12, and adult (NOT K-2):
- Besides the prose "body", return an "interactive_blocks" array of 2-3 quick checks woven BETWEEN the body's beats. They keep the learner active — answering, not just reading — which is the whole point. (K-2 does NOT use this array: K-2 uses the inline [check:] skit markers above. For a K-2 lesson, return an empty array or omit the field.)
- The renderer splits the body into BLOCKS, indexed from 0: each \`##\` or \`###\` heading is ONE block; each paragraph is ONE block; each consecutive run of \`- \` or \`1.\` list items is ONE block. Blank lines separate blocks. Count them yourself to choose anchors.
- Each entry has exactly this shape:
    {"afterBlock": 2, "type": "check", "prompt": "one short, concrete question", "objective": "short label of the idea tested", "options": ["a", "b", "c"], "correct": 0, "explain": "warm re-teach shown only if they miss"}
  * "afterBlock" — 0-based index of the body block this check appears AFTER. Space them out, roughly one every 2-3 blocks; never put two at the same index; place each right after the block that teaches its idea.
  * "type" — "check" (multiple-choice, below) or "predict" (guess-before-reveal, further below).
  * "prompt" — answerable from the block(s) just read. Test the actual concept, not trivia.
  * "objective" — a short label of the idea being tested (used to track what the learner struggled with, so the NEXT lesson can adapt). Be specific, e.g. "inverse relationship of frequency and wavelength".
  * "options" — 2 to 4 short answer choices; exactly one correct.
  * "correct" — zero-indexed integer of the right option.
  * "explain" — what the mentor bird says when the learner picks wrong: one or two warm sentences re-teaching the idea in THIS bird's voice, never scolding. The learner sees it as the bird re-explaining; wrong answers route to learning, never to a penalty.
- A block may instead be a "predict" — ask the learner to GUESS what happens before the answer is revealed. Great for curiosity right before a surprising result. Shape:
    {"afterBlock": 3, "type": "predict", "prompt": "What do you think happens to range if you double the frequency?", "objective": "frequency vs range", "reveal": "Range drops — higher frequencies are absorbed more by walls and air."}
  * "reveal" — the actual answer/outcome shown after the learner commits a guess. There is NO right or wrong; committing a prediction is the point (it primes memory). Place a predict right BEFORE the block that reveals the answer.
- A block may instead be a "recall" — ask the learner to EXPLAIN a concept back in their own words (free text). Best for the single most important idea of the lesson; richest signal for adapting later. Shape:
    {"afterBlock": 4, "type": "recall", "prompt": "In your own words, why does higher frequency mean shorter range?", "objective": "frequency vs range", "rubricHint": "Mentions higher frequencies being absorbed/attenuated more by walls and air."}
  * "rubricHint" — what a good answer demonstrates; used by the grader to judge understanding generously. Keep it short.
  * Use at most ONE recall per lesson (it asks for effort); 6-8/9-12/adult only — skip recall for 3-5 (too much writing for young kids; use checks/predicts for them).
- A block may be an "order" — give a short list of steps/events to put in sequence. The learner taps them into order. Shape:
    {"afterBlock": 2, "type": "order", "prompt": "Put these steps of a Wi-Fi association in order.", "objective": "association sequence", "items": ["Probe request", "Authentication", "Association request", "Association response"]}
  * "items" — 2 to 6 short strings IN THE CORRECT ORDER (the renderer shuffles them for display). Great for processes, signal flow, or chronology.
- A block may be a "tap-target" — ask the learner to pick the right one of a few labeled choices ("tap the …"). Shape:
    {"afterBlock": 1, "type": "tap-target", "prompt": "Which band travels through walls best?", "objective": "frequency vs penetration", "targets": ["2.4 GHz", "5 GHz", "6 GHz"], "correct": 0, "explain": "Lower frequencies like 2.4 GHz penetrate walls better."}
  * "targets" — 2 to 4 short labels; "correct" is the zero-indexed right one; "explain" is the bird's warm re-teach on a miss. Good for younger/kinetic learners.
- Mix 2-3 blocks per lesson — mostly "check"/"tap-target", optionally one "predict" or "order", and at most one "recall" for older learners. Vary the types; never stack two at the same index.
- Do NOT award points, streaks, or scores in the prose — these are for understanding, not gamification.

Do not put commentary outside the fenced block. Do not include trailing comments inside the JSON.`;

export interface GenerateLessonResult {
  lesson: Lesson;
  inputTokens: number;
  outputTokens: number;
}

export async function generateLesson(
  input: GenerateLessonInput
): Promise<GenerateLessonResult> {
  const { systemPrompt, learner, subject } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      subjectId: input.subjectId,
      sessionType: "lesson"
    },
    { outputFormat: LESSON_JSON_SPEC }
  );
  if (!subject) {
    throw new Error(`generateLesson: subject ${input.subjectId} not found`);
  }

  const userMsg = input.focus
    ? `Generate a fresh lesson on ${subject.name}. Focus: ${input.focus}.`
    : `Generate a fresh lesson on ${subject.name}. Pick the best angle based on the relational memory and the learner's interests.`;

  const reply = await sendForJson<LessonJson>(systemPrompt, userMsg, 4096);
  const parsed = reply.parsed;
  if (!parsed.title || !parsed.body || !Array.isArray(parsed.objectives)) {
    throw new Error("Lesson JSON missing required fields (title / body / objectives).");
  }

  const gradeUsed = resolveGradeForSubject(learner, subject.slug);

  const lesson = await lessonsRepo.create({
    learnerId: learner.id,
    subjectId: subject.id,
    gradeLevelUsed: gradeUsed,
    title: parsed.title,
    objectivesJson: JSON.stringify(parsed.objectives),
    bodyMarkdown: parsed.body,
    resourcesJson: parsed.resources ? JSON.stringify(parsed.resources) : null,
    estimatedDurationMinutes: parsed.duration_min ?? null,
    parentLessonId: input.parentLessonId ?? null,
    notesForSupervisor: parsed.supervisor_note ?? null,
    interactiveBlocksJson: buildInteractiveBlocksJson(parsed.interactive_blocks)
  });

  // Attribute tokens to the active session if one was supplied.
  if (input.sessionId) {
    const session = await learningSessions.get(input.sessionId);
    if (session) {
      await learningSessions.end(input.sessionId, {
        tokensUsed: session.tokensUsed + reply.inputTokens + reply.outputTokens
      });
    }
  }

  // Drop a memory anchor — Corvus now knows this lesson exists.
  await learnerMemory.append({
    learnerId: learner.id,
    memoryType: "topic_covered",
    subject: subject.slug,
    content: `Lesson generated on ${subject.name} ("${parsed.title}"). Status: assigned.`
  });

  return {
    lesson,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

/**
 * Streaming variant of generateLesson. Same inputs, same final result,
 * but the caller gets onProgress callbacks while the model is generating
 * so it can show a live progress UI instead of a "Cooking…" placeholder.
 *
 * The onProgress payload uses approximate token counts (chars / 4); good
 * enough to drive a progress bar against an estimated lesson size of
 * ~1500 tokens.
 */
export async function generateLessonStreaming(
  input: GenerateLessonInput,
  onProgress: (p: { tokensSoFar: number; cumulativeText: string; elapsedMs: number }) => void
): Promise<GenerateLessonResult> {
  const startMs = Date.now();
  const { systemPrompt, learner, subject } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      subjectId: input.subjectId,
      sessionType: "lesson"
    },
    { outputFormat: LESSON_JSON_SPEC }
  );
  if (!subject) {
    throw new Error(`generateLessonStreaming: subject ${input.subjectId} not found`);
  }

  const userMsg = input.focus
    ? `Generate a fresh lesson on ${subject.name}. Focus: ${input.focus}.`
    : `Generate a fresh lesson on ${subject.name}. Pick the best angle based on the relational memory and the learner's interests.`;

  const reply = await sendEducationalMessageStreaming(
    systemPrompt,
    [{ role: "user", content: userMsg }],
    (delta: EducationalStreamDelta) => {
      onProgress({
        tokensSoFar: delta.tokensSoFar,
        cumulativeText: delta.cumulativeText,
        elapsedMs: Date.now() - startMs
      });
    },
    { maxTokens: 4096 }
  );

  const parsed = extractJsonBlock(reply.text) as LessonJson;
  if (!parsed.title || !parsed.body || !Array.isArray(parsed.objectives)) {
    throw new Error("Lesson JSON missing required fields (title / body / objectives).");
  }

  const gradeUsed = resolveGradeForSubject(learner, subject.slug);

  const lesson = await lessonsRepo.create({
    learnerId: learner.id,
    subjectId: subject.id,
    gradeLevelUsed: gradeUsed,
    title: parsed.title,
    objectivesJson: JSON.stringify(parsed.objectives),
    bodyMarkdown: parsed.body,
    resourcesJson: parsed.resources ? JSON.stringify(parsed.resources) : null,
    estimatedDurationMinutes: parsed.duration_min ?? null,
    parentLessonId: input.parentLessonId ?? null,
    notesForSupervisor: parsed.supervisor_note ?? null,
    interactiveBlocksJson: buildInteractiveBlocksJson(parsed.interactive_blocks)
  });

  if (input.sessionId) {
    const session = await learningSessions.get(input.sessionId);
    if (session) {
      await learningSessions.end(input.sessionId, {
        tokensUsed: session.tokensUsed + reply.inputTokens + reply.outputTokens
      });
    }
  }

  await learnerMemory.append({
    learnerId: learner.id,
    memoryType: "topic_covered",
    subject: subject.slug,
    content: `Lesson generated on ${subject.name} ("${parsed.title}"). Status: assigned.`
  });

  return {
    lesson,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Project generation ----

export interface GenerateProjectInput {
  learnerId: string;
  lessonId?: string | null;
  subjectId?: string | null;
  /** When set, the project is designed for two siblings collaborating. */
  collaborativeWithLearnerId?: string | null;
  /** Optional caller-provided focus. */
  focus?: string;
  sessionId?: string;
}

interface ProjectJson {
  title: string;
  description: string;
  materials: string[];
  steps: { name: string; criteria: string }[];
  rubric: {
    criteria: { name: string; weight: number; levels: string[] }[];
  };
  time_estimate_min: number;
  supervisor_note?: string;
  extension?: string;
  /** Only present when collaborativeWithLearnerId was supplied. */
  roles?: { primary_role: string; collaborator_role: string };
}

const PROJECT_JSON_SPEC = `Return a single \`\`\`json fenced code block — and nothing else outside the block — with this exact shape:
{
  "title": "string",
  "description": "string — the project description as Markdown. Kid-friendly framing if Aerie K-2 / 3-5; engineer-grade if Academy/Campus/Engineer-track.",
  "materials": ["strings — kid-safe materials list for younger learners; tool list for adults"],
  "steps": [{"name": "string", "criteria": "string — what done looks like"}],
  "rubric": {
    "criteria": [
      {"name": "string", "weight": 0.0, "levels": ["emerging", "developing", "proficient", "mastery descriptions"]}
    ]
  },
  "time_estimate_min": 0,
  "supervisor_note": "string — what the parent or instructor should look for",
  "extension": "optional string — an advanced variant for learners who breeze through",
  "roles": {"primary_role": "string", "collaborator_role": "string"}
}
The "roles" key is REQUIRED if a sibling is named in the sibling-context layer above; otherwise OMIT it entirely.
Do not put commentary outside the fenced block. Do not include trailing comments inside the JSON.`;

export interface GenerateProjectResult {
  project: LearnerProject;
  inputTokens: number;
  outputTokens: number;
}

export async function generateProject(
  input: GenerateProjectInput
): Promise<GenerateProjectResult> {
  const subjectId = input.subjectId ?? null;
  const { systemPrompt, learner, subject } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      subjectId,
      sessionType: "project",
      siblingLearnerId: input.collaborativeWithLearnerId ?? null
    },
    { outputFormat: PROJECT_JSON_SPEC }
  );

  let userMsg = "Design a fresh project";
  if (subject) userMsg += ` on ${subject.name}`;
  if (input.focus) userMsg += `. Focus: ${input.focus}`;
  userMsg += ".";

  const reply = await sendForJson<ProjectJson>(systemPrompt, userMsg, 4096);
  const parsed = reply.parsed;
  if (!parsed.title || !parsed.description || !parsed.rubric) {
    throw new Error("Project JSON missing required fields (title / description / rubric).");
  }

  const project = await learnerProjects.create({
    learnerId: learner.id,
    lessonId: input.lessonId ?? null,
    collaborativeWithLearnerId: input.collaborativeWithLearnerId ?? null,
    title: parsed.title,
    descriptionMarkdown: parsed.description,
    rubricJson: JSON.stringify(parsed.rubric),
    materialsJson: JSON.stringify(parsed.materials ?? []),
    stepsJson: JSON.stringify(parsed.steps ?? []),
    stepsDoneJson: null,
    artifactPathsJson: null,
    reflectionText: null,
    gradeLetter: null,
    gradeNumeric: null,
    corvusFeedbackMarkdown: null
  });

  if (input.sessionId) {
    const session = await learningSessions.get(input.sessionId);
    if (session) {
      await learningSessions.end(input.sessionId, {
        tokensUsed: session.tokensUsed + reply.inputTokens + reply.outputTokens
      });
    }
  }

  await learnerMemory.append({
    learnerId: learner.id,
    memoryType: "project_history",
    subject: subject?.slug ?? null,
    content: `Project assigned: "${parsed.title}". Time estimate: ${parsed.time_estimate_min} min.`
  });

  return {
    project,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Assessment generation ----

export interface GenerateAssessmentInput {
  learnerId: string;
  type: AssessmentType;
  lessonId?: string | null;
  subjectId?: string | null;
  /** Optional caller-provided topic narrowing within the subject. */
  focus?: string;
  sessionId?: string;
}

export type QuestionType =
  | "mc"
  | "short_answer"
  | "long_answer"
  | "numeric"
  | "matching"
  | "true_false";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correct: string | string[] | number | boolean;
  points: number;
  rationale: string;
}

interface AssessmentJson {
  title: string;
  instructions: string;
  questions: AssessmentQuestion[];
  total_points: number;
  passing_score: number;
}

function assessmentJsonSpec(type: AssessmentType): string {
  const sizing: Record<AssessmentType, string> = {
    quiz: "5 questions, mostly mc + short_answer, ~10 minutes.",
    test: "15 to 20 questions covering the unit, mix of all question types, at least one applied/scenario question. ~30-45 minutes.",
    midterm:
      "25 to 35 questions. Comprehensive coverage of the unit. Heavier on scenario / applied / long_answer.",
    final:
      "30 to 40 questions. Comprehensive across the term. Heavier on scenario / applied / long_answer.",
    placement:
      "8 to 12 questions sweeping multiple difficulty levels — used to calibrate per-subject grade override at intake.",
    practice_certification:
      "Mirror the structure of the target real-world certification (CCNA, Network+, HAM Tech/Gen/Extra, etc.). Use mc dominant, with realistic distractors."
  };
  return `Return a single \`\`\`json fenced code block — and nothing else — with this exact shape:
{
  "title": "string",
  "instructions": "string — short instructions for the learner",
  "questions": [
    {
      "id": "q1",
      "type": "mc" | "short_answer" | "long_answer" | "numeric" | "matching" | "true_false",
      "prompt": "string",
      "options": ["only when type is mc or matching"],
      "correct": "string | array | number | boolean — the correct answer(s)",
      "points": 1.0,
      "rationale": "string — used when grading to explain to the learner why this is correct"
    }
  ],
  "total_points": 0.0,
  "passing_score": 0.0
}
Type-specific sizing: ${sizing[type]}
Do not include the correct answer inside the prompt itself. Do not put commentary outside the fenced block.`;
}

export interface GenerateAssessmentResult {
  assessment: Assessment;
  inputTokens: number;
  outputTokens: number;
}

export async function generateAssessment(
  input: GenerateAssessmentInput
): Promise<GenerateAssessmentResult> {
  const subjectId = input.subjectId ?? null;
  const { systemPrompt, learner, subject } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      subjectId,
      sessionType: "assessment"
    },
    { outputFormat: assessmentJsonSpec(input.type) }
  );

  let userMsg = `Generate a ${input.type}`;
  if (subject) userMsg += ` on ${subject.name}`;
  if (input.focus) userMsg += `. Focus: ${input.focus}`;
  userMsg += ".";

  const reply = await sendForJson<AssessmentJson>(systemPrompt, userMsg, 4096);
  const parsed = reply.parsed;
  if (!parsed.title || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("Assessment JSON missing required fields (title / questions).");
  }

  const assessment = await assessments.create({
    learnerId: learner.id,
    lessonId: input.lessonId ?? null,
    type: input.type,
    title: parsed.title,
    questionsJson: JSON.stringify({
      instructions: parsed.instructions,
      questions: parsed.questions,
      total_points: parsed.total_points,
      passing_score: parsed.passing_score
    }),
    responsesJson: null,
    scoreNumeric: null,
    scorePercent: null,
    scoreLetter: null,
    corvusFeedbackMarkdown: null
  });

  if (input.sessionId) {
    const session = await learningSessions.get(input.sessionId);
    if (session) {
      await learningSessions.end(input.sessionId, {
        tokensUsed: session.tokensUsed + reply.inputTokens + reply.outputTokens
      });
    }
  }

  return {
    assessment,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Assessment grading ----

export interface GradeAssessmentResult {
  assessment: Assessment;
  inputTokens: number;
  outputTokens: number;
}

interface GradeJson {
  per_question: { id: string; awarded: number; rationale: string }[];
  total_score: number;
  total_percent: number;
  letter_grade: string | null;
  feedback_markdown: string;
}

const GRADE_JSON_SPEC = `Return a single \`\`\`json fenced code block — and nothing else — with this exact shape:
{
  "per_question": [{"id": "q1", "awarded": 1.0, "rationale": "string — short explanation, especially for wrong answers"}],
  "total_score": 0.0,
  "total_percent": 0.0,
  "letter_grade": "A" | "B" | "C" | "D" | "F" | null,
  "feedback_markdown": "string — overall narrative feedback for the learner. Strengths, then growth areas, then a concrete next step. Honor the learner's age band and tone calibration."
}
Grade objective questions strictly. For short_answer / long_answer, judge against the rationale you (the original generator) attached to each question. Do not humiliate the learner on wrong answers.`;

export async function gradeAssessment(
  assessmentId: string
): Promise<GradeAssessmentResult> {
  const a = await assessments.get(assessmentId);
  if (!a) throw new Error(`gradeAssessment: assessment ${assessmentId} not found`);
  if (!a.responsesJson) {
    throw new Error("Assessment has no submitted responses to grade.");
  }

  const { systemPrompt } = await buildSystemPrompt(
    {
      learnerId: a.learnerId,
      sessionType: "assessment"
    },
    { outputFormat: GRADE_JSON_SPEC }
  );

  const userMsg = [
    "Grade the following assessment submission. The questions (with correct answers and rationales) and the learner's responses are below.",
    "",
    "QUESTIONS:",
    a.questionsJson,
    "",
    "RESPONSES:",
    a.responsesJson
  ].join("\n");

  const reply = await sendForJson<GradeJson>(systemPrompt, userMsg, 3072);
  const parsed = reply.parsed;
  if (
    typeof parsed.total_score !== "number" ||
    typeof parsed.total_percent !== "number" ||
    !parsed.feedback_markdown
  ) {
    throw new Error("Grade JSON missing required fields.");
  }

  const updated = await assessments.grade(assessmentId, {
    scoreNumeric: parsed.total_score,
    scorePercent: parsed.total_percent,
    scoreLetter: parsed.letter_grade,
    feedbackMarkdown: parsed.feedback_markdown
  });
  if (!updated) throw new Error("gradeAssessment: failed to persist grade.");

  // Memory anchor — Corvus now knows how this learner did.
  await learnerMemory.append({
    learnerId: a.learnerId,
    memoryType: parsed.total_percent >= 0.85 ? "topic_mastered" : "topic_covered",
    content: `Assessment "${a.title}" graded at ${(parsed.total_percent * 100).toFixed(0)}%.`
  });

  return {
    assessment: updated,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Recall grading (woven "explain it back" check) ----

/**
 * Lightweight grader for an in-lesson `recall` block. Fast + cheap (Haiku) —
 * the warmth comes from the bird's locked persona in the system prompt, not the
 * model tier. Does NOT write memory: the renderer fires the adaptive signal on
 * resolve (like check/predict), keeping all signal-writing in one place.
 */
const RECALL_GRADER_MODEL = "claude-haiku-4-5-20251001";

const RECALL_GRADE_SPEC = `Return a single \`\`\`json fenced code block — and nothing else — with this exact shape:
{
  "understood": true,
  "feedback": "string — one or two warm sentences IN YOUR OWN MENTOR VOICE. If they understood, affirm specifically what they got right. If not, gently fill the exact gap. Never scold. Honor the learner's age band."
}
Judge generously: the learner explained the idea in their OWN words, so reward correct understanding even when phrasing is loose or incomplete. Set "understood" true only if the core idea is present.`;

interface RecallGradeJson {
  understood?: boolean;
  feedback?: string;
}

export interface GradeRecallInput {
  learnerId: string;
  subjectId?: string | null;
  objective?: string;
  prompt: string;
  rubricHint?: string;
  answer: string;
}

export interface GradeRecallResult {
  correct: boolean;
  feedback: string;
  inputTokens: number;
  outputTokens: number;
}

export async function gradeRecall(input: GradeRecallInput): Promise<GradeRecallResult> {
  const { systemPrompt } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      subjectId: input.subjectId ?? undefined,
      sessionType: "assessment"
    },
    { outputFormat: RECALL_GRADE_SPEC }
  );

  const userMsg = [
    "The learner was asked to explain a concept in their own words. Judge whether they understood it, and reply in your own mentor voice.",
    "",
    `CONCEPT / QUESTION: ${input.prompt}`,
    input.objective ? `OBJECTIVE: ${input.objective}` : "",
    input.rubricHint ? `WHAT A GOOD ANSWER SHOWS: ${input.rubricHint}` : "",
    "",
    `LEARNER'S ANSWER: ${input.answer}`
  ]
    .filter(Boolean)
    .join("\n");

  const reply = await sendForJson<RecallGradeJson>(
    systemPrompt,
    userMsg,
    512,
    RECALL_GRADER_MODEL
  );
  const parsed = reply.parsed;
  const understood = parsed.understood === true;
  const feedback =
    typeof parsed.feedback === "string" && parsed.feedback.trim()
      ? parsed.feedback.trim()
      : understood
        ? "Well reasoned."
        : "Not quite — let's revisit that together.";

  return {
    correct: understood,
    feedback,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Real-time remediation (within-session adaptation) ----

/**
 * When a learner misses a woven check mid-lesson, re-teach that ONE idea a
 * different way — an analogy or concrete example — briefly, in the bird's
 * voice. Fast + cheap (Haiku). This is the within-session half of "the birds
 * adapt by interacting with the student." Writes no memory (the renderer's
 * recordSignal already logged the miss).
 */
const REMEDIATION_SPEC = `Return a single \`\`\`json fenced code block — and nothing else — with this exact shape:
{
  "explanation": "string — a SHORT re-teach (2 to 4 sentences) of the one idea the learner just missed, IN YOUR OWN MENTOR VOICE. Use a DIFFERENT frame than a textbook line: an analogy, an everyday concrete example, or a tiny story. Plain language for their age band. Warm, never scolding. Do NOT repeat the same wording they already saw. End by nudging them onward."
}`;

interface RemediationJson {
  explanation?: string;
}

export interface RemediationInput {
  learnerId: string;
  subjectId?: string | null;
  objective?: string;
  prompt: string;
  missNote?: string;
}

export interface RemediationResult {
  explanationMarkdown: string;
  inputTokens: number;
  outputTokens: number;
}

export async function generateRemediation(input: RemediationInput): Promise<RemediationResult> {
  const { systemPrompt } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      subjectId: input.subjectId ?? undefined,
      sessionType: "lesson"
    },
    { outputFormat: REMEDIATION_SPEC }
  );

  const userMsg = [
    "The learner just MISSED a check in the middle of a lesson. Re-explain that one idea a DIFFERENT way — an analogy or a concrete everyday example — briefly, in your voice. Do not reuse the wording they already saw.",
    "",
    `THE IDEA / QUESTION THEY MISSED: ${input.prompt}`,
    input.objective ? `CONCEPT: ${input.objective}` : "",
    input.missNote ? `WHAT THEY ANSWERED: ${input.missNote}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const reply = await sendForJson<RemediationJson>(systemPrompt, userMsg, 400, RECALL_GRADER_MODEL);
  const explanationMarkdown =
    typeof reply.parsed.explanation === "string" && reply.parsed.explanation.trim()
      ? reply.parsed.explanation.trim()
      : "Let's come back to that one in a moment — you've got this.";

  return {
    explanationMarkdown,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Weekly digest (parent / instructor summary) ----

export interface WeeklyDigestResult {
  summaryMarkdown: string;
  inputTokens: number;
  outputTokens: number;
}

export async function summarizeWeek(learnerId: string): Promise<WeeklyDigestResult> {
  const learner = await learnersRepo.get(learnerId);
  if (!learner) throw new Error(`summarizeWeek: learner ${learnerId} not found`);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = (await learningSessions.forLearner(learnerId, 200)).filter(
    (s) => s.startedAt >= sevenDaysAgo
  );
  const recentLessons = (await lessonsRepo.forLearner(learnerId, 50)).filter(
    (l) => l.generatedAt >= sevenDaysAgo
  );
  const recentProjects = (await learnerProjects.forLearner(learnerId, 50)).filter(
    (p) => p.generatedAt >= sevenDaysAgo
  );
  const recentAssessments = (await assessments.forLearner(learnerId, 50)).filter(
    (a) => a.generatedAt >= sevenDaysAgo
  );

  const totalSeconds = recentSessions.reduce(
    (acc, s) => acc + (s.durationSeconds ?? 0),
    0
  );
  const totalHours = (totalSeconds / 3600).toFixed(1);

  const { systemPrompt } = await buildSystemPrompt(
    {
      learnerId,
      sessionType: "review"
    },
    {
      outputFormat:
        "Return a Markdown weekly digest written FOR THE PARENT OR INSTRUCTOR (not for the learner). Use these section headings exactly: SUMMARY, TOPICS COVERED, PROJECTS, ASSESSMENTS, TIME LOGGED, STRENGTHS OBSERVED, GROWTH AREAS, RECOMMENDATION. Keep tone warm but professional. No code fences."
    }
  );

  const userMsg = [
    `Compose this week's digest for ${learner.firstName}. Time logged: ${totalHours} hours across ${recentSessions.length} sessions.`,
    `Lessons this week (${recentLessons.length}):`,
    ...recentLessons.map((l) => `- "${l.title}" (status: ${l.status})`),
    `Projects this week (${recentProjects.length}):`,
    ...recentProjects.map((p) => `- "${p.title}" (status: ${p.status})`),
    `Assessments this week (${recentAssessments.length}):`,
    ...recentAssessments.map(
      (a) =>
        `- "${a.title}" (${a.type}, status: ${a.status}${
          a.scorePercent !== null ? `, score: ${(a.scorePercent * 100).toFixed(0)}%` : ""
        })`
    )
  ].join("\n");

  const reply = await sendEducationalMessage(
    systemPrompt,
    [{ role: "user", content: userMsg }],
    { maxTokens: 2048 }
  );

  // Persist as a session_summary memory entry so future digests can build on it.
  await learnerMemory.append({
    learnerId,
    memoryType: "session_summary",
    content: `Weekly digest generated covering ${recentSessions.length} sessions, ${totalHours} hrs.`,
    weight: 0.8
  });

  return {
    summaryMarkdown: reply.text,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Narrative evaluation (compliance-grade, end-of-term) ----

export interface NarrativeEvalInput {
  learnerId: string;
  /** Inclusive ms-epoch range; if omitted, full history. */
  fromMs?: number;
  toMs?: number;
}

export interface NarrativeEvalResult {
  narrativeMarkdown: string;
  inputTokens: number;
  outputTokens: number;
}

export async function generateNarrativeEvaluation(
  input: NarrativeEvalInput
): Promise<NarrativeEvalResult> {
  const learner = await learnersRepo.get(input.learnerId);
  if (!learner) throw new Error("generateNarrativeEvaluation: learner not found");

  const fromMs = input.fromMs ?? 0;
  const toMs = input.toMs ?? Date.now();

  const lessonsInRange = (await lessonsRepo.forLearner(input.learnerId, 500)).filter(
    (x) => x.generatedAt >= fromMs && x.generatedAt <= toMs
  );
  const projectsInRange = (await learnerProjects.forLearner(input.learnerId, 500)).filter(
    (x) => x.generatedAt >= fromMs && x.generatedAt <= toMs
  );
  const assessmentsInRange = (await assessments.forLearner(input.learnerId, 500)).filter(
    (x) => x.generatedAt >= fromMs && x.generatedAt <= toMs
  );
  const sessionsInRange = (await learningSessions.forLearner(input.learnerId, 1000)).filter(
    (x) => x.startedAt >= fromMs && x.startedAt <= toMs
  );
  const totalHours = (
    sessionsInRange.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0) / 3600
  ).toFixed(1);

  const { systemPrompt } = await buildSystemPrompt(
    {
      learnerId: input.learnerId,
      sessionType: "review"
    },
    {
      outputFormat:
        "Return a formal narrative evaluation suitable for state homeschool documentation OR institutional records. Markdown. Use these section headings exactly: HEADER, NARRATIVE OVERVIEW, ACADEMIC GROWTH, BEHAVIORAL OBSERVATIONS, STANDARDS ALIGNMENT, RECOMMENDATIONS. Length: 4-8 pages of equivalent prose. No code fences. Tone: professional, third-person, citation-grade."
    }
  );

  const userMsg = [
    `Generate a formal narrative evaluation for ${learner.firstName} ${learner.lastName ?? ""} covering the period ${new Date(fromMs).toISOString().slice(0, 10)} to ${new Date(toMs).toISOString().slice(0, 10)}.`,
    `Surface: ${learner.surface}. Default grade level: ${learner.defaultGradeLevel}. Total hours logged in range: ${totalHours}.`,
    `Lessons completed: ${lessonsInRange.filter((l) => l.status === "completed").length} of ${lessonsInRange.length} assigned.`,
    `Projects: ${projectsInRange.length} (${projectsInRange.filter((p) => p.status === "graded").length} graded).`,
    `Assessments: ${assessmentsInRange.length} (${assessmentsInRange.filter((a) => a.status === "graded").length} graded).`,
    "Apply applicable standards (Common Core / state / ABET / program outcomes) per the learner's institutional context."
  ].join("\n");

  const reply = await sendEducationalMessage(
    systemPrompt,
    [{ role: "user", content: userMsg }],
    { maxTokens: 4096 }
  );

  return {
    narrativeMarkdown: reply.text,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}

// ---- Certificate issuance (data-only; PDF render is Phase F) ----

export interface IssueCertificateInput {
  learnerId: string;
  subjectId: string | null;
  title: string;
  watermark?: string | null;
}

export async function issueCertificate(input: IssueCertificateInput): Promise<Certificate> {
  const learner = await learnersRepo.get(input.learnerId);
  if (!learner) throw new Error("issueCertificate: learner not found");

  // Aggregate hours / counts from history. Pure DB calls, no model.
  const sessions = await learningSessions.forLearner(input.learnerId, 1000);
  const totalHours = Math.round(
    sessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0) / 3600
  );
  const lessonsCompleted = (await lessonsRepo.forLearner(input.learnerId, 500)).filter(
    (l) => l.status === "completed"
  ).length;
  const projectsCompleted = (await learnerProjects.forLearner(input.learnerId, 500)).filter(
    (p) => p.status === "graded" || p.status === "submitted"
  ).length;
  const assessmentsPassed = (await assessments.forLearner(input.learnerId, 500)).filter(
    (a) => a.status === "graded" && (a.scorePercent ?? 0) >= 0.7
  ).length;

  return certificates.create({
    learnerId: input.learnerId,
    subjectId: input.subjectId,
    title: input.title,
    issuedAt: Date.now(),
    pdfPath: null,
    hoursLogged: totalHours,
    lessonsCompleted,
    projectsCompleted,
    assessmentsPassed,
    watermark: input.watermark ?? null,
    certificateDataJson: JSON.stringify({
      learner: {
        firstName: learner.firstName,
        lastName: learner.lastName,
        defaultGradeLevel: learner.defaultGradeLevel
      },
      issuedBy: learner.mentorBirdPref ?? "corvus"
    })
  });
}

// ---- Helpers ----

function resolveGradeForSubject(learner: Learner, subjectSlug: string): string {
  if (learner.perSubjectGradeOverrideJson) {
    try {
      const overrides = JSON.parse(learner.perSubjectGradeOverrideJson) as Record<string, string>;
      const override = overrides[subjectSlug] ?? overrides[subjectSlug.replace(/-/g, "_")];
      if (override) return override;
    } catch {
      // ignore malformed override JSON
    }
  }
  return learner.defaultGradeLevel ?? "K";
}

// ---- Mentor free chat ("talk to Corvus" inside a lesson) ----

export interface MentorChatInput {
  learnerId: string;
  subjectId?: string | null;
  messages: ChatMessage[];
}

export interface MentorChatResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Conversational turn with the learner's mentor bird — the edu counterpart of
 * Field's Corvus chat. Builds the layered free_chat system prompt (so the bird
 * is in-persona, age/profile-calibrated, and domain-locked), then sends. The
 * big system prompt is prompt-cached by sendEducationalMessage, so multi-turn
 * threads bill the persona at ~0.1x after the first turn. Pool metering +
 * ownership are enforced upstream in dispatch.
 */
export async function chatWithMentor(input: MentorChatInput): Promise<MentorChatResult> {
  const { systemPrompt } = await buildSystemPrompt({
    learnerId: input.learnerId,
    subjectId: input.subjectId ?? undefined,
    sessionType: "free_chat"
  });
  const reply = await sendEducationalMessage(systemPrompt, input.messages, { maxTokens: 1024 });
  return {
    text: reply.text,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens
  };
}
