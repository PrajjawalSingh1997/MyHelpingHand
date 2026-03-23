/* localStorage helper with SSR safety */
export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("localStorage write failed for key:", key);
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function exportAllData(): string {
  if (typeof window === "undefined") return "{}";
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("gt_"));
  const data: Record<string, unknown> = {};
  keys.forEach((k) => {
    try { data[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch { data[k] = localStorage.getItem(k); }
  });
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>;
  Object.entries(data).forEach(([k, v]) => {
    localStorage.setItem(k, JSON.stringify(v));
  });
}
