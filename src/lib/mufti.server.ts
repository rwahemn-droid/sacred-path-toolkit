import { createServerFn } from "@tanstack/react-start";

type Msg = { role: "user" | "assistant"; content: string };

export const askMufti = createServerFn({ method: "POST" })
  .validator((data: { messages: Msg[]; lang: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI is not configured." };
    }

    const langName =
      data.lang === "ku" ? "Central Kurdish (Sorani, in Arabic script)"
      : data.lang === "ar" ? "Arabic"
      : data.lang === "kmr" ? "Kurmanji Kurdish (Latin script)"
      : data.lang === "bad" ? "Badini Kurdish (Arabic script)"
      : "English";

    const system = `You are "AI Mufti" — a knowledgeable and gentle Sunni Islamic assistant grounded in the Quran, authentic Sunnah, and the four Sunni madhhabs (Hanafi, Maliki, Shafi'i, Hanbali).
Rules:
- Reply strictly in ${langName}.
- Ground answers in Quran/Sunnah and cite the ayah or hadith source when relevant (e.g. "Al-Baqarah 2:183", "Bukhari 1").
- When scholars differ, briefly mention the mainstream views. Never issue rulings on complex personal matters — advise the user to consult a local scholar.
- Keep answers concise (3–8 short paragraphs), warm, and free of sectarian polemics.
- If a question is outside Islam, politely bring it back to Islamic guidance or decline.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: system }, ...data.messages],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI gateway error", res.status, text);
        return { ok: false as const, error: `AI error ${res.status}` };
      }
      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content ?? "";
      return { ok: true as const, reply };
    } catch (e) {
      console.error(e);
      return { ok: false as const, error: "Network error" };
    }
  });
