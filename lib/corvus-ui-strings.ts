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
