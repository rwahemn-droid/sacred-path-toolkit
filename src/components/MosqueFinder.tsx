import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Loader2,
  Search,
  RefreshCw,
  Phone,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";
import {
  fetchMosques,
  geocode,
  isOpenNow,
  loadCache,
  saveCache,
  haversine,
  type LatLon,
  type Mosque,
} from "@/lib/mosques";

const MosqueMap = lazy(() =>
  import("./MosqueMap").then((m) => ({ default: m.MosqueMap })),
);

const RADII = [1, 5, 10, 25, 50];
type Filter = "near" | "open";

export function MosqueFinder({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = useCallback(
    (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku),
    [lang],
  );

  const [center, setCenter] = useState<LatLon | null>(null);
  const [centerLabel, setCenterLabel] = useState<string>("");
  const [radius, setRadius] = useState(5);
  const [list, setList] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("near");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /** Ask for GPS permission and read a high-accuracy fix (works on Web, Android & iOS WebView). */
  const locate = useCallback(() => {
    setGeoError(null);
    setLocating(true);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(L("شوێن لەم ئامێرەدا پشتگیری ناکرێت", "الموقع غير مدعوم على هذا الجهاز", "Location is not supported on this device"));
      setLocating(false);
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGeoError(L("شوێن تەنها لەسەر HTTPS کار دەکات", "الموقع يعمل فقط عبر HTTPS", "Location only works over HTTPS"));
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCenter({ lat: p.coords.latitude, lon: p.coords.longitude });
        setCenterLabel(L("شوێنی ئێستات", "موقعك الحالي", "Your location"));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            L(
              "ڕێگەی شوێن ڕەتکرایەوە. لە ڕێکخستنەکانی وێبگەڕ/ئەپ ڕێگە بە شوێن بدە و دووبارە هەوڵ بدە.",
              "تم رفض إذن الموقع. امنح إذن الموقع من إعدادات المتصفح/التطبيق ثم أعد المحاولة.",
              "Location permission denied. Allow location in your browser/app settings, then retry.",
            ),
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError(
            L(
              "GPS کوژاوەتەوە یان بەردەست نییە. تکایە خزمەتگوزاری شوێن چالاک بکە.",
              "خدمة تحديد الموقع (GPS) معطلة. يرجى تفعيلها.",
              "GPS is off or unavailable. Please enable location services.",
            ),
          );
        } else {
          setGeoError(
            L("دۆزینەوەی شوێن درەنگ کەوت. دووبارە هەوڵ بدە.", "انتهت مهلة تحديد الموقع. حاول مرة أخرى.", "Locating timed out. Try again."),
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }, [L]);

  useEffect(() => {
    locate();
  }, [locate]);

  // Auto-refresh the position; only re-query when the user really moved (>300 m).
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lon: p.coords.longitude };
        setCenter((prev) => (prev && haversine(prev, next) < 0.3 ? prev : next));
      },
      () => {
        /* keep the last known fix */
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 },
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  // Load mosques whenever the centre or radius changes.
  const load = useCallback(
    async (c: LatLon, r: number) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setDataError(null);
      setFromCache(false);
      try {
        const items = await fetchMosques(c, r, L("مزگەوت", "مسجد", "Mosque"), ctrl.signal);
        if (ctrl.signal.aborted) return;
        setList(items);
        saveCache(c, r, items);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        const cached = loadCache();
        if (cached && cached.items.length) {
          setList(
            cached.items
              .map((m) => ({ ...m, dist: haversine(c, { lat: m.lat, lon: m.lon }), openNow: isOpenNow(m.openingHours) }))
              .sort((a, b) => a.dist - b.dist),
          );
          setFromCache(true);
        } else {
          setList([]);
          setDataError(
            navigator.onLine
              ? L("هێنانی داتا سەرکەوتوو نەبوو. دووبارە هەوڵ بدە.", "تعذر جلب البيانات. حاول مرة أخرى.", "Could not load mosque data. Please retry.")
              : L("پەیوەندی ئینتەرنێت نییە.", "لا يوجد اتصال بالإنترنت.", "No internet connection."),
          );
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    },
    [L],
  );

  useEffect(() => {
    if (!center) return;
    void load(center, radius);
    return () => abortRef.current?.abort();
  }, [center, radius, load]);

  // Search: text filters the list; pressing enter with no local match geocodes the place.
  const [searching, setSearching] = useState(false);
  const runPlaceSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setGeoError(null);
    try {
      const places = await geocode(q);
      const first = places[0];
      if (first) {
        setCenter({ lat: first.lat, lon: first.lon });
        setCenterLabel(first.name.split(",").slice(0, 2).join(","));
        setQuery("");
      } else {
        setDataError(L("هیچ شوێنێک نەدۆزرایەوە", "لم يتم العثور على المكان", "No place found"));
      }
    } catch {
      setDataError(L("گەڕان سەرکەوتوو نەبوو", "فشل البحث", "Search failed"));
    } finally {
      setSearching(false);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = list;
    if (q) out = out.filter((m) => `${m.name} ${m.address}`.toLowerCase().includes(q));
    if (filter === "open") out = out.filter((m) => m.openNow === true);
    return [...out].sort((a, b) => a.dist - b.dist);
  }, [list, query, filter]);

  const fmtDist = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5" aria-label="back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold flex-1">{L("دۆزینەوەی مزگەوت", "البحث عن المساجد", "Mosque Finder")}</h2>
        <button
          onClick={() => {
            locate();
            if (center) void load(center, radius);
          }}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5"
          aria-label="refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading || locating ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl border px-3 py-2 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void runPlaceSearch();
          }}
          placeholder={L("ناوی مزگەوت، شار یان ناونیشان…", "اسم المسجد أو المدينة أو العنوان…", "Mosque, city or address…")}
          className="flex-1 bg-transparent text-sm outline-none min-w-0"
        />
        {searching ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          query && (
            <button onClick={() => void runPlaceSearch()} className="text-[11px] px-2 py-1 rounded-lg" style={{ background: "var(--gradient-teal)", color: "var(--primary-foreground)" }}>
              {L("گەڕان", "بحث", "Go")}
            </button>
          )
        )}
      </div>

      {/* Radius + filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {RADII.map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[11px] border"
            style={
              radius === r
                ? { background: "var(--gradient-teal)", color: "var(--primary-foreground)", borderColor: "transparent" }
                : { borderColor: "var(--glass-border)" }
            }
          >
            {r} km
          </button>
        ))}
        <span className="mx-1 h-4 w-px shrink-0" style={{ background: "var(--glass-border)" }} />
        {([
          ["near", L("نزیکترین", "الأقرب", "Nearest")],
          ["open", L("ئێستا کراوەیە", "مفتوح الآن", "Open now")],
        ] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[11px] border"
            style={
              filter === key
                ? { background: "var(--gradient-gold)", color: "var(--primary-foreground)", borderColor: "transparent" }
                : { borderColor: "var(--glass-border)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Location problems */}
      {geoError && (
        <div className="rounded-2xl border p-4 text-center space-y-3" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
          <AlertTriangle className="h-5 w-5 mx-auto text-destructive" />
          <p className="text-sm text-muted-foreground">{geoError}</p>
          <button onClick={locate} className="rounded-xl px-4 py-2 text-xs font-medium" style={{ background: "var(--gradient-teal)", color: "var(--primary-foreground)" }}>
            {L("دووبارە هەوڵ بدە", "إعادة المحاولة", "Retry")}
          </button>
          <p className="text-[11px] text-muted-foreground">
            {L("یان بە ناوی شار بگەڕێ لە سەرەوە", "أو ابحث باسم المدينة أعلاه", "Or search by city name above")}
          </p>
        </div>
      )}

      {!online && (
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] text-muted-foreground" style={{ borderColor: "var(--glass-border)" }}>
          <WifiOff className="h-3.5 w-3.5" />
          {L("ئۆفلاینیت — داتای پاشەکەوتکراو پیشان دەدرێت", "غير متصل — يتم عرض البيانات المحفوظة", "Offline — showing cached data")}
        </div>
      )}

      {/* Map */}
      {center && (
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--glass-border)" }}>
          <Suspense fallback={<div className="h-64 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}>
            <MosqueMap center={center} mosques={visible} selectedId={selectedId} onSelect={setSelectedId} />
          </Suspense>
        </div>
      )}

      {center && (
        <p className="text-[11px] text-muted-foreground px-1">
          {centerLabel} · {visible.length} {L("مزگەوت", "مسجد", "mosques")}
          {fromCache ? ` · ${L("پاشەکەوتکراو", "مخزّن", "cached")}` : ""}
        </p>
      )}

      {(loading || locating) && (
        <div className="flex flex-col items-center gap-2 py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-[11px] text-muted-foreground">
            {locating ? L("دۆزینەوەی شوێنت…", "جارٍ تحديد موقعك…", "Finding your location…") : L("گەڕان بۆ مزگەوتەکان…", "جارٍ البحث عن المساجد…", "Searching mosques…")}
          </p>
        </div>
      )}

      {!loading && dataError && <p className="text-center py-6 text-sm text-destructive">{dataError}</p>}

      {!loading && !locating && !dataError && center && visible.length === 0 && (
        <p className="text-center py-8 text-sm text-muted-foreground">
          {L("هیچ مزگەوتێک نەدۆزرایەوە. بازنەکە فراوان بکە.", "لم يتم العثور على مساجد. وسّع نطاق البحث.", "No mosques found. Try a larger radius.")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 min-w-0">
        {visible.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            className="w-full text-start flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl transition-colors"
            style={{
              background: selectedId === m.id ? "color-mix(in oklch, var(--primary) 12%, var(--glass-bg))" : "var(--glass-bg)",
              borderColor: selectedId === m.id ? "var(--primary)" : "var(--glass-border)",
            }}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-teal)" }}>
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.name}</p>
              {m.address && <p className="text-[11px] text-muted-foreground truncate">{m.address}</p>}
              <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>{fmtDist(m.dist)}</span>
                {m.openNow !== null && (
                  <span className={m.openNow ? "text-emerald-400" : "text-destructive"}>
                    {m.openNow ? L("کراوەیە", "مفتوح", "Open") : L("داخراوە", "مغلق", "Closed")}
                  </span>
                )}
                {m.phone && (
                  <a href={`tel:${m.phone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-primary">
                    <Phone className="h-3 w-3" />
                    {L("پەیوەندی", "اتصال", "Call")}
                  </a>
                )}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}&travelmode=driving`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-9 px-3 rounded-full flex items-center gap-1.5 text-[11px] shrink-0"
              style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
            >
              <Navigation className="h-3.5 w-3.5" />
              {L("ڕێنمایی", "توجيه", "Go")}
            </a>
          </button>
        ))}
      </div>
    </div>
  );
}
