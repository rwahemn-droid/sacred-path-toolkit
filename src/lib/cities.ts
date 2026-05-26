// Cities of Kurdistan + major regional centers, with coordinates & timezone.
// Used for prayer-time calculation per selected city.

export type City = {
  id: string;
  lat: number;
  lon: number;
  tz: string;
  ku: string;
  ar: string;
  en: string;
};

export const CITIES: City[] = [
  // Iraqi Kurdistan
  { id: "hawler", lat: 36.1911, lon: 44.0093, tz: "Asia/Baghdad", ku: "هەولێر", ar: "أربيل", en: "Erbil" },
  { id: "slemani", lat: 35.5613, lon: 45.4408, tz: "Asia/Baghdad", ku: "سلێمانی", ar: "السليمانية", en: "Sulaymaniyah" },
  { id: "duhok", lat: 36.8669, lon: 42.9486, tz: "Asia/Baghdad", ku: "دهۆک", ar: "دهوك", en: "Duhok" },
  { id: "halabja", lat: 35.1772, lon: 45.9864, tz: "Asia/Baghdad", ku: "هەڵەبجە", ar: "حلبجة", en: "Halabja" },
  { id: "kerkuk", lat: 35.4681, lon: 44.3922, tz: "Asia/Baghdad", ku: "کەرکوک", ar: "كركوك", en: "Kirkuk" },
  { id: "ranya", lat: 36.2528, lon: 44.8806, tz: "Asia/Baghdad", ku: "ڕانیە", ar: "رانية", en: "Ranya" },
  { id: "soran", lat: 36.6531, lon: 44.5419, tz: "Asia/Baghdad", ku: "سۆران", ar: "سوران", en: "Soran" },
  { id: "koya", lat: 36.0833, lon: 44.6333, tz: "Asia/Baghdad", ku: "کۆیە", ar: "كويسنجق", en: "Koya" },
  { id: "akre", lat: 36.7397, lon: 43.8919, tz: "Asia/Baghdad", ku: "ئاکرێ", ar: "عقرة", en: "Akre" },
  { id: "zakho", lat: 37.1431, lon: 42.6817, tz: "Asia/Baghdad", ku: "زاخۆ", ar: "زاخو", en: "Zakho" },
  { id: "shaqlawa", lat: 36.4031, lon: 44.3247, tz: "Asia/Baghdad", ku: "شەقڵاوە", ar: "شقلاوة", en: "Shaqlawa" },
  { id: "chamchamal", lat: 35.5236, lon: 44.8347, tz: "Asia/Baghdad", ku: "چەمچەماڵ", ar: "جمجمال", en: "Chamchamal" },
  { id: "kalar", lat: 34.6306, lon: 45.3214, tz: "Asia/Baghdad", ku: "کەلار", ar: "كلار", en: "Kalar" },
  { id: "darbandikhan", lat: 35.1133, lon: 45.7028, tz: "Asia/Baghdad", ku: "دەربەندیخان", ar: "دربنديخان", en: "Darbandikhan" },
  { id: "penjwen", lat: 35.6256, lon: 45.9450, tz: "Asia/Baghdad", ku: "پێنجوێن", ar: "بنجوين", en: "Penjwen" },
  { id: "qaladze", lat: 36.1833, lon: 45.1333, tz: "Asia/Baghdad", ku: "قەڵادزێ", ar: "قلعة دزة", en: "Qaladze" },
  { id: "mosul", lat: 36.3450, lon: 43.1450, tz: "Asia/Baghdad", ku: "مووسڵ", ar: "الموصل", en: "Mosul" },
  { id: "baghdad", lat: 33.3152, lon: 44.3661, tz: "Asia/Baghdad", ku: "بەغدا", ar: "بغداد", en: "Baghdad" },
  // Rojhelat (Iran)
  { id: "sine", lat: 35.3119, lon: 46.9963, tz: "Asia/Tehran", ku: "سنە", ar: "سنندج", en: "Sanandaj" },
  { id: "mahabad", lat: 36.7631, lon: 45.7222, tz: "Asia/Tehran", ku: "مەهاباد", ar: "مهاباد", en: "Mahabad" },
  { id: "urmia", lat: 37.5527, lon: 45.0760, tz: "Asia/Tehran", ku: "ورمێ", ar: "أرومية", en: "Urmia" },
  { id: "kermanshah", lat: 34.3142, lon: 47.0650, tz: "Asia/Tehran", ku: "کرماشان", ar: "كرمنشاه", en: "Kermanshah" },
  { id: "ilam", lat: 33.6374, lon: 46.4227, tz: "Asia/Tehran", ku: "ئیلام", ar: "إيلام", en: "Ilam" },
  { id: "saqqez", lat: 36.2497, lon: 46.2736, tz: "Asia/Tehran", ku: "سەقز", ar: "سقز", en: "Saqqez" },
  { id: "bokan", lat: 36.5211, lon: 46.2114, tz: "Asia/Tehran", ku: "بۆکان", ar: "بوكان", en: "Bukan" },
  // Bakur (Turkey)
  { id: "amed", lat: 37.9144, lon: 40.2306, tz: "Europe/Istanbul", ku: "ئامەد", ar: "ديار بكر", en: "Diyarbakır" },
  { id: "wan", lat: 38.4942, lon: 43.3800, tz: "Europe/Istanbul", ku: "وان", ar: "وان", en: "Van" },
  { id: "merdin", lat: 37.3122, lon: 40.7350, tz: "Europe/Istanbul", ku: "مێردین", ar: "ماردين", en: "Mardin" },
  { id: "ruha", lat: 37.1591, lon: 38.7969, tz: "Europe/Istanbul", ku: "ڕەها", ar: "أورفة", en: "Şanlıurfa" },
  { id: "hakkari", lat: 37.5833, lon: 43.7333, tz: "Europe/Istanbul", ku: "هەکاری", ar: "هكاري", en: "Hakkâri" },
  { id: "batman", lat: 37.8812, lon: 41.1351, tz: "Europe/Istanbul", ku: "بەتمان", ar: "باتمان", en: "Batman" },
  // Rojava (Syria)
  { id: "qamishlo", lat: 37.0522, lon: 41.2317, tz: "Asia/Damascus", ku: "قامیشلۆ", ar: "القامشلي", en: "Qamishli" },
  { id: "kobani", lat: 36.8906, lon: 38.3536, tz: "Asia/Damascus", ku: "کۆبانێ", ar: "عين العرب", en: "Kobani" },
  { id: "afrin", lat: 36.5119, lon: 36.8689, tz: "Asia/Damascus", ku: "عەفرین", ar: "عفرين", en: "Afrin" },
  { id: "hasaka", lat: 36.5028, lon: 40.7475, tz: "Asia/Damascus", ku: "حەسەکە", ar: "الحسكة", en: "Hasakah" },
];

export const DEFAULT_CITY_ID = "hawler";

export function findCity(id: string): City {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}
