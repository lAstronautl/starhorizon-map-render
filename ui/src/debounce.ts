import { useEffect, useMemo, useRef } from 'preact/hooks';

export interface UseDebouncedHook {
  (fn: () => void): () => void;
  <T>(fn: (arg: T) => void): (arg: T) => void;
}

const useDebounced: UseDebouncedHook = <T = never>(
  fn: (arg?: T) => void,
  time = 300
): ((arg?: T) => void) => {
  const lastFn = useRef(fn);
  lastFn.current = fn;

  const timeoutRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return useMemo(() => {
    let nextArg: T | undefined;
    let finishTime = 0;

    const advance = () => {
      const remaining = finishTime - performance.now();
      if (remaining <= 0) {
        timeoutRef.current = null;
        lastFn.current(nextArg);
      } else {
        timeoutRef.current = setTimeout(advance, remaining);
      }
    };

    return (arg?: T) => {
      nextArg = arg;
      finishTime = performance.now() + time;
      if (timeoutRef.current == null) {
        timeoutRef.current = setTimeout(advance, time);
      }
    };
  }, []);
}

export default useDebounced;
