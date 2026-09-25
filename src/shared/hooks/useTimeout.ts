// import { useEffect } from "react";

// export function useTimeout(callback: () => void, delay: number, deps: unknown[] = []) {
//   useEffect(() => {
//     const timer = setTimeout(callback, delay);
//     return () => clearTimeout(timer);
//   }, deps);
// }

import { useEffect, useRef } from "react";

export function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const timer = setTimeout(() => callbackRef.current(), delay);
    return () => clearTimeout(timer);
  }, [delay]);
}
