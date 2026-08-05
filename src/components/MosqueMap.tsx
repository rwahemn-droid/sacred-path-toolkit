import { useEffect, useRef } from "react";
import type * as L from "leaflet";
import type { Mosque, LatLon } from "@/lib/mosques";

type Props = {
  center: LatLon;
  mosques: Mosque[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** Interactive OpenStreetMap view. Leaflet is imported lazily so it never runs on the server. */
export function MosqueMap({ center, mosques, selectedId, onSelect }: Props) {
  const holder = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const leafletRef = useRef<typeof L | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await import("leaflet/dist/leaflet.css");
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !holder.current || mapRef.current) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(holder.current, { zoomControl: true, attributionControl: false });
      map.setView([center.lat, center.lon], 13);
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 })
        .addTo(map);
      layerRef.current = leaflet.layerGroup().addTo(map);
      mapRef.current = map;
      // Force a resize pass once the container has its final size.
      setTimeout(() => map.invalidateSize(), 60);
      renderMarkers();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMarkers = () => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!leaflet || !map || !layer) return;
    layer.clearLayers();
    markersRef.current = {};

    const userIcon = leaflet.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.35)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    leaflet.marker([center.lat, center.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(layer);

    for (const m of mosques) {
      const icon = leaflet.divIcon({
        className: "",
        html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 4px;transform:rotate(45deg);display:grid;place-items:center;background:linear-gradient(135deg,#0d9488,#14b8a6);border:2px solid rgba(255,255,255,.85)"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });
      const marker = leaflet
        .marker([m.lat, m.lon], { icon, title: m.name })
        .addTo(layer)
        .bindPopup(
          `<strong>${escapeHtml(m.name)}</strong><br/>${escapeHtml(
            m.address || `${m.dist.toFixed(1)} km`,
          )}`,
        );
      marker.on("click", () => onSelectRef.current(m.id));
      markersRef.current[m.id] = marker;
    }
  };

  // Re-render markers when the data changes.
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosques, center.lat, center.lon]);

  // Recenter when the user's position changes.
  useEffect(() => {
    mapRef.current?.setView([center.lat, center.lon], mapRef.current.getZoom());
  }, [center.lat, center.lon]);

  // Focus the selected mosque.
  useEffect(() => {
    if (!selectedId) return;
    const marker = markersRef.current[selectedId];
    const map = mapRef.current;
    if (!marker || !map) return;
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15), { animate: true });
    marker.openPopup();
  }, [selectedId]);

  return <div ref={holder} className="w-full h-64" style={{ background: "var(--muted)" }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

export default MosqueMap;
