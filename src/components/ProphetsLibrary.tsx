import { useMemo, useState } from "react";
import { ArrowLeft, Users, ChevronRight, Search, Sparkles, ListOrdered, BookOpen, ScrollText } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { PROPHET_STORIES } from "@/lib/prophet-stories";
import { PROPHET_EXTRAS } from "@/lib/prophet-extra";

type Prophet = {
  id: string;
  name: { ku: string; ar: string; en: string };
  people?: { ku: string; ar: string; en: string };
  bio: { ku: string; ar: string; en: string };
  refs?: string[];
};

const PROPHETS: Prophet[] = [
  { id: "adam",    name: { ku: "ئادەم ﷺ",      ar: "آدم ﷺ",       en: "Adam (AS)" },      bio: { ku: "یەکەم مرۆڤ و پێغەمبەری خودا. لە بەهەشت دانرا و پاشان بۆ زەوی نێردرا. باوکی مرۆڤایەتی.", ar: "أبو البشر، أول إنسان وأول نبي، خُلق من تراب وأُسكن الجنة ثم أُهبط إلى الأرض.", en: "Father of mankind, first human and first prophet. Created from clay and placed in Jannah before descending to earth." }, refs: ["Al-Baqarah 2:30-38"] },
  { id: "idris",   name: { ku: "ئیدریس ﷺ",     ar: "إدريس ﷺ",     en: "Idris (AS)" },      bio: { ku: "پێغەمبەرێکی زانا. یەکەم کەس بوو کە بە قەڵەم نووسی.", ar: "نبيّ رفعه الله مكاناً علياً، أول من خطّ بالقلم.", en: "A knowledgeable prophet, first to write with the pen; raised to a high station." }, refs: ["Maryam 19:56-57"] },
  { id: "nuh",     name: { ku: "نوح ﷺ",        ar: "نوح ﷺ",       en: "Nuh (AS)" }, people: { ku: "قەومی نوح", ar: "قوم نوح", en: "People of Nuh" }, bio: { ku: "٩٥٠ ساڵ گەلی خۆی بانگی خودا کرد. کەشتیەکەی درووستکرد و لافاوی گەورە هات.", ar: "لبث في قومه ألف سنة إلا خمسين عاماً، وصنع الفلك، ونجاه الله ومن آمن معه من الطوفان.", en: "Called his people for 950 years, built the Ark, saved by Allah with the believers from the Great Flood." }, refs: ["Hud 11:25-49", "Nuh 71"] },
  { id: "hud",     name: { ku: "هود ﷺ",        ar: "هود ﷺ",       en: "Hud (AS)" }, people: { ku: "عاد", ar: "عاد", en: "ʿĀd" }, bio: { ku: "بۆ عادیانی یەکەم نێردرا. گەلەکەی بە بایەکی سەخت لەناوچوون.", ar: "أُرسل إلى قوم عاد، فأهلكهم الله بريح صرصر عاتية لتكذيبهم.", en: "Sent to the tribe of ʿĀd; destroyed by a fierce wind after rejecting him." }, refs: ["Al-Aʿraf 7:65-72"] },
  { id: "saleh",   name: { ku: "سالح ﷺ",       ar: "صالح ﷺ",      en: "Salih (AS)" }, people: { ku: "ثەمود", ar: "ثمود", en: "Thamud" }, bio: { ku: "بۆ ثەمود نێردرا. وشترەکەی موعجزە بوو، بەڵام گەلەکەی سەریان بڕی.", ar: "أُرسل إلى ثمود، وأُيّد بمعجزة الناقة، فعقروها فأخذتهم الصيحة.", en: "Sent to Thamud with the miracle of the she-camel; they hamstrung it and were seized by a thunderous blast." }, refs: ["Al-Aʿraf 7:73-79"] },
  { id: "ibrahim", name: { ku: "ئیبراهیم ﷺ",   ar: "إبراهيم ﷺ",   en: "Ibrahim (AS)" }, bio: { ku: "خەلیلوڵلاه، باوکی پێغەمبەران. کەعبەی لەگەڵ ئیسماعیل بنیاد نا و لە ئاگردا سەلامەت مایەوە.", ar: "خليل الرحمن، أبو الأنبياء، بنى الكعبة مع ابنه إسماعيل، ونجاه الله من نار نمرود.", en: "Khalilullah, father of the prophets. Built the Kaʿbah with Ismaʿil; saved from Nimrod's fire." }, refs: ["Al-Baqarah 2:124-134", "As-Saffat 37:83-113"] },
  { id: "lut",     name: { ku: "لوت ﷺ",        ar: "لوط ﷺ",       en: "Lut (AS)" }, people: { ku: "قەومی لوت", ar: "قوم لوط", en: "People of Lut" }, bio: { ku: "براز ای ئیبراهیم. بۆ گەلی سەدۆم نێردرا کە خراپەیان دەکرد.", ar: "ابن أخي إبراهيم، أُرسل إلى قوم سدوم لِفاحشتهم، فأهلكهم الله.", en: "Nephew of Ibrahim; sent to Sodom whose people were destroyed for their transgressions." }, refs: ["Hud 11:77-83"] },
  { id: "ismail",  name: { ku: "ئیسماعیل ﷺ",   ar: "إسماعيل ﷺ",   en: "Ismaʿil (AS)" }, bio: { ku: "کوڕی ئیبراهیم و باپیری عەرەب. باوکی ئیسحاق و باپیری موحەممەد ﷺ لە ڕەگی خۆیدا.", ar: "الذبيح، ابن إبراهيم، وأبو العرب المستعربة، ومن سلالته النبي ﷺ.", en: "The one to be sacrificed, son of Ibrahim, forefather of the Arabs and ancestry of Prophet Muhammad ﷺ." }, refs: ["As-Saffat 37:99-113"] },
  { id: "ishaq",   name: { ku: "ئیسحاق ﷺ",     ar: "إسحاق ﷺ",     en: "Ishaq (AS)" }, bio: { ku: "کوڕی ئیبراهیم، باوکی یەعقوب.", ar: "ابن إبراهيم وأبو يعقوب، بشّر الله به إبراهيم.", en: "Son of Ibrahim, father of Yaʿqub, foretold to Ibrahim as glad tidings." }, refs: ["Hud 11:69-73"] },
  { id: "yaqub",   name: { ku: "یەعقوب ﷺ",     ar: "يعقوب ﷺ",     en: "Yaʿqub (AS)" }, bio: { ku: "لەقەبی ئیسرائیل. باوکی ١٢ کوڕ، لەوانە یوسف.", ar: "المُلقّب بإسرائيل، أبو الأسباط، ووالد يوسف.", en: "Also called Israel, father of the twelve tribes, including Yusuf." }, refs: ["Yusuf 12"] },
  { id: "yusuf",   name: { ku: "یوسف ﷺ",       ar: "يوسف ﷺ",      en: "Yusuf (AS)" }, bio: { ku: "خاوەنی چیرۆکی جوانترین — لە بیر خرا، فرۆشرا، زیندانی کرا و بوو بە وەزیری میسر.", ar: "صاحب أحسن القصص، أُلقي في الجب وبِيع رقيقاً وسُجن ثم صار عزيز مصر.", en: "The story of surpassing beauty — thrown in a well, enslaved, imprisoned, then made minister of Egypt." }, refs: ["Yusuf 12"] },
  { id: "ayyub",   name: { ku: "ئەیوب ﷺ",      ar: "أيوب ﷺ",      en: "Ayyub (AS)" }, bio: { ku: "نموونەی ئارامگرتن. سەرەڕای نەخۆشی و ونبوونی سامان و منداڵ، شوکری خودای کرد.", ar: "مضرب المثل في الصبر، ابتُلي في جسده وماله وأهله فصبر، فرد الله عليه أضعاف ما فقد.", en: "The paragon of patience: tested in body, wealth, and family; Allah restored to him manifold." }, refs: ["Sad 38:41-44"] },
  { id: "shuayb",  name: { ku: "شوعەیب ﷺ",     ar: "شعيب ﷺ",      en: "Shuʿayb (AS)" }, people: { ku: "مەدیەن", ar: "أهل مدين", en: "People of Madyan" }, bio: { ku: "بۆ مەدیەن نێردرا. بانگ ی بۆ ئەمانەتی و ڕاستی کرد.", ar: "أُرسل إلى أهل مدين ودعاهم إلى العدل في الكيل والميزان.", en: "Sent to the people of Madyan; called them to justice in weights and measures." }, refs: ["Al-Aʿraf 7:85-93"] },
  { id: "musa",    name: { ku: "مووسا ﷺ",      ar: "موسى ﷺ",      en: "Musa (AS)" }, bio: { ku: "کەلیمولڵا. دژی فیرعەون هەستا و بەنی ئیسرائیلی ئازاد کرد. تەورات وەرگرت.", ar: "كليم الله، بُعث إلى فرعون وأخرج بني إسرائيل من مصر، وأُنزلت عليه التوراة.", en: "Kalimullah — spoke with Allah; confronted Firʿawn, led the Children of Israel out of Egypt, received the Torah." }, refs: ["Al-Qasas 28", "Ta-Ha 20"] },
  { id: "harun",   name: { ku: "هارون ﷺ",      ar: "هارون ﷺ",     en: "Harun (AS)" }, bio: { ku: "برای مووسا و یاریدەدەری لە دەعوەت.", ar: "أخو موسى ووزيره في الدعوة.", en: "Brother of Musa and his helper in the mission." }, refs: ["Ta-Ha 20:29-36"] },
  { id: "dawud",   name: { ku: "داوود ﷺ",      ar: "داوود ﷺ",     en: "Dawud (AS)" }, bio: { ku: "پاشا و پێغەمبەر. زەبووری وەرگرت و ئاسنی بۆ نەرم کرا.", ar: "ملك ونبي، أُوتي الزبور وأُلين له الحديد.", en: "King and prophet; given the Zabur; iron softened for him." }, refs: ["Al-Anbiya 21:78-80"] },
  { id: "sulayman",name: { ku: "سوڵەیمان ﷺ",   ar: "سليمان ﷺ",    en: "Sulayman (AS)" }, bio: { ku: "کوڕی داوود. باڵادەستی بۆ با و جن و ئاژەڵ بەخشرا. پاشای نەمر.", ar: "ابن داوود، سُخّرت له الريح والجن والطير، ملك عظيم.", en: "Son of Dawud; wind, jinn, and animals subjected to him; a mighty king." }, refs: ["An-Naml 27:15-44"] },
  { id: "ilyas",   name: { ku: "ئیلیاس ﷺ",     ar: "إلياس ﷺ",     en: "Ilyas (AS)" }, bio: { ku: "بۆ گەلی بەعل نێردرا لە شام.", ar: "أُرسل إلى قومه في الشام يدعوهم إلى ترك عبادة بَعل.", en: "Sent to his people in the Levant to renounce the idol Baʿl." }, refs: ["As-Saffat 37:123-132"] },
  { id: "alyasa",  name: { ku: "ئەلیەسەع ﷺ",   ar: "اليسع ﷺ",     en: "Al-Yasaʿ (AS)" }, bio: { ku: "لە دوای ئیلیاس گەلەکەی بەردەوامکرد لە بانگەشە.", ar: "خلَف إلياس في دعوة قومه.", en: "Succeeded Ilyas in guiding his people." }, refs: ["Al-Anʿam 6:86"] },
  { id: "dhulkifl",name: { ku: "زوالکیفل ﷺ",   ar: "ذو الكفل ﷺ",  en: "Dhul-Kifl (AS)" }, bio: { ku: "پیاوچاک و ئارامگر.", ar: "من الصابرين الصالحين.", en: "Among the patient and righteous." }, refs: ["Al-Anbiya 21:85"] },
  { id: "yunus",   name: { ku: "یونس ﷺ",       ar: "يونس ﷺ",      en: "Yunus (AS)" }, bio: { ku: "لە سکی ماسیدا بانگی خودای کرد و نەجات ی درا.", ar: "التقمه الحوت فنادى في الظلمات فنجّاه الله.", en: "Swallowed by the whale; called out in the depths and was rescued by Allah." }, refs: ["Al-Anbiya 21:87-88", "Yunus 10"] },
  { id: "zakariyya",name:{ ku: "زەکەریا ﷺ",    ar: "زكريا ﷺ",     en: "Zakariyya (AS)" }, bio: { ku: "دەعای منداڵی کرد لە پیریدا و یەحیای پێبەخشرا.", ar: "دعا ربه في الكبر فرزقه يحيى.", en: "Prayed in old age and was granted Yahya." }, refs: ["Maryam 19:2-15"] },
  { id: "yahya",   name: { ku: "یەحیا ﷺ",      ar: "يحيى ﷺ",      en: "Yahya (AS)" }, bio: { ku: "کوڕی زەکەریا، پاک و پارێزراو.", ar: "ابن زكريا، طاهر تقي.", en: "Son of Zakariyya, pure and pious." }, refs: ["Maryam 19:12-15"] },
  { id: "isa",     name: { ku: "عیسا ﷺ",       ar: "عيسى ﷺ",      en: "Isa (AS)" }, bio: { ku: "کوڕی مەریەم، بێ باوک لەدایکبوو. ئینجیل وەرگرت و لە ئاسمان بەرزکرایەوە.", ar: "ابن مريم البتول، أُيّد بروح القدس، أُنزل عليه الإنجيل ورُفع إلى السماء.", en: "Son of Maryam, born miraculously; supported by the Holy Spirit, given the Injil, raised to the heavens." }, refs: ["Aal-ʿImran 3:45-59", "Maryam 19"] },
  { id: "muhammad",name: { ku: "موحەممەد ﷺ",   ar: "محمد ﷺ",      en: "Muhammad ﷺ" }, bio: { ku: "کۆتا پێغەمبەر و باشترینیان. لە مەککە لەدایکبوو (٥٧٠م). قورئانی وەرگرت لە تەمەنی ٤٠ ساڵیدا.", ar: "خاتم النبيين وسيّد المرسلين، وُلد في مكة عام الفيل، بُعث في الأربعين وأُنزل عليه القرآن الكريم.", en: "The Seal of the Prophets, master of the messengers. Born in Makkah, received the Qur'an at age 40." }, refs: ["Al-Ahzab 33:40"] },
];

const ULUL_AZM = new Set(["nuh", "ibrahim", "musa", "isa", "muhammad"]);

type SortMode = "quran" | "az";
type Tab = "bio" | "story" | "events" | "miracles" | "verses";

export function ProphetsLibrary({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("quran");
  const [tab, setTab] = useState<Tab>("bio");

  const t = (o: { ku: string; ar: string; en: string }) => (lang === "ar" ? o.ar : lang === "en" ? o.en : o.ku);
  const storyLang: "ku" | "ar" | "en" = lang === "ar" ? "ar" : lang === "en" ? "en" : "ku";

  const open = openId ? PROPHETS.find((p) => p.id === openId) : null;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = PROPHETS.filter((p) => {
      if (!needle) return true;
      return (
        t(p.name).toLowerCase().includes(needle) ||
        p.name.en.toLowerCase().includes(needle) ||
        p.name.ar.includes(needle) ||
        p.id.includes(needle)
      );
    });
    if (sort === "az") {
      return [...list].sort((a, b) => t(a.name).localeCompare(t(b.name), lang === "ar" ? "ar" : "en"));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sort, lang]);

  // ---------- Detail view ----------
  if (open) {
    const extra = PROPHET_EXTRAS[open.id];
    const story = PROPHET_STORIES[open.id]?.[storyLang];

    const TABS: { id: Tab; label: string; icon: typeof BookOpen; show: boolean }[] = [
      { id: "bio", label: L("پوختە", "نبذة", "Overview"), icon: BookOpen, show: true },
      { id: "story", label: L("چیرۆک", "القصة", "Life story"), icon: ScrollText, show: !!story?.length },
      { id: "events", label: L("ڕووداوەکان", "الأحداث", "Key events"), icon: ListOrdered, show: !!extra?.events?.length },
      { id: "miracles", label: L("موعجیزەکان", "المعجزات", "Miracles"), icon: Sparkles, show: !!extra?.miracles?.length },
      { id: "verses", label: L("ئایەتەکان", "الآيات", "Verses"), icon: BookOpen, show: !!open.refs?.length },
    ];
    const visible = TABS.filter((x) => x.show);
    const activeTab = visible.some((x) => x.id === tab) ? tab : "bio";

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
        <button onClick={() => { setOpenId(null); setTab("bio"); }} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
          <ArrowLeft className="h-4 w-4" /> {L("گەڕانەوە", "رجوع", "Back")}
        </button>

        <div className="rounded-3xl border p-6 backdrop-blur-xl text-center" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
          <h1 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{t(open.name)}</h1>
          {open.people && <p className="mt-2 text-sm text-primary/90">{t(open.people)}</p>}
          {ULUL_AZM.has(open.id) && (
            <span className="mt-3 inline-block text-[11px] rounded-full px-3 py-1" style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}>
              {L("ئولوالعەزم", "أولو العزم", "Ulul-ʿAzm")}
            </span>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {visible.map((x) => {
            const Icon = x.icon;
            const on = activeTab === x.id;
            return (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                style={{
                  background: on ? "var(--gradient-gold)" : "var(--glass-bg)",
                  borderColor: on ? "transparent" : "var(--glass-border)",
                }}
              >
                <Icon className="h-3.5 w-3.5" /> {x.label}
              </button>
            );
          })}
        </div>

        {activeTab === "bio" && (
          <div className="rounded-3xl border p-5 backdrop-blur-xl leading-8" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <p>{t(open.bio)}</p>
          </div>
        )}

        {activeTab === "story" && story && (
          <div className="space-y-3">
            {story.map((sec, i) => (
              <div key={i} className="rounded-3xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <p className="text-sm font-semibold text-primary mb-2">{sec.title}</p>
                <p className="leading-8 text-sm sm:text-base">{sec.body}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "events" && extra && (
          <div className="rounded-3xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <ol className="space-y-3">
              {extra.events.map((ev, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold" style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}>
                    {i + 1}
                  </span>
                  <span className="leading-7 text-sm sm:text-base">{t(ev)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === "miracles" && extra && (
          <div className="grid gap-2 sm:grid-cols-2">
            {extra.miracles.map((m, i) => (
              <div key={i} className="rounded-2xl border p-4 backdrop-blur-xl flex items-start gap-3" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-1" />
                <p className="leading-7 text-sm">{t(m)}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "verses" && open.refs && (
          <div className="rounded-3xl border p-5 backdrop-blur-xl flex flex-wrap gap-2" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            {open.refs.map((r) => (
              <span key={r} className="text-xs rounded-full px-3 py-1.5 border" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>{r}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- List view ----------
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {L("گەڕانەوە", "رجوع", "Back")}
      </button>

      <div className="rounded-3xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{L("پێغەمبەران", "الأنبياء", "The Prophets")}</p>
            <p className="text-xs text-muted-foreground">{L(`${PROPHETS.length} پێغەمبەر`, `${PROPHETS.length} نبياً`, `${PROPHETS.length} prophets`)}</p>
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder={L("گەڕان...", "بحث...", "Search...")}
            className="w-full rounded-xl border px-3 pe-10 py-2 outline-none focus:border-primary"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          />
        </div>

        <div className="mt-3 flex gap-1.5">
          {([
            { id: "quran" as SortMode, label: L("بەپێی قورئان", "ترتيب القرآن", "Qur'anic order") },
            { id: "az" as SortMode, label: L("A–Z", "أ–ي", "A–Z") },
          ]).map((o) => (
            <button
              key={o.id}
              onClick={() => setSort(o.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${sort === o.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={{
                background: sort === o.id ? "var(--gradient-gold)" : "transparent",
                borderColor: sort === o.id ? "transparent" : "var(--glass-border)",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => { setOpenId(p.id); setTab("bio"); }}
            className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl hover:border-primary/50 hover:-translate-y-0.5 transition-all text-start"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <div className="min-w-0">
              <p className="font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>{t(p.name)}</p>
              <p className="text-xs text-muted-foreground truncate">
                {p.people ? t(p.people) : PROPHET_STORIES[p.id] ? L("چیرۆکی تەواو", "قصة كاملة", "Full story") : p.name.en}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
