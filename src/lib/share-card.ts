// Renders a shareable card image (verse / hadith / dhikr) on a canvas.
export type CardKind = "verse" | "hadith" | "dhikr";

export type ShareCardInput = {
  kind: CardKind;
  arabic: string;
  translation?: string;
  reference?: string;
};

const PALETTE: Record<CardKind, [string, string]> = {
  verse: ["#0b3b3c", "#0f766e"],
  hadith: ["#1e293b", "#0e7490"],
  dhikr: ["#3b2606", "#b45309"],
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const [c1, c2] = PALETTE[input.kind];
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 54px 'Amiri Quran', 'Scheherazade New', serif";
  const arLines = wrap(ctx, input.arabic, W - 220);
  let y = H / 2 - (arLines.length * 84) / 2 - (input.translation ? 80 : 0);
  for (const l of arLines) {
    ctx.fillText(l, W / 2, y);
    y += 84;
  }

  if (input.translation) {
    ctx.direction = "rtl";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "400 34px system-ui, sans-serif";
    y += 40;
    for (const l of wrap(ctx, input.translation, W - 240)) {
      ctx.fillText(l, W / 2, y);
      y += 50;
    }
  }

  if (input.reference) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "500 30px system-ui, sans-serif";
    ctx.fillText(input.reference, W / 2, H - 150);
  }

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.direction = "ltr";
  ctx.fillText("IbadahPro", W / 2, H - 90);

  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/png", 0.95),
  );
}

/** Share the rendered card, falling back to a download. */
export async function shareCard(input: ShareCardInput) {
  const blob = await renderShareCard(input);
  const file = new File([blob], "ibadahpro.png", { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: input.reference ?? "IbadahPro" });
      return;
    } catch {
      /* fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ibadahpro.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
