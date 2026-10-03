import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Volume2, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";

// Basic Tajweed highlighting using alquran.cloud "quran-tajweed" markup: [code[letters] or [code:id[letters]
type Rule = "madd" | "ghunnah" | "qalqalah" | "ikhfa" | "idgham";
const CODE: Record<string, Rule> = {
  n: "madd", p: "madd", m: "madd", o: "madd",
  g: "ghunnah", q: "qalqalah", f: "ikhfa", c: "ikhfa",
  a: "idgham", u: "idgham", w: "idgham", d: "idgham", b: "idgham",
};
const COLOR: Record<Rule, string> = {
  madd: "text-rose-300", ghunnah: "text-emerald-300", qalqalah: "text-sky-300",
  ikhfa: "text-amber-300", idgham: "text-violet-300",
};
type L = Record<"ku" | "bad" | "kmr" | "ar" | "en", string>;
const INFO: Record<Rule, { name: L; desc: L }> = {
  madd: {
    name: { ku: "مەد", bad: "مەد", kmr: "Med", ar: "المد", en: "Madd" },
    desc: { ku: "درێژکردنەوەی دەنگی پیتی مەد (ا، و، ی) بۆ ٢ تا ٦ حەرەکە.", bad: "درێژکرنا دەنگێ پیتا مەد (ا، و، ی) بۆ ٢ تا ٦ حەرەکان.", kmr: "Dirêjkirina dengê tîpên med (ا، و، ی) 2 heta 6 heraket.", ar: "إطالة الصوت بحرف المد (ا، و، ي) من حركتين إلى ست حركات.", en: "Stretch the long vowel (ا، و، ي) for 2 to 6 counts." },
  },
  ghunnah: {
    name: { ku: "غوننە", bad: "غوننە", kmr: "Xunne", ar: "الغنة", en: "Ghunnah" },
    desc: { ku: "دەنگێکی لووتی لەسەر نوون و میمی موشەددەد بۆ ماوەی ٢ حەرەکە.", bad: "دەنگەکێ دفنی ل سەر نوون و میما شەددە بۆ ٢ حەرەکان.", kmr: "Dengê pozê li ser nûn û mîma şeddedar, 2 heraket.", ar: "صوت يخرج من الخيشوم في النون والميم المشددتين بمقدار حركتين.", en: "A nasal sound on doubled noon or meem, held for 2 counts." },
  },
  qalqalah: {
    name: { ku: "قەلقەلە", bad: "قەلقەلە", kmr: "Qelqele", ar: "القلقلة", en: "Qalqalah" },
    desc: { ku: "لەرینەوەی دەنگ لە پیتەکانی (ق ط ب ج د) کاتێک ساکنن.", bad: "لەرزینا دەنگی د پیتێن (ق ط ب ج د) دەمێ ساکن.", kmr: "Lerizîna deng di tîpên (ق ط ب ج د) de dema sakin in.", ar: "اضطراب الصوت عند النطق بحروف (قطب جد) ساكنة.", en: "A slight echo/bounce on ق ط ب ج د when they have sukoon." },
  },
  ikhfa: {
    name: { ku: "ئیخفا", bad: "ئیخفا", kmr: "Ixfa", ar: "الإخفاء", en: "Ikhfa" },
    desc: { ku: "شاردنەوەی نوونی ساکن یان تەنوین لەگەڵ غوننە پێش پیتەکانی ئیخفا.", bad: "ڤەشارتنا نوونا ساکن یان تەنوینێ دگەل غوننە.", kmr: "Veşartina nûna sakin an tenwînê bi xunne.", ar: "إخفاء النون الساكنة أو التنوين مع الغنة قبل حروف الإخفاء.", en: "Hide the noon sakinah/tanween with a light nasal sound before the next letter." },
  },
  idgham: {
    name: { ku: "ئیدغام", bad: "ئیدغام", kmr: "Îdxam", ar: "الإدغام", en: "Idgham" },
    desc: { ku: "تێکەڵکردنی پیتێکی ساکن لە پیتی دواتر بۆ ئەوەی یەک پیتی موشەددەد بن.", bad: "تێکەلکرنا پیتەکا ساکن دگەل پیتا پشتی وێ.", kmr: "Têkelkirina tîpeke sakin bi tîpa piştî wê.", ar: "إدخال حرف ساكن في الحرف الذي بعده فيصيران حرفاً مشدداً.", en: "Merge a silent letter into the next one so they sound as one doubled letter." },
  },
};
const PRACTICE: L = { ku: "ڕاهێنان", bad: "ڕاهێنان", kmr: "Pratîk", ar: "تدرّب", en: "Practice" };
const tr = (l: L, lang: Lang) => l[lang as keyof L] ?? l.en;

type Seg = { text: string; rule?: Rule };
function parse(raw: string): Seg[][] {
  const segs: Seg[] = [];
  const re = /\[([a-z])(?::\d+)?\[([^\]]*)\]/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    if (m.index > last) segs.push({ text: raw.slice(last, m.index) });
    segs.push({ text: m[2], rule: CODE[m[1]] });
    last = re.lastIndex;
  }
  if (last < raw.length) segs.push({ text: raw.slice(last) });
  // split into words on spaces
  const words: Seg[][] = [[]];
  for (const s of segs) {
    const parts = s.text.split(" ");
    parts.forEach((p, i) => {
      if (i > 0) words.push([]);
      if (p) words[words.length - 1].push({ text: p, rule: s.rule });
    });
  }
  return words.filter((w) => w.length);
}

export function TajweedAyah({ surah, ayah, fallback, lang, onPractice }: {
  surah: number; ayah: number; fallback: string; lang: Lang; onPractice: () => void;
}) {
  const [open, setOpen] = useState<Rule | null>(null);
  const { data } = useQuery({
    queryKey: ["tajweed", surah, ayah],
    staleTime: Infinity,
    queryFn: async () => {
      const r = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-tajweed`);
      return ((await r.json()).data?.text as string) ?? "";
    },
  });
  if (!data) return <>{fallback}</>;
  let words = parse(data);
  // first ayah of most surahs includes Bismillah, which is shown as a header elsewhere
  if (ayah === 1 && surah !== 1 && surah !== 9 && words.length > 4) words = words.slice(4);

  return (
    <>
      {words.map((w, i) => {
        const rule = w.find((s) => s.rule)?.rule;
        return (
          <span key={i}>
            <span onClick={rule ? () => setOpen(rule) : undefined} className={rule ? "cursor-pointer" : ""}>
              {w.map((s, j) => <span key={j} className={s.rule ? COLOR[s.rule] : ""}>{s.text}</span>)}
            </span>{" "}
          </span>
        );
      })}
      {open && (
        <span dir="auto" className="fixed inset-x-0 bottom-0 z-[70] block p-4 font-sans animate-in slide-in-from-bottom duration-200" onClick={() => setOpen(null)}>
          <span className="mx-auto block max-w-xl rounded-3xl border border-white/10 bg-[#0C1C38] p-4 text-start shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="flex items-center justify-between">
              <span className={`text-lg font-semibold ${COLOR[open]}`}>{tr(INFO[open].name, lang)}</span>
              <button onClick={() => setOpen(null)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5" aria-label="close"><X className="h-4 w-4" /></button>
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-white/80">{tr(INFO[open].desc, lang)}</span>
            <button onClick={() => { onPractice(); setOpen(null); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400/20 py-2.5 text-sm font-medium text-sky-100 active:scale-95">
              <Volume2 className="h-4 w-4" />{tr(PRACTICE, lang)}
            </button>
          </span>
        </span>
      )}
    </>
  );
}
