// API endpoints
// In development: Vite proxy intercepts /api/* and forwards to backend (https://localhost:5165)
// In production: Frontend and backend served from same origin
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const API_ENDPOINTS = {
  LOCATIONS: `${API_BASE}/locations`,
  // Public Trail read path (docs/adr/0004). Detail: `${TRAILS}/${trailId}?playerId=`.
  TRAILS: `${API_BASE}/trails`,
  CHECKIN: `${API_BASE}/checkin`,
  LEADERBOARD: `${API_BASE}/leaderboard`,
  PLAYER_REGISTER: '/api/player/register',
  PLAYER_LOGIN: '/api/player/login',
  PLAYER_RECOVER: '/api/player/recover',
  // The curated Favorites picklists, served by the backend so the client renders
  // exactly the choices the server enforces. See docs/adr/0005.
  PLAYER_FAVORITES: '/api/player/favorites',
  PLAYER_RETRIEVE_ID: `${API_BASE}/Player/retrieveID`,
  UPDATES: `${API_BASE}/updates`,
  ADMIN_LOGIN: `${API_BASE}/admin/login`,
} as const;

// Form options — the Favorites picklists. The backend is the authoritative source
// (it enforces these on registration and serves them from /api/player/favorites);
// this copy is the fallback the client uses if that fetch fails. See docs/adr/0005.
export const FORM_OPTIONS = {
  colors: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "White", "Pink", "Grey"],
  foods: ["Pizza", "Sushi", "Pasta", "Burger", "Salad", "Steak", "Tacos", "Curry", "Ice Cream", "Chocolate"],
  animals: ["Dog", "Cat", "Bird", "Fish", "Lion", "Tiger", "Bear", "Elephant", "Wolf", "Fox"],
} as const;

// Geolocation check-in verification (docs/adr/0006). All values in metres.
// A fix passes when its haversine distance to the Stop, minus the fix's own
// accuracy margin, is within the radius (distance − accuracy ≤ radius). Fixes
// reported coarser than the accuracy gate are rejected outright before distance
// is even judged ("move into the open and try again"). The radius is a per-Stop
// overridable default; the accuracy gate is global.
export const CHECKIN_RADIUS_METRES = 20;
export const CHECKIN_ACCURACY_GATE_METRES = 30;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'itasca-theme',
  // Admin bearer token (sessionStorage). The Admin is a distinct actor; this token
  // gates every /admin/* call. See docs/adr/0003.
  ADMIN_TOKEN: 'adminToken',
} as const;

// Messages
export const MESSAGES = {
  SUCCESS: {
    CHECKED_IN: '🎉 Correct! Points added to your score.',
    CHECKED_IN_POINTS: (points: number) => `🎉 Checked in! +${points} points.`,
    ALREADY_CHECKED_IN: 'You already checked in here.',
    TRAIL_COMPLETE: '🏆 Trail complete! Nice work.',
    COPIED: 'Copied to clipboard!',
    PLAYER_FOUND: 'Player ID retrieved successfully.',
  },
  ERROR: {
    FETCH_FAILED: 'Failed to load data. Please try again.',
    INVALID_PLAYER_ID: 'Player ID not found.',
    GEOLOCATION_NOT_SUPPORTED: 'Geolocation not supported by your browser.',
    GEOLOCATION_ERROR: (msg: string) => `Location error: ${msg}`,
    WRONG_LOCATION: '❌ Not quite there. Keep exploring!',
    LOCATION_INACCURATE: '📡 Weak GPS signal. Move into the open and try again.',
    PLAYER_NOT_FOUND: 'No Player matches those favorites.',
    EMAIL_TAKEN: 'An account already exists for that email.',
    RECOVERY_NEEDS_EMAIL: 'More than one Player matches. Enter your email to find yours.',
    REQUIRED_FIELD: 'Please fill in all required fields.',
    REQUIRED_PLAYER_ID: 'Enter your Player ID first.',
  },
} as const;
