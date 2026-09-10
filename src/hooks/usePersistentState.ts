import { useState, useEffect } from 'react';

/**
 * A drop-in replacement for useState that persists to localStorage.
 * On first load, reads from localStorage. On every change, writes back.
 */
export function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch (e) {
      console.warn(`[usePersistentState] Failed to read "${key}" from localStorage:`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`[usePersistentState] Failed to write "${key}" to localStorage:`, e);
    }
  }, [key, state]);

  return [state, setState];
}
