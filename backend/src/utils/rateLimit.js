// Minimal in-memory rate limiter for the public, unauthenticated endpoints
// (signup, login, resend). Keyed by client IP + route. Single-instance only:
// if the backend is ever scaled to several instances this needs a shared
// store (e.g. Redis) -- note for later, not needed on one Render instance.
export function rateLimit({ windowMs, max, message = "Too many attempts. Please wait a few minutes and try again." }) {
  const hits = new Map();

  // Drop expired entries so the map can't grow without bound.
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ detail: message });
    }
    next();
  };
}
