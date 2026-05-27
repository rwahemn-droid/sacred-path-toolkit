export type Lang = "ku" | "ar" | "en";

export const DIRS: Record<Lang, "rtl" | "ltr"> = { ku: "rtl", ar: "rtl", en: "ltr" };

export type Dict = {
  appTitle: string;
  bismillah: string;
  tabs: { quran: string; prayer: string; dhikr: string; tasbih: string; settings: string };
  quran: {
    searchPlaceholder: string;
    bookmarked: string;
    allSurahs: string;
    loading: string;
    error: string;
    ayahs: string;
    back: string;
    reciter: string;
    wordSync: string;
  };
  prayer: {
    nextPrayer: string;
    remaining: string;
    hours: string;
    minutes: string;
    locationCity: string;
    names: { fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string };
    am: string;
    pm: string;
    monthly: string;
    monthlyTitle: string;
    date: string;
    close: string;
  };
  dhikr: { morning: string; evening: string; done: string; tap: string };
  tasbih: { reset: string; choose: string };
  settings: {
    title: string;
    language: string;
    city: string;
    madhab: string;
    shafi: string;
    hanafi: string;
    asrNote: string;
    by: string;
  };
};

const ku: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "قورئان", prayer: "نوێژ", dhikr: "زیکر", tasbih: "تەسبیح", settings: "ڕێکخستن" },
  quran: {
    searchPlaceholder: "گەڕان لە سوورەتەکان...",
    bookmarked: "سوورەتە بوکمارککراوەکان",
    allSurahs: "هەموو سوورەتەکان",
    loading: "بارکردن...",
    error: "هەڵە لە هێنانی داتا",
    ayahs: "ئایەت",
    back: "← گەڕانەوە",
    reciter: "قاری",
    wordSync: "✦ سینکی وشە",
  },
  prayer: {
    nextPrayer: "نوێژی داهاتوو",
    remaining: "ماوە",
    hours: "کاتژمێر و",
    minutes: "خولەک",
    locationCity: "شار",
    names: { fajr: "بەیانی", sunrise: "خۆرهەڵات", dhuhr: "نیوەڕۆ", asr: "عەسر", maghrib: "ئێوارە", isha: "خەوتنان" },
    am: "ب.ن",
    pm: "د.ن",
  },
  dhikr: { morning: "ویردی بەیانی", evening: "ویردی ئێوارە", done: "تەواوبوو ✓", tap: "کلیک بکە" },
  tasbih: { reset: "سفر کردنەوە", choose: "هەڵبژاردنی زیکر" },
  settings: {
    title: "ڕێکخستن",
    language: "زمان",
    city: "شار",
    madhab: "مەزهەب",
    shafi: "شافیعی",
    hanafi: "حەنەفی",
    asrNote: "(کاریگەری لەسەر کاتی عەسر دەکات)",
    by: "بە",
  },
};

const ar: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "القرآن", prayer: "الصلاة", dhikr: "الأذكار", tasbih: "التسبيح", settings: "الإعدادات" },
  quran: {
    searchPlaceholder: "ابحث في السور...",
    bookmarked: "السور المحفوظة",
    allSurahs: "كل السور",
    loading: "جارٍ التحميل...",
    error: "خطأ في جلب البيانات",
    ayahs: "آية",
    back: "← رجوع",
    reciter: "القارئ",
    wordSync: "✦ مزامنة الكلمات",
  },
  prayer: {
    nextPrayer: "الصلاة القادمة",
    remaining: "متبقي",
    hours: "ساعة و",
    minutes: "دقيقة",
    locationCity: "المدينة",
    names: { fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء" },
    am: "ص",
    pm: "م",
  },
  dhikr: { morning: "أذكار الصباح", evening: "أذكار المساء", done: "اكتمل ✓", tap: "اضغط" },
  tasbih: { reset: "إعادة تعيين", choose: "اختر الذكر" },
  settings: {
    title: "الإعدادات",
    language: "اللغة",
    city: "المدينة",
    madhab: "المذهب",
    shafi: "شافعي",
    hanafi: "حنفي",
    asrNote: "(يؤثر على وقت العصر)",
    by: "بـ",
  },
};

const en: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "Quran", prayer: "Prayer", dhikr: "Dhikr", tasbih: "Tasbih", settings: "Settings" },
  quran: {
    searchPlaceholder: "Search surahs...",
    bookmarked: "Bookmarked surahs",
    allSurahs: "All surahs",
    loading: "Loading...",
    error: "Failed to load data",
    ayahs: "verses",
    back: "← Back",
    reciter: "Reciter",
    wordSync: "✦ Word sync",
  },
  prayer: {
    nextPrayer: "Next prayer",
    remaining: "remaining",
    hours: "h",
    minutes: "min",
    locationCity: "City",
    names: { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" },
    am: "AM",
    pm: "PM",
  },
  dhikr: { morning: "Morning adhkar", evening: "Evening adhkar", done: "Done ✓", tap: "Tap" },
  tasbih: { reset: "Reset", choose: "Choose dhikr" },
  settings: {
    title: "Settings",
    language: "Language",
    city: "City",
    madhab: "Madhab",
    shafi: "Shafi",
    hanafi: "Hanafi",
    asrNote: "(affects Asr time)",
    by: "by",
  },
};

export const DICTS: Record<Lang, Dict> = { ku, ar, en };

export const LANG_LABELS: Record<Lang, string> = {
  ku: "کوردی",
  ar: "العربية",
  en: "English",
};
