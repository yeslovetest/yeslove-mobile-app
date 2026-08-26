import { useEffect, useState } from "react";

/**
 * Returns false for the first `ms` milliseconds after mount, then true.
 *
 * Lists whose Redux slice has no loading flag start empty on a cold load. Showing
 * an "empty" message immediately would flash before the fetch resolves, so callers
 * treat the pre-settle window as "still loading" and only show the empty message
 * once this returns true.
 */
export function useSettleAfter(ms = 600): boolean {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), ms);
    return () => clearTimeout(timer);
  }, [ms]);

  return settled;
}
