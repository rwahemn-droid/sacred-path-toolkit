// Detailed prophet life stories in Kurdish (Sorani), Arabic, and English.
// Sources: Qur'an, authentic Sunnah, and classical seerah works (Ibn Kathir's Qasas al-Anbiya, Al-Bidaya wan-Nihaya).

export type ProphetStory = {
  id: string;
  sections: {
    ku: { title: string; body: string }[];
    ar: { title: string; body: string }[];
    en: { title: string; body: string }[];
  };
};

const s = (
  ku: { title: string; body: string }[],
  ar: { title: string; body: string }[],
  en: { title: string; body: string }[],
): ProphetStory["sections"] => ({ ku, ar, en });

export const PROPHET_STORIES: Record<string, ProphetStory["sections"]> = {
  adam: s(
    [
      { title: "درووستکردن", body: "خودای گەورە ئادەمی ﷺ لە قوڕی وشک درووستکرد و ڕۆحی تێدا کرد. فریشتەکانی فەرمان پێدا سوژدەی بۆ بەرن و هەموو سوژدەیان برد جگە لە ئیبلیس کە لە خۆپەرستی و لووتبەرزی سەرپێچی کرد و لە ڕەحمەتی خودا دەرکرا." },
      { title: "ژیانی لە بەهەشت", body: "ئادەم و حەوا لە بەهەشتدا نیشتەجێ کران و خودا فەرمووی هەموو شتێک بخۆن جگە لە یەک درەخت. شەیتان بە فێڵ فریوی دان و لە درەختەکە خواردیان، جا لەبەری تۆبەکردن خودا لێیان خۆشبوو." },
      { title: "دابەزین بۆ زەوی", body: "خودا ئادەم و حەوای بۆ زەوی ناردەخوارەوە. بوونە باوک و دایکی مرۆڤایەتی. کوڕەکانیان قابیل و هابیل بوون، قابیل هابیلی کوشت — یەکەم کوشتن لە مێژووی مرۆڤدا." },
      { title: "کۆتایی", body: "ئادەم ﷺ نزیکەی ٩٦٠ ساڵ ژیا و منداڵانی خۆی فێری پەرستنی خودای یەکەکە کرد. بەپێی هەندێک ڕیوایەت لە ڕۆژی هەینیدا وەفاتی کرد." },
    ],
    [
      { title: "الخلق", body: "خلق الله آدم عليه السلام من طين لازب ونفخ فيه من روحه، وأمر الملائكة أن يسجدوا له فسجدوا إلا إبليس أبى واستكبر فطُرد من رحمة الله." },
      { title: "الحياة في الجنة", body: "أسكن الله آدم وحواء الجنة وأباح لهما كل شيء إلا شجرة واحدة، فوسوس لهما الشيطان فأكلا منها، ثم تابا فتاب الله عليهما." },
      { title: "الهبوط إلى الأرض", body: "أهبطهما الله إلى الأرض ليكونا خليفةً فيها. وُلد لهما قابيل وهابيل، فقتل قابيل أخاه هابيل، وكانت أول جريمة قتل في تاريخ البشرية." },
      { title: "الوفاة", body: "عاش آدم عليه السلام نحو 960 عاماً يعلّم ذريته توحيد الله، ورُوي أنه تُوفي يوم الجمعة." },
    ],
    [
      { title: "Creation", body: "Allah created Adam ﷺ from clay and breathed the soul into him. The angels were commanded to prostrate to him; all obeyed except Iblis, who refused out of arrogance and was expelled from Allah's mercy." },
      { title: "Life in Paradise", body: "Adam and Hawwa were placed in Jannah and permitted everything except one tree. Shaytan whispered to them until they ate from it; they repented and Allah forgave them." },
      { title: "Descent to Earth", body: "Allah sent them to earth to be its stewards. Their sons Qabil and Habil were born; Qabil killed Habil — the first murder in human history." },
      { title: "Passing", body: "Adam ﷺ lived roughly 960 years teaching his descendants tawhid. It is reported he passed away on a Friday." },
    ],
  ),
  nuh: s(
    [
      { title: "بانگەشەی ٩٥٠ ساڵە", body: "نوح ﷺ نزیکەی ٩٥٠ ساڵ گەلی خۆی بانگ کرد بۆ پەرستنی خودای یەکەکە. بەڵام کەم کەس بڕوایان هێنا و زۆربەیان بە توندی بەرگری دژی کرد و گاڵتەیان پێدەکرد." },
      { title: "درووستکردنی کەشتی", body: "بە فەرمانی خودا نوح ﷺ کەشتیەکی گەورەی درووستکرد لە ناوەڕاستی وشکانیدا. گەلەکەی گاڵتەیان پێدەکرد، بەڵام خودا فەرمووی کاتی سزا نزیکە." },
      { title: "لافاوی گەورە", body: "ئاو لە زەوی و ئاسمانەوە هەڵقوڵا. نوح ﷺ لەگەڵ باوەڕداران و جووتێک لە هەموو گیانلەبەرێک سواری کەشتی بوون. کوڕەکەی کە بڕوای نەهێنابوو نوقم بوو، هەرچەندە باوکی داوای لێکرد." },
      { title: "دوای لافاو", body: "کەشتیەکە لەسەر شاخی جودی نیشتەوە. نوح ﷺ و باوەڕداران بوونە بنەڕەتی نەوەی نوێی مرۆڤایەتی. دواتر لە تەمەنێکی زۆردا وەفاتی کرد." },
    ],
    [
      { title: "الدعوة 950 عاماً", body: "لبث نوح عليه السلام في قومه ألف سنة إلا خمسين عاماً يدعوهم إلى توحيد الله ليلاً ونهاراً سراً وعلانية، فما آمن معه إلا قليل، وسخر منه أكثرهم." },
      { title: "صنع الفلك", body: "أوحى الله إليه أن يصنع الفلك بأعينه ووحيه، فصنعه في البر، وكان قومه كلما مروا عليه سخروا منه." },
      { title: "الطوفان", body: "فار التنور وانفجرت الأرض عيوناً وأنزل الله ماء السماء. حمل نوح في السفينة من آمن معه ومن كل زوجين اثنين. وغرق ابنه الكافر رغم مناداة أبيه له." },
      { title: "بعد الطوفان", body: "استوت السفينة على الجودي، وبارك الله في ذرية نوح فصاروا أصل البشرية الثانية. توفي عليه السلام بعد عمر مديد." },
    ],
    [
      { title: "950 Years of Calling", body: "Nuh ﷺ preached tawhid to his people for nearly a millennium, night and day, secretly and openly. Only a few believed; the rest mocked and oppressed him." },
      { title: "Building the Ark", body: "By Allah's command he built a huge ark on dry land. His people ridiculed him as they passed by, but he warned that punishment was near." },
      { title: "The Great Flood", body: "Water burst from the earth and poured from the sky. Nuh boarded believers and pairs of every creature. His disbelieving son drowned despite his father's plea." },
      { title: "After the Flood", body: "The Ark rested on Mount Judi. Nuh and the believers became the second origin of humanity. He passed away after a very long life." },
    ],
  ),
  ibrahim: s(
    [
      { title: "منداڵی", body: "ئیبراهیم ﷺ لە شارێکی عێراقی کۆن (بابل) لەدایکبوو کە گەلەکەی بت دەپەرست. باوکی ئازەر بتساز بوو. لە هەرزەکاریدا بە عەقڵی ڕوونی خۆی دۆزیەوە کە ستێرە و مانگ و ڕۆژ خودا نین." },
      { title: "شکاندنی بتەکان", body: "ئیبراهیم ﷺ بە تەور بتەکانی گەلەکەی شکاند و تەورەکەی خستە سەری بتی گەورە. کاتێک لێی پرسیارکرا فەرمووی: «لە بتە گەورەکە بپرسن!» بۆ ئەوەی نەفامیان بۆ ڕوون بکاتەوە." },
      { title: "ئاگری نەمرود", body: "نەمرود فەرمانیدا ئاگرێکی گەورە بکەن و ئیبراهیمی فڕێدا. خودا فەرمووی: «ئەی ئاگر ساردەبە و سەلامەت بە بۆ ئیبراهیم». ئاگرەکە هیچ زیانی پێنەگەیاند." },
      { title: "کۆچ و منداڵ", body: "ئیبراهیم ﷺ کۆچی بۆ شام و میسر و حیجاز کرد. هاجەر و ئیسماعیل لە درەی مەککە دانا. لە پیریدا ئیسحاق و ئیسماعیلی پێبەخشرا." },
      { title: "قوربانی و کەعبە", body: "خەونی بینی کە ئیسماعیل قوربانی دەکات، هەردووکیان تەسلیم بوون. کاتێک چەقۆکەی خستە سەر ملی، خودا بەرخێکی گەورەی جێگرەوە کرد. دواتر لەگەڵ ئیسماعیل کەعبەی بنیاد نایەوە." },
      { title: "کۆتایی", body: "ئیبراهیم ﷺ بە «خەلیل الله» ناسرا (دۆستی خودا). لە تەمەنی ١٧٥ ساڵیدا وەفاتی کرد و لە مەغارەی مەکفەلە لە حەبرۆن نێژرا." },
    ],
    [
      { title: "الطفولة", body: "وُلد إبراهيم عليه السلام في أرض بابل من قوم يعبدون الأصنام، وكان أبوه آزر نحاتاً للأصنام. اهتدى بفطرته وعقله إلى أن الكواكب والقمر والشمس ليست آلهة." },
      { title: "تحطيم الأصنام", body: "حطم إبراهيم أصنام قومه بفأسه وعلّق الفأس في عنق كبيرها. فلما سألوه قال: «بل فعله كبيرهم هذا فاسألوهم إن كانوا ينطقون» ليقيم عليهم الحجة." },
      { title: "نار النمرود", body: "أمر النمرود بإحراقه في نار عظيمة، فقال الله: «يا نار كوني برداً وسلاماً على إبراهيم»، فلم تمسه بسوء." },
      { title: "الهجرة والذرية", body: "هاجر إلى الشام ومصر والحجاز. أسكن هاجر وإسماعيل في وادٍ غير ذي زرع بمكة، ورزقه الله على الكبر إسحاق وإسماعيل." },
      { title: "الذبح وبناء الكعبة", body: "رأى في المنام أنه يذبح إسماعيل فاستسلما لأمر الله، فلما أسلمه للجبين فداه الله بذبح عظيم. ثم رفع مع إسماعيل قواعد البيت الحرام." },
      { title: "الوفاة", body: "لُقّب بخليل الرحمن. توفي عن عمر 175 عاماً ودُفن في مغارة المكفيلة بالخليل." },
    ],
    [
      { title: "Childhood", body: "Ibrahim ﷺ was born in ancient Babylon among idol worshippers; his father Azar carved idols. By pure reasoning he discerned that stars, moon, and sun could not be gods." },
      { title: "Breaking the Idols", body: "He smashed his people's idols with an axe and left it on the shoulder of the largest. When questioned he said: 'Ask the biggest one!' — exposing their folly." },
      { title: "Nimrod's Fire", body: "Nimrod ordered a massive fire lit and cast Ibrahim in. Allah commanded: 'O fire, be coolness and peace upon Ibrahim.' The fire harmed him not at all." },
      { title: "Migration and Family", body: "He migrated to the Levant, Egypt, and the Hijaz. He settled Hajar and Ismaʿil in the barren valley of Makkah. In old age he was granted Ismaʿil and Ishaq." },
      { title: "Sacrifice and the Kaʿbah", body: "He dreamt of sacrificing Ismaʿil; both submitted. As the knife touched, Allah ransomed the boy with a great ram. Later, father and son raised the foundations of the Kaʿbah." },
      { title: "Passing", body: "Titled Khalilullah — Friend of the Most Merciful. He died at 175 and was buried in the Cave of Machpelah in Hebron." },
    ],
  ),
  yusuf: s(
    [
      { title: "خەونی منداڵی", body: "یوسف ﷺ کوڕی یەعقوب بوو. لە منداڵیدا خەونی بینی ١١ ئەستێرە و ڕۆژ و مانگ سوژدەی بۆ دەبەن. یەعقوب فەرمووی خەونەکە بۆ براکانی نەگێڕێتەوە." },
      { title: "بیر و فرۆشتن", body: "براکانی بەگۆچانی چاولێبڕی خستیانە بیرێکەوە. کاروانێک دەریانهێنا و بە نرخێکی هەرزان لە میسر فرۆشتیان. کەوتە ماڵی عەزیزی میسر." },
      { title: "زیندان", body: "ژنی عەزیز حەزی لێکرد، بەڵام یوسف پەنای بۆ خودا برد. تۆمەت کرا و چوو بۆ زیندان چەندین ساڵ. لەوێ لێکدانەوەی خەونی زیندانیانی کرد." },
      { title: "وەزیری میسر", body: "پاشا خەونێکی بینی و یوسف لێکیدایەوە. پاشا کردی بە وەزیری خۆراک. لە قاتوقڕیدا خەڵکی ڕزگارکرد و تەنانەت براکانی هاتنە لای بۆ خۆراک بێ ئەوەی بیناسنەوە." },
      { title: "کۆبوونەوە", body: "یوسف خۆی بۆ براکانی ئاشکراکرد و لێیان خۆشبوو. یەعقوب و هەموو خێزانەکەی هێنا بۆ میسر. خەونی منداڵی هاتەدی." },
    ],
    [
      { title: "رؤيا الطفولة", body: "يوسف عليه السلام ابن يعقوب. رأى في صغره أحد عشر كوكباً والشمس والقمر يسجدون له، فأوصاه أبوه ألا يقصّها على إخوته." },
      { title: "الجب والبيع", body: "ألقاه إخوته في الجب حسداً، فالتقطته سيّارة وباعوه بثمن بخس في مصر، فاشتراه عزيز مصر وأكرم مثواه." },
      { title: "السجن", body: "راودته امرأة العزيز عن نفسه فاستعصم، ثم كِيدَ له فسُجن سنين. عبّر رؤى السجناء وعُرف بصلاحه وعلمه." },
      { title: "عزيز مصر", body: "رأى الملك رؤيا فعبّرها يوسف، فولاّه على خزائن الأرض. أنقذ مصر من المجاعة، وجاءه إخوته للطعام دون أن يعرفوه." },
      { title: "اللقاء", body: "كشف يوسف لإخوته حقيقته وعفا عنهم، وأحضر أباه يعقوب وأهله إلى مصر، فتحققت رؤيا الصغر." },
    ],
    [
      { title: "The Childhood Vision", body: "Yusuf ﷺ, son of Yaʿqub, saw in a dream eleven stars, the sun and the moon prostrating to him. His father warned him not to tell his brothers." },
      { title: "The Well and the Sale", body: "His brothers threw him into a well out of jealousy. A caravan drew him out and sold him cheaply in Egypt to Al-Aziz, who treated him honourably." },
      { title: "Prison", body: "Al-Aziz's wife tried to seduce him; he refused. Falsely accused, he spent years in prison, where he interpreted the dreams of fellow inmates." },
      { title: "Minister of Egypt", body: "The king dreamt a puzzling dream; Yusuf interpreted it and was placed over Egypt's storehouses. He saved the land from famine, and his brothers came seeking food without recognising him." },
      { title: "Reunion", body: "He revealed himself, forgave his brothers, and brought Yaʿqub and the whole family to Egypt — fulfilling the childhood vision." },
    ],
  ),
  musa: s(
    [
      { title: "لەدایکبوون", body: "مووسا ﷺ لە کاتێکدا لەدایکبوو کە فیرعەون فەرمانی دابوو کوڕی بەنی ئیسرائیل بکوژرێن. دایکی بە فەرمانی خودا خستیە سندوقێکەوە و بەردایە ڕووباری نیل." },
      { title: "لە کۆشکی فیرعەون", body: "ئاسیای ژنی فیرعەون سندوقەکەی دۆزیەوە و مووسای وەک کوڕی خۆی گەورەکرد. دایکی خۆی بوو بە شیردەری بێ ئەوەی فیرعەون بزانێت." },
      { title: "کۆچ بۆ مەدیەن", body: "دوای کوشتنی قیبتییەک بەهەڵە، هەڵات بۆ مەدیەن. لەوێ لەگەڵ شوعەیب ﷺ ژیا و ١٠ ساڵ بۆی کاری کرد و کچەکەی وەک ژن هێنا." },
      { title: "نەبووەت لە توور", body: "لە شاخی توور خودا قسەی لەگەڵدا کرد. دوو نیشانە پێبەخشرا: گۆچانی کە دەبوو بە ماردا و دەستی کە دەبریسکایەوە. فەرمانی پێدرا بچێت بۆ لای فیرعەون." },
      { title: "دژایەتی فیرعەون", body: "فیرعەون بێباوەڕ بوو. مووسا سیحرگەرانی شکست پێهێنا. دەیان بەڵا هاتە سەر میسر: لافاو، کوللە، خوێن... بەڵام فیرعەون ڕەقی خۆی نەدا." },
      { title: "دەریای سوور", body: "شەو بەنی ئیسرائیلی دەرکرد. فیرعەون بەدوایاندا هات. مووسا بە فەرمانی خودا گۆچانی لە دەریا دا و ئاوەکە دووبەش بوو. بەنی ئیسرائیل تێپەڕیبن و فیرعەون نوقم بوو." },
      { title: "تەورات و کۆتایی", body: "لە شاخی توور ٤٠ شەو گفتوگۆی لەگەڵ خودا کرد و تەوراتی وەرگرت. لە پێش گەیشتن بە زەوی مقەدەس وەفاتی کرد." },
    ],
    [
      { title: "الميلاد", body: "وُلد موسى عليه السلام في زمن أمر فيه فرعون بذبح أبناء بني إسرائيل، فألقته أمه بأمر الله في تابوت في نهر النيل." },
      { title: "في قصر فرعون", body: "التقطته آسية امرأة فرعون فربّته كابنٍ لها، وردّه الله إلى أمه لترضعه دون علم فرعون." },
      { title: "الهجرة إلى مدين", body: "بعد أن قتل قبطياً خطأً هرب إلى مدين، فآواه شعيب عليه السلام وعمل عنده عشر سنين وتزوج ابنته." },
      { title: "النبوة في الطور", body: "كلّمه الله في جبل الطور وأيده بمعجزتي العصا واليد، وأمره بالذهاب إلى فرعون." },
      { title: "مواجهة فرعون", body: "كذّبه فرعون، فهزم موسى السحرة، ونزلت على مصر آيات: الطوفان والجراد والقمّل والضفادع والدم، ولم يرتدع فرعون." },
      { title: "البحر الأحمر", body: "خرج ببني إسرائيل ليلاً، فتبعه فرعون بجنوده. فضرب موسى البحر بعصاه فانفلق، فنجا بنو إسرائيل وأغرق الله فرعون." },
      { title: "التوراة والوفاة", body: "أُنزلت عليه التوراة في الطور بعد أربعين ليلة، وتوفي عليه السلام قبل دخول الأرض المقدسة." },
    ],
    [
      { title: "Birth", body: "Musa ﷺ was born when Firʿawn had ordered the male children of Bani Israʾil killed. By Allah's inspiration his mother placed him in a chest and set it on the Nile." },
      { title: "In Firʿawn's Palace", body: "Asiya, Firʿawn's wife, found him and raised him as her own. Allah returned him to his mother to be nursed, unknown to Firʿawn." },
      { title: "Migration to Madyan", body: "After accidentally killing a Copt, he fled to Madyan. Shuʿayb ﷺ took him in; he worked for him ten years and married his daughter." },
      { title: "Prophethood at At-Tur", body: "Allah spoke to him at Mount Tur and gave him two signs — the staff and the shining hand — commanding him to go to Firʿawn." },
      { title: "Confronting Firʿawn", body: "Firʿawn rejected him. Musa defeated the magicians. Egypt was struck with plagues — flood, locusts, lice, frogs, blood — yet Firʿawn refused to yield." },
      { title: "The Red Sea", body: "He led Bani Israʾil out by night; Firʿawn pursued. By Allah's command Musa struck the sea with his staff, it split, the believers crossed, and Firʿawn drowned." },
      { title: "Torah and Passing", body: "At At-Tur he received the Torah after forty nights. He passed away before entering the Holy Land." },
    ],
  ),
  isa: s(
    [
      { title: "لەدایکبوون", body: "عیسا ﷺ کوڕی مەریەم ی پاکە. فریشتە جبریل هاتە لای مەریەم و مژدەی کوڕێکی پێدا بێ باوک. مەریەم لە بێت‌لەحەم لە ژێر دار خورمایەکدا زایاند." },
      { title: "قسەکردن لە بێشکە", body: "کاتێک گەلی خۆی تانەیان تێدا، عیسا لە بێشکەوە قسەی کرد و فەرمووی: «من بەندەی خودام، کتێبی پێداوم و پێغەمبەری کردووم»." },
      { title: "موعجزات", body: "بە دەستوری خودا کوێری و نەخۆشی نەبرێو چاکدەکردەوە، مردووی زیندوو دەکردەوە، لە قوڕ باڵندەی درووستدەکرد کە دەفڕی، و ئینجیلی وەرگرت." },
      { title: "پیلانی جوولەکە", body: "هەندێک لە بەنی ئیسرائیل بڕوایان پێهێنا (حەواری)، بەڵام زۆرینەیان ڕەتیانکردەوە و پیلانی کوشتنیان کێشا." },
      { title: "بەرزکردنەوە", body: "خودا کەسێکی دیکەی بۆ عیسا کرد و بەرزی کردەوە بۆ ئاسمان. عیسا نەکوژرا و لە خاچ نەدرا. لە کۆتایی زەماندا دەگەڕێتەوە و دەججال دەکوژێت." },
    ],
    [
      { title: "الميلاد", body: "عيسى عليه السلام ابن مريم البتول. جاءها جبريل بشيراً بغلام زكي، فحملت به من غير أب ووضعته تحت جذع نخلة في بيت لحم." },
      { title: "الكلام في المهد", body: "لما اتهمها قومها، تكلم عيسى في المهد قائلاً: «إني عبد الله آتاني الكتاب وجعلني نبياً»." },
      { title: "المعجزات", body: "بإذن الله كان يبرئ الأكمه والأبرص ويحيي الموتى ويخلق من الطين طيراً فينفخ فيه فيكون طائراً بإذن الله، وأُنزل عليه الإنجيل." },
      { title: "مكر اليهود", body: "آمن به الحواريون، وكذبه أكثر بني إسرائيل ودبروا لقتله." },
      { title: "الرفع", body: "شبّه الله لهم غيره فقتلوه، ورفع عيسى إليه حيّاً. لم يُقتل ولم يُصلب. وسينزل في آخر الزمان فيقتل الدجال." },
    ],
    [
      { title: "Birth", body: "ʿIsa ﷺ, son of the chaste Maryam. Jibril brought her glad tidings of a pure son; she conceived without a father and gave birth beneath a palm tree in Bethlehem." },
      { title: "Speaking in the Cradle", body: "When her people accused her, ʿIsa spoke from the cradle: 'I am the servant of Allah. He has given me the Book and made me a prophet.'" },
      { title: "Miracles", body: "By Allah's leave he healed the blind and the leper, raised the dead, moulded birds from clay that flew — and received the Injil." },
      { title: "Jewish Plot", body: "The disciples (Hawariyyun) believed, but most of Bani Israʾil denied him and plotted to kill him." },
      { title: "The Ascension", body: "Allah made another appear as him whom they killed, and raised ʿIsa alive to Himself. He was neither killed nor crucified. He will return at the end of time and slay the Dajjal." },
    ],
  ),
  muhammad: s(
    [
      { title: "لەدایکبوون (٥٧٠م)", body: "موحەممەد ﷺ لە مەککە لەدایکبوو لە ساڵی فیل. باوکی عەبدوڵلا پێش لەدایکبوونی وەفاتی کردبوو. لە هەلیمەی سەعدییە لە بادیە شیری خواردەوە." },
      { title: "منداڵی و هەتیوی", body: "لە تەمەنی ٦ ساڵیدا دایکی ئامینە وەفاتی کرد. باپیری عەبدولمەتلیب و پاشان مامی ئەبو تالیب پەروەردەیان کرد. بە «الأمین» ناسرا لە پێش نەبووەت." },
      { title: "هاوسەرگیری لەگەڵ خەدیجە", body: "لە تەمەنی ٢٥ ساڵیدا لەگەڵ خەدیجەی ٤٠ ساڵ هاوسەرگیری کرد. خەدیجە یەکەم کەس بوو کە بڕوای پێهێنا." },
      { title: "وەحی لە ئەشکەوتی حیرا (٦١٠م)", body: "لە تەمەنی ٤٠ ساڵیدا لە ئەشکەوتی حیرا جبریل هاتە لای و فەرمووی: «إقرأ». یەکەم ئایەتی سووڕەی عەلەق دابەزی. بوو بە پێغەمبەری خودا." },
      { title: "بانگەشەی نهێنی و ئاشکرا", body: "٣ ساڵ بە نهێنی بانگی کرد. یەکەم باوەڕداران: خەدیجە، ئەبوبەکر، عەلی، زەید. پاشان ئاشکرا بانگی کرد و قوڕەیش دژایەتی توندی کرد." },
      { title: "کۆچ بۆ حەبەشە و بایکۆت", body: "هەندێک لە موسڵمانان کۆچیان بۆ حەبەشە کرد. قوڕەیش بایکۆتی توندیان کرد لە شێعبی ئەبی تالیب ٣ ساڵ. ساڵی ١٠ی نەبووەت خەدیجە و ئەبو تالیب وەفاتیان کرد — «ساڵی خەم»." },
      { title: "ئیسرا و مێعراج", body: "شەوێک لە مەککەوە بردرا بۆ قودس و لەوێوە بۆ ئاسمانەکان و پێغەمبەرانی بینی. ٥ نوێژ بۆ ئوممەت فەرز کرا." },
      { title: "هیجرەت بۆ مەدینە (٦٢٢م)", body: "قوڕەیش پیلانی کوشتنی کێشا. لەگەڵ ئەبوبەکر لە ئەشکەوتی ثەور خۆیانی شاردەوە و پاشان کۆچی مەدینەی کرد. مێژووی هیجرەت دەستپێدەکات." },
      { title: "دەوڵەتی مەدینە", body: "مزگەوتی نەبەوی بنیاد نا. پەیمانی مەدینەی نووسی نێوان موسڵمان و جوولەکە. ئوممەتی یەکگرتووی درووستکرد." },
      { title: "غزوەکان", body: "بەدر (٢ه‍) — سەرکەوتنی گەورە. ئوحود (٣ه‍) — تاقیکردنەوە. خەندەق (٥ه‍) — بەرگری. حودەیبیە (٦ه‍) — پەیمانی ئاشتی. خەیبەر (٧ه‍). فەتحی مەککە (٨ه‍) — بێ خوێن مەککەی فەتحکرد." },
      { title: "حەججی ماڵاواییان (١٠ه‍)", body: "لە عەرەفات خوتبەیەکی مێژووییان کرد و فەرمووی: «ئەمڕۆ دینی ئێوەم بۆ تەواو کرد». نزیکەی ١٢٤٠٠٠ سەحابە ئامادە بوون." },
      { title: "وەفات (١١ه‍ / ٦٣٢م)", body: "لە تەمەنی ٦٣ ساڵیدا لە دووشەممەی ١٢ی ڕەبیعوڵ ئەوەل لە ماڵی عائیشەدا وەفاتی کرد. لە هەمان شوێن نێژرا لە مەدینە. ئیسلامی تەواو کرد و قورئانی هێشتەوە." },
    ],
    [
      { title: "الميلاد (570م)", body: "وُلد النبي محمد ﷺ في مكة عام الفيل. توفي أبوه عبد الله قبل ولادته. أرضعته حليمة السعدية في البادية." },
      { title: "الطفولة واليتم", body: "تُوفيت أمه آمنة وهو ابن ست سنين، فكفله جده عبد المطلب ثم عمه أبو طالب. عُرف بالصادق الأمين قبل البعثة." },
      { title: "الزواج من خديجة", body: "تزوج خديجة رضي الله عنها وهو ابن خمس وعشرين وهي ابنة أربعين. كانت أول من آمن به." },
      { title: "الوحي في غار حراء (610م)", body: "في الأربعين نزل عليه جبريل في غار حراء قائلاً: «اقرأ»، ونزلت أول آيات سورة العلق، فبُعث رسولاً." },
      { title: "الدعوة السرية والجهرية", body: "دعا ثلاث سنين سراً. أول من آمن: خديجة، أبو بكر، علي، زيد. ثم جهر بالدعوة فآذته قريش أشد الأذى." },
      { title: "الهجرة إلى الحبشة والحصار", body: "هاجر بعض الصحابة إلى الحبشة. حاصرت قريش المسلمين في شعب أبي طالب ثلاث سنين. في السنة العاشرة توفيت خديجة وأبو طالب — «عام الحزن»." },
      { title: "الإسراء والمعراج", body: "أُسري به ليلاً من المسجد الحرام إلى المسجد الأقصى، ثم عُرج به إلى السماوات، ورأى الأنبياء، وفُرضت الصلوات الخمس." },
      { title: "الهجرة إلى المدينة (622م)", body: "تآمرت قريش على قتله، فهاجر مع أبي بكر واختبآ في غار ثور، ثم وصلا إلى المدينة. منها بدأ التاريخ الهجري." },
      { title: "دولة المدينة", body: "بنى المسجد النبوي، وكتب صحيفة المدينة بين المسلمين واليهود، وأسس أول دولة إسلامية." },
      { title: "الغزوات", body: "بدر (2هـ) — النصر المبين. أُحد (3هـ) — الابتلاء. الخندق (5هـ) — الدفاع. الحديبية (6هـ) — الصلح. خيبر (7هـ). فتح مكة (8هـ) بلا دماء تقريباً." },
      { title: "حجة الوداع (10هـ)", body: "في عرفة خطب الخطبة الجامعة، ونزلت: «اليوم أكملت لكم دينكم». حضر معه نحو 124,000 صحابي." },
      { title: "الوفاة (11هـ / 632م)", body: "توفي ﷺ في الثالثة والستين يوم الاثنين 12 ربيع الأول في بيت عائشة، ودُفن في مكانه. أتم الله به الدين وترك القرآن هدى للناس." },
    ],
    [
      { title: "Birth (570 CE)", body: "The Prophet Muhammad ﷺ was born in Makkah in the Year of the Elephant. His father ʿAbdullah died before his birth. He was nursed by Halima as-Saʿdiyyah in the desert." },
      { title: "Childhood and Orphanhood", body: "His mother Amina died when he was six. His grandfather ʿAbd al-Muttalib and then his uncle Abu Talib raised him. He was known as As-Sadiq Al-Amin — the Truthful, the Trustworthy." },
      { title: "Marriage to Khadija", body: "At 25 he married Khadija (RA), then 40. She was the first to believe in him." },
      { title: "Revelation at Cave Hira (610 CE)", body: "At 40, Jibril came to him in the Cave of Hira saying: 'Read!' The first verses of Surah Al-ʿAlaq were revealed. He became the Messenger of Allah." },
      { title: "Secret and Public Call", body: "He preached secretly for three years. First believers: Khadija, Abu Bakr, ʿAli, Zayd. Then he preached openly; Quraysh persecuted him severely." },
      { title: "Migration to Abyssinia and Boycott", body: "Some companions migrated to Abyssinia. Quraysh besieged the Muslims in the valley of Abu Talib for three years. In year 10 of prophethood, both Khadija and Abu Talib died — the Year of Sorrow." },
      { title: "Isra and Miʿraj", body: "In one night he was taken from Makkah to Jerusalem, then ascended through the heavens, met the prophets, and the five daily prayers were ordained." },
      { title: "Hijrah to Madinah (622 CE)", body: "Quraysh plotted to kill him. He and Abu Bakr hid in Cave Thawr, then reached Madinah. The Islamic calendar begins from the Hijrah." },
      { title: "The State of Madinah", body: "He built the Prophet's Mosque, drafted the Constitution of Madinah between Muslims and Jews, and founded the first Islamic state." },
      { title: "The Battles", body: "Badr (2 AH) — decisive victory. Uhud (3 AH) — trial. Khandaq (5 AH) — defence. Hudaybiyyah (6 AH) — peace treaty. Khaybar (7 AH). Conquest of Makkah (8 AH) — nearly bloodless." },
      { title: "Farewell Pilgrimage (10 AH)", body: "At ʿArafah he delivered the Farewell Sermon; the verse was revealed: 'This day I have perfected your religion for you.' About 124,000 companions were present." },
      { title: "Passing (11 AH / 632 CE)", body: "He passed away at 63 on Monday, 12 Rabiʿ al-Awwal, in the house of ʿAisha, and was buried there in Madinah. He completed the religion and left the Qur'an as guidance for humanity." },
    ],
  ),
};
