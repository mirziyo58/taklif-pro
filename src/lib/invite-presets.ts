import type { EventDef } from "@/lib/events";

/**
 * Tayyor matn variantlari — yaratish formasidagi har maydon ostida ko‘rsatiladi.
 * Mehmon bosing: maydon to‘ladi, keyin o‘zi tahrirlashi mumkin.
 */

const COUPLE_GROOM = ["Sardor", "Jasur", "Bekzod", "Dilshod", "Ulug‘bek", "Shohruh"];
const COUPLE_BRIDE = ["Madina", "Aziza", "Nilufar", "Dilnoza", "Sevara", "Zilola"];

const NAMES_BY_EVENT: Record<string, string[]> = {
  sunnat: ["Abdulloh", "Muhammad", "Ahmad", "Yusuf", "Umar", "Ibrohim"],
  beshik: ["Oysha", "Malika", "Zaynab", "Amina", "Muhammad", "Ali"],
  tugilgan: ["Madina", "Sardor", "Aziza", "Jasur", "Nilufar", "Dilnoza"],
  yubiley: ["Karim aka", "Dilbar opa", "Raxim aka", "Nodira opa", "Hamid aka", "Gulnoza opa"],
};

const GUESTS = [
  "Kamolovlar oilasi",
  "Karimovlar oilasi",
  "Xolmatovlar oilasi",
  "Qarindoshlar",
  "Qo‘shnilar",
  "Do‘stlar",
];

const VENUES = [
  "Navro‘z Saroyi",
  "Oqsaroy",
  "Silk Road",
  "John Baker",
  "Toshkent Saroyi",
  "Xalqlar Do‘stligi Saroyi",
];

const ADDRESSES = [
  "Amir Temur ko‘chasi, 108, Yunusobod tumani, Toshkent",
  "Chilonzor 18-mavze, Toshkent",
  "Yunusobod 12-mavze, Toshkent",
  "Samarqand shahri, Registon ko‘chasi",
  "Buxoro shahri, Bahouddin Naqshband ko‘chasi",
  "Farg‘ona shahri, Al-Farg‘oniy ko‘chasi",
];

const DRESS_WEDDING = [
  "Klassik kechki libos",
  "Iliq pastel va oltin ranglar",
  "Milliy libos",
  "Qora va oq ranglar",
  "Rasmiy uslub — kostyum va ko‘ylak",
];

const DRESS_GENERAL = [
  "Bayramona libos",
  "Milliy libos",
  "Erkin uslub — qulay kiyim",
  "Yorqin, bayramona ranglar",
];

const NOTES = [
  "Iltimos, kelishingizni 3 kun oldin tasdiqlang.",
  "Gul o‘rniga yaxshi tilaklaringiz kifoya.",
  "Mehmonlar uchun bepul avtoturargoh mavjud.",
  "Iltimos, 18:00 ga qadar kelishingizni so‘raymiz.",
  "Bolalar bilan kelishingiz mumkin.",
  "Dasturxon 19:00 da ochiladi — kechikmang.",
];

const MESSAGES: Record<string, string[]> = {
  nikoh: [
    "Hayotimizning eng baxtli kunida siz bilan birga bo‘lishni istaymiz. Muhabbatimiz guvohi bo‘lib, duolaringiz bilan bu kunni yanada nurli qiling.",
    "Ikki qalb bir bo‘lgan bu quvanchli kunda sizni yonimizda ko‘rishdan mamnunmiz. Kelib, bizga duo qiling.",
    "Sizni nikoh to‘yimizga samimiy taklif qilamiz. Davratimizni sharofatlang.",
    "Uzoq yo‘limizning boshlanishida sizning mavjudligingiz eng katta sovg‘a. Marhamat qiling!",
  ],
  fotiha: [
    "Farzandlarimizning fotiha to‘yiga sizni taklif qilamiz. Duolaringiz bilan sharofatlang.",
    "Ikki qalbning birlashuviga guvoh bo‘lish uchun marhamat qiling — dasturxonimiz keng.",
    "Fotiha to‘yimizda yaqinlarimiz bilan birga bo‘lishni istaymiz. Kelishingizni orzu qilamiz.",
  ],
  sunnat: [
    "O‘g‘limizning sunnat to‘yi munosabati bilan dasturxonimizga marhamat qiling.",
    "Farzandimizning bayramida siz bilan birga bo‘lish — biz uchun katta quvonch.",
    "Sunnat to‘yi — farzandimizning ilk bayrami. Tilak va duolaringiz bilan kelib, sharofatlang.",
  ],
  beshik: [
    "Farzandimizning beshik to‘yida siz bilan birga bo‘lishni istaymiz.",
    "Kichkintoyimizning ilk bayramiga marhamat qiling — tilaklaringizni kutamiz.",
    "Beshik to‘yi munosabati bilan dasturxonimizga taklif qilamiz.",
  ],
  tugilgan: [
    "Tug‘ilgan kunimni siz bilan birga nishonlashni istayman.",
    "Yana bir yoshimni yaqinlarim davrasida qarshilamoqchiman — marhamat qiling!",
    "Kechamizga kelib, quvonchimizni bo‘lishingizni so‘rayman.",
  ],
  yubiley: [
    "Yubiley tantanamizga sizni samimiy taklif qilamiz.",
    "Ustozlarimiz va yaqinlarimiz bilan birga bu kunni nishonlashni istaymiz.",
    "Yillar davomi yig‘ilgan bu kunda sizni yonimizda ko‘rishdan mamnunmiz.",
  ],
};

export type InviteVariants = {
  groom: string[];
  bride: string[];
  guests: string[];
  venueName: string[];
  address: string[];
  dressCode: string[];
  notes: string[];
  message: string[];
};

/** Variantlar to‘plami — tanlangan marosim turiga moslanadi. */
export function inviteVariants(ev: EventDef): InviteVariants {
  const messages = MESSAGES[ev.slug] ?? [];
  return {
    groom: ev.couple ? COUPLE_GROOM : NAMES_BY_EVENT[ev.slug] ?? COUPLE_GROOM,
    bride: ev.couple ? COUPLE_BRIDE : [],
    guests: GUESTS,
    venueName: VENUES,
    address: ADDRESSES,
    dressCode: ev.couple ? DRESS_WEDDING : DRESS_GENERAL,
    notes: NOTES,
    message: [...new Set([...messages, ev.defaultMessage])],
  };
}
