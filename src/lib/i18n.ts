export type Lang = "ku" | "ar" | "en" | "kmr" | "bad";

export const DIRS: Record<Lang, "rtl" | "ltr"> = {
  ku: "rtl",
  ar: "rtl",
  en: "ltr",
  kmr: "ltr", // Kurmanji (Latin script)
  bad: "rtl", // Badini (Arabic script)
};

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
    loop: string;
    loopOff: string;
    loopInfinite: string;
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
    qibla: string;
    qiblaTitle: string;
    qiblaHint: string;
    qiblaPermission: string;
    qiblaAligned: string;
    qiblaOff: string;
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
    fontSize: string;
    fontFamily: string;
    sizes: { sm: string; md: string; lg: string; xl: string };
  };
};

const ku: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "قورئان", prayer: "نوێژ", dhikr: "ویرد", tasbih: "تەسبیح", settings: "ڕێکخستن" },
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
    loop: "دووبارە",
    loopOff: "بەبێ دووبارە",
    loopInfinite: "بێکۆتا",
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
    monthly: "کاتەکانی مانگانە",
    monthlyTitle: "کاتەکانی بانگ لە مانگی",
    date: "بەروار",
    close: "داخستن",
    qibla: "قیبلە",
    qiblaTitle: "ئاراستەی قیبلە",
    qiblaHint: "مۆبایلەکەت ڕاست بگرە و ئاراستەکە بگۆڕە تا ئەلماس سەوز ببێت",
    qiblaPermission: "ڕێگەپێدان بدە بۆ کۆمپاس",
    qiblaAligned: "ڕاست بەرامبەری قیبلە ✓",
    qiblaOff: "بسوڕێنە بەرەو ئەلماسی زێڕین",
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
    fontSize: "قەبارەی فۆنت",
    fontFamily: "جۆری فۆنت",
    sizes: { sm: "بچووک", md: "ناوەند", lg: "گەورە", xl: "زۆر گەورە" },
  },
};

const ar: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "القرآن", prayer: "الصلاة", dhikr: "الورد", tasbih: "التسبيح", settings: "الإعدادات" },
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
    loop: "تكرار",
    loopOff: "بدون تكرار",
    loopInfinite: "لانهائي",
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
    monthly: "مواقيت الشهر",
    monthlyTitle: "مواقيت الصلاة لشهر",
    date: "التاريخ",
    close: "إغلاق",
    qibla: "القبلة",
    qiblaTitle: "اتجاه القبلة",
    qiblaHint: "أمسك الهاتف بشكل مسطح ودوّر حتى يتجه السهم نحو الأخضر",
    qiblaPermission: "السماح للبوصلة",
    qiblaAligned: "متجه نحو القبلة ✓",
    qiblaOff: "وجّه نحو السهم الذهبي",
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
    fontSize: "حجم الخط",
    fontFamily: "نوع الخط",
    sizes: { sm: "صغير", md: "متوسط", lg: "كبير", xl: "كبير جداً" },
  },
};

const en: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "Quran", prayer: "Prayer", dhikr: "Wird", tasbih: "Tasbih", settings: "Settings" },
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
    loop: "Loop",
    loopOff: "No loop",
    loopInfinite: "Infinite",
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
    monthly: "Monthly times",
    monthlyTitle: "Prayer times for month",
    date: "Date",
    close: "Close",
    qibla: "Qibla",
    qiblaTitle: "Qibla direction",
    qiblaHint: "Hold the phone flat and rotate until the arrow aligns with green",
    qiblaPermission: "Allow compass access",
    qiblaAligned: "Facing Qibla ✓",
    qiblaOff: "Rotate toward the gold marker",
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
    fontSize: "Font size",
    fontFamily: "Font family",
    sizes: { sm: "Small", md: "Medium", lg: "Large", xl: "Extra large" },
  },
};

// Kurmanji (Northern Kurdish, Latin script)
const kmr: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "Quran", prayer: "Nimêj", dhikr: "Zikir", tasbih: "Tesbîh", settings: "Mîheng" },
  quran: {
    searchPlaceholder: "Li sûreyan bigere...",
    bookmarked: "Sûreyên parastî",
    allSurahs: "Hemû sûre",
    loading: "Tê barkirin...",
    error: "Çewtî di anîna daneyan de",
    ayahs: "ayet",
    back: "← Vegere",
    reciter: "Qarî",
    wordSync: "✦ Senkrona peyvan",
    loop: "Dûbarekirin",
    loopOff: "Bê dûbare",
    loopInfinite: "Bêdawî",
  },
  prayer: {
    nextPrayer: "Nimêja bê",
    remaining: "Maye",
    hours: "saet û",
    minutes: "deqîqe",
    locationCity: "Bajar",
    names: { fajr: "Sibê", sunrise: "Roj-hilatin", dhuhr: "Nîvro", asr: "Êvarê dirêj", maghrib: "Mexrib", isha: "Îşa" },
    am: "BN",
    pm: "PN",
    monthly: "Demên mehê",
    monthlyTitle: "Demên nimêjê yên mehê",
    date: "Dîrok",
    close: "Bigire",
    qibla: "Qible",
    qiblaTitle: "Aliyê Qibleyê",
    qiblaHint: "Telefonê rast bigre û bizivirîne heta tîr li ser kesk be",
    qiblaPermission: "Destûra bûsulê bide",
    qiblaAligned: "Beramberî Qibleyê ✓",
    qiblaOff: "Berev nîşana zêr bizivire",
  },
  dhikr: { morning: "Zikirên sibê", evening: "Zikirên êvarê", done: "Temam ✓", tap: "Pê bide" },
  tasbih: { reset: "Sifir bike", choose: "Zikir hilbijêre" },
  settings: {
    title: "Mîheng",
    language: "Ziman",
    city: "Bajar",
    madhab: "Mezheb",
    shafi: "Şafiî",
    hanafi: "Henefî",
    asrNote: "(Bandorê li dema Esrê dike)",
    by: "bi",
    fontSize: "Mezinahiya tîpê",
    fontFamily: "Cureyê tîpê",
    sizes: { sm: "Biçûk", md: "Navîn", lg: "Mezin", xl: "Pir mezin" },
  },
};

// Badini (Behdini, Northern Kurdish in Arabic script)
const bad: Dict = {
  appTitle: "IbadahPro",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  tabs: { quran: "قورئان", prayer: "نڤێژ", dhikr: "زکر", tasbih: "تەسبیح", settings: "ڕێکخستن" },
  quran: {
    searchPlaceholder: "ل سۆرەتا بگەڕە...",
    bookmarked: "سۆرەتێن پاراستی",
    allSurahs: "هەمی سۆرەت",
    loading: "ل دەرئێنانێیە...",
    error: "خەلەتی ل وەرگرتنا داتا",
    ayahs: "ئایەت",
    back: "← زڤڕین",
    reciter: "قاری",
    wordSync: "✦ سینکا پەیڤا",
    loop: "ددوبارەکرن",
    loopOff: "بێ ددوبارە",
    loopInfinite: "بێ کۆتایی",
  },
  prayer: {
    nextPrayer: "نڤێژا بێ",
    remaining: "مایی",
    hours: "دەمژمێر و",
    minutes: "خولەک",
    locationCity: "باژێر",
    names: { fajr: "سپێدێ", sunrise: "ڕۆژهەلات", dhuhr: "نیڤرۆ", asr: "ئەسر", maghrib: "ئێڤارێ", isha: "عیشا" },
    am: "ب.ن",
    pm: "د.ن",
    monthly: "دەمێن مەهانە",
    monthlyTitle: "دەمێن بانگێ ل مەها",
    date: "دیرۆک",
    close: "گرتن",
    qibla: "قیبلە",
    qiblaTitle: "ئاراستا قیبلەی",
    qiblaHint: "مۆبایلێ ڕاست بگرە و بزڤڕینە هەتا تیر بێتە سەر کەسک",
    qiblaPermission: "دەستوور دە بۆ پشتیڤانێ",
    qiblaAligned: "بەرامبەری قیبلەی ✓",
    qiblaOff: "بەرەڤ نیشانا زێڕین بزڤڕە",
  },
  dhikr: { morning: "زکرێن سپێدێ", evening: "زکرێن ئێڤارێ", done: "تەمام ✓", tap: "بکرتنە" },
  tasbih: { reset: "سفر کرن", choose: "زکر هەلبژێرە" },
  settings: {
    title: "ڕێکخستن",
    language: "زمان",
    city: "باژێر",
    madhab: "مەزهەب",
    shafi: "شافعی",
    hanafi: "حەنەفی",
    asrNote: "(کارتێکرنا وی ل دەمێ ئەسری هەی)",
    by: "ب",
    fontSize: "مەزنایا فۆنتی",
    fontFamily: "جۆرێ فۆنتی",
    sizes: { sm: "بچویک", md: "ناڤنجی", lg: "مەزن", xl: "گەلەک مەزن" },
  },
};

export const DICTS: Record<Lang, Dict> = { ku, ar, en, kmr, bad };

export const LANG_LABELS: Record<Lang, string> = {
  ku: "کوردی",
  ar: "العربية",
  en: "English",
  kmr: "Kurmancî",
  bad: "بادینی",
};
