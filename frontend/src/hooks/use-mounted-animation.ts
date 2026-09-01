import { useEffect, useState } from 'react';

export function useMountedAnimation(delayMs = 80, deps: unknown[] = []): boolean {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setAnimate(true), delayMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return animate;
}
