import { useState } from "react";
import { Sparkles, Coins, CalendarDays, Flame, Star, BookOpen, ClipboardCheck, BookMarked, Sun, Droplet, Brain, User, Compass, Moon, Scale, Users, ScrollText, Target, Trophy, MapPin, GraduationCap, ScanFace } from "lucide-react";
import type { Lang, Dict } from "@/lib/i18n";
import { MORE } from "@/lib/more-i18n";
import { AIMufti } from "./AIMufti";
import { AsmaAllah } from "./AsmaAllah";
import { ZakatCalculator } from "./ZakatCalculator";
import { IslamicEvents } from "./IslamicEvents";
import { HabitTracker } from "./HabitTracker";
import { HadithLibrary } from "./HadithLibrary";
import { PrayerTracker } from "./PrayerTracker";
import { KhatmTracker } from "./KhatmTracker";
import { AdhkarPacks } from "./AdhkarPacks";
import { WudhuGuide, SalahGuide } from "./Guides";
import { TawafSaiCounter } from "./TawafSaiCounter";
import { RamadanPlanner } from "./RamadanPlanner";
import { InheritanceCalculator } from "./InheritanceCalculator";
import { ProphetsLibrary } from "./ProphetsLibrary";
import { IslamicHistory } from "./IslamicHistory";
import { MemorizationPlan } from "./MemorizationPlan";
import { WorshipPlanner } from "./WorshipPlanner";
import { Achievements } from "./Achievements";
import { MosqueFinder } from "./MosqueFinder";
import { TajweedLessons } from "./TajweedLessons";
import { MuslimFilter } from "./MuslimFilter";

type Sub =
  | "hub" | "mufti" | "asma" | "zakat" | "events" | "habits" | "hadith"
  | "prayer" | "khatm" | "adhkar" | "wudhu" | "salah" | "tawaf" | "ramadan"
  | "mirath" | "prophets" | "history" | "hifz" | "planner" | "awards" | "mosques" | "tajweed" | "filter";

export function MoreView({ lang, t }: { lang: Lang; t: Dict }) {
  const [sub, setSub] = useState<Sub>("hub");
  const m = MORE[lang];
  const back = () => setSub("hub");

  if (sub === "mufti") return <AIMufti lang={lang} t={t} onBack={back} />;
  if (sub === "asma") return <AsmaAllah lang={lang} t={t} onBack={back} />;
  if (sub === "zakat") return <ZakatCalculator lang={lang} t={t} onBack={back} />;
  if (sub === "events") return <IslamicEvents lang={lang} t={t} onBack={back} />;
  if (sub === "habits") return <HabitTracker lang={lang} t={t} onBack={back} />;
  if (sub === "hadith") return <HadithLibrary lang={lang} t={t} onBack={back} />;
  if (sub === "prayer") return <PrayerTracker lang={lang} onBack={back} />;
  if (sub === "khatm") return <KhatmTracker lang={lang} onBack={back} />;
  if (sub === "adhkar") return <AdhkarPacks lang={lang} onBack={back} />;
  if (sub === "wudhu") return <WudhuGuide lang={lang} onBack={back} />;
  if (sub === "salah") return <SalahGuide lang={lang} onBack={back} />;
  if (sub === "tawaf") return <TawafSaiCounter lang={lang} onBack={back} />;
  if (sub === "ramadan") return <RamadanPlanner lang={lang} onBack={back} />;
  if (sub === "mirath") return <InheritanceCalculator lang={lang} onBack={back} />;
  if (sub === "prophets") return <ProphetsLibrary lang={lang} onBack={back} />;
  if (sub === "hifz") return <MemorizationPlan lang={lang} onBack={back} />;
  if (sub === "planner") return <WorshipPlanner lang={lang} onBack={back} />;
  if (sub === "awards") return <Achievements lang={lang} onBack={back} />;
  if (sub === "mosques") return <MosqueFinder lang={lang} onBack={back} />;
  if (sub === "tajweed") return <TajweedLessons lang={lang} onBack={back} />;
  if (sub === "filter") return <MuslimFilter lang={lang} onBack={back} />;
  if (sub === "history") return <IslamicHistory lang={lang} onBack={back} />;

  const L = (ku: string, ar: string, en: string) => lang === "ar" ? ar : lang === "en" ? en : ku;

  const cards: {
    id: Sub;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    category: string;
  }[] = [
    { id: "mufti",  title: m.cards.mufti.title,  desc: m.cards.mufti.desc,  icon: Sparkles,    bg: "linear-gradient(135deg,#a855f7,#6366f1)", category: m.categories.ai },
    { id: "filter", title: L("فلتەری موسڵمان","فلتر المسلم","Muslim Filter"), desc: L("کامێرا و ئایەتی قورئان","كاميرا وآيات القرآن","AR camera with Quran verses"), icon: ScanFace, bg: "linear-gradient(135deg,#8b5cf6,#ec4899)", category: m.categories.tools },
    { id: "hifz", title: L("حیفزی قورئان","حفظ القرآن","Memorization"), desc: L("پلان، پێداچوونەوە، تاقیکردنەوە","خطة، مراجعة، اختبار","Plan, revision, quiz"), icon: Brain, bg: "linear-gradient(135deg,#14b8a6,#0d9488)", category: m.categories.knowledge },
    { id: "planner", title: L("پلانی عیبادەت","مخطط العبادة","Worship Planner"), desc: L("ئامانجی ڕۆژانە و هەفتانە","أهداف يومية وأسبوعية","Daily & weekly goals"), icon: Target, bg: "linear-gradient(135deg,#0ea5e9,#6366f1)", category: m.categories.tools },
    { id: "awards", title: L("دەستکەوتەکان","الإنجازات","Achievements"), desc: L("XP، ئاست و نیشان","XP ومستويات وأوسمة","XP, levels, badges"), icon: Trophy, bg: "linear-gradient(135deg,#f59e0b,#ef4444)", category: m.categories.tools },
    { id: "mosques", title: L("مزگەوتەکانی نزیک","المساجد القريبة","Mosque Finder"), desc: L("نەخشە و ڕێنمایی","خريطة وتوجيه","Map & navigation"), icon: MapPin, bg: "linear-gradient(135deg,#14b8a6,#059669)", category: m.categories.tools },
    { id: "tajweed", title: L("فێربوونی تەجوید","تعلّم التجويد","Learn Tajweed"), desc: L("١٤ وانە بە نموونەی ڕەنگاوڕەنگ","١٤ درساً بأمثلة ملوّنة","14 lessons with colored examples"), icon: GraduationCap, bg: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", category: m.categories.knowledge },
    { id: "prophets", title: L("پێغەمبەران","الأنبياء","Prophets"), desc: L("ژیاننامەی ٢٥ پێغەمبەر","سيرة ٢٥ نبياً","25 prophet biographies"), icon: Users, bg: "linear-gradient(135deg,#10b981,#059669)", category: m.categories.knowledge },
    { id: "history", title: L("مێژووی ئیسلامی","التاريخ الإسلامي","Islamic History"), desc: L("ڕووداوە گرنگەکان","أهم الأحداث","Key events timeline"), icon: ScrollText, bg: "linear-gradient(135deg,#f97316,#dc2626)", category: m.categories.knowledge },
    { id: "mirath", title: L("ژماردەی میرات","حاسبة الميراث","Inheritance"), desc: L("حوکمی فەرائیز","أحكام الفرائض","Faraid calculator"), icon: Scale, bg: "linear-gradient(135deg,#f59e0b,#d97706)", category: m.categories.tools },
    { id: "adhkar", title: L("ئەذکاری ڕۆژانە","الأذكار اليومية","Daily Adhkar"), desc: L("بەیانی، ئێواره، خەو، گەشت","صباح، مساء، نوم، سفر","Morning, evening, sleep, travel"), icon: Sun, bg: "linear-gradient(135deg,#f59e0b,#f97316)", category: m.categories.knowledge },
    { id: "hadith", title: L("کتێبخانەی حەدیس","مكتبة الحديث","Hadith Library"), desc: L("٩ کۆمەڵەی حەدیس","٩ مجموعات","9 collections"), icon: BookMarked, bg: "linear-gradient(135deg,#0891b2,#0e7490)", category: m.categories.knowledge },
    { id: "wudhu",  title: L("ڕێنمای وزو","دليل الوضوء","Wudhu Guide"), desc: L("١١ هەنگاو","١١ خطوة","11 steps"), icon: Droplet, bg: "linear-gradient(135deg,#06b6d4,#0891b2)", category: m.categories.knowledge },
    { id: "salah",  title: L("ڕێنمای نوێژ","دليل الصلاة","Salah Guide"), desc: L("١٣ هەنگاو","١٣ خطوة","13 steps"), icon: User, bg: "linear-gradient(135deg,#22c55e,#16a34a)", category: m.categories.knowledge },
    { id: "tawaf",  title: L("تەواف و سعی","الطواف والسعي","Tawaf & Saʿi"), desc: L("ژماردەی ٧ خول","عداد ٧ أشواط","7-circuit counter"), icon: Compass, bg: "linear-gradient(135deg,#8b5cf6,#6d28d9)", category: m.categories.tools },
    { id: "ramadan", title: L("پلانی ڕەمەزان","خطة رمضان","Ramadan Planner"), desc: L("٣٠ ڕۆژ + لەیلەتولقەدر","٣٠ يوم + ليلة القدر","30 days + Laylatul Qadr"), icon: Moon, bg: "linear-gradient(135deg,#4f46e5,#7c3aed)", category: m.categories.calendar },
    { id: "prayer", title: L("شوێنپێی نوێژ","متتبع الصلوات","Prayer Tracker"), desc: L("٥ نوێژی ڕۆژانە","٥ صلوات يومية","5 daily prayers"), icon: ClipboardCheck, bg: "linear-gradient(135deg,#0ea5e9,#2563eb)", category: m.categories.tools },
    { id: "khatm",  title: L("شوێنپێی خەتم","متتبع الختمة","Khatmah Tracker"), desc: L("٣٠ جزء قورئان","٣٠ جزء قرآن","30 juz progress"), icon: BookOpen, bg: "linear-gradient(135deg,#d97706,#b45309)", category: m.categories.knowledge },
    { id: "asma",   title: m.cards.asma.title,   desc: m.cards.asma.desc,   icon: Star,        bg: "linear-gradient(135deg,#f59e0b,#f97316)", category: m.categories.knowledge },
    { id: "zakat",  title: m.cards.zakat.title,  desc: m.cards.zakat.desc,  icon: Coins,       bg: "linear-gradient(135deg,#10b981,#14b8a6)", category: m.categories.tools },
    { id: "events", title: m.cards.events.title, desc: m.cards.events.desc, icon: CalendarDays,bg: "linear-gradient(135deg,#0ea5a3,#3b82f6)", category: m.categories.calendar },
    { id: "habits", title: m.cards.habits.title, desc: m.cards.habits.desc, icon: Flame,       bg: "linear-gradient(135deg,#ef4444,#f59e0b)", category: m.categories.tools },
  ];


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="rounded-3xl border p-6 backdrop-blur-xl text-center"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <h2 className="text-lg font-semibold">{m.hubTitle}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setSub(c.id)}
              className="text-start rounded-2xl border p-4 backdrop-blur-xl transition hover:border-primary/50 hover:-translate-y-0.5"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground" style={{ background: c.bg }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-primary/80">{c.category}</p>
                  <p className="mt-0.5 font-semibold truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
