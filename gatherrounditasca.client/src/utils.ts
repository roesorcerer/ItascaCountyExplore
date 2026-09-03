import {
  FORM_OPTIONS,
  CHECKIN_RADIUS_METRES,
  CHECKIN_ACCURACY_GATE_METRES,
} from './constants';
import { GeolocationCoordinates } from './types';

// The PlayerId itself is minted by the server from the Favorites (and may carry a
// numeric suffix on collision). This builds the unsuffixed *preview* the player
// sees while choosing — the PascalCase concatenation, matching the server's base.
function pascalize(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join('');
}

export function previewPlayerId(
  color: string,
  food: string,
  animal: string
): string {
  if (!color || !food || !animal) return '??????';
  return pascalize(color) + pascalize(food) + pascalize(animal);
}

const EARTH_RADIUS_METRES = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Great-circle (haversine) distance in metres between two lat/lon points. Replaces
// the old degrees/Chebyshev bounding-box check — see docs/adr/0006.
export function haversineMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.min(1, Math.sqrt(a)));
}

// The outcome of judging a geolocation fix against a Stop (docs/adr/0006):
// 'inaccurate' — the fix is too coarse to trust, reject before judging distance;
// 'too_far'    — a trustworthy fix that is genuinely outside the radius;
// ok           — passes (distance − accuracy ≤ radius).
export type CheckinCheck =
  | { ok: true; distance: number }
  | { ok: false; reason: 'inaccurate'; accuracy: number }
  | { ok: false; reason: 'too_far'; distance: number };

// Verify a Player's fix against a Stop's "lat, lon" coordinates. `radiusMetres`
// is the per-Stop override; it falls back to the global default when omitted.
export function verifyCheckinLocation(
  userCoords: GeolocationCoordinates,
  targetCoords: string,
  radiusMetres: number = CHECKIN_RADIUS_METRES,
  accuracyGateMetres: number = CHECKIN_ACCURACY_GATE_METRES
): CheckinCheck {
  // (B) Reject a fix too coarse to trust, before its accuracy margin could carry
  // an unbounded junk position past the lenient distance test below.
  if (userCoords.accuracy > accuracyGateMetres) {
    return { ok: false, reason: 'inaccurate', accuracy: userCoords.accuracy };
  }

  const [targetLat, targetLon] = targetCoords.split(',').map((v) => Number(v.trim()));
  const distance = haversineMetres(
    userCoords.latitude,
    userCoords.longitude,
    targetLat,
    targetLon
  );

  // (C) Judge distance leniently against the remaining accuracy margin.
  if (distance - userCoords.accuracy <= radiusMetres) {
    return { ok: true, distance };
  }
  return { ok: false, reason: 'too_far', distance };
}

export function parseMarkdown(str: string): string {
  return str.replace(/\\n/g, '\n');
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function getFormOptions() {
  return {
    colors: FORM_OPTIONS.colors,
    foods: FORM_OPTIONS.foods,
    animals: FORM_OPTIONS.animals,
  };
}
