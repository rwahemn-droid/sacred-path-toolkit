import { useState } from "react";
import { ArrowLeft, ArrowRight, Droplet, User } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type Step = { ar?: string; title: string; desc: string };

export function WudhuGuide({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const BackIcon = lang === "ar" || lang === "ku" ? ArrowRight : ArrowLeft;
  const steps: Step[] = [
    { title: L("نیەت", "النية", "Intention"), desc: L("لە دڵدا نیەت بکە بۆ وزو", "انوِ الوضوء بقلبك", "Make intention in the heart") },
    { title: L("بسم الله", "التسمية", "Bismillah"), desc: L("بسم الله بڵێ", "قل: بسم الله", "Say: Bismillah") },
    { title: L("شوردنی دەست", "غسل اليدين", "Wash hands"), desc: L("سێ جار هەردوو دەست تا مۆچی", "اغسل يديك ثلاثاً", "Wash both hands 3 times up to wrists") },
    { title: L("مضمضة", "المضمضة", "Rinse mouth"), desc: L("ئاو بدە دەم و سێ جار", "تمضمض ثلاثاً", "Rinse mouth 3 times") },
    { title: L("استنشاق", "الاستنشاق", "Sniff water"), desc: L("ئاو هەڵمژە بۆ لووت سێ جار", "استنشق ثلاثاً", "Sniff water into nose 3 times") },
    { title: L("شوردنی ڕوو", "غسل الوجه", "Wash face"), desc: L("سێ جار ڕوو بشۆ", "اغسل وجهك ثلاثاً", "Wash face 3 times") },
    { title: L("شوردنی قۆڵ", "غسل الذراعين", "Wash arms"), desc: L("راست پاشان چەپ تا ئەرنیج", "اليدين إلى المرفقين", "Right then left arm up to elbows 3 times") },
    { title: L("مسح سەر", "مسح الرأس", "Wipe head"), desc: L("جارێک بە دەستی تەڕ", "امسح رأسك مرة", "Wipe head once with wet hands") },
    { title: L("مسح گوێ", "مسح الأذنين", "Wipe ears"), desc: L("گوێی ناوەوە و دەرەوە", "امسح الأذنين", "Wipe inside and outside of ears") },
    { title: L("شوردنی پێ", "غسل القدمين", "Wash feet"), desc: L("راست پاشان چەپ تا قۆزەک", "إلى الكعبين", "Right then left foot up to ankles 3 times") },
    { title: L("دوعا", "الدعاء", "Duʿa"), desc: L("أشهد أن لا إله إلا الله...", "أشهد أن لا إله إلا الله وحده لا شريك له...", "Ash-hadu an la ilaha ill-Allah…") },
  ];
  const [i, setI] = useState(0);
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{L("ڕێنمای وزو", "دليل الوضوء", "Wudhu Guide")}</h2>
        <Droplet className="h-5 w-5 text-primary" />
      </div>
      <div className="rounded-2xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs text-primary">{i + 1} / {steps.length}</p>
        <p className="mt-1 text-xl font-semibold">{steps[i].title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{steps[i].desc}</p>
        <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%`, background: "var(--gradient-gold)" }} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="flex-1 py-2 rounded-xl border disabled:opacity-40" style={{ borderColor: "var(--glass-border)" }}>
            {L("پێشوو", "السابق", "Previous")}
          </button>
          <button onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}
            className="flex-1 py-2 rounded-xl text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--gradient-gold)" }}>
            {L("دواتر", "التالي", "Next")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SalahGuide({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const BackIcon = lang === "ar" || lang === "ku" ? ArrowRight : ArrowLeft;
  const steps: Step[] = [
    { title: L("نیەت", "النية", "Intention"), desc: L("نیەتی نوێژ لە دڵ", "انوِ الصلاة", "Intend the prayer in your heart") },
    { title: L("تکبیرة الإحرام", "تكبيرة الإحرام", "Takbir"), ar: "اللَّهُ أَكْبَرُ", desc: L("دەست هەڵبڕە و بڵێ ‌الله ئەکبەر", "ارفع يديك وقل الله أكبر", "Raise hands and say Allahu Akbar") },
    { title: L("دوعای فەتحی", "دعاء الاستفتاح", "Opening duʿa"), ar: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ...", desc: L("دوعای دەستپێک", "دعاء الاستفتاح", "Opening supplication") },
    { title: L("فاتحە", "الفاتحة", "Al-Fatiha"), ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...", desc: L("سوورەتی فاتیحە", "قراءة الفاتحة", "Recite Al-Fatiha") },
    { title: L("سوورەیەک", "سورة", "A short surah"), desc: L("سوورەیەکی کورت لە دوای فاتیحە", "سورة قصيرة بعد الفاتحة", "Recite a short surah after Al-Fatiha") },
    { title: L("ڕکوع", "الركوع", "Rukūʿ"), ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", desc: L("سێ جار: سبحان ربي العظیم", "قل: سبحان ربي العظيم ٣", "Say Subhana Rabbiyal Adheem 3×") },
    { title: L("راستبوونەوە", "الرفع من الركوع", "Rise"), ar: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا وَلَكَ الْحَمْدُ", desc: L("سمع الله لمن حمده...", "سمع الله لمن حمده", "Sami’ Allahu liman hamidah…") },
    { title: L("سجدە", "السجود", "Sujūd"), ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى", desc: L("سێ جار: سبحان ربي الأعلی", "قل: سبحان ربي الأعلى ٣", "Say Subhana Rabbiyal A’la 3×") },
    { title: L("دانیشتن نێوان دوو سجدە", "الجلوس بين السجدتين", "Sit between sujūd"), ar: "رَبِّ اغْفِرْ لِي", desc: L("رب اغفر لي", "رب اغفر لي", "Rabbighfir li") },
    { title: L("سجدەی دووەم", "السجدة الثانية", "Second sujūd"), desc: L("وەک سجدەی یەکەم", "كالسجدة الأولى", "Same as first sujūd") },
    { title: L("تشەهود", "التشهد", "Tashahhud"), ar: "التَّحِيَّاتُ لِلَّهِ...", desc: L("تشەهودی کۆتایی", "التشهد", "Tashahhud") },
    { title: L("دروودی ئیبراهیمی", "الصلاة الإبراهيمية", "Salawat"), ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ...", desc: L("درود لە پێغەمبەر", "الصلاة على النبي", "Send blessings on the Prophet") },
    { title: L("سەلام", "التسليم", "Taslim"), ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", desc: L("لای ڕاست و چەپ", "يميناً ثم يساراً", "Turn right then left") },
  ];
  const [i, setI] = useState(0);
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{L("ڕێنمای نوێژ", "دليل الصلاة", "Salah Guide")}</h2>
        <User className="h-5 w-5 text-primary" />
      </div>
      <div className="rounded-2xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs text-primary">{i + 1} / {steps.length}</p>
        <p className="mt-1 text-xl font-semibold">{steps[i].title}</p>
        {steps[i].ar && <p className="mt-3 font-display text-2xl leading-loose text-center" dir="rtl">{steps[i].ar}</p>}
        <p className="mt-2 text-sm text-muted-foreground">{steps[i].desc}</p>
        <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%`, background: "var(--gradient-gold)" }} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="flex-1 py-2 rounded-xl border disabled:opacity-40" style={{ borderColor: "var(--glass-border)" }}>
            {L("پێشوو", "السابق", "Previous")}
          </button>
          <button onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}
            className="flex-1 py-2 rounded-xl text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--gradient-gold)" }}>
            {L("دواتر", "التالي", "Next")}
          </button>
        </div>
      </div>
    </div>
  );
}
