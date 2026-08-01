// Key events + miracles per prophet, in Kurdish (Sorani), Arabic and English.
// Complements PROPHET_STORIES (long-form narratives) and the prophet index in
// ProphetsLibrary.tsx.

export type Tri = { ku: string; ar: string; en: string };
export type ProphetExtra = {
  events: Tri[];
  miracles: Tri[];
  verses?: { ref: string; text: Tri }[];
};

const e = (ku: string, ar: string, en: string): Tri => ({ ku, ar, en });

export const PROPHET_EXTRAS: Record<string, ProphetExtra> = {
  adam: {
    events: [
      e("درووستکردنی لە قوڕ و فووکردنی ڕۆح", "خلقه من طين ونفخ الروح فيه", "Created from clay and given the soul"),
      e("سوژدەی فریشتەکان و سەرپێچی ئیبلیس", "سجود الملائكة وإباء إبليس", "Angels prostrated; Iblis refused"),
      e("دەرچوون لە بەهەشت و تۆبەکردن", "الهبوط من الجنة والتوبة", "Descent from Paradise and repentance"),
      e("قابیل و هابیل — یەکەم کوشتن", "قابيل وهابيل — أول قتل", "Qabil and Habil — the first murder"),
    ],
    miracles: [
      e("فێرکردنی هەموو ناوەکان لەلایەن خوداوە", "تعليمه الأسماء كلها", "Taught the names of all things"),
      e("درووستبوونی بێ باوک و دایک", "خُلق بلا أب ولا أم", "Created without father or mother"),
    ],
  },
  idris: {
    events: [
      e("یەکەم کەس بوو بە قەڵەم نووسی", "أول من خطّ بالقلم", "First to write with the pen"),
      e("بەرزکردنەوەی بۆ پلەیەکی بەرز", "رفعه الله مكاناً علياً", "Raised to a high station"),
    ],
    miracles: [e("زانستی نووسین و ئەستێرەناسی", "علم الكتابة والحساب", "Knowledge of writing and reckoning")],
  },
  nuh: {
    events: [
      e("٩٥٠ ساڵ بانگەشە", "الدعوة 950 عاماً", "950 years of calling"),
      e("درووستکردنی کەشتی لەسەر وشکانی", "صنع الفلك في البر", "Building the Ark on dry land"),
      e("لافاوی گەورە و نوقمبوونی کوڕەکەی", "الطوفان وغرق ابنه", "The Flood and his son's drowning"),
      e("نیشتنەوەی کەشتی لەسەر جودی", "استواء السفينة على الجودي", "The Ark resting on Mount Judi"),
    ],
    miracles: [
      e("کەشتیەکە بە وەحیی خودا درووستکرا", "الفلك بوحي الله", "The Ark built by divine revelation"),
      e("هەڵقوڵانی ئاو لە تەنوورەوە", "فوران التنور بالماء", "Water gushing from the oven"),
    ],
  },
  hud: {
    events: [
      e("بانگەشە بۆ عادی خاوەن ستوونە بەرزەکان", "دعوة عاد ذات العماد", "Calling ʿĀd of the lofty pillars"),
      e("لەناوچوونی گەلەکەی بە بای ساردی سەخت", "إهلاكهم بريح صرصر", "Their destruction by a furious wind"),
    ],
    miracles: [e("پارێزراوی لە بایەکە", "نجاته من الريح", "His preservation from the wind")],
  },
  saleh: {
    events: [
      e("داواکردنی موعجزە لەلایەن ثەمودەوە", "طلب ثمود المعجزة", "Thamud demanded a sign"),
      e("سەربڕینی وشترەکە و سزای دەنگە گەورە", "عقر الناقة والصيحة", "Hamstringing the she-camel and the Blast"),
    ],
    miracles: [e("دەرهێنانی وشتر لە بەردەوە", "خروج الناقة من الصخرة", "The she-camel emerging from rock")],
  },
  ibrahim: {
    events: [
      e("شکاندنی بتەکان", "تحطيم الأصنام", "Smashing the idols"),
      e("فڕێدرانی بۆ ناو ئاگر", "إلقاؤه في النار", "Cast into the fire"),
      e("هیجرەت و جێهێشتنی هاجەر و ئیسماعیل", "الهجرة وترك هاجر وإسماعيل", "Migration; leaving Hajar and Ismaʿil"),
      e("قوربانی و بنیادنانی کەعبە", "الذبح وبناء الكعبة", "The sacrifice and building the Kaʿbah"),
    ],
    miracles: [
      e("ئاگر بوو بە ساردی و سەلامەتی", "كانت النار برداً وسلاماً", "The fire became cool and safe"),
      e("زیندووکردنەوەی چوار باڵندە", "إحياء الطير الأربعة", "Reviving the four birds"),
    ],
  },
  lut: {
    events: [
      e("بانگەشە دژی فاحیشەی گەلی سەدۆم", "إنكار فاحشة قومه", "Denouncing his people's transgression"),
      e("هاتنی فریشتەکان بە شێوەی میوان", "مجيء الملائكة ضيوفاً", "The angels arriving as guests"),
      e("سەرەوژێرکردنی شارەکان", "قلب القرى", "The cities overturned"),
    ],
    miracles: [e("ڕزگاربوونی خۆی و خێزانی باوەڕدار", "نجاته وأهله المؤمنين", "Rescue of him and his believing family")],
  },
  ismail: {
    events: [
      e("جێهێشتن لە دۆڵی بێ ژیانی مەککە", "تركه بوادٍ غير ذي زرع", "Left in the barren valley of Makkah"),
      e("هەڵقوڵانی زەمزەم", "انفجار زمزم", "The spring of Zamzam gushing forth"),
      e("ڕازیبوون بە قوربانی", "الرضا بالذبح", "Submitting to the sacrifice"),
    ],
    miracles: [e("زەمزەم — کانیاوی نەبڕاوە", "زمزم الماء الذي لا ينضب", "Zamzam — the never-ending spring")],
  },
  ishaq: {
    events: [
      e("مژدەی لەدایکبوونی بە ئیبراهیم و سارە", "البشارة به لإبراهيم وسارة", "Glad tidings given to Ibrahim and Sarah"),
      e("بەردەوامی نەوەی پێغەمبەران", "استمرار النبوة في ذريته", "Prophethood continuing in his line"),
    ],
    miracles: [e("لەدایکبوونی لە دایکێکی نەزۆک و بەتەمەن", "ولادته من أمٍّ عاقر كبيرة", "Born to an aged, barren mother")],
  },
  yaqub: {
    events: [
      e("ونبوونی یوسف و ئارامگرتنی جوان", "فقد يوسف والصبر الجميل", "Losing Yusuf and beautiful patience"),
      e("کوێربوونی چاوی لە خەفەتان", "ابيضاض عينيه من الحزن", "His eyes whitening from grief"),
      e("گەیشتنەوە بە یوسف لە میسر", "لقاؤه يوسف في مصر", "Reunion with Yusuf in Egypt"),
    ],
    miracles: [e("گەڕانەوەی بینایی بە کراسی یوسف", "عودة بصره بقميص يوسف", "Sight restored by Yusuf's shirt")],
  },
  yusuf: {
    events: [
      e("خەونی یازدە ئەستێرە", "رؤيا أحد عشر كوكباً", "The dream of eleven stars"),
      e("فڕێدران بۆ بیر و فرۆشران", "إلقاؤه في الجب وبيعه", "Thrown in the well and sold"),
      e("زیندان و لێکدانەوەی خەون", "السجن وتأويل الرؤى", "Prison and interpreting dreams"),
      e("بوون بە وەزیری میسر و لێخۆشبوون لە براکانی", "توليه خزائن مصر والعفو عن إخوته", "Becoming Egypt's minister and forgiving his brothers"),
    ],
    miracles: [
      e("زانستی لێکدانەوەی خەون", "علم تأويل الأحاديث", "Knowledge of dream interpretation"),
      e("جوانی بێ وێنە", "الجمال الباهر", "Extraordinary beauty"),
    ],
  },
  ayyub: {
    events: [
      e("تاقیکردنەوە لە سامان و منداڵ و لەش", "الابتلاء في المال والولد والجسد", "Tested in wealth, children and body"),
      e("دەعای بێ گلەیی", "دعاؤه بلا شكوى", "His supplication without complaint"),
      e("چاکبوونەوە و گەڕانەوەی نیعمەت", "الشفاء ورد النعمة", "Healing and restoration"),
    ],
    miracles: [e("هەڵقوڵانی کانیاوی چاکبوونەوە بە لێدانی پێ", "نبع الماء بركض رجله", "A healing spring struck by his foot")],
  },
  shuayb: {
    events: [
      e("بانگەشە بۆ دادپەروەری لە کێشان", "الدعوة إلى العدل في الكيل", "Calling to justice in trade"),
      e("لەناوچوونی مەدیەن بە لەرزە", "أخذ مدين بالرجفة", "Madyan seized by the quake"),
    ],
    miracles: [e("پاراستنی خۆی و باوەڕداران", "نجاته والمؤمنين", "Preservation of him and the believers")],
  },
  musa: {
    events: [
      e("فڕێدران بۆ نیل بە منداڵی", "إلقاؤه في اليم رضيعاً", "Cast into the Nile as an infant"),
      e("قسەکردن لەگەڵ خودا لە دۆڵی طوی", "التكليم في الوادي المقدس", "Speaking to Allah in the sacred valley"),
      e("ڕووبەڕووبوونەوەی فیرعەون و جادووگەران", "مواجهة فرعون والسحرة", "Confronting Firʿawn and the magicians"),
      e("پەڕینەوەی دەریا و وەرگرتنی تەورات", "فلق البحر وتلقي التوراة", "Parting the sea and receiving the Torah"),
    ],
    miracles: [
      e("گۆڕینی گۆچان بۆ مار", "انقلاب العصا حية", "The staff becoming a serpent"),
      e("دەستی سپی بێ نەخۆشی", "اليد البيضاء من غير سوء", "The radiant white hand"),
      e("لێدانی بەرد و هەڵقوڵانی ١٢ کانی", "انفجار اثنتي عشرة عيناً من الحجر", "Twelve springs from the rock"),
    ],
  },
  harun: {
    events: [
      e("بوون بە یاریدەدەری مووسا", "كونه وزيراً لموسى", "Appointed as Musa's helper"),
      e("پاراستنی گەل لە کاتی نەبوونی مووسا", "رعاية القوم في غياب موسى", "Guarding the people in Musa's absence"),
    ],
    miracles: [e("زمانێکی ڕەوان و فەسیح", "فصاحة اللسان", "Eloquence of speech")],
  },
  dawud: {
    events: [
      e("کوشتنی جالوت", "قتل جالوت", "Slaying Jalut (Goliath)"),
      e("بوون بە پاشا و دادوەری دادپەروەر", "الملك والقضاء بالعدل", "Kingship and just judgment"),
      e("وەرگرتنی زەبوور", "إيتاء الزبور", "Receiving the Zabur"),
    ],
    miracles: [
      e("نەرمکردنی ئاسن بە دەست", "إلانة الحديد", "Iron softened in his hands"),
      e("تەسبیحاتی شاخ و باڵندە لەگەڵی", "تسبيح الجبال والطير معه", "Mountains and birds glorifying with him"),
    ],
  },
  sulayman: {
    events: [
      e("داواکردنی موڵکێک کە بۆ کەس نەبێت", "سؤاله ملكاً لا ينبغي لأحد", "Asking for an unmatched kingdom"),
      e("چیرۆکی مێروولە و هوهود", "قصة النملة والهدهد", "The ant and the hoopoe"),
      e("هێنانی تەختی بەلقیس", "إحضار عرش بلقيس", "Bringing the throne of Bilqis"),
    ],
    miracles: [
      e("تێگەیشتن لە زمانی ئاژەڵ و باڵندە", "فهم منطق الطير والحيوان", "Understanding animal speech"),
      e("باڵادەستی بەسەر با و جن", "تسخير الريح والجن", "Command over wind and jinn"),
    ],
  },
  ilyas: {
    events: [
      e("بانگەشە دژی پەرستنی بەعل", "إنكار عبادة بعل", "Denouncing worship of Baʿl"),
      e("پاراستنی باوەڕداران", "نجاة المؤمنين", "Rescue of the believers"),
    ],
    miracles: [e("وشکەساڵی و بارین بە دەعای ئەو", "الجدب والمطر بدعائه", "Drought and rain by his prayer")],
  },
  alyasa: {
    events: [e("بەردەوامی بانگەشەی ئیلیاس", "متابعة دعوة إلياس", "Continuing the mission of Ilyas")],
    miracles: [e("لە هەڵبژێردراوانی خودا", "من المصطفين الأخيار", "Among Allah's chosen ones")],
  },
  dhulkifl: {
    events: [e("بەڵێنی ئارامگرتن و دادوەری", "التزام الصبر والقضاء", "Committing to patience and just rulings")],
    miracles: [e("پێداگری لەسەر شەوان نوێژ و ڕۆژوو", "المداومة على القيام والصيام", "Constancy in night prayer and fasting")],
  },
  yunus: {
    events: [
      e("جێهێشتنی گەلەکەی بەبێ مۆڵەت", "مغادرته قومه مغاضباً", "Leaving his people in anger"),
      e("قوتدانی لەلایەن ماسیەوە", "التقام الحوت له", "Swallowed by the great fish"),
      e("باوەڕهێنانی گەلەکەی", "إيمان قومه", "His people believing"),
    ],
    miracles: [e("مانەوەی زیندوو لە سکی ماسیدا", "بقاؤه حياً في بطن الحوت", "Surviving inside the fish")],
  },
  zakariyya: {
    events: [
      e("سەرپەرشتی مەریەم", "كفالته لمريم", "Guardianship of Maryam"),
      e("دەعا بۆ منداڵ لە پیریدا", "دعاؤه بالولد في الكبر", "Praying for a child in old age"),
    ],
    miracles: [e("ڕزقی مەریەم لە میحراب", "رزق مريم في المحراب", "Maryam's provision in the sanctuary")],
  },
  yahya: {
    events: [
      e("وەرگرتنی کتێب بە منداڵی", "إيتاؤه الحكم صبياً", "Given wisdom as a child"),
      e("بەرگری لە ڕاستی تا شەهیدبوون", "الثبات على الحق حتى الشهادة", "Steadfast in truth until martyrdom"),
    ],
    miracles: [e("پاکی و خواناسی لە منداڵییەوە", "الطهر والتقوى منذ الصغر", "Purity and piety from childhood")],
  },
  isa: {
    events: [
      e("لەدایکبوونی بێ باوک", "الولادة من غير أب", "Miraculous birth without a father"),
      e("قسەکردنی لە بێشکەدا", "الكلام في المهد", "Speaking in the cradle"),
      e("بانگەشە بۆ بەنی ئیسرائیل", "دعوة بني إسرائيل", "Calling the Children of Israel"),
      e("بەرزکرانەوەی بۆ ئاسمان", "رفعه إلى السماء", "Being raised to the heavens"),
    ],
    miracles: [
      e("چاککردنەوەی کوێر و بەڵەک", "إبراء الأكمه والأبرص", "Healing the blind and the leper"),
      e("زیندووکردنەوەی مردوو بە ئیزنی خودا", "إحياء الموتى بإذن الله", "Raising the dead by Allah's leave"),
      e("دابەزینی مائیدە لە ئاسمان", "نزول المائدة", "The table spread from heaven"),
    ],
  },
  muhammad: {
    events: [
      e("لەدایکبوون لە مەککە و ساڵی فیل", "المولد بمكة عام الفيل", "Birth in Makkah in the Year of the Elephant"),
      e("یەکەم وەحی لە غاری حیرا", "أول الوحي بغار حراء", "The first revelation in Cave Hira"),
      e("ئیسرا و میعراج", "الإسراء والمعراج", "The Night Journey and Ascension"),
      e("هیجرەت بۆ مەدینە", "الهجرة إلى المدينة", "Migration to Madinah"),
      e("کردنەوەی مەککە و حەججی ماڵئاوایی", "فتح مكة وحجة الوداع", "The conquest of Makkah and the Farewell Hajj"),
    ],
    miracles: [
      e("قورئان — موعجزەی هەمیشەیی", "القرآن المعجزة الخالدة", "The Qur'an — the everlasting miracle"),
      e("شەقبوونی مانگ", "انشقاق القمر", "The splitting of the moon"),
      e("هەڵقوڵانی ئاو لە نێوان پەنجەکانی", "نبع الماء من بين أصابعه", "Water flowing from between his fingers"),
      e("زۆربوونی خواردنی کەم بۆ کۆمەڵێک", "تكثير الطعام القليل", "Multiplying little food for many"),
    ],
  },
};
