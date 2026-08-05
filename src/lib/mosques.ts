// Real mosque data from OpenStreetMap (Overpass API) + Nominatim geocoding.
// No mock data is ever produced here.

export type Mosque = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  dist: number; // km from the user
  openNow: boolean | null; // null = unknown
  openingHours: string | null;
  phone: string | null;
};

export type LatLon = { lat: number; lon: number };

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

const CACHE_KEY = "ibadah:mosques:cache:v1";

export function haversine(a: LatLon, b: LatLon) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Minimal, safe subset of the OSM `opening_hours` syntax. Returns null when unknown. */
export function isOpenNow(spec: string | null | undefined, now = new Date()): boolean | null {
  if (!spec) return null;
  const s = spec.trim().toLowerCase();
  if (s === "24/7") return true;
  const DAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];
  const today = DAYS[now.getDay()]!;
  const mins = now.getHours() * 60 + now.getMinutes();
  let matchedAnyRule = false;

  for (const rule of s.split(";")) {
    const r = rule.trim();
    if (!r || r.includes("off")) continue;
    const timeMatches = [...r.matchAll(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g)];
    if (timeMatches.length === 0) continue;
    const dayPart = r.slice(0, r.indexOf(timeMatches[0]![0])).trim();
    let dayOk = dayPart === "";
    if (!dayOk) {
      for (const token of dayPart.split(",")) {
        const t = token.trim();
        const range = t.match(/^([a-z]{2})\s*-\s*([a-z]{2})$/);
        if (range) {
          const from = DAYS.indexOf(range[1]!);
          const to = DAYS.indexOf(range[2]!);
          if (from < 0 || to < 0) continue;
          const idx = DAYS.indexOf(today);
          const span = (to - from + 7) % 7;
          const off = (idx - from + 7) % 7;
          if (off <= span) dayOk = true;
        } else if (t === today) {
          dayOk = true;
        }
      }
    }
    if (!dayOk) continue;
    matchedAnyRule = true;
    for (const m of timeMatches) {
      const start = Number(m[1]) * 60 + Number(m[2]);
      let end = Number(m[3]) * 60 + Number(m[4]);
      if (end <= start) end += 24 * 60; // crosses midnight
      if (mins >= start && mins <= end) return true;
      if (mins + 24 * 60 >= start && mins + 24 * 60 <= end) return true;
    }
  }
  return matchedAnyRule ? false : null;
}

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function buildAddress(tags: Record<string, string>) {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"] ?? tags["addr:neighbourhood"],
    tags["addr:city"] ?? tags["addr:town"] ?? tags["addr:village"],
  ].filter(Boolean);
  return parts.join("، ");
}

async function overpass(query: string, signal?: AbortSignal): Promise<OsmElement[]> {
  let lastErr: unknown = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal,
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const json = (await res.json()) as { elements?: OsmElement[] };
      return json.elements ?? [];
    } catch (e) {
      if (signal?.aborted) throw e;
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Overpass unreachable");
}

/** Fetch every mosque within `radiusKm` of `center`, sorted by distance. */
export async function fetchMosques(
  center: LatLon,
  radiusKm: number,
  fallbackName: string,
  signal?: AbortSignal,
): Promise<Mosque[]> {
  const r = Math.round(radiusKm * 1000);
const around = `(around:${r},${center.lat},${center.lon})`;

const q = `
[out:json][timeout:45];
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"]${around};
  nwr["building"="mosque"]${around};
);
out center tags;
`;

const elements = await overpass(q, signal);  const seen = new Set<string>();

console.log("Mosques found:", elements.length);
  const list: Mosque[] = [];

  for (const e of elements) {
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    if (lat == null || lon == null) continue;
    const tags = e.tags ?? {};
    const name =
      tags["name"] ||
      tags["name:ckb"] ||
      tags["name:ar"] ||
      tags["name:en"] ||
      tags["official_name"] ||
      fallbackName;
    // De-duplicate: same name at (almost) the same spot, or same coordinates.
    const key = `${name.toLowerCase()}@${lat.toFixed(3)},${lon.toFixed(3)}`;
    const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (seen.has(key) || seen.has(coordKey)) continue;
    seen.add(key);
    seen.add(coordKey);
    const hours = tags["opening_hours"] ?? null;
    list.push({
      id: `${e.type}/${e.id}`,
      name,
      address: buildAddress(tags),
      lat,
      lon,
      dist: haversine(center, { lat, lon }),
      openNow: isOpenNow(hours),
      openingHours: hours,
      phone: tags["phone"] ?? tags["contact:phone"] ?? null,
    });
  }

  return list.sort((a, b) => a.dist - b.dist);
}

export type GeoPlace = { name: string; lat: number; lon: number };

/** Geocode a free-text place (city, district, address) via Nominatim. */
export async function geocode(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const json = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return json.map((p) => ({ name: p.display_name, lat: Number(p.lat), lon: Number(p.lon) }));
}

type CacheShape = { center: LatLon; radiusKm: number; at: number; items: Mosque[] };

export function saveCache(center: LatLon, radiusKm: number, items: Mosque[]) {
  try {
    const payload: CacheShape = { center, radiusKm, at: Date.now(), items: items.slice(0, 120) };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* storage full or unavailable */
  }
}

export function loadCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}
