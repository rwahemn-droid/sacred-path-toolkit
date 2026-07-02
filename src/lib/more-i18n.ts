import type { Lang } from "@/lib/i18n";

export type MoreDict = {
  hubTitle: string;
  categories: {
    ai: string;
    tools: string;
    knowledge: string;
    calendar: string;
  };
  cards: {
    mufti: { title: string; desc: string };
    asma: { title: string; desc: string };
    zakat: { title: string; desc: string };
    events: { title: string; desc: string };
    habits: { title: string; desc: string };
  };
  mufti: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    thinking: string;
    disclaimer: string;
    empty: string;
    error: string;
    suggestions: string[];
  };
  asma: { title: string; subtitle: string; of: string };
  zakat: {
    title: string;
    subtitle: string;
    cash: string;
    gold: string;
    silver: string;
    stocks: string;
    debts: string;
    total: string;
    nisab: string;
    zakatDue: string;
    below: string;
    reset: string;
    currency: string;
    hint: string;
  };
  events: {
    title: string;
    subtitle: string;
    ramadan: string;
    eidFitr: string;
    eidAdha: string;
    hijriNewYear: string;
    ashura: string;
    mawlid: string;
    daysLeft: string;
    today: string;
  };
  habits: {
    title: string;
    subtitle: string;
    add: string;
    placeholder: string;
    streak: string;
    week: string;
    empty: string;
    presets: { fajr: string; quran: string; dhikr: string; salawat: string; witr: string };
  };
};

const ku: MoreDict = {
  hubTitle: "بەشەکانی زیاتر",
  categories: { ai: "زیرەکی دەستکرد", tools: "ئامرازەکان", knowledge: "زانیاری", calendar: "ڕۆژژمێر" },
  cards: {
    mufti: { title: "موفتی AI", desc: "پرسیاری فەتوا و شەرعی بکە" },
    asma: { title: "٩٩ ناوی خودا", desc: "ناوە جوانەکانی الله" },
    zakat: { title: "حیسابی زەکات", desc: "زەکاتی ماڵ و زێڕ" },
    events: { title: "ڕووداوە ئیسلامییەکان", desc: "ڕەمەزان و جەژنەکان" },
    habits: { title: "شوێنپێی عیبادەت", desc: "ڕاهێنانی ڕۆژانەی خۆت" },
  },
  mufti: {
    title: "موفتی AI",
    subtitle: "پرسیارت لەبارەی ئیسلامەوە بکە",
    placeholder: "پرسیارەکەت بنووسە...",
    send: "ناردن",
    thinking: "بیر دەکاتەوە...",
    disclaimer: "ئەم وەڵامانە یارمەتیدەرن، بەڵام هەمیشە پشت بە عالیمی نزیک ببەستە.",
    empty: "دەست پێبکە بە پرسیارێک",
    error: "هەڵە ڕوویدا، دووبارە هەوڵ بدە",
    suggestions: [
      "چۆن نوێژی ئیستیخارە بکەم؟",
      "شەرتەکانی ڕۆژووگرتن چین؟",
      "چ کاتێک زەکات فەرزە؟",
      "چۆن غوسڵ بکەم؟",
    ],
  },
  asma: { title: "٩٩ ناوی جوانی خودا", subtitle: "الأسماء الحسنى", of: "لە" },
  zakat: {
    title: "حیسابی زەکات",
    subtitle: "ژمارە دابنێ بۆ حیسابکردنی زەکات (٢٫٥٪)",
    cash: "پارە و پس‌ئەندازی بانک",
    gold: "زێڕ (بە بەها)",
    silver: "زیو (بە بەها)",
    stocks: "پشکە و وەبەرهێنان",
    debts: "قەرزی سەرتەوە (دەردەکرێت)",
    total: "کۆی ماڵ",
    nisab: "نیساب",
    zakatDue: "زەکاتی سەرتەوە",
    below: "لە نیسابی کەمترە، زەکات لەسەرت نیە",
    reset: "پاک بکەرەوە",
    currency: "دراو",
    hint: "نیساب ≈ بەهای ٨٥ گرام زێڕ. ژمارەیەکی نزیک لە دراوی خۆتەوە دابنێ.",
  },
  events: {
    title: "ڕووداوە ئیسلامییەکان",
    subtitle: "ژماردنی ڕۆژانی ماوە بۆ ڕووداوە گەورەکان",
    ramadan: "دەستپێکی ڕەمەزان",
    eidFitr: "جەژنی فیتر",
    eidAdha: "جەژنی قوربان",
    hijriNewYear: "سەری ساڵی هیجری",
    ashura: "عاشورا",
    mawlid: "مەولیدی نەبی ﷺ",
    daysLeft: "ڕۆژ ماوە",
    today: "ئەمڕۆیە! 🎉",
  },
  habits: {
    title: "شوێنپێی عیبادەت",
    subtitle: "ڕاهێنانە ڕۆژانەکانت بەدواداچوون بکە",
    add: "زیادکردن",
    placeholder: "ناوی ڕاهێنان...",
    streak: "ڕۆژ بەردەوام",
    week: "ئەم حەفتەیە",
    empty: "هیچ ڕاهێنانێک نییە. یەکێک زیاد بکە.",
    presets: {
      fajr: "نوێژی بەیانی لە کاتی خۆیدا",
      quran: "خوێندنی قورئان",
      dhikr: "ئەذکاری بەیانی و ئێوارە",
      salawat: "١٠٠ سەڵاوات",
      witr: "نوێژی ویتر",
    },
  },
};

const ar: MoreDict = {
  hubTitle: "المزيد",
  categories: { ai: "الذكاء الاصطناعي", tools: "أدوات", knowledge: "معرفة", calendar: "التقويم" },
  cards: {
    mufti: { title: "المفتي AI", desc: "اسأل عن الأحكام الشرعية" },
    asma: { title: "٩٩ اسماً لله", desc: "الأسماء الحسنى" },
    zakat: { title: "حاسبة الزكاة", desc: "احسب زكاة مالك" },
    events: { title: "المناسبات الإسلامية", desc: "رمضان والعيدين" },
    habits: { title: "متتبع العبادات", desc: "عاداتك اليومية" },
  },
  mufti: {
    title: "المفتي AI",
    subtitle: "اسأل عن أي أمر شرعي",
    placeholder: "اكتب سؤالك...",
    send: "إرسال",
    thinking: "يفكر...",
    disclaimer: "هذه إجابات إرشادية. يُنصح بالرجوع إلى عالم موثوق.",
    empty: "ابدأ بسؤال",
    error: "حدث خطأ، حاول مرة أخرى",
    suggestions: ["كيف أصلي الاستخارة؟", "ما شروط الصيام؟", "متى تجب الزكاة؟", "كيفية الغسل؟"],
  },
  asma: { title: "الأسماء الحسنى", subtitle: "أسماء الله الحسنى ٩٩", of: "من" },
  zakat: {
    title: "حاسبة الزكاة",
    subtitle: "أدخل قيم ممتلكاتك لحساب الزكاة (٢٫٥٪)",
    cash: "النقد والمدخرات",
    gold: "الذهب (بالقيمة)",
    silver: "الفضة (بالقيمة)",
    stocks: "الأسهم والاستثمارات",
    debts: "الديون المستحقة (تُخصم)",
    total: "الإجمالي",
    nisab: "النصاب",
    zakatDue: "الزكاة الواجبة",
    below: "المبلغ تحت النصاب، لا تجب الزكاة",
    reset: "مسح",
    currency: "العملة",
    hint: "النصاب ≈ قيمة ٨٥ غراماً من الذهب. أدخل تقديراً بعملتك.",
  },
  events: {
    title: "المناسبات الإسلامية",
    subtitle: "الأيام المتبقية للمناسبات الكبرى",
    ramadan: "بداية رمضان",
    eidFitr: "عيد الفطر",
    eidAdha: "عيد الأضحى",
    hijriNewYear: "رأس السنة الهجرية",
    ashura: "عاشوراء",
    mawlid: "المولد النبوي ﷺ",
    daysLeft: "يوم متبقٍّ",
    today: "اليوم! 🎉",
  },
  habits: {
    title: "متتبع العبادات",
    subtitle: "تابع عاداتك اليومية",
    add: "إضافة",
    placeholder: "اسم العادة...",
    streak: "يوم متتالٍ",
    week: "هذا الأسبوع",
    empty: "لا توجد عادات بعد. أضف واحدة.",
    presets: {
      fajr: "صلاة الفجر في وقتها",
      quran: "قراءة القرآن",
      dhikr: "أذكار الصباح والمساء",
      salawat: "١٠٠ صلاة على النبي",
      witr: "صلاة الوتر",
    },
  },
};

const en: MoreDict = {
  hubTitle: "More",
  categories: { ai: "AI", tools: "Tools", knowledge: "Knowledge", calendar: "Calendar" },
  cards: {
    mufti: { title: "AI Mufti", desc: "Ask Islamic questions" },
    asma: { title: "99 Names of Allah", desc: "The beautiful names" },
    zakat: { title: "Zakat Calculator", desc: "Calculate zakat due" },
    events: { title: "Islamic Events", desc: "Ramadan & Eid countdowns" },
    habits: { title: "Ibadah Tracker", desc: "Daily habits" },
  },
  mufti: {
    title: "AI Mufti",
    subtitle: "Ask any Islamic question",
    placeholder: "Type your question...",
    send: "Send",
    thinking: "Thinking...",
    disclaimer: "These answers are guidance — always consult a trusted scholar.",
    empty: "Start with a question",
    error: "Something went wrong. Try again.",
    suggestions: [
      "How do I pray Istikharah?",
      "What are the conditions of fasting?",
      "When is zakat obligatory?",
      "How to perform ghusl?",
    ],
  },
  asma: { title: "99 Names of Allah", subtitle: "Al-Asma Al-Husna", of: "of" },
  zakat: {
    title: "Zakat Calculator",
    subtitle: "Enter your assets to calculate zakat (2.5%)",
    cash: "Cash & savings",
    gold: "Gold (value)",
    silver: "Silver (value)",
    stocks: "Stocks & investments",
    debts: "Debts owed (deducted)",
    total: "Total assets",
    nisab: "Nisab",
    zakatDue: "Zakat due",
    below: "Below nisab — no zakat is due",
    reset: "Reset",
    currency: "Currency",
    hint: "Nisab ≈ value of 85g of gold. Enter an estimate in your currency.",
  },
  events: {
    title: "Islamic Events",
    subtitle: "Countdown to major Islamic dates",
    ramadan: "Start of Ramadan",
    eidFitr: "Eid al-Fitr",
    eidAdha: "Eid al-Adha",
    hijriNewYear: "Hijri New Year",
    ashura: "Ashura",
    mawlid: "Mawlid an-Nabi ﷺ",
    daysLeft: "days left",
    today: "Today! 🎉",
  },
  habits: {
    title: "Ibadah Tracker",
    subtitle: "Track your daily habits",
    add: "Add",
    placeholder: "Habit name...",
    streak: "day streak",
    week: "This week",
    empty: "No habits yet. Add one.",
    presets: {
      fajr: "Fajr on time",
      quran: "Read Quran",
      dhikr: "Morning & evening adhkar",
      salawat: "100 salawat",
      witr: "Witr prayer",
    },
  },
};

const kmr: MoreDict = { ...en, hubTitle: "Zêdetir" };
const bad: MoreDict = { ...ku, hubTitle: "زێدەتر بەش" };

export const MORE: Record<Lang, MoreDict> = { ku, ar, en, kmr, bad };
