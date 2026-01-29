import { useEffect, useState } from "react";
import { fetchServerTime } from "../lib/api";

// Returns ms offset such that: serverNow ~= Date.now() + offsetMs
export function useServerTimeOffset() {
  const [offsetMs, setOffsetMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        setLoading(true);
        setError(null);

        const t0 = Date.now();
        const { serverTime } = await fetchServerTime();
        const t1 = Date.now();

        // server time at midpoint of request (appx)
        const serverMs = new Date(serverTime).getTime();
        const clientMid = (t0 + t1) / 2;
        const nextOffset = serverMs - clientMid;

        if (!cancelled) setOffsetMs(nextOffset);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    sync();
    const id = setInterval(sync, 30_000); // resync every 30s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { offsetMs, loading, error };
}
