// "Collect all the hamsters" progress, persisted in localStorage and exposed
// as a tiny external store for useSyncExternalStore (hydration-safe: the
// server snapshot is always empty).

const KEY = "cursed-hamster-found";
const listeners = new Set<() => void>();
let cache: string | null = null;

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function write(value: string) {
  cache = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Private mode / storage blocked: progress just won't survive a reload.
  }
  listeners.forEach((l) => l());
}

export function subscribeFound(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFoundSnapshot(): string {
  if (cache === null) cache = read();
  return cache;
}

export function getFoundServerSnapshot(): string {
  return "";
}

export function parseFound(snapshot: string): string[] {
  return snapshot ? snapshot.split(",").filter(Boolean) : [];
}

// Returns the new total when `key` was newly found, or null if it was
// already in the collection.
export function addFound(key: string): number | null {
  const current = parseFound(getFoundSnapshot());
  if (current.includes(key)) return null;
  const next = [...current, key];
  write(next.join(","));
  return next.length;
}

export function resetFound() {
  write("");
}
