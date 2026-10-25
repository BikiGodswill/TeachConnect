// Location helpers shared by the nearby map, instant requests and live arrival.

// City-centre fallback when the browser cannot (or may not) share a precise location.
export const CITIES = [
  { name: 'Douala', lat: 4.0511, lng: 9.7679 }, { name: 'Yaoundé', lat: 3.848, lng: 11.5021 },
  { name: 'Buea', lat: 4.1527, lng: 9.2415 }, { name: 'Limbe', lat: 4.0186, lng: 9.2145 },
  { name: 'Bamenda', lat: 5.9631, lng: 10.1591 }, { name: 'Bafoussam', lat: 5.4737, lng: 10.4179 },
  { name: 'Kribi', lat: 2.9373, lng: 9.9073 }, { name: 'Garoua', lat: 9.3265, lng: 13.3977 },
  { name: 'Maroua', lat: 10.591, lng: 14.3159 }, { name: 'Ngaoundéré', lat: 7.3277, lng: 13.5847 },
  { name: 'Bertoua', lat: 4.5772, lng: 13.6846 }, { name: 'Ebolowa', lat: 2.9, lng: 11.15 },
];

export function distanceKm(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// A rough estimate only (city traffic, ~20 km/h). The UI always says "about".
export function etaMinutes(km) {
  if (km == null || Number.isNaN(km)) return null;
  return Math.max(1, Math.round((km / 20) * 60));
}

export const GEO_MESSAGES = {
  1: 'Location permission was denied. Choose your city instead, or allow location in your browser settings.',
  2: 'We could not work out where you are. Choose your city instead.',
  3: 'Finding your location took too long. Try again or choose your city.',
};

export function getPosition(opts = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(Object.assign(new Error('unsupported'), { code: 2, friendly: 'Your browser cannot share location. Choose your city instead.' }));
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) => reject(Object.assign(e, { friendly: GEO_MESSAGES[e.code] || GEO_MESSAGES[2] })),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000, ...opts }
    );
  });
}
