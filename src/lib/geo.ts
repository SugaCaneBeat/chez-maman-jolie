/**
 * Géolocalisation + calcul de zone de livraison
 * API: Base Adresse Nationale (BAN) — https://adresse.data.gouv.fr
 * Gratuite, sans clé, données publiques (France uniquement).
 */

/* Centre Paris 11ème (approximatif — Place de la Bastille / Voltaire) */
export const DEPART_COORDS = { lat: 48.8594, lng: 2.3765 };
export const DEPART_LABEL  = "Paris 11ème";

export interface GeocodedAddress {
  label: string;
  lat: number;
  lng: number;
}

export interface ZoneInfo {
  zone: 1 | 2 | 3 | null;
  distanceKm: number;
  fee: number;              // Frais de livraison en € (0 si gratuit)
  feeLabel: string;         // "Gratuit" | "2,50 €" | "4,50 €" | "6 €"
  outOfRange: boolean;      // true si > 10 km
}

/* Distance à vol d'oiseau entre deux coordonnées (km) */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* Géocodage via BAN — renvoie la meilleure correspondance (ou null) */
export async function geocode(query: string): Promise<GeocodedAddress | null> {
  const q = query.trim();
  if (q.length < 5) return null;
  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1&autocomplete=0`,
      { cache: "force-cache" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const f = data?.features?.[0];
    if (!f) return null;
    const [lng, lat] = f.geometry.coordinates;
    return { label: f.properties.label, lat, lng };
  } catch {
    return null;
  }
}

/* Détermine la zone + les frais applicables à partir d'une distance */
export function zoneFromDistance(distanceKm: number): ZoneInfo {
  if (distanceKm > 10) {
    return { zone: null, distanceKm, fee: 0, feeLabel: "Hors zone", outOfRange: true };
  }
  if (distanceKm < 3) {
    return { zone: 1, distanceKm, fee: 0, feeLabel: "Gratuit", outOfRange: false };
  }
  if (distanceKm < 6) {
    return { zone: 2, distanceKm, fee: 2.5, feeLabel: "2,50 €", outOfRange: false };
  }
  /* 6–10 km */
  return { zone: 3, distanceKm, fee: 4.5, feeLabel: "4,50 €", outOfRange: false };
}

/* Helper combiné : adresse → zone */
export async function resolveZone(address: string): Promise<{
  geo: GeocodedAddress;
  zoneInfo: ZoneInfo;
} | null> {
  const geo = await geocode(address);
  if (!geo) return null;
  const dist = haversineKm(DEPART_COORDS.lat, DEPART_COORDS.lng, geo.lat, geo.lng);
  return { geo, zoneInfo: zoneFromDistance(dist) };
}
