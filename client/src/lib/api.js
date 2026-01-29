const DEFAULT_API_BASE = "http://localhost:5000";

export const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE;

export async function fetchServerTime() {
  const res = await fetch(`${API_BASE}/api/time`);
  if (!res.ok) throw new Error(`Failed to fetch server time (${res.status})`);
  return res.json();
}

export async function fetchItems() {
  const res = await fetch(`${API_BASE}/api/items`);
  if (!res.ok) throw new Error(`Failed to fetch items (${res.status})`);
  return res.json();
}
