import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { shareCard, type CardKind } from "@/lib/share-card";

/** Small button that renders and shares a card image. */
export function ShareButton({
  kind,
  arabic,
  translation,
  reference,
  label,
  className = "",
}: {
  kind: CardKind;
  arabic: string;
  translation?: string;
  reference?: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await shareCard({ kind, arabic, translation, reference });
    } catch {
      /* ignore */
    }
    setBusy(false);
  };
  return (
    <button
      onClick={run}
      disabled={busy}
      className={`h-9 px-3 rounded-full flex items-center gap-1.5 border text-[11px] text-primary hover:border-primary/60 transition disabled:opacity-50 ${className}`}
      style={{ borderColor: "var(--glass-border)" }}
      aria-label="share"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
