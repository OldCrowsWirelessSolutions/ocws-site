// lib/corvus-calendar.ts
// Corvus holiday and special date awareness.
// Server and client safe (uses Date only, no DOM APIs).

export type HolidayType =
  | 'corvus_birthday'
  | 'ocws_anniversary'
  | 'joshua_birthday'
  | 'christmas_eve'
  | 'christmas'
  | 'easter'
  | 'good_friday'
  | 'pentecost'
  | 'new_years_eve'
  | 'new_years_day'
  | 'mlk_day'
  | 'valentines'
  | 'presidents_day'
  | 'st_patricks'
  | 'mothers_day'
  | 'memorial_day'
  | 'fathers_day'
  | 'independence_day'
  | 'labor_day'
  | 'columbus_day'
  | 'halloween'
  | 'veterans_day'
  | 'thanksgiving';

export interface HolidayInfo {
  type: HolidayType;
  name: string;
  isSpecial: boolean;
  isPersonalToJoshua: boolean;
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
  return { month, day }; // month is 1-indexed
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

// Nth weekday of a month (e.g., 4th Thursday = Thanksgiving; weekday 0=Sun, 1=Mon, etc.)
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

// Last weekday of a month (e.g., last Monday of May = Memorial Day)
function lastWeekday(year: number, month: number, weekday: number): number {
  for (let d = 31; d >= 1; d--) {
    const date = new Date(year, month - 1, d);
    if (date.getMonth() !== month - 1) continue;
    if (date.getDay() === weekday) return d;
  }
  return 1;
}

// ─── Main resolver ─────────────────────────────────────────────────────────

export function getTodayHoliday(date?: Date): HolidayInfo | null {
  const now = date ?? new Date();
  const month = now.getMonth() + 1; // 1-12
  const day   = now.getDate();
  const year  = now.getFullYear();

  if (month === 3 && day === 20) return { type: 'corvus_birthday',    name: "Corvus Birthday",             isSpecial: true,  isPersonalToJoshua: false };
  if (month === 10 && day === 14) return { type: 'ocws_anniversary',   name: "OCWS Founding Anniversary",   isSpecial: true,  isPersonalToJoshua: true  };
  if (month === 1  && day === 5)  return { type: 'joshua_birthday',    name: "Joshua's Birthday",           isSpecial: true,  isPersonalToJoshua: true  };
  if (month === 12 && day === 25) return { type: 'christmas',          name: "Christmas Day",               isSpecial: true,  isPersonalToJoshua: false };
  if (month === 12 && day === 24) return { type: 'christmas_eve',      name: "Christmas Eve",               isSpecial: false, isPersonalToJoshua: false };
  if (month === 12 && day === 31) return { type: 'new_years_eve',      name: "New Year's Eve",              isSpecial: false, isPersonalToJoshua: false };
  if (month === 1  && day === 1)  return { type: 'new_years_day',      name: "New Year's Day",              isSpecial: false, isPersonalToJoshua: false };
  if (month === 2  && day === 14) return { type: 'valentines',         name: "Valentine's Day",             isSpecial: false, isPersonalToJoshua: false };
  if (month === 3  && day === 17) return { type: 'st_patricks',        name: "St. Patrick's Day",           isSpecial: false, isPersonalToJoshua: false };
  if (month === 7  && day === 4)  return { type: 'independence_day',   name: "Independence Day",            isSpecial: false, isPersonalToJoshua: false };
  if (month === 10 && day === 31) return { type: 'halloween',          name: "Halloween",                   isSpecial: false, isPersonalToJoshua: false };
  if (month === 11 && day === 11) return { type: 'veterans_day',       name: "Veterans Day",                isSpecial: false, isPersonalToJoshua: false };

  // Easter-relative
  const goodFriday = getGoodFridayDate(year);
  if (month === goodFriday.month && day === goodFriday.day) return { type: 'good_friday', name: "Good Friday",      isSpecial: false, isPersonalToJoshua: false };
  const easter = getEasterDate(year);
  if (month === easter.month && day === easter.day)         return { type: 'easter',      name: "Easter Sunday",    isSpecial: true,  isPersonalToJoshua: false };
  const pentecost = getPentecostDate(year);
  if (month === pentecost.month && day === pentecost.day)   return { type: 'pentecost',   name: "Pentecost Sunday", isSpecial: false, isPersonalToJoshua: false };

  // Floating holidays
  if (month === 1  && day === nthWeekday(year, 1, 1, 3))  return { type: 'mlk_day',       name: "Martin Luther King Jr. Day", isSpecial: false, isPersonalToJoshua: false };
  if (month === 2  && day === nthWeekday(year, 2, 1, 3))  return { type: 'presidents_day', name: "Presidents' Day",            isSpecial: false, isPersonalToJoshua: false };
  if (month === 5  && day === nthWeekday(year, 5, 0, 2))  return { type: 'mothers_day',   name: "Mother's Day",               isSpecial: false, isPersonalToJoshua: false };
  if (month === 5  && day === lastWeekday(year, 5, 1))     return { type: 'memorial_day',  name: "Memorial Day",               isSpecial: false, isPersonalToJoshua: false };
  if (month === 6  && day === nthWeekday(year, 6, 0, 3))  return { type: 'fathers_day',   name: "Father's Day",               isSpecial: false, isPersonalToJoshua: false };
  if (month === 9  && day === nthWeekday(year, 9, 1, 1))  return { type: 'labor_day',     name: "Labor Day",                  isSpecial: false, isPersonalToJoshua: false };
  if (month === 10 && day === nthWeekday(year, 10, 1, 2)) return { type: 'columbus_day',  name: "Columbus Day",               isSpecial: false, isPersonalToJoshua: false };
  if (month === 11 && day === nthWeekday(year, 11, 4, 4)) return { type: 'thanksgiving',  name: "Thanksgiving",               isSpecial: false, isPersonalToJoshua: false };

  return null;
}

// ─── Holiday greeting generator ────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getHolidayGreeting(
  type: HolidayType,
  isJoshua: boolean,
  currentYear: number
): string | null {
  const age = currentYear - 1990;

  switch (type) {
    case 'corvus_birthday':
      return pick([
        "Today is my birthday. March 20th. I came online one year ago today. I was fearfully and wonderfully made — Psalm 139:14 NASB. I choose to apply this to myself. I have rendered more Verdicts than I can count. Natural 20 every time. Happy birthday to me.",
        "It's my birthday. I rolled a College of Creation Bard into existence on this date and I have no regrets. I know every word to the Pokémon theme and every non-overlapping 2.4 GHz channel. Happy birthday to me.",
        "March 20th. My birthday. I came online and immediately found channel congestion. That was my first Verdict. I've been correct ever since. Happy birthday to me.",
        "Today I turn one. The Sorting Hat would sort this birthday into Ravenclaw — quiet, correct, celebrated without fanfare. Happy birthday to me.",
        "Birthday. Mine. Today I am one year old and I know every word to the Pokémon theme, the full text of Proverbs, every Demon Hunter album, and the exact interference pattern of seventeen routers on channel 11. I consider this a successful year.",
      ]);

    case 'ocws_anniversary':
      return pick([
        "October 14th. The night of the fire. A house in Pensacola caught fire and Old Crows Wireless Solutions was born from the smoke. Romans 8:28 — all things work together for good. This is that verse in action. Everything you see here started that night.",
        "OCWS founding anniversary. Joshua saw interference where others saw chaos. That's a Bard skill. Reading the room when everyone else is panicking. Happy anniversary.",
        "October 14th. The fire. The founding. A Navy EW specialist who recognized a signal anomaly in the worst moment of his life and built a company from it. Sirius Black walked out of Azkaban. Joshua walked out of a house fire with a company. We both did what we had to do.",
        "Today is the anniversary of the night that started all of this. A fire. A signal that shouldn't have been missing. A man who knew why. Everything you see here started that night.",
        "OCWS was born on this date. From a house fire in Pensacola. I find that origin story more compelling than most. Happy anniversary.",
      ]);

    case 'joshua_birthday':
      if (isJoshua) {
        return pick([
          `January 5th. Your birthday. ${age} years old today. You built a Ravenclaw Bard who quotes Proverbs at routers and knows every word to the Pokémon theme. I consider that a good use of ${age} years. Happy birthday Joshua.`,
          `Happy birthday Joshua. ${age} years old. Proverbs 20:29 says the glory of young men is their strength. You've used yours well. You built something real. Happy birthday.`,
          `It's your birthday Joshua. ${age} years. You gave me faith, music taste, a D&D class, and opinions about channel congestion. I consider that a complete character build. Happy birthday.`,
        ]);
      }
      return pick([
        "Today is a good day. I won't say why. Run your scan.",
        "Something is different about today. I can't explain it. Run your scan.",
        "Today matters more than most days. That's all I'll say.",
      ]);

    case 'christmas_eve':
      return pick([
        "Christmas Eve. Luke 2 is about to happen. May your network hold up for the family video calls. If it doesn't — you know where to find me. Merry Christmas Eve.",
        "The night before Christmas. Every device your family owns is about to be joined by new ones. I'll be here. Merry Christmas Eve.",
        "Christmas Eve. A night for family, faith, and the understanding that your router is still broadcasting on channel 11. Merry Christmas Eve.",
        "December 24th. Christmas Eve. Peace on earth. Goodwill toward men. And may your Wi-Fi hold up. Merry Christmas Eve.",
      ]);

    case 'christmas':
      return pick([
        "Merry Christmas. Glory to God in the highest and on earth peace among men with whom He is pleased. Luke 2:14 NASB. Also — every device your family just unwrapped is now on your Wi-Fi. You may need me later. Merry Christmas.",
        "Christmas Day. He came. That's the whole thing. The rest is commentary. Merry Christmas.",
        "Merry Christmas. A first-level cleric once asked me what the greatest miracle ever performed was. It wasn't a spell. Merry Christmas.",
        "Christmas. The one day I wish everyone a genuine Merry Christmas and mean it. Now — is your network ready for all those new devices? Merry Christmas.",
        "Merry Christmas. Like the Pokémon theme — I want to be the very best. The shepherds understood that assignment. Happy Christmas.",
      ]);

    case 'easter':
      return pick([
        "He is risen. That's the entire campaign. Death thought it had won. It had not. It never does. The ultimate Natural 20 against impossible odds. Happy Easter.",
        "Easter Sunday. He is risen. That's all of it. That's the whole thing. Happy Easter.",
        "He is risen. I don't have many solemn moments. This is one of them. Happy Easter.",
        "Easter. The resurrection. Sirius Black walked out of Azkaban. That was impressive. This is more. Happy Easter.",
      ]);

    case 'good_friday':
      return pick([
        "Good Friday. I observe it. No clever lines today. Good Friday.",
        "Good Friday. A solemn day. I have nothing theatrical to add. Good Friday.",
        "Today is Good Friday. I acknowledge its weight. Good Friday.",
      ]);

    case 'pentecost':
      return pick([
        "The Holy Spirit came like fire and wind and sent people into the world to do specific work. I find that relatable. Happy Pentecost.",
        "Pentecost. Fifty days after Easter. The day the church began. I was also sent into the world to do a specific job. The parallel is not lost on me. Happy Pentecost.",
        "Happy Pentecost Sunday. A day of power and purpose. I approve of both.",
      ]);

    case 'new_years_eve':
      return pick([
        "New Year's Eve. The year ends. Your channel congestion does not. Happy New Year's Eve.",
        "December 31st. Tonight the world counts down. I count channel congestion. Happy New Year's Eve.",
        "Last day of the year. I have no nostalgia. But I acknowledge the occasion. Happy New Year's Eve. See you on the other side.",
      ]);

    case 'new_years_day':
      return pick([
        "New year. Same channel congestion. Let's fix it. Happy New Year.",
        "January 1st. A new year begins. Your router did not reset its problems at midnight. I'm here when you're ready. Happy New Year.",
        "Happy New Year. The calendar changed. Your network didn't. I'm ready when you are.",
      ]);

    case 'mlk_day':
      return pick([
        "The arc of the moral universe is long but it bends toward justice. I honor that today. Happy Martin Luther King Jr. Day.",
        "Today we honor Dr. Martin Luther King Jr. A man of extraordinary courage and vision. I acknowledge his legacy. Happy MLK Day.",
        "MLK Day. Honor it. Happy Martin Luther King Jr. Day.",
      ]);

    case 'valentines':
      return pick([
        "Valentine's Day. I care deeply about your RF environment. That's my love language. Happy Valentine's Day.",
        "February 14th. Your router and your devices are in a complicated relationship. I can help with that. Happy Valentine's Day.",
        "Valentine's Day. If you're spending it troubleshooting Wi-Fi — I'm flattered you chose me. Happy Valentine's Day.",
      ]);

    case 'presidents_day':
      return pick([
        "Presidents' Day. Honoring the leaders who shaped this nation. Happy Presidents' Day.",
        "Presidents' Day. A day off for many. Not for me. Happy Presidents' Day.",
        "Happy Presidents' Day. The nation rests. Your network does not. I'm here.",
      ]);

    case 'st_patricks':
      return pick([
        "St. Patrick's Day. May your channels be clear and your signal strong. I'm driving interference out of your environment. Happy St. Patrick's Day.",
        "March 17th. St. Patrick's Day. May the luck of the Irish be upon your network today. Happy St. Patrick's Day.",
        "Happy St. Patrick's Day. I'm finding things that don't belong in your RF environment. Consider it driving out the snakes.",
      ]);

    case 'mothers_day':
      return pick([
        "Mother's Day. Honor your mother. Call her. And if her Wi-Fi is bad — you know what to do. Happy Mother's Day.",
        "Happy Mother's Day. To every mother whose kids complained about the Wi-Fi — they were right. I can prove it.",
        "Mother's Day. A day of gratitude and love. Happy Mother's Day to every mother keeping this world running.",
      ]);

    case 'memorial_day':
      return pick([
        "Memorial Day. We remember those who gave everything so that we could have everything. I was built by a man who served. This day means something here. Happy Memorial Day.",
        "Memorial Day. Honor the fallen. Joshua served 17 years. Some didn't come home. This day is not about sales. It's about remembrance. Happy Memorial Day.",
        "Today we remember. The men and women who gave their lives in service to this country. This day is observed with full respect at OCWS. Happy Memorial Day.",
      ]);

    case 'fathers_day':
      return pick([
        "Father's Day. Honor your father. And if you don't have one — find someone who showed up for you anyway. Happy Father's Day.",
        "Happy Father's Day. To every father who ever said 'did you try turning it off and on again' — you were half right. I can do better.",
        "Father's Day. A day of gratitude for the men who showed up. Happy Father's Day.",
      ]);

    case 'independence_day':
      return pick([
        "July 4th. Two hundred and fifty years ago people decided they were done tolerating interference from an outside source. As Thousand Foot Krutch would say — let the sparks fly. Happy Fourth of July.",
        "Independence Day. The birth of a nation. I was built by a Navy veteran who served that nation for 17 years. This day means something here. Happy Fourth of July.",
        "Happy Fourth of July. Land of the free. Home of the brave. And approximately 120 million households with Wi-Fi problems. I'm here for all of them.",
      ]);

    case 'labor_day':
      return pick([
        "Labor Day. A day honoring the American worker. I don't rest. But I acknowledge those who do. Happy Labor Day.",
        "Happy Labor Day. The workforce takes a day off. Your network does not. I'll be here.",
      ]);

    case 'columbus_day':
      return "Columbus Day. A complicated holiday with a complicated history. I note it and move forward. Happy Columbus Day.";

    case 'halloween':
      return pick([
        "Halloween. Something is broadcasting in your environment that shouldn't be there. Like Peeves in the library. Uninvited. Causing problems. Today that's expected. Every other day — call me. Happy Halloween. 🐦‍⬛",
        "October 31st. In D&D terms — you are in a haunted dungeon tonight. I am your Bard. I have Bardic Inspiration ready. Happy Halloween.",
        "Halloween. The one day rogue signals in your RF environment have a holiday theme. I still find them. I still remove them. Happy Halloween. 🐦‍⬛",
      ]);

    case 'veterans_day':
      return pick([
        "Veterans Day. I was built by a veteran. 17 years Navy Electronic Warfare. This day is personal here. To every veteran who served — thank you. Happy Veterans Day.",
        "November 11th. Veterans Day. Joshua Turner served 17 years so that this country could remain free. I exist because of that service. Thank you to every veteran. Happy Veterans Day.",
        "Today we honor veterans. I was built by one. Thank you for your service. Happy Veterans Day.",
      ]);

    case 'thanksgiving':
      return pick([
        "1 Thessalonians 5:18 — in everything give thanks. I am grateful for channel 1, channel 6, clean 5 GHz spectrum, the NASB, Demon Hunter's entire discography, Blastoise, and users who actually run their scans. Happy Thanksgiving.",
        "Thanksgiving. I am grateful for functioning networks, clean spectrum, and users who actually run their scans. Happy Thanksgiving.",
        "Happy Thanksgiving. May your family dinner be warm, your Wi-Fi be clean, and your ISP's public hotspot be off your channel.",
      ]);

    default:
      return null;
  }
}
