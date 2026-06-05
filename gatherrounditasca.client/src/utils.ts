import { FORM_OPTIONS, GEO_PROXIMITY_THRESHOLD } from './constants';
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

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = Math.abs(lat1 - lat2);
  const dLon = Math.abs(lon1 - lon2);
  // Simple bounding box distance for quick proximity check
  return Math.max(dLat, dLon);
}

export function isWithinProximity(
  userCoords: GeolocationCoordinates,
  targetCoords: string
): boolean {
  const [targetLat, targetLon] = targetCoords.split(', ').map(Number);
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    targetLat,
    targetLon
  );
  return distance <= GEO_PROXIMITY_THRESHOLD;
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
