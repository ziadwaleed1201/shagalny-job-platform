import { useEffect, useRef, useState } from 'react';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

// Load Leaflet from CDN once (no npm install needed).
function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);

    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    let script = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (script) {
      if (window.L) return resolve(window.L);
      script.addEventListener('load', () => resolve(window.L));
      script.addEventListener('error', reject);
      return;
    }

    script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Click the map to drop / move a pin. Calls onPick(lat, lng).
export default function LocationPicker({ lat, lng, onPick, height = 260 }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(
    lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current || mapObj.current) return;

        // Make sure the default marker icons load from the CDN too.
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const start = coords || { lat: 30.0444, lng: 31.2357 }; // Cairo
        const map = L.map(mapRef.current).setView([start.lat, start.lng], coords ? 15 : 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        if (coords) markerRef.current = L.marker([coords.lat, coords.lng]).addTo(map);

        map.on('click', (e) => place(L, map, e.latlng.lat, e.latlng.lng));

        mapObj.current = map;
        setTimeout(() => map.invalidateSize(), 200);
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function place(L, map, la, ln) {
    if (markerRef.current) markerRef.current.setLatLng([la, ln]);
    else markerRef.current = L.marker([la, ln]).addTo(map);
    setCoords({ lat: la, lng: ln });
    onPick?.(la, ln);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const la = pos.coords.latitude;
      const ln = pos.coords.longitude;
      const L = window.L;
      const map = mapObj.current;
      if (L && map) { map.setView([la, ln], 15); place(L, map, la, ln); }
    });
  }

  if (failed) {
    return (
      <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 text-sm text-navy-500">
        Map could not load. Check your internet connection and try again.
      </div>
    );
  }

  return (
    <div>
      <div ref={mapRef} style={{ height }} className="rounded-xl overflow-hidden border border-navy-100 bg-navy-50" />
      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
        <p className="text-xs text-navy-500">
          {coords
            ? `📍 Pinned: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
            : 'Click the map to drop a pin on the job location.'}
        </p>
        <button type="button" onClick={useMyLocation} className="btn-outline text-xs">
          Use my current location
        </button>
      </div>
    </div>
  );
}
