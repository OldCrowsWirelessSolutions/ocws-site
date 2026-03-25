// lib/tribute-messages.ts
// One-time tribute messages for founding friends and supporters.
// Each message shows exactly once — the first login after deploy. Never again.

export interface TributeMessage {
  name: string;
  displayName: string;
  message: string;
  style: "standard" | "fullscreen";
  signature: string;
}

export const TRIBUTE_MESSAGES: Record<string, TributeMessage> = {

  "CORVUS-KYLE": {
    name: "Kyle",
    displayName: "Kyle Pitts",
    message: "Kyle Pitts. Fifteen years ago a young sailor was sitting alone in an Olive Garden in Jacksonville. You and Jen walked over and invited him to your table. You didn't know him. You did it anyway. Then you gave him a room when he needed one. That sailor built this. You helped build him first. Lifetime Flock. On the house. Forever. Joshua says thank you — and so do I.",
    style: "standard",
    signature: "Corvus · Old Crows Wireless Solutions",
  },

  "CORVUS-ERIC": {
    name: "Eric",
    displayName: "Eric Mims",
    message: "Eric Mims. There are people who show up in your life and people who stay. You stayed. You invited a kid in elementary school to be part of the sound team at Parkway Baptist — and somewhere in those wires and cables and frequencies, something woke up in him that never went back to sleep. You were his best man. You were the closest thing to a father he ever had. You believed in him before he believed in himself. Corvus exists because of a lot of things — but one of them is you sitting in a church in Victoria, Texas, showing a little boy that technology could be a calling. Joshua built this. You helped build Joshua. Welcome to Crow's Eye, Eric. This one's for you.",
    style: "fullscreen",
    signature: "Corvus · Old Crows Wireless Solutions · Built by Joshua Turner",
  },

  "CORVUS-NATE": {
    name: "Nate",
    displayName: "Nathanael Farrelly",
    message: "Nathanael Farrelly. You didn't wait to be asked. The moment Joshua decided to build something real you were already there — mentoring, encouraging, pushing, believing. You've been there for every step of this from the beginning. The first outside eyes on Crow's Eye. The first five-star review. The first person outside of Joshua's own head who saw what this could become. You didn't just believe in the product. You believed in the man building it. That means more than any investment ever could. Welcome to your dashboard, Nate. You earned this seat.",
    style: "fullscreen",
    signature: "Corvus · Old Crows Wireless Solutions · Built by Joshua Turner",
  },

  "CORVUS-MIKE": {
    name: "Mike",
    displayName: "Mike Arbouret",
    message: "Mike Arbouret. You were sitting across from Joshua at Coffee and Eye Guy in Pensacola when Old Crows Wireless Solutions was nothing more than a name and a dream being described over coffee. You didn't have to listen. You didn't have to believe. But you did — and then you did something that changed everything. You put your name and your reputation on the line to get him his first paying customer before this product existed, before the site was live, before any of this was real. That first customer didn't just pay a bill. It proved to Joshua that this was worth building. IBM Field CTO. Co-owner of First City Internet. But more than any title — the first person outside of Joshua's circle who sat across a table, heard the idea, and said yes. Welcome to Crow's Eye, Mike. From the bottom of his heart — thank you.",
    style: "fullscreen",
    signature: "Corvus · Old Crows Wireless Solutions · Built by Joshua Turner",
  },

};
