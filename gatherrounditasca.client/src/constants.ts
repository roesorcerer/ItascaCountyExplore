// API endpoints
// In development: Vite proxy intercepts /api/* and forwards to backend (https://localhost:5165)
// In production: Frontend and backend served from same origin
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const API_ENDPOINTS = {
  LOCATIONS: `${API_BASE}/locations`,
  LEADERBOARD: `${API_BASE}/leaderboard`,
  PLAYER_REGISTER: '/api/player/register',
  PLAYER_RETRIEVE: '/api/player/retrieve',
  PLAYER_RETRIEVE_ID: `${API_BASE}/Player/retrieveID`,
  UPDATES: `${API_BASE}/updates`,
} as const;

// Form options
export const FORM_OPTIONS = {
  colors: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "White", "Pink", "Grey"],
  foods: ["Pizza", "Sushi", "Pasta", "Burger", "Salad", "Steak", "Tacos", "Curry", "Ice Cream", "Chocolate"],
  animals: ["Dog", "Cat", "Bird", "Fish", "Lion", "Tiger", "Bear", "Elephant", "Wolf", "Fox"],
} as const;

// Geolocation
export const GEO_PROXIMITY_THRESHOLD = 0.01;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'itasca-theme',
} as const;

// Messages
export const MESSAGES = {
  SUCCESS: {
    CHECKED_IN: '🎉 Correct! Points added to your score.',
    COPIED: 'Copied to clipboard!',
    PLAYER_FOUND: 'Player ID retrieved successfully.',
  },
  ERROR: {
    FETCH_FAILED: 'Failed to load data. Please try again.',
    INVALID_PLAYER_ID: 'Player ID not found.',
    GEOLOCATION_NOT_SUPPORTED: 'Geolocation not supported by your browser.',
    GEOLOCATION_ERROR: (msg: string) => `Location error: ${msg}`,
    WRONG_LOCATION: '❌ Not quite there. Keep exploring!',
    PLAYER_NOT_FOUND: 'Could not find a player with that email.',
    REQUIRED_FIELD: 'Please fill in all required fields.',
    REQUIRED_PLAYER_ID: 'Enter your Player ID first.',
  },
} as const;
