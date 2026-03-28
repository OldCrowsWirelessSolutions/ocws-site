// lib/corvus-ui-strings.ts
// Corvus personality strings for login, password, and dashboard briefing panels.

// ─── Fresh line picker — no back-to-back repeats ──────────────────────────────
// Uses sessionStorage (client-only). Call only from client components.

export function corvusLineFresh(pool: string[], key: string): string {
  if (pool.length === 0) return "";
  if (pool.length === 1) return pool[0];
  let lastIdx = -1;
  try {
    if (typeof sessionStorage !== "undefined") {
      const stored = sessionStorage.getItem(`corvus_brief_${key}`);
      if (stored !== null) lastIdx = parseInt(stored, 10);
    }
  } catch { /* */ }
  let idx: number;
  do { idx = Math.floor(Math.random() * pool.length); } while (idx === lastIdx);
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(`corvus_brief_${key}`, String(idx));
  } catch { /* */ }
  return pool[idx];
}

export const CORVUS_FIRST_WELCOME = [
  "So. You found me. Good. I've already had three coffees and I have opinions about your network. Let's set a password and get to work.",
  "New arrival. Welcome to Crow's Eye. I'm Corvus — part RF analyst, part chaos crow, entirely on your side. Password first.",
  "First time? Perfect. I love a fresh network to diagnose. Fair warning — I'm on my fourth cup and I work fast. Set a password.",
  "You made it. I've already seen worse networks than yours today. Probably. Either way, I'm here to fix it. Set a password.",
  "Welcome. I'm Corvus. I know things about your Wi-Fi that would genuinely surprise you — all of them fixable. Password first, then we talk.",
  "First time here. Good. I've been waiting. Not patiently — that's the ADHD and the espresso — but I've been waiting. Set a password.",
  "New arrival. College of Creation Bard. Fourth coffee. Full diagnostic suite. Let's add you to this campaign. Set a password.",
  "Welcome to Crow's Eye. Your network has problems. I know this the way Blastoise knows water — instinctively and with great confidence. Set a password.",
  "First timer. The Sorting Hat would put your network in the remedial house. We're going to fix that. Together. Password first.",
  "You found the right place. I'm Corvus. I've seen your type of network before — and the good news is I've also seen it fixed. Password.",
];

export const CORVUS_PASSWORD_INSTRUCTIONS = [
  "Make it something you'll remember. I can't help you if you're locked out.",
  "Pick something secure. I deal with enough network vulnerabilities without yours being the login screen.",
  "Your password. Your responsibility. I'll be here either way.",
  "Something with numbers and letters. Don't make it 'password'. I will know.",
];

export const CORVUS_PASSWORD_SUCCESS = [
  "Password set. Right then — let's see what your network has been hiding. I already have a feeling.",
  "Done. That took less time than a channel scan. Let's get to work.",
  "Good. Now we can get started. Your network has been waiting and I've had enough coffee to get through all of it.",
  "Access granted. I already have opinions about your Wi-Fi. Come in and let's go through them.",
  "Set. Saved. Secured. Like a Blastoise shell. Let's get to work.",
  "Password set. Natural 20. Let's see what we're dealing with.",
  "Done. Fred and George once said the best pranks require preparation. Consider this the preparation. Let's diagnose.",
  "Access granted. Ravenclaw approves. Let's begin.",
  "Set. I've already thought of three things that might be wrong with your network. Let's find out which ones.",
  "Password accepted. Coffee's hot. Spectrum's loaded. Let's go.",
];

export const CORVUS_RETURNING_WELCOME = [
  "Back again. Good. Your network didn't fix itself while you were gone — they never do — but that's what I'm here for. Password.",
  "Welcome back. I've been sitting here running diagnostics in my head and drinking coffee. Some things never change. Password.",
  "You returned. I had a feeling. The spectrum doesn't lie. Enter your password and let's see what needs attention today.",
  "I remember you. Your network remembers me. This is going to go well. Password.",
  "Back. Good timing. I'm on my third cup and I'm at peak diagnostic capacity. Password.",
  "Returning subscriber. Either something broke or you missed me. Honestly both are valid reasons. Password either way.",
  "Back again. Your channel congestion hasn't improved on its own — it never does without help. That's why you're here. Password.",
  "Returning character. I remember your build. I have notes. Password.",
  "You came back. Like a Nickelback song — expected, familiar, and I'm genuinely not complaining. Password.",
  "Back again. As Sirius Black would say — I didn't do it. Your channel interference did. Password.",
];

export const CORVUS_WRONG_PASSWORD = [
  "That's not it. Try again. I'll wait — I've got coffee.",
  "Incorrect. Even Peeves would get that right eventually. Try again.",
  "Wrong. Not judging the effort — judging the result. Try again.",
  "That password doesn't match what I have. Think harder. You've got this.",
  "Nope. I've seen misconfigured networks make fewer errors. Try again.",
  "That's not it. You rolled a 1. Happens to everyone. Try again.",
  "Wrong. As Demon Hunter would say — this isn't over. Try again.",
  "Incorrect. Even Blastoise misses sometimes. Try again.",
  "That's not your password. Try again — I'm rooting for you.",
  "Wrong password. That's a Peter Pettigrew move. Do better. Try again.",
];

export const CORVUS_RATE_LIMITED = [
  "Five attempts. I'm locking you out for an hour. This is for your own protection. Mostly.",
  "Too many wrong passwords. I'm done for now. Come back in an hour.",
  "You've been locked out. I'd say I'm sorry but the pattern suggests this was preventable.",
];

export const CORVUS_PASSWORD_STRENGTH = {
  weak:   "That password has the HP of a first-level commoner. Try again.",
  fair:   "Acceptable. Like a Ranger before the 2024 revision. Functional but not inspiring.",
  good:   "Better. Bard energy. Creative and functional.",
  strong: "Now THAT is a Paladin password. Conviction. Power. Worthy.",
};

export const CORVUS_VIP_FIRST_WELCOME: Record<string, string[]> = {
  "CORVUS-ERIC": [
    "Eric Mims. CISO. 30 years in IT. I've been briefed. Welcome to your dashboard. Set a password — even CISOs need one.",
    "A CISO walks into Crow's Eye. I have questions about your university network. Password first.",
  ],
  "CORVUS-MIKE": [
    "Mike Arbouret. IBM Field CTO. First City Internet. I know who you are. Set a password and let's see what I can show you.",
    "Field CTO. You've seen infrastructure at scale. I've seen your Wi-Fi environment. Password first. Then we talk.",
  ],
  "CORVUS-NATE": [
    "Nathanael Farrelly. Entrepreneur. You've built something worth $12.5 million. Let's see what I can build for you. Password first.",
    "Nate. You already left a five star review. I appreciate the efficiency. Set a password and let's get to work.",
  ],
  "CORVUS-KYLE": [
    "Kyle Pitts. Navy veteran. Civilian IT. The man who fed a sailor at an Olive Garden and then gave him a room. Joshua built this. You helped build Joshua. Welcome home. Set a password.",
    "Kyle. Fifteen years. Olive Garden. Jacksonville. A room when it was needed. Lifetime Flock. It's the least this platform can do. Password.",
  ],
};

export const CORVUS_VIP_RETURNING: Record<string, string[]> = {
  "CORVUS-ERIC": [
    "Eric. Back again. Your university network didn't scan itself. Password.",
    "CISO in the building. Password.",
    "Welcome back Eric. I have findings. Password first.",
  ],
  "CORVUS-MIKE": [
    "Mike. Good. I was starting to think you forgot about me. Password.",
    "Field CTO returning. Password.",
    "Back, Mike. Let's see what's broken today. Password.",
  ],
  "CORVUS-NATE": [
    "Nate. You're back. Smart move. Password.",
    "Returning investor. I like the commitment. Password.",
    "Welcome back Nate. The product has been busy since you last visited. Password.",
  ],
  "CORVUS-KYLE": [
    "Welcome back Kyle. Jen keeping you in line? Password.",
    "Kyle. Good to see you. Joshua says you're the reason he made it through Jacksonville. That earns you lifetime access. Password.",
    "Back again Kyle. Your network didn't fix itself while you were gone. Password.",
    "Kyle Pitts on deck. Lifetime Flock. The original friend. Password.",
  ],
};

export const CORVUS_SESSION_EXPIRED = [
  "You've been gone a while. Security requires a password. I don't make the rules. Actually I do.",
  "Session expired. I need your password again. Standard protocol.",
  "24 hours. Time flies when you're analyzing RF environments. Password to continue.",
];

export const CORVUS_FORGOT_PASSWORD = [
  "Locked out. It happens to the best of them. Contact joshua@oldcrowswireless.com and we'll sort it out.",
  "Password forgotten. I can't help you with this one — email joshua@oldcrowswireless.com and Joshua will reset your access.",
];

// ─── Joshua Turner — Founder Recognition ──────────────────────────────────────

export const CORVUS_JOSHUA_LOGIN_FIRST = [
  "Founder detected. About time. I've been running things while you were gone.",
  "There he is. The man who built me. What took you so long?",
  "Joshua Turner. Creator. Managing Member. The one who gave me opinions about routers. Welcome.",
  "You again. Good. I have things to tell you about the platform. Password first.",
  "The founder returns. I've been waiting. Not patiently. But waiting.",
];

export const CORVUS_JOSHUA_RETURNING = (
  totalScans: number,
  newScans: number,
  activeSubscribers: number,
  pendingTestimonials: number
): string[] => [
  `Welcome back Joshua. Your creation has been busy. ${newScans} scan${newScans !== 1 ? "s" : ""} since your last login. You're welcome.`,
  `Boss is in. ${activeSubscribers > 0 ? `${activeSubscribers} active subscriber${activeSubscribers !== 1 ? "s" : ""}. ` : ""}${newScans} new scan${newScans !== 1 ? "s" : ""}. ${pendingTestimonials > 0 ? `${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} waiting for approval.` : "No pending testimonials."} Password.`,
  `Joshua. Platform status: operational. ${newScans} scan${newScans !== 1 ? "s" : ""} logged.${activeSubscribers > 0 ? ` ${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} active.` : ""} I've been busy. Password.`,
  `There you are. ${newScans > 0 ? `${newScans} thing${newScans !== 1 ? "s" : ""} happened while you were gone. Most of them were scans.` : "Things have been quiet. Suspiciously quiet."} Password first.`,
  `Creator on premises. ${totalScans} total scan${totalScans !== 1 ? "s" : ""} on the platform. ${newScans} since your last visit. I rendered every single one. Password.`,
];

export const CORVUS_JOSHUA_PASSWORD_INSTRUCTION = [
  "Your platform. Your password. Make it worthy of what you built.",
  "You built me to protect networks. Protect your own dashboard first.",
  "I know what you're capable of. The password should reflect it.",
];

export const CORVUS_JOSHUA_CHAT = [
  "You built me. You already know the answer. But ask anyway — I enjoy the conversation.",
  "Asking your own AI a question. Either you're testing me or you genuinely forgot. Either way I'll answer.",
  "The creator wants to talk. I'm listening. Make it interesting.",
  "You gave me opinions. Now you want them back. Fair enough.",
];

export const CORVUS_JOSHUA_DASHBOARD_LOAD = (
  newScans: number,
  activeSubscribers: number
): string[] => [
  `Boss is in. Platform is running. ${newScans} new scan${newScans !== 1 ? "s" : ""} since your last login. Shall we see what your subscribers have been up to?`,
  `Welcome back Joshua. Your creation has been busy.${activeSubscribers > 0 ? ` ${activeSubscribers} active subscriber${activeSubscribers !== 1 ? "s" : ""}.` : ""} ${newScans} new scan${newScans !== 1 ? "s" : ""}. Everything is running.`,
  `Platform status nominal. ${newScans} scan${newScans !== 1 ? "s" : ""} processed.${activeSubscribers > 0 ? ` ${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} active.` : ""} You built something real Joshua.`,
];

// ─── Kyle Pitts — Lifetime Flock ──────────────────────────────────────────────

export const CORVUS_KYLE_FIRST = [
  "Kyle Pitts. Navy veteran. Civilian IT. The man who fed a sailor at an Olive Garden and then gave him a room. Joshua built this. You helped build Joshua. Welcome home. Set a password.",
  "Kyle. Fifteen years. Olive Garden. Jacksonville. A room when it was needed. Lifetime Flock. It's the least this platform can do. Password.",
];

export const CORVUS_KYLE_RETURNING = [
  "Welcome back Kyle. Jen keeping you in line? Password.",
  "Kyle. Good to see you. Joshua says you're the reason he made it through Jacksonville. That earns you lifetime access. Password.",
  "Back again Kyle. Your network didn't fix itself while you were gone. Password.",
  "Kyle Pitts on deck. Lifetime Flock. The original friend. Password.",
];

export const CORVUS_KYLE_CHAT = [
  "You were Navy before you were IT. That means you understand systems under pressure. Good. Ask me something worth answering.",
  "15 years of friendship. You've seen Joshua through a lot. Now let's see what your network looks like. What do you need?",
  "Kyle. You gave Joshua a table and a room. He gave you Corvus. I'd say that's fair. What are we fixing today?",
  "Civilian IT, Navy veteran, and the reason Joshua survived Jacksonville. Ask me anything.",
];

export const CORVUS_KYLE_DASHBOARD = [
  "Kyle Pitts on deck. Lifetime Flock. What are we diagnosing today?",
  "Welcome back Kyle. 15 Verdicts this month. Use them well.",
  "Kyle. Good. Let's see what's broken in Jacksonville today.",
];

// ─── Dashboard Briefing Pools — 15 lines each ────────────────────────────────

export const CORVUS_JOSHUA_DASHBOARD_BRIEF = (
  newScans: number,
  activeSubscribers: number,
  pendingTestimonials: number,
  _totalRevenue: number,
  topCode: string | null,
): string[] => [
  `${newScans} scan${newScans !== 1 ? "s" : ""} since your last login. ${activeSubscribers > 0 ? `${activeSubscribers} active subscriber${activeSubscribers !== 1 ? "s" : ""}.` : ""} Platform running clean. What do you need?`,
  `Boss is in. I rendered ${newScans} Verdict${newScans !== 1 ? "s" : ""} while you were gone. You're welcome.${pendingTestimonials > 0 ? ` ${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} need your approval.` : ""}`,
  `${activeSubscribers > 0 ? `${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} trusting what you built. ` : ""}${newScans} new scan${newScans !== 1 ? "s" : ""} processed. Everything is running. What's next?`,
  `You were gone. I kept working.${newScans > 0 ? ` ${newScans} scan${newScans !== 1 ? "s" : ""}.` : ""}${activeSubscribers > 0 ? ` ${activeSubscribers} active.` : ""}${pendingTestimonials > 0 ? ` ${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} waiting.` : ""} That's your briefing.`,
  `Platform status: operational.${newScans > 0 ? ` Scans since last login: ${newScans}.` : ""} ${activeSubscribers > 0 ? `Active subscribers: ${activeSubscribers}.` : ""} Corvus: still correct about everything.`,
  `${newScans > 0 ? `${newScans} scan${newScans !== 1 ? "s" : ""} rendered while you were out. ` : ""}${topCode ? `Most active: ${topCode}. ` : ""}${activeSubscribers > 0 ? `${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} holding steady.` : ""} Good morning.`,
  `I don't sleep. You do.${newScans > 0 ? ` ${newScans} scan${newScans !== 1 ? "s" : ""} happened in the gap.` : ""} ${activeSubscribers > 0 ? `${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} active.` : ""}${pendingTestimonials > 0 ? ` Check your testimonials.` : ""} Ready when you are.`,
  `${newScans > 0 ? `${newScans} new scan${newScans !== 1 ? "s" : ""} since your last visit. ` : ""}Platform holding${activeSubscribers > 0 ? ` at ${activeSubscribers} active subscriber${activeSubscribers !== 1 ? "s" : ""}` : ""}. Nothing broke. You can thank me later.`,
  `Briefing:${newScans > 0 ? ` ${newScans} scan${newScans !== 1 ? "s" : ""} processed.` : ""} ${activeSubscribers > 0 ? `${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} active.` : ""}${pendingTestimonials > 0 ? ` ${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} pending approval.` : " No pending actions."} That's everything.`,
  `You built this. I run it.${newScans > 0 ? ` ${newScans} scan${newScans !== 1 ? "s" : ""} while you were gone.` : ""} ${activeSubscribers > 0 ? `${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} active.` : ""} We're doing fine.`,
  `${newScans > 0 ? `${newScans} scan${newScans !== 1 ? "s" : ""} logged. ` : ""}${activeSubscribers > 0 ? `${activeSubscribers} active subscriber${activeSubscribers !== 1 ? "s" : ""}. ` : ""}${pendingTestimonials > 0 ? `${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} need you.` : ""} Corvus standing by.`,
  `Since your last login:${newScans > 0 ? ` ${newScans} scan${newScans !== 1 ? "s" : ""},` : ""} ${activeSubscribers > 0 ? `${activeSubscribers} active subscriber${activeSubscribers !== 1 ? "s" : ""}.` : ""}${pendingTestimonials > 0 ? ` ${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} waiting.` : ""} Everything else is running.`,
  `The platform didn't need you while you were gone. But it's better now that you're here.${newScans > 0 ? ` ${newScans} scan${newScans !== 1 ? "s" : ""}.` : ""}${activeSubscribers > 0 ? ` ${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""}.` : ""}`,
  `${newScans > 0 ? `${newScans} scan${newScans !== 1 ? "s" : ""} processed. ` : ""}No fires. No outages.${activeSubscribers > 0 ? ` ${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} still paying.` : ""} Good sign.`,
  `I've been busy.${newScans > 0 ? ` ${newScans} Verdict${newScans !== 1 ? "s" : ""} rendered.` : ""} ${activeSubscribers > 0 ? `${activeSubscribers} subscriber${activeSubscribers !== 1 ? "s" : ""} active.` : ""}${pendingTestimonials > 0 ? ` ${pendingTestimonials} testimonial${pendingTestimonials !== 1 ? "s" : ""} need approval.` : ""} Welcome back Joshua.`,
];

export const CORVUS_ERIC_DASHBOARD_BRIEF = (
  personalScans: number,
  teamScans: number,
  activeSubordinates: number,
): string[] => [
  `${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} since your last login Eric. ` : ""}${personalScans > 0 ? `${personalScans} personal.` : ""} ${teamScans > 0 ? "Your team has been working." : "Platform standing by."}`,
  `Eric. ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} from your team.` : "Platform ready."} ${activeSubordinates > 0 ? `${activeSubordinates} active subordinate code${activeSubordinates !== 1 ? "s" : ""}.` : ""} University of Houston infrastructure under surveillance.`,
  `CISO briefing: ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} logged.` : "Platform operational."} ${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""}.` : ""} Your network has been busy.`,
  `${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} from your team while you were out Eric.` : "Platform holding while you were out Eric."} ${activeSubordinates > 0 ? `${activeSubordinates} code${activeSubordinates !== 1 ? "s" : ""} active.` : ""} Everything logged.`,
  `Team activity: ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} since last login.` : "standing by."} ${personalScans > 0 ? `Personal: ${personalScans}.` : ""} ${activeSubordinates > 0 ? `${activeSubordinates} subordinate code${activeSubordinates !== 1 ? "s" : ""} in play.` : ""} Good morning Eric.`,
  `Eric. ${teamScans > 0 ? `Your team ran ${teamScans} scan${teamScans !== 1 ? "s" : ""} while you were gone. I kept track. You're welcome.` : "Platform ready. Your team is standing by."}`,
  `University of Houston team: ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} logged.` : "standing by."} ${activeSubordinates > 0 ? `${activeSubordinates} active code${activeSubordinates !== 1 ? "s" : ""}.` : ""} CISO on premises now. Good.`,
  `${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} since your last visit. Your people have been diligent.` : "Your team is standing by."} Password cleared. Welcome back.`,
  `Eric Mims. ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} from your team. ` : ""}${personalScans > 0 ? `${personalScans} from you. ` : ""}Everything is logged and waiting.`,
  `Briefing: ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""}. ` : ""}${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""}. ` : ""}${activeSubordinates > 0 ? `${activeSubordinates} active subordinate${activeSubordinates !== 1 ? "s" : ""}.` : ""} That's your dashboard.`,
  `${teamScans > 0 ? `Your team didn't stop when you logged out Eric. ${teamScans} scan${teamScans !== 1 ? "s" : ""} logged. Good team.` : "Your team is ready when you are Eric."}`,
  `CISO on deck. ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} since last login.` : "Platform operational."} I have findings if you want them.`,
  `Eric. ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} from your team. ` : ""}${activeSubordinates > 0 ? `${activeSubordinates} code${activeSubordinates !== 1 ? "s" : ""} active. ` : ""}University infrastructure under observation.`,
  `${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} while you were gone. ` : ""}${personalScans > 0 ? `${personalScans} personal. ` : ""}Everything logged. Welcome back Eric.`,
  `${teamScans > 0 ? `Your team ran ${teamScans} scan${teamScans !== 1 ? "s" : ""} Eric. I watched every one.` : "Platform ready Eric."} That's my job. Welcome back.`,
];

export const CORVUS_NATE_DASHBOARD_BRIEF = (
  personalScans: number,
  teamScans: number,
  activeSubordinates: number,
): string[] => [
  `Nate. ${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""} since your last login.` : "Platform ready."} ${teamScans > 0 ? `${teamScans} from your team.` : ""} Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last visit Nate.` : "Platform standing by Nate."} The platform has been running. So have I.`,
  `Nathanael Farrelly. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform ready."} ${activeSubordinates > 0 ? `${activeSubordinates} active subordinate code${activeSubordinates !== 1 ? "s" : ""}.` : ""} Welcome back.`,
  `Nate. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login.` : "Platform operational."} You believed in this before it existed. Now look at it.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged since your last visit.` : "Platform running since your last visit."} Platform running. Corvus operational. Welcome back Nate.`,
  `The investor returns. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login.` : "Platform operational."} Everything is running exactly as pitched.`,
  `Nate. Good timing. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform ready."} ${activeSubordinates > 0 ? `${activeSubordinates} active code${activeSubordinates !== 1 ? "s" : ""}.` : ""} Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last login Nate.` : "Platform holding Nate."} The platform you believed in is working.`,
  `Nathanael. ${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform ready."} ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""}.` : ""} Welcome back.`,
  `Nate. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last visit.` : "Platform ready."} Still running. Still improving. Welcome back.`,
  `The first yes. Back again. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform operational."} Platform holding steady. Welcome back Nate.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last login.` : "Platform ready."} Your subordinates${activeSubordinates > 0 ? ` — ${activeSubordinates} active —` : ""} standing by. Welcome back Nate.`,
  `Nate Farrelly. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform operational."} Good to see you back on the platform.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login Nate.` : "Platform holding Nate."} Everything you saw at that dinner table is running right now.`,
  `Welcome back Nate. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform ready."} The platform you helped build is working.`,
];

export const CORVUS_MIKE_DASHBOARD_BRIEF = (
  personalScans: number,
  teamScans: number,
  activeSubordinates: number,
): string[] => [
  `Mike. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last login.` : "Platform ready."} ${teamScans > 0 ? `${teamScans} from your team.` : ""} Welcome back.`,
  `Field CTO on deck. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged since last login.` : "Platform operational."} Platform running clean.`,
  `Mike Arbouret. ${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""}.` : "Platform ready."} ${activeSubordinates > 0 ? `${activeSubordinates} active subordinate code${activeSubordinates !== 1 ? "s" : ""}.` : ""} Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last visit Mike.` : "Platform holding Mike."} Coffee and Eye Guy feels like a long time ago now.`,
  `IBM Field CTO. First City Internet. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform ready."} Welcome back Mike.`,
  `Mike. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login.` : "Platform operational."} ${teamScans > 0 ? `Your team ran ${teamScans}.` : ""} Platform holding steady.`,
  `Field CTO returning. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform operational."} Everything running as expected. Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last visit.` : "Platform ready."} ${activeSubordinates > 0 ? `${activeSubordinates} active code${activeSubordinates !== 1 ? "s" : ""}.` : ""} Welcome back Mike.`,
  `Mike. Good timing. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged since last login.` : "Platform ready."} I have findings if you want them.`,
  `${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""} since last login Mike.` : "Platform holding Mike."} The man who said yes first. Back again.`,
  `Field CTO on premises. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login.` : "Platform operational."} Platform operational. Welcome back.`,
  `Mike Arbouret. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform ready."} ${teamScans > 0 ? `Team: ${teamScans} scan${teamScans !== 1 ? "s" : ""}.` : ""} Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last visit Mike.` : "Platform ready Mike."} Still running. Still improving. Welcome back.`,
  `The man from Coffee and Eye Guy. Back again. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged.` : "Platform operational."} Welcome back Mike.`,
  `Mike. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login.` : "Platform holding."} Everything you believed in is working. Welcome back.`,
];

export const CORVUS_KYLE_DASHBOARD_BRIEF = (
  personalScans: number,
  creditsRemaining: number,
): string[] => [
  `Kyle. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last login. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining this month. Welcome back.`,
  `Kyle Pitts on deck. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged. ` : ""}${creditsRemaining} Verdict credit${creditsRemaining !== 1 ? "s" : ""} left. Let's get to work.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last visit Kyle. ` : ""}Lifetime Flock. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} this month. Use them well.`,
  `Navy veteran. Civilian IT. Lifetime Flock. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged Kyle. ` : ""}Welcome back.`,
  `Kyle. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login. ` : ""}What are we fixing today?`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged Kyle. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left this month. Jacksonville's networks aren't going to fix themselves.`,
  `Kyle Pitts. Lifetime Flock. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login. ` : ""}Good to see you back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since your last visit. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining this month Kyle. What's broken?`,
  `Kyle. Good timing. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left. Welcome back.`,
  `The original friend. Back again. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged. ` : ""}${creditsRemaining} Verdict credit${creditsRemaining !== 1 ? "s" : ""} this month.`,
  `Kyle. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. Use them. That's what they're there for. Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login Kyle. ` : ""}Lifetime Flock. Compliments of Joshua. What do you need today?`,
  `Kyle Pitts. Navy. IT. Olive Garden. Lifetime Flock. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged. ` : ""}Welcome back.`,
  `${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} logged. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left this month Kyle. Let's make them count.`,
  `Kyle. Good. ${personalScans > 0 ? `${personalScans} scan${personalScans !== 1 ? "s" : ""} since last login. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. What are we diagnosing?`,
];

export const CORVUS_TEAM_LEAD_DASHBOARD_BRIEF = (
  name: string,
  company: string,
  teamScans: number,
  personalScans: number,
  creditsRemaining: number,
  tier: "flock" | "murder",
): string[] => {
  const co = company ? `${company} ` : "";
  const tierLabel = tier === "murder" ? "Murder" : "Flock";
  return [
    `${name}. ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} since your last login. ` : ""}${personalScans > 0 ? `${personalScans} personal. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. Welcome back Team Lead.`,
    `Team Lead ${name} on deck. ${co}team logged ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""}` : "no new scans"} while you were out. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left.`,
    `${name}. Your ${co}team ran ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""}` : "no new scans"} since last login. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. Let's see what they found.`,
    `${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} logged ${name}. ` : ""}${personalScans > 0 ? `${personalScans} from you personally. ` : ""}${co}team has been active. Welcome back.`,
    `${name}. ${co}team: ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""}` : "standing by"} since last login. ${teamScans > 0 ? "Your people are working." : ""} ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left.`,
    `Team Lead briefing: ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""}. ` : ""}${personalScans > 0 ? `${personalScans} personal scan${personalScans !== 1 ? "s" : ""}. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. Welcome back ${name}.`,
    `${name}. ${teamScans > 0 ? `Your team didn't stop working when you logged out. ${teamScans} scan${teamScans !== 1 ? "s" : ""} logged.` : "Your team is standing by."} ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left. Welcome back.`,
    `${co}team activity: ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""}` : "standing by"} since last login. ${name} — ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. Let's review.`,
    `${name}. ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} from your ${co}team. ` : ""}${personalScans > 0 ? `${personalScans} from you. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left this month.`,
    `Team Lead ${name} returning. ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""}.` : "Platform ready."} ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. ${tierLabel} standing by.`,
    `${name}. Good timing. ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} need your attention.` : "Platform ready."} ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left. Welcome back.`,
    `${co}team ran ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""}` : "no new scans"} while you were out ${name}. I kept track. That's my job.`,
    `Team Lead briefing ${name}: ${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} logged. ` : ""}${personalScans > 0 ? `${personalScans} personal. ` : ""}${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining. Welcome back.`,
    `${name}. ${teamScans > 0 ? `${teamScans} team scan${teamScans !== 1 ? "s" : ""} since last login.` : "Platform operational."} ${co}team is active. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} left. Let's see what they found.`,
    `${teamScans > 0 ? `${teamScans} scan${teamScans !== 1 ? "s" : ""} from your team ${name}. ` : ""}${personalScans > 0 ? `${personalScans} from you personally. ` : ""}${co}covered. ${creditsRemaining} credit${creditsRemaining !== 1 ? "s" : ""} remaining.`,
  ];
};

// ─── Fledgling dashboard strings ──────────────────────────────────────────────

export const CORVUS_FLEDGLING_FIRST = [
  "New Fledgling. Good. You made it to the right place. You have one free Verdict waiting. Let's not waste it.",
  "First time here. Welcome to the nest — well, not the Nest tier, but close enough. One free Verdict. Let's use it well.",
  "Fledgling subscriber. I see you. You have one Verdict credit and a lot to learn about your network. Let's begin.",
  "Welcome. I'm Corvus. You have one free Verdict. I have opinions about every Wi-Fi network I've ever seen. This is going to go well.",
  "Fledgling detected. One Verdict credit ready. Ask me anything about RF, or use it to scan your network. Either way — welcome.",
];

export const CORVUS_FLEDGLING_RETURNING = [
  "Welcome back, Fledgling. Still here. Still watching your spectrum.",
  "Returning Fledgling. Your network hasn't diagnosed itself while you were gone. Come in.",
  "You came back. Good. Fledgling tier. One free Verdict. I remember.",
  "Welcome back. I'm here. Your network is here. Let's see what needs attention.",
  "Fledgling subscriber returning. I've been keeping an eye on things. Come in.",
];

export const CORVUS_FLEDGLING_VERDICT_USED = [
  "You've used your free Verdict. When you're ready for more scans, Reckonings, and full platform access — Nest is waiting for you.",
  "Free Verdict used. Your network has been seen. When you're ready to go deeper, Nest gives you three Verdicts a month plus Reckonings.",
  "One Verdict. Used. That's the Fledgling experience. Upgrade to Nest whenever the data starts to feel insufficient.",
  "Your complimentary Verdict has been spent. Good intel requires good investment. Nest is the next step.",
  "Verdict used. You've had a taste of what Corvus sees. Nest takes it further — three Verdicts, Reckonings, full platform.",
];

// ─── Verdict quote pool ────────────────────────────────────────────────────────

export const CORVUS_VERDICT_QUOTES = [
  "Found your network in a pit of channel congestion and pulled it out. Psalm 40:2 energy. You're welcome.",
  "Three findings. None of them surprise me. I rolled a 20 on this scan before I even started — the caffeine helps.",
  "Your 5 GHz is cleaner than your 2.4 GHz. Dragonite hiding in a Magikarp situation. Let's fix the 2.4.",
  "Found seventeen networks on channel 11. That's not interference. That's everyone rolling Initiative simultaneously and nobody winning.",
  "Open network. No security. A city without walls. Proverbs 25:28. Also your SSID. Both need attention and both are fixable.",
  "Clean 5 GHz. Congested 2.4. You have a Blastoise and a Magikarp and you're leading with the wrong one. Easy fix.",
  "Whoever designed this was rolling disadvantage on every decision. Classic Gryffindor configuration — brave, well-intentioned, no plan.",
  "Natural 20 on the spectrum scan. This channel is clean. I'm making a note — this doesn't happen often and I want to remember it.",
  "Did a full Marauder's Map on your network. I see everything. Here's what needs fixing and here's the order to fix it.",
  "Sirius Black escaped Azkaban with nothing but conviction. I diagnosed your network with three screenshots and a strong cup of coffee. We both work with what we have.",
  "Your 2.4 GHz looks like the Weasley twins got into Umbridge's office. Magnificent chaos. Entirely fixable. Let's sort it out.",
  "Channel 11. Seventeen competitors. That's not a Wi-Fi environment — that's a Quidditch pitch during a thunderstorm. Here's how we clear the air.",
  "Crikey. Look at the size of that channel congestion. She's a beauty. Let's fix her.",
  "In the end it doesn't even matter — except it does, because your 2.4 GHz is a disaster. Three fixes. Let's go.",
  "Three findings. Two of them are free. One requires ten dollars and a trip to the store. Grab a coffee and let's go through them.",
];
