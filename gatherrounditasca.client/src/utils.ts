import { FORM_OPTIONS, GEO_PROXIMITY_THRESHOLD } from './constants';
import { GeolocationCoordinates } from './types';

export function generatePlayerId(
  color: string,
  food: string,
  animal: string
): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${color[0]}${food[0]}${animal[0]}${random}`.toUpperCase();
}

export function getPlayerIdPreview(
  color: string,
  food: string,
  animal: string
): string {
  if (!color || !food || !animal) return '??????';
  return generatePlayerId(color, food, animal);
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
