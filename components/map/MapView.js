'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Thin Leaflet wrapper. markers: [{ id, lat, lng, label, tone: 'teal'|'navy'|'yellow', active }]
// user / target: { lat, lng }. Tiles are OpenStreetMap — use a production tile provider at scale.
const TONES = { teal: '#14b8a6', navy: '#0b1f4d', yellow: '#f5b700', red: '#e5484d' };

export default function MapView({ center, zoom = 12, markers = [], user, target, line = false, height = 420, onSelect, className = '' }) {
  const el = useRef(null);
  const state = useRef({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !el.current || state.current.map) return;
      const map = L.map(el.current, { zoomControl: true, scrollWheelZoom: false }).setView([center.lat, center.lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      state.current = { map, L, layer: L.layerGroup().addTo(map) };
      draw();
    })();
    return () => { cancelled = true; state.current.map?.remove(); state.current = {}; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pin(L, color, text, active) {
    const size = active ? 40 : 34;
    return L.divIcon({
      className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 4px 12px rgba(11,31,77,.35);display:grid;place-items:center;color:#fff;font:700 12px system-ui">${text || ''}</div>`,
    });
  }

  function draw() {
    const { map, L, layer } = state.current;
    if (!map) return;
    layer.clearLayers();
    const pts = [];
    markers.forEach((m) => {
      const mk = L.marker([m.lat, m.lng], { icon: pin(L, TONES[m.tone] || TONES.teal, m.text, m.active), title: m.label });
      if (m.label) mk.bindTooltip(m.label, { direction: 'top', offset: [0, -14] });
      if (onSelect) mk.on('click', () => onSelect(m.id));
      mk.addTo(layer); pts.push([m.lat, m.lng]);
    });
    if (user) { L.marker([user.lat, user.lng], { icon: pin(L, TONES.navy, '•'), title: 'You' }).bindTooltip('You').addTo(layer); pts.push([user.lat, user.lng]); }
    if (target) { L.marker([target.lat, target.lng], { icon: pin(L, TONES.yellow, '★'), title: 'Lesson location' }).bindTooltip('Lesson location').addTo(layer); pts.push([target.lat, target.lng]); }
    if (line && user && target) L.polyline([[user.lat, user.lng], [target.lat, target.lng]], { color: TONES.teal, weight: 4, dashArray: '8 8' }).addTo(layer);
    if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
    else if (pts.length === 1) map.setView(pts[0], Math.max(map.getZoom(), 13));
    else map.setView([center.lat, center.lng], zoom);
  }

  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ },
    [JSON.stringify(markers), JSON.stringify(user), JSON.stringify(target), line, center.lat, center.lng]);

  return <div ref={el} role="region" aria-label="Map" style={{ height }} className={`z-0 w-full overflow-hidden rounded-lg bg-sky-100 ${className}`} />;
}
