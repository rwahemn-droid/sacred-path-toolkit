import { useRef, useState, useEffect } from "react";
import { Send, Sparkles, ArrowLeft, Printer } from "lucide-react";
import { askMufti } from "@/lib/mufti.server";
import type { Lang, Dict } from "@/lib/i18n";
import { MORE } from "@/lib/more-i18n";

type Msg = { role: "user" | "assistant"; content: string };

export function AIMufti({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const m = MORE[lang].mufti;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setErr(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await askMufti({ data: { messages: next, lang } });
      if (res.ok) {
        setMessages([...next, { role: "assistant", content: res.reply }]);
      } else {
        setErr(res.error ?? m.error);
      }
    } catch {
      setErr(m.error);
    } finally {
      setLoading(false);
    }
  };

  const printChat = () => {
    if (typeof window === "undefined") return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const isRTL = lang !== "en";
    const rows = messages
      .map((msg) => {
        const who = msg.role === "user" ? (isRTL ? "پرسیار" : "You") : "AI Mufti";
        const bg = msg.role === "user" ? "#f5efe0" : "#ffffff";
        const safe = msg.content.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
        return `<div style="border:1px solid #d9c99b;background:${bg};border-radius:12px;padding:12px 16px;margin:10px 0;"><div style="font-size:11px;color:#8a7420;margin-bottom:4px;">${who}</div><div style="white-space:pre-wrap;line-height:1.8;">${safe}</div></div>`;
      })
      .join("");
    w.document.write(`<!doctype html><html dir="${isRTL ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${m.title}</title><style>body{font-family:${isRTL ? "'Noto Naskh Arabic',serif" : "system-ui,sans-serif"};max-width:720px;margin:24px auto;padding:0 20px;color:#1a1a1a;}h1{color:#8a7420;border-bottom:2px solid #d9c99b;padding-bottom:8px;}footer{margin-top:24px;font-size:11px;color:#888;text-align:center;}</style></head><body><h1>${m.title}</h1><p style="color:#666;font-size:12px;">${new Date().toLocaleString()}</p>${rows}<footer>${m.disclaimer} · IbadahPro</footer></body></html>`);
    w.document.close();
    setTimeout(() => { try { w.print(); } catch { /* */ } }, 300);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
          <ArrowLeft className="h-4 w-4" /> {t.quran.back}
        </button>
        {messages.length > 0 && (
          <button onClick={printChat} className="inline-flex items-center gap-2 text-xs rounded-full border px-3 py-1.5 hover:border-primary/50 transition"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <Printer className="h-3.5 w-3.5 text-primary" />
            {lang === "en" ? "Print" : lang === "ar" ? "طباعة" : "چاپکردن"}
          </button>
        )}
      </div>

      <div className="rounded-3xl border p-5 mb-4 backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">{m.title}</p>
            <p className="text-xs text-muted-foreground">{m.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4 min-h-[40vh]">
        {messages.length === 0 && !loading && (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">{m.empty}</p>
            <div className="grid gap-2">
              {m.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-start rounded-2xl border px-4 py-3 text-sm hover:border-primary/50 transition backdrop-blur-xl"
                  style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                msg.role === "user" ? "text-primary-foreground" : "border backdrop-blur-xl"
              }`}
              style={
                msg.role === "user"
                  ? { background: "var(--gradient-gold)" }
                  : { background: "var(--glass-bg)", borderColor: "var(--glass-border)" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground backdrop-blur-xl"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-bounce [animation-delay:120ms] rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-bounce [animation-delay:240ms] rounded-full bg-primary" />
              </span>
              <span className="ms-2">{m.thinking}</span>
            </div>
          </div>
        )}

        {err && <p className="text-center text-sm text-destructive">{err}</p>}
        <div ref={endRef} />
      </div>

      <p className="text-center text-[11px] text-muted-foreground mb-3">{m.disclaimer}</p>

      <div className="sticky bottom-24 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={m.placeholder}
          className="flex-1 rounded-full border px-4 py-3 text-sm outline-none backdrop-blur-xl focus:border-primary"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="grid h-12 w-12 place-items-center rounded-full text-primary-foreground disabled:opacity-40"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
