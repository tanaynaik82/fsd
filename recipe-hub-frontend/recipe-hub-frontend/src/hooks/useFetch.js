import { useState, useEffect, useCallback } from 'react';
import { api, errorMessage } from '../api/client';

// GET a path whenever it changes. Pass null to skip fetching.
export default function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(path)
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, refetch };
}
