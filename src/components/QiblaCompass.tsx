import { useEffect, useRef, useState } from "react";
import { Compass, X } from "lucide-react";
import type { Dict } from "@/lib/i18n";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function qiblaBearing(lat: number, lon: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LON - lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distanceKm(lat: number, lon: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(KAABA_LAT - lat);
  const dLon = toRad(KAABA_LON - lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

type Props = {
  lat: number;
  lon: number;
  cityName: string;
  t: Dict;
  onClose: () => void;
};

export function QiblaCompass({ lat, lon, cityName, t, onClose }: Props) {
  const bearing = qiblaBearing(lat, lon);
  const dist = distanceKm(lat, lon);
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const start = () => {
    type DOE = DeviceOrientationEvent & { webkitCompassHeading?: number };
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as DOE;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") {
        h = ev.webkitCompassHeading;
      } else if (ev.alpha !== null) {
        h = 360 - ev.alpha;
      }
      if (h !== null) setHeading(((h % 360) + 360) % 360);
    };
    window.addEventListener("deviceorientationabsolute" as never, handler as never, true);
    window.addEventListener("deviceorientation", handler, true);
    cleanupRef.current = () => {
      window.removeEventListener("deviceorientationabsolute" as never, handler as never, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  };

  useEffect(() => {
    type DOECtor = { requestPermission?: () => Promise<"granted" | "denied"> };
    const Ctor = (typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : null) as unknown as DOECtor | null;
    if (Ctor && typeof Ctor.requestPermission === "function") {
      setNeedsPermission(true);
    } else {
      start();
    }
    return () => cleanupRef.current?.();
  }, []);

  const requestPermission = async () => {
    type DOECtor = { requestPermission?: () => Promise<"granted" | "denied"> };
    const Ctor = DeviceOrientationEvent as unknown as DOECtor;
    try {
      const res = await Ctor.requestPermission?.();
      if (res === "granted") {
        setNeedsPermission(false);
        start();
      }
    } catch {
      /* ignore */
    }
  };

  // Rotate compass so North is up; needle should point toward Qibla relative to current heading.
  const needleRot = heading !== null ? bearing - heading : bearing;
  const aligned = heading !== null && Math.abs(((needleRot + 540) % 360) - 180) < 5;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="w-full max-w-sm rounded-3xl border backdrop-blur-xl p-5"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t.prayer.qiblaTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mx-auto" style={{ width: 260, height: 260 }}>
          {/* Compass dial — rotates with device heading so N always points to magnetic north */}
          <div
            className="absolute inset-0 rounded-full border-2 transition-transform duration-150"
            style={{
              borderColor: "var(--glass-border)",
              background: "radial-gradient(circle at center, color-mix(in oklch, var(--primary) 8%, transparent), transparent 70%)",
              transform: `rotate(${heading !== null ? -heading : 0}deg)`,
            }}
          >
            {/* Cardinal marks */}
            {[
              { label: "N", deg: 0, color: "var(--primary)" },
              { label: "E", deg: 90 },
              { label: "S", deg: 180 },
              { label: "W", deg: 270 },
            ].map((c) => (
              <div
                key={c.label}
                className="absolute left-1/2 top-1/2 text-xs font-bold"
                style={{
                  transform: `translate(-50%, -50%) rotate(${c.deg}deg) translateY(-110px) rotate(${-c.deg}deg)`,
                  color: c.color ?? "var(--muted-foreground)",
                }}
              >
                {c.label}
              </div>
            ))}
            {/* Tick marks */}
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 2,
                  height: i % 9 === 0 ? 12 : 6,
                  background: i % 9 === 0 ? "var(--primary)" : "color-mix(in oklch, var(--foreground) 40%, transparent)",
                  transform: `translate(-50%, -50%) rotate(${i * 10}deg) translateY(-120px)`,
                }}
              />
            ))}
            {/* Kaaba marker (gold diamond at bearing) */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) rotate(${bearing}deg) translateY(-110px) rotate(45deg)`,
                width: 18,
                height: 18,
                background: aligned ? "oklch(0.78 0.18 145)" : "var(--gradient-gold)",
                boxShadow: aligned ? "0 0 16px oklch(0.78 0.18 145 / 0.7)" : "var(--shadow-glow)",
                borderRadius: 3,
              }}
            />
          </div>

          {/* Static needle pointing up = "you face this way" */}
          <div
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{ transform: "translate(-50%, -100%)", width: 4, height: 110, background: "linear-gradient(to bottom, var(--primary), transparent)" }}
          />
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ transform: "translate(-50%, -50%)", width: 14, height: 14, background: "var(--primary)" }}
          />
        </div>

        <div className="mt-4 text-center space-y-1">
          {needsPermission ? (
            <button
              onClick={requestPermission}
              className="rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
            >
              {t.prayer.qiblaPermission}
            </button>
          ) : (
            <p className={`text-sm font-medium ${aligned ? "text-emerald-400" : "text-muted-foreground"}`}>
              {heading === null ? t.prayer.qiblaHint : aligned ? t.prayer.qiblaAligned : t.prayer.qiblaOff}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            {cityName} → {Math.round(bearing)}° · {dist.toLocaleString()} km
          </p>
        </div>
      </div>
    </div>
  );
}
