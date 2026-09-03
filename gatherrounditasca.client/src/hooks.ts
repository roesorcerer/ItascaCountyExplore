import { useState, useEffect, useCallback } from 'react';
import { Theme } from './types';
import { STORAGE_KEYS, FORM_OPTIONS, API_ENDPOINTS } from './constants';

// Theme hook (already exists but improved)
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggle };
}

// Generic fetch hook
interface UseFetchOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useFetch<T>(
  url: string,
  options?: UseFetchOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options?.onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, loading, error };
}

// Favorites picklist hook. The backend is the authoritative source of the curated
// colour/food/animal lists (it enforces them on registration); the client fetches
// them so the dropdowns always match what the server will accept. Falls back to the
// bundled FORM_OPTIONS if the fetch fails, so the form still works offline. See
// docs/adr/0005.
interface FavoritesCatalog {
  colors: readonly string[];
  foods: readonly string[];
  animals: readonly string[];
}

export function useFavorites(): FavoritesCatalog {
  const [catalog, setCatalog] = useState<FavoritesCatalog>(() => ({
    colors: FORM_OPTIONS.colors,
    foods: FORM_OPTIONS.foods,
    animals: FORM_OPTIONS.animals,
  }));

  useEffect(() => {
    let cancelled = false;
    fetch(API_ENDPOINTS.PLAYER_FAVORITES)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.colors) && Array.isArray(data?.foods) && Array.isArray(data?.animals)) {
          setCatalog({ colors: data.colors, foods: data.foods, animals: data.animals });
        }
      })
      .catch(() => {
        // Keep the bundled fallback already in state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return catalog;
}

// Geolocation hook
interface GeolocationResult {
  latitude: number;
  longitude: number;
  // Reported accuracy of the fix, in metres. Consumed by the check-in accuracy
  // gate (docs/adr/0006); previously discarded.
  accuracy: number;
}

interface UseGeolocationOptions {
  onSuccess?: (coords: GeolocationResult) => void;
  onError?: (error: string) => void;
}

export function useGeolocation(options?: UseGeolocationOptions) {
  const [coords, setCoords] = useState<GeolocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const err = 'Geolocation not supported';
      setError(err);
      options?.onError?.(err);
      return null;
    }

    setLoading(true);
    return new Promise<GeolocationResult | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result: GeolocationResult = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoords(result);
          setError(null);
          options?.onSuccess?.(result);
          setLoading(false);
          resolve(result);
        },
        (err) => {
          const errorMsg = err.message || 'Failed to get location';
          setError(errorMsg);
          options?.onError?.(errorMsg);
          setLoading(false);
          resolve(null);
        },
        // Ask for the GPS-grade fix the check-in accuracy gate expects rather than
        // a coarse cached one. See docs/adr/0006.
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, [options]);

  return { coords, loading, error, getLocation };
}

// Modal hook
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(s => !s), []);

  return { isOpen, open, close, toggle };
}
