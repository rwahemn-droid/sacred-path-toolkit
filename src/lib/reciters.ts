// Reciter list with everyayah.com folder identifiers and quran.com recitation IDs (where available)
// quranComId enables word-by-word timing highlighting via api.quran.com

export type Reciter = {
  id: string;
  name: string; // Kurdish/Arabic display name
  everyayah: string; // folder on everyayah.com/data/
  quranComId?: number; // recitation id at api.quran.com (for word timing)
};

export const RECITERS: Reciter[] = [
  { id: "afasy", name: "میشاری ڕەشید ئەلعەفاسی", everyayah: "Alafasy_64kbps", quranComId: 7 },
  { id: "sudais", name: "عەبدولڕەحمان ئەلسودەیس", everyayah: "Abdurrahmaan_As-Sudais_192kbps", quranComId: 3 },
  { id: "husary", name: "مەحموود خەلیل ئەلحوسەری", everyayah: "Husary_64kbps", quranComId: 2 },
  { id: "minshawi", name: "محەممەد سدیق ئەلمەنشاوی", everyayah: "Minshawy_Murattal_128kbps", quranComId: 9 },
  { id: "abdulbasit", name: "عەبدولباست عەبدولسەمەد", everyayah: "AbdulSamad_64kbps_QuranExplorer.Com", quranComId: 1 },
  { id: "shuraim", name: "سعوود ئەلشورەیم", everyayah: "Saood_ash-Shuraym_64kbps", quranComId: 4 },
  { id: "ghamdi", name: "سەعد ئەلغامدی", everyayah: "Ghamadi_40kbps" },
  { id: "maher", name: "مەهیر ئەلمەعەقلی", everyayah: "MaherAlMuaiqly64kbps" },
  { id: "ajamy", name: "ئەحمەد عەجەمی", everyayah: "ahmed_ibn_ali_al-ajamy_128kbps" },
  { id: "dossary", name: "یاسر ئەلدەوسەری", everyayah: "Yasser_Ad-Dussary_128kbps" },
  { id: "qatami", name: "ناسر ئەلقەتامی", everyayah: "Nasser_Alqatami_128kbps" },
  { id: "ayyub", name: "موحەممەد ئەیووب", everyayah: "Muhammad_Ayyoub_64kbps" },
  { id: "basfar", name: "عەبدوڵڵا بەسفەر", everyayah: "Abdullah_Basfar_192kbps" },
  { id: "alijaber", name: "عەلی جابر", everyayah: "Ali_Jaber_64kbps" },
  { id: "fares", name: "فارس عەباد", everyayah: "Fares_Abbad_64kbps" },
  { id: "mustafa", name: "مستەفا ئیسماعیل", everyayah: "Mostafa_Ismaeel_128kbps" },
  { id: "albanna", name: "مەحموود عەلی ئەلبەننا", everyayah: "mahmoud_ali_al_banna_32kbps" },
  { id: "budair", name: "سەڵاح ئەلبودەیر", everyayah: "Salah_Al_Budair_128kbps" },
  { id: "tunaiji", name: "خەلیفە ئەلتونەیجی", everyayah: "khalefa_al_tunaiji_64kbps" },
  { id: "qasim", name: "عەبدولموحسین ئەلقاسم", everyayah: "Abdullah_Matroud_128kbps" },
  { id: "balushi", name: "هەززاع ئەل بەلووشی", everyayah: "Hazza_Al_Balushi_32kbps" },
  { id: "subhi", name: "ئیسلام سوبحی", everyayah: "Islam_Sobhi_128kbps" },
  { id: "sayegh", name: "تەوفیق ئەلسایغ", everyayah: "Tawfeeq_As-Sayegh_128kbps" },
  { id: "bahtimi", name: "کامل یووسف ئەلبەهتیمی", everyayah: "Karim_Mansoori_40kbps" },
  { id: "shuaisha", name: "ئەبو عەینەین شوعەیشعاع", everyayah: "Abu_Bakr_Ash-Shaatree_64kbps" },
  { id: "rifai", name: "محەممەد ڕەفێع", everyayah: "Hani_Rifai_192kbps" },
  { id: "zahran", name: "عەبدولعەزیز زەهران", everyayah: "Abdullaah_3awwaad_Al-Juhaynee_128kbps" },
  { id: "arkani", name: "عەبدولوەلی ئەلئەرکانی", everyayah: "Abdul_Wadood_Haneef_44kbps" },
];

export const DEFAULT_RECITER_ID = "afasy";

export function ayahAudioUrl(reciter: Reciter, surahNum: number, ayahInSurah: number) {
  const s = String(surahNum).padStart(3, "0");
  const a = String(ayahInSurah).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.everyayah}/${s}${a}.mp3`;
}
