"use client";

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "ev-garage-compare";
export const COMPARE_MAX = 4;

type CompareContextValue = {
  ids: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isFull: boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);
const listeners = new Set<() => void>();

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeRaw(raw: string) {
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* localStorage недоступен */
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const ids = useMemo(() => parseIds(raw), [raw]);

  const toggle = useCallback((id: string) => {
    const prev = parseIds(readRaw());
    const next = prev.includes(id)
      ? prev.filter((item) => item !== id)
      : prev.length >= COMPARE_MAX
        ? prev
        : [...prev, id];
    writeRaw(JSON.stringify(next));
  }, []);

  const remove = useCallback((id: string) => {
    const next = parseIds(readRaw()).filter((item) => item !== id);
    writeRaw(JSON.stringify(next));
  }, []);

  const clear = useCallback(() => writeRaw("[]"), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      isSelected: (id) => ids.includes(id),
      toggle,
      remove,
      clear,
      isFull: ids.length >= COMPARE_MAX,
    }),
    [ids, toggle, remove, clear],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
