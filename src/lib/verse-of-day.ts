// Curated verses with reference. Selection rotates by day-of-year.
export type VerseOfDay = {
  surah: number;
  ayah: number;
  ar: string;
  ku: string;
  en: string;
};

export const VERSES_OF_DAY: VerseOfDay[] = [
  {
    surah: 2, ayah: 286,
    ar: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    ku: "خوا کەس بەرپرس ناکات تەنیا بەقەدەر توانای خۆی نەبێت.",
    en: "Allah does not burden a soul beyond that it can bear.",
  },
  {
    surah: 94, ayah: 6,
    ar: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    ku: "بێگومان لەگەڵ هەر سەختییەک ئاسانییەک هەیە.",
    en: "Indeed, with hardship comes ease.",
  },
  {
    surah: 2, ayah: 152,
    ar: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ",
    ku: "یادم بکەن، یادتان دەکەم.",
    en: "Remember Me; I will remember you.",
  },
  {
    surah: 13, ayah: 28,
    ar: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    ku: "ئاگاداربن، تەنیا بە یادی خوا دڵەکان ئارام دەبن.",
    en: "Verily, in the remembrance of Allah do hearts find rest.",
  },
  {
    surah: 65, ayah: 3,
    ar: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ",
    ku: "هەرکەس پشت بە خوا ببەستێت، خوا بەسە بۆ ئەو.",
    en: "Whoever places their trust in Allah, He is sufficient for them.",
  },
  {
    surah: 39, ayah: 53,
    ar: "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ",
    ku: "نائومێد مەبن لە ڕەحمەتی خوا.",
    en: "Do not despair of the mercy of Allah.",
  },
  {
    surah: 3, ayah: 173,
    ar: "حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
    ku: "خوا بەسە بۆ ئێمە، چ پشتیوانێکی چاکیشە.",
    en: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
  },
  {
    surah: 2, ayah: 153,
    ar: "إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
    ku: "بێگومان خوا لەگەڵ ئارامگرانە.",
    en: "Indeed, Allah is with the patient.",
  },
];

export function verseOfToday(): VerseOfDay {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = +new Date() - +start;
  const day = Math.floor(diff / 86400000);
  return VERSES_OF_DAY[day % VERSES_OF_DAY.length];
}
