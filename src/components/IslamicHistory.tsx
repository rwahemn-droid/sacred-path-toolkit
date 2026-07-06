import { ArrowLeft, ScrollText } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type Event = {
  year: string;
  title: { ku: string; ar: string; en: string };
  desc: { ku: string; ar: string; en: string };
};

const EVENTS: Event[] = [
  { year: "570 CE",  title: { ku: "لەدایکبوونی موحەممەد ﷺ", ar: "مولد النبي ﷺ", en: "Birth of the Prophet ﷺ" }, desc: { ku: "لە ساڵی فیل لە مەککە.", ar: "في عام الفيل بمكة المكرمة.", en: "Born in Makkah in the Year of the Elephant." } },
  { year: "610 CE",  title: { ku: "سەرەتای وەحی", ar: "بدء الوحي", en: "First Revelation" }, desc: { ku: "لە ئەشکەوتی حیرا، سورەتی عەلەق.", ar: "في غار حراء، أول ما نزل صدر سورة العلق.", en: "In the Cave of Hira — opening of Surah al-ʿAlaq." } },
  { year: "615 CE",  title: { ku: "کۆچی یەکەم بۆ حەبەشە", ar: "الهجرة إلى الحبشة", en: "First migration to Abyssinia" }, desc: { ku: "پەنابردنی موسڵمانان بۆ لای نەجاشی.", ar: "لجأ الصحابة إلى النجاشي فراراً بدينهم.", en: "Companions sought refuge with the Negus." } },
  { year: "619 CE",  title: { ku: "ساڵی خەم", ar: "عام الحزن", en: "Year of Sorrow" }, desc: { ku: "کۆچی خەدیجە و ئەبو تالیب.", ar: "وفاة خديجة وأبي طالب.", en: "Passing of Khadijah and Abu Talib." } },
  { year: "621 CE",  title: { ku: "ئیسرا و مەعراج", ar: "الإسراء والمعراج", en: "Isra & Miʿraj" }, desc: { ku: "شەوگرد لە مەککەوە بۆ قودس و ئاسمانەکان.", ar: "من المسجد الحرام إلى الأقصى ثم إلى السماوات.", en: "Night journey from Makkah to Al-Aqsa and ascent through the heavens." } },
  { year: "622 CE",  title: { ku: "هجرة", ar: "الهجرة إلى المدينة", en: "Hijrah to Madinah" }, desc: { ku: "سەرەتای ساڵنامەی هەجری.", ar: "بداية التقويم الهجري.", en: "Beginning of the Islamic (Hijri) calendar." } },
  { year: "624 CE",  title: { ku: "شەڕی بەدر", ar: "غزوة بدر", en: "Battle of Badr" }, desc: { ku: "٣١٣ موسڵمان لە دژی ١٠٠٠ کوفار — سەرکەوتنی گەورە.", ar: "انتصر المسلمون رغم قلة عددهم.", en: "313 Muslims defeated a much larger Meccan force." } },
  { year: "625 CE",  title: { ku: "شەڕی ئوحود", ar: "غزوة أحد", en: "Battle of Uhud" }, desc: { ku: "تاقیکردنەوەیەکی سەخت بۆ ئوممەت.", ar: "امتحان شديد للمسلمين.", en: "A trying test for the young Muslim community." } },
  { year: "627 CE",  title: { ku: "شەڕی خەندەق", ar: "غزوة الخندق (الأحزاب)", en: "Battle of the Trench" }, desc: { ku: "پارێزگاری مەدینە بە چاڵێکی درێژ.", ar: "الدفاع عن المدينة بحفر الخندق.", en: "Defence of Madinah by digging a trench." } },
  { year: "628 CE",  title: { ku: "پەیمانی حودەیبیە", ar: "صلح الحديبية", en: "Treaty of Hudaybiyyah" }, desc: { ku: "پەیمانی ئاشتی لەگەڵ قوڕەیش.", ar: "معاهدة سلام مع قريش.", en: "Peace treaty with Quraysh." } },
  { year: "630 CE",  title: { ku: "کردنەوەی مەککە", ar: "فتح مكة", en: "Conquest of Makkah" }, desc: { ku: "کەعبە پاک کرایەوە لە بت.", ar: "طُهّرت الكعبة من الأصنام.", en: "The Kaʿbah cleansed of idols." } },
  { year: "632 CE",  title: { ku: "حەججی ماڵئاوایی و کۆچی پێغەمبەر ﷺ", ar: "حجة الوداع ووفاة النبي ﷺ", en: "Farewell Hajj & Passing of the Prophet ﷺ" }, desc: { ku: "کۆتاییهاتنی وەحی.", ar: "ختام الرسالة.", en: "Completion of the revelation." } },
  { year: "632–634", title: { ku: "خیلافەتی ئەبو بەکر ﭬ", ar: "خلافة أبي بكر رضي الله عنه", en: "Caliphate of Abu Bakr" }, desc: { ku: "شەڕی ڕدە و کۆکردنەوەی قورئان.", ar: "حروب الردة وجمع القرآن.", en: "Ridda wars and compilation of the Qur'an." } },
  { year: "634–644", title: { ku: "خیلافەتی عومەر ﭬ", ar: "خلافة عمر رضي الله عنه", en: "Caliphate of ʿUmar" }, desc: { ku: "کردنەوەی شام، عێراق، میسر و فارس.", ar: "فتح الشام والعراق ومصر وفارس.", en: "Conquest of the Levant, Iraq, Egypt and Persia." } },
  { year: "644–656", title: { ku: "خیلافەتی عوسمان ﭬ", ar: "خلافة عثمان رضي الله عنه", en: "Caliphate of ʿUthman" }, desc: { ku: "یەکخستنی نوسینی مسحەفی قورئان.", ar: "توحيد مصحف القرآن الكريم.", en: "Standardisation of the Qur'anic mushaf." } },
  { year: "656–661", title: { ku: "خیلافەتی عەلی ﭬ", ar: "خلافة علي رضي الله عنه", en: "Caliphate of ʿAli" }, desc: { ku: "کۆتایی خیلافەتی راشیدەکان.", ar: "نهاية عصر الخلافة الراشدة.", en: "End of the Rashidun era." } },
  { year: "661–750", title: { ku: "خیلافەتی ئومەیی", ar: "الخلافة الأموية", en: "Umayyad Caliphate" }, desc: { ku: "پایتەخت دیمەشق. بەرەوپێشچوونی ئیسلام تا ئەندەلوس.", ar: "عاصمتها دمشق، وامتد الإسلام حتى الأندلس.", en: "Capital in Damascus; Islam reached al-Andalus." } },
  { year: "750–1258",title: { ku: "خیلافەتی عەبباسی", ar: "الخلافة العباسية", en: "Abbasid Caliphate" }, desc: { ku: "بەغدا و سەردەمی زێڕینی زانست.", ar: "بغداد وعصر الازدهار العلمي.", en: "Baghdad and the golden age of Islamic science." } },
  { year: "1258",    title: { ku: "کەوتنی بەغدا", ar: "سقوط بغداد", en: "Fall of Baghdad" }, desc: { ku: "بە دەستی موغولەکان.", ar: "على يد المغول.", en: "By the Mongol invasion." } },
  { year: "1453",    title: { ku: "کردنەوەی قوستەنتینیە", ar: "فتح القسطنطينية", en: "Conquest of Constantinople" }, desc: { ku: "بە دەستی سوڵتان محەممەدی فاتیح.", ar: "على يد السلطان محمد الفاتح.", en: "By Sultan Mehmed the Conqueror." } },
];

export function IslamicHistory({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const t = (o: { ku: string; ar: string; en: string }) => (lang === "ar" ? o.ar : lang === "en" ? o.en : o.ku);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {L("گەڕانەوە", "رجوع", "Back")}
      </button>

      <div className="rounded-3xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{L("مێژووی ئیسلامی", "التاريخ الإسلامي", "Islamic History")}</p>
            <p className="text-xs text-muted-foreground">{L("ڕووداوە گرنگەکان", "أهم الأحداث", "Key events timeline")}</p>
          </div>
        </div>
      </div>

      <div className="relative ps-6">
        <div className="absolute inset-y-0 start-2 w-px bg-gradient-to-b from-primary/80 via-primary/30 to-transparent" />
        <div className="space-y-3">
          {EVENTS.map((ev, i) => (
            <div key={i} className="relative">
              <span className="absolute -start-[18px] top-4 h-3 w-3 rounded-full ring-4 ring-background" style={{ background: "var(--gradient-gold)" }} />
              <div className="rounded-2xl border p-4 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <p className="text-[11px] uppercase tracking-widest text-primary/90">{ev.year}</p>
                <p className="mt-0.5 font-semibold">{t(ev.title)}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(ev.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
