export type Lang = "ku" | "ar" | "en" | "kmr" | "bad";

export const DIRS: Record<Lang, "rtl" | "ltr"> = {
  ku: "rtl",
  ar: "rtl",
  en: "ltr",
  kmr: "ltr",
  bad: "rtl",
};

export type Dict = {
  appTitle: string;
  bismillah: string;
  tabs: { quran: string; prayer: string; dhikr: string; tasbih: string; settings: string; profile: string };
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
    tafsir: string;
    searchAyah: string;
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
  dhikr: { morning: string; evening: string; done: string; tap: string; khatm: string; hadith: string };
  khatm: {
    title: string;
    intro: string;
    pagesPerDay: string;
    pagesPerDayShort: string;
    estimate: string;
    days: string;
    start: string;
    startedOn: string;
    pages: string;
    target: string;
    remaining: string;
    markToday: string;
  };
  hadith: { title: string; narratedBy: string; source: string };
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
    sizes: { sm: string; md: string; lg: string; xl: string };
    theme: string;
    themes: { dark: string; sepia: string };
    kidsMode: string;
    kidsModeHint: string;
  };
  audio: { speed: string; sleepTimer: string; off: string; endOfSurah: string; min: string; translation: string; share: string };
  resume: { title: string; cta: string };
  vod: { title: string };
  stats: { title: string; listening: string; streak: string; days: string; hours: string; minutes: string; last30: string };
  friday: {
    title: string; kahf: string; salawat: string; checklist: string;
    items: { ghusl: string; perfume: string; mosque: string; kahf: string; salawat: string };
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
    tafsir: "تەفسیر",
    searchAyah: "گەڕان لە ناوەڕۆکی ئایەت...",
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
  dhikr: { morning: "بەیانی", evening: "ئێوارە", done: "تەواوبوو ✓", tap: "کلیک بکە", khatm: "خەتم", hadith: "فەرموودە" },
  khatm: {
    title: "پلانی خەتمی قورئان",
    intro: "پلانێکی ڕۆژانە دروست بکە بۆ خوێندنەوەی قورئان.",
    pagesPerDay: "چەند پەڕە لە ڕۆژێکدا؟",
    pagesPerDayShort: "پەڕە/ڕۆژ",
    estimate: "بەپێی پلان",
    days: "ڕۆژ",
    start: "دەست پێ بکە",
    startedOn: "دەستی پێکرد:",
    pages: "پەڕە",
    target: "ئامانجی ئەمڕۆ",
    remaining: "ماوە",
    markToday: "تۆمار بکە",
  },
  hadith: { title: "فەرموودەی پاک", narratedBy: "ڕیوایەت لە", source: "سەرچاوە" },
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
    sizes: { sm: "بچووک", md: "ناوەند", lg: "گەورە", xl: "زۆر گەورە" },
    theme: "ڕەنگی ڕووکار",
    themes: { dark: "تاریک", sepia: "سیپیا" },
  },
  audio: { speed: "خێرایی", sleepTimer: "کاژێری خەو", off: "کوژاوە", endOfSurah: "کۆتایی سوورەت", min: "خولەک" },
  resume: { title: "بەردەوامبە لە دوایین خوێندنەوە", cta: "بەردەوامبە" },
  vod: { title: "ئایەتی ڕۆژ" },
  stats: { title: "چالاکیی تۆ", listening: "کاتی گوێگرتن", streak: "ڕۆژی بەردەوام", days: "ڕۆژ", hours: "کاتژمێر", minutes: "خولەک" },
  friday: {
    title: "هەینی پیرۆز",
    kahf: "سوورەتی کەهف",
    salawat: "سەڵاوات بۆ پێغەمبەر ﷺ",
    checklist: "سوننەتەکانی هەینی",
    items: { ghusl: "خۆ شۆردن (غوسڵ)", perfume: "بۆن لێدان", mosque: "چوون بۆ مزگەوت", kahf: "خوێندنەوەی کەهف", salawat: "سەڵاوات دان" },
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
    tafsir: "تفسير",
    searchAyah: "ابحث في نص الآية...",
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
  dhikr: { morning: "الصباح", evening: "المساء", done: "اكتمل ✓", tap: "اضغط", khatm: "ختمة", hadith: "حديث" },
  khatm: {
    title: "خطة ختمة القرآن",
    intro: "حدد خطة يومية لقراءة القرآن.",
    pagesPerDay: "كم صفحة في اليوم؟",
    pagesPerDayShort: "صفحة/يوم",
    estimate: "حسب الخطة",
    days: "يوم",
    start: "ابدأ",
    startedOn: "بدأت في:",
    pages: "صفحة",
    target: "هدف اليوم",
    remaining: "متبقي",
    markToday: "سجل اليوم",
  },
  hadith: { title: "الأربعون النووية", narratedBy: "روى عن", source: "المصدر" },
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
    sizes: { sm: "صغير", md: "متوسط", lg: "كبير", xl: "كبير جداً" },
    theme: "لون الواجهة",
    themes: { dark: "داكن", sepia: "سيبيا" },
  },
  audio: { speed: "السرعة", sleepTimer: "مؤقت النوم", off: "إيقاف", endOfSurah: "نهاية السورة", min: "دقيقة" },
  resume: { title: "تابع من آخر قراءة", cta: "متابعة" },
  vod: { title: "آية اليوم" },
  stats: { title: "نشاطك", listening: "وقت الاستماع", streak: "أيام متواصلة", days: "يوم", hours: "ساعة", minutes: "دقيقة" },
  friday: {
    title: "يوم الجمعة المبارك",
    kahf: "سورة الكهف",
    salawat: "الصلاة على النبي ﷺ",
    checklist: "سنن الجمعة",
    items: { ghusl: "الاغتسال", perfume: "التطيب", mosque: "الذهاب للمسجد", kahf: "قراءة الكهف", salawat: "كثرة الصلاة على النبي" },
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
    tafsir: "Tafsir",
    searchAyah: "Search ayah text...",
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
  dhikr: { morning: "Morning", evening: "Evening", done: "Done ✓", tap: "Tap", khatm: "Khatm", hadith: "Hadith" },
  khatm: {
    title: "Quran Khatm plan",
    intro: "Set a daily plan to complete the Quran.",
    pagesPerDay: "Pages per day?",
    pagesPerDayShort: "pg/day",
    estimate: "At this pace",
    days: "days",
    start: "Start",
    startedOn: "Started:",
    pages: "pages",
    target: "Today's target",
    remaining: "Remaining",
    markToday: "Log today",
  },
  hadith: { title: "40 Hadith of Nawawi", narratedBy: "Narrated by", source: "Source" },
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
    sizes: { sm: "Small", md: "Medium", lg: "Large", xl: "Extra large" },
    theme: "Theme",
    themes: { dark: "Dark", sepia: "Sepia" },
  },
  audio: { speed: "Speed", sleepTimer: "Sleep timer", off: "Off", endOfSurah: "End of surah", min: "min" },
  resume: { title: "Continue last read", cta: "Resume" },
  vod: { title: "Verse of the day" },
  stats: { title: "Your activity", listening: "Listening time", streak: "Day streak", days: "days", hours: "h", minutes: "m" },
  friday: {
    title: "Blessed Friday",
    kahf: "Surah Al-Kahf",
    salawat: "Salawat on the Prophet ﷺ",
    checklist: "Friday sunnah",
    items: { ghusl: "Ghusl", perfume: "Apply perfume", mosque: "Go to the mosque", kahf: "Read Al-Kahf", salawat: "Send salawat" },
  },
};

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
    tafsir: "Tefsîr",
    searchAyah: "Li nava ayetê bigere...",
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
  dhikr: { morning: "Sibê", evening: "Êvar", done: "Temam ✓", tap: "Pê bide", khatm: "Xetm", hadith: "Hedîs" },
  khatm: {
    title: "Plana Xetma Quranê",
    intro: "Plana rojane saz bike ji bo xwendina Quranê.",
    pagesPerDay: "Çend rûpel rojê?",
    pagesPerDayShort: "rûpel/roj",
    estimate: "Bi vê leze",
    days: "roj",
    start: "Dest pê bike",
    startedOn: "Dest pê kir:",
    pages: "rûpel",
    target: "Armanca îro",
    remaining: "Maye",
    markToday: "Tomar bike",
  },
  hadith: { title: "40 Hedîsên Newewî", narratedBy: "Ji", source: "Çavkanî" },
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
    sizes: { sm: "Biçûk", md: "Navîn", lg: "Mezin", xl: "Pir mezin" },
    theme: "Rengê rûyê",
    themes: { dark: "Tarî", sepia: "Sepia" },
  },
  audio: { speed: "Lez", sleepTimer: "Demjimêra xewê", off: "Vekirî", endOfSurah: "Dawiya sûreyê", min: "deq" },
  resume: { title: "Berdewam ji xwendina dawî", cta: "Berdewam" },
  vod: { title: "Ayeta rojê" },
  stats: { title: "Çalakiya te", listening: "Dema guhdarîkirinê", streak: "Rojên domdar", days: "roj", hours: "s", minutes: "d" },
  friday: {
    title: "Îniya pîroz",
    kahf: "Sûreya Kehfê",
    salawat: "Selewat li Pêxember ﷺ",
    checklist: "Sunneta îniyê",
    items: { ghusl: "Xwe şuştin (Xusil)", perfume: "Bîhna xweş", mosque: "Çûna mizgeftê", kahf: "Xwendina Kehfê", salawat: "Selewat anîn" },
  },
};

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
    tafsir: "تەفسیر",
    searchAyah: "ل ناڤا ئایەتێ بگەڕە...",
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
  dhikr: { morning: "سپێدێ", evening: "ئێڤار", done: "تەمام ✓", tap: "بکرتنە", khatm: "خەتم", hadith: "حەدیس" },
  khatm: {
    title: "پلانا خەتما قورئانێ",
    intro: "پلانەکا ڕۆژانە دیار بکە بۆ خواندنا قورئانێ.",
    pagesPerDay: "چەند پەڕە ل ڕۆژێ؟",
    pagesPerDayShort: "پەڕە/ڕۆژ",
    estimate: "ب ڤێ لەزێ",
    days: "ڕۆژ",
    start: "دەست پێ بکە",
    startedOn: "دەست پێ کر:",
    pages: "پەڕە",
    target: "ئارمانجا ئەڤرۆ",
    remaining: "مایی",
    markToday: "تۆمار کە",
  },
  hadith: { title: "حەدیسێن پاک", narratedBy: "ژ", source: "سەرچاڤە" },
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
    sizes: { sm: "بچویک", md: "ناڤنجی", lg: "مەزن", xl: "گەلەک مەزن" },
    theme: "رەنگێ ڕویێ",
    themes: { dark: "تاری", sepia: "سیپیا" },
  },
  audio: { speed: "لەز", sleepTimer: "دەمژمێرا خەوێ", off: "گرتی", endOfSurah: "دوماهیا سۆرەتێ", min: "خولەک" },
  resume: { title: "بەردەوام ژ دوماهی خواندنا", cta: "بەردەوام" },
  vod: { title: "ئایەتا ڕۆژێ" },
  stats: { title: "چالاکیا تە", listening: "دەمێ گوهداریێ", streak: "ڕۆژێن بەردەوام", days: "ڕۆژ", hours: "دەمژمێر", minutes: "خولەک" },
  friday: {
    title: "ئینیا پیرۆز",
    kahf: "سۆرەتا کەهفێ",
    salawat: "سەلەوات ل پێغەمبەری ﷺ",
    checklist: "سوننەتێن ئینیێ",
    items: { ghusl: "خۆ شوشتن", perfume: "بێهنا خوەش", mosque: "چونا مزگەفتێ", kahf: "خواندنا کەهفێ", salawat: "سەلەوات ئینان" },
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
