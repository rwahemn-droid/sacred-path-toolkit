export type Tasbih = {
  id: string;
  ar: string;
  ku: string;
  ar_meaning: string;
  en: string;
  target: number;
};

export const TASBIHAT: Tasbih[] = [
  { id: "subhanallah", ar: "سُبْحَانَ اللَّهِ", ku: "پاکی بۆ خوا", ar_meaning: "تنزيه الله", en: "Glory be to Allah", target: 33 },
  { id: "alhamdulillah", ar: "الْحَمْدُ لِلَّهِ", ku: "سوپاس بۆ خوا", ar_meaning: "الحمد لله", en: "Praise be to Allah", target: 33 },
  { id: "allahuakbar", ar: "اللَّهُ أَكْبَرُ", ku: "خوا گەورەترە", ar_meaning: "الله أكبر", en: "Allah is the Greatest", target: 34 },
  { id: "lailaha", ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", ku: "هیچ خوایەک نیە جگە لە الله", ar_meaning: "لا إله إلا الله", en: "There is no god but Allah", target: 100 },
  { id: "astaghfirullah", ar: "أَسْتَغْفِرُ اللَّهَ", ku: "لێبووردن لە خوا دەخوازم", ar_meaning: "أستغفر الله", en: "I seek forgiveness from Allah", target: 100 },
  { id: "salawat", ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", ku: "درود لە پێغەمبەر (د.خ)", ar_meaning: "الصلاة على النبي", en: "Send blessings upon Muhammad ﷺ", target: 100 },
  { id: "hawqala", ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", ku: "هیچ هێز و توانایەک نیە تەنها بە خوا", ar_meaning: "لا حول ولا قوة إلا بالله", en: "There is no power except by Allah", target: 100 },
  { id: "subhanwabihamdihi", ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", ku: "پاکی و سوپاسی بۆ خوا", ar_meaning: "تسبيح وحمد", en: "Glory and praise to Allah", target: 100 },
  { id: "subhan_azeem", ar: "سُبْحَانَ اللَّهِ الْعَظِيمِ", ku: "پاکی بۆ خوای گەورە", ar_meaning: "تسبيح", en: "Glory to Allah the Great", target: 100 },
  { id: "tahlil_full", ar: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", ku: "تەهلیلی تەواو", ar_meaning: "تهليل", en: "Full Tahlil", target: 10 },
  { id: "ya_hayy", ar: "يَا حَيُّ يَا قَيُّومُ", ku: "یا حەی یا قەییوم", ar_meaning: "اسمان من أسماء الله", en: "O Ever-Living, O Sustainer", target: 100 },
  { id: "hasbunallah", ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", ku: "خوا بەسمانە و چاکترین کارسازە", ar_meaning: "التوكل", en: "Allah is sufficient for us", target: 100 },
  { id: "rabbi_ighfir", ar: "رَبِّ اغْفِرْ لِي", ku: "پەروەردگارا لێم ببورە", ar_meaning: "استغفار", en: "My Lord, forgive me", target: 100 },
  { id: "allahumma_ajirni", ar: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ", ku: "خوایە لە ئاگری دۆزەخ بمپارێزە", ar_meaning: "استعاذة", en: "O Allah, save me from the Fire", target: 7 },
  { id: "bismillah", ar: "بِسْمِ اللَّهِ", ku: "بە ناوی خوا", ar_meaning: "تسمية", en: "In the name of Allah", target: 100 },
];

export const DEFAULT_TASBIH_ID = "subhanallah";
