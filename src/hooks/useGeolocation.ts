import { useState, useCallback } from 'react';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface UseGeolocationResult {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
  locate: () => void;
  clear: () => void;
}

/**
 * Hook for browser geolocation. Returns { position, error, loading, locate, clear }.
 * Handles permission denied and unavailable errors gracefully.
 */
export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError('geolocation_unavailable');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('permission_denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('position_unavailable');
        } else {
          setError('timeout');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, []);

  const clear = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  return { position, error, loading, locate, clear };
}
