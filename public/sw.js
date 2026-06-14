// IbadahPro service worker — offline caching.
const VERSION = "v3";
const STATIC_CACHE = `ibadah-static-${VERSION}`;
const API_CACHE = `ibadah-api-${VERSION}`;
const AUDIO_CACHE = `ibadah-audio-${VERSION}`;

const API_HOSTS = [
  "api.alquran.cloud",
  "api.quran.com",
  "api.aladhan.com",
];
const AUDIO_HOSTS = [
  "verses.quran.com",
  "cdn.islamic.network",
  "everyayah.com",
  "www.everyayah.com",
  "download.quranicaudio.com",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, API_CACHE, AUDIO_CACHE].includes(k))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Audio: cache-first, long-lived.
  if (AUDIO_HOSTS.some((h) => url.hostname.endsWith(h))) {
    event.respondWith(cacheFirst(req, AUDIO_CACHE));
    return;
  }

  // API JSON: stale-while-revalidate.
  if (API_HOSTS.some((h) => url.hostname.endsWith(h))) {
    event.respondWith(staleWhileRevalidate(req, API_CACHE));
    return;
  }

  // App shell (same origin, navigations): network-first w/ fallback.
  if (url.origin === self.location.origin) {
    if (req.mode === "navigate") {
      event.respondWith(networkFirst(req, STATIC_CACHE));
      return;
    }
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return hit || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await network) || Response.error();
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req);
    return hit || Response.error();
  }
}

// Allow page to ask SW to pre-cache a surah's audio files.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "prefetch-audio" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(AUDIO_CACHE);
      await Promise.all(
        data.urls.map(async (u) => {
          try {
            const hit = await cache.match(u);
            if (hit) return;
            const res = await fetch(u);
            if (res && res.ok) await cache.put(u, res.clone());
          } catch { /* ignore */ }
        }),
      );
      if (event.source && "postMessage" in event.source) {
        event.source.postMessage({ type: "prefetch-done", id: data.id });
      }
    })(),
  );
});
