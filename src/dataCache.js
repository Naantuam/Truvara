// Simple in-memory, session-scoped cache. Lives for as long as the tab does --
// navigating between pages reuses it instead of re-fetching, but it's
// explicitly cleared on login and logout so a new session (or a different
// user in the same tab) never sees stale/cross-user data.
const cache = new Map();

export function getCached(key) {
  return cache.has(key) ? cache.get(key) : undefined;
}

export function setCached(key, value) {
  cache.set(key, value);
}

export function clearCache() {
  cache.clear();
}
