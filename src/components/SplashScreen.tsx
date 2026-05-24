import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1800);
    const t2 = setTimeout(() => onDone(), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--gradient-bg)" }}
    >
      <div className="relative animate-[fadeIn_0.8s_ease-out]">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse"
          style={{ background: "var(--gradient-gold)" }}
        />
        <img
          src={logo}
          alt="IbadahPro"
          className="relative w-44 h-44 object-contain drop-shadow-2xl"
        />
      </div>
      <h1
        className="mt-6 text-4xl font-bold tracking-wide animate-[fadeIn_1.2s_ease-out]"
        style={{
          background: "var(--gradient-gold)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        IbadahPro
      </h1>
      <p className="mt-2 text-xs tracking-[0.3em] text-primary/70 uppercase animate-[fadeIn_1.6s_ease-out]">
        بِسْمِ اللَّهِ
      </p>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
