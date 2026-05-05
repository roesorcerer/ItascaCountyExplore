import { useState, useEffect, useCallback } from 'react';
import { Theme } from './types';
import { STORAGE_KEYS } from './constants';

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

// Geolocation hook
interface GeolocationResult {
  latitude: number;
  longitude: number;
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
        }
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
