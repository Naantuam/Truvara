import { useState, useEffect, useCallback, useRef } from "react";
import { getCached, setCached } from "./dataCache";

// Cache-first data fetching: if `key` is already cached this session, use it
// immediately (no loading flash, no network call). Otherwise fetch once and
// cache the result. Pages sharing the same key (e.g. Decisions + Approvals
// both list decisions) transparently share one fetch. Call `refresh()` to
// force a reload, or `setData()` after a mutation to update both the page
// and the cache together so other pages see the change without refetching.
export default function useCachedResource(key, fetcher) {
  const cached = getCached(key);
  const [data, setDataState] = useState(cached);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setDataState(result);
      setCached(key, result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (getCached(key) === undefined) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setData = useCallback(
    (updater) => {
      setDataState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        setCached(key, next);
        return next;
      });
    },
    [key]
  );

  return { data, setData, loading, error, refresh: load };
}
