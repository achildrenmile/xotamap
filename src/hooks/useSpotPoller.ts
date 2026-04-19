/**
 * T26 — Spot Poller (Auto-Refresh)
 *
 * Polls the Spothole API every 60 seconds and returns spots with refresh state.
 * Pauses automatically when the tab is hidden or the browser is offline.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSpots, canRequest } from '../services/spothole';
import type { Spot, SpotFilters } from '../types/spot';

const POLL_INTERVAL_MS = 60_000;

export interface UseSpotPollerResult {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  secondsUntilRefresh: number;
  refresh: () => void;
}

/**
 * Polls Spothole API every 60 seconds.
 *
 * - Pauses when the browser tab is hidden (Page Visibility API)
 * - Pauses when the browser is offline (navigator.onLine)
 * - Manual `refresh()` call bypasses countdown and fetches immediately
 * - Returns countdown in seconds until next automatic refresh
 */
export function useSpotPoller(filters?: SpotFilters): UseSpotPollerResult {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(POLL_INTERVAL_MS / 1000);

  // Ref to hold the next scheduled fetch time (Unix ms)
  const nextFetchAt = useRef<number>(Date.now());
  // Ref to prevent double-fetching when refresh() is called during a flight
  const isFetching = useRef(false);
  // Keep stable reference to filters to avoid spurious re-subscriptions
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const doFetch = useCallback(async () => {
    if (isFetching.current) return;
    if (!navigator.onLine) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchSpots(filtersRef.current);
      setSpots(result);
      setLastUpdate(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      isFetching.current = false;
      setLoading(false);
      // Schedule next automatic fetch
      nextFetchAt.current = Date.now() + POLL_INTERVAL_MS;
    }
  }, []);

  // Manual refresh: reset countdown and fetch immediately (respects rate limit)
  const refresh = useCallback(() => {
    if (!canRequest()) return; // don't hammer the API
    nextFetchAt.current = Date.now(); // trigger immediately on next tick
  }, []);

  // Main polling loop — ticks every second to update countdown and fire fetches
  useEffect(() => {
    let animFrameId: number;

    const tick = () => {
      const hidden = document.visibilityState === 'hidden';
      const offline = !navigator.onLine;

      if (!hidden && !offline) {
        const remaining = Math.max(0, nextFetchAt.current - Date.now());
        setSecondsUntilRefresh(Math.ceil(remaining / 1000));

        if (remaining === 0 && !isFetching.current) {
          // Push next fetch time forward immediately to avoid re-entrancy
          nextFetchAt.current = Date.now() + POLL_INTERVAL_MS;
          void doFetch();
        }
      }

      // Schedule next tick in ~1 second
      animFrameId = window.setTimeout(tick, 1000);
    };

    // Initial fetch on mount
    void doFetch();

    animFrameId = window.setTimeout(tick, 1000);
    return () => window.clearTimeout(animFrameId);
  }, [doFetch]);

  // When tab becomes visible again, check if we're overdue
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // If overdue, fetch right away
        if (Date.now() >= nextFetchAt.current && !isFetching.current) {
          nextFetchAt.current = Date.now() + POLL_INTERVAL_MS;
          void doFetch();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [doFetch]);

  // When coming back online, fetch immediately if overdue
  useEffect(() => {
    const handleOnline = () => {
      if (Date.now() >= nextFetchAt.current && !isFetching.current) {
        nextFetchAt.current = Date.now() + POLL_INTERVAL_MS;
        void doFetch();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [doFetch]);

  return { spots, loading, error, lastUpdate, secondsUntilRefresh, refresh };
}
