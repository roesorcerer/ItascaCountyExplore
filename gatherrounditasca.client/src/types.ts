export type Theme = 'light' | 'dark';

// Trail / Stop / Check-in model — see docs/adr/0004. A Trail is the curated
// wrapper; its Stops live separately and are revealed one at a time as the Player
// checks in.
export interface Trail {
  id: string;
  name: string;
  description: string;
  region: string;
  coverImage: string;
  stopCount: number;
}

export interface Stop {
  id: string;
  trailId: string;
  order: number;
  points: number;
  title: string;
  riddle: string;
  coordinates: string;
  // Per-Stop check-in radius in metres (docs/adr/0006). Null/absent falls back to
  // CHECKIN_RADIUS_METRES.
  radius?: number | null;
  image?: string | null;
}

export interface CompletedStop {
  id: string;
  order: number;
  title: string;
}

// A Trail as seen by one Player: progress plus the single revealed current Stop.
export interface TrailDetail {
  id: string;
  name: string;
  description: string;
  region: string;
  coverImage: string;
  completed: number;
  total: number;
  trailComplete: boolean;
  currentStop: Stop | null;
  completedStops: CompletedStop[];
}

// Result of POST /api/checkin.
export interface CheckinResult {
  awarded: number;
  totalPoints: number;
  completed: number;
  total: number;
  trailComplete: boolean;
  nextStop: Stop | null;
}

export interface LeaderboardEntry {
  playerId: string;
  rank: number;
  points: number;
}

export interface PlayerData {
  playerId: string;
  email: string;
  favoriteColor: string;
  favoriteFood: string;
  favoriteAnimal: string;
}

export interface Update {
  updateNumber: number;
  date: string;
  locationUpdate: string;
  leaderboardUpdate: string;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  // Reported accuracy of the fix in metres (68% confidence radius per the
  // Geolocation spec). Used by the check-in accuracy gate — see docs/adr/0006.
  accuracy: number;
}
