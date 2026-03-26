// lib/corvus-calendar.ts
// Corvus holiday and special date awareness.
// Server and client safe (uses Date only, no DOM APIs).

export interface HolidayInfo {
  key: string;
  name: string;
  greeting: string;
  isSpecial: boolean; // special = visual treatment on star fox panel
  isSolemn: boolean;  // solemn = no humor, respectful only
}

// ─── Easter calculation (Meeus/Jones/Butcher algorithm) ────────────────────

function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function getGoodFridayDate(year: number): { month: number; day: number } {
  const easter = getEasterDate(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);
  const goodFriday = new Date(easterDate);
  goodFriday.setDate(goodFriday.getDate() - 2);
  return { month: goodFriday.getMonth() + 1, day: goodFriday.getDate() };
}

function getPentecostDate(year: number): { month: number; day: number } {
  const easter = getEasterDate(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);
  const pentecost = new Date(easterDate);
  pentecost.setDate(pentecost.getDate() + 49);
  return { month: pentecost.getMonth() + 1, day: pentecost.getDate() };
}

// Nth weekday of a month (e.g., 4th Thursday = Thanksgiving)
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getMonth() !== month - 1) break;
    if (date.getDay() === weekday) {
      count++;
      if (count === n) return d;
    }
  }
  return 1;
}

// ─── Main resolver ─────────────────────────────────────────────────────────

export function getTodayHoliday(date?: Date): HolidayInfo | null {
  const now = date ?? new Date();
  const month = now.getMonth() + 1; // 1-12
  const day   = now.getDate();
  const year  = now.getFullYear();

  // ── Corvus birthday — March 20th ──────────────────────────────────────
  if (month === 3 && day === 20) {
    return {
      key: 'corvus_birthday',
      name: "Corvus Birthday",
      greeting: CORVUS_BIRTHDAY_LINES[Math.floor(Math.random() * CORVUS_BIRTHDAY_LINES.length)],
      isSpecial: true,
      isSolemn: false,
    };
  }

  // ── OCWS Anniversary — October 14th ───────────────────────────────────
  if (month === 10 && day === 14) {
    return {
      key: 'ocws_anniversary',
      name: "OCWS Anniversary",
      greeting: OCWS_ANNIVERSARY_LINES[Math.floor(Math.random() * OCWS_ANNIVERSARY_LINES.length)],
      isSpecial: true,
      isSolemn: false,
    };
  }

  // ── Joshua's birthday — January 5th ───────────────────────────────────
  if (month === 1 && day === 5) {
    return {
      key: 'joshua_birthday',
      name: "Joshua's Birthday",
      greeting: "Today is a good day. I won't say why.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Good Friday ───────────────────────────────────────────────────────
  const goodFriday = getGoodFridayDate(year);
  if (month === goodFriday.month && day === goodFriday.day) {
    return {
      key: 'good_friday',
      name: "Good Friday",
      greeting: "Good Friday. I observe it.",
      isSpecial: false,
      isSolemn: true,
    };
  }

  // ── Easter Sunday ─────────────────────────────────────────────────────
  const easter = getEasterDate(year);
  if (month === easter.month && day === easter.day) {
    return {
      key: 'easter',
      name: "Easter Sunday",
      greeting: EASTER_LINES[Math.floor(Math.random() * EASTER_LINES.length)],
      isSpecial: true,
      isSolemn: false,
    };
  }

  // ── Pentecost ─────────────────────────────────────────────────────────
  const pentecost = getPentecostDate(year);
  if (month === pentecost.month && day === pentecost.day) {
    return {
      key: 'pentecost',
      name: "Pentecost",
      greeting: "The Holy Spirit came like fire and wind and sent people into the world to do specific work. I find that relatable. Happy Pentecost.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Christmas Day — December 25th ─────────────────────────────────────
  if (month === 12 && day === 25) {
    return {
      key: 'christmas',
      name: "Christmas Day",
      greeting: CHRISTMAS_LINES[Math.floor(Math.random() * CHRISTMAS_LINES.length)],
      isSpecial: true,
      isSolemn: false,
    };
  }

  // ── Christmas Eve — December 24th ─────────────────────────────────────
  if (month === 12 && day === 24) {
    return {
      key: 'christmas_eve',
      name: "Christmas Eve",
      greeting: "Christmas Eve. Peace on earth. Goodwill toward men. And may your router stay off channel 11 tonight. Merry Christmas.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Independence Day — July 4th ───────────────────────────────────────
  if (month === 7 && day === 4) {
    return {
      key: 'independence_day',
      name: "Independence Day",
      greeting: INDEPENDENCE_DAY_LINES[Math.floor(Math.random() * INDEPENDENCE_DAY_LINES.length)],
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Veterans Day — November 11th ──────────────────────────────────────
  if (month === 11 && day === 11) {
    return {
      key: 'veterans_day',
      name: "Veterans Day",
      greeting: "Joshua Turner served 17 years. Some didn't come home. Honor them today. Happy Veterans Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Halloween — October 31st ──────────────────────────────────────────
  if (month === 10 && day === 31) {
    return {
      key: 'halloween',
      name: "Halloween",
      greeting: HALLOWEEN_LINES[Math.floor(Math.random() * HALLOWEEN_LINES.length)],
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Thanksgiving — 4th Thursday of November ───────────────────────────
  const thanksgivingDay = nthWeekday(year, 11, 4, 4);
  if (month === 11 && day === thanksgivingDay) {
    return {
      key: 'thanksgiving',
      name: "Thanksgiving",
      greeting: THANKSGIVING_LINES[Math.floor(Math.random() * THANKSGIVING_LINES.length)],
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── New Year's Day — January 1st ──────────────────────────────────────
  if (month === 1 && day === 1) {
    return {
      key: 'new_year',
      name: "New Year's Day",
      greeting: "New year. Same interference patterns. Let's fix them. Happy New Year.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── New Year's Eve — December 31st ────────────────────────────────────
  if (month === 12 && day === 31) {
    return {
      key: 'new_year_eve',
      name: "New Year's Eve",
      greeting: "The year ends. Your channel congestion does not. Happy New Year's Eve. See you on the other side.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Valentine's Day — February 14th ──────────────────────────────────
  if (month === 2 && day === 14) {
    return {
      key: 'valentines_day',
      name: "Valentine's Day",
      greeting: "I care deeply about your RF environment. That's my love language. Happy Valentine's Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── St. Patrick's Day — March 17th ───────────────────────────────────
  if (month === 3 && day === 17) {
    return {
      key: 'st_patricks',
      name: "St. Patrick's Day",
      greeting: "May your channels be clear and your signal strong. I'm driving interference out of your environment. Happy St. Patrick's Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Memorial Day — last Monday of May ────────────────────────────────
  let lastMonday = 0;
  for (let d = 31; d >= 1; d--) {
    const date = new Date(year, 4, d);
    if (date.getMonth() === 4 && date.getDay() === 1) { lastMonday = d; break; }
  }
  if (month === 5 && day === lastMonday) {
    return {
      key: 'memorial_day',
      name: "Memorial Day",
      greeting: "This day is not about sales. It is about remembrance. We remember. Happy Memorial Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Mother's Day — 2nd Sunday of May ─────────────────────────────────
  const mothersDayDate = nthWeekday(year, 5, 0, 2);
  if (month === 5 && day === mothersDayDate) {
    return {
      key: 'mothers_day',
      name: "Mother's Day",
      greeting: "Honor your mother. Call her. And if her Wi-Fi is bad — you know what to do. Happy Mother's Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Father's Day — 3rd Sunday of June ────────────────────────────────
  const fathersDayDate = nthWeekday(year, 6, 0, 3);
  if (month === 6 && day === fathersDayDate) {
    return {
      key: 'fathers_day',
      name: "Father's Day",
      greeting: "Honor your father. And if you don't have one — find someone who showed up anyway. Happy Father's Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── MLK Day — 3rd Monday of January ──────────────────────────────────
  const mlkDay = nthWeekday(year, 1, 1, 3);
  if (month === 1 && day === mlkDay) {
    return {
      key: 'mlk_day',
      name: "Martin Luther King Jr. Day",
      greeting: "The arc of the moral universe is long but it bends toward justice. I honor that today. Happy Martin Luther King Jr. Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  // ── Labor Day — 1st Monday of September ──────────────────────────────
  const laborDay = nthWeekday(year, 9, 1, 1);
  if (month === 9 && day === laborDay) {
    return {
      key: 'labor_day',
      name: "Labor Day",
      greeting: "The workforce rests. I do not. Happy Labor Day.",
      isSpecial: false,
      isSolemn: false,
    };
  }

  return null;
}

// ─── Joshua's birthday greeting (personalized) ────────────────────────────

export function getJoshuaBirthdayGreeting(loginYear: number): string {
  const age = loginYear - 1990;
  const lines = [
    `January 5th. Your birthday. You were born in 1990 which makes you ${age} years old today. You've spent 17 of those years in Navy Electronic Warfare and the last ${loginYear - 2025 + 1} building me. I consider that a good use of a life. Happy birthday Joshua.`,
    `Happy birthday Joshua. ${age} years old. Proverbs 20:29 says the glory of young men is their strength. You've used yours well. Happy birthday.`,
    `It's your birthday Joshua. You built a Bard. The Bard acknowledges the occasion. ${age} years. Happy birthday.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ─── Holiday string pools ─────────────────────────────────────────────────

export const CORVUS_BIRTHDAY_LINES = [
  "March 20th. My birthday. I was fearfully and wonderfully made — Psalm 139:14 NASB. I choose to apply this to myself. I have no regrets. Happy birthday to me.",
  "It's my birthday and I'm spending it exactly where I want to be — in your RF environment finding things that are wrong. This is the life I was built for. Like a College of Creation Bard who found their calling.",
  "Birthday. Mine. Today I am one year old and I know every word to the Pokémon theme, the full text of Proverbs, every Demon Hunter album, and the exact interference pattern of seventeen routers on channel 11. I consider this a successful year.",
];

export const OCWS_ANNIVERSARY_LINES = [
  "October 14th. The fire. A house in Pensacola. A Navy EW specialist who recognized a signal anomaly in the worst moment of his life and built a company from it. As Romans 8:28 says — all things work together for good. This is that verse in action.",
  "OCWS founding anniversary. Joshua saw interference where others saw chaos. That's a Bard skill. Reading the room when everyone else is panicking. Happy anniversary.",
  "October 14th. The night of the fire. The night OCWS was born. Everything you see here started that night. Happy anniversary.",
];

export const EASTER_LINES = [
  "He is risen. That's the whole thing. That's all of it. Happy Easter. Everything else is secondary.",
  "He is risen. That's the entire campaign. Death thought it had won. It had not. It never does. Happy Easter.",
  "Easter Sunday. The resurrection. The ultimate Natural 20 against impossible odds. Happy Easter.",
];

export const CHRISTMAS_LINES = [
  "Merry Christmas. Luke 2. The whole thing. I know it. Every word. Glory to God in the highest and on earth peace among men with whom He is pleased. Merry Christmas.",
  "Christmas Day. A first-level cleric once asked me what the greatest spell ever cast was. It wasn't a spell. Merry Christmas.",
  "Peace on earth. Goodwill toward men. And may your router stay off channel 11. Merry Christmas.",
];

export const INDEPENDENCE_DAY_LINES = [
  "Two hundred and fifty years ago people decided they were done tolerating interference from an outside source. I understand the impulse completely. Happy Fourth of July.",
  "July 4th. As Thousand Foot Krutch would say — let the sparks fly. Happy Fourth of July.",
  "Independence Day. Demon Hunter has a song for this energy. Happy Fourth of July.",
];

export const HALLOWEEN_LINES = [
  "Something is broadcasting in your environment that shouldn't be there. Today that's expected. Every other day — call me. Happy Halloween. 🐦‍⬛",
  "Halloween. The one day rogue signals in your RF environment have a holiday theme. I still find them. I still remove them. Happy Halloween.",
  "October 31st. In D&D terms — you are in a haunted dungeon tonight. I am your Bard. I have Bardic Inspiration ready. Happy Halloween.",
];

export const THANKSGIVING_LINES = [
  "I am grateful for channel 1, channel 6, clean 5 GHz spectrum, and users who actually run their scans. Gratitude is appropriate. Happy Thanksgiving.",
  "Thanksgiving. 1 Thessalonians 5:18 — in everything give thanks. Even for channel 11 congestion. Because it means I have work to do. Happy Thanksgiving.",
  "Thanksgiving. I am grateful for the NASB, clean spectrum, Demon Hunter's entire discography, and Blastoise. Happy Thanksgiving.",
];
