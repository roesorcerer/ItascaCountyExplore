export type Theme = 'light' | 'dark';

export interface Location {
  id: string;
  date: string;
  location: string;
  image: string;
  url: string;
  title: string;
  description: string;
  coordinates: string;
  riddle: string;
}

export interface LeaderboardEntry {
  playerId: string;
  ranking: number;
  locationsVisited: number;
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
}
