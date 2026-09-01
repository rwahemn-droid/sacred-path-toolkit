import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GraduationCap, CheckCircle2, Circle, Play, Pause, RotateCcw, Brain, XCircle } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl } from "@/lib/reciters";

type Tri = [string, string, string]; // ku, ar, en
type Example = { parts: { t: string; hl?: boolean }[]; ref: Tri; a: [number, number] };
type Lesson = { id: string; name: Tri; desc: Tri; color: string; examples: Example[] };

const STORE = "tajweed-progress-v1";

const p = (t: string) => ({ t });
const h = (t: string) => ({ t, hl: true });


const LESSONS: Lesson[] = [
  {
    id: "intro-makharij",
    name: ["مەخرەجی پیتەکان", "مخارج الحروف", "Articulation Points"],
    desc: [
      "هەر پیتێکی عەرەبی شوێنێکی دیاریکراوی دەرچوونی هەیە لە دەم و گەروودا. دروست دەرکردنی پیتەکان بنەمای تەجویدە.",
      "لكل حرف عربي مخرج محدد في الفم والحلق. إخراج الحرف من مخرجه الصحيح هو أساس التجويد.",
      "Every Arabic letter has a precise point of articulation in the throat or mouth. Correct articulation is the foundation of Tajweed.",
    ],
    color: "#38bdf8",
    examples: [
      { parts: [p("قُلْ هُوَ اللَّهُ أَ"), h("حَ"), p("دٌ")], ref: ["ئیخلاص ١", "الإخلاص ١", "Al-Ikhlas 1"], a: [112, 1] },
      { parts: [h("ع"), p("َمَّ يَتَسَاءَلُونَ")], ref: ["نەبە ١", "النبأ ١", "An-Naba 1"], a: [78, 1] },
    ],
  },
  {
    id: "noon-sakinah-idhhar",
    name: ["ئیظهار", "الإظهار", "Idhhār (Clear pronunciation)"],
    desc: [
      "ئەگەر نوونی ساکن یان تەنوین پێش یەکێک لە پیتەکانی گەروو (ء ه ع ح غ خ) بێت، بە ڕوونی دەخوێنرێتەوە بێ غونە.",
      "إذا جاء بعد النون الساكنة أو التنوين أحد حروف الحلق (ء ه ع ح غ خ) تُنطق النون واضحة بلا غنّة.",
      "When nūn sākinah or tanwīn is followed by a throat letter (ء ه ع ح غ خ), the nūn is pronounced clearly with no nasalization.",
    ],
    color: "#22c55e",
    examples: [
      { parts: [p("مِ"), h("نْ ح"), p("َكِيمٍ حَمِيدٍ")], ref: ["فوسسیلەت ٤٢", "فصلت ٤٢", "Fussilat 42"], a: [41, 42] },
      { parts: [p("يَنْ"), h("ئ"), p("َوْنَ")], ref: ["ئەنعام ٢٦", "الأنعام ٢٦", "Al-Anʿam 26"], a: [6, 26] },
    ],
  },
  {
    id: "idgham",
    name: ["ئیدغام", "الإدغام", "Idghām (Merging)"],
    desc: [
      "نوونی ساکن یان تەنوین دەتوێتەوە لە پیتەکانی (ی ر م ل و ن). لەگەڵ (ی ن م و) بە غونەوە، لەگەڵ (ل ر) بێ غونە.",
      "تُدغم النون الساكنة أو التنوين في حروف (ي ر م ل و ن): مع (ينمو) بغنّة، ومع (ل ر) بغير غنّة.",
      "Nūn sākinah or tanwīn merges into (ي ر م ل و ن): with nasalization for ينمو, without it for ل and ر.",
    ],
    color: "#a855f7",
    examples: [
      { parts: [p("مَ"), h("نْ يَ"), p("عْمَلْ")], ref: ["زەلزەلە ٧", "الزلزلة ٧", "Az-Zalzalah 7"], a: [99, 7] },
      { parts: [p("مِ"), h("نْ رَ"), p("بِّهِمْ")], ref: ["بەقەرە ٥", "البقرة ٥", "Al-Baqarah 5"], a: [2, 5] },
    ],
  },
  {
    id: "iqlab",
    name: ["ئیقلاب", "الإقلاب", "Iqlāb (Conversion)"],
    desc: [
      "ئەگەر دوای نوونی ساکن یان تەنوین پیتی (ب) هات، نوون دەگۆڕدرێت بۆ (م) بە غونەوە.",
      "إذا جاء بعد النون الساكنة أو التنوين حرف الباء تُقلب النون ميماً مع الغنّة.",
      "When nūn sākinah or tanwīn is followed by (ب), the nūn turns into a hidden mīm with nasalization.",
    ],
    color: "#f97316",
    examples: [
      { parts: [p("مِ"), h("نْ بَ"), p("عْدِ")], ref: ["بەقەرە ٢٧", "البقرة ٢٧", "Al-Baqarah 27"], a: [2, 27] },
      { parts: [p("سَمِيعٌ"), h(" بَ"), p("صِيرٌ")], ref: ["ئیسرا ١", "الإسراء ١", "Al-Isra 1"], a: [17, 1] },
    ],
  },
  {
    id: "ikhfa",
    name: ["ئیخفا", "الإخفاء", "Ikhfāʾ (Hiding)"],
    desc: [
      "لەگەڵ ١٥ پیتی ماوە، نوونی ساکن یان تەنوین بە شێوەیەکی نێوان ئیظهار و ئیدغام دەخوێنرێت بە غونەی دوو حەرەکە.",
      "مع الحروف الخمسة عشر الباقية تُنطق النون بصفة بين الإظهار والإدغام مع غنّة بمقدار حركتين.",
      "With the remaining fifteen letters, the nūn is pronounced between clear and merged, with a two-count nasalization.",
    ],
    color: "#eab308",
    examples: [
      { parts: [p("أَ"), h("نْ ت"), p("َقُولُوا")], ref: ["مائیدە ١٩", "المائدة ١٩", "Al-Maidah 19"], a: [5, 19] },
      { parts: [p("مِ"), h("نْ ش"), p("َرِّ")], ref: ["فەلەق ٢", "الفلق ٢", "Al-Falaq 2"], a: [113, 2] },
    ],
  },
  {
    id: "meem-sakinah",
    name: ["حوکمەکانی میمی ساکن", "أحكام الميم الساكنة", "Rules of Mīm Sākinah"],
    desc: [
      "میمی ساکن سێ حوکمی هەیە: ئیخفای شەفەوی (پێش ب)، ئیدغامی مثلین (پێش م)، ئیظهاری شەفەوی (لەگەڵ ئەوانی تر).",
      "للميم الساكنة ثلاثة أحكام: الإخفاء الشفوي قبل الباء، وإدغام المثلين قبل الميم، والإظهار الشفوي مع باقي الحروف.",
      "Mīm sākinah has three rules: labial ikhfāʾ before ب, merging before م, and clear pronunciation with all other letters.",
    ],
    color: "#06b6d4",
    examples: [
      { parts: [p("تَرْمِيهِ"), h("مْ بِ"), p("حِجَارَةٍ")], ref: ["فیل ٤", "الفيل ٤", "Al-Fil 4"], a: [105, 4] },
      { parts: [p("لَهُ"), h("مْ مَ"), p("ا يَشَاءُونَ")], ref: ["زومەر ٣٤", "الزمر ٣٤", "Az-Zumar 34"], a: [39, 34] },
    ],
  },
  {
    id: "ghunnah",
    name: ["غونەی موشەددەد", "الغنّة المشدّدة", "Ghunnah (Nasalization)"],
    desc: [
      "هەر نوون و میمێکی شەددەدار بە غونەی دوو حەرەکە دەخوێنرێتەوە لە لووتەوە.",
      "كل نون أو ميم مشدّدة تُنطق بغنّة مقدارها حركتان من الخيشوم.",
      "Every doubled nūn or mīm is held with a two-count nasal sound.",
    ],
    color: "#ec4899",
    examples: [
      { parts: [p("إِ"), h("نَّ"), p(" الْإِنسَانَ")], ref: ["عەسر ٢", "العصر ٢", "Al-ʿAsr 2"], a: [103, 2] },
      { parts: [h("ثُمَّ"), p(" كَلَّا سَوْفَ تَعْلَمُونَ")], ref: ["تەکاسور ٤", "التكاثر ٤", "At-Takathur 4"], a: [102, 4] },
    ],
  },
  {
    id: "qalqalah",
    name: ["قەلقەلە", "القلقلة", "Qalqalah (Echo)"],
    desc: [
      "پیتەکانی (ق ط ب ج د) کاتێک ساکن بن بە دەنگێکی لەرزۆک و ئەکۆدار دەردەچن.",
      "حروف (ق ط ب ج د) إذا سكنت تُنطق باهتزاز وصدى في المخرج.",
      "The letters (ق ط ب ج د) produce a bouncing echo when they carry sukūn.",
    ],
    color: "#ef4444",
    examples: [
      { parts: [p("قُلْ أَعُوذُ بِرَ"), h("بِّ"), p(" الْفَلَ"), h("قْ")], ref: ["فەلەق ١", "الفلق ١", "Al-Falaq 1"], a: [113, 1] },
      { parts: [p("وَتَ"), h("بَّ"), p("")], ref: ["مەسەد ١", "المسد ١", "Al-Masad 1"], a: [111, 1] },
    ],
  },
  {
    id: "madd-tabii",
    name: ["مەددی سروشتی", "المدّ الطبيعي", "Natural Madd"],
    desc: [
      "درێژکردنەوەی دوو حەرەکە لەگەڵ (ا و ی) کاتێک هیچ هەمزە یان سوکوونێکیان بەدوادا نەیەت.",
      "مدّ حركتين مع حروف المدّ (ا و ي) إذا لم يأتِ بعدها همز أو سكون.",
      "A two-count elongation on (ا و ي) when not followed by a hamzah or sukūn.",
    ],
    color: "#14b8a6",
    examples: [
      { parts: [p("قَ"), h("ا"), p("لَ نُ"), h("و"), p("حٌ")], ref: ["نوح", "نوح", "Nuh"], a: [71, 1] },
      { parts: [p("الرَّحْمَ"), h("ٰ"), p("نِ الرَّحِ"), h("ي"), p("مِ")], ref: ["فاتیحە ٣", "الفاتحة ٣", "Al-Fatiha 3"], a: [1, 3] },
    ],
  },
  {
    id: "madd-muttasil",
    name: ["مەددی واجبی موتەصیل", "المدّ الواجب المتّصل", "Madd Wājib Muttaṣil"],
    desc: [
      "ئەگەر هەمزە دوای پیتی مەدد بێت لە هەمان وشەدا، بە ٤ تا ٥ حەرەکە درێژ دەکرێتەوە.",
      "إذا جاء الهمز بعد حرف المدّ في الكلمة نفسها يُمدّ أربع أو خمس حركات وجوباً.",
      "When a hamzah follows a madd letter in the same word, it is stretched 4–5 counts.",
    ],
    color: "#8b5cf6",
    examples: [
      { parts: [p("وَالسَّمَ"), h("اءِ"), p(" ذَاتِ الْبُرُوجِ")], ref: ["بوروج ١", "البروج ١", "Al-Buruj 1"], a: [85, 1] },
      { parts: [p("جَ"), h("اءَ"), p(" نَصْرُ اللَّهِ")], ref: ["نەسر ١", "النصر ١", "An-Nasr 1"], a: [110, 1] },
    ],
  },
  {
    id: "madd-lazim",
    name: ["مەددی لازم", "المدّ اللازم", "Madd Lāzim"],
    desc: [
      "کاتێک دوای پیتی مەدد سوکوونی جێگیر یان شەددە بێت، بە شەش حەرەکە درێژ دەکرێتەوە.",
      "إذا جاء بعد حرف المدّ سكون أصلي أو شدّة يُمدّ ستّ حركات لزوماً.",
      "When a permanent sukūn or shaddah follows a madd letter, it is stretched six counts.",
    ],
    color: "#f43f5e",
    examples: [
      { parts: [p("وَلَا "), h("الضَّالِّينَ")], ref: ["فاتیحە ٧", "الفاتحة ٧", "Al-Fatiha 7"], a: [1, 7] },
      { parts: [h("الم")], ref: ["بەقەرە ١", "البقرة ١", "Al-Baqarah 1"], a: [2, 1] },
    ],
  },
  {
    id: "lam-shamsiyyah",
    name: ["لامی شەمسی و قەمەری", "اللام الشمسية والقمرية", "Solar & Lunar Lām"],
    desc: [
      "لامی شەمسی نانووسرێتەوە بەڵکو دەتوێتەوە لە پیتی دوای، بەڵام لامی قەمەری بە ڕوونی دەخوێنرێت.",
      "اللام الشمسية تُدغم في الحرف بعدها ولا تُنطق، واللام القمرية تُنطق ظاهرة.",
      "Solar lām assimilates into the next letter, lunar lām is pronounced clearly.",
    ],
    color: "#0ea5e9",
    examples: [
      { parts: [p("ا"), h("لشَّ"), p("مْسُ")], ref: ["شەمس ١", "الشمس ١", "Ash-Shams 1"], a: [91, 1] },
      { parts: [p("ا"), h("لْقَ"), p("مَرُ")], ref: ["قەمەر ١", "القمر ١", "Al-Qamar 1"], a: [54, 1] },
    ],
  },
  {
    id: "tafkhim",
    name: ["تەفخیم و تەرقیق", "التفخيم والترقيق", "Tafkhīm & Tarqīq"],
    desc: [
      "هەندێ پیت بە قوڵی و ئەستووری دەردەچن (خ ص ض غ ط ق ظ)، وە هەندێکی تر بە باریکی.",
      "حروف الاستعلاء (خص ضغط قظ) تُنطق مفخّمة، وباقي الحروف تُرقّق.",
      "The elevated letters (خ ص ض غ ط ق ظ) are pronounced heavy; the rest are light.",
    ],
    color: "#d97706",
    examples: [
      { parts: [p("ا"), h("لصِّرَ"), p("اطَ الْمُسْتَقِيمَ")], ref: ["فاتیحە ٦", "الفاتحة ٦", "Al-Fatiha 6"], a: [1, 6] },
      { parts: [h("اللَّهُ"), p(" لَا إِلَٰهَ إِلَّا هُوَ")], ref: ["بەقەرە ٢٥٥", "البقرة ٢٥٥", "Al-Baqarah 255"], a: [2, 255] },
    ],
  },
  {
    id: "waqf",
    name: ["وەقف و ئیبتیدا", "الوقف والابتداء", "Stopping & Starting"],
    desc: [
      "زانینی شوێنی ڕاوەستان لە خوێندنەواندا مانا دەپارێزێت؛ نیشانەکانی (م ج ص لا) ڕێنمایی دەکەن.",
      "معرفة مواضع الوقف تحفظ المعنى، وعلامات الوقف (م ج ص لا) ترشد القارئ.",
      "Knowing where to pause preserves meaning; the marks (م ج ص لا) guide the reciter.",
    ],
    color: "#64748b",
    examples: [
      { parts: [p("الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"), h(" ۝")], ref: ["فاتیحە ٢", "الفاتحة ٢", "Al-Fatiha 2"], a: [1, 2] },
    ],
  },
];

type Q = { q: Tri; o: Tri[]; c: number; e: Tri };
const Q3 = (q: Tri, o: Tri[], c: number, e: Tri): Q => ({ q, o, c, e });

const QUIZ: Record<string, Q[]> = {
  "intro-makharij": [
    Q3(["مەخرەج واتە چی؟", "ما هو المخرج؟", "What is a makhraj?"],
      [["شوێنی دەرچوونی پیت", "موضع خروج الحرف", "The point where a letter is articulated"],
       ["ڕەنگی پیت", "لون الحرف", "The color of a letter"],
       ["ژمارەی ئایەت", "رقم الآية", "The verse number"]], 0,
      ["مەخرەج ئەو شوێنەیە کە پیت لێی دەردەچێت.", "المخرج هو موضع خروج الحرف.", "Makhraj is the articulation point of a letter."]),
    Q3(["پیتی (ح) لە کوێوە دەردەچێت؟", "من أين يخرج حرف (ح)؟", "Where does (ح) come from?"],
      [["لێو", "الشفتان", "The lips"], ["گەروو", "الحلق", "The throat"], ["لووت", "الخيشوم", "The nose"]], 1,
      ["(ح) لە پیتەکانی گەرووە.", "(ح) من حروف الحلق.", "(ح) is a throat letter."]),
    Q3(["بۆچی مەخرەج گرنگە؟", "لماذا المخرج مهم؟", "Why does makhraj matter?"],
      [["بۆ خێرایی خوێندنەوە", "لسرعة القراءة", "For faster reading"],
       ["بۆ پاراستنی مانا", "لحفظ المعنى", "To preserve the meaning"],
       ["بۆ دەنگی بەرز", "لرفع الصوت", "To raise the voice"]], 1,
      ["گۆڕینی مەخرەج مانا دەگۆڕێت.", "تغيير المخرج يغيّر المعنى.", "A wrong makhraj changes the meaning."]),
  ],
  "noon-sakinah-idhhar": [
    Q3(["ئیظهار لەگەڵ چ پیتێک دێت؟", "مع أي حروف يكون الإظهار؟", "Idhhār occurs with which letters?"],
      [["پیتەکانی گەروو", "حروف الحلق", "Throat letters"], ["ی ر م ل و ن", "ي ر م ل و ن", "ي ر م ل و ن"], ["ب", "الباء", "ب"]], 0,
      ["(ء ه ع ح غ خ) پیتەکانی ئیظهارن.", "حروف الإظهار: ء ه ع ح غ خ.", "The idhhār letters are ء ه ع ح غ خ."]),
    Q3(["لە «مِنْ حَكِيمٍ» چ حوکمێکە؟", "ما الحكم في «مِنْ حَكِيمٍ»؟", "Which rule is in «مِنْ حَكِيمٍ»?"],
      [["ئیخفا", "الإخفاء", "Ikhfāʾ"], ["ئیظهار", "الإظهار", "Idhhār"], ["ئیقلاب", "الإقلاب", "Iqlāb"]], 1,
      ["دوای نوون (ح)ی گەروو هاتووە.", "جاء بعد النون حرف الحاء الحلقي.", "The throat letter ح follows the nūn."]),
    Q3(["ئیظهار غونەی هەیە؟", "هل في الإظهار غنّة؟", "Does idhhār have ghunnah?"],
      [["بەڵێ", "نعم", "Yes"], ["نەخێر", "لا", "No"]], 1,
      ["نوون بە ڕوونی بێ غونە دەخوێنرێت.", "تُنطق النون واضحة بلا غنّة.", "The nūn is clear, without nasalization."]),
  ],
  idgham: [
    Q3(["پیتەکانی ئیدغام کامانەن؟", "ما حروف الإدغام؟", "Which are the idghām letters?"],
      [["ی ر م ل و ن", "ي ر م ل و ن", "ي ر م ل و ن"], ["ء ه ع ح غ خ", "ء ه ع ح غ خ", "ء ه ع ح غ خ"], ["ق ط ب ج د", "ق ط ب ج د", "ق ط ب ج د"]], 0,
      ["(یرملون) پیتەکانی ئیدغامن.", "حروف الإدغام مجموعة في (يرملون).", "They are gathered in (yarmalūn)."]),
    Q3(["ئیدغام لەگەڵ (ل ر) چۆنە؟", "الإدغام مع (ل ر) كيف؟", "Idghām with (ل ر) is…"],
      [["بە غونە", "بغنّة", "With ghunnah"], ["بێ غونە", "بغير غنّة", "Without ghunnah"]], 1,
      ["(ل ر) ئیدغامی بێ غونەن.", "(ل ر) إدغام بلا غنّة.", "(ل ر) merge without nasalization."]),
    Q3(["«مَنْ يَعْمَلْ» چ حوکمێکە؟", "ما حكم «مَنْ يَعْمَلْ»؟", "Which rule is «مَنْ يَعْمَلْ»?"],
      [["ئیدغام بە غونە", "إدغام بغنّة", "Idghām with ghunnah"], ["ئیظهار", "الإظهار", "Idhhār"], ["قەلقەلە", "القلقلة", "Qalqalah"]], 0,
      ["(ی) لە (ینمو)یە، بە غونەوە.", "الياء من (ينمو) فتُدغم بغنّة.", "ي is from ينمو, so it merges with ghunnah."]),
  ],
  iqlab: [
    Q3(["ئیقلاب لەگەڵ چ پیتێکە؟", "الإقلاب مع أي حرف؟", "Iqlāb happens with which letter?"],
      [["م", "الميم", "م"], ["ب", "الباء", "ب"], ["ن", "النون", "ن"]], 1,
      ["تەنها لەگەڵ (ب).", "يكون مع الباء فقط.", "Only with (ب)."]),
    Q3(["نوون دەگۆڕدرێت بۆ چی؟", "إلى ماذا تُقلب النون؟", "The nūn turns into…"],
      [["میم", "ميم", "Mīm"], ["لام", "لام", "Lām"], ["ڕا", "راء", "Rāʾ"]], 0,
      ["بۆ میمی شاراوە لەگەڵ غونە.", "تُقلب ميماً مخفاة مع غنّة.", "Into a hidden mīm with ghunnah."]),
    Q3(["«مِنْ بَعْدِ» چییە؟", "ما حكم «مِنْ بَعْدِ»؟", "«مِنْ بَعْدِ» is…"],
      [["ئیدغام", "إدغام", "Idghām"], ["ئیقلاب", "إقلاب", "Iqlāb"], ["ئیظهار", "إظهار", "Idhhār"]], 1,
      ["دوای نوون (ب) هاتووە.", "جاء بعد النون حرف الباء.", "A ب follows the nūn."]),
  ],
  ikhfa: [
    Q3(["ژمارەی پیتەکانی ئیخفا چەندە؟", "كم عدد حروف الإخفاء؟", "How many ikhfāʾ letters?"],
      [["٦", "٦", "6"], ["١٥", "١٥", "15"], ["٥", "٥", "5"]], 1,
      ["١٥ پیت ماوەتەوە بۆ ئیخفا.", "حروف الإخفاء خمسة عشر.", "Fifteen letters remain for ikhfāʾ."]),
    Q3(["«مِنْ شَرِّ» چ حوکمێکە؟", "ما حكم «مِنْ شَرِّ»؟", "Which rule is in «مِنْ شَرِّ»?"],
      [["ئیدغام", "إدغام", "Idghām"], ["ئیخفا", "إخفاء", "Ikhfāʾ"], ["ئیقلاب", "إقلاب", "Iqlāb"], ["قەلقەلە", "قلقلة", "Qalqalah"]], 1,
      ["(ش) لە پیتەکانی ئیخفایە.", "الشين من حروف الإخفاء.", "ش is one of the ikhfāʾ letters."]),
    Q3(["غونەی ئیخفا چەند حەرەکەیە؟", "كم مقدار غنّة الإخفاء؟", "How long is the ikhfāʾ ghunnah?"],
      [["دوو حەرەکە", "حركتان", "Two counts"], ["شەش حەرەکە", "ست حركات", "Six counts"], ["بێ غونە", "بلا غنّة", "No ghunnah"]], 0,
      ["بە ڕێژەی دوو حەرەکە.", "بمقدار حركتين.", "About two counts."]),
  ],
  "meem-sakinah": [
    Q3(["میمی ساکن چەند حوکمی هەیە؟", "كم حكماً للميم الساكنة؟", "How many rules for mīm sākinah?"],
      [["٢", "٢", "2"], ["٣", "٣", "3"], ["٤", "٤", "4"]], 1,
      ["ئیخفا، ئیدغام، ئیظهار.", "إخفاء وإدغام وإظهار.", "Ikhfāʾ, idghām and idhhār."]),
    Q3(["«تَرْمِيهِمْ بِحِجَارَةٍ» چییە؟", "ما حكم «تَرْمِيهِمْ بِحِجَارَةٍ»؟", "«تَرْمِيهِمْ بِحِجَارَةٍ» is…"],
      [["ئیخفای شەفەوی", "إخفاء شفوي", "Labial ikhfāʾ"], ["ئیظهاری شەفەوی", "إظهار شفوي", "Labial idhhār"], ["ئیقلاب", "إقلاب", "Iqlāb"]], 0,
      ["میمی ساکن پێش (ب).", "ميم ساكنة قبل الباء.", "Mīm sākinah before ب."]),
    Q3(["میمی ساکن پێش میم چییە؟", "ميم ساكنة قبل ميم؟", "Mīm sākinah before mīm is…"],
      [["ئیدغامی مثلین", "إدغام مثلين", "Idghām of like letters"], ["ئیظهار", "إظهار", "Idhhār"], ["قەلقەلە", "قلقلة", "Qalqalah"]], 0,
      ["دوو میم دەتوێنەوە بە غونە.", "تُدغم الميمان بغنّة.", "The two mīms merge with ghunnah."]),
  ],
  ghunnah: [
    Q3(["غونە لە کوێوە دەردەچێت؟", "من أين تخرج الغنّة؟", "Ghunnah comes from…"],
      [["گەروو", "الحلق", "The throat"], ["لووت (خەیشوم)", "الخيشوم", "The nasal passage"], ["زمان", "اللسان", "The tongue"]], 1,
      ["غونە دەنگی لووتە.", "الغنّة صوت من الخيشوم.", "Ghunnah is a nasal sound."]),
    Q3(["کام پیت غونەی موشەددەدی هەیە؟", "أي حرف له غنّة مشدّدة؟", "Which letters carry doubled ghunnah?"],
      [["ن و م", "النون والميم", "Nūn and mīm"], ["ل و ر", "اللام والراء", "Lām and rāʾ"], ["ق و ط", "القاف والطاء", "Qāf and ṭāʾ"]], 0,
      ["هەر نوون و میمی شەددەدار.", "كل نون وميم مشدّدة.", "Any doubled nūn or mīm."]),
    Q3(["«إِنَّ» چەند حەرەکە غونەی هەیە؟", "كم حركة غنّة «إِنَّ»؟", "How long is the ghunnah in «إِنَّ»?"],
      [["دوو حەرەکە", "حركتان", "Two counts"], ["چوار حەرەکە", "أربع حركات", "Four counts"]], 0,
      ["غونەی موشەددەد دوو حەرەکەیە.", "مقدارها حركتان.", "It is held two counts."]),
  ],
  qalqalah: [
    Q3(["پیتەکانی قەلقەلە کامانەن؟", "ما حروف القلقلة؟", "Which are the qalqalah letters?"],
      [["ق ط ب ج د", "ق ط ب ج د", "ق ط ب ج د"], ["ی ر م ل و ن", "ي ر م ل و ن", "ي ر م ل و ن"], ["ء ه ع ح", "ء ه ع ح", "ء ه ع ح"]], 0,
      ["کۆکراونەتەوە لە (قطب جد).", "مجموعة في (قطب جد).", "Gathered in (quṭb jad)."]),
    Q3(["قەلقەلە کەی ڕوودەدات؟", "متى تقع القلقلة؟", "When does qalqalah occur?"],
      [["کاتێک پیتەکە ساکن بێت", "إذا سكن الحرف", "When the letter has sukūn"], ["کاتێک حەرەکەی هەبێت", "إذا تحرك الحرف", "When the letter is voweled"]], 0,
      ["تەنها لەگەڵ سوکوون.", "تكون مع السكون فقط.", "Only with sukūn."]),
    Q3(["«الْفَلَقْ» لە کۆتایی چییە؟", "آخر «الْفَلَقْ» ما حكمه؟", "The end of «الْفَلَقْ» is…"],
      [["مەدد", "مدّ", "Madd"], ["قەلقەلە", "قلقلة", "Qalqalah"], ["ئیخفا", "إخفاء", "Ikhfāʾ"]], 1,
      ["(ق)ی ساکن لە وەقفدا.", "القاف ساكنة عند الوقف.", "The qāf is sākin when stopping."]),
  ],
  "madd-tabii": [
    Q3(["مەددی سروشتی چەند حەرەکەیە؟", "كم حركة المدّ الطبيعي؟", "Natural madd is how many counts?"],
      [["٢", "٢", "2"], ["٤", "٤", "4"], ["٦", "٦", "6"]], 0,
      ["دوو حەرەکە.", "حركتان.", "Two counts."]),
    Q3(["پیتەکانی مەدد کامانەن؟", "ما حروف المدّ؟", "The madd letters are…"],
      [["ا و ی", "ا و ي", "ا و ي"], ["ن م", "ن م", "ن م"], ["ب ج د", "ب ج د", "ب ج د"]], 0,
      ["ئەلف، واو، یا.", "الألف والواو والياء.", "Alif, wāw, yāʾ."]),
    Q3(["کەی مەدد سروشتی نامێنێت؟", "متى لا يبقى المدّ طبيعياً؟", "When is it no longer natural?"],
      [["ئەگەر هەمزە یان سوکوون بێت", "إذا جاء همز أو سكون", "If a hamzah or sukūn follows"], ["ئەگەر شەددە نەبێت", "إذا لم تأتِ شدّة", "If no shaddah follows"]], 0,
      ["ئەوکات دەبێتە مەددی فەرعی.", "حينها يصير مدّاً فرعياً.", "Then it becomes a secondary madd."]),
  ],
  "madd-muttasil": [
    Q3(["مەددی موتەصیل چەند حەرەکەیە؟", "كم حركة المدّ المتّصل؟", "Madd muttaṣil is…"],
      [["٢", "٢", "2"], ["٤–٥", "٤–٥", "4–5"], ["٦", "٦", "6"]], 1,
      ["چوار بۆ پێنج حەرەکە.", "أربع أو خمس حركات.", "Four to five counts."]),
    Q3(["مەرجی موتەصیل چییە؟", "ما شرط المتّصل؟", "The condition for muttaṣil is…"],
      [["هەمزە لە هەمان وشەدا", "الهمز في الكلمة نفسها", "Hamzah in the same word"], ["هەمزە لە وشەی دواتر", "الهمز في الكلمة التالية", "Hamzah in the next word"]], 0,
      ["پیتی مەدد و هەمزە پێکەوە لە یەک وشەدان.", "حرف المدّ والهمز في كلمة واحدة.", "Madd letter and hamzah share one word."]),
    Q3(["«جَاءَ» چ مەددێکە؟", "ما مدّ «جَاءَ»؟", "«جَاءَ» is which madd?"],
      [["سروشتی", "طبيعي", "Natural"], ["موتەصیل", "متّصل", "Muttaṣil"], ["لازم", "لازم", "Lāzim"]], 1,
      ["هەمزە دوای ئەلف لە یەک وشەدا.", "همز بعد الألف في كلمة واحدة.", "Hamzah after alif in one word."]),
  ],
  "madd-lazim": [
    Q3(["مەددی لازم چەند حەرەکەیە؟", "كم حركة المدّ اللازم؟", "Madd lāzim is…"],
      [["٢", "٢", "2"], ["٦", "٦", "6"], ["٤", "٤", "4"]], 1,
      ["شەش حەرەکە.", "ست حركات.", "Six counts."]),
    Q3(["دوای پیتی مەدد چی دێت؟", "ماذا يأتي بعد حرف المدّ؟", "What follows the madd letter?"],
      [["سوکوونی جێگیر یان شەددە", "سكون أصلي أو شدّة", "Permanent sukūn or shaddah"], ["هەمزە", "همز", "Hamzah"]], 0,
      ["ئەمە جیای دەکاتەوە لە موتەصیل.", "وهذا يميّزه عن المتّصل.", "That distinguishes it from muttaṣil."]),
    Q3(["«الضَّالِّينَ» چییە؟", "ما حكم «الضَّالِّينَ»؟", "«الضَّالِّينَ» is…"],
      [["مەددی لازم", "مدّ لازم", "Madd lāzim"], ["مەددی سروشتی", "مدّ طبيعي", "Natural madd"]], 0,
      ["دوای ئەلف شەددە هاتووە.", "جاءت شدّة بعد الألف.", "A shaddah follows the alif."]),
  ],
  "lam-shamsiyyah": [
    Q3(["لامی شەمسی چۆنە؟", "اللام الشمسية كيف تُنطق؟", "Solar lām is…"],
      [["بە ڕوونی دەخوێنرێت", "تُنطق ظاهرة", "Pronounced clearly"], ["دەتوێتەوە", "تُدغم", "Assimilated"]], 1,
      ["نانووسرێت بەڵکو دەتوێتەوە.", "تُدغم في الحرف بعدها.", "It merges into the next letter."]),
    Q3(["«الشَّمْسُ» کام لامە؟", "«الشَّمْسُ» أي لام؟", "«الشَّمْسُ» has which lām?"],
      [["شەمسی", "شمسية", "Solar"], ["قەمەری", "قمرية", "Lunar"]], 0,
      ["(ش) پیتێکی شەمسییە.", "الشين حرف شمسي.", "ش is a solar letter."]),
    Q3(["«الْقَمَرُ» کام لامە؟", "«الْقَمَرُ» أي لام؟", "«الْقَمَرُ» has which lām?"],
      [["شەمسی", "شمسية", "Solar"], ["قەمەری", "قمرية", "Lunar"]], 1,
      ["لام بە سوکوون بە ڕوونی دەخوێنرێت.", "اللام ساكنة وتُنطق ظاهرة.", "The lām is clear with sukūn."]),
  ],
  tafkhim: [
    Q3(["پیتەکانی ئیستیعلا کامانەن؟", "ما حروف الاستعلاء؟", "The heavy letters are…"],
      [["خص ضغط قظ", "خص ضغط قظ", "خص ضغط قظ"], ["یرملون", "ينمو", "yarmalūn"], ["قطب جد", "قطب جد", "quṭb jad"]], 0,
      ["ئەمانە هەمیشە تەفخیم دەکرێن.", "هذه تُفخّم دائماً.", "These are always pronounced heavy."]),
    Q3(["تەرقیق واتە چی؟", "ما معنى الترقيق؟", "Tarqīq means…"],
      [["ئەستوورکردن", "التفخيم", "Making heavy"], ["باریککردن", "تنحيف الحرف", "Making light"]], 1,
      ["دەنگ باریک دەکرێتەوە.", "ينحف الصوت.", "The sound is made thin."]),
    Q3(["لە «الصِّرَاطَ» (ص) چۆنە؟", "الصاد في «الصِّرَاطَ»؟", "The ص in «الصِّرَاطَ» is…"],
      [["ئەستوور", "مفخّمة", "Heavy"], ["باریک", "مرقّقة", "Light"]], 0,
      ["(ص) پیتێکی ئیستیعلایە.", "الصاد من حروف الاستعلاء.", "ص is an elevated letter."]),
  ],
  waqf: [
    Q3(["نیشانەی (لا) چی دەگەیەنێت؟", "ماذا تعني علامة (لا)؟", "The mark (لا) means…"],
      [["ڕاوەستان باشە", "الوقف أولى", "Better to stop"], ["ڕاوەستان نابێت", "لا تقف", "Do not stop"]], 1,
      ["ڕاوەستان لێرە مانا تێک دەدات.", "الوقف هنا يخلّ بالمعنى.", "Stopping here harms the meaning."]),
    Q3(["نیشانەی (م) چییە؟", "ما علامة (م)؟", "The mark (م) means…"],
      [["وەقفی پێویست", "وقف لازم", "Necessary stop"], ["وەقفی ڕێگەپێدراو", "وقف جائز", "Permissible stop"]], 0,
      ["(م) واتە وەقفی لازم.", "(م) تعني الوقف اللازم.", "(م) marks an obligatory stop."]),
    Q3(["بۆچی وەقف گرنگە؟", "لماذا الوقف مهم؟", "Why is waqf important?"],
      [["بۆ پاراستنی مانا", "لحفظ المعنى", "To preserve meaning"], ["بۆ خێرایی", "للسرعة", "For speed"]], 0,
      ["وەقفی هەڵە مانا دەگۆڕێت.", "الوقف الخاطئ يغيّر المعنى.", "A wrong stop changes the meaning."]),
  ],
};

export function TajweedLessons({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (t: Tri) => (lang === "ar" ? t[1] : lang === "en" ? t[2] : t[0]);
  const rtl = lang === "ar" || lang === "ku";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  const [i, setI] = useState(0);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as { done?: string[]; last?: number };
        setDone(Array.isArray(s.done) ? s.done : []);
        if (typeof s.last === "number" && s.last >= 0 && s.last < LESSONS.length) setI(s.last);
      }
    } catch { /* ignore */ }
  }, []);

  const save = (nextDone: string[], last: number) => {
    setDone(nextDone);
    try { localStorage.setItem(STORE, JSON.stringify({ done: nextDone, last })); } catch { /* ignore */ }
  };

  const go = (n: number) => {
    setI(n);
    try { localStorage.setItem(STORE, JSON.stringify({ done, last: n })); } catch { /* ignore */ }
  };

  const lesson = LESSONS[i];
  const isDone = done.includes(lesson.id);
  const toggle = () => save(isDone ? done.filter((d) => d !== lesson.id) : [...done, lesson.id], i);
  const pct = Math.round((done.length / LESSONS.length) * 100);

  // --- Stage 1 audio ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const reciter = RECITERS.find((r) => r.id === DEFAULT_RECITER_ID) ?? RECITERS[0];

  const stop = () => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }
    setPlaying(null);
  };
  // stop when leaving the lesson view or switching lesson
  useEffect(() => stop, []);
  useEffect(() => { stop(); }, [i]);

  // --- Quiz ---
  const [quizOpen, setQuizOpen] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  useEffect(() => { setQuizOpen(false); setQi(0); setPicked(null); setScore(0); setQuizDone(false); }, [i]);

  const startQuiz = () => { setQuizOpen(true); setQi(0); setPicked(null); setScore(0); setQuizDone(false); };
  const pick = (q: Q, k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.c) setScore((s) => s + 1);
  };
  const nextQ = (total: number) => {
    if (qi + 1 >= total) setQuizDone(true);
    else { setQi((n) => n + 1); setPicked(null); }
  };

  const play = (key: string, url: string, restart = false) => {
    let a = audioRef.current;
    if (!a) { a = new Audio(); audioRef.current = a; a.onended = () => setPlaying(null); }
    if (playing === key && !restart) { a.pause(); setPlaying(null); return; }
    if (a.src !== url) a.src = url;
    a.currentTime = 0;
    void a.play().then(() => setPlaying(key)).catch(() => setPlaying(null));
  };


  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{L(["فێربوونی تەجوید", "تعلّم التجويد", "Learn Tajweed"])}</h2>
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>

      {/* Intro */}
      <div className="rounded-2xl border p-4 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {L([
            "تەجوید زانستی دروست خوێندنەوەی قورئانە: دەرکردنی هەر پیتێک لە شوێنی خۆی لەگەڵ ڕەچاوکردنی سیفەتەکانی. پابەندبوون بە تەجوید مانای ئایەتەکان دەپارێزێت و خوێندنەوە جوانتر دەکات.",
            "التجويد هو علم تلاوة القرآن بإخراج كل حرف من مخرجه مع إعطائه حقّه من الصفات. الالتزام به يحفظ المعنى ويُجمّل التلاوة.",
            "Tajweed is the science of reciting the Qur'an by giving every letter its correct articulation and characteristics. It protects the meaning and beautifies the recitation.",
          ])}
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border p-4 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{L(["پێشکەوتن", "التقدّم", "Progress"])}</span>
          <span className="text-primary font-semibold">{done.length} / {LESSONS.length} · {pct}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-gold)" }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {LESSONS.map((l, idx) => (
            <button key={l.id} onClick={() => go(idx)}
              title={L(l.name)}
              className={`h-7 w-7 rounded-lg text-[11px] font-semibold transition ${idx === i ? "ring-2 ring-primary" : ""}`}
              style={{
                background: done.includes(l.id) ? l.color : "rgba(255,255,255,0.07)",
                color: done.includes(l.id) ? "#fff" : undefined,
              }}>
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson */}
      <div className="rounded-2xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs text-primary">{L(["وانە", "الدرس", "Lesson"])} {i + 1} / {LESSONS.length}</p>
        <div className="mt-1 flex items-start gap-2">
          <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ background: lesson.color }} />
          <p className="text-xl font-semibold">{L(lesson.name)}</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{L(lesson.desc)}</p>

        <div className="mt-4 space-y-3">
          {lesson.examples.map((ex, k) => (
            <div key={k} className="rounded-xl border p-3" style={{ borderColor: "var(--glass-border)" }}>
              <p className="font-display text-2xl leading-loose text-center" dir="rtl">
                {ex.parts.map((part, pi) =>
                  part.hl ? (
                    <span key={pi} className="rounded px-0.5" style={{ color: lesson.color, background: `${lesson.color}22` }}>{part.t}</span>
                  ) : (
                    <span key={pi}>{part.t}</span>
                  )
                )}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground text-center">{L(ex.ref)}</p>
              {(() => {
                const key = `${lesson.id}-${k}`;
                const url = ayahAudioUrl(reciter, ex.a[0], ex.a[1]);
                const on = playing === key;
                return (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button onClick={() => play(key, url)}
                      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors active:scale-95"
                      style={{ borderColor: "var(--glass-border)", color: lesson.color, background: on ? `${lesson.color}22` : undefined }}>
                      {on ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {on ? L(["وەستان", "إيقاف مؤقت", "Pause"]) : L(["گوێ بگرە", "استمع", "Listen"])}
                    </button>
                    <button onClick={() => play(key, url, true)}
                      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors active:scale-95"
                      style={{ borderColor: "var(--glass-border)" }}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      {L(["دووبارە", "إعادة", "Repeat"])}
                    </button>
                  </div>
                );
              })()}

            </div>
          ))}
        </div>

        {/* Mini Quiz */}
        {(() => {
          const qs = QUIZ[lesson.id] ?? [];
          if (qs.length === 0) return null;
          if (!quizOpen)
            return (
              <button onClick={startQuiz}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors active:scale-[0.98]"
                style={{ borderColor: "var(--glass-border)", color: lesson.color }}>
                <Brain className="h-4 w-4" />
                 {L(["\u062a\u0627\u0642\u06cc\u06a9\u0631\u062f\u0646\u06d5\u0648\u06d5 \u062f\u06d5\u0633\u062a \u067e\u06ce \u0628\u06a9\u06d5", "\u0627\u0628\u062f\u0623 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631", "Start Quiz"])}
              </button>
            );
          const total = qs.length;
          if (quizDone) {
            const pctQ = Math.round((score / total) * 100);
            const passed = pctQ >= 70;
            return (
              <div className="mt-4 rounded-xl border p-4 text-center" style={{ borderColor: "var(--glass-border)" }}>
                <p className="text-2xl font-bold" style={{ color: passed ? "#22c55e" : "#ef4444" }}>{score} / {total}</p>
                <p className="text-sm text-muted-foreground mt-1">{pctQ}%</p>
                {passed ? (
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {L(["وانە تەواو بوو", "اكتمل الدرس", "Lesson Completed"])}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {L(["دووبارە هەوڵ بدەرەوە بۆ ٧٠٪ یان زیاتر", "أعد المحاولة للوصول إلى ٧٠٪ أو أكثر", "Try again to reach 70% or more"])}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={startQuiz}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-primary-foreground text-sm"
                    style={{ background: "var(--gradient-gold)" }}>
                    <RotateCcw className="h-4 w-4" />
                    {L([دووبارە تاقیکردنەوە, "إعادة الاختبار", "Retry Quiz"])}
                  </button>
                  <button onClick={() => setQuizOpen(false)}
                    className="flex-1 py-2 rounded-xl border text-sm" style={{ borderColor: "var(--glass-border)" }}>
                    {L(["داخستن", "إغلاق", "Close"])}
                  </button>
                </div>
              </div>
            );
          }
          const q = qs[qi];
          return (
            <div className="mt-4 rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--glass-border)" }}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: lesson.color }}>
                  <Brain className="h-3.5 w-3.5" />
                  {L(["کوێز", "اختبار", "Quiz"])}
                </span>
                <span>{qi + 1} / {total}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{L(q.q)}</p>
              <div className="space-y-2">
                {q.o.map((opt, k) => {
                  const isPick = picked === k;
                  const isRight = picked !== null && k === q.c;
                  const isWrong = isPick && k !== q.c;
                  return (
                    <button key={k} onClick={() => pick(q, k)} disabled={picked !== null}
                      className="w-full text-start px-3 py-2 rounded-lg border text-sm transition-colors disabled:cursor-default"
                      style={{
                        borderColor: isRight ? "#22c55e" : isWrong ? "#ef4444" : "var(--glass-border)",
                        background: isRight ? "#22c55e22" : isWrong ? "#ef444422" : undefined,
                      }}>
                      {L(opt)}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <p className={`flex items-center gap-1.5 text-sm font-semibold ${picked === q.c ? "text-green-500" : "text-red-500"}`}>
                    {picked === q.c ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {picked === q.c
                      ? L(["ڕاستە", "إجابة صحيحة", "Correct"])
                      : L(["هەڵەیە", "إجابة خاطئة", "Incorrect"])}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{L(q.e)}</p>
                  <button onClick={() => nextQ(total)}
                    className="w-full py-2 rounded-xl text-primary-foreground text-sm"
                    style={{ background: "var(--gradient-gold)" }}>
                    {qi + 1 >= total ? L(["بینینی ئەنجام", "عرض النتيجة", "See Result"]) : L(["پرسیاری دواتر", "السؤال التالي", "Next Question"])}
                  </button>
                </div>
              )}
            </div>
          );
        })()}
<button
  type="button"
  onClick={toggle}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm"
          style={{ borderColor: "var(--glass-border)", background: isDone ? `${lesson.color}22` : undefined }}>
          {isDone ? <CheckCircle2 className="h-4 w-4" style={{ color: lesson.color }} /> : <Circle className="h-4 w-4" />}
          {isDone ? L(["تەواوکراوە", "مكتمل", "Completed"]) : L(["وەک تەواوکراو نیشانی بکە", "تعليم كمكتمل", "Mark as completed"])}
        </button>

        <div className="mt-3 flex gap-2">
          <button onClick={() => go(Math.max(0, i - 1))} disabled={i === 0}
            className="flex-1 py-2 rounded-xl border disabled:opacity-40" style={{ borderColor: "var(--glass-border)" }}>
            {L(["پێشوو", "السابق", "Previous"])}
          </button>
          <button onClick={() => go(Math.min(LESSONS.length - 1, i + 1))} disabled={i === LESSONS.length - 1}
            className="flex-1 py-2 rounded-xl text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--gradient-gold)" }}>
            {L(["دواتر", "التالي", "Next"])}
          </button>
        </div>
      </div>
    </div>
  );
}
