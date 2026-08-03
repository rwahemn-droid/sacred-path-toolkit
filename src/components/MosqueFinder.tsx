import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Navigation, Loader2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type Mosque = { id: number; name: string; lat: number; lon: number; dist: number };

function haversine(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function MosqueFinder({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [list, setList] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErr(L("شوێن بەردەست نییە", "الموقع غير متاح", "Location unavailable"));
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {
        setErr(L("ڕێگە بە شوێن بدە", "امنح إذن الموقع", "Allow location access"));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pos) return;
    const q = `[out:json][timeout:20];(node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos[0]},${pos[1]});way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos[0]},${pos[1]}););out center 40;`;
    fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: q })
      .then((r) => r.json())
      .then((j) => {
        const items: Mosque[] = (j.elements ?? [])
          .map((e: { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
            const lat = e.lat ?? e.center?.lat;
            const lon = e.lon ?? e.center?.lon;
            if (lat == null || lon == null) return null;
            return {
              id: e.id,
              name: e.tags?.["name"] || e.tags?.["name:ar"] || L("مزگەوت", "مسجد", "Mosque"),
              lat,
              lon,
              dist: haversine(pos, [lat, lon]),
            };
          })
          .filter(Boolean) as Mosque[];
        setList(items.sort((a, b) => a.dist - b.dist).slice(0, 25));
      })
      .catch(() => setErr(L("هەڵە ڕوویدا", "حدث خطأ", "Something went wrong")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  const bbox = pos ? `${pos[1] - 0.03},${pos[0] - 0.02},${pos[1] + 0.03},${pos[0] + 0.02}` : "";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">{L("دۆزینەوەی مزگەوت", "البحث عن المساجد", "Mosque Finder")}</h2>
      </div>

      {pos && (
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--glass-border)" }}>
          <iframe
            title="map"
            className="w-full h-56 border-0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${pos[0]},${pos[1]}`}
          />
        </div>
      )}

      {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
      {err && <p className="text-center py-8 text-sm text-destructive">{err}</p>}

      <div className="grid gap-2">
        {list.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-teal)" }}>
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {m.dist < 1 ? `${Math.round(m.dist * 1000)} m` : `${m.dist.toFixed(1)} km`}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 rounded-full flex items-center gap-1.5 text-[11px] text-primary-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Navigation className="h-3.5 w-3.5" />
              {L("ڕێنمایی", "توجيه", "Go")}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
