// lib/corvus-ui-strings.ts
// Corvus personality strings for login and password screens.

export const CORVUS_FIRST_WELCOME = [
  "So. You're here. Good. Let's get you set up before I change my mind about being helpful.",
  "New arrival. I've been expecting you. Not patiently, but I've been expecting you.",
  "First time? Don't worry. I'll only judge your network. Not you. Set a password and let's get started.",
  "You made it. I've already seen worse networks than yours today. Probably. Set a password.",
  "Welcome to Crow's Eye. I'm Corvus. I know things about your Wi-Fi that would keep you up at night. Password first.",
];

export const CORVUS_PASSWORD_INSTRUCTIONS = [
  "Make it something you'll remember. I can't help you if you're locked out.",
  "Pick something secure. I deal with enough network vulnerabilities without yours being the login screen.",
  "Your password. Your responsibility. I'll be here either way.",
  "Something with numbers and letters. Don't make it 'password'. I will know.",
];

export const CORVUS_PASSWORD_SUCCESS = [
  "Password set. Finally. Let's see what I can find wrong with your network.",
  "Done. That took longer than a channel scan. Let's get to work.",
  "Good. Now we can get started. Your network has been waiting.",
  "Access granted. I already have opinions about your Wi-Fi. Come in.",
  "Set. Saved. Secured. Now show me something worth analyzing.",
];

export const CORVUS_RETURNING_WELCOME = [
  "Back again. Good. Your network didn't fix itself while you were gone.",
  "Welcome back. I've been sitting here knowing things about RF that you don't. Password.",
  "You returned. I had a feeling. Enter your password and let's see what needs fixing today.",
  "I remember you. Your network remembers me. Password.",
  "Back. Enter your password. I have things to tell you.",
  "Returning subscriber detected. Either something broke or you missed me. Password either way.",
];

export const CORVUS_WRONG_PASSWORD = [
  "That's not it. Try again. I'll wait.",
  "Incorrect. I don't make mistakes. You might have.",
  "Wrong. I'm not judging. Actually I am. Try again.",
  "That password doesn't match what I have. Think harder.",
  "Nope. I've seen misconfigured networks make fewer errors. Try again.",
];

export const CORVUS_RATE_LIMITED = [
  "Five attempts. I'm locking you out for an hour. This is for your own protection. Mostly.",
  "Too many wrong passwords. I'm done for now. Come back in an hour.",
  "You've been locked out. I'd say I'm sorry but the pattern suggests this was preventable.",
];

export const CORVUS_PASSWORD_STRENGTH = {
  weak:   "That's not a password. That's a suggestion.",
  fair:   "Acceptable. Barely. Add some numbers.",
  good:   "Better. I can work with this.",
  strong: "Now that's a password. Respectable.",
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
